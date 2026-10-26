const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness,declaration}=require('../cel-harness.cjs');
(async()=>{
 const rows=JSON.parse(fs.readFileSync('ci/powers130/roster.json')),b=harness(),run=s=>vm.runInContext(s,b);await run('allAlienPosesReady');run(fs.readFileSync('web/art.js','utf8'));
 const game=fs.readFileSync('web/game.js','utf8');for(const n of ['drawEffect','drawShot','updateEffects','segmentRect','overlap','hitboxCircle'])run(declaration(game,n));
 for(const file of ['expansion-effects.js','alien-force-effects.js','next20-effects.js','cartoon-power-effects.js','ability-animations.js','combat-choreography.js','species-animation-fixes.js','crashhopper-guard127.js','requested-powers127.js','walk128-data.js','walk-quality128.js','requested-powers129.js','higher-powers130.js'])run(fs.readFileSync('web/'+file,'utf8'));
 const ranks=JSON.parse(fs.readFileSync('web/progression.js','utf8').split('const ALIEN_RANKS=')[1].split(';')[0]);assert.deepEqual(rows.map(r=>r.id),ranks.flatMap((rank,id)=>rank>=2?[id]:[]));assert.equal(run('HIGHER_POWER_IDS130.size'),60);
 let casts=0,draws=0,markers=0;const report=[];
 for(const row of rows){const {id}=row;b.id=id;run('celCache.clear();celPinned=new Set([id]);');await run('celEnsure(id)');let reviews=[];
  for(const key of row.powers)for(const dir of [-1,1]){
   Object.assign(b,{key,dir});run('player=make(id,640,dir,true);enemy=make(2,640+dir*220,-dir);enemy.hp=1000000;player.ult=100;mode="fight";time=0;effects=[];shots=[];player.loadout=[Number(key.slice(5))||0,0];');assert(run('cast(player,key==="ultimate"?"ultimate":key==="normal"?"normal":"skill0")'));casts++;
   const cfg=run('JSON.stringify(player.cast.cfg)'),target=run('player.cast.targetX');run('enemy.x+=dir*140');const frames=new Set();
   for(const u of [-.5,0,.15,.35,.55,.75,.95,1.3]){
    b.u=u;run('player.cast.elapsed=player.cast.cfg.windup+Math.max(.08,player.cast.cfg.duration||.08)*u;time=player.cast.elapsed;');const snapshot=run('JSON.stringify(player)');run('ctx.clearRect(0,0,1280,640);drawAlien(ctx,player,time)');assert.equal(run('JSON.stringify(player)'),snapshot,'Render changed combat '+id+'/'+key);assert.equal(run('player.dir'),dir);assert.equal(run('player.cast.targetX'),target);assert.equal(run('JSON.stringify(player.cast.cfg)'),cfg);draws++;
    const picked=run('celPhase(player,celState(player),time)');frames.add(picked.frame);const expected=run('higher130Pose(player,celState(player))');if(expected){assert.equal(picked.frame,expected.frame);assert(!(id===82&&picked.frameId===24));assert(!(id===79&&picked.frameId===25));}
    const p=run('profileEmitter(player,player.cast,time)');if(p){assert(Number.isFinite(p.x)&&Number.isFinite(p.y));markers++;
     const pose=run('higher130Pose(player,celState(player))');if(pose){b.pose130=pose;const marker=pose.frame.emitters?.[pose.key]||(pose.phase?.frame===pose.frameId?pose.phase.pixel:Object.values(pose.frame.emitters||{})[0]);if(marker){b.marker130=marker;const attached=run('(()=>{const d=CEL_DATA.characters[id],s=aliens[id].renderHeight*aliens[id].scale/(pose130.frame.referenceHeight||d.referenceHeight);return{x:player.x+dir*(marker130[0]-pose130.frame.origin[0])*s,y:player.y+(marker130[1]-pose130.frame.origin[1])*s-locomotionLift126(player,time)}})()');assert(Math.abs(attached.x-p.x)<2&&Math.abs(attached.y-p.y)<2,'Detached native marker '+id+'/'+key);}}
    }
   }
   run('player.cast.elapsed=player.cast.cfg.windup+.01;time=player.cast.elapsed;spawnAttack(player,player.cast,0);for(const e of effects)drawEffect(ctx,e);for(const e of shots)drawShot(ctx,e);');
   assert.equal(run('drawSingleThrow(ctx,{owner:player,singleThrow:true,kind:"projectile",artKey:"skill0"})'),false,'Card art rendered in combat');reviews.push({key,dir,nativeFrames:frames.size,passed:true});
  }
  report.push({...row,review:'verified',attacks:reviews});console.log('Verified '+id+' '+row.name);
 }
 for(let id=0;id<ranks.length;id++)if(ranks[id]<2){Object.assign(b,{id});run('f130=make(id,400,1);f130.ult=100;enemy=make(2,700,-1);cast(f130,"ultimate");');assert.equal(run('higher130Selected(f130)'),false);assert.equal(run('higher130Pose(f130,"ultimate")'),null);}
 const result={passed:true,aliens:60,powers:300,casts,draws,attachedMarkerSamples:markers,commonRareUntouched:true,sourcePixelsUnchanged:true,phoneTested:false};fs.writeFileSync('ci/powers130/runtime.json',JSON.stringify(result,null,2)+'\n');fs.writeFileSync('ci/powers130/tracker.json',JSON.stringify(report,null,2)+'\n');console.log('Higher-category native audit passed: '+JSON.stringify(result));
})().catch(e=>{console.error(e);process.exit(1)});
