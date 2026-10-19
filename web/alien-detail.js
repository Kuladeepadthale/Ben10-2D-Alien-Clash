'use strict';
// Collection and upgrades share one fitted alien page; ownership stays in progression.js.
const alienPage=addCareerScreen('alieninfo',`<div class="alien-heading"><button id="alienList">← All aliens</button><h1 id="alienTitle"></h1><span id="alienSpecies"></span></div><div class="alien-overview"><div class="alien-art"><canvas id="alienPortrait" width="300" height="400" aria-label="Selected alien"></canvas></div><div class="alien-facts"><p id="alienStory"></p><h2>Ability powers</h2><div id="alienAbilities"></div></div></div><div id="alienUpgradePanel" hidden></div><div class="alien-actions"><button id="alienUse" class="primary">Select for battle</button><button id="alienUnlock">Unlock</button><button id="alienUpgrade">Upgrade</button><button id="alienPowers">Equip powers</button></div>`);
uiLabels.alieninfo='Alien details';
const upgradeDeck=decks.find(d=>d.container===$('upgrades'));
$('alienUpgradePanel').appendChild(upgradeDeck.wrap);
upgradeDeck.options.portrait=2;upgradeDeck.options.landscape=3;upgradeDeck.options.short=3;
let alienUpgradeOpen=false,alienPortraitToken=0;
function renderAlienInfo(){
 const a=aliens[selected],owned=ownsAlien(selected),test=testingMode();
 $('alienTitle').textContent=a.name;$('alienSpecies').textContent=cardRank(selected).symbol+' '+cardRank(selected).name+' · '+a.species;
 $('alienStory').textContent=a.desc;
 $('alienAbilities').replaceChildren(...[...a.skills,a.ultimate].map((s,i)=>{
  const row=document.createElement('div'),name=document.createElement('strong'),info=document.createElement('span');
  name.textContent=s.name;info.textContent=i===3?'Ultimate · charged in combat':Math.round(s.damage)+' damage · '+s.cooldown+'s cooldown';
  row.append(name,info);return row;
 }));
 $('alienUse').textContent=test?'Test alien':'Select for battle';$('alienUse').disabled=isLocked()||(!owned&&!test);
 $('alienUnlock').hidden=owned||test;$('alienUnlock').textContent='Unlock · '+ALIEN_PRICES[selected].toLocaleString()+' points';
 $('alienUnlock').disabled=isLocked()||!career.owned.length||profile.credits<ALIEN_PRICES[selected];
 $('alienUpgrade').disabled=isLocked()||!owned;$('alienUpgrade').textContent=alienUpgradeOpen?'Story & powers':'Upgrade';
 $('alienPowers').hidden=alienUpgradeOpen;$('alienPowers').disabled=isLocked()||(!owned&&!test);
 alienPage.querySelector('.alien-overview').hidden=alienUpgradeOpen;$('alienUpgradePanel').hidden=!alienUpgradeOpen;
 alienPage.classList.toggle('showing-upgrades',alienUpgradeOpen);
 if(alienUpgradeOpen)refreshDeck(upgradeDeck);
 const id=selected,token=++alienPortraitToken,cv=$('alienPortrait');
 cv.setAttribute('aria-label',a.name);cv.getContext('2d').clearRect(0,0,300,400);
 classicReady.then(()=>{if(token===alienPortraitToken)drawClassicPortrait(cv.getContext('2d'),id,300,400)}).catch(()=>{});
}
const detailSelectBase=select;select=function(id){detailSelectBase(id);if(currentScreen==='characters')showScreen('alieninfo');if(currentScreen==='alieninfo')renderAlienInfo();};
const detailRenderBase=renderSetup;renderSetup=function(){detailRenderBase();if(currentScreen==='alieninfo')renderAlienInfo();};
const detailScreenBase=showScreen;showScreen=function(name,remember=true){
 if(['garage','upgrades'].includes(name))name='characters';
 if(name==='alieninfo'&&currentScreen!=='alieninfo')alienUpgradeOpen=false;
 detailScreenBase(name,remember);
 if(currentScreen==='alieninfo')renderAlienInfo();
 const nav=document.querySelector('.app-bottom [data-screen="characters"]');
 nav.classList.toggle('selected',['characters','alieninfo','powers'].includes(currentScreen));
 nav.setAttribute('aria-current',['characters','alieninfo','powers'].includes(currentScreen)?'page':'false');
};
openAlienUpgrades=function(id){if(!ownsAlien(id)){careerToast('Unlock this alien first.');return}select(id);showScreen('alieninfo');alienUpgradeOpen=true;renderAlienInfo();};
$('alienList').onclick=()=>showScreen('characters');
$('alienUse').onclick=()=>showScreen('setup');$('alienUnlock').onclick=()=>{buyAlien(selected);renderAlienInfo()};
$('alienUpgrade').onclick=()=>{if(!ownsAlien(selected))return;alienUpgradeOpen=!alienUpgradeOpen;renderAlienInfo()};
$('alienPowers').onclick=()=>showScreen('powers');
// Collection cards are the entry to details. Remove duplicated details/actions and upgrade navigation.
infoDeck.wrap.hidden=true;tabbar.hidden=true;
$('screen-characters').querySelector('.page-actions').hidden=true;
$('screen-characters').querySelector('.page-title p:last-child').textContent='Tap an alien to view its story, powers and upgrades.';
document.querySelector('.app-bottom [data-screen="upgrades"]').hidden=true;
document.querySelector('.home-shortcuts').hidden=true;
document.querySelector('.home-bottom').hidden=true;
document.querySelector('.home-copy > p:not(.eyebrow)').textContent='Choose your alien. Enter the arena.';
document.querySelector('.home-copy .eyebrow').hidden=true;
// Keep every card mounted for native vertical touch scrolling.
rosterDeck.options.scroll=true;
rosterDeck.capacity=null;refreshMenus();
