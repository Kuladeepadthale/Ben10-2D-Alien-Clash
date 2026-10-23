// New identities must be complete native characters, not renamed/recolored roster entries.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness}=require('./cel-harness.cjs');
(async()=>{
 const b=harness(),run=s=>vm.runInContext(s,b),specs=JSON.parse(fs.readFileSync('ci/cel-sources/expansion100-designs.json','utf8'));
 assert.equal(run('ALIEN_COUNT'),92);assert.equal(specs.length,20);assert.equal(run('CARTOON_GAITS.length'),92);
 assert.equal(new Set(run('aliens.map(a=>a.name)')).size,92);
 for(let i=0;i<20;i++){
  b.id=i+52;assert.equal(run('aliens[id].name'),specs[i].name);assert.equal(run('aliens[id].skills.length'),3);
  run('celPinned=new Set([id])');await run('celEnsure(id)');
  const d=run('CEL_DATA.characters[id]');assert.equal(d.frames.length,32);assert.equal(d.sheets.length,4);assert(d.referenceHeight>=220,'Native idle detail '+specs[i].name);
  for(const action of ['idle','walk','jump','normal','skill0','skill1','skill2','ultimate','guard','hit','ko','dash'])for(const dir of [-1,1]){
   Object.assign(b,{action,dir});run('player=make(id,640,dir,true);enemy=make(0,950,-dir);f=player');
   if(['normal','skill0','skill1','skill2','ultimate'].includes(action))run("f.cast={id:72,key:action,ultimate:action==='ultimate',elapsed:.6,dir,cfg:action==='normal'?baseNormal(f):action==='ultimate'?aliens[id].ultimate:aliens[id].skills[Number(action.slice(5))]}");
   run('drawAlien(ctx,f,.6)');assert(run('!!celPhase(f,action,.6).frame'));
   if(b.f.cast){const e=run('drawnAlienEmitter(f,f.cast)');assert(Number.isFinite(e.x)&&e.y<510&&e.y>20);}
  }
 }
 const progression=fs.readFileSync('web/progression.js','utf8');assert(progression.includes('id>=32&&id<52'));assert(progression.includes('id>=52&&id<72'));assert(progression.includes("id:'new20ii'"));
 const icons=JSON.parse(fs.readFileSync('web/assets/ui/abilities/manifest.json','utf8'));assert.equal(icons.entries.length,460);assert.equal(icons.entries.filter(e=>e.alien>=52&&e.alien<72).length,100);
 console.log('Passed: 20 new identities, 640 detailed whole poses, all 12 action states in both facings, live emitters, 100 matching ability images and unchanged previous collection boundaries.');
})().catch(e=>{console.error(e);process.exit(1)});
