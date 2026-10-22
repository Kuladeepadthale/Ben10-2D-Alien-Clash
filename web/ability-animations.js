'use strict';
// Battle powers use changing geometry, never the ability button artwork.
// The simulation alone owns movement, collision and damage.
const animatedShotBase=drawShot,animatedEffectBase=drawEffect;
function animatedPowerStyle(e){
 const f=e.owner||{},reviewed=typeof powerProfileFor==='function'?powerProfileFor(f,e.artKey||e.name):null;if(reviewed)return {...reviewed,id:f.id};const a=f.config||aliens[f.id]||{},map={frost:'ice',vine:'plant',pulse:'gadget',cosmic:'energy',phase:'energy',clone:'physical',slam:'physical',shell:'physical',dash:'wind',slime:'goo',digest:'plasma',beam:'tech'};
 const villain=Number.isInteger(f.villain),theme=a.effectTheme||(villain?map[a.type]||a.type:powerTheme(f.id,e.name))||'energy';
 return {theme,color:villain?a.light||e.color:f.id===51?'#91ff45':f.id===70?'#70d5ff':powerColor(f.id,a.light||e.color),id:f.id};
}
function powerBlob(ctx,x,y,rx,ry,color,phase){
 ctx.beginPath();for(let i=0;i<=24;i++){const a=i*Math.PI/12,k=1+.08*Math.sin(a*5+phase)+.04*Math.sin(a*9-phase*1.3),px=x+Math.cos(a)*rx*k,py=y+Math.sin(a)*ry*k;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fillStyle=color;ctx.fill();
}
function powerFlame(ctx,length,width,color,phase){
 // One connected silhouette with flowing tongues, rather than tiled pictures.
 const blue=color==='#70d5ff',colors=blue?['#268be5','#69ceff','#e4fbff']:['#f25a19','#ffb82e','#fff2af'];
 for(let k=0;k<3;k++){const w=width*(1-k*.27),len=length*(1-k*.055),points=[[0,0]];
  for(let i=1;i<=24;i++){const u=i/24;points.push([u*len,-w*Math.sin(Math.PI*u)**.48*(1+.19*Math.sin(u*31-phase)+.1*Math.sin(u*63+phase*.7))]);}
  for(let i=24;i>=1;i--){const u=i/24;points.push([u*len,w*Math.sin(Math.PI*u)**.48*(1+.17*Math.sin(u*34-phase+2))]);}
  path(ctx,points,colors[k],null);
 }
}
function powerBolt(ctx,len,width,color,phase){
 const points=[];for(let i=0;i<=20;i++)points.push([len*i/20,i===0||i===20?0:Math.sin(i*2.7+phase)*width*(.35+.2*Math.sin(i+phase))]);
 line(ctx,points,color,Math.max(3,width*.35));line(ctx,points,'#f1ffff',Math.max(1.5,width*.1));
 for(let k=0;k<3;k++){const u=.2+k*.25,x=len*u,y=points[Math.round(u*20)][1],sgn=k%2?1:-1;line(ctx,[[x,y],[x+len*.035,y+sgn*width*.65],[x-len*.02,y+sgn*width]],color,2);}
}
function animatedPowerHead(ctx,e,style){
 const {theme,color,id}=style,r=e.r||18,phase=time*24+(e.id||0)*.7;
 if(theme==='fire'){ctx.save();ctx.translate(-r*1.5,0);powerFlame(ctx,r*2.6,r*.8,color,phase);ctx.restore();}
 else if(theme==='electric'){ctx.save();ctx.translate(-r,0);powerBolt(ctx,r*2,r*.7,color,phase);ctx.restore();powerRing(ctx,0,0,r*.7,r*.7,color,2);}
 else if(theme==='ice'||theme==='crystal'){
  path(ctx,[[-r*1.2,-r*.3],[r*.2,-r*.65],[r*1.3,0],[r*.15,r*.65],[-r*1.2,r*.3]],theme==='ice'?'#9cddf7':'#65cbaa','#efffff',2);
  path(ctx,[[-r*.9,0],[r*.2,-r*.65],[r*1.3,0]],'#d9ffff',null);line(ctx,[[-r*.9,0],[r*1.3,0]],'#f4ffff',1.5);
 }else if(theme==='sonic'||theme==='wind'){
  for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(-k*r*.35,0,r*(.2+k*.07),r*(.62+k*.16),0,-1.5,1.5);ctx.strokeStyle=k===1?'#f1ffff':color;ctx.lineWidth=2.2;ctx.stroke();}
  if(id===69){oval(ctx,0,0,r*.46,r*.7,'#387cb4','#dbf8ff',2);oval(ctx,0,0,r*.2,r*.35,'#e6ffff',null);}
 }else if(theme==='water'){
  powerBlob(ctx,0,0,r*1.25,r*.65,'#36b9f3',phase);powerBlob(ctx,r*.2,-r*.12,r*.8,r*.35,'#b6f4ff',phase+1);
  for(let i=0;i<4;i++){const u=(time*2+i/4)%1;oval(ctx,-r*(.7+u),Math.sin(phase+i)*r*.4,r*.13,r*.08,'#9ce9ff',null);}
 }else if(theme==='web'){
  for(let k=0;k<6;k++){const a=k*Math.PI/3;line(ctx,[[0,0],[Math.cos(a)*r,Math.sin(a)*r]],'#edfaff',1.7);}
  for(const scale of [.4,.8]){const pts=[];for(let k=0;k<=6;k++)pts.push([Math.cos(k*Math.PI/3)*r*scale,Math.sin(k*Math.PI/3)*r*scale]);line(ctx,pts,'#edfaff',1.5);}
 }else if(theme==='bandage'||theme==='plant'){
  const pts=[];for(let i=0;i<=18;i++){const u=i/18;pts.push([r*(u*2.4-1.2),Math.sin(u*8-phase)*r*.3]);}line(ctx,pts,theme==='plant'?'#396c38':'#b7ab80',8);line(ctx,pts,theme==='plant'?'#9de461':'#f2e2b0',3);
 }else if(theme==='gadget'||theme==='blocks'){
  if(id===67){path(ctx,[[-r,-r*.42],[r*.4,-r*.42],[r,0],[r*.4,r*.42],[-r,r*.42]],'#8a9d65','#dce9be',2);path(ctx,[[-r*.7,-r*.35],[-r*1.2,-r*.8],[-r*.2,-r*.4]],'#405647',null);ctx.save();ctx.translate(-r*2,0);powerFlame(ctx,r,r*.3,'#ffb82e',phase);ctx.restore();}
  else{ctx.save();ctx.rotate(time*3);path(ctx,[[-r*.65,-r*.6],[r*.65,-r*.6],[r*.65,r*.6],[-r*.65,r*.6]],'#536870',color,2);oval(ctx,0,0,r*.25,r*.25,color,null);ctx.restore();}
 }else if(theme==='gravity'||theme==='time'){
  oval(ctx,0,0,r*.4,r*.4,'#263f46',null);for(let i=0;i<3;i++)powerRing(ctx,0,0,r*(.5+i*.2),r*(.7+i*.15),color,2,time*(i%2?-2:2)+i);
 }else if(theme==='physical'){
  path(ctx,[[-r*.8,-r*.45],[r*.2,-r*.7],[r*.8,-r*.1],[r*.4,r*.6],[-r*.6,r*.5]],'#839181','#d4dfb9',2);
 }else{
  const goo=theme==='goo'||theme==='plasma';powerBlob(ctx,0,0,r,r*(goo?.78:.64),color,phase);powerBlob(ctx,r*.12,-r*.13,r*.62,r*.37,goo?'#e5ffb5':'#edffff',phase+1);
  if(!goo)for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(-r*.35,0,r*(.3+i*.12),r*(.7+i*.08),0,-1.4,1.4);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();}
 }
}
drawShot=function(ctx,e){
 if(!e.owner){animatedShotBase(ctx,e);return;}
 const style=animatedPowerStyle(e),r=Math.min(e.kind==='wave'?65:32,e.r||18);
 ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,e.life*12));ctx.translate(e.x,e.y);
 if(e.kind==='ground'){
  ctx.scale(e.dir||1,1);for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(-i*12,15,r*(.45+i*.15),r*(.7+i*.12),0,Math.PI,Math.PI*1.8);ctx.strokeStyle=i%2?'#e9f9dc':style.color;ctx.lineWidth=4-i;ctx.stroke();}ctx.restore();return;
 }
 ctx.rotate(Math.atan2(e.vy||0,e.vx||0));
 // Short wake local to the projectile; no opaque line back to the player.
 const age=Math.max(0,e.maxLife-e.life),wake=Math.min(r*1.5,Math.hypot(e.vx,e.vy)*age*.45);
 if(wake>3&&!['web','gadget','physical'].includes(style.theme)){
  const grad=ctx.createLinearGradient(-wake-r*.7,0,-r*.3,0);grad.addColorStop(0,'#ffffff00');grad.addColorStop(1,style.color);ctx.globalAlpha*=.25;path(ctx,[[-wake-r*.7,0],[-r*.3,-r*.22],[0,0],[-r*.3,r*.22]],grad,null);ctx.globalAlpha=Math.max(0,Math.min(1,e.life*12));
 }
 animatedPowerHead(ctx,{...e,r},style);ctx.restore();
};
function animatedBeam(ctx,e,style){
 // Multiple damage ticks form a single stream, independently for each combatant.
 if(typeof effects!=='undefined'&&effects.some(v=>v!==e&&v.kind==='beam'&&v.owner===e.owner&&v.castId===e.castId&&v.name===e.name&&v.life>0&&(v.id||0)>(e.id||0)))return;
 const v=e.owner?.cast;let x=e.x,y=e.y;
 if(v&&(e.castId===undefined?v.cfg.name===e.name:v.id===e.castId)){const p=drawnAlienEmitter(e.owner,v);if(p){x=p.x;y=p.y;}}
 const dir=e.rayDir||e.dir||1,endpoint=e.hit&&Number.isFinite(e.impactX)?e.impactX:e.x+dir*e.length,endY=e.hit&&Number.isFinite(e.impactY)?e.impactY:(e.endY??e.y),len=Math.hypot(endpoint-x,endY-y);
 if((endpoint-x)*dir<=0||len<=0)return;
 ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(endY-y,endpoint-x));ctx.globalAlpha=Math.min(1,e.life*24);
 const width=Math.min(34,e.r||18),phase=time*32+(e.castId||0),theme=style.theme,col=style.color;
 if(style.twin){for(const side of [-1,1]){const origin=side*2.2;line(ctx,[[0,origin],[Math.min(45,len*.25),side*.9],[len,0]],col,3.8+Math.sin(time*42)*.6);line(ctx,[[0,origin],[len,0]],'#f3ffda',1.3);}}
 else if(theme==='fire')powerFlame(ctx,len,width,col,phase);
 else if(theme==='electric')powerBolt(ctx,len,width,col,phase);
 else if(theme==='prism'){for(const [i,c]of ['#ff758c','#ffd46b','#7affb3','#7bdcff','#c691ff'].entries())line(ctx,[[0,0],[len,(i-2)*width*.24]],c,Math.max(2,width*(.17+.025*Math.sin(time*36+i))));}
 else if(theme==='sonic'||theme==='wind'||theme==='time'){
  for(let i=0;i<10;i++){const u=(i/10+time*1.5)%1;ctx.beginPath();ctx.ellipse(u*len,0,Math.max(2,width*.18),width*(.35+u*.65),0,-1.5,1.5);ctx.strokeStyle=i%2?'#ecffff':col;ctx.lineWidth=2;ctx.stroke();}
 }else{
  const grad=ctx.createLinearGradient(0,-width,0,width);grad.addColorStop(0,col+'00');grad.addColorStop(.35,col);grad.addColorStop(.5,'#efffff');grad.addColorStop(.65,col);grad.addColorStop(1,col+'00');
  const pts=[[0,0]];for(let i=1;i<=28;i++){const u=i/28;pts.push([len*u,-width*(.25+.4*Math.sin(Math.PI*u))*(1+.12*Math.sin(i-phase))]);}for(let i=28;i>=1;i--){const u=i/28;pts.push([len*u,width*(.25+.4*Math.sin(Math.PI*u))*(1+.12*Math.sin(i+phase))]);}path(ctx,pts,grad,null);
  for(let k=0;k<3;k++){const pts=[];for(let i=0;i<=20;i++){const u=i/20;pts.push([len*u,Math.sin(u*20-phase+k)*width*.2*Math.sin(Math.PI*u)]);}line(ctx,pts,k%2?col:'#ecffff',1.5);}
  if(theme==='ice'||theme==='water')for(let i=0;i<8;i++){const u=(i/8+time*.9)%1;oval(ctx,len*u,Math.sin(phase+i)*width*.5,3,1.5,'#d9fbff',null);}
 }
 oval(ctx,0,0,Math.min(7,width*.3),Math.min(7,width*.3),'#f5ffff',null);
 if(e.hit)for(let i=0;i<5;i++){const a=i*1.25+time*7;line(ctx,[[len,0],[len+Math.cos(a)*width*.6,Math.sin(a)*width*.6]],col,2);}
 ctx.restore();
}
drawEffect=function(ctx,e){
 if(!e.owner){animatedEffectBase(ctx,e);return;}
 if(e.kind==='afterimage'){if(e.artKey)return;animatedEffectBase(ctx,e);return;}
 const style=animatedPowerStyle(e),age=e.maxLife-e.life,p=Math.max(0,Math.min(1,age/e.maxLife));
 if(e.kind==='beam'){animatedBeam(ctx,e,style);return;}
 if(['melee','vortex'].includes(e.kind)&&typeof effects!=='undefined'&&effects.some(v=>v!==e&&v.kind===e.kind&&v.owner===e.owner&&v.castId===e.castId&&v.name===e.name&&v.life>0&&(v.id||0)>(e.id||0)))return;
 if(e.artKey==='normal'||e.name==='Normal strike'){animatedEffectBase(ctx,e);return;}
 if(e.kind==='warning'){ctx.save();ctx.globalAlpha=.2;powerRing(ctx,e.x,floor,e.r,6,style.color,2);ctx.restore();return;}
 ctx.save();ctx.globalAlpha=Math.min(1,e.life*10);
 if(e.kind==='melee'){ctx.restore();return;
 }else if(e.kind==='explosion'){
  const r=(e.r||60)*(.35+p*.8);ctx.translate(e.x,Math.min(floor-r*.25,e.y));ctx.globalAlpha*=1-p;
  for(let i=0;i<9;i++){const a=i*2.4,d=r*(.5+p*.2),size=r*(.3-p*.15);powerBlob(ctx,Math.cos(a)*d,Math.sin(a)*d,size,size,style.color,time*25+i);}powerRing(ctx,0,0,r,r*.8,'#eaffd3',2);
 }else if(e.kind==='vortex'){
  ctx.translate(e.x,e.y);for(let i=0;i<7;i++){const u=i/6;ctx.beginPath();ctx.ellipse(Math.sin(time*12+i)*8,55-u*130,(e.r||90)*(.2+u*.45),9+u*7,0,time*9+i,time*9+i+4.8);ctx.strokeStyle=i%2?'#eaffed':style.color;ctx.lineWidth=3;ctx.stroke();}
 }else if(e.kind==='spike'||e.kind==='eruption'){
  const active=age-(e.delay||0);if(active>=0){const h=(e.height||140)*Math.min(1,active/.14),w=e.r||40;ctx.translate(e.x,floor);
   if(style.theme==='fire'){ctx.rotate(-Math.PI/2);powerFlame(ctx,h,w*.5,style.color,time*30);}
   else if(style.theme==='plant'){for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*w*.3,0);ctx.bezierCurveTo(i*w*.3-12,-h*.3,i*w*.3+20,-h*.6,i*w*.3,-h);ctx.strokeStyle='#456d36';ctx.lineWidth=10;ctx.stroke();ctx.strokeStyle=style.color;ctx.lineWidth=4;ctx.stroke();}}
   else for(let i=-1;i<=1;i++){const x=i*w*.5,ht=h*(i?.7:1);path(ctx,[[x-w*.35,0],[x-w*.1,-ht],[x+w*.3,-ht*.4],[x+w*.4,0]],style.color,'#dcfff0',2);}
  }
 }else if(e.kind==='trap'){
  ctx.translate(e.x,floor-8);powerRing(ctx,0,0,e.r||55,8,style.color,2);for(let i=0;i<4;i++){const a=time*2+i*Math.PI/2;oval(ctx,Math.cos(a)*(e.r||55),Math.sin(a)*6,3,3,'#edffcf',null);}
 }else{ctx.restore();animatedEffectBase(ctx,e);return;}
 ctx.restore();
};

// Charge uses the same theme and hand for human, bot and villain combatants.
drawPowerCharge=function(ctx,f,v){
 if(!['projectile','wave','lob','beam','rain'].includes(v.cfg.kind))return;
 const at=drawnAlienEmitter(f,v);if(!at)return;
 const progress=Math.max(0,Math.min(1,v.elapsed/Math.max(.001,v.cfg.windup))),style=animatedPowerStyle({owner:f,name:v.cfg.name});
 if(style.theme==='physical')return;
 ctx.save();ctx.translate(at.x,at.y);ctx.scale(v.dir||f.dir||1,1);ctx.globalAlpha=.2+progress*.6;
 animatedPowerHead(ctx,{id:v.id,r:(v.ultimate?12:8)*(.2+progress*.8)},style);ctx.restore();
};

// One thrown fireball, seed, grenade or glob may use its exact transparent icon.
// Continuous lasers and repeated volleys always use the procedural stream renderer.
const throwArtImages=new Map(),throwArtPending=new Map();
function ensureThrowArt(id){
 const profile=POWER_PROFILES.aliens[id]?.find(p=>p.icon);if(!profile)return Promise.resolve(false);const atlas=profile.icon.atlas;
 if(throwArtImages.has(atlas))return Promise.resolve(true);if(throwArtPending.has(atlas))return throwArtPending.get(atlas);
 const pending=loadClassicImage('assets/ui/abilities/'+atlas).then(image=>{throwArtImages.set(atlas,image);throwArtPending.delete(atlas);const keep=new Set(typeof celPinned!=='undefined'?[...celPinned].map(id=>POWER_PROFILES.aliens[id]?.[0]?.icon?.atlas):[]);for(const key of throwArtImages.keys())if(throwArtImages.size>3&&key!==atlas&&!keep.has(key))throwArtImages.delete(key);return true;},()=>{throwArtPending.delete(atlas);return false;});throwArtPending.set(atlas,pending);return pending;
}
function drawSingleThrow(ctx,e){
 if(!e.singleThrow||!['projectile','lob'].includes(e.kind)||Number.isInteger(e.owner?.villain))return false;
 const profile=powerProfileFor(e.owner,e.artKey||e.name),art=profile?.icon,image=art&&throwArtImages.get(art.atlas);if(!image)return false;
 const [x,y,w,h]=art.rect,scale=Math.min((e.r||18)*2.7/Math.max(1,h),100/Math.max(1,w)),angle=Math.atan2(e.vy||0,e.vx||0);
 ctx.save();ctx.translate(e.x,e.y);ctx.rotate(angle);ctx.globalAlpha=Math.min(1,e.life*12);ctx.imageSmoothingEnabled=true;
 if(e.owner.id===25||e.owner.id===51)ctx.filter='hue-rotate(80deg)';
 ctx.drawImage(image,x,y,w,h,-w*scale*.5,-h*scale*.5,w*scale,h*scale);ctx.restore();return true;
}
const nativeSingleShot=drawShot;drawShot=function(ctx,e){if(drawSingleThrow(ctx,e))return;nativeSingleShot(ctx,e);};
const nativePowerEnsure=celEnsure;celEnsure=function(id){return Promise.all([nativePowerEnsure(id),ensureThrowArt(id)]).then(result=>result[0]);};
ensureThrowArt(0);ensureThrowArt(2);


