// Explicit DEV-only in-memory simulation. No Supabase URL, token or remote call.
import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Admin from '../../src/sections/Admin.jsx';
import Events from '../../src/sections/Events.jsx';
import { ADMIN_EMAILS, isApprovedAdmin } from '../../src/config/admin.js';
import { lisbonDate } from '../../src/utils/events.js';
import '../../src/styles/global.css';
if (!import.meta.env.DEV) throw new Error('QA fixture is development-only');
const base = { location:'Lisboa',info_url:null,is_visible:true,sort_order:0 };
let rows = [
  {...base,id:'11111111-1111-4111-8111-111111111111',date:'2099-10-01',name:'Futuro — simulação',info_url:'https://example.com/event'},
  {...base,id:'22222222-2222-4222-8222-222222222222',date:lisbonDate(),name:'Hoje — simulação'},
  {...base,id:'33333333-3333-4333-8333-333333333333',date:'2020-01-01',name:'Passado — simulação'},
  {...base,id:'44444444-4444-4444-8444-444444444444',date:'2099-01-01',name:'Oculto — simulação',is_visible:false},
];
let user = JSON.parse(sessionStorage.getItem('dj-admin-qa-user') || 'null');
let fail = false;
const listeners=new Set();
const session=()=>user?{user}:null;
function setUser(next) { user=next; sessionStorage.setItem('dj-admin-qa-user',JSON.stringify(user)); for(const cb of listeners) cb(user?'SIGNED_IN':'SIGNED_OUT',session()); }
const identity=email=>({id:'local-fixture-user',email,email_confirmed_at:'2026-01-01',app_metadata:{role:'admin'}});
const client={
  auth:{
    getSession:async()=>({data:{session:session()},error:null}),
    getUser:async()=>({data:{user},error:null}),
    onAuthStateChange:cb=>{listeners.add(cb);return {data:{subscription:{unsubscribe:()=>listeners.delete(cb)}}};},
    signInWithPassword:async({email,password})=> { if(password!=='qa-local') return {error:new Error('Invalid fixture password')}; setUser(identity(email)); return {data:{user},error:null}; },
    signOut:async()=>{setUser(null);return {error:null};},
  },
  from:()=>{
    let operation='read',payload,filters=[],signal;
    const run=async()=>{
      if(signal?.aborted) return {data:null,error:new Error('AbortError')};
      if(fail) return {data:null,error:new Error('Network fixture failure')};
      if(operation!=='read'&&!isApprovedAdmin(user)) return {data:null,error:{code:'42501'}};
      const matches=x=>filters.every(([key,value])=>x[key]===value);
      let result=rows.filter(matches);
      if(operation==='insert') { if(rows.some(x=>x.id===payload.id)) return {data:null,error:{code:'23505'}}; rows=[...rows,payload];result=[payload]; }
      if(operation==='update') {rows=rows.map(x=>matches(x)?{...x,...payload}:x);result=rows.filter(matches);}
      if(operation==='delete') rows=rows.filter(x=>!matches(x));
      return {data:result,error:null};
    };
    const q={select:()=>q,order:()=>q,eq:(key,value)=>{filters.push([key,value]);return q;},abortSignal:s=>{signal=s;return q;},insert:p=>{operation='insert';payload=p;return q;},update:p=>{operation='update';payload=p;return q;},delete:()=>{operation='delete';return q;},single:async()=>{const response=await run();return {...response,data:response.data?.[0]||null};},then:(resolve,reject)=>run().then(resolve,reject)};
    return q;
  }
};
const factory=async()=>client;
const feedOptions={clientFactory:factory,configured:true};
function Fixture(){
  const [version,setVersion]=useState(0);
  const [failed,setFailed]=useState(false);
  return <><aside style={{padding:16,borderBottom:'1px solid #cf8a3f'}}><p>Simulação local — sem Supabase real. Login de teste: email aprovado + qa-local.</p><div style={{display:'flex',flexWrap:'wrap',gap:12}}>
    <button onClick={()=>setUser(identity(ADMIN_EMAILS[0]))}>Simular admin</button>
    <button onClick={()=>setUser(identity('other@example.com'))}>Simular não autorizado</button>
    <button onClick={()=>setUser(null)}>Simular sessão expirada</button>
    <button onClick={()=>{fail=!fail;setFailed(fail);setVersion(x=>x+1);}}>Rede: {failed?'falha':'normal'}</button>
    <button onClick={()=>setVersion(x=>x+1)}>Atualizar agenda de teste</button>
    <button onClick={()=>{rows=[];setVersion(x=>x+1);}}>Esvaziar dados de teste</button>
  </div></aside><Admin clientFactory={factory} configured /><Events key={version} feedOptions={feedOptions}/></>;
}
createRoot(document.getElementById('root')).render(<StrictMode><Fixture/></StrictMode>);
