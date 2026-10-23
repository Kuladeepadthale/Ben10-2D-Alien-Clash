// Real cast registration across both rosters, poses and facings.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {harness,declaration}=require('./cel-harness.cjs');
const b=harness({metadataOnly:true}),run=s=>vm.runInContext(s,b);
run(fs.readFileSync('web/villain-data.js','utf8'));
let count=0,ranged=0;
for(const villain of [false,true])for(let id=0;id<(villain?50:92);id++)for(const key of ['skill0','skill1','skill2','ultimate'])for(const dir of [-1,1]){
 Object.assign(b,{id,key,dir,villain});
 run("player=make(villain?0:id,640,dir,true);enemy=make(0,640-dir*300,-dir);if(villain){const d=VILLAIN_DATA.characters[id];player.villain=id;player.config={...d.kit,type:d.type,name:d.name,light:d.color,renderHeight:d.height||226,bodyHeight:d.bodyHeight||205,scale:1};}cfg=key==='ultimate'?(player.config||aliens[id]).ultimate:(player.config||aliens[id]).skills[Number(key.slice(5))];review=powerProfileFor(player,key);");
 assert(b.review&&b.review.source&&b.review.color,'Missing ability profile');assert.equal(b.review.name,b.cfg.name);
 for(const elapsed of [b.cfg.windup*.4,b.cfg.windup+.001,b.cfg.windup+(b.cfg.duration||.08)+.01]){
  b.elapsed=elapsed;
  run("player.cast={id:77,key,dir,elapsed,cfg,ultimate:key==='ultimate',damage:10,budget:{remaining:100}};pos=drawnAlienEmitter(player,player.cast);");
  assert(Number.isFinite(b.pos.x)&&Number.isFinite(b.pos.y));assert(b.pos.y<640&&b.pos.y>-100);
  const before=run('JSON.stringify(player)');run('drawnAlienEmitter(player,player.cast)');assert.equal(run('JSON.stringify(player)'),before);
  b.beforePos={...b.pos};run('enemy.x=640+dir*400;enemy.y=180');const after=run('drawnAlienEmitter(player,player.cast)');assert.equal(after.x,b.beforePos.x);assert.equal(after.y,b.beforePos.y);count++;
 }
 if(['beam','wave','projectile','lob'].includes(b.cfg.kind)){
  run("player.cast.elapsed=cfg.windup+.001;shots=[];effects=[];spawnAttack(player,player.cast,0);actual=cfg.kind==='beam'?effects.at(-1):(shots.at(-1)||effects.find(e=>e.sonicDeployment));pos=drawnAlienEmitter(player,player.cast)");
  assert.equal(b.actual.sonicDeployment?b.actual.launchX:b.actual.x,b.pos.x);assert.equal(b.actual.sonicDeployment?b.actual.launchY:b.actual.y,b.pos.y);if(b.actual.sonicDeployment)assert(b.actual.delay>0);
  assert.equal(b.actual.dir,dir);if(b.actual.vx)assert(b.actual.vx*dir>0);assert.equal(b.actual.powerSource,b.review.source);ranged++;
 }
}
// Fixed semantic requirements from the user's examples.
run("player=make(25,640,1,true);player.cast={key:'skill0',dir:1,elapsed:aliens[25].skills[0].windup+.001,cfg:aliens[25].skills[0]};p=powerProfileFor(player,player.cast);head=drawnAlienEmitter(player,player.cast)");
assert.equal(b.p.source,'eyes');assert.equal(b.p.color,'#91ff45');assert(b.p.twin);
assert(b.head.y<510-150,'Jetray ray must originate at head height, not the hand');
for(const [id,key,source]of [[6,'skill0','eye'],[17,'skill1','chest'],[19,'skill0','mouth'],[25,'skill2','tail'],[29,'skill0','tail'],[42,'skill0','mouth'],[43,'skill0','chest'],[63,'skill0','eyes']]){
 Object.assign(b,{id,key});assert.equal(run('powerProfileFor({id},key).source'),source);
}
const game=fs.readFileSync('web/game.js','utf8');assert(game.includes("if(s.powerSource==='tail'||s.powerSource==='weapon')drawShot(c,s);renderFighter(enemy)"),'Tail-launched shots must pass behind their own fighter');
for(const id of [20,41,67]){b.id=id;assert.equal(run("powerProfileFor({id},'skill2').motion"),'tail-strike');assert(run("new Set(CEL_DATA.characters[id].clips.skill2).size>=2"),'A tail strike needs distinct native poses');}
console.log('Passed '+count+' pose/side registrations and '+ranged+' real ranged launches across 72 aliens and 50 villains; Jetray eyes/green rays, chest/mouth/tail sources, native tail strikes and opponent independence.');


