import React from 'react';
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import TestRenderer, { act } from 'react-test-renderer';
import { createServer } from 'vite';
import { createInviteActivation } from '../src/lib/inviteActivation.js';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
after(()=>server.close());
const {default:SetupPassword}=await server.ssrLoadModule('/src/sections/SetupPassword.jsx');
const {default:Admin}=await server.ssrLoadModule('/src/sections/Admin.jsx');
const user={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:'lachefbino@gmail.com',email_confirmed_at:'2026-01-01',is_anonymous:false};
const text=node=>typeof node==='string'?node:Array.isArray(node)?node.map(text).join(' '):node?text(node.children):'';
function setupFixture({identity=user,error=null}={}) {
  const calls=[];let listener;
  const store=new Map();
  const client={auth:{
    verifyOtp:async()=>{calls.push('verifyOtp');return {data:{session:{user:identity}},error};},
    getUser:async()=>({data:{user:identity},error:null}),
    updateUser:async()=>{calls.push('updateUser');return {data:{user:identity},error:null};},
    onAuthStateChange:cb=>{listener=cb;return {data:{subscription:{unsubscribe:()=>{listener=null;}}}};},
  }};
  const activation=createInviteActivation({clientFactory:async()=>client,href:`http://localhost:5173/auth/setup-password?token_hash=${'b'.repeat(56)}&type=invite`,replaceUrl:path=>calls.push(path),storage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)}});
  return {activation,calls,expire:()=>listener?.('SIGNED_OUT',null)};
}
test('setup UI: verified invite opens form, mismatch blocks update, success clears fields and invokes navigation',async()=>{
  const f=setupFixture();let completed=0;let page;
  await act(async()=>{page=TestRenderer.create(React.createElement(SetupPassword,{activation:f.activation,onComplete:()=>completed++}));});
  assert.match(text(page.toJSON()),/Criar password/);assert.equal(page.root.findAllByType('input').length,2);
  await act(async()=>{page.root.findByProps({name:'password'}).props.onChange({target:{value:'Password longa QA'}});page.root.findByProps({name:'confirmation'}).props.onChange({target:{value:'Diferente'}});});
  const submit=()=>page.root.findByType('form').props.onSubmit({preventDefault(){},currentTarget:{elements:{namedItem:()=>({focus(){}})}}});
  await act(submit);assert.match(text(page.toJSON()),/não coincidem/);assert.ok(!f.calls.includes('updateUser'));
  await act(async()=>page.root.findByProps({name:'confirmation'}).props.onChange({target:{value:'Password longa QA'}}));
  await act(submit);assert.equal(completed,1);assert.equal(f.calls.filter(x=>x==='updateUser').length,1);assert.equal(page.root.findAllByType('input').length,0);assert.match(text(page.toJSON()),/Conta preparada/);
  await act(()=>page.unmount());
});
test('setup UI: expired invitation and unauthorized account never reveal password fields',async()=>{
  for(const options of [{error:{code:'otp_expired'}},{identity:{...user,email:'other@example.com',user_metadata:{role:'admin'}}}]) {
    const f=setupFixture(options);let page;await act(async()=>{page=TestRenderer.create(React.createElement(SetupPassword,{activation:f.activation}));});
    assert.equal(page.root.findAllByType('input').length,0);assert.ok(page.root.findByProps({role:'alert'}));assert.equal(page.root.findByType('a').props.href,'/admin');
    await act(()=>page.unmount());
  }
});
test('setup UI: session expiry removes password fields and prevents further submission',async()=>{
  const f=setupFixture();let page;await act(async()=>{page=TestRenderer.create(React.createElement(SetupPassword,{activation:f.activation}));});
  await act(async()=>page.root.findByProps({name:'password'}).props.onChange({target:{value:'Password longa QA'}}));
  await act(async()=>f.expire());assert.equal(page.root.findAllByType('input').length,0);assert.match(text(page.toJSON()),/expirou/);assert.ok(!f.calls.includes('updateUser'));
  await act(()=>page.unmount());
});
test('admin UI: direct unauthenticated visit stays at login; outsider with forged metadata is denied',async()=>{
  for(const identity of [null,{...user,email:'other@example.com',app_metadata:{role:'admin'},user_metadata:{role:'admin'}}]) {
    const client={auth:{getSession:async()=>({data:{session:identity?{user:identity}:null},error:null}),getUser:async()=>({data:{user:identity},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})}};
    let page;await act(async()=>{page=TestRenderer.create(React.createElement(Admin,{clientFactory:async()=>client,configured:true}));await new Promise(resolve=>setTimeout(resolve,15));});
    assert.match(text(page.toJSON()),identity?/Acesso recusado/:/Inicia sessão/);assert.ok(!text(page.toJSON()).includes('Criar evento'));await act(()=>page.unmount());
  }
});
