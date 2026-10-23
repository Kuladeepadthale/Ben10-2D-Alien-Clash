"""Regression: frame pixels and extended body parts survive source-grid crossings."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from full_poses import whole_poses,pack_poses

ROOT=Path(__file__).resolve().parents[1]

def check_character(c):
    count=0
    sheets=[np.array(Image.open(ROOT/'web'/s['src']).convert('RGBA'))[:,:,3] for s in c['sheets']]
    for f in c['frames']:
        x,y,w,h=f['rect'];a=sheets[f['sheet']][y:y+h,x:x+w]
        assert not a[:6].any() and not a[-6:].any() and not a[:,:6].any() and not a[:,-6:].any(),(c['name'],f['source'],f['cell'],'opaque frame edge')
        assert int((a>100).sum())==f['sourcePixels'],(c['name'],f['source'],f['cell'],'lost or foreign body pixels')
        assert len(f['sourceRect'])==4
        for key,(ex,ey) in f.get('emitters',{}).items():
            assert 0<=ex<w and 0<=ey<h and a[ey,ex]>180,(c['name'],key,'emitter outside drawn character')
        count+=1
    for key in ['normal','skill0','skill1','skill2','ultimate']:
        assert all(key in c['frames'][fi].get('emitters',{}) for fi in c['clips'][key]),(c['name'],key,'missing action emitter')
    return count

if __name__=='__main__':
    m=json.loads((ROOT/'web/assets/cels/manifest.json').read_text())
    assert len(m['characters'])==92
    count=sum(check_character(c) for c in m['characters'])
    for c in m['characters'][22:32]:
        idle=c['frames'][c['clips']['idle'][0]]
        assert max(idle['rect'][2:])>=300,(c['name'],'low-detail source regression')
        assert len(c['frames'])==32 and len(c['sheets'])==4

    # Screenshot regressions: Frankenstrike's boots must extend below the old half-sheet cut;
    # Spitter's complete first pose extends past the old quarter-sheet cut.
    source=Image.open(ROOT/'ci/cel-sources/frankenstrike-states.webp')
    poses=whole_poses(source)
    assert poses[3][1]['sourceRect'][3]>source.height/2+30
    source=Image.open(ROOT/'ci/cel-sources/spitter-states.webp')
    poses=whole_poses(source)
    assert poses[0][1]['sourceRect'][2]>source.width/4+15
    # Synthetic crossed grid lines: two rows of complete poses deliberately protrude.
    image=Image.new('RGBA',(400,200))
    for y in [0,100]:
        for x in [0,100,200,300]:
            image.paste((90,180,90,255),(x+15,y+10,x+85,min(200,y+96)))
    packed,positions=pack_poses(whole_poses(image))
    assert len(positions)==8
    print('Passed:',count,'whole-body frames across 72 aliens; transparent frame margins; exact source-pixel preservation; Frankenstrike boots and Spitter tail regression checks.')


