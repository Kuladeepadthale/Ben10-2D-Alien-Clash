'use strict';
// Deform the existing classic artwork with a small articulated mesh. No replacement character art.
const motionFrames=new Map();let motionSerial=0;
const smoothRange=(v,a,b)=>{let n=Math.max(0,Math.min(1,(v-a)/(b-a)));return n*n*(3-2*n)};
function motionPoint(x,y,state,p,id,w,h){
 const wave=p*Math.PI*2,side=x<.5?-1:1,leg=smoothRange(y,.58,.92),arm=smoothRange(Math.abs(x-.5),.12,.30)*(1-smoothRange(y,.69,.83))*smoothRange(y,.17,.33),head=1-smoothRange(y,.17,.29);
 let dx=(x-.5)*Math.sin(wave)*.009,dy=-Math.sin(wave)*.006*(1-leg),attack=Math.sin(p*Math.PI),bodyTurn=0;
 if(state==='walk'){
  const stride=Math.sin(wave);dx+=side*stride*.095*leg;dy-=Math.max(0,side*Math.cos(wave))*.085*leg;
  dx-=side*stride*.055*arm;dy+=side*Math.cos(wave)*.035*arm;bodyTurn=stride*.018;
  dy-=Math.abs(stride)*.018*(1-leg);dx-=.025*(1-leg);
 }
 if(state==='normal'||state==='power'||state==='ultimate'){
  // Anticipation, fast extension and longer recovery; repeating fists for a normal combo.
  const strike=smoothRange(p,.12,.43)*(1-smoothRange(p,.56,1)),pull=Math.sin(Math.min(1,p/.27)*Math.PI)*.025;
  const both=state==='ultimate',forward=both?1:smoothRange(x,.42,.72),weight=arm*(both?1:forward);
  const angle=-strike*(state==='normal'?.62:state==='ultimate'?.85:.65)*(both&&x<.5?-1:1);
  const px=x<.5?.33:.66,py=.29,vx=(x-px)*w,vy=(y-py)*h;
  dx+=(vx*Math.cos(angle)-vy*Math.sin(angle)-vx)/w*weight;dy+=(vx*Math.sin(angle)+vy*Math.cos(angle)-vy)/h*weight;
  dx+=strike*.055*(1-leg)-pull*(1-leg);dy+=strike*.035*leg;dx+=side*strike*.035*leg;
  bodyTurn=strike*.035;dx+=bodyTurn*(.6-y);dy-=strike*.015*head;
  if(id===1)dx+=Math.sin(p*Math.PI*4)*arm*.035;
  if(id===4){dx+=strike*.10*smoothRange(x,.35,.8);dy-=strike*.06*(1-leg)}
 }
 if(state==='guard'){dx-=side*arm*.10;dy-=arm*.15;dy+=leg*.045;dx-=.03*(1-leg)}
 if(state==='jump'){dx+=side*leg*.075;dy-=leg*.15;dx+=side*arm*.045;dy-=arm*.07}
 if(state==='hit'){dx-=attack*.10*(1-leg);dy+=attack*.045*(1-leg);dx+=side*arm*attack*.05}
 if(id===4&&state==='walk'){dx+=Math.sin(wave+side*1.5)*.06*leg;dy-=Math.max(0,Math.cos(wave+side*1.5))*.07*leg}
 if(id===7){const wing=(1-smoothRange(y,.33,.65))*(1-smoothRange(x,.68,.92));dx+=(.6-x)*Math.sin(wave*2)*.18*wing;dy+=(.58-y)*Math.sin(wave*2)*.12*wing}
 if(id===9){dx+=Math.sin(wave+y*6)*.06*smoothRange(y,.45,.95);dy-=.018*Math.sin(wave)}
 if(id===6){dx+=Math.sin(wave+y*8)*.018;dy+=Math.sin(wave+x*6)*.01}
 if(id===3&&state==='walk'){dx-=.06*(1-leg);dy-=Math.sin(wave*2)*.025}
 return [160+(x-.5)*w+dx*w,306-h+y*h+dy*h];
}
function meshTriangle(ctx,img,s,d){const [s0,s1,s2]=s,[d0,d1,d2]=d,den=(s1[0]-s0[0])*(s2[1]-s0[1])-(s2[0]-s0[0])*(s1[1]-s0[1]);if(!den)return;
 const a=((d1[0]-d0[0])*(s2[1]-s0[1])-(d2[0]-d0[0])*(s1[1]-s0[1]))/den,b=((d1[1]-d0[1])*(s2[1]-s0[1])-(d2[1]-d0[1])*(s1[1]-s0[1]))/den,cc=((d2[0]-d0[0])*(s1[0]-s0[0])-(d1[0]-d0[0])*(s2[0]-s0[0]))/den,dd=((d2[1]-d0[1])*(s1[0]-s0[0])-(d1[1]-d0[1])*(s2[0]-s0[0]))/den;
 ctx.save();ctx.beginPath();let cx=(d0[0]+d1[0]+d2[0])/3,cy=(d0[1]+d1[1]+d2[1])/3;d.forEach((q,i)=>{let x=q[0]+Math.sign(q[0]-cx)*1.1,y=q[1]+Math.sign(q[1]-cy)*1.1;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.clip();ctx.transform(a,b,cc,dd,d0[0]-a*s0[0]-cc*s0[1],d0[1]-b*s0[0]-dd*s0[1]);ctx.drawImage(img,0,0);ctx.restore();
}
function rigFrame(id,state,index){let key=id+':'+state+':'+index,entry=motionFrames.get(key);if(entry){entry.used=++motionSerial;return entry.canvas}const img=classicPortraits[id];if(!img)return null;
 let cv=document.createElement('canvas');cv.width=320;cv.height=320;const ctx=cv.getContext('2d'),w=Math.min(260,240*img.width/img.height),h=w*img.height/img.width,cols=10,rows=14,points=[];
 const loop=['idle','walk','guard'].includes(state),p=index/(loop?16:15);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 for(let y=0;y<=rows;y++){points[y]=[];for(let x=0;x<=cols;x++)points[y][x]=motionPoint(x/cols,y/rows,state,p,id,w,h)}
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const src=[[x/cols*img.width,y/rows*img.height],[(x+1)/cols*img.width,y/rows*img.height],[x/cols*img.width,(y+1)/rows*img.height],[(x+1)/cols*img.width,(y+1)/rows*img.height]],dst=[points[y][x],points[y][x+1],points[y+1][x],points[y+1][x+1]];meshTriangle(ctx,img,[src[0],src[1],src[2]],[dst[0],dst[1],dst[2]]);meshTriangle(ctx,img,[src[1],src[3],src[2]],[dst[1],dst[3],dst[2]])}
 motionFrames.set(key,{canvas:cv,used:++motionSerial});if(motionFrames.size>112){const oldest=[...motionFrames.entries()].reduce((a,b)=>a[1].used<b[1].used?a:b);motionFrames.delete(oldest[0])}return cv;
}
const sheetDrawAlien=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){if(portrait){sheetDrawAlien(ctx,f,t,true);return}const img=classicPortraits[f.id];if(!img)return;const id=f.id,a=aliens[id];let state=classicState(f),v=f.cast,duration=v?v.cfg.windup+(v.cfg.duration||.08)+v.cfg.recovery:1,elapsed=v?v.elapsed:f.anim||0,p;
 if(state==='walk')p=((f.walk||0)/(id===3?6:8))%1;else if(['normal','power','ultimate'].includes(state))p=Math.min(.999,elapsed/duration);else if(state==='hit')p=1-Math.max(0,f.stun||0)/.24;else if(state==='jump')p=Math.max(0,Math.min(1,1-((f.y??floor)-floor+220)/220));else p=(t/(id===7?.65:1.5)+id*.13)%1;
 const frame=rigFrame(id,state,Math.max(0,Math.min(15,Math.floor(p*16))));if(!frame)return;
 const baseW=Math.min(260,240*img.width/img.height),artH=baseW*img.height/img.width,wantedH=(id===4?142:226)*a.scale,scale=wantedH/artH;
 ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.dir||1,1);
 let bob=state==='walk'?-Math.abs(Math.sin(p*Math.PI*2))*7:Math.sin(t*4+id)*2.6,lean=state==='walk'?(id===3?.14:.055):0;
 if(id===7||id===9)bob-=8+Math.sin(t*5)*8;
 if(v){let strike=smoothRange(v.elapsed,Math.max(.01,v.cfg.windup*.6),v.cfg.windup+.07)*(1-smoothRange(v.elapsed,v.cfg.windup+.13,duration));ctx.translate(strike*(v.key==='normal'?27:12),0);lean+=strike*(v.key==='normal'?.075:.035);if(v.cfg.kind==='rush')lean+=.15}
 if(f.stun>0||f.hitTint>0){lean-=.22*Math.max(f.stun||0,f.hitTint||0)/.24;ctx.translate(-5,3)}
 if(f.block){lean=-.045;ctx.translate(-5,4)}
 if(f.hp<=0){lean=-1.45;bob=3;ctx.translate(-15,0)}
 ctx.translate(0,bob);ctx.rotate(lean);if(id===9&&f.inv>0)ctx.globalAlpha*=.3;
 if(f.moving&&id===3){ctx.save();ctx.globalAlpha*=.16;for(let n=3;n>0;n--)ctx.drawImage(frame,-160*scale-n*17,-306*scale,320*scale,320*scale);ctx.restore()}
 ctx.drawImage(frame,-160*scale,-306*scale,320*scale,320*scale);
 if(id===0&&f.hp>0){ctx.save();ctx.globalCompositeOperation='screen';const col='#ffd861';ctx.fillStyle=col;for(let k=0;k<5;k++){let phase=(t*2+k*.21)%1;ctx.globalAlpha=(1-phase)*.7;ctx.beginPath();ctx.arc((k-2)*9+Math.sin(t*5+k)*5,-wantedH-10-phase*22,1.2+phase,0,7);ctx.fill()}ctx.restore()}
 ctx.restore();
};
