'use strict';
// Hierarchical bones + blended skin weights keep a single continuous alien surface.
// Bind landmarks refer to the existing classic illustration, not to a generated replacement.
const humanoid=(head,neck,chest,waist,L,R,LL,RL)=>({head,neck,chest,waist,arms:[{name:'left',points:L},{name:'right',points:R}],legs:[{name:'left',points:LL},{name:'right',points:RL}]});
const alienSkeletons=[
 humanoid([.56,.10],[.56,.23],[.56,.31],[.52,.50],[[.28,.27],[.17,.42],[.16,.57],[.23,.66]],[[.77,.28],[.85,.44],[.85,.57],[.86,.64]],[[.40,.51],[.30,.73],[.29,.91],[.30,.98]],[[.65,.52],[.65,.72],[.67,.89],[.83,.94]]),
 humanoid([.61,.06],[.61,.14],[.60,.26],[.56,.48],[[.22,.20],[.10,.39],[.12,.56],[.14,.64]],[[.79,.22],[.89,.40],[.92,.55],[.92,.63]],[[.43,.49],[.38,.72],[.38,.90],[.39,.97]],[[.65,.49],[.61,.68],[.60,.87],[.75,.91]]),
 humanoid([.58,.12],[.58,.24],[.56,.30],[.53,.52],[[.26,.27],[.17,.44],[.17,.63],[.21,.72]],[[.77,.27],[.82,.44],[.87,.62],[.86,.72]],[[.45,.53],[.38,.75],[.34,.93],[.32,.98]],[[.64,.53],[.60,.74],[.66,.89],[.79,.93]]),
 humanoid([.86,.14],[.81,.24],[.70,.33],[.53,.48],[[.52,.29],[.60,.39],[.72,.47],[.78,.49]],[[.77,.32],[.89,.40],[.96,.47],[.98,.52]],[[.51,.49],[.36,.69],[.24,.89],[.23,.95]],[[.65,.50],[.76,.63],[.62,.73],[.73,.90]]),
 humanoid([.24,.44],[.35,.31],[.43,.25],[.68,.31],[[.19,.52],[.14,.69],[.09,.85],[.06,.90]],[[.35,.55],[.34,.75],[.38,.90],[.46,.94]],[[.61,.33],[.69,.62],[.89,.83],[.98,.88]],[[.53,.38],[.45,.61],[.49,.84],[.56,.88]]),
 humanoid([.57,.13],[.50,.29],[.46,.37],[.48,.60],[[.25,.35],[.12,.50],[.11,.66],[.21,.79]],[[.57,.34],[.65,.50],[.69,.65],[.68,.78]],[[.38,.61],[.35,.77],[.28,.91],[.26,.98]],[[.56,.61],[.53,.76],[.52,.87],[.72,.90]]),
 humanoid([.61,.11],[.57,.24],[.52,.34],[.49,.61],[[.31,.28],[.17,.52],[.12,.73],[.16,.92]],[[.70,.31],[.78,.53],[.85,.73],[.88,.91]],[[.40,.62],[.36,.78],[.33,.94],[.27,.98]],[[.58,.62],[.59,.78],[.63,.93],[.68,.96]]),
 humanoid([.81,.48],[.71,.52],[.64,.61],[.57,.72],[[.60,.56],[.69,.59],[.85,.59],[.89,.56]],[[.68,.62],[.79,.68],[.94,.72],[.99,.75]],[[.55,.70],[.51,.81],[.50,.93],[.50,.99]],[[.68,.70],[.75,.81],[.80,.91],[.83,.97]]),
 humanoid([.64,.13],[.60,.22],[.52,.31],[.50,.49],[[.23,.28],[.16,.47],[.20,.64],[.21,.72]],[[.68,.30],[.76,.47],[.75,.63],[.80,.69]],[[.36,.50],[.34,.75],[.27,.93],[.25,.99]],[[.58,.50],[.59,.73],[.62,.89],[.82,.93]]),
 {head:[.50,.10],neck:[.49,.23],chest:[.47,.35],waist:[.40,.58],arms:[{name:'left',points:[[.35,.31],[.12,.42],[.22,.56],[.31,.68]]},{name:'right',points:[[.58,.32],[.66,.43],[.81,.57],[.93,.68]]}],legs:[]}
];
// Extra anatomical branches: all four arms, four quadruped limbs, wings and spectral tail.
alienSkeletons[1].arms.push({name:'lowerLeft',points:[[.35,.33],[.29,.48],[.32,.63],[.33,.70]]},{name:'lowerRight',points:[[.72,.34],[.74,.49],[.76,.64],[.76,.70]]});
alienSkeletons[7].extra=[{name:'wingLeft',parent:'chest',points:[[.61,.54],[.44,.36],[.12,.08]]},{name:'wingRight',parent:'chest',points:[[.68,.50],[.78,.27],[.78,.04]]}];
alienSkeletons[3].extra=[{name:'tail',parent:'waist',points:[[.52,.49],[.13,.48],[.17,.64]]}];
alienSkeletons[9].extra=[{name:'tail',parent:'waist',points:[[.40,.59],[.28,.80],[.08,.98]]}];
const jointRigCache=new Map(),jointMotionRecords=new WeakMap();
const mat=(a=1,b=0,c=0,d=1,x=0,y=0)=>[a,b,c,d,x,y];
function matrixMultiply(A,B){return [A[0]*B[0]+A[2]*B[1],A[1]*B[0]+A[3]*B[1],A[0]*B[2]+A[2]*B[3],A[1]*B[2]+A[3]*B[3],A[0]*B[4]+A[2]*B[5]+A[4],A[1]*B[4]+A[3]*B[5]+A[5]];}
function jointMatrix(x,y,angle){const c=Math.cos(angle),s=Math.sin(angle);return [c,s,-s,c,x,y];}
function segmentDistance(p,a,b){let dx=b[0]-a[0],dy=b[1]-a[1],k=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-k*dx,p[1]-a[1]-k*dy);}
function buildJointRig(id,cols=18,rows=28){const key=id+':'+cols+':'+rows;if(jointRigCache.has(key))return jointRigCache.get(key);const spec=alienSkeletons[id],image=classicPortraits[id],w=Math.min(260,240*image.width/image.height),h=w*image.height/image.width,toPx=([x,y])=>[192+(x-.5)*w,366-h+y*h],bones=[],groups=[];
 function add(name,parent,at,tip,group){const bone={name,parent,at:toPx(at),tip:toPx(tip),index:bones.length,group};bones.push(bone);return bone.index;}
 const waist=add('waist',-1,spec.waist,spec.chest,'body'),chest=add('chest',waist,spec.chest,spec.neck,'body'),head=add('head',chest,spec.neck,spec.head,'head');groups.push({name:'head',bones:[head],points:[toPx(spec.neck),toPx(spec.head)],parent:chest});
 function branch(name,points,parent,type){let indices=[],last=parent;for(let i=0;i<points.length-1;i++){last=add(name+i,last,points[i],points[i+1],name);indices.push(last)}groups.push({name,type,bones:indices,points:points.map(toPx),parent});}
 for(const arm of spec.arms)branch('arm_'+arm.name,arm.points,chest,'arm');for(const leg of spec.legs)branch('leg_'+leg.name,leg.points,waist,'leg');for(const extra of spec.extra||[])branch(extra.name,extra.points,extra.parent==='chest'?chest:waist,'extra');
 const vertices=[];for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){
 const px=toPx([x/cols,y/rows]),uv=[x/cols,y/rows],ny=y/rows;let weights=[];
 // Smooth distance fields overlap at joints; no hard part boundaries or torn cutouts.
 for(const b of bones){let gate=1;
  if(b.group.startsWith('leg_'))gate=smoothRange(ny,spec.waist[1]-.06,spec.waist[1]+.04);
  if(b.group.startsWith('arm_')){const arm=spec.arms.find(a=>'arm_'+a.name===b.group);const maxY=Math.max(...arm.points.map(p=>p[1]));gate*=1-smoothRange(ny,maxY+.015,maxY+.10);}
  if(b.name==='head')gate*=1-smoothRange(ny,Math.max(spec.neck[1],spec.head[1])+.02,Math.max(spec.neck[1],spec.head[1])+.12);
  const distance=segmentDistance(px,b.at,b.tip),score=gate/Math.pow(distance+4,4);if(score>0)weights.push([b.index,score]);
 }
 weights.sort((a,b)=>b[1]-a[1]);weights=weights.slice(0,4);let sum=weights.reduce((s,b)=>s+b[1],0);if(sum<1e-15){weights=[[waist,1]];sum=1;}
 vertices.push({point:px,uv,weights:weights.map(([i,n])=>[i,n/sum])});
 }
 const rig={id,cols,rows,bones,vertices,w,h};jointRigCache.set(key,rig);return rig;}
function jointTargets(f,pose,t){const spec=alienSkeletons[f.id],angles={waist:pose.lean*.45,chest:pose.lean*.35,head:-pose.lean*.42+Math.sin(t*2.5)*.012},wave=Math.sin(pose.walk),pr=movementProfiles[f.id],env=attackEnvelope(f.cast),strike=env.release;
 for(const arm of spec.arms){let side=arm.name.toLowerCase().includes('left')?-1:1,lower=arm.name.startsWith('lower'),a=side<0?pose.left:pose.right,phase=lower?Math.PI:0;
 angles['arm_'+arm.name+'0']=a*.72+Math.sin(pose.walk+phase)*.10*pose.step*(side<0?1:-1);
 angles['arm_'+arm.name+'1']=a*.75-Math.max(0,Math.sin(pose.walk+phase))*.11*pose.step;
 angles['arm_'+arm.name+'2']=-a*.18;
 if(f.block){angles['arm_'+arm.name+'0']=side<0?.25:-.35;angles['arm_'+arm.name+'1']=side<0?.48:-.72;angles['arm_'+arm.name+'2']=side<0?-.12:.1;}
 if(f.cast?.key==='normal'&&side>0){angles['arm_'+arm.name+'0']=(f.id===4?.28:-.48)*strike;angles['arm_'+arm.name+'1']=(f.id===4?.34:-.63)*strike;angles['arm_'+arm.name+'2']=.12*strike;}
 if(f.id===1&&lower){angles['arm_'+arm.name+'0']*=.8;angles['arm_'+arm.name+'1']+=Math.sin((f.cast?.elapsed||0)*15+side)*strike*.17;}
 }
 for(const leg of spec.legs){const side=leg.name==='left'?-1:1,phase=pose.walk+(f.id===4?side*.9:0),swing=Math.sin(phase)*side*pose.step;
 angles['leg_'+leg.name+'0']=swing*(f.id===3?.30:.19);angles['leg_'+leg.name+'1']=-Math.max(0,-swing)*.30;angles['leg_'+leg.name+'2']=-angles['leg_'+leg.name+'0']*.6-angles['leg_'+leg.name+'1']*.4;
 if(f.y<floor-3){angles['leg_'+leg.name+'0']+=side*.17;angles['leg_'+leg.name+'1']-=.25;angles['leg_'+leg.name+'2']+=.1;}
 angles['leg_'+leg.name+'0']+=side*pose.crouch*2;angles['leg_'+leg.name+'1']-=pose.crouch*4;
 }
 if(pose.ko){angles.waist=-.025;angles.chest=.025;angles.head=0;}angles.wingLeft0=Math.sin(t*18)*.15;angles.wingLeft1=-Math.sin(t*18)*.08;angles.wingRight0=-Math.sin(t*18)*.12;angles.wingRight1=Math.sin(t*18)*.06;angles.tail0=Math.sin(t*4)*.035;angles.tail1=Math.sin(t*4-1)*.055;
 return angles;}
function skinJointRig(rig,angles){const world=[];for(const b of rig.bones){const parent=b.parent<0?null:rig.bones[b.parent],local=jointMatrix(b.at[0]-(parent?parent.at[0]:0),b.at[1]-(parent?parent.at[1]:0),angles[b.name]||0);world[b.index]=parent?matrixMultiply(world[b.parent],local):local;}
 const points=[];for(let y=0;y<=rig.rows;y++){points[y]=[];for(let x=0;x<=rig.cols;x++){const v=rig.vertices[y*(rig.cols+1)+x];let px=0,py=0;for(const [bi,weight] of v.weights){const b=rig.bones[bi],m=world[bi],dx=v.point[0]-b.at[0],dy=v.point[1]-b.at[1];px+=(m[0]*dx+m[2]*dy+m[4])*weight;py+=(m[1]*dx+m[3]*dy+m[5])*weight;}points[y][x]=[px,py];}}return points;}
const jointPortraitDraw=originalPortraitDraw;
drawAlien=function(ctx,f,t,portrait=false){if(portrait){jointPortraitDraw(ctx,f,t,true);return}const image=classicPortraits[f.id];if(!image)return;if(rigGPU===undefined)rigGPU=initRigGPU();const useGPU=!!rigGPU&&!rigGPULost,rig=buildJointRig(f.id,useGPU?18:10,useGPU?28:18),pose=blendedPose(f,t),target=jointTargets(f,pose,t);let record=jointMotionRecords.get(f);if(!record){record={angles:{...target},last:t};jointMotionRecords.set(f,record)}let dt=Math.max(0,Math.min(.08,t-record.last)),blend=1-Math.exp(-dt*26);for(const name in target)record.angles[name]+=(target[name]-record.angles[name])*blend;record.last=t;
 const points=skinJointRig(rig,record.angles),frame=drawRigImage(f.id,points,rig.cols,rig.rows),scale=(f.id===4?142:226)*aliens[f.id].scale/rig.h;ctx.save();ctx.translate(f.x+(f.dir||1)*pose.shift,f.y+pose.bob+pose.crouch*45);const sourceFacing=f.id===4?-1:1;ctx.scale((f.dir||1)*sourceFacing,1);ctx.rotate((-1.42*pose.ko+pose.lean*.35*(1-pose.ko))*sourceFacing);if(f.id===9&&f.inv>0)ctx.globalAlpha*=.28;if(f.id===3&&f.moving){ctx.save();ctx.globalAlpha*=.09;ctx.drawImage(frame,-192*scale-18,-366*scale,384*scale,384*scale);ctx.restore()}ctx.drawImage(frame,-192*scale,-366*scale,384*scale,384*scale);ctx.restore();};
