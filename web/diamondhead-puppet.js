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
function diamondheadPointPart(ctx,name,x,y,angle=0){const p=diamondheadParts[name],[sx,sy,sw,sh]=p.rect;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(diamondheadPuppetImage,sx,sy,sw,sh,(sx-p.anchor[0])*p.scale,(sy-p.anchor[1])*p.scale,sw*p.scale,sh*p.scale);ctx.restore();}
function diamondheadLimb(ctx,name,a,b){const p=diamondheadParts[name],[sx,sy,sw,sh]=p.rect,sourceAngle=Math.atan2(p.b[1]-p.a[1],p.b[0]-p.a[0]),targetAngle=Math.atan2(b.y-a.y,b.x-a.x),length=Math.hypot(b.x-a.x,b.y-a.y),sourceLength=Math.hypot(p.b[0]-p.a[0],p.b[1]-p.a[1]);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(targetAngle);ctx.scale(length/sourceLength,p.width/sw);ctx.rotate(-sourceAngle);ctx.drawImage(diamondheadPuppetImage,sx,sy,sw,sh,sx-p.a[0],sy-p.a[1],sw,sh);ctx.restore();}
function diamondheadKnee(hip,ankle,l1=53,l2=51){const dx=ankle.x-hip.x,dy=ankle.y-hip.y,d=Math.max(.001,Math.min(l1+l2-.001,Math.hypot(dx,dy))),along=(l1*l1-l2*l2+d*d)/(2*d),out=Math.sqrt(Math.max(0,l1*l1-along*along)),nx=dx/Math.hypot(dx,dy),ny=dy/Math.hypot(dx,dy);return {x:hip.x+nx*along+ny*out,y:hip.y+ny*along-nx*out};}
function diamondheadFoot(phase,weight,offset){const p=((phase%1)+1)%1,stance=.6,extent=39.6;let x,lift=0;
 if(p<stance)x=extent-p*132;
 else{const u=(p-stance)/(1-stance),u2=u*u,u3=u2*u,m=-132*(1-stance);x=(2*u3-3*u2+1)*(-extent)+(u3-2*u2+u)*m+(-2*u3+3*u2)*extent+(u3-u2)*m;lift=17*Math.sin(Math.PI*u)**2;}
 return {x:offset+x*weight,y:-30.464-lift*weight};
}
function diamondheadMovement(f,t){let s=diamondheadPuppetMotion.get(f);if(!s){s={last:t,weight:0,travel:f.walk||0,phase:(f.walk||0)/6.204,lean:0};diamondheadPuppetMotion.set(f,s)}const dt=Math.max(0,Math.min(.05,t-s.last)),ease=1-Math.exp(-dt*15),walking=!!f.moving,delta=(f.walk||0)-s.travel;s.weight+=((walking?1:0)-s.weight)*ease;s.phase=(f.walk||0)/6.204;s.lean+=((walking?Math.sign(delta)*.025:0)-s.lean)*ease;s.travel=f.walk||0;s.last=t;return s;}
function drawDiamondheadPuppet(ctx,f,t){const s=diamondheadMovement(f,t),phase=s.phase,weight=s.weight,breath=Math.sin(t*Math.PI*2/4.4)*.14,hipY=-123+breath;
 const farHip={x:13,y:hipY},nearHip={x:-13,y:hipY},farFoot=diamondheadFoot(phase+.5,weight,12),nearFoot=diamondheadFoot(phase,weight,-12),farKnee=diamondheadKnee(farHip,farFoot),nearKnee=diamondheadKnee(nearHip,nearFoot);
 const swing=Math.sin(phase*Math.PI*2)*weight,farShoulder={x:23,y:-174+breath},nearShoulder={x:-23,y:-175+breath},farElbow={x:28-swing*12,y:-134+breath},nearElbow={x:-22+swing*12,y:-135+breath},farHand={x:34-swing*20,y:-101+breath},nearHand={x:-15+swing*20,y:-101+breath};
 ctx.save();ctx.beginPath();ctx.rect(f.x-350,f.y-500,700,500);ctx.clip();ctx.translate(f.x,f.y);ctx.scale((f.dir||1)*.94,.94);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 // Opaque layer order: far limbs -> hips/near leg -> torso/head -> near arm.
 diamondheadLimb(ctx,'thigh',farHip,farKnee);diamondheadLimb(ctx,'shin',farKnee,farFoot);diamondheadPointPart(ctx,'foot',farFoot.x,farFoot.y);
 diamondheadLimb(ctx,'upperFar',farShoulder,farElbow);diamondheadLimb(ctx,'lowerFar',farElbow,farHand);diamondheadPointPart(ctx,'handFar',farHand.x,farHand.y);
 diamondheadPointPart(ctx,'pelvis',0,-130+breath);
 diamondheadLimb(ctx,'thigh',nearHip,nearKnee);diamondheadLimb(ctx,'shin',nearKnee,nearFoot);diamondheadPointPart(ctx,'foot',nearFoot.x,nearFoot.y);
 diamondheadPointPart(ctx,'torso',0,-129+breath,s.lean);diamondheadPointPart(ctx,'head',0,-197+breath,s.lean*.25);
 diamondheadLimb(ctx,'upperNear',nearShoulder,nearElbow);diamondheadLimb(ctx,'lowerNear',nearElbow,nearHand);diamondheadPointPart(ctx,'handNear',nearHand.x,nearHand.y);ctx.restore();
}
drawAlien=function(ctx,f,t,portrait=false){const neutral=f.id===2&&!portrait&&f.hp>0&&!(f.stun>0)&&!f.block&&!f.cast&&!(f.jumpWindup>0)&&f.y>=floor-1;
 if(neutral&&diamondheadPuppetImage){drawDiamondheadPuppet(ctx,f,t);return}
 // Reset blend on action changes; leave the approved combat poses untouched.
 diamondheadPuppetMotion.delete(f);diamondheadPreviousDraw(ctx,f,t,portrait);
};
