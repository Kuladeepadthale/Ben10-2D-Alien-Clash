'use strict';
// Species presentation follows simulation state; it never awards damage or changes facing.
const speciesAlienBase=drawAlien,speciesEffectBase=drawEffect,speciesShotBase=drawShot,speciesEmitterBase=drawnAlienEmitter;
const speciesClamp=x=>Math.max(0,Math.min(1,x));
CARTOON_GAITS[4]={...CARTOON_GAITS[4],style:'Steady four-paw trot',stride:1.62};
CARTOON_GAITS[15]={...CARTOON_GAITS[15],style:'Short Gourmand waddle',stride:.9};
CARTOON_GAITS[20]={...CARTOON_GAITS[20],style:'Heavy short-leg waddle',stride:.78};
function speciesBellyDrive(f,v=f.cast){
 if(f.id!==60||Number.isInteger(f.villain)||v?.key!=='skill1'||!CEL_DATA.characters[60].requestedRepair124)return 0;
 const wind=Math.max(.001,v.cfg.windup),age=v.elapsed-wind,reach=Math.max(0,((v.targetX??f.x+170)-(v.startX??f.x))*(v.dir||f.dir||1)-100),drive=Math.min(55,reach);
 if(age<0){const u=v.elapsed/wind;if(u<.65)return-8*Math.sin(u/.65*Math.PI);const p=speciesClamp((u-.65)/.35);return drive*p*p*(3-2*p);}
 return drive*(1-speciesClamp((age-.08)/Math.max(.001,v.cfg.recovery)));
}
drawnAlienEmitter=function(f,v){const p=speciesEmitterBase(f,v);if(p){const d=speciesBellyDrive(f,v);if(d)return{x:p.x+(v.dir||f.dir||1)*d,y:p.y};}return p;};
function speciesTongueState(f,v=f.cast){
 if(f.id!==15||Number.isInteger(f.villain)||v?.key!=='skill2')return null;
 const wind=Math.max(.001,v.cfg.windup),age=v.elapsed-wind;
 const extension=age<0?speciesClamp((v.elapsed/wind-.45)/.55):age<.055?1:1-speciesClamp((age-.055)/Math.max(.001,(v.cfg.duration||.2)+v.cfg.recovery-.055));
 const start=drawnAlienEmitter(f,v),dir=v.dir||f.dir||1,rawX=v.targetX??f.x+dir*v.cfg.range;
 if(!start)return null;
 const distance=Math.max(0,Math.min(v.cfg.range,(rawX-start.x)*dir)),endY=v.targetY??start.y;
 return{start,tip:{x:start.x+dir*distance*extension,y:start.y+(endY-start.y)*extension},extension,dir,distance};
}
function drawSpeciesTongues(ctx,f,v,t){
 const s=speciesTongueState(f,v);if(!s||s.extension<=.015)return;
 const dx=s.tip.x-s.start.x,dy=s.tip.y-s.start.y;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 for(let k=3;k>=0;k--){const fan=(k-1.5)*5*s.extension,pts=[];for(let i=0;i<=24;i++){const u=i/24;pts.push([s.start.x+dx*u,s.start.y+dy*u+Math.sin(u*Math.PI)*(fan+Math.sin(t*19+u*5+k)*5*s.extension)+fan*u]);}
  line(ctx,pts,'#762e43',8);line(ctx,pts,k%2?'#eb7990':'#ef8c9b',5.5);const p=pts[pts.length-1];oval(ctx,p[0],p[1],5.5,4.2,'#ee8999','#87374b',1);}
 ctx.restore();
}
function drawPredatorWake(ctx,f,v,t){
 if(Number.isInteger(f.villain)||![4,8].includes(f.id)||!['rush','pounce'].includes(v.cfg.kind))return;
 const age=v.elapsed-v.cfg.windup,duration=Math.max(.42,v.cfg.duration||.08);if(age<0||age>=duration)return;
 const dir=v.dir||f.dir||1,h=body(f).h,p=(age/duration*Math.max(1,v.cfg.ticks||1))%1;
 ctx.save();ctx.globalAlpha=.65;
 if(f.id===8&&v.ultimate){
  for(let k=0;k<2;k++){const pts=[];for(let j=0;j<=40;j++){const u=j/40,a=u*Math.PI*4-time*11+k*Math.PI,r=48+u*24;pts.push([f.x-dir*20+Math.cos(a)*r,f.y-h*(.06+u*.88)+Math.sin(a)*5]);}line(ctx,pts,'#3e9fbc',8);line(ctx,pts,'#7bdfff',4);line(ctx,pts,'#dcfaff',1.4);}
  for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(f.x-dir*(50+k*13),f.y-5);ctx.bezierCurveTo(f.x-dir*(100+k*8),f.y-h*.35,f.x+dir*(22+k*8),f.y-h*.88,f.x-dir*15,f.y-h*(.65+.09*k));ctx.strokeStyle=k%2?'#e3fbff':'#56c8e4';ctx.lineWidth=3.5-k*.65;ctx.stroke();}
  for(let k=0;k<7;k++){const u=(age*2+k/7)%1;oval(ctx,f.x-dir*(25+u*85),f.y-h*(.15+u*.65),2.5*(1-u)+1,1.5,'#c9f4ff',null);}
 }else if(f.id===4){for(let k=0;k<6;k++){const u=(age*3+k/6)%1,x=f.x-dir*(15+u*65),y=f.y-3-Math.sin(u*Math.PI)*27;path(ctx,[[x-3,y],[x,y-5],[x+4,y+1]],'#a88b58',null);}if(v.ultimate&&p>.18&&p<.64){for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(f.x+dir*55,f.y-h*.57,21+k*6,dir>0?-.8:2.3,dir>0?.45:3.55);ctx.strokeStyle=k%2?'#f6ddab':'#db9d4e';ctx.lineWidth=2;ctx.stroke();}}}
 ctx.restore();
}
drawAlien=function(ctx,f,t,portrait=false){
 const v=f.cast;if(!portrait&&v)drawPredatorWake(ctx,f,v,t);
 const drive=!portrait?speciesBellyDrive(f,v):0;
 if(drive){ctx.save();ctx.translate((v.dir||f.dir||1)*drive,0);speciesAlienBase(ctx,f,t,portrait);ctx.restore();}else speciesAlienBase(ctx,f,t,portrait);
 if(!portrait&&v)drawSpeciesTongues(ctx,f,v,t);
};
function speciesRootGeometry(e){
 const age=e.maxLife-e.life,active=age-(e.delay||0),growth=speciesClamp(active/.22),fade=speciesClamp(e.life/.18);
 return{active,growth,height:(e.height||140)*growth*fade,width:e.r||40};
}
function drawRootGrowth(ctx,e){
 const g=speciesRootGeometry(e);ctx.save();ctx.translate(e.x,floor);
 if(g.active<0){ctx.globalAlpha=.18;line(ctx,[[-g.width,2],[-16,-2],[0,3],[16,-2],[g.width,2]],'#86a74e',2);ctx.restore();return;}
 ctx.globalAlpha=speciesClamp(e.life/.15);
 for(let k=-1;k<=1;k++){
  const pts=[];for(let i=0;i<=20;i++){const u=i/20;pts.push([k*g.width*.42+Math.sin(u*4.5+(e.id||0)*.7+k)*g.width*.23*u,-g.height*u]);}
  const shape=[];for(let i=0;i<pts.length;i++){const u=i/(pts.length-1),w=(11*(1-u)+1.5)*(.8+g.growth*.2);shape.push([pts[i][0]-w,pts[i][1]]);}for(let i=pts.length-1;i>=0;i--){const u=i/(pts.length-1),w=11*(1-u)+1.5;shape.push([pts[i][0]+w,pts[i][1]]);}path(ctx,shape,'#4f872d','#284e22',1.6);line(ctx,pts,'#94b84b',1.8);
  for(let j=4;j<19;j+=4){const [x,y]=pts[j],side=(j/4+k)%2?1:-1;path(ctx,[[x,y+4],[x+side*13,y-7],[x+side*4,y-12]],'#bf8e3a','#5b5e27',1);if(j===8||j===16)path(ctx,[[x,y],[x-side*17,y-12],[x-side*13,y-23],[x-side*3,y-11]],'#82b741','#365f28',1);}
 }
 if(e.ultimate&&(e.id||0)%3===0){for(let k=0;k<2;k++){const pts=[];for(let i=0;i<=32;i++){const u=i/32;pts.push([Math.cos(u*Math.PI*5+k*Math.PI+time*1.5)*g.width*.75,-u*g.height*.9]);}line(ctx,pts,'#386827',8);line(ctx,pts,'#9ebd4d',3);}}
 for(let k=0;k<5;k++){const u=speciesClamp(g.active/.35),x=(k-2)*12+Math.sin(k*3)*7,y=-Math.sin(u*Math.PI)*(10+k*3);path(ctx,[[x-5,y+3],[x-2,y-3],[x+5,y]],'#8e7049',null);}
 ctx.restore();
}
function drawBandageRibbon(ctx,pts,width=8){
 line(ctx,pts,'#725a37',width+2);line(ctx,pts,'#dfc994',width);line(ctx,pts,'#f5e7bc',Math.max(1,width*.22));
 for(let j=3;j<pts.length-1;j+=4){const a=pts[j-1],b=pts[j+1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,p=pts[j];line(ctx,[[p[0]-dy/len*width*.4,p[1]+dx/len*width*.4],[p[0]+dy/len*width*.4,p[1]-dx/len*width*.4]],'#ad9363',1);}
}
function drawBindingFlight(ctx,e){
 const active=e.owner.cast?.id===e.castId,source=active?drawnAlienEmitter(e.owner,e.owner.cast):{x:e.x-(e.dir||1)*Math.min(110,e.travel||0),y:e.y+Math.sin(time*7)*9};
 ctx.save();ctx.globalAlpha=speciesClamp(e.life*10);
 const count=e.ultimate?3:2,dx=e.x-source.x,dy=e.y-source.y;
 for(let k=0;k<count;k++){const pts=[];for(let j=0;j<=30;j++){const u=j/30;pts.push([source.x+dx*u,source.y+dy*u+Math.sin(u*Math.PI)*(Math.sin(u*7-time*14+k*2)*14+(k-(count-1)/2)*13)]);}drawBandageRibbon(ctx,pts,e.ultimate?7:6);}
 const rx=Math.max(12,Math.min(35,(e.r||40)*.4)),ry=Math.max(24,Math.min(70,e.r||40)),pts=[];for(let j=0;j<=32;j++){const a=j/32*Math.PI*2+time*4;pts.push([e.x+Math.cos(a)*rx,e.y+Math.sin(a)*ry]);}drawBandageRibbon(ctx,pts,6);ctx.restore();
}
function drawBindingCoils(ctx,e){
 const victim=[typeof player!=='undefined'?player:null,typeof enemy!=='undefined'?enemy:null].find(f=>f?.uid===e.targetUid);
 const x=victim?.x??e.x,y=victim?.y??e.y,h=e.bodyHeight||150,w=Math.max(26,(e.bodyWidth||55)*.6+8),age=e.maxLife-e.life,count=e.ultimate?7:5,reveal=speciesClamp(age/.24)*count;
 ctx.save();ctx.globalAlpha=speciesClamp(e.life/.18)*.86;
 for(let k=0;k<count;k++){const portion=speciesClamp(reveal-k);if(!portion)continue;const cy=y-h*.15-k*h*(e.ultimate?.115:.11),coilWidth=w*(e.ultimate?1-k/(count-1)*.48:1),pts=[];for(let j=0;j<=30;j++){const a=j/30*Math.PI*2*portion;pts.push([x+Math.cos(a)*coilWidth,cy+Math.sin(a)*8-a/(Math.PI*2)*h*.035]);}drawBandageRibbon(ctx,pts,e.ultimate?8:6);}
 if(e.ultimate&&reveal>count*.7){for(const side of [-1,1]){const pts=[];for(let j=0;j<=20;j++){const u=j/20;pts.push([x+side*w*(.7-u),y-h*(.22+u*.6)]);}drawBandageRibbon(ctx,pts,6);}}
 ctx.restore();
}
drawShot=function(ctx,e){if(e.owner?.id===13&&!Number.isInteger(e.owner.villain)&&['skill1','ultimate'].includes(e.artKey)){drawBindingFlight(ctx,e);return;}speciesShotBase(ctx,e);};
drawEffect=function(ctx,e){
 if(e.tongueStrike)return;
 if(e.owner?.id===11&&!Number.isInteger(e.owner.villain)&&e.kind==='spike'){drawRootGrowth(ctx,e);return;}
 if(e.kind==='bandage-wrap'){drawBindingCoils(ctx,e);return;}
 speciesEffectBase(ctx,e);
};

// v12.5: native mechanic, shell and reptile actions; procedural effects stay separate.
CARTOON_GAITS[1]={...CARTOON_GAITS[1],style:'Heavy alternating four-arm walk',stride:1.3};
CARTOON_GAITS[10]={...CARTOON_GAITS[10],style:'Uncurled armored waddle',stride:.95};
CARTOON_GAITS[19]={...CARTOON_GAITS[19],style:'Low four-paw reptile crawl',stride:1.7};
function drawScrapGear(ctx,x,y,r,angle=0,closed=false){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);const pts=[];for(let k=0;k<48;k++){const a=k/48*Math.PI*2,rr=k%4<2?r:r*.78;pts.push([Math.cos(a)*rr,Math.sin(a)*rr*.42]);}path(ctx,pts,'#727b7b','#242b30',2);oval(ctx,0,0,r*.44,r*.18,'#394445','#a8b5b3',1.5);oval(ctx,0,-2,r*.16,r*.08,closed?'#ffb74e':'#94e05a','#29332d',1.5);
 for(const side of [-1,1]){const lift=closed?r*.9:r*.16;path(ctx,[[side*r*.75,-2],[side*r*.58,-lift],[side*r*.23,-lift*.87],[side*r*.35,-2]],'#a1aaa4','#303c3c',2);}ctx.restore();
}
function gearTrapPresentation(e){
 const age=e.maxLife-e.life,flight=Math.max(.001,e.delay||.45),p=speciesClamp(age/flight),startX=e.deployX??e.x,startY=e.deployY??floor-30;
 return{x:startX+(e.x-startX)*p,y:startY+(floor-10-startY)*p-Math.sin(p*Math.PI)*55,progress:p,armed:p>=1};
}
function drawGearTrap(ctx,e){const s=gearTrapPresentation(e);ctx.save();ctx.globalAlpha=speciesClamp(e.life/.12);drawScrapGear(ctx,s.x,s.y,Math.min(48,e.r*.48),s.armed?Math.sin(time*5)*.025:s.progress*Math.PI*2,e.hit);if(s.armed){for(let k=0;k<3;k++){const x=s.x+(k-1)*19;oval(ctx,x,s.y-2,2,1.2,(Math.floor(time*7)+k)%3===0?'#d8ff99':'#52734b',null);}}ctx.restore();}
function drawScrapRocket(ctx,e){
 ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(e.vy||0,e.vx||e.dir||1));path(ctx,[[-20,-8],[10,-8],[20,0],[10,8],[-20,8]],'#8e9995','#263435',2);line(ctx,[[-6,-7],[-6,7]],'#c4cebc',2);path(ctx,[[-17,-7],[-25,-14],[-24,-2]],'#6a756f','#263435',1.5);path(ctx,[[-17,7],[-25,14],[-24,2]],'#6a756f','#263435',1.5);oval(ctx,6,0,4,3,'#9acf66','#32432e',1);ctx.restore();
}
function drawFreezeGust(ctx,e){
 const dir=e.dir||Math.sign(e.vx)||1,owner=e.owner,v=owner.cast,source=v&&v.id===e.castId&&v.elapsed>=v.cfg.windup&&v.elapsed<v.cfg.windup+(v.cfg.castDuration??(v.cfg.duration||.08))?drawnAlienEmitter(owner,v):null,tail=source&&Math.abs(e.x-source.x)<550?source:{x:e.x-dir*95,y:e.y},dx=e.x-tail.x,dy=e.y-tail.y;
 ctx.save();ctx.globalAlpha=speciesClamp(e.life*7)*.72;
 const length=Math.hypot(dx,dy),count=Math.max(8,Math.min(28,Math.ceil(length/15)));for(let k=0;k<count;k++){const u=k/(count-1),x=tail.x+dx*u,y=tail.y+dy*u,w=3+u*Math.min(30,e.r*.38);line(ctx,[[x-dir*12,y+Math.sin(time*17+k)*w*.4],[x+dir*9,y+Math.sin(time*17+k+1)*w*.4]],k%3?'#bceeff':'#ecfcff',2+u*3);if(k%3===0){const cy=y+Math.sin(k*3.4+time*6)*w;line(ctx,[[x-3,cy],[x+3,cy]],'#e5fcff',1.2);line(ctx,[[x,cy-3],[x,cy+3]],'#e5fcff',1.2);}}
 for(let k=0;k<5;k++){const y=e.y+(k-2)*Math.min(11,e.r*.13),x=e.x+Math.sin(time*9+k)*9;path(ctx,[[x-11*dir,y+3],[x+7*dir,y-5],[x+13*dir,y],[x,y+5]],k%2?'#c5f4ff':'#82cde5','#e2faff',1);}ctx.restore();
}
function drawGlacialFront(ctx,e){
 const dir=e.dir||1;ctx.save();ctx.translate(e.x,floor);for(let k=0;k<5;k++){const x=-dir*k*14,h=20+(4-k)*8;path(ctx,[[x-15,0],[x-8,-h*.7],[x+2,-h],[x+13,-h*.25],[x+17,0]],k%2?'#91dcf0':'#c6f5ff','#edfaff',1.5);line(ctx,[[x+2,-h+4],[x+1,-3]],'#6dbcd9',1);}ctx.restore();
}
const species125ShotBase=drawShot,species125EffectBase=drawEffect,species125ChargeBase=typeof drawPowerCharge==='function'?drawPowerCharge:()=>{};
drawShot=function(ctx,e){
 if(!Number.isInteger(e.owner?.villain)&&e.owner?.id===44&&e.scrapRocket){drawScrapRocket(ctx,e);return;}
 if(!Number.isInteger(e.owner?.villain)&&e.owner?.id===19&&e.kind==='wave'&&e.artKey==='ultimate'){drawFreezeGust(ctx,e);return;}
 if(!Number.isInteger(e.owner?.villain)&&e.owner?.id===19&&e.kind==='ground'&&e.artKey==='skill2'){drawGlacialFront(ctx,e);return;}
 species125ShotBase(ctx,e);
};
drawEffect=function(ctx,e){
 if(!Number.isInteger(e.owner?.villain)&&e.owner?.id===44){
  if(e.kind==='trap'){drawGearTrap(ctx,e);return;}
  if(e.kind==='explosion'){ctx.save();ctx.globalAlpha=speciesClamp(e.life/.2);for(let k=0;k<6;k++){const p=1-e.life/e.maxLife,a=k*Math.PI/3,r=p*(e.r||60);drawScrapGear(ctx,e.x+Math.cos(a)*r,e.y+Math.sin(a)*r*.6-12,7*(1-p)+3,a+time*8);}ctx.restore();return;}
 }
 species125EffectBase(ctx,e);
};
drawPowerCharge=function(ctx,f,v){
 if(!Number.isInteger(f.villain)&&f.id===44){
  // Assembly is drawn by native gloves and hardware; no unrelated magical charge orb.
  if(v.elapsed<v.cfg.windup&&v.ultimate){const p=drawnAlienEmitter(f,v);if(p){ctx.save();ctx.globalAlpha=.7;for(let k=0;k<3;k++){const a=time*15+k*2,r=7+Math.sin(time*11+k)*3;line(ctx,[[p.x+Math.cos(a)*r,p.y+Math.sin(a)*r],[p.x+Math.cos(a)*(r+4),p.y+Math.sin(a)*(r+4)]],'#efcd78',1.4);}ctx.restore();}}return;
 }
 species125ChargeBase(ctx,f,v);
};
