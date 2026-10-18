const fs=require('fs'),vm=require('vm'),{createCanvas,loadImage}=require('@napi-rs/canvas');
function declaration(src,name){const start=src.indexOf('function '+name+'(');if(start<0)throw Error(name);let i=src.indexOf('{',start)+1,n=1,q=null,esc=false;for(;i<src.length&&n;i++){const c=src[i];if(q){if(esc)esc=false;else if(c==='\\')esc=true;else if(c===q)q=null}else if(c==='"'||c==="'"||c==='`')q=c;else if(c==='{')n++;else if(c==='}')n--;}return src.slice(start,i)}
function harness(){const nodes={opponent:{value:'2'},launchStatus:{textContent:''}};
 const box=vm.createContext({console,Math,Map,Set,WeakMap,Promise,Uint8ClampedArray,Float32Array,Number,Image:require('@napi-rs/canvas').Image,loadClassicImage:p=>loadImage('web/'+p),drawAlien(){},classicReady:Promise.resolve(true),floor:510,W:1280,H:640,mode:'menu',uid:0,profile:{aliens:Array.from({length:22},()=>({loadout:[0,1],levels:{}}))},effects:[],particles:[],shots:[],floating:[],report:[],totals:{dealt:0,taken:0,blocked:0,hits:0},combo:0,comboTime:0,clock:90,shake:0,flash:0,hitStop:0,time:0,selected:0,imported:{},$:id=>nodes[id],resetInputs(){},begin(){box.mode='fight';},sound(){},burst(){},renderReport(){},announce(){}});
 for(const file of ['data.js','cel-data.js','cartoon-gaits.js'])vm.runInContext(fs.readFileSync('web/'+file,'utf8'),box,{filename:file});
 vm.runInContext("const DASH_DURATION=.22,DASH_DISTANCE=190,DASH_COOLDOWN=1.25;",box);
 const game=fs.readFileSync('web/game.js','utf8');for(const name of ['make','baseNormal','damageValue','other','cast','body','spawnAttack','updateF','receiveHit','move','jump','dash','updateDash'])vm.runInContext(declaration(game,name),box);
 vm.runInContext(fs.readFileSync('web/cel-player.js','utf8'),box,{filename:'cel-player.js'});
 box.cv=createCanvas(1280,640);box.ctx=box.cv.getContext('2d');return box;
}
module.exports={harness,declaration};

