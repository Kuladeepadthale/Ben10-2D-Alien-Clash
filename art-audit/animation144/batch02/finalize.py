import json,hashlib
from pathlib import Path
r=Path(__file__).parent
checks=[]
for slug in ['xlr8','upgrade','stinkfly','ghostfreak']:
 p=r/(slug+'.json');d=json.loads(p.read_text());d['clips'].update(jump=[28],guard=[29],hit=[30],ko=[31]);d['animationId']='AN144-A'+str({'xlr8':3,'upgrade':6,'stinkfly':7,'ghostfreak':9}[slug]).zfill(3);d['uniqueDrawings']=32;d['integrated']=False;d['combatTested']=False;d['timing']={'walkFPS':8,'castPhases':['windup','release/contact','followThrough','recovery'],'phaseTiming':'must be matched to simulation before activation'}
 assert len(d['frames'])==32
 for key,ids in d['clips'].items():assert ids and all(isinstance(i,int) and 0<=i<32 for i in ids)
 for f in d['frames']:
  s=d['sheets'][f['sheet']];x,y,w,h=f['rect'];assert 0<=x<x+w<=s['width'] and 0<=y<y+h<=s['height'];assert f['referenceHeight']==d['referenceHeight']
 d['sha256']={s['src']:hashlib.sha256((r/s['src']).read_bytes()).hexdigest() for s in d['sheets']};p.write_text(json.dumps(d,indent=2));checks.append({'character':slug,'animationId':d['animationId'],'frames':32,'frameBoundsValid':True,'clipIndicesValid':True,'constantReferenceHeight':True,'integrationTested':False})
(r/'validation.json').write_text(json.dumps(checks,indent=2))
p=r.parent/'progress.json';d=json.loads(p.read_text());new={3:'xlr8',6:'upgrade',7:'stinkfly',9:'ghostfreak'}
for row in d['characters']:
 row['animationId']='AN144-'+('A' if row['group']=='aliens' else 'V')+str(row['id']).zfill(3)
 if row['group']=='aliens' and row['id'] in new:
  slug=new[row['id']];row['designStatus']='new-artwork-uploaded';row['walkStatus']='new-eight-cel-artwork-uploaded';row['basicStatus']='new-artwork-uploaded';row['jumpGuardHitKOStatus']='new-artwork-uploaded';row['artworkFrames']=32;row['assetDirectory']='batch02';row['manifest']='batch02/'+slug+'.json';row['integrated']=False;row['verified']=False
  for power in row['powers']:power['status']='new-character-pose-artwork-uploaded-effect-integration-pending'
  row['ultimate']['status']='new-character-pose-artwork-uploaded-effect-integration-pending'
 elif row.get('artworkFrames'):
  row['designStatus']='new-artwork-uploaded';row['assetDirectory']='batch01'
 d['statusDefinitions']={'ART_UPLOADED':'New character drawings and frame map saved to GitHub. Not a finished gameplay animation.','INTEGRATED':'Loaded and used by the actual game renderer.','TESTED':'Visually reviewed and checked in live combat, both directions.','PENDING':'No new batch artwork uploaded.'}
d['releaseStatus']='NOT BUILT - 6 aliens have uploaded artwork; integration and animation production pending';d['artworkUploadedCount']=sum(bool(a.get('artworkFrames')) for a in d['characters']);d['newUniqueDrawings']=sum(a.get('artworkFrames',0) for a in d['characters']);p.write_text(json.dumps(d,separators=(',',':')))
lines=['# Animation completion status','','Use the stable ID below when continuing in another chat. **Artwork uploaded does not mean integrated or tested.**','','- Artwork uploaded: 6 aliens / 192 new drawings.','- Integrated into game: 0 of these new packs.','- Live combat tested: 0 of these new packs.','- Existing 14.3 release and waste rollback are preserved.','','| Animation ID | Character | Group | Artwork | Integrated | Tested |','|---|---|---|---|---|---|']
for a in d['characters']:
 ready=bool(a.get('artworkFrames'));link='['+str(a.get('artworkFrames'))+' drawings]('+a.get('assetDirectory','')+'/)' if ready else ('Heatblast preview only' if a['group']=='aliens' and a['id']==0 else 'Pending');lines.append('| '+a['animationId']+' | '+a['name']+' | '+a['group']+' | '+link+' | No | No |')
(r.parent/'STATUS.md').write_text('\n'.join(lines)+'\n')
(r/'README.md').write_text('''# Batch 02 — character pose artwork\n\n128 new whole-body drawings: XLR8 (AN144-A003), Upgrade (AN144-A006), Stinkfly (AN144-A007), Ghostfreak (AN144-A009). Each has two 16-cell atlases and a 32-frame map.\n\nThis batch is uploaded artwork, not completed game integration. Native damage, emitter tracking, move timing and power effects must be wired and tested before enabling it. No AAB or release changed. Existing Grey Matter and Ripjaws walks remain untouched.\n\nReference: each character's existing classic game portrait. Generation used the built-in image generator. Shared prompt constraints: full-body equal 4x4 cell grid, right-facing, same anatomy and scale, crisp flat classic television cel art, white source background, no duplicate bodies or baked projectiles. XLR8: wheel-foot run, velocity/cyclone/ricochet/Mach-speed body poses. Upgrade: liquid walk, elastic strike, optic beam, tech pulse, overload. Stinkfly: eight wing-beat flight poses, goo/acid aim and release, stinger dive, swarm. Ghostfreak: tail/arm hover, phantom lunge, tentacle lash, spectral pulse, nightmare sweep. Each includes jump/guard/hit/KO artwork.\n\nSource PNGs accompany transparent WebP atlases. `prepare.py` removes edge-connected white backgrounds, records bounds and torso/sole registration. `finalize.py` maps jump/guard/reaction rows and validates frame indices, bounds, constant reference height and SHA256. Some generated pose/model variation remains; exact original-series motion and studio-quality animation are not claimed.\n\nSee ../STATUS.md for all 142 characters and resume identifiers. No preview video was made for this batch, as requested.\n''')
print('Validated',len(checks),'packs; uploaded-artwork total',d['artworkUploadedCount'],'characters',d['newUniqueDrawings'],'drawings')
