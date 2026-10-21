'use strict';
// Visuals use the same projectiles and damage budgets as local and ranked combat.
const next20ShotBase=drawShot,next20EffectBase=drawEffect;
drawShot=function(ctx,s){
 const id=s.owner?.id;if(id===undefined||id<32){next20ShotBase(ctx,s);return;}
 if(id===35){
  ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.atan2(s.vy,s.vx));
  for(let i=0;i<3;i++){const r=s.r*(1-i*.22);oval(ctx,-i*9,0,r*1.5,r,'#4dbfff','#d3faff',2);}
  line(ctx,[[-s.r*2,0],[s.r,0]],'#edffff',3);ctx.restore();return;
 }
 if([33,38,43,48].includes(id)){
  ctx.save();ctx.translate(s.x,s.y);const color=({33:'#ffe880',38:'#d6f4dd',43:'#a9ff7c',48:'#ffb174'})[id];
  for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(0,0,s.r*(.45+k*.2),s.r*(.75+k*.2),time*(k%2?-2:2),0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();}
  if(id===33)for(let k=0;k<3;k++){const a=time*5+k*Math.PI*2/3;ctx.save();ctx.translate(Math.cos(a)*s.r,Math.sin(a)*s.r);ctx.rotate(a);ctx.fillStyle='#b1becb';ctx.fillRect(-4,-5,8,10);ctx.restore();}
  ctx.restore();return;
 }
 if(id===47){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(time*7);for(const [i,c]of ['#f05f4d','#ffc957','#4d9de3'].entries()){ctx.fillStyle=c;ctx.fillRect((i-1)*10-6,-7,12,14);ctx.strokeStyle='#243b49';ctx.strokeRect((i-1)*10-6,-7,12,14);}ctx.restore();return;}
 next20ShotBase(ctx,s);
};
drawEffect=function(ctx,e){
 const id=e.owner?.id;if(id===undefined||id<32){next20EffectBase(ctx,e);return;}
 if(e.kind==='beam'&&[35,43].includes(id)){
  ctx.save();ctx.globalAlpha=Math.max(0,e.life/e.maxLife);const end=e.x+e.dir*e.length,ey=e.endY??e.y;
  const color=id===35?'#50c7ff':'#8ffa69';line(ctx,[[e.x,e.y],[end,ey]],color,e.r*1.4);line(ctx,[[e.x,e.y],[end,ey]],id===35?'#defbff':'#eaffbf',e.r*.42);
  for(let i=0;i<7;i++){const u=(i/7+time*.7)%1,x=e.x+(end-e.x)*u,y=e.y+(ey-e.y)*u;ctx.beginPath();ctx.ellipse(x,y,5,e.r*.8,0,0,Math.PI*2);ctx.strokeStyle=id===35?'#b6f0ff':'#d6ffb2';ctx.lineWidth=2;ctx.stroke();}
  ctx.restore();return;
 }
 if(e.kind==='vortex'&&[33,38,43,48].includes(id)){
  ctx.save();ctx.globalAlpha=Math.max(0,e.life/e.maxLife)*.7;const color=aliens[id].light;
  for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(e.x,e.y,e.r*(.25+i*.16),25+i*12,time*3+i*.5,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();}ctx.restore();return;
 }
 next20EffectBase(ctx,e);
};
