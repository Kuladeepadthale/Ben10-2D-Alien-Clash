const fs=require('fs'),path=require('path'),{spawn}=require('child_process'),{createCanvas,loadImage}=require('@napi-rs/canvas'),assert=require('assert/strict');
const {ActionClipPlayer}=require('./player.cjs');
(async()=>{
 const root=__dirname,map=JSON.parse(fs.readFileSync(path.join(root,'clips.json'))),images={};for(const c of Object.values(map.clips))for(const p of c.frames)images[p]??=await loadImage(path.join(root,p));
 const test=new ActionClipPlayer(map);assert(test.press('jump'));assert(!test.press('fireball'));test.update(.87);assert.equal(test.action,'idle');test.press('walk');test.update(.1);assert.equal(test.frame(),map.clips.walk.frames[1]);test.releaseWalk();assert.equal(test.action,'idle');
 const cv=createCanvas(1920,1080),ctx=cv.getContext('2d');
 const plans=[['Heatblast-Walk-Clip.mp4',4,'walk'],['Heatblast-Jump-Clip.mp4',4,'jump'],['Heatblast-Fireball-Clip.mp4',4,'fireball']];
 for(const [name,duration,only]of plans){
  const ff=spawn('ffmpeg',['-y','-f','rawvideo','-pix_fmt','rgba','-s','1920x1080','-r','60','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',path.join(root,'output',name)],{stdio:['pipe','ignore','ignore']});
  const completion=new Promise((resolve,reject)=>{ff.once('error',reject);ff.once('exit',c=>c?reject(Error('Encoder exit '+c)):resolve());});
  let player=new ActionClipPlayer(map),lastSection='',lastTrigger=-1,projectiles=[];
  for(let n=0;n<duration*60;n++){
   const t=n/60,action=only||(t<4?'walk':t<8?'jump':'fireball'),local=only?t:t%4,section=Math.floor(t/4)+':'+action;
   if(section!==lastSection){player=new ActionClipPlayer(map);lastTrigger=-1;projectiles=[];lastSection=section;}
   if(action==='walk')player.press('walk');else{const trigger=Math.floor(local/1.35);if(trigger!==lastTrigger){player.press(action);lastTrigger=trigger;}}
   const before=player.elapsed;player.update(1/60);
   const jump=player.action==='jump'?Math.max(0,Math.min(1,(player.elapsed-.14)/.56)):0,lift=player.action==='jump'&&player.elapsed>=.14&&player.elapsed<=.7?4*jump*(1-jump)*140:0;
   const worldX=action==='walk'?360+local*240:640,camera=Math.max(0,worldX-780),x=worldX-camera,y=600-lift;
   if(player.action==='fireball'&&before<.34&&player.elapsed>=.34)projectiles.push({x:x+220,y:y-265,age:0});
   ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#101e28';ctx.fillRect(0,0,1920,1080);ctx.scale(1.5,1.5);
   ctx.fillStyle='#162d37';ctx.fillRect(0,600,1280,120);ctx.strokeStyle='#355766';ctx.lineWidth=1;
   for(let gx=Math.floor(camera/50)*50;gx<camera+1280;gx+=50){ctx.beginPath();ctx.moveTo(gx-camera,600);ctx.lineTo(gx-camera,720);ctx.stroke();}
   ctx.strokeStyle='#7dd9b5';ctx.beginPath();ctx.moveTo(0,600);ctx.lineTo(1280,600);ctx.stroke();
   ctx.fillStyle='#050e16';ctx.beginPath();ctx.ellipse(x,605,80,9,0,0,Math.PI*2);ctx.fill();
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(images[player.frame()],x-map.origin[0],y-map.origin[1]);
   for(const p of projectiles){p.age+=1/60;p.x+=12;ctx.fillStyle='#ff8e20';ctx.beginPath();ctx.arc(p.x,p.y,17,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffef9a';ctx.beginPath();ctx.arc(p.x+3,p.y,10,0,Math.PI*2);ctx.fill();}projectiles=projectiles.filter(p=>p.age<1.2);
   ctx.fillStyle='#80e6b5';ctx.font='bold 17px sans-serif';ctx.fillText('HEATBLAST / NEW CEL-CLIP TEST',40,46);
   ctx.fillStyle='white';ctx.font='bold 34px sans-serif';ctx.fillText(action==='walk'?'WALK CLIP':action==='jump'?'JUMP CLIP':'FIREBALL CLIP',40,94);
   ctx.fillStyle='#aec4d0';ctx.font='17px sans-serif';ctx.fillText('Separate button-triggered sequences • Sharp frame changes • No blended poses',40,130);
   for(const [i,key]of ['walk','jump','fireball'].entries()){const active=key===action&&player.action!=='idle',bx=40+i*170;ctx.fillStyle=active?'#a9ef86':'#28434d';ctx.fillRect(bx,654,150,36);ctx.fillStyle=active?'#183018':'#b9d0d9';ctx.font='bold 15px sans-serif';ctx.fillText(key.toUpperCase(),bx+15,677);}
   ctx.fillStyle='#93adb8';ctx.font='14px sans-serif';ctx.fillText('Animation pilot only • Current APK unchanged • 1080p video',690,677);
   const pixels=ctx.getImageData(0,0,1920,1080).data;if(!ff.stdin.write(Buffer.from(pixels.buffer,pixels.byteOffset,pixels.byteLength)))await new Promise(r=>ff.stdin.once('drain',r));
   if(!only&&[100,290,520].includes(n))fs.writeFileSync(path.join(root,'output','review-'+n+'.png'),cv.toBuffer('image/png'));
  }
  ff.stdin.end();await completion;console.log('Rendered '+name);
 }
 const list=path.join(root,'output','concat.txt');fs.writeFileSync(list,['Heatblast-Walk-Clip.mp4','Heatblast-Jump-Clip.mp4','Heatblast-Fireball-Clip.mp4'].map(p=>"file '"+p+"'").join('\n'));
 await new Promise((resolve,reject)=>{const p=spawn('ffmpeg',['-y','-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart',path.join(root,'output','Heatblast-Cel-Preview.mp4')],{stdio:'ignore'});p.once('error',reject);p.once('exit',c=>c?reject(Error('Concat failed')):resolve());});
})();
