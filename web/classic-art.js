'use strict';
const CLASSIC_NAMES=CEL_DATA.characters.map(c=>c.name),classicPortraits=[];
function loadClassicImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Could not load '+src));image.src=src})}
function preloadClassic(id){if(typeof celPreload==='function')celPreload(id);}
function drawClassicPortrait(ctx,id,width,height){const img=classicPortraits[id];if(!img)return;const collection=!!ctx.canvas?.closest?.('#roster');if(collection){const cropHeight=Math.min(img.height,img.width*1.18),scale=Math.min(width/img.width,height/cropHeight),dw=img.width*scale,dh=cropHeight*scale;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.clearRect(0,0,width,height);ctx.drawImage(img,0,0,img.width,cropHeight,(width-dw)/2,(height-dh)/2,dw,dh);return;}const scale=Math.min((width-12)/img.width,(height-8)/img.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,(width-img.width*scale)/2,height-img.height*scale,img.width*scale,img.height*scale)}
function drawAlien(ctx,f,t,portrait=false){const img=classicPortraits[f.id];if(!img)return;const h=aliens[f.id].renderHeight*aliens[f.id].scale,scale=h/img.height;ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.dir||1,1);ctx.drawImage(img,-img.width*scale/2,-h,img.width*scale,h);ctx.restore();}
const classicReady=Promise.all(CEL_DATA.characters.map((d,id)=>loadClassicImage(d.portrait).then(im=>{classicPortraits[id]=im})));

