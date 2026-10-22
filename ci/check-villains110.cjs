const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const {harness,declaration}=require('./cel-harness.cjs');
(async()=>{const b=harness(),run=s=>vm.runInContext(s,b);run(fs.readFileSync('web/villain-data.js','utf8'));run('const villainTextures=new Map(),villainCloseTextures=new Map(),villainPending=new Map();');const code=fs.readFileSync('web/threat-ladder.js','utf8');for(const name of ['villainEnsure','villainFrame','drawVillain'])run(declaration(code,name));
 const data=run('VILLAIN_DATA.characters');assert.equal(data.length,50);assert.equal(new Set(data.map(v=>v.slug)).size,50);assert.equal(data[29].name,'Vilgax');assert.equal(data[30].name,'Argit');assert.equal(data[49].name,'Malware');
 const manifest=JSON.parse(fs.readFileSync('web/assets/villains-expansion110/manifest.json'));assert.equal(manifest.new.length,20);assert.equal(manifest.close.length,14);
 for(const [path,sha]of Object.entries(manifest.sha256))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('web/assets/villains-expansion110/'+path)).digest('hex'),sha,path);
 let draws=0,closeHits=0,rangedBasics=0;
 for(let id=0;id<50;id++){
  b.id=id;await run('villainEnsure(id)');const d=data[id];if(d.kit.basicSkillIndex!==undefined)rangedBasics++;
  for(const dir of [-1,1])for(const key of ['normal','skill0','skill1','skill2','ultimate']){
   Object.assign(b,{dir,key});run("player=make(0,640,dir,true);player.villain=id;constD=VILLAIN_DATA.characters[id];player.config={...constD.kit,type:constD.type,name:constD.name,light:constD.color,renderHeight:constD.height,bodyHeight:constD.bodyHeight};cfg=key==='normal'?baseNormal(player):key==='ultimate'?player.config.ultimate:player.config.skills[Number(key.slice(5))];player.cast={id:70,key,dir,ultimate:key==='ultimate',elapsed:0,cfg};");
   if(key==='normal'&&d.kit.basicSkillIndex!==undefined)assert.notEqual(b.cfg.kind,'melee','Ranged basic became a punch');
   const wind=b.cfg.windup,active=b.cfg.duration||.08;
   for(const age of [0,wind*.5,wind+.001,wind+active*.7,wind+active+.01]){
    b.age=age;run('player.cast.elapsed=age');const before=JSON.stringify(b.player);b.ctx.clearRect(0,0,1280,640);run('drawVillain(ctx,player,time)');assert.equal(JSON.stringify(b.player),before,'Renderer changed combat state');assert(b.ctx.getImageData(500,180,300,330).data.some((v,i)=>i%4===3&&v),'Blank fighter '+id+'/'+key);const point=run('drawnAlienEmitter(player,player.cast)');assert(Number.isFinite(point.x)&&Number.isFinite(point.y));draws++;
   }
   if(b.cfg.kind==='melee'&&d.closeFrames){
    for(let hit=0;hit<(b.cfg.ticks||1);hit++){
     b.age=wind+(hit+.05)*active/(b.cfg.ticks||1);run('player.cast.elapsed=age');const strike=run('villainFrame(player)');b.age=wind+(hit+.8)*active/(b.cfg.ticks||1);run('player.cast.elapsed=age');const retract=run('villainFrame(player)');assert(strike.closeCombat&&retract.closeCombat);assert.notDeepEqual(strike.rect,retract.rect);assert.equal(strike.referenceHeight,retract.referenceHeight);closeHits++;
    }
   }
  }
 }
 assert(rangedBasics>=30);console.log('Passed',draws,'real villain renders,',closeHits,'close strike/retraction contacts,',rangedBasics,'characteristic ranged basics, all 50 opponents, both facings and complete asset checksums.');
})().catch(e=>{console.error(e);process.exit(1)});
