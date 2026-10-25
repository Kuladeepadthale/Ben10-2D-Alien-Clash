'use strict';
// Native whole-body attack cels and species geometry; card images never enter combat.
const powers129Keys={3:['skill1','skill2','ultimate'],6:['skill2'],12:['skill0','ultimate'],16:['skill0','skill1','skill2','ultimate'],41:['skill2','ultimate'],53:['skill1','ultimate'],61:['skill0','skill1','skill2','ultimate'],86:['skill0','skill1','skill2','ultimate']};
const powers129PhaseBase=celPhase,powers129DrawBase=drawAlien,powers129EffectBase=drawEffect,powers129ShotBase=drawShot;
const powers129Clamp=x=>Math.max(0,Math.min(1,x));
function powers129State(f){
 const v=f.cast;if(!v||Number.isInteger(f.villain)||!powers129Keys[f.id]?.includes(v.key))return null;
 const duration=['rush','pounce'].includes(v.cfg.kind)?Math.max(.42,v.cfg.duration||.08):(v.cfg.duration||.08),age=v.elapsed-v.cfg.windup,count=Math.max(1,v.cfg.ticks||1);
 return{v,age,duration,active:age>=0&&age<duration,phase:((Math.max(0,age)/duration*count)%1),dir:v.dir||f.dir||1};
}
celPhase=function(f,state,t,portrait=false){
 const picked=powers129PhaseBase(f,state,t,portrait),s=!portrait&&powers129State(f);if(!s||!s.active||f.id===41&&s.v.key==='skill2')return picked;
 if(['rush','pounce','melee','vortex'].includes(s.v.cfg.kind)){
  const d=CEL_DATA.characters[f.id],frames=d.clips[s.v.key];if(!frames?.length)return picked;
  const phase=(s.v.cfg.ticks||1)>1?s.phase:(s.age*10)%1,index=frames.length===2?(phase<.6?1:0):phase<.18?0:phase<.65?1:Math.min(2,frames.length-1);
  return{frame:d.frames[frames[index]],state,index};
 }
 return picked;
};
function powers129Native(ctx,f,key,index,x,y,dir,alpha=1){
 const d=CEL_DATA.characters[f.id],cache=celCache.get(f.id),clips=d?.clips[key];if(!cache||!clips?.length)return;
 const fr=d.frames[clips[index%clips.length]],scale=aliens[f.id].renderHeight*aliens[f.id].scale/(fr.referenceHeight||d.referenceHeight),[sx,sy,w,h]=fr.rect;
 ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.scale(dir*scale,scale);ctx.drawImage(cache.images[fr.sheet],sx,sy,w,h,-fr.origin[0],-fr.origin[1],w,h);ctx.restore();
}
function powers129Arc(ctx,x,y,rx,ry,rotation,start,end,color,width=2){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,start,end);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function powers129Tail(ctx,f,s){
 const at=drawnAlienEmitter(f,s.v),u=s.age<0?powers129Clamp((s.v.elapsed/s.v.cfg.windup-.5)*2):s.age<s.duration?1:1-powers129Clamp((s.age-s.duration)/s.v.cfg.recovery);
 if(!at||u<.01)return;const tx=s.v.targetX??f.x+s.dir*s.v.cfg.range,endX=at.x+(tx-at.x)*u,endY=at.y+Math.sin(u*Math.PI)*12;
 const pts=[];for(let j=0;j<=24;j++){const t=j/24;pts.push([at.x+(endX-at.x)*t,at.y+(endY-at.y)*t-Math.sin(t*Math.PI)*18*u]);}
 line(ctx,pts,'#3d5547',9);line(ctx,pts,'#b1c777',5);path(ctx,[[endX-s.dir*8,endY-5],[endX+s.dir*10,endY],[endX-s.dir*8,endY+5]],'#515b48',null);
}
function powers129Moustache(ctx,f,s){
 const h=body(f).h,root=drawnAlienEmitter(f,s.v)||{x:f.x+s.dir*h*.13,y:f.y-h*.61},beat=s.active?Math.sin(s.phase*Math.PI):s.age<0?powers129Clamp(s.v.elapsed/s.v.cfg.windup)*.2:0;
 const key=s.v.key;
 if(key==='skill0'||key==='skill1'){
  for(const side of [-1,1]){
   const reach=key==='skill0'?Math.max(0,Math.min(s.v.cfg.range,((s.v.targetX??f.x+s.dir*s.v.cfg.range)-root.x)*s.dir))*beat:20+beat*25,tx=root.x+s.dir*reach,ty=key==='skill1'?root.y-75*beat:root.y+side*12;
   ctx.beginPath();ctx.moveTo(root.x,root.y);ctx.bezierCurveTo(root.x+s.dir*reach*.35,root.y+side*24,tx-s.dir*30,ty+side*15,tx,ty);ctx.strokeStyle='#66452c';ctx.lineWidth=10;ctx.lineCap='round';ctx.stroke();ctx.strokeStyle='#ba8a50';ctx.lineWidth=5;ctx.stroke();
   powers129Arc(ctx,tx-s.dir*6,ty,9,7,0,0,Math.PI*1.7,'#d6ad72',3);
  }
 }else if(key==='skill2'&&s.active){
  for(let k=0;k<3;k++)powers129Arc(ctx,root.x,root.y-10,25+k*9,5+k*2,0,time*22+k*2,time*22+k*2+4.5,k%2?'#dfc393':'#a47b49',2);
 }
}
drawAlien=function(ctx,f,t,portrait=false){
 const s=!portrait?powers129State(f):null;
 if(s&&f.id===16){
  const split=s.age<0?powers129Clamp(s.v.elapsed/s.v.cfg.windup):s.age<s.duration?1:1-powers129Clamp((s.age-s.duration)/s.v.cfg.recovery),n=s.v.ultimate?3:2;
  for(let i=0;i<n;i++){const side=i%2?-1:1,dx=(55+Math.floor(i/2)*50)*split*side,y=f.y-(i===2?8:0);powers129Native(ctx,f,s.v.key,Math.floor(t*11+i)%(CEL_DATA.characters[16].clips[s.v.key].length),f.x+dx,y,s.dir,split);}
 }
 powers129DrawBase(ctx,f,t,portrait);if(!s)return;
 ctx.save();
 if(f.id===41&&s.v.key==='skill2')powers129Tail(ctx,f,s);
 if(f.id===61)powers129Moustache(ctx,f,s);
 if(s.active&&[3,86].includes(f.id)&&['rush','pounce'].includes(s.v.cfg.kind)){
  const color=f.id===3?'#87e8ff':'#b1e96b',h=body(f).h;
  for(let i=0;i<5;i++){const u=(s.age*5+i/5)%1;line(ctx,[[f.x-s.dir*(20+u*70),f.y-h*(.2+i*.13)],[f.x-s.dir*(8+u*45),f.y-h*(.2+i*.13)]],color,1.7);}
  if(f.id===3&&s.v.key==='skill2')for(let k=0;k<2;k++)powers129Arc(ctx,f.x-s.dir*18,f.y-h*.45,40+k*15,25+k*10,0,t*13+k,t*13+k+3.8,color,2);
 }
 if(s.active&&f.id===41&&s.v.ultimate&&s.phase>.22&&s.phase<.6){for(let i=0;i<3;i++)line(ctx,[[f.x+s.dir*18,f.y-body(f).h*.6+i*6],[f.x+s.dir*65,f.y-body(f).h*.64+i*6]],'#d4e4a1',1.5);}
 ctx.restore();
};
drawShot=function(ctx,e){
 const id=e.owner?.id;if(Number.isInteger(e.owner?.villain)){powers129ShotBase(ctx,e);return;}
 if(id===6&&e.artKey==='skill2'){
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(e.vy,e.vx));
  for(let i=0;i<3;i++){powers129Arc(ctx,-i*8,0,5+i*4,15+i*9,0,-1.4,1.4,i%2?'#ddffcd':'#83ee46',2.5);}
  for(let side of [-1,1])line(ctx,[[-15,side*16],[-5,side*16],[-5,side*7],[8,side*7]],'#a7fb70',2);ctx.restore();return;
 }
 if(id===12&&['skill0','ultimate'].includes(e.artKey)){
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(e.vy,e.vx));const r=Math.min(85,e.r||45);
  for(let i=0;i<4;i++)powers129Arc(ctx,-i*9,0,4+i*3,r*(.4+i*.17),0,-1.45,1.45,i%2?'#eefeff':'#a8deef',2.5);ctx.restore();return;
 }
 if(id===53&&e.artKey==='ultimate'){
  ctx.save();ctx.translate(e.x,e.y);const r=Math.min(70,e.r||50);
  for(let i=0;i<18;i++){const a=i*2.4+time*2,d=r*Math.sqrt((i+.5)/18);oval(ctx,Math.cos(a)*d,Math.sin(a)*d*.65,2.5,2.5,i%2?'#f0d5ff':'#a7eecc',null);}
  powers129Arc(ctx,0,0,r*.75,r*.55,time,0,Math.PI*1.7,'#d8bdff',1.5);ctx.restore();return;
 }
 powers129ShotBase(ctx,e);
};
drawEffect=function(ctx,e){
 const f=e.owner,id=f?.id;if(!f||Number.isInteger(f.villain)){powers129EffectBase(ctx,e);return;}
 if(e.attachedTail129)return;
 if(e.kind==='afterimage'&&id===16)return;
 if(e.kind==='melee'&&id===16)return; // Solid native clone actors replace translucent ghost copies.
 if(e.kind==='vortex'&&[3,53,61,86].includes(id)){
  if(effects.some(q=>q!==e&&q.owner===f&&q.castId===e.castId&&q.kind===e.kind&&q.life>0&&(q.id||0)>(e.id||0)))return;
  ctx.save();ctx.globalAlpha=powers129Clamp(e.life/.12)*.8;const r=e.r||100;
  if(id===53){
   for(let i=0;i<24;i++){const u=i/24,a=u*Math.PI*5-time*4,rad=r*(.2+.7*u);oval(ctx,e.x+Math.cos(a)*rad,e.y+Math.sin(a)*rad*.65,2.5+u*1.5,2,i%2?'#e4c3ff':'#aae9cf',null);}
   for(let k=0;k<3;k++)powers129Arc(ctx,e.x,e.y,r*(.35+k*.2),r*(.2+k*.13),0,time*2+k,time*2+k+4,'#dac1ed',1.5);
  }else if(id===61){
   for(let side of [-1,1]){const pts=[];for(let j=0;j<=36;j++){const u=j/36,a=u*Math.PI*4-time*15;pts.push([e.x+Math.cos(a)*Math.min(r*.65,110)*u,e.y+Math.sin(a)*18+side*(u*60-25)]);}line(ctx,pts,'#63452e',9);line(ctx,pts,'#d1aa6f',4);}
  }else{
   for(let k=0;k<6;k++){const u=k/5; powers129Arc(ctx,e.x,e.y+50-u*105,r*(.22+u*.4),7+u*8,0,time*13+k,time*13+k+4.8,id===3?'#a3e9ff':'#b1e879',2.2);}
  }
  ctx.restore();return;
 }
 powers129EffectBase(ctx,e);
};
