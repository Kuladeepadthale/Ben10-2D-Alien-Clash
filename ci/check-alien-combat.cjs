// Exercise actual casts and collision resolution; values must reduce enemy HP.
const fs=require('fs'),vm=require('vm');
let source=fs.readFileSync('ci/check-threat-ladder.cjs','utf8');source=source.slice(0,source.indexOf('(async()=>'));
source+=`(async()=>{const {run,b,w}=await boot();run('chooseStarter(career.offers[0]);drawnAlienEmitter=undefined');
 const data=fs.readFileSync('web/cel-data.js','utf8');run(data);const native=run('CEL_DATA.characters.length===32');if(native){const playerSource=fs.readFileSync('web/cel-player.js','utf8');run(playerSource.slice(playerSource.indexOf('function drawnAlienEmitter('),playerSource.indexOf('const celOriginalBegin')));}
 const failures=[];let checked=0;
 for(const fps of [30,60])for(let id=0;id<32;id++)for(const target of [0,5,22])for(const action of ['normal','skill0','skill1','skill2','ultimate']){
 b.testId=id;b.targetId=target;b.testAction=action;b.testFps=fps;
 run("selectedMode='versus';mode='fight';time=0;player=make(testId,460,1,true);enemy=make(targetId,580,-1);player.ult=100;player.loadout=testAction==='skill2'?[2,1]:[0,1];shots=[];effects=[];particles=[];floating=[];cast(player,testAction==='skill2'?'skill0':testAction)");
 assert(run('!!player.cast'));const budget=run('player.cast.budget.remaining');run('for(let frame=0;frame<testFps*5;frame++){time+=1/testFps;updateF(player,1/testFps);updateF(enemy,1/testFps);updateEffects(1/testFps)}');const damage=run('enemy.maxHp-enemy.hp');if(!(damage>0&&damage<=budget+1e-5))failures.push({id,name:run('aliens[testId].name'),target,action,fps,damage,budget});checked++;
 }
 assert.deepEqual(failures,[]);run("mode='menu';career.owned=[28,0];showScreen('characters');careerRefresh()");assert.deepEqual(Array.from(run("Array.from($('roster').children).slice(0,2).map(c=>Number(c.dataset.alien)).sort((a,b)=>a-b)")),[0,28]);run("select(28);$('alienUse').click()");assert.equal(run('currentScreen'),'modes');assert.equal(run('mode'),'menu');
 const saved=w.localStorage.getItem('omnitrix-profile-v2');const reloaded=await boot(saved);assert.equal(reloaded.run("Array.from($('roster').children).every(c=>c.getAttribute('aria-label').startsWith(aliens[Number(c.dataset.alien)].name))"),true);await new Promise(r=>setTimeout(r,0));reloaded.w.close();console.log('Passed '+checked+' damaging alien casts at 30/60fps against small, standard and large opponents; '+(native?'native':'fallback')+' emitters; ownership sorting and mode-selection navigation.');await new Promise(r=>setTimeout(r,0));w.close();})().catch(e=>{console.error(e);process.exit(1)});`;
vm.runInThisContext('(function(require){'+source+'})')(require);
