const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
(async()=>{
const root=path.resolve('preview-web'),out=path.resolve('store-assets');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{let p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(p===root)p+='/index.html';if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{const ext=path.extname(p);res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'})[ext]||'application/octet-stream');res.end(fs.readFileSync(p));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1}),errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:')?route.continue():route.abort());
try{
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await page.waitForFunction(()=>typeof chooseStarter==='function');
if(await page.locator('#entryGuest').isVisible())await page.locator('#entryGuest').click();
await page.evaluate(()=>{career.offers=[0,1,2];chooseStarter(0);showScreen('home');});
const snap=async name=>{await page.waitForTimeout(1800);await page.screenshot({path:path.join(out,name),type:'jpeg',quality:92});};
await snap('01-home.jpg');
await page.evaluate(()=>{showScreen('characters');});await snap('02-character-collection.jpg');
await page.evaluate(()=>{selectedMode='training';select(0);});await snap('03-character-powers.jpg');
await page.evaluate(()=>{showScreen('modes');});await snap('04-battle-modes.jpg');
await page.evaluate(()=>{selectedMode='training';showScreen('characters');select(0);});
await page.locator('#alienUse').click();await page.waitForFunction(()=>currentScreen==='battle'&&training);
await page.evaluate(()=>cancelBattleCountdown());await snap('05-training-battle.jpg');
await page.keyboard.press('k');await page.waitForTimeout(150);await page.screenshot({path:path.join(out,'06-training-power.jpg'),type:'jpeg',quality:92});
if(errors.length)throw Error(errors.join('; '));
fs.writeFileSync(path.join(out,'capture-report.json'),JSON.stringify({sourceRelease:'playstore-13.1-ec34ea8c6ff6',viewport:{width:1280,height:720},screenshots:6,guest:true,pageErrors:errors,notes:'Real game UI captured from released APK assets in Chromium. Guest test profile only. Not a physical phone capture.'},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1)});
