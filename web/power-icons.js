'use strict';
// Ability illustrations combine the alien's own action pose with its attack shape.
const POWER_ICON_PATHS={
 projectile:'<path d="M8 16h16M3 27h17M8 39h17"/><path d="m26 17 20-8 12 13-8 22-21-3-8-13Z"/><path d="m35 18 12 5-7 13-11-5Z"/>',
 beam:'<path d="M7 20v24l12-7h37V27H19Z"/><path d="m22 17 33 7M22 47l33-7M34 12l8 9M34 52l8-9"/>',
 wave:'<path d="M19 25q14 7 0 14M29 16q26 16 0 32M40 7q35 25 0 50"/>',
 melee:'<path d="m16 29 4-14 8-2 4 5 5-6 8 3 1 8 9 2 1 14-15 14-23-8-7-10Z"/><path d="m23 23 1 10m10-13v13m10-8-1 10M6 15l8 5M6 47l8-5M49 8l-3 9"/>',
 rush:'<path d="m34 9 22 23-22 23 5-17H17l8-13h14Z"/><path d="M6 15h17M2 32h12M6 49h17"/>',
 pounce:'<path d="M8 46Q20 3 49 24l8 1-8 13-1-9Q28 11 14 49Z"/><path d="m28 35 5 13m4-15 6 12m4-15 6 10"/>',
 leapslam:'<path d="m25 7 14 0v20h10L32 45 15 27h10Z"/><path d="m7 52 15-5 10 7 10-7 15 5M7 39l10 5M57 39l-10 5"/>',
 ground:'<path d="m24 12 16 0 8 18-14 10-17-10Z"/><path d="M7 49h15l6 7 9-12 7 5h13M9 35l10 7M55 35l-10 7"/>',
 spikes:'<path d="m5 54 9-27 10 27 10-45 10 45 9-32 7 32Z"/><path d="m14 28 3 22M34 10l3 40M53 23l2 27"/>',
 eruption:'<path d="m8 55 13-20 11 11 11-11 13 20Z"/><path d="M30 34 24 22l8-16 9 18-6 10M12 16l5 9m36-9-5 9M7 33l9 2m41-2-9 2"/>',
 trap:'<circle cx="33" cy="33" r="16"/><circle cx="33" cy="33" r="7"/><path d="M33 5v8M33 53v7M5 33h8m40 0h7M12 12l7 7m28 28 7 7M12 54l7-7m28-28 7-7"/>',
 lob:'<circle cx="43" cy="40" r="14"/><path d="M7 35Q16 2 39 18m-1-7 3 9-10-1M44 25l3-8 7-2m-1-7 3 4"/>',
 rain:'<path d="m14 9-7 13h7L8 35l16-18h-8l7-8m17-3-7 13h7l-6 13 16-18h-8l7-8M20 41l-6 13h7m19-19-8 20h9M5 59h53"/>',
 vortex:'<path d="M53 18Q31 0 13 19T19 50q22 13 34-8t-7-23Q28 6 19 27t18 18q15-10 2-19t-13 9"/>'
};
function powerSpec(id,key){const a=aliens[id];return key==='ultimate'?a.ultimate:key==='normal'?{name:'Basic strike',kind:'melee'}:a.skills[Number(key.slice(5))];}
function powerPicture(id,key){const a=aliens[id],s=powerSpec(id,key),frame=key==='ultimate'?'ultimate':key;return '<span class="power-picture" data-power-alien="'+id+'" data-power-action="'+frame+'" style="--power-color:'+a.light+';--power-dark:'+a.dark+'" aria-hidden="true"><svg viewBox="0 0 64 64" fill="'+a.color+'" stroke="'+a.light+'" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round">'+POWER_ICON_PATHS[s.kind]+'</svg><canvas width="120" height="160"></canvas>'+(key==='ultimate'?'<i class="ultimate-star">✦</i>':'')+'</span>';}
function paintPowerPictures(root=document){if(typeof drawHomePose!=='function')return;root.querySelectorAll('.power-picture:not([data-painted])').forEach(el=>{if(!el.getClientRects().length)return;el.dataset.painted='true';drawHomePose(el.querySelector('canvas'),Number(el.dataset.powerAlien),el.dataset.powerAction).catch(()=>{delete el.dataset.painted;});});}
let lastCombatPictures='';
function refreshBattlePictures(){if(!player)return;const id=player.id,keys=['normal','skill'+player.loadout[0],'skill'+player.loadout[1],'ultimate'],signature=id+':'+keys.join(',');if(signature!==lastCombatPictures){lastCombatPictures=signature;['normal','skill0','skill1','ultimate'].forEach((control,i)=>{const b=document.querySelector('.touch [data-key="'+control+'"]');b.innerHTML=powerPicture(id,keys[i]);b.dataset.powerAction=keys[i];b.title=powerSpec(id,keys[i]).name;b.setAttribute('aria-label',b.title);});}paintPowerPictures($('touch'));}
function refreshPowerSelection(){const hint=$('loadoutHint');if(hint.dataset.pictureAlien!==String(selected)||!hint.querySelector('.power-picture')){hint.dataset.pictureAlien=selected;hint.innerHTML=powerPicture(selected,'ultimate')+'<span>Ultimate<br><strong>'+aliens[selected].ultimate.name+'</strong></span>';}document.querySelectorAll('#powerCards .power-card').forEach((card,i)=>{const title=card.querySelector('h3');if(!title.querySelector('.power-picture'))title.innerHTML=powerPicture(selected,'skill'+i)+'<span class="power-title-name">'+aliens[selected].skills[i].name+'</span>';});paintPowerPictures($('screen-powers'));}
const pictureSetupBase=renderSetup;renderSetup=function(){pictureSetupBase();refreshPowerSelection();refreshBattlePictures();};
const pictureHudBase=hud;hud=function(){pictureHudBase();refreshBattlePictures();};
const pictureScreenBase=showScreen;showScreen=function(name,remember=true){pictureScreenBase(name,remember);document.body.classList.toggle('fitted-flow',['powers','setup'].includes(currentScreen));refreshPowerSelection();refreshBattlePictures();paintPowerPictures();};
for(const key of ['left','right','jump','dash','block']){const b=document.querySelector('.touch [data-key="'+key+'"]');b.innerHTML=uiIcon(key);b.title=combatLabels[key];}
window.addEventListener('resize',()=>paintPowerPictures());refreshPowerSelection();refreshBattlePictures();

$('powerCards').addEventListener('scroll',()=>paintPowerPictures($('powerCards')),{passive:true});
