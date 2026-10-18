'use strict';
// Two-bone IK and distance-driven support contacts with overlapping joint skin.
const FOOTWORK_SPECS={
 0:[[[.44,.55],[.31,.76],[.22,.94],[.25,.99]],[[.64,.55],[.62,.76],[.70,.93],[.86,.98]]],
 1:[[[.43,.59],[.34,.79],[.27,.95],[.29,.99]],[[.61,.59],[.58,.79],[.66,.94],[.83,.98]]],
 2:[[[.43,.57],[.35,.79],[.24,.96],[.22,.99]],[[.61,.57],[.66,.79],[.73,.96],[.87,.99]]],
 3:[[[.58,.53],[.40,.72],[.25,.91],[.25,.96]],[[.69,.52],[.77,.72],[.78,.90],[.81,.95]]],
 4:[[[.25,.53],[.18,.73],[.10,.94],[.08,.98]],[[.45,.61],[.43,.79],[.49,.94],[.51,.98]],[[.65,.53],[.70,.74],[.83,.90],[.86,.94]],[[.78,.56],[.85,.75],[.94,.90],[.98,.94]]],
 5:[[[.43,.63],[.37,.81],[.23,.96],[.19,.99]],[[.61,.63],[.59,.80],[.63,.93],[.81,.97]]],
 6:[[[.42,.59],[.35,.80],[.29,.95],[.25,.99]],[[.58,.59],[.65,.80],[.71,.95],[.76,.99]]],
 8:[[[.42,.56],[.32,.78],[.24,.95],[.21,.99]],[[.61,.56],[.62,.78],[.72,.94],[.89,.98]]]
};
const footworkRigs=new Map(),footworkStates=new WeakMap();
const fwClamp=(v,a,b)=>Math.max(a,Math.min(b,v)),fwEase=v=>{v=fwClamp(v,0,1);return v*v*(3-2*v)};
const fwMix=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];
function footworkCycle(phase,length,lift){
 const p=((phase%1)+1)%1,stance=.6;
 if(p<stance)return {x:length*(stance/2-p),y:0,planted:true};
 const u=(p-stance)/(1-stance);return {x:length*(-stance/2+stance*fwEase(u)),y:-lift*Math.sin(Math.PI*u)**2,planted:false};
}
function footworkIK(hip,target,l1,l2,bend=1){
 const dx=target[0]-hip[0],dy=target[1]-hip[1],raw=Math.hypot(dx,dy),d=fwClamp(raw,.001,l1+l2-.001),ux=dx/(raw||1),uy=dy/(raw||1),a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));
 return {knee:[hip[0]+ux*a-uy*h*bend,hip[1]+uy*a+ux*h*bend],ankle:[hip[0]+ux*d,hip[1]+uy*d]};
}
function footworkTransform(p,a,b,c,d){const vx=b[0]-a[0],vy=b[1]-a[1],wx=d[0]-c[0],wy=d[1]-c[1],den=vx*vx+vy*vy||1,co=(vx*wx+vy*wy)/den,si=(vx*wy-vy*wx)/den,px=p[0]-a[0],py=p[1]-a[1];return [c[0]+co*px-si*py,c[1]+si*px+co*py];}
function footworkDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],u=fwClamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dy);}
function footworkRig(id){
 if(footworkRigs.has(id))return footworkRigs.get(id);if(!FOOTWORK_SPECS[id])return null;
 const cv=document.createElement('canvas');cv.width=cv.height=256;const cx=cv.getContext('2d');let x,y,w,h,ox,oy,standing;
 if(id===0){if(!heatblastAtlas)return null;const d=HEATBLAST_SMOOTH;x=0;y=0;w=h=d.cell;ox=d.originX;oy=d.ground;standing=d.standingHeight;cx.drawImage(heatblastAtlases[0],0,0,w,h,128-ox*256/d.cell,240-oy*256/d.cell,256,256);standing*=256/d.cell;
 // Source key art bounds, excluding the transparent registration padding.
 x=128+(46-1-104);y=240+(12-1-177);w=116;h=166;
 }else{if(!allAlienAtlases[id])return null;const m=ALIEN_DRAWN_DATA.characters[id].frames[0];[,,w,h,ox,oy]=m;x=128-ox;y=240-oy;standing=ALIEN_DRAWN_DATA.characters[id].standingHeight;cx.drawImage(cleanRegisteredAlienFrame(id,0),x,y);}
 const scale=(id===4?142:226)*aliens[id].scale/standing,toPoint=p=>[x+p[0]*w,y+p[1]*h],legs=FOOTWORK_SPECS[id].map(points=>{const p=points.map(toPoint),a=p[0],b=p[1],c=p[2],cross=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);return {p,l1:Math.hypot(b[0]-a[0],b[1]-a[1]),l2:Math.hypot(c[0]-b[0],c[1]-b[1]),bend:id===4?(cross>=0?-1:1):-1};});
 const rig={id,cv,standing,scale,legs,stride:standing*(id===4?.62:.72)};
 prepareFootworkSkin(rig,{x,y,w,h});footworkRigs.set(id,rig);return rig;
}
const FOOTWORK_ARMS={
 0:[[[.22,.35],[.12,.62],[.30,.68]],[[.75,.35],[.90,.56],[.98,.58]]],
 1:[[[.16,.30],[.08,.60],[.08,.71]],[[.82,.30],[.94,.60],[.94,.72]],[[.28,.40],[.20,.67],[.24,.75]],[[.78,.42],[.82,.67],[.88,.75]]],
 2:[[[.16,.30],[.12,.65],[.14,.80]],[[.80,.30],[.90,.65],[.95,.79]]],
 3:[[[.65,.32],[.65,.50],[.72,.56]],[[.80,.32],[.90,.48],[.98,.55]]],
 5:[[[.22,.35],[.12,.66],[.13,.80]],[[.66,.35],[.76,.64],[.80,.78]]],
 6:[[[.25,.29],[.12,.63],[.10,.92]],[[.74,.30],[.86,.65],[.91,.91]]],
 8:[[[.21,.32],[.11,.64],[.13,.80]],[[.74,.34],[.84,.62],[.92,.78]]]
};
function prepareFootworkSkin(rig,box){
 const {cv,legs,id}=rig,src=cv.getContext('2d').getImageData(0,0,256,256),body=new Uint8ClampedArray(src.data),feet=legs.map(()=>new Uint8ClampedArray(src.data.length)),parts=legs.map(()=>[new Uint8ClampedArray(src.data.length),new Uint8ClampedArray(src.data.length)]),arms=(FOOTWORK_ARMS[id]||[]).map(a=>a.map(p=>[box.x+p[0]*box.w,box.y+p[1]*box.h]));
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const k=(y*256+x)*4;if(!src.data[k+3])continue;const point=[x,y],hipY=Math.min(...legs.map(l=>l.p[0][1]));
  const armDistance=Math.min(Infinity,...arms.flatMap(a=>[footworkDistance(point,a[0],a[1]),footworkDistance(point,a[1],a[2])]));
  const hipX=legs.reduce((sum,l)=>sum+l.p[0][0],0)/legs.length,hipRadius=box.w*.24,pelvis=box.h*(.07+.055*Math.sqrt(Math.max(0,1-((x-hipX)/hipRadius)**2)));
  if(y>hipY+pelvis&&armDistance>box.h*.07)body[k+3]=0;
  if(y>hipY&&armDistance>box.h*.07){let nearest=null;for(let i=0;i<legs.length;i++)for(let j=0;j<2;j++){const distance=footworkDistance(point,legs[i].p[j],legs[i].p[j+1]);if(!nearest||distance<nearest.distance)nearest={i,j,distance};}if(nearest&&nearest.distance<box.h*.08)parts[nearest.i][nearest.j].set(src.data.subarray(k,k+4),k);}
  let best=null;for(let i=0;i<legs.length;i++){const l=legs[i],distance=footworkDistance(point,l.p[2],l.p[3]);if(!best||distance<best.distance)best={i,distance};}
  const l=legs[best.i];if(y>=l.p[2][1]-box.h*.055&&best.distance<box.h*.10)feet[best.i].set(src.data.subarray(k,k+4),k);
 }
 const canvas=pixels=>{const cv=document.createElement('canvas');cv.width=cv.height=256;const ctx=cv.getContext('2d'),d=ctx.createImageData(256,256);d.data.set(pixels);ctx.putImageData(d,0,0);return cv;};
 rig.groundOffsets=feet.map(p=>{let bottom=0;for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(p[(y*256+x)*4+3]>16)bottom=Math.max(bottom,y+1);return 240-bottom;});rig.body=canvas(body);rig.feet=feet.map(canvas);rig.parts=parts.map(p=>p.map(canvas));
 rig.colors=({0:['#ab3020','#ab3020'],1:['#151921','#151921'],2:['#142028','#e9f0df'],3:['#11222e','#11222e'],4:['#d78029','#d78029'],5:['#243030','#243030'],6:['#e1e7df','#e1e7df'],8:['#d5ddc2','#d5ddc2']})[id];
 rig.outline=id===0?'#f4cf43':'#172525';rig.width=box.h*(id===5?.052:id===4?.075:id===1?.09:.075);
}
function footworkSample(f,t,rig){
 let s=footworkStates.get(f);if(!s){s={x:f.x,dir:f.dir||1,distance:0,last:t,amount:0};footworkStates.set(f,s)}
 const dt=fwClamp(t-s.last,0,.1),active=!!f.moving&&f.y>=floor-1&&!f.stun&&!f.cast&&!f.block&&!f.jumpWindup&&!f.dash;
 if((f.dir||1)!==s.dir){s.distance=-s.distance;s.dir=f.dir||1;}
 if(active)s.distance+=(f.x-s.x)*(f.dir||1)/rig.scale;
 s.amount=fwClamp(s.amount+(active?1:-1)*dt/.12,0,1);s.x=f.x;s.last=t;
 const phase=s.distance/rig.stride,amount=fwEase(s.amount),reach=rig.stride*.3;
 const pelvisDrop=Math.max(0,...rig.legs.map((l,i)=>l.p[2][1]+rig.groundOffsets[i]-l.p[0][1]-Math.sqrt(Math.max(1,((l.l1+l.l2)*.98)**2-reach**2))))+1;
 const bob=(pelvisDrop-Math.sin(phase*Math.PI*2)**2*rig.standing*.009)*amount;
 const targets=rig.legs.map((leg,i)=>{
  const offset=rig.legs.length===4?[.5,0,0,.5][i]:(i===0?.5:0),cycle=footworkCycle(phase+offset,rig.stride,rig.standing*(f.id===3?.045:.075));
  const base=leg.p,center=base[0][0],ankle=[center+cycle.x,base[2][1]+rig.groundOffsets[i]+cycle.y];
  const hip=[base[0][0],base[0][1]+bob],ik=footworkIK(hip,ankle,leg.l1,leg.l2,leg.bend);
  return [fwMix(base[0],hip,amount),fwMix(base[1],ik.knee,amount),fwMix(base[2],ik.ankle,amount),fwMix(base[3],[ik.ankle[0]+base[3][0]-base[2][0],ik.ankle[1]+base[3][1]-base[2][1]],amount)];
 });
 return {phase,amount,bob,targets};
}
function footworkImage(rig,sample){
 if(!rig.output){rig.output=document.createElement('canvas');rig.output.width=rig.output.height=512;}const cv=rig.output,ctx=cv.getContext('2d');ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,256,256);ctx.lineCap='round';ctx.lineJoin='round';ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const hips=sample.targets.map(t=>t[0]),mid=hips.reduce((a,p)=>[a[0]+p[0]/hips.length,a[1]+p[1]/hips.length],[0,0]);
 for(let i=0;i<hips.length;i++){ctx.beginPath();ctx.moveTo(...mid);ctx.lineTo(...hips[i]);ctx.strokeStyle=rig.outline;ctx.lineWidth=rig.width*1.8+2;ctx.stroke();ctx.strokeStyle=rig.colors[i%2];ctx.lineWidth=rig.width*1.8;ctx.stroke();}
 for(let i=0;i<rig.legs.length;i++){
  const source=rig.legs[i].p,target=sample.targets[i],color=rig.colors[i%2];
  // Overlapping, outlined skin capsules keep the entire leg connected at any joint angle.
  for(let j=0;j<2;j++){const width=rig.width*(j===0?1:.78),a=target[j],b=target[j+1];ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=rig.outline;ctx.lineWidth=width+2;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
   ctx.beginPath();ctx.moveTo(a[0]-width*.14,a[1]);ctx.lineTo(b[0]-width*.14,b[1]);ctx.strokeStyle=rig.id===0?'#e15426':'#ffffff23';ctx.lineWidth=width*.25;ctx.stroke();
   const sa=source[j],sb=source[j+1],vx=sb[0]-sa[0],vy=sb[1]-sa[1],wx=b[0]-a[0],wy=b[1]-a[1],den=vx*vx+vy*vy||1,co=(vx*wx+vy*wy)/den,si=(vx*wy-vy*wx)/den;
   ctx.save();const angle=Math.atan2(b[1]-a[1],b[0]-a[0]),nx=Math.sin(angle)*width*.5,ny=-Math.cos(angle)*width*.5;ctx.beginPath();ctx.moveTo(a[0]+nx,a[1]+ny);ctx.lineTo(b[0]+nx,b[1]+ny);ctx.lineTo(b[0]-nx,b[1]-ny);ctx.lineTo(a[0]-nx,a[1]-ny);ctx.closePath();ctx.clip();ctx.transform(co,si,-si,co,a[0]-co*sa[0]+si*sa[1],a[1]-si*sa[0]-co*sa[1]);ctx.drawImage(rig.parts[i][j],0,0);ctx.restore();
   if(rig.id===0){const mid=fwMix(a,b,.52);ctx.beginPath();ctx.moveTo(a[0]-width*.15,a[1]+2);ctx.lineTo(mid[0]+width*.25,mid[1]);ctx.lineTo(b[0]-width*.16,b[1]-2);ctx.strokeStyle='#ffe47b';ctx.lineWidth=1.6;ctx.stroke();}
  }
  ctx.drawImage(rig.feet[i],target[2][0]-source[2][0],target[2][1]-source[2][1]);
 }
 ctx.drawImage(rig.body,0,sample.bob);return cv;
}
const footworkPreviousDraw=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 if(f.dash&&!portrait){const pose=f.dash.pose||(f.dash.pose={...f,dash:null,moving:false,cast:null,jumpWindup:.07});Object.assign(pose,{x:f.x,y:f.y,dir:f.dir,hp:f.hp});ctx.save();ctx.transform(1,0,-.14*(f.dir||1),.96,f.y*.14*(f.dir||1),f.y*.04);footworkPreviousDraw(ctx,pose,t,false);ctx.restore();return;}
 if(portrait||!FOOTWORK_SPECS[f.id]){footworkPreviousDraw(ctx,f,t,portrait);return}
 const rig=footworkRig(f.id);if(!rig){footworkPreviousDraw(ctx,f,t,portrait);return}const sample=footworkSample(f,t,rig);
 if(sample.amount<=0||f.cast||f.stun||f.block||f.hp<=0||f.y<floor-1||f.jumpWindup||f.dash){footworkPreviousDraw(ctx,f,t,portrait);return}
 const image=footworkImage(rig,sample);ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.dir||1,1);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,-128*rig.scale,-240*rig.scale,256*rig.scale,256*rig.scale);ctx.restore();
};
