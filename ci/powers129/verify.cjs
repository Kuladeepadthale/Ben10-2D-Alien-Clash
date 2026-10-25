const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness,declaration}=require('../cel-harness.cjs');
(async()=>{
 const b=harness(),run=s=>vm.runInContext(s,b);await run('allAlienPosesReady');
 run(fs.readFileSync('web/art.js','utf8'));const game=fs.readFileSync('web/game.js','utf8');for(const n of ['drawEffect','drawShot','updateEffects','segmentRect','overlap','hitboxCircle'])run(declaration(game,n));
 for(const file of ['expansion-effects.js','alien-force-effects.js','next20-effects.js','cartoon-power-effects.js','ability-animations.js','combat-choreography.js','species-animation-fixes.js','requested-powers127.js','walk128-data.js','walk-quality128.js','requested-powers129.js'])run(fs.readFileSync('web/'+file,'utf8'));
 const keys=run('powers129Keys');let casts=0,draws=0;
 for(const [raw,list]of Object.entries(keys)){
  const id=Number(raw);b.id=id;run('celCache.clear();celPinned=new Set([id]);');await run('celEnsure(id)');
  for(const key of list)for(const dir of [-1,1]){
   Object.assign(b,{key,dir});run('player=make(id,640,dir,true);enemy=make(2,640+dir*180,-dir);player.ult=100;player.loadout=[Number(key.slice(5))||0,0];mode="fight";time=0;effects=[];shots=[];');
   assert(run('cast(player,key==="ultimate"?"ultimate":"skill0")'));casts++;const target=run('player.cast.targetX');run('enemy.x+=dir*90;');
   const frames=new Set();for(const fraction of [0,.12,.3,.55,.82,1.1]){
    b.fraction=fraction;run('player.cast.elapsed=player.cast.cfg.windup+Math.max(.42,player.cast.cfg.duration||.08)*fraction;time=player.cast.elapsed;');
    const stable=run('JSON.stringify(player)');run('ctx.clearRect(0,0,1280,640);drawAlien(ctx,player,time);');assert.equal(run('JSON.stringify(player)'),stable,'Rendering changed combat');assert.equal(run('player.dir'),dir);assert.equal(run('player.cast.targetX'),target);frames.add(run('celPhase(player,key,time).frame'));draws++;
   }
   if(run('["rush","pounce","melee","vortex"].includes(player.cast.cfg.kind)'))assert(frames.size>=2,'Static native action '+id+'/'+key);
   run('player.cast.elapsed=player.cast.cfg.windup+.01;time=player.cast.elapsed;spawnAttack(player,player.cast,0);for(const e of effects)drawEffect(ctx,e);for(const s of shots)drawShot(ctx,s);');
   if(id===41&&key==='skill2'){
    assert.equal(run('player.cast.cfg.range'),390);assert(run('effects.some(e=>e.attachedTail129)'));run('enemy.x=player.cast.targetX;enemy.inv=0;beforeHP=enemy.hp;updateEffects(1/120);');assert(run('enemy.hp<beforeHP'),'Long native tail missed captured contact');
   }
  }
 }
 run('d129=CEL_DATA.characters[86];');assert(run('d129.requestedRepair129'));assert.equal(run('new Set(d129.frames.slice(16).map(f=>f.referenceHeight)).size'),1);assert.equal(run('d129.frames.length'),32);assert.equal(run('d129.clips.walk.length'),8);
 for(const id of [3,16,41,86])for(const dir of [-1,1]){
  Object.assign(b,{id,dir});run('player=make(id,420,dir,true);enemy=make(2,420+dir*220,-dir);player.ult=100;mode="fight";effects=[];shots=[];cast(player,"ultimate");oldTarget129=player.cast.targetX;enemy.x+=dir*150;');for(let tick=0;tick<400;tick++)run('time+=1/120;updateF(player,1/120);updateEffects(1/120);');assert(Math.abs(run('player.x')-run('oldTarget129-dir*60*aliens[id].scale'))<.1,'Ultimate overshot captured combo point');assert.equal(run('player.dir'),dir);
 }
 assert(!/\.icon|throwArt/.test(fs.readFileSync('web/requested-powers129.js','utf8')));
 const result={passed:true,aliens:8,powers:22,casts,draws,rushNativeFrames:16,manualFacing:true,capturedTargets:true};fs.writeFileSync('ci/powers129/runtime.json',JSON.stringify(result,null,2)+'\n');console.log('Species power repairs v12.9 passed:',JSON.stringify(result));
})().catch(e=>{console.error(e);process.exit(1)});
