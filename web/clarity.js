'use strict';
// Apply the same alpha-safe contour contrast to each character at native pose resolution.
const alienClarityCache=new Map();
function alienClarityCell(id,frame,sheet,data){
 if(typeof settings!=='undefined'&&settings.quality==='balanced')return null;
 const key=id+':'+frame,cached=alienClarityCache.get(key);if(cached){alienClarityCache.delete(key);alienClarityCache.set(key,cached);return cached;}
 const cv=document.createElement('canvas'),n=data.cell,j=frame%data.sheetFrames;cv.width=cv.height=n;const c=cv.getContext('2d',{willReadFrequently:true});
 c.drawImage(sheet,j%data.columns*n,Math.floor(j/data.columns)*n,n,n,0,0,n,n);
 try{const pixels=c.getImageData(0,0,n,n),src=new Uint8ClampedArray(pixels.data),out=pixels.data;
  for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){const k=(y*n+x)*4;if(Math.min(src[k+3],src[k-1],src[k+7],src[k-n*4+3],src[k+n*4+3])<240)continue;
   for(let j=0;j<3;j++){const i=k+j,blur=(src[i-4]+src[i+4]+src[i-n*4]+src[i+n*4])/4;out[i]=src[i]+Math.max(-16,Math.min(16,(src[i]-blur)*.65));}}
  c.putImageData(pixels,0,0);
 }catch{return null;}
 alienClarityCache.set(key,cv);if(alienClarityCache.size>48)alienClarityCache.delete(alienClarityCache.keys().next().value);return cv;
}
