import collections,json,re,sys,zipfile
from pathlib import Path

apk=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(apk) as z:
 files={i.filename[7:]:i for i in z.infolist() if i.filename.startswith('assets/') and not i.is_dir()}
 direct=re.findall(r'(?:src|href)=[\"\x27]([^\"\x27?#]+)',z.read('assets/index.html').decode())
 active=['index.html']+[p for p in direct if p in files];sources={p:z.read('assets/'+p).decode('utf8',errors='replace') for p in active}
 full=[];prefix=[]
 for p,s in sources.items():
  for m in re.finditer(r'''["'](assets/[^"'\n]*?)["']''',s):
   value=m.group(1)
   if value in files:full.append((p,value))
   elif not re.search(r'\.[a-z0-9]{2,5}(?:[?#].*)?$',value,re.I):prefix.append((p,value))
  for value in re.findall(r'url\([\"\x27]?([^\)\"\x27]+)',s):
   if value in files:full.append((p,value))
 groups=collections.defaultdict(lambda:[0,0,0]);top=[]
 for p,i in files.items():
  group='/'.join(p.split('/')[:3]) if p.startswith('assets/') else '(runtime)'
  row=groups[group];row[0]+=1;row[1]+=i.file_size;row[2]+=i.compress_size
  top.append({'path':p,'bytes':i.file_size,'compressed':i.compress_size})
 report={'apkBytes':apk.stat().st_size,'assetBytes':sum(i.file_size for i in files.values()),'assetCompressed':sum(i.compress_size for i in files.values()),'files':len(files),'activeFiles':active,'dynamicPrefixes':sorted(set(prefix)),'literalReferences':len(set(v for _,v in full)),'groups':[{'path':p,'files':r[0],'bytes':r[1],'compressed':r[2]} for p,r in sorted(groups.items(),key=lambda x:-x[1][2])],'largest':sorted(top,key=lambda x:-x['compressed'])[:50]}
 (out/'inventory.json').write_text(json.dumps(report,indent=2))
 (out/'files.json').write_text(json.dumps([{'path':p,'bytes':i.file_size,'compressed':i.compress_size} for p,i in files.items()]))
 with zipfile.ZipFile(out/'runtime-sources.zip','w',compression=zipfile.ZIP_DEFLATED) as dest:
  for p in files:
   if p.endswith(('.js','.css','.html','.json','.svg')):dest.writestr(p,z.read('assets/'+p))
 print(json.dumps({k:report[k]for k in ['apkBytes','assetBytes','assetCompressed','files','literalReferences','dynamicPrefixes']},indent=2))
