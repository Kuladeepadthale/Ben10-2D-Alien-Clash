"""Export native cel sprites, registration metadata and a minimal Android web bundle."""
from pathlib import Path
import json, shutil, re, argparse
parser=argparse.ArgumentParser();parser.add_argument("--new-only",action="store_true");parser.add_argument("--skip-bundle",action="store_true");args=parser.parse_args()
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[1]
WEB=ROOT/'web'; SRC=ROOT/'ci/cel-sources'; OUT=WEB/'assets/cels'
NAMES=json.loads((ROOT/'ci/roster.json').read_text())
previous=json.loads((OUT/"manifest.json").read_text())["characters"] if args.new_only else []
if OUT.exists() and not args.new_only: shutil.rmtree(OUT)
OUT.mkdir(parents=True,exist_ok=True)
def save_native(im,base):
    dest=base.with_suffix('.png');im.save(dest,'PNG',compress_level=3)
    Image.open(dest).verify();return dest
manifest={'version':1,'rendering':'Native discrete cel frames. No optical flow, crossfade or frame blending.','characters':previous[:10]}
for id,name in enumerate(NAMES):
    if args.new_only and id<10: continue
    folder=OUT/name;folder.mkdir(exist_ok=True)
    kinds=['walk','actions','strike-jet','powers-states','reactions'] if id==0 else ['walk','jump-strike','powers','states']
    processed=[]
    character={'id':id,'name':name,'sheets':[],'frames':[],'clips':{}}
    for si,kind in enumerate(kinds):
        source=SRC/(name+'-'+kind+'.webp')
        if not source.exists(): source=SRC/(name+'-'+kind+'.png')
        sheet=Image.open(source).convert('RGBA'); clean=Image.new('RGBA',sheet.size)
        assert sheet.width/sheet.height>1.8,(name,kind,sheet.size)
        for i in range(8):
            x0=round(i%4*sheet.width/4);x1=round((i%4+1)*sheet.width/4)
            y0=round(i//4*sheet.height/2);y1=round((i//4+1)*sheet.height/2)
            cell=sheet.crop((x0,y0,x1,y1));a=np.array(cell)
            labels,count=ndimage.label(a[:,:,3]>32,structure=np.ones((3,3)))
            assert count>0,(name,kind,i)
            areas=np.bincount(labels.ravel());areas[0]=0
            main=int(areas.argmax())
            # Keep small detached hands/details close to the body as well as the main
            # silhouette. Drop remote fragments from neighboring animation cells.
            near=ndimage.binary_dilation(labels==main,iterations=max(3,round(min(cell.size)*.04)))
            keep=np.unique(labels[near]);keep=keep[keep!=0]
            a[:,:,3]=np.where(np.isin(labels,keep),a[:,:,3],0)
            cell=Image.fromarray(a);b=cell.getchannel('A').getbbox();assert b and b[2]-b[0]>30 and b[3]-b[1]>30
            # X is the torso/hips rather than extended hands, tail or attack silhouette.
            yy,xx=np.indices(a.shape[:2]); alpha=a[:,:,3]>180
            band=alpha&(yy>cell.height*.48)&(yy<cell.height*.72)
            anchor=float(np.median(xx[band])) if band.any() else cell.width/2
            ground=b[3]
            # Tucked apex is airborne above the same virtual ground, never cropped at the ankles.
            if (kind=='actions' or kind=='jump-strike') and i==2: ground=min(cell.height-3,ground+cell.height*.15)
            rect=[x0+b[0],y0+b[1],b[2]-b[0],b[3]-b[1]]
            character['frames'].append({'sheet':si,'rect':rect,'origin':[round(anchor-b[0],2),round(ground-b[1],2)],'source':kind,'cell':i,'bounds':list(b)})
            clean.paste(cell,(x0,y0))
        # Package the isolated cells used to calculate frame bounds. The original
        # sheet can contain disconnected neighboring hands/tails inside those bounds.
        dest=save_native(clean,folder/kind);processed.append(dest)
        character['sheets'].append({'src':'assets/cels/'+name+'/'+dest.name,'width':sheet.width,'height':sheet.height})
    if id==0:
        character['clips']={'walk':list(range(8)),'jump':list(range(8,12)),'skill0':list(range(12,16)),'normal':list(range(16,20)),'skill1':list(range(20,24)),'skill2':[24,25,26],'ultimate':[27,28,29],'idle':[30,38,39],'guard':[31],'hit':[32,33],'ko':[34,35],'dash':[36,37]}
    else:
        character['clips']={'walk':list(range(8)),'jump':list(range(8,12)),'normal':list(range(12,16)),'skill0':[16,17,18],'skill1':[19,20,21],'skill2':[22,23],'ultimate':[24,25,26],'idle':[27],'guard':[28],'hit':[29],'ko':[30],'dash':[31]}
    idle=character['frames'][character['clips']['idle'][0]]; character['referenceHeight']=idle['rect'][3]
    sheet=Image.open(processed[idle['sheet']]);x,y,w,h=idle['rect'];portrait=sheet.crop((x,y,x+w,y+h));portrait.thumbnail((300,400),Image.Resampling.LANCZOS);portrait_dest=save_native(portrait,folder/'portrait')
    character['portrait']='assets/cels/'+name+'/'+portrait_dest.name
    manifest['characters'].append(character)
(WEB/'cel-data.js').write_text("'use strict';\nconst CEL_DATA="+json.dumps(manifest,separators=(',',':'))+';\n')
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2))
if args.skip_bundle:
    print("Exported new alien frames and combined manifest.");raise SystemExit(0)
# Include only assets actually used by the new player, not the obsolete blended atlases.
bundle=ROOT/'builds/web'
if bundle.exists():shutil.rmtree(bundle)
bundle.mkdir(parents=True)
html=(WEB/'index.html').read_text();files=['index.html']+re.findall(r'(?:src|href)="([^"?#]+\.(?:js|css))(?=[?"])',html)
for file in files: shutil.copyfile(WEB/file,bundle/file)
shutil.copytree(OUT,bundle/'assets/cels',copy_function=shutil.copyfile)
shutil.copytree(WEB/'assets/ui',bundle/'assets/ui',copy_function=shutil.copyfile)
for file in ['assets/animation-manifest-example.json']:
    if (WEB/file).exists(): (bundle/file).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(WEB/file,bundle/file)
print('Exported',sum(len(c['frames']) for c in manifest['characters']),'native cels across 22 complete action sets.')


