import test from 'node:test';
import assert from 'node:assert/strict';
import { eventDate, displayEventDate, lisbonDate, upcomingEvents, safeEventUrl, validateEvent, eventPayload } from '../src/utils/events.js';
import { isApprovedAdmin, ADMIN_EMAILS } from '../src/config/admin.js';
import { checkSupabaseConfig } from '../src/utils/supabaseConfig.js';
import { readEvents, saveEvent, deleteEvent } from '../src/lib/eventRepository.js';
const row = { id: '11111111-1111-4111-8111-111111111111', date: '2026-09-21', name: 'Noite', location: 'Portugal', info_url: '', is_visible: true, sort_order: 0 };
const admin = { id: 'fixture-admin', email: ADMIN_EMAILS[0], email_confirmed_at: '2026-01-01' };
test('dates: legacy PT, ISO, leap days and Lisbon summer/winter midnight', () => {
  assert.equal(eventDate('26 AGO 2026'), '2026-08-26');
  assert.equal(displayEventDate('2026-09-21'), '21 SET 2026');
  assert.equal(eventDate('2024-02-29'), '2024-02-29');
  for (const date of ['2026-02-29','2026-04-31','2026-13-01','invalid','2026-09-21T00:00:00Z']) assert.equal(eventDate(date), null);
  assert.equal(lisbonDate(new Date('2026-09-20T23:30:00Z')), '2026-09-21');
  assert.equal(lisbonDate(new Date('2026-12-20T23:30:00Z')), '2026-12-20');
});
test('public agenda: today included, past/hidden/invalid excluded, chronological order and unsafe links removed', () => {
  const rows = [ {...row, id:'future', date:'01 OUT 2026', sort_order:0}, {...row, id:'today', sort_order:99, info_url:'javascript:alert(1)'}, {...row, id:'past', date:'2026-09-20'}, {...row, id:'hidden', is_visible:false}, {...row, id:'bad', date:'bad'} ];
  const visible = upcomingEvents(rows, '2026-09-21');
  assert.deepEqual(visible.map(x => x.id), ['today','future']);
  assert.equal(visible[0].info_url, null);
  assert.equal(rows[0].date, '01 OUT 2026');
  assert.deepEqual(upcomingEvents([], '2026-09-21'), []);
});
test('validation: data, URL, IDs, duplicates, same ID edits and payload whitelist', () => {
  assert.deepEqual(validateEvent(row), {});
  for (const value of ['javascript:alert(1)', 'data:text/html,evil','//example.com','https://user:password@example.com','https://exam ple.com']) assert.equal(safeEventUrl(value), null);
  assert.equal(safeEventUrl(' https://example.com/event '), 'https://example.com/event');
  for (const [key,value] of [['id','bad'],['date','2026-02-30'],['name',' '],['location',''],['is_visible','true'],['sort_order',-1],['info_url','javascript:alert(1)']]) assert.ok(validateEvent({...row,[key]:value})[key]);
  assert.ok(validateEvent({...row,id:'22222222-2222-4222-8222-222222222222',name:' NOITE '}, [row]).duplicate);
  assert.deepEqual(validateEvent(row, [row]), {});
  const payload = eventPayload({...row, date:'21 SET 2026', name:' Noite ', malicious:'ignored'});
  assert.equal(payload.name, 'Noite'); assert.equal(payload.date, '2026-09-21'); assert.equal(payload.info_url, null); assert.equal(payload.malicious, undefined);
});
test('authorization: exactly approved, confirmed identities; neither metadata field grants admin', () => {
  for (const email of ADMIN_EMAILS) assert.equal(isApprovedAdmin({...admin,email}), true);
  assert.equal(isApprovedAdmin({...admin,app_metadata:{role:'user'}}), true);
  for (const user of [null, {...admin,id:null}, {...admin,email:' lachefbino@gmail.com '}, {...admin,email:'other@example.com'}, {...admin,email_confirmed_at:null}, {...admin,is_anonymous:true}, {...admin,email:'other@example.com',app_metadata:{role:'admin'},user_metadata:{role:'admin'}}]) assert.equal(isApprovedAdmin(user), false);
});
test('configuration rejects private keys and unsafe endpoints; supports public/anon keys', () => {
  const jwt = role => `header.${Buffer.from(JSON.stringify({role})).toString('base64url')}.signature`;
  assert.equal(checkSupabaseConfig('https://example.supabase.co', 'sb_publishable_fixture').configured, true);
  assert.equal(checkSupabaseConfig('https://example.supabase.co', jwt('anon')).configured, true);
  for (const key of ['sb_secret_fixture',jwt('service_role'),'unknown']) assert.equal(checkSupabaseConfig('https://example.supabase.co',key).configured, false);
  assert.equal(checkSupabaseConfig('http://remote.example',jwt('anon')).configured, false);
  assert.equal(checkSupabaseConfig('', '').configured, false);
});
function fakeClient({user=admin,data=row,error=null}={}) {
  const calls=[];
  const query={};
  for (const method of ['select','order','eq','abortSignal','insert','update','delete']) query[method]=(...args)=>{calls.push([method,...args]);return query;};
  query.single=async()=>({data,error});
  query.then=(resolve,reject)=>Promise.resolve({data,error}).then(resolve,reject);
  return { calls, auth:{getUser:async()=>({data:{user},error:null})},from:table=>{calls.push(['from',table]);return query;} };
}
test('repository: read published only; create and ID-scoped update/delete confirm returned rows', async () => {
  const reader=fakeClient({data:[row]}); await readEvents(reader,{publicOnly:true}); assert.ok(reader.calls.some(x=>x[0]==='eq'&&x[1]==='is_visible'&&x[2]===true));
  const creator=fakeClient(); assert.equal((await saveEvent(creator,row,{isNew:true})).id,row.id); assert.ok(creator.calls.some(x=>x[0]==='insert'));
  const editor=fakeClient(); await saveEvent(editor,row,{isNew:false}); assert.ok(editor.calls.some(x=>x[0]==='update')); assert.ok(editor.calls.some(x=>x[0]==='eq'&&x[1]==='id'&&x[2]===row.id)); assert.ok(!editor.calls.some(x=>x[0]==='insert'));
  const remover=fakeClient({data:{id:row.id}}); await deleteEvent(remover,row.id); assert.ok(remover.calls.some(x=>x[0]==='delete'));
});
test('repository: denied users never write, failed/unconfirmed writes reject and preserve caller data', async () => {
  const denied=fakeClient({user:{...admin,email:'other@example.com'}}); await assert.rejects(saveEvent(denied,row,{isNew:true})); assert.equal(denied.calls.length,0);
  await assert.rejects(saveEvent(fakeClient({data:null,error:{code:'42501'}}),row,{isNew:false}));
  await assert.rejects(saveEvent(fakeClient({data:null}),row,{isNew:true}), /não confirmou/);
  await assert.rejects(deleteEvent(fakeClient({data:null}),row.id), /não foi confirmada/);
  assert.equal(row.name,'Noite');
});
