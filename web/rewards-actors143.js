'use strict';
// Reward order changes presentation only; counters and native receipts remain authoritative.
function rewardClaimable143(state,key,goal){return !!state&&!state.error&&!state.clockBlocked&&!dailyClaimed(state,key)&&(state.progress?.[key]||0)>=goal;}
function orderRewards143(){const lane=$('cardPackList'),state=dailyState();if(!lane)return;const before=lane.scrollLeft;
 const order=cards=>cards.map((card,index)=>({card,index,ready:card.dataset.claimable143==='true'})).sort((a,b)=>Number(b.ready)-Number(a.ready)||a.index-b.index).map(v=>v.card);
 const packs=[...lane.querySelectorAll(':scope > [data-pack-card]')],offers=[...lane.querySelectorAll(':scope > .daily-alien-reward')];
 for(const card of [...packs,...offers]){const key=card.dataset.reward||'pack:'+card.dataset.packCard,goal=key.startsWith('pack:')?PACK_AD_GOALS[key.slice(5)]:2*(Number(key.slice(6))+1);card.dataset.claimable143=String(rewardClaimable143(state,key,goal));}
 // Keep coin packs/ad packs and daily characters as separate groups within the same lane.
 lane.append(...order(packs),...order(offers));lane.scrollLeft=before;
}
const rewards143DailyBase=renderDailyRewards;renderDailyRewards=function(){const result=rewards143DailyBase();orderRewards143();return result;};
const rewards143MissionBase=renderMissions;renderMissions=function(){const result=rewards143MissionBase(),lane=$('missionCards');if(lane){const cards=[...lane.children];cards.sort((a,b)=>Number(b.classList.contains('reward-ready'))-Number(a.classList.contains('reward-ready'))||Number(a.classList.contains('reward-claimed'))-Number(b.classList.contains('reward-claimed')));lane.append(...cards);}return result;};
// These atlas cells accidentally include two stacked source poses. Select one complete body.
const ACTOR_REPAIRS143={
 74:{30:{crop:[6,241,332,90],anchor:[166,86]}},
 78:{28:{crop:[0,0,227,202],anchor:[113,198]},29:{copy:27},30:{crop:[0,217,247,145],anchor:[123,141]},31:{copy:27}},
 79:{25:{copy:24}},
 81:{28:{crop:[0,0,262,228],anchor:[131,224]},29:{copy:30},30:{from:29,crop:[42,230,215,125],anchor:[107,121]},31:{copy:27}},
 82:{24:{copy:16},31:{copy:27}}
};
// Fixed per-sheet body registration, never fit each animated pose to its changing bounds.
const ACTOR_REFERENCE143={72:{2:203,3:203},74:{2:302,3:302},78:{2:234,3:234},80:{2:260,3:260},81:{2:286,3:286},82:{2:266,3:266},88:{2:249,3:231}};
const ACTOR_FRAME_PREVIOUS143=new WeakMap();
for(const [idText,refs]of Object.entries(ACTOR_REFERENCE143)){const d=CEL_DATA.characters[Number(idText)];for(const f of d.frames)if(refs[f.sheet]){ACTOR_FRAME_PREVIOUS143.set(f,{reference:f.referenceHeight||d.referenceHeight,origin:[...f.origin],rect:[...f.rect]});f.referenceHeight=refs[f.sheet];}}
for(const [idText,changes]of Object.entries(ACTOR_REPAIRS143)){const d=CEL_DATA.characters[Number(idText)],sources=d.frames.map(f=>JSON.parse(JSON.stringify(f)));for(const [indexText,change]of Object.entries(changes)){const i=Number(indexText);if(change.from!==undefined)d.frames[i]=sources[change.from];const original=d.frames[i];if(change.copy!==undefined){d.frames[i]=JSON.parse(JSON.stringify(d.frames[change.copy]));d.frames[i].repair143=true;}else{const [dx,dy,w,h]=change.crop;original.rect=[original.rect[0]+dx,original.rect[1]+dy,w,h];original.origin=[...change.anchor];original.repair143=true;original.crop143=[dx,dy];}}}
// Re-register emission points after a sheet-scale correction or source-cell repair.
const emitter143Base=drawnAlienEmitter;
drawnAlienEmitter=function(f,v){if(Number.isInteger(f.villain)||!ACTOR_REFERENCE143[f.id]&&!ACTOR_REPAIRS143[f.id])return emitter143Base(f,v);const picked=celPhase(f,v.ultimate?'ultimate':v.cfg.poseKey||v.key,typeof time==='number'?time:0),fr=picked.frame,d=CEL_DATA.characters[f.id],s=(f.config||aliens[f.id]).renderHeight*(f.config||aliens[f.id]).scale/(fr.referenceHeight||d.referenceHeight),profile=powerProfileFor(f,v),phase=profile?.phases?.[powerPoseIndex(f,v,profile.phases.length)],old=ACTOR_FRAME_PREVIOUS143.get(fr);let marker=fr.emitters?.[v.ultimate?'ultimate':v.key]||(fr.repair143?Object.values(fr.emitters||{})[0]:null);
 if(!marker&&phase?.pixel&&d.frames[phase.frame]===fr){const [dx,dy]=fr.crop143||[0,0];marker=[phase.pixel[0]-dx,phase.pixel[1]-dy];}
 if(marker){const hover=locomotionLift126(f,typeof time==='number'?time:0);return{x:f.x+(v.dir||f.dir||1)*(marker[0]-fr.origin[0])*s,y:f.y+(marker[1]-fr.origin[1])*s-hover};}
 const at=emitter143Base(f,v);if(!at||!old)return at;const ratio=old.reference/(fr.referenceHeight||d.referenceHeight),hover=locomotionLift126(f,typeof time==='number'?time:0);return{x:f.x+(at.x-f.x)*ratio,y:f.y-hover+(at.y-f.y+hover)*ratio};};
// A KO, guard or hit must not retain a previous power's duplicate-actor renderer.
const actor143DrawBase=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){if(portrait||f.hp>0&&!(f.stun>0)&&!f.block)return actor143DrawBase(ctx,f,t,portrait);const cast=f.cast,dash=f.dash,block=f.block,stun=f.stun;try{f.cast=null;if(f.hp<=0){f.dash=null;f.block=false;f.stun=0;}return actor143DrawBase(ctx,f,t,portrait);}finally{f.cast=cast;f.dash=dash;f.block=block;f.stun=stun;}};
const actor143EffectBase=drawEffect;
drawEffect=function(ctx,e){if(e.kind==='afterimage')return;const f=e.owner;if(f&&(e.sonicDeployment||e.clone||e.cloneActor)&&((f.hp<=0)||f.stun>0||f.y<floor-2||!f.cast||e.castId!==undefined&&f.cast.id!==e.castId))return;return actor143EffectBase(ctx,e);};
// Body clones are intentional only during the living, grounded clone ability.
const actor143StateBase=powers129State;powers129State=function(f){if(f.id===16&&(f.hp<=0||f.stun>0||f.y<floor-2||f.jumpWindup>0))return null;return actor143StateBase(f);};
const actor143RequestedBase=requested127State;requested127State=function(f,v=f.cast){if(f.id===66&&(f.hp<=0||f.stun>0||f.y<floor-2||f.jumpWindup>0))return null;return actor143RequestedBase(f,v);};
// Excessively flattened hurt cells use the alien's own braced pose while alive.
const actor143PhaseBase=celPhase;
celPhase=function(f,state,t,portrait=false){const picked=actor143PhaseBase(f,state,t,portrait);if(portrait||state!=='hit'||f.hp<=0||Number.isInteger(f.villain))return picked;const d=CEL_DATA.characters[f.id],idle=d.frames[d.clips.idle[0]],fr=picked.frame,ih=idle.rect[3]/(idle.referenceHeight||d.referenceHeight),fh=fr.rect[3]/(fr.referenceHeight||d.referenceHeight);if(idle.rect[2]<idle.rect[3]*1.1&&fh<ih*.68){const index=d.clips.guard?.[0];if(index!==undefined)return{frame:d.frames[index],state,index,braced143:true};}return picked;};
