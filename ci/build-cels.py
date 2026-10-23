"""Export native cel sprites, registration metadata and a minimal Android web bundle."""
from pathlib import Path
import json, shutil, re, argparse, subprocess
parser=argparse.ArgumentParser();parser.add_argument("--new-only",action="store_true");parser.add_argument("--skip-bundle",action="store_true");parser.add_argument("--from-id",type=int,default=None);args=parser.parse_args();start=args.from_id if args.from_id is not None else (10 if args.new_only else 0)
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[1]
WEB=ROOT/'web'; SRC=ROOT/'ci/cel-sources'; OUT=WEB/'assets/cels'
NAMES=json.loads((ROOT/'ci/roster.json').read_text())
emitter_profiles=json.loads(subprocess.check_output(['node','-e',"const fs=require('fs'),vm=require('vm');const b=vm.createContext({});console.log(vm.runInContext(fs.readFileSync('web/data.js','utf8')+';JSON.stringify(aliens.map(a=>({base:a.powerOrigin||[.94,.43],keys:a.powerOrigins||{}})))',b));"],cwd=ROOT,text=True))
assert len(emitter_profiles)==len(NAMES)
previous=json.loads((OUT/"manifest.json").read_text())["characters"] if start else []
if OUT.exists() and not start: shutil.rmtree(OUT)
OUT.mkdir(parents=True,exist_ok=True)
def save_native(im,base):
    from io import BytesIO
    dest=base.with_suffix('.webp');buffer=BytesIO();im.save(buffer,'WEBP',lossless=True,quality=100,method=4,exact=True)
    encoded=buffer.getvalue();Image.open(BytesIO(encoded)).load();dest.write_bytes(encoded)
    assert dest.stat().st_size==len(encoded)
    Image.open(dest).load();return dest
manifest={'version':2,'rendering':'Whole-pose extraction before padded atlas packing. No source grid clipping, frame blending or limb compositing.','characters':previous[:start]}
for id,name in enumerate(NAMES):
    if id<start: continue
    folder=OUT/name;folder.mkdir(exist_ok=True)
    kinds=['walk','actions','strike-jet','powers-states','reactions'] if id==0 else ['walk','jump-strike','powers','states']
    processed=[]
    character={'id':id,'name':name,'sheets':[],'frames':[],'clips':{}}
    for si,kind in enumerate(kinds):
        source=SRC/(name+'-'+kind+'.webp')
        if not source.exists(): source=SRC/(name+'-'+kind+'.png')
        repaired=SRC/(name+'-'+kind+'-v51.png')
        if repaired.exists():source=repaired
        enhanced=SRC/(name+'-'+kind+'-v82.png')
        if enhanced.exists():source=enhanced
        from full_poses import whole_poses,pack_poses
        original=Image.open(source).convert('RGBA')
        clean,placements=pack_poses(whole_poses(original))
        sheet=clean
        for i,(x,y,w,h,metadata) in enumerate(placements):
            cell=clean.crop((x,y,x+w,y+h));a=np.array(cell)
            yy,xx=np.indices(a.shape[:2]);alpha=a[:,:,3]>180
            band=alpha&(yy>h*.48)&(yy<h*.72)
            anchor=float(np.median(xx[band])) if band.any() else w/2
            ground=h
            if (kind=='actions' or kind=='jump-strike') and i==2:ground+=h*.15
            # Include transparent border in every draw rectangle, preventing atlas bleed.
            margin=8
            rect=[x-margin,y-margin,w+margin*2,h+margin*2]
            character['frames'].append({'sheet':si,'rect':rect,'origin':[round(anchor+margin,2),round(ground+margin,2)],'source':kind,'cell':i,'bounds':[0,0,w,h],**metadata})
        dest=save_native(clean,folder/kind);processed.append(dest)
        character['sheets'].append({'src':'assets/cels/'+name+'/'+dest.name,'width':sheet.width,'height':sheet.height})
    if id==0:
        character['clips']={'walk':list(range(8)),'jump':list(range(8,12)),'skill0':list(range(12,16)),'normal':list(range(16,20)),'skill1':list(range(20,24)),'skill2':[24,25,26],'ultimate':[27,28,29],'idle':[30,38,39],'guard':[31],'hit':[32,33],'ko':[34,35],'dash':[36,37]}
    else:
        character['clips']={'walk':list(range(8)),'jump':list(range(8,12)),'normal':list(range(12,16)),'skill0':[16,17,18],'skill1':[19,20,21],'skill2':[22,23],'ultimate':[24,25,26],'idle':[27],'guard':[28],'hit':[29],'ko':[30],'dash':[31]}
    # Anchor each action to an opaque source pixel near its semantic body landmark.
    # This retains the body's exact cel motion instead of emitting into transparent padding.
    alpha_sheets=[np.array(Image.open(p).convert('RGBA'))[:,:,3] for p in processed]
    for key in ['normal','skill0','skill1','skill2','ultimate']:
        u,v=emitter_profiles[id]['keys'].get(key,emitter_profiles[id]['base'])
        for fi in character['clips'][key]:
            frame=character['frames'][fi];x,y,w,h=frame['rect']
            yy,xx=np.where(alpha_sheets[frame['sheet']][y:y+h,x:x+w]>180)
            assert len(xx),(name,key,fi,'missing opaque emitter surface')
            nearest=int(np.argmin((xx-w*u)**2+(yy-h*v)**2))
            frame.setdefault('emitters',{})[key]=[int(xx[nearest]),int(yy[nearest])]
    idle=character['frames'][character['clips']['idle'][0]]; character['referenceHeight']=idle['rect'][3]-16
    sheet=Image.open(processed[idle['sheet']]);x,y,w,h=idle['rect'];portrait=sheet.crop((x,y,x+w,y+h));portrait.thumbnail((640,800),Image.Resampling.LANCZOS);portrait_dest=save_native(portrait,folder/'portrait')
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
for file in files:
    if file=='villain-data.js' and not (WEB/file).exists():continue
    shutil.copyfile(WEB/file,bundle/file)
shutil.copytree(OUT,bundle/'assets/cels',copy_function=shutil.copyfile)
shutil.copytree(WEB/'assets/ui',bundle/'assets/ui',copy_function=shutil.copyfile)
shutil.copytree(WEB/'assets/portraits-v107',bundle/'assets/portraits-v107',copy_function=shutil.copyfile)
shutil.copytree(WEB/'assets/close-combat',bundle/'assets/close-combat',copy_function=shutil.copyfile)
shutil.copytree(WEB/'assets/villains-expansion110',bundle/'assets/villains-expansion110',copy_function=shutil.copyfile)
shutil.copytree(WEB/'assets/modes-v112',bundle/'assets/modes-v112',copy_function=shutil.copyfile)
if (WEB/'assets/reviewed-native').exists():shutil.copytree(WEB/'assets/reviewed-native',bundle/'assets/reviewed-native',copy_function=shutil.copyfile)
for file in ['assets/animation-manifest-example.json']:
    if (WEB/file).exists(): (bundle/file).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(WEB/file,bundle/file)
print('Exported',sum(len(c['frames']) for c in manifest['characters']),'native cels across',len(NAMES),'complete action sets.')







