from pathlib import Path
from PIL import Image
import json,hashlib
root=Path(__file__).resolve().parents[1]/'web'
m=json.loads((root/'assets/portraits-v107/manifest.json').read_text())
base=json.loads((root/'assets/cels/manifest.json').read_text())['characters']
assert len(m['characters'])==20
for r in m['characters']:
 p=root/r['src'];im=Image.open(p).convert('RGBA');old=Image.open(root/base[r['id']]['portrait'])
 assert im.size==(r['width'],r['height'])
 assert im.height>old.height*1.8,(r['name'],im.height,old.height)
 assert im.getchannel('A').getextrema()[0]==0
 assert hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256']
 assert im.getchannel('A').getbbox()
print('Passed: 20 newly drawn native portraits with transparent alpha, complete bounds, pinned hashes and more than 1.8x previous source height.')
