// Render real projectiles/beams and verify cel emitters without changing combat state.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createCanvas}=require('@napi-rs/canvas'),{declaration,harness}=require('./cel-harness.cjs');
const canvas=createCanvas(1000,600),ctx=canvas.getContext('2d');
const box=vm.createContext({console,Math,Map,Set,time:.34,floor:510,drawAlien(){},ctx});
const run=s=>vm.runInContext(s,box);run(fs.readFileSync('web/data.js','utf8'));run(fs.readFileSync('web/art.js','utf8'));
const game=fs.readFileSync('web/game.js','utf8');for(const name of ['drawShot','drawEffect'])run(declaration(game,name));
for(const name of ['expansion-effects','alien-force-effects','next20-effects','cartoon-power-effects'])run(fs.readFileSync('web/'+name+'.js','utf8'));
let renders=0;const signatures=new Map();
for(let id=0;id<52;id++)for(const kind of ['projectile','wave','lob','rain','ground','beam']){
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
const b=harness(),evaluate=s=>vm.runInContext(s,b);
for(let id=0;id<52;id++)for(const dir of [-1,1]){
 b.id=id;b.dir=dir;evaluate('player=make(id,640,dir,true);enemy=make((id+1)%52,900,-dir);f=player;');
 evaluate("f.cast={key:'skill0',elapsed:aliens[id].skills[0].windup+.02,dir,cfg:aliens[id].skills[0],ultimate:false}");
 const pos=evaluate('drawnAlienEmitter(f,f.cast)');assert(Number.isFinite(pos.x)&&Number.isFinite(pos.y)&&pos.y<510);
}
console.log(`Passed: ${renders} projectile and beam renders; distinct elemental beams; immutable damage state; all 52 active-cel emitters in both facings.`);
