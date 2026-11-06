'use strict';
// Keep the existing character artwork, ownership, reward and upgrade handlers.
function compactUpgrades146(){
 for(const card of $('upgrades').children){
  const key=card.querySelector('[data-upgrade]')?.dataset.upgrade;
  if(!key)continue;
  const heading=card.querySelector('h3');
  if(heading&&!card.querySelector('.upgrade-art146')){
   const art=document.createElement('div');art.className='upgrade-art146';
   art.innerHTML=key==='health'?uiIcon('block'):key==='normal'?uiIcon('normal'):powerPicture(selected,key);
   heading.before(art);
  }
 }
 paintPowerPictures($('upgrades'));
}
upgradeDeck.options.fitted=true;upgradeDeck.capacity=null;refreshDeck(upgradeDeck);
const simpleRender146=renderSetup;
renderSetup=function(){simpleRender146();compactUpgrades146();};
const simplePictures146=refreshBattlePictures;
refreshBattlePictures=function(){simplePictures146();const b=document.querySelector('.touch [data-key="normal"]');if(b&&b.innerHTML!==uiIcon('normal')){b.innerHTML=uiIcon('normal');b.setAttribute('aria-label','Basic attack');}};
const guides146={
 home:['Ready, hero?','Tap Play to choose a battle.','Tap Aliens to choose your hero.'],
 characters:['Choose an alien','Swipe to see more heroes. Tap a card.','A lock means you need more cards to unlock that hero.'],
 alieninfo:['Meet your hero','Select takes this hero into battle.','Tap Upgrade to make this hero stronger.'],
 upgrades:['Make powers stronger','Tap an Upgrade button when you have enough coins.','Each picture shows the power you are improving.'],
 powers:['Choose two powers','Tap Power 1 or Power 2 below a picture.','Choose two different powers. Your ultimate stays equipped.'],
 modes:['Pick a game','Testing lets you practise.','Choose a battle card to play. Tap its info icon for help.'],
 setup:['Get ready','Choose your rival and difficulty.','Tap Start Battle when you are ready.'],
 battle:['Let’s fight!','Hold the arrows to move. Tap the hand to attack.','Tap a power to switch attacks. Fireballs keep flying.','You can move during your ultimate. Use Guard to block.'],
 results:['Battle finished','Your coins and XP are shown here.','Tap Play Again for another battle, or Home to leave.'],
 packs:['Collect heroes','Pick a pack to see its price.','Coins or optional completed videos earn cards. Ask a grown-up if you need help.'],
 missions:['Your missions','Choose a mission. Finish its goal.','Tap Claim when your reward is ready.'],
 settings:['Your settings','Change sound and screen effects here.','Use Back to return to your game.'],
 account:['Your progress','Your level and wins are shown here.','Ask a grown-up before making an account.']
};
const guide146=document.createElement('dialog');guide146.id='firstGuide146';guide146.setAttribute('aria-labelledby','guideTitle146');guide146.innerHTML='<h2 id="guideTitle146"></h2><p id="guideStep146"></p><div><button id="guideSkip146">Skip</button><button id="guideNext146" class="primary">Next</button></div>';
document.body.appendChild(guide146);
let guideLines146=[],guideStep146=1,guideKey146='',guidePaused146=false;
function drawGuide146(){$('guideTitle146').textContent=guideLines146[0];$('guideStep146').textContent=guideLines146[guideStep146];$('guideNext146').textContent=guideStep146===guideLines146.length-1?'Got it!':'Next';}
function finishGuide146(){try{localStorage.setItem('ben10-guide146-'+guideKey146,'seen');}catch{}guide146.close();if(guidePaused146&&mode==='paused'){mode='fight';resetInputs();}guidePaused146=false;}
$('guideSkip146').onclick=finishGuide146;$('guideNext146').onclick=()=>{if(++guideStep146>=guideLines146.length)finishGuide146();else drawGuide146();};guide146.addEventListener('cancel',e=>{e.preventDefault();finishGuide146();});
function firstGuide146(key,force=false){
 if(guide146.open||$('entryGuest')?.offsetParent||document.body.classList.contains('app-loading'))return;
 const id=key==='alieninfo'&&alienUpgradeOpen?'upgrades':key;
 try{if(!force&&localStorage.getItem('ben10-guide146-'+id))return;}catch{}
 if(document.querySelector('dialog[open]'))return;
 guideKey146=id;guideLines146=guides146[id]||['Try it out','Tap an option to choose it.','Use Back to return. Tap the info icon for more help.'];guideStep146=1;guidePaused146=key==='battle'&&mode==='fight';if(guidePaused146){mode='paused';resetInputs();}drawGuide146();guide146.showModal();
}
const simpleScreen146=showScreen;showScreen=function(name,remember=true){const result=simpleScreen146(name,remember);compactUpgrades146();requestAnimationFrame(()=>{if(currentScreen===name)firstGuide146(currentScreen);});return result;};
const simpleAlienInfo146=renderAlienInfo;renderAlienInfo=function(){simpleAlienInfo146();compactUpgrades146();if(alienUpgradeOpen)requestAnimationFrame(()=>firstGuide146('alieninfo'));};
const simplePause146=pause;pause=function(){if(guide146.open)return;return simplePause146();};
const simpleBack146=window.androidBack;window.androidBack=function(){if(guide146.open){finishGuide146();return;}return simpleBack146?.();};
const help146=document.createElement('button');help146.textContent='Replay guide';help146.onclick=()=>firstGuide146(currentScreen,true);$('screen-settings').appendChild(help146);
compactUpgrades146();refreshBattlePictures();
requestAnimationFrame(()=>{if(!document.body.classList.contains('app-loading'))firstGuide146(currentScreen);});
// Battle may begin after its screen has already been selected during async loading.
setInterval(()=>{if(currentScreen==='battle'){if(mode==='fight')firstGuide146('battle');}else if(!document.querySelector('#matchOutcome:not([hidden])'))firstGuide146(currentScreen);},700);
// Results keeps its primary retry action; Upgrade goes directly to this hero.
const resultUpgrade146=document.querySelector('#screen-results [data-screen="upgrades"]');
resultUpgrade146?.addEventListener('click',e=>{e.stopPropagation();openAlienUpgrades(selected);});
