from pathlib import Path
import zipfile,hashlib,base64
root=Path('release-output');f=root/'Ben10-Omniverse-13.2-unsigned.aab'
def fold(s):
 b=s.encode();out=[]
 while len(b)>70:out.append(b[:70]);b=b' '+b[70:]
 return b'\r\n'.join(out+[b])+b'\r\n'
with zipfile.ZipFile(f) as z:
 manifest=b'Manifest-Version: 1.0\r\nCreated-By: Ben10 release packaging\r\n\r\n'
 for n in sorted(z.namelist()):
  if n.endswith('/') or n.startswith('META-INF/'):continue
  manifest+=fold('Name: '+n)+fold('SHA-256-Digest: '+base64.b64encode(hashlib.sha256(z.read(n)).digest()).decode())+b'\r\n'
 sf=b'Signature-Version: 1.0\r\nCreated-By: Ben10 release packaging\r\n'+fold('SHA-256-Digest-Manifest: '+base64.b64encode(hashlib.sha256(manifest).digest()).decode())+b'\r\n'
(root/'MANIFEST.MF').write_bytes(manifest);(root/'BEN10.SF').write_bytes(sf)
print('SIGNATURE_FILE_BASE64='+base64.b64encode(sf).decode())
