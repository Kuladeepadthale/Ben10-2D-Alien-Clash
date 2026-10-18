const {createCanvas,loadImage}=require('@napi-rs/canvas'),fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 const cv=createCanvas(800,450),ctx=cv.getContext('2d'),b=vm.createContext({Math,WeakMap,Promise,Error,floor:345,loadClassicImage:p=>loadImage('web/'+p),drawAlien(){throw Error('Unexpected fallback')}});
 for(const p of ['web/data.js','web/heatblast-smooth-data.js','web/heatblast-poses.js'])vm.runInContext(fs.readFileSync(p,'utf8'),b);
 if(!await vm.runInContext('heatblastPoseReady',b))throw Error('Atlas loading failed');
 b.ctx=ctx;b.f={id:0,x:400,y:345,dir:1,hp:100,moving:false,walk:0,vy:0,stun:0};
 const attacks=[{at:9.5,key:'normal',kind:'melee',windup:.12,duration:.08,recovery:.22},{at:10.3,key:'normal',kind:'melee',windup:.12,duration:.08,recovery:.22},{at:11.1,key:'skill0',kind:'projectile',windup:.32,duration:.08,recovery:.4},{at:12.5,key:'skill1',kind:'beam',windup:.5,duration:.55,recovery:.4},{at:14.7,key:'skill2',kind:'eruption',windup:.65,duration:.08,recovery:.4},{at:16.5,key:'ultimate',kind:'rain',windup:.8,duration:2.4,recovery:.4}];
 const path='tmp/heatblast-v21-review';fs.mkdirSync(path,{recursive:true});
 for(let n=0;n<2880;n++){
  const t=n/120,f=b.f,fw=t>=1.5&&t<3.5,bw=t>=4&&t<6;f.moving=fw||bw;f.y=345;f.vy=0;f.cast=null;f.jumpWindup=0;f.block=t>=6.5&&t<7.25;f.stun=t>=20.5&&t<20.72?.22:0;f.hp=t>=21.5?0:100;f.dir=t>=10&&t<11? -1:1;
  let label=fw?'FORWARD WALK':bw?'BACKWARD WALK':f.block?'GUARD':f.stun?'HIT / RECOVERY':f.hp<=0?'KNOCKDOWN / HOLD':'IDLE / SETTLE';
  if(f.moving){f.x+=(fw?1:-1)*270/120;f.walk+=(fw?1:-1)*12/120;}
  const jump=t-7.8;if(jump>=0&&jump<1.1){label='JUMP / LAND';if(jump<.07)f.jumpWindup=.07-jump;else{const a=jump-.07;f.y=Math.min(345,345-520*a+600*a*a);f.vy=-520+1200*a;}}
  for(const a of attacks){const e=t-a.at;if(e>=0&&e<a.windup+a.duration+a.recovery){f.cast={key:a.key,ultimate:a.key==='ultimate',elapsed:e,cfg:a};label=a.key==='normal'?'NORMAL ATTACK':a.key==='skill0'?'FIREBALL':a.key==='skill1'?'FLAME JET':a.key==='skill2'?'ERUPTION':'INFERNO STORM';}}
  b.t=t;
  if(n%4===0){
   ctx.fillStyle='#14252b';ctx.fillRect(0,0,800,450);ctx.strokeStyle='#67818c55';ctx.beginPath();ctx.moveTo(20,345);ctx.lineTo(780,345);ctx.stroke();
   const shift=((400-f.x)%70+70)%70;for(let x=shift;x<800;x+=70){ctx.beginPath();ctx.moveTo(x,345);ctx.lineTo(x-18,365);ctx.stroke();}
   ctx.save();ctx.translate(400-f.x,0);vm.runInContext('drawAlien(ctx,f,t)',b);ctx.restore();
   ctx.textAlign='center';ctx.fillStyle='#f5dc8e';ctx.font='bold 21px sans-serif';ctx.fillText(label,400,405);ctx.fillStyle='#b3cad3';ctx.font='15px sans-serif';ctx.fillText('HEATBLAST 2.1 - ORIGINAL ARTWORK / SMOOTHER POSE TRANSITIONS',400,30);ctx.font='13px sans-serif';ctx.fillText('Animation playback at gameplay timing - combat effects are in the APK',400,430);
   fs.writeFileSync(path+'/'+String(n/4).padStart(4,'0')+'.png',cv.toBuffer('image/png'));
  }else vm.runInContext('heatblastPoseFrame(f,t)',b);
 }
 console.log('Rendered 720 frames / 24 seconds using the production Heatblast renderer and combat timings.');
})().catch(e=>{console.error(e);process.exit(1)});
