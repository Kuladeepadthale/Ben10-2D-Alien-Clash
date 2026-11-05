'use strict';
// Playback-only pass. Simulation timings, hitboxes, damage and saves are unchanged.
const ANIMATION144 = Object.freeze({
  1: {name:'Four Arms',retract:.60},
  2: {name:'Diamondhead',retract:.72},
  3: {name:'XLR8',retract:.42},
  6: {name:'Upgrade',retract:.76},
  7: {name:'Stinkfly',retract:.66},
  9: {name:'Ghostfreak',retract:.80},
  10: {name:'Cannonbolt',retract:.58},
  11: {name:'Wildvine',retract:.74},
  13: {name:'Snare-oh',retract:.72,revision:145},
  15: {name:'Upchuck',retract:.66,revision:145},
  19: {name:'Arctiguana',retract:.78,revision:145},
  20: {name:'Spitter',retract:.76,revision:145},
  33: {name:'Lodestar',retract:.70,revision:145},
  35: {name:'Water Hazard',retract:.74,revision:145},
  37: {name:'Armodrillo',retract:.58,revision:145},
  39: {name:'NRG',retract:.82,revision:145},
  34: {name:'Nanomech',retract:.48,revision:146},
  36: {name:'AmpFibian',retract:.70,revision:146},
  38: {name:'Terraspin',retract:.64,revision:146},
  40: {name:'Fasttrack',retract:.46,revision:146},
  41: {name:'Chamalien',retract:.62,revision:146},
  42: {name:'Eatle',retract:.68,revision:146},
  43: {name:'Clockwork',retract:.80,revision:146},
  44: {name:'Jury Rigg',retract:.52,revision:146},
  45: {name:'Shocksquatch',retract:.60,revision:147},
  46: {name:'Feedback',retract:.68,revision:147},
  47: {name:'Bloxx',retract:.64,revision:147},
  48: {name:'Gravattack',retract:.82,revision:147},
  54: {name:'Bullfrag',retract:.58,revision:147},
  57: {name:'Gutrot',retract:.78,revision:147},
  58: {name:'Atomix',retract:.72,revision:147},
  60: {name:'The Worst',retract:.80,revision:147},
  59: {name:'Walkatrout',retract:.54,revision:148},
  62: {name:'Overflow',retract:.70,revision:148},
  64: {name:'Shock Rock',retract:.62,revision:148},
  65: {name:'Slapback',retract:.60,revision:148},
  66: {name:'Surge',retract:.48,revision:148},
  67: {name:'Ultimate Humungousaur',retract:.78,revision:148},
  69: {name:'Ultimate Echo Echo',retract:.72,revision:148},
  86: {name:'Rush',retract:.44,revision:148}
});
function animation144Index(f,state,frames){
 const v=f.cast,c=v.cfg,n=frames.length;
 if(n<2)return 0;
 const wind=Math.max(.001,c.windup||0),active=Math.max(.001,c.castDuration??c.duration??.08),recovery=Math.max(.001,c.recovery||0),age=v.elapsed-wind;
 // Keep the preparation cel until the simulation releases the attack.
 if(age<0)return 0;
 if(age<active){
  // Beams, vines, ground growth and sonic waves retain their contact pose.
  // Melee cels retract between the same contacts used by the damage simulation.
  if(c.kind==='melee'&&(c.ticks||1)>1&&(n>=3||ANIMATION144[f.id].revision>=145)){
   const phase=(age/active*Math.max(1,c.ticks||1))%1;
   return phase<ANIMATION144[f.id].retract?1:n>=3?2:0;
  }
  return 1;
 }
 // Four-pose clips now show recoil followed by the settle cel instead of
 // jumping directly to the last cell at the start of recovery.
 if(n>=4)return Math.min(n-1,2+Math.floor(Math.min(.999999,(age-active)/recovery)*(n-2)));
 return n-1;
}
const animation144PhaseBase=celPhase;
celPhase=function(f,state,t,portrait=false){
 const original=animation144PhaseBase(f,state,t,portrait);
 if(portrait||!ANIMATION144[f.id]||Number.isInteger(f.villain)||f.hp<=0||f.stun>0||f.block||!f.cast||!['normal','skill0','skill1','skill2','ultimate'].includes(state))return original;
 const c=f.cast.cfg;
 // Rolling shells, airborne slams and rushes keep their dedicated choreography.
 if(['rush','pounce','leapslam'].includes(c.kind))return original;
 // Preserve authored tongue extension, tail sweeps and Arctiguana's special
 // ultimate sequence. These have dedicated body/effect synchronization.
 if(ANIMATION144[f.id].revision===145&&(
  f.id===15&&state==='skill2'||f.id===20&&state==='skill2'||f.id===19&&state==='ultimate'
 ))return original;
 // Retain rotating flippers, cyclone kicks, tail sweeps and gadget assembly.
 if(ANIMATION144[f.id].revision===146&&(
  (f.id===38||f.id===40)&&c.kind==='vortex'||
  f.id===41&&state==='skill2'||
  f.id===44&&['skill2','ultimate'].includes(state)
 ))return original;
 // Keep the authored tongue extension and belly-drive attachment synchronized.
 if(ANIMATION144[f.id].revision===147&&(
  f.id===54&&state==='skill0'||f.id===60&&state==='skill1'
 ))return original;
 // Formation, tail, disc-ring and wheel-kick sequences keep their own cadence.
 if(ANIMATION144[f.id].revision===148&&(
  f.id===66&&['skill1','skill2'].includes(state)||
  f.id===67&&state==='skill2'||
  f.id===69&&state==='skill2'||
  f.id===86&&['skill1','skill2'].includes(state)
 ))return original;
 const d=CEL_DATA.characters[f.id],frames=d?.clips[state];
 if(!frames?.length)return original;
 // Four Arms' short barrage sheet has no retraction cel; use his own full
 // punch cycle for each of its four contacts, as with the existing melee path.
 const clip=!(ANIMATION144[f.id].revision>=145)&&c.kind==='melee'&&(c.ticks||1)>1&&frames.length<3&&d.clips.normal?.length>=3?d.clips.normal:frames;
 const index=animation144Index(f,state,clip);
 return {frame:d.frames[clip[index]],state,index,animationRevision:ANIMATION144[f.id].revision||144};
};
// Small details-page identifier; no text overlays on the fight canvas.
if(typeof renderAlienInfo==='function'){
 const animation144InfoBase=renderAlienInfo;
 renderAlienInfo=function(){
  const result=animation144InfoBase();
  let marker=document.getElementById('animationRevision');
  if(!marker){marker=document.createElement('small');marker.id='animationRevision';marker.style.cssText='display:block;color:#a6ef81;margin-top:6px';document.getElementById('alienSpecies').after(marker);}
  marker.hidden=!ANIMATION144[selected];
  marker.textContent=ANIMATION144[selected]?'Animation '+((ANIMATION144[selected].revision||144)/10).toFixed(1)+' · combat timing':'';
  return result;
 };
}
