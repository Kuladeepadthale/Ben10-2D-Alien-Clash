const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function declaration(src,name){let start=src.indexOf('function '+name+'(');assert(start>=0,name);let brace=src.indexOf('{',start),level=1,quote=null,escape=false,i=brace+1;for(;i<src.length&&level;i++){const c=src[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote=null;}else if(c==='"'||c==="'"||c==='`')quote=c;else if(c==='{')level++;else if(c==='}')level--;}return src.slice(start,i);}
const b=vm.createContext({console,Math,Map,WeakMap,Float32Array,Uint8ClampedArray,drawAlien(){},floor:510,W:1280,mode:'fight',uid:0,profile:{aliens:Array.from({length:10},()=>({loadout:[0,1],levels:{}}))},effects:[],particles:[],shots:[],time:0,sound(){},burst(){},renderReport(){},floating:[],totals:{dealt:0,taken:0,blocked:0,hits:0},combo:0,comboTime:0,clock:90,report:[],shake:0,flash:0,hitStop:0});
vm.runInContext(fs.readFileSync('web/data.js','utf8'),b);
vm.runInContext(fs.readFileSync('web/footwork.js','utf8'),b);
for(const dir of [1,-1])for(const scale of [.6,1,1.8]){
 let anchor;
 for(let i=0;i<60;i++){b.p=i/100;b.dir=dir;b.scale=scale;const result=vm.runInContext('footworkCycle(p,120,14)',b);assert(result.planted);const world=dir*(b.p*120+result.x)*scale;if(anchor===undefined)anchor=world;assert(Math.abs(world-anchor)<1e-9,'support foot slid');}
 const start=vm.runInContext('footworkCycle(.6,120,14)',b),end=vm.runInContext('footworkCycle(1,120,14)',b);assert(Math.abs(start.y)<1e-10&&Math.abs(end.y)<1e-10);
}
for(let i=0;i<100;i++){b.target=[-30+i*.7,85];const a=vm.runInContext('footworkIK([0,0],target,55,55,-1)',b);assert(Math.abs(Math.hypot(...a.knee)-55)<1e-8);assert(Math.abs(Math.hypot(a.ankle[0]-a.knee[0],a.ankle[1]-a.knee[1])-55)<1e-8);}
const game=fs.readFileSync('web/game.js','utf8');vm.runInContext('const DASH_DURATION=.22,DASH_DISTANCE=190,DASH_COOLDOWN=1.25;',b);
for(const name of ['make','other','dash','updateDash','updateF','body','receiveHit','move','jump'])vm.runInContext(declaration(game,name),b);
for(const dir of [1,-1])for(const fps of [30,60,120]){
 vm.runInContext('player=make(0,640,'+dir+');enemy=make(2,1000,-1);f=player;',b);assert(vm.runInContext('dash(f)',b));assert(!vm.runInContext('dash(f)',b));
 const hp=b.f.hp;for(let i=0;i<Math.ceil(.22*fps)-1;i++){b.dt=1/fps;vm.runInContext('updateF(f,dt)',b);if(b.f.dash)assert.equal(vm.runInContext("receiveHit(enemy,f,100,'Dodge test')",b),0);}
 while(b.f.dash)vm.runInContext('updateF(f,1/120)',b);assert(Math.abs(b.f.x-(640+dir*190))<1e-8);assert.equal(b.f.hp,hp);assert(!vm.runInContext('dash(f)',b));
 assert(vm.runInContext("receiveHit(enemy,f,100,'After dodge')",b)>0);vm.runInContext('f.stun=0;for(let i=0;i<160;i++)updateF(f,1/120)',b);assert(vm.runInContext('dash(f)',b));
}
for(const patch of [{y:400},{stun:.1},{block:true},{hp:0},{jumpWindup:.07},{cast:{cfg:{windup:1}}}]){vm.runInContext('player=make(0,640,1);f=player',b);Object.assign(b.f,patch);assert(!vm.runInContext('dash(f)',b));}
for(const [x,dir,end]of [[1200,1,1215],[80,-1,65]]){vm.runInContext('player=make(0,'+x+','+dir+');f=player;dash(f);updateDash(f,.22)',b);assert.equal(b.f.x,end);}
console.log('Passed: exact stance contact in both directions at three scales, IK bone lengths, 30/60/120Hz dash distance, dodge immunity and expiry, cooldown, invalid-state rejection and arena edges.');
