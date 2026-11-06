'use strict';
// Controls and world effects have separate lifetimes. Published shots are never removed on cancel.
const FREE_EFFECTS146=new Set(['projectile','lob','rain','ground','trap','spikes','wave']);
function independentCast146(v){return !!v&&FREE_EFFECTS146.has(v.cfg.kind)&&v.emitted>0;}
function detachCast146(f){
 const v=f.cast;if(!v)return;
 if(independentCast146(v)&&v.emitted<(v.cfg.ticks||1)){
  (f.detached146??=[]).push({cast:v,x:f.x,y:f.y,dir:f.dir});
 }
 f.cast=null;f.action='';f.cool=0;
}
const freeCastBase146=cast;
cast=function(f,type){
 if(mode!=='fight'||f.hp<=0||f.stun>0||f.block||f.dash)return false;
 if(type==='normal'&&(f.basicReady146||0)>0)return false;
 const old=f.cast,cool=f.cool,action=f.action;
 // A held/tapped action cannot restart itself, bypassing its damage budget.
 if(old&&(old.key==='normal'&&type==='normal'||old.ultimate&&type==='ultimate'||type.startsWith('skill')&&old.key==='skill'+f.loadout[type==='skill0'?0:1]))return false;
 if(old){f.cast=null;f.cool=0;}
 const accepted=freeCastBase146(f,type);
 if(!accepted){if(old){f.cast=old;f.cool=cool;f.action=action;}return false;}
 const next=f.cast;
 if(old){f.cast=old;detachCast146(f);f.cast=next;f.cool=next.cfg.windup+(next.cfg.castDuration??next.cfg.duration??.08)+next.cfg.recovery;f.action=type==='normal'?'punch':'power';}
 f.inputLock146=.10;
 if(type==='normal')f.basicReady146=.42;
 return true;
};
const freeUpdateBase146=updateF;
updateF=function(f,dt){
 f.basicReady146=Math.max(0,(f.basicReady146||0)-dt);
 f.inputLock146=Math.max(0,(f.inputLock146||0)-dt);
 const steer=f.manualRush146&&f.cast&&['rush','pounce'].includes(f.cast.cfg.kind),cfg=f.cast?.cfg;
 if(steer)f.cast.cfg={...cfg,speed:.00001};
 try{freeUpdateBase146(f,dt);}finally{if(steer&&f.cast)f.cast.cfg=cfg;f.manualRush146=false;}
 // A released fireball/wave/trap no longer pins the character in its casting pose.
 if(f.hp<=0){f.detached146=[];return;}
 for(const pending of f.detached146||[]){
  const v=pending.cast,s=v.cfg;v.elapsed+=dt;
  const duration=s.castDuration??s.duration??.08;
  while(v.emitted<(s.ticks||1)&&v.elapsed-s.windup>=v.emitted*duration/(s.ticks||1)){
   const pos={x:f.x,y:f.y,dir:f.dir,cast:f.cast,anim:f.anim};
   try{f.x=pending.x;f.y=pending.y;f.dir=pending.dir;f.cast=v;f.anim=v.elapsed;spawnAttack(f,v,v.emitted++);}
   finally{Object.assign(f,pos);}
  }
 }
 f.detached146=(f.detached146||[]).filter(p=>p.cast.emitted<(p.cast.cfg.ticks||1));
 if(independentCast146(f.cast))detachCast146(f);
};
const freeMoveBase146=move;
move=function(f,dir,dt){
 const v=f.cast;if(!v||!v.ultimate)return freeMoveBase146(f,dir,dt);
 if(f.stun||f.block||f.dash||f.hp<=0||!dir)return;
 const before=f.x;
 f.cast=null;try{freeMoveBase146(f,dir,dt);}finally{f.cast=v;}
 // Keep ultimate choreography relative to the player's chosen position.
 const offset=f.x-before;v.startX+=offset;v.plannedTarget=Math.max(65,Math.min(W-65,v.plannedTarget+offset));
 if(['rush','pounce'].includes(v.cfg.kind)){
  v.dir=f.dir;v.targeted=false;
  // Cancel automatic forward displacement while the player steers the ultimate.
  if(f===player){f.manualRush146=true;}
 }
};
// A brief shared input interval prevents multi-button instant damage stacking.
const freeInputCast146=cast;
cast=function(f,type){if((f.inputLock146||0)>0)return false;return freeInputCast146(f,type);};
