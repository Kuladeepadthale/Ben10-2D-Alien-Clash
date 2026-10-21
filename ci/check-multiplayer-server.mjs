import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const kits=vm.runInNewContext(fs.readFileSync('web/data.js','utf8')+';aliens');
import {createEngine} from '../server/engine.generated.mjs';
import {RankedArena,authenticate} from '../server/worker.mjs';
const rules=globalThis.AlienRankRules;
assert.equal(rules.standing(1700).name,'Magister');
assert.deepEqual(rules.changes(0,0,1),[0,16]);
assert(rules.changes(100,1000,0)[0]>rules.changes(1000,100,0)[0]);
assert.deepEqual(rules.changes(100,100,-1),[0,0]);
assert(rules.changes(100,100,0,true)[1]<rules.changes(100,100,0)[1]);
let checked=0;
for(let id=0;id<72;id++)for(const action of ['normal','skill0','skill1','skill2','ultimate']){
 const cfg=action==='normal'?{kind:'melee'}:action==='ultimate'?kits[id].ultimate:kits[id].skills[Number(action.slice(5))];
 // A straight head-height ray can pass above a shorter fighter. Use a tall grounded
 // target for ranged cast coverage instead of forcing an anatomical ray downwards.
 const target=action==='ultimate'?31:['beam','projectile','wave'].includes(cfg.kind)?18:0;
 const engine=createEngine([{alien:id,loadout:action==='skill2'?[2,1]:[0,1]},{alien:target,loadout:[0,1]}]);
 engine.input(0,{right:true},[]);engine.input(1,{left:true},[]);
 const gap=cfg.kind==='rain'?Math.min(cfg.range*.65,380):['eruption','trap'].includes(cfg.kind)?Math.min(cfg.range*.65,360):cfg.kind==='lob'?Math.min(cfg.range,360):cfg.kind==='leapslam'?Math.min(cfg.range,420)+60:100;
 for(let t=0;t<500&&engine.snapshot().fighters[1].x-engine.snapshot().fighters[0].x>gap;t++)engine.advance(1/120);
 engine.input(0,{},[]);engine.input(1,{},[]);
 const before=engine.snapshot().fighters[1].hp;
 engine.input(0,{},[action==='skill2'?'skill0':action]);for(let t=0;t<150&&!engine.done;t++)engine.advance(1/30);
 if(action==='ultimate')assert.equal(engine.snapshot().fighters[1].hp,before,'Uncharged ultimate must be rejected');else assert(engine.snapshot().fighters[1].hp<before,`No server damage: ${id} ${action}`);
 checked++;
}
// Both human seats retain facing after crossing; reverse+attack/dash in one packet uses new input.
for(const seat of [0,1]){
 const dir=seat===0?1:-1,engine=createEngine([{alien:0,loadout:[0,1]},{alien:2,loadout:[0,1]}]);
 engine.input(seat,{right:dir>0,left:dir<0},[]);
 for(let i=0;i<500&&Math.abs(engine.snapshot().fighters[0].x-engine.snapshot().fighters[1].x)>100;i++)engine.advance(1/120);
 engine.input(seat,{},['dash']);for(let i=0;i<50;i++)engine.advance(1/120);
 let state=engine.snapshot();assert((state.fighters[seat].x-state.fighters[1-seat].x)*dir>0);assert.equal(state.fighters[seat].dir,dir);
 engine.input(seat,{right:dir<0,left:dir>0},['normal']);engine.advance(1/120);assert.equal(engine.snapshot().fighters[seat].cast.dir,-dir);
 engine.input(seat,{},[]);engine.advance(1.5);
 engine.input(seat,{right:dir>0,left:dir<0},['dash']);engine.advance(1/120);assert.equal(engine.snapshot().fighters[seat].dash.dir,dir);
}
// No client HP, cooldown, gauge, rank or outcome is part of the input contract.
const e=createEngine([{alien:0,loadout:[0,1]},{alien:2,loadout:[0,1]}]);
const hp=e.snapshot().fighters[1].hp;e.input(0,{hp:999999,winner:0},['win']);e.advance(1/30);assert.equal(e.snapshot().fighters[1].hp,hp);
const store=new Map();const storage={get:async k=>store.get(k),put:async(k,v)=>store.set(k,structuredClone(v)),transaction:async fn=>fn(storage)};
const arena=new RankedArena({storage},{}),sent=[];
const client=(uid,p)=>({uid,name:'Hero '+uid.toUpperCase(),rank:{points:p,wins:0,losses:0},spec:{alien:0,loadout:[0,1]},ws:{send:s=>sent.push([uid,JSON.parse(s)])},lastInput:Date.now(),joined:Date.now()});
const a=client('a',100),b=client('b',100);store.set('rank:a',a.rank);store.set('rank:b',b.rank);arena.clients.add(a);arena.clients.add(b);arena.queue=[a,b];arena.tick();assert.equal(arena.matches.size,1);assert.equal(arena.queue.length,0);assert.equal(a.match,b.match);assert.equal(a.match.bot,false);assert.deepEqual(sent.find(([uid,d])=>uid==='a'&&d.type==='matched')[1].names,['Hero A','Hero B']);
const match=a.match;assert.equal(sent.find(([uid,d])=>uid==='a'&&d.type==='matched')[1].countdownMs,3000);const initial=match.engine.snapshot();await arena.message(a,JSON.stringify({type:'input',seq:1,held:{right:true},edges:['normal']}));arena.tick();assert.deepEqual(match.engine.snapshot(),initial,'Combat must remain frozen during countdown');match.readyAt=Date.now()-1;arena.tick();assert(match.engine.snapshot().clock<initial.clock,'Combat starts after countdown');await Promise.all([arena.settle(match,0),arena.settle(match,0)]);assert.equal(store.get('rank:a').points,116);assert.equal(store.get('rank:b').points,84);assert.equal(store.get('rank:a').wins,1);assert.equal(arena.matches.size,0);
arena.clients.clear();const c=client('c',400);store.set('rank:c',c.rank);arena.clients.add(c);c.joined=Date.now()-29900;arena.queue=[c];arena.tick();assert.equal(arena.matches.size,0);c.joined=Date.now()-30001;arena.tick();assert(c.match.bot);await arena.settle(c.match,0);assert.equal(store.get('rank:c').points,400);
const d=client('d',100),f=client('f',100);store.set('rank:d',d.rank);store.set('rank:f',f.rank);arena.clients.add(d);arena.clients.add(f);arena.pair(d,f);const forfeit=d.match;await arena.settle(forfeit,1,true);assert.equal(store.get('rank:d').points,79);assert.equal(store.get('rank:f').points,116);
const env={FIREBASE_PROJECT_ID:'expected',FIREBASE_API_KEY:'public-key'},token=claims=>'a.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.c';
const claims={aud:'expected',iss:'https://securetoken.google.com/expected',exp:Date.now()/1000+3600,sub:'abc'};
const mock=async()=>({ok:true,json:async()=>({users:[{localId:'abc',displayName:'Galactic Hero',providerUserInfo:[{providerId:'password'}]}]})});
assert.equal(await authenticate(token(claims),env,mock),'abc');assert.deepEqual(await authenticate(token(claims),env,mock,true),{uid:'abc',name:'Galactic Hero'});await assert.rejects(authenticate(token({...claims,aud:'wrong'}),env,mock));await assert.rejects(authenticate(token({...claims,exp:1}),env,mock));await assert.rejects(authenticate(token(claims),env,async()=>({ok:false,json:async()=>({})})));
console.log(`Passed: ${checked} server casts, input authority, real-user pairing, 30-second bot boundary, bot rank exclusion, Elo strength factors, rank floor, transactional single settlement, forfeit penalty and Firebase identity guards.`);



