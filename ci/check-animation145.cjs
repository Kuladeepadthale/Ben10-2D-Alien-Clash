const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const names=['snare-oh','upchuck','arctiguana','spitter','lodestar','water-hazard','armodrillo','nrg'];
const characters=names.map(n=>JSON.parse(fs.readFileSync('ci/animation-review/characters/'+n+'/revision.json','utf8')).character);
const nodes={alienSpecies:{after(node){nodes[node.id]=node;}}};
const b=vm.createContext({characters,selected:0,renderAlienInfo(){return 'rendered';},
 document:{getElementById:id=>nodes[id]||null,createElement:()=>({style:{}})},
 celPhase:()=>({legacy:true})});
vm.runInContext(fs.readFileSync('web/data.js','utf8')+fs.readFileSync('web/cel-data.js','utf8'),b);
vm.runInContext('for(const c of characters)CEL_DATA.characters[c.id]=c;',b);
vm.runInContext(fs.readFileSync('web/animation144.js','utf8'),b);
const run=s=>vm.runInContext(s,b);
assert.equal(run('Object.keys(ANIMATION144).length'),16);
let checks=0;
for(const c of characters){
 b.id=c.id;assert.equal(run('aliens[id].name'),run('ANIMATION144[id].name'));
 assert.equal(run('ANIMATION144[id].revision'),145);
 for(const dir of [-1,1])for(const key of ['normal','skill0','skill1','skill2','ultimate']){
  Object.assign(b,{dir,key});
  run(`cfg=key==='normal'?{kind:'melee',windup:.2,duration:.2,recovery:.3}:key==='ultimate'?aliens[id].ultimate:aliens[id].skills[+key.slice(-1)];
   f={id,hp:100,x:300,y:510,dir,cast:{dir,key,cfg,elapsed:0,ultimate:key==='ultimate'}};`);
  const special=run("['rush','pounce','leapslam'].includes(cfg.kind)||id===15&&key==='skill2'||id===20&&key==='skill2'||id===19&&key==='ultimate'");
  const wind=run('cfg.windup'),duration=run('cfg.castDuration??cfg.duration??.08'),recovery=run('cfg.recovery||0');
  for(let i=0;i<=60;i++){
   b.elapsed=(wind+duration+recovery)*i/60;
   run('f.cast.elapsed=elapsed');const snapshot=run('JSON.stringify(f)');
   const p=run('celPhase(f,key,elapsed)');
   assert.equal(run('JSON.stringify(f)'),snapshot,'Playback changed simulation state');
   if(special)assert.ok(p.legacy);
   else{assert.equal(p.animationRevision,145);assert.ok(c.frames.includes(p.frame),'Pose must be from this alien');assert.ok(c.clips[key].includes(c.frames.indexOf(p.frame)),'Keep the ability own native clip');}
   checks++;
  }
  if(!special){
   run('f.cast.elapsed=Math.max(0,cfg.windup-.00001)');assert.equal(run('celPhase(f,key,0).index'),0);
   run('f.cast.elapsed=cfg.windup');assert.equal(run('celPhase(f,key,0).index'),1);
  }
 }
 for(const extra of ['f.hp=0','f.stun=1','f.block=true','f.villain=0']){
  run("f={id,hp:100,cast:{key:'normal',elapsed:.3,cfg:{kind:'melee',windup:.2,duration:.2,recovery:.3}}}");run(extra);assert.ok(run("celPhase(f,'normal',0).legacy"));
 }
 for(const state of ['walk','jump','guard','hit','ko','idle','dash']){b.state=state;assert.ok(run('celPhase(f,state,0).legacy'));}
 b.selected=c.id;assert.equal(run('renderAlienInfo()'),'rendered');
 assert.equal(nodes.animationRevision.textContent,'Animation 14.5 · combat timing');assert.equal(nodes.animationRevision.hidden,false);
}
b.selected=1;run('renderAlienInfo()');assert.equal(nodes.animationRevision.textContent,'Animation 14.4 · combat timing');
b.selected=0;run('renderAlienInfo()');assert.equal(nodes.animationRevision.hidden,true);assert.equal(nodes.animationRevision.textContent,'');
// Two-cel repeated attacks retract to their own preparation cel.
assert.equal(run("animation144Index({id:37,cast:{elapsed:.37,cfg:{kind:'melee',windup:.2,duration:.4,recovery:.2,ticks:2}}},'skill0',[1,2])"),0);
assert.ok(fs.readFileSync('web/index.html','utf8').includes('animation144.js?v=145'));
console.log('Animation 14.5 passed:',checks,'native pose samples for eight aliens, both directions, phase boundaries, saved-state immutability and detail identifiers.');
