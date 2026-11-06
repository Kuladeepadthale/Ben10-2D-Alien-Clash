const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{
let fallbacks=0,ensured=0;class Image{set src(src){loadImage(src).then(im=>{this._image=im;this.width=im.width;this.height=im.height;this.onload();}).catch(e=>this.onerror(e));}}
const canvas=createCanvas(900,650),ctx=canvas.getContext('2d');
const box=vm.createContext({console,Image,Map,WeakMap,Math,Promise,Number,time:0,threatStage:0,aliens:[],selected:0,begin:async()=>true,renderAlienInfo:()=>{},drawAlien:()=>{},drawVillain:()=>fallbacks++,drawnAlienEmitter:()=>({fallback:true}),villainEnsure:async()=>ensured++,renderThreat:()=>{},celState:f=>f.state,document:{getElementById:()=>null,createElement:()=>{const c=createCanvas(1,1),native=c.getContext('2d').drawImage;c.getContext('2d').drawImage=function(im,...a){return native.call(this,im._image||im,...a)};return c;}}});
const run=s=>vm.runInContext(s,box);run(fs.readFileSync('web/villain-data.js','utf8'));run(fs.readFileSync('web/redrawn20.js','utf8'));run(fs.readFileSync('web/redrawn-villains.js','utf8'));
const files=process.argv.slice(2);for(const file of files)run(fs.readFileSync(file,'utf8'));
const proxy=new Proxy(ctx,{get(t,p){if(p==='drawImage')return (im,...a)=>t.drawImage(im._image||im,...a);const v=t[p];return typeof v==='function'?v.bind(t):v;},set(t,p,v){t[p]=v;return true;}});box.ctx=proxy;
let samples=0;
for(const id of run('[...redrawnVillainRegistry.keys()]')){
 await run('villainEnsure('+id+')');const d=run('redrawnVillainRegistry.get('+id+').data');assert.equal(d.frames.length,32);
 for(const state of Object.keys(d.clips))for(const dir of [-1,1]){
  box.f={id:3,villain:id,state,dir,x:450,y:500,hp:100};const seen=new Set();
  for(let step=0;step<40;step++){
   box.f.x=320+step*4;if(['normal','skill0','skill1','skill2','ultimate'].includes(state))box.f.cast={key:state,dir,ultimate:state==='ultimate',elapsed:step*.04,cfg:{windup:.25,duration:.8,recovery:.3,kind:'projectile'}};
   ctx.clearRect(0,0,900,650);box.sampleTime=step*.04;const p=run('redrawnVillainPick(f,f.state,sampleTime)');assert(p);seen.add(p.index);run('drawVillain(ctx,f,sampleTime)');
   const bytes=ctx.getImageData(0,0,900,650).data;let count=0;for(let i=3;i<bytes.length;i+=4)if(bytes[i]>50)count++;assert(count>500,id+' '+state+' empty');
   if(box.f.cast){const at=run('drawnAlienEmitter(f,f.cast)');assert(Number.isFinite(at.x)&&Number.isFinite(at.y));assert.equal(Math.sign(at.x-box.f.x),dir);}
   samples++;
  }
  if(d.clips[state].length>1&&state!=='hit')assert(seen.size>1,id+' '+state+' static clip');
 }
 box.f={id:3,villain:id,state:'walk',x:100};const first=run('redrawnVillainPick(f,"walk",0).index');assert.equal(first,run('redrawnVillainPick(f,"walk",99).index'));
 for(const fr of d.frames){const im=run('redrawnVillainRegistry.get('+id+').images['+fr.sheet+']');assert(fr.rect[0]+fr.rect[2]<=im.width&&fr.rect[1]+fr.rect[3]<=im.height);}
 const data=run('VILLAIN_DATA.characters['+id+']');
 for(const [state,cfg] of [...data.kit.skills.map((s,i)=>['skill'+i,s]),['ultimate',data.kit.ultimate]]){
  if(cfg.kind!=='leapslam')continue;box.floor=500;box.f={id:3,villain:id,state,x:450,y:400,cast:{key:state,ultimate:state==='ultimate',elapsed:.5,cfg:{...cfg,windup:.2,duration:1}}};
  assert.equal(run('redrawnVillainPick(f,f.state,0).index'),1,'airborne slam');box.f.y=500;assert.equal(run('redrawnVillainPick(f,f.state,0).index'),2,'landed impact');
 }
 for(const state of ['jump','dash','ko']){box.f={id:3,villain:id,state,x:450,y:500};run('drawVillain(ctx,f,0)');}
 box.f={id:3,state:'normal',x:450,y:500};assert.equal(run('redrawnVillainPick(f,"normal",0)'),null,'hero must not use villain atlas');
 assert(run('[...redrawnVillainRegistry.values()].filter(e=>e.ready).length')<=4,'decoded cache bounded');
}
assert.equal(ensured,files.length);assert.equal(fallbacks,files.length*3);
console.log('PASS '+files.length+' villains; '+samples+' rendered action/facing/time samples; movement, powers, emitters, airborne/landed impacts, native fallbacks and cache.');
})().catch(e=>{console.error(e);process.exit(1)});
