'use strict';
// Cosmetic accents share the established hitboxes, cooldowns and damage budgets.
const forceShotBase=drawShot,forceEffectBase=drawEffect;
drawShot=function(ctx,s){
 if(s.type==='web'&&s.kind==='projectile'){
  ctx.save();ctx.translate(s.x,s.y);ctx.strokeStyle='#e9f7ff';ctx.lineWidth=2;
  for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*s.r,Math.sin(a)*s.r);ctx.stroke()}
  for(const r of [.45,.85]){ctx.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI/3,x=Math.cos(a)*s.r*r,y=Math.sin(a)*s.r*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
  ctx.restore();return;
 }
 forceShotBase(ctx,s);
};
drawEffect=function(ctx,e){
 forceEffectBase(ctx,e);
 if(e.kind==='beam'&&e.owner?.id===27){
  ctx.save();ctx.globalAlpha=Math.max(0,e.life/e.maxLife)*.65;
  const end=e.x+e.dir*e.length,ey=e.endY??e.y;
  for(const [i,col]of ['#ff8181','#ffe183','#96ffb5','#85d6ff','#d6a0ff'].entries())line(ctx,[[e.x,e.y+(i-2)*3],[end,ey+(i-2)*3]],col,2);
  ctx.restore();
 }
 if(e.kind==='melee'&&e.owner?.id===23&&e.owner.cast){
  ctx.save();ctx.globalAlpha=.3;for(const dx of [-25,25])drawAlien(ctx,{...e.owner,x:e.owner.x+dx},time);ctx.restore();
 }
};
