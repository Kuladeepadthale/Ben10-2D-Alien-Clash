'use strict';
// Gameplay owns collisions and damage; these accents identify the new aliens' powers.
const expansionEffectBase=drawEffect,expansionShotBase=drawShot;
drawEffect=function(ctx,e){const id=e.owner?.id,type=id===undefined?'':aliens[id].type;
 if(e.kind==='spike'&&type==='vine'){const age=e.maxLife-e.life,p=age<(e.delay||0)?0:Math.min(1,(age-(e.delay||0))*10);ctx.save();for(let n=-1;n<=1;n++){const x=e.x+n*19,h=e.height*p*(n===0?1:.72);ctx.beginPath();ctx.moveTo(x,floor);ctx.bezierCurveTo(x-25,floor-h*.3,x+28,floor-h*.75,x+8,floor-h);ctx.strokeStyle='#275d37';ctx.lineWidth=12;ctx.stroke();ctx.strokeStyle='#8cdb68';ctx.lineWidth=5;ctx.stroke();if(p>.3){path(ctx,[[x+2,floor-h*.65],[x+34,floor-h*.76],[x+16,floor-h*.49]],'#a8e779','#326e42',2)}}ctx.restore();return;}
 if(e.kind==='beam'&&['electric','frost','cosmic'].includes(type)){ctx.save();const end=e.x+e.dir*e.length,ey=e.endY??e.y,alpha=Math.max(0,e.life/e.maxLife);ctx.globalAlpha=alpha;line(ctx,[[e.x,e.y],[end,ey]],CLASSIC_COLORS[id],e.r*1.35);line(ctx,[[e.x,e.y],[end,ey]],'#f5ffff',e.r*.38);if(type==='electric'){const points=[];for(let i=0;i<=12;i++){const u=i/12;points.push([e.x+(end-e.x)*u,e.y+(ey-e.y)*u+(i===0||i===12?0:Math.sin(i*4+time*40)*15)])}line(ctx,points,'#b3f2ff',4)}else if(type==='frost'){for(let i=1;i<9;i++){const u=i/9,x=e.x+(end-e.x)*u,y=e.y+(ey-e.y)*u;path(ctx,[[x-8,y],[x,y-13],[x+9,y],[x,y+13]],'#e6ffffaa','#a2e3ff',1)}}ctx.restore();return;}
 if(e.kind==='afterimage'&&e.alien===16){ctx.save();ctx.globalAlpha=Math.min(.65,e.life/e.maxLife*.65);const a=aliens[16].skills[0];drawAlien(ctx,{id:16,x:e.x,y:e.y,dir:e.dir,hp:1000,cast:{key:'skill0',elapsed:a.windup+.02,cfg:a,dir:e.dir}},time);ctx.restore();return;}
 expansionEffectBase(ctx,e);
 if(e.kind==='melee'&&id===16&&e.name!=='Normal strike'&&e.owner.cast){ctx.save();ctx.globalAlpha=.38;for(const dx of [-28,30])drawAlien(ctx,{...e.owner,x:e.owner.x+dx},time);ctx.restore();}
};
drawShot=function(ctx,s){const type=s.type;if(type==='electric'&&s.kind==='rain'){ctx.save();const points=[];for(let i=0;i<6;i++)points.push([s.x+Math.sin(time*40+i*3)*8,s.y-60+i*12]);line(ctx,points,'#8cdfff',9);line(ctx,points,'#f4ffff',3);ctx.restore();return;}
 if(type==='frost'&&s.kind==='projectile'){ctx.save();ctx.translate(s.x,s.y);ctx.scale(s.dir,1);path(ctx,[[-20,-5],[6,-13],[24,0],[5,13],[-20,5]],'#c5f6ff','#efffff',2);ctx.restore();return;}
 if(['sonic','bandage'].includes(type)&&s.kind==='wave'){ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=Math.max(0,Math.min(1,s.life/.25));for(let i=0;i<3;i++){ctx.strokeStyle=type==='sonic'?'#c7f6ff':'#e6dba4';ctx.lineWidth=type==='sonic'?3:7;ctx.beginPath();ctx.ellipse(-s.dir*i*14,0,s.r*(.65+i*.16),s.r*(.85+i*.12),0,-Math.PI*.65,Math.PI*.65);ctx.stroke()}ctx.restore();return;}
 expansionShotBase(ctx,s);
};
