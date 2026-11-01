'use strict';
// Presentation only. Combat coordinates, character art and all reward ledgers stay native.
const premiumArenaImages=new Map(),premiumArenaPaths={hq:'assets/environments136/headquarters.webp',earth:'assets/environments136/earth-rooftop.webp',galactic:'assets/environments136/galactic-citadel.webp'};
const premiumArenaReady=Promise.all(Object.entries(premiumArenaPaths).map(([key,src])=>new Promise(resolve=>{
 const image=new Image();image.decoding='async';image.onload=()=>{
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,W,H);
  const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#04101a44');shade.addColorStop(.55,'#04101a08');shade.addColorStop(1,'#020b1840');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
  premiumArenaImages.set(key,cv);resolve(true);
 };image.onerror=()=>resolve(false);image.src=src;
})));
function premiumArenaKey(){
 if(training||selectedMode==='training')return'hq';
 if(selectedMode==='expedition'||selectedMode==='survival')return'galactic';
 if(selectedMode==='campaign')return typeof plumberTrack!=='undefined'&&['galactic','containment','rush'].includes(plumberTrack)?'galactic':'earth';
 return'earth';
}
const premiumBackgroundBase=background;
background=function(){const image=premiumArenaImages.get(premiumArenaKey());if(!image){premiumBackgroundBase();return;}c.drawImage(image,0,0,W,H);};
const premiumCopy=new Map([
 ['Prepare for battle','Battle setup'],['Select your alien','Aliens'],['Game modes','Battle'],['Choose your challenge','Battle'],
 ['CHANGE CHARACTER →','Change alien'],['CHANGE ALIEN →','Change alien'],['EQUIP POWERS →','Powers'],['UPGRADE ALIEN →','Upgrade'],['MATCH SETUP →','Battle setup'],['READY FOR BATTLE →','Ready'],
 ['CHOOSE OPPONENT →','Select →'],['START YOUR RUN →','Start →'],['ENTER THE LAB →','Train →'],['START BATTLE','Play'],
 ['BEST OF THREE','BEST OF 3'],['ENDLESS CHALLENGE','ENDLESS'],['Alien Card Packs','Packs'],['Your active alien','Active alien'],
 ['Choose an alien','Choose alien'],['Unlock aliens →','Unlock →'],['Swipe battles ↔','Swipe ↔']
]);
function premiumShortCopy(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
 while((n=walker.nextNode())){if(n.parentElement?.closest('input,textarea,script,style,[contenteditable]'))continue;const replacement=premiumCopy.get(n.nodeValue.trim());if(replacement)n.nodeValue=replacement;}
}
const lobbyRail=document.createElement('nav');lobbyRail.className='lobby-rail';lobbyRail.setAttribute('aria-label','Lobby shortcuts');
for(const [screen,icon,label] of [['missions','block','Missions'],['packs','aliens','Packs'],['characters','aliens','Aliens'],['upgrades','upgrade','Upgrade']]){
 const button=document.createElement('button');button.innerHTML=uiIcon(icon)+'<span>'+label+'</span><b aria-hidden="true">›</b>';button.onclick=()=>navigate(screen);lobbyRail.appendChild(button);
}
const lobbyHeading=document.createElement('div');lobbyHeading.className='lobby-heading';lobbyHeading.innerHTML='<span>PLUMBER HQ</span><strong>HERO TIME</strong><small id="lobbyHeroLevel"></small>';
const lobbyTag=document.createElement('span');lobbyTag.className='lobby-status';lobbyTag.textContent='OMNITRIX ONLINE';
document.querySelector('.home-team-board').append(lobbyRail,lobbyHeading,lobbyTag);
function premiumView(){document.body.dataset.view=currentScreen;const level=$('lobbyHeroLevel');if(level&&typeof heroStanding==='function'){const text='★ LEVEL '+heroStanding().level;if(level.textContent!==text)level.textContent=text;}premiumShortCopy($('screen-'+currentScreen)||$('screens'));}
const premiumShowBase=showScreen;showScreen=function(name,remember=true){premiumShowBase(name,remember);premiumView();};
let premiumCopyQueued=false;
new MutationObserver(()=>{if(premiumCopyQueued||document.body.classList.contains('in-battle'))return;premiumCopyQueued=true;requestAnimationFrame(()=>{premiumCopyQueued=false;premiumView();});}).observe($('screens'),{childList:true,subtree:true});
// Compact subtitles describe the mode; rules remain accessible inside each mode.
for(const [id,description] of Object.entries({versus:'3 rounds · Rival duel',survival:'One life · Endless rivals',training:'Practice · No limits',campaign:'Classic · Galactic · Bosses',expedition:'6 sectors · One journey'})){
 const card=document.querySelector('#screen-modes [data-mode="'+id+'"]');if(card?.querySelector('p'))card.querySelector('p').textContent=description;
}
premiumView();
