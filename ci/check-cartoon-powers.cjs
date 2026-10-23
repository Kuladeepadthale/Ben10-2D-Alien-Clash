// Render real projectiles/beams and verify cel emitters without changing combat state.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createCanvas}=require('@napi-rs/canvas'),{declaration,harness}=require('./cel-harness.cjs');
const canvas=createCanvas(1000,600),ctx=canvas.getContext('2d');
const box=vm.createContext({console,Math,Map,Set,time:.34,floor:510,drawAlien(){},ctx});
const run=s=>vm.runInContext(s,box);run(fs.readFileSync('web/data.js','utf8'));run(fs.readFileSync('web/art.js','utf8'));
const game=fs.readFileSync('web/game.js','utf8');for(const name of ['drawShot','drawEffect'])run(declaration(game,name));
for(const name of ['expansion-effects','alien-force-effects','next20-effects','cartoon-power-effects'])run(fs.readFileSync('web/'+name+'.js','utf8'));
let renders=0;const signatures=new Map();
for(let id=0;id<92;id++)for(const kind of ['projectile','wave','lob','rain','ground','beam']){
 const effect={owner:{id},kind,name:'Power',x:240,y:260,dir:1,vx:600,vy:0,r:22,color:'#bbef78',life:.16,maxLife:.18,length:400,endY:270,damage:125,budget:{remaining:125}};
 const before=JSON.stringify(effect);ctx.clearRect(0,0,1000,600);box.effect=effect;
 run(kind==='beam'?'drawEffect(ctx,effect)':'drawShot(ctx,effect)');
 assert.equal(JSON.stringify(effect),before,'Rendering changed damage or collision state');
 const pixels=ctx.getImageData(0,0,1000,600).data;assert(pixels.some((v,i)=>i%4===3&&v>0),`Empty ${id} ${kind}`);
 if(kind==='beam'&&[0,19,35,14,43,6].includes(id))signatures.set(id,crypto.createHash('sha256').update(pixels).digest('hex'));
 renders++;
}
assert.equal(new Set(signatures.values()).size,signatures.size,'Elemental beams must be visually distinct');
// Beam origins follow the active pose in both directions; launch metadata retains the actual emitter.
const b=harness({metadataOnly:true}),evaluate=s=>vm.runInContext(s,b);
for(let id=0;id<92;id++)for(const dir of [-1,1]){
 b.id=id;b.dir=dir;evaluate('player=make(id,640,dir,true);enemy=make((id+1)%92,900,-dir);f=player;');
 evaluate("f.cast={key:'skill0',elapsed:aliens[id].skills[0].windup+.02,dir,cfg:aliens[id].skills[0],ultimate:false}");
 const pos=evaluate('drawnAlienEmitter(f,f.cast)');assert(Number.isFinite(pos.x)&&Number.isFinite(pos.y)&&pos.y<510);
}
console.log(`Passed: ${renders} projectile and beam renders; distinct elemental beams; immutable damage state; all 72 active-cel emitters in both facings.`);


// Close opponents must not pull a projectile away from the live hand landmark.
for(let id=0;id<92;id++)for(const dir of [-1,1])for(const distance of [70,400]){
 b.id=id;b.dir=dir;b.distance=distance;
 evaluate("player=make(id,640,dir,true);enemy=make((id+1)%92,640+dir*distance,-dir);player.y=450;shots=[];effects=[];f=player");
 for(const kind of ['projectile','wave','lob','beam']){
  b.kind=kind;evaluate("f.cast={id:77,key:'skill0',elapsed:.34,dir,cfg:{...aliens[id].skills[0],kind,windup:.32,speed:600},ultimate:false,damage:100,budget:{remaining:100}};spawnAttack(f,f.cast,0)");
  const actual=evaluate("kind==='beam'?effects.at(-1):shots.at(-1)"),emitter=evaluate('drawnAlienEmitter(f,f.cast)');
  assert.equal(actual.x,emitter.x,`Detached ${id} ${kind} x`);assert.equal(actual.y,emitter.y,`Detached ${id} ${kind} y`);assert.equal(actual.castId,77);
 }
}
// Charge art must follow the live emitter without mutating any combat state.
run('function drawnAlienEmitter(f){return {x:f.x+f.dir*38,y:f.y-90}}');
for(let id=0;id<92;id++)for(const dir of [-1,1]){
 const v={id:9,key:'skill0',dir,elapsed:.25,cfg:{kind:'beam',name:'Power',windup:.5}},f={id,dir,x:300,y:400,cast:v};box.f=f;box.v=v;
 const before=JSON.stringify(f);ctx.clearRect(0,0,1000,600);run('drawPowerCharge(ctx,f,v)');assert.equal(JSON.stringify(f),before);
 if(run("!['physical','blocks'].includes(powerTheme(f.id,v.cfg.name))")){
  const pixels=ctx.getImageData(0,0,1000,600).data;assert(pixels.some((v,i)=>i%4===3&&v>0),`Empty charge ${id}`);
  const emitterX=f.x+dir*38;for(let y=0;y<600;y++)for(let x=0;x<1000;x++)if(pixels[(y*1000+x)*4+3])assert(Math.abs(x-emitterX)<45&&Math.abs(y-310)<45,'Charge detached from hand');
 }
}
console.log('Passed: exact cel launch origins at near/far ranges, both facings and airborne; hand charge renders and immutable combat state.');

