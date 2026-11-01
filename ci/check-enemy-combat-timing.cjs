const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={floor:600,time:0,celState:f=>f.state,locomotionVillainFrame126:(f,d,state)=>state==='walk'?2:null,
 meleeComboBeat:f=>({count:7,tick:Math.floor(Math.max(0,f.cast.elapsed-f.cast.cfg.windup)/.1),phase:.1})};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('web/villain-data.js','utf8')+';this.roster=VILLAIN_DATA.characters',ctx);
const source=fs.readFileSync('web/threat-ladder.js','utf8');
vm.runInContext(source.slice(source.indexOf('function villainCombatClock('),source.indexOf('function drawVillain(')),ctx);
let checks=0;
for(const d of ctx.roster){
 for(const dir of [-1,1])for(const [i,cfg] of [...d.kit.skills,d.kit.ultimate].entries()){
  const key=i===3?'ultimate':'skill'+i;
  const actor={villain:d.id,state:key,hp:100,y:600,dir,cast:{key,dir,ultimate:i===3,cfg,elapsed:0}};
  for(const age of [0,.1,(cfg.windup||0)*.6,(cfg.windup||0)+.001,(cfg.windup||0)+(cfg.castDuration??cfg.duration??.08)+.4]){
   actor.cast.elapsed=age;const before=JSON.stringify(actor),frame=ctx.villainFrame(actor);
   assert(frame?.rect?.every(Number.isFinite),d.name+'/'+key);assert.equal(JSON.stringify(actor),before);
   checks++;
  }
  for(const state of ['walk','idle','guard','hit','ko','jump','dash']){
   actor.state=state;const frame=ctx.villainFrame(actor);
   const expected={walk:2,idle:0,guard:12,hit:13,ko:14,jump:5,dash:15}[state];
   assert.equal(frame,d.frames[expected],d.name+'/'+state+' changed');
  }
 }
 if(d.closeFrames){
  const actor={villain:d.id,state:'skill0',y:600,cast:{key:'skill0',cfg:{kind:'melee',windup:.2,duration:.7},elapsed:.2}};
  const contacts=[];for(let tick=0;tick<7;tick++){actor.cast.elapsed=.201+tick*.1;contacts.push(ctx.villainFrame(actor));}
  assert.equal(contacts[0],contacts[3]);assert.notEqual(contacts[2],contacts[3]);
 }
}
const f={cast:{elapsed:.6,cfg:{kind:'trap',windup:.2,duration:2.5,castDuration:.1,recovery:.2}}};
assert(ctx.villainCombatClock(f).recoveryProgress===1,'Trap lifetime froze cast');
console.log('Passed '+checks+' combat samples, 50 enemies, both facings, unchanged walk/jump/hit/KO/guard/dash, combo cycling and persistent-field clock.');
