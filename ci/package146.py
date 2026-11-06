from pathlib import Path
import re,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'builds/web')
html=(root/'index.html').read_text()
# Use the previous release artwork. All new-drawing files remain in git for rollback.
html=re.sub(r'<script src="(?:animation144|redrawn[^"?]*)\.js[^" ]*"></script>','',html)
html=html.replace('</head>','<link rel="stylesheet" href="simple-ui146.css?v=146"></head>')
html=html.replace('</body>','<script src="free-combat146.js?v=146"></script><script src="simple-ui146.js?v=146"></script></body>')
(root/'index.html').write_text(html)
for name in ['free-combat146.js','simple-ui146.js','simple-ui146.css']:
 (root/name).write_bytes((Path('web')/name).read_bytes())
# Every referenced runtime file must exist in the extracted release.
for src in re.findall(r'(?:src|href)="([^"#]+)"',html):
 if src.endswith(('.js','.css')) or re.search(r'\.(js|css)\?',src):assert (root/src.split('?')[0]).is_file(),src
