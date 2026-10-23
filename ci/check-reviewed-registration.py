"""Reviewed native launch offsets must use the actual configured physical body scale."""
from pathlib import Path
import json,subprocess
R=Path(__file__).resolve().parents[1]
config=json.loads(subprocess.check_output(['node','-e',"const fs=require('fs'),vm=require('vm'),b=vm.createContext({});vm.runInContext(fs.readFileSync('web/data.js','utf8'),b);console.log(vm.runInContext('JSON.stringify(aliens)',b))"],cwd=R));checked=0
for slug in ['water-hazard','rath','lodestar','nanomech','ampfibian']:
 rec=json.loads((R/'ci/animation-review/characters'/f'{slug}.json').read_text());rev=json.loads((R/'ci/animation-review/characters'/slug/'revision.json').read_text());c=rev['character'];a=config[c['id']]
 assert rec['renderHeight']==a['renderHeight'] and rec['scale']==a['scale'],(slug,'export configuration mismatch')
 for row in rev['power_phases']:
  for p in row:
   f=c['frames'][p['frame']];s=a['renderHeight']*a['scale']/f.get('referenceHeight',c['referenceHeight']);expected=[(p['pixel'][axis]-f['origin'][axis])*s for axis in [0,1]]
   assert all(abs(expected[i]-p['offset'][i])<.00051 for i in [0,1]),(slug,p['frame'],'detached physical launch offset');checked+=1
print('Passed',checked,'reviewed native launch offsets against actual configured body sizes')
