const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {harness,declaration}=require('./cel-harness.cjs');
const b=harness({metadataOnly:true}),run=s=>vm.runInContext(s,b);
for(const name of ['updateEffects','overlap','segmentRect','hitboxCircle'])run(declaration(fs.readFileSync('web/game.js','utf8'),name));
let ranged=0,melee=0;
for(let id=0;id<92;id++)for(const dir of [-1,1]){
 Object.assign(b,{id,dir});run("mode='fight';time=0;shots=[];effects=[];player=make(id,640,dir,true);enemy=make(0,640+dir*310,-dir);cfg=baseNormal(player)");
 const isRanged=run("Number.isInteger(aliens[id].basicSkillIndex)");
 assert.equal(b.cfg.damage,52*run('aliens[id].strength'));
 assert(run("cast(player,'normal')"));assert.equal(b.player.cast.dir,dir);assert.equal(b.player.ult,0);assert.deepEqual([...b.player.cd],[0,0]);
 if(isRanged){
  ranged++;assert(['projectile','wave','beam'].includes(b.cfg.kind));assert.equal(run('celState(player)'),b.cfg.poseKey);
  assert(run("!!powerProfileFor(player,'normal')"));
  run('player.cast.elapsed=cfg.windup+.01;spawnAttack(player,player.cast,0)');
  const attack=b.shots[0]||b.effects[0],at=run('drawnAlienEmitter(player,player.cast)');
  assert(Math.abs(attack.x-at.x)<.001&&Math.abs(attack.y-at.y)<.001,'Basic origin differs from character emitter');
  assert(!attack.singleThrow,'Basic attacks must use animated geometry');
  if(attack.vx)assert(attack.vx*dir>0,'Basic shot reversed');
  run('for(let n=0;n<180;n++)updateEffects(1/120)');assert(b.enemy.hp<b.enemy.maxHp,`Ranged basic missed ${id}/${dir}`);
 }else{melee++;assert.equal(b.cfg.kind,'melee');assert.equal(run('celState(player)'),'normal');}
 // Facing away must never lock onto or damage the rival.
 run("shots=[];effects=[];player=make(id,640,dir,true);enemy=make(0,640-dir*310,-dir);cast(player,'normal');for(let n=0;n<180;n++){updateF(player,1/120);updateEffects(1/120)}");
 assert.equal(b.enemy.hp,b.enemy.maxHp,`Basic attack hit behind ${id}/${dir}`);
}
console.log(`Passed all 72 basic attacks in both directions: ${ranged/2} ranged users, ${melee/2} close combat users; correct native pose, emitter, damage and no auto-facing.`);
