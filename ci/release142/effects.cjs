const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const {createCanvas}=require('@napi-rs/canvas');
const root=process.argv[2]||'builds/web';
const cv=createCanvas(1100,600),ctx=cv.getContext('2d');
const b=vm.createContext({console,Math,Number,Set,Map,time:.31,floor:510,effects:[],drawShot(){},drawEffect(){},drawPowerCharge(){},render(){},drawnAlienEmitter:f=>({x:f.x,y:f.y-70}),other:f=>({x:700,y:510}),body:f=>({y:f.y-100,h:100}),receiveHit:(from,to,amount)=>{const n=Math.min(to.hp,amount);to.hp-=n;return n;}});
for(const f of ['data.js','power-profiles.js','villain-data.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),b,{filename:f});
vm.runInContext(fs.readFileSync(path.join(root,'power-effects142.js'),'utf8'),b);
b.ctx=ctx;
const counts=vm.runInContext('({aliens:POWER_PROFILES.aliens.length,villains:POWER_PROFILES.villains.length})',b);
let profiles=0,frames=0;const themes=new Set();
for(const family of ['aliens','villains'])for(let id=0;id<counts[family];id++)for(let slot=0;slot<4;slot++)for(const dir of [-1,1]){
 b.family=family;b.id=id;b.slot=slot;b.dir=dir;
 vm.runInContext(`owner={id,x:dir===1?120:980,y:510,dir,config:family==='aliens'?aliens[id]:VILLAIN_DATA.characters[id].kit};if(family==='villains')owner.villain=id;profile=POWER_PROFILES[family][id][slot];event={owner,artKey:slot===3?'ultimate':'skill'+slot,name:profile.name,x:550,y:300,vx:dir*400,vy:0,dir,rayDir:dir,r:22,life:.4,maxLife:.7,delay:0,length:dir===1?350:350,endY:300,height:160,castId:1};style=fx142Style(event);`,b);
 const theme=vm.runInContext('style.theme',b);themes.add(theme);assert(vm.runInContext('FX142_THEMES.has(style.theme)',b));
 for(const kind of ['projectile','wave','lob','rain','ground','beam','explosion','spike','eruption','trap','vortex','melee']){
  ctx.clearRect(0,0,1100,600);b.kind=kind;
  vm.runInContext(`event.kind=kind;event.hit=kind==='melee';if(kind==='beam'){event.x=dir===1?120:980;event.y=300;}else event.x=550;snap=JSON.stringify(event);if(['projectile','wave','lob','rain','ground'].includes(kind))drawShot(ctx,event);else drawEffect(ctx,event);if(JSON.stringify(event)!==snap)throw Error('renderer mutated attack');`,b);
  assert.equal(ctx.globalAlpha,1,'alpha leaked');assert.deepEqual(['a','b','c','d','e','f'].map(k=>ctx.getTransform()[k]),[1,0,0,1,0,0]);frames++;
 }
 vm.runInContext(`drawPowerCharge(ctx,owner,{key:slot===3?'ultimate':'skill'+slot,cfg:{name:profile.name,kind:'projectile',windup:.3},elapsed:.2,dir});`,b);
 profiles++;
}
vm.runInContext(`a={id:0,config:aliens[0]},target={hp:100,x:700,y:510};if(receiveHit(a,target,27,'Fireball')!==27||target.hp!==73)throw Error('damage changed');for(let i=0;i<30;i++){target.hp=100;receiveHit(a,target,1,'Fireball');}if(FX142_IMPACTS.length!==24)throw Error('unbounded impacts');`,b);
assert.equal(profiles,1136);assert.equal(themes.size,20);
const report={aliens:counts.aliens,villains:counts.villains,profiles:profiles/2,facingDirections:2,renderChecks:frames,themes:[...themes].sort(),damagePreserved:true,renderStatePreserved:true};
fs.mkdirSync('release-output',{recursive:true});fs.writeFileSync('release-output/power-effects142-coverage.json',JSON.stringify(report,null,2));console.log(report);
