'use strict';
// Gameplay affinities, not a claim about official cartoon power rankings.
const POWER_TYPES141={fire:['Fire','♨','#ff9b55'],water:['Water','💧','#78d6ff'],electric:['Electric','ϟ','#ffe178'],ice:['Ice','❄','#b5f5ff'],plant:['Plant','❧','#9ae88d'],earth:['Earth','⬟','#e9bc86'],physical:['Physical','✊','#f2a9a0'],wind:['Wind','≋','#b4eee4'],sonic:['Sonic','◉','#c8b4ff'],tech:['Tech','⚙','#91d9dc'],cosmic:['Cosmic','✦','#dbb1ff'],spirit:['Spirit','◈','#d4d5fc'],toxin:['Toxin','☣','#c1e97f']};
const TYPE_FROM_ART141={fire:'fire',water:'water',electric:'electric',frost:'ice',vine:'plant',crystal:'earth',slam:'physical',dash:'wind',pounce:'physical',bite:'physical',claw:'physical',shell:'earth',sonic:'sonic',pulse:'tech',beam:'tech',phase:'spirit',cosmic:'cosmic',gravity:'cosmic',time:'cosmic',web:'plant',bandage:'physical',digest:'toxin',slime:'toxin',clone:'physical',eye:'cosmic'};
const ALIEN_TYPES141={8:'water',13:'spirit',22:'fire',30:'toxin',33:'electric',35:'water',42:'earth',44:'tech',53:'spirit',54:'water',59:'water',61:'physical',62:'water',66:'tech',70:'fire',78:'tech',80:'tech',82:'tech'};
const VILLAIN_TYPES141={12:'tech',13:'tech',15:'tech',16:'tech',23:'ice',27:'cosmic',30:'toxin',34:'tech',35:'tech',36:'earth',41:'tech',46:'tech',47:'cosmic',48:'cosmic',49:'tech'};
const TYPE_ADVANTAGES141={fire:['plant','ice'],water:['fire','earth'],electric:['water','tech'],ice:['plant','wind'],plant:['water','earth'],earth:['electric'],physical:['earth','tech'],wind:['toxin'],sonic:['earth'],tech:['sonic','spirit'],cosmic:['spirit'],spirit:['physical'],toxin:['plant']};
function alienType141(id){return ALIEN_TYPES141[id]||TYPE_FROM_ART141[aliens[id]?.type]||'physical';}
function villainType141(id){return VILLAIN_TYPES141[id]||TYPE_FROM_ART141[VILLAIN_DATA.characters[id]?.type]||'physical';}
function fighterType141(f){return Number.isInteger(f?.villain)?villainType141(f.villain):alienType141(f?.id);}
function typeMultiplier141(attack,defence){if(TYPE_ADVANTAGES141[attack]?.includes(defence))return 1.35;if(TYPE_ADVANTAGES141[defence]?.includes(attack))return .8;return 1;}
function attackType141(f,cfg,key){
 const text=(cfg?.name||'').toLowerCase();
 if(/fire|flame|inferno|magma|heat|eruption/.test(text)&&!/root|vine/.test(text))return 'fire';
 if(/water|hydro|aqua|tidal|torrent/.test(text))return 'water';
 if(/electric|lightning|voltaic|voltage|thunder|static|shock/.test(text))return 'electric';
 if(/ice|frost|glacial|freeze|blizzard|arctic/.test(text))return 'ice';
 if(/vine|root|thorn|seed|spore/.test(text))return 'plant';
 if(/sonic|echo|resonance|howl/.test(text))return 'sonic';
 if(/toxin|acid|poison|gas|slime|spit/.test(text))return 'toxin';
 if(key==='normal'&&['melee','rush','leap','leapslam','slam'].includes(cfg?.kind))return 'physical';
 return fighterType141(f);
}
const affinityDamageBase141=damageValue;
damageValue=function(f,cfg,key){const amount=affinityDamageBase141(f,cfg,key),target=other(f);return target&&!online.active?amount*typeMultiplier141(attackType141(f,cfg,key),fighterType141(target)):amount;};
function typeBadge141(type,label=false){const [name,symbol,color]=POWER_TYPES141[type];return '<span class="power-type141" style="--type-color:'+color+'" title="'+name+' type" aria-label="'+name+' type"><i aria-hidden="true">'+symbol+'</i>'+(label?'<b>'+name+'</b>':'')+'</span>';}
function decorateType141(node,type,label=false){if(!node)return;let badge=node.querySelector(':scope > .power-type141');if(badge?.dataset.type===type&&badge.dataset.label===String(label))return;if(badge)badge.remove();const temp=document.createElement('template');temp.innerHTML=typeBadge141(type,label);badge=temp.content.firstChild;badge.dataset.type=type;badge.dataset.label=String(label);node.appendChild(badge);}
function typeGuide141(){quietInfo('Power types',['Strong matchup: +35% damage. Resistance: −20%. Other matchups: normal damage. The rule applies to both fighters.','A normal punch is Physical. Named elemental attacks use their own type; other powers use the alien’s card type. Health comes from rarity and upgrades, not from type.','Levels 1–5 keep existing stats. Each level from 6–10 adds 15% base health or 12% base attack damage. Maximum: +90% health and +80% damage.','Type advantages apply in solo battles and Testing. Online fights retain equal upgrades and the current server rules.','Campaign stages no longer slow your cooldowns. Enemy health and attack progression remain intact.',...Object.entries(TYPE_ADVANTAGES141).map(([type,targets])=>POWER_TYPES141[type][0]+' beats '+targets.map(t=>POWER_TYPES141[t][0]).join(', ')+'.')]);}
function renderTypes141(){
 for(const card of document.querySelectorAll('#roster [data-alien],#garageCards [data-alien],.squad-alien-card[data-alien]'))decorateType141(card,alienType141(Number(card.dataset.alien)));
 for(const card of document.querySelectorAll('.threat-card[data-stage]'))decorateType141(card,villainType141(Number(card.dataset.stage)),true);
 for(const card of document.querySelectorAll('#cardPackList [data-alien],.daily-alien-reward[data-alien]'))decorateType141(card,alienType141(Number(card.dataset.alien)),true);
 const brief=document.querySelector('#screen-threat .threat-brief');
 if(brief){let panel=$('typePreview141');if(!panel){panel=document.createElement('section');panel.id='typePreview141';brief.insertBefore(panel,$('threatPlayer'));}const enemyType=villainType141(threatStage),yourType=alienType141(selected),v=VILLAIN_DATA.characters[threatStage],key=selected+':'+threatStage;if(panel.dataset.key!==key){panel.dataset.key=key;panel.innerHTML='<div><span>ENEMY</span>'+typeBadge141(enemyType,true)+'</div><div><span>YOU</span>'+typeBadge141(yourType,true)+'</div><button type="button" aria-label="Type matchup guide">ⓘ</button>';panel.querySelector('button').onclick=typeGuide141;panel.title=v.name+' · '+POWER_TYPES141[enemyType][0];}}
 const art=document.querySelector('#screen-alieninfo .alien-art');if(art)decorateType141(art,alienType141(selected),true);
 for(const card of document.querySelectorAll('#powerCards .power-card')){const index=[...card.parentElement.children].indexOf(card);if(aliens[selected].skills[index])decorateType141(card,attackType141({id:selected},aliens[selected].skills[index],'skill'+index),true);}
 for(const [id,f] of [['pName',player],['eName',enemy]])if(f)decorateType141($(id),fighterType141(f),false);
}
const typeResultCardBase141=resultCard;resultCard=function(result,n){const card=typeResultCardBase141(result,n);decorateType141(card,alienType141(result.id),true);return card;};
const typeShowBase141=showScreen;showScreen=function(...args){const result=typeShowBase141(...args);renderTypes141();return result;};
const typeSetupBase141=renderSetup;renderSetup=function(...args){const result=typeSetupBase141(...args);renderTypes141();return result;};
const typeHUDBase141=hud;hud=function(...args){const result=typeHUDBase141(...args);for(const [id,f] of [['pName',player],['eName',enemy]])if(f)decorateType141($(id),fighterType141(f));return result;};
let typeFrame141=false;new MutationObserver(()=>{if(typeFrame141||document.body.classList.contains('in-battle'))return;typeFrame141=true;requestAnimationFrame(()=>{typeFrame141=false;renderTypes141();});}).observe($('screens'),{childList:true,subtree:true});
const typeGuideButton141=document.createElement('button');typeGuideButton141.id='typeGuide141';typeGuideButton141.type='button';typeGuideButton141.textContent='ϟ';typeGuideButton141.title='Power types';typeGuideButton141.setAttribute('aria-label','Power type guide');typeGuideButton141.onclick=typeGuide141;$('characterContent').prepend(typeGuideButton141);
renderTypes141();
