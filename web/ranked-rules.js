'use strict';
// Game adaptation of Plumber titles; not an official cartoon rank ladder.
globalThis.AlienRankRules=Object.freeze({
 version:1,
 ranks:[{name:'Plumber Recruit',min:0,color:'#a9bac7'},{name:'Plumber Cadet',min:200,color:'#55b9ff'},{name:'Plumber Agent',min:500,color:'#a8ef62'},{name:'Elite Plumber',min:1000,color:'#bc8bff'},{name:'Magister',min:1700,color:'#ffda65'}],
 standing(points=0){points=Math.max(0,Math.floor(Number(points)||0));const ranks=this.ranks,index=Math.max(0,ranks.findLastIndex(r=>points>=r.min));return {...ranks[index],points,next:ranks[index+1]||null};},
 changes(a,b,winner,forfeit=false){
  if(winner===-1)return [0,0];
  const expected=1/(1+10**((b-a)/400));
  const change=Math.max(5,Math.round(32*((winner===0?1:0)-expected)*(winner===0?1:-1)));
  const lose=change+(forfeit?5:0);
  return (winner===0?[change,-Math.min(b,lose)]:[-Math.min(a,lose),change]).map(n=>n||0);
 }
});
