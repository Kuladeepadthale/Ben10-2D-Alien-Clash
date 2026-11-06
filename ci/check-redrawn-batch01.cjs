const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),canvas=createCanvas(640,480),ctx=canvas.getContext('2d');
let fallback=0;const marker={};
const box=vm.createContext({console,Map,WeakMap,Math,Promise,Number,document:{getElementById:()=>marker},selected:1,time:0,floor:420,aliens:[null,{renderHeight:200,scale:1.22},{renderHeight:200,scale:1.12}],loadClassicImage:s=>loadImage(path.join(root,'web',s)),drawAlien:()=>{fallback++},drawnAlienEmitter:()=>({native:true}),begin:async()=>true,renderAlienInfo:()=>{},celState:f=>f.state});
const run=s=>vm.runInContext(s,box);
for(const n of ['redrawn-batch01-data.js','redrawn-batch01.js'])run(fs.readFileSync(path.join(root,'web',n),'utf8'));
(async()=>{
 await run('Promise.all([redrawn01Load(1),redrawn01Load(2)])');
 let samples=0;
 for(const id of [1,2])for(const state of ['idle','walk','normal','skill0','skill1','skill2','ultimate','guard','hit'])for(const dir of [-1,1]){
  box.f={id,state,x:320,y:420,dir,hp:100,stun:state==='hit'?.1:0};
  for(let step=0;step<30;step++){
   box.f.x=200+step*3;
   if(['normal','skill0','skill1','skill2','ultimate'].includes(state))box.f.cast={key:state,dir,ultimate:state==='ultimate',elapsed:step*.06,cfg:{windup:.3,duration:.7,recovery:.4,kind:state==='skill2'?'melee':'projectile',ticks:4}};
   const p=run('redrawn01Pick(f,f.state,0)');assert(p&&p.frame);
   ctx.clearRect(0,0,640,480);box.ctx=ctx;run('drawAlien(ctx,f,0)');
   const alpha=ctx.getImageData(0,0,640,480).data;let opaque=0;for(let i=3;i<alpha.length;i+=4)if(alpha[i]>0)opaque++;
   assert(opaque>1000,`${id} ${state}: empty body`);
   if(box.f.cast){const at=run('drawnAlienEmitter(f,f.cast)');assert(Number.isFinite(at.x)&&Number.isFinite(at.y));assert.equal(Math.sign(at.x-box.f.x),dir);}
   samples++;
  }
 }
 assert.equal(fallback,0);
 for(const state of ['jump','dash','ko']){box.f={id:1,state,x:320,y:420};run('drawAlien(ctx,f,0)');}assert.equal(fallback,3);
 box.f={id:1,state:'idle',villain:0};run('drawAlien(ctx,f,0)');assert.equal(fallback,4);
 run('renderAlienInfo()');assert.equal(marker.textContent,'New drawings · Batch 01 · 32 poses');
 // Walks advance by traveled distance, and standing still cannot advance their drawing.
 box.f={id:1,x:100,y:420};const first=run('redrawn01Pick(f,"walk",0).index');box.f.x+=50;const next=run('redrawn01Pick(f,"walk",1).index');assert.notEqual(first,next);assert.equal(run('redrawn01Pick(f,"walk",99).index'),next);
 // Fixed scale and crop boundaries retain the full body in every source cel.
 const data=run('REDRAWN_BATCH01');for(const d of Object.values(data)){assert.equal(d.frames.length,32);for(const f of d.frames){assert.equal(f.referenceHeight,d.referenceHeight);const s=d.sheets[f.sheet];assert(f.rect[0]+f.rect[2]<=s.width&&f.rect[1]+f.rect[3]<=s.height);}}
 console.log(`Passed ${samples} rendered samples, both facings, every integrated action, emitter direction, retained native states and distance-based walk.`);
})().catch(e=>{console.error(e);process.exit(1)});
