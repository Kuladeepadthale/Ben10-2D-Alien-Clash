'use strict';
// Native SDK reward callbacks own counters. Web code only claims saved receipts.
career.adRewardReceipts=Array.isArray(storedCareer?.adRewardReceipts)?storedCareer.adRewardReceipts.filter(x=>typeof x==='string').slice(-2000):[];
const dailyAdsBridge=()=>window.AlienRewardAds;
const PACK_AD_GOALS={omni:1,power:2,master:3};
let dailyAdMessage='',dailyClaimBusy=false;
// All coin packs, ad packs and character offers share the existing Packs lane.
career.adOfferPurchase=storedCareer?.adOfferPurchase||null;
const adStatus=document.createElement('p');adStatus.id='dailyAdStatus';adStatus.setAttribute('role','status');$('shopBalances').after(adStatus);
const resumeReward=document.createElement('button');resumeReward.id='resumeRewardPack';resumeReward.hidden=true;resumeReward.textContent='View cards →';$('resumePack').after(resumeReward);
const rewardNote=document.createElement('p');rewardNote.id='dailyResetNote';rewardNote.textContent='↻ Daily reset · 05:30 IST · Ads optional';$('cardPackList').after(rewardNote);
const offerDialog=document.createElement('dialog');offerDialog.id='alienOfferDialog';offerDialog.innerHTML='<h2 id="offerDialogTitle"></h2><p id="offerDialogNote"></p><div id="offerChoiceList"></div><div class="offer-dialog-actions"><button id="offerCancel">Cancel</button><button id="offerConfirm">Confirm</button></div>';document.body.appendChild(offerDialog);
let offerChoice=null;
function finishOfferPurchase(){const tx=career.adOfferPurchase,bridge=dailyAdsBridge();if(!tx||!bridge?.changeOffer)return;
 let result;try{result=JSON.parse(bridge.changeOffer(tx.id,tx.day,tx.rank,tx.chosen,JSON.stringify(career.owned)));}catch{return;}
 const beforeGems=career.gems;if(!result.ok)career.gems+=tx.cost;career.adOfferPurchase=null;saveProfile();
 if(!storageOK){career.gems=beforeGems;career.adOfferPurchase=tx;dailyAdMessage='Could not save offer transaction. It will recover when you reopen Packs.';return;}
 dailyAdMessage=result.ok?'✓ Choice saved':result.error||'Offer unavailable. Diamonds refunded.';
}
function buyOfferChange(rank,chosen){const state=dailyState(),cost=chosen===-1?1:5;if(!state||state.error||state.clockBlocked||dailyClaimed(state,'alien:'+rank)||isLocked()||career.adOfferPurchase||career.gems<cost||!dailyAdsBridge()?.changeOffer)return false;
 if(chosen!==-1&&(!Number.isInteger(chosen)||ALIEN_RANKS[chosen]!==rank||chosen===state.offers?.[rank]?.id))return false;
 const tx={id:crypto.randomUUID(),day:state.day,rank,chosen,cost};career.gems-=cost;career.adOfferPurchase=tx;saveProfile();
 if(!storageOK){career.gems+=cost;career.adOfferPurchase=null;dailyAdMessage='Could not save. No diamonds spent.';return false;}
 finishOfferPurchase();renderCardShop();return true;
}
function openOfferChange(rank,choose){const state=dailyState();if(!state||dailyClaimed(state,'alien:'+rank))return;const current=state.offers?.[rank]?.id;offerChoice={rank,chosen:choose?null:-1};
 $('offerDialogTitle').textContent=choose?'Choose · '+CARD_RANKS[rank].name:'Reroll · '+CARD_RANKS[rank].name;
 $('offerDialogNote').textContent='▶ '+(2*(rank+1))+' ads to claim · Progress kept';
 $('offerChoiceList').replaceChildren();$('offerConfirm').innerHTML=(choose?'✓ ':'↻ ')+currencyIcon('gem')+(choose?'5':'1');$('offerConfirm').setAttribute('aria-label',choose?'Choose character for 5 diamonds':'Reroll for 1 diamond');$('offerConfirm').disabled=choose||career.gems<(choose?5:1);
 if(choose)for(let id=0;id<ALIEN_COUNT;id++){if(ALIEN_RANKS[id]!==rank)continue;const b=document.createElement('button');b.dataset.alien=id;b.disabled=id===current;b.className='offer-choice';const cv=document.createElement('canvas');cv.width=180;cv.height=180;const label=document.createElement('span');label.textContent=aliens[id].name+(id===current?' · ✓':'');if(ownsAlien(id)&&id!==current){const extra=document.createElement('span');extra.className='choice-extra';extra.innerHTML=' '+currencyIcon('gem')+'5';label.appendChild(extra);}b.append(cv,label);classicReady.then(()=>drawClassicPortrait(cv.getContext('2d'),id,180,180)).catch(()=>{});b.onclick=()=>{offerChoice.chosen=id;for(const x of $('offerChoiceList').children)x.setAttribute('aria-pressed',String(x===b));$('offerConfirm').disabled=career.gems<5;};$('offerChoiceList').appendChild(b);}
 offerDialog.showModal();
}
$('offerCancel').onclick=()=>offerDialog.close();$('offerConfirm').onclick=()=>{if(!offerChoice)return;const {rank,chosen}=offerChoice;if(chosen===null)return;offerDialog.close();buyOfferChange(rank,chosen);};
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
function renderDailyRewards(){finishOfferPurchase();const state=dailyState();applyDailyReceipts(state);
 $('dailyAdStatus').textContent=dailyAdMessage||(!state?'':state.error?state.error:state.clockBlocked?'Check device date':'');
 $('resumeRewardPack').hidden=!career.packState.last?.unseen;
 const entries=[...CARD_PACKS.map(p=>({key:'pack:'+p.id,goal:PACK_AD_GOALS[p.id],pack:p})),...CARD_RANKS.map((rank,i)=>({key:'alien:'+i,goal:2*(i+1),rank,index:i}))];
 const lane=$('cardPackList'),scrollLeft=lane.scrollLeft;
 lane.querySelectorAll('.daily-alien-reward,.pack-ad-controls').forEach(card=>card.remove());
 lane.append(...entries.map(item=>{const card=document.createElement('article');card.className='daily-alien-reward'+(item.pack?' daily-pack-reward':'');card.dataset.reward=item.key;card.style.setProperty('--rank-color',item.pack?.color||item.rank.color);const title=document.createElement('h2');title.textContent=item.pack?item.pack.name:item.rank.symbol+' '+item.rank.name;if(!item.pack)card.appendChild(title);
  if(!item.pack){const offer=state?.offers?.[item.index],id=offer?.id;if(Number.isInteger(id)&&aliens[id]){const cv=document.createElement('canvas');cv.width=240;cv.height=260;card.appendChild(cv);classicReady.then(()=>drawClassicPortrait(cv.getContext('2d'),id,240,260)).catch(()=>{});const name=document.createElement('strong');name.textContent=aliens[id].name;card.appendChild(name);}}
  const offer=state?.offers?.[item.index],note=document.createElement('p');if(!item.pack&&(offer?.duplicate||ownsAlien(offer?.id))){note.className='quiet-gem-reward';note.innerHTML='↪ '+currencyIcon('gem')+'5';note.setAttribute('aria-label','Already owned: reward 5 diamonds');}else note.textContent='';card.appendChild(note);
  
  const views=Math.min(item.goal,state?.progress?.[item.key]||0),claimed=dailyClaimed(state,item.key),ready=views>=item.goal,count=document.createElement('strong');count.className='reward-ad-count';count.textContent=claimed?'✓ Claimed':'▶ '+views+'/'+item.goal;card.appendChild(count);
  const meter=document.createElement('progress');meter.max=item.goal;meter.value=views;meter.setAttribute('aria-label',title.textContent+' ad progress');card.appendChild(meter);
  const b=document.createElement('button');b.className='watch-reward-ad';b.textContent=claimed?'✓':ready?'✓ Claim':'▶ Watch ad';b.disabled=!state||!!state.error||state.clockBlocked||claimed||isLocked()||!career.owned.length||(!item.pack&&!offer);b.onclick=()=>ready?claimDailyReward(item.key):watchDailyReward(item.key);card.appendChild(b);
  if(!item.pack){const actions=document.createElement('div');actions.className='offer-change-actions';for(const [choose,label,cost] of [[false,'↻ ◆1',1],[true,'✓ ◆5',5]]){const change=document.createElement('button');change.className=choose?'choose-offer':'reroll-offer';change.innerHTML=(choose?'⌖ ':'↻ ')+currencyIcon('gem')+cost;change.setAttribute('aria-label',choose?'Choose character for 5 gems':'Random reroll for 1 gem');change.title=choose?'Choose character · 5 gems':'Reroll · 1 gem';change.disabled=b.disabled||ready&&claimed||career.gems<cost||!dailyAdsBridge()?.changeOffer||!!career.adOfferPurchase;change.onclick=()=>openOfferChange(item.index,choose);actions.appendChild(change);}card.appendChild(actions);}
  if(item.pack){const target=lane.querySelector('[data-pack-card="'+item.pack.id+'"]');if(target){card.className='pack-ad-controls';target.appendChild(card);}return null;}return card;}).filter(Boolean));lane.scrollLeft=scrollLeft;}
$('resumeRewardPack').onclick=()=>showScreen('packreveal');
window.addEventListener('omni-ad-state',event=>{dailyAdMessage=typeof event.detail==='string'?event.detail:'';if(currentScreen==='packs')renderCardShop();});
const dailyShopBase=renderCardShop;renderCardShop=function(){const lane=$('cardPackList'),left=lane.scrollLeft;dailyShopBase();renderDailyRewards();lane.scrollLeft=left;};
const dailyShowBase=showScreen;showScreen=function(name,remember=true){const target=name==='dailyrewards'?'packs':name,entering=target==='packs'&&currentScreen!=='packs';dailyShowBase(target,remember);if(entering)$('cardPackList').scrollLeft=0;};



