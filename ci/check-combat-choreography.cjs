const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {harness,declaration}=require('./cel-harness.cjs');const b=harness({metadataOnly:true}),run=s=>vm.runInContext(s,b);
const game=fs.readFileSync('web/game.js','utf8');for(const n of ['overlap','segmentRect','hitboxCircle','updateEffects'])run(declaration(game,n));
// Damage cannot happen during deployment, cannot follow a dodging opponent, and shares its budget.
for(const id of [23,69])for(const dir of [-1,1]){
 Object.assign(b,{id,dir});run("player=make(id,640,dir,true);enemy=make(2,640+dir*250,-dir);player.ult=100;mode='fight';effects=[];shots=[];cast(player,'ultimate');v=player.cast;v.damage=50;v.budget.remaining=50;spawnAttack(player,v,0);e=effects[0];initialHP=enemy.hp");
 assert.equal(b.e.sonicDeployment,id===69?'discs':'clones');const x=b.e.x;
 run('updateEffects(e.delay*.5)');assert.equal(b.enemy.hp,b.initialHP,'Damage before units arrive');
 run('enemy.x+=dir*300;updateEffects(e.delay*.6)');assert.equal(b.enemy.hp,b.initialHP,'Deployment homed after target moved');assert.equal(b.e.x,x);
 run('enemy.x=e.x;updateEffects(.01)');assert(b.enemy.hp<b.initialHP);assert.equal(b.v.budget.remaining,0);
 const after=b.enemy.hp;run('updateEffects(.02)');assert.equal(b.enemy.hp,after,'Repeated damage from one deployment');
}
// Every native non-rolling rush/pounce must retract between contacts without mutating simulation.
let reviewed=0;
for(let id=0;id<92;id++)for(const key of ['skill0','skill1','skill2','ultimate'])for(const dir of [-1,1]){
 Object.assign(b,{id,key,dir});run("player=make(id,640,dir,true);cfg=key==='ultimate'?aliens[id].ultimate:aliens[id].skills[Number(key.slice(5))]");
 if(!['rush','pounce'].includes(b.cfg.kind)||[10,71,90].includes(id))continue;
 run("player.cast={cfg,key,dir,ultimate:key==='ultimate',elapsed:0}");
 for(let tick=0;tick<(b.cfg.ticks||1);tick++){
  const indices=[];for(const phase of [.3,.8]){b.age=b.cfg.windup+(tick+phase)*Math.max(.42,b.cfg.duration||.08)/(b.cfg.ticks||1);run('player.cast.elapsed=age');const before=JSON.stringify(b.player);indices.push(run('celPhase(player,key,time).index'));assert.equal(JSON.stringify(b.player),before);}
  assert.notEqual(indices[0],indices[1],`${id}/${key} frozen rush`);
 }reviewed++;
}
// Rath approaches the captured location, holds striking distance and keeps manual facing.
run("player=make(32,300,1,true);enemy=make(2,550,-1);player.ult=100;mode='fight';cast(player,'ultimate');target=player.cast.plannedTarget;for(let i=0;i<100;i++)updateF(player,.01)");
assert(b.player.x<=b.target-50);assert.equal(b.player.dir,1);
const css=fs.readFileSync('web/battle-polish.css','utf8');assert(css.includes('pointer-events:none!important'));assert(css.includes('--battle-notice-top:96px'));
console.log(`Passed sonic deployment delay/dodge/budget for both facings, ${reviewed} native rush/pounce cycles and Rath approach distance.`);
