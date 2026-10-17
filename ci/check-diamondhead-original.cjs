const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let previousDraws=0,previousEmitters=0,originalDraws=0;const original={width:300,height:480},drawCalls=[];
const ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:(...a)=>{if(k==='drawImage'){drawCalls.push(a);if(a[0]===original)originalDraws++;assert(a.slice(1).every(Number.isFinite))}},set:(o,k,v)=>(o[k]=v,true)});
ctx.getImageData=(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h});ctx.createImageData=(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h});
const createCanvas=()=>({width:384,height:384,getContext:t=>t==='webgl'?null:ctx});
const box=vm.createContext({Math,WeakMap,Map,Set,Float32Array,Error,Promise,floor:500,time:0,drawAlien(){previousDraws++},drawnAlienEmitter(){previousEmitters++;return {x:0,y:0}},preloadClassic(){},classicReady:Promise.resolve(true),classicPortraits:Array(10).fill(original),aliens:Array.from({length:10},(_,id)=>({scale:id===2?1.12:1})),document:{createElement:createCanvas}});
for(const file of ['web/motion.js','web/skeleton.js','web/diamondhead-gait-data.js'])vm.runInContext(fs.readFileSync(file,'utf8'),box);
// Install delegation spies after the legacy renderer has been loaded.
box.previousDrawsMarker=()=>previousDraws++;vm.runInContext('drawAlien=()=>previousDrawsMarker()',box);
vm.runInContext(fs.readFileSync('web/diamondhead-puppet.js','utf8'),box);box.ctx=ctx;
(async()=>{assert(await vm.runInContext('diamondheadPuppetReady',box));box.f={id:2,x:400,y:500,dir:1,hp:100,moving:false,walk:0,stun:0,vy:0};
 vm.runInContext('drawAlien(ctx,f,0)',box);const call=drawCalls.at(-1);assert.equal(call[0],original);assert.equal(call.length,5);assert(Math.abs(call[3]-158.2)<1e-8);assert(Math.abs(call[4]-253.12)<1e-8);
 // Rigid layer transforms must preserve lengths and orientation throughout both walks.
 for(const sign of [-1,1]){box.f={id:2,x:400,y:500,dir:1,hp:100,moving:true,walk:0,stun:0,vy:0};let previous={},samples=0;
  for(let n=0;n<720;n++){box.f.walk=n*.1*sign;box.f.x=400+n*2*sign;box.time=n/120;
   const result=vm.runInContext(`(()=>{const r=diamondheadRig(),s=diamondheadRigAngles(f,time,r),world=diamondheadWorldBones(r,s.angles),scale=226*aliens[2].scale/r.h;return {world,ground:diamondheadLayerGround(r,world),contacts:['left','right'].map((side,i)=>{const bone=r.bones.find(b=>b.name==='leg_'+side+'2'),m=world[bone.index],support=diamondheadSupport(r,bone.name,Math.atan2(m[1],m[0])),phase=s.motion.phase+(i?.8:.3),q=((phase%1)+1)%1;return {side,cycle:Math.floor(phase),stance:q<.6,x:f.x+(m[4]+support.x-192)*scale}})}})()`,box);
   assert(Number.isFinite(result.ground));for(const m of result.world){assert(m.every(Number.isFinite));assert(Math.abs(m[0]*m[3]-m[1]*m[2]-1)<1e-10);assert(Math.abs(Math.hypot(m[0],m[1])-1)<1e-10);}
   for(const contact of result.contacts){const last=previous[contact.side];if(n>240&&contact.stance&&last?.stance&&contact.cycle===last.cycle){assert(Math.abs(contact.x-last.x)<1e-6,'Planted foot must not slide');samples++;}previous[contact.side]=contact;}
  }assert(samples>500);
 }
 for(const sign of [-1,1]){box.f={id:2,x:400,y:500,dir:sign,hp:100,moving:true,walk:0,stun:0,vy:0};for(let n=0;n<240;n++){box.f.walk+=sign*.1;box.time=n/120;vm.runInContext('drawAlien(ctx,f,time)',box)}assert(originalDraws>0);}
 const base={id:2,x:400,y:500,dir:1,hp:100,moving:false,walk:0,stun:0,vy:0};
 for(const patch of [{block:true},{stun:.2},{hp:0},{y:450,vy:-200},{jumpWindup:.05},{cast:{key:'normal',elapsed:.4,cfg:{kind:'melee',windup:.32,recovery:.4}}},{cast:{key:'skill0',elapsed:.4,cfg:{kind:'projectile',windup:.32,recovery:.4}}},{cast:{key:'ultimate',ultimate:true,elapsed:.8,cfg:{kind:'spikes',windup:.75,recovery:.4}}}]){box.f={...base,...patch};const before=previousDraws;vm.runInContext('drawAlien(ctx,f,time+1)',box);assert.equal(previousDraws,before);const emitter=vm.runInContext('drawnAlienEmitter(f)',box);assert(Number.isFinite(emitter.x)&&Number.isFinite(emitter.y));}
 for(const id of [0,1,3,4,5,6,7,8,9]){box.f={...base,id};const before=previousDraws;vm.runInContext('drawAlien(ctx,f,8)',box);assert.equal(previousDraws,before+1);vm.runInContext('drawnAlienEmitter(f)',box);}assert.equal(previousEmitters,9);
 console.log('Original Diamondhead: exact source/size at rest, rigid layer transforms without stretching, planted feet in both directions, original art in every combat state, finite hand emitters and other-alien delegation passed.');
})().catch(e=>{console.error(e);process.exit(1)});
