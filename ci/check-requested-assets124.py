from pathlib import Path
import json,hashlib,runpy
from PIL import Image
import numpy as np
R=Path(__file__).resolve().parents[1];check=runpy.run_path(str(R/'ci/check-full-poses.py'))['check_character'];total=0
for slug in ['wildmutt','ripjaws','wildvine','snare-oh','upchuck','spitter','the-worst']:
 r=json.loads((R/'ci/animation-review/characters'/slug/'revision.json').read_text());c=r['character'];assert c['requestedRepair124'];total+=check(c)
 for s in c['sheets']:
  assert hashlib.sha256((R/'web'/s['src']).read_bytes()).hexdigest()==s['sha256']
 idle=c['frames'][27];im=Image.open(R/'web'/c['portrait']);assert im.size==(idle['rect'][2]-16,idle['rect'][3]-16)
print('Passed requested seven characters:224 complete native frames, source pixels, transparent margins, native hashes and standing-pose registration.')

for baseline in json.loads((R/'ci/animation-review/requests124/standing-baseline.json').read_text()):
 c=json.loads((R/'ci/animation-review/characters'/baseline['slug']/'revision.json').read_text())['character'];f=c['frames'][27];im=Image.open(R/'web'/c['portrait']);a=np.array(im);a[a[:,:,3]<=100]=0
 assert hashlib.sha256(a.tobytes()).hexdigest()==baseline['visible_pose_sha256'];assert f['origin']==baseline['origin'];assert f['referenceHeight']==baseline['referenceHeight']
print('All7 original standing images/anchors/heights preserved exactly.')
