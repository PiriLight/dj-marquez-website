import test from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN_EMAILS } from '../src/config/admin.js';
import { createInviteActivation, parseInviteUrl, passwordErrors, setupErrorMessage, SETUP_MARKER, SETUP_MAX_AGE } from '../src/lib/inviteActivation.js';
const origin='http://127.0.0.1:5173/auth/setup-password';
const token='a'.repeat(56); // Synthetic, used only with an injected client.
const href=`${origin}?token_hash=${token}&type=invite`;
const identity={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:ADMIN_EMAILS[0],email_confirmed_at:'2026-01-01',is_anonymous:false};
const password='Passphrase de QA apenas';
function fixture({user=identity,verifyError=null,updateError=null,stored,at=1000}={}) {
  const calls=[];
  let currentUser=user;
  const values=new Map(stored?[[SETUP_MARKER,JSON.stringify(stored)]]:[]);
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  const client={auth:{
    verifyOtp:async args=>{calls.push(['verifyOtp',args]);return {data:verifyError?null:{session:{user:currentUser}},error:verifyError};},
    getUser:async()=>{calls.push(['getUser']);return {data:{user:currentUser},error:null};},
    updateUser:async args=>{calls.push(['updateUser',args]);return {data:{user:currentUser},error:updateError};},
  }};
  const options={clientFactory:async()=>client,href,replaceUrl:path=>calls.push(['replaceUrl',path]),storage,now:()=>at};
  return {client,calls,values,options,setUser:next=>{currentUser=next;}};
}
test('invitation parser accepts only a single opaque hash and invite type; rejects unsafe or ambiguous parameters',()=>{
  assert.deepEqual(parseInviteUrl(href),{kind:'invite',tokenHash:token});
  assert.equal(parseInviteUrl(origin).kind,'resume');
  for(const suffix of ['?token_hash=bad&type=invite',`?token_hash=${token}&type=recovery`,`?token_hash=${token}&type=invite&type=invite`,`?token_hash=${token}&token_hash=${token}&type=invite`,`?token_hash=${token}&type=invite&next=https://evil.example`, '#access_token=untrusted','?error=otp_expired','?type=invite']) assert.equal(parseInviteUrl(origin+suffix).kind,'invalid');
});
test('valid invite is cleaned before verification, consumed once under StrictMode, and revalidates identity without app_metadata',async()=>{
  const f=fixture();const flow=createInviteActivation(f.options);
  assert.deepEqual(f.calls,[['replaceUrl','/auth/setup-password']]);
  const first=flow.start(); assert.equal(first,flow.start());
  const ready=await first; assert.equal(ready.user.id,identity.id);
  assert.equal(f.calls.filter(x=>x[0]==='verifyOtp').length,1);
  assert.deepEqual(f.calls.find(x=>x[0]==='verifyOtp')[1],{token_hash:token,type:'invite'});
  assert.ok(f.calls.some(x=>x[0]==='getUser'));
  assert.deepEqual(JSON.parse(f.values.get(SETUP_MARKER)),{userId:identity.id,verifiedAt:1000});
  assert.ok(!JSON.stringify([...f.values]).includes(token));
});
test('invalid, expired and reused links fail without silently falling back to an existing session',async()=>{
  const invalid=fixture();await assert.rejects(createInviteActivation({...invalid.options,href:origin+'?type=recovery'}).start(),{code:'invalid'});
  assert.ok(!invalid.calls.some(x=>x[0]==='verifyOtp'));
  for(const code of ['otp_expired','invalid']) {
    const f=fixture({verifyError:{code},stored:{userId:identity.id,verifiedAt:1000}});
    await assert.rejects(createInviteActivation(f.options).start());
    assert.equal(f.values.size,0);assert.match(setupErrorMessage({code}),/já não é válido ou expirou/);
  }
});
test('refresh resumes only recent setup marker matching a newly verified approved identity',async()=>{
  const f=fixture({stored:{userId:identity.id,verifiedAt:500}});
  await createInviteActivation({...f.options,href:origin}).start();
  assert.ok(!f.calls.some(x=>x[0]==='verifyOtp'));
  for(const stored of [undefined,{userId:'different',verifiedAt:500},{userId:identity.id,verifiedAt:1001},{userId:identity.id,verifiedAt:1000-SETUP_MAX_AGE}]) {
    const bad=fixture({stored});await assert.rejects(createInviteActivation({...bad.options,href:origin}).start());
  }
});
test('outsiders, unconfirmed and anonymous users remain blocked despite forged metadata',async()=>{
  for(const user of [{...identity,email:'outsider@example.com',app_metadata:{role:'admin'},user_metadata:{role:'admin'}},{...identity,email_confirmed_at:null},{...identity,is_anonymous:true}]) {
    const f=fixture({user});await assert.rejects(createInviteActivation(f.options).start(),{code:'unauthorized'});assert.equal(f.values.size,0);assert.ok(!f.calls.some(x=>x[0]==='updateUser'));
  }
});
test('password validation prevents short, excessive and mismatched passwords before Auth update',async()=>{
  assert.ok(passwordErrors('short','short').password);
  assert.ok(passwordErrors('a'.repeat(129),'a'.repeat(129)).password);
  assert.ok(passwordErrors(password,'different').confirmation);
  assert.deepEqual(passwordErrors(password,password),{});
  const f=fixture();const flow=createInviteActivation(f.options);await flow.start();
  await assert.rejects(flow.finish(password,'different'),{code:'validation_failed'});
  assert.ok(!f.calls.some(x=>x[0]==='updateUser'));
});
test('password submission uses only official updateUser, rechecks identity before/after, clears marker and blocks double submit',async()=>{
  const f=fixture();const flow=createInviteActivation(f.options);await flow.start();
  const result=flow.finish(password,password);
  await assert.rejects(flow.finish(password,password),{code:'busy'});
  assert.equal((await result).id,identity.id);
  const updates=f.calls.filter(x=>x[0]==='updateUser');assert.equal(updates.length,1);assert.deepEqual(updates[0][1],{password});
  assert.equal(f.calls.filter(x=>x[0]==='getUser').length,3);assert.equal(f.values.size,0);
  await assert.rejects(flow.finish(password,password),{code:'session_missing'});
});
test('session switch or expiry prevents password update; failure messages never echo sensitive error details',async()=>{
  const f=fixture();const flow=createInviteActivation(f.options);await flow.start();f.setUser({...identity,id:'another-account'});
  await assert.rejects(flow.finish(password,password),{code:'unauthorized'});assert.ok(!f.calls.some(x=>x[0]==='updateUser'));
  const expired=fixture();const session=createInviteActivation(expired.options);await session.start();expired.setUser(null);
  await assert.rejects(session.finish(password,password),{code:'session_missing'});
  const text=setupErrorMessage(new Error(`network ${password} ${token}`));assert.ok(!text.includes(password));assert.ok(!text.includes(token));
});
test('network and password policy errors are actionable, preserve only the non-secret activation marker and allow retry',async()=>{
  const f=fixture({updateError:{code:'weak_password',message:'private detail'}});const flow=createInviteActivation(f.options);await flow.start();
  await assert.rejects(flow.finish(password,password));assert.ok(f.values.has(SETUP_MARKER));assert.ok(!JSON.stringify([...f.values]).includes(password));
  assert.match(setupErrorMessage({code:'weak_password'}),/mais forte/);
  f.client.auth.updateUser=async()=>({data:{user:identity},error:null});
  assert.equal((await flow.finish(password,password)).id,identity.id);
  assert.equal(f.values.size,0);
  const offline=fixture({verifyError:new TypeError('fetch failed')});await assert.rejects(createInviteActivation(offline.options).start());assert.match(setupErrorMessage(new TypeError('fetch failed')),/ligação/);
});

test('cancelling while a password request is pending cannot report activation success',async()=>{
  const f=fixture();const flow=createInviteActivation(f.options);await flow.start();
  let resolveUpdate;let signalStarted;
  const started=new Promise(resolve=>{signalStarted=resolve;});
  f.client.auth.updateUser=()=>{signalStarted();return new Promise(resolve=>{resolveUpdate=resolve;});};
  const pending=flow.finish(password,password);
  await started;flow.cancel();resolveUpdate({data:{user:identity},error:null});
  await assert.rejects(pending,{code:'session_expired'});
  assert.equal(f.values.size,0);
});

test('an activation form left open beyond its lifetime cannot update a password',async()=>{
  const f=fixture();let time=1000;
  const flow=createInviteActivation({...f.options,now:()=>time});await flow.start();
  time+=SETUP_MAX_AGE;
  await assert.rejects(flow.finish(password,password),{code:'session_expired'});
  assert.ok(!f.calls.some(x=>x[0]==='updateUser'));assert.equal(f.values.size,0);
});
