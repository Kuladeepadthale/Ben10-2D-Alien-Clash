const fs=require('fs'),vm=require('vm'),{createCanvas}=require('@napi-rs/canvas'),{harness,declaration}=require('../cel-harness.cjs');
(async()=>{
 const b=harness(),run=s=>vm.runInContext(s,b);await run('allAlienPosesReady');
 run(fs.readFileSync('web/art.js','utf8'));
 const game=fs.readFileSync('web/game.js','utf8');for(const name of ['drawEffect','drawShot','updateEffects','segmentRect','overlap','hitboxCircle'])run(declaration(game,name));
 for(const file of ['expansion-effects.js','alien-force-effects.js','next20-effects.js','cartoon-power-effects.js','ability-animations.js','combat-choreography.js','species-animation-fixes.js','crashhopper-guard127.js','requested-powers127.js','walk128-data.js','walk-quality128.js','requested-powers129.js'])run(fs.readFileSync('web/'+file,'utf8'));
 const rows=[[3,'skill1'],[3,'skill2'],[3,'ultimate'],[6,'skill2'],[12,'skill0'],[12,'ultimate'],[16,'skill0'],[16,'skill1'],[16,'skill2'],[16,'ultimate'],[41,'skill2'],[41,'ultimate'],[53,'skill1'],[53,'ultimate'],[61,'skill0'],[61,'skill1'],[61,'skill2'],[61,'ultimate'],[86,'skill0'],[86,'skill1'],[86,'skill2'],[86,'ultimate']];
 const cv=createCanvas(1280,640),ctx=cv.getContext('2d');b.ctx=ctx;let sheet,sc;
 for(let row=0;row<rows.length;row++){
  if(row%5===0){sheet=createCanvas(1620,5*208);sc=sheet.getContext('2d');sc.fillStyle='#14212b';sc.fillRect(0,0,1620,1040);}
  const [id,key]=rows[row];Object.assign(b,{id,key});run('celCache.clear();celPinned=new Set([id,2]);');await run('Promise.all([celEnsure(id),celEnsure(2)])');
  run("player=make(id,420,1,true);enemy=make(2,660,-1);enemy.hp=100000;player.ult=100;mode='fight';time=0;effects=[];shots=[];particles=[];player.loadout=[Number(key.slice(5))||0,0];");
  if(key==='guard')run('player.block=true');else run("cast(player,key==='ultimate'?'ultimate':'skill0')");
  const name=key==='guard'?'Crashhopper guard':run('(aliens[id].name+\' · \'+player.cast.cfg.name)');
  const wind=key==='guard'?.12:run('player.cast.cfg.windup'),dur=key==='guard'?.5:run("['rush','pounce'].includes(player.cast.cfg.kind)?Math.max(.42,player.cast.cfg.duration||.08):player.cast.cfg.duration||.08");
  const times=key==='guard'?[0,.08,.2,.28,.4,.6]:[wind*.5,wind+.01,wind+dur*.25,wind+dur*.5,wind+dur*.85,wind+dur+.18];
  for(let col=0;col<6;col++){
   const target=times[col];while(run('time')<target-.00001){run('time+=1/120;updateF(player,1/120);updateEffects(1/120);');}
   if(key==='guard')run('player.block=true;player.hitTint=time>=.2&&time<.29?.1:0;');
   ctx.fillStyle='#182c35';ctx.fillRect(0,0,1280,640);ctx.fillStyle='#324238';ctx.fillRect(0,510,1280,130);ctx.strokeStyle='#8aa46d';ctx.beginPath();ctx.moveTo(0,510);ctx.lineTo(1280,510);ctx.stroke();
   run('for(const e of effects)drawEffect(ctx,e);for(const s of shots)drawShot(ctx,s);drawAlien(ctx,enemy,time);drawAlien(ctx,player,time);if(player.cast&&player.cast.elapsed<player.cast.cfg.windup)drawPowerCharge(ctx,player,player.cast);');
   const middle=run('(player.x+enemy.x)/2'),sx=Math.max(0,Math.min(640,middle-320));sc.drawImage(cv,sx,150,640,440,col*270,row%5*208+24,270,180);
   sc.fillStyle='#e4f0ec';sc.font='12px sans-serif';sc.fillText(col===0?name:target.toFixed(2)+'s',col*270+5,row%5*208+16,264);
  }
  if(row%5===4||row===rows.length-1){const out='ci/powers129/preview-'+Math.floor(row/5)+'.webp';fs.writeFileSync(out,sheet.toBuffer('image/webp'));console.log('Saved '+out);}
 }
})().catch(e=>{console.error(e);process.exit(1)});

// Review checkpoint: all 22 requested powers.
