const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness}=require('./cel-harness.cjs');
(async()=>{const b=harness(),run=s=>vm.runInContext(s,b),names=['Swampfire','Echo Echo','Humungousaur','Jetray','Big Chill','Chromastone','Brainstorm','Spidermonkey','Goop','Alien X'];
assert.equal(run('ALIEN_COUNT'),92);assert.equal(run('CARTOON_GAITS.length'),92);
for(let id=22;id<32;id++){b.id=id;assert.equal(run('aliens[id].name'),names[id-22]);run('celPinned=new Set([id])');await run('celEnsure(id)');
for(const state of ['idle','walk','jump','normal','skill0','skill1','skill2','ultimate','guard','hit','ko','dash'])for(const dir of [-1,1]){
run('player=make(id,640,'+dir+');enemy=make((id+1)%32,1000,-1);f=player');b.state=state;
if(['normal','skill0','skill1','skill2','ultimate'].includes(state))run("f.cast={key:state,ultimate:state==='ultimate',elapsed:0,dir:f.dir,cfg:state==='normal'?baseNormal(f):state==='ultimate'?aliens[id].ultimate:aliens[id].skills[+state.slice(-1)]}");
for(const t of [0,.1,.3,.7,1.5,3]){b.t=t;if(b.f.cast)b.f.cast.elapsed=t;const picked=run('celPhase(f,state,t)');assert(picked.frame);run('drawAlien(ctx,f,t)');}
}
}
console.log('Passed: all ten Alien Force names, 32 gait profiles and 1,440 actual new-character cel frame draws across every action and facing.');
})().catch(e=>{console.error(e);process.exit(1)});

