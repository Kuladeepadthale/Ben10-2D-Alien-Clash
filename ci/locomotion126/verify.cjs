const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness,declaration}=require('../cel-harness.cjs'),{createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{
 const b=harness(),run=s=>vm.runInContext(s,b),checks=[];await run('allAlienPosesReady');
 vm.runInContext(fs.readFileSync('web/villain-data.js','utf8'),b);
 run('const villainTextures=new Map(),villainCloseTextures=new Map();');const threat=fs.readFileSync('web/threat-ladder.js','utf8');for(const name of ['villainFrame','drawVillain'])run(declaration(threat,name));
 const report=JSON.parse(fs.readFileSync('ci/locomotion126/audit.json','utf8'));
 const cv=createCanvas(1280,8*165),ctx=cv.getContext('2d');ctx.fillStyle='#14222c';ctx.fillRect(0,0,cv.width,cv.height);
 let draws=0;
 for(let id=0;id<92;id++){
  b.id=id;run('celPinned=new Set([id]);');await run('celEnsure(id)');const indices=new Set();
  for(const dir of [1,-1]){run(`player=make(${id},640,${dir},true);enemy=make(2,1000,-1);f=player;mode='fight';time=0;celPhase(f,'idle',time);`);
   // Isolated short taps must advance the pose instead of discarding every first moving sample.
   for(let tap=0;tap<24;tap++){run('move(f,f.dir,1/60);time+=1/60;');indices.add(run("celPhase(f,'walk',time).frame"));run('drawAlien(ctx,f,time);f.moving=false;time+=.05;celPhase(f,\'idle\',time);');draws++;}
   if(!run('!!locomotionFlight126(f)'))assert(indices.size>=2,'Static short-tap gait '+id);
   else {assert(run("celPhase(f,'walk',time).flight126"));assert(run('locomotionLift126(f,time)>8'));assert(run('locomotionNoFootsteps126(f)'));}
   const at=run("locomotionTravel126(f,'walk')");run('time+=5;');assert.equal(run("locomotionTravel126(f,'walk')"),at,'Stationary actor advances by elapsed time');assert.equal(run('f.dir'),dir);
   // Return to the original native attack sequence and then to movement.
   run('f.cast={key:\'skill0\',elapsed:aliens[id].skills[0].windup+.04,dir:f.dir,cfg:aliens[id].skills[0]};');assert(!run("celPhase(f,'skill0',time).flight126"));run('drawAlien(ctx,f,time);');const point=run('drawnAlienEmitter(f,f.cast)');assert(Number.isFinite(point.x)&&Number.isFinite(point.y));run('f.cast=null;f.moving=true;drawAlien(ctx,f,time);');draws+=2;
  }
  checks.push({kind:'alien',id,shortTapPoses:indices.size,passed:true});
 }
 const villains=run('VILLAIN_DATA.characters');
 for(let id=0;id<50;id++){
  const d=villains[id];run('villainTextures.clear();');run('villainCloseTextures.clear();');const im=await loadImage('web/'+d.src);b.im=im;b.id=id;run('villainTextures.set(id,im);');
  const frames=new Set();for(const dir of [1,-1]){
   run(`f=make(2,640,${dir});f.villain=${id};f.config={...VILLAIN_DATA.characters[${id}].kit,speed:275,scale:1};time=0;villainFrame(f);`);
   for(let j=0;j<80;j++){run('move(f,f.dir,1/60);time+=1/60;drawVillain(ctx,f,time);');frames.add(run('villainFrame(f)'));draws++;}
   assert(frames.size>=3,'Villain lost native steps '+id);const p=run('locomotionVillain126(f)');
   if(p.mode!=='hover'){const current=run('villainFrame(f)');run('time+=9');assert.equal(run('villainFrame(f)'),current);assert.equal(run('locomotionLift126(f,time)'),0,'Ground villain incorrectly hovers '+id);}
   else assert(run('locomotionLift126(f,time)>6'));
   assert.equal(run('f.dir'),dir);
  }
  checks.push({kind:'villain',id,nativePoses:frames.size,passed:true});
 }
 // Ground humans with psychic powers must not acquire ghost-style floating.
 for(const id of [1,8,24,25,38,47,48]){b.id=id;assert.equal(run('locomotionVillain126({villain:id}).mode'),'walk');}
 // Previously approved native walk clips, especially Big Chill/Humungousaur, remain untouched.
 for(const id of [0,1,2,3,4,10,19,24,26]){b.id=id;assert(!run('LOCOMOTION126_FLIGHT[id]'));assert.equal(run('CEL_DATA.characters[id].clips.walk.length'),8);}
 const result={passed:true,scope:'locomotion-only',aliens:92,villains:50,draws,checks};fs.writeFileSync('ci/locomotion126/runtime.json',JSON.stringify(result,null,2)+'\n');
 for(const entry of report.characters){entry.status='native-sequence-and-runtime-verified';entry.action=entry.kind==='villain'?'distance-matched native gait and explicit ground/spectral classification':[25,33,51,69].includes(entry.id)?'native flight-ready pose reused; ground stepping suppressed':'native artwork and approved gait preserved; short-tap/low-render-rate cadence corrected';fs.writeFileSync('ci/locomotion126/characters/'+entry.kind+'-'+String(entry.id).padStart(2,'0')+'.json',JSON.stringify(entry,null,2)+'\n');}
 report.runtime={passed:true,draws,characters:142};fs.writeFileSync('ci/locomotion126/audit.json',JSON.stringify(report,null,2)+'\n');console.log('Locomotion verification passed:',draws,'native draws, 92 aliens and 50 villains; short taps, stops, facings, flight/attack transitions.');
})().catch(e=>{console.error(e);process.exit(1)});
