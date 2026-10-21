const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{loadImage}=require('@napi-rs/canvas');
const {harness,declaration}=require('./cel-harness.cjs');
(async()=>{
 const b=harness({metadataOnly:true}),run=s=>vm.runInContext(s,b);run(fs.readFileSync('web/art.js','utf8'));
 for(const n of ['drawShot','drawEffect'])run(declaration(fs.readFileSync('web/game.js','utf8'),n));
 for(const f of ['cartoon-power-effects','ability-animations'])run(fs.readFileSync('web/'+f+'.js','utf8'));
 const draws=[],ctx={globalAlpha:1,imageSmoothingEnabled:false,save(){},restore(){},translate(){},rotate(){},drawImage(...a){draws.push(a)}};
 b.ctx=ctx;let count=0;
 for(let id=0;id<72;id++)for(const key of ['skill0','skill1','skill2','ultimate']){
  Object.assign(b,{id,key});const p=run('powerProfileFor({id},key)');if(!['projectile','lob'].includes(p.kind)||p.ticks!==1)continue;
  b.image=await loadImage('web/assets/ui/abilities/'+p.icon.atlas);run('throwArtImages.set(powerProfileFor({id},key).icon.atlas,image)');
  for(const dir of [-1,1]){
   b.dir=dir;run("e={owner:{id},artKey:key,kind:powerProfileFor({id},key).kind,x:500,y:300,r:20,vx:600*dir,vy:0,dir,life:2,maxLife:2.4,singleThrow:true}");draws.length=0;
   assert(run('drawSingleThrow(ctx,e)'));assert.equal(draws.length,1,'One throw must draw exactly one picture');assert.deepEqual(draws[0].slice(1,5),Array.from(p.icon.rect));
   run('e.singleThrow=false');assert.equal(run('drawSingleThrow(ctx,e)'),false,'Repeated volleys use animated geometry');count++;
  }
 }
 b.e={owner:{id:0},artKey:'normal',kind:'melee',singleThrow:true};assert.equal(run('drawSingleThrow(ctx,e)'),false,'A basic strike never uses attack artwork');
 console.log('Passed '+count+' single-throw renders in both directions: exact matching icon crops, one image per throw, and no artwork for repeated volleys or basic attacks.');
})().catch(e=>{console.error(e);process.exit(1)});
