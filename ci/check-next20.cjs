// New characters must have complete native actions, distinct kits, unlocks, and a stable save boundary.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness}=require('./cel-harness.cjs');
(async()=>{
 const b=harness(),run=s=>vm.runInContext(s,b),designs=JSON.parse(fs.readFileSync('ci/cel-sources/next20-designs.json','utf8'));
 assert.equal(run('ALIEN_COUNT'),92);assert.equal(designs.length,20);assert.equal(run('CARTOON_GAITS.length'),92);
 for(let id=32;id<52;id++){
  b.id=id;assert.equal(run('aliens[id].name'),designs[id-32].name);assert.equal(run('aliens[id].skills.length'),3);
  run('celPinned=new Set([id])');await run('celEnsure(id)');
  assert.equal(run('CEL_DATA.characters[id].frames.length'),32);
  for(const action of ['idle','walk','jump','normal','skill0','skill1','skill2','ultimate','guard','hit','ko','dash']){
   b.action=action;
   for(const dir of [-1,1]){
    run(`player=make(id,640,${dir},true);enemy=make(0,900,-1);f=player;`);
    if(['normal','skill0','skill1','skill2','ultimate'].includes(action))run("f.cast={key:action,ultimate:action==='ultimate',elapsed:.4,dir:f.dir,cfg:action==='normal'?baseNormal(f):action==='ultimate'?aliens[id].ultimate:aliens[id].skills[+action.slice(-1)]}");
    const picked=run('celPhase(f,action,.4)');assert(picked.frame);run('drawAlien(ctx,f,.4)');
    if(b.f.cast){const p=run('drawnAlienEmitter(f,f.cast)');assert(Number.isFinite(p.x)&&p.y<510&&p.y>100);}
   }
  }
 }
 const s=fs.readFileSync('web/progression.js','utf8');assert(s.includes('id>=22&&id<32'));assert(s.includes("id:'new20'"));
 console.log('Passed: 20 new character identities, 640 complete native poses, 12 actions in both directions, emitters, and preserved collection boundaries.');
})().catch(e=>{console.error(e);process.exit(1)});

