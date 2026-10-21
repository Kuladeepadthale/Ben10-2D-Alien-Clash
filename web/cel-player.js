'use strict';
// Full-body cel clips. Exactly one native frame is drawn; interpolation and crossfades are absent.
const celCache=new Map(),celPending=new Map(),celStates=new WeakMap();let celUse=0,celPinned=new Set([0,2]),celBattleRequest=0;
let allAlienPosesLoaded=false,allAlienPoseError='';
function celTrim(){for(const [id]of [...celCache].sort((a,b)=>a[1].used-b[1].used)){if(celCache.size<=2)break;if(!celPinned.has(id))celCache.delete(id);}}
function celEnsure(id){if(celCache.has(id)){celCache.get(id).used=++celUse;return Promise.resolve(true)}if(celPending.has(id))return celPending.get(id);const d=CEL_DATA.characters[id];
 const pending=Promise.all(d.sheets.map(s=>loadClassicImage(s.src))).then(images=>{celCache.set(id,{images,used:++celUse});celPending.delete(id);celTrim();return true},e=>{celPending.delete(id);throw e});celPending.set(id,pending);return pending;
}
function celPreload(id){if(typeof mode!=='undefined'&&!['fight','paused','roundend','loading'].includes(mode))celPinned=new Set([id,typeof enemy!=='undefined'&&enemy?enemy.id:2]);celEnsure(id).catch(()=>{});}
function hasDrawnAlien(id){return !!CEL_DATA.characters[id]}
function celPhase(f,state,t){const d=CEL_DATA.characters[f.id];let s=celStates.get(f);if(!s){s={x:f.x,distance:0,walking:false,state:'',start:t,landUntil:0,air:false};celStates.set(f,s)}
 const walking=state==='walk',air=f.y<floor-2;
 if(walking&&s.walking)s.distance+=(f.x-s.x)*(f.dir||1);
 s.x=f.x;s.walking=walking;if(s.air&&!air)s.landUntil=t+.10;s.air=air;
 if(state!==s.state){s.state=state;s.start=t}
 let frames=d.clips[state]||d.clips.idle,index=0;
 if(state==='walk'){
  // Travel-based cadence. The cell exporter records soles; artwork owns the actual limb motion.
  const profile=CARTOON_GAITS[f.id],h=aliens[f.id].renderHeight*aliens[f.id].scale;
  let phase=((s.distance/(h*profile.stride))%1+1)%1;if(profile.skate)phase=cartoonSkatePhase(phase);index=Math.floor(phase*frames.length)%frames.length;
 }else if(f.cast&&['normal','skill0','skill1','skill2','ultimate'].includes(state)){
  const v=f.cast,wind=Math.max(.001,v.cfg.windup),active=['rush','pounce'].includes(v.cfg.kind)?Math.max(.42,v.cfg.duration||.08):(v.cfg.duration||.08),recovery=Math.max(.001,v.cfg.recovery);
  if(v.elapsed<wind)index=0;
  else if(v.elapsed<wind+active)index=frames.length>=4?1+Math.min(1,Math.floor((v.elapsed-wind)/active*2)):1;
  else index=frames.length>=3?frames.length-1:0;
  if(f.id===0&&state==='skill0')index=v.elapsed<wind?Math.min(1,Math.floor(v.elapsed/wind*2)):v.elapsed<wind+active?2:3;
  if(v.cfg.kind==='leapslam'&&f.y<floor-30){frames=d.clips.jump;index=2;}
 }else if(state==='jump'){index=f.jumpWindup?0:f.vy< -100?1:f.vy<120?2:3;}
 else if(state==='dash')index=Math.min(frames.length-1,Math.floor((f.dash?.elapsed||0)/.22*frames.length));
 else if(state==='hit')index=Math.min(frames.length-1,Math.floor((t-s.start)/.12));
 else if(state==='ko')index=Math.min(frames.length-1,Math.floor((t-s.start)/.14));
 else if(state==='idle'){if(f.id===7||f.id===9)frames=d.clips.walk;index=Math.floor(t*(f.id===7?8:f.id===9?5:2))%frames.length;}
 if(state==='idle'&&s.landUntil>t){frames=d.clips.jump;index=3}
 return {frame:d.frames[frames[Math.min(frames.length-1,index)]],state,index};
}
function celState(f){if(f.hp<=0)return'ko';if(f.dash)return'dash';if(f.stun>0)return'hit';if(f.block)return'guard';if(f.cast)return f.cast.ultimate?'ultimate':f.cast.key;if(f.jumpWindup>0||f.y<floor-2)return'jump';if(f.moving)return'walk';return'idle'}
const celFallbackDraw=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){const d=CEL_DATA.characters[f.id],cache=celCache.get(f.id);if(!cache){if(!celPending.has(f.id))celEnsure(f.id).catch(()=>{});celFallbackDraw(ctx,f,t,portrait);return;}cache.used=++celUse;
 const picked=celPhase(f,portrait?'idle':celState(f),t),frame=picked.frame,[x,y,w,h]=frame.rect,[ox,oy]=frame.origin,scale=aliens[f.id].renderHeight*aliens[f.id].scale/d.referenceHeight;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.translate(f.x,f.y-(f.id===7||f.id===9?6+Math.sin(t*(f.id===7?8:3))*1.5:0));ctx.scale((f.dash?.dir||f.cast?.dir||f.dir||1)*scale,scale);if(f.id===10&&f.cast&&f.cast.cfg.kind==='rush'&&f.cast.elapsed>=f.cast.cfg.windup&&f.cast.elapsed<f.cast.cfg.windup+Math.max(.42,f.cast.cfg.duration||.08)){const angle=(f.x-(f.cast.startX??f.x))*(f.cast.dir||f.dir||1)/Math.max(1,h*.5*scale);ctx.translate(0,-h*.5);ctx.rotate(angle);ctx.drawImage(cache.images[frame.sheet],x,y,w,h,-w*.5,-h*.5,w,h);}else ctx.drawImage(cache.images[frame.sheet],x,y,w,h,-ox,-oy,w,h);ctx.restore();
};
function drawnAlienEmitter(f,cast){const d=CEL_DATA.characters[f.id],frames=d.clips[cast.ultimate?'ultimate':cast.key]||d.clips.normal,frame=typeof celPhase==='function'?celPhase(f,cast.ultimate?'ultimate':cast.key,typeof time==='number'?time:0).frame:d.frames[frames[f.id===0&&cast.key==='skill0'?2:Math.min(1,frames.length-1)]],w=frame.rect[2],h=frame.rect[3],s=aliens[f.id].renderHeight*aliens[f.id].scale/d.referenceHeight;
 const marker=frame.emitters?.[cast.ultimate?'ultimate':cast.key],hover=f.id===7||f.id===9?6+Math.sin((typeof time==='number'?time:0)*(f.id===7?8:3))*1.5:0;
 if(marker)return{x:f.x+(cast.dir||f.dir||1)*(marker[0]-frame.origin[0])*s,y:f.y+(marker[1]-frame.origin[1])*s-hover};
 let u=.94,v=.43;if(aliens[f.id].powerOrigin){[u,v]=aliens[f.id].powerOrigins?.[cast.ultimate?'ultimate':cast.key]||aliens[f.id].powerOrigin;return{x:f.x+(cast.dir||f.dir||1)*(w*u-frame.origin[0])*s,y:f.y+(h*v-frame.origin[1])*s};}if(f.id===25){u=.68;v=.20}if(f.id===26){u=.78;v=.25}if(f.id===28){u=.58;v=.17}if(f.id===6){u=.60;v=.16}if(f.id===7){u=.92;v=.38}if(f.id===5){u=.93;v=.55}if([12,15,19,20].includes(f.id)){u=.91;v=.25}if(f.id===17&&cast.key!=='skill0'){u=.56;v=.43}if(f.id===18){u=.69;v=.38}return{x:f.x+(cast.dir||f.dir||1)*(w*u-frame.origin[0])*s,y:f.y+(h*v-frame.origin[1])*s-(f.id===7||f.id===9?6:0)};
}
const celOriginalBegin=begin;
begin=async function(newMatch=true,practice=false){const request=++celBattleRequest,op=$('opponent'),saved=op.value,e=newMatch?(saved==='auto'?(selected+1+Math.floor(Math.random()*(ALIEN_COUNT-1)))%ALIEN_COUNT:Number(saved)):enemy.id;celPinned=new Set([selected,e]);mode='loading';resetInputs();if($('launchMatch'))$('launchMatch').disabled=true;$('launchStatus')&&($('launchStatus').textContent='Preparing '+aliens[selected].name+' and '+aliens[e].name+'…');
 try{await Promise.all([classicReady,celEnsure(selected),celEnsure(e)]);if(request!==celBattleRequest)return false;op.value=String(e);celOriginalBegin(newMatch,practice);op.value=saved;celTrim();if($('launchMatch'))$('launchMatch').disabled=false;return true;}catch(err){op.value=saved;mode='menu';if($('launchMatch'))$('launchMatch').disabled=false;allAlienPoseError=err.message;$('launchStatus')&&($('launchStatus').textContent='Animation could not load. Tap start to retry.');return false;}
};
const allAlienPosesReady=Promise.all([classicReady,celEnsure(0),celEnsure(2)]).then(()=>{allAlienPosesLoaded=true;return true}).catch(e=>{allAlienPoseError=e.message;return false});
const diamondheadPuppetReady=Promise.resolve(true);


