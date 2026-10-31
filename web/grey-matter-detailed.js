'use strict';
// Detailed generated cartoon cels. Each action uses one calibrated sheet scale,
// not a different fit-to-bounds scale per pose; each render draws exactly one body.
const greyMatterDetailedImages=[],greyMatterDetailedTravel=new WeakMap();
const greyMatterDetailedReady=Promise.all(GREYMATTER_DETAILED.sheets.map((src,i)=>loadClassicImage(src).then(async im=>{if(typeof im.decode==='function')await im.decode();greyMatterDetailedImages[i]=im;return im;}))).catch(e=>{console.warn('Grey Matter detailed artwork unavailable; using existing artwork.',e);return false;});
function greyMatterDetailedMotion(f,t){
 let s=greyMatterDetailedTravel.get(f);const count=Number.isFinite(f.gaitDistance126)?f.gaitDistance126:null;
 if(!s){s={x:f.x,distance:0,counter:count,moving:false,time:null};greyMatterDetailedTravel.set(f,s);}
 if(s.time===t&&s.x===f.x)return s;
 const dx=Math.abs(f.x-s.x);s.moving=dx>.01;
 const grounded=f.y>=floor-2&&!f.cast&&f.stun<=0&&f.hp>0;
 const travelling=s.moving&&(!!f.dash||grounded&&(f.moving||s.moving));
 if(travelling){
  // Ground distance is authoritative even when an input/physics gait counter advances.
  if(dx<Math.max(80,(f.config?.speed||325)*.3))s.distance+=dx;
 }
 s.x=f.x;s.counter=count;s.time=t;return s;
}
function greyMatterDetailedFrame(f,t,portrait=false){
 const d=GREYMATTER_DETAILED,m=greyMatterDetailedMotion(f,t),v=f.cast;
 let key='idle',frame;
 if(!portrait){if(f.hp<=0)key='ko';else if(f.stun>0&&!f.block)key='hit';else if(f.dash)key='dash';else if(f.block)key='guard';else if(v)key=v.ultimate?'ultimate':v.key;else if(f.jumpWindup>0||f.y<floor-2)key='jump';else if(m.moving)key='walk';}
 if(m.state!==key){m.state=key;m.stateStart=t;}
 const clip=d.clips[key]||d.clips.idle;
 if(v&&['normal','skill0','skill1','skill2','ultimate'].includes(key)){
  const wind=Math.max(.001,v.cfg.windup),age=v.elapsed-wind,active=v.cfg.castDuration??(v.cfg.duration||.08),recovery=Math.max(.001,v.cfg.recovery);
  if(key==='normal'){
   const second=(f.normalChain||0)%2===1;
   frame=age<0?clip[second?3:Math.min(1,Math.floor(v.elapsed/wind*2))]:age<active?clip[second?4:2]:clip[second?5:3];
  }else if(key==='skill0'){
   frame=age<0?clip[Math.min(2,Math.floor(v.elapsed/wind*3))]:age<active?clip[3]:clip[4+Math.min(3,Math.floor((age-active)/recovery*4))];
  }else if(key==='skill1'){
   // Place once, press remote, stand and watch: never repeat the deployment loop.
   frame=age<0?clip[Math.min(2,Math.floor(v.elapsed/wind*3))]:age<active?clip[age<.12?3:age<.32?4:age<.52?5:age<.72?6:7]:clip[7];
  }else if(key==='skill2'){
   frame=age<0?clip[Math.min(3,Math.floor(v.elapsed/wind*4))]:age<active?clip[4]:clip[5+Math.min(2,Math.floor((age-active)/recovery*3))];
  }else if(key==='ultimate'){
   const commands=[[4,5],[6,7],[8,9],[10,11],[12,13],[13,14]];
   if(age<0)frame=clip[Math.min(3,Math.floor(v.elapsed/wind*4))];
   else if(age<active){const beat=age/active*6;frame=clip[commands[Math.min(5,Math.floor(beat))][beat%1<.55?0:1]];}
   else frame=clip[15];
  }

 }else if(key==='walk'||key==='dash'){
  const h=(f.config||aliens[5]).renderHeight*(f.config||aliens[5]).scale;
  const stride=h*(key==='walk'?(d.gait?.strideHeight||.95):1.65);
  // Each cel belongs to a physical interval of one stride; no timed/repeated leg loop.
  const phase=((m.distance/stride)%1+1)%1;
  frame=clip[Math.min(clip.length-1,Math.floor(phase*clip.length+1e-8))];
 }else if(key==='jump')frame=clip[f.jumpWindup>0?0:f.vy< -180?1:f.vy< -30?2:f.vy<150?3:f.y<floor-18?4:5];
 else if(key==='ko')frame=clip[t-m.stateStart<.18?0:1];
 else if(key==='hit')frame=clip[(f.stun||0)>.11?0:1];
 else if(key==='guard')frame=clip[(f.stun||0)>0?1:0];
 else frame=clip[Math.floor(t*1.8)%clip.length];
 return{key,index:frame,frame:d.frames[frame]};
}
// Cache the small display-sized tiles rather than resampling a large atlas every draw.
// Bounded by both entry count and RGBA area; the original cels are never modified.
const greyMatterDetailedTiles=new Map();let greyMatterDetailedTilePixels=0;
const GREYMATTER_TILE_LIMIT=24,GREYMATTER_TILE_PIXEL_LIMIT=2000000;
function greyMatterDetailedTile(index,image,r,width,height){
 const key=index+':'+width+':'+height;
 if(greyMatterDetailedTiles.has(key)){const tile=greyMatterDetailedTiles.get(key);greyMatterDetailedTiles.delete(key);greyMatterDetailedTiles.set(key,tile);return tile;}
 if(width*height>GREYMATTER_TILE_PIXEL_LIMIT)return null;
 let cv;
 if(typeof OffscreenCanvas==='function')cv=new OffscreenCanvas(width,height);
 else if(typeof document!=='undefined'){cv=document.createElement('canvas');cv.width=width;cv.height=height;}
 else return null;
 const tc=cv.getContext('2d');if(!tc)return null;
 tc.imageSmoothingEnabled=true;tc.imageSmoothingQuality='high';tc.drawImage(image,...r.rect,0,0,width,height);
 while(greyMatterDetailedTiles.size>=GREYMATTER_TILE_LIMIT||greyMatterDetailedTilePixels+width*height>GREYMATTER_TILE_PIXEL_LIMIT){
  const oldest=greyMatterDetailedTiles.keys().next().value,old=greyMatterDetailedTiles.get(oldest);
  greyMatterDetailedTilePixels-=old.width*old.height;greyMatterDetailedTiles.delete(oldest);
 }
 const tile={canvas:cv,width,height};greyMatterDetailedTiles.set(key,tile);greyMatterDetailedTilePixels+=width*height;return tile;
}
const greyMatterDetailedDrawBase=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 if(f.id!==5||Number.isInteger(f.villain)||!GREYMATTER_DETAILED.sheets.every((_,i)=>Boolean(greyMatterDetailedImages[i])))return greyMatterDetailedDrawBase(ctx,f,t,portrait);
 const q=greyMatterDetailedFrame(f,t,portrait),r=q.frame,a=f.config||aliens[5],scale=a.renderHeight*a.scale/r.referenceHeight,[x,y,w,h]=r.rect,dir=f.dash?.dir||f.cast?.dir||f.dir||1;
 const tr=typeof ctx.getTransform==='function'?ctx.getTransform():null;
 // Pixel-align a single sharp cel in the fixed side-view camera. No blur filters,
 // opacity blends or second body. Floor baseline is the same physical pixel row.
 if(tr&&tr.a>0&&tr.d>0&&Math.abs(tr.b)<.00001&&Math.abs(tr.c)<.00001){
  const sx=tr.a*scale,sy=tr.d*scale,pw=Math.max(1,Math.round(w*sx)),ph=Math.max(1,Math.round(h*sy)),tile=greyMatterDetailedTile(q.index,greyMatterDetailedImages[r.sheet],r,pw,ph);
  if(tile){
   ctx.save();ctx.setTransform(1,0,0,1,Math.round(tr.a*f.x+tr.e),Math.round(tr.d*f.y+tr.f));ctx.scale(dir,1);
   ctx.imageSmoothingEnabled=false;ctx.drawImage(tile.canvas,-Math.round(r.origin[0]*sx),1-ph);ctx.restore();return;
  }
 }
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.translate(f.x,f.y);ctx.scale(dir*scale,scale);
 ctx.drawImage(greyMatterDetailedImages[r.sheet],x,y,w,h,-r.origin[0],-r.origin[1],w,h);ctx.restore();
};
const greyMatterDetailedEmitterBase=drawnAlienEmitter;
drawnAlienEmitter=function(f,v){
 if(f.id!==5||Number.isInteger(f.villain))return greyMatterDetailedEmitterBase(f,v);
 const r=greyMatterDetailedFrame(f,typeof time==='number'?time:0).frame,a=f.config||aliens[5],s=a.renderHeight*a.scale/r.referenceHeight;
 const [px,py]=r.emitter;
 return{x:f.x+(v.dir||f.dir||1)*(px-r.origin[0])*s,y:f.y+(py-r.origin[1])*s};
};

