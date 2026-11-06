const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const b=vm.createContext({console,Set,Math,Number});
vm.runInContext(`let mode='fight',W=1280,floor=510;const player={hp:100,x:500,y:510,dir:1,cd:[0,0],loadout:[0,1]},shots=[],effects=[];let id=0;
function cast(f,type){if(f.cool>0||f.cast)return false;if(type==='ultimate'&&f.ult!==100)return false;const key=type==='normal'?'normal':type==='ultimate'?'ultimate':'skill'+f.loadout[type==='skill0'?0:1];if(type.startsWith('skill')&&f.cd[type==='skill0'?0:1]>0)return false;if(type.startsWith('skill'))f.cd[type==='skill0'?0:1]=2;if(type==='ultimate')f.ult=0;f.cast={id:++id,key,ultimate:type==='ultimate',elapsed:0,emitted:0,cfg:{kind:type==='ultimate'?'rush':type==='skill0'?'rain':'melee',ticks:type==='skill0'?3:1,windup:.2,duration:.6,recovery:.3},startX:f.x,plannedTarget:900,dir:f.dir};f.cool=1.1;f.action='power';return true;}
function spawnAttack(f,v,i){shots.push({owner:f,cast:v.id,index:i,x:f.x});}
function updateF(f,dt){const v=f.cast;if(!v)return;v.elapsed+=dt;if(v.cfg.kind==='rush'){f.x+=(v.cfg.speed||650)*dt*v.dir;return;}const active=v.elapsed-v.cfg.windup;while(v.emitted<(v.cfg.ticks||1)&&active>=v.emitted*v.cfg.duration/v.cfg.ticks)spawnAttack(f,v,v.emitted++);}
function move(f,dir,dt){if(f.cast||f.stun||f.block||f.hp<=0)return;f.x+=dir*200*dt;f.dir=Math.sign(dir);}
`,b);
vm.runInContext(fs.readFileSync('web/free-combat146.js','utf8'),b);
const run=s=>vm.runInContext(s,b);
run("cast(player,'skill0');updateF(player,.21)");assert.equal(run('player.cast'),null);assert.equal(run('player.detached146.length'),1);assert.equal(run('shots.length'),1);
assert(run("cast(player,'normal')"),'New basic accepted while rain continues');run('updateF(player,.41)');assert.equal(run('shots.filter(s=>s.cast===1).length'),3,'All autonomous rain emissions persist');assert(run('shots.every(s=>s.owner===player)'),'Attribution retained');
run("player.cast=null;player.cool=0;player.inputLock146=0;player.ult=100;cast(player,'ultimate');player.inputLock146=0;move(player,-1,.1);updateF(player,.1)");assert(run('player.x<500'),'Ultimate steers backwards');
assert(run("cast(player,'skill1')"),'Power cancels body ultimate');assert(!run('player.cast.ultimate'));assert.equal(run('player.ult'),0,'Cancelled ultimate does not refund charge');
run('player.inputLock146=0');const prior=run('player.cast');assert(!run("cast(player,'ultimate')"));assert.equal(run('player.cast'),prior,'Invalid input preserves existing cast');
run('player.inputLock146=0;player.cd[1]=0');assert(!run("cast(player,'skill1')"),'Same cast cannot restart');
run('player.inputLock146=0;player.basicReady146=0');assert(run("cast(player,'normal')"));run('player.inputLock146=0');assert(!run("cast(player,'normal')"),'Basic rate cap enforced');
console.log('Passed: autonomous effects, follow-up attacks, backward ultimate steering, body-attack cancellation, no charge refund, invalid input preservation and basic spam cap.');
