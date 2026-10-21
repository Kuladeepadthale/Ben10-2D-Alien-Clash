'use strict';
// Battle effects and their buttons share the same 260 transparent illustrations.
// Artwork deformation is visual only; the combat engine owns damage and collisions.
const abilityAnimationImages=new Map(),abilityAnimationPending=new Map();
const abilityAnimationPaths=Array.from({length:13},(_,i)=>'assets/ui/abilities/ability-atlas-'+String(i).padStart(2,'0')+(i<8?'-v83.png':'-v90.webp'));
function ensureAbilityAnimation(id){
 const index=Math.floor(id/4);if(abilityAnimationImages.has(index))return Promise.resolve(true);
 if(abilityAnimationPending.has(index))return abilityAnimationPending.get(index);
 const task=loadClassicImage(abilityAnimationPaths[index]).then(image=>{abilityAnimationImages.set(index,image);abilityAnimationPending.delete(index);return true;},()=>{abilityAnimationPending.delete(index);return false;});
 abilityAnimationPending.set(index,task);return task;
}
function abilityAnimationKey(e){
 if(e.artKey)return e.artKey;const a=aliens[e.owner?.id];if(!a)return null;
 if(e.name===a.ultimate.name)return'ultimate';const i=a.skills.findIndex(s=>s.name===e.name);return i>=0?'skill'+i:'normal';
}
function abilityAnimationSprite(e){
 const id=e.owner?.id,key=abilityAnimationKey(e);if(!Number.isInteger(id)||!key)return null;
 const image=abilityAnimationImages.get(Math.floor(id/4));if(!image){ensureAbilityAnimation(id);return null;}
 const col=key==='normal'?0:key==='ultimate'?4:1+Number(key.slice(5)),cw=image.width/5,ch=image.height/4;
 if(!Number.isInteger(col)||col<0||col>4)return null;
 return{image,x:col*cw+1,y:(id%4)*ch+1,w:cw-2,h:ch-2,key};
}
function drawAbilitySprite(ctx,s,x,y,w,h,alpha=1,angle=0,dir=1,flow=0,phase=0){
 if(w<=0||h<=0||alpha<=0)return;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(dir,1);ctx.globalAlpha*=alpha;ctx.imageSmoothingEnabled=true;
 if(flow){for(let i=0;i<12;i++){const u=i/12,v=(i+.5)/12,dy=Math.sin(phase+v*10)*flow*Math.sin(v*Math.PI);ctx.drawImage(s.image,s.x+s.w*u,s.y,s.w/12,s.h,-w/2+w*u,-h/2+dy,w/12+.6,h);}}
 else ctx.drawImage(s.image,s.x,s.y,s.w,s.h,-w/2,-h/2,w,h);ctx.restore();
}
const abilityShotBase=drawShot,abilityEffectBase=drawEffect;
drawShot=function(ctx,e){
 const s=abilityAnimationSprite(e);if(!s){abilityShotBase(ctx,e);return;}
 const age=e.maxLife-e.life,theme=powerTheme(e.owner.id,e.name),pulse=1+Math.sin(time*19+(e.id||0))*.045,r=e.r||18,alpha=Math.min(1,e.life*12);
 if(e.kind==='ground'){drawAbilitySprite(ctx,s,e.x,floor-30,Math.max(90,r*3),65,alpha,0,e.dir,3,time*22);return;}
 const wave=e.kind==='wave',fall=e.kind==='rain',lob=e.kind==='lob',angle=Math.atan2(e.vy,e.vx),h=(wave?Math.min(170,r*2.2):Math.max(46,r*2.7))*pulse,w=wave?h*1.1:h*(fall?.8:1.65);
 if(!wave&&!fall&&Number.isFinite(e.emitterX)&&age<.075){ctx.save();ctx.globalAlpha=.22;line(ctx,[[e.emitterX,e.emitterY],[e.x,e.y]],powerColor(e.owner.id,e.color),r*.5);ctx.restore();}
 drawAbilitySprite(ctx,s,e.x,e.y,w,h,alpha,lob&&theme==='gadget'?time*7:angle,1,['fire','electric','goo','water'].includes(theme)?h*.035:0,time*27);
};
function drawAbilityBeam(ctx,e,s){
 let x=e.x,y=e.y;const f=e.owner,v=f?.cast;
 if(v&&(e.castId===undefined?v.cfg.name===e.name:e.castId===v.id)){const emitter=drawnAlienEmitter(f,v);if(emitter){x=emitter.x;y=emitter.y;}}
 let ex=e.x+e.dir*e.length,ey=e.endY??e.y;if(e.hit){const b=body(other(f));ex=other(f).x;ey=b.y+b.h*.5;}
 const length=Math.hypot(ex-x,ey-y),angle=Math.atan2(ey-y,ex-x),age=e.maxLife-e.life,p=Math.min(1,age/.045),alpha=Math.min(1,e.life*18),height=(e.r||18)*(e.ultimate?3.5:3)*(1+Math.sin(time*30)*.035);
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();ctx.rect(0,-height,length*Math.max(.08,p),height*2);ctx.clip();
 drawAbilitySprite(ctx,s,length/2,0,length,height,alpha,0,1,height*.04,time*32);ctx.restore();
 if(e.hit)drawAbilitySprite(ctx,s,ex,ey,height*.9,height*.9,alpha*.65,time*2);
}
drawEffect=function(ctx,e){
 const s=abilityAnimationSprite(e);if(!s){abilityEffectBase(ctx,e);return;}
 const age=e.maxLife-e.life,p=Math.max(0,Math.min(1,age/e.maxLife)),alpha=Math.min(1,e.life*12),dir=e.dir||1;
 if(e.kind==='beam'){drawAbilityBeam(ctx,e,s);return;}
 if(e.kind==='warning'){abilityEffectBase(ctx,e);return;}
 if(e.kind==='afterimage'){
  if(!e.artKey){abilityEffectBase(ctx,e);return;}
  const size=Math.min(190,aliens[e.owner.id].renderHeight*aliens[e.owner.id].scale*.7);
  drawAbilitySprite(ctx,s,e.x-dir*15,e.y-size*.65,size*1.35,size,Math.min(.42,e.life/e.maxLife*.42),0,dir,5,time*20);return;
 }
 if(e.kind==='melee'){
  const f=e.owner,v=f.cast,at=v?drawnAlienEmitter(f,v):null,h=Math.min(135,80*aliens[f.id].scale),reach=Math.max(45,Math.min(e.range-35,165)),swing=Math.sin(p*Math.PI);
  drawAbilitySprite(ctx,s,(at?.x??e.x)+dir*reach*.28,at?.y??e.y,reach*(.7+swing*.3),h,Math.sin(Math.PI*(.08+p*.84)),(p-.5)*.65*dir,dir,h*.04,time*23);return;
 }
 if(e.kind==='spike'||e.kind==='eruption'){
  const elapsed=age-(e.delay||0);if(elapsed<0){abilityEffectBase(ctx,{...e,kind:'warning'});return;}
  const height=(e.height||150)*Math.min(1,elapsed/.15),w=Math.max(85,(e.r||45)*2.1);
  ctx.save();ctx.beginPath();ctx.rect(e.x-w,floor-height,w*2,height);ctx.clip();drawAbilitySprite(ctx,s,e.x,floor-height/2,w,height,alpha,0,dir,e.kind==='eruption'?4:0,time*28);ctx.restore();return;
 }
 if(e.kind==='vortex'){
  const h=Math.min(245,e.r*1.3),w=Math.min(240,e.r*1.2),pulse=1+Math.sin(time*20)*.04;
  drawAbilitySprite(ctx,s,e.x,Math.min(floor-h*.5,e.y),w*pulse,h,alpha,Math.sin(time*14)*.08,dir,5,time*30);return;
 }
 if(e.kind==='trap'){const size=65+Math.sin(time*6)*3;drawAbilitySprite(ctx,s,e.x,floor-size*.4,size*1.2,size,.75,0,dir);return;}
 if(e.kind==='explosion'){
  const size=Math.min(210,(e.r||60)*2.2)*(.55+Math.sin(p*Math.PI*.8)*.6),y=Math.min(floor-size*.35,e.y);
  drawAbilitySprite(ctx,s,e.x,y,size,size,(1-p)*.95,0,dir,3,time*25);return;
 }
 abilityEffectBase(ctx,e);
};
// Preload the same textures with each selected or random combatant.
const abilityCelEnsure=celEnsure;
celEnsure=function(id){return Promise.all([abilityCelEnsure(id),ensureAbilityAnimation(id)]).then(result=>result[0]);};
ensureAbilityAnimation(0);ensureAbilityAnimation(2);
