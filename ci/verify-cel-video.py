from pathlib import Path
import subprocess,json,zipfile,hashlib
p=Path('previews/All-Aliens-Cel-Actions.mp4')
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height,duration','-of','json',str(p)]))['streams'][0]
assert (info['width'],info['height'])==(1920,1080)
assert abs(float(info['duration'])-146)<.05,info
subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
with zipfile.ZipFile('previews/All-Aliens-Cel-Preview.zip','w',zipfile.ZIP_DEFLATED) as z:
 z.write(p,p.name)
 z.writestr('README.txt','All ten aliens, every action, rendered with the same cel player used by the game.\n1080p30 H.264 MP4. Newly generated cel artwork; not footage taken from the TV series.\n')
print('Validated complete decodable video:',info)
