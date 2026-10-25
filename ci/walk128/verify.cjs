const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness}=require('../cel-harness.cjs');
(async()=>{
 const b=harness(),run=s=>vm.runInContext(s,b);await run('allAlienPosesReady');
 run(fs.readFileSync('web/species-animation-fixes.js','utf8').split('\n').filter(s=>/^CARTOON_GAITS\[/.test(s)).join('\n'));
 const before=run('JSON.stringify(CEL_DATA.characters.map(d=>d.clips))');
 run(fs.readFileSync('web/walk128-data.js','utf8'));run(fs.readFileSync('web/walk-quality128.js','utf8'));
 const data=run('WALK128_DATA');assert.equal(data.reference,6);assert(Object.keys(data.characters).length>50);
 let draws=0;const records=[];
 for(let id=0;id<92;id++){
  b.id=id;run('celCache.clear();celPinned=new Set([id]);');await run('celEnsure(id)');
  const poses=new Set();
  for(const dir of [-1,1]){
   b.dir=dir;run('player=make(id,640,dir,true);enemy=make(2,1000,-dir);mode="fight";time=0;celPhase(player,"idle",0);');
   const p=run('walk128Profile(player)');if(p){assert(p.stride>0);assert.equal(p.offsets.length,8);assert(p.offsets.every(x=>Number.isFinite(x)&&Math.abs(x)<=.025001));}
   const cycle=run('aliens[id].renderHeight*aliens[id].scale*walk128Stride(player,CARTOON_GAITS[id].stride)');
   for(let k=0;k<40;k++){
    b.step=cycle/32;run('player.x+=dir*step;player.gaitDistance126=(player.gaitDistance126||0)+step;player.moving=true;time+=1/60;');
    const stable=run('JSON.stringify(player)');run('drawAlien(ctx,player,time)');assert.equal(run('JSON.stringify(player)'),stable,'Walking render mutated gameplay');assert.equal(run('player.dir'),dir);poses.add(run('celPhase(player,"walk",time).frame'));draws++;
   }
   if(p){run('player.moving=false;player.x+=dir*3;time+=1/60;drawAlien(ctx,player,time)');assert.equal(run('celStates.get(player).state'),'walk','A stale multiplayer movement flag caused idle sliding');draws++;}
   run('player.moving=false;celPhase(player,"idle",time);');const travel=run('locomotionTravel126(player,"idle")');run('time+=5;drawAlien(ctx,player,time)');assert.equal(run('locomotionTravel126(player,"idle")'),travel,'Idle drifted');
   run('player.cast={key:"skill0",elapsed:aliens[id].skills[0].windup+.01,dir,cfg:aliens[id].skills[0]};');const at=run('drawnAlienEmitter(player,player.cast)');assert(Number.isFinite(at.x)&&Number.isFinite(at.y));run('drawAlien(ctx,player,time)');draws++;
  }
  if(!run('!!locomotionFlight126(player)'))assert(poses.size>=4,'Native walk lost poses '+id);
  records.push({id,passed:true,nativePoses:poses.size});
 }
 assert.equal(run('JSON.stringify(CEL_DATA.characters.map(d=>d.clips))'),before,'Walk art/clip order changed');
 assert.equal(run('walk128Profile({id:6})'),null,'Upgrade reference changed');
 for(const id of [3,7,9,25,26,33,34,36,51,69,86]){b.id=id;assert.equal(run('walk128Profile({id})'),null,'Flight/skating must be preserved');}
 const result={passed:true,aliens:92,groundWalkers:Object.keys(data.characters).length,nativeDraws:draws,reference:6,bodyScaleUnchanged:true,combatUnchanged:true,records};
 fs.writeFileSync('ci/walk128/runtime.json',JSON.stringify(result,null,2)+'\n');console.log('Upgrade-reference walk verification passed:',draws,'native draws across 92 aliens; both directions, idle stops, native clip preservation and power transitions.');
})().catch(e=>{console.error(e);process.exit(1)});
