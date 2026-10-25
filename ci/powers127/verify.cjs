const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {harness,declaration}=require('../cel-harness.cjs');
const {createCanvas}=require('@napi-rs/canvas');
(async()=>{
 const b=harness(),run=s=>vm.runInContext(s,b),selected={23:['skill1','skill2'],28:['skill2'],30:['skill1','skill2','ultimate'],34:['skill1'],40:['skill2','ultimate'],49:['skill0','skill1','skill2','ultimate'],54:['skill0','skill2','ultimate'],66:['skill0','skill1','skill2','ultimate']};
 await run('allAlienPosesReady');
 // Match browser script order. Install drawing and collision functions used by the real game.
 for(const name of ['line','oval','path'])run(declaration(fs.readFileSync('web/art.js','utf8'),name));
 const game=fs.readFileSync('web/game.js','utf8');for(const name of ['drawEffect','drawShot','updateEffects','segmentRect','overlap','hitboxCircle'])run(declaration(game,name));
 for(const file of ['cartoon-power-effects.js','ability-animations.js','combat-choreography.js','species-animation-fixes.js','crashhopper-guard127.js','requested-powers127.js'])run(fs.readFileSync('web/'+file,'utf8'));
 const canvas=createCanvas(1280,640);b.ctx=canvas.getContext('2d');let draws=0,casts=0;
 for(const [raw,keys]of Object.entries(selected)){
  const id=Number(raw);b.id=id;run('celCache.clear();celPinned=new Set([id]);');await run('celEnsure(id)');
  for(const key of keys)for(const dir of [-1,1]){
   Object.assign(b,{key,dir});run("player=make(id,640,dir,true);enemy=make(2,640+dir*160,-dir);player.loadout=key==='ultimate'?[0,1]:[Number(key.slice(5)),0];player.ult=100;mode='fight';time=0;effects=[];shots=[];");
   assert(run("cast(player,key==='ultimate'?'ultimate':'skill0')"));casts++;
   const snapshot=run('player.cast.targetX');run('enemy.x+=130*dir');assert.equal(run('player.cast.targetX'),snapshot,'Cast target follows the moved enemy');
   const native=new Set();
   for(const fraction of [0,.2,.55,.85,1.02]){
    b.fraction=fraction;run("player.cast.elapsed=player.cast.cfg.windup+Math.max(.42,player.cast.cfg.duration||.08)*fraction;time=player.cast.elapsed;");
    const before=run('JSON.stringify(player)');run('ctx.clearRect(0,0,1280,640);drawAlien(ctx,player,time);');assert.equal(run('JSON.stringify(player)'),before,'Rendering mutated gameplay');
    const picked=run('celPhase(player,key,time).frame');native.add(JSON.stringify(picked));
    assert(picked.rect.every(Number.isFinite));assert.equal(run('player.dir'),dir);assert.equal(run('player.cast.dir'),dir);draws++;
   }
   if(run("['rush','pounce'].includes(player.cast.cfg.kind)"))assert(native.size>=2,'Rush has a static body: '+id+'/'+key);
   run('player.cast.elapsed=player.cast.cfg.windup+.001;spawnAttack(player,player.cast,0);for(const e of effects)drawEffect(ctx,e);for(const s of shots)drawShot(ctx,s);');
   if(id===30&&key==='skill1'||id===54&&key==='skill0'){
    assert(run('effects.some(e=>e.attachedStrike127)'));run('constAttached=effects.find(e=>e.attachedStrike127);');
    assert.equal(run('constAttached.x+(constAttached.rayDir||constAttached.dir)*constAttached.length'),snapshot);
    run('enemy.x=player.cast.targetX;enemy.y=510;enemy.inv=0;enemy.dash=null;effects=effects.filter(e=>e.attachedStrike127);beforeHP=enemy.hp;updateEffects(1/120);');assert(run('enemy.hp<beforeHP'),'Attached strike did not hit captured point');
   }
   run('player.cast=null');
  }
 }
 // New guard loads as a fifth native sheet, preserves stance and responds to blocked contacts.
 run('celCache.clear();celPinned=new Set([49]);');await run('celEnsure(49)');assert.equal(run('celCache.get(49).images.length'),5);
 run('player=make(49,640,1,true);player.block=true;time=0;');const first=run("celPhase(player,'guard',time).frame");assert(first.requestedGuard127);
 run('time=.2;player.hitTint=.1');assert.equal(run("celPhase(player,'guard',time).index"),2);run('player.hitTint=0;time=.25');assert.equal(run("celPhase(player,'guard',time).index"),3);run('time=.5');assert.equal(run("celPhase(player,'guard',time).index"),1);
 for(const dir of [-1,1]){b.dir=dir;run('player.dir=dir;drawAlien(ctx,player,time);');draws++;}
 // Native cels, not card artwork or transformed whole-body stand-ins.
 const source=fs.readFileSync('web/requested-powers127.js','utf8');assert(!/\.icon|throwArt|scale\([^)]*,\s*0\./.test(source));
 const result={passed:true,aliens:8,powers:20,casts,draws,guardFrames:4,notes:'Real native rendering, both facings, captured-target immutability and attached-strike collisions.'};
 fs.writeFileSync('ci/powers127/runtime.json',JSON.stringify(result,null,2)+'\n');console.log('Requested powers v12.7 passed:',JSON.stringify(result));
})().catch(e=>{console.error(e);process.exit(1)});
