from pathlib import Path
import zipfile,hashlib,base64,json,struct
root=Path('release-output');lp=lambda b:struct.pack('<I',len(b))+b
b64=lambda b:base64.b64encode(b).decode()
def fold(s):
 b=s.encode();out=[]
 while len(b)>70:out.append(b[:70]);b=b' '+b[70:]
 return b'\r\n'.join(out+[b])+b'\r\n'
aab=root/'Ben10-Omniverse-13.3-unsigned.aab'
with zipfile.ZipFile(aab) as z:
 m=b'Manifest-Version: 1.0\r\nCreated-By: Ben10 release packaging\r\n\r\n'
 for n in sorted(z.namelist()):
  if not n.endswith('/') and not n.startswith('META-INF/'):m+=fold('Name: '+n)+fold('SHA-256-Digest: '+b64(hashlib.sha256(z.read(n)).digest()))+b'\r\n'
sf=b'Signature-Version: 1.0\r\n'+fold('SHA-256-Digest-Manifest: '+b64(hashlib.sha256(m).digest()))+b'\r\n'
(root/'MANIFEST.MF').write_bytes(m);(root/'BEN10.SF').write_bytes(sf)
apk=root/'Ben10-Omniverse-13.3-unsigned.apk';data=apk.read_bytes();eocd=data.rfind(b'PK\x05\x06');assert eocd>=0
cd=struct.unpack_from('<I',data,eocd+16)[0];assert data[cd:cd+4]==b'PK\x01\x02'
chunks=[]
for section in [data[:cd],data[cd:eocd],data[eocd:]]:
 for i in range(0,len(section),1024*1024):
  c=section[i:i+1024*1024];chunks.append(hashlib.sha256(b'\xa5'+struct.pack('<I',len(c))+c).digest())
digest=hashlib.sha256(b'\x5a'+struct.pack('<I',len(chunks))+b''.join(chunks)).digest()
cert=base64.b64decode(Path('ci/release133/upload-certificate.b64').read_text());signed=lp(lp(struct.pack('<I',0x0103)+lp(digest)))+lp(lp(cert))+lp(b'')
req={'aabSha256':hashlib.sha256(aab.read_bytes()).hexdigest(),'apkSha256':hashlib.sha256(data).hexdigest(),'sf':b64(sf),'apkSignedData':b64(signed)}
(root/'signing-request.json').write_text(json.dumps(req,indent=2));print('SIGNING_REQUEST='+json.dumps(req))
