'use strict';
// Detailed generated cartoon cels. Each action uses one calibrated sheet scale,
// not a different fit-to-bounds scale per pose; each render draws exactly one body.
const wildmuttDetailedImages=[],wildmuttDetailedTravel=new WeakMap();
const wildmuttDetailedReady=Promise.all(WILDMUTT_DETAILED.sheets.map((src,i)=>loadClassicImage(src).then(im=>wildmuttDetailedImages[i]=im))).catch(e=>{console.warn('Wildmutt detailed artwork unavailable; using existing artwork.',e);return false;});
function wildmuttDetailedMotion(f,t){
 let s=wildmuttDetailedTravel.get(f);const count=Number.isFinite(f.gaitDistance126)?f.gaitDistance126:null;
 if(!s){s={x:f.x,distance:count||0,counter:count,moving:false,time:null};wildmuttDetailedTravel.set(f,s);}
 if(s.time===t&&s.x===f.x)return s;
 const dx=Math.abs(f.x-s.x);s.moving=dx>.01;
 if(count!==null&&s.counter!==null&&count>=s.counter)s.distance+=count-s.counter;
 else if(dx<Math.max(80,(f.config?.speed||325)*.3))s.distance+=dx;
 s.x=f.x;s.counter=count;s.time=t;return s;
}
function wildmuttDetailedFrame(f,t,portrait=false){
 const d=WILDMUTT_DETAILED,m=wildmuttDetailedMotion(f,t),v=f.cast;
 let key='idle',frame;
 if(!portrait){if(f.hp<=0)key='ko';else if(f.stun>0)key='hit';else if(f.dash)key='dash';else if(f.block)key='guard';else if(v)key=v.ultimate?'ultimate':v.key;else if(f.jumpWindup>0||f.y<floor-2)key='jump';else if(f.moving||m.moving)key='walk';}
 if(m.state!==key){m.state=key;m.stateStart=t;}
 const clip=d.clips[key]||d.clips.idle,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 if(v&&['normal','skill0','skill1','skill2','ultimate'].includes(key)){
  const wind=Math.max(.001,v.cfg.windup),age=v.elapsed-wind,active=['rush','pounce'].includes(v.cfg.kind)?Math.max(.42,v.cfg.duration||.08):v.cfg.duration||.08,recovery=Math.max(.001,v.cfg.recovery);
  if(key==='normal'){
   const second=(f.normalChain||0)%2===1;
   frame=age<0?clip[second?(v.elapsed/wind<.45?0:5):Math.min(2,Math.floor(v.elapsed/wind*3))]:age<active?clip[second?6:3]:clip[age-active<recovery*.55?4:7];
  }else if(key==='skill1'){
   if(age<0)frame=clip[0];else if(age<active){const beat=age/active*(v.cfg.ticks||3),i=Math.min(2,Math.floor(beat));frame=clip[Math.min(6,1+i*2+((beat%1)>.45?1:0))];}else frame=clip[age-active<recovery*.5?6:7];
  }else if(key==='ultimate'){
   frame=age<0?clip[Math.min(2,Math.floor(v.elapsed/wind*3))]:age<active?clip[[3,4,5,6][Math.min(3,Math.floor(((age/active*(v.cfg.ticks||5))%1)*4))]]:clip[age-active<recovery*.35?6:7];
  }else{
   frame=age<0?clip[Math.min(2,Math.floor(v.elapsed/wind*3))]:age<active?clip[3+Math.min(2,Math.floor(age/active*3))]:clip[age-active<recovery*.4?6:7];
  }
 }else if(key==='walk'||key==='dash'){
  const h=(f.config||aliens[4]).renderHeight*(f.config||aliens[4]).scale;
  frame=clip[Math.floor(((m.distance/(h*1.65))%1+1)%1*clip.length)];
 }else if(key==='jump')frame=clip[f.jumpWindup>0?0:f.vy< -80?1:f.vy<120?2:f.y<floor-18?3:4];
 else if(key==='ko')frame=clip[t-m.stateStart<.18?0:1];
 else if(key==='hit')frame=clip[(f.stun||0)>.11?0:1];
 else if(key==='guard')frame=clip[(f.stun||0)>0?1:0];
 else frame=clip[Math.floor(t*1.8)%clip.length];
 return{key,index:frame,frame:d.frames[frame]};
}
const wildmuttDetailedDrawBase=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 if(f.id!==4||Number.isInteger(f.villain)||!WILDMUTT_DETAILED.sheets.every((_,i)=>Boolean(wildmuttDetailedImages[i])))return wildmuttDetailedDrawBase(ctx,f,t,portrait);
 const q=wildmuttDetailedFrame(f,t,portrait),r=q.frame,a=f.config||aliens[4],scale=a.renderHeight*a.scale/r.referenceHeight,[x,y,w,h]=r.rect;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.translate(f.x,f.y);ctx.scale((f.dash?.dir||f.cast?.dir||f.dir||1)*scale,scale);
 ctx.drawImage(wildmuttDetailedImages[r.sheet],x,y,w,h,-r.origin[0],-r.origin[1],w,h);ctx.restore();
};
const wildmuttDetailedEmitterBase=drawnAlienEmitter;
drawnAlienEmitter=function(f,v){
 if(f.id!==4||Number.isInteger(f.villain))return wildmuttDetailedEmitterBase(f,v);
 const r=wildmuttDetailedFrame(f,typeof time==='number'?time:0).frame,a=f.config||aliens[4],s=a.renderHeight*a.scale/r.referenceHeight;
 const melee=v.cfg.kind==='melee'||v.key==='normal',px=r.rect[2]*(melee?.94:.90),py=r.rect[3]*(melee?.67:.40);
 return{x:f.x+(v.dir||f.dir||1)*(px-r.origin[0])*s,y:f.y+(py-r.origin[1])*s};
};
