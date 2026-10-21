"""Extract each new alien's 32 whole poses, then pack four native action sheets."""
from pathlib import Path
import json
from PIL import Image
from full_poses import whole_poses,pack_poses
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'ci/cel-sources'
names=json.loads((ROOT/'ci/roster.json').read_text())[32:]
assert len(names)==20
for name in names:
    poses=whole_poses(Image.open(SRC/(name+'-master.webp')),columns=8,rows=4)
    assert len(poses)==32
    for row,kind in enumerate(['walk','jump-strike','powers','states']):
        sheet,_=pack_poses(poses[row*8:row*8+8],padding=24)
        sheet.save(SRC/(name+'-'+kind+'.png'))
    print(name+': 32 whole-body poses, four padded native sheets')
