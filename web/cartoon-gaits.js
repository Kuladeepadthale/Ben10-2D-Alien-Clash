'use strict';
// Timing and whole-body presentation only: every limb remains in its original illustrated pose.
const CARTOON_GAITS=[
 {style:'Balanced strides',stride:.82,bob:.35,weight:0},
 {style:'Heavy, deliberate strides',stride:.82,bob:.8,weight:.026},
 {style:'Measured armored steps',stride:.80,bob:.25,weight:.018},
 {style:'Alternating skate pushes and glides',stride:1.05,bob:0,skate:true},
 {style:'Four-legged bounding',stride:1.05,bob:1.6,weight:0},
 {style:'Quick, light steps',stride:.94,bob:.45,weight:0},
 {style:'Long, fluid strides',stride:.98,bob:.3,weight:.012},
 {style:'Fluttering hover',stride:.85,bob:.9,hover:true},
 {style:'Low, deliberate stalking',stride:.94,bob:.4,weight:.021},
 {style:'Floating spectral glide',stride:1.10,bob:1.6,hover:true}
];
function cartoonSkatePhase(p){const half=Math.floor(p*2),u=p*2-half;let q;
 // A short push, long extended-wheel glide, then a smooth transfer to the other leg.
 if(u<.28)q=u/.28*.66;else if(u<.82)q=.66+(u-.28)/.54*.04;else q=.70+(u-.82)/.18*.30;
 return (half+q)/2;
}
function cartoonGaitPhase(f,s,t,walking){
 if(!s.cartoon)s.cartoon={x:f.x,distance:0,walking:false,dir:f.dir||1};const g=s.cartoon,profile=CARTOON_GAITS[f.id];
 if((f.dir||1)!==g.dir){g.distance=-g.distance;g.dir=f.dir||1;}
 if(walking&&!g.walking)g.distance=0;
 if(walking&&g.walking)g.distance+=(f.x-g.x)*(f.dir||1);
 g.x=f.x;g.walking=walking;
 const height=(f.id===4?142:226)*aliens[f.id].scale,cycle=height*profile.stride,p=((g.distance/cycle)%1+1)%1;
 return profile.skate?cartoonSkatePhase(p):p-(profile.weight||0)*Math.sin(p*Math.PI*4);
}
const cartoonPreviousDraw=drawAlien,cartoonVisualStates=new WeakMap();
drawAlien=function(ctx,f,t,portrait=false){
 if(f.dash&&!portrait){const pose=f.dash.pose||(f.dash.pose={...f,dash:null,moving:false,cast:null,jumpWindup:.07});Object.assign(pose,{x:f.x,y:f.y,dir:f.dir,hp:f.hp});ctx.save();ctx.transform(1,0,-.14*(f.dir||1),.96,f.y*.14*(f.dir||1),f.y*.04);cartoonPreviousDraw(ctx,pose,t,false);ctx.restore();return;}
 const moving=!portrait&&f.moving&&f.hp>0&&!f.cast&&!f.block&&!f.stun&&!f.jumpWindup&&f.y>=floor-1;
 if(!moving){cartoonVisualStates.delete(f);cartoonPreviousDraw(ctx,f,t,portrait);return;}
 const p=CARTOON_GAITS[f.id];let s=cartoonVisualStates.get(f);if(!s){s={start:t,x:f.x,distance:0};cartoonVisualStates.set(f,s)}s.distance+=Math.abs(f.x-s.x);s.x=f.x;
 const envelope=Math.min(1,(t-s.start)/.12),height=(f.id===4?142:226)*aliens[f.id].scale,phase=s.distance/(height*p.stride),bob=p.hover?Math.sin(t*(f.id===7?12:3))*p.bob:-(Math.sin(phase*Math.PI*2)**2)*p.bob;
 ctx.save();ctx.translate(0,bob*envelope);cartoonPreviousDraw(ctx,f,t,portrait);ctx.restore();
};
