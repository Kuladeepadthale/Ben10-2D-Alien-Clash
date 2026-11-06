'use strict';
// November 5 source artwork: two aliens, 32 complete drawings each.
const redrawn01Images=new Map(),redrawn01Pending=new Map(),redrawn01Travel=new WeakMap();
function redrawn01Load(id){
 if(!REDRAWN_BATCH01[id])return Promise.resolve();
 if(redrawn01Images.has(id))return Promise.resolve();
 if(redrawn01Pending.has(id))return redrawn01Pending.get(id);
 const p=Promise.all(REDRAWN_BATCH01[id].sheets.map(s=>loadClassicImage('assets/redrawn-batch01/'+s.src))).then(images=>{redrawn01Images.set(id,images);redrawn01Pending.delete(id);},e=>{redrawn01Pending.delete(id);throw e;});
 redrawn01Pending.set(id,p);return p;
}
function redrawn01Pick(f,state,t){
 const d=REDRAWN_BATCH01[f.id];if(!d||Number.isInteger(f.villain)||!d.clips[state])return null;
 const frames=d.clips[state];let i=0;
 if(state==='walk'){
  let p=redrawn01Travel.get(f);if(!p){p={x:f.x,distance:0};redrawn01Travel.set(f,p);}
  p.distance+=Math.abs(f.x-p.x);p.x=f.x;
  const height=aliens[f.id].renderHeight*aliens[f.id].scale;
  i=Math.floor(p.distance/(height*.85)*frames.length)%frames.length;
 }else {const p=redrawn01Travel.get(f);if(p)p.x=f.x;}
 if(f.cast&&['normal','skill0','skill1','skill2','ultimate'].includes(state)){
  const v=f.cast,c=v.cfg,wind=Math.max(.001,c.windup||0),active=Math.max(.001,c.castDuration??c.duration??.08),recovery=Math.max(.001,c.recovery||0),age=v.elapsed-wind;
  if(age<0)i=Math.min(1,Math.floor(Math.max(0,v.elapsed)/wind*2));
  else if(age<active){
   const repeated=c.kind==='melee'&&(c.ticks||1)>1;
   const phase=repeated?(age/active*c.ticks)%1:age/active;
   i=1+Math.min(frames.length-3,Math.floor(phase*(frames.length-2)));
  }else i=frames.length-1;
  // Titan Impact has a real airborne pose; do not draw its ground-impact cel in midair.
  if(f.id===1&&state==='ultimate')i=age<0?0:f.y<floor-30?1:age<active?2:3;
 }
 if(state==='hit')i=Math.min(frames.length-1,Math.floor(Math.max(0,f.stun||0)*10));
 return {frame:d.frames[frames[i]],index:i,state};
}
const redrawn01DrawBase=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 const state=portrait?'idle':celState(f),picked=redrawn01Pick(f,state,t),images=redrawn01Images.get(f.id);
 if(!picked||!images){if(REDRAWN_BATCH01[f.id])redrawn01Load(f.id).catch(()=>{});return redrawn01DrawBase(ctx,f,t,portrait);}
 const fr=picked.frame,[x,y,w,h]=fr.rect,[ox,oy]=fr.origin,s=aliens[f.id].renderHeight*aliens[f.id].scale/fr.referenceHeight;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.translate(f.x,f.y);ctx.scale((f.cast?.dir||f.dir||1)*s,s);ctx.drawImage(images[fr.sheet],x,y,w,h,-ox,-oy,w,h);ctx.restore();
};
const redrawn01EmitterBase=drawnAlienEmitter;
drawnAlienEmitter=function(f,v){
 const picked=redrawn01Pick(f,v.ultimate?'ultimate':v.cfg.poseKey||v.key,typeof time==='number'?time:0);
 if(!picked||!redrawn01Images.has(f.id))return redrawn01EmitterBase(f,v);
 const fr=picked.frame,[l,top,r,bottom]=fr.bounds,s=aliens[f.id].renderHeight*aliens[f.id].scale/fr.referenceHeight;
 // Registered leading hand, using the selected drawing's coordinates and facing.
 const u=f.id===1?.76:.92,y=top+(bottom-top)*(f.id===1?.38:.40);
 return {x:f.x+(v.dir||f.dir||1)*(l+(r-l)*u-fr.origin[0])*s,y:f.y+(y-fr.origin[1])*s};
};
const redrawn01BeginBase=begin;
begin=async function(...args){await redrawn01Load(selected);return redrawn01BeginBase(...args);};
// Preload both so randomly selected opponents and detail portraits share the same artwork.
for(const id of [1,2])redrawn01Load(id).catch(()=>{});
const redrawn01InfoBase=renderAlienInfo;
renderAlienInfo=function(){const result=redrawn01InfoBase();if(REDRAWN_BATCH01[selected]){const marker=document.getElementById('animationRevision');if(marker){marker.hidden=false;marker.textContent='New drawings · Batch 01 · 32 poses';}}return result;};
