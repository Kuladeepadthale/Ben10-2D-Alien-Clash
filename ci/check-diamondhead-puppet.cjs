const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
let routed=0,draws=0;const ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:(...args)=>{if(k==='drawImage'){draws++;assert(args.slice(1).every(Number.isFinite))}},set:(o,k,v)=>(o[k]=v,true)});
const box=vm.createContext({Math,WeakMap,Error,floor:500,drawAlien(){routed++},loadClassicImage:async()=>({width:1254,height:1254})});
vm.runInContext(fs.readFileSync('web/diamondhead-puppet.js','utf8'),box);
(async()=>{assert(await vm.runInContext('diamondheadPuppetReady',box));box.ctx=ctx;
 for(const direction of [-1,1])for(const facing of [-1,1]){
  box.f={id:2,x:500,y:500,hp:100,moving:true,dir:facing,walk:0};
  for(let n=0;n<240;n++){box.n=n;box.f.walk=n/120*12*direction*facing;vm.runInContext('drawAlien(ctx,f,n/120)',box)}
  box.f.moving=false;for(let n=240;n<360;n++){box.n=n;vm.runInContext('drawAlien(ctx,f,n/120)',box)}
  assert(vm.runInContext('diamondheadPuppetMotion.get(f).weight<1e-5',box));
 }
 // Planted foot cancels arena translation at full walk weight in either direction.
 for(const sign of [-1,1]){box.a=.2;box.b=.2+sign*.0001;const a=vm.runInContext('diamondheadFoot(a,1,0)',box),b=vm.runInContext('diamondheadFoot(b,1,0)',box);assert(Math.abs((b.x-a.x)*.94+sign*.0001*124.08)<1e-8);assert.equal(a.y,b.y);}
 // Foot path and first derivative meet at both stance/swing boundaries.
 for(const seam of [0,.6,1]){box.a=seam-1e-6;box.b=seam+1e-6;const a=vm.runInContext('diamondheadFoot(a,1,0)',box),b=vm.runInContext('diamondheadFoot(b,1,0)',box);assert(Math.hypot(a.x-b.x,a.y-b.y)<.001);}
 box.f={id:2,x:500,y:500,hp:100,moving:true,dir:1,walk:0};
 for(const patch of [{cast:{}},{block:true},{stun:.2},{hp:0},{y:450},{jumpWindup:.05},{id:0},{id:1},{id:3},{id:4},{id:5},{id:6},{id:7},{id:8},{id:9}]){const original=box.f;box.f={...original,...patch};const before=routed;vm.runInContext('drawAlien(ctx,f,4)',box);assert.equal(routed,before+1);box.f=original;}
 assert(draws>1000);console.log('Diamondhead puppet: both directions/facings, planted feet, loop seams, stop easing, finite transforms and combat/other-alien routing passed.');
})().catch(e=>{console.error(e);process.exit(1)});
