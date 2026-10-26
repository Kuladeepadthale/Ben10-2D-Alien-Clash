'use strict';
// Epic/Heroic/Legendary only. Existing native body pixels own every limb movement.
const HIGHER_POWER_IDS130=new Set(HIGHER_POWER_LIST130);
const higher130PhaseBase=celPhase;
// Previously approved Heatblast, Humungousaur, Big Chill and bespoke Rath contacts retain their choreography.
const higher130Preserved=new Set([0,24,26,32]);
function higher130Selected(f){return !!f&&!Number.isInteger(f.villain)&&HIGHER_POWER_IDS130.has(f.id);}
function higher130OwnTail(f){return higher130Selected(f)&&!higher130Preserved.has(f.id);}
function higher130Pose(f,state,portrait=false,v=f.cast){
 if(portrait||!v||!higher130Selected(f)||higher130Preserved.has(f.id)||!['normal','skill0','skill1','skill2','ultimate'].includes(state))return null;
 const d=CEL_DATA.characters[f.id],key=v.ultimate?'ultimate':v.cfg.poseKey||v.key,clip=d.clips[key];if(!clip?.length)return null;
 // Ball forms retain their native spin; slam flight retains its actual jump silhouette.
 if([71,90].includes(f.id)&&v.cfg.kind==='rush'||v.cfg.kind==='leapslam'&&f.y<floor-30)return null;
 const p=powerProfileFor(f,v),phases=p?.phases,index=powerPoseIndex(f,v,phases?.length||clip.length),fi=phases?.[index]?.frame??clip[Math.min(index,clip.length-1)];
 const frame=d.frames[fi];return frame?{frame,state,index,frameId:fi,key,phase:phases?.[index]}:null;
}
celPhase=function(f,state,t,portrait=false){const base=higher130PhaseBase(f,state,t,portrait);return higher130Pose(f,state,portrait)||base;};
