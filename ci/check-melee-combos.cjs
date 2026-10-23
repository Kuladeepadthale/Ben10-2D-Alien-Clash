const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {harness,declaration}=require('./cel-harness.cjs');const b=harness({metadataOnly:true}),run=s=>vm.runInContext(s,b);
let combos=0;
for(let id=0;id<92;id++)for(const key of ['skill0','skill1','skill2','ultimate'])for(const dir of [-1,1]){
 Object.assign(b,{id,key,dir});run("player=make(id,640,dir,true);cfg=key==='ultimate'?aliens[id].ultimate:aliens[id].skills[Number(key.slice(5))]");
 if(b.cfg.kind!=='melee'||(b.cfg.ticks||1)<2)continue;
 run("player.cast={key,dir,ultimate:key==='ultimate',elapsed:0,cfg};before=JSON.stringify(player)");
 if(run("powerProfileFor(player,player.cast)?.motion==='tail-strike'"))continue;
 const ticks=b.cfg.ticks,duration=b.cfg.duration||.08,wind=b.cfg.windup;
 for(let hit=0;hit<ticks;hit++){
  const frames=[];
  for(const phase of [.03,.7,.88]){
   b.elapsed=wind+(hit+phase)*duration/ticks;run('player.cast.elapsed=elapsed');const beat=run('meleeComboBeat(player,player.cast)');assert.equal(beat.tick,hit);assert.equal(beat.count,ticks);assert.equal(b.player.dir,dir);
   const before=JSON.stringify(b.player),frame=run("celPhase(player,key,time).index");assert.equal(JSON.stringify(b.player),before,'Animation changed simulation');frames.push(frame);
  }
  assert(new Set(frames).size>=2,`Missing strike/retraction: ${id}/${key}/${hit}`);
 }
 b.elapsed=wind+duration+.001;run('player.cast.elapsed=elapsed');assert.equal(run('meleeComboBeat(player,player.cast)'),null);combos++;
}
assert(combos>=10);console.log(`Passed: ${combos} multi-hit close-combat animations, every individual strike/retraction, exact configured hit cadence, both facings and unchanged combat state.`);

run(fs.readFileSync('web/villain-data.js','utf8'));run(declaration(fs.readFileSync('web/threat-ladder.js','utf8'),'villainFrame'));
let villainCombos=0;
for(let villain=0;villain<50;villain++)for(const key of ['skill0','skill1','skill2','ultimate']){
 Object.assign(b,{villain,key});run("player=make(0,640,1);player.villain=villain;cfg=key==='ultimate'?VILLAIN_DATA.characters[villain].kit.ultimate:VILLAIN_DATA.characters[villain].kit.skills[Number(key.slice(5))]");
 if(!b.cfg||b.cfg.kind!=='melee'||(b.cfg.ticks||1)<2)continue;
 run("player.cast={key,dir:1,ultimate:key==='ultimate',elapsed:0,cfg}");
 for(let hit=0;hit<b.cfg.ticks;hit++){
  b.elapsed=b.cfg.windup+(hit+.03)*(b.cfg.duration||.08)/b.cfg.ticks;run('player.cast.elapsed=elapsed');const impact=run('villainFrame(player)');
  b.elapsed=b.cfg.windup+(hit+.7)*(b.cfg.duration||.08)/b.cfg.ticks;run('player.cast.elapsed=elapsed');const recoil=run('villainFrame(player)');assert.notEqual(impact,recoil,'Villain held one pose across repeated hits');
 }
 villainCombos++;
}
console.log('Passed villain multi-hit strike/recoil loops:',villainCombos);

// Rath now uses actual forward jabs, crosses and hooks with stable full-body registration.
run("player=make(32,640,1,true);cfg=aliens[32].skills[0];player.cast={key:'skill0',dir:1,elapsed:0,cfg}");
const strikes=[];for(let hit=0;hit<3;hit++){b.elapsed=b.cfg.windup+(hit+.1)*b.cfg.duration/3;run('player.cast.elapsed=elapsed');const picked=run("celPhase(player,'skill0',time)");assert(picked.frame.closeCombat);strikes.push(picked.index);assert.equal(picked.frame.referenceHeight,380);}
assert.equal(new Set(strikes).size,3,'Rath needs three distinct forward strikes');
const renderer=fs.readFileSync('web/cel-player.js','utf8');assert(!renderer.includes('ctx.rotate(-.018*beat.drive)'));
assert(fs.readFileSync('web/index.html','utf8').includes('class="arena-label" hidden aria-hidden="true"'));
console.log('Passed Rath jab/cross/hook registration and hidden battle implementation labels.');
