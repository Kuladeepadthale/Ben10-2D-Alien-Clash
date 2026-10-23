"""Run every release check and report all failures without hiding a failed command."""
from pathlib import Path
import json,subprocess
root=Path(__file__).resolve().parents[1]
commands=json.loads((root/'ci/release-checks.json').read_text());failed=[]
for command in commands:
 print('\nCHECK '+command,flush=True)
 result=subprocess.run(['/bin/bash','-eo','pipefail','-c',command],cwd=root)
 if result.returncode:failed.append((command,result.returncode));print('FAILED '+command,flush=True)
print('\nRelease checks:',len(commands)-len(failed),'passed;',len(failed),'failed.',flush=True)
for command,code in failed:print('Failure:',command,'exit',code,flush=True)
raise SystemExit(1 if failed else 0)
