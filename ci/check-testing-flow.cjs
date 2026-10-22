// Real browser regression: every alien's overview and upgrades fit the viewport.
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{const root=path.resolve('web'),server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file===root)file+='/index.html';if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}try{const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[ext]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const executablePath=['/usr/bin/google-chrome','/usr/bin/chromium','/opt/google/chrome/chrome'].find(p=>fs.existsSync(p));const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage']});
try{for(const viewport of [{width:360,height:800},{width:640,height:360},{width:932,height:430}]){
const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');if(await page.locator('#entryGuest').isVisible())await page.locator('#entryGuest').click();
await page.waitForFunction(()=>typeof renderAlienInfo==='function');
await page.evaluate(()=>{chooseStarter(career.offers[0]);selectedMode='training';showScreen('characters');select(25)});
assert.equal(await page.locator('#alienUse').textContent(),'Test alien');
const before=await page.evaluate(()=>({matches:profile.matches,coins:profile.credits}));
await page.locator('#alienUse').click();
await page.waitForFunction(()=>currentScreen==='battle'&&mode==='fight'&&training&&player.id===25);
assert.equal(await page.evaluate(()=>selectedMode),'training');assert.equal(await page.locator('#time').textContent(),'∞');
await page.evaluate(()=>{cancelBattleCountdown();navigate('characters')});
assert.equal(await page.evaluate(()=>currentScreen),'characters');assert.equal(await page.evaluate(()=>mode),'menu');
assert.equal(await page.evaluate(()=>selectedMode),'training');
await page.evaluate(()=>select(0));await page.locator('#alienUse').click();
await page.waitForFunction(()=>currentScreen==='battle'&&training&&player.id===0);
await page.evaluate(()=>{cancelBattleCountdown();navigate('characters')});
assert.deepEqual(await page.evaluate(()=>({matches:profile.matches,coins:profile.credits})),before);
// An explicit battle choice leaves Testing; ordinary alien selection must not start combat.
await page.evaluate(()=>{selectedMode='versus';showScreen('characters');select(career.owned[0])});await page.locator('#alienUse').click();
assert.equal(await page.evaluate(()=>currentScreen),'modes');assert.equal(await page.evaluate(()=>mode),'menu');
assert.deepEqual(errors,[]);await page.close();}
console.log('Passed: Test alien directly enters unlimited Testing, switching aliens preserves Testing and awards no coins, battle selection waits for explicit start on three phone sizes.');
}finally{await browser.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exit(1)});
