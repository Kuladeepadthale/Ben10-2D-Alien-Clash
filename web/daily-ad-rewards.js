'use strict';
// Native SDK reward callbacks own counters. Web code only claims saved receipts.
career.adRewardReceipts=Array.isArray(storedCareer?.adRewardReceipts)?storedCareer.adRewardReceipts.filter(x=>typeof x==='string').slice(-2000):[];
const dailyAdsBridge=()=>window.AlienRewardAds;
const PACK_AD_GOALS={omni:2,power:6,master:10};
let dailyAdMessage='',dailyClaimBusy=false;
addCareerScreen('dailyrewards','<div class="career-heading"><span class="career-kicker">OPTIONAL REWARDS</span><h1>Reward vault</h1><p>Swipe across: three card packs, then today’s character from each category. Each reward has its own completed-ad counter.</p></div><p id="dailyAdStatus" role="status"></p><div id="dailyAlienRewards" aria-label="Pack and character rewards"></div><button id="resumeRewardPack" hidden>Reveal your saved pack →</button><p id="dailyResetNote">Daily offers and unfinished ad progress reset at 00:00 UTC (05:30 India). Claimed characters and cards stay saved. Normal battles and coin packs remain available without ads.</p><p><a href="https://ben10-omniverse-privacy-kuladeep.briskacorn.chatgpt.site" target="_blank" rel="noopener">Privacy policy</a> · Child-directed, non-personalised ad requests.</p><button data-screen="packs">← Card Packs</button>');
uiLabels.dailyrewards='Reward vault';
const dailyLink=document.createElement('button');dailyLink.id='dailyRewardsLink';dailyLink.textContent='Reward vault →';dailyLink.onclick=()=>showScreen('dailyrewards');$('screen-packs').querySelector('.shop-heading').appendChild(dailyLink);
function dailyState(){try{const b=dailyAdsBridge();return b?JSON.parse(b.getState(JSON.stringify(career.owned))):null;}catch{return null;}}
const dailyReceiptKey=r=>r.key||('alien:'+r.rank);
function dailyClaimed(s,key){return (s?.claimed||[]).some(r=>dailyReceiptKey(r)===key);}
function applyDailyReceipts(state){if(!state||dailyClaimBusy)return;dailyClaimBusy=true;
 try{for(const r of state.claimed||[]){if(typeof r.receipt!=='string'||career.adRewardReceipts.includes(r.receipt))continue;
  const pack=r.kind==='pack'?CARD_PACKS.find(p=>p.id===r.packId):null;
  if(pack){if(career.packState.last?.unseen)continue;if(!Array.isArray(r.cardIds)||r.cardIds.length!==15||!r.cardIds.every(id=>Number.isInteger(id)&&id>=0&&id<ALIEN_COUNT))continue;}
  else if(!Number.isInteger(r.id)||r.id<0||r.id>=ALIEN_COUNT||ALIEN_RANKS[r.id]!==r.rank)continue;
  const before={owned:[...career.owned],gems:career.gems,copies:[...career.cardCopies],pack:JSON.parse(JSON.stringify(career.packState)),receipts:[...career.adRewardReceipts]};
  if(pack){const results=r.cardIds.map(id=>{const required=cardRequirement(id),duplicate=ownsAlien(id)||cardsReady(id);if(!duplicate)career.cardCopies[id]=Math.min(required,collectedCards(id)+1);return {id,duplicate,cardCount:collectedCards(id),required};});career.gems+=results.filter(c=>c.duplicate).length;career.packState.serial++;career.packState.last={id:career.packState.serial,packId:pack.id,unseen:true,revealed:0,results};}
  else if(r.duplicate)career.gems+=5;else if(!ownsAlien(r.id))career.owned.push(r.id);
  career.adRewardReceipts.push(r.receipt);saveProfile();
  if(!storageOK){career.owned=before.owned;career.gems=before.gems;career.cardCopies=before.copies;career.packState=before.pack;career.adRewardReceipts=before.receipts;dailyAdMessage='Could not save. Your earned reward can be recovered when you reopen this page.';break;}
  careerToast('Reward saved!');careerRefresh();
 }}finally{dailyClaimBusy=false;}}
function claimDailyReward(key){const bridge=dailyAdsBridge();if(!bridge||isLocked())return false;if(key.startsWith('pack:')&&career.packState.last?.unseen){dailyAdMessage='Reveal your saved pack before claiming another pack.';renderDailyRewards();return false;}try{bridge.claimReward(key,JSON.stringify(career.owned));const s=dailyState();applyDailyReceipts(s);renderDailyRewards();if(key.startsWith('pack:')&&career.packState.last?.unseen)showScreen('packreveal');return true;}catch{dailyAdMessage='Could not claim. Try again.';renderDailyRewards();return false;}}
function watchDailyReward(key){const s=dailyState();if(!s||s.error||s.clockBlocked||isLocked())return;dailyAdMessage='Preparing optional ad…';$('dailyAdStatus').textContent=dailyAdMessage;dailyAdsBridge().watchReward(key,JSON.stringify(career.owned));}
function renderDailyRewards(){const state=dailyState();applyDailyReceipts(state);
 $('dailyAdStatus').textContent=dailyAdMessage||(!state?'Rewarded ads are available inside the Android app.':state.error?state.error:state.clockBlocked?'Correct the device date to continue.':state.testAds?'TEST ADS: no revenue is generated.':'Only ads that earn the SDK reward add progress. Early closure adds nothing.');
 $('resumeRewardPack').hidden=!career.packState.last?.unseen;
 const entries=[...CARD_PACKS.map(p=>({key:'pack:'+p.id,goal:PACK_AD_GOALS[p.id],pack:p})),...CARD_RANKS.map((rank,i)=>({key:'alien:'+i,goal:2*(i+1),rank,index:i}))];
 const lane=$('dailyAlienRewards'),scrollLeft=lane.scrollLeft;
 lane.replaceChildren(...entries.map(item=>{const card=document.createElement('article');card.className='daily-alien-reward'+(item.pack?' daily-pack-reward':'');card.dataset.reward=item.key;card.style.setProperty('--rank-color',item.pack?.color||item.rank.color);const title=document.createElement('h2');title.textContent=item.pack?item.pack.name:item.rank.symbol+' '+item.rank.name;card.appendChild(title);
  if(item.pack){const art=document.createElement('span');art.className='card-pack-art pack-front '+item.pack.id;art.setAttribute('aria-hidden','true');card.appendChild(art);}else{const offer=state?.offers?.[item.index],id=offer?.id;if(Number.isInteger(id)&&aliens[id]){const cv=document.createElement('canvas');cv.width=240;cv.height=260;card.appendChild(cv);classicReady.then(()=>drawClassicPortrait(cv.getContext('2d'),id,240,260)).catch(()=>{});const name=document.createElement('strong');name.textContent=aliens[id].name;card.appendChild(name);}}
  const offer=state?.offers?.[item.index],note=document.createElement('p');note.textContent=item.pack?'15 random cards · Matching copies unlock characters':offer?.duplicate||ownsAlien(offer?.id)?'Already owned: receive 5 diamonds.':'One full character unlock.';card.appendChild(note);
  if(item.pack){const odds=document.createElement('button');odds.className='reward-odds';odds.textContent='Reward odds ⓘ';odds.onclick=()=>renderPackOdds(item.pack.id);card.appendChild(odds);}
  const views=Math.min(item.goal,state?.progress?.[item.key]||0),claimed=dailyClaimed(state,item.key),ready=views>=item.goal,count=document.createElement('strong');count.className='reward-ad-count';count.textContent=claimed?'Claimed today':views+' / '+item.goal+' completed ads';card.appendChild(count);
  const meter=document.createElement('progress');meter.max=item.goal;meter.value=views;meter.setAttribute('aria-label',title.textContent+' ad progress');card.appendChild(meter);
  const b=document.createElement('button');b.className='watch-reward-ad';b.textContent=claimed?'Claimed':ready?'Claim reward':'Watch ad · +1';b.disabled=!state||!!state.error||state.clockBlocked||claimed||isLocked()||!career.owned.length||(!item.pack&&!offer);b.onclick=()=>ready?claimDailyReward(item.key):watchDailyReward(item.key);card.appendChild(b);return card;}));lane.scrollLeft=scrollLeft;}
$('resumeRewardPack').onclick=()=>showScreen('packreveal');
window.addEventListener('omni-ad-state',event=>{dailyAdMessage=typeof event.detail==='string'?event.detail:'';if(currentScreen==='dailyrewards')renderDailyRewards();});
const dailyShowBase=showScreen;showScreen=function(name,remember=true){dailyShowBase(name,remember);if(currentScreen==='dailyrewards')renderDailyRewards();};
