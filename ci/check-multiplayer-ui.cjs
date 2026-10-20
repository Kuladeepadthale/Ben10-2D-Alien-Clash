const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const root=path.resolve('web'),server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);try{if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const executablePath=['/usr/bin/google-chrome','/usr/bin/chromium','/opt/google/chrome/chrome'].find(p=>fs.existsSync(p));const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const viewport of [{width:640,height:360},{width:932,height:430},{width:1280,height:720},{width:360,height:800}]){
  const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');await page.locator('#entryGuest').click();await page.waitForFunction(()=>typeof rankedFind==='function');
  await page.evaluate(()=>{chooseStarter(career.offers[0]);selectedMode='versus';showScreen('setup');});
  assert.equal(await page.locator('[data-mode="versus"] h2').textContent(),'Multiplayer');assert(await page.locator('#rankedPanel').isVisible());
  const fit=await page.locator('#rankedPanel').evaluate(el=>{const r=el.getBoundingClientRect();return {height:r.height,scroll:el.scrollHeight,viewport:innerHeight,bottom:r.bottom};});assert(fit.scroll<=fit.height+3,JSON.stringify({viewport,fit}));
  await page.evaluate(()=>rankedFind());assert.equal(await page.evaluate(()=>currentScreen),'account');
  await page.evaluate(()=>{
   accountState={mode:'member',uid:'test-player',email:'test@example.invalid'};accountClient.session={uid:'test-player',idToken:'test'};accountClient.token=async()=> 'test';accountSync=async()=>true;localStorage.setItem('omni-arena-endpoint','wss://arena.example/arena');showScreen('setup');
   window.WebSocket=class{constructor(){this.readyState=1;this.sent=[];window.testSocket=this;setTimeout(()=>this.onopen?.(),0);}send(raw){const d=JSON.parse(raw);this.sent.push(d);if(d.type==='auth')this.deliver({type:'ready',protocol:1,rank:{points:240}});if(d.type==='join')this.deliver({type:'queued',rank:{points:240},wait:30});}deliver(d){this.onmessage?.({data:JSON.stringify(d)});}close(){this.readyState=3;this.onclose?.();}};
  });
  await page.evaluate(()=>rankedFind());await page.waitForFunction(()=>online.searching);assert(await page.locator('#rankedQueue').isVisible());assert.equal(await page.locator('#queueTitle').textContent(),'Finding a Plumber…');
  await page.locator('#queueCancel').click();assert.equal(await page.evaluate(()=>online.searching),false);assert.equal(await page.locator('#rankedQueue').isVisible(),false);
  await page.evaluate(()=>{window.oldSocket=testSocket;oldSocket.deliver({type:'matched',snapshot:{}});});assert.equal(await page.evaluate(()=>online.active),false);
  await page.evaluate(()=>rankedFind());await page.waitForFunction(()=>online.searching);
  await page.evaluate(()=>{
   const own=make(selected,370,1,true),rival=make((selected+1)%32,910,-1);window.testSnapshot=JSON.parse(JSON.stringify({fighters:[own,rival],shots:[],effects:[],clock:90,round:1,wins:[0,0],roundDelay:0,time:0}));testSocket.deliver({type:'matched',matchId:'test-match',seat:1,bot:false,names:['Plumber A','Plumber B'],ratings:[240,240],snapshot:testSnapshot});
  });await page.waitForFunction(()=>currentScreen==='battle'&&online.active);assert.equal(await page.evaluate(()=>player.id),await page.evaluate(()=>testSnapshot.fighters[1].id));
  await page.evaluate(()=>{window.beforeHP=enemy.hp;advanceSimulation(1);});assert.equal(await page.evaluate(()=>enemy.hp),await page.evaluate(()=>beforeHP));
  await page.evaluate(()=>{presses.normal=true;});await page.waitForFunction(()=>testSocket.sent.some(d=>d.type==='input'&&d.edges.includes('normal')));
  await page.evaluate(()=>{testSnapshot.fighters[0].hp-=100;testSocket.deliver({type:'state',snapshot:testSnapshot});});assert.equal(await page.evaluate(()=>enemy.hp),await page.evaluate(()=>beforeHP-100));
  await page.evaluate(()=>{pause();});assert(await page.locator('#quit').isVisible());await page.locator('#start').click();assert.equal(await page.locator('#overlay').evaluate(e=>e.classList.contains('hidden')),true);
  const matches=await page.evaluate(()=>profile.matches);await page.evaluate(()=>{const d={type:'result',matchId:'test-match',winner:1,bot:false,delta:[-16,16],records:[{points:224},{points:256}],seat:1};testSocket.deliver(d);onlineResult(d);});
  assert.equal(await page.evaluate(()=>profile.matches),matches+1);assert.equal(await page.evaluate(()=>online.points),256);assert.equal(await page.evaluate(()=>currentScreen),'results');assert((await page.locator('#resultText').textContent()).includes('+16 RP'));
  await page.evaluate(()=>{selectedMode='survival';mode='menu';showScreen('setup');});assert.equal(await page.locator('#rankedPanel').isVisible(),false);assert.equal(await page.locator('#optionControls').isVisible(),true);
  assert.deepEqual(errors,[]);await page.close();
 }}finally{await browser.close();server.close();}
 console.log('Passed: four viewport layouts, guest gate, endpoint gate, queue/cancel/stale-message guards, real-player seat mapping, server snapshot authority, input sending, live pause/forfeit controls, single result rewards and other-mode preservation.');
})().catch(e=>{console.error(e);process.exit(1);});
