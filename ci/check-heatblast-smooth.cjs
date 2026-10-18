const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{
const m=JSON.parse(fs.readFileSync('web/assets/heatblast-smooth/animation.json'));
assert.equal(m.sourceSha256,crypto.createHash('sha256').update(fs.readFileSync('web/assets/heatblast-poses/atlas-v8.png')).digest('hex'));
assert.equal(m.frameCount,m.frames.length);assert(m.frameCount>=400&&m.frameCount<=512);
const sheets=await Promise.all(m.sources.map(p=>loadImage('web/'+p)));
for(const im of sheets){assert.equal(im.width,m.width);assert.equal(im.height,m.height);}
for(const [i,f] of m.frames.entries()){
 const [x,y,r,b]=f.bounds;assert(x>=2&&y>=2&&r<=m.cell-2&&b<=m.ground+1,`Ground or cell clipping at ${i}`);
 const cv=createCanvas(m.cell,m.cell),c=cv.getContext('2d'),j=i%m.sheetFrames;
 c.drawImage(sheets[Math.floor(i/m.sheetFrames)],j%8*m.cell,Math.floor(j/8)*m.cell,m.cell,m.cell,0,0,m.cell,m.cell);
 assert(c.getImageData(x,y,r-x,b-y).data.some(v=>v!==0),`Blank frame ${i}`);
}
for(const [name,clip] of Object.entries(m.clips)){assert(clip.frames.length);for(const frame of clip.frames)assert(Number.isInteger(frame)&&frame>=0&&frame<m.frameCount,name);}
assert.equal(m.clips.walk.frames.length,72);assert.equal(m.clips.walk.frames[0],6);assert.notEqual(m.clips.walk.frames.at(-1),6);
let delegated=0;
const b=vm.createContext({Math,WeakMap,Promise,Error,floor:345,aliens:Array.from({length:10},(_,id)=>({scale:id===0?1.05:1})),loadClassicImage:p=>loadImage('web/'+p),drawAlien(){delegated++}});
for(const p of ['web/heatblast-smooth-data.js','web/heatblast-poses.js'])vm.runInContext(fs.readFileSync(p,'utf8'),b);
assert(await vm.runInContext('heatblastPoseReady',b));b.ctx=createCanvas(800,450).getContext('2d');
const base=()=>({id:0,x:400,y:345,dir:1,hp:100,moving:false,walk:0,stun:0,vy:0});
for(const [key,kind,impact] of [['normal','melee',27],['skill0','projectile',33],['skill1','beam',39],['skill2','eruption',44],['ultimate','rain',47]]){
 const cfg={kind,windup:.4,duration:.55,recovery:.4};
 for(let n=0;n<=162;n++){b.v={key,ultimate:key==='ultimate',cfg,elapsed:n/120};const f=vm.runInContext('heatblastCastFrame(v)',b);assert(f>=0&&f<m.frameCount);}
 for(const e of [.4,.6,.94999]){b.v={key,ultimate:key==='ultimate',cfg,elapsed:e};assert.equal(vm.runInContext('heatblastCastFrame(v)',b),impact);}
 b.v={key,ultimate:key==='ultimate',cfg,elapsed:1.35};assert.equal(vm.runInContext('heatblastCastFrame(v)',b),0);
 for(const dir of [1,-1]){b.f={...base(),dir,cast:b.v};const hand=vm.runInContext('heatblastHand(f)',b);assert(Number.isFinite(hand.x)&&Number.isFinite(hand.y));assert(hand.y<345);if(kind==='projectile'||kind==='beam')assert.equal(Math.sign(hand.x-400),dir);}
}
for(const sign of [1,-1]){b.f={...base(),moving:true};const seen=new Set();for(let n=0;n<360;n++){b.f.walk+=sign*12/120;b.t=n/120;seen.add(vm.runInContext('heatblastPoseFrame(f,t)',b));vm.runInContext('drawAlien(ctx,f,t)',b);}assert(seen.size>50);b.f.moving=false;for(let n=360;n<390;n++){b.t=n/120;vm.runInContext('heatblastPoseFrame(f,t)',b);}assert.equal(vm.runInContext('heatblastPoseFrame(f,t)',b),0);}
b.f={...base(),block:true};for(let n=0;n<60;n++){b.t=10+n/120;vm.runInContext('heatblastPoseFrame(f,t)',b);}assert.equal(vm.runInContext('heatblastPoseFrame(f,t)',b),20);
b.f.block=false;for(let n=60;n<90;n++){b.t=10+n/120;vm.runInContext('heatblastPoseFrame(f,t)',b);}assert.equal(vm.runInContext('heatblastPoseFrame(f,t)',b),0);
for(const [patch,end] of [[{stun:.22},0],[{hp:0},23]]){b.f={...base(),...patch};for(let n=0;n<100;n++){b.t=20+n/120;if(n===27)b.f.stun=0;vm.runInContext('drawAlien(ctx,f,t)',b);}assert.equal(vm.runInContext('heatblastPoseFrame(f,t)',b),end);}
b.f=base();for(let n=0;n<140;n++){b.t=30+n/120;const u=n/120;b.f.jumpWindup=u<.07?.07-u:0;const a=u-.07;b.f.y=a>=0?Math.min(345,345-520*a+600*a*a):345;b.f.vy=a>=0?-520+1200*a:0;vm.runInContext('drawAlien(ctx,f,t)',b);}assert.equal(vm.runInContext('heatblastPoseFrame(f,t)',b),0);
for(let id=1;id<10;id++){b.f={...base(),id};vm.runInContext('drawAlien(ctx,f,40)',b);}assert.equal(delegated,9);
console.log(`Heatblast original-art smoothing: ${m.frameCount} valid frames, 72-pose walk in both directions, guard/hit/jump/landing/KO, all five attacks with exact held impact poses, finite mirrored emitters, and other-alien delegation passed.`);
})().catch(e=>{console.error(e);process.exit(1)});
