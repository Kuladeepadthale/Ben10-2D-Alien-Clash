'use strict';
// Timing and whole-body presentation only: every limb remains in its original illustrated pose.
const CARTOON_GAITS=[
 {style:'Balanced strides',stride:.82,bob:.35,weight:0},
 {style:'Heavy, deliberate strides',stride:.82,bob:.8,weight:.026},
 {style:'Measured armored steps',stride:.80,bob:.25,weight:.018},
 {style:'Alternating skate pushes and glides',stride:1.05,bob:0,skate:true},
 {style:'Four-legged bounding',stride:1.05,bob:1.6,weight:0},
 {style:'Quick, light steps',stride:.94,bob:.45,weight:0},
 {style:'Long, fluid strides',stride:.98,bob:.3,weight:.012},
 {style:'Fluttering hover',stride:.85,bob:.9,hover:true},
 {style:'Low, deliberate stalking',stride:.94,bob:.4,weight:.021},
 {style:'Floating spectral glide',stride:1.10,bob:1.6,hover:true},
 {style:'Heavy shell steps',stride:.70,bob:.5},
 {style:'Five-vine planted crawl',stride:.85,bob:.25},
 {style:'Digitigrade stalking',stride:.95,bob:.5},
 {style:'Trailing mummy strides',stride:.80,bob:.3},
 {style:'Heavy conductor steps',stride:.78,bob:.6},
 {style:'Short Gourmand steps',stride:.78,bob:.5},
 {style:'Springy Splixson steps',stride:.90,bob:.6},
 {style:'Measured Opticoid walk',stride:.83,bob:.3},
 {style:'Long giant strides',stride:.92,bob:.4},
 {style:'Low reptile crawl',stride:.92,bob:.5},
 {style:'Heavy waddling steps',stride:.65,bob:.45},
 {style:'Quick battery steps',stride:.9,bob:.35}
];
CARTOON_GAITS.push(...[
 {style:'Rooted plant strides',stride:.85},
 {style:'Quick light steps',stride:.85},
 {style:'Heavy dinosaur strides',stride:.80},
 {style:'Aerodynamic steps',stride:1.02},
 {style:'Cloaked spectral steps',stride:.92,hover:true},
 {style:'Measured crystal strides',stride:.82},
 {style:'Six-legged crab scuttle',stride:.72},
 {style:'Agile monkey strides',stride:.95},
 {style:'Elastic fluid strides',stride:.92},
 {style:'Calm celestial strides',stride:.84}
]);
function cartoonSkatePhase(p){const half=Math.floor(p*2),u=p*2-half;let q;
 // A short push, long extended-wheel glide, then a smooth transfer to the other leg.
 if(u<.28)q=u/.28*.66;else if(u<.82)q=.66+(u-.28)/.54*.04;else q=.70+(u-.82)/.18*.30;
 return (half+q)/2;
}
function cartoonGaitPhase(f,s,t,walking){
 if(!s.cartoon)s.cartoon={x:f.x,distance:0,walking:false,dir:f.dir||1};const g=s.cartoon,profile=CARTOON_GAITS[f.id];
 if((f.dir||1)!==g.dir){g.distance=-g.distance;g.dir=f.dir||1;}
 if(walking&&!g.walking)g.distance=0;
 if(walking&&g.walking)g.distance+=(f.x-g.x)*(f.dir||1);
 g.x=f.x;g.walking=walking;
 const height=aliens[f.id].renderHeight*aliens[f.id].scale,cycle=height*profile.stride,p=((g.distance/cycle)%1+1)%1;
 return profile.skate?cartoonSkatePhase(p):p-(profile.weight||0)*Math.sin(p*Math.PI*4);
}



CARTOON_GAITS.push(...[{"style":"Tiger strides","stride":0.88,"hover":false},{"style":"Magnetic steps","stride":0.82,"hover":false},{"style":"Winged micro-flight","stride":0.9,"hover":true},{"style":"Armored Orishan steps","stride":0.78,"hover":false},{"style":"Amperi hover","stride":0.88,"hover":true},{"style":"Heavy piston steps","stride":0.72,"hover":false},{"style":"Shell strides","stride":0.8,"hover":false},{"style":"Containment-suit march","stride":0.7,"hover":false},{"style":"Citrakayah sprint","stride":1.02,"hover":false},{"style":"Stealthy reptile steps","stride":0.92,"hover":false},{"style":"Armored beetle steps","stride":0.76,"hover":false},{"style":"Clockwork march","stride":0.74,"hover":false},{"style":"Quick engineer steps","stride":0.88,"hover":false},{"style":"Heavy electric strides","stride":0.82,"hover":false},{"style":"Conductoid strides","stride":0.9,"hover":false},{"style":"Segmented knuckle walk","stride":0.82,"hover":false},{"style":"Planetoid steps","stride":0.74,"hover":false},{"style":"Spring-leg bounds","stride":1.05,"hover":false},{"style":"Four-legged insect scuttle","stride":0.92,"hover":false},{"style":"Jet-assisted glide","stride":1.0,"hover":true}]);

// expansion100
CARTOON_GAITS.push(...[{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Floating glide","stride":0.85,"hover":true},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Floating glide","stride":0.85,"hover":true},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Floating glide","stride":0.85,"hover":true},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Floating glide","stride":0.85,"hover":true},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false},{"style":"Natural character strides","stride":0.85,"hover":false}]);
// expansion111 gaits
CARTOON_GAITS.push(...[{"style":"quadruped movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"gorilla movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"giant movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"reptile movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"hover movement","stride":0.85,"bob":0.4,"hover":true,"skate":false},{"style":"tiger movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"hover movement","stride":0.85,"bob":0.4,"hover":true,"skate":false},{"style":"wolf movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"fluid movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"armored movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"stalker movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"balanced movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"dinosaur movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"four-arms movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"skate movement","stride":1.02,"bob":0.4,"hover":false,"skate":true},{"style":"hover movement","stride":0.85,"bob":0.4,"hover":true,"skate":false},{"style":"plant movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"armored movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"heavy movement","stride":0.85,"bob":0.4,"hover":false,"skate":false},{"style":"giant movement","stride":0.85,"bob":0.4,"hover":false,"skate":false}]);


// v12.6 locomotion-only corrections. Native drawings and approved stride profiles stay intact.
const LOCOMOTION126_FLIGHT={
 25:{style:'Membrane-wing glide',clip:'jump',pose:2,lift:18},
 33:{style:'Magnetic levitation',clip:'idle',pose:0,lift:12},
 51:{style:'Jet-assisted glide',clip:'jump',pose:2,lift:18},
 69:{style:'Sonic-disc hover',clip:'jump',pose:2,lift:12}
};
const locomotionSamples126=new WeakMap();
function locomotionTravel126(f,state){
 const key=Number.isInteger(f.villain)?'v'+f.villain:'a'+f.id,counter=Number.isFinite(f.gaitDistance126)?f.gaitDistance126:null;
 let s=locomotionSamples126.get(f);
 if(!s||s.key!==key){s={key,x:f.x,counter,distance:counter||0,state};locomotionSamples126.set(f,s);return s.distance;}
 const dx=f.x-s.x,moving=state==='walk';
 if(moving){
  // Simulation-owned travel survives short taps, low render rates and repeated emitter queries.
  if(counter!==null&&s.counter!==null&&counter>s.counter)s.distance+=counter-s.counter;
  // Older online snapshots and preview/test actors do not carry the new optional travel counter.
  else if((s.state==='walk'||s.state==='idle')&&Math.abs(dx)<=Math.max(80,(f.config?.speed||aliens[f.id]?.speed||300)*.25))s.distance+=Math.abs(dx);
 }
 s.x=f.x;s.counter=counter;s.state=state;return s.distance;
}
function locomotionFlight126(f){return !Number.isInteger(f.villain)?LOCOMOTION126_FLIGHT[f.id]:null;}
function locomotionVillain126(f){
 const id=f.villain;
 if(id===28)return {mode:'hover',stride:.9};
 if(id===33)return {mode:'slither',stride:1.02};
 if(id===9)return {mode:'fluid',stride:.83};
 if([16,26,44].includes(id))return {mode:'scuttle',stride:.62};
 if([4,20,21,29,31,39,40,42,43,49].includes(id))return {mode:'heavy',stride:.88};
 if([14,18,30,41,45].includes(id))return {mode:'run',stride:.9};
 return {mode:'walk',stride:.72};
}
function locomotionLift126(f,t){
 if(Number.isInteger(f.villain))return locomotionVillain126(f).mode==='hover'?8+Math.sin(t*3):0;
 const flight=locomotionFlight126(f);if(flight)return flight.lift+Math.sin(t*2.6)*1.2;
 // Preserve previously approved hover offsets and Big Chill's existing cloaked native walk.
 return f.id===7||f.id===9||(f.id>=52||f.id===34||f.id===36)&&CARTOON_GAITS[f.id]?.hover?6+Math.sin(t*(f.id===7?8:3))*1.5:0;
}
function locomotionNoFootsteps126(f){
 if(Number.isInteger(f.villain))return ['hover','slither','fluid'].includes(locomotionVillain126(f).mode);
 return !!locomotionFlight126(f)||!!CARTOON_GAITS[f.id]?.hover||[6,30,80].includes(f.id);
}
function locomotionVillainFrame126(f,d,state,t){
 const travel=locomotionTravel126(f,state),p=locomotionVillain126(f);
 if((state==='walk'||state==='idle')&&p.mode==='hover')return [1,2,3,2][Math.floor(t*3)%4];
 if(state!=='walk')return null;
 const cycle=Math.max(48,(d.height||226)*p.stride),phase=(travel/cycle)%1;
 return [1,2,3,2][Math.floor(phase*4)%4];
}

function locomotionMoving126(f){
 const s=locomotionSamples126.get(f);if(!s||!['idle','walk'].includes(s.state))return false;
 const distance=Math.abs(f.x-s.x);return distance>.05&&distance<=Math.max(80,(f.config?.speed||aliens[f.id]?.speed||300)*.25);
}
