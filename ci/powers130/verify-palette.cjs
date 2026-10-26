const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),b=vm.createContext({});
vm.runInContext(fs.readFileSync('web/power-profiles.js','utf8'),b);
for(const [id,color]of [[18,'#9edfff'],[39,'#ff754b']])assert(vm.runInContext(`POWER_PROFILES.aliens[${id}].every(p=>p.color==='${color}')`,b));
console.log('Passed Way Big pale-blue cosmic ray and NRG red-orange vent-energy palette across all four powers/basic mappings.');
