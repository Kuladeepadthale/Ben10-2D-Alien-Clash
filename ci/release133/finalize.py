from pathlib import Path
import zipfile,hashlib,base64,json,struct
root=Path('staged');out=Path('final-output');out.mkdir(exist_ok=True)
r=json.loads((root/'signing-request.json').read_text());s=json.loads(Path('ci/release133/signature.json').read_text());assert r==s['request'];dec=base64.b64decode;lp=lambda b:struct.pack('<I',len(b))+b
for ext in ['aab','apk']:
 f=root/('Ben10-Omniverse-13.3-unsigned.'+ext);assert hashlib.sha256(f.read_bytes()).hexdigest()==r[ext+'Sha256']
with zipfile.ZipFile(root/'Ben10-Omniverse-13.3-unsigned.aab') as a,zipfile.ZipFile(out/'Ben10-Omniverse-13.3.aab','w',zipfile.ZIP_DEFLATED) as b:
 b.writestr('META-INF/MANIFEST.MF',(root/'MANIFEST.MF').read_bytes());b.writestr('META-INF/BEN10.SF',dec(r['sf']));b.writestr('META-INF/BEN10.RSA',dec(s['aabSignature']))
 for info in a.infolist():
  if not info.filename.startswith('META-INF/'):b.writestr(info,a.read(info.filename))
data=(root/'Ben10-Omniverse-13.3-unsigned.apk').read_bytes();eocd=data.rfind(b'PK\x05\x06');cd=struct.unpack_from('<I',data,eocd+16)[0]
# APK v2 signer: RSA PKCS#1 SHA-256, same original upload certificate as the AAB.
signer=lp(dec(r['apkSignedData']))+lp(lp(struct.pack('<I',0x0103)+lp(dec(s['apkSignature']))))+lp(dec(s['publicKey']))
v2=lp(lp(signer));pair=struct.pack('<Q',4+len(v2))+struct.pack('<I',0x7109871a)+v2
size=len(pair)+24;block=struct.pack('<Q',size)+pair+struct.pack('<Q',size)+b'APK Sig Block 42'
end=bytearray(data[eocd:]);struct.pack_into('<I',end,16,cd+len(block));(out/'Ben10-Omniverse-13.3.apk').write_bytes(data[:cd]+block+data[cd:eocd]+end)
print('Signed APK v2 and AAB assembled; SDK validators must pass before publication.')
