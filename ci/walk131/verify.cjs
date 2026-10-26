const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness,declaration}=require('../cel-harness.cjs');
(async()=>{
 const b=harness(),run=s=>vm.runInContext(s,b);await run('allAlienPosesReady');run(fs.readFileSync('web/art.js','utf8'));const game=fs.readFileSync('web/game.js','utf8');for(const name of ['drawEffect','drawShot','updateEffects','segmentRect','overlap','hitboxCircle'])run(declaration(game,name));
 for(const file of ['expansion-effects.js','alien-force-effects.js','next20-effects.js','cartoon-power-effects.js','ability-animations.js','combat-choreography.js','species-animation-fixes.js','crashhopper-guard127.js','requested-powers127.js','walk128-data.js','walk-quality128.js','requested-powers129.js','higher-powers130.js','walk131-data.js','walk-jump131.js'])run(fs.readFileSync('web/'+file,'utf8'));
 let bodyDraws=0;const raw=b.ctx.drawImage.bind(b.ctx);b.ctx.drawImage=(...args)=>{bodyDraws++;return raw(...args)};let jumps=0,walks=0;
 for(let id=0;id<92;id++){
  b.id=id;run('celCache.clear();celPinned=new Set([id]);');await run('celEnsure(id)');
  for(const dir of [-1,1]){
   b.dir=dir;run('player=make(id,640,dir,true);enemy=make(2,640+dir*220,-dir);');
   for(const vy of [-450,0,350]){
    b.vy131=vy;run('player.y=floor-85;player.vy=vy131;player.cast=null;player.dash=null;player.stun=0;player.jumpWindup=0;time=.5;echo131={kind:"afterimage",owner:player,alien:id,x:player.x-dir*18,y:floor,dir,life:.09,maxLife:.09,color:"#c5eeff"};');
    const before=run('JSON.stringify(player)');bodyDraws=0;run('drawEffect(ctx,echo131);drawAlien(ctx,player,time)');assert.equal(bodyDraws,1,'Duplicate body during jump '+id+'/'+dir);assert.equal(run('JSON.stringify(player)'),before);jumps++;
   }
   run('player.y=floor;player.vy=0;player.moving=true;player.gaitDistance126=0;');const native=run('CEL_DATA.characters[id].clips.walk.join(",")');let frames=new Set();
   for(let step=0;step<40;step++){
    run('player.x+=dir*4;player.gaitDistance126+=4;time+=1/60;');const before=run('JSON.stringify(player)');bodyDraws=0;run('drawAlien(ctx,player,time)');assert.equal(bodyDraws,1);assert.equal(run('JSON.stringify(player)'),before);assert.equal(run('CEL_DATA.characters[id].clips.walk.join(",")'),native);frames.add(run('celPhase(player,celState(player),time).frame'));walks++;
   }
   if(run('!!walk131Profile(player)'))assert(frames.size>=4,'Static calibrated walk '+id);
   run('player.moving=false;');run('player.x=640;');const stable=run('walk128TravelPreview(player)');for(let n=0;n<3;n++)run('walk128TravelPreview(player)');assert.equal(run('walk128TravelPreview(player)'),stable,'Consumed observer in preview');
   bodyDraws=0;run('drawEffect(ctx,echo131)');assert.equal(bodyDraws,0,'Dash wake rendered an alien');
  }
 }
 const data=run('WALK131_DATA');assert.equal(data.sourcePixelsChanged,false);assert(Object.keys(data.characters).length>50);for(const p of Object.values(data.characters)){assert.equal(p.offsets.length,8);assert(p.offsets.every(x=>Math.abs(x)<=.060001));assert(p.stride>0);}
 const result={passed:true,aliens:92,jumpCases:jumps,walkDraws:walks,oneActorPerJump:true,bodyAfterimagesRemoved:true,nativeSourcePixelsPreserved:true,phoneTested:false};fs.writeFileSync('ci/walk131/runtime.json',JSON.stringify(result,null,2)+'\n');console.log('Walk/jump131 passed: '+JSON.stringify(result));
})().catch(e=>{console.error(e);process.exit(1)});
