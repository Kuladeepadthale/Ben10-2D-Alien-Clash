"""Validate bundled animation data and complete PNG streams without optional libraries."""
from pathlib import Path
import json,struct,zlib,hashlib
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'web/assets/drawn-aliens/manifest.json').read_text())
assert set(manifest['characters'])==set(map(str,range(1,10)))
for alien in manifest['characters'].values():
 raw=(root/'web'/alien['src']).read_bytes()
 assert hashlib.sha256(raw).hexdigest()==alien['sha256'],alien['name']+' checksum'
 assert raw[:8]==b'\x89PNG\r\n\x1a\n'
 offset=8;chunks=[];ended=False
 while offset<len(raw):
  assert offset+12<=len(raw)
  size=struct.unpack('>I',raw[offset:offset+4])[0];kind=raw[offset+4:offset+8];data=raw[offset+8:offset+8+size];crc=raw[offset+8+size:offset+12+size]
  assert len(data)==size and len(crc)==4,alien['name']+' truncated PNG'
  assert zlib.crc32(kind+data)&0xffffffff==struct.unpack('>I',crc)[0]
  if kind==b'IHDR':assert struct.unpack('>II',data[:8])==(alien['width'],alien['height']) and data[8:10]==b'\x08\x06'
  if kind==b'IDAT':chunks.append(data)
  offset+=size+12
  if kind==b'IEND':ended=True;break
 assert ended and offset==len(raw)
 decoded=zlib.decompress(b''.join(chunks));assert len(decoded)==(alien['width']*4+1)*alien['height']
 assert len(alien['frames'])==48 and len(alien['masks'])==48
 for (x,y,w,h,ox,oy),runs in zip(alien['frames'],alien['masks']):
  assert x>=0 and y>=0 and x+w<=alien['width'] and y+h<=alien['height'] and oy==h
  assert len(runs)%2==0 and len(runs)>0
  last=0
  for start,count in zip(runs[::2],runs[1::2]):assert start>=last and count>0 and start+count<=w*h;last=start+count
print('PASS: nine complete PNG streams, checksums, 432 registered frames and silhouette masks')
