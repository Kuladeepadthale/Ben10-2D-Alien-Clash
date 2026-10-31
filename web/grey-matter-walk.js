'use strict';
// Detailed cutout artwork with independently planted legs; approved combat cels stay unchanged.
const GREYMATTER_WALK={
  "upperSrc": "assets/grey-matter-detailed/walk-upper.webp",
  "legsSrc": "assets/grey-matter-detailed/walk-legs.webp",
  "upperSize": [
    733,
    1423
  ],
  "hip": [
    333,
    1023
  ],
  "parts": [
    [
      231,
      61,
      177,
      517
    ],
    [
      871,
      61,
      177,
      517
    ],
    [
      267,
      735,
      105,
      450
    ],
    [
      907,
      736,
      105,
      447
    ],
    [
      125,
      1493,
      390,
      213
    ],
    [
      766,
      1487,
      388,
      225
    ]
  ],
  "strideHeight": 0.85,
  "stanceFraction": 0.6
};
const greyMatterWalkImages=[];
const greyMatterWalkReady=Promise.all([GREYMATTER_WALK.upperSrc,GREYMATTER_WALK.legsSrc].map((src,i)=>loadClassicImage(src).then(async im=>{if(typeof im.decode==='function')await im.decode();greyMatterWalkImages[i]=im;return im;}))).catch(e=>{console.warn('Grey Matter walk parts unavailable; using existing cels.',e);return false;});
function greyMatterWalkLeg(phase,h,hipX,bob=0){
 const d=GREYMATTER_WALK,p=((phase%1)+1)%1,stride=h*d.strideHeight,stance=p<d.stanceFraction;
 let x,lift=0;
 if(stance)x=stride*(d.stanceFraction*.5-p);
 else{const u=(p-d.stanceFraction)/(1-d.stanceFraction),ease=u*u*(3-2*u);x=stride*d.stanceFraction*(ease-.5);lift=h*.09*Math.sin(Math.PI*u);}
 const hip={x:hipX,y:-h*.38+bob},ankle={x,y:-h*.071-lift},thigh=h*.21,shin=h*.21;
 const dx=ankle.x-hip.x,dy=ankle.y-hip.y,length=Math.max(.001,Math.hypot(dx,dy)),along=(thigh*thigh-shin*shin+length*length)/(2*length),bend=Math.sqrt(Math.max(0,thigh*thigh-along*along));
 const knee={x:hip.x+dx/length*along+dy/length*bend,y:hip.y+dy/length*along-dx/length*bend};
 return{phase:p,stance,hip,knee,ankle,thigh,shin,lift};
}
function greyMatterWalkPose(f,t){
 const a=f.config||aliens[5],h=a.renderHeight*a.scale,m=greyMatterDetailedMotion(f,t),phase=m.distance/(h*GREYMATTER_WALK.strideHeight),bob=h*.004*(1-Math.cos(phase*Math.PI*4));
 return{h,phase,bob,near:greyMatterWalkLeg(phase,h,h*.012,bob),far:greyMatterWalkLeg(phase+.5,h,-h*.016,bob),dir:f.dir||1};
}
function greyMatterWalkTexture(ctx,index,image,rect,x,y,w,h){
 const tr=typeof ctx.getTransform==='function'?ctx.getTransform():null;
 const density=tr?Math.max(.25,Math.min(4,Math.hypot(tr.a,tr.b))):1;
 const tile=greyMatterDetailedTile(index,image,{rect},Math.max(1,Math.round(w*density)),Math.max(1,Math.round(h*density)));
 if(tile)ctx.drawImage(tile.canvas,x,y,w,h);else ctx.drawImage(image,...rect,x,y,w,h);
}
function greyMatterWalkPart(ctx,index,width,height,x,y,angle=0){
 const r=GREYMATTER_WALK.parts[index],trim=index<4?Math.round(r[3]*.035):0,crop=[r[0],r[1]+trim,r[2],r[3]-trim*2];
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';greyMatterWalkTexture(ctx,9100+index,greyMatterWalkImages[1],crop,-width*.5,-height*.04,width,height*1.08);ctx.restore();
}
function greyMatterWalkSegment(ctx,index,a,b,width){greyMatterWalkPart(ctx,index,width,Math.hypot(b.x-a.x,b.y-a.y),a.x,a.y,Math.atan2(b.y-a.y,b.x-a.x)-Math.PI*.5);}
function greyMatterWalkDrawLeg(ctx,leg,h,far){
 const footIndex=far?5:4,r=GREYMATTER_WALK.parts[footIndex],width=h*.18,height=h*.075,ankleX=width*.17,ankleY=height*.055;
 ctx.save();ctx.translate(leg.ankle.x,leg.ankle.y);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';greyMatterWalkTexture(ctx,9100+footIndex,greyMatterWalkImages[1],r,-ankleX,-ankleY,width,height);ctx.restore();
 greyMatterWalkSegment(ctx,far?3:2,leg.knee,leg.ankle,h*.045);
 greyMatterWalkSegment(ctx,far?1:0,leg.hip,leg.knee,h*.066);
}
const greyMatterWalkBase=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 if(f.id!==5||Number.isInteger(f.villain)||portrait||!greyMatterWalkImages[0]||!greyMatterWalkImages[1]||greyMatterDetailedFrame(f,t,portrait).key!=='walk')return greyMatterWalkBase(ctx,f,t,portrait);
 const p=greyMatterWalkPose(f,t),d=GREYMATTER_WALK,s=p.h*.62/d.hip[1];
 ctx.save();ctx.translate(f.x,f.y);ctx.scale(p.dir,1);
 greyMatterWalkDrawLeg(ctx,p.far,p.h,true);greyMatterWalkDrawLeg(ctx,p.near,p.h,false);
 // One upper body, with its pelvis covering the two hip joins. No full-body ghost overlay.
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';greyMatterWalkTexture(ctx,9000,greyMatterWalkImages[0],[0,0,...d.upperSize],-d.hip[0]*s,-p.h*.38+p.bob-d.hip[1]*s,d.upperSize[0]*s,d.upperSize[1]*s);ctx.restore();
};
