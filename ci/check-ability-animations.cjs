const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const {harness,declaration}=require('./cel-harness.cjs');
const b=harness({metadataOnly:true}),run=s=>vm.runInContext(s,b),ctx=b.ctx;
run(fs.readFileSync('web/art.js','utf8'));
for(const n of ['drawShot','drawEffect'])run(declaration(fs.readFileSync('web/game.js','utf8'),n));
for(const f of ['expansion-effects','alien-force-effects','next20-effects','cartoon-power-effects','ability-animations'])run(fs.readFileSync('web/'+f+'.js','utf8'));
ctx.drawImage=()=>{throw Error('A battle effect must not draw an icon or image')};
let count=0,animated=0;
for(let id=0;id<72;id++)for(const key of ['normal','skill0','skill1','skill2','ultimate'])for(const dir of [-1,1]){
 Object.assign(b,{id,key,dir});
 run("player=make(id,640,dir,true);enemy=make((id+1)%72,640+dir*250,-dir);cfg=key==='normal'?baseNormal(player):key==='ultimate'?aliens[id].ultimate:aliens[id].skills[Number(key.slice(5))];player.cast={id:72,key,dir,elapsed:cfg.windup+.02,cfg,ultimate:key==='ultimate'};effect={id:100,owner:player,artKey:key,castId:72,name:cfg.name,kind:cfg.kind,x:640,y:330,r:40,range:cfg.range,length:400,endY:330,dir,vx:600*dir,vy:0,life:.72,maxLife:1,height:150,delay:.1,color:aliens[id].light,budget:{remaining:100},damage:100};if(effect.kind==='spikes')effect.kind='spike';if(['rush','pounce','leapslam'].includes(effect.kind))effect.kind='afterimage';if(effect.kind==='beam'){const p=drawnAlienEmitter(player,player.cast);effect.x=p.x;effect.y=p.y;}");
 const before=run('JSON.stringify(effect)'),signatures=[];
 for(const t of [.2,.4,.6]){
  b.time=t;run('effect.life=1-time');ctx.clearRect(0,0,1280,640);
  run("['projectile','wave','lob','rain','ground'].includes(effect.kind)?drawShot(ctx,effect):drawEffect(ctx,effect)");
  const pixels=ctx.getImageData(0,0,1280,640).data,visible=pixels.some((v,i)=>i%4===3&&v>0);
  if(b.effect.kind==='afterimage'||b.effect.kind==='melee'&&key!=='normal')assert(!visible,'Close combat stays in the native character clip');else assert(visible,'Empty '+id+' '+key);
  signatures.push(crypto.createHash('sha256').update(pixels).digest('hex'));count++;
 }
 if(['beam','vortex','eruption'].includes(b.effect.kind)){assert(new Set(signatures).size>1,'Effects must animate '+id+' '+key);animated++;}
 run('effect.life=.72');assert.equal(run('JSON.stringify(effect)'),before,'Renderer changed combat state');
}
console.log('Passed '+count+' image-free effect renders, '+animated+' animated streams/swings, 72 aliens, both facings, immutable combat state.');
