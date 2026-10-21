const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const {harness,declaration}=require('./cel-harness.cjs'),{loadImage}=require('@napi-rs/canvas');
async function main(){
 const b=harness({metadataOnly:true}),run=s=>vm.runInContext(s,b),ctx=b.ctx;
 run(fs.readFileSync('web/art.js','utf8'));const game=fs.readFileSync('web/game.js','utf8');
 for(const n of ['drawShot','drawEffect'])run(declaration(game,n));
 for(const f of ['expansion-effects','alien-force-effects','next20-effects','cartoon-power-effects','ability-animations'])run(fs.readFileSync('web/'+f+'.js','utf8'));
 for(let i=0;i<18;i++){b.index=i;b.image=await loadImage('web/'+run('abilityAnimationPaths[index]'));run('abilityAnimationImages.set(index,image)');}
 let count=0;
 for(let id=0;id<72;id++)for(const key of ['normal','skill0','skill1','skill2','ultimate'])for(const dir of [-1,1]){
  Object.assign(b,{id,key,dir});
  run("player=make(id,300,dir,true);enemy=make((id+1)%72,300+dir*250,-dir);cfg=key==='normal'?baseNormal(player):key==='ultimate'?aliens[id].ultimate:aliens[id].skills[Number(key.slice(5))];player.cast={id:72,key,dir,elapsed:cfg.windup+.02,cfg,ultimate:key==='ultimate'};effect={owner:player,artKey:key,castId:72,name:cfg.name,kind:cfg.kind,x:600,y:340,r:40,range:cfg.range,length:400,endY:380,dir,vx:600*dir,vy:0,life:.72,maxLife:1,height:150,delay:.1,color:aliens[id].light,budget:{remaining:100},damage:100};if(effect.kind==='spikes')effect.kind='spike';if(['rush','pounce','leapslam'].includes(effect.kind)){effect.kind='afterimage';effect.x=player.x;effect.y=player.y}");
  const before=run('JSON.stringify(effect)'),signatures=[];
  for(const t of [.2,.4,.6]){
   b.time=t;run('effect.life=1-time');ctx.clearRect(0,0,1280,640);
   const sprite=run('abilityAnimationSprite(effect)');assert.equal(sprite.key,key);assert(sprite.image.width>=1000&&sprite.image.height>=800);
   run("['projectile','wave','lob','rain','ground'].includes(effect.kind)?drawShot(ctx,effect):drawEffect(ctx,effect)");
   const pixels=ctx.getImageData(0,0,1280,640).data;assert(pixels.some((v,i)=>i%4===3&&v>0),`Empty ${id} ${key}`);signatures.push(crypto.createHash('sha256').update(pixels).digest('hex'));count++;
  }
  if(['beam','projectile','vortex','melee','afterimage','eruption'].includes(run('effect.kind')))assert(new Set(signatures).size>1,'Animation must change over time');
  run('effect.life=.72');assert.equal(run('JSON.stringify(effect)'),before,'Artwork mutated combat state');
 }
 console.log(`Passed ${count} real-art renders: 360 power images, both facings, changing animation phases, immutable damage state.`);
}
main().catch(e=>{console.error(e);process.exit(1)});
