const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness}=require('./cel-harness.cjs');
(async()=>{const b=harness(),run=s=>vm.runInContext(s,b);assert(await run('allAlienPosesReady'));
 const data=run('CEL_DATA');assert.equal(data.characters.length,32);const states=['idle','walk','jump','normal','skill0','skill1','skill2','ultimate','guard','hit','ko','dash'];let draws=0;
 for(let id=0;id<32;id++){b.id=id;run('celPinned=new Set([id,(id+1)%32])');await run('celEnsure(id)');
  const d=data.characters[id];assert.equal(d.clips.walk.length,8);assert(d.referenceHeight>(id<22?150:120));
  for(const [name,frames]of Object.entries(d.clips)){assert(frames.length>0,name);for(const ix of frames){const f=d.frames[ix],s=d.sheets[f.sheet];assert(f.rect[0]>=0&&f.rect[1]>=0&&f.rect[0]+f.rect[2]<=s.width&&f.rect[1]+f.rect[3]<=s.height);assert(f.origin.every(Number.isFinite));}}
  for(const state of states)for(const dir of [1,-1]){run('player=make(id,640,'+dir+');enemy=make((id+1)%32,1000,-1);f=player;');const f=b.f;
   if(state==='walk')f.moving=true;else if(state==='jump'){f.y=370;f.vy=-200}else if(state==='guard')f.block=true;else if(state==='hit')f.stun=.2;else if(state==='ko')f.hp=0;else if(state==='dash')f.dash={elapsed:.1,dir};else if(['normal','skill0','skill1','skill2','ultimate'].includes(state)){b.state=state;run("f.cast={key:state,ultimate:state==='ultimate',elapsed:0,dir:f.dir,cfg:state==='normal'?baseNormal(f):state==='ultimate'?aliens[id].ultimate:aliens[id].skills[+state.slice(-1)]}");}
   b.state=state;assert.equal(run('celState(f)'),state);
   for(const t of [0,.08,.2,.4,.8,1.4,2.2]){b.t=t;if(f.cast)f.cast.elapsed=t;f.x+=state==='walk'?17*dir:0;run('drawAlien(ctx,f,t)');const p=run('celPhase(f,state,t)');assert(p.frame);draws++;}
   if(f.cast){const pos=run('drawnAlienEmitter(f,f.cast)');assert(Number.isFinite(pos.x)&&Number.isFinite(pos.y)&&pos.y<510);}
  }
  // Actual cast and damage engine must still accept every power, including the unequipped third skill.
  for(const key of ['normal','skill0','skill1','skill2','ultimate']){b.key=key;run("mode='fight';player=make(id,370,1,true);enemy=make((id+1)%32,650,-1);player.ult=100;if(key==='skill2')player.loadout=[2,1];");assert(run("cast(player,key==='skill2'?'skill0':key)"));run('for(let step=0;step<500;step++){updateF(player,1/120);updateF(enemy,1/120)}');assert.equal(b.player.cast,null);}
 }
 // Distance phase does not advance on blocked movement or while standing still.
 run('player=make(0,640,1);f=player;f.moving=true');const a=run("celPhase(f,'walk',0).index");assert.equal(run("celPhase(f,'walk',10).index"),a);run('f.x+=60');assert.notEqual(run("celPhase(f,'walk',11).index"),a);
 run('celPinned=new Set([8,9])');await Promise.all([run('celEnsure(8)'),run('celEnsure(9)')]);run('celTrim()');assert.equal(run('celCache.size'),2);assert.equal(run('celPending.size'),0);
 assert(!fs.readFileSync('web/index.html','utf8').match(/alien-smooth|heatblast-smooth|diamondhead-puppet|footwork\.js/));
 console.log('Passed:',draws,'actual cel draws; all 32 aliens × 12 actions × both facings, all 160 attacks, bounds, emitters, distance cadence, and two-alien texture eviction.');
})().catch(e=>{console.error(e);process.exit(1)});


