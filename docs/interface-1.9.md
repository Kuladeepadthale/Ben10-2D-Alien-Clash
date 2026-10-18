# Omnitrix interface 1.9

Presentation update: offline SVG Omnitrix emblem and alien-world backdrop, fixed-height home screen, fixed menu header/footer, labelled icon navigation, and explicit numbered page controls. Alien selection includes a separate details tab. Powers, upgrades, setup, settings, help, credits and damage events use paginated panels. Runtime overflow detection reduces multi-card page capacity when necessary; content is not reached by page scrolling.

Combat buttons retain original pointer handlers and key mappings. Their icon/label DOM stays intact while the HUD writes cooldown/charge text to data-value. CSS provides pressed states, per-action colors and charge rings. Simulation, damage, input mappings, saved-profile keys, abilities, character artwork and animation playback are unchanged.

Validation: existing locomotion and Diamondhead pose tests; DOM tests at 320x480, 360x640, 412x915, 640x360, 800x360, 932x430 and 1280x720 verify routes, all ten roster selections via pagination, detail tabs, equipping powers, cooldown and ultimate labels, training launch, pause/back and unique IDs. CSS syntax parsed successfully. DOM tests do not measure CSS geometry. No Android WebView screenshot or physical-device visual test was available in this environment; appearance, safe-area behavior and runtime overflow fitting still require device verification.
