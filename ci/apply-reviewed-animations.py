"""Apply individually checked native revisions after restoring the pinned base artwork."""
from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1];p=R/'web/assets/cels/manifest.json';m=json.loads(p.read_text());phases={}
for revfile in sorted((R/'ci/animation-review/characters').glob('*/revision.json')):
 rev=json.loads(revfile.read_text());c=rev['character'];assert m['characters'][c['id']]['name']==c['name']
 for sheet in c['sheets']:
  asset=R/'web'/sheet['src'];assert asset.is_file();assert hashlib.sha256(asset.read_bytes()).hexdigest()==sheet['sha256']
 assert len(c['frames'])==32 and len(c['clips'])==12
 m['characters'][c['id']]=c;phases[str(c['id'])]=rev['power_phases']
 if 'close_combat' in rev:
  close=rev['close_combat'];asset=R/'web'/close['src'];assert hashlib.sha256(asset.read_bytes()).hexdigest()==close['sha256']
  assert c['id']==32 and len(close['frames'])==8
  (R/'web/rath-close.js').write_text("'use strict';\nconst RATH_CLOSE="+json.dumps(close,separators=(',',':'))+';\n')
assert len(m['characters'])==92
p.write_text(json.dumps(m,indent=2)+'\n');(R/'web/cel-data.js').write_text("'use strict';\nconst CEL_DATA="+json.dumps(m,separators=(',',':'))+';\n')
profile=R/'web/power-profiles.js';source=profile.read_text().split('// BEGIN REVIEWED_NATIVE_PHASES')[0].rstrip()+'\n'
source+='// BEGIN REVIEWED_NATIVE_PHASES\n// Native body-only cel registration, shared by browser and authoritative server.\nconst REVIEWED_NATIVE_PHASES='+json.dumps(phases,separators=(',',':'))+';\nfor(const [id,rows] of Object.entries(REVIEWED_NATIVE_PHASES)){for(let slot=0;slot<4;slot++)POWER_PROFILES.aliens[Number(id)][slot].phases=rows[slot];}\n// END REVIEWED_NATIVE_PHASES\n';profile.write_text(source)
print('Applied reviewed native character revisions:',','.join(phases) or 'none')
