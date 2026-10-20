'use strict';
// Keep the detailed result data for game logic, but present one fitted summary.
const resultSummary=document.createElement('section');resultSummary.id='matchSummary';resultSummary.innerHTML='<div class="result-hero"><div class="result-halo"></div><canvas id="resultAlienArt" width="360" height="300" aria-label="Your alien"></canvas><span id="summaryOutcome" class="result-outcome">VICTORY</span></div><div class="result-overview"><div class="result-duel"><span id="summaryPlayer">You</span><b id="summaryScore">2 : 0</b><span id="summaryOpponent">Rival</span></div><p id="summaryMode"></p><div class="result-rewards"><article><i class="currency-icon coin" aria-hidden="true"></i><strong id="summaryCoins">+0</strong><span>Coins</span></article><article><i class="result-xp-icon" aria-hidden="true">★</i><strong id="summaryXP">+0</strong><span>Hero XP</span></article><article><i class="result-rp-icon" aria-hidden="true">✪</i><strong id="summaryRP">—</strong><span>Rank Points</span></article></div><div class="result-progress"><span id="summaryProgress"></span><b id="summaryRank"></b></div></div>';
document.querySelector('#screen-results .screen-content').prepend(resultSummary);
const resultActions=document.querySelector('#screen-results .page-actions');resultActions.querySelector('[data-screen=upgrades]').hidden=true;resultActions.querySelector('[data-screen=setup]').textContent='Loadout';resultActions.querySelector('[data-screen=home]').textContent='Home';
let resultRenderQueued=false;
function renderMatchSummary(){if(currentScreen!=='results')return;const receipt=typeof online!=='undefined'?online.result:null,draw=receipt?.winner===-1,won=receipt?receipt.winner===receipt.seat:wins[0]>=2,campaign=selectedMode==='campaign',survival=selectedMode==='survival';
 const opponent=receipt?receipt.names?.[1-receipt.seat]:Number.isInteger(enemy?.villain)?VILLAIN_DATA.characters[enemy.villain].name:enemy?aliens[enemy.id].name:'Arena';
 if(receipt)$('playAgain').textContent='Find Match';else if(!campaign)$('playAgain').textContent='Play Again';$('summaryPlayer').textContent=accountPlayerName()||'You';$('summaryOpponent').textContent=opponent||'Rival';$('summaryScore').textContent=campaign?'STAGE '+(threatStage+1):survival?String(survivalScore)+' KO':draw?'DRAW':wins.join(' : ');$('summaryOutcome').textContent=draw?'DRAW':survival?'RUN COMPLETE':won?'VICTORY':'DEFEAT';resultSummary.dataset.outcome=won?'win':draw?'draw':'loss';
 $('summaryMode').textContent=receipt?(receipt.bot?'Bot Practice':'Ranked Multiplayer'):campaign?'Plumber Threat Ladder':survival?'Survival':training?'Testing':'Bot Practice';
 const amount=rewardPanel.textContent.match(/\+([\d,]+)\s*(?:coins|credits)/i);$('summaryCoins').textContent='+'+(amount?Number(amount[1].replace(/,/g,'')).toLocaleString():0);$('summaryXP').textContent='+'+(Number(lastXPGain)||0);const delta=receipt&&!receipt.bot?receipt.delta[receipt.seat]:null;$('summaryRP').textContent=delta===null?'—':(delta>=0?'+':'')+delta;$('summaryRP').classList.toggle('negative',delta<0);
 $('summaryProgress').textContent='Hero Level '+heroStanding().level;$('summaryRank').textContent=receipt&&!receipt.bot?AlienRankRules.standing(online.points).name:campaign?threatProgress.cleared+' / 30 stages':receipt?.bot?'No RP change':'Keep transforming';
 const cv=$('resultAlienArt'),ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);drawClassicPortrait(ctx,player?.id??selected,cv.width,cv.height);cv.setAttribute('aria-label',aliens[player?.id??selected].name);}
function scheduleResultSummary(){if(resultRenderQueued)return;resultRenderQueued=true;requestAnimationFrame(()=>{resultRenderQueued=false;renderMatchSummary();});}
for(const id of ['resultTitle','resultText','matchReward'])new MutationObserver(scheduleResultSummary).observe($(id),{subtree:true,childList:true,characterData:true});
const experienceShowBase=showScreen;showScreen=function(name,remember=true){experienceShowBase(name,remember);if(currentScreen==='results')scheduleResultSummary();};
const experienceBeginBase=begin;begin=async function(newMatch=true,practice=false){if(newMatch&&!online.active)online.result=null;return experienceBeginBase(newMatch,practice);};
// Add matching icon treatment to the header controls without a text label.
accountNav.setAttribute('aria-label','Player account');accountNav.title='Player account';

// Both sides prepare before any simulation or input is allowed to run.
const battleReady=document.createElement('div');battleReady.id='battleReady';battleReady.hidden=true;battleReady.setAttribute('role','status');battleReady.setAttribute('aria-live','assertive');battleReady.innerHTML='<small>GET READY</small><strong>3</strong>';$('game').appendChild(battleReady);
let battleReadyUntil=0,battleGoUntil=0;
function battleCountdownActive(){return performance.now()<battleReadyUntil;}
function cancelBattleCountdown(){battleReadyUntil=0;battleGoUntil=0;battleReady.hidden=true;}
function startBattleCountdown(ms=3000){resetInputs();battleReadyUntil=performance.now()+Math.max(0,ms);battleGoUntil=battleReadyUntil+600;$('announcement').textContent='';announceTime=0;updateBattleCountdown();}
function syncBattleCountdown(ms){if(ms>0){battleReadyUntil=performance.now()+ms;battleGoUntil=battleReadyUntil+600;}else if(battleCountdownActive()){battleReadyUntil=performance.now();battleGoUntil=performance.now()+600;}}
function updateBattleCountdown(){if(currentScreen!=='battle'){battleReady.hidden=true;return;}const remaining=battleReadyUntil-performance.now();const visible=remaining>0||performance.now()<battleGoUntil;battleReady.hidden=!visible;if(!visible)return;const label=remaining>0?String(Math.ceil(remaining/1000)):'FIGHT!';if(battleReady.lastLabel!==label){battleReady.lastLabel=label;battleReady.querySelector('strong').textContent=label;battleReady.querySelector('small').textContent=remaining>0?'GET READY':'';}}
const readyAdvanceBase=advanceSimulation;advanceSimulation=function(dt){if(battleCountdownActive()){simulationCarry=0;return 0;}return readyAdvanceBase(dt);};
const readyBeginBase=begin;begin=async function(newMatch=true,practice=false){const ok=await readyBeginBase(newMatch,practice);if(ok!==false&&mode==='fight'&&!online.active)startBattleCountdown();return ok;};
const readyRenderBase=render;render=function(){updateBattleCountdown();readyRenderBase();};
// Move jump beside attacks; movement and defence stay under the left thumb.
document.querySelector('#touch .actions').prepend(document.querySelector('#touch [data-key=jump]'));

