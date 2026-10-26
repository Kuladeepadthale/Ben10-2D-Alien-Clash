'use strict';
// Upgrade is the motion-quality reference, never a replacement body or skeleton.
function walk128Profile(f){
 if(typeof walk131Profile==='function'&&walk131Profile(f))return null;
 if(Number.isInteger(f.villain)||f.id===6||locomotionFlight126(f)||CARTOON_GAITS[f.id]?.hover||CARTOON_GAITS[f.id]?.skate)return null;
 return WALK128_DATA.characters[f.id]||null;
}
function walk128Stride(f,fallback){return walk128Profile(f)?.stride||fallback;}
function walk128TravelPreview(f){
 // Read the pending travel without consuming it. The native renderer must remain
 // the sole observer update, particularly when older network snapshots omit moving.
 const s=locomotionSamples126.get(f),counter=Number.isFinite(f.gaitDistance126)?f.gaitDistance126:null;
 if(!s||s.key!=='a'+f.id)return counter||0;
 let distance=s.distance;
 if(counter!==null&&s.counter!==null&&counter>s.counter)distance+=counter-s.counter;
 else if(['idle','walk'].includes(s.state)&&Math.abs(f.x-s.x)<=Math.max(80,(f.config?.speed||aliens[f.id]?.speed||300)*.25))distance+=Math.abs(f.x-s.x);
 return distance;
}
const walk128DrawBase=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 const p=!portrait&&celState(f)==='walk'?walk128Profile(f):null;
 if(!p){walk128DrawBase(ctx,f,t,portrait);return;}
 const height=aliens[f.id].renderHeight*aliens[f.id].scale;
 const phase=((walk128TravelPreview(f)/(height*p.stride))%1+1)%1,index=Math.floor(phase*p.offsets.length)%p.offsets.length;
 const offset=p.offsets[index]*height;
 ctx.save();ctx.translate((f.dir||1)*offset,0);walk128DrawBase(ctx,f,t,portrait);ctx.restore();
};
