const fs=require('fs'),vm=require('vm'),{createCanvas}=require('@napi-rs/canvas'),{harness,declaration}=require('../cel-harness.cjs');
(async()=>{
 const batch=Number(process.argv[2]||0),stage=process.argv[3]||'before',roster=JSON.parse(fs.readFileSync('ci/powers130/roster.json')),rows=roster.slice(batch*6,batch*6+6);
 const b=harness(),run=s=>vm.runInContext(s,b);await run('allAlienPosesReady');run(fs.readFileSync('web/art.js','utf8'));
 const game=fs.readFileSync('web/game.js','utf8');for(const n of ['drawEffect','drawShot','updateEffects','segmentRect','overlap','hitboxCircle'])run(declaration(game,n));
 for(const file of ['expansion-effects.js','alien-force-effects.js','next20-effects.js','cartoon-power-effects.js','ability-animations.js','combat-choreography.js','species-animation-fixes.js','crashhopper-guard127.js','requested-powers127.js','walk128-data.js','walk-quality128.js','requested-powers129.js','higher-powers130.js'])if(fs.existsSync('web/'+file))run(fs.readFileSync('web/'+file,'utf8'));
 const cv=createCanvas(1280,640),ctx=cv.getContext('2d');b.ctx=ctx;const records=[],overview=createCanvas(1701,1520),oc=overview.getContext('2d');oc.fillStyle='#14212b';oc.fillRect(0,0,1701,1520);
 for(const row of rows){
  const {id}=row;b.id=id;run('celCache.clear();celPinned=new Set([id,2]);');await run('Promise.all([celEnsure(id),celEnsure(2)])');const sheet=createCanvas(1620,1040),sc=sheet.getContext('2d');sc.fillStyle='#14212b';sc.fillRect(0,0,1620,1040);const attacks=[];
  for(const [line,key]of row.powers.entries()){
   b.key=key;run("player=make(id,420,1,true);enemy=make(2,660,-1);enemy.hp=1000000;player.ult=100;mode='fight';time=0;effects=[];shots=[];particles=[];player.loadout=[Number(key.slice(5))||0,0];");
   if(!run("cast(player,key==='ultimate'?'ultimate':key==='normal'?'normal':'skill0')"))throw Error('Cast failed '+id+'/'+key);
   const cfg=JSON.parse(run('JSON.stringify(player.cast.cfg)')),wind=cfg.windup,dur=['rush','pounce'].includes(cfg.kind)?Math.max(.42,cfg.duration||.08):(cfg.castDuration??cfg.duration??.08),total=wind+dur+(cfg.recovery||.4);
   const times=[wind*.55,wind+.01,wind+dur*.28,wind+dur*.55,wind+dur*.82,wind+dur+(cfg.recovery||.4)*.6],samples=[];
   for(let col=0;col<6;col++){
    const target=times[col];while(run('time')<target-.00001)run('time+=1/120;updateF(player,1/120);updateEffects(1/120);');
    samples.push(JSON.parse(run("JSON.stringify({t:time,frame:player.cast?CEL_DATA.characters[id].frames.indexOf(celPhase(player,celState(player),time).frame):null,own:player.cast?CEL_DATA.characters[id].clips[player.cast.cfg.poseKey||key]:null,profileFrame:player.cast&&powerProfileFor(player,player.cast)?powerProfileFor(player,player.cast).phases[powerPoseIndex(player,player.cast,powerProfileFor(player,player.cast).phases.length)]?.frame:null})")));
    ctx.fillStyle='#182c35';ctx.fillRect(0,0,1280,640);ctx.fillStyle='#324238';ctx.fillRect(0,510,1280,130);run('for(const e of effects)drawEffect(ctx,e);for(const s of shots)drawShot(ctx,s);drawAlien(ctx,enemy,time);drawAlien(ctx,player,time);if(player.cast&&player.cast.elapsed<player.cast.cfg.windup)drawPowerCharge(ctx,player,player.cast);');
    const middle=run('(player.x+enemy.x)/2'),sx=Math.max(0,Math.min(640,middle-320));sc.drawImage(cv,sx,150,640,440,col*270,line*208+24,270,180);sc.fillStyle='#e4f0ec';sc.font='12px sans-serif';sc.fillText(col===0?row.name+' · '+cfg.name:target.toFixed(2)+'s',col*270+5,line*208+16,264);
   }
   attacks.push({key,name:cfg.name,kind:cfg.kind,source:run('powerProfileFor(player,key)?.source||"native-contact"'),samples});
  }
  const tile=records.length,tx=(tile%3)*567,ty=Math.floor(tile/3)*760;oc.fillStyle='#e4f0ec';oc.font='16px sans-serif';oc.fillText(row.name+' · '+id,tx+8,ty+22);for(let k=0;k<3;k++)oc.drawImage(sheet,[0,2,4][k]*270,0,270,1040,tx+k*189,ty+30,189,728);
  fs.writeFileSync('ci/powers130/'+stage+'-'+String(id).padStart(2,'0')+'.webp',sheet.toBuffer('image/webp'));records.push({...row,review:'rendered',attacks});console.log(stage+' reviewed '+id+' '+row.name);
 }
 fs.writeFileSync('ci/powers130/'+stage+'-overview-'+batch+'.webp',overview.toBuffer('image/webp'));
 fs.writeFileSync('ci/powers130/'+stage+'-batch-'+batch+'.json',JSON.stringify(records,null,2)+'\n');
})().catch(e=>{console.error(e);process.exit(1)});
