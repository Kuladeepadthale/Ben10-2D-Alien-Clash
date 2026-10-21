const fs=require('fs'),vm=require('vm'),path=require('path'),{spawn}=require('child_process');
const {createCanvas}=require('@napi-rs/canvas'),{harness,declaration}=require('./cel-harness.cjs');
async function main(){
 const b=harness(),run=s=>vm.runInContext(s,b),game=fs.readFileSync('web/game.js','utf8');run(fs.readFileSync('web/art.js','utf8'));
 for(const n of ['drawShot','drawEffect','overlap','segmentRect','hitboxCircle','updateEffects'])run(declaration(game,n));
 for(const f of ['expansion-effects','alien-force-effects','next20-effects','cartoon-power-effects','ability-animations'])run(fs.readFileSync('web/'+f+'.js','utf8'));
 const out=process.argv[2]||'/tmp/ability-preview';fs.mkdirSync(out,{recursive:true});
 const cv=createCanvas(960,540),ctx=cv.getContext('2d');b.ctx=ctx;
 const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate','24','-i','pipe:0','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'Power-Artwork-Animations.mp4')],{stdio:['pipe','ignore','pipe']});let error='';ff.stderr.on('data',v=>error+=v);const done=new Promise((resolve,reject)=>ff.on('close',n=>n?reject(Error(error)):resolve()));
 for(const [id,key]of [[0,'skill0'],[0,'skill1'],[2,'skill2'],[11,'skill0'],[14,'skill0'],[3,'skill1']]){
  Object.assign(b,{id,key,target:id===2?0:2});await run('Promise.all([celEnsure(id),celEnsure(target)])');run('celPinned=new Set([id,target])');
  run("player=make(id,320,1,true);enemy=make(target,900,-1);mode='fight';player.loadout=key==='skill2'?[2,1]:[0,1];shots=[];effects=[];time=0;cast(player,key==='skill2'?'skill0':key)");
  if(['melee','vortex'].includes(run('player.cast.cfg.kind')))run('enemy.x=480');const title=run('aliens[id].name+" · "+player.cast.cfg.name');
  for(let frame=0;frame<64;frame++){
   for(let sub=0;sub<5;sub++)run('time+=1/120;updateF(player,1/120);updateF(enemy,1/120);updateEffects(1/120)');
   ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#101e27';ctx.fillRect(0,0,960,540);ctx.fillStyle='#1c3338';ctx.fillRect(0,470,960,70);
   ctx.fillStyle='#d8ffa5';ctx.font='bold 25px sans-serif';ctx.fillText(title,116,40);ctx.fillStyle='#b3c8ca';ctx.font='16px sans-serif';ctx.fillText('Power-button artwork → animated attack',116,68);
   run('drawAbilitySprite(ctx,abilityAnimationSprite({owner:player,artKey:key}),54,45,82,82)');
   ctx.save();ctx.translate(0,90);ctx.scale(.75,.75);ctx.strokeStyle='#6b9991';ctx.beginPath();ctx.moveTo(0,510);ctx.lineTo(1280,510);ctx.stroke();
   run("for(const e of effects)if(['warning','trap','afterimage'].includes(e.kind))drawEffect(ctx,e);drawAlien(ctx,enemy,time);drawAlien(ctx,player,time);for(const e of effects)if(!['warning','trap','afterimage'].includes(e.kind))drawEffect(ctx,e);for(const s of shots)drawShot(ctx,s)");ctx.restore();
   if(frame===12||frame===18)fs.writeFileSync(path.join(out,`review-${id}-${key}-${frame}.png`),cv.toBuffer('image/png'));
   if(!ff.stdin.write(cv.toBuffer('image/png')))await new Promise(r=>ff.stdin.once('drain',r));
  }
 }
 ff.stdin.end();await done;console.log(path.join(out,'Power-Artwork-Animations.mp4'));
}
main().catch(e=>{console.error(e);process.exit(1)});
