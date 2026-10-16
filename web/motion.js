'use strict';
// Continuous image rig. These are new gameplay motions, not extracted cartoon frames.
const smoothRange=(v,a,b)=>{let n=Math.max(0,Math.min(1,(v-a)/(b-a)));return n*n*(3-2*n)};
const movementProfiles=[
 {gait:.64,stride:.044,arms:.045,breath:1.8,hover:0,weight:1,lean:.025},
 {gait:.84,stride:.036,arms:.055,breath:2,hover:0,weight:1.25,lean:.025},
 {gait:.76,stride:.036,arms:.036,breath:1.1,hover:0,weight:1.1,lean:.02},
 {gait:.36,stride:.045,arms:.035,breath:1.3,hover:0,weight:.65,lean:.10},
 {gait:.48,stride:.055,arms:.035,breath:2.4,hover:0,weight:.95,lean:.035},
 {gait:.44,stride:.042,arms:.045,breath:1.4,hover:0,weight:.55,lean:.035},
 {gait:.78,stride:.025,arms:.026,breath:1.3,hover:0,weight:.9,lean:.02},
 {gait:.42,stride:.015,arms:.025,breath:1.2,hover:7,weight:.55,lean:.035},
 {gait:.72,stride:.044,arms:.045,breath:1.9,hover:0,weight:1.1,lean:.035},
 {gait:1.05,stride:.012,arms:.02,breath:1,hover:9,weight:.5,lean:.015}
];
function attackEnvelope(v){if(!v)return {prepare:0,release:0,recover:0,pulse:0};const w=Math.max(.01,v.cfg.windup),d=['rush','pounce'].includes(v.cfg.kind)?Math.max(.42,v.cfg.duration||.08):v.cfg.duration||.08,e=v.elapsed,a=Math.max(0,e-w),recovery=Math.max(.01,v.cfg.recovery);
 const prepare=smoothRange(e,0,w),recover=smoothRange(e,w+d,w+d+recovery),release=smoothRange(e,w*.55,w)*(1-recover),ticks=v.cfg.ticks||1;
 const pulse=e<w?0:e<=w+d?(ticks===1?1:.65+.35*Math.sin(Math.min(1,a/d)*Math.PI*ticks*2-Math.PI/2)):1-recover;
 return {prepare:prepare*(1-recover),release,recover,pulse};
}
function movementPose(f,t){const id=f.id,pr=movementProfiles[id],v=f.cast,state=f.hp<=0?'ko':f.stun>0?'hit':f.block?'guard':v?(v.ultimate?'ultimate':v.key==='normal'?'normal':'power'):f.y<floor-3?'jump':f.moving?'walk':'idle';
 const walk=(f.walk||0)/12/pr.gait*Math.PI*2,breath=Math.sin(t*3.6+id),pose={state,walk,step:state==='walk'?1:0,left:0,right:0,crouch:0,lean:0,shift:0,lift:0,spread:0,ripple:0,ko:0,bob:breath*pr.breath};
 if(state==='walk'){pose.lean=pr.lean;pose.bob-=Math.abs(Math.sin(walk))*3.5*pr.weight;pose.left=Math.sin(walk)*.06;pose.right=-pose.left;}
 if(pr.hover&&state!=='ko'){pose.bob=-pr.hover+Math.sin(t*(id===7?5:3.5))*3;}
 if(state==='guard'){pose.left=.22;pose.right=-.28;pose.crouch=.022;pose.lean=-.025;pose.shift=-4;}
 if(state==='jump'){const height=Math.max(0,floor-f.y),tuck=smoothRange(height,0,145);pose.crouch=-.07*tuck;pose.spread=.025*tuck;pose.left=.18*tuck;pose.right=-.18*tuck;pose.lean=Math.max(-.045,Math.min(.045,-f.vy*.00012));}
 if(state==='hit'){const h=Math.max(f.stun||0,f.hitTint||0)/.22;pose.lean=-.14*h;pose.shift=-9*h;pose.right=.15*h;pose.left=-.12*h;pose.crouch=.025*h;}
 if(state==='ko'){pose.ko=1;pose.lean=-1.42;pose.shift=-12;pose.crouch=.035;}
 if(v&&state!=='hit'&&state!=='ko'){const e=attackEnvelope(v),kind=v.cfg.kind,normal=v.key==='normal',prp=e.prepare,s=e.release,p=e.pulse,chain=f.normalChain||0;
  pose.shift=-5*prp*(1-s)+s*(normal?15:6);pose.lean=-.024*prp*(1-s)+.025*s;pose.crouch=.008*s;
  if(normal){pose.right=-.52*s;pose.left=.10*s;if(chain===1){pose.left=.37*s;pose.right=-.12*s}if(chain===2){pose.crouch=.025*s;pose.right=-.60*s;pose.lean=.055*s}if(id===4||id===8){pose.lean=.10*s;pose.shift=20*s;pose.right=-.18*s;pose.left=.13*s}if(id===1)pose.left=.24*s;}
  else if(['projectile','lob','rain'].includes(kind)){pose.right=-.42*s;pose.left=.12*prp;pose.lean=-.025*prp+.045*s;if(kind==='lob')pose.right=-.54*s;if(kind==='rain'){pose.right=-.48*s;pose.left=.42*s;pose.spread=.02*s;}}
  else if(kind==='beam'){pose.right=-.40*s;pose.left=id===6?.04:.24*s;pose.lean=-.035*s;pose.shift=-4*s;}
  else if(['ground','eruption','spikes','leapslam'].includes(kind)){const slam=smoothRange(v.elapsed,Math.max(0,v.cfg.windup-.09),v.cfg.windup+.12);pose.left=.48*prp*(1-slam)-.12*s;pose.right=-.50*prp*(1-slam)+.15*s;pose.crouch=.045*s;pose.lean=.045*s;pose.spread=.022*s;}
  else if(['rush','pounce'].includes(kind)){pose.lean=(id===3?.13:.08)*s;pose.crouch=.025*s;pose.left=.12*s;pose.right=.10*s;pose.step=s;pose.walk=t*(id===3?22:14);}
  else if(kind==='trap'){pose.crouch=.05*s;pose.right=.20*s;pose.left=.08*s;pose.lean=.07*s;}
  else if(kind==='wave'||kind==='vortex'){pose.left=.32*s;pose.right=-.38*s;pose.ripple=.014*s;pose.lean=.02*Math.sin(v.elapsed*10)*s;}
  else if(kind==='melee'){pose.right=-.42*s*p;pose.left=.25*s*(1-p*.5);pose.lean=.04*s*p;if(id===8){pose.lean=.09*s*p;pose.shift=17*s*p}if(id===9)pose.ripple=.03*s;}
  if(id===1&&v.cfg.ticks>1){pose.right-=.13*s*Math.sin(v.elapsed*20);pose.left+=.12*s*Math.sin(v.elapsed*20+Math.PI);}
  if(id===6)pose.ripple+=.012*s;if(v.ultimate){pose.left*=1.12;pose.right*=1.12;}
 }
 if(id===9&&state!=='ko')pose.ripple+=.016;return pose;
}
function pointFromPose(x,y,pose,id,w,h,t){const pr=movementProfiles[id],side=x<.5?-1:1,leg=smoothRange(y,.57,.94),arm=smoothRange(Math.abs(x-.5),.12,.24)*(1-smoothRange(y,.79,.94))*smoothRange(y,.17,.32),lower=smoothRange(y,.50,.94),stride=Math.sin(pose.walk+(id===4?side*1.2:0));
 let dx=side*stride*pr.stride*leg*pose.step,dy=-Math.max(0,side*Math.cos(pose.walk))*pr.stride*.8*leg*pose.step;
 dx-=side*stride*pr.arms*arm*pose.step;dy+=pose.crouch*lower;dx+=side*pose.spread*leg;
 const angle=x<.5?pose.left:pose.right,px=x<.5?.33:.67,py=.29,vx=(x-px)*w,vy=(y-py)*h;
 dx+=(vx*Math.cos(angle)-vy*Math.sin(angle)-vx)/w*arm;dy+=(vx*Math.sin(angle)+vy*Math.cos(angle)-vy)/h*arm;
 dx+=Math.sin(t*4+y*7)*pose.ripple*smoothRange(y,.42,.94);
 if(id===7){const wing=(1-smoothRange(y,.33,.63))*(1-smoothRange(x,.66,.93));dx+=(.6-x)*Math.sin(t*20)*.07*wing;dy+=(.58-y)*Math.sin(t*20)*.045*wing;}
 return [160+(x-.5)*w+dx*w,306-h+y*h+dy*h];
}
function meshTriangle(ctx,img,s,d){const [s0,s1,s2]=s,[d0,d1,d2]=d,den=(s1[0]-s0[0])*(s2[1]-s0[1])-(s2[0]-s0[0])*(s1[1]-s0[1]);if(!den)return;const a=((d1[0]-d0[0])*(s2[1]-s0[1])-(d2[0]-d0[0])*(s1[1]-s0[1]))/den,b=((d1[1]-d0[1])*(s2[1]-s0[1])-(d2[1]-d0[1])*(s1[1]-s0[1]))/den,cc=((d2[0]-d0[0])*(s1[0]-s0[0])-(d1[0]-d0[0])*(s2[0]-s0[0]))/den,dd=((d2[1]-d0[1])*(s1[0]-s0[0])-(d1[1]-d0[1])*(s2[0]-s0[0]))/den;ctx.save();ctx.beginPath();const cx=(d0[0]+d1[0]+d2[0])/3,cy=(d0[1]+d1[1]+d2[1])/3;d.forEach((q,i)=>{const x=q[0]+Math.sign(q[0]-cx)*.8,y=q[1]+Math.sign(q[1]-cy)*.8;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.clip();ctx.transform(a,b,cc,dd,d0[0]-a*s0[0]-cc*s0[1],d0[1]-b*s0[0]-dd*s0[1]);ctx.drawImage(img,0,0);ctx.restore();}
// One texture upload per alien; continuous vertices replace runtime frame generation/cache churn.
let rigGPU,rigGPULost=false;
function initRigGPU(){try{const cv=document.createElement('canvas');cv.width=cv.height=384;const gl=cv.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:true});if(!gl||typeof gl.createShader!=='function')return null;
 const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s},program=gl.createProgram();
 gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 aPosition; attribute vec2 aUV; varying vec2 vUV; void main(){gl_Position=vec4(aPosition.x/192.0-1.0,1.0-aPosition.y/192.0,0.0,1.0);vUV=aUV;}'));
 gl.attachShader(program,compile(gl.FRAGMENT_SHADER,'precision mediump float; uniform sampler2D uImage; varying vec2 vUV; void main(){gl_FragColor=texture2D(uImage,vUV);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('program');gl.useProgram(program);gl.viewport(0,0,384,384);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);for(const [name,size,offset] of [['aPosition',2,0],['aUV',2,8]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,16,offset)}gl.uniform1i(gl.getUniformLocation(program,'uImage'),0);
 cv.addEventListener('webglcontextlost',e=>{e.preventDefault();rigGPULost=true});cv.addEventListener('webglcontextrestored',()=>{rigGPU=undefined;rigGPULost=false});return {cv,gl,buffer,textures:new Map()};
 }catch{return null}}
const rigFallback=document.createElement('canvas');rigFallback.width=rigFallback.height=384;
function drawRigImage(id,points,cols,rows){const img=classicPortraits[id];if(rigGPU===undefined)rigGPU=initRigGPU();const gpu=!rigGPULost&&rigGPU;
 if(gpu){try{const {gl}=gpu;let tex=gpu.textures.get(id);if(!tex){tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gpu.textures.set(id,tex)}else gl.bindTexture(gl.TEXTURE_2D,tex);
 const data=gpu.data&&gpu.data.length===cols*rows*24?gpu.data:(gpu.data=new Float32Array(cols*rows*24));let k=0;const emit=(x,y)=>{data[k++]=points[y][x][0];data[k++]=points[y][x][1];data[k++]=x/cols;data[k++]=y/rows};for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){emit(x,y);emit(x+1,y);emit(x,y+1);emit(x+1,y);emit(x+1,y+1);emit(x,y+1)}gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.bindBuffer(gl.ARRAY_BUFFER,gpu.buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,cols*rows*6);return gpu.cv;
 }catch{rigGPU=null}}
 const ctx=rigFallback.getContext('2d');ctx.clearRect(0,0,384,384);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=[x/cols*img.width,y/rows*img.height],b=[(x+1)/cols*img.width,y/rows*img.height],d=[x/cols*img.width,(y+1)/rows*img.height],e=[(x+1)/cols*img.width,(y+1)/rows*img.height];meshTriangle(ctx,img,[a,b,d],[points[y][x],points[y][x+1],points[y+1][x]]);meshTriangle(ctx,img,[b,e,d],[points[y][x+1],points[y+1][x+1],points[y+1][x]])}return rigFallback;
}
const rigMotions=new WeakMap(),originalPortraitDraw=drawAlien;
function blendedPose(f,t){const target=movementPose(f,t);let record=rigMotions.get(f);if(!record){record={pose:{...target},last:t,lastY:f.y,airborne:f.y<floor-2,landing:0};rigMotions.set(f,record)}const dt=Math.max(0,Math.min(.08,t-record.last));if(f.y<floor-2)record.airborne=true;if(record.airborne&&f.y>=floor-1){record.landing=1;record.airborne=false;}record.landing=Math.max(0,record.landing-dt*8);const blend=1-Math.exp(-dt*(target.state==='hit'?38:target.state==='normal'?32:20));for(const k of Object.keys(target)){if(typeof target[k]==='number'&&k!=='walk')record.pose[k]+=(target[k]-record.pose[k])*blend;else record.pose[k]=target[k]}record.last=t;record.lastY=f.y;return {...record.pose,crouch:record.pose.crouch+record.landing*.025,bob:record.pose.bob+record.landing*2};}
drawAlien=function(ctx,f,t,portrait=false){if(portrait){originalPortraitDraw(ctx,f,t,true);return}const img=classicPortraits[f.id];if(!img)return;const id=f.id,pose=blendedPose(f,t),w=Math.min(260,240*img.width/img.height),h=w*img.height/img.width,cols=8,rows=12,points=[];for(let y=0;y<=rows;y++){points[y]=[];for(let x=0;x<=cols;x++)points[y][x]=pointFromPose(x/cols,y/rows,pose,id,w,h,t)}const frame=drawRigImage(id,points,cols,rows),scale=(id===4?142:226)*aliens[id].scale/h;
 ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.dir||1,1);ctx.translate(pose.shift,pose.bob);ctx.rotate(pose.lean);if(id===9&&f.inv>0)ctx.globalAlpha*=.28;
 if(id===3&&f.moving){ctx.save();ctx.globalAlpha*=.10;ctx.drawImage(frame,-160*scale-23,-306*scale,320*scale,320*scale);ctx.restore()}ctx.drawImage(frame,-160*scale,-306*scale,320*scale,320*scale);ctx.restore();
};
preloadClassic=function(){};
