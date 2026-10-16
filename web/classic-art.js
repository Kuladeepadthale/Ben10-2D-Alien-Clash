'use strict';
// Existing classic character illustrations, animated without redrawing the characters.
const CLASSIC_NAMES=['heatblast','four-arms','diamondhead','xlr8','wildmutt','grey-matter','upgrade','stinkfly','ripjaws','ghostfreak'];
const classicPortraits=[],classicSheets=new Map(),classicPending=new Map();let classicUse=0;
const spriteFrame={width:320,height:320,columns:4,count:12,originX:160,originY:306,artHeight:240};
function loadClassicImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Could not load '+src));image.src=src})}
function sheetFor(id,state){const key=id+':'+state,cached=classicSheets.get(key);if(cached){cached.last=++classicUse;return cached.image}if(!classicPending.has(key)){let promise=loadClassicImage('assets/classic/'+CLASSIC_NAMES[id]+'/'+state+'.webp').then(image=>{classicSheets.set(key,{image,last:++classicUse});classicPending.delete(key);if(classicSheets.size>8){let oldest=[...classicSheets.entries()].sort((a,b)=>a[1].last-b[1].last)[0][0];classicSheets.delete(oldest)}return image}).catch(()=>{classicPending.set(key,null);return null});classicPending.set(key,promise)}return null}
function preloadClassic(id){sheetFor(id,'idle');sheetFor(id,'normal');sheetFor(id,'walk')}
function classicState(f){if(f.hp<=0||f.stun>0)return'hit';if(f.block)return'guard';if(f.cast?.ultimate)return'ultimate';if(f.action==='punch'||f.cast?.key==='normal')return'normal';if(f.action==='power'||f.cast)return'power';if(f.y!==undefined&&f.y<floor-4)return'jump';if(f.moving)return'walk';return'idle'}
function drawClassicPortrait(ctx,id,width,height){const img=classicPortraits[id];if(!img)return;const scale=Math.min((width-12)/img.width,(height-8)/img.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,(width-img.width*scale)/2,height-img.height*scale,img.width*scale,img.height*scale)}
function drawAlien(ctx,f,t,portrait=false){const id=f.id,img=classicPortraits[id];if(!img)return;const a=aliens[id],state=classicState(f),wantedH=(id===4?142:226)*a.scale;let sheet=portrait?null:sheetFor(id,state),frame=0,part=0;
 if(sheet){let duration=state==='normal'?.38:state==='power'?(f.cast?f.cast.cfg.windup+(f.cast.cfg.duration||.08)+f.cast.cfg.recovery:.7):state==='ultimate'?(f.cast?f.cast.cfg.windup+(f.cast.cfg.duration||.08)+f.cast.cfg.recovery:2.2):state==='walk'?(id===3?.42:.65):state==='hit'?.2:state==='jump'?.8:1.6;
 let elapsed=['normal','power','ultimate'].includes(state)?(f.cast?.elapsed??f.anim??0):state==='hit'?Math.max(0,.15-(f.stun||0)):state==='walk'?(f.walk||0)/12:t;let progress=['idle','walk','guard'].includes(state)?(elapsed/duration)%1:Math.min(.999,elapsed/duration);frame=Math.min(11,Math.floor(progress*12));part=progress*12-frame;
 }
 ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.dir||1,1);const motion=portrait?0:1;
 // Root motion reinforces the actual collision-driven movement of the fighter.
 let bob=(id===7||id===9)?Math.sin(t*3.5)*4:Math.sin(t*3)*1.5;ctx.translate(0,bob*motion);
 if(f.stun>0)ctx.rotate(-.07);if(f.hp<=0){ctx.rotate(-1.25);ctx.translate(0,-8)}
 if(f.cast){let pulse=Math.sin(Math.min(1,f.cast.elapsed/Math.max(.2,f.cast.cfg.windup+.12))*Math.PI);if(f.cast.cfg.kind==='rush'||f.cast.cfg.kind==='pounce')ctx.rotate(.10);else if(f.cast.key==='normal'){ctx.translate(pulse*12,0);ctx.rotate(pulse*.025)}}
 if(id===9&&f.inv>0)ctx.globalAlpha*=.35;
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 if(sheet){const artHeight=id===4?278/(img.width/img.height):240,scale=wantedH/artHeight;const drawFrame=(n,alpha)=>{ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(sheet,(n%4)*320,Math.floor(n/4)*320,320,320,-160*scale,-306*scale,320*scale,320*scale);ctx.restore()};drawFrame(frame,1);if(part>.03){let next=frame===11?(['idle','walk','guard'].includes(state)?0:11):frame+1;if(next!==frame)drawFrame(next,part)}}
 else{const w=wantedH*img.width/img.height;ctx.drawImage(img,-w/2,-wantedH,w,wantedH)}ctx.restore();
}
const classicReady=Promise.all(CLASSIC_NAMES.map((name,id)=>loadClassicImage('assets/classic/'+name+'/portrait.webp').then(img=>{classicPortraits[id]=img}).catch(()=>{throw Error('Character artwork failed to load: '+name)})));
