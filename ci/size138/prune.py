"""Package only reachable runtime files. Never transcode or alter retained artwork."""
import argparse,hashlib,json,posixpath,re
from pathlib import Path
from urllib.parse import unquote,urlsplit

TEXT={'.html','.js','.css','.json','.svg','.webmanifest'}
QUOTED=re.compile(r'''"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|`((?:\\.|[^`\\])*)`''')

def plan(root):
 files={p.relative_to(root).as_posix():p for p in root.rglob('*') if p.is_file()}
 if 'index.html' not in files:raise RuntimeError('Missing entry point')
 keep={'index.html'};pending=['index.html'];scanned=set();dynamic=[]
 def retain(name):
  if name in files and name not in keep:keep.add(name);pending.append(name)
 while pending:
  name=pending.pop()
  if name in scanned or files[name].suffix.lower() not in TEXT:continue
  scanned.add(name);source=files[name].read_text(encoding='utf8')
  # Actual paths, not basenames, keep unrelated versions unreachable. This also
  # covers inline JSON registries, CSS and lazily injected script filenames.
  for candidate in files:
   if candidate in source:retain(candidate)
  for m in QUOTED.finditer(source):
   token=next(v for v in m.groups() if v is not None)
   if not token.startswith(('data:','http:','https:','#')) and '\n' not in token:
    local=unquote(token.split('?',1)[0].split('#',1)[0])
    retain(posixpath.normpath(posixpath.join(posixpath.dirname(name),local)))
   if not token.startswith('assets/'):continue
   token=token.replace('\\/','/');prefix=token.split('${',1)[0]
   if prefix in files:retain(prefix);continue
   if re.search(r'\.[a-z0-9]{2,12}(?:[?#].*)?$',prefix,re.I):continue
   if prefix=='assets/':raise RuntimeError('Unbounded dynamic asset path in '+name)
   matches=[p for p in files if p.startswith(prefix)]
   if matches:
    dynamic.append({'source':name,'prefix':prefix,'files':len(matches)})
    for p in matches:retain(p)
  for token in re.findall(r'''(?:url\(\s*["']?|(?:src|href)=["'])([^\s"'\)<>]+)''',source):
   url=urlsplit(token)
   if url.scheme or url.netloc or not url.path:continue
   path=unquote(url.path)
   resolved=posixpath.normpath(posixpath.join(posixpath.dirname(name),path.lstrip('/'))) if not path.startswith('/') else path.lstrip('/')
   retain(resolved)
 return files,keep,scanned,dynamic

def main():
 p=argparse.ArgumentParser();p.add_argument('root',type=Path);p.add_argument('--report',type=Path,required=True);p.add_argument('--apply',action='store_true');a=p.parse_args()
 files,keep,scanned,dynamic=plan(a.root)
 removed=[{'path':n,'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}for n,f in sorted(files.items())if n not in keep]
 hashes={n:hashlib.sha256(files[n].read_bytes()).hexdigest()for n in sorted(keep)}
 before=sum(f.stat().st_size for f in files.values());saved=sum(r['bytes']for r in removed)
 report={'version':1,'mode':'applied'if a.apply else'dry-run','beforeBytes':before,'afterBytes':before-saved,'removedBytes':saved,'removedCount':len(removed),'retainedCount':len(keep),'scannedRuntimeFiles':sorted(scanned),'dynamicPrefixes':dynamic,'removed':removed,'retainedSHA256':hashes}
 if a.apply:
  for entry in removed:files[entry['path']].unlink()
  for n,expected in hashes.items():assert hashlib.sha256(files[n].read_bytes()).hexdigest()==expected,n
 a.report.parent.mkdir(parents=True,exist_ok=True);a.report.write_text(json.dumps(report,indent=2))
 print(json.dumps({k:report[k]for k in ['mode','beforeBytes','afterBytes','removedBytes','removedCount','retainedCount']}))

if __name__=='__main__':main()
