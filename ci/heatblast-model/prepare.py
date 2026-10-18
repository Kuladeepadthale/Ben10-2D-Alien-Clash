from PIL import Image
from pathlib import Path
out=Path('tmp/heatblast-model');out.mkdir(parents=True,exist_ok=True)
Image.open('web/assets/classic/heatblast/portrait.webp').convert('RGBA').save(out/'original-portrait.png')
print('Prepared the existing original portrait for Blender texture loading.')
