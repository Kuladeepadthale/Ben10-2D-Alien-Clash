"""Launch registration must touch the actual native pose, never empty padding."""
from pathlib import Path
from functools import lru_cache
import json
from PIL import Image
R=Path(__file__).resolve().parents[1]
def constant(path,name):
    text=(R/path).read_text().split('const '+name+'=',1)[1].lstrip()
    return json.JSONDecoder().raw_decode(text)[0]
# Evaluate the same canonical overrides used by browser and Worker, rather than only the base literal.
import subprocess
node="const fs=require('fs'),vm=require('vm'),b=vm.createContext({});vm.runInContext(fs.readFileSync('web/power-profiles.js','utf8'),b);process.stdout.write(vm.runInContext('JSON.stringify(POWER_PROFILES)',b));"
profiles=json.loads(subprocess.check_output(['node','-e',node],cwd=R,text=True))
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



