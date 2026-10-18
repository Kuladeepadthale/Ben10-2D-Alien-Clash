from pathlib import Path
from zipfile import ZipFile, ZIP_STORED
import hashlib,json,subprocess
root=Path(__file__).parent/'output'
videos=sorted(root.glob('*.mp4'))
assert len(videos)==4
for p in videos:
 metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=width,height','-show_entries','format=duration','-of','json',str(p)]))
 assert metadata['streams'][0]['width']==1920 and metadata['streams'][0]['height']==1080
 expected=12 if p.name=='Heatblast-Cel-Preview.mp4' else 4
 assert abs(float(metadata['format']['duration'])-expected)<.1
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
(root/'README.txt').write_text('Heatblast cel-clip visual test\n\nHeatblast-Cel-Preview.mp4: combined walk, jump and fireball preview.\nThe other three MP4 files are separate action clips.\n\nThis is a test of newly drawn, unblended sprite sequences. It is not an APK update or animation extracted from the TV series. Extra in-between drawings and timing review are still needed before production use.\n')
with ZipFile(root/'Heatblast-Action-Clips.zip','w',ZIP_STORED) as z:
 for p in videos+[root/'README.txt']:z.write(p,p.name)
with ZipFile(root/'Heatblast-Action-Clips.zip') as z:assert z.testzip() is None
(root/'SHA256SUMS.txt').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n' for p in videos+[root/'Heatblast-Action-Clips.zip']))
print('Validated four MP4 files and video ZIP.')
