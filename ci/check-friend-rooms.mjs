import assert from 'node:assert/strict';
import {RankedArena} from '../server/worker.mjs';
const data=new Map(),storage={get:async k=>data.get(k),put:async(k,v)=>data.set(k,structuredClone(v)),transaction:async fn=>fn(storage)};
const env={FIREBASE_PROJECT_ID:'test-project',FIREBASE_API_KEY:'public-test-key'},arena=new RankedArena({storage},env),messages=new Map();
const realFetch=globalThis.fetch,realNow=Date.now;let now=realNow();Date.now=()=>now;
const token=uid=>'x.'+Buffer.from(JSON.stringify({aud:env.FIREBASE_PROJECT_ID,iss:'https://securetoken.google.com/'+env.FIREBASE_PROJECT_ID,exp:now/1000+3600,sub:uid})).toString('base64url')+'.x';
globalThis.fetch=async(url,options)=>url.includes('accounts:lookup')?{ok:true,json:async()=>({users:[{localId:JSON.parse(Buffer.from(JSON.parse(options.body).idToken.split('.')[1],'base64url')).sub,providerUserInfo:[{providerId:'password'}]}]})}:{ok:true,json:async()=>({fields:{payload:{stringValue:JSON.stringify({collection:{owned:[0,1,2,3]}})}}})};
const client=uid=>{const out=[];messages.set(uid,out);const c={uid,name:uid,rank:{points:100,wins:0,losses:0},window:now,messages:0,lastInput:now,seq:-1,ws:{send:raw=>out.push(JSON.parse(raw)),close(){}}};arena.clients.add(c);data.set('rank:'+uid,c.rank);return c;};
const join=(c,extra)=>arena.message(c,JSON.stringify({type:'join',alien:0,token:token(c.uid),...extra}));
try{
 const a=client('host'),b=client('friend'),c=client('teammate'),d=client('opponent'),outsider=client('outsider');
 await join(a,{roomAction:'create',roomMode:'relay',rounds:3});const room=a.room;assert(/^[A-Z2-9]{6}$/.test(room.code));assert.equal(room.players.length,1);
 for(const p of [b,c,d])await join(p,{roomAction:'join',code:room.code});assert.equal(room.players.length,4);assert.deepEqual(room.players.map((_,i)=>i%2),[0,1,0,1]);await join(outsider,{roomAction:'join',code:room.code});assert(!outsider.room);assert(messages.get(outsider.uid).some(d=>d.type==='error'));
 await arena.message(b,JSON.stringify({type:'roomSettings',rounds:5}));assert.equal(room.rounds,3);await arena.message(a,JSON.stringify({type:'roomSettings',rounds:5}));assert.equal(room.rounds,5);
 await arena.message(a,JSON.stringify({type:'roomStart'}));assert(!a.match);now+=10000;await arena.message(a,JSON.stringify({type:'roomStart'}));assert(a.match);assert.equal(a.match.players.length,4);assert.equal(a.match.friendly,true);assert.equal(a.match.engine.snapshot(now).squad.rounds,5);assert.equal(arena.rooms.size,0);
 const m=a.match;await Promise.all([arena.settle(m,1),arena.settle(m,1)]);for(const p of [a,b,c,d]){assert.equal(data.get('rank:'+p.uid).points,100);assert.equal(p.match,null);const result=messages.get(p.uid).find(d=>d.type==='result');assert.equal(result.delta.length,4);assert.equal(result.team,[a,b,c,d].indexOf(p)%2);assert.equal(result.friendly,true);}
 await join(a,{roomAction:'create',roomMode:'duel',rounds:1});await join(b,{roomAction:'join',code:a.room.code});const second=a.room;arena.leaveRoom(a);assert.equal(second.host,b);assert.equal(b.room,second);arena.leaveRoom(b);assert.equal(arena.rooms.size,0);
 console.log('Passed: authenticated code rooms, 4-player capacity, team seats, host-only rounds/start, ten-second draft gate, no friendly RP changes, once-only settlement and host transfer.');
}finally{globalThis.fetch=realFetch;Date.now=realNow;}
