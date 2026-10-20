"""Check both install identities, versions, launch classes and pinned APK certificate."""
from pathlib import Path
import os, re, subprocess, zipfile
root=Path(__file__).resolve().parent.parent
tools=Path(os.environ['ANDROID_HOME'])/'build-tools'/'35.0.0'
expected=(root/'ci/signing/certificate.sha256').read_text().strip()
artifacts=[('Ben10-2D-Alien-Clash.apk','org.alienclash.twod','Ben 10 Alien Clash'),('Ben10-Alien-Clash-Online.apk','org.alienclash.twod.online','Ben 10 Alien Clash Online')]
configs=[]
for filename,package,label in artifacts:
 apk=root/'builds'/filename
 cert=subprocess.check_output([str(tools/'apksigner'),'verify','--verbose','--print-certs',str(apk)],text=True)
 digests=re.findall(r'certificate SHA-256 digest: ([0-9a-f]+)',cert)
 assert digests==[expected], (filename,digests)
 badging=subprocess.check_output([str(tools/'aapt'),'dump','badging',str(apk)],text=True)
 assert "package: name='"+package+"'" in badging,filename
 assert "versionCode='82'" in badging and "versionName='8.2'" in badging,filename
 assert "launchable-activity: name='org.alienclash.twod.MainActivity'" in badging,filename
 assert "application-label:'"+label+"'" in badging,filename
 with zipfile.ZipFile(apk) as z: configs.append(z.read('assets/multiplayer-config.js'))
 print(filename,package,'version 82; pinned signer',expected,'; launch activity verified')
assert configs[0]==configs[1]
assert b'wss://omnitrix-ranked-arena.kuladeepadthale.workers.dev/arena' in configs[0]



