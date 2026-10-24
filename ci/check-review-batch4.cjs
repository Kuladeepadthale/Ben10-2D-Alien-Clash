const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{harness}=require('./cel-harness.cjs');const b=harness({metadataOnly:true}),r=s=>vm.runInContext(s,b);
for(const id of [41,42,43,44]){b.id=id;const d=r('CEL_DATA.characters[id]');assert(d.reviewedRevision);assert.equal(d.frames.length,32);const rec=JSON.parse(fs.readFileSync(`ci/animation-review/characters/${d.name}.json`));assert.equal(rec.status,'verified_updated');assert(rec.checks.passed);assert.deepEqual([rec.renderHeight,rec.scale],Array.from(r('[aliens[id].renderHeight,aliens[id].scale]')));
 const idle=d.frames[d.clips.idle[0]];assert(idle.rect[3]-16>=300);assert(d.sheets.every(s=>s.src.startsWith('assets/reviewed-native/')));
 for(let slot=0;slot<4;slot++){b.slot=slot;const rows=r('POWER_PROFILES.aliens[id][slot].phases');for(const point of rows){const f=d.frames[point.frame],scale=rec.renderHeight*rec.scale/f.referenceHeight;assert(Math.abs((point.pixel[0]-f.origin[0])*scale-point.offset[0])<.002);assert(Math.abs((point.pixel[1]-f.origin[1])*scale-point.offset[1])<.002);}}
}

b.id=41;r("player=make(41,640,1,true);player.cast={key:'skill1',cfg:{phase:true,windup:.3,duration:.6,recovery:.3,ticks:3},elapsed:.4}");const before=JSON.stringify(b.player);const alpha=r('chamalienCloakAlpha(player)');assert(alpha>=.55&&alpha<=.76);assert.equal(r('chamalienCloakAlpha(player,true)'),1);assert.equal(JSON.stringify(b.player),before);r('player.hp=0');assert.equal(r('chamalienCloakAlpha(player)'),1);
assert.deepEqual(Array.from(r('CEL_DATA.characters[42].clips.skill2')),[22,23,21]);
const eat=r('CEL_DATA.characters[42]');assert.equal(eat.frames[12].referenceHeight,435);
for(const id of [43,44]){b.id=id;const p=r('POWER_PROFILES.aliens[id][0]');assert.equal(p.source,id===43?'chest':'weapon');assert.equal(p.phases.length,3);assert(p.phases.every(x=>x.pixel[0]>0&&x.pixel[1]>0));}
console.log('Passed batch4 coherent native models, launch registration, readable Chamalien cloak, and Eatle horn recovery/physical scale.');
