const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const heat=fs.readFileSync('web/heatblast-poses.js','utf8'),game=fs.readFileSync('web/game.js','utf8');
const context=vm.createContext({floor:500,Math,Number,aliens:Array.from({length:10},()=>({speed:200})),W:1200,particles:[]});
vm.runInContext(heat.slice(heat.indexOf('function locomotionSample'),heat.indexOf('const heatblastRenderState')),context);
vm.runInContext(game.slice(game.indexOf('function move('),game.indexOf('\n',game.indexOf('function move('))),context);
for(let id=0;id<10;id++){
 const stride=id===3?1.05:id===4?1:1.1;
 for(let n=-720;n<=720;n++){
  context.f={id,walk:n/60,x:400,y:500,dir:1,hp:100,moving:true};
  const s=vm.runInContext('locomotionSample(f)',context);
  assert(s.frame>=6&&s.frame<=11&&s.next>=6&&s.next<=11);
  assert(s.blend>=0&&s.blend<=1);
 }
 // Blend weights converge to the identical authored key at every seam, both ways.
 for(let key=-12;key<=12;key++){
  context.f={id,walk:(key-1e-6)*stride};const before=vm.runInContext('locomotionSample(f)',context);
  context.f.walk=(key+1e-6)*stride;const after=vm.runInContext('locomotionSample(f)',context);
  assert.equal(before.next,after.frame);assert(before.blend>1-1e-9&&after.blend<1e-9);
 }
 context.f={id,x:400,y:500,dir:1,walk:0,hp:100};
 vm.runInContext('move(f,1,1/120)',context);const forward=context.f.walk;assert(forward>0);
 vm.runInContext('move(f,-1,1/120)',context);assert(Math.abs(context.f.walk)<1e-12);
 context.f.dir=-1;vm.runInContext('move(f,1,1/120)',context);assert(context.f.walk<0);
 context.f.x=1135;context.f.walk=0;context.f.moving=false;
 vm.runInContext('move(f,1,1/120)',context);assert.equal(context.f.walk,0);assert.equal(context.f.moving,false);
}
console.log('All 10 aliens: continuous forward/backward cycles, loop seams and blocked movement passed.');
