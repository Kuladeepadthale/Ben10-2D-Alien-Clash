import assert from 'node:assert/strict';
import {createEngine} from '../server/engine.generated.mjs';
import {RankedArena,authenticate} from '../server/worker.mjs';
const rules=globalThis.AlienRankRules;
assert.equal(rules.standing(1700).name,'Magister');
assert.deepEqual(rules.changes(0,0,1),[0,16]);
assert(rules.changes(100,1000,0)[0]>rules.changes(1000,100,0)[0]);
assert.deepEqual(rules.changes(100,100,-1),[0,0]);
assert(rules.changes(100,100,0,true)[1]<rules.changes(100,100,0)[1]);
let checked=0;
for(let id=0;id<32;id++)for(const action of ['normal','skill0','skill1','skill2','ultimate']){
 const engine=createEngine([{alien:id,loadout:action==='skill2'?[2,1]:[0,1]},{alien:action==='ultimate'?31:0,loadout:[0,1]}]);
 engine.input(0,{right:true},[]);engine.input(1,{left:true},[]);
 for(let t=0;t<90;t++)engine.advance(1/30);
 engine.input(0,{},[]);engine.input(1,{},[]);
 const before=engine.snapshot().fighters[1].hp;
 engine.input(0,{},[action==='skill2'?'skill0':action]);for(let t=0;t<150&&!engine.done;t++)engine.advance(1/30);
 if(action==='ultimate')assert.equal(engine.snapshot().fighters[1].hp,before,'Uncharged ultimate must be rejected');else assert(engine.snapshot().fighters[1].hp<before,`No server damage: ${id} ${action}`);
 checked++;
}
// No client HP, cooldown, gauge, rank or outcome is part of the input contract.
const e=createEngine([{alien:0,loadout:[0,1]},{alien:2,loadout:[0,1]}]);
const hp=e.snapshot().fighters[1].hp;e.input(0,{hp:999999,winner:0},['win']);e.advance(1/30);assert.equal(e.snapshot().fighters[1].hp,hp);
const store=new Map();const storage={get:async k=>store.get(k),put:async(k,v)=>store.set(k,structuredClone(v)),transaction:async fn=>fn(storage)};
const arena=new RankedArena({storage},{}),sent=[];
const client=(uid,p)=>({uid,rank:{points:p,wins:0,losses:0},spec:{alien:0,loadout:[0,1]},ws:{send:s=>sent.push([uid,JSON.parse(s)])},lastInput:Date.now(),joined:Date.now()});
const a=client('a',100),b=client('b',100);store.set('rank:a',a.rank);store.set('rank:b',b.rank);arena.clients.add(a);arena.clients.add(b);arena.queue=[a,b];arena.tick();assert.equal(arena.matches.size,1);assert.equal(arena.queue.length,0);assert.equal(a.match,b.match);assert.equal(a.match.bot,false);
const match=a.match;await Promise.all([arena.settle(match,0),arena.settle(match,0)]);assert.equal(store.get('rank:a').points,116);assert.equal(store.get('rank:b').points,84);assert.equal(store.get('rank:a').wins,1);assert.equal(arena.matches.size,0);
arena.clients.clear();const c=client('c',400);store.set('rank:c',c.rank);arena.clients.add(c);c.joined=Date.now()-29900;arena.queue=[c];arena.tick();assert.equal(arena.matches.size,0);c.joined=Date.now()-30001;arena.tick();assert(c.match.bot);await arena.settle(c.match,0);assert.equal(store.get('rank:c').points,400);
const d=client('d',100),f=client('f',100);store.set('rank:d',d.rank);store.set('rank:f',f.rank);arena.clients.add(d);arena.clients.add(f);arena.pair(d,f);const forfeit=d.match;await arena.settle(forfeit,1,true);assert.equal(store.get('rank:d').points,79);assert.equal(store.get('rank:f').points,116);
const env={FIREBASE_PROJECT_ID:'expected',FIREBASE_API_KEY:'public-key'},token=claims=>'a.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.c';
const claims={aud:'expected',iss:'https://securetoken.google.com/expected',exp:Date.now()/1000+3600,sub:'abc'};
const mock=async()=>({ok:true,json:async()=>({users:[{localId:'abc',providerUserInfo:[{providerId:'password'}]}]})});
assert.equal(await authenticate(token(claims),env,mock),'abc');await assert.rejects(authenticate(token({...claims,aud:'wrong'}),env,mock));await assert.rejects(authenticate(token({...claims,exp:1}),env,mock));await assert.rejects(authenticate(token(claims),env,async()=>({ok:false,json:async()=>({})})));
console.log(`Passed: ${checked} server casts, input authority, real-user pairing, 30-second bot boundary, bot rank exclusion, Elo strength factors, rank floor, transactional single settlement, forfeit penalty and Firebase identity guards.`);
