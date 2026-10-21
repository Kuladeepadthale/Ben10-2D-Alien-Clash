const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {harness,declaration}=require('./cel-harness.cjs');
const b=harness({metadataOnly:true}),run=s=>vm.runInContext(s,b),ctx=b.ctx;
run(fs.readFileSync('web/art.js','utf8'));
for(const n of ['drawShot','drawEffect'])run(declaration(fs.readFileSync('web/game.js','utf8'),n));
for(const f of ['cartoon-power-effects','ability-animations'])run(fs.readFileSync('web/'+f+'.js','utf8'));
ctx.drawImage=()=>{throw Error('Unexpected power image')};
const visible=()=>ctx.getImageData(0,0,1280,640).data.some((v,i)=>i%4===3&&v>0);
for(const dir of [-1,1]){
 b.dir=dir;run("player=make(51,640,dir,true);enemy=make(9,640-dir*200,-dir);effect={id:1,owner:player,kind:'projectile',artKey:'ultimate',castId:77,name:'Stellar overdrive',x:640+dir*160,y:300,r:24,vx:600*dir,vy:0,dir,life:2.38,maxLife:2.4};");
 ctx.clearRect(0,0,1280,640);run('drawShot(ctx,effect)');assert(visible());
 const pixels=ctx.getImageData(0,0,1280,640).data;
 for(let y=0;y<640;y++)for(let x=0;x<1280;x++)if(pixels[(y*1280+x)*4+3])assert(Math.abs(x-b.effect.x)<80,'Wake covers the path back to the caster');
 run("effect={...effect,kind:'beam',x:640,y:300,length:300,r:20,life:.15,maxLife:.18};");
 ctx.clearRect(0,0,1280,640);run('drawEffect(ctx,effect)');assert(visible());
 run('effect.hit=true;effect.impactX=640-dir*20;effect.impactY=300');ctx.clearRect(0,0,1280,640);run('drawEffect(ctx,effect)');assert(!visible(),'Beam reversed behind the hand');
 run("effect.hit=false;effect2={...effect,id:2};effects=[effect,effect2]");ctx.clearRect(0,0,1280,640);run('drawEffect(ctx,effect)');assert(!visible(),'Damage ticks duplicate the visible stream');
 run('drawEffect(ctx,effect2)');assert(visible());
 // A second combatant must not suppress or inherit the first combatant's beam.
 run("enemy.config={type:'fire',light:'#ff9b38'};enemy.villain=0;enemy.dir=-dir;effect3={...effect2,id:3,owner:enemy,dir:-dir,x:640-dir*100,length:200};effects.push(effect3)");
 assert.equal(run('animatedPowerStyle(effect3).theme'),'fire');ctx.clearRect(0,0,1280,640);run('drawEffect(ctx,effect2)');assert(visible(),'Other owner suppressed player beam');
 ctx.clearRect(0,0,1280,640);run('drawEffect(ctx,effect3)');assert(visible(),'Villain beam missing');
 run('effects=[]');
}
console.log('Passed: compact projectile wakes, both directions, no reversed beams, one stream per cast, separate opposing streams and correct villain element.');
