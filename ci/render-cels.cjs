const fs=require('fs'),vm=require('vm'),{spawn}=require('child_process'),{createCanvas}=require('@napi-rs/canvas'),{harness}=require('./cel-harness.cjs');
(async()=>{const b=harness(),run=s=>vm.runInContext(s,b);if(!await run('allAlienPosesReady'))throw Error('initial assets');fs.mkdirSync('previews',{recursive:true});
 const cv=createCanvas(1920,1080),ctx=cv.getContext('2d');b.ctx=ctx;
 const ff=spawn('ffmpeg',['-y','-f','rawvideo','-pix_fmt','rgba','-s','1920x1080','-r','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','previews/All-Aliens-Cel-Actions.mp4'],{stdio:['pipe','ignore','inherit']});ff.stdin.on('error',()=>{});
 const states=['idle','walk','jump','normal','skill0','skill1','skill2','ultimate','guard','hit','dash','ko'];
 for(let id=0;id<10;id++){b.id=id;run('celPinned=new Set([id])');await run('celEnsure(id)');
  for(let si=0;si<states.length;si++){const state=states[si],seconds=state==='walk'?2:state==='ultimate'?2.4:state==='jump'?1.2:1;b.state=state;run('player=make(id,480,1);enemy=make((id+1)%10,1000,-1);f=player;');const f=b.f;
   for(let i=0;i<Math.round(seconds*30);i++){const t=i/30;b.t=id*20+si*2+t;f.moving=state==='walk';f.block=state==='guard';f.stun=state==='hit'?.2:0;f.hp=state==='ko'?0:1000;f.dash=state==='dash'?{elapsed:t%.22,dir:1}:null;f.cast=null;f.y=510;f.vy=0;f.jumpWindup=0;
    if(state==='walk')f.x=480+t*run('aliens[id].speed')*.65;
    if(state==='jump'){if(t<.07)f.jumpWindup=.07;else{const a=t-.07;f.y=Math.min(510,510-520*a+600*a*a);f.vy=f.y<510?-520+1200*a:0;}}
    if(state==='dash')f.x=480+(t% .65)/.65*190;
    if(['normal','skill0','skill1','skill2','ultimate'].includes(state)){run("f.cast={key:state,ultimate:state==='ultimate',dir:1,elapsed:0,cfg:state==='normal'?baseNormal(f):state==='ultimate'?aliens[id].ultimate:aliens[id].skills[+state.slice(-1)]}");const cfg=f.cast.cfg,total=cfg.windup+(cfg.duration||.08)+cfg.recovery;f.cast.elapsed=t/seconds*total;}
    ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#091b20';ctx.fillRect(0,0,1920,1080);ctx.scale(1.5,1.5);ctx.fillStyle='#bfff85';ctx.font='bold 18px sans-serif';ctx.fillText('OMNITRIX / NEW CEL ACTIONS / ALL TEN ALIENS',50,55);ctx.fillStyle='white';ctx.font='bold 38px sans-serif';ctx.fillText(run('aliens[id].name').toUpperCase(),50,110);ctx.fillStyle='#9fc9bd';ctx.font='24px sans-serif';ctx.fillText(state.toUpperCase()+(state.startsWith('skill')?' / '+f.cast.cfg.name:state==='ultimate'?' / '+f.cast.cfg.name:''),50,154);
    ctx.fillStyle='#18352e';ctx.fillRect(0,510,1280,210);ctx.strokeStyle='#315d48';ctx.lineWidth=1;for(let x=0;x<1280;x+=45){ctx.beginPath();ctx.moveTo(x,510);ctx.lineTo(x,720);ctx.stroke()}ctx.strokeStyle='#a9ed84';ctx.beginPath();ctx.moveTo(0,510);ctx.lineTo(1280,510);ctx.stroke();run('drawAlien(ctx,f,t)');ctx.fillStyle='#9fc0b3';ctx.font='17px sans-serif';ctx.fillText('Native full-body drawings • Discrete action clips • No frame blending',50,640);ctx.fillText('WALK / JUMP / STRIKE / THREE POWERS / ULTIMATE / GUARD / HIT / DASH / KNOCKDOWN',50,675);
    const pixels=ctx.getImageData(0,0,1920,1080).data;if(!ff.stdin.write(Buffer.from(pixels.buffer,pixels.byteOffset,pixels.byteLength)))await new Promise(r=>ff.stdin.once('drain',r));
    if(state==='walk'&&i===15)fs.writeFileSync('previews/'+id+'-walk.png',cv.toBuffer('image/png'));
   }
  }console.log('Rendered',run('aliens[id].name'));
 }
 ff.stdin.end();await new Promise((resolve,reject)=>ff.on('exit',code=>code?reject(Error('ffmpeg '+code)):resolve()));
})().catch(e=>{console.error(e);process.exit(1)});
