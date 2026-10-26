'use strict';
// One native actor per ordinary jump. Real clone powers have separate explicit renderers.
function walk131Profile(f){
 if(Number.isInteger(f.villain)||f.id===6||locomotionFlight126(f)||CARTOON_GAITS[f.id]?.hover||CARTOON_GAITS[f.id]?.skate)return null;
 return WALK131_DATA.characters[f.id]||null;
}
function walk131Stride(f,fallback){return walk131Profile(f)?.stride||(typeof walk128Stride==='function'?walk128Stride(f,fallback):fallback);}
const walk131DrawBase=drawAlien,walk131EffectBase=drawEffect;
drawAlien=function(ctx,f,t,portrait=false){
 const p=!portrait&&celState(f)==='walk'?walk131Profile(f):null;
 if(!p){walk131DrawBase(ctx,f,t,portrait);return;}
 const height=aliens[f.id].renderHeight*aliens[f.id].scale,travel=walk128TravelPreview(f),phase=((travel/(height*p.stride))%1+1)%1,index=Math.floor(phase*p.offsets.length)%p.offsets.length;
 // Correct the existing cel's root once. Never call celPhase before the native body draw.
 ctx.save();ctx.translate((f.dir||1)*p.offsets[index]*height,0);walk131DrawBase(ctx,f,t,portrait);ctx.restore();
};
drawEffect=function(ctx,e){
 if(e.kind!=='afterimage'){walk131EffectBase(ctx,e);return;}
 const f=e.owner;if(!f||f.y<floor-1||f.jumpWindup>0)return;
 const h=body(f).h,dir=e.dir||f.dir||1,fade=Math.max(0,Math.min(1,e.life/e.maxLife));
 ctx.save();ctx.globalAlpha*=fade*.36;ctx.lineWidth=1.7;ctx.strokeStyle=e.color||'#c4e8de';ctx.lineCap='round';
 for(let k=0;k<3;k++){const y=e.y-h*(.27+k*.18),len=12+k*5;ctx.beginPath();ctx.moveTo(e.x-dir*len,y);ctx.lineTo(e.x,y);ctx.stroke();}
 ctx.restore();
};
