// Exercise the real loading/player path with the game and every selectable alien.
const {JSDOM}=require('jsdom'),fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{loadImage,createCanvas}=require('@napi-rs/canvas');
(async()=>{const html=fs.readFileSync('web/index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,'');const dom=new JSDOM(html,{url:'https://appassets.androidplatform.net/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;w.requestAnimationFrame=()=>0;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 const cv=createCanvas(1920,1080),ctx=cv.getContext('2d');w.HTMLCanvasElement.prototype.getContext=()=>ctx;const box=dom.getInternalVMContext();
 for(const file of ['data.js','art.js','cel-data.js','classic-art.js']){if(file==='classic-art.js'){
 const src=fs.readFileSync('web/'+file,'utf8').replace(/function loadClassicImage\(src\)\{[^\n]*\}/,'function loadClassicImage(src){return testLoadImage(src)}');box.testLoadImage=p=>loadImage('web/'+p);vm.runInContext(src,box,{filename:file});
 }else vm.runInContext(fs.readFileSync('web/'+file,'utf8'),box,{filename:file})}
 for(const file of ['game.js','cartoon-gaits.js','cel-player.js','app.js','interface.js'])vm.runInContext(fs.readFileSync('web/'+file,'utf8'),box,{filename:file});
 assert(await vm.runInContext('allAlienPosesReady',box),vm.runInContext('allAlienPoseError',box));await new Promise(r=>setTimeout(r,0));
 for(let id=0;id<22;id++){box.testId=id;vm.runInContext("mode='menu';selectedMode='training';select(testId);$('opponent').value=String((testId+1)%22);showScreen('setup',false)",box);await vm.runInContext('launch()',box);
 assert.equal(vm.runInContext('mode',box),'fight','alien '+id+' '+vm.runInContext('allAlienPoseError',box));assert.equal(vm.runInContext('currentScreen',box),'battle');assert.equal(vm.runInContext('player.id',box),id);assert.equal(vm.runInContext('enemy.id',box),(id+1)%22);assert(vm.runInContext('celCache.has(player.id)&&celCache.has(enemy.id)',box));vm.runInContext('render();pause();quit()',box);
 }
 // Survival awaits the next opponent's sheets before restoring carried health and score.
 vm.runInContext("mode='menu';selectedMode='survival';selected=0;showScreen('setup',false)",box);await vm.runInContext('launch()',box);vm.runInContext('player.hp=700;enemy.hp=0;',box);await vm.runInContext('finish()',box);assert.equal(vm.runInContext('survivalStage',box),2);assert.equal(vm.runInContext('mode',box),'fight');assert.equal(vm.runInContext('player.hp',box),900);assert.equal(vm.runInContext('survivalScore',box),1);
 console.log('Passed: real UI + cel player launches all 22 training pairs, actual arena rendering, pause/quit, and survival transition with health/score carryover.');w.close();
})().catch(e=>{console.error(e);process.exit(1)});

