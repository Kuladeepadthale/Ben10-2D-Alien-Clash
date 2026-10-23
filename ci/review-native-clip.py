"""Replace an inconsistent animation cel using an inspected existing native body pose."""
from pathlib import Path
import json,sys,hashlib,subprocess
R=Path(__file__).resolve().parents[1];id=int(sys.argv[1]);replacement=int(sys.argv[2]);marker_key=sys.argv[3]
def constant(p,n):return json.JSONDecoder().raw_decode(p.read_text().split('const '+n+'=',1)[1].lstrip())[0]
m=constant(R/'web/cel-data.js','CEL_DATA');c=m['characters'][id];profiles=constant(R/'web/power-profiles.js','POWER_PROFILES');rows=[a['phases'] for a in profiles['aliens'][id]]
assert c['clips']['ultimate']==[24,25,26]
f=c['frames'][replacement];assert marker_key in f['emitters'];point=f['emitters'][marker_key];f['emitters']['ultimate']=point;c['clips']['ultimate']=[24,replacement,26];c['reviewedRevision']=1
config=json.loads(subprocess.check_output(['node','-e',"const vm=require('vm'),fs=require('fs'),b=vm.createContext({});vm.runInContext(fs.readFileSync('web/data.js','utf8'),b);console.log(vm.runInContext('JSON.stringify(aliens["+str(id)+"])',b))"],cwd=R))
s=config['renderHeight']*config['scale']/f.get('referenceHeight',c['referenceHeight']);rows[3][1]={'frame':replacement,'pixel':point,'offset':[round((point[0]-f['origin'][0])*s,3),round((point[1]-f['origin'][1])*s,3)]}
for sheet in c['sheets']:sheet['sha256']=hashlib.sha256((R/'web'/sheet['src']).read_bytes()).hexdigest()
p=R/'ci/animation-review/characters'/c['name']/'revision.json';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps({'id':id,'slug':c['name'],'character':c,'power_phases':rows,'sources':{},'generated_with':'Inspected existing native cel reuse; no image generation','notes':['Replace generic spherical ultimate body with character-specific native gesture; preserve configured ability and effects.']},indent=2)+'\n');print(id,c['name'],'ultimate active',replacement)
