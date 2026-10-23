"""Launch registration must touch the actual native pose, never empty padding."""
from pathlib import Path
from functools import lru_cache
import json
from PIL import Image
R=Path(__file__).resolve().parents[1]
def constant(path,name):
    text=(R/path).read_text().split('const '+name+'=',1)[1].lstrip()
    return json.JSONDecoder().raw_decode(text)[0]
profiles=constant('web/power-profiles.js','POWER_PROFILES')
# Match the runtime registration overrides applied after the pinned base constant.
source=(R/'web/power-profiles.js').read_text()
if 'const REVIEWED_NATIVE_PHASES=' in source:
    for fighter,rows in constant('web/power-profiles.js','REVIEWED_NATIVE_PHASES').items():
        for slot,phases in enumerate(rows):
            profiles['aliens'][int(fighter)][slot]['phases']=phases
cels=constant('web/cel-data.js','CEL_DATA')
villains=constant('web/villain-data.js','VILLAIN_DATA')
@lru_cache(maxsize=16)
def sheet(path):
    return Image.open(R/'web'/path).convert('RGBA')
checked=0
for is_villain in [False,True]:
    for fighter,row in enumerate(profiles['villains' if is_villain else 'aliens']):
        char=(villains if is_villain else cels)['characters'][fighter]
        for ability in row:
            for phase in ability['phases']:
                frame=char['frames'][phase['frame']]
                x,y,w,h=frame['rect'];px,py=phase['pixel']
                path=char['src'] if is_villain else char['sheets'][frame['sheet']]['src']
                assert 0<=px<w and 0<=py<h,(fighter,ability['name'],phase)
                assert sheet(path).getpixel((x+px,y+py))[3]>180,(fighter,ability['name'],'detached emitter')
                checked+=1
print('Passed',checked,'native-pixel launch registrations across 92 aliens and 50 villains.')


