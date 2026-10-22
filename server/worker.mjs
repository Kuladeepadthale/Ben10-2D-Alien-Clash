import {createSquadMatch,validSquad,defaultSquad} from './squads.mjs';
import {ROSTER_COUNT} from './engine.generated.mjs';
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
export default {fetch(request,env){const url=new URL(request.url);if(url.pathname==='/health')return Response.json({service:'Omnitrix Ranked Arena',protocol:2,squads:true,friendRooms:true,teamRelay:true,playerNames:true,battleCountdown:true,rosterCount:ROSTER_COUNT});if(url.pathname!=='/arena'||request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('Not found',{status:404});return env.ARENA.get(env.ARENA.idFromName('ranked-v1')).fetch(request);}};
export class RankedArena{
 constructor(ctx,env){this.ctx=ctx;this.env=env;this.clients=new Set();this.users=new Map();this.queue=[];this.matches=new Set();this.rooms=new Map();this.timer=null;}
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
  if(d.type==='auth'&&!c.uid&&!c.busy){c.busy=true;try{const identity=await authenticate(d.token,this.env,fetch,true),uid=identity.uid;if(!this.clients.has(c))return;if(this.users.has(uid)){send(c,{type:'error',message:'This account is already online on another device.'});c.ws.close(1008,'Already online');return;}c.uid=uid;c.name=identity.name||title(uid);this.users.set(uid,c);clearTimeout(c.authTimer);c.rank=await this.ctx.storage.get('rank:'+uid)||{points:0,wins:0,losses:0};if(!this.clients.has(c))return;send(c,{type:'ready',protocol:2,rank:c.rank,name:c.name,rosterCount:ROSTER_COUNT});}catch(e){send(c,{type:'error',message:e.message});c.ws.close(1008,'Login failed');}finally{c.busy=false;}return;}
  if(!c.uid||c.busy)return;
  if(d.type==='ping'){c.lastInput=now;send(c,{type:'pong',stamp:d.stamp});return;}
  if(d.type==='join'&&!c.match&&!c.room&&!this.queue.includes(c)){
   if(!Number.isInteger(d.alien)||d.alien<0||d.alien>=ROSTER_COUNT)return;
   c.busy=true;try{
    const token=d.token;if(await authenticate(token,this.env)!==c.uid)throw Error('Account changed. Reconnect.');
    const response=await fetch('https://firestore.googleapis.com/v1/projects/'+this.env.FIREBASE_PROJECT_ID+'/databases/(default)/documents/gameSaves/'+encodeURIComponent(c.uid),{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});
    const doc=await response.json();let save;try{save=JSON.parse(doc.fields?.payload?.stringValue);}catch{}
    if(!response.ok||!save?.collection?.owned?.includes(d.alien))throw Error('Sync your unlocked alien in Account, then try again.');
    if(!this.clients.has(c))return;c.owned=[...new Set(save.collection.owned.filter(id=>Number.isInteger(id)&&id>=0&&id<ROSTER_COUNT))];c.spec={alien:d.alien,loadout:[0,1]};c.squad=validSquad(d.squad,c.owned)?d.squad:defaultSquad(c.owned,d.alien);c.joined=Date.now();c.lastInput=Date.now();
    if(d.roomAction==='create'){if(this.rooms.size>=16)throw Error('Friend rooms are full. Try shortly.');let code;do{code=Array.from(crypto.getRandomValues(new Uint8Array(6)),v=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[v%32]).join('');}while(this.rooms.has(code));const room={code,host:c,players:[c],mode:d.roomMode==='relay'?'relay':'duel',rounds:[1,3,5].includes(d.rounds)?d.rounds:1,created:Date.now()};this.rooms.set(code,room);c.room=room;this.roomState(room);}
    else if(d.roomAction==='join'){const room=this.rooms.get(String(d.code||'').trim().toUpperCase());if(!room||room.players.length>=(room.mode==='relay'?4:2))throw Error('Room not found or already full.');room.players.push(c);c.room=room;this.roomState(room);}
    else{this.queue.push(c);send(c,{type:'queued',wait:30,draftMs:10000,squad:c.squad,rank:c.rank});}
   }catch(e){send(c,{type:'error',message:e.message});}finally{c.busy=false;}return;
  }
  if(d.type==='draft'&&!c.match&&(this.queue.includes(c)||c.room)&&validSquad(d.squad,c.owned)){c.squad=d.squad;send(c,{type:'drafted',revision:d.revision,squad:c.squad});if(c.room)this.roomState(c.room);return;}
  if(d.type==='practice'&&!c.match&&this.queue.includes(c)&&now-c.joined>=30000){this.pair(c,null);return;}
  if(d.type==='roomSettings'&&c.room?.host===c){if([1,3,5].includes(d.rounds))c.room.rounds=d.rounds;this.roomState(c.room);return;}
  if(d.type==='roomStart'&&c.room?.host===c){const r=c.room;if(r.players.length!==(r.mode==='relay'?4:2)){send(c,{type:'notice',message:'Wait for all friends to join.'});return;}if(r.players.some(p=>now-p.joined<10000)){send(c,{type:'notice',message:'Let everyone finish the 10-second alien selection.'});return;}this.rooms.delete(r.code);r.players.forEach(p=>p.room=null);this.pair(r.players[0],r.players[1],r);return;}
  if(d.type==='choose'&&c.match){c.match.engine.choose(c.match.players.indexOf(c),d.index);return;}
  if(d.type==='cancel'&&!c.match){this.queue=this.queue.filter(x=>x!==c);this.leaveRoom(c);send(c,{type:'cancelled'});return;}
  if(d.type==='forfeit'&&c.match){await this.settle(c.match,1-c.match.players.indexOf(c)%2,true);return;}
  if(d.type==='input'&&c.match&&!c.match.settling){if(!Number.isSafeInteger(d.seq)||d.seq<=c.seq)return;c.seq=d.seq;c.lastInput=now;const i=c.match.players.indexOf(c);const edges=Array.isArray(d.edges)?d.edges.slice(0,6):[];c.match.engine.input(i,d.held||{},edges);}
 }
 roomState(r){const now=Date.now();const state={type:'room',code:r.code,mode:r.mode,rounds:r.rounds,players:r.players.map((p,i)=>({name:p.name,seat:i,team:i%2,squad:p.squad,remainingMs:Math.max(0,10000-(now-p.joined))}))};r.players.forEach(c=>send(c,{...state,host:c===r.host,seat:r.players.indexOf(c)}));}
 leaveRoom(c){const r=c.room;if(!r)return;c.room=null;r.players=r.players.filter(p=>p!==c);if(!r.players.length)this.rooms.delete(r.code);else{if(r.host===c)r.host=r.players[0];this.roomState(r);}}
 pair(a,b,room=null){this.queue=this.queue.filter(c=>c!==a&&c!==b);const bot=!b;const players=room?room.players:bot?[a]:[a,b];const botSquad=Array.from({length:3},(_,i)=>({alien:(a.spec.alien+1+i)%ROSTER_COUNT,loadout:[0,1]}));const squads=bot?[a.squad||[a.spec,a.spec,a.spec],botSquad]:players.map(c=>c.squad||[c.spec,c.spec,c.spec]);const m={id:crypto.randomUUID(),players,bot,friendly:!!room,relay:room?.mode==='relay',engine:createSquadMatch(squads,{bot,rounds:room?.rounds||1}),settling:false,started:Date.now(),readyAt:0};this.matches.add(m);players.forEach((c,seat)=>{c.match=m;c.seq=-1;c.lastInput=Date.now();send(c,{type:'matched',matchId:m.id,seat:seat%2,participant:seat,friendly:m.friendly,relay:m.relay,bot,countdownMs:0,names:bot?[a.name||title(a.uid),'Arena Challenger']:players.map(p=>p.name||title(p.uid)),ratings:bot?[points(a.rank),0]:players.map(p=>points(p.rank)),snapshot:m.engine.snapshot(Date.now())});});}
 tick(){
  const now=Date.now();this.queue=this.queue.filter(c=>this.clients.has(c));
  for(const a of [...this.queue]){if(!this.queue.includes(a)||now-a.joined<10000)continue;const range=now-a.joined>=28000?Infinity:150+Math.floor((now-a.joined)/1000)*20;const b=this.queue.find(c=>c!==a&&now-c.joined>=10000&&Math.abs(points(c.rank)-points(a.rank))<=range);if(b&&this.matches.size<16)this.pair(a,b);}
  for(const m of this.matches){if(m.settling)continue;const lost=m.players.findIndex(c=>!this.clients.has(c)||now-c.lastInput>10000);if(lost>=0){this.settle(m,1-lost%2,true);continue;}if(now-m.started>(m.friendly?5400000:600000)){this.settle(m,-1);continue;}m.engine.step(now,1/30);const snapshot=m.engine.snapshot(now),countdownMs=snapshot.squad.phase==='countdown'?snapshot.squad.remainingMs:0;for(const c of m.players)send(c,{type:'state',snapshot,countdownMs});if(m.engine.done)this.settle(m,m.engine.winner);}
  for(const r of this.rooms.values())if(now-r.created>900000){for(const c of r.players){c.room=null;send(c,{type:'error',message:'Friend room expired. Create another room.'});}this.rooms.delete(r.code);}
  if(!this.clients.size&&!this.matches.size){clearInterval(this.timer);this.timer=null;}
 }
 async settle(m,winner,forfeit=false){
  if(m.settling)return;m.settling=true;let result;
  try{result=await this.ctx.storage.transaction(async tx=>{const prior=await tx.get('receipt:'+m.id);if(prior)return prior;const old=await Promise.all(m.players.map(c=>tx.get('rank:'+c.uid)));const before=old.map(points);const delta=m.bot||m.friendly?m.players.map(()=>0):ranks.changes(before[0],before[1],winner,forfeit);const records=m.players.map((c,i)=>({points:Math.max(0,before[i]+delta[i]),wins:(old[i]?.wins||0)+(!m.bot&&!m.friendly&&winner===i%2?1:0),losses:(old[i]?.losses||0)+(!m.bot&&!m.friendly&&winner>=0&&winner!==i%2?1:0)}));for(let i=0;i<m.players.length;i++)if(!m.bot&&!m.friendly)await tx.put('rank:'+m.players[i].uid,records[i]);const receipt={matchId:m.id,winner,bot:m.bot,friendly:m.friendly,relay:m.relay,stats:m.engine.snapshot(Date.now()).squad.stats,usedAliens:m.engine.snapshot(Date.now()).squad.usedAliens,forfeit,delta,records};await tx.put('receipt:'+m.id,{...receipt,created:Date.now()});return receipt;});
   m.players.forEach((c,i)=>{c.rank=result.records[i];send(c,{type:'result',...result,seat:i,team:i%2});});
  }catch{m.players.forEach(c=>send(c,{type:'error',message:'Result could not be saved. No confirmed rank change.'}));}
  finally{for(const c of m.players)c.match=null;this.matches.delete(m);}
 }
 disconnect(c){if(!this.clients.delete(c))return;clearTimeout(c.authTimer);if(this.users.get(c.uid)===c)this.users.delete(c.uid);this.queue=this.queue.filter(x=>x!==c);this.leaveRoom(c);if(c.match)this.settle(c.match,1-c.match.players.indexOf(c)%2,true);}
}



