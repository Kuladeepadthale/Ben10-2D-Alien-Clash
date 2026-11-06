'use strict';
const redrawnVillainRegistry=new Map(),redrawnVillainTravel=new WeakMap();let redrawnVillainClock=0;
function registerRedrawnVillain(d){
 if(!Number.isInteger(d.id)||d.id<0||d.id>=VILLAIN_DATA.characters.length||d.frames.length!==32||!d.sheets.length)throw Error('Invalid villain redraw set');
 redrawnVillainRegistry.set(d.id,{data:d,images:[],ready:false,lastUsed:0});
}
function redrawnVillainLoad(id){
 const e=redrawnVillainRegistry.get(id);if(!e)return Promise.resolve();e.lastUsed=++redrawnVillainClock;if(e.promise)return e.promise;
 e.promise=Promise.all(e.data.sheets.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(redrawn20Matte(im));im.onerror=reject;im.src=src;}))).then(images=>{
  e.images=images;e.ready=true;
  const old=[...redrawnVillainRegistry].filter(([k,v])=>v.ready&&k!==id).sort((a,b)=>a[1].lastUsed-b[1].lastUsed);
  while(old.length>3){const [,v]=old.shift();v.images=[];v.ready=false;v.promise=null;}
 },error=>{e.promise=null;throw error;});return e.promise;
}
function redrawnVillainPick(f,state,t){
 if(!Number.isInteger(f.villain))return null;
 const e=redrawnVillainRegistry.get(f.villain);if(!e?.ready)return null;e.lastUsed=++redrawnVillainClock;
 const d=e.data,clip=d.clips[state];if(!clip?.length)return null;let i=0;
 if(state==='walk'){
  let p=redrawnVillainTravel.get(f);if(!p){p={x:f.x,distance:0};redrawnVillainTravel.set(f,p);}
  p.distance+=Math.abs(f.x-p.x);p.x=f.x;
  i=Math.floor(p.distance/((VILLAIN_DATA.characters[f.villain].height||226)*d.stride)*clip.length)%clip.length;
 }else{const p=redrawnVillainTravel.get(f);if(p)p.x=f.x;}
 if(f.cast&&['normal','skill0','skill1','skill2','ultimate'].includes(state)){
  const v=f.cast,c=v.cfg,wind=Math.max(.001,c.windup||0),active=Math.max(.001,c.castDuration??c.duration??.15),age=v.elapsed-wind;
  if(age<0)i=0;else if(age<active){const repeat=c.kind==='melee'&&(c.ticks||1)>1,phase=repeat?(age/active*c.ticks)%1:age/active;i=1+Math.min(clip.length-3,Math.floor(phase*Math.max(1,clip.length-2)));}else i=clip.length-1;
  if(c.kind==='leapslam'&&clip.length===4){const ground=typeof floor==='number'?floor:f.y;i=age<0?0:f.y<ground-30?1:age<active?2:3;}
 }else if(state==='idle'&&clip.length>1)i=Math.floor(t*(d.idleFps||8))%clip.length;
 else if(state==='hit')i=Math.min(clip.length-1,Math.floor(Math.max(0,f.stun||0)*10));
 return {entry:e,frame:d.frames[clip[i]],index:i};
}
const redrawnVillainDrawBase=drawVillain;
drawVillain=function(ctx,f,t){
 const p=redrawnVillainPick(f,celState(f),t);
 if(!p){redrawnVillainLoad(f.villain).catch(()=>{});return redrawnVillainDrawBase(ctx,f,t);}
 const fr=p.frame,[x,y,w,h]=fr.rect,[ox,oy]=fr.origin,s=(VILLAIN_DATA.characters[f.villain].height||226)/p.entry.data.referenceHeight;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.translate(f.x,f.y);ctx.scale((f.cast?.dir||f.dir||1)*s,s);
 ctx.drawImage(p.entry.images[fr.sheet],x,y,w,h,-ox,-oy,w,h);ctx.restore();
};
const redrawnVillainEmitterBase=drawnAlienEmitter;
drawnAlienEmitter=function(f,v){
 const p=redrawnVillainPick(f,v.ultimate?'ultimate':v.cfg.poseKey||v.key,typeof time==='number'?time:0);
 if(!p)return redrawnVillainEmitterBase(f,v);
 const fr=p.frame,s=(VILLAIN_DATA.characters[f.villain].height||226)/p.entry.data.referenceHeight;
 return {x:f.x+(v.dir||f.dir||1)*(fr.emitter[0]-fr.origin[0])*s,y:f.y+(fr.emitter[1]-fr.origin[1])*s};
};
const redrawnVillainEnsureBase=villainEnsure;
villainEnsure=async function(id){if(globalThis.redrawnVillainScriptsReady)await globalThis.redrawnVillainScriptsReady;await Promise.all([redrawnVillainEnsureBase(id),redrawnVillainLoad(id)]);};
const redrawnVillainThreatBase=renderThreat;
renderThreat=function(){
 const r=redrawnVillainThreatBase(),at=document.getElementById('threatStatus');if(!at)return r;
 let m=document.getElementById('redrawnVillainStatus');if(!m){m=document.createElement('small');m.id='redrawnVillainStatus';at.after(m);}
 const e=redrawnVillainRegistry.get(threatStage);m.hidden=!e;m.textContent=e?'New drawings · Villain upgrade · 32 poses':'';return r;
};
