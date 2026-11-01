'use strict';
// Detailed cutout artwork with independently planted legs; approved combat cels stay unchanged.
const RIPJAWS_WALK={
  "upperSrc": "assets/ripjaws-detailed/walk-upper.webp",
  "legsSrc": "assets/ripjaws-detailed/walk-legs.webp",
  "upperSize": [
    1041,
    1439
  ],
  "hip": [
    521,
    1194
  ],
  "parts": [
    [
      241,
      97,
      157,
      445
    ],
    [
      878,
      97,
      164,
      445
    ],
    [
      245,
      729,
      149,
      462
    ],
    [
      888,
      729,
      143,
      461
    ],
    [
      147,
      1511,
      346,
      177
    ],
    [
      792,
      1506,
      336,
      187
    ]
  ],
  "strideHeight": 1,
  "stanceFraction": 0.6
};
const ripjawsWalkImages=[];
const ripjawsWalkReady=Promise.all([RIPJAWS_WALK.upperSrc,RIPJAWS_WALK.legsSrc].map((src,i)=>loadClassicImage(src).then(async im=>{if(typeof im.decode==='function')await im.decode();ripjawsWalkImages[i]=im;return im;}))).catch(e=>{console.warn('Ripjaws walk parts unavailable; using existing cels.',e);return false;});
function ripjawsWalkLeg(phase,h,hipX,bob=0){
 const d=RIPJAWS_WALK,p=((phase%1)+1)%1,stride=h*d.strideHeight,stance=p<d.stanceFraction;
 let x,lift=0;
 if(stance)x=stride*(d.stanceFraction*.5-p);
 else{const u=(p-d.stanceFraction)/(1-d.stanceFraction),ease=u*u*(3-2*u);x=stride*d.stanceFraction*(ease-.5);lift=h*.09*Math.sin(Math.PI*u);}
 const hip={x:hipX,y:-h*.45+bob},ankle={x,y:-h*.071-lift},thigh=h*.25,shin=h*.25;
 const dx=ankle.x-hip.x,dy=ankle.y-hip.y,length=Math.max(.001,Math.hypot(dx,dy)),along=(thigh*thigh-shin*shin+length*length)/(2*length),bend=Math.sqrt(Math.max(0,thigh*thigh-along*along));
 const knee={x:hip.x+dx/length*along+dy/length*bend,y:hip.y+dy/length*along-dx/length*bend};
 return{phase:p,stance,hip,knee,ankle,thigh,shin,lift};
}
function ripjawsWalkPose(f,t){
 const a=f.config||aliens[8],h=a.renderHeight*a.scale,m=ripjawsDetailedMotion(f,t),phase=m.distance/(h*RIPJAWS_WALK.strideHeight),bob=h*.004*(1-Math.cos(phase*Math.PI*4));
 return{h,phase,bob,near:ripjawsWalkLeg(phase,h,h*.024,bob),far:ripjawsWalkLeg(phase+.5,h,-h*.024,bob),dir:f.dir||1};
}
function ripjawsWalkTexture(ctx,index,image,rect,x,y,w,h){
 const tr=typeof ctx.getTransform==='function'?ctx.getTransform():null;
 const density=tr?Math.max(.25,Math.min(4,Math.hypot(tr.a,tr.b))):1;
 const tile=ripjawsDetailedTile(index,image,{rect},Math.max(1,Math.round(w*density)),Math.max(1,Math.round(h*density)));
 if(tile)ctx.drawImage(tile.canvas,x,y,w,h);else ctx.drawImage(image,...rect,x,y,w,h);
}
function ripjawsWalkPart(ctx,index,width,height,x,y,angle=0){
 const r=RIPJAWS_WALK.parts[index],trim=index<4?Math.round(r[3]*.035):0,crop=[r[0],r[1]+trim,r[2],r[3]-trim*2];
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ripjawsWalkTexture(ctx,9100+index,ripjawsWalkImages[1],crop,-width*.5,-height*.04,width,height*1.08);ctx.restore();
}
function ripjawsWalkSegment(ctx,index,a,b,width){ripjawsWalkPart(ctx,index,width,Math.hypot(b.x-a.x,b.y-a.y),a.x,a.y,Math.atan2(b.y-a.y,b.x-a.x)-Math.PI*.5);}
function ripjawsWalkDrawLeg(ctx,leg,h,far){
 const footIndex=far?5:4,r=RIPJAWS_WALK.parts[footIndex],width=h*.24,height=h*.075,ankleX=width*.17,ankleY=height*.055;
 ctx.save();ctx.translate(leg.ankle.x,leg.ankle.y);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ripjawsWalkTexture(ctx,9100+footIndex,ripjawsWalkImages[1],r,-ankleX,-ankleY,width,height);ctx.restore();
 ripjawsWalkSegment(ctx,far?3:2,leg.knee,leg.ankle,h*.075);
 ripjawsWalkSegment(ctx,far?1:0,leg.hip,leg.knee,h*.08);
}
const ripjawsWalkBase=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 if(f.id!==8||Number.isInteger(f.villain)||portrait||!ripjawsWalkImages[0]||!ripjawsWalkImages[1]||ripjawsDetailedFrame(f,t,portrait).key!=='walk')return ripjawsWalkBase(ctx,f,t,portrait);
 const p=ripjawsWalkPose(f,t),d=RIPJAWS_WALK,s=p.h*.55/d.hip[1];
 ctx.save();ctx.translate(f.x,f.y);ctx.scale(p.dir,1);
 ripjawsWalkDrawLeg(ctx,p.far,p.h,true);ripjawsWalkDrawLeg(ctx,p.near,p.h,false);
 // One upper body, with its pelvis covering the two hip joins. No full-body ghost overlay.
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ripjawsWalkTexture(ctx,9000,ripjawsWalkImages[0],[0,0,...d.upperSize],-d.hip[0]*s,-p.h*.45+p.bob-d.hip[1]*s,d.upperSize[0]*s,d.upperSize[1]*s);ctx.restore();
};
