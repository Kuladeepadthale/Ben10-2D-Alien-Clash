from pathlib import Path
import json
R=Path(__file__).resolve().parents[1];root=R/'ci/animation-review';p=root/'progress.json';d=json.loads(p.read_text())
for record in (root/'characters').glob('*.json'):
 r=json.loads(record.read_text());e=next((x for x in d['characters'] if x['id']==r['id']),None)
 if e is not None:e.update(r)
d['completed']=sum(x['status'].startswith('verified_') for x in d['characters']);d['analysed']=sum(bool(x.get('reviewed_on')) for x in d['characters']);d['current_character']=next((x['id'] for x in d['characters'] if not x['status'].startswith('verified_')),None);p.write_text(json.dumps(d,indent=2)+'\n')
labels={'pending':'Pending','in_progress':'In progress','needs_revision':'Needs revision','verified_unchanged':'Reviewed — kept','verified_updated':'Reviewed — updated'}
lines=['# Animation review progress','',f"**{d['completed']} / {len(d['characters'])} characters approved.** Batch size: {d['batch_size']}.",'',f"**{d['analysed']} / {len(d['characters'])} individually analysed.**",'','Each completed entry has an individual record and Git checkpoint. Pending/revision entries are not counted as complete.','','| Batch | ID | Character | Status | Finding / outcome |','| --- | --- | --- | --- | --- |']
for e in d['characters']:
 note=' '.join(e.get('findings',[])[:1]).replace('|','/');lines.append(f"| {e['batch']} | {e['id']} | {e['slug']} | {labels.get(e['status'],e['status'])} | {note} |")
(root/'STATUS.md').write_text('\n'.join(lines)+'\n');print(d['completed'],'completed; next character',d.get('current_character'))
