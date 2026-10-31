'use strict';
// Wildmutt: continuous, vector-articulated quadruped. No sprite swapping or body copies.
// Coordinates use one 170-unit reference body in every action, never per-pose bounds.
const WILDMUTT_RIG = Object.freeze({version:1,id:4,height:170,stride:134.375,fore:[78,84],hind:[50,54]});
const wildmuttMotion=new WeakMap(),wildmuttBlend=new WeakMap();
const wildClamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const wildEase=x=>{x=wildClamp(x);return x*x*(3-2*x);};
const wildMix=(a,b,u)=>a+(b-a)*u;
function wildmuttTravel(f){
 const counter=Number.isFinite(f.gaitDistance126)?f.gaitDistance126:null;
 let s=wildmuttMotion.get(f);
 if(!s){s={x:f.x,counter,distance:counter||0};wildmuttMotion.set(f,s);return s.distance;}
 const dx=Math.abs(f.x-s.x);
 if(counter!==null&&s.counter!==null&&counter>=s.counter)s.distance+=counter-s.counter;
 else if(dx<Math.max(80,(f.config?.speed||325)*.3))s.distance+=dx;
 s.x=f.x;s.counter=counter;return s.distance;
}
// Analytic two-bone IK keeps each limb's lengths invariant, including full extension.
function wildmuttIK(root,foot,a,b,bend){
 const dx=foot[0]-root[0],dy=foot[1]-root[1],raw=Math.hypot(dx,dy),d=wildClamp(raw,.001,a+b-.001),ux=raw?dx/raw:0,uy=raw?dy/raw:1;
 const along=(a*a-b*b+d*d)/(2*d),side=Math.sqrt(Math.max(0,a*a-along*along))*bend;
 return {root:[...root],joint:[root[0]+ux*along-uy*side,root[1]+uy*along+ux*side],foot:[root[0]+ux*d,root[1]+uy*d]};
}
function wildmuttFoot(phase,front,running){
 const p=((phase%1)+1)%1,stance=running?.51:.64,stride=running?112:86,base=front?69:-72;
 if(p<stance)return [base+stride*(.5-p/stance),0];
 const u=(p-stance)/(1-stance);
 return [base+stride*(-.5+wildEase(u)),-Math.sin(Math.PI*u)*(running?35:24)];
}
function wildmuttState(f,portrait){
 if(portrait)return'idle';if(f.hp<=0)return'ko';if(f.stun>0)return'hit';
 if(f.dash)return'dash';if(f.block)return'guard';if(f.cast)return f.cast.ultimate?'ultimate':f.cast.key;
 if(f.jumpWindup>0||f.y<floor-2)return'jump';
 return f.moving||(typeof locomotionMoving126==='function'&&locomotionMoving126(f))?'walk':'idle';
}
function wildmuttTarget(f,t,state,distance){
 const v=f.cast,cfg=v?.cfg||{},wind=Math.max(.001,cfg.windup||.25),age=(v?.elapsed||0)-wind;
 const active=['rush','pounce'].includes(cfg.kind)?Math.max(.42,cfg.duration||.08):cfg.duration||.08;
 const prep=v?wildEase((v.elapsed||0)/wind):0,recover=v&&age>=active?1-wildEase((age-active)/Math.max(.001,cfg.recovery||.3)):1;
 const rushing=state==='dash'||v&&age>=0&&age<active&&['rush','pounce'].includes(cfg.kind);
 const run=rushing||Math.abs(f.vx||0)>250;
 const scale=(f.config||aliens[4]).renderHeight*(f.config||aliens[4]).scale/WILDMUTT_RIG.height;
 const phase=distance/(scale*(run?112/.51:WILDMUTT_RIG.stride));
 const p={back:0,front:0,head:0,tilt:0,jaw:.06,lean:0,neck:0,fl:[36,0],fr:[104,-2],hl:[-74,0],hr:[-85,-2],claw:0,clawSide:0,breath:Math.sin(t*2.8)*.75,ko:0};
 if(state==='walk'||rushing){
  p.fl=wildmuttFoot(phase,true,run);p.fl[0]-=33;p.hr=wildmuttFoot(phase,false,run);
  p.fr=wildmuttFoot(phase+.5,true,run);p.fr[0]+=35;p.hl=wildmuttFoot(phase+.5,false,run);
  p.front=Math.sin(phase*Math.PI*4)*2;p.back=Math.sin(phase*Math.PI*4-.5)*2.4;
  p.head=Math.sin(phase*Math.PI*4+.4)*1.3;p.neck=rushing?9:1;p.jaw=rushing?.35:.08;
 }
 if(state==='guard'){p.front=17;p.back=9;p.head=12;p.neck=-8;p.fl=[21,-2];p.fr=[94,-2];p.jaw=.16;}
 if(state==='jump'){
  const tuck=wildEase(Math.max(0,-(f.vy||0))/550),land=wildEase(Math.max(0,f.vy||0)/600);
  p.fl=[wildMix(47,96,land),-25-18*tuck];p.fr=[wildMix(70,75,land),-37-12*tuck];
  p.hl=[-58,-19-19*tuck];p.hr=[-79,-28-10*tuck];p.front=5;p.back=3;p.tilt=wildClamp((f.vy||0)/1000,-.16,.16);p.jaw=.2;
  if(f.jumpWindup>0){p.front=16;p.back=20;p.fl=[36,0];p.fr=[104,-2];p.hl=[-65,0];p.hr=[-86,-2];}
 }
 if(v&&!['hit','ko','guard'].includes(state)){
  if(age<0){p.front=12*prep;p.back=16*prep;p.head=6*prep;p.neck=-10*prep;p.jaw=.15+.38*prep;p.lean=-5*prep;}
  else if(cfg.kind==='melee'||state==='normal'){
   const ticks=Math.max(1,cfg.ticks||1),tickWidth=active/ticks,beat=wildClamp(age,0,active-.00001)/tickWidth;
   const index=Math.floor(beat),u=beat-index;
   // Maximum reach coincides with each simulation hit; the paw then recoils smoothly.
   const strike=age<active?Math.pow(1-wildEase(wildClamp(u/.78)),.7):0;
   const side=state==='normal'?(f.normalChain||0)%2:index%2;
   p.front=-4*strike*recover;p.back=3*strike;p.lean=5*strike;p.neck=9*strike;
   p.claw=strike;p.clawSide=side;
   const paw=[72+74*strike,-8-72*strike];if(side===0)p.fl=paw;else p.fr=paw;
   p.jaw=.15+(state==='normal'&&(f.normalChain||0)===2?.65:.18)*strike;p.head=-2*strike;
  }else if(cfg.kind==='pounce'){
   const u=wildClamp(age/active),landing=wildEase((u-.7)/.3);
   p.fl=[wildMix(111,36,landing),wildMix(-42,0,landing)];p.fr=[wildMix(137,104,landing),wildMix(-53,-2,landing)];
   p.hl=[wildMix(-56,-74,landing),wildMix(-35,0,landing)];p.hr=[wildMix(-76,-85,landing),wildMix(-40,-2,landing)];
   p.front=7*landing;p.back=11*landing;p.neck=12*(1-landing);p.jaw=.65*(1-landing)+.1;
  }else if(cfg.kind==='rush'){
   p.neck=9*recover;p.front+=4*recover;p.head=1;p.jaw=(v.ultimate?.72:.38)*recover;
   if(v.ultimate&&age<active){
    const ticks=Math.max(1,cfg.ticks||5),u=((age/active*ticks)%1),bite=Math.pow(1-wildEase(u),2);
    p.jaw=.16+.7*bite;p.neck+=5*bite;p.claw=.6*bite;p.clawSide=Math.floor(age/active*ticks)%2;
   }
  }
 }
 if(state==='hit'){const recoil=Math.sin(wildClamp((f.stun||0)/.24)*Math.PI*.8);p.lean=-9*recoil;p.head=-5*recoil;p.front=4*recoil;p.jaw=.25;p.fl=[27,0];p.fr=[105,-2];}
 if(state==='ko'){p.ko=1;p.front=32;p.back=28;p.head=23;p.jaw=.14;p.fl=[105,-28];p.fr=[91,-38];p.hl=[-90,-27];p.hr=[-63,-35];}
 return p;
}
function wildmuttPose(f,t,portrait=false){
 const state=wildmuttState(f,portrait),distance=wildmuttTravel(f),target=wildmuttTarget(f,t,state,distance);
 let s=wildmuttBlend.get(f);
 if(!s){s={state,pose:target,time:t,from:target,start:t-.09};wildmuttBlend.set(f,s);}
 if(state!==s.state){s.from=s.pose;s.start=t;s.state=state;}
 const u=wildEase((t-s.start)/.09),p={};
 for(const k of Object.keys(target))p[k]=Array.isArray(target[k])?target[k].map((n,i)=>wildMix(s.from[k][i],n,u)):wildMix(s.from[k],target[k],u);
 s.pose=p;s.time=t;
 const y=p.breath;
 const foreRoot=[-24+p.lean,-112+p.front+y],hindRoot=[-65+p.lean,-78+p.back+y];
 p.limbs={fr:wildmuttIK([foreRoot[0]+55,foreRoot[1]+8],p.fr,...WILDMUTT_RIG.fore,-1),hr:wildmuttIK([hindRoot[0]+9,hindRoot[1]+2],p.hr,...WILDMUTT_RIG.hind,1),hl:wildmuttIK(hindRoot,p.hl,...WILDMUTT_RIG.hind,1),fl:wildmuttIK(foreRoot,p.fl,...WILDMUTT_RIG.fore,-1)};
 p.state=state;return p;
}
function wildmuttShape(c,fill,draw,width=2.2){c.beginPath();draw(c);c.fillStyle=fill;c.fill();if(width){c.strokeStyle='#21180f';c.lineWidth=width;c.stroke();}}
function wildmuttEllipse(c,x,y,rx,ry,fill,angle=0,stroke=true){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle='#21180f';c.lineWidth=1.7;c.stroke();}}
function wildmuttLimb(c,l,front,far){
 const [rx,ry]=l.root,[jx,jy]=l.joint,[fx,fy]=l.foot,skin=far?'#ba641e':'#ff951b',shadow=far?'#8b4a1c':'#cb731f';
 const dx=jx-rx,dy=jy-ry,l1=Math.hypot(dx,dy)||1,ex=fx-jx,ey=fy-8-jy,l2=Math.hypot(ex,ey)||1;
 const n1=[-dy/l1,dx/l1],n2=[-ey/l2,ex/l2],r=front?27:22,m=front?22:15,w=front?13:9;
 // One continuous silhouette across shoulder, elbow and wrist, without cutout seams.
 wildmuttShape(c,skin,p=>{
  p.moveTo(rx+n1[0]*r,ry+n1[1]*r);
  p.bezierCurveTo(rx+dx*.5+n1[0]*r,ry+dy*.5+n1[1]*r,jx+n1[0]*m,jy+n1[1]*m,jx+n2[0]*m,jy+n2[1]*m);
  p.quadraticCurveTo(jx+ex*.5+n2[0]*m,jy+ey*.5+n2[1]*m,fx+n2[0]*w,fy-8+n2[1]*w);
  p.quadraticCurveTo(fx+ex*.12,fy-8+ey*.12,fx-n2[0]*w,fy-8-n2[1]*w);
  p.quadraticCurveTo(jx+ex*.4-n2[0]*m,jy+ey*.4-n2[1]*m,jx-n2[0]*m,jy-n2[1]*m);
  p.bezierCurveTo(jx-n1[0]*m,jy-n1[1]*m,rx+dx*.3-n1[0]*r,ry+dy*.3-n1[1]*r,rx-n1[0]*r,ry-n1[1]*r);
  p.quadraticCurveTo(rx-dx*.16,ry-dy*.16,rx+n1[0]*r,ry+n1[1]*r);
 });
 c.beginPath();c.moveTo(rx-n1[0]*r*.65,ry-n1[1]*r*.65);c.quadraticCurveTo(jx-n1[0]*m*.6,jy-n1[1]*m*.6,fx-n2[0]*w*.65,fy-8-n2[1]*w*.65);c.strokeStyle=shadow;c.lineWidth=front?9:6;c.stroke();

 wildmuttShape(c,skin,p=>{p.moveTo(fx-14,fy-12);p.quadraticCurveTo(fx-2,fy-17,fx+8,fy-8);p.lineTo(fx+25,fy-4);p.quadraticCurveTo(fx+31,fy+1,fx+18,fy+2);p.lineTo(fx-14,fy+2);p.quadraticCurveTo(fx-22,fy-3,fx-14,fy-12);});
 for(let i=0;i<3;i++){const x=fx+6+i*7;wildmuttShape(c,'#56534a',p=>{p.moveTo(x,fy-3);p.quadraticCurveTo(x+5,fy-5,x+10,fy+5);p.quadraticCurveTo(x+2,fy+4,x,fy-3);},1.1);}
 if(front&&!far){for(let i=0;i<3;i++){const u=.25+i*.19,x=rx+(jx-rx)*u,y=ry+(jy-ry)*u;c.beginPath();c.moveTo(x-7,y);c.lineTo(x-14,y-9);c.lineTo(x-8,y+9);c.strokeStyle='#8f501d';c.lineWidth=1.5;c.stroke();}}
}
function drawWildmuttRig(c,f,t,portrait=false){
 const p=wildmuttPose(f,t,portrait),a=f.config||aliens[4],scale=a.renderHeight*a.scale/WILDMUTT_RIG.height;
 const dir=f.dash?.dir||f.cast?.dir||f.dir||1;
 c.save();c.translate(f.x,f.y);c.scale(dir*scale,scale);c.lineJoin='round';c.lineCap='round';
 // The defeated pose lowers the skeleton gradually through the same transition blend.
 c.translate(p.lean,p.ko*5);if(p.tilt)c.rotate(p.tilt);
 wildmuttLimb(c,p.limbs.hr,false,true);wildmuttLimb(c,p.limbs.fr,true,true);
 c.save();c.translate(0,p.breath);
 wildmuttShape(c,'#ff951b',q=>{q.moveTo(-82,-76+p.back);q.bezierCurveTo(-111,-106+p.back,-98,-144+p.back,-61,-153+p.back);q.bezierCurveTo(-36,-165+p.back,3,-156+p.front,31,-140+p.front);q.bezierCurveTo(51,-130+p.front,61,-110+p.front,45,-85+p.front);q.bezierCurveTo(22,-72+p.front,1,-68,-26,-82+p.back);q.quadraticCurveTo(-61,-52+p.back,-82,-76+p.back);});
 wildmuttShape(c,'#cb741f',q=>{q.moveTo(-93,-113+p.back);q.quadraticCurveTo(-57,-133+p.back,-38,-113+p.back);q.quadraticCurveTo(-25,-85+p.front,28,-90+p.front);q.quadraticCurveTo(-5,-59+p.front,-30,-80+p.back);q.quadraticCurveTo(-70,-50+p.back,-82,-76+p.back);q.closePath();},0);
 wildmuttShape(c,'#ffaf3b',q=>{q.moveTo(-83,-136+p.back);q.quadraticCurveTo(-41,-160+p.back,13,-140+p.front);q.quadraticCurveTo(-30,-143+p.back,-60,-129+p.back);q.closePath();},0);
 // Short back tufts, never a tail or extra appendage.
 for(let i=0;i<4;i++){const x=-84+i*16,y=-141+(i===0?5:-5)+p.back;wildmuttShape(c,'#ff951b',q=>{q.moveTo(x,y+6);q.lineTo(x-8,y-6);q.lineTo(x+16,y+1);},1.3);}
 c.restore();wildmuttLimb(c,p.limbs.hl,false,false);wildmuttLimb(c,p.limbs.fl,true,false);
 c.save();c.translate(13+p.neck+p.lean,-110+p.front+p.head+p.breath);c.rotate(-.025+p.claw*.04);
 // Large smooth eyeless skull, neck gills, and a separate hinged lower jaw.
 wildmuttShape(c,'#ff951b',q=>{q.moveTo(-20,-17);q.bezierCurveTo(-10,-54,32,-60,63,-38);q.bezierCurveTo(79,-26,85,-3,82,10);q.quadraticCurveTo(67,21,41,17);q.quadraticCurveTo(3,21,-20,-17);});
 wildmuttShape(c,'#ffc04e',q=>{q.moveTo(-3,-33);q.quadraticCurveTo(26,-53,55,-34);q.quadraticCurveTo(21,-40,4,-19);q.closePath();},0);
 for(let i=0;i<3;i++){c.beginPath();c.moveTo(-11+i*8,-14);c.bezierCurveTo(-3+i*8,-4,-5+i*8,5,9+i*8,12);c.strokeStyle='#6a3d19';c.lineWidth=1.9;c.stroke();}
 const jaw=p.jaw;
 wildmuttShape(c,'#241510',q=>{q.moveTo(30,10);q.quadraticCurveTo(52,7,83,6);q.lineTo(87,14+jaw*28);q.quadraticCurveTo(57,31+jaw*16,27,16);q.closePath();},1.6);
 for(let i=0;i<5;i++){const x=38+i*9;wildmuttShape(c,'#fff1b5',q=>{q.moveTo(x,9);q.lineTo(x+3,17+(i%2)*3);q.lineTo(x+7,8);},.9);}
 c.save();c.translate(27,14);c.rotate(jaw*.5);
 wildmuttShape(c,'#ed861f',q=>{q.moveTo(0,0);q.quadraticCurveTo(26,13,58,2);q.lineTo(63,12);q.quadraticCurveTo(31,34,-2,12);q.closePath();});
 for(let i=0;i<4;i++){const x=19+i*10;wildmuttShape(c,'#fff1b5',q=>{q.moveTo(x,12);q.lineTo(x+3,4-(i%2)*3);q.lineTo(x+7,11);},.9);}
 for(let i=0;i<4;i++){const x=6+i*10;c.beginPath();c.moveTo(x,19);c.lineTo(x-4,26);c.lineTo(x+3,23);c.strokeStyle='#713e1c';c.lineWidth=1.3;c.stroke();}c.restore();c.restore();
 // Left-shoulder Omnitrix brace stays attached to the skeleton.
 const shoulder=p.limbs.fl.root;c.save();c.translate(shoulder[0]-8,shoulder[1]-12);c.rotate(-.48);
 wildmuttShape(c,'#11191a',q=>{q.moveTo(-17,-20);q.lineTo(17,-20);q.lineTo(21,19);q.lineTo(-20,21);q.closePath();});
 wildmuttShape(c,'#c1c4bb',q=>{q.moveTo(-20,9);q.lineTo(20,9);q.lineTo(20,15);q.lineTo(-20,17);q.closePath();},1.3);
 wildmuttEllipse(c,0,-6,17,17,'#343a38');wildmuttEllipse(c,0,-6,12,12,'#dfe3d6');
 wildmuttShape(c,'#161e1b',q=>{q.moveTo(-8,-15);q.lineTo(8,-15);q.lineTo(3,-6);q.lineTo(8,3);q.lineTo(-8,3);q.lineTo(-3,-6);q.closePath();},0);c.restore();
 c.restore();return p;
}
const wildmuttDrawBase=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 if(f.id!==4||Number.isInteger(f.villain))return wildmuttDrawBase(ctx,f,t,portrait);
 return drawWildmuttRig(ctx,f,t,portrait);
};
const wildmuttEmitterBase=drawnAlienEmitter;
drawnAlienEmitter=function(f,v){
 if(f.id!==4||Number.isInteger(f.villain))return wildmuttEmitterBase(f,v);
 const p=wildmuttPose(f,typeof time==='number'?time:0),s=(f.config||aliens[4]).renderHeight*(f.config||aliens[4]).scale/WILDMUTT_RIG.height;
 const point=v.cfg.kind==='melee'||v.key==='normal'?p.limbs[p.clawSide?'fr':'fl'].foot:[96+p.neck+p.lean,-94+p.front+p.head];
 return{x:f.x+(v.dir||f.dir||1)*(point[0]+p.lean)*s,y:f.y+(point[1]+p.ko*5)*s};
};
