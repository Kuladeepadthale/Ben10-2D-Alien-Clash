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

