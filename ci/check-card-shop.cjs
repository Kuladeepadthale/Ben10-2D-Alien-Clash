const fs=require('fs'),vm=require('vm');
let source=fs.readFileSync('ci/check-threat-ladder.cjs','utf8');source=source.slice(0,source.indexOf('(async()=>'));
source+=`(async()=>{
 const start=async saved=>{const t=await boot(saved);t.run('mode="menu";chooseStarter(career.offers[0])');t.run(fs.readFileSync('web/card-shop.js','utf8'));return t;};
 const dismiss=t=>t.run('while(career.packState.last.revealed<5)revealNextCard();closePackReveal()');
 for(let rank=0;rank<5;rank++){
  let t=await start(),run=t.run;t.b.rank=rank;
  run('career.owned=[0];career.gems=0;profile.credits=100000;testId=aliens.findIndex((_,id)=>id!==0&&ALIEN_RANKS[id]===rank);rollPackCards=()=>Array(5).fill(testId)');
  assert.equal(run('cardRequirement(testId)'),5*(rank+1));const xp=run('heroProgress.xp');
  for(let pack=0;pack<=rank;pack++){
   assert(run('buyCardPack("omni")'));assert.equal(run('ownsAlien(testId)'),false);assert.equal(run('collectedCards(testId)'),(pack+1)*5);assert.equal(run('career.gems'),0);assert.equal(run('heroProgress.xp'),xp);
   assert.equal(run('career.packState.last.results.filter(c=>!c.duplicate).length'),5);
   if(pack<rank)assert.equal(run('buyAlien(testId)'),false);
   dismiss(t);
  }
  assert(run('cardsReady(testId)'));assert(run('buyAlien(testId)'));assert.equal(run('career.gems'),0);assert.equal(run('heroProgress.xp'),xp+25);assert(!run('buyAlien(testId)'));assert.equal(run('heroProgress.xp'),xp+25);
  assert(run('buyCardPack("omni")'));assert.equal(run('career.gems'),5);assert.equal(run('collectedCards(testId)'),5*(rank+1));dismiss(t);
  t.w.close();
 }
 let t=await start(),run=t.run;
 run('career.owned=[0];career.gems=0;profile.credits=10000;testId=4;career.cardCopies[4]=4;rollPackCards=()=>Array(5).fill(testId)');
 assert(run('buyCardPack("omni")'));assert.equal(run('collectedCards(4)'),5);assert(!run('ownsAlien(4)'));assert.equal(run('career.gems'),4);assert.equal(run('career.packState.last.results.filter(c=>c.duplicate).length'),4);
 assert.equal(run('buyCardPack("omni")'),false);assert.equal(run('closePackReveal()'),false);run('revealNextCard();revealNextCard()');
 const receipt=t.w.localStorage.getItem('omnitrix-profile-v2');t.w.close();t=await start(receipt);run=t.run;
 assert.equal(run('currentScreen'),'packreveal');assert.equal(run('career.packState.last.revealed'),2);assert.equal(run('collectedCards(4)'),5);assert(!run('ownsAlien(4)'));assert.equal(run('career.gems'),4);dismiss(t);assert.equal(run('collectedCards(4)'),5);
 // A failed save restores every part of the pack transaction, including partial cards.
 run('testId=1;rollPackCards=()=>Array(5).fill(testId);originalStorageSet=Object.getPrototypeOf(localStorage).setItem;Object.getPrototypeOf(localStorage).setItem=function(){throw Error("quota")}');
 const before=run('JSON.stringify({coins:profile.credits,gems:career.gems,copies:career.cardCopies,owned:career.owned,receipt:career.packState})');
 assert.equal(run('buyCardPack("omni")'),false);assert.equal(run('JSON.stringify({coins:profile.credits,gems:career.gems,copies:career.cardCopies,owned:career.owned,receipt:career.packState})'),before);
 assert.equal(run('buyAlien(4)'),false);assert(!run('ownsAlien(4)'));assert.equal(run('collectedCards(4)'),5);
 run('Object.getPrototypeOf(localStorage).setItem=originalStorageSet');assert(run('buyAlien(4)'));assert.equal(run('career.gems'),4);
 // Existing diamond purchases remain an alternative, and old ownership is never revoked.
 run('career.gems=15');assert(run('buyAlien(1)'));assert.equal(run('career.gems'),0);
 run('career.owned=aliens.map((_,id)=>id);career.gems=47;saveProfile()');const legacy=JSON.parse(t.w.localStorage.getItem('omnitrix-profile-v2'));delete legacy.collection.cardCopies;t.w.close();
 t=await start(JSON.stringify(legacy));run=t.run;assert.equal(run('career.owned.length'),72);assert.equal(run('career.gems'),47);assert.equal(run('career.cardCopies.length'),72);assert(run('career.cardCopies.every(c=>c===0)'));
 for(const pack of run('CARD_PACKS'))assert.equal(pack.weights.reduce((a,b)=>a+b,0),100);
 t.w.close();console.log('Passed: 5/10/15/20/25 card thresholds, no automatic unlocks or early XP, manual unlock exactly once, capped progress, duplicate conversion, saved partial receipts, complete rollback and old ownership migration.');
})().catch(e=>{console.error(e);process.exit(1)});`;
vm.runInThisContext('(function(require){'+source+'})')(require);
