'use strict';
// Detailed generated cartoon cels. Each action uses one calibrated sheet scale,
// not a different fit-to-bounds scale per pose; each render draws exactly one body.
const ripjawsDetailedImages=[],ripjawsDetailedTravel=new WeakMap();
const ripjawsDetailedReady=Promise.all(RIPJAWS_DETAILED.sheets.map((src,i)=>loadClassicImage(src).then(async im=>{if(typeof im.decode==='function')await im.decode();ripjawsDetailedImages[i]=im;return im;}))).catch(e=>{console.warn('Ripjaws detailed artwork unavailable; using existing artwork.',e);return false;});
function ripjawsDetailedMotion(f,t){
 let s=ripjawsDetailedTravel.get(f);const count=Number.isFinite(f.gaitDistance126)?f.gaitDistance126:null;
 if(!s){s={x:f.x,distance:0,counter:count,moving:false,time:null};ripjawsDetailedTravel.set(f,s);}
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
function ripjawsDetailedFrame(f,t,portrait=false){
 const d=RIPJAWS_DETAILED,m=ripjawsDetailedMotion(f,t),v=f.cast;
 let key='idle',frame;
 if(!portrait){if(f.hp<=0)key='ko';else if(f.stun>0&&!f.block)key='hit';else if(f.dash)key='dash';else if(f.block)key='guard';else if(v)key=v.ultimate?'ultimate':v.key;else if(f.jumpWindup>0||f.y<floor-2)key='jump';else if(m.moving)key='walk';}
 if(m.state!==key){m.state=key;m.stateStart=t;}
 const clip=d.clips[key]||d.clips.idle;
 if(v&&['normal','skill0','skill1','skill2','ultimate'].includes(key)){
  const wind=Math.max(.001,v.cfg.windup),age=v.elapsed-wind,active=['rush','pounce'].includes(v.cfg.kind)?Math.max(.42,v.cfg.duration||.08):v.cfg.duration||.08,recovery=Math.max(.001,v.cfg.recovery);
  if(key==='normal'){
   const second=(f.normalChain||0)%2===1;
   frame=age<0?clip[second?3:Math.min(1,Math.floor(v.elapsed/wind*2))]:age<active?clip[second?4:2]:clip[second?5:3];
  }else if(key==='skill0'){
   // Neck coil and jaw opening lead to one closed-jaw bite contact, then recoil.
   frame=age<0?clip[Math.min(2,Math.floor(v.elapsed/wind*3))]:age<active?clip[3]:clip[4+Math.min(3,Math.floor((age-active)/recovery*4))];
  }else if(key==='skill1'){
   if(age<0)frame=clip[0];
   else if(age<active){const beat=age/active*3,i=Math.min(2,Math.floor(beat));frame=clip[1+i*2+(beat%1>.52?1:0)];}
   else frame=clip[age-active<recovery*.4?6:7];
  }else if(key==='skill2'){
   frame=age<0?clip[Math.min(1,Math.floor(v.elapsed/wind*2))]:age<active?clip[2+Math.min(2,Math.floor(age/active*3))]:clip[f.y<floor-10?4:f.y<floor-2?5:age-active<recovery*.8?6:7];
  }else if(key==='ultimate'){
   const beats=[[3,4,5],[6,7,8],[9,10,11],[12,13,13],[14,15,15]];
   if(age<0)frame=clip[Math.min(2,Math.floor(v.elapsed/wind*3))];
   else if(age<active){const beat=age/active*5;frame=clip[beats[Math.min(4,Math.floor(beat))][Math.min(2,Math.floor((beat%1)*3))]];}
   else frame=clip[15];
  }

 }else if(key==='walk'||key==='dash'){
  const h=(f.config||aliens[8]).renderHeight*(f.config||aliens[8]).scale;
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
const ripjawsDetailedTiles=new Map();let ripjawsDetailedTilePixels=0;
const RIPJAWS_TILE_LIMIT=24,RIPJAWS_TILE_PIXEL_LIMIT=2000000;
function ripjawsDetailedTile(index,image,r,width,height){
 const key=index+':'+width+':'+height;
 if(ripjawsDetailedTiles.has(key)){const tile=ripjawsDetailedTiles.get(key);ripjawsDetailedTiles.delete(key);ripjawsDetailedTiles.set(key,tile);return tile;}
 if(width*height>RIPJAWS_TILE_PIXEL_LIMIT)return null;
 let cv;
 if(typeof OffscreenCanvas==='function')cv=new OffscreenCanvas(width,height);
 else if(typeof document!=='undefined'){cv=document.createElement('canvas');cv.width=width;cv.height=height;}
 else return null;
 const tc=cv.getContext('2d');if(!tc)return null;
 tc.imageSmoothingEnabled=true;tc.imageSmoothingQuality='high';tc.drawImage(image,...r.rect,0,0,width,height);
 while(ripjawsDetailedTiles.size>=RIPJAWS_TILE_LIMIT||ripjawsDetailedTilePixels+width*height>RIPJAWS_TILE_PIXEL_LIMIT){
  const oldest=ripjawsDetailedTiles.keys().next().value,old=ripjawsDetailedTiles.get(oldest);
  ripjawsDetailedTilePixels-=old.width*old.height;ripjawsDetailedTiles.delete(oldest);
 }
 const tile={canvas:cv,width,height};ripjawsDetailedTiles.set(key,tile);ripjawsDetailedTilePixels+=width*height;return tile;
}
const ripjawsDetailedDrawBase=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 if(f.id!==8||Number.isInteger(f.villain)||!RIPJAWS_DETAILED.sheets.every((_,i)=>Boolean(ripjawsDetailedImages[i])))return ripjawsDetailedDrawBase(ctx,f,t,portrait);
 const q=ripjawsDetailedFrame(f,t,portrait);
 // Keep the original released walking art and cadence, as requested.
 if(!portrait&&q.key==='walk')return ripjawsDetailedDrawBase(ctx,f,t,portrait);
 const r=q.frame,a=f.config||aliens[8],scale=a.renderHeight*a.scale/r.referenceHeight,[x,y,w,h]=r.rect,dir=f.dash?.dir||f.cast?.dir||f.dir||1;
 const tr=typeof ctx.getTransform==='function'?ctx.getTransform():null;
 // Pixel-align a single sharp cel in the fixed side-view camera. No blur filters,
 // opacity blends or second body. Floor baseline is the same physical pixel row.
 if(tr&&tr.a>0&&tr.d>0&&Math.abs(tr.b)<.00001&&Math.abs(tr.c)<.00001){
  const sx=tr.a*scale,sy=tr.d*scale,pw=Math.max(1,Math.round(w*sx)),ph=Math.max(1,Math.round(h*sy)),tile=ripjawsDetailedTile(q.index,ripjawsDetailedImages[r.sheet],r,pw,ph);
  if(tile){
   ctx.save();ctx.setTransform(1,0,0,1,Math.round(tr.a*f.x+tr.e),Math.round(tr.d*f.y+tr.f));ctx.scale(dir,1);
   ctx.imageSmoothingEnabled=false;ctx.drawImage(tile.canvas,-Math.round(r.origin[0]*sx),1-ph);ctx.restore();return;
  }
 }
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.translate(f.x,f.y);ctx.scale(dir*scale,scale);
 ctx.drawImage(ripjawsDetailedImages[r.sheet],x,y,w,h,-r.origin[0],-r.origin[1],w,h);ctx.restore();
};
const ripjawsDetailedEmitterBase=drawnAlienEmitter;
drawnAlienEmitter=function(f,v){
 if(f.id!==8||Number.isInteger(f.villain))return ripjawsDetailedEmitterBase(f,v);
 const r=ripjawsDetailedFrame(f,typeof time==='number'?time:0).frame,a=f.config||aliens[8],s=a.renderHeight*a.scale/r.referenceHeight;
 const [px,py]=r.emitter;
 return{x:f.x+(v.dir||f.dir||1)*(px-r.origin[0])*s,y:f.y+(py-r.origin[1])*s};
};

