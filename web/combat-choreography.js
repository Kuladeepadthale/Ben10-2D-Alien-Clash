'use strict';
// Native Echo Echo clones and procedural sonic discs; never ability-card images.
const choreographyDraw=drawEffect;
function sonicRing(ctx,x,y,rx,ry,color,alpha){ctx.save();ctx.globalAlpha*=alpha;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.restore();}
drawEffect=function(ctx,e){
 if(!e.sonicDeployment){choreographyDraw(ctx,e);return;}
 const age=e.maxLife-e.life,u=Math.max(0,Math.min(1,age/e.delay)),arrived=age>=e.delay,fade=Math.min(1,e.life/.16);
 ctx.save();ctx.globalAlpha=fade;
 const count=e.sonicDeployment==='discs'?3:2;
 for(let k=0;k<count;k++){
  // Opposite arcs converge on the captured location, never on a moving opponent.
  const a=k/count*Math.PI*2+(e.index||0)*.7,dx=Math.cos(a)*(e.r+22),dy=Math.sin(a)*45;
  const ease=u*u*(3-2*u),x=e.launchX+(e.x+dx-e.launchX)*ease,y=e.launchY+(e.y+dy-e.launchY)*ease-Math.sin(u*Math.PI)*55;
  if(e.sonicDeployment==='discs'){
   ctx.save();ctx.translate(x,y);ctx.rotate(a+age*3);oval(ctx,0,0,13,6,'#267ca8','#c1f5ff',2);oval(ctx,0,0,6,3,'#ddffff',null);ctx.restore();
  }else{
   const cache=celCache.get(23),d=CEL_DATA.characters[23],poses=u<1?d?.clips.jump:d?.clips.skill0,pose=u<1?Math.min(3,Math.floor(u*4)):Math.min(2,Math.floor((age-e.delay)/.4*3)),frame=d?.frames[poses?.[pose]??d.clips.idle[0]];
   if(cache&&frame){const [sx,sy,w,h]=frame.rect,scale=aliens[23].renderHeight*aliens[23].scale/(frame.referenceHeight||d.referenceHeight);
    ctx.save();ctx.translate(x,floor-Math.sin(u*Math.PI)*55);ctx.scale((x<e.x?1:-1)*scale,scale);ctx.drawImage(cache.images[frame.sheet],sx,sy,w,h,-frame.origin[0],-frame.origin[1],w,h);ctx.restore();}
  }
  if(arrived)for(let j=0;j<3;j++){const p=((age-e.delay)*3+j/3)%1;sonicRing(ctx,x+(e.x-x)*p,y+(e.y-y)*p,5+p*17,8+p*22,'#c2fbff',(1-p)*.65);}
 }
 if(arrived){const p=Math.min(1,(age-e.delay)/.4);sonicRing(ctx,e.x,e.y,12+p*e.r,8+p*e.r*.6,'#d6ffff',(1-p)*.7);}
 ctx.restore();
};
