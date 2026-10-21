"""Verify all four new native sheets per alien and prepare the cel export inputs."""
from pathlib import Path
import json,io,os
from PIL import Image
from full_poses import whole_poses
R=Path(__file__).resolve().parents[1]
names=json.loads((R/'ci/roster.json').read_text())[52:72]
assert len(names)==20
for name in names:
    for kind in ['walk','jump-strike','powers','states']:
        p=R/'ci/cel-sources'/(name+'-'+kind+'-native.webp')
        im=Image.open(p).convert('RGBA')
        poses=whole_poses(im)
        assert len(poses)==8,(name,kind)
        assert all(max(pose.size)>=200 for pose,_ in poses),(name,kind,'insufficient native detail')
        dest=R/'ci/cel-sources'/(name+'-'+kind+'.png')
        data=io.BytesIO();im.save(data,'PNG',compress_level=3)
        tmp=dest.with_suffix('.tmp');tmp.write_bytes(data.getvalue());os.replace(tmp,dest)
    print(name+': four complete native sheets, 32 whole poses')
