from pathlib import Path
import json,hashlib,runpy
from PIL import Image
import numpy as np
R=Path(__file__).resolve().parents[1];check=runpy.run_path(str(R/'ci/check-full-poses.py'))['check_character'];total=0
for base in json.loads((R/'ci/animation-review/requests125/standing-baseline.json').read_text()):
 slug=base['slug'];rec=json.loads((R/'ci/animation-review/characters'/f'{slug}.json').read_text());c=json.loads((R/'ci/animation-review/characters'/slug/'revision.json').read_text())['character'];assert c['requestedRepair125'];total+=check(c)
 for s in c['sheets']:assert hashlib.sha256((R/'web'/s['src']).read_bytes()).hexdigest()==s['sha256']
 f=c['frames'][27];im=Image.open(R/'web'/c['portrait']);a=np.array(im);a[a[:,:,3]<=100]=0;assert hashlib.sha256(a.tobytes()).hexdigest()==base['visible_pose_sha256'];assert f['origin']==base['origin'];assert f['referenceHeight']==base['referenceHeight'];assert 27 not in rec['changed_frames']
 for i in rec['changed_frames']:assert max(c['frames'][i]['rect'][2]-16,c['frames'][i]['rect'][3]-16)>=280
 assert im.height>=300
print('Passed128 complete native frames, source pixels/hashes/margins, four identical original standing poses/anchors/heights and native changed-pose detail.')
