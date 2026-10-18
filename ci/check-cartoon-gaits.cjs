const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('web/index.html','utf8');assert(!/<script[^>]+src="footwork\.js/.test(html));assert(/<script[^>]+src="cartoon-gaits\.js/.test(html));
let calls=0;const ctx={save(){},restore(){},translate(){},transform(){}};
const b=vm.createContext({Math,WeakMap,floor:510,aliens:Array.from({length:10},(_,id)=>({scale:id===5?.6:1})),drawAlien(){calls++}});vm.runInContext(fs.readFileSync('web/cartoon-gaits.js','utf8'),b);
assert.equal(vm.runInContext('new Set(CARTOON_GAITS.map(p=>p.style)).size',b),10);
for(let id=0;id<10;id++){
 b.f={id,x:400,y:510,dir:1,hp:1000,moving:true};b.s={};vm.runInContext('cartoonGaitPhase(f,s,0,true)',b);b.f.x+=30;const forward=vm.runInContext('cartoonGaitPhase(f,s,1/60,true)',b);assert(forward>0&&forward<1);
 assert.equal(vm.runInContext('cartoonGaitPhase(f,s,10,true)',b),forward,'stationary character advanced');b.f.x-=30;assert(Math.abs(vm.runInContext('cartoonGaitPhase(f,s,10.1,true)',b))<1e-12);
 for(const patch of [{},{cast:{}},{block:true},{stun:.2},{y:450},{moving:false},{dash:{}}]){Object.assign(b.f,{id,x:400,y:510,dir:1,hp:1000,moving:true,cast:null,block:false,stun:0,dash:null},patch);b.ctx=ctx;const before=calls;vm.runInContext('drawAlien(ctx,f,20)',b);assert.equal(calls,before+1,'original whole-body drawing was not delegated');}
}
const a=vm.runInContext('cartoonSkatePhase(.14)',b),z=vm.runInContext('cartoonSkatePhase(.41)',b);assert(z-a<.021,'XLR8 glide does not hold the extended pose');
for(let i=0;i<1000;i++){b.p=i/1000;const p=vm.runInContext('cartoonSkatePhase(p)',b);assert(p>=0&&p<1);}
console.log('Passed: previous full-body art delegation, no procedural leg renderer, ten distinct gait profiles, XLR8 push/glide timing, distance-matched forward/reverse phase and stationary handling.');
