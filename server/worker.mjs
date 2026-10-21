import {createEngine,ROSTER_COUNT} from './engine.generated.mjs';
import '../web/ranked-rules.js';
import '../web/player-name.js';
const ranks=globalThis.AlienRankRules;
const send=(c,data)=>{try{c.ws.send(JSON.stringify(data));}catch{}};
const points=r=>Number.isSafeInteger(r?.points)&&r.points>=0?r.points:0;
const title=uid=>'Plumber '+uid.slice(-5).toUpperCase();
export async function authenticate(token,env,request=fetch,withProfile=false){
 if(typeof token!=='string'||token.length>12000)throw Error('Please log in again.');
 let claims;try{claims=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));}catch{throw Error('Invalid login.');}
 if(claims.aud!==env.FIREBASE_PROJECT_ID||claims.iss!=='https://securetoken.google.com/'+env.FIREBASE_PROJECT_ID||claims.exp*1000<=Date.now())throw Error('Please log in again.');
 const res=await request('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+env.FIREBASE_API_KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token}),signal:AbortSignal.timeout(10000)});
 const data=await res.json(),user=data.users?.[0];if(!res.ok||!user?.localId||user.disabled||user.localId!==claims.sub)throw Error('Login could not be verified.');
 if(!user.providerUserInfo?.some(p=>p.providerId==='password'))throw Error('An email account is required.');
 return withProfile?{uid:user.localId,name:AlienPlayerName.normalize(user.displayName)}:user.localId;
}
export default {fetch(request,env){const url=new URL(request.url);if(url.pathname==='/health')return Response.json({service:'Omnitrix Ranked Arena',protocol:1,playerNames:true,battleCountdown:true,rosterCount:ROSTER_COUNT});if(url.pathname!=='/arena'||request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('Not found',{status:404});return env.ARENA.get(env.ARENA.idFromName('ranked-v1')).fetch(request);}};
export class RankedArena{
 constructor(ctx,env){this.ctx=ctx;this.env=env;this.clients=new Set();this.users=new Map();this.queue=[];this.matches=new Set();this.timer=null;}
 async fetch(){
  if(this.clients.size>=64)return new Response('Arena full; try again shortly.',{status:503});
  const pair=new WebSocketPair(),[client,ws]=Object.values(pair);ws.accept();const c={ws,uid:null,match:null,busy:false,lastInput:Date.now(),window:Date.now(),messages:0,seq:-1};this.clients.add(c);
  c.authTimer=setTimeout(()=>{if(!c.uid)ws.close(1008,'Login timed out');},12000);
  ws.addEventListener('message',event=>{this.message(c,event.data).catch(()=>{send(c,{type:'error',message:'Online service unavailable. Try again.'});c.ws.close(1011,'Service error');});});
  ws.addEventListener('close',()=>this.disconnect(c));ws.addEventListener('error',()=>this.disconnect(c));
  this.startTimer();return new Response(null,{status:101,webSocket:client});
 }
 startTimer(){if(this.timer)return;this.timer=setInterval(()=>this.tick(),1000/30);}
 async message(c,raw){
  if(!this.clients.has(c))return;if(typeof raw!=='string'||raw.length>16000){c.ws.close(1009,'Message too large');return;}
  const now=Date.now();if(now-c.window>=1000){c.window=now;c.messages=0;}if(++c.messages>80){c.ws.close(1008,'Too many messages');return;}
  let d;try{d=JSON.parse(raw);}catch{c.ws.close(1008,'Invalid message');return;}
  if(d.type==='auth'&&!c.uid&&!c.busy){c.busy=true;try{const identity=await authenticate(d.token,this.env,fetch,true),uid=identity.uid;if(!this.clients.has(c))return;if(this.users.has(uid)){send(c,{type:'error',message:'This account is already online on another device.'});c.ws.close(1008,'Already online');return;}c.uid=uid;c.name=identity.name||title(uid);this.users.set(uid,c);clearTimeout(c.authTimer);c.rank=await this.ctx.storage.get('rank:'+uid)||{points:0,wins:0,losses:0};if(!this.clients.has(c))return;send(c,{type:'ready',protocol:1,rank:c.rank,name:c.name,rosterCount:ROSTER_COUNT});}catch(e){send(c,{type:'error',message:e.message});c.ws.close(1008,'Login failed');}finally{c.busy=false;}return;}
  if(!c.uid||c.busy)return;
  if(d.type==='ping'){c.lastInput=now;send(c,{type:'pong',stamp:d.stamp});return;}
  if(d.type==='join'&&!c.match&&!this.queue.includes(c)){
   if(!Number.isInteger(d.alien)||d.alien<0||d.alien>=ROSTER_COUNT||!Array.isArray(d.loadout)||d.loadout.length!==2||new Set(d.loadout).size!==2||d.loadout.some(n=>!Number.isInteger(n)||n<0||n>2))return;
   c.busy=true;try{
    // Ownership comes from this UID's cloud save, never from a client assertion.
    const token=d.token;if(await authenticate(token,this.env)!==c.uid)throw Error('Account changed. Reconnect.');
    const response=await fetch('https://firestore.googleapis.com/v1/projects/'+this.env.FIREBASE_PROJECT_ID+'/databases/(default)/documents/gameSaves/'+encodeURIComponent(c.uid),{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});
    const doc=await response.json();let save;try{save=JSON.parse(doc.fields?.payload?.stringValue);}catch{}
    if(!response.ok||!save?.collection?.owned?.includes(d.alien))throw Error('Sync your unlocked alien in Account, then try again.');
    if(!this.clients.has(c))return;c.spec={alien:d.alien,loadout:[...d.loadout]};c.joined=Date.now();c.lastInput=Date.now();this.queue.push(c);send(c,{type:'queued',wait:30,rank:c.rank});
   }catch(e){send(c,{type:'error',message:e.message});}finally{c.busy=false;}return;
  }
  if(d.type==='cancel'&&!c.match){this.queue=this.queue.filter(x=>x!==c);send(c,{type:'cancelled'});return;}
  if(d.type==='forfeit'&&c.match){await this.settle(c.match,c.match.players.indexOf(c)===0?1:0,true);return;}
  if(d.type==='input'&&c.match&&!c.match.settling){if(now<c.match.readyAt)return;if(!Number.isSafeInteger(d.seq)||d.seq<=c.seq)return;c.seq=d.seq;c.lastInput=now;const i=c.match.players.indexOf(c);const edges=Array.isArray(d.edges)?d.edges.slice(0,6):[];c.match.engine.input(i,d.held||{},edges);}
 }
 pair(a,b){this.queue=this.queue.filter(c=>c!==a&&c!==b);const bot=!b;const players=bot?[a]:[a,b];const specs=bot?[a.spec,{alien:(a.spec.alien+1+Math.floor(Math.random()*(ROSTER_COUNT-1)))%ROSTER_COUNT,loadout:[0,1]}]:players.map(c=>c.spec);const m={id:crypto.randomUUID(),players,bot,engine:createEngine(specs,bot),settling:false,started:Date.now(),readyAt:Date.now()+3000};this.matches.add(m);players.forEach((c,seat)=>{c.match=m;c.seq=-1;c.lastInput=Date.now();send(c,{type:'matched',matchId:m.id,seat,bot,countdownMs:3000,names:bot?[a.name||title(a.uid),'Arena Challenger']:players.map(p=>p.name||title(p.uid)),ratings:bot?[points(a.rank),0]:players.map(p=>points(p.rank)),snapshot:m.engine.snapshot()});});}
 tick(){
  const now=Date.now();this.queue=this.queue.filter(c=>this.clients.has(c));
  for(const a of [...this.queue]){if(!this.queue.includes(a))continue;const range=now-a.joined>=28000?Infinity:150+Math.floor((now-a.joined)/1000)*20;const b=this.queue.find(c=>c!==a&&Math.abs(points(c.rank)-points(a.rank))<=range);if(b&&this.matches.size<16)this.pair(a,b);else if(now-a.joined>=30000&&this.matches.size<16)this.pair(a,null);}
  for(const m of this.matches){if(m.settling)continue;const lost=m.players.findIndex(c=>!this.clients.has(c)||now-c.lastInput>10000);if(lost>=0){this.settle(m,lost===0?1:0,true);continue;}if(now-m.started>600000){this.settle(m,-1);continue;}const countdownMs=Math.max(0,m.readyAt-now);if(!countdownMs)m.engine.advance(1/30);const snapshot=m.engine.snapshot();for(const c of m.players)send(c,{type:'state',snapshot,countdownMs});if(m.engine.done)this.settle(m,m.engine.winner);}
  if(!this.clients.size&&!this.matches.size){clearInterval(this.timer);this.timer=null;}
 }
 async settle(m,winner,forfeit=false){
  if(m.settling)return;m.settling=true;let result;
  try{result=await this.ctx.storage.transaction(async tx=>{const prior=await tx.get('receipt:'+m.id);if(prior)return prior;const old=await Promise.all(m.players.map(c=>tx.get('rank:'+c.uid)));const before=old.map(points);const delta=m.bot?[0]:ranks.changes(before[0],before[1],winner,forfeit);const records=m.players.map((c,i)=>({points:Math.max(0,before[i]+delta[i]),wins:(old[i]?.wins||0)+(!m.bot&&winner===i?1:0),losses:(old[i]?.losses||0)+(!m.bot&&winner>=0&&winner!==i?1:0)}));for(let i=0;i<m.players.length;i++)if(!m.bot)await tx.put('rank:'+m.players[i].uid,records[i]);const receipt={matchId:m.id,winner,bot:m.bot,forfeit,delta,records};await tx.put('receipt:'+m.id,{...receipt,created:Date.now()});return receipt;});
   m.players.forEach((c,i)=>{c.rank=result.records[i];send(c,{type:'result',...result,seat:i});});
  }catch{m.players.forEach(c=>send(c,{type:'error',message:'Result could not be saved. No confirmed rank change.'}));}
  finally{for(const c of m.players)c.match=null;this.matches.delete(m);}
 }
 disconnect(c){if(!this.clients.delete(c))return;clearTimeout(c.authTimer);if(this.users.get(c.uid)===c)this.users.delete(c.uid);this.queue=this.queue.filter(x=>x!==c);if(c.match)this.settle(c.match,c.match.players.indexOf(c)===0?1:0,true);}
}

