const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const box=vm.createContext({celPhase:()=>({legacy:true}),floor:510});
vm.runInContext(fs.readFileSync('web/data.js','utf8')+fs.readFileSync('web/cel-data.js','utf8'),box);
vm.runInContext(fs.readFileSync('web/animation144.js','utf8'),box);
vm.runInContext(`
globalThis.run=(id,kind,n,elapsed,ticks=1)=>animation144Index({id,cast:{elapsed,cfg:{kind,windup:.3,duration:.6,recovery:.4,ticks}}},'normal',Array.from({length:n},(_,i)=>i));
globalThis.pick=(id,state,elapsed,extra={})=>celPhase({id,hp:100,cast:{elapsed,cfg:{kind:'melee',windup:.3,duration:.6,recovery:.4}},...extra},state,0);
globalThis.ids=Object.keys(ANIMATION144).map(Number);
`,box);
let checks=0;
for(const id of box.ids){
 for(const kind of ['melee','beam','projectile','spikes','wave','ground','vortex'])for(const n of [2,3,4]){
  assert.equal(box.run(id,kind,n,.299),0);assert.equal(box.run(id,kind,n,.3),1);checks+=2;
  for(let i=0;i<=140;i++){const frame=box.run(id,kind,n,i/100,4);assert.ok(Number.isInteger(frame)&&frame>=0&&frame<n);checks++;}
  assert.equal(box.run(id,kind,n,1.31),n-1);checks++;
 }
}
assert.equal(box.run(1,'melee',4,.91),2);
assert.equal(box.run(1,'melee',4,1.29),3);
assert.notEqual(box.run(1,'melee',4,.32,4),box.run(1,'melee',4,.42,4));
assert.equal(box.run(6,'beam',4,.88,4),1);
for(const id of [1,2,3,6,7,9]){
 const p=box.pick(id,'normal',.32);assert.equal(p.animationRevision,144);assert.ok(p.frame.rect);checks++;
 for(const extra of [{hp:0},{stun:1},{block:true},{villain:0}])assert.ok(box.pick(id,'normal',.32,extra).legacy);
}
assert.ok(box.pick(0,'normal',.32).legacy);
assert.ok(box.pick(4,'normal',.32).legacy);
assert.ok(box.pick(5,'normal',.32).legacy);
assert.ok(box.pick(8,'normal',.32).legacy);
assert.ok(box.pick(1,'walk',.32).legacy);
assert.ok(box.pick(1,'jump',.32).legacy);
// Source ordering ensures the final state renderer and detail page exist first.
const html=fs.readFileSync('web/index.html','utf8');
assert.ok(html.indexOf('animation144.js')>html.indexOf('rewards-actors143.js'));
assert.equal((html.match(/src="animation144.js/g)||[]).length,1);
console.log('Animation 14.4 passed:',checks,'timing/frame checks, defensive-state and preserved-character checks.');
