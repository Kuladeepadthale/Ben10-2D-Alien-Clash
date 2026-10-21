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
