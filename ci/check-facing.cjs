// Facing and aiming belong to input, never to the opponent's position.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness,declaration}=require('./cel-harness.cjs');
const b=harness({metadataOnly:true}),run=s=>vm.runInContext(s,b),source=fs.readFileSync('web/game.js','utf8');
for(const n of ['overlap','segmentRect','hitboxCircle','updateEffects'])run(declaration(source,n));
run('drawnAlienEmitter=(f,c)=>({x:f.x+c.dir*38,y:f.y-90})');
let cases=0;
for(let id=0;id<92;id++)for(const dir of [-1,1]){
 Object.assign(b,{id,dir});
 run('mode="fight";player=make(id,640,dir,true);enemy=make(0,640+dir*30,-dir);move(player,dir,.6);updateF(player,1/120)');
 assert.equal(b.player.dir,dir,'Crossing must retain input facing');assert((b.player.x-b.enemy.x)*dir>0);
 run('for(let n=0;n<240;n++)updateF(player,1/120)');assert.equal(b.player.dir,dir,'Idle must not turn toward enemy');
 run('dash(player);for(let n=0;n<30;n++)updateF(player,1/120)');assert.equal(b.player.dir,dir);assert.equal(b.player.dash,null);
 run('move(player,-dir,1/120)');assert.equal(b.player.dir,-dir,'Reverse input turns the character');
 run('player=make(id,640,dir,true);enemy=make(0,640-dir*400,-dir);cast(player,"normal")');assert.equal(b.player.cast.dir,dir,'Attack locks chosen facing');run('for(let n=0;n<120;n++){updateF(player,1/120);updateEffects(1/120)}');assert.equal(b.enemy.hp,b.enemy.maxHp,'A strike must miss an enemy behind the character');
 for(const kind of ['projectile','wave','lob','beam','rain','ground','spikes','eruption','trap']){
  b.kind=kind;const shapes=[];
  for(const side of [-1,1]){
   b.side=side;run('player=make(id,640,dir,true);enemy=make(0,640+side*400,-side);enemy.y=side<0?230:510;shots=[];effects=[];v={id:9,key:"skill0",dir,ultimate:false,elapsed:.3,cfg:{kind,name:"Facing check",speed:600,range:500,ticks:1,duration:.2},damage:10,budget:{remaining:10}};player.cast=v;spawnAttack(player,v,0)');
   const objects=run('[...shots,...effects]');assert(objects.length>0);
   for(const e of objects){assert((e.x-b.player.x)*dir>=-1e-7,kind+' placed behind facing');if(e.vx)assert(e.vx*dir>0);if(kind==='beam')assert.equal(e.endY,e.y);if(['projectile','wave'].includes(kind))assert.equal(e.vy,0);}
   shapes.push(JSON.stringify(objects.map(e=>({kind:e.kind,x:e.x,y:e.y,vx:e.vx,vy:e.vy,dir:e.dir,endY:e.endY,length:e.length}))));
  }
  assert.equal(shapes[0],shapes[1],kind+' geometry must not follow opponent');cases++;
 }
 run('player=make(id,640,dir,true);enemy=make(0,640-dir*400,-dir);player.cast={id:9,key:"skill0",dir,ultimate:false,elapsed:0,cfg:{kind:"rush",name:"Rush",range:1000,speed:200,ticks:4,duration:1,windup:0,recovery:.1},damage:10,budget:{remaining:40},startX:640,rushHits:new Set()}');
 for(let n=0;n<100;n++){run('updateF(player,1/120)');assert.equal(b.player.dir,dir);if(b.player.cast)assert.equal(b.player.cast.dir,dir);}
 run('player=make(id,640,dir,true);enemy=make(0,640-dir*400,-dir);player.ult=100;player.loadout=[0,1];aliens[id].ultimate.kind');
 // Real leap moves choose an ahead-of-facing destination once at cast start.
 const original=run('aliens[id].ultimate');b.original=original;run('aliens[id].ultimate={kind:"leapslam",name:"Leap",range:500,damage:10,ticks:1,windup:.1,duration:.5,recovery:.1};cast(player,"ultimate")');assert((b.player.cast.plannedTarget-b.player.x)*dir>0);run('aliens[id].ultimate=original');
}
for(const [x,input,dir]of [[65,-1,-1],[1215,1,1]]){Object.assign(b,{x,input});run('player=make(0,x,-input);move(player,input,1/120)');assert.equal(b.player.dir,dir,'Input turns even at arena wall');}
console.log('Passed: 72 characters, both facings, crossing/idle/reverse/dash, '+cases+' opponent-independent power trajectories, fixed rush direction, forward leaps and wall turns.');
