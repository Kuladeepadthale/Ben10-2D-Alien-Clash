# Material power effects 14.2

Visual-only overlay for the exact signed 14.1 native release. Copy `web/index.html` and `web/power-effects142.js` over the extracted 14.1 assets. Do not replace the complete native asset catalog with repository web assets: the release includes newer native character art.

The module uses the existing 568 alien/villain power profiles, original emission markers, native cast targets and projectile coordinates. Fire, fluid, electricity, crystals, vines, bandages, webs, sonic discs, machinery and other materials have separate animated renderers. Flight, walking, body cels, limb strike renderers, damage and collision simulation remain unchanged. These are newly authored game effects, not animation extracted from the television series.

Validation: all 92 aliens and 50 villains, all four power profiles in both directions; 13,632 canvas rendering checks and 7,952 full-browser rendering checks. Existing combat timing and 14.1 type/mastery tests run separately. Review results are written to the GitHub Actions run summary because the account's artifact storage quota is full.

No APK or Play signing key is created by this review workflow.
