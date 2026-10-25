'use strict';
// Species-specific presentation. Native body artwork is never stretched or crossfaded.
// Damage, cast snapshots, facing and cooldowns belong exclusively to game.js.
const requested127Ids=new Set([23,28,30,34,40,49,54,66]);
const requested127PhaseBase=celPhase,requested127DrawBase=drawAlien;
const requested127EffectBase=drawEffect,requested127ShotBase=drawShot;
const requested127Clamp=x=>Math.max(0,Math.min(1,x));
const requested127Guards=new WeakMap();
function requested127State(f,v=f.cast){
 if(!v||Number.isInteger(f.villain)||!requested127Ids.has(f.id)||v.key==='normal')return null;
 const duration=['rush','pounce'].includes(v.cfg.kind)?Math.max(.42,v.cfg.duration||.08):(v.cfg.duration||.08);
 const age=v.elapsed-v.cfg.windup,p=requested127Clamp(age/duration),count=Math.max(1,v.cfg.ticks||1),beat=p*count;
 return{v,age,duration,p,beat,phase:beat%1,active:age>=0&&age<duration,dir:v.dir||f.dir||1};
}
celPhase=function(f,state,t,portrait=false){
 const picked=requested127PhaseBase(f,state,t,portrait),s=requested127State(f);
 if(!portrait&&f.id===49&&!Number.isInteger(f.villain)&&typeof CRASHHOPPER_GUARD127!=='undefined'){
  let entry=requested127Guards.get(f);if(!entry){entry={guard:false,start:t,lastHit:-100};requested127Guards.set(f,entry);}
  if(state==='guard'){
   if(!entry.guard)entry.start=t;entry.guard=true;
   if(f.hitTint>0)entry.lastHit=t;
   const index=f.hitTint>0?2:t-entry.lastHit<.12?3:t-entry.start<.1?0:1;
   return{frame:CRASHHOPPER_GUARD127.frames[index],state,index};
  }
  entry.guard=false;
 }
 if(portrait||!s||!s.active)return picked;
 const d=CEL_DATA.characters[f.id],key=s.v.ultimate?'ultimate':s.v.key;
 if(f.id===49&&s.v.cfg.kind==='leapslam'){const frames=d.clips.jump,index=s.p<.12?1:s.p<.55?2:3;return{frame:d.frames[frames[Math.min(index,frames.length-1)]],state,index};}
 // Each rush keeps its OWN native action, rather than falling back to a generic punch.
 if(['rush','pounce'].includes(s.v.cfg.kind)&&[30,34,40,49,54,66].includes(f.id)||f.id===40&&key==='skill2'){
  const frames=d.clips[key];if(!frames?.length)return picked;
  const phase=s.v.cfg.ticks>1?s.phase:(s.age*9)%1;
  const index=frames.length===2?(phase<.62?1:0):phase<.18?0:phase<.7?1:Math.min(2,frames.length-1);
  return{frame:d.frames[frames[index]],state,index};
 }
 return picked;
};
function requested127Ring(ctx,x,y,rx,ry,color,width=2,alpha=1){
 if(rx<=0||ry<=0)return;ctx.save();ctx.globalAlpha*=alpha;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.restore();
}
function requested127Native(ctx,f,key,index,x,y,dir,alpha=1){
 const d=CEL_DATA.characters[f.id],cache=celCache.get(f.id),frames=d?.clips[key];if(!cache||!frames?.length)return;
 const fr=d.frames[frames[Math.min(frames.length-1,index)]],scale=aliens[f.id].renderHeight*aliens[f.id].scale/(fr.referenceHeight||d.referenceHeight),[sx,sy,w,h]=fr.rect;
 ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.scale(dir*scale,scale);ctx.drawImage(cache.images[fr.sheet],sx,sy,w,h,-fr.origin[0],-fr.origin[1],w,h);ctx.restore();
}
function requested127Attached(f,v=f.cast){
 if(Number.isInteger(f.villain)||!v||!(f.id===30&&v.key==='skill1'||f.id===54&&v.key==='skill0'))return null;
 const start=drawnAlienEmitter(f,v),dir=v.dir||f.dir||1,age=v.elapsed-v.cfg.windup,duration=v.cfg.duration||.08;
 const extend=age<0?requested127Clamp((v.elapsed/v.cfg.windup-.45)/.55):age<duration?1:1-requested127Clamp((age-duration)/Math.max(.001,v.cfg.recovery));
 const raw=v.targetX??f.x+dir*v.cfg.range,tx=f.x+dir*Math.min(v.cfg.range,Math.max(0,(raw-f.x)*dir));
 return{start,dir,extend,tip:{x:start.x+(tx-start.x)*extend,y:start.y+((v.targetY??start.y)-start.y)*extend}};
}
function requested127Limb(ctx,f){
 const s=requested127Attached(f);if(!s||s.extend<.01)return;
 const tongue=f.id===54,pts=[];
 for(let j=0;j<=24;j++){const u=j/24;pts.push([s.start.x+(s.tip.x-s.start.x)*u,s.start.y+(s.tip.y-s.start.y)*u+Math.sin(u*Math.PI)*Math.sin(time*16)*4*s.extend]);}
 line(ctx,pts,tongue?'#6f2947':'#28532a',tongue?9:18);line(ctx,pts,tongue?'#e37698':'#8bdc36',tongue?6:13);line(ctx,pts,tongue?'#ffc0cf':'#d5ff91',tongue?1.3:2);
 oval(ctx,s.tip.x,s.tip.y,tongue?8:15,tongue?5:10,tongue?'#e987a4':'#9ae13f',tongue?'#79384e':'#3e7029',1.5);
}
function requested127Surge(ctx,f,s,t){
 const key=s.v.ultimate?'ultimate':s.v.key,count=key==='skill2'?6:s.v.ultimate?6:3,h=body(f).h;
 const grow=s.age<0?requested127Clamp(s.v.elapsed/s.v.cfg.windup):s.age<s.duration?1:1-requested127Clamp((s.age-s.duration)/s.v.cfg.recovery);
 const pts=[];
 for(let i=0;i<count;i++){
  const angle=i*Math.PI*2/count+(key==='skill2'?t*2:0),r=(key==='skill2'?Math.min(s.v.cfg.range*.6,115):50)*grow;
  const x=f.x+Math.cos(angle)*r-s.dir*(key==='skill0'||s.v.ultimate?35+i*12:0),y=f.y-h*.38+Math.sin(angle)*r*.58;
  pts.push([x,y-h*.34]);
  requested127Native(ctx,f,key,1,x,y,s.dir,.7*grow);
 }
 if(pts.length>1)line(ctx,[...pts,pts[0]],'#d9a0ef',1.7);
}
drawAlien=function(ctx,f,t,portrait=false){
 const s=!portrait?requested127State(f):null;
 if(s&&f.id===66)requested127Surge(ctx,f,s,t);
 requested127DrawBase(ctx,f,t,portrait);
 if(!s)return;
 ctx.save();ctx.globalAlpha=.85;
 if(f.id===30||f.id===54)requested127Limb(ctx,f);
 if(s.active){
  const h=body(f).h,origin=drawnAlienEmitter(f,s.v);
  if(f.id===30&&s.v.key==='skill2'){
   for(let i=0;i<8;i++){const u=(s.age*3+i/8)%1;oval(ctx,f.x-s.dir*(20+u*78),f.y-4-Math.sin(u*Math.PI)*18,7*(1-u)+1,3*(1-u)+1,'#93d83c',null);}
  }
  if(f.id===34&&s.v.key==='skill1'){
   for(let i=0;i<4;i++){const u=(s.age*4+i/4)%1;line(ctx,[[f.x-s.dir*(15+u*65),f.y-h*.6+(i-1.5)*5],[f.x-s.dir*(7+u*48),f.y-h*.6+(i-1.5)*5]],'#9aff6a',1.8);}
   requested127Ring(ctx,f.x,f.y-h*.55,12,20,'#c7ffba',1.5,.7);
  }
  if(f.id===40&&s.v.ultimate){
   // Six visible native strike/retraction beats, with a short wake instead of a screen-wide trail.
   for(let i=0;i<4;i++){const y=f.y-h*(.2+i*.18);line(ctx,[[f.x-s.dir*65,y],[f.x-s.dir*22,y]],'#a4e5ff',1.7);}
   if(s.phase>.18&&s.phase<.7){ctx.beginPath();ctx.ellipse(f.x+s.dir*35,f.y-h*.55,42,48,0,s.dir>0?-.9:2.2,s.dir>0?.7:3.8);ctx.strokeStyle='#bcecff';ctx.lineWidth=2.5;ctx.stroke();}
  }
  if(f.id===49&&['skill0','skill1'].includes(s.v.key)){
   for(let i=0;i<3;i++)line(ctx,[[f.x-s.dir*(34+i*12),f.y-h*(.45+i*.12)],[f.x-s.dir*12,f.y-h*(.45+i*.12)]],'#badb69',1.6);
  }
  if(f.id===54&&['skill2','ultimate'].includes(s.v.key)){
   for(let i=0;i<3;i++){const u=(s.age*3+i/3)%1;requested127Ring(ctx,f.x-s.dir*(20+u*55),f.y-3,12+u*9,3,'#b4db86',1.5,1-u);}
  }
  if(f.id===30&&s.v.ultimate&&origin){for(let i=0;i<5;i++){const u=(s.age*3+i/5)%1;oval(ctx,origin.x-s.dir*u*25,origin.y+Math.sin(u*7)*8,3*(1-u)+1,2,'#c5f175',null);}}
 }
 ctx.restore();
};
drawShot=function(ctx,e){
 if(!Number.isInteger(e.owner?.villain)&&e.owner?.id===30&&e.artKey==='ultimate'){
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(e.vy,e.vx));const r=Math.min(70,e.r||50),phase=time*18;
  powerBlob(ctx,0,0,r*.7,r*.8,'#71bd29',phase);powerBlob(ctx,r*.15,-r*.08,r*.42,r*.6,'#b2e95e',phase+1);
  for(let i=0;i<5;i++){const a=i*1.25+phase*.15;oval(ctx,Math.cos(a)*r*.5,Math.sin(a)*r*.65,3,2,'#e0ffa6',null);}
  ctx.restore();return;
 }
 if(!Number.isInteger(e.owner?.villain)&&e.owner?.id===23&&e.artKey==='skill1'){
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(e.vy,e.vx));
  for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(-i*5,0,4+i*2,10+i*5,0,-1.45,1.45);ctx.strokeStyle=i===1?'#f2ffff':'#9de9b5';ctx.lineWidth=2.2;ctx.stroke();}
  ctx.restore();return;
 }
 requested127ShotBase(ctx,e);
};
drawEffect=function(ctx,e){
 const f=e.owner,id=f?.id;if(!f||Number.isInteger(f.villain)||!requested127Ids.has(id)||e.artKey==='normal'){requested127EffectBase(ctx,e);return;}
 const age=e.maxLife-e.life,fade=requested127Clamp(e.life/.12),v=f.cast;
 if(e.kind==='vortex'&&[23,28,40,66].includes(id)){
  // One continuous field per cast; multiple gameplay hit ticks must not stack opaque effects.
  if(effects.some(q=>q!==e&&q.owner===f&&q.castId===e.castId&&q.kind===e.kind&&q.life>0&&(q.id||0)>(e.id||0)))return;
  const s=requested127State(f),elapsed=s?.age??age;ctx.save();ctx.globalAlpha=fade*.75;
  if(id===23){
   for(let i=0;i<4;i++){const p=(elapsed*3+i/4)%1;requested127Ring(ctx,e.x,e.y,8+p*e.r,8+p*e.r,'#b7f3c7',2.4,1-p);}
  }else if(id===28){
   const brain=drawnAlienEmitter(f,v||{key:'skill2',elapsed:age,cfg:aliens[28].skills[2],dir:f.dir}),r=e.r;
   requested127Ring(ctx,e.x,e.y,r,r,'#aeeeff',1.6,.35);
   for(let i=0;i<9;i++){const a=i*Math.PI*2/9+Math.sin(elapsed*2)*.1,tx=e.x+Math.cos(a)*r,ty=e.y+Math.sin(a)*r,pts=[];
    for(let j=0;j<=9;j++){const u=j/9;pts.push([brain.x+(tx-brain.x)*u+(j&&j<9?Math.sin(i*7+j*2+elapsed*43)*8:0),brain.y+(ty-brain.y)*u]);}
    line(ctx,pts,'#79cfff',2);line(ctx,pts,'#e8fbff',.8);
   }
  }else if(id===40){
   const at=drawnAlienEmitter(f,v||{key:'skill2',elapsed:age,cfg:aliens[40].skills[2],dir:f.dir}),dir=e.dir||f.dir;
   ctx.translate(at.x,at.y);ctx.scale(dir,1);const p=s?.phase??age*5%1;
   for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(-10,0,35+i*17,22+i*8,-.3,-2+p,1+p);ctx.strokeStyle=i===1?'#e9faff':'#72cdf5';ctx.lineWidth=2;ctx.stroke();}
  }else{requested127Ring(ctx,e.x,e.y,e.r*.65,e.r*.65,'#cc7ee8',2,.3);}
  ctx.restore();return;
 }
 if(e.attachedStrike127)return;
 if(e.kind==='melee'&&(id===30&&e.artKey==='skill1'||id===54&&e.artKey==='skill0'))return;
 if(id===66&&e.kind==='melee'&&e.artKey==='skill1'){
  const dir=e.dir||1,x=e.x+dir*Math.min(90,e.range*.5),y=e.y;ctx.save();ctx.globalAlpha=fade;
  const u=requested127Clamp(age/.12),r=18+u*35;for(const side of [-1,1])line(ctx,[[x-dir*r,y-side*r*.6],[x+dir*r,y+side*r*.6]],side===1?'#f1d5ff':'#b56de0',3);ctx.restore();return;
 }
 if(id===49&&e.kind==='explosion'&&e.artKey==='ultimate'){
  ctx.save();ctx.globalAlpha=fade;const u=requested127Clamp(age/e.maxLife);requested127Ring(ctx,e.x,floor,20+u*e.r,5+u*12,'#d3e98f',3,1-u);
  for(let i=0;i<8;i++){const a=i*Math.PI/4,x=e.x+Math.cos(a)*u*e.r,y=floor-Math.sin(u*Math.PI)*(18+i%3*9);path(ctx,[[x-4,y],[x,y-7],[x+5,y+1]],'#93a46b',null);}ctx.restore();return;
 }
 requested127EffectBase(ctx,e);
};
