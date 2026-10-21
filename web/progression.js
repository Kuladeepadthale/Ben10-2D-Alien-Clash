'use strict';
// Ownership, coins and mission claims share the existing atomic profile save.
const CARD_RANKS=[{name:'Normal',symbol:'●',color:'#a9bac7',cost:10},{name:'Rare',symbol:'◆',color:'#55b9ff',cost:15},{name:'Epic',symbol:'✦',color:'#c28aff',cost:20},{name:'Heroic',symbol:'✪',color:'#ff954f',cost:25},{name:'Legendary',symbol:'♛',color:'#ffda65',cost:30}];
const ALIEN_RANKS=[2,1,2,1,0,0,1,1,0,2,1,0,1,0,2,0,1,2,4,1,0,0,2,1,3,2,2,2,1,2,1,4,2,2,1,2,2,3,2,3,1,1,2,3,0,2,3,2,4,1,0,2,2,1,1,2,3,2,4,0,0,1,2,3,3,2,1,4,4,4,4,4];
const gemPrice=amount=>'<span class="gem-price" role="img" aria-label="'+amount+' diamonds"><i class="currency-icon gem" aria-hidden="true"></i><b>'+amount+'</b></span>';
const cardRank=id=>CARD_RANKS[ALIEN_RANKS[id]??0];
const ALIEN_PRICES=Array.from({length:ALIEN_COUNT},(_,id)=>cardRank(id).cost);
const RARITY_HEALTH=[1000,1125,1250,1400,1600],RARITY_POWER=[1,1.08,1.18,1.30,1.45];
function rarityHealth(id){return RARITY_HEALTH[ALIEN_RANKS[id]??0]*(aliens[id].healthFactor||1);}
function rarityPower(id){return RARITY_POWER[ALIEN_RANKS[id]??0];}
const MISSION_DEFS=[
 {id:'battles',name:'Arena explorer',text:'Finish 3 battles.',stat:'matches',goal:3,reward:120,repeat:true},
 {id:'wins',name:'Hero of the arena',text:'Win 2 battles.',stat:'wins',goal:2,reward:150,repeat:true},
 {id:'damage',name:'Power unleashed',text:'Deal 2,000 damage.',stat:'damage',goal:2000,reward:150,repeat:true},
 {id:'powers',name:'Master your powers',text:'Use powers 10 times.',stat:'powers',goal:10,reward:100,repeat:true},
 {id:'survival',name:'Survival streak',text:'Defeat 5 Survival rivals.',stat:'stages',goal:5,reward:200,repeat:true},
 {id:'collection',name:'Build your team',text:'Own 3 aliens.',stat:'owned',goal:3,reward:250,repeat:false},
 {id:'expanded',name:'Expand your Omnitrix',text:'Own 10 aliens.',stat:'owned',goal:10,reward:400,repeat:false},
 {id:'complete',name:'Classic collector',text:'Own 20 aliens.',stat:'owned',goal:20,reward:800,repeat:false},
 {id:'originals',name:'Original-series master',text:'Own all 22 Original Series aliens.',stat:'originals',goal:22,reward:300,repeat:false},
 {id:'alienforce',name:'Alien Force team',text:'Own all 10 Alien Force aliens.',stat:'alienforce',goal:10,reward:650,repeat:false},
 {id:'new20',name:'Beyond the Omnitrix',text:'Own all 20 new aliens.',stat:'new20',goal:20,reward:1000,repeat:false},
 {id:'new20ii',name:'Ultimate collection',text:'Own all 20 expansion aliens and Ultimate forms.',stat:'new20ii',goal:20,reward:1200,repeat:false},
 {id:'upgrades',name:'Stronger together',text:'Buy 5 upgrades.',stat:'upgrades',goal:5,reward:150,repeat:false}
];
// Timed goals use independent saved counters; career milestones keep their history.
MISSION_DEFS.push(
 {id:'daily-play',name:'Play 3 battles',text:'Play 3 battles',stat:'matches',goal:3,reward:120,repeat:false,period:'daily'},
 {id:'daily-win',name:'Win 2 battles',text:'Win 2 battles',stat:'wins',goal:2,reward:150,repeat:false,period:'daily'},
 {id:'daily-powers',name:'Use 10 powers',text:'Use 10 powers',stat:'powers',goal:10,reward:100,repeat:false,period:'daily'},
 {id:'weekly-play',name:'Play 20 battles',text:'Play 20 battles',stat:'matches',goal:20,reward:600,repeat:false,period:'weekly'},
 {id:'weekly-win',name:'Win 10 battles',text:'Win 10 battles',stat:'wins',goal:10,reward:750,repeat:false,period:'weekly'},
 {id:'weekly-survival',name:'Beat 15 Survival rivals',text:'Beat 15 Survival rivals',stat:'stages',goal:15,reward:700,repeat:false,period:'weekly'},
 {id:'monthly-play',name:'Play 60 battles',text:'Play 60 battles',stat:'matches',goal:60,reward:1800,repeat:false,period:'monthly'},
 {id:'monthly-win',name:'Win 30 battles',text:'Win 30 battles',stat:'wins',goal:30,reward:2000,repeat:false,period:'monthly'},
 {id:'monthly-powers',name:'Use 200 powers',text:'Use 200 powers',stat:'powers',goal:200,reward:1500,repeat:false,period:'monthly'}
);
let missionTab='daily';
const careerNumber=(v,max=100000000)=>Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
let storedCareer=null;try{storedCareer=JSON.parse(localStorage.getItem('omnitrix-profile-v2')||'null')?.collection}catch{}
const career={version:1,owned:[],offers:[],selected:0,stats:{matches:0,wins:0,damage:0,powers:0,stages:0,upgrades:0},claims:{},lastMatches:profile.matches,lastWins:profile.wins};
if(storedCareer?.version===1){career.owned=[...new Set((Array.isArray(storedCareer.owned)?storedCareer.owned:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<ALIEN_COUNT))];career.offers=[...new Set((Array.isArray(storedCareer.offers)?storedCareer.offers:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<ALIEN_COUNT))];career.selected=careerNumber(storedCareer.selected,ALIEN_COUNT-1);for(const k in career.stats)career.stats[k]=careerNumber(storedCareer.stats?.[k]);for(const m of MISSION_DEFS)career.claims[m.id]=careerNumber(storedCareer.claims?.[m.id],m.repeat?100000:1);career.lastMatches=careerNumber(storedCareer.lastMatches);career.lastWins=careerNumber(storedCareer.lastWins);}
if(career.offers.length!==3){const pool=Array.from({length:ALIEN_COUNT},(_,i)=>i);for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}career.offers=pool.slice(0,3);}
career.gems=careerNumber(storedCareer?.gems,1000000);
career.packState=storedCareer?.packState?.version===1?storedCareer.packState:{version:1,serial:0,last:null};
career.periods={};
for(const period of ['daily','weekly','monthly']){const old=storedCareer?.periods?.[period];if(old&&typeof old.key==='string'&&old.base){career.periods[period]={key:old.key,base:{}};for(const stat in career.stats)career.periods[period].base[stat]=careerNumber(old.base[stat]);}}
syncMissionPeriods();
profile.collection=career;
const careerSaveBase=saveProfile;saveProfile=function(){syncMissionPeriods();career.stats.matches+=Math.max(0,profile.matches-career.lastMatches);career.stats.wins+=Math.max(0,profile.wins-career.lastWins);career.lastMatches=profile.matches;career.lastWins=profile.wins;profile.collection=career;careerSaveBase();};
saveProfile();
const ownsAlien=id=>career.owned.includes(id),testingMode=()=>selectedMode==='training';
let garageAlien=career.owned.includes(career.selected)?career.selected:career.owned[0]??career.offers[0];
let starterChoice=career.offers[0];
function missionWindow(period,now=new Date()){
 const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 if(period==='weekly')start.setDate(start.getDate()-(start.getDay()+6)%7);
 if(period==='monthly')start.setDate(1);
 const end=new Date(start);if(period==='monthly')end.setMonth(end.getMonth()+1);else end.setDate(end.getDate()+(period==='weekly'?7:1));
 return {key:[start.getFullYear(),start.getMonth()+1,start.getDate()].join('-'),end:end.getTime()};
}
function syncMissionPeriods(){for(const period of ['daily','weekly','monthly']){const window=missionWindow(period);if(career.periods[period]?.key!==window.key){career.periods[period]={key:window.key,base:{...career.stats}};for(const m of MISSION_DEFS)if(m.period===period)career.claims[m.id]=0;}}}
function missionProgress(m){syncMissionPeriods();const total=m.stat==='owned'?career.owned.length:m.stat==='alienforce'?career.owned.filter(id=>id>=22&&id<32).length:m.stat==='new20'?career.owned.filter(id=>id>=32&&id<52).length:m.stat==='new20ii'?career.owned.filter(id=>id>=52&&id<72).length:m.stat==='originals'?career.owned.filter(id=>id<22).length:career.stats[m.stat]||0,claims=career.claims[m.id]||0,baseline=m.period?career.periods[m.period].base[m.stat]||0:0;return Math.max(0,Math.min(m.goal,total-baseline-(m.repeat?claims*m.goal:0)));}
function missionReady(m){syncMissionPeriods();return (m.repeat||!career.claims[m.id])&&missionProgress(m)>=m.goal;}
function claimMission(id){const m=MISSION_DEFS.find(x=>x.id===id);if(!m||!missionReady(m)||isLocked())return false;career.claims[id]=(career.claims[id]||0)+1;profile.credits+=m.reward;saveProfile();careerToast('Reward claimed! +'+m.reward+' coins');renderSetup();renderMissions();return true;}
function chooseStarter(id){if(career.owned.length||!career.offers.includes(id)||isLocked())return false;career.owned=[id];career.selected=id;garageAlien=id;saveProfile();select(id);showScreen('home',false);screenHistory.length=0;careerToast(aliens[id].name+' is yours!');return true;}
function buyAlien(id){if(isLocked()||!career.owned.length||ownsAlien(id)||!Number.isInteger(id)||id<0||id>=ALIEN_COUNT||career.gems<ALIEN_PRICES[id])return false;const previousGems=career.gems;career.gems-=ALIEN_PRICES[id];career.owned.push(id);saveProfile();if(!storageOK){career.gems=previousGems;career.owned.splice(career.owned.indexOf(id),1);careerToast('Could not save purchase. No diamonds spent.');return false;}career.selected=id;garageAlien=id;select(id);careerToast(aliens[id].name+' unlocked!');return true;}
const toast=document.createElement('div');toast.id='careerToast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.appendChild(toast);let careerToastTimer;
function careerToast(message){toast.textContent=message;toast.classList.add('visible');clearTimeout(careerToastTimer);careerToastTimer=setTimeout(()=>toast.classList.remove('visible'),2600);}
function addCareerScreen(id,html){const section=document.createElement('section');section.id='screen-'+id;section.className='app-screen career-screen';section.hidden=true;section.innerHTML=html;$('screens').appendChild(section);return section;}
addCareerScreen('starter',`<div class="career-heading"><span class="career-kicker">OMNITRIX ACTIVATION</span><h1>Choose your alien</h1><p>Pick one. Unlock it free.</p></div><div id="starterCards" class="career-grid starter-grid"></div><div class="career-footer"><button id="confirmStarter" class="primary">Unlock my free alien</button><button id="starterTesting">Try all in Testing</button><p>Earn coins from battles and missions to unlock the rest.</p></div>`);
addCareerScreen('missions',`<div class="career-heading mission-heading"><span class="career-kicker">PLUMBER REWARD HQ</span><h1>Missions</h1></div><div class="mission-wallet"><span>◈ <strong id="missionBalance">0</strong> coins</span><button data-screen="characters">Alien cards →</button></div><nav id="missionTabs" class="mission-tabs" aria-label="Mission periods"></nav><div id="missionReset" class="mission-reset"></div><div id="missionCards" class="mission-grid"></div>`);
addCareerScreen('garage',`<div class="career-heading"><span class="career-kicker">YOUR ALIEN WORKSHOP</span><h1>Choose an alien to upgrade</h1><p>Tap a character first. Then select it for battle or open its upgrades.</p></div><div id="garageCards" class="career-grid garage-grid"></div><div class="career-footer"><strong id="garageName"></strong><div class="career-actions"><button id="garageSelect">Select for battle</button><button id="garageUpgrade" class="primary">Open upgrades →</button></div><p id="garageHint"></p></div>`);
uiLabels.starter='Free alien';uiLabels.missions='Missions';uiLabels.garage='Upgrade';
const rosterNotice=document.createElement('div');rosterNotice.id='collectionNotice';rosterNotice.className='collection-notice';$('characterContent').before(rosterNotice);
const collectionFooter=$('screen-characters').querySelector('.page-actions');collectionFooter.innerHTML='<button id="collectionUse" class="primary">Select for battle</button><button id="collectionBuy">Unlock alien</button><button id="collectionUpgrade">Upgrade alien</button>';
const upgradeHeading=document.createElement('div');upgradeHeading.className='career-heading compact-heading';upgradeHeading.innerHTML='<span class="career-kicker">IMPROVE YOUR ALIEN</span><h1 id="upgradeAlienTitle"></h1><p>Upgrades belong to this alien. Spend coins to improve health and powers.</p>';$('screen-upgrades').prepend(upgradeHeading);
$('screen-upgrades').querySelector('.page-actions').innerHTML='<button data-screen="garage">Choose another alien</button><button data-screen="setup" class="primary">Ready for battle →</button>';
const rewardPanel=document.createElement('div');rewardPanel.id='matchReward';rewardPanel.className='coin-banner match-reward';$('resultReport').before(rewardPanel);
const missionsNav=document.querySelector('.app-bottom [data-screen="settings"]');missionsNav.dataset.screen='missions';missionsNav.innerHTML=uiIcon('ultimate')+'<span>Missions</span>';
const shortcut=document.querySelector('.home-shortcuts [data-screen="controls"]');shortcut.dataset.screen='missions';shortcut.innerHTML=uiIcon('ultimate')+'<span>Missions</span>';
$('wallet').setAttribute('aria-label','Coins and mission rewards');$('wallet').onclick=()=>navigate('missions');
$('screen-modes').querySelector('.page-title h1').textContent='Choose how to play';
$('screen-modes').querySelector('.mode-grid').innerHTML=`<button class="mode-card mode-versus" data-mode="versus"><span class="mode-emblem">${uiIcon('block')}</span><span class="mode-tag">QUICK BATTLE</span><h2>Battle</h2><p>Face a rival alien. Win 2 rounds to win the match.</p><span class="mode-reward">Win +120 coins<br>Finish +60 coins</span><strong>Choose your rival →</strong></button><button class="mode-card mode-survival" data-mode="survival"><span class="mode-emblem">${uiIcon('ultimate')}</span><span class="mode-tag">KEEP THE STREAK GOING</span><h2>Survival</h2><p>Defeat one rival after another. Recover some health after each win.</p><span class="mode-reward">+40 coins per rival</span><strong>Build your streak →</strong></button><button class="mode-card mode-testing" data-mode="training"><span class="mode-emblem">${uiIcon('aliens')}</span><span class="mode-tag">ALL ${ALIEN_COUNT} ALIENS FREE TO TRY</span><h2>Testing</h2><p>Try any alien and every power against a practice target.</p><span class="mode-reward">No locks · No rewards</span><strong>Try every alien →</strong></button>`;
rosterDeck.options.landscape=3;rosterDeck.options.short=3;rosterDeck.options.portrait=2;
function portraitCard(id,kind,active){const b=document.createElement('button');b.className='career-alien'+(active?' active':'');b.dataset.alien=id;b.setAttribute('aria-pressed',String(active));b.innerHTML='<canvas width="240" height="280" aria-hidden="true"></canvas><strong>'+aliens[id].name+'</strong><span>'+(kind==='starter'?'FREE STARTER':ownsAlien(id)?'UNLOCKED':gemPrice(ALIEN_PRICES[id]))+'</span>';b.onclick=()=>{if(kind==='starter'){starterChoice=id;renderStarter()}else{garageAlien=id;renderGarage()}};classicReady.then(()=>drawClassicPortrait(b.querySelector('canvas').getContext('2d'),id,240,280)).catch(()=>{});return b;}
function renderStarter(){$('starterCards').replaceChildren(...career.offers.map(id=>portraitCard(id,'starter',id===starterChoice)));$('confirmStarter').textContent='Unlock '+aliens[starterChoice].name+' — FREE';}
function renderGarage(){$('garageCards').replaceChildren(...aliens.map((_,id)=>portraitCard(id,'garage',id===garageAlien)));$('garageName').textContent=aliens[garageAlien].name;$('garageSelect').disabled=$('garageUpgrade').disabled=!ownsAlien(garageAlien)||isLocked();$('garageHint').textContent=ownsAlien(garageAlien)?'Unlocked • Choose what you want to do.':'Locked • Unlock this alien from the Aliens page first.';}
function renderMissions(){
 syncMissionPeriods();const ready=MISSION_DEFS.filter(missionReady).length;$('missionBalance').textContent=profile.credits.toLocaleString();
 $('missionTabs').replaceChildren(...[['daily','Daily'],['weekly','Weekly'],['monthly','Monthly'],['career','Career']].map(([id,label])=>{const b=document.createElement('button');b.textContent=label;b.classList.toggle('has-reward',MISSION_DEFS.some(m=>(id==='career'?!m.period:m.period===id)&&missionReady(m)));b.setAttribute('aria-label',label+(b.classList.contains('has-reward')?' — reward ready':''));b.setAttribute('aria-pressed',String(id===missionTab));b.onclick=()=>{missionTab=id;renderMissions()};return b;}));
 if(missionTab==='career')$('missionReset').textContent='Career goals · progress stays saved';else {const hours=Math.max(1,Math.ceil((missionWindow(missionTab).end-Date.now())/3600000));$('missionReset').textContent='Resets in '+(hours>=24?Math.ceil(hours/24)+' days':hours+' hours')+' · Testing does not count';}
 const visible=MISSION_DEFS.filter(m=>missionTab==='career'?!m.period:m.period===missionTab);
 $('missionCards').dataset.tab=missionTab;
 $('missionCards').replaceChildren(...visible.map(m=>{const progress=missionProgress(m),done=!m.repeat&&career.claims[m.id],ready=missionReady(m),card=document.createElement('article');card.className='mission-card'+(ready?' reward-ready':'')+(done?' reward-claimed':'');
 card.innerHTML='<span class="mission-task-icon">'+uiIcon(m.stat==='wins'?'ultimate':m.stat==='powers'?'skill0':m.stat==='matches'?'play':'aliens')+'</span><div class="mission-task"><h2>'+m.text.replace(/\.$/,'')+'</h2><div class="mission-progress" role="progressbar" aria-label="'+m.text+'" aria-valuemin="0" aria-valuemax="'+m.goal+'" aria-valuenow="'+progress+'"><i style="width:'+progress/m.goal*100+'%"></i></div><span class="mission-count">'+(done?'✓ Claimed':Math.floor(progress).toLocaleString()+' / '+m.goal.toLocaleString())+'</span></div><div class="mission-prize"><strong><i class="currency-icon coin" aria-hidden="true"></i> '+m.reward+'</strong><button '+(!ready||isLocked()?'disabled':'')+'>'+(done?'Done':ready?'Claim':'Pending')+'</button></div>';
 card.querySelector('button').onclick=()=>claimMission(m.id);return card;}));
 missionsNav.classList.toggle('has-reward',ready>0);missionsNav.setAttribute('aria-label','Missions'+(ready?' — '+ready+' rewards ready':''));
}
function careerRefresh(){const cards=[...$('roster').children],ordered=[...cards].sort((a,b)=>Number(ownsAlien(Number(b.dataset.alien)))-Number(ownsAlien(Number(a.dataset.alien)))||ALIEN_RANKS[Number(a.dataset.alien)]-ALIEN_RANKS[Number(b.dataset.alien)]||Number(a.dataset.alien)-Number(b.dataset.alien));if(cards.some((c,i)=>c!==ordered[i]))$('roster').replaceChildren(...ordered);const test=testingMode(),owned=ownsAlien(selected),name=aliens[selected].name;
 document.querySelectorAll('#roster .card').forEach((card,index)=>{const id=Number(card.dataset.alien??index);let status=card.querySelector('.ownership');if(!status){status=document.createElement('b');status.className='ownership';card.appendChild(status)}const rank=cardRank(id);card.dataset.rank=rank.name.toLowerCase();card.style.setProperty('--rank-color',rank.color);let badge=card.querySelector('.card-rank');if(!badge){badge=document.createElement('b');badge.className='card-rank';card.insertBefore(badge,card.firstChild)}badge.textContent=rank.symbol+' '+rank.name;status.innerHTML=test?'FREE TO TEST':ownsAlien(id)?'UNLOCKED':gemPrice(ALIEN_PRICES[id]);status.setAttribute('aria-label',test?'Free to test':ownsAlien(id)?'Unlocked':ALIEN_PRICES[id]+' diamonds');card.classList.toggle('alien-locked',!ownsAlien(id));let lock=card.querySelector('.alien-lock-symbol');if(!lock){lock=document.createElement('i');lock.className='alien-lock-symbol';lock.setAttribute('aria-hidden','true');lock.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';card.appendChild(lock);}lock.hidden=ownsAlien(id);card.setAttribute('aria-label',aliens[id].name+' — '+rank.name+' — '+status.getAttribute('aria-label'));});
 $('walletCount').textContent=profile.credits>9999?new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(profile.credits):profile.credits;
 $('collectionNotice').innerHTML='<span>'+(test?'All aliens free to test':career.owned.length+' / '+ALIEN_COUNT+' unlocked · '+gemPrice(career.gems))+'</span><button data-screen="packs">Card Packs</button>';
 $('collectionUse').textContent=test?'Test '+name:'Select '+name;$('collectionUse').disabled=isLocked()||(!test&&!owned);$('collectionBuy').hidden=owned||test;$('collectionBuy').disabled=isLocked()||!career.owned.length||career.gems<ALIEN_PRICES[selected];$('collectionBuy').innerHTML=!career.owned.length?'Choose your free starter first':career.gems>=ALIEN_PRICES[selected]?'Unlock · '+gemPrice(ALIEN_PRICES[selected]):'Need '+gemPrice(ALIEN_PRICES[selected]-career.gems)+' more';$('collectionUpgrade').disabled=isLocked()||!owned;
 $('upgradeAlienTitle').textContent=name+' upgrades';
 if(!owned)document.querySelectorAll('[data-upgrade]').forEach(b=>b.disabled=true);
 if(!owned&&!test)document.querySelectorAll('[data-equip]').forEach(b=>b.disabled=true);
 $('launchMatch').textContent=test?'Start testing':selectedMode==='survival'?'Start Survival':'Start battle';
 $('modeEyebrow').textContent=test?'TEST ANY ALIEN':selectedMode==='survival'?'SURVIVAL':'BATTLE';
 $('modeDescription').textContent=test?'All aliens available. Unlimited practice. No rewards.':selectedMode==='survival'?'Earn 40 coins per rival. Recover 20% health after a win.':'Win 2 rounds. Each round lasts 90 seconds. Win 120 coins or earn 60 for finishing.';
 $('opponent').closest('label').firstChild.textContent='Choose your rival ';$('difficulty').closest('label').firstChild.textContent='Difficulty ';
 if(currentScreen==='garage')renderGarage();if(currentScreen==='missions')renderMissions();
 document.querySelector('.app-bottom [data-screen=upgrades]').setAttribute('aria-current',['garage','upgrades'].includes(currentScreen)?'page':'false');
 if(typeof refreshEconomyWallet==='function')refreshEconomyWallet();const ready=MISSION_DEFS.filter(missionReady).length;missionsNav.classList.toggle('has-reward',ready>0);missionsNav.setAttribute('aria-label','Missions'+(ready?' — '+ready+' rewards ready':''));
}
const careerSelectBase=select;select=function(id){careerSelectBase(id);if(!isLocked()&&ownsAlien(id)){career.selected=id;saveProfile()}careerRefresh();};
const careerEquipBase=equip;equip=function(index,slot){if(!testingMode()&&!ownsAlien(selected)){careerToast('Unlock this alien first, or try it in Testing.');return}careerEquipBase(index,slot);};
const careerUpgradeBase=upgrade;upgrade=function(key){if(!ownsAlien(selected)||isLocked())return;const before=profile.aliens[selected].levels[key];careerUpgradeBase(key);if(profile.aliens[selected].levels[key]>before){career.stats.upgrades++;saveProfile();careerToast('Upgrade added to '+aliens[selected].name);careerRefresh();}};
const careerRenderBase=renderSetup;renderSetup=function(){careerRenderBase();careerRefresh();};
const careerScreenBase=showScreen;showScreen=function(name,remember=true){if(name==='upgrades')name='garage';if(!career.owned.length&&(['home','modes'].includes(name)||name==='setup'&&!testingMode()))name='starter';careerScreenBase(name,remember);if(name==='starter')renderStarter();if(name==='missions')renderMissions();if(name==='garage')renderGarage();careerRefresh();};
function openAlienUpgrades(id){if(!ownsAlien(id)){careerToast('Unlock this alien first.');return}select(id);careerScreenBase('upgrades');careerRefresh();}
$('confirmStarter').onclick=()=>chooseStarter(starterChoice);$('starterTesting').onclick=()=>{selectedMode='training';showScreen('characters');};
$('collectionBuy').onclick=()=>buyAlien(selected);$('collectionUse').onclick=()=>showScreen('modes');$('collectionUpgrade').onclick=()=>openAlienUpgrades(selected);
$('garageSelect').onclick=()=>{if(ownsAlien(garageAlien)){select(garageAlien);if(testingMode())selectedMode='versus';showScreen('setup');}};$('garageUpgrade').onclick=()=>openAlienUpgrades(garageAlien);
const careerBeginBase=begin;begin=function(newMatch=true,practice=false){if(!practice&&!testingMode()&&!ownsAlien(selected)){careerToast('Choose an unlocked alien for battle.');showScreen(career.owned.length?'characters':'starter');return Promise.resolve(false)}return careerBeginBase(newMatch,practice);};
const careerHitBase=receiveHit;receiveHit=function(from,to,...args){syncMissionPeriods();const damage=careerHitBase(from,to,...args);if(damage>0&&from===player&&!training&&mode==='fight')career.stats.damage=Math.min(100000000,career.stats.damage+damage);return damage;};
const careerCastBase=cast;cast=function(f,type){syncMissionPeriods();const ok=careerCastBase(f,type);if(ok&&f===player&&!training&&mode==='fight'&&type!=='normal'){career.stats.powers++;saveProfile()}return ok;};
const careerFinishBase=finish;finish=async function(){if(selectedMode==='survival'&&mode==='fight'&&!training&&player.hp>0&&enemy.hp<=0)career.stats.stages++;const result=await careerFinishBase();if(currentScreen==='results')renderCareerReward();return result;};
const careerEndBase=endMatch;endMatch=function(){careerEndBase();renderCareerReward();};
function renderCareerReward(){const survival=selectedMode==='survival',coins=training?0:survival?survivalScore*40:wins[0]>=2?120:60,ready=MISSION_DEFS.filter(missionReady).length;rewardPanel.innerHTML='<span class="coin-medal">◈</span><div><span>'+(survival?'Coins earned in this run':'Battle reward')+'</span><strong>+'+coins+' coins</strong></div><button id="resultMissions">'+(ready?ready+' mission rewards ready':'View missions')+' →</button>';$('resultMissions').onclick=()=>showScreen('missions');$('resultText').textContent=$('resultText').textContent.replace(/credits/g,'coins');careerRefresh();}
renderStarter();renderMissions();select(career.owned.includes(career.selected)?career.selected:career.owned[0]??career.offers[0]);showScreen(career.owned.length?'home':'starter',false);




for(const [screen,first,second,icon] of [['characters','ALIENS','','aliens'],['modes','BATTLE','','block']]){const heading=$('screen-'+screen).querySelector('.page-title');heading.classList.add('arena-heading');heading.querySelector('h1').innerHTML='<i class="arena-heading-icon">'+uiIcon(icon)+'</i><span class="arena-heading-title">'+first+' <em>'+second+'</em></span>';}

// Sorting changes display order only; selection, prices and ownership use stable alien IDs.
const categoryCards=[...$('roster').children];categoryCards.sort((a,b)=>ALIEN_RANKS[Number(a.dataset.alien)]-ALIEN_RANKS[Number(b.dataset.alien)]||Number(a.dataset.alien)-Number(b.dataset.alien));$('roster').replaceChildren(...categoryCards);careerRefresh();

