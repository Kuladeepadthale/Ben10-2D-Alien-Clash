'use strict';
// Newly drawn 2026-11-06 cels; authored game animation, not footage from the show.
const redrawn20Registry=new Map(),redrawn20Travel=new WeakMap();
function redrawn20Matte(image){
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i]<64)pixels.data[i]=0;ctx.putImageData(pixels,0,0);return canvas;
}
function registerRedrawn20(d){
 if(!Number.isInteger(d.id)||d.id<3||!d.sheets?.length||!d.frames?.length)throw Error('Invalid new drawing set');
 const entry={data:d,images:[],ready:false,lastUsed:0};redrawn20Registry.set(d.id,entry);
}
let redrawn20Clock=0;
function redrawn20Load(id){
 const entry=redrawn20Registry.get(id);if(!entry)return Promise.resolve();
 entry.lastUsed=++redrawn20Clock;
 if(entry.promise)return entry.promise;
 entry.promise=Promise.all(entry.data.sheets.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(redrawn20Matte(im));im.onerror=reject;im.src=src;}))).then(images=>{
  entry.images=images;entry.ready=true;
  // Keep a small working set; encoded source data remains available for later reloads.
  const loaded=[...redrawn20Registry.entries()].filter(([key,e])=>e.ready&&key!==id).sort((a,b)=>a[1].lastUsed-b[1].lastUsed);
  while(loaded.length>3){const [key,e]=loaded.shift();e.images=[];e.ready=false;e.promise=null;}
 },error=>{entry.promise=null;throw error;});
 return entry.promise;
}
function redrawn20Pick(f,state,t){
 const e=redrawn20Registry.get(f.id);if(!e?.ready||Number.isInteger(f.villain))return null;e.lastUsed=++redrawn20Clock;
 const d=e.data,clip=d.clips[state];if(!clip?.length)return null;
 let i=0;
 if(state==='walk'){
  let p=redrawn20Travel.get(f);if(!p){p={x:f.x,distance:0};redrawn20Travel.set(f,p);}
  p.distance+=Math.abs(f.x-p.x);p.x=f.x;
  i=Math.floor(p.distance/(aliens[f.id].renderHeight*aliens[f.id].scale*d.stride)*clip.length)%clip.length;
 }else{const p=redrawn20Travel.get(f);if(p)p.x=f.x;}
 if(f.cast&&['normal','skill0','skill1','skill2','ultimate'].includes(state)){
  const v=f.cast,c=v.cfg,wind=Math.max(.001,c.windup||0),active=Math.max(.001,c.castDuration??c.duration??.15),recovery=Math.max(.001,c.recovery||.2),age=v.elapsed-wind;
  // Separate anticipation, active contact, and recovery without replaying windup per hit.
  if(age<0)i=0;
  else if(age<active){const repeat=c.kind==='melee'&&(c.ticks||1)>1,phase=repeat?(age/active*c.ticks)%1:age/active;i=1+Math.min(clip.length-3,Math.floor(phase*Math.max(1,clip.length-2)));}
  else i=clip.length-1;
 }else if(state==='hit')i=Math.min(clip.length-1,Math.floor(Math.max(0,f.stun||0)*10));
 else if(state==='idle'&&clip.length>1)i=Math.floor(t*3)%clip.length;
 return {entry:e,frame:d.frames[clip[i]],index:i};
}
const redrawn20Base=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 const p=redrawn20Pick(f,portrait?'idle':celState(f),t);
 if(!p){if(!Number.isInteger(f.villain))redrawn20Load(f.id).catch(()=>{});return redrawn20Base(ctx,f,t,portrait);}
 const fr=p.frame,[x,y,w,h]=fr.rect,[ox,oy]=fr.origin,s=aliens[f.id].renderHeight*aliens[f.id].scale/p.entry.data.referenceHeight;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.translate(f.x,f.y);ctx.scale((f.cast?.dir||f.dir||1)*s,s);ctx.drawImage(p.entry.images[fr.sheet],x,y,w,h,-ox,-oy,w,h);ctx.restore();
};
const redrawn20EmitterBase=drawnAlienEmitter;
drawnAlienEmitter=function(f,v){
 const p=redrawn20Pick(f,v.ultimate?'ultimate':v.cfg.poseKey||v.key,typeof time==='number'?time:0);
 if(!p)return redrawn20EmitterBase(f,v);
 const fr=p.frame,s=aliens[f.id].renderHeight*aliens[f.id].scale/p.entry.data.referenceHeight;
 const at=fr.emitter||p.entry.data.emitter;
 return {x:f.x+(v.dir||f.dir||1)*(at[0]-fr.origin[0])*s,y:f.y+(at[1]-fr.origin[1])*s};
};
const redrawn20BeginBase=begin;
begin=async function(...args){if(globalThis.redrawn20ScriptsReady)await globalThis.redrawn20ScriptsReady;await redrawn20Load(selected);return redrawn20BeginBase(...args);};
const redrawn20InfoBase=renderAlienInfo;
renderAlienInfo=function(){const r=redrawn20InfoBase(),e=redrawn20Registry.get(selected),m=document.getElementById('animationRevision');if(e?.ready&&m){m.hidden=false;m.textContent='New drawings · 20-alien batch · '+e.data.frames.length+' poses';}return r;};
