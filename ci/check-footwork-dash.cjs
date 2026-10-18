const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function declaration(src,name){let start=src.indexOf('function '+name+'(');assert(start>=0,name);let brace=src.indexOf('{',start),level=1,quote=null,escape=false,i=brace+1;for(;i<src.length&&level;i++){const c=src[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote=null;}else if(c==='"'||c==="'"||c==='`')quote=c;else if(c==='{')level++;else if(c==='}')level--;}return src.slice(start,i);}
const b=vm.createContext({console,Math,Map,WeakMap,Float32Array,Uint8ClampedArray,drawAlien(){},floor:510,W:1280,mode:'fight',uid:0,profile:{aliens:Array.from({length:10},()=>({loadout:[0,1],levels:{}}))},effects:[],particles:[],shots:[],time:0,sound(){},burst(){},renderReport(){},floating:[],totals:{dealt:0,taken:0,blocked:0,hits:0},combo:0,comboTime:0,clock:90,report:[],shake:0,flash:0,hitStop:0});
vm.runInContext(fs.readFileSync('web/data.js','utf8'),b);
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
console.log('Passed: 30/60/120Hz dash distance, dodge immunity and expiry, cooldown, invalid-state rejection and arena edges.');

