'use strict';
// Animated attack art shares the existing casts, swept collision tests and damage budgets.
// Every beam tick uses the active cel's emitter; detached projectiles then travel independently.
const cartoonShotBase=drawShot,cartoonEffectBase=drawEffect;
function powerTheme(id,name=''){
 if(id===1&&/clap/i.test(name))return'sonic';
 if(id===0||(id===22&&/fire|wildfire/i.test(name)))return'fire';
 if([19,26].includes(id))return'ice';
 if(id===35)return'water';
 if([14,21,28,34,36,45,46].includes(id))return'electric';
 if([12,23].includes(id))return'sonic';
 if(id===2)return'crystal';
 if(id===29)return'web';
 if([7,20,30,50].includes(id))return'goo';
 if(id===15||id===42)return'plasma';
 if(id===11||id===22)return'plant';
 if(id===13)return'bandage';
 if(id===38)return'wind';
 if(id===43)return'time';
 if(id===33||id===48)return'gravity';
 if(id===5||id===44)return'gadget';
 if(id===47)return'blocks';
 if(id===6)return'tech';
 if(id===25)return'neuro';
 if([9,17,18,27,31,39,51].includes(id))return'energy';
 return'physical';
}
function powerColor(id,fallback){return ({0:'#ff982b',7:'#a4c94b',12:'#c4f1ff',14:'#a5e8ff',15:'#aaff45',19:'#b5efff',20:'#bfd478',21:'#c8ff69',22:'#ff9b38',23:'#d7f8ff',25:'#6cff8a',26:'#b9f3ff',28:'#aeeaff',29:'#e4f4ff',30:'#b7ec47',31:'#d9e8ff',34:'#aaff84',35:'#6bdcff',36:'#9deaff',38:'#d7f4e2',39:'#ceff78',42:'#b8ff67',43:'#b3ff83',45:'#ffe975',46:'#fff28d',48:'#ffad70',50:'#aaff61',51:'#ffbc69'})[id]||fallback||'#e7ffbd';}
function powerRing(ctx,x,y,rx,ry,color,width=3,angle=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,angle,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function powerEmitterTrail(ctx,s,color){
 if(s.kind==='rain'||s.kind==='ground'||!Number.isFinite(s.emitterX)||(s.maxLife-s.life)>.09)return;
 if(Math.hypot(s.x-s.emitterX,s.y-s.emitterY)>5)line(ctx,[[s.emitterX,s.emitterY],[s.x,s.y]],color,Math.max(2,s.r*.42));
}
drawShot=function(ctx,s){
 const id=s.owner?.id;if(id===undefined){cartoonShotBase(ctx,s);return;}
 const theme=powerTheme(id,s.name),color=powerColor(id,s.color);
 if(s.kind==='ground'&&!['electric','ice','water'].includes(theme)){
  ctx.save();ctx.translate(s.x,s.y);for(let i=0;i<3;i++){const x=(i-1)*15;path(ctx,[[x-11,8],[x-5,-6-i*4],[x+6,-2-i*5],[x+12,8]],'#7c8871','#d6dfbe',2);}line(ctx,[[-33,10],[-17,3],[0,8],[18,0],[34,7]],color,3);ctx.restore();return;
 }
 if(['physical','blocks'].includes(theme)){cartoonShotBase(ctx,s);return;}
 ctx.save();powerEmitterTrail(ctx,s,color);ctx.translate(s.x,s.y);ctx.rotate(Math.atan2(s.vy,s.vx));
 const r=s.r||18,phase=time*22;
 if(theme==='fire'){
  for(let i=0;i<5;i++){const y=(i-2)*r*.3,tail=r*(2.3+.4*Math.sin(phase+i));path(ctx,[[-tail,y-r*.35],[-r*.3,y-r*.65],[r*.6,y],[-r*.3,y+r*.65]],i%2?'#ffca43':'#f37321',null);}
  oval(ctx,0,0,r,r*.86,'#ffb12e',null);oval(ctx,r*.16,0,r*.66,r*.55,'#ffe27a',null);oval(ctx,r*.3,-r*.12,r*.32,r*.3,'#fff6c1',null);
 }else if(theme==='electric'){
  const points=[];for(let i=0;i<7;i++)points.push([-r*2.4+i*r*.62,(i===0||i===6)?0:Math.sin(phase+i*3)*r*.6]);line(ctx,points,color,7);line(ctx,points,'#f6ffff',2);
  powerRing(ctx,0,0,r*.7,r*.7,color,2,phase);
 }else if(theme==='ice'||theme==='crystal'){
  path(ctx,[[-r*1.8,-r*.35],[r*.25,-r*.65],[r*1.5,0],[r*.2,r*.65],[-r*1.8,r*.35]],theme==='ice'?'#a9e9ff':'#8adfc3','#ecffff',2);
  line(ctx,[[-r*1.1,0],[r*1.3,0]],'#f2ffff',2);
 }else if(theme==='sonic'||theme==='wind'||theme==='bandage'){
  for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(-k*r*.38,0,r*(.3+k*.12),r*(.75+k*.12),0,-Math.PI*.62,Math.PI*.62);ctx.strokeStyle=theme==='bandage'?'#e2d6a4':color;ctx.lineWidth=theme==='bandage'?6:3;ctx.stroke();}
 }else if(theme==='web'){
  for(let k=0;k<6;k++){const a=k*Math.PI/3;line(ctx,[[0,0],[Math.cos(a)*r,Math.sin(a)*r]],'#eaf6ff',2);}
  for(const scale of [.45,.85]){const p=[];for(let k=0;k<=6;k++){const a=k*Math.PI/3;p.push([Math.cos(a)*r*scale,Math.sin(a)*r*scale]);}line(ctx,p,'#eaf6ff',2);}
 }else if(theme==='goo'||theme==='plasma'){
  for(let k=0;k<4;k++){const a=k*Math.PI/2+phase*.1;oval(ctx,Math.cos(a)*r*.48,Math.sin(a)*r*.48,r*.65,r*.58,color,null);}
  oval(ctx,0,0,r*.8,r*.72,color,null);oval(ctx,r*.23,-r*.26,r*.2,r*.17,'#f0ffc5',null);
 }else if(theme==='plant'){
  oval(ctx,0,0,r,r*.8,'#749b39','#c9e985',2);line(ctx,[[-r*.7,0],[r*.7,0]],'#415d27',2);for(let k=-1;k<=1;k++)line(ctx,[[k*r*.5,-r*.7],[k*r*.5+r*.2,r*.65]],'#c9e985',1);
 }else if(theme==='gadget'){
  ctx.rotate(time*5);path(ctx,[[-r*.7,-r*.7],[r*.7,-r*.7],[r*.7,r*.7],[-r*.7,r*.7]],'#637577','#d0e6dc',2);oval(ctx,0,0,r*.3,r*.3,color,null);
 }else if(['gravity','time'].includes(theme)){
  oval(ctx,0,0,r*.45,r*.45,id===48?'#412636':'#47764d',null);for(let k=0;k<3;k++)powerRing(ctx,0,0,r*(.5+k*.22),r*(.8+k*.12),color,2,time*3+k);
 }else{
  oval(ctx,0,0,r,r*.85,color,null);oval(ctx,r*.2,-r*.1,r*.45,r*.4,'#efffff',null);for(let k=0;k<3;k++)line(ctx,[[-r*(1.1+k*.4),-r*.3+k*r*.3],[-r*.6,-r*.3+k*r*.3]],color,2);
 }
 ctx.restore();
};
function cartoonBeam(ctx,e,id,theme){
 let x=e.x,y=e.y;const owner=e.owner;
 if(owner?.cast&&(e.castId!==undefined?owner.cast.id===e.castId:owner.cast.cfg.name===e.name)&&typeof drawnAlienEmitter==='function'){const emitter=drawnAlienEmitter(owner,owner.cast);x=emitter.x;y=emitter.y;}
 let end=e.x+e.dir*e.length,endY=e.endY??e.y;
 if(e.hit&&typeof other==='function'&&typeof body==='function'){const target=other(owner),bounds=body(target);end=target.x;endY=bounds.y+bounds.h*.5;}
 const color=powerColor(id,e.color),dx=end-x,dy=endY-y,len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx),width=e.r||18;
 ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,e.life/e.maxLife));ctx.translate(x,y);ctx.rotate(angle);
 if(['fire','ice','water'].includes(theme)){
  const outer=theme==='fire'?'#f7772b':theme==='ice'?'#7ac9f7':'#3bb9f7',inner=theme==='fire'?'#ffe986':'#dcfbff';
  const gradient=ctx.createLinearGradient(0,0,len,0);gradient.addColorStop(0,inner);gradient.addColorStop(.35,outer);gradient.addColorStop(1,theme==='fire'?'#e64d2477':outer+'99');
  ctx.beginPath();ctx.moveTo(0,0);
  for(let i=1;i<=22;i++){const u=i/22;ctx.lineTo(len*u,-width*(.15+u*.9)*(1+.16*Math.sin(i*2+time*30)));}
  for(let i=22;i>=1;i--){const u=i/22;ctx.lineTo(len*u,width*(.15+u*.9)*(1+.16*Math.sin(i*2-time*27)));}
  ctx.closePath();ctx.fillStyle=gradient;ctx.fill();
  for(let strand=0;strand<5;strand++){const points=[];for(let i=0;i<=18;i++){const u=i/18;points.push([len*u,(strand-2)*width*.16*u+Math.sin(time*25+u*20+strand)*width*.18*u]);}line(ctx,points,strand%2?inner:outer,Math.max(2,width*(.15-strand*.018)));}
  for(let i=0;i<12;i++){const u=(i/12+time*(theme==='fire'?1.2:.8))%1,px=u*len,py=Math.sin(time*24+i*2)*width*u;
   if(theme==='ice')path(ctx,[[px-5,py],[px,py-9],[px+6,py],[px,py+9]],'#e7ffff','#b8ecff',1);
   else if(theme==='water'){oval(ctx,px,py,3+u*4,1+u*2,'#d8fbff',null);powerRing(ctx,px,py,2+u*2,width*(.15+u*.3),'#91e9ff',1);}
   else{ctx.beginPath();ctx.moveTo(px-width*.8,py);ctx.quadraticCurveTo(px+width*.4,py-width*(.7+u*.5),px+width*.8,py-width*.12);ctx.quadraticCurveTo(px+width*.2,py+width*.38,px-width*.8,py);ctx.fillStyle=i%2?'#ffcc55':'#ffe78b';ctx.fill();}
  }
 }else{
  line(ctx,[[0,0],[len,0]],color,width*1.25);line(ctx,[[0,0],[len,0]],'#f0ffff',width*.3);
  if(theme==='electric')for(let branch=0;branch<2;branch++){const p=[];for(let i=0;i<=12;i++)p.push([len*i/12,i===0||i===12?0:Math.sin(time*35+i*2+branch*3)*width*.85]);line(ctx,p,color,3);}
  if(theme==='time')for(let i=1;i<7;i++)powerRing(ctx,len*i/7,0,5,width*.8,'#e0ffb4',2,time+i);
  if(theme==='tech')for(let i=0;i<6;i++){const px=len*((i/6+time*.8)%1);line(ctx,[[px-8,-width*.3],[px,0],[px-8,width*.3]],'#14372d',3);}
  if(id===27)for(const [i,c]of ['#ff9999','#ffe59a','#a9ffc5','#9adfff','#dbaaff'].entries())line(ctx,[[0,(i-2)*3],[len,(i-2)*3]],c,2);
 }
 if(e.hit)for(let i=0;i<7;i++){const a=i*Math.PI*2/7+time*2,dist=width*(.7+Math.sin(time*22+i)*.15);line(ctx,[[len,0],[len+Math.cos(a)*dist,Math.sin(a)*dist]],color,3);}
 oval(ctx,0,0,width*.42,width*.42,theme==='fire'?'#fff1a6':'#efffff',null);ctx.restore();
}
drawEffect=function(ctx,e){
 const id=e.owner?.id;if(id===undefined){cartoonEffectBase(ctx,e);return;}
 const theme=powerTheme(id,e.name);
 if(e.kind==='beam'&&theme!=='physical'){cartoonBeam(ctx,e,id,theme);return;}
 cartoonEffectBase(ctx,e);
};


// Charge builds at the same live cel landmark used for launch, then releases.
function drawPowerCharge(ctx,f,v){
 if(!['projectile','wave','lob','beam','rain'].includes(v.cfg.kind)||typeof drawnAlienEmitter!=='function')return;
 const emitter=drawnAlienEmitter(f,v);if(!emitter)return;
 const theme=powerTheme(f.id,v.cfg.name);if(theme==='physical'||theme==='blocks')return;
 const progress=Math.max(0,Math.min(1,v.elapsed/Math.max(.001,v.cfg.windup))),r=(v.ultimate?19:11)*(.2+progress*.8),color=powerColor(f.id,(f.config||aliens[f.id]).light);
 ctx.save();ctx.translate(emitter.x,emitter.y);ctx.scale(v.dir||f.dir||1,1);ctx.globalAlpha=.25+progress*.65;ctx.shadowColor=color;ctx.shadowBlur=8+progress*10;
 if(theme==='fire'){
  for(let i=0;i<4;i++){const x=(i-1.5)*r*.42,h=r*(1.1+.3*Math.sin(time*22+i));path(ctx,[[x-r*.42,r*.2],[x-r*.2,-h*.45],[x+r*.2,-h],[x+r*.52,-h*.2],[x+r*.44,r*.3]],i%2?'#ff9c2c':'#ffcf51',null);}
  oval(ctx,0,0,r*.5,r*.42,'#fff1a6',null);
 }else if(theme==='electric'){
  for(let i=0;i<4;i++){const a=i*Math.PI/2+time*3,dx=Math.cos(a)*r,dy=Math.sin(a)*r;line(ctx,[[0,0],[dx*.45-dy*.25,dy*.45+dx*.25],[dx,dy]],color,2);}
  oval(ctx,0,0,r*.3,r*.3,'#efffff',null);
 }else if(theme==='ice'||theme==='crystal'){
  for(let i=0;i<3;i++){const x=(i-1)*r*.55;path(ctx,[[x-r*.3,r*.3],[x,-r*(.7+i*.15)],[x+r*.3,r*.3]],color,'#f1ffff',1);}
 }else if(theme==='goo'||theme==='plasma'||theme==='plant'){
  oval(ctx,0,0,r,r*.8,color,null);oval(ctx,-r*.25,-r*.25,r*.22,r*.18,'#f4ffd9',null);
 }else{
  powerRing(ctx,0,0,r,r*.72,color,2,time*2);powerRing(ctx,0,0,r*.55,r*.8,color,1,-time*3);oval(ctx,0,0,r*.25,r*.25,'#efffff',null);
 }
 ctx.restore();
}
