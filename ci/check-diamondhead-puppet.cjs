const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
let routed=0,draws=0;const ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:(...args)=>{if(k==='drawImage'){draws++;assert(args.slice(1).every(Number.isFinite))}},set:(o,k,v)=>(o[k]=v,true)});
const box=vm.createContext({Math,WeakMap,Error,floor:500,drawAlien(){routed++},loadClassicImage:async()=>({width:1254,height:1254})});
vm.runInContext(fs.readFileSync('web/diamondhead-gait-data.js','utf8'),box);
vm.runInContext(fs.readFileSync('web/diamondhead-puppet.js','utf8'),box);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
(async()=>{assert(await vm.runInContext('diamondheadPuppetReady',box));box.ctx=ctx;
 const data=vm.runInContext('DIAMONDHEAD_GAIT',box);assert.equal(data.samples,96);assert.equal(data.clips.forward.recording,'Neutral_FW.bvh');assert.equal(data.clips.backward.recording,'Neutral_BW.bvh');
 for(const name of ['forward','backward']){const clip=data.clips[name];assert(clip.stride>80&&clip.stride<200);assert.equal(clip.values.length,96);assert(clip.values.every(row=>row.length===data.keys.length&&row.every(Number.isFinite)));assert(/^[a-f0-9]{64}$/.test(clip.sourceSha256));
  box.clip=name;for(const phase of [0,.25,.5,.75,1]){box.phase=phase;const a=vm.runInContext('diamondheadGaitSample(clip,phase-1e-7)',box),b=vm.runInContext('diamondheadGaitSample(clip,phase+1e-7)',box);for(let k=0;k<a.length;k++)assert(Math.abs(a[k]-b[k])<.001);}
 }
 assert.notDeepEqual(data.clips.forward.values,data.clips.backward.values);
 for(const direction of [-1,1])for(const facing of [-1,1]){
  box.f={id:2,x:500,y:500,hp:100,moving:true,dir:facing,walk:0};let previous=null,maxRootStep=0,minY=Infinity,maxY=-Infinity;
  for(let n=0;n<480;n++){box.f.walk=n/120*12*direction*facing;box.n=n;const p=vm.runInContext('diamondheadBodyPose(f,n/120)',box);
   for(const key of ['nearLeg','farLeg']){const l=p[key];assert(Math.abs(distance(l.hip,l.knee)-53)<1e-8);assert(Math.abs(distance(l.knee,l.ankle)-51)<1e-8);box.angle=l.footAngle;l.bottom=l.ankle.y+vm.runInContext('diamondheadFootBottom(angle)',box);assert(l.bottom<=.001);}
   assert(Math.max(p.nearLeg.bottom,p.farLeg.bottom)>-.2);
   for(const key of ['nearArm','farArm']){const a=p[key];assert(Math.abs(distance(a.shoulder,a.elbow)-43)<1e-8);assert(Math.abs(distance(a.elbow,a.wrist)-48)<1e-8);}
   if(n>120){minY=Math.min(minY,p.pelvis.y);maxY=Math.max(maxY,p.pelvis.y);if(previous)maxRootStep=Math.max(maxRootStep,Math.abs(p.pelvis.y-previous.pelvis.y));}previous=p;vm.runInContext('drawAlien(ctx,f,n/120)',box);
  }
  assert(maxY-minY<8);assert(maxRootStep<1.2);
  box.f.moving=false;for(let n=480;n<660;n++){box.n=n;vm.runInContext('drawAlien(ctx,f,n/120)',box)}assert(vm.runInContext('diamondheadPuppetMotion.get(f).weight<1e-6',box));
 }
 // Continuous changes of direction must retain finite connected bones.
 box.f={id:2,x:500,y:500,hp:100,moving:true,dir:1,walk:0};for(let n=0;n<300;n++){box.f.walk+=(n<150?1:-1)*.1;box.n=n;vm.runInContext('drawAlien(ctx,f,n/120)',box)}
 for(const patch of [{cast:{}},{block:true},{stun:.2},{hp:0},{y:450},{jumpWindup:.05},{id:0},{id:1},{id:3},{id:4},{id:5},{id:6},{id:7},{id:8},{id:9}]){const original=box.f;box.f={...original,...patch};const before=routed;vm.runInContext('drawAlien(ctx,f,8)',box);assert.equal(routed,before+1);box.f=original;}
 assert(draws>1000);console.log('Diamondhead: real forward/backward curve provenance, periodic interpolation, fixed bone lengths, boot-ground support, bounded body travel, stop/direction transitions and combat/other-alien routing passed.');
})().catch(e=>{console.error(e);process.exit(1)});
