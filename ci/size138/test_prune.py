import tempfile,unittest
from pathlib import Path
from prune import plan

class ReachabilityTests(unittest.TestCase):
 def test_lazy_scripts_dynamic_art_and_old_versions(self):
  with tempfile.TemporaryDirectory()as folder:
   root=Path(folder)
   files={'index.html':'<script src="main.js?v=2"></script><link href="style.css" rel="stylesheet">','main.js':"load('lazy.js?v=7');const folder='assets/cards/';",'lazy.js':'const frame="assets/new/walk.webp";','style.css':".panel{background:url('assets/bg.webp')}",'assets/new/walk.webp':'LIVE','assets/bg.webp':'BACKGROUND','assets/cards/rare.webp':'RARE','old.js':'load("assets/old/walk.webp")','assets/old/walk.webp':'OLD'}
   for name,content in files.items():p=root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(content)
   paths,keep,_,_=plan(root)
   self.assertEqual(set(paths)-keep,{'old.js','assets/old/walk.webp'})
   self.assertEqual((root/'assets/new/walk.webp').read_bytes(),b'LIVE')
 def test_dynamic_animation_scripts_and_existing_registry(self):
  with tempfile.TemporaryDirectory() as folder:
   root=Path(folder)
   files={'index.html':'<script src="cel-data.js"></script><script src="loader.js"></script>',
    'cel-data.js':'const sheet="assets/reviewed-native/last.webp";',
    'loader.js':"const slugs=['first','last']; const prefix='redrawn20/';",
    'redrawn20/first.js':'register("data:image/webp;base64,AAA");',
    'redrawn20/last.js':'register("data:image/webp;base64,BBB");',
    'assets/reviewed-native/last.webp':'KEEP EXACT',
    'obsolete.js':'old',
    'assets/old-unused.webp':'REMOVE'}
   for name,content in files.items():
    p=root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(content)
   paths,keep,_,_=plan(root)
   self.assertEqual(set(paths)-keep,{'obsolete.js','assets/old-unused.webp'})
 def test_unknown_asset_root_fails_closed(self):
  with tempfile.TemporaryDirectory()as folder:
   root=Path(folder);(root/'index.html').write_text("<script>const folder='assets/';</script>")
   with self.assertRaisesRegex(RuntimeError,'Unbounded'):plan(root)
 def test_css_relative_path(self):
  with tempfile.TemporaryDirectory()as folder:
   root=Path(folder);(root/'css').mkdir();(root/'art').mkdir()
   (root/'index.html').write_text('<link href="css/main.css">');(root/'css/main.css').write_text('x{background:url(../art/bg.png)}');(root/'art/bg.png').write_bytes(b'unchanged')
   self.assertIn('art/bg.png',plan(root)[1])

if __name__=='__main__':unittest.main()

