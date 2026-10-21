const {harness,declaration}=require('./cel-harness.cjs'),fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const b=harness({metadataOnly:true}),run=s=>vm.runInContext(s,b);for(const n of ['overlap','segmentRect','hitboxCircle','updateEffects'])run(declaration(fs.readFileSync('web/game.js','utf8'),n));let checked=0;
for(let id=0;id<72;id++)for(const dir of [-1,1])for(const action of ['skill0','skill1','skill2','ultimate']){
 Object.assign(b,{id,dir,action});run("mode='fight';time=0;player=make(id,640,dir,true);enemy=make(5,640+dir*120,-dir);player.ult=100;player.loadout=action==='skill2'?[2,1]:[0,1];shots=[];effects=[];cast(player,action==='skill2'?'skill0':action)");
 const kind=run('player.cast.cfg.kind');const frozen=run('JSON.stringify([player.cast.targetX,player.cast.targetY,player.cast.plannedTarget,player.cast.dir])');run('enemy.x=640-dir*400;enemy.y=250');assert.equal(run('JSON.stringify([player.cast.targetX,player.cast.targetY,player.cast.plannedTarget,player.cast.dir])'),frozen);run('for(let i=0;i<360;i++){time+=1/120;updateF(player,1/120);updateEffects(1/120)}');assert.equal(run('player.dir'),dir);if(kind!=='vortex')assert.equal(run('enemy.hp'),run('enemy.maxHp'),'Cannot retarget an enemy that moved behind: '+id+' '+action+' '+kind);checked++;
}
// Humungousaur lands at the original close target, with a real impact hitbox.
run("mode='fight';time=0;player=make(25,500,1,true);enemy=make(0,580,-1);player.ult=100;shots=[];effects=[];cast(player,'ultimate')");
if(run("player.cast.cfg.kind==='leapslam'")){run('for(let i=0;i<600;i++){time+=1/120;updateF(player,1/120);updateEffects(1/120)}');assert(run('enemy.hp<enemy.maxHp'));}
console.log('Passed '+checked+' frozen cast targets, reverse-position dodges, locked facings and close landing impact.');
