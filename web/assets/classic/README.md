# Classic character artwork and game animation sheets

These are the classic Ben 10 character illustrations used by Omnitrix Arena v3. They are not newly drawn character designs. The illustrations are sourced from Trixdex (https://trixdex.com/); the characters and original artwork belong to Cartoon Network and their respective owners.

Original PNG illustrations are in originals/. Each character folder contains a portrait and eight newly made image-based motion sheets. Those motion sheets are puppet/transform animations made from the source illustrations; they are NOT original animation frames extracted from the television show. Some characters use restrained whole-image motion to avoid inventing hidden body parts or distorting their designs.

Sheet format: WebP with transparency, 1280 x 960, four columns by three rows. Each frame is 320 x 320 pixels. Read left to right, then top to bottom (frames 0 to 11). Feet anchor: x=160, y=306. The source artwork is fitted within a 240-pixel height (wide figures may use less; see manifest.json).

States: idle, walk, normal, power, ultimate, guard, jump, hit. Portraits retain the source illustration's proportions. Frame durations and root motion are controlled by classic-art.js in the game. Relative character scale is adapted for playability, not a canonical height chart. Power projectiles and impact effects are rendered by the game engine and are not part of these character sheets.
