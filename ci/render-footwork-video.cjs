const fs=require('fs'),vm=require('vm'),{spawn}=require('child_process'),{createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{
 const b=vm.createContext({assert:require("assert/strict"),console,Math,Map,WeakMap,Promise,Uint8ClampedArray,Float32Array,document:{createElement:()=>createCanvas(256,256)},floor:510,W:1280,drawAlien(){},loadClassicImage:p=>loadImage('web/'+p),settings:{quality:'high'},mode:'fight',uid:0,profile:{aliens:Array.from({length:10},()=>({loadout:[0,1],levels:{}}))},effects:[],particles:[],sound(){},burst(){},renderReport(){},floating:[],totals:{dealt:0,taken:0,blocked:0,hits:0},combo:0,comboTime:0,clock:90,report:[],shake:0,flash:0,hitStop:0});
 for(const p of ['data.js','heatblast-smooth-data.js','heatblast-poses.js','alien-poses-data.js','alien-poses.js','footwork.js'])vm.runInContext(fs.readFileSync('web/'+p,'utf8'),b);
 if(!await vm.runInContext('allAlienPosesReady',b))throw Error('Artwork did not load');
 const checks=fs.readFileSync('ci/check-footwork-dash.cjs','utf8');vm.runInContext(checks.slice(checks.indexOf('function declaration'),checks.indexOf('const b=vm')),b);
 const game=fs.readFileSync('web/game.js','utf8');b.game=game;vm.runInContext('const DASH_DURATION=.22,DASH_DISTANCE=190,DASH_COOLDOWN=1.25;',b);
 for(const name of ['make','other','dash','updateDash','updateF','body','receiveHit']){b.fn=name;vm.runInContext('eval(declaration(game,fn))',b);}
 vm.runInContext('player=make(0,350,1);enemy=make(2,1100,-1);grid=[0,1,2,3,4,5,6,8].map((id)=>make(id,0,1));',b);
 fs.mkdirSync('previews',{recursive:true});
 const cv=createCanvas(1920,1080),ctx=cv.getContext('2d');b.ctx=ctx;
 const ff=spawn('ffmpeg',['-y','-f','rawvideo','-pix_fmt','rgba','-s','1920x1080','-r','60','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',process.env.FOOTWORK_PREVIEW_PATH||'previews/Alien-Clash-Footwork-Dash.mp4'],{stdio:['pipe','ignore','inherit']});
 let stage=-1,castAt=-1;
 for(let i=0;i<1080;i++){
  const t=i/60,newStage=t<5?0:t<8?1:t<11?2:t<14?3:4;b.t=t;
  if(newStage!==stage){stage=newStage;vm.runInContext('player=make(0,350,1)',b);}
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0d1c27';ctx.fillRect(0,0,1920,1080);ctx.scale(1.5,1.5);
  ctx.fillStyle='#72efb5';ctx.font='bold 17px sans-serif';ctx.fillText('ALIEN CLASH / MOVEMENT PREVIEW',48,47);
  const titles=['DISTANCE-DRIVEN FOOTWORK','FORWARD WALK','BACKWARD WALK','JUMP & LAND','FORWARD DODGE DASH'];ctx.fillStyle='white';ctx.font='bold 32px sans-serif';ctx.fillText(titles[stage],48,95);
  ctx.fillStyle='#a3bacb';ctx.font='17px sans-serif';ctx.fillText(stage===4?'0.22-second dodge window • 1.25-second cooldown • Shift / E / mobile Dash':'Support foot stays on the ground while the opposite foot swings forward',48,128);
  if(stage===0){
   for(let n=0;n<8;n++){b.n=n;const f=vm.runInContext('grid[n]',b);f.x+=2.5;f.moving=true;const x=80+(n%4)*310,y=165+Math.floor(n/4)*250,scale=.66;ctx.save();ctx.translate(x,y);ctx.fillStyle='#142b37';ctx.fillRect(0,0,280,235);ctx.save();ctx.translate(140-f.x*scale,200-510*scale);ctx.scale(scale,scale);ctx.strokeStyle='#2e5867';ctx.lineWidth=1;for(let gx=Math.floor((f.x-250)/45)*45;gx<f.x+250;gx+=45){ctx.beginPath();ctx.moveTo(gx,510);ctx.lineTo(gx,550);ctx.stroke();}b.f=f;vm.runInContext('drawAlien(ctx,f,t)',b);ctx.restore();ctx.fillStyle='#c1dfd1';ctx.font='16px sans-serif';ctx.fillText(vm.runInContext('aliens[f.id].name',b),12,225);ctx.restore();}
  }else{
   const f=b.player;f.moving=stage===1||stage===2;f.vy=0;f.y=510;f.jumpWindup=0;
   if(stage===1)f.x=350+(t-5)*180;if(stage===2)f.x=890-(t-8)*180;
   if(stage===3){const u=(t-11)%1.4;if(u<.07)f.jumpWindup=.07-u;else{const a=u-.07;f.y=Math.min(510,510-520*a+600*a*a);f.vy=f.y<510?-520+1200*a:0;}}
   if(stage===4){const count=Math.floor((t-14)/1.5);if(count!==castAt){castAt=count;vm.runInContext('dash(player)',b);}vm.runInContext('updateF(player,1/60)',b);}
   ctx.fillStyle='#18323d';ctx.fillRect(0,510,1280,210);ctx.strokeStyle='#31545d';ctx.lineWidth=1;for(let x=0;x<1280;x+=45){ctx.beginPath();ctx.moveTo(x,510);ctx.lineTo(x,720);ctx.stroke();}ctx.strokeStyle='#79edb4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,510);ctx.lineTo(1280,510);ctx.stroke();
   ctx.fillStyle='#06111a';ctx.beginPath();ctx.ellipse(f.x,514,65,8,0,0,Math.PI*2);ctx.fill();vm.runInContext('drawAlien(ctx,player,t)',b);
   if(stage===4){const active=!!f.dash;ctx.fillStyle=active?'#83ffca':'#a6c1cf';ctx.font='bold 24px sans-serif';ctx.fillText(active?'DODGE ACTIVE':'DASH COOLDOWN '+Math.max(0,f.dashCooldown).toFixed(1)+'s',48,620);if(active){const damage=vm.runInContext("receiveHit(enemy,player,100,'Preview incoming attack')",b);if(damage!==0)throw Error('Dash protection failed');ctx.fillStyle='#ffcc71';ctx.beginPath();ctx.arc(f.x+50,400,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#83ffca';ctx.font='18px sans-serif';ctx.fillText('ATTACK DODGED',f.x+75,405);}}
  }
  ctx.fillStyle='#88a7b5';ctx.font='15px sans-serif';ctx.fillText('1080p / 60 fps • Updated animation code • Existing character artwork',48,704);
  const raw=ctx.getImageData(0,0,1920,1080).data;if(!ff.stdin.write(Buffer.from(raw.buffer,raw.byteOffset,raw.byteLength)))await new Promise(r=>ff.stdin.once('drain',r));
  if(process.env.FOOTWORK_STILLS&&(i===120||i===390))fs.writeFileSync('../Footwork-video-'+i+'.png',cv.toBuffer('image/png'));
 }
 ff.stdin.end();await new Promise((resolve,reject)=>ff.on('exit',code=>code?reject(Error('ffmpeg '+code)):resolve()));console.log('18-second 1080p60 preview rendered.');
})().catch(e=>{console.error(e);process.exit(1)});
