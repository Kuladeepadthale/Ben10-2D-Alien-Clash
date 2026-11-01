'use strict';
// Villain stages and Hero Level are independent, persisted tracks.
const THREAT_NAME='Plumber Missions',VILLAIN_COUNT=VILLAIN_DATA.characters.length;
const safeProgress=(n,max=999999999)=>Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
const heroProgress={version:1,xp:safeProgress(profile.heroProgress?.xp),lastMatches:profile.matches,lastWins:profile.wins};
const threatProgress={version:1,cleared:safeProgress(profile.threatLadder?.cleared,VILLAIN_COUNT)};
const oldThreat=profile.threatLadder||{};
threatProgress.classic=safeProgress(oldThreat.classic??Math.min(threatProgress.cleared,30),30);
threatProgress.galactic=safeProgress(oldThreat.galactic??Math.max(0,threatProgress.cleared-30),20);
threatProgress.rushBest=safeProgress(oldThreat.rushBest,5);
threatProgress.containmentBest=safeProgress(oldThreat.containmentBest,25);
threatProgress.cleared=threatProgress.classic+threatProgress.galactic;
const PLUMBER_TRACKS={classic:{name:'Classic Missions',start:0,count:30,art:'classic',copy:'Defend Earth · 30 villain stages'},galactic:{name:'Galactic Missions',start:30,count:20,art:'galactic',copy:'Explore beyond Earth · 20 villain stages'},containment:{name:'Null Void Lockdown',start:0,count:25,art:'null-void',copy:'Hold the ring · Seal the portal · 300 coins'},rush:{name:'Boss Rush',start:0,count:5,art:'boss-rush',copy:'One life · Five bosses · 600 coins'}};
const RUSH_BOSSES=[24,27,29,47,49];
let plumberTrack='classic',rushRun=null;
function plumberInfo(){return PLUMBER_TRACKS[plumberTrack]||PLUMBER_TRACKS.classic;}
function plumberCleared(){return plumberTrack==='rush'?threatProgress.rushBest:plumberTrack==='containment'?threatProgress.containmentBest:threatProgress[plumberTrack];}
function plumberStageLocked(id){const info=plumberInfo();return !['rush','containment'].includes(plumberTrack)&&(id<info.start||id>=info.start+info.count||id-info.start>plumberCleared());}
function plumberTuning(id){if(plumberTrack==='containment')return {hp:1200,damage:.95,speed:265,playerCooldown:1,enemyCooldown:.9,reaction:.85,difficulty:'normal'};if(plumberTrack==='rush'){const n=rushRun?.index||0;return {hp:1800+450*n,damage:1+.18*n,speed:260+10*n,playerCooldown:1,enemyCooldown:Math.max(.65,1-.07*n),reaction:Math.max(.5,.9-.08*n),difficulty:n<2?'normal':'hard'};}return threatTuning(plumberTrack==='galactic'?id-29:id+1);}
function openPlumberTrack(track){if(!PLUMBER_TRACKS[track]||isLocked())return;plumberTrack=track;selectedMode='campaign';rushRun=null;const info=plumberInfo();threatStage=track==='rush'?RUSH_BOSSES[0]:info.start+Math.min(plumberCleared(),info.count-1);threatPage=Math.floor((threatStage-info.start)/threatPageSize());showScreen(track==='rush'?'plumberRush':track==='containment'?'containment':'threats');}
profile.heroProgress=heroProgress;profile.threatLadder=threatProgress;
let threatStage=Math.min(threatProgress.cleared,VILLAIN_COUNT-1),threatPage=0,threatAttempt=null,heroSession=null,lastXPGain=0,lastRankUp=0;
let campaignSavedDifficulty=null;
const villainTextures=new Map(),villainCloseTextures=new Map(),villainPending=new Map();
const heroThreshold=level=>25*(level-1)*(level+4);
function heroStanding(){let level=Math.floor((Math.sqrt(25+4*heroProgress.xp/25)-5)/2)+1;level=Math.max(1,level);while(heroProgress.xp>=heroThreshold(level+1))level++;const base=heroThreshold(level),next=heroThreshold(level+1);return {level,xp:heroProgress.xp-base,needed:next-base,total:heroProgress.xp};}
function awardHeroXP(points,reason){points=safeProgress(points,10000);if(!points)return;const before=heroStanding().level;heroProgress.xp=Math.min(999999999,heroProgress.xp+points);lastRankUp=heroStanding().level-before;saveProfile();if(lastRankUp)careerToast('Hero Level '+heroStanding().level+' reached!');else if(reason)careerToast('+'+points+' Hero XP · '+reason);}
function completedMatchXP(won){const damage=Math.min(25,Math.floor(totals.dealt/200)),guard=Math.min(15,Math.floor(totals.blocked/50)),health=won&&player&&player.hp/player.maxHp>=.6?20:0;return 30+(won?50:0)+damage+guard+health;}
const threatSaveBase=saveProfile;saveProfile=function(){const matches=Math.max(0,profile.matches-heroProgress.lastMatches),winsGained=Math.max(0,profile.wins-heroProgress.lastWins);if(matches&&heroSession&&!heroSession.awarded&&heroSession.mode!=='training'){
 const before=heroStanding().level;lastXPGain=completedMatchXP(winsGained>0)+(heroSession.firstClear?75:0);heroProgress.xp=Math.min(999999999,heroProgress.xp+lastXPGain);heroSession.awarded=true;lastRankUp=heroStanding().level-before;
 }heroProgress.lastMatches=profile.matches;heroProgress.lastWins=profile.wins;profile.heroProgress=heroProgress;profile.threatLadder=threatProgress;threatSaveBase();if($('heroLevelCard'))renderHeroProgress();};
function villainEnsure(id){if(villainTextures.has(id))return Promise.resolve(villainTextures.get(id));if(villainPending.has(id))return villainPending.get(id);const d=VILLAIN_DATA.characters[id],promise=Promise.all([loadClassicImage(d.src),...(d.closeSrc?[loadClassicImage(d.closeSrc)]:[])]).then(([image,close])=>{villainTextures.clear();villainCloseTextures.clear();villainTextures.set(id,image);if(close)villainCloseTextures.set(id,close);villainPending.delete(id);return image},e=>{villainPending.delete(id);throw e});villainPending.set(id,promise);return promise;}
function threatTuning(stage){stage=Math.max(1,Math.min(VILLAIN_COUNT,stage));const n=stage-1;return {hp:1200+100*n+8*n*n,damage:.9+.055*n+.0015*n*n,speed:245+3*n,playerCooldown:1+.045*n,enemyCooldown:Math.max(.5,1-.017*n),reaction:Math.max(.36,1-.022*n),difficulty:stage<5?'normal':'hard'};}
function villainKit(id){const d=VILLAIN_DATA.characters[id],type=d.type,stage=id+1,t=selectedMode==='campaign'?plumberTuning(id):threatTuning(stage),copy=s=>({...s,damage:s.damage*t.damage,cooldown:s.cooldown*t.enemyCooldown});return {...d.kit,name:d.name,species:d.chapter===2?'GALACTIC VILLAIN':'CLASSIC VILLAIN',renderHeight:d.height||226,bodyHeight:d.bodyHeight||205,scale:1,speed:t.speed,strength:t.damage,type,light:d.color,skills:d.kit.skills.map(copy),ultimate:copy(d.kit.ultimate)};}
// Shared visual clock follows damage timing, not persistent trap/field lifetime.
function villainCombatClock(f){
 const v=f.cast,c=v.cfg,wind=Math.max(.001,c.windup||0),kind=c.kind;
 let active=Math.max(.001,c.castDuration??c.duration??.08);
 if(['rush','pounce'].includes(kind))active=Math.max(.42,active);
 const age=v.elapsed-wind,recovery=Math.max(.001,c.recovery||.18);
 return {wind,active,age,recovery,windProgress:Math.max(0,Math.min(1,v.elapsed/wind)),
  recoveryProgress:Math.max(0,Math.min(1,(age-active)/recovery))};
}
function villainFrame(f){const d=VILLAIN_DATA.characters[f.villain],state=celState(f);let index=0;
 // Locomotion, jumps, guard, hit and knockout retain their existing artwork.
 const move126=locomotionVillainFrame126(f,d,state,typeof time==='number'?time:0);
 if(move126!==null)index=move126;
 else if(state==='jump')index=f.jumpWindup?4:5;
 else if(state==='guard')index=12;else if(state==='hit')index=13;else if(state==='ko')index=14;else if(state==='dash')index=15;
 if(f.cast&&['normal','skill0','skill1','skill2','ultimate'].includes(state)){
  const v=f.cast,c= villainCombatClock(f),age=c.age;
  const beat=typeof meleeComboBeat==='function'?meleeComboBeat(f,v):null;
  if(v.cfg.kind==='melee'&&d.closeFrames){
   // Cycle all three distinct contacts even in combos longer than three hits.
   const hit=beat?(beat.count>1?beat.tick:(f.normalChain||0))%3:0;
   const pose=age<0?0:age>=c.active?7:beat?(beat.phase<.55?1+hit*2:2+hit*2):1+hit*2;
   return d.closeFrames[pose];
  }
  const strike=state==='normal'?7:state==='ultimate'?11:8+Number(state.slice(-1));
  const actionFrame=d.frames[strike],markerKey=v.ultimate?'ultimate':v.cfg.poseKey||v.key;
  // Prefer each power's own painted pose and emitter. Generic ranged fallback is
  // only needed when the action artwork has no registered emission landmark.
  const ranged=!['melee','rush','pounce','leapslam','ground'].includes(v.cfg.kind);
  const release=ranged&&d.rangedPose!==undefined&&!actionFrame.emitters?.[markerKey]?d.rangedPose:strike;
  if(age<0)index=c.windProgress<.22?0:c.windProgress<.52?12:6;
  else if(age<c.active){
   index=release;
   if(beat&&beat.count>1&&beat.phase>=.65)index=6;
   if(v.cfg.kind==='leapslam'&&f.y<floor-30)index=5;
  }else index=c.recoveryProgress<.3?6:c.recoveryProgress<.82?12:0;
 }
 return d.frames[index];}
function drawVillain(ctx,f,t){const d=VILLAIN_DATA.characters[f.villain],frame=villainFrame(f),image=frame.closeCombat?villainCloseTextures.get(f.villain):villainTextures.get(f.villain);if(!image)return;const [x,y,w,h]=frame.rect,[ox,oy]=frame.origin,s=(d.height||226)/(frame.referenceHeight||d.referenceHeight);
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.translate(f.x,f.y-locomotionLift126(f,t));ctx.scale((f.dash?.dir||f.cast?.dir||f.dir||1)*s,s);ctx.drawImage(image,x,y,w,h,-ox,-oy,w,h);ctx.restore();}
const threatDrawBase=drawAlien;drawAlien=function(ctx,f,t,portrait=false){if(Number.isInteger(f.villain)){drawVillain(ctx,f,t);return}threatDrawBase(ctx,f,t,portrait);};
const threatEmitterBase=drawnAlienEmitter;drawnAlienEmitter=function(f,cast){if(!Number.isInteger(f.villain))return threatEmitterBase(f,cast);if(typeof profileEmitter==='function'){const point=profileEmitter(f,cast,time);if(point)return point;}const b=body(f);return {x:f.x+(cast.dir||f.dir||1)*45,y:b.y+b.h*.4};};
const threatEffectBase=drawEffect;drawEffect=function(ctx,e){if(e.kind==='afterimage'&&Number.isInteger(e.owner?.villain)){ctx.save();ctx.globalAlpha=Math.max(0,e.life/e.maxLife)*.25;drawVillain(ctx,{...e.owner,x:e.x,y:e.y,dir:e.dir},time);ctx.restore();return}threatEffectBase(ctx,e);};

addCareerScreen('plumber',`<div class="plumber-heading"><div><span class="career-kicker">PLUMBER HEADQUARTERS</span><h1>Plumber Missions</h1><p>Choose your operation. Earn coins and Hero XP.</p></div><button data-screen="missions">Rewards ↗</button></div><div class="plumber-lane-controls"><span>Swipe to explore operations</span><button id="plumberLanePrev" aria-label="Previous operations">←</button><button id="plumberLaneNext" aria-label="Next operations">→</button></div><div id="plumberModes" class="plumber-modes" role="region" aria-label="Plumber operation cards" tabindex="0"></div>`);
addCareerScreen('plumberRush',`<div class="threat-heading"><button data-screen="plumber">← Plumber Missions</button><h1>Boss Rush</h1></div><div class="boss-rush-banner"><strong>FIVE BOSSES. ONE LIFE.</strong><span>Defeat the full lineup · Recover 20% health after each win · Keep ultimate charge</span></div><div id="rushBosses" class="rush-bosses" role="region" aria-label="Five Boss Rush opponents in fight order" tabindex="0"></div><div class="rush-rules"><div><strong>Clear reward: 600 coins + Hero XP</strong><p id="rushBest"></p><p id="rushPlayer"></p></div><div class="threat-options"><button data-screen="characters">Change alien</button><button data-screen="powers">Equip powers</button><button id="rushRules">Rules</button></div></div><button id="startBossRush" class="primary">Start Boss Rush</button><p id="rushStatus" role="status"></p>`);
uiLabels.plumber='Plumber Missions';uiLabels.plumberRush='Boss Rush';
function renderPlumberHub(){$('plumberModes').replaceChildren(...Object.entries(PLUMBER_TRACKS).map(([id,info])=>{const b=document.createElement('button');b.className='plumber-mode plumber-'+id;b.dataset.plumberTrack=id;b.innerHTML='<img src="assets/modes-v112/'+info.art+'.webp" alt=""/><div><span>'+ (id==='classic'?'EARTH OPERATIONS':id==='galactic'?'DEEP SPACE':id==='containment'?'PORTAL DEFENSE':'ELITE GAUNTLET')+'</span><h2>'+info.name+'</h2><p>'+info.copy+'</p><strong>'+(id==='containment'?'Best seal: '+threatProgress.containmentBest+' / 25s':id==='rush'?'Best: '+threatProgress.rushBest+' / 5 bosses':threatProgress[id]+' / '+info.count+' cleared')+' →</strong></div>';b.onclick=()=>openPlumberTrack(id);return b;}));requestAnimationFrame(syncPlumberLane);}
function renderBossRush(){$('rushBest').textContent='Best: '+threatProgress.rushBest+' / 5';$('rushPlayer').textContent='Alien: '+aliens[selected].name;$('startBossRush').disabled=!ownsAlien(selected)||isLocked();$('rushStatus').textContent=ownsAlien(selected)?'':'Select an unlocked alien to fight.';$('rushBosses').replaceChildren(...RUSH_BOSSES.map((id,n)=>{const el=document.createElement('div'),v=VILLAIN_DATA.characters[id];el.innerHTML='<b class="boss-order">BOSS '+(n+1)+'</b><img src="'+v.portrait+'" alt="'+v.name+'"><strong>'+v.name+'</strong>';el.className='rush-boss-card';return el;}));}
$('startBossRush').onclick=()=>{if(!ownsAlien(selected)||isLocked())return;plumberTrack='rush';selectedMode='campaign';rushRun={index:0,hpRatio:1,ult:0};threatStage=RUSH_BOSSES[0];launch();};
addCareerScreen('threats',`<div class="threat-heading"><div><span class="career-kicker">ONE VILLAIN. ONE FIGHT. ONE STEP CLOSER.</span><h1 id="plumberChapterTitle">${THREAT_NAME}</h1><p id="threatProgressText"></p></div><button data-screen="plumber">← All operations</button><button id="openHeroRank"></button></div><div id="threatCards" class="threat-grid"></div><div class="threat-pager"><button id="threatPrev">← Previous</button><span id="threatPageNumber"></span><button id="threatNext">Next →</button></div>`);
addCareerScreen('threat',`<div class="threat-heading"><button id="backToThreats">← All villain stages</button><span id="threatStageLabel"></span><button id="threatHeroRank"></button></div><div class="threat-detail"><div class="threat-portrait"><img id="threatImage" alt=""></div><div class="threat-brief"><h1 id="threatTitle"></h1><p id="threatStory"></p><div id="threatStats"></div><h2>Your alien</h2><strong id="threatPlayer"></strong><div class="threat-options"><button data-screen="characters">Change alien</button><button data-screen="powers">Equip powers</button><button id="threatUpgrade">Upgrade alien</button></div></div></div><div class="threat-actions"><p id="threatReward"></p><button id="fightThreat" class="primary">Fight this villain</button></div><p id="threatStatus" role="status"></p>`);
addCareerScreen('hero',`<div class="career-heading"><span class="career-kicker">YOUR PERSONAL PROGRESS</span><h1>Hero Rank</h1><p>Hero Level measures your earned XP. Villain stages are a separate challenge path.</p></div><div id="heroLevelCard" class="hero-level-card"></div><div class="hero-xp-rules"><h2>Earn Hero XP</h2><p>Complete a battle: <b>30 XP</b> · Win: <b>+50 XP</b></p><p>Damage dealt: up to <b>25 XP</b> · Successful guards: up to <b>15 XP</b> · Win with 60% health: <b>20 XP</b></p><p>First villain-stage clear: <b>75 XP</b> · Claim a mission: <b>20 XP</b> · Unlock an alien: <b>25 XP</b> · Buy an upgrade: <b>10 XP</b></p><p>Testing and quitting give no battle XP. Each completed battle pays XP once.</p></div><button data-screen="modes" class="primary">Choose how to play</button>`);
uiLabels.threats=THREAT_NAME;uiLabels.threat='Villain stage';uiLabels.hero='Hero Rank';
const threatMode=document.createElement('button');threatMode.className='mode-card mode-threat';threatMode.dataset.mode='campaign';threatMode.innerHTML='<span class="mode-emblem">'+uiIcon('block')+'</span><span class="mode-tag">VILLAIN CAMPAIGN</span><h2>'+THREAT_NAME+'</h2><p>Clear '+VILLAIN_COUNT+' one-on-one villain stages. Each stage unlocks the next, with stronger opponents.</p><span class="mode-reward">First-clear coins + Hero XP</span><strong>View villain stages →</strong>';
document.querySelector('#screen-modes .mode-grid').prepend(threatMode);
shell.addEventListener('click',e=>{const b=e.target.closest('[data-mode="campaign"]');if(!b)return;e.stopImmediatePropagation();selectedMode='campaign';showScreen('plumber');},true);
const rankSettings=document.createElement('button');rankSettings.textContent='Hero Rank & XP';rankSettings.dataset.screen='hero';document.querySelector('.settings-cards article:last-child').appendChild(rankSettings);
function threatPageSize(){return innerHeight>innerWidth?4:6;}
function renderThreats(){const info=plumberInfo(),size=threatPageSize(),pages=Math.ceil(info.count/size);threatPage=Math.max(0,Math.min(threatPage,pages-1));$('plumberChapterTitle').textContent=info.name;$('threatProgressText').textContent=plumberCleared()+' / '+info.count+' cleared · First clears unlock your next stage.';$('openHeroRank').textContent='Hero Level '+heroStanding().level+' · XP';
 $('threatCards').replaceChildren(...VILLAIN_DATA.characters.slice(info.start+threatPage*size,Math.min(info.start+info.count,info.start+(threatPage+1)*size)).map((v,n)=>{const id=info.start+threatPage*size+n,local=id-info.start,locked=plumberStageLocked(id),b=document.createElement('button');b.dataset.stage=id;b.className='threat-card'+(locked?' stage-locked':'')+(id===threatStage?' stage-picked':'');b.innerHTML='<span>STAGE '+String(local+1).padStart(2,'0')+'</span><img src="'+v.portrait+'" alt="'+v.name+'" loading="lazy"><strong>'+v.name+'</strong><small>'+(local<plumberCleared()?'✓ Cleared':locked?'Locked · Preview':'Next challenge')+'</small>';b.onclick=()=>{threatStage=id;showScreen('threat')};return b;}));
 if($('stageFinder')){$('stageFinder').max=String(info.count);$('stageFinder').value=String(Math.min(info.count,Math.max(threatPage*size+1,Math.min((threatPage+1)*size,threatStage-info.start+1))));}$('threatPageNumber').textContent=(threatPage+1)+' / '+pages;$('threatPrev').disabled=threatPage===0;$('threatNext').disabled=threatPage===pages-1;}
function renderThreat(){const info=plumberInfo(),v=VILLAIN_DATA.characters[threatStage],stage=threatStage-info.start+1,t=plumberTuning(threatStage),locked=plumberStageLocked(threatStage);
 $('threatStageLabel').textContent=info.name+' · '+stage+' / '+info.count;$('threatHeroRank').textContent='Hero Level '+heroStanding().level;$('threatImage').src=v.portrait;$('threatImage').alt=v.name;$('threatTitle').textContent=v.name;$('threatStory').textContent=v.description;$('threatPlayer').textContent=aliens[selected].name+(ownsAlien(selected)?' · Unlocked':' · Locked');$('threatStats').textContent=t.hp+' HP · '+Math.round(t.damage*100)+'% attack · '+t.difficulty+' AI';
 $('threatReward').textContent=locked?'Clear Stage '+(stage-1)+' first.':stage<=plumberCleared()?'Replay: '+(20+stage*2)+' coins + XP':'First clear: '+(80+stage*8)+' coins + battle XP + 75 XP';
 $('fightThreat').disabled=locked||!ownsAlien(selected)||isLocked();$('fightThreat').textContent=locked?'Stage locked':!ownsAlien(selected)?'Select an unlocked alien':'Fight '+v.name;$('threatUpgrade').disabled=!ownsAlien(selected)||isLocked();$('threatStatus').textContent='';}
function renderHeroProgress(){const r=heroStanding();$('heroLevelCard').innerHTML='<span>HERO LEVEL</span><strong>'+r.level+'</strong><p>'+r.xp.toLocaleString()+' / '+r.needed.toLocaleString()+' XP to Hero Level '+(r.level+1)+'</p><div class="hero-xp-track" role="progressbar" aria-label="Hero level experience" aria-valuemin="0" aria-valuemax="'+r.needed+'" aria-valuenow="'+r.xp+'"><i style="width:'+r.xp/r.needed*100+'%"></i></div><small>'+r.total.toLocaleString()+' total Hero XP · '+threatProgress.cleared+' villain stages cleared</small>';}
const threatShowBase=showScreen;showScreen=function(name,remember=true){if(name==='setup'&&selectedMode!=='campaign'&&campaignSavedDifficulty!==null){$('difficulty').value=campaignSavedDifficulty;campaignSavedDifficulty=null;}if(name==='setup'&&selectedMode==='campaign')name=plumberTrack==='rush'?'plumberRush':plumberTrack==='containment'?'containment':'threat';threatShowBase(name,remember);if(currentScreen==='plumber')renderPlumberHub();if(currentScreen==='plumberRush')renderBossRush();if(currentScreen==='threats')renderThreats();if(currentScreen==='threat')renderThreat();if(currentScreen==='hero')renderHeroProgress();};
$('threatPrev').onclick=()=>{threatPage--;renderThreats()};$('threatNext').onclick=()=>{threatPage++;renderThreats()};$('backToThreats').onclick=()=>showScreen('threats');$('openHeroRank').onclick=$('threatHeroRank').onclick=()=>showScreen('hero');$('threatUpgrade').onclick=()=>openAlienUpgrades(selected);

const threatBeginBase=begin;begin=async function(newMatch=true,practice=false){const campaign=selectedMode==='campaign';if(campaign){if(plumberStageLocked(threatStage)||plumberTrack==='rush'&&(!rushRun||RUSH_BOSSES[rushRun.index]!==threatStage)||!ownsAlien(selected)||isLocked()&&mode!=='roundend')return false;}
 const saved=$('opponent').value;if(campaign&&campaignSavedDifficulty===null)campaignSavedDifficulty=$('difficulty').value;if(campaign)$('opponent').value='0';
 if(newMatch){heroSession={mode:selectedMode,awarded:false,firstClear:false};lastXPGain=0;lastRankUp=0;}
 try{if(campaign){mode='loading';$('fightThreat').disabled=true;$('threatStatus').textContent='Preparing '+VILLAIN_DATA.characters[threatStage].name+'…';await villainEnsure(threatStage);mode='menu';}
 const ok=await threatBeginBase(newMatch,practice);if(!ok)return false;
 if(campaign){const stage=threatStage-plumberInfo().start+1,t=plumberTuning(threatStage);enemy.villain=threatStage;enemy.config=villainKit(threatStage);enemy.maxHp=enemy.hp=t.hp;enemy.loadout=[0,1];$('difficulty').value=t.difficulty;clock=180;if(plumberTrack==='rush'){player.hp=player.maxHp*rushRun.hpRatio;player.ult=rushRun.ult;}threatAttempt={stage:threatStage,track:plumberTrack,finished:false};$('reportMode').textContent=THREAT_NAME;announce((plumberTrack==='rush'?'BOSS '+(rushRun.index+1)+' / 5':'STAGE '+stage)+' · '+enemy.config.name.toUpperCase(),1.5);hud();}
 return ok;
 }catch(e){mode='menu';heroSession=null;$(plumberTrack==='rush'?'rushStatus':'threatStatus').textContent='Villain artwork could not load. Tap fight to retry.';return false;}finally{if(campaign){$('opponent').value=saved;$('fightThreat').disabled=false;}}
};
$('fightThreat').onclick=()=>launch();
const threatHudBase=hud;hud=function(){threatHudBase();if(selectedMode==='campaign'&&Number.isInteger(enemy?.villain)){$('round').textContent=plumberTrack==='rush'?'BOSS '+((rushRun?.index||0)+1)+' / 5':'STAGE '+(enemy.villain-plumberInfo().start+1);$('diffLabel').textContent=plumberInfo().name.toUpperCase();$('pWins').textContent=$('eWins').textContent='';}};
function showXPGain(){if(!lastXPGain)return;let p=$('resultHeroXP');if(!p){p=document.createElement('div');p.id='resultHeroXP';p.className='hero-result';$('matchReward').after(p);}p.innerHTML='<strong>+'+lastXPGain+' Hero XP</strong><span>Hero Level '+heroStanding().level+(lastRankUp?' · LEVEL UP!':'')+'</span><button id="viewResultRank">View Hero Rank</button>';$('viewResultRank').onclick=()=>showScreen('hero');}
const threatFinishBase=finish;finish=async function(){if(selectedMode!=='campaign'){const value=await threatFinishBase();if(currentScreen==='results')showXPGain();return value;}
 if(mode!=='fight'||!threatAttempt||threatAttempt.finished)return;const attempt=threatAttempt;attempt.finished=true;const id=attempt.stage,info=plumberInfo(),stage=id-info.start+1,won=player.hp/player.maxHp>enemy.hp/enemy.maxHp;
 if(plumberTrack==='rush'&&won&&rushRun.index<4){mode='roundend';resetInputs();threatProgress.rushBest=Math.max(threatProgress.rushBest,rushRun.index+1);rushRun.hpRatio=Math.min(1,player.hp/player.maxHp+.2);rushRun.ult=player.ult;rushRun.index++;threatStage=RUSH_BOSSES[rushRun.index];saveProfile();await begin(true,false);return;}
 const first=won&&plumberTrack!=='rush'&&stage-1===plumberCleared();
 mode='matchend';resetInputs();wins=won?[2,0]:[0,2];const coins=plumberTrack==='rush'?(won?600:20):won?(first?80+stage*8:20+stage*2):20;
 if(first){threatProgress[plumberTrack]++;threatProgress.cleared=threatProgress.classic+threatProgress.galactic;}
 if(plumberTrack==='rush'&&won)threatProgress.rushBest=5;
 syncMissionPeriods();career.stats[plumberTrack==='rush'?'rushBattles':plumberTrack+'Battles']++;if(won)career.stats[plumberTrack==='rush'?'rushWins':plumberTrack+'Wins']++;
 profile.matches++;if(won)profile.wins++;profile.credits+=coins;if(heroSession)heroSession.firstClear=first;saveProfile();renderSetup();showScreen('results',false);
 $('resultEye').textContent=info.name.toUpperCase();$('resultTitle').textContent=plumberTrack==='rush'?(won?'Boss Rush complete!':'Gauntlet ended'):won?VILLAIN_DATA.characters[id].name+' defeated!':'Try this stage again';$('resultText').textContent=plumberTrack==='rush'?(won?'All five bosses defeated. Incredible work, Plumber!':'Best streak: '+threatProgress.rushBest+' / 5. Start a fresh run when ready.'):won?(plumberCleared()===info.count?info.name+' complete! You defeated the final villain.':first?'Stage '+(stage+1)+' is now unlocked.':'Replay complete. Your next stage stays unlocked.'):'No progress lost. Upgrade your alien or change your powers.';
 rewardPanel.innerHTML='<span class="coin-medal">◈</span><div><span>'+info.name+' reward</span><strong>+'+coins+' coins</strong></div><button id="resultThreats">All operations →</button>';$('resultThreats').onclick=()=>{mode='menu';showScreen('plumber')};showXPGain();
 $('playAgain').textContent=plumberTrack==='rush'?'Try Boss Rush again':won&&stage<info.count?'Next mission':'Retry mission';$('playAgain').onclick=()=>{mode='menu';if(plumberTrack==='rush'){rushRun=null;showScreen('plumberRush');}else{if(won&&stage<info.count)threatStage=id+1;showScreen('threat');}};

};
const threatEndBase=endMatch;endMatch=function(){threatEndBase();if(currentScreen==='results')showXPGain();};
const threatQuitBase=quit;quit=function(){heroSession=null;threatAttempt=null;rushRun=null;threatQuitBase();};$('quit').onclick=quit;
const threatClaimBase=claimMission;claimMission=function(id){const ok=threatClaimBase(id);if(ok)awardHeroXP(20,'Mission completed');return ok;};
const threatBuyBase=buyAlien;buyAlien=function(id){const ok=threatBuyBase(id);if(ok)awardHeroXP(25,'Alien unlocked');return ok;};
const threatUpgradeBase=upgrade;upgrade=function(key){const before=profile.aliens[selected].levels[key];threatUpgradeBase(key);if(profile.aliens[selected].levels[key]>before)awardHeroXP(10,'Upgrade purchased');};
// Restore the regular replay action whenever a non-campaign match starts.
const threatLaunchBase=launch;launch=async function(){if(selectedMode!=='campaign'){$('playAgain').textContent='Play again';$('playAgain').onclick=()=>{mode='menu';launch()};if($('resultHeroXP'))$('resultHeroXP').remove();}return threatLaunchBase();};$('launchMatch').onclick=()=>launch();
window.addEventListener('resize',()=>{if(currentScreen==='threats')renderThreats();if(currentScreen==='plumber')syncPlumberLane()});
// Campaign-only cooldown and reaction scaling. Normal modes retain their combat rules.
const ladderCastBase=cast;cast=function(f,type){const ok=ladderCastBase(f,type);if(ok&&selectedMode==='campaign'&&f===player&&(type==='skill0'||type==='skill1')){const slot=type==='skill0'?0:1;f.cd[slot]*=plumberTuning(threatStage).playerCooldown;}return ok;};
const ladderAIBase=ai;ai=function(dt){const before=aiWait;ladderAIBase(dt);if(selectedMode==='campaign'&&aiWait>0&&aiWait>before-dt+.00001)aiWait*=plumberTuning(threatStage).reaction;};
renderHeroProgress();saveProfile();


// Four illustrated choices share one fixed Play viewport.
const modeScenes={
 campaign:{title:'Plumber Missions',copy:'Campaigns · Portal defense · Boss Rush',tag:'CHOOSE YOUR OPERATION',heroes:[0],villain:29,mark:'VS'},
 versus:{title:'Battle',copy:'Alien vs alien · Best of 3',tag:'QUICK MATCH',heroes:[0,2],mark:'VS'},
 survival:{title:'Survival',copy:'One life · Endless rivals',tag:'ENDURANCE',heroes:[1,3,10],mark:'∞'},
 training:{title:'Testing',copy:'All '+ALIEN_COUNT+' aliens · Free practice',tag:'TRAINING LAB',heroes:[7],mark:'⌖'}
};
for(const card of document.querySelectorAll('#screen-modes [data-mode]')){
 const scene=modeScenes[card.dataset.mode];if(!scene)continue;
 const art=document.createElement('div');art.className='mode-scene mode-scene-'+card.dataset.mode;art.setAttribute('aria-hidden','true');
 scene.heroes.forEach((id,n)=>{const cv=document.createElement('canvas');cv.width=240;cv.height=280;cv.className='mode-fighter mode-fighter-'+n;art.appendChild(cv);classicReady.then(()=>drawClassicPortrait(cv.getContext('2d'),id,240,280)).catch(()=>{});});
 if(Number.isInteger(scene.villain)){const img=document.createElement('img');img.src=VILLAIN_DATA.characters[scene.villain].portrait;img.alt='';img.className='mode-villain';art.appendChild(img);}
 const mark=document.createElement('b');mark.className='mode-scene-mark';mark.textContent=scene.mark;art.appendChild(mark);
 const text=document.createElement('div');text.className='mode-caption';const tag=document.createElement('span');tag.textContent=scene.tag;const title=document.createElement('h2');title.textContent=scene.title;const copy=document.createElement('p');copy.textContent=scene.copy;text.append(tag,title,copy);card.replaceChildren(art,text);card.setAttribute('aria-label',(card.dataset.mode==='campaign'?THREAT_NAME:scene.title)+' — '+scene.copy);
}

// Browse locked stages freely; starting their fights remains guarded in begin().
const stageFinderGroup=document.createElement('div');stageFinderGroup.className='stage-finder-group';
const stageFinder=document.createElement('input');stageFinder.type='range';stageFinder.id='stageFinder';stageFinder.min='1';stageFinder.max=String(VILLAIN_COUNT);stageFinder.step='1';stageFinder.setAttribute('aria-label','Find villain stage');
$('threatPageNumber').before(stageFinderGroup);stageFinderGroup.append(stageFinder,$('threatPageNumber'));
stageFinder.oninput=()=>{threatStage=plumberInfo().start+Number(stageFinder.value)-1;threatPage=Math.floor((threatStage-plumberInfo().start)/threatPageSize());renderThreats();stageFinder.setAttribute('aria-valuetext','Stage '+(threatStage-plumberInfo().start+1)+': '+VILLAIN_DATA.characters[threatStage].name);};
function stageSwipe(element,onSwipe){let origin=null,until=0;element.addEventListener('pointerdown',e=>{if(e.isPrimary!==false)origin={x:e.clientX,y:e.clientY};});element.addEventListener('pointercancel',()=>origin=null);element.addEventListener('pointerup',e=>{if(!origin)return;const dx=e.clientX-origin.x,dy=e.clientY-origin.y;origin=null;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.3){until=performance.now()+450;onSwipe(dx<0?1:-1);}});element.addEventListener('click',e=>{if(performance.now()<until){e.preventDefault();e.stopImmediatePropagation();}},true);}
stageSwipe($('threatCards'),direction=>{threatPage+=direction;renderThreats();});
stageSwipe($('threatImage').parentElement,direction=>{threatStage=Math.max(plumberInfo().start,Math.min(plumberInfo().start+plumberInfo().count-1,threatStage+direction));renderThreat();});

function syncPlumberLane(){const lane=$('plumberModes');$('plumberLanePrev').disabled=lane.scrollLeft<4;$('plumberLaneNext').disabled=lane.scrollLeft>=lane.scrollWidth-lane.clientWidth-4;}
function scrollPlumberLane(dir){const lane=$('plumberModes'),card=lane.firstElementChild;lane.scrollBy({left:dir*((card?.getBoundingClientRect().width||260)+12),behavior:'smooth'});}
$('plumberLanePrev').onclick=()=>scrollPlumberLane(-1);$('plumberLaneNext').onclick=()=>scrollPlumberLane(1);$('plumberModes').addEventListener('scroll',syncPlumberLane,{passive:true});$('plumberModes').addEventListener('keydown',e=>{if(e.target!==$('plumberModes'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();scrollPlumberLane(e.key==='ArrowRight'?1:-1);}});

const rushRulesDialog=document.createElement('dialog');rushRulesDialog.id='rushRulesDialog';rushRulesDialog.innerHTML='<h2>Five bosses. One life.</h2><p>Defeat Hex, Kevin 11, Vilgax, Aggregor and Malware in order. Recover 20% maximum health after each win and keep your ultimate charge.</p><p>Clear all five: 600 coins + Hero XP. A completed defeat: 20 coins. Quitting gives no reward. Your best streak stays saved.</p><button id="closeRushRules" class="primary">Got it</button>';document.body.appendChild(rushRulesDialog);$('rushRules').onclick=()=>rushRulesDialog.showModal();$('closeRushRules').onclick=()=>rushRulesDialog.close();


