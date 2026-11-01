'use strict';
// Presentation changes only: existing navigation, ownership and reward handlers stay attached.
const quietDialog=document.createElement('dialog');quietDialog.id='quietInfoDialog';quietDialog.setAttribute('aria-labelledby','quietInfoTitle');quietDialog.innerHTML='<header><h2 id="quietInfoTitle"></h2><button type="button" aria-label="Close information">×</button></header><div id="quietInfoBody"></div>';document.body.appendChild(quietDialog);quietDialog.querySelector('button').onclick=()=>quietDialog.close();
function quietInfo(title,lines){$('quietInfoTitle').textContent=title;$('quietInfoBody').replaceChildren(...[...new Set(lines.map(x=>String(x||'').replace(/\s+/g,' ').trim()).filter(Boolean))].map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));quietDialog.showModal();}
const quietPages={home:['Home','Tap an alien to change its pose or selection. Play opens battle modes. Use the bottom bar for Aliens, Packs and Missions.'],packs:['Packs','Choose coins or the video button. Pack ad goals are 1, 2 and 3. Each completed pack contains 15 cards.','Character offers show one alien per rarity. Finish the displayed ad count to claim it. Watching ads is optional. Early closure does not earn progress.','Reroll costs 1 diamond. Choosing an alien costs 5 diamonds. Both keep current category ad progress. An already-owned character rewards 5 diamonds.','Matching cards unlock aliens: Common 5, Rare 10, Epic 15, Heroic 20, Legendary 25. Pack odds are available from each pack’s ⓘ.','Daily offers and unfinished ad progress reset at 00:00 UTC (05:30 India).'],characters:['Aliens','Tap a character for powers, upgrades and battle selection. The colored symbol shows rarity; a lock means the alien is not unlocked.'],account:['Profile','Your level, wins, unlocked aliens and XP are shown here. Guest progress stays on this device. An account allows online backup.'],modes:['Battle','Select a mode to continue. Each card’s ⓘ explains its rules.'],powers:['Powers','Equip two different powers. Select either slot on the power card. The ultimate is always available in battle when its charge reaches 100%.'],settings:['Settings','Choose sound, graphics and screen-shake preferences. These settings do not change your saved progress.']};
const quietPageInfo=document.createElement('button');quietPageInfo.id='quietPageInfo';quietPageInfo.type='button';quietPageInfo.textContent='ⓘ';quietPageInfo.setAttribute('aria-label','Page information');quietPageInfo.title='Information';$('settingsNav').before(quietPageInfo);
quietPageInfo.onclick=()=>{const root=$('screen-'+currentScreen);const known=quietPages[currentScreen];let title=known?.[0]||uiLabels[currentScreen]||'Information',lines=known?.slice(1)||[];if(!known){lines=[...root.querySelectorAll('p,.boss-rush-banner,.rush-brief>div>strong,.rush-rules>div>strong,.mode-caption>span')].filter(n=>!n.closest('button,dialog')).map(n=>n.textContent);if(!lines.length)lines=['Select an option to continue.'];}quietInfo(title,lines);};
const quietBackBase=goBack;goBack=function(){if(quietDialog.open){quietDialog.close();return;}return quietBackBase();};const quietAndroidBack=window.androidBack;window.androidBack=function(){if(quietDialog.open){quietDialog.close();return;}return quietAndroidBack?.();};
document.querySelector('.lobby-rail')?.remove();
function quietText(node,text){if(node&&node.textContent!==text)node.textContent=text;}
function quietWrapLane(lane,selector,kind){if(!lane)return;for(const card of [...lane.querySelectorAll(':scope > '+selector)]){
 const title=card.querySelector('h2')?.textContent||'Battle',parts=[...card.querySelectorAll('p,.mode-caption>span,.mode-tag,.mode-reward')].map(n=>n.textContent);
 const key=card.dataset.mode||card.dataset.plumberTrack||'';
 const tile=document.createElement('article');tile.className=kind==='mode'?'quiet-mode-tile':'quiet-plumber-tile';tile.dataset.kind=key;card.before(tile);tile.appendChild(card);
 const info=document.createElement('button');info.type='button';info.className='quiet-card-info';info.textContent='ⓘ';info.setAttribute('aria-label','Details for '+title);info.title='Details';info.onclick=()=>{let extra=[];if(key==='rush')extra=[document.querySelector('.boss-rush-banner')?.textContent];if(key==='versus')extra=['Ranked matches use three-alien elimination. A knockout gives three seconds to choose a reserve; otherwise a remaining alien is selected automatically. The surviving fighter keeps their health.',...[...document.querySelectorAll('.friend-rules p')].map(n=>n.textContent)];if(key==='expedition')extra=[...document.querySelectorAll('#screen-expedition .expedition-intro p')].map(n=>n.textContent);if(key==='containment')extra=[...document.querySelectorAll('#screen-containment .rush-brief p')].map(n=>n.textContent);if(key==='survival')extra=['One life. Recover 20% health after each victory and carry ultimate charge forward. Earn 40 coins per rival. The run ends on defeat.'];if(key==='training')extra=['Try every alien and power. The target resets when knocked out. Training grants no battle rewards.'];if(['classic','galactic'].includes(key))extra=['Clear stages in order to unlock the next opponent. First clears award coins and Hero XP.'];quietInfo(title,[...parts,...extra]);};tile.appendChild(info);
 if(key==='expedition')quietText(card.querySelector('h2'),'Expedition');
}}
const quietPortraitObserved=new WeakSet();
const quietPortraitObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const cv=entry.target,id=Number(cv.closest('[data-alien]')?.dataset.alien);if(!Number.isInteger(id))continue;classicReady.then(()=>{if(!cv.isConnected)return;const img=classicPortraits[id];if(!img)return;cv.width=360;cv.height=400;const ctx=cv.getContext('2d'),s=Math.min((cv.width-16)/img.width,(cv.height-12)/img.height);ctx.clearRect(0,0,cv.width,cv.height);ctx.imageSmoothingQuality='high';ctx.drawImage(img,(cv.width-img.width*s)/2,cv.height-img.height*s,img.width*s,img.height*s);cv.dataset.quietFullBody='true';});quietPortraitObserver.unobserve(cv);}}, {root:$('roster'),rootMargin:'100px'});
function quietRoster(){for(const card of $('roster').children){const id=Number(card.dataset.alien),rank=cardRank(id),badge=card.querySelector('.card-rank'),status=card.querySelector('.ownership'),cv=card.querySelector('canvas');quietText(badge,rank.symbol);if(badge){badge.title=rank.name;badge.setAttribute('aria-label',rank.name);}quietText(status,testingMode()?'⌖':ownsAlien(id)?'✓':collectedCards(id)+'/'+cardRequirement(id));if(cv&&!quietPortraitObserved.has(cv)){quietPortraitObserved.add(cv);quietPortraitObserver.observe(cv);}}}
function quietPacks(){for(const b of document.querySelectorAll('#cardPackList .watch-reward-ad')){if(b.textContent.includes('Watch')){b.textContent='▶';b.setAttribute('aria-label','Watch ad for this reward');b.title='Watch ad';}}
 for(const count of document.querySelectorAll('.pack-card-count'))quietText(count,'▣ 15');
}
function quietProfile(){$('accountActions').classList.toggle('quiet-guest',accountState.mode!=='member');const avatar=document.querySelector('.account-avatar');if(avatar&&!avatar.querySelector('canvas')){const cv=document.createElement('canvas');cv.width=160;cv.height=180;cv.className='quiet-profile-alien';const portraitId=selected;cv.setAttribute('aria-label',aliens[portraitId].name);avatar.replaceChildren(cv);classicReady.then(()=>{if(cv.isConnected)drawClassicPortrait(cv.getContext('2d'),portraitId,160,180);});}
 if(typeof accountState!=='undefined'&&accountState.mode!=='member')quietText($('accountEmail'),'');if(typeof accountMessage!=='undefined'&&!accountMessage)quietText($('accountStatus'),'');
 const standing=heroStanding(),meter=$('profileXPMeter');quietText(meter?.querySelector('.xp-meter-head strong'),'Lv '+standing.level);quietText(meter?.querySelector('.xp-meter-head span'),'Lv '+(standing.level+1));quietText(meter?.querySelector('.xp-meter-foot strong'),Math.max(0,standing.needed-standing.xp).toLocaleString()+' XP');
}
function quietSetup(){const panel=document.querySelector('#screen-setup .setup-panel');if(!panel)return;let cv=panel.querySelector('.quiet-setup-portrait');if(!cv){cv=document.createElement('canvas');cv.className='quiet-setup-portrait';cv.width=320;cv.height=320;panel.prepend(cv);}if(cv.dataset.alien!==String(selected)){cv.dataset.alien=selected;classicReady.then(()=>{if(!cv.isConnected)return;const ctx=cv.getContext('2d');ctx.clearRect(0,0,320,320);drawClassicPortrait(ctx,selected,320,320);});}}
function quietPowers(){for(const card of document.querySelectorAll('#powerCards .power-card')){if(card.querySelector('.quiet-power-info'))continue;const detail=[...card.querySelectorAll('p')].map(n=>n.textContent),title=card.querySelector('h3')?.textContent||'Power',info=document.createElement('button');info.type='button';info.className='quiet-power-info';info.textContent='ⓘ';info.setAttribute('aria-label','Details for '+title);info.onclick=()=>quietInfo(title,detail);card.appendChild(info);}}
function quietRefresh(){
 quietWrapLane(document.querySelector('#screen-modes .mode-grid'),'.mode-card','mode');quietWrapLane($('plumberModes'),'.plumber-mode','plumber');
 for(const id of ['alienTitle','threatTitle'])$(id)?.classList.add('quiet-entity-title');
 if(currentScreen==='characters')quietRoster();if(currentScreen==='packs')quietPacks();if(currentScreen==='account')quietProfile();if(currentScreen==='setup')quietSetup();if(currentScreen==='powers')quietPowers();
 quietText($('rushRules'),'ⓘ');$('rushRules')?.setAttribute('aria-label','Boss Rush rules');
 for(const id of ['rushPlayer','containmentPlayer','expeditionAlien']){const el=$(id);if(el&&el.textContent.startsWith('Alien: '))quietText(el,el.textContent.slice(7));}
}
const quietShowBase=showScreen;showScreen=function(name,remember=true){quietShowBase(name,remember);quietRefresh();};
let quietQueued=false;new MutationObserver(()=>{if(quietQueued||document.body.classList.contains('in-battle'))return;quietQueued=true;requestAnimationFrame(()=>{quietQueued=false;quietRefresh();});}).observe($('screens'),{childList:true,subtree:true});
quietRefresh();
// Explicit profile sections keep the XP meter out of the metrics grid.
const quietProfile139=quietProfile;
quietProfile=function(){
 quietProfile139();
 const dashboard=document.querySelector('.account-dashboard'),meter=$('profileXPMeter');
 if(meter&&meter.parentElement!==dashboard)dashboard.insertBefore(meter,$('accountStatus'));
 const metrics=document.querySelector('.account-metrics');
 for(const [id,label] of [['accountMatches140','Battles'],['accountWinRate140','Win rate'],['accountCollection140','Collection']]){
  if(!$(id)){const tile=document.createElement('div');tile.innerHTML='<strong id="'+id+'"></strong><span>'+label+'</span>';metrics.appendChild(tile);}
 }
 quietText($('accountMatches140'),profile.matches.toLocaleString());
 quietText($('accountWinRate140'),(profile.matches?Math.round(profile.wins/profile.matches*100):0)+'%');
 quietText($('accountCollection140'),career.owned.length+' / '+aliens.length);
 quietText(meter?.querySelector('.xp-meter-head strong'),'HERO LEVEL '+heroStanding().level);
 quietText(meter?.querySelector('.xp-meter-head span'),'NEXT · LEVEL '+(heroStanding().level+1));
 quietText(meter?.querySelector('.xp-meter-foot strong'),Math.max(0,heroStanding().needed-heroStanding().xp).toLocaleString()+' XP remaining');
 const note=$('accountLocalNote');quietText(note,accountState.mode==='member'?'Your device progress stays saved when you log out. Use Sync Progress to back it up online.':'Guest progress is saved on this device. Create an account to back up your journey online.');
 if(!accountMessage)quietText($('accountStatus'),accountState.mode==='member'?'Account connected':'Playing as guest');
 let label=$('profileControls140');if(!label){label=document.createElement('h3');label.id='profileControls140';label.textContent='ACCOUNT';dashboard.insertBefore(label,$('accountActions'));}
};
document.title='Ben 10 Omniverse';
quietRefresh();
