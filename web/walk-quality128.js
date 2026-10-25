'use strict';
// Upgrade is the motion-quality reference, never a replacement body or skeleton.
function walk128Profile(f){
 if(Number.isInteger(f.villain)||f.id===6||locomotionFlight126(f)||CARTOON_GAITS[f.id]?.hover||CARTOON_GAITS[f.id]?.skate)return null;
 return WALK128_DATA.characters[f.id]||null;
}
function walk128Stride(f,fallback){return walk128Profile(f)?.stride||fallback;}
const walk128DrawBase=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){
 const p=!portrait&&celState(f)==='walk'?walk128Profile(f):null;
 if(!p){walk128DrawBase(ctx,f,t,portrait);return;}
 const phase=celPhase(f,'walk',t),index=phase.index%p.offsets.length;
 const height=aliens[f.id].renderHeight*aliens[f.id].scale,offset=p.offsets[index]*height;
 ctx.save();ctx.translate((f.dir||1)*offset,0);walk128DrawBase(ctx,f,t,portrait);ctx.restore();
};
