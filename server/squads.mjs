import {createEngine,ROSTER_COUNT} from './engine.generated.mjs';
export function validSquad(value,owned){return Array.isArray(value)&&value.length===3&&value.every(s=>Number.isInteger(s?.alien)&&s.alien>=0&&s.alien<ROSTER_COUNT&&owned.includes(s.alien)&&Array.isArray(s.loadout)&&s.loadout.length===2&&new Set(s.loadout).size===2&&s.loadout.every(n=>Number.isInteger(n)&&n>=0&&n<3))&& (owned.length<3||new Set(value.map(s=>s.alien)).size===3);}
export function defaultSquad(owned,first){const ids=[...new Set([first,...owned].filter(x=>owned.includes(x)))];return Array.from({length:3},(_,i)=>({alien:ids[i%ids.length],loadout:[0,1]}));}
export function createSquadMatch(squads,{bot=false,rounds=1,now=Date.now(),random=Math.random,engineFactory=createEngine}={}){
 const used=squads.map(()=>new Set());
 const teams=squads.map((_,i)=>i%2),teamCount=2,activeSeats=[0,1],selected=squads.map(()=>0),lost=squads.map(()=>[]),wins=[0,0];
 let engine,phase='starter',deadline=now+5000,done=false,winner=-1,round=1,pending=[],stats=squads.map(()=>({powers:0,damage:0}));
 const available=seat=>squads[seat].map((s,i)=>i).filter(i=>!lost[seat].includes(i));
 function launch(){activeSeats.forEach(seat=>used[seat].add(squads[seat][selected[seat]].alien));engine=engineFactory(activeSeats.map(seat=>squads[seat][selected[seat]]),bot,{squad:true});}
 function choose(seat,index){if(!Number.isInteger(index)||!available(seat).includes(index))return false;if(phase==='starter'||phase==='replacement'&&pending.includes(seat)){selected[seat]=index;return true;}return false;}
 function startRound(t){for(let s=0;s<squads.length;s++){lost[s]=[];selected[s]=0;}activeSeats[0]=0;activeSeats[1]=1;phase='starter';deadline=t+5000;pending=[];engine=null;}
 function step(t,dt){if(done)return;
  if(phase==='starter'&&t>=deadline){launch();phase='countdown';deadline=t+3000;}
  if(phase==='replacement'&&t>=deadline){for(const seat of pending){const a=available(seat);if(!a.includes(selected[seat]))selected[seat]=a[Math.floor(random()*a.length)];engine.replace(teams[seat],squads[seat][selected[seat]]);used[seat].add(squads[seat][selected[seat]].alien);}pending=[];phase='countdown';deadline=t+1000;}
  if(phase==='roundend'&&t>=deadline){round++;startRound(t);}
  if(phase==='countdown'&&t>=deadline)phase='fight';
  if(phase!=='fight')return;engine.advance(dt);
  if(!engine.done)return;
  const snap=engine.snapshot(),out=[];for(let team=0;team<teamCount;team++)if(snap.fighters[team].hp<=0||snap.clock<=0&&(engine.winner<0||engine.winner!==team))out.push(team);
  if(!out.length)out.push(1-engine.winner);
  for(const team of out){const seat=activeSeats[team];stats[seat].powers+=snap.fighters[team].powerCasts||0;stats[seat].damage+=snap.fighters[team].damageDealt||0;lost[seat].push(selected[seat]);const teammate=teams.findIndex((v,i)=>v===team&&i!==seat&&available(i).length);const next=teammate>=0?teammate:available(seat).length?seat:-1;if(next>=0){activeSeats[team]=next;selected[next]=-1;pending.push(next);}}
  const alive=[0,1].map(team=>teams.some((v,s)=>v===team&&available(s).length));
  if(!alive[0]||!alive[1]){const w=alive[0]===alive[1]?-1:alive[0]?0:1;if(w>=0)wins[w]++;if(wins.some(n=>n>=Math.ceil(rounds/2))||round>=rounds+2){done=true;winner=wins[0]===wins[1]?-1:wins[0]>wins[1]?0:1;phase='done';}else{phase='roundend';deadline=t+2500;}return;}
  phase='replacement';deadline=t+3000;
 }
 function input(seat,held,edges){if(phase!=='fight'||activeSeats[teams[seat]]!==seat)return;engine.input(teams[seat],held,edges);}
 const preview=engineFactory([squads[0][0],squads[1][0]],bot,{squad:true});
 function snapshot(t=Date.now()){const base=engine?.snapshot()||preview.snapshot();return {...base,done,winner,round,wins:[...wins],squad:{stats:stats.map((v,seat)=>{const team=teams[seat],f=base.fighters[team],live=activeSeats[team]===seat&&!lost[seat].includes(selected[seat]);return {powers:v.powers+(live?(f.powerCasts||0):0),damage:v.damage+(live?(f.damageDealt||0):0)};}),usedAliens:used.map(v=>[...v]),phase,remainingMs:Math.max(0,deadline-t),squads,selected:[...selected],lost:lost.map(a=>[...a]),activeSeats:[...activeSeats],teams,pending:[...pending],rounds}};}
 return {choose,input,step,snapshot,clear(seat){if(engine&&activeSeats[teams[seat]]===seat)engine.clear(teams[seat]);},get done(){return done;},get winner(){return winner;}};
}
