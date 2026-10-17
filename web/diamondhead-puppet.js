'use strict';
// Diamondhead movement pilot: one generated cutout rig, no walk-key crossfades.
let diamondheadPuppetImage=null;
const diamondheadPuppetReady=loadClassicImage('assets/diamondhead-puppet/walk-parts-v1.png').then(image=>{if(image.width!==1254||image.height!==1254)throw Error('Invalid Diamondhead movement artwork');diamondheadPuppetImage=image;return true}).catch(()=>false);
const diamondheadPuppetMotion=new WeakMap();
const diamondheadPreviousDraw=drawAlien;
// Source rectangles and attachment points are measured in atlas pixels.
const diamondheadParts={
 head:{rect:[62,0,236,310],anchor:[180,293],scale:.235},
 torso:{rect:[338,0,282,313],anchor:[494,307],scale:.31},
 pelvis:{rect:[689,135,225,178],anchor:[799,235],scale:.26},
 upperNear:{rect:[98,322,142,299],a:[172,352],b:[209,591],width:35},
 lowerNear:{rect:[413,327,149,286],a:[452,355],b:[533,588],width:32},
 handNear:{rect:[716,381,152,206],anchor:[774,405],scale:.14},
 upperFar:{rect:[114,630,140,311],a:[176,661],b:[156,902],width:33},
 lowerFar:{rect:[415,632,149,308],a:[526,665],b:[453,902],width:30},
 handFar:{rect:[714,687,152,204],anchor:[777,718],scale:.135},
 thigh:{rect:[106,940,150,311],a:[133,979],b:[178,1227],width:30},
 shin:{rect:[411,940,125,295],a:[483,962],b:[496,1208],width:27},
 foot:{rect:[677,960,263,268],anchor:[769,990],scale:.128}
};
function diamondheadPointPart(ctx,name,x,y,angle=0,turn=0){const p=diamondheadParts[name],[sx,sy,sw,sh]=p.rect;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.transform(1-Math.abs(turn)*.04,0,Math.sin(turn)*.12,1,0,0);ctx.drawImage(diamondheadPuppetImage,sx,sy,sw,sh,(sx-p.anchor[0])*p.scale,(sy-p.anchor[1])*p.scale,sw*p.scale,sh*p.scale);ctx.restore();}
function diamondheadLimb(ctx,name,a,b){const p=diamondheadParts[name],[sx,sy,sw,sh]=p.rect,sourceAngle=Math.atan2(p.b[1]-p.a[1],p.b[0]-p.a[0]),targetAngle=Math.atan2(b.y-a.y,b.x-a.x),length=Math.hypot(b.x-a.x,b.y-a.y),sourceLength=Math.hypot(p.b[0]-p.a[0],p.b[1]-p.a[1]);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(targetAngle);ctx.scale(length/sourceLength,p.width/sw);ctx.rotate(-sourceAngle);ctx.drawImage(diamondheadPuppetImage,sx,sy,sw,sh,sx-p.a[0],sy-p.a[1],sw,sh);ctx.restore();}
// Retarget two real human locomotion recordings onto the generated Diamondhead rig.
// Curves are derived from 100STYLE (Ian Mason, CC BY 4.0); see MOTION.md.
const diamondheadSole=[[3.968,-2.432],[20.224,21.504],[21.376,27.136],[18.432,28.928],[16,29.44],[10.112,29.696],[6.656,29.696],[-6.4,29.056],[-11.648,27.52],[-11.264,21.76],[-8.576,9.856],[-4.736,-1.92],[-2.176,-3.584],[.64,-3.712]];
const diamondheadGaitIndex=Object.fromEntries(DIAMONDHEAD_GAIT.keys.map((name,i)=>[name,i]));
const diamondheadClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function diamondheadGaitSample(clip,phase){const a=DIAMONDHEAD_GAIT.clips[clip].values,n=a.length,p=((phase%1)+1)%1*n,i=Math.floor(p),u=p-i;return a[i].map((v,j)=>{const p0=a[(i+n-1)%n][j],p2=a[(i+1)%n][j],p3=a[(i+2)%n][j];return .5*((2*v)+(-p0+p2)*u+(2*p0-5*v+4*p2-p3)*u*u+(-p0+3*v-3*p2+p3)*u*u*u)});}
function diamondheadMovement(f,t){let s=diamondheadPuppetMotion.get(f);if(!s){s={last:t,weight:0,travel:f.walk||0,phase:0,clip:'forward',pose:null};diamondheadPuppetMotion.set(f,s)}const dt=Math.max(0,Math.min(.05,t-s.last)),delta=(f.walk||0)-s.travel,walking=!!f.moving,ease=1-Math.exp(-dt*13);s.weight+=((walking?1:0)-s.weight)*ease;
 if(walking&&Math.abs(delta)>1e-8){const next=delta<0?'backward':'forward';if(next!==s.clip){const current=diamondheadGaitSample(s.clip,s.phase);let best=Infinity,bestPhase=s.phase;for(let i=0;i<96;i++){const candidate=diamondheadGaitSample(next,i/96);let cost=0;for(const name of ['RightThigh','RightShin','LeftThigh','LeftShin']){const k=diamondheadGaitIndex[name];cost+=(candidate[k]-current[k])**2}if(cost<best){best=cost;bestPhase=i/96}}s.phase=bestPhase;s.clip=next}const stride=DIAMONDHEAD_GAIT.clips[s.clip].stride;s.phase=(s.phase+Math.abs(delta)*20/stride)%1;}
 const target=diamondheadGaitSample(s.clip,s.phase),follow=1-Math.exp(-dt*48);if(!s.pose)s.pose=target;else for(let i=0;i<target.length;i++)s.pose[i]+=(target[i]-s.pose[i])*follow;s.travel=f.walk||0;s.last=t;return s;
}
function diamondheadRotate(p,angle){return {x:p.x*Math.cos(angle)-p.y*Math.sin(angle),y:p.x*Math.sin(angle)+p.y*Math.cos(angle)};}
function diamondheadAdd(a,b){return {x:a.x+b.x,y:a.y+b.y};}
function diamondheadEnd(p,angle,length){return {x:p.x+Math.sin(angle)*length,y:p.y+Math.cos(angle)*length};}
function diamondheadFootBottom(angle){const c=Math.cos(angle),s=Math.sin(angle);return Math.max(...diamondheadSole.map(([x,y])=>x*s+y*c));}
function diamondheadBodyPose(f,t){const motion=diamondheadMovement(f,t),w=motion.weight,means=DIAMONDHEAD_GAIT.clips[motion.clip].means,get=name=>motion.pose[diamondheadGaitIndex[name]],variation=name=>get(name)-means[diamondheadGaitIndex[name]],breath=Math.sin(t*Math.PI*2/4.4)*.14;
 const pelvisYaw=variation('pelvisYaw')*w,chestYaw=variation('chestYaw')*w,chestAngle=(variation('torso')+(motion.clip==='backward'?-.05:-.025))*w,headAngle=variation('head')*.65*w;
 const pelvis={x:Math.sin(pelvisYaw)*3,y:-133-get('bob')*w},torso=diamondheadAdd(pelvis,{x:0,y:-6+breath}),head=diamondheadAdd(torso,diamondheadRotate({x:0,y:-68},chestAngle));
 function leg(side,offset){const capturedThigh=get(side+'Thigh'),capturedShin=get(side+'Shin'),thigh=capturedThigh*w,shin=capturedShin*w,hip=diamondheadAdd(pelvis,{x:offset+Math.sin(pelvisYaw)*(side==='Right'?-11:11),y:Math.sin(pelvisYaw)*(side==='Right'?-3:3)}),knee=diamondheadEnd(hip,thigh,53),ankle=diamondheadEnd(knee,shin,51),footAngle=diamondheadClamp(get(side+'Foot'),-.40,.80)*w;return {hip,knee,ankle,footAngle,sole:ankle.y+diamondheadFootBottom(footAngle)};}
 function arm(side,offset){const shoulder=diamondheadAdd(torso,diamondheadRotate({x:offset+Math.sin(chestYaw)*(side==='Right'?-15:15),y:-46},chestAngle)),upper=(get(side+'Upper')+(side==='Right'?.03:-.03))*w,fore=(get(side+'Fore')+.05)*w+.04*(1-w),elbow=diamondheadEnd(shoulder,upper,38),wrist=diamondheadEnd(elbow,fore,33),handAngle=-get(side+'Hand')*w;return {shoulder,elbow,wrist,handAngle};}
 const nearLeg=leg('Right',-13),farLeg=leg('Left',13),nearArm=arm('Right',-23),farArm=arm('Left',23);
 // Ground the lowest point of the actual crystal boot silhouette, including heel/toe roll.
 // A smooth maximum avoids a vertical derivative kink when support changes feet.
 const a=nearLeg.sole,b=farLeg.sole,ground=(a+b+Math.sqrt((a-b)**2+.04))/2;
 for(const part of [pelvis,torso,head,nearLeg.hip,nearLeg.knee,nearLeg.ankle,farLeg.hip,farLeg.knee,farLeg.ankle,nearArm.shoulder,nearArm.elbow,nearArm.wrist,farArm.shoulder,farArm.elbow,farArm.wrist])part.y-=ground;
 return {pelvis,torso,head,pelvisYaw,chestYaw,chestAngle,headAngle,nearLeg,farLeg,nearArm,farArm,weight:w,phase:motion.phase,clip:motion.clip};
}
function drawDiamondheadPuppet(ctx,f,t){const p=diamondheadBodyPose(f,t),{nearLeg:n,farLeg:b,nearArm:a,farArm:z}=p;
 ctx.save();ctx.beginPath();ctx.rect(f.x-350,f.y-500,700,500);ctx.clip();ctx.translate(f.x,f.y);ctx.scale((f.dir||1)*.90,.90);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 diamondheadLimb(ctx,'thigh',b.hip,b.knee);diamondheadLimb(ctx,'shin',b.knee,b.ankle);diamondheadPointPart(ctx,'foot',b.ankle.x,b.ankle.y,b.footAngle);
 diamondheadLimb(ctx,'upperFar',z.shoulder,z.elbow);diamondheadLimb(ctx,'lowerFar',z.elbow,z.wrist);diamondheadPointPart(ctx,'handFar',z.wrist.x,z.wrist.y,z.handAngle);
 diamondheadPointPart(ctx,'pelvis',p.pelvis.x,p.pelvis.y-7,p.pelvisYaw*.12,p.pelvisYaw);
 diamondheadLimb(ctx,'thigh',n.hip,n.knee);diamondheadLimb(ctx,'shin',n.knee,n.ankle);diamondheadPointPart(ctx,'foot',n.ankle.x,n.ankle.y,n.footAngle);
 diamondheadPointPart(ctx,'torso',p.torso.x,p.torso.y,p.chestAngle,p.chestYaw);diamondheadPointPart(ctx,'head',p.head.x,p.head.y,p.headAngle);
 diamondheadLimb(ctx,'upperNear',a.shoulder,a.elbow);diamondheadLimb(ctx,'lowerNear',a.elbow,a.wrist);diamondheadPointPart(ctx,'handNear',a.wrist.x,a.wrist.y,a.handAngle);ctx.restore();
}
drawAlien=function(ctx,f,t,portrait=false){const neutral=f.id===2&&!portrait&&f.hp>0&&!(f.stun>0)&&!f.block&&!f.cast&&!(f.jumpWindup>0)&&f.y>=floor-1;
 if(neutral&&diamondheadPuppetImage){drawDiamondheadPuppet(ctx,f,t);return}
 // Reset blend on action changes; leave the approved combat poses untouched.
 diamondheadPuppetMotion.delete(f);diamondheadPreviousDraw(ctx,f,t,portrait);
};
