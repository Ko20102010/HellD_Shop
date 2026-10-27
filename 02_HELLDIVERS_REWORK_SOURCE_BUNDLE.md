# HELLDIVERS PLEASE! v0.0.23-rework Source Bundle

This bundle contains the complete text of the rework overlay and artwork-control files. The three handover Markdown files are distributed separately in the same ZIP and are excluded here to avoid recursive duplication.

## `ART_ASSET_VALIDATION_RULES.md`

````markdown
# Art Asset Validation Rules

## Commands

Manifest-only planning check. Missing artwork is reported as a warning:

```bash
node tools/validate-art-assets.js
```

Strict integration check. Missing files or metadata fail:

```bash
node tools/validate-art-assets.js --strict-files
```

Production release check. Strict files plus every required asset must be `approved`:

```bash
node tools/validate-art-assets.js --production
```

## Release-blocking rules

1. Every production asset has one unique manifest ID and one unique path.
2. Filenames are lowercase kebab-case and use only `.webp`, `.png`, `.svg` or `.json`.
3. Spaces, underscores and the terms `final`, `new`, `copy`, `test`, `capybara`, `redive` and `carbot` are forbidden in production filenames.
4. Every path begins with `assets/art/`.
5. Required files and referenced metadata exist in strict and production modes.
6. Empty files and duplicate binary content fail.
7. SVG assets require a `viewBox` and may not contain scripts or external URLs.
8. Required production assets must have status `approved`.
9. The manifest must include defender, assault, ranged and support characters.
10. Each enemy faction requires at least four standard enemies, two elite enemies and one boss.
11. Unlisted files under `assets/art/` produce a warning and must be resolved before release review.
12. Non-project ownership or non-project-owned licences produce a licence-review warning.

## Additional animation validation to add with sprite metadata

- Required states per squad role: idle, walk, attack, skill, hit, defeat and victory.
- Required states per standard enemy: idle, move, attack, hit and defeat.
- Required states per elite: idle, move, telegraph, attack, hit, stagger and defeat.
- Required boss states: idle, move, at least two telegraphs and attacks, skill, hit, stagger, enraged and defeat.
- Frame lists must be continuous and refer to valid atlas cells.
- All frames in one sequence use consistent frame dimensions and anchor points.
- Attack and skill animations define `impactFrame` and `effectOrigin` where applicable.
- Defeat animations set `holdLastFrame: true`.
- Atlas dimensions should not exceed 2048 × 2048, except approved bosses up to 4096 × 4096.

## Validation result policy

- `placeholder`: may appear only in internal prototypes.
- `review`: may appear in art review builds, not public release.
- `approved`: allowed in production.
- `deprecated`: retained only for compatibility and must not be newly referenced.

````

## `ART_IMPLEMENTATION_CHECKLIST.md`

````markdown
# Artwork Redesign Implementation Checklist

## 0. Release documentation

- [ ] Keep `01_HELLDIVERS_PROJECT_CONTEXT.md` in the release ZIP.
- [ ] Keep `02_HELLDIVERS_REWORK_SOURCE_BUNDLE.md` in the release ZIP.
- [ ] Keep `03_HELLDIVERS_REQUIREMENTS_AND_HANDOVER.md` in the release ZIP.
- [ ] Include `assets/data/art-manifest.json`.
- [ ] Include `ART_ASSET_VALIDATION_RULES.md`.
- [ ] Include this checklist.
- [ ] Include `ART_LICENCES.md` before any artwork release.

## 1. Art direction approval

- [ ] Approve proportion guide: helmet/head 36–40%, torso 28–32%, legs 20–24%.
- [ ] Approve 4 px outline at 112 px reference sprite size.
- [ ] Approve palettes for defender, assault, ranged and support.
- [ ] Approve silhouette sheet for all four roles in colour and greyscale.
- [ ] Approve bug and machine silhouette sheets.
- [ ] Confirm artwork is original and does not copy referenced titles.

**Gate:** No full animation production until silhouette and scale review passes.

## 2. Asset pipeline

- [ ] Create all `assets/art/` directories named in the inventory.
- [ ] Create `character-animations.json`.
- [ ] Create `enemy-animations.json`.
- [ ] Create `effect-animations.json`.
- [ ] Create `background-manifest.json`.
- [ ] Create `ui-assets.json`.
- [ ] Export browser assets as WebP or safe SVG.
- [ ] Keep editable source files outside the playable package.
- [ ] Run `node tools/validate-art-assets.js`.

## 3. Complete vertical slice

- [ ] Finish one squad character with idle, walk, attack, skill, hit, defeat and victory.
- [ ] Finish one standard enemy with idle, move, attack, hit and defeat.
- [ ] Finish one projectile and one impact set.
- [ ] Finish one battlefield background.
- [ ] Integrate anchor points, impact frames and effect origins.
- [ ] Verify damage occurs on the impact frame.
- [ ] Capture a 320 × 568 screenshot and short combat recording.

**Gate:** The character and enemy must remain identifiable at 64 CSS px height.

## 4. Four-character squad

- [ ] Defender sprite set approved.
- [ ] Assault sprite set approved.
- [ ] Ranged sprite set approved.
- [ ] Support sprite set approved.
- [ ] Four 512 × 512 neutral portraits approved.
- [ ] Injured, critical and fallen portrait states approved or explicitly deferred.
- [ ] Four unique skill-effect sets approved.
- [ ] Four skill controls show charging, ready, pressed, disabled and defeated states.
- [ ] No spare or fifth-position artwork exists.

## 5. Bug faction

- [ ] Scavenger standard set.
- [ ] Hunter standard set.
- [ ] Bile spitter standard set.
- [ ] Warrior standard set.
- [ ] Charger elite set.
- [ ] Bile spewer elite set.
- [ ] Bile titan boss set.
- [ ] Two bug battlefield backgrounds.
- [ ] Bug projectile, acid and impact effects.

## 6. Machine faction

- [ ] Trooper standard set.
- [ ] Raider standard set.
- [ ] Rocket trooper standard set.
- [ ] Berserker standard set.
- [ ] Devastator elite set.
- [ ] Hulk elite set.
- [ ] Factory strider boss set.
- [ ] Two machine battlefield backgrounds.
- [ ] Machine bullet, rocket and explosion effects.

## 7. Screen artwork

- [ ] Home background and mission-card artwork.
- [ ] Squad armoury background and four formation cards.
- [ ] Battle UI frames, wave banner, victory and defeat banners.
- [ ] Industry background and readable building artwork.
- [ ] Menu icons for save slots, audio, display, accessibility, achievements, help and credits.
- [ ] Save-slot empty, filled, selected and delete-warning states.
- [ ] Resource and reward icons.

## 8. Integration

- [ ] Replace canvas placeholder bean figures with sprite-sheet renderer.
- [ ] Preload required battle assets before starting combat.
- [ ] Show controlled loading and missing-asset states.
- [ ] Prevent a missing asset from causing a black screen.
- [ ] Support two to four simultaneous enemies.
- [ ] Keep each enemy HP bar visually associated with the correct enemy.
- [ ] Keep all four squad members visible in portrait phone layout.
- [ ] Prevent skill effects from covering health bars for more than 0.5 seconds.
- [ ] Remove emoji as primary artwork from player journeys.

## 9. Accessibility and motion

- [ ] Verify text contrast of 4.5:1 and meaningful graphics at 3:1.
- [ ] Verify 44 × 44 CSS px touch targets.
- [ ] Verify keyboard focus on skill and navigation controls.
- [ ] Provide reduced-motion behaviour for shake, flashes and decorative loops.
- [ ] Pair colours with icons, shapes or labels.
- [ ] Test at 200% browser zoom.

## 10. Responsive review

- [ ] 320 × 568.
- [ ] 360 × 800.
- [ ] 390 × 844.
- [ ] 768 × 1024.
- [ ] 1366 × 768.
- [ ] 1920 × 1080.
- [ ] No page-level horizontal scrollbar.
- [ ] Bottom navigation does not cover skill controls.
- [ ] Portrait and landscape changes do not leave misplaced overlays.

## 11. Performance

- [ ] Measure the busiest four-hero/four-enemy encounter.
- [ ] Target 60 fps desktop and at least 30 fps on a mid-range phone.
- [ ] Remove completed particles and effects.
- [ ] Confirm repeated battles do not grow animation arrays or listeners.
- [ ] Keep the initial critical artwork payload under 5 MB unless measurements justify otherwise.
- [ ] Keep optional artwork provisionally under 15 MB.
- [ ] Use atlases no larger than 2048 × 2048 except approved boss atlases.

## 12. Automated validation

- [ ] `node tools/validate-art-assets.js` passes during planning with expected missing-file warnings only.
- [ ] `node tools/validate-art-assets.js --strict-files` passes after integration.
- [ ] `node tools/validate-art-assets.js --production` passes before release.
- [ ] Character metadata tests pass.
- [ ] Enemy metadata tests pass.
- [ ] Effect-origin and impact-frame tests pass.
- [ ] Missing-asset fallback test passes.
- [ ] Package reference-integrity test passes.
- [ ] ZIP integrity check passes.

## 13. Visual approval evidence

- [ ] Home screenshot.
- [ ] Four-member Squad screenshot.
- [ ] Standard multi-enemy battle screenshot.
- [ ] Elite battle screenshot.
- [ ] Boss battle screenshot.
- [ ] Phone portrait screenshot.
- [ ] Phone landscape screenshot.
- [ ] Normal attack recording.
- [ ] Skill recording.
- [ ] Defeat recording.
- [ ] Reduced-motion recording.
- [ ] Browser-console evidence.
- [ ] Frame-rate measurement.

## 14. Final release gate

- [ ] Every required manifest entry is `approved`.
- [ ] No primary player journey uses placeholder shapes or emoji artwork.
- [ ] All four squad silhouettes are distinct in greyscale.
- [ ] All enemy categories remain distinct at minimum rendered size.
- [ ] Real-browser critical journeys pass.
- [ ] Untested areas are disclosed accurately.
- [ ] Release ZIP includes the three handover Markdown files.
- [ ] Release notes, rollback steps, package size and SHA-256 are updated.

````

## `RELEASE_NOTES.md`

````markdown
# v0.0.23-rework

- Baseline: v0.0.22 supplied source.
- No save migration and no storage-key change.
- Exactly four active squad members; deployment is blocked otherwise.
- Standard and elite encounters support multiple independently acting enemies.
- New 2D canvas action feedback for walking, normal attacks, skills, hits and defeat state.
- Five-button Home, Squad, Battle, Industry and Menu navigation.
- Existing three-slot save selector is opened at launch without rewriting storage.
- Removed player-facing 500KG and GitHub ZIP controls, packager modal and JSZip dependency.
- Every release ZIP must include the three Markdown handover files at the package root.
- This is an overlay update: copy files over a complete v0.0.22 installation.

## Rollback
Restore the replaced v0.0.22 files. No data rollback is required.

## Anime-inspired battlefield visual pass
- Added an original three-layer parallax meadow with sky, clouds, mountains, green hills, ivy ruins, light shafts, grass, soil, flowers and animated tufts.
- Replaced placeholder bean units with original hierarchical chibi-style Canvas puppets using role-specific palettes and weapon silhouettes.
- Added four-card hero dock with HP, energy, ready glow and touch activation. The design remains four heroes, not five.
- Added wave ribbon and countdown presentation.
- These are original procedural visuals; no third-party character or background assets are included.

````

## `assets/data/art-manifest.json`

````json
{
  "$schema": "../../schemas/art-manifest.schema.json",
  "manifestVersion": 1,
  "projectVersion": "v0.0.24-art-redesign",
  "generatedDate": "2026-10-27",
  "statusPolicy": {
    "allowed": ["placeholder", "review", "approved", "deprecated"],
    "productionAllowed": ["approved"]
  },
  "naming": {
    "pattern": "<category>-<faction>-<subject>-<variant>-<state>-<direction>-<sequence>.<extension>",
    "filenameRegex": "^[a-z0-9]+(?:-[a-z0-9]+)*\\.(webp|png|svg|json)$",
    "frameSequenceDigits": 2,
    "prohibitedTerms": ["final", "new", "copy", "test", "capybara", "redive", "carbot"]
  },
  "assets": [
    {"id":"char-seaf-defender-standard","type":"character","faction":"seaf","role":"defender","variant":"standard","asset":"assets/art/characters/seaf/defender/sheet-char-seaf-defender-standard-right-1x.webp","metadata":"assets/data/character-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"maxWidth":2048,"maxHeight":2048}},
    {"id":"char-seaf-assault-standard","type":"character","faction":"seaf","role":"assault","variant":"standard","asset":"assets/art/characters/seaf/assault/sheet-char-seaf-assault-standard-right-1x.webp","metadata":"assets/data/character-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"maxWidth":2048,"maxHeight":2048}},
    {"id":"char-seaf-ranged-standard","type":"character","faction":"seaf","role":"ranged","variant":"standard","asset":"assets/art/characters/seaf/ranged/sheet-char-seaf-ranged-standard-right-1x.webp","metadata":"assets/data/character-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"maxWidth":2048,"maxHeight":2048}},
    {"id":"char-seaf-support-standard","type":"character","faction":"seaf","role":"support","variant":"standard","asset":"assets/art/characters/seaf/support/sheet-char-seaf-support-standard-right-1x.webp","metadata":"assets/data/character-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"maxWidth":2048,"maxHeight":2048}},

    {"id":"portrait-seaf-defender-standard-neutral","type":"portrait","faction":"seaf","role":"defender","variant":"standard","asset":"assets/art/portraits/characters/portrait-seaf-defender-standard-neutral-front-01.webp","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"width":512,"height":512}},
    {"id":"portrait-seaf-assault-standard-neutral","type":"portrait","faction":"seaf","role":"assault","variant":"standard","asset":"assets/art/portraits/characters/portrait-seaf-assault-standard-neutral-front-01.webp","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"width":512,"height":512}},
    {"id":"portrait-seaf-ranged-standard-neutral","type":"portrait","faction":"seaf","role":"ranged","variant":"standard","asset":"assets/art/portraits/characters/portrait-seaf-ranged-standard-neutral-front-01.webp","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"width":512,"height":512}},
    {"id":"portrait-seaf-support-standard-neutral","type":"portrait","faction":"seaf","role":"support","variant":"standard","asset":"assets/art/portraits/characters/portrait-seaf-support-standard-neutral-front-01.webp","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"width":512,"height":512}},

    {"id":"enemy-bug-scavenger-standard","type":"enemy","faction":"bug","role":"small","variant":"standard","asset":"assets/art/enemies/bugs/scavenger/sheet-enemy-bug-scavenger-standard-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"enemy-bug-hunter-standard","type":"enemy","faction":"bug","role":"fast","variant":"standard","asset":"assets/art/enemies/bugs/hunter/sheet-enemy-bug-hunter-standard-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"enemy-bug-bile-spitter-standard","type":"enemy","faction":"bug","role":"ranged","variant":"standard","asset":"assets/art/enemies/bugs/bile-spitter/sheet-enemy-bug-bile-spitter-standard-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"enemy-bug-warrior-standard","type":"enemy","faction":"bug","role":"armoured","variant":"standard","asset":"assets/art/enemies/bugs/warrior/sheet-enemy-bug-warrior-standard-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"enemy-bug-charger-elite","type":"enemy","faction":"bug","role":"elite","variant":"elite","asset":"assets/art/enemies/bugs/charger/sheet-enemy-bug-charger-elite-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"enemy-bug-bile-spewer-elite","type":"enemy","faction":"bug","role":"elite-ranged","variant":"elite","asset":"assets/art/enemies/bugs/bile-spewer/sheet-enemy-bug-bile-spewer-elite-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"boss-bug-bile-titan-boss","type":"boss","faction":"bug","role":"boss","variant":"boss","asset":"assets/art/enemies/bugs/bile-titan/sheet-boss-bug-bile-titan-boss-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"maxWidth":4096,"maxHeight":4096}},

    {"id":"enemy-machine-trooper-standard","type":"enemy","faction":"machine","role":"small","variant":"standard","asset":"assets/art/enemies/machines/trooper/sheet-enemy-machine-trooper-standard-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"enemy-machine-raider-standard","type":"enemy","faction":"machine","role":"fast","variant":"standard","asset":"assets/art/enemies/machines/raider/sheet-enemy-machine-raider-standard-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"enemy-machine-rocket-trooper-standard","type":"enemy","faction":"machine","role":"ranged","variant":"standard","asset":"assets/art/enemies/machines/rocket-trooper/sheet-enemy-machine-rocket-trooper-standard-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"enemy-machine-berserker-standard","type":"enemy","faction":"machine","role":"armoured","variant":"standard","asset":"assets/art/enemies/machines/berserker/sheet-enemy-machine-berserker-standard-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"enemy-machine-devastator-elite","type":"enemy","faction":"machine","role":"elite","variant":"elite","asset":"assets/art/enemies/machines/devastator/sheet-enemy-machine-devastator-elite-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"enemy-machine-hulk-elite","type":"enemy","faction":"machine","role":"elite-armoured","variant":"elite","asset":"assets/art/enemies/machines/hulk/sheet-enemy-machine-hulk-elite-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"boss-machine-factory-strider-boss","type":"boss","faction":"machine","role":"boss","variant":"boss","asset":"assets/art/enemies/machines/factory-strider/sheet-boss-machine-factory-strider-boss-left-1x.webp","metadata":"assets/data/enemy-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"maxWidth":4096,"maxHeight":4096}},

    {"id":"bg-bug-desert-dusk-battle","type":"background","faction":"bug","variant":"desert-dusk","asset":"assets/art/backgrounds/battle/bg-bug-desert-dusk-battle-wide-01.webp","metadata":"assets/data/background-manifest.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"width":1920,"height":1080}},
    {"id":"bg-machine-factory-night-battle","type":"background","faction":"machine","variant":"factory-night","asset":"assets/art/backgrounds/battle/bg-machine-factory-night-battle-wide-01.webp","metadata":"assets/data/background-manifest.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"width":1920,"height":1080}},
    {"id":"bg-neutral-command-deck-home","type":"background","faction":"neutral","variant":"command-deck","asset":"assets/art/backgrounds/home/bg-neutral-command-deck-home-wide-01.webp","metadata":"assets/data/background-manifest.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"width":1920,"height":1080}},
    {"id":"bg-neutral-armoury-squad","type":"background","faction":"neutral","variant":"armoury","asset":"assets/art/backgrounds/squad/bg-neutral-armoury-squad-wide-01.webp","metadata":"assets/data/background-manifest.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"width":1920,"height":1080}},
    {"id":"bg-neutral-foundry-industry","type":"background","faction":"neutral","variant":"foundry","asset":"assets/art/backgrounds/industry/bg-neutral-foundry-industry-wide-01.webp","metadata":"assets/data/background-manifest.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true,"dimensions":{"width":1920,"height":1080}},

    {"id":"ui-nav-home","type":"ui","faction":"common","role":"navigation","variant":"default-selected","asset":"assets/art/ui/navigation/ui-nav-home-default-none-01.svg","metadata":"assets/data/ui-assets.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"ui-nav-squad","type":"ui","faction":"common","role":"navigation","variant":"default-selected","asset":"assets/art/ui/navigation/ui-nav-squad-default-none-01.svg","metadata":"assets/data/ui-assets.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"ui-nav-battle","type":"ui","faction":"common","role":"navigation","variant":"default-selected","asset":"assets/art/ui/navigation/ui-nav-battle-default-none-01.svg","metadata":"assets/data/ui-assets.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"ui-nav-industry","type":"ui","faction":"common","role":"navigation","variant":"default-selected","asset":"assets/art/ui/navigation/ui-nav-industry-default-none-01.svg","metadata":"assets/data/ui-assets.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"ui-nav-menu","type":"ui","faction":"common","role":"navigation","variant":"default-selected","asset":"assets/art/ui/navigation/ui-nav-menu-default-none-01.svg","metadata":"assets/data/ui-assets.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},

    {"id":"effect-seaf-defender-shield","type":"effect","faction":"seaf","role":"skill","variant":"shield","asset":"assets/art/effects/skills/sheet-effect-seaf-defender-shield-none-1x.webp","metadata":"assets/data/effect-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"effect-seaf-assault-barrage","type":"effect","faction":"seaf","role":"skill","variant":"barrage","asset":"assets/art/effects/skills/sheet-effect-seaf-assault-barrage-none-1x.webp","metadata":"assets/data/effect-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"effect-seaf-ranged-precision","type":"effect","faction":"seaf","role":"skill","variant":"precision","asset":"assets/art/effects/skills/sheet-effect-seaf-ranged-precision-none-1x.webp","metadata":"assets/data/effect-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true},
    {"id":"effect-seaf-support-heal","type":"effect","faction":"seaf","role":"skill","variant":"heal","asset":"assets/art/effects/skills/sheet-effect-seaf-support-heal-none-1x.webp","metadata":"assets/data/effect-animations.json","status":"placeholder","sourceOwner":"project-original","licence":"project-owned","required":true}
  ]
}

````

## `css/rework.css`

````css
#mode-switcher-bar,#zoom-controls{display:none!important}#hud-top{max-width:900px;margin:auto}.hud-essentials .stat-pill:nth-child(n+4){display:none}.drawer-footer-info,.controls-hint{display:none!important}#idle-bottom-nav{position:fixed;z-index:1300;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);display:grid;grid-template-columns:repeat(5,minmax(58px,96px));gap:6px;padding:8px;background:#080d18f5;border:1px solid #475569;border-radius:18px;box-shadow:0 12px 36px #000a}#idle-bottom-nav button{min-height:52px;border:0;border-radius:12px;background:#172033;color:#e2e8f0;font:700 12px Rajdhani,sans-serif;display:grid;place-items:center;gap:2px}#idle-bottom-nav .primary{background:linear-gradient(135deg,#ea580c,#b91c1c);color:#fff}#idle-bottom-nav button:focus-visible{outline:3px solid #38bdf8;outline-offset:2px}.war-hero-controls{grid-template-columns:repeat(4,minmax(0,1fr))}.war-combat-tools{padding-bottom:78px}#war-combat-canvas{max-height:calc(100vh - 210px)}@media(max-width:600px){#idle-bottom-nav{width:calc(100% - 16px);grid-template-columns:repeat(5,1fr)}#idle-bottom-nav button{min-width:0}.war-hero-controls{grid-template-columns:repeat(2,1fr)}#war-combat-canvas{width:100%;height:auto}.hud-essentials .stat-pill:nth-child(n+3){display:none}}@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;scroll-behavior:auto!important}}
/* Anime-inspired original meadow battle presentation; four-card dock, no spare member. */
.war-hero-controls{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;background:linear-gradient(180deg,#18243c,#0b1222);padding:9px;border:2px solid #d7b46a;border-radius:18px}.anime-dock-card{position:relative;min-height:92px;border:2px solid #7084a8!important;border-radius:14px!important;background:linear-gradient(145deg,#253452,#111a2d)!important;box-shadow:inset 0 0 0 2px #ffffff12}.anime-dock-card.is-ready{border-color:#f1c40f!important;box-shadow:0 0 16px #f39c12,inset 0 0 0 2px #fff5!important}.anime-avatar{display:block;width:42px;height:42px;margin:auto;border-radius:12px;border:2px solid #fff8;background:linear-gradient(145deg,#74b9ff,#2d568d)}.anime-avatar.role-1{background:linear-gradient(145deg,#ff7675,#9c2934)}.anime-avatar.role-2{background:linear-gradient(145deg,#6c5ce7,#30236c)}.anime-avatar.role-3{background:linear-gradient(145deg,#55efc4,#16745d)}.anime-meter,.anime-tp{display:block;height:6px;border-radius:6px;background:#301b25;overflow:hidden;margin-top:4px}.anime-meter i,.anime-tp i{display:block;height:100%;background:#2ecc71}.anime-tp i{background:#0984e3}.anime-ready{display:block;margin-top:4px;color:#dfe6e9;font-weight:900}.is-ready .anime-ready{color:#ffeaa7;animation:anime-ready-bounce .65s ease-in-out infinite alternate}@keyframes anime-ready-bounce{to{transform:translateY(-2px) scale(1.06)}}@media(prefers-reduced-motion:reduce){.is-ready .anime-ready{animation:none}}

````

## `index.html`

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>HELLDIVERS PLEASE! — Super Destroyer Warship &amp; Mindustry War-Zone Tycoon (v0.0.15 Phase 1)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Rajdhani:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./css/style.css" />
  <link rel="stylesheet" href="./css/rework.css" />
</head>
<body>
  <div id="game-container">
    <canvas id="game-canvas"></canvas>
    <div id="world-labels"></div>
    <div id="screen-flash"></div>
    <span id="conv_raw_feed" style="display:none;"></span>

    <div id="hud-layer">
      <!-- ====================================================================
           ULTRA-MINIMALIST SINGLE-ROW TOP PILL BAR (< 8% SCREEN FOOTPRINT!)
           90%+ of secondary stats, teleports & menus live inside #hud-menu-drawer
           ==================================================================== -->
      <header id="hud-top">
        <div class="hud-row-main">
          <!-- Left: Essential 3 Stats (Cash, Medals, Carry Stack) -->
          <div class="hud-group hud-essentials">
            <div class="stat-pill cash-pill" id="cash-pill-el" title="Requisition Slips ($)">
              <span>💵</span>
              <div>
                <div class="stat-label">Requisition</div>
                <div class="stat-val" id="hud-cash">$60</div>
              </div>
            </div>

            <div class="stat-pill medal-pill" title="Permanent Warbond Medals (Kept Forever!)">
              <span>⭐</span>
              <div>
                <div class="stat-label">Forever Medals</div>
                <div class="stat-val" id="hud-medals">3</div>
              </div>
            </div>

            <div class="stat-pill" title="Commander Carry Stack">
              <span>🎒</span>
              <div>
                <div class="stat-label">Carry Stack</div>
                <div class="stat-val"><span id="hud-carry">3</span>/<span id="hud-carry-max">14</span></div>
              </div>
            </div>

            <div class="stat-pill" style="border-color:#4ade80;" title="Collected Samples (🟢 Common / 🟠 Rare / 🟣 Super Rare)">
              <span>🧬</span>
              <div>
                <div class="stat-label">Samples</div>
                <div class="stat-val" id="hud-samples-pill">🟢0 🟠0 🟣0</div>
              </div>
            </div>
          </div>

          <!-- Center: True Split Scene Switcher (Warship Shop, Clone Sector, Squad Manager & Nightfall Castle War Front) -->
          <div id="mode-switcher-bar">
            <button class="mode-tab-btn active-shop" id="btn-mode-shop" title="SES HallTown Super Destroyer Shop, Left-Hand Transport Port &amp; Training Room">
              🏪 工廠 Shop
            </button>
            <button class="mode-tab-btn" id="btn-open-port-top" style="border-color:#38bdf8;color:#7dd3fc;" title="Left-Hand Transport Ship Fleet &amp; Docking Port Logistics (Fixed 1🛢️/1⛏️ + Planet Ore Hauling)">
              🛸 港口 (<span id="hud-ships-count">1/1</span>)
            </button>
            <button class="mode-tab-btn" id="btn-open-training-top" style="border-color:#facc15;color:#fde047;" title="Shop Helldiver Training &amp; Recruitment Room (Max Lv.100, Skills &amp; 3+1 Hero Roster)">
              🏋️ 訓練室 (<span id="hud-heroes-count">4</span>)
            </button>
            <button class="mode-tab-btn" id="btn-open-space-map" style="border-color:#c084fc;color:#e9d5ff;" title="Galactic Space Map: Planet Ores, Mines, Garrison Defense &amp; Enemy Army Tracking">
              🪐 星圖 (<span id="hud-planets-owned">2/11</span>)
            </button>
            <button class="mode-tab-btn" id="btn-mode-sample" style="border-color:#4ade80;color:#86efac;" title="Attack Page 1: Capybara Go! Sample Search (Difficulty 1-10: 1-3🟢, 4-6🟠, 7-10🟣)">
              🧬 樣本搜尋
            </button>
            <button class="mode-tab-btn" id="btn-mode-capture" style="border-color:#f97316;color:#fdba74;" title="Attack Page 2: Capybara Go! 10-Wave Planet Capture (Retreat After Any Wave · True Permadeath!)">
              🚩 星球佔領
            </button>
            <button class="mode-tab-btn" id="btn-open-clone-top" style="border-color:#22c55e;color:#86efac;" title="Open Sector D SEAF Clone Vat Room &amp; 6-Sector Worker Job Assignment">
              🧬 克隆室 (<span id="hud-clone-count">0/6</span>)
            </button>
            <button class="mode-tab-btn" id="btn-open-save-top" style="border-color:#38bdf8;color:#bae6fd;" title="Open 3-Slot Save Manager (Switch/Save/Reset Slot 1, 2, or 3)">
              💾 存檔 (<span id="hud-save-slot-label">Slot 1</span>)
            </button>
          </div>

          <!-- Right: Single Command Drawer Button (Hides 90%+ of UI clutter until tapped!) -->
          <div class="hud-group">
            <button class="hud-btn" id="btn-toggle-menu" title="Open/Close Super Destroyer Command Center">☰ 選單</button>
          </div>
        </div>

        <!-- COLLAPSIBLE COMMAND CENTER DRAWER (Hidden by default on ALL screens until ☰ 選單 is tapped!) -->
        <div class="hud-group" id="hud-menu-drawer">
          <div class="drawer-section-header">
            <div class="brand-badge">
              <span>🚀</span>
              <span class="brand-title">SES SUPER DESTROYER COMMAND</span>
              <span class="version-pill" id="hud-version">v0.0.14</span>
            </div>

            <div class="stat-pill" style="border-color:#c084fc;" title="Galactic Space Map Liberation Progress">
              <span>🪐</span>
              <div>
                <div class="stat-label">Space Map</div>
                <div class="stat-val" id="hud-drawer-planets">1 / 21 Planets</div>
              </div>
            </div>

            <div class="stat-pill" style="border-color:#38bdf8;" title="Active Save Slot">
              <span>💾</span>
              <div>
                <div class="stat-label">Active Save</div>
                <div class="stat-val" id="hud-drawer-slot">Slot #1</div>
              </div>
            </div>

            <div class="stat-pill pill-seaf-served">
              <span>🪖</span>
              <div>
                <div class="stat-label">SEAF / Served</div>
                <div class="stat-val"><span id="hud-seaf">0</span> | <span id="hud-served">0</span></div>
              </div>
            </div>
          </div>

          <!-- Primary Command & Mindustry Modals -->
          <div class="drawer-row">
            <button class="mode-tab-btn tab-bases" id="btn-mode-bases" title="Open Mindustry Multi-Base Planetary Sector Map">
              🪐 多基地 Bases (<span id="hud-active-base-name">Alpha</span>)
            </button>
            <button class="mode-tab-btn tab-tech" id="btn-mode-tech" title="Open Mindustry Visual Node Tech Tree">
              🌟 Mindustry 科技樹
            </button>
            <button class="hud-btn primary-cta btn-primary" id="btn-open-seaf">🪖 SEAF &amp; Upgrades</button>
            <button class="hud-btn btn-skill" id="btn-open-loadout" title="Equip Weapons, Armor, Guard Dog Drone &amp; Mechs">
              🛡️ 裝備 Loadout
            </button>
            <button class="hud-btn btn-char" id="btn-open-characters" title="Preview All 17 Carbot Ep1–Ep10+ Characters, Mechs &amp; Enemies">
              🎭 角色 Preview
            </button>
            <button class="hud-btn btn-skill" id="btn-open-skills">🌟 Forever Skills</button>
            <button class="hud-btn" id="btn-open-campaign" style="border-color:#fde047;color:#fde047;">🏆 戰役 &amp; 成就</button>
          </div>

          <!-- Quick Deck Teleports, Eagle-1 500KG Stratagem & System Controls -->
          <div class="drawer-row">
            <button class="hud-btn" id="btn-snap-quarry" title="Walk to Sector A Quarry">⛏️ 礦區</button>
            <button class="hud-btn" id="btn-snap-factory" title="Walk to Sector B Factories">⚙️ 工廠</button>
            <button class="hud-btn" id="btn-snap-counter" title="Walk to Sector C 7 Dedicated Counters">💵 櫃檯</button>
            <button class="hud-btn" id="btn-snap-gates" title="Switch to Active Front Gate">🛡️ 城門</button>
            <button class="hud-btn" id="btn-zoom-reset" title="Reset Camera Zoom">🔍</button>

            <button class="hud-btn" id="btn-open-save">💾 Save</button>
            <button class="hud-btn" id="btn-mute">🔊 Audio</button>
          </div>

          <!-- Inventory Breakdown & Current Directive (Inside Drawer Only — Zero Screen Clutter!) -->
          <div class="drawer-footer-info">
            <div id="objective-ticker">
              <div id="objective-banner">
                <span>📡</span>
                <span id="objective-text">DIRECTIVE: Harvest 🛢️ E-710 in Quarry Bay ➔ Feed 🦺 Cloth Hopper ➔ Sell at Counter #1!</span>
              </div>
            </div>
            <div class="controls-hint">
              <div style="display:flex;gap:5px;flex-wrap:wrap;">
                <span class="version-pill" id="inv-badge-raw_iron" title="Port Super Iron Ore (Bot Main)">⛏️ 0</span>
                <span class="version-pill" id="inv-badge-raw_e710" title="Port E-710 Bio-Oil (Bug Main)">🛢️ 1</span>
                <span class="version-pill" id="inv-badge-raw_sand" title="Bug Lv.4-6 Unique: Chitin Bio-Sand">🏜️ 0</span>
                <span class="version-pill" id="inv-badge-raw_bile" title="Bug Lv.7-10 Unique: Bile Crystal">🧪 0</span>
                <span class="version-pill" id="inv-badge-raw_titanium" title="Bot Lv.4-6 Unique: Cyber-Titanium">🔩 0</span>
                <span class="version-pill" id="inv-badge-raw_qcore" title="Bot Lv.7-10 Unique: Quantum Core">⚛️ 0</span>
                <span class="version-pill" id="inv-badge-cloth">🦺 2</span>
                <span class="version-pill" id="inv-badge-gun">🔫 0</span>
                <span class="version-pill" id="inv-badge-resource">📦 0</span>
                <span class="version-pill" id="inv-badge-equipment">🎒 0</span>
                <span class="version-pill" id="inv-badge-vehicle">🚙 0</span>
                <span class="version-pill" id="inv-badge-mech">🤖 0</span>
                <span class="version-pill" id="inv-badge-warship">🚀 0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- IDLE QUICK INSPECTOR BAR + POP-UP TRIGGER -->
      <div id="idle-inspector-bar">
        <div id="idle-inspector-info">
          <span id="idle-inspector-title">🦺 Counter #1 &amp; Fabricator (Lv.1/10 · 1/3 Counters)</span>
          <span id="idle-inspector-sub">Tap any Machine, Counter, Drill, or Clone Room on deck to pop up Ability Upgrades!</span>
        </div>
        <button class="buy-btn" id="btn-idle-open-popup" style="background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;">🎛️ Abilities</button>
        <button class="buy-btn" id="btn-idle-quick-upgrade">⬆️ Upgrade ($80)</button>
        <button class="buy-btn medal-btn" id="btn-idle-belt-upgrade">🔗 Belt Lv.0 ($150)</button>
      </div>

      <!-- NEW IN v0.0.14: IDLE GAME FLOATING LITTLE POP-UP WINDOW FOR MULTI-ABILITY UPGRADES -->
      <div id="building-upgrade-popover" class="building-popover">
        <div class="popover-header">
          <div>
            <div class="popover-title" id="popover-building-title">🦺 B-01 Cape &amp; Armor Station</div>
            <div class="popover-stats" id="popover-building-stats">💵 Price: $30 · ⚡ Cycle: 1.7s · 📦 1 Raw ➔ 1x Good · 🏪 1/3 Desks</div>
          </div>
          <button class="modal-close" id="btn-close-popover" style="width:26px;height:26px;font-size:0.8rem;">✕</button>
        </div>
        <div class="popover-abilities-list" id="popover-abilities-list"></div>
      </div>

      <!-- v0.0.18 Phase 4: Atomic mission supply loadout -->
      <div id="war-supply-sheet" class="war-supply-sheet" hidden>
        <section class="war-supply-card" role="dialog" aria-modal="true" aria-labelledby="war-supply-title">
          <header><div><h2 id="war-supply-title">Mission Supply Loadout</h2><p id="war-supply-subtitle">Select factory stock to consume for this expedition.</p></div><button type="button" id="btn-war-supply-close" aria-label="Close supply loadout">✕</button></header>
          <fieldset id="war-contract-options" class="war-contract-options">
            <legend>Operation contract</legend>
            <label><input type="radio" name="war-contract" value="standard" checked><span><strong>Standard Operation</strong><small>100% rewards · injuries, no normal permadeath</small></span></label>
            <label><input type="radio" name="war-contract" value="hardcore"><span><strong>Helldive Contract</strong><small>150% rewards · permanent death enabled</small></span></label>
          </fieldset>
          <section id="war-injury-panel" class="war-injury-panel" aria-label="Injured heroes"></section>
          <div id="war-supply-list" class="war-supply-list"></div>
          <p id="war-supply-status" class="war-supply-status" aria-live="polite"></p>
          <footer><button type="button" id="btn-war-supply-shop">Return to Shop</button><button type="button" id="btn-war-supply-launch">Launch Expedition</button></footer>
        </section>
      </div>

      <!-- v0.0.16 Phase 2: Event-driven War expedition interface -->
      <section id="war-expedition-ui" class="war-expedition-ui" aria-label="War expedition" hidden>
        <header class="war-expedition-hud">
          <div><strong id="war-expedition-title">EXPEDITION</strong><span id="war-expedition-progress">Node 1 / 12</span></div>
          <div class="war-expedition-actions"><button type="button" id="btn-war-map">🗺️ Map</button><button type="button" id="btn-war-extract">🚁 Extract</button></div>
        </header>
        <div id="war-expedition-scene" class="war-expedition-scene">
          <div id="war-node-icon" class="war-node-icon" aria-hidden="true">⚔️</div>
          <p id="war-node-kicker">ENCOUNTER REVEALED</p>
          <h2 id="war-node-title">Hostile Contact</h2>
          <p id="war-node-description">Prepare the squad.</p>
        </div>
        <div id="war-choice-panel" class="war-choice-panel" role="group" aria-label="Encounter choices"></div>
        <section id="war-combat-panel" class="war-combat-panel" aria-label="Expedition combat" hidden>
          <canvas id="war-combat-canvas" width="720" height="720" aria-label="Vertical automatic combat scene"></canvas>
          <div id="war-combat-status" class="war-combat-status"></div>
          <div id="war-hero-controls" class="war-hero-controls" aria-label="Hero ultimates"></div>
          <div class="war-combat-tools"><button type="button" id="btn-war-auto-ultimate" aria-pressed="false">AUTO ULT: OFF</button><button type="button" id="btn-war-speed">1× SPEED</button></div>
        </section>
        <div id="war-expedition-live" class="sr-only" aria-live="polite"></div>
      </section>
      <div id="war-map-sheet" class="war-map-sheet" hidden>
        <div class="war-map-card" role="dialog" aria-modal="true" aria-labelledby="war-map-title">
          <header><h2 id="war-map-title">Expedition Route</h2><button type="button" id="btn-war-map-close" aria-label="Close route map">✕</button></header>
          <div id="war-map-nodes" class="war-map-nodes"></div>
        </div>
      </div>

      <nav id="idle-bottom-nav" aria-label="Main navigation">
        <button type="button" data-target="btn-mode-shop">🏠<span>Home</span></button>
        <button type="button" data-target="btn-open-training-top">🪖<span>Squad</span></button>
        <button type="button" data-target="btn-mode-sample" class="primary">⚔️<span>Battle</span></button>
        <button type="button" data-target="btn-open-seaf">🏭<span>Industry</span></button>
        <button type="button" data-target="btn-toggle-menu">☰<span>Menu</span></button>
      </nav>
      <!-- ULTRA-CLEAN 2-BUTTON ZOOM PILL (Right Edge) -->
      <div id="zoom-controls">
        <button class="hud-btn" id="btn-zoom-in" title="Zoom In">+</button>
        <button class="hud-btn" id="btn-zoom-out" title="Zoom Out">−</button>
      </div>

      <!-- VIRTUAL JOYSTICK FOR PHONE / TOUCH -->
      <div id="joystick-zone" title="Drag here or tap/drag anywhere on deck to move Commander">
        <div id="joystick-base"></div>
        <div id="joystick-knob"></div>
      </div>

      <!-- COMPACT BOTTOM-RIGHT ACTION BUTTONS (Dump & Sprint Only) -->
      <footer id="hud-bottom">
        <div class="mobile-action-cluster">
          <button class="action-circle-btn trash-btn" id="btn-clear-stack" title="Clear Hand Stack (R)">🗑️<span>DUMP</span></button>
          <button class="action-circle-btn sprint-btn" id="btn-sprint" title="Jet-Boot Sprint Boost (Shift)">⚡<span>SPRINT</span></button>
        </div>
      </footer>
    </div>

    <!-- ======================================================================
         MINDUSTRY MULTI-BASE PLANETARY SECTOR MAP & CAMPAIGN MODAL (🪐 多基地 Bases)
         ====================================================================== -->
    <div class="modal-backdrop" id="modal-campaign">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div class="modal-title">🪐 MINDUSTRY MULTI-BASE SECTOR MAP, LAUNCH PADS &amp; 20 MILESTONES (多基地星際網路與成就)</div>
          <button class="modal-close-btn modal-close" id="btn-close-campaign">✕</button>
        </div>
        <div class="modal-body">
          <div id="campaign-summary-box" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;background:rgba(250,204,21,0.12);border:1px solid #facc15;padding:10px 14px;border-radius:10px;"></div>
          <h4 style="font-family:var(--font-display);color:#4ade80;font-size:0.88rem;margin-top:4px;">🏛️ 6 MINDUSTRY PLANETARY SECTOR BASES (PASSIVE LAUNCH PAD EXPORTS + SWITCHABLE ACTIVE BASE)</h4>
          <div class="upgrade-grid" id="mindustry-bases-grid"></div>
          <h4 style="font-family:var(--font-display);color:#38bdf8;font-size:0.88rem;margin-top:6px;">🪐 8 PLANETARY OPERATIONS (WAVES 1–200+)</h4>
          <div class="upgrade-grid" id="campaign-planets-grid"></div>
          <h4 style="font-family:var(--font-display);color:#fde047;font-size:0.88rem;margin-top:6px;">🏆 20 COMMAND MILESTONES (FREE ⭐ FOREVER MEDALS)</h4>
          <div class="upgrade-grid" id="campaign-milestones-grid"></div>
        </div>
      </div>
    </div>

    <!-- MAIN CHARACTER 4-SLOT EQUIPMENT & LOADOUT MODAL (🛡️ 裝備 Loadout) -->
    <div class="modal-backdrop" id="modal-loadout">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div class="modal-title">🛡️ COMMANDER 4-SLOT EQUIPMENT &amp; MECH LOADOUT (主角色武器/裝甲/無人機/機甲裝備)</div>
          <button class="modal-close-btn modal-close" id="btn-close-loadout">✕</button>
        </div>
        <div class="modal-body">
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;background:rgba(56,189,248,0.12);border:1px solid #38bdf8;padding:10px 14px;border-radius:10px;">
            <div>
              <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.92rem;">
                💵 AVAILABLE REQUISITION: <span id="loadout-modal-cash">$60</span>
              </div>
              <div style="font-size:0.78rem;color:#e2e8f0;">
                Unlock and equip Primary Weapons (<strong>Breaker Shotgun, Quasar Cannon, AC-8 Autocannon</strong>), Tactical Armor, the orbiting <strong>🛸 Guard Dog Laser Drone</strong>, or personally pilot the <strong>🚙 Recon Vehicle</strong> and <strong>🤖 EXO-45 Patriot Mech</strong>!
              </div>
            </div>
          </div>
          <div class="upgrade-grid" id="loadout-grid"></div>
        </div>
      </div>
    </div>

    <!-- ALL 17 CARBOT EP1–EP10+ CHARACTERS, STAFF, MECHS & ENEMIES PREVIEW MODAL -->
    <div class="modal-backdrop" id="modal-characters">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div class="modal-title">🎭 ALL 17 CARBOT (EP1–EP10+) CHARACTERS, MECHS &amp; ENEMIES PREVIEW (全角色動態預覽圖鑑)</div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="hud-btn btn-primary" id="btn-play-from-chars">🎮 Play Game</button>
            <button class="modal-close-btn modal-close" id="btn-close-characters">✕</button>
          </div>
        </div>
        <div class="modal-body">
          <p style="font-size:0.82rem; color:#cbd5e1; line-height:1.4;">
            Live 60FPS animated preview of all <strong>17 CarbotAnimations Helldivers 2 (Ep1–Ep10+) 2D vector characters, Smart SEAF Staff, Terminids (Scavenger Hunter, Charger, Bile Spewer, Bile Titan), Automatons (Trooper, Rocket Devastator, Flame-Saw Hulk, Factory Strider), Vehicles, Mechs, and Sentries</strong> in <code>v0.0.14</code>.
          </p>
          <div class="char-showcase-grid" id="char-showcase-grid"></div>
        </div>
      </div>
    </div>

    <!-- NEW IN v0.0.14: SEAF CLONE VAT ROOM & 6-SECTOR JOB ASSIGNMENT MODAL (🧬 克隆室與工作分配) -->
    <div class="modal-backdrop" id="modal-clone-room">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div class="modal-title">🧬 SEAF CLONE VAT ROOM &amp; 6-SECTOR WORK ASSIGNMENT (克隆培育室與六大部門工作調配)</div>
          <button class="modal-close-btn modal-close" id="btn-close-clone-room">✕</button>
        </div>
        <div class="modal-body">
          <div id="clone-room-summary" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;background:rgba(34,197,94,0.12);border:1.5px solid #22c55e;padding:10px 14px;border-radius:10px;">
            <div>
              <div style="font-family:var(--font-display);font-weight:900;color:#4ade80;font-size:0.92rem;" id="clone-room-title-stat">
                🧬 CLONE VAT ROOM Lv.1/10 — WORKERS: 0 / 6 MAX
              </div>
              <div style="font-size:0.76rem;color:#cbd5e1;" id="clone-room-sub-stat">
                No need to rescue soldiers in the War Zone! Upgrade the Clone Room to raise your Worker Upper Limit (up to 30), clone new SEAF staff, and assign them to any Sector Job below!
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="buy-btn" id="btn-hire-seaf-clone">➕ Clone +1 SEAF ($70)</button>
              <button class="buy-btn medal-btn" id="btn-upgrade-clone-room">⬆️ Upgrade Clone Room Lv.2 ($140)</button>
              <button class="hud-btn" id="btn-auto-balance-jobs" style="border-color:#38bdf8;color:#7dd3fc;">⚖️ Auto-Assign All</button>
            </div>
          </div>

          <h4 id="clone-jobs-title" style="font-family:var(--font-display);color:#fde047;font-size:0.84rem;margin-top:4px;">
            📋 ASSIGN SEAF CLONES ACROSS 6 SECTOR JOBS (UNASSIGNED IDLE: <span id="clone-unassigned-count">0</span>)
          </h4>
          <div class="upgrade-grid" id="clone-jobs-grid"></div>

          <h4 id="clone-heroes-title" style="display:none;font-family:var(--font-display);color:#f97316;font-size:0.84rem;margin-top:6px;">
            🦸 HERO CLONE DNA BAY &amp; WALL OF MARTYRS (英雄招募與陣亡基因重塑 — Gen-1 可陣亡觸發烈士核爆!)
          </h4>
          <div class="upgrade-grid" id="hero-clone-grid"></div>
        </div>
      </div>
    </div>

    <!-- ======================================================================
         NEW IN v0.0.14: LEFT-HAND TRANSPORT SHIP & PORT LOGISTICS MODAL (🛸 港口與運輸艦管理)
         ====================================================================== -->
    <div class="modal-backdrop" id="modal-port-logistics">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div class="modal-title">🛸 LEFT-HAND TRANSPORT SHIP FLEET &amp; ORBITAL DOCKING PORT LOGISTICS (左舷運輸艦隊與港口擴建)</div>
          <button class="modal-close-btn modal-close" id="btn-close-port-logistics">✕</button>
        </div>
        <div class="modal-body">
          <div id="port-logistics-summary" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;background:rgba(56,189,248,0.12);border:1.5px solid #38bdf8;padding:10px 14px;border-radius:10px;"></div>
          <h4 id="port-upgrades-title" style="font-family:var(--font-display);color:#fde047;font-size:0.84rem;margin-top:4px;">
            ⚓ PORT &amp; FLEET UPGRADES (BUY SHIPS, ADD PORTS, UNLOADING SPEED &amp; STORAGE LIMIT)
          </h4>
          <div class="upgrade-grid" id="port-upgrades-grid"></div>
          <h4 id="port-ships-title" style="font-family:var(--font-display);color:#4ade80;font-size:0.84rem;margin-top:6px;">
            🛸 ACTIVE TRANSPORT SHIP FLEET STATUS (HAULING ORES FROM CAPTURED PLANETS TO HALLTOWN LEFT PORT)
          </h4>
          <div class="upgrade-grid" id="transport-ships-list"></div>
        </div>
      </div>
    </div>

    <!-- ======================================================================
         NEW IN v0.0.14: GALACTIC SPACE MAP, PLANET MINING & TRAVIAN DEFENSE MODAL (🪐 星際戰略星圖)
         ====================================================================== -->
    <div class="modal-backdrop" id="modal-space-map">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div class="modal-title">🪐 GALACTIC SPACE MAP — PLANET ORES, MINES, TRAVIAN DEFENSE &amp; 10-WAVE CAPTURE (星際戰略星圖與星球防禦)</div>
          <button class="modal-close-btn modal-close" id="btn-close-space-map">✕</button>
        </div>
        <div class="modal-body">
          <div id="space-map-summary-banner" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;background:rgba(168,85,247,0.14);border:1.5px solid #c084fc;padding:10px 14px;border-radius:10px;"></div>

          <!-- PAGE 1: Interactive 2D Space Map Network Canvas ONLY (21 Planets: 10 Bug Lv.1-10 + 10 Bot Lv.1-10) -->
          <div id="space-map-canvas-wrap" style="background:#050811;border:2px solid #38bdf8;border-radius:12px;padding:10px;text-align:center;">
            <canvas id="space-map-canvas" width="1080" height="500" style="width:100%;max-width:1080px;height:auto;cursor:pointer;border-radius:8px;"></canvas>
            <div style="font-size:0.78rem;color:#fde047;margin-top:6px;font-weight:700;">
              👆 Click any Planet on the Space Map above to open its dedicated Planet Page (Ores ➔ Economy Page OR Defense Page)!
            </div>
          </div>

          <!-- PAGE 2 / 3A / 3B: Selected Planet Overview, EconomySub-Page, or Defense Sub-Page -->
          <div id="space-planet-inspector" style="display:none;background:rgba(15,23,42,0.95);border:2px solid #facc15;border-radius:12px;padding:14px;"></div>

          <!-- PAGE 3C: Travian-Style Planetary Defense Battle Reports Sub-Page -->
          <h4 id="travian-battle-log-title" style="display:none;font-family:var(--font-display);color:#f97316;font-size:0.84rem;margin-top:6px;">
            📜 TRAVIAN-STYLE PLANETARY DEFENSE WAR CALCULATIONS &amp; INVASION LOG (自動防禦戰鬥結算報告)
          </h4>
          <div id="travian-battle-log" style="display:none;max-height:260px;overflow-y:auto;background:rgba(9,13,20,0.9);border:1px solid #475569;border-radius:8px;padding:10px;font-size:0.8rem;color:#e2e8f0;"></div>

          <h4 id="space-planets-grid-title" style="display:none;font-family:var(--font-display);color:#38bdf8;font-size:0.84rem;margin-top:6px;">
            🪐 ALL GALACTIC SECTOR PLANETS (SINGLE FACTION PER PLANET: 🐛 BUGS OR 🤖 AUTOBOTS)
          </h4>
          <div id="space-planets-grid" class="upgrade-grid" style="display:none;"></div>
        </div>
      </div>
    </div>

    <!-- ======================================================================
         NEW IN v0.0.14: SHOP HELLDIVER TRAINING & RECRUITMENT ROOM MODAL (🏋️ 戰士訓練與招募室 — MAX Lv.100 & SKILLS)
         ====================================================================== -->
    <div class="modal-backdrop" id="modal-training-room">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div class="modal-title">🏋️ SHOP HELLDIVER TRAINING &amp; RECRUITMENT ROOM (戰士訓練與招募室 — MAX Lv.100, SKILLS &amp; 4-ACTIVE SQUAD)</div>
          <button class="modal-close-btn modal-close" id="btn-close-training-room">✕</button>
        </div>
        <div class="modal-body">
          <div id="training-room-summary" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;background:rgba(250,204,21,0.12);border:1.5px solid #facc15;padding:10px 14px;border-radius:10px;"></div>

          <h4 id="training-lineup-title" style="font-family:var(--font-display);color:#4ade80;font-size:0.84rem;margin-top:4px;">
            ⚔️ YOUR 4-HERO CAPYBARA GO! EXPEDITION LINEUP (4 ACTIVE SQUAD MEMBERS · NO SPARE TEAM)
          </h4>
          <div class="upgrade-grid" id="training-lineup-grid"></div>

          <h4 id="training-roster-title" style="font-family:var(--font-display);color:#fde047;font-size:0.84rem;margin-top:6px;">
            🎖️ YOUR HELLDIVER HERO ROSTER (TRAIN Lv.1–100, EQUIP 4-SLOT SHOP GEAR &amp; UNLOCK Lv.1/25/60 SKILLS — ⚠️ PERMADEATH IF KILLED!)
          </h4>
          <div class="upgrade-grid" id="training-roster-grid"></div>

          <h4 id="training-recruit-title" style="font-family:var(--font-display);color:#38bdf8;font-size:0.84rem;margin-top:6px;">
            ➕ RECRUIT NEW HELLDIVER ARCHETYPES (6 CLASSES · MAX ABILITY 100 · 3 SIGNATURE SKILLS EACH)
          </h4>
          <div class="upgrade-grid" id="training-recruit-grid"></div>
        </div>
      </div>
    </div>

    <!-- 20-LEVEL UPGRADES, QUARRY, MACHINES, SPLIT BELTS & 3-LAYER GATES MODAL -->
    <div class="modal-backdrop" id="modal-seaf">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div class="modal-title">🪖 20-LEVEL FACTORY, QUARRY, SPLIT CONVEYOR BELTS, 7 COUNTERS &amp; SMART SEAF UPGRADES</div>
          <button class="modal-close-btn modal-close" id="btn-close-seaf">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.82rem; color:#cbd5e1;">
            Every <strong>Quarry Auto-Drill, Production Machine + Dedicated Counter (#1–#7), Split Factorio Conveyor Belt (🛢️ E-710 / ⛏️ Iron / 🛒 7 Counter Belts / 🧱 Gate Belts), Gate Layer, and Smart SEAF Staff Role</strong> upgrades from <strong>Lv.1 to Lv.20</strong>:
          </p>
          <div id="shop-upgrade-wallet" class="shop-upgrade-wallet" aria-label="Upgrade resources"></div>
          <div id="shop-upgrade-filters" class="shop-upgrade-filters" role="group" aria-label="Upgrade filters"></div>
          <div id="shop-upgrade-live" class="sr-only" aria-live="polite"></div>
          <div class="upgrade-grid shop-upgrade-grid" id="upgrades-list"></div>
        </div>
      </div>
    </div>

    <!-- ======================================================================
         MINDUSTRY-STYLE VISUAL NODE TECH TREE & FOREVER SKILLS MODAL (🌟 科技樹)
         ====================================================================== -->
    <div class="modal-backdrop" id="modal-skills">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div class="modal-title">🌟 MINDUSTRY VISUAL TECH TREE &amp; PERMANENT WARBOND RESEARCH (Mindustry 節點式科技樹)</div>
          <button class="modal-close-btn modal-close" id="btn-close-skills">✕</button>
        </div>
        <div class="modal-body">
          <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; background:rgba(168,85,247,0.15); border:1px solid #a855f7; padding:8px 12px; border-radius:10px;">
            <div>
              <div style="font-family:var(--font-display); font-weight:900; color:#fde047; font-size:0.88rem;">
                ⭐ FOREVER MEDALS: <span id="skill-modal-medals">3</span> | 💵 REQUISITION: <span id="skill-modal-cash">$60</span>
              </div>
              <div style="font-size:0.74rem; color:#e2e8f0;">
                Tap any node on the <strong>Mindustry Core Schematic Tree</strong> below to inspect &amp; unlock child branches (kept forever across all bases &amp; runs!).
              </div>
            </div>
            <button class="buy-btn medal-btn" id="btn-buy-medal">
              💱 Exchange $150 -&gt; +1 ⭐ Medal
            </button>
          </div>

          <!-- Interactive 2D Mindustry Visual Node Tech Tree -->
          <div class="mindustry-tree-wrap">
            <canvas id="mindustry-tree-canvas" width="920" height="340"></canvas>
            <div id="mindustry-node-inspector"></div>
          </div>

          <h4 style="font-family:var(--font-display);color:#fde047;font-size:0.84rem;margin-top:4px;">📋 ALL RESEARCH NODES &amp; PERMANENT SKILLS (Lv.1–20)</h4>
          <div class="upgrade-grid" id="skill-tree-list"></div>
        </div>
      </div>
    </div>

    <!-- DEFEAT / INNER GATE 1 BREACHED MODAL -->
    <div class="modal-backdrop" id="modal-defeat">
      <div class="modal-card" style="border-color:#ef4444;">
        <div class="modal-header" style="background:rgba(127, 29, 29, 0.95);">
          <div class="modal-title" style="color:#fca5a5;">💥 ALL 3 GATE LAYERS BREACHED — SECTOR OVERRUN!</div>
        </div>
        <div class="modal-body">
          <p id="defeat-summary-text" style="font-size:0.92rem; color:#f8fafc; line-height:1.45;">
            Automaton and Terminid forces broke through Outer Gate 3, Middle Gate 2, and Inner Gate 1! Your current sector defense was overrun, but High Command evacuated your <strong>⭐ Warbond Medals</strong>, <strong>🪐 Conquered Mindustry Bases</strong>, <strong>🛡️ Commander Loadout Gear</strong>, and <strong>🌟 Mindustry Tech Tree</strong> upgrades!
          </p>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="hud-btn btn-primary" id="btn-redeploy-now" style="font-size:0.88rem; padding:9px 16px;">
              🔄 Redeploy New Factory (Keep Forever Skills &amp; Gear!)
            </button>
            <button class="hud-btn btn-skill" id="btn-defeat-open-skills" style="font-size:0.88rem; padding:9px 16px;">
              🌟 Spend Forever Medals First
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3-SLOT SAVE / LOAD MANAGER MODAL (SPLIT INTO PAGES: SLOTS PAGE vs. CODE EXPORT PAGE) -->
    <div class="modal-backdrop" id="modal-save">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div class="modal-title">💾 3-SLOT SAVE MANAGER &amp; CLOUD CODE BACKUP (三存檔槽管理系統 · v0.0.14)</div>
          <button class="modal-close-btn modal-close" id="btn-close-save">✕</button>
        </div>
        <div class="modal-body">
          <div id="save-modal-nav" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;background:rgba(56,189,248,0.12);border:1.5px solid #38bdf8;padding:10px 14px;border-radius:10px;">
            <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.92rem;" id="save-modal-active-banner">
              💾 ACTIVE SAVE SLOT: SLOT #1 (Auto-Saving Enabled)
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="buy-btn" id="btn-save-tab-slots">🗂️ Page 1: 3 Save Slots (Slot 1 / 2 / 3)</button>
              <button class="hud-btn" id="btn-save-tab-code" style="border-color:#facc15;color:#fde047;">📋 Page 2: Export / Import Save Code</button>
            </div>
          </div>

          <!-- PAGE 1: 3 SAVE SLOTS GRID -->
          <div id="save-slots-page">
            <div class="upgrade-grid" id="save-slots-grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:8px;"></div>
          </div>

          <!-- PAGE 2: SAVE CODE EXPORT / IMPORT -->
          <div id="save-code-page" style="display:none;margin-top:8px;">
            <p style="font-size:0.82rem; color:#cbd5e1; margin-bottom:8px;">
              Copy or paste a Base64 Save Code below to transfer your currently active slot (<strong><span id="save-code-slot-name">Slot #1</span></strong>) across devices:
            </p>
            <textarea class="code-textarea" id="save-code-box" placeholder="Save code will appear here..."></textarea>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
              <button class="hud-btn primary-cta btn-primary" id="btn-copy-save">📋 Copy Save Code</button>
              <button class="hud-btn" id="btn-import-save">📥 Load Save Code into Current Slot</button>
              <button class="hud-btn" id="btn-reset-save" style="border-color:#ef4444;color:#f87171;">🗑️ Reset Current Slot</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Modular Game Scripts -->
  <script src="./js/config.js"></script>
  <script src="./js/audio.js"></script>
  <script src="./js/shop-upgrades.js"></script>
  <script src="./js/war-run.js"></script>
  <script src="./js/war-casualties.js"></script>
  <script src="./js/war-supplies.js"></script>
  <script src="./js/war-supply-ui.js"></script>
  <script src="./js/war-events.js"></script>
  <script src="./js/war-combat.js"></script>
  <script src="./js/war-combat-ui.js"></script>
  <script src="./js/war-ui.js"></script>
  <script src="./js/world.js"></script>
  <script src="./js/game.js"></script>
  <script src="./js/rework-ui.js"></script>
</body>
</html>

````

## `js/rework-ui.js`

````javascript
(function(){'use strict';function activate(id){document.getElementById(id)?.click();}function bind(){document.querySelectorAll('#idle-bottom-nav [data-target]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.target)));const title=document.querySelector('#modal-save .modal-title');if(title)title.textContent='💾 SELECT A SAVE SLOT';requestAnimationFrame(()=>requestAnimationFrame(()=>activate(document.getElementById('btn-open-save-top')?'btn-open-save-top':'btn-open-save')));}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind):bind();})();

````

## `js/war-combat-ui.js`

````javascript
(function(){'use strict';
let raf=0,last=0,state=null,game=null;const el=id=>document.getElementById(id),TAU=Math.PI*2;
const C={sky:'#3498db',cyan:'#a0e2f5',mountain:'#6c5ce7',hill1:'#55efc4',hill2:'#00b894',marble:'#f1f2f6',ivy:'#1b8a5a',grass:'#6ab04c',soil:'#487e2b',pink:'#ff7675',yellow:'#ffeaa7',ink:'#172033',gold:'#f1c40f',hp:'#2ecc71',tp:'#0984e3'};
function squad(g){return(g.capybaraLineup||[]).slice(0,4).map(id=>{const h=(g.helldiverRoster||[]).find(x=>x.id===id),classDef=(window.GameConfig.HELLDIVER_CLASSES||[]).find(c=>c.id===h?.classId);return h?{...h,classDef}:null;}).filter(Boolean);}
function rr(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function bar(ctx,x,y,w,p,c,bg='#172033'){ctx.fillStyle=bg;rr(ctx,x,y,w,7,4);ctx.fill();ctx.fillStyle=c;rr(ctx,x,y,w*Math.max(0,Math.min(1,p)),7,4);ctx.fill();}
function cloud(ctx,x,y,s){ctx.fillStyle='rgba(255,255,255,.72)';ctx.beginPath();ctx.arc(x,y,20*s,Math.PI,0);ctx.arc(x+24*s,y-8*s,29*s,Math.PI,0);ctx.arc(x+57*s,y,22*s,Math.PI,0);ctx.lineTo(x+57*s,y+12*s);ctx.lineTo(x,y+12*s);ctx.closePath();ctx.fill();}
function background(ctx,w,h,t){const g=ctx.createLinearGradient(0,0,0,h*.7);g.addColorStop(0,C.sky);g.addColorStop(1,C.cyan);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);const s0=(t*7)%(w+240);cloud(ctx,-100+s0,72,.85);cloud(ctx,360+s0*.4,120,.62);ctx.save();ctx.globalAlpha=.25;ctx.fillStyle=C.mountain;ctx.beginPath();ctx.moveTo(0,h*.48);for(let x=0;x<=w;x+=80)ctx.lineTo(x,h*.34+Math.sin(x*.018)*35);ctx.lineTo(w,h*.62);ctx.lineTo(0,h*.62);ctx.fill();ctx.restore();const off=(t*20)%420;ctx.fillStyle=C.hill1;ctx.beginPath();ctx.moveTo(0,h*.58);for(let x=-80;x<=w+80;x+=90)ctx.quadraticCurveTo(x+45+(off*.05),h*.48+Math.sin(x)*10,x+90,h*.58);ctx.lineTo(w,h*.78);ctx.lineTo(0,h*.78);ctx.fill();ctx.fillStyle=C.hill2;ctx.beginPath();ctx.moveTo(0,h*.64);for(let x=-100;x<=w+100;x+=120)ctx.quadraticCurveTo(x+60-off*.04,h*.53,x+120,h*.64);ctx.lineTo(w,h*.8);ctx.lineTo(0,h*.8);ctx.fill();drawRuins(ctx,w,h,t);ctx.fillStyle='rgba(255,255,220,.12)';ctx.beginPath();ctx.moveTo(w*.66,0);ctx.lineTo(w*.93,0);ctx.lineTo(w*.64,h*.76);ctx.lineTo(w*.45,h*.76);ctx.fill();const gy=h*.76;ctx.fillStyle=C.grass;ctx.fillRect(0,gy,w,h-gy);ctx.fillStyle=C.soil;ctx.fillRect(0,gy+22,w,h-gy-22);for(let i=0;i<42;i++){const x=(i*97+13)%w,y=gy+8+(i%3)*4;ctx.fillStyle=i%2?C.pink:C.yellow;ctx.beginPath();ctx.arc(x,y,2.2,0,TAU);ctx.fill();ctx.strokeStyle='#2f6d2c';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y+4);ctx.lineTo(x+Math.sin(t*2+i)*2,y+13);ctx.stroke();}}
function drawRuins(ctx,w,h,t){ctx.save();ctx.translate(-((t*10)%540),0);for(let k=0;k<3;k++){const x=90+k*270,y=h*.42;ctx.fillStyle=C.marble;ctx.strokeStyle='#c9ced8';ctx.lineWidth=3;ctx.fillRect(x,y,24,h*.34);ctx.strokeRect(x,y,24,h*.34);ctx.fillRect(x-10,y-10,44,12);ctx.fillRect(x-8,y+h*.34,40,10);ctx.strokeStyle=C.ivy;ctx.lineWidth=4;ctx.beginPath();for(let q=0;q<6;q++){const yy=y+q*30;ctx.lineTo(x+12+Math.sin(q+t)*8,yy);}ctx.stroke();}ctx.restore();}
function limb(ctx,x,y,len,ang,w,col){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.strokeStyle=C.ink;ctx.lineWidth=w+4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,len);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke();ctx.restore();}
function heroPuppet(ctx,x,y,u,i,t){const palette=[['#74b9ff','#fdcb6e'],['#ff7675','#ffeaa7'],['#6c5ce7','#2d3436'],['#55efc4','#f1f2f6']][i],body=palette[0],hair=palette[1],breath=Math.sin(t*3+i)*2,attack=u.attackFlash>0,skill=u.skillFlash>0,hit=u.hitFlash>0;ctx.save();ctx.translate(x+(attack?8:0),y+breath);ctx.globalAlpha=u.alive?.98:.35;ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,34,27,8,0,0,TAU);ctx.fill();limb(ctx,-9,18,18,.12+Math.sin(t*6+i)*.08,7,body);limb(ctx,9,18,18,-.12-Math.sin(t*6+i)*.08,7,body);ctx.fillStyle=body;ctx.strokeStyle=C.ink;ctx.lineWidth=4;rr(ctx,-15,-6,30,31,10);ctx.fill();ctx.stroke();limb(ctx,-15,0,18,attack?-.9:-.3,6,body);limb(ctx,15,0,18,attack?-1.6:.3,6,body);ctx.fillStyle=hair;ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-23,22,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-7,-22,5,7,0,0,TAU);ctx.ellipse(7,-22,5,7,0,0,TAU);ctx.fill();ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(-7,-21,2.5,0,TAU);ctx.arc(7,-21,2.5,0,TAU);ctx.fill();ctx.strokeStyle= i===1?'#6c5ce7':i===2?'#55efc4':'#dfe6e9';ctx.lineWidth=7;ctx.beginPath();if(i===2){ctx.arc(22,-8,11,0,TAU);}else{ctx.moveTo(19,-1);ctx.lineTo(attack?57:45,attack?-18:10);}ctx.stroke();if(i===0){ctx.strokeStyle='#f8f9fa';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(22,-3);ctx.lineTo(attack?64:51,attack?-22:14);ctx.stroke();}if(skill){ctx.strokeStyle=C.gold;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-4,38+Math.sin(t*9)*5,0,TAU);ctx.stroke();}if(hit){ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,-8,34,0,TAU);ctx.stroke();}ctx.restore();}
function enemyPuppet(ctx,x,y,e,i,t){ctx.save();ctx.translate(x-(e.attackFlash>0?9:0),y+Math.sin(t*4+i)*2);ctx.globalAlpha=e.alive?.98:.25;ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,30,28,8,0,0,TAU);ctx.fill();ctx.fillStyle=i%2?'#a29bfe':'#596275';ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,27,24,0,0,TAU);ctx.fill();ctx.stroke();if(i%2){ctx.fillStyle='#6c5ce7';ctx.beginPath();ctx.arc(0,-22,21,Math.PI,TAU);ctx.fill();ctx.stroke();for(let a=0;a<5;a++){ctx.beginPath();ctx.arc(-15+a*8,-32-Math.abs(2-a)*2,3,0,TAU);ctx.fill();}}else{ctx.fillStyle='#838e9b';ctx.beginPath();ctx.moveTo(-20,-16);ctx.lineTo(-28,-34);ctx.lineTo(-8,-20);ctx.lineTo(8,-20);ctx.lineTo(28,-34);ctx.lineTo(20,-16);ctx.fill();ctx.stroke();}ctx.fillStyle='#ff4757';ctx.beginPath();ctx.arc(-8,-4,3,0,TAU);ctx.arc(8,-4,3,0,TAU);ctx.fill();if(e.hitFlash>0){ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,35,0,TAU);ctx.stroke();}ctx.restore();}
function topHud(ctx,w,t){ctx.fillStyle='rgba(13,22,38,.82)';rr(ctx,14,12,150,38,14);ctx.fill();ctx.strokeStyle='#c89545';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff';ctx.font='800 18px sans-serif';ctx.textAlign='center';ctx.fillText('WAVE 1/3',89,37);const remain=Math.max(0,90-Math.floor(t));ctx.fillStyle=remain<15&&Math.sin(t*7)>0?'#e74c3c':'#fff';ctx.font='900 23px monospace';ctx.fillText(`${String(Math.floor(remain/60)).padStart(2,'0')}:${String(remain%60).padStart(2,'0')}`,w/2,38);}
function draw(){const c=el('war-combat-canvas'),ctx=c.getContext('2d'),w=c.width,h=c.height,t=state.elapsed;ctx.clearRect(0,0,w,h);background(ctx,w,h,t);topHud(ctx,w,t);const ep=[[125,280],[300,250],[475,280],[620,245]],hp=[[200,490],[430,490],[250,615],[510,615]];state.enemies.forEach((e,i)=>{const [x,y]=ep[i];enemyPuppet(ctx,x,y,e,i,t);bar(ctx,x-50,y+43,100,e.hp/e.maxHp,'#e74c3c');});state.heroes.forEach((u,i)=>{const [x,y]=hp[i];heroPuppet(ctx,x,y,u,i,t);bar(ctx,x-50,y+43,100,u.hp/u.maxHp,C.hp);bar(ctx,x-50,y+53,100,u.energy/100,C.tp);if(u.attackFlash>0){const target=state.enemies.find(e=>e.alive);if(target){const j=state.enemies.indexOf(target),[tx,ty]=ep[j];ctx.strokeStyle=i===2?'#a29bfe':'#fff';ctx.lineWidth=i===2?5:3;ctx.beginPath();ctx.moveTo(x+28,y-5);ctx.lineTo(tx,ty);ctx.stroke();}}});ctx.fillStyle='#fff';ctx.font='800 15px sans-serif';ctx.textAlign='left';ctx.fillText(`${state.enemies.filter(e=>e.alive).length} ENEMIES`,18,72);}
function controls(){const box=el('war-hero-controls');box.replaceChildren();state.heroes.forEach((h,i)=>{const b=document.createElement('button');b.type='button';b.className='war-ultimate-btn anime-dock-card';b.innerHTML=`<span class="anime-avatar role-${i}"></span><strong>${h.name}</strong><span class="anime-meter"><i style="width:${Math.floor(h.hp/h.maxHp*100)}%"></i></span><span class="anime-tp"><i style="width:${Math.floor(h.energy)}%"></i></span><span class="anime-ready">${h.energy>=100?'SKILL OK':Math.floor(h.energy)+'%'}</span>`;b.disabled=!h.alive||h.energy<100;b.classList.toggle('is-ready',h.energy>=100&&h.alive);b.addEventListener('click',()=>{window.WarCombatEngine.ultimate(state,i,window.GameConfig.WAR_COMBAT);controls();draw();});box.appendChild(b);});el('war-combat-status').textContent=`${state.modifier?state.modifier.name+' · ':''}${state.enraged?'ENRAGED · ':''}${state.elapsed.toFixed(1)}s`;}
function finish(result){cancelAnimationFrame(raf);raf=0;game.warRun.combat=null;el('war-combat-panel').hidden=true;if(result==='victory'){const n=game.warRun.route[game.warRun.nodeIndex],m=Number(game.warRun.rewardMult||1);game.warRun.loot.cash+=Math.round((n.type==='boss'?500:n.type==='elite'?240:110)*m);game.warRun.phase='reward';window.WarUI.showReward(game);}else{window.WarCasualtyEngine.resolveDefeat(game,state,game.warRun.contractMode||'standard');game.warRun.active=false;game.saveGame();window.WarUI.hide();game.setViewMode('shop');}game.saveGame();}
function loop(t){if(!last)last=t;const dt=Math.min(.1,(t-last)/1000);last=t;window.WarCombatEngine.tick(state,dt,window.GameConfig.WAR_COMBAT);draw();controls();game.warRun.combat=window.WarCombatEngine.snapshot(state);if(state.status!=='active')return finish(state.status);raf=requestAnimationFrame(loop);}
function start(g){game=g;const members=squad(g);if(members.length!==4){window.alert('Select exactly four active squad members before deployment.');window.WarUI.show(g);return false;}const run=g.warRun,node=run.route[run.nodeIndex];state=window.WarCombatEngine.create({config:window.GameConfig,node,difficulty:run.difficulty,faction:run.faction,seed:run.seed,nodeIndex:run.nodeIndex,heroes:members,autoUltimate:g.warProgress.autoUltimateEnabled,supplyEffects:run.supplyEffects});run.phase='combat';run.combat=state;window.WarUI.hide();const shell=el('war-expedition-ui');shell.hidden=false;shell.style.cssText+=';display:grid;visibility:visible;opacity:1';const route=el('war-route-panel');route.hidden=true;route.style.display='none';el('war-combat-panel').hidden=false;el('war-combat-panel').style.display='grid';el('joystick-zone').style.display='none';el('hud-bottom').style.display='none';last=0;controls();draw();g.saveGame();raf=requestAnimationFrame(loop);return true;}
function bind(){el('btn-war-auto-ultimate')?.addEventListener('click',()=>{if(!state)return;state.autoUltimate=!state.autoUltimate;game.warProgress.autoUltimateEnabled=state.autoUltimate;el('btn-war-auto-ultimate').textContent=`AUTO SKILL: ${state.autoUltimate?'ON':'OFF'}`;game.saveGame();});el('btn-war-speed')?.addEventListener('click',()=>{if(!state)return;state.speed=state.speed===1?2:1;el('btn-war-speed').textContent=`${state.speed}× SPEED`;});}document.addEventListener('DOMContentLoaded',bind);window.WarCombatUI={start};})();

````

## `js/war-combat.js`

````javascript
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.WarCombatEngine=api;})(typeof window!=='undefined'?window:globalThis,function(){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
function hero(h,cls,pos){const level=clamp(h?.level||1,1,100);return{id:h?.id||`hero_${pos}`,name:h?.name||cls?.name||'Helldiver',icon:h?.icon||cls?.icon||'🪖',classId:h?.classId||cls?.id||'cls_vanguard',position:pos,maxHp:Math.round((h?.maxHp||cls?.baseHp||420)*(1+level*.012)),hp:0,attack:Math.round((h?.attack||h?.atk||cls?.baseAtk||35)*(1+level*.009)),energy:0,shield:0,alive:true,attackTimer:0,attackFlash:0,skillFlash:0,hitFlash:0,walk:1};}
function enemy(i,boss,elite,faction,hp,atk){const bug=faction!=='autobots',sets=elite?(bug?['Charger','Bile Spewer']:['Devastator','Hulk']):(bug?['Scavenger','Hunter','Bile Spitter','Warrior']:['Trooper','Raider','Rocket Trooper','Berserker']);return{id:`enemy_${i}`,name:boss?(bug?'Bile Titan':'Factory Strider'):sets[i%sets.length],type:boss?(bug?'titan':'strider'):(elite?(bug?(i?'spewer':'bug'):(i?'hulk':'devastator')):(bug?(i?'hunter':'bug'):(i?'devastator':'trooper'))),maxHp:Math.round(hp),hp:Math.round(hp),attack:atk,attackTimer:.25*i,alive:true,hitFlash:0,attackFlash:0};}
function create(o){const cfg=o.config.WAR_COMBAT||{},node=o.node||{type:'battle'},d=clamp(o.difficulty,1,10),positions=['front-left','front-right','back-left','back-right'],bonus=cfg.formationBonuses||{};const heroes=(o.heroes||[]).slice(0,4).map((x,i)=>{const h=hero(x,x.classDef,positions[i]);h.form=bonus[h.position]||bonus[i<2?'front':'rear']||{};return h;});if(heroes.length!==4)throw new Error('Exactly four active squad members are required.');const supply=o.supplyEffects||{};heroes.forEach(h=>{h.maxHp=Math.round(h.maxHp*Number(supply.hpMult||1));h.hp=h.maxHp;h.attack=Math.round(h.attack*Number(supply.attackMult||1));h.energy=clamp(supply.startingEnergy||0,0,100);h.shield=h.maxHp*Number(supply.startingShield||0);h.form.damageReduction=Math.min(.65,Number(h.form.damageReduction||0)+Number(supply.damageReduction||0));});const boss=node.type==='boss',elite=node.type==='elite',count=boss?1:elite?2:Math.min(4,2+Math.floor(d/4)),total=(boss?2400:elite?1500:1000)*(1+d*.3),atk=(boss?34:elite?22:14)*(1+d*.2)*Number(supply.enemyAttackMult||1);const enemies=Array.from({length:count},(_,i)=>enemy(i,boss,elite,o.faction,total/count,atk/(boss?1:1.35)));const mods=cfg.eliteModifiers||[];return{schemaVersion:2,status:'active',elapsed:0,enraged:false,speed:1,autoUltimate:!!o.autoUltimate,nodeType:node.type,modifier:elite&&mods.length?mods[((o.seed||1)+(o.nodeIndex||0))%mods.length]:null,heroes,enemies,log:[]};}
const livingHeroes=s=>s.heroes.filter(h=>h.alive&&h.hp>0),livingEnemies=s=>s.enemies.filter(e=>e.alive&&e.hp>0);
function damage(target,amount){let n=Math.max(0,amount);if(target.shield>0){const used=Math.min(target.shield,n);target.shield-=used;n-=used;}target.hp=Math.max(0,target.hp-n);target.hitFlash=.2;if(target.hp<=0)target.alive=false;}
function ultimate(s,i,cfg){const h=s.heroes[i];if(!h||!h.alive||h.energy<100||s.status!=='active')return false;const u=(cfg.ultimates||{})[h.classId]||{name:'Orbital Support',damage:4};h.energy=0;h.skillFlash=.55;const foes=livingEnemies(s);if(u.damage){const area=u.area!==false,targets=area?foes:[foes[0]].filter(Boolean),per=h.attack*u.damage/(area?Math.max(1,targets.length*.7):1);targets.forEach(e=>damage(e,per));}if(u.heal)s.heroes.forEach(x=>{if(x.alive)x.hp=Math.min(x.maxHp,x.hp+x.maxHp*u.heal);});if(u.shield)s.heroes.forEach(x=>{if(x.alive)x.shield+=x.maxHp*u.shield;});s.log.push(`${h.name}: ${u.name}`);return true;}
function tick(s,dt,cfg){if(s.status!=='active')return s;dt=clamp(dt,0,.25)*s.speed;s.elapsed+=dt;if(s.elapsed>=(cfg.enrageSeconds||75))s.enraged=true;let hs=livingHeroes(s),es=livingEnemies(s);if(!hs.length){s.status='defeat';return s;}if(!es.length){s.status='victory';return s;}for(const h of hs){h.walk=Math.max(0,h.walk-dt);h.attackFlash=Math.max(0,h.attackFlash-dt);h.skillFlash=Math.max(0,h.skillFlash-dt);h.hitFlash=Math.max(0,h.hitFlash-dt);h.attackTimer-=dt;if(h.attackTimer<=0){es=livingEnemies(s);const target=es[Math.floor(Math.random()*es.length)];if(target){damage(target,h.attack*(1+Number(h.form.attack||0))*(1-Number(s.modifier?.defence||0)));h.attackFlash=.16;h.energy=clamp(h.energy+14*(1+Number(h.form.energyGain||0))*(1-Number(s.modifier?.energyPenalty||0)),0,100);}h.attackTimer=.72;if(s.autoUltimate&&h.energy>=100)ultimate(s,s.heroes.indexOf(h),cfg);}}es=livingEnemies(s);if(!es.length){s.status='victory';return s;}for(const e of es){e.hitFlash=Math.max(0,e.hitFlash-dt);e.attackFlash=Math.max(0,e.attackFlash-dt);if(s.modifier?.regen)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*s.modifier.regen*dt);e.attackTimer-=dt;if(e.attackTimer<=0){hs=livingHeroes(s);const target=hs.slice().sort((a,b)=>(b.form.threat||1)-(a.form.threat||1))[0];if(!target)break;damage(target,e.attack*(1+Number(s.modifier?.attack||0))*(s.enraged?1.75:1)*(1-Number(target.form.damageReduction||0)));target.energy=clamp(target.energy+10,0,100);e.attackFlash=.2;e.attackTimer=1.05/(1+Number(s.modifier?.speed||0));}}if(!livingHeroes(s).length)s.status='defeat';return s;}
function snapshot(s){return JSON.parse(JSON.stringify(s));}return{create,tick,ultimate,snapshot,clamp,livingEnemies,livingHeroes};});

````

## `js/world.js`

````javascript
// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.07 (All-Episode Carbot Art, Real-Item-Only Split Belts,
//                   7 Dedicated Item Counters & Smart SEAF AI Edition)
// Module: High-DPI 2D Factorio + CarbotAnimations Ep1–Ep10+ Vector World,
//         4600x4000 Zero-Overlap Layout, Real-Packet Conveyor Rendering,
//         Split Raw Belts (Purple E-710 / Cyan Iron), 7 Dedicated Sales Counters,
//         Eagle-1 500kg Flyover Jet Shadow & Live Tactical Mini-Map Radar
// ============================================================================

(function () {
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const radius = Math.min(typeof r === 'number' ? r : 8, w / 2, h / 2);
      this.moveTo(x + radius, y);
      this.arcTo(x + w, y, x + w, y + h, radius);
      this.arcTo(x + w, y + h, x, y + h, radius);
      this.arcTo(x, y + h, x, y, radius);
      this.arcTo(x, y, x + w, y, radius);
      this.closePath();
      return this;
    };
  }

  class WorldRenderer2D {
    constructor(canvasEl) {
      this.canvas = canvasEl || document.getElementById('game-canvas');
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.display = 'block';
      this.ctx = this.canvas.getContext('2d');

      this.width = window.innerWidth || 1280;
      this.height = window.innerHeight || 720;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.camX = -120;
      this.camZ = 220;
      const isMobileScreen = (window.innerWidth || 1280) < 768;
      this.zoom = isMobileScreen ? 0.36 : 0.54;
      this.targetZoom = this.zoom;
      this.pinchStartDist = null;
      this.pinchStartZoom = this.zoom;
      this.shakeTimer = 0;
      this.shakeIntensity = 0;

      this.beltPhase = 0;
      this.time = 0;

      this.craters = [];
      for (let i = 0; i < 68; i++) {
        const seed = (i * 9301 + 49297) % 233280;
        const rx = ((seed / 233280) - 0.5) * 3400;
        const rz = -260 - ((i * 4177) % 1580);
        const rad = 26 + (i % 6) * 12;
        this.craters.push({ x: rx, z: rz, r: rad });
      }

      // Deep-space starfield for SES Super Destroyer Orbital Warship backdrop
      this.spaceStars = [];
      for (let i = 0; i < 140; i++) {
        const s1 = (i * 7919 + 104729) % 100000;
        const s2 = (i * 15485863 + 32452843) % 100000;
        this.spaceStars.push({
          x: -3600 + (s1 / 100000) * 7600,
          z: -1400 + (s2 / 100000) * 4400,
          r: 1.2 + (i % 4) * 0.9,
          speed: 1.5 + (i % 5) * 0.7,
          color: i % 7 === 0 ? '#38bdf8' : (i % 5 === 0 ? '#fde047' : '#f8fafc')
        });
      }
      this.lastPlayerPos = { x: -100, z: 220 };

      this.handleResize();
      window.addEventListener('resize', () => this.handleResize());

      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.07 : 0.07;
        this.setZoom(this.targetZoom + delta);
      }, { passive: false });

      // 2-Finger Pinch-to-Zoom for Mobile Phones
      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          this.pinchStartDist = Math.hypot(dx, dy);
          this.pinchStartZoom = this.targetZoom;
        }
      }, { passive: true });
      this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length === 2 && this.pinchStartDist > 10) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const ratio = dist / this.pinchStartDist;
          this.setZoom(this.pinchStartZoom * ratio);
        }
      }, { passive: true });
      this.canvas.addEventListener('touchend', () => {
        this.pinchStartDist = null;
      }, { passive: true });
    }

    setZoom(z) {
      this.targetZoom = Math.max(0.26, Math.min(1.35, z));
    }

    handleResize() {
      this.width = window.innerWidth || 1280;
      this.height = window.innerHeight || 720;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
    }

    triggerCameraShake(intensity = 10, duration = 0.35) {
      this.shakeIntensity = intensity;
      this.shakeTimer = duration;
    }

    screenToWorld(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const wx = this.camX + (sx - this.width * 0.5) / this.zoom;
      const wz = this.camZ + (sy - this.height * 0.5) / this.zoom;
      return { x: wx, z: wz };
    }

    worldToScreen(wx, wz) {
      const sx = (wx - this.camX) * this.zoom + this.width * 0.5;
      const sy = (wz - this.camZ) * this.zoom + this.height * 0.5;
      return { x: sx, y: sy };
    }

    getPointAlongPath(pts, progress) {
      if (!pts || pts.length === 0) return { x: 0, z: 0, angle: 0 };
      if (pts.length === 1) return { x: pts[0].x, z: pts[0].z, angle: 0 };
      const clamped = Math.max(0, Math.min(1, progress));
      let totalLen = 0;
      const segLens = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const d = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].z - pts[i].z);
        segLens.push(d);
        totalLen += d;
      }
      if (totalLen <= 0.001) return { x: pts[0].x, z: pts[0].z, angle: 0 };
      let targetDist = clamped * totalLen;
      for (let i = 0; i < segLens.length; i++) {
        const sLen = segLens[i];
        if (targetDist <= sLen || i === segLens.length - 1) {
          const t = sLen > 0 ? (targetDist / sLen) : 0;
          const a = pts[i];
          const b = pts[i + 1];
          return {
            x: a.x + (b.x - a.x) * t,
            z: a.z + (b.z - a.z) * t,
            angle: Math.atan2(b.z - a.z, b.x - a.x)
          };
        }
        targetDist -= sLen;
      }
      const last = pts[pts.length - 1];
      return { x: last.x, z: last.z, angle: 0 };
    }

    render(state, dt) {
      this.time += dt;
      this.beltPhase = (this.beltPhase + dt * 52) % 24;
      this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * 10);

      const targetX = state.player.x;
      const targetZ = state.player.z;
      this.camX += (targetX - this.camX) * Math.min(1, dt * 8.5);
      this.camZ += (targetZ - this.camZ) * Math.min(1, dt * 8.5);

      let shakeX = 0;
      let shakeY = 0;
      if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
        shakeX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
        shakeY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      }

      const ctx = this.ctx;
      ctx.save();
      ctx.scale(this.dpr, this.dpr);

      this.lastPlayerPos = { x: state.player.x, z: state.player.z };
      const isWarMode = state.viewMode === 'war';

      ctx.fillStyle = isWarMode ? '#090d14' : '#03060c';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.translate(this.width * 0.5 + shakeX, this.height * 0.5 + shakeY);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-this.camX, -this.camZ);

      if (isWarMode) {
        // v0.0.12 CAPYBARA GO! ROGUELIKE PATH WAR SCENE (Sample Search Diff 1-10 & 10-Wave Planet Capture)
        this.drawCapybaraRoguelikeBattlefield(ctx, state);
        this.drawProjectilesAndArcs(ctx, state);

      } else {
        // TRUE SPLIT SHOP SCENE: Render ONLY the SES Super Destroyer Orbital Warship Deck!
        this.drawSuperDestroyerWarshipDeck(ctx, state);
        this.drawConveyorNetwork(ctx, state, 'shop');
        this.drawFloorPads(ctx, state, 'shop');
        this.drawRawQuarryAndAmmoPress(ctx, state);
        this.drawArsenalFactories(ctx, state);
        this.drawDedicatedCountersAndCash(ctx, state);
        this.drawBeltPackets(ctx, state, 'shop');
        this.drawSortedEntities(ctx, state, 'shop');
        this.drawProjectilesAndArcs(ctx, state);
      }
      ctx.restore();

      // Draw Live Tactical Mini-Map Radar on wider screens only
      if (this.width >= 900) {
        this.drawMiniMapRadar(ctx, state);
      }

      ctx.restore();
    }

    // ========================================================================
    // LIVE TACTICAL MINI-MAP RADAR (4600x4000 Base with 7 Lanes & 3 Gates)
    // ========================================================================
    drawMiniMapRadar(ctx, state) {
      if (this.width < 640) return;
      const mw = 164;
      const mh = 148;
      const mx = this.width - mw - 14;
      const my = this.height - mh - 76;
      const W = window.GameConfig.WORLD;
      const worldW = W.maxX - W.minX;
      const worldH = W.maxZ - W.minZ;

      const toMiniX = (wx) => mx + ((wx - W.minX) / worldW) * mw;
      const toMiniY = (wz) => my + ((wz - W.minZ) / worldH) * mh;

      ctx.save();
      ctx.fillStyle = 'rgba(9, 13, 20, 0.90)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(mx, my, mw, mh, 8);
      ctx.fill();
      ctx.stroke();

      // Sector A (Quarry)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.fillRect(toMiniX(-2080), toMiniY(-120), (1050 / worldW) * mw, (2050 / worldH) * mh);
      // Sector B (7 Factory Lanes)
      ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
      ctx.fillRect(toMiniX(-990), toMiniY(-120), (1040 / worldW) * mw, (2050 / worldH) * mh);
      // Sector C (7 Dedicated Item Counters & Queues)
      ctx.fillStyle = 'rgba(34, 197, 94, 0.18)';
      ctx.fillRect(toMiniX(120), toMiniY(-120), (2080 / worldW) * mw, (2050 / worldH) * mh);

      // In Shop mode, NO war gates on minimap!

      // 7 Dedicated Counters on minimap (green dots)
      for (const item of window.GameConfig.ITEMS) {
        if (!state.unlocked[item.id]) continue;
        ctx.fillStyle = item.color;
        ctx.fillRect(toMiniX(item.counterPos.x) - 2, toMiniY(item.counterPos.z) - 1.5, 4, 3);
      }

      // Enemies on minimap (ONLY in war mode!)
      if (state.viewMode === 'war') for (const e of state.enemies) {
        ctx.fillStyle = (e.type === 'titan' || e.type === 'strider') ? '#a855f7' : '#ef4444';
        ctx.beginPath();
        ctx.arc(toMiniX(e.x), toMiniY(e.z), (e.type === 'titan' || e.type === 'strider' || e.type === 'hulk') ? 3.5 : 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Player on minimap (pulsing gold dot)
      const px = toMiniX(state.player.x);
      const py = toMiniY(state.player.z);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(px, py, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 9.5px Orbitron, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('📡 RADAR (7 LANES)', mx + 6, my + 12);
      ctx.restore();
    }

    // ========================================================================
    // LIVE ANIMATED 2D CHARACTER SHOWCASE CARD RENDERER (16 UNITS — EP1 TO EP10+)
    // ========================================================================
    renderCharacterPreviewCard(canvas, charDef, phase) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = 150;
      const ch = 136;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const grad = ctx.createRadialGradient(cw / 2, ch / 2, 10, cw / 2, ch / 2, 80);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#090d14');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cw; gx += 25) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, ch);
        ctx.stroke();
      }
      for (let gy = 0; gy < ch; gy += 25) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(cw, gy);
        ctx.stroke();
      }

      const cx = cw * 0.5;
      const cy = ch * 0.62;

      if (charDef.renderType === 'bean') {
        const ro = charDef.renderOpts || {};
        this.drawCarbotBean(ctx, cx, cy, {
          bodyColor: ro.bodyColor,
          capeColor: ro.capeColor,
          trimColor: ro.trimColor,
          visorColor: ro.visorColor,
          isCommander: ro.isCommander,
          hasRifle: ro.hasRifle,
          weaponId: 'w_liberator',
          walkPhase: phase * 6,
          scale: 1.40,
          label: '',
          stack: ro.stack || []
        });

        if (ro.hasDrone) {
          this.drawGuardDogDrone(ctx, cx + Math.cos(phase * 3) * 38, cy - 28 + Math.sin(phase * 3) * 12, phase);
        }

        if (ro.orderBubble) {
          ctx.save();
          ctx.translate(cx, cy - 52);
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-36, -13, 72, 24, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 12px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ro.orderBubble, 0, -1);
          ctx.restore();
        }
      } else if (charDef.renderType === 'enemy') {
        const type = charDef.renderOpts?.type || 'trooper';
        let previewScale = 1.45;
        if (type === 'titan' || type === 'strider') previewScale = 1.18;
        else if (type === 'hulk' || type === 'devastator' || type === 'spewer') previewScale = 1.38;
        this.drawEnemy(ctx, {
          type,
          x: cx,
          z: cy + 6,
          hp: 100,
          maxHp: 100,
          previewScale,
          phase
        });
      } else if (charDef.renderType === 'mech') {
        this.drawPatriotMechSprite(ctx, cx, cy + 4, phase, 1.32, true);
      } else if (charDef.renderType === 'vehicle') {
        this.drawReconVehicleSprite(ctx, cx, cy + 6, phase, 1.32, true);
      } else if (charDef.renderType === 'turret') {
        this.drawSingleTurretMount(
          ctx,
          cx,
          cy + 4,
          '#facc15',
          36,
          50,
          Math.sin(phase * 2.2) * 0.7 - Math.PI / 2,
          (Math.floor(phase * 6) % 2 === 0) ? this.time : -10,
          'GATE 3/2/1 SENTRY'
        );
      }

      ctx.restore();
    }

    drawGuardDogDrone(ctx, x, z, phase = 0) {
      ctx.save();
      ctx.translate(x, z);
      const bob = Math.sin(phase * 6) * 3;
      ctx.translate(0, bob);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-12, -6, 7, 0, Math.PI * 2);
      ctx.arc(12, -6, 7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-11, -7, 22, 14, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawPatriotMechSprite(ctx, x, z, phase = 0, scale = 1, showPilot = false, stack = []) {
      ctx.save();
      ctx.translate(x, z);
      ctx.scale(scale, scale);
      const step = Math.sin(phase * 5) * 4.5;

      ctx.fillStyle = 'rgba(0,0,0,0.48)';
      ctx.beginPath();
      ctx.ellipse(0, 26, 28, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3.5;
      ctx.fillRect(-17, 6 + step * 0.5, 11, 18);
      ctx.strokeRect(-17, 6 + step * 0.5, 11, 18);
      ctx.fillRect(6, 6 - step * 0.5, 11, 18);
      ctx.strokeRect(6, 6 - step * 0.5, 11, 18);

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(-24, -28, 48, 38, 9);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-15, -15, 30, 8);
      ctx.strokeRect(-15, -15, 30, 8);

      if (showPilot) {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(-14, -28);
        ctx.lineTo(-24, -38);
        ctx.lineTo(-8, -28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(14, -28);
        ctx.lineTo(24, -38);
        ctx.lineTo(8, -28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-36, -24, 12, 26);
      ctx.strokeRect(-36, -24, 12, 26);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-30, -16, 2.8, 0, Math.PI * 2);
      ctx.arc(-30, -6, 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.fillRect(24, -18, 15, 20);
      ctx.strokeRect(24, -18, 15, 20);

      if (stack && stack.length > 0) {
        const maxDraw = Math.min(stack.length, 14);
        for (let i = 0; i < maxDraw; i++) {
          const entry = stack[i];
          const sy = -36 - i * 9;
          ctx.fillStyle = entry.color || '#facc15';
          ctx.strokeStyle = '#090d14';
          ctx.lineWidth = 2;
          ctx.fillRect(-12, sy - 5, 24, 8);
          ctx.strokeRect(-12, sy - 5, 24, 8);
        }
      }

      ctx.restore();
    }

    drawReconVehicleSprite(ctx, x, z, phase = 0, scale = 1, showPilot = false, stack = []) {
      ctx.save();
      ctx.translate(x, z);
      ctx.scale(scale, scale);
      const bounce = Math.abs(Math.sin(phase * 8)) * 2;

      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 20, 32, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, -bounce);

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-18, 13, 9, 0, Math.PI * 2);
      ctx.arc(18, 13, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.roundRect(-28, -12, 56, 24, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.fillRect(-14, -23, 28, 12);
      ctx.strokeRect(-14, -23, 28, 12);

      ctx.fillStyle = '#334155';
      ctx.fillRect(4, -30, 24, 6);
      ctx.strokeRect(4, -30, 24, 6);

      if (stack && stack.length > 0) {
        const maxDraw = Math.min(stack.length, 12);
        for (let i = 0; i < maxDraw; i++) {
          const entry = stack[i];
          const sy = -34 - i * 8;
          ctx.fillStyle = entry.color || '#facc15';
          ctx.strokeStyle = '#090d14';
          ctx.lineWidth = 2;
          ctx.fillRect(-24, sy, 20, 7);
          ctx.strokeRect(-24, sy, 20, 7);
        }
      }

      ctx.restore();
    }

    // ========================================================================
    // 1A. SES SUPER DESTROYER ORBITAL WARSHIP DECK (SHOP MODE — NO WAR ZONE!)
    //     Authentic Helldivers 2 Orbital Warship Bridge, Hull, Starfield & Planet
    // ========================================================================
    drawSuperDestroyerWarshipDeck(ctx, state) {
      const activeBaseCfg = state.getActiveBaseConfig ? state.getActiveBaseConfig() : { color: '#38bdf8', code: 'SECTOR ALPHA-01', floorTint: '#111927' };
      const planetColor = activeBaseCfg.color || '#38bdf8';

      // 1. Deep Space Starfield Backdrop around the Super Destroyer
      ctx.fillStyle = '#03060d';
      ctx.fillRect(-3800, -1600, 8000, 4600);

      for (let i = 0; i < this.spaceStars.length; i++) {
        const st = this.spaceStars[i];
        const twinkle = 0.45 + 0.55 * Math.sin(this.time * st.speed + i);
        ctx.fillStyle = st.color;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(st.x, st.z, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 2. Glowing Planetary Horizon Limb in Low Orbit ahead of the Warship Bow (z < -200)
      ctx.save();
      const limbGrad = ctx.createRadialGradient(0, -2500, 1400, 0, -2500, 2380);
      limbGrad.addColorStop(0, '#071324');
      limbGrad.addColorStop(0.76, '#0c223d');
      limbGrad.addColorStop(0.93, planetColor);
      limbGrad.addColorStop(0.97, 'rgba(56, 189, 248, 0.25)');
      limbGrad.addColorStop(1, 'rgba(3, 6, 13, 0)');
      ctx.fillStyle = limbGrad;
      ctx.beginPath();
      ctx.arc(0, -2500, 2380, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Flanking Allied SES Super Destroyers cruising in Low Orbit (Port & Starboard)
      this.drawAlliedOrbitingDestroyer(ctx, -2560, 420 + Math.sin(this.time * 0.6) * 25, 0.85, 'SES WINGS OF LIBERTY');
      this.drawAlliedOrbitingDestroyer(ctx, 2960, 680 + Math.cos(this.time * 0.5) * 25, 0.85, 'SES FIST OF DEMOCRACY');

      // 4. Main SES Super Destroyer Outer Armored Hull Silhouette & Stern Engine Thrusters
      ctx.save();
      // Ion Engine Plumes at the Stern (z = 1970)
      for (const ex of [-1150, -450, 450, 1150]) {
        const thrustLen = 190 + Math.sin(this.time * 16 + ex) * 28;
        const tGrad = ctx.createLinearGradient(ex, 1960, ex, 1960 + thrustLen);
        tGrad.addColorStop(0, '#38bdf8');
        tGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.55)');
        tGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.moveTo(ex - 95, 1960);
        ctx.lineTo(ex + 95, 1960);
        ctx.lineTo(ex + 45, 1960 + thrustLen);
        ctx.lineTo(ex - 45, 1960 + thrustLen);
        ctx.closePath();
        ctx.fill();

        // Thruster nozzle housing
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.fillRect(ex - 105, 1935, 210, 32);
        ctx.strokeRect(ex - 105, 1935, 210, 32);
      }

      // Outer Armored Warship Hull Polygon (Expanded Bow for Dedicated Sector D Clone & Squad Bay!)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-1680, -520);
      ctx.lineTo(1380, -520);
      ctx.lineTo(2620, -120);
      ctx.lineTo(2620, 1950);
      ctx.lineTo(-2190, 1950);
      ctx.lineTo(-2190, -360);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner Hangar Deck Floor (Metallic Gunmetal Plating)
      ctx.fillStyle = '#0e1524';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-1620, -460);
      ctx.lineTo(1320, -460);
      ctx.lineTo(2550, -80);
      ctx.lineTo(2550, 1900);
      ctx.lineTo(-2110, 1900);
      ctx.lineTo(-2110, -320);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 5. Forward Panoramic Bridge Viewport Windows (Looking out into Orbit at z = -515..-455)
      ctx.save();
      for (let wi = -4; wi <= 4; wi++) {
        const wx = wi * 240 - 120;
        const glassGrad = ctx.createLinearGradient(wx, -515, wx, -455);
        glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        glassGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
        ctx.fillStyle = glassGrad;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.fillRect(wx - 108, -512, 216, 52);
        ctx.strokeRect(wx - 108, -512, 216, 52);
      }
      ctx.fillStyle = '#fde047';
      ctx.font = '900 14px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🚀 SES SUPER DESTROYER BRIDGE — ORBITING ${activeBaseCfg.code}`, -120, -480);
      ctx.restore();

      // 6. Subtle Gunmetal Deck Plating Seams & Super Earth Emblem Watermark
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = -2080; x <= 2160; x += 160) {
        ctx.moveTo(x, -40);
        ctx.lineTo(x, 1890);
      }
      for (let z = -40; z <= 1890; z += 135) {
        ctx.moveTo(-2080, z);
        ctx.lineTo(2160, z);
      }
      ctx.stroke();

      // Watermarked Super Earth Skull & Wings Emblem in Hangar Center
      ctx.translate(-460, 930);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.035)';
      ctx.beginPath();
      ctx.arc(0, 0, 280, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.07)';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      // 7. Three Clean Hangar Bay Deck Zones (Port Extraction Bay, Center Arsenal Bay, Starboard Requisition Bay)
      this.drawFloorSector(
        ctx,
        -2080,
        -25,
        1040,
        1890,
        'rgba(17, 34, 54, 0.55)',
        '#38bdf8',
        '🛸 LEFT-HAND ORBITAL PORT & 4 CARGO PICKUP SILOS (🛢️ OIL · ⛏️ IRON · 🏜️ BUG SAND · 🔩 BOT TITANIUM)'
      );

      this.drawFloorSector(
        ctx,
        -990,
        -25,
        1040,
        1890,
        'rgba(27, 36, 52, 0.55)',
        '#facc15',
        '⚙️ CENTER HANGAR: 7 ARSENAL LANES'
      );

      this.drawFloorSector(
        ctx,
        100,
        -25,
        2410,
        1890,
        'rgba(20, 41, 36, 0.55)',
        '#22c55e',
        '💵 STARBOARD DECK: 3-COUNTER EXPANSION HALL (Lv.1=1 Desk · Lv.4=2 Desks · Lv.8=3 Desks)'
      );

      // 8. Bridge Galactic War Hologram Table, Clone Vat Room, Mindustry Core & 4 Hellpod Drop Tubes
      this.drawSeafCloneVatRoom(ctx, state);
      this.drawBridgeHellpodLaunchBay(ctx, state);
    }

    drawAlliedOrbitingDestroyer(ctx, x, z, scale, shipName) {
      ctx.save();
      ctx.translate(x, z);
      ctx.scale(scale, scale);

      // Thruster glow
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 210, 42, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wedge Destroyer Silhouette
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -220);
      ctx.lineTo(110, 180);
      ctx.lineTo(40, 200);
      ctx.lineTo(-40, 200);
      ctx.lineTo(-110, 180);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gold Super Earth hull stripe
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -170);
      ctx.lineTo(0, 160);
      ctx.stroke();

      ctx.fillStyle = 'rgba(250, 204, 21, 0.65)';
      ctx.font = '900 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(shipName, 0, 245);
      ctx.restore();
    }

    drawSeafCloneVatRoom(ctx, state) {
      const cLvl = state.cloneRoomLevel || 1;
      const maxW = state.getMaxWorkerCap ? state.getMaxWorkerCap() : (3 + cLvl * 3);
      const curW = (state.workers || []).length;
      const hireCost = state.getCloneHireCost ? state.getCloneHireCost() : 70;
      const upgCost = state.getCloneRoomUpgradeCost ? state.getCloneRoomUpgradeCost() : 140;

      // DEDICATED SHOP SECTOR D FLOOR ZONE (x: -2080..-420, z: -435..-42)
      this.drawFloorSector(
        ctx,
        -2080,
        -435,
        1660,
        390,
        'rgba(12, 36, 38, 0.72)',
        '#22c55e',
        '🧬 SECTOR D: SEAF CLONE VAT CHAMBER & 🏋️ HELLDIVER TRAINING ROOM (Lv.1–100)'
      );

      // LEFT WING (x: -2040..-1270, z: -395..-62): 6 BUBBLING BIO-CLONE VATS & 6-JOB ASSIGNMENT TERMINAL
      ctx.save();
      ctx.translate(-1655, -230);

      ctx.fillStyle = '#07171c';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-375, -155, 750, 310, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#4ade80';
      ctx.font = '900 13px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🧬 SEAF BIO-CLONE VAT CHAMBER (Lv.${cLvl}/10) — WORKERS: ${curW}/${maxW} MAX`, 0, -130);

      // 6 Bubbling Bio-Clone Vats in 2x3 Grid
      for (let i = 0; i < 6; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const vx = -220 + col * 145;
        const vz = -68 + row * 92;
        const pulse = 0.55 + 0.45 * Math.sin(this.time * 5 + i * 1.1);

        ctx.fillStyle = '#090d14';
        ctx.beginPath();
        ctx.arc(vx, vz, 34, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(34, 197, 94, ${0.28 * pulse})`;
        ctx.strokeStyle = i < curW ? '#4ade80' : '#15803d';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(vx, vz, 29, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i < curW ? '🪖' : '🧬', vx, vz - 2);

        ctx.fillStyle = '#86efac';
        ctx.font = '900 9px Orbitron, sans-serif';
        ctx.fillText(`VAT #${i + 1}`, vx, vz + 22);
      }

      // Right side of Clone Chamber: 6-Job Live Roster Board
      const jobs = window.GameConfig.CLONE_JOBS || [];
      const wJobs = state.workerJobs || {};
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(145, -104, 210, 178);
      ctx.strokeRect(145, -104, 210, 178);
      ctx.fillStyle = '#fde047';
      ctx.font = '900 10px Orbitron, sans-serif';
      ctx.fillText('📋 6-SECTOR WORK ROSTER', 250, -86);
      for (let j = 0; j < jobs.length; j++) {
        const jb = jobs[j];
        const cnt = wJobs[jb.id] || 0;
        const jy = -64 + j * 24;
        ctx.fillStyle = jb.color;
        ctx.font = '700 10.5px Rajdhani, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${jb.icon} ${jb.shortName}:`, 156, jy);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10.5px Orbitron, sans-serif';
        ctx.fillText(`${cnt} SEAF`, 342, jy);
      }

      // Interactive Action Banner at bottom of Clone Chamber
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(-345, 98, 690, 38, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `👆 TAP OR STEP HERE: ➕ CLONE SEAF ($${hireCost}) · ⬆️ UPGRADE ROOM Lv.${cLvl + 1} ($${upgCost}) · ⚖️ ASSIGN 6 JOBS`,
        0,
        121
      );
      ctx.restore();

      // RIGHT WING OF SECTOR D (x: -1240..-440, z: -395..-62):
      // WAR SQUAD FORMATION MUSTER BAY (Shows Alpha, Bravo & Charlie 2x4 Squad Grids in Shop!)
      this.drawShopSquadMusterBay(ctx, state);
    }

    drawShopSquadMusterBay(ctx, state) {
      const roster = state.helldiverRoster || [];
      const lineup = state.capybaraLineup || [null, null, null, null];
      const classesCfg = window.GameConfig.HELLDIVER_CLASSES || [];

      ctx.save();
      ctx.translate(-840, -230);

      // Training Room Outer Hull
      ctx.fillStyle = '#0c1629';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-385, -155, 770, 310, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 12.5px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `🏋️ HELLDIVER TRAINING & RECRUITMENT ROOM (${roster.length} HEROES · MAX Lv.100 & SKILLS)`,
        0,
        -130
      );

      const slotLabels = [
        '🛡️ ACTIVE #1 (FRONT LEFT)',
        '⚔️ ACTIVE #2 (FRONT RIGHT)',
        '🎯 ACTIVE #3 (BACK LEFT)',
        '💉 ACTIVE #4 (BACK RIGHT)'
      ];
      const slotColors = ['#facc15', '#38bdf8', '#22c55e', '#f97316'];

      for (let sIdx = 0; sIdx < 4; sIdx++) {
        const heroId = lineup[sIdx];
        const hero = roster.find((h) => h.id === heroId) || null;
        const cls = hero ? (classesCfg.find((c) => c.id === hero.classId) || classesCfg[0]) : null;
        const padX = -276 + sIdx * 184;
        const padZ = -18;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = slotColors[sIdx];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(padX - 84, padZ - 86, 168, 172, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = slotColors[sIdx];
        ctx.font = '900 9px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(slotLabels[sIdx], padX, padZ - 68);

        if (hero && cls) {
          // Animated training holo-ring
          const pulse = 0.6 + 0.4 * Math.sin(this.time * 5 + sIdx);
          ctx.fillStyle = `rgba(56, 189, 248, ${0.18 * pulse})`;
          ctx.strokeStyle = cls.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(padX, padZ - 14, 28, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw Mini Carbot Helldiver Bean practicing in gym
          this.drawCarbotBean(ctx, padX, padZ - 10, {
            bodyColor: cls.bodyColor || '#1e293b',
            capeColor: cls.capeColor || '#eab308',
            trimColor: cls.trimColor || '#facc15',
            visorColor: '#38bdf8',
            isCommander: hero.level >= 25,
            hasRifle: true,
            bobPhase: this.time * 6 + sIdx
          });

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 10px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${cls.icon} ${hero.name}`, padX, padZ + 32);

          ctx.fillStyle = '#4ade80';
          ctx.font = '900 9.5px Orbitron, sans-serif';
          ctx.fillText(`Lv.${hero.level}/100 · ❤️${Math.round(hero.maxHp)} ⚔️${Math.round(hero.atk)}`, padX, padZ + 48);

          // 4-Slot Equipment + Unlocked Skills Badges
          const eqIcons = [
            hero.equip?.weapon ? '🔫' : '▫️',
            hero.equip?.armor ? '🦺' : '▫️',
            hero.equip?.pack ? '🎒' : '▫️',
            hero.equip?.mech ? '🤖' : '▫️'
          ].join('');
          const skCount = hero.level >= 60 ? 3 : (hero.level >= 25 ? 2 : 1);
          ctx.fillStyle = '#fde047';
          ctx.font = '700 9.5px Rajdhani, sans-serif';
          ctx.fillText(`Gear: ${eqIcons} · ⚡${skCount}/3 Skills`, padX, padZ + 66);
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.font = '900 11px Orbitron, sans-serif';
          ctx.fillText('⚠️ EMPTY SLOT', padX, padZ - 10);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '700 10px Rajdhani, sans-serif';
          ctx.fillText('Tap to Hire & Assign Hero!', padX, padZ + 12);
        }
      }

      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(-355, 98, 710, 38, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10.8px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `👆 TAP TRAINING ROOM: ➕ HIRE HELLDIVERS · ⬆️ TRAIN Lv.1–100 · 🛡️ EQUIP 4-SLOT GEAR & 3+1 SQUAD!`,
        0,
        121
      );
      ctx.restore();
    }

    drawBridgeHellpodLaunchBay(ctx, state) {
      const queuedPodCount = (state.customers || []).filter((c) => c.state === 'to_hellpod').length;
      const clientPoolCount = (state.gearedClientsPool || []).length;

      ctx.save();
      ctx.translate(920, -210);

      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-240, -54, 480, 104, 14);
      ctx.fill();
      ctx.stroke();

      // 4 Circular Hellpod Launch Tubes (Pure Departure Exit — No Auto-War or Fee!)
      for (let i = 0; i < 4; i++) {
        const hx = -150 + i * 100;
        const pulse = 0.65 + 0.35 * Math.sin(this.time * 6 + i);
        ctx.fillStyle = '#090d14';
        ctx.strokeStyle = i < queuedPodCount ? '#38bdf8' : `rgba(250, 204, 21, ${pulse})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(hx, 4, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚀', hx, 5);
      }

      ctx.fillStyle = '#fde047';
      ctx.font = '900 11.5px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🚀 HELLPOD DEPARTURE TUBES — SERVED CLIENTS EXIT HERE (${state.totalHellpodDrops || 0} SENT)`, 0, -34);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-175, 32, 350, 22, 6);
      ctx.fill();
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '900 10px Orbitron, sans-serif';
      ctx.fillText(
        `🫡 GEARED CLIENTS STANDBY IN ORBIT: ${clientPoolCount} (CAN VOLUNTEER OR BE HIRED IN WAR!)`,
        0,
        44
      );
      ctx.restore();
    }

    // ========================================================================
    // 1B. NIGHTFALL: KINGDOM FRONTIER TD × CASTLE & STRONGHOLD (據點) BATTLEFIELD
    //     Replaces the old 3-gate vertical corridor with the exact layout of
    //     Nightfall: Kingdom Frontier TD (image_97ae56.jpg):
    //     - Western Super Earth Frontier Castle Compound (Keep + Curved Walls + 2 Gates)
    //     - 6 Upgradable Frontier Watchtowers (fed by Shop 🧱 Turret Ammo!)
    //     - 3 Castle Barracks with 2x4 Helldiver Troop Formation Grids
    //     - Winding Frontier River Moat + Southern Stone Arch Bridge + Central Ford
    //     - 3 Destructible Eastern Enemy Strongholds (據點) for Sally-Out Counter-Attack!
    // ========================================================================
    // ========================================================================
    // NEW IN v0.0.12: CAPYBARA GO! ROGUELIKE PATH BATTLEFIELD
    // - Powers both Attack War Pages:
    //   1) 🧬 Sample Search (Diff 1-10: 1-3 Common 🟢, 4-6 Rare 🟠, 7-10 Super Rare 🟣)
    //   2) 🚩 Planet Capture (Select adjacent planet on Space Map, 10 Waves, Retreat after
    //      each wave, True Permadeath if a Helldiver dies, 4 Active Squad Members · No Spare Team!)
    // ========================================================================
    drawCapybaraRoguelikeBattlefield(ctx, state) {
      const W = window.GameConfig.WORLD;
      const run = state.capybaraRun || {};
      const isCapture = (state.warSubPage || 'sample') === 'capture';
      const faction = run.faction || 'bugs';
      const isBugs = faction === 'bugs';
      const diff = run.difficulty || state.sampleSearchDiff || 1;
      const wave = run.wave || 1;
      const maxWaves = run.maxWaves || (isCapture ? 10 : 5);

      // 1. Single-Faction Planet Backdrop (Strictly Terminid Bugs OR Automaton Bots!)
      const bgGrad = ctx.createLinearGradient(W.minX, -1850, W.maxX, -100);
      if (isBugs) {
        bgGrad.addColorStop(0, '#0a1f17');
        bgGrad.addColorStop(0.5, '#132e22');
        bgGrad.addColorStop(1, '#271a0c');
      } else {
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#1e1b2e');
        bgGrad.addColorStop(1, '#2d0f16');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(W.minX - 400, W.minZ - 400, (W.maxX - W.minX) + 800, (W.wallZ - W.minZ) + 800);

      // 2. Top Capybara Go! 10-Wave / 5-Wave Expedition Node Trail Banner (x: -1150..+1150, z: -1560)
      ctx.save();
      ctx.translate(0, -1520);
      ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
      ctx.strokeStyle = isCapture ? '#f97316' : '#4ade80';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-1060, -135, 2120, 220, 20);
      ctx.fill();
      ctx.stroke();

      const headerTitle = isCapture
        ? `🚩 PLANET CAPTURE EXPEDITION: ${(run.planetName || 'Target Planet').toUpperCase()} (DIFF ${diff}/10 · ${isBugs ? '🐛 TERMINID BUGS ONLY' : '🤖 AUTOMATON BOTS ONLY'})`
        : `🧬 SAMPLE SEARCH EXPEDITION — DIFFICULTY ${diff}/10 (${diff <= 3 ? '🟢 NORMAL SAMPLES ONLY' : (diff <= 6 ? '🟢 NORMAL + 🟠 RARE SAMPLES' : '🟢 + 🟠 RARE + 🟣 SUPER RARE SAMPLES!')})`;

      ctx.fillStyle = '#fde047';
      ctx.font = '900 19px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(headerTitle, 0, -92);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 14px Rajdhani, sans-serif';
      ctx.fillText(
        `🐹 CAPYBARA GO! ROGUELIKE PATH · WAVE ${wave}/${maxWaves} · 4 ACTIVE HELLDIVERS · NO SPARE TEAM · ⚠️ TRUE PERMADEATH ON DEATH (RETREAT AFTER ANY WAVE!)`,
        0,
        -64
      );

      // Draw Wave Nodes along the Trail (1..maxWaves)
      const trailLeft = -880;
      const trailRight = 880;
      const stepX = maxWaves > 1 ? (trailRight - trailLeft) / (maxWaves - 1) : 0;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(trailLeft, 12);
      ctx.lineTo(trailRight, 12);
      ctx.stroke();

      const clearedW = Math.max(0, (wave - 1) / Math.max(1, maxWaves - 1)) * (trailRight - trailLeft);
      ctx.strokeStyle = isCapture ? '#f97316' : '#22c55e';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(trailLeft, 12);
      ctx.lineTo(trailLeft + clearedW, 12);
      ctx.stroke();

      for (let wIdx = 1; wIdx <= maxWaves; wIdx++) {
        const nx = trailLeft + (wIdx - 1) * stepX;
        const ny = 12;
        const isPast = wIdx < wave;
        const isCur = wIdx === wave;
        const isBoss = wIdx === maxWaves || wIdx % 5 === 0;

        ctx.fillStyle = isPast ? '#16a34a' : (isCur ? '#facc15' : '#1e293b');
        ctx.strokeStyle = isCur ? '#ffffff' : (isBoss ? '#ef4444' : '#64748b');
        ctx.lineWidth = isCur ? 4 : 2.5;
        ctx.beginPath();
        ctx.arc(nx, ny, isCur ? 28 : 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCur ? '#090d14' : '#ffffff';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isPast ? '✓' : (isBoss ? '💀' : `W${wIdx}`), nx, ny);

        ctx.fillStyle = isCur ? '#fde047' : '#94a3b8';
        ctx.font = '900 10px Orbitron, sans-serif';
        ctx.fillText(wIdx === maxWaves ? (isCapture ? '🚩 CAPTURE' : '🎁 EXTRACT') : `WAVE ${wIdx}`, nx, ny + 42);
      }
      ctx.restore();

      // 3. Main Capybara Go! Combat Road (x: -1150..+1150, z: -1220..-560)
      ctx.save();
      ctx.fillStyle = isBugs ? 'rgba(42, 32, 18, 0.85)' : 'rgba(24, 30, 44, 0.88)';
      ctx.strokeStyle = isBugs ? '#84cc16' : '#ef4444';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(-1120, -1240, 2240, 680, 36);
      ctx.fill();
      ctx.stroke();

      // Scrolling dashed center lane lines (moves as squad marches!)
      const marchScroll = run.phase === 'marching' ? -this.time * 180 : -this.time * 25;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.22)';
      ctx.lineWidth = 4;
      ctx.setLineDash([36, 36]);
      ctx.lineDashOffset = marchScroll;
      ctx.beginPath();
      ctx.moveTo(-1060, -900);
      ctx.lineTo(1060, -900);
      ctx.stroke();
      ctx.setLineDash([]);

      // Biome props along top/bottom of road
      for (let i = 0; i < 8; i++) {
        const px = -920 + i * 260;
        const pzTop = -1190;
        const pzBot = -610;
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isBugs ? (i % 2 === 0 ? '🍄' : '🛢️') : (i % 2 === 0 ? '⚙️' : '🚩'), px, pzTop);
        ctx.fillText(isBugs ? (i % 2 === 0 ? '🪲' : '🟢') : (i % 2 === 0 ? '🔩' : '📡'), px, pzBot);
      }
      ctx.restore();

      // 4. Orbital Spare Helldiver Reserve Pod Box (Top-Left of Road: Slot #4)
      const spareHero = run.spareHero;
      ctx.save();
      ctx.translate(-860, -1145);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = spareHero && !spareHero.dead ? '#f97316' : '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-190, -52, 380, 104, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fdba74';
      ctx.font = '900 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚀 ORBITAL SPARE REINFORCEMENT (SLOT #4)', 0, -30);

      if (spareHero && !spareHero.dead) {
        ctx.fillStyle = '#4ade80';
        ctx.font = '900 13px Orbitron, sans-serif';
        ctx.fillText(`${spareHero.icon || '🪖'} ${spareHero.name} (Lv.${spareHero.level}/100) — STANDBY`, 0, -4);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '700 11.5px Rajdhani, sans-serif';
        ctx.fillText(`Auto-drops via Hellpod if any of the 3 Active Heroes dies!`, 0, 20);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.fillText(run.spareUsed ? '⚡ SPARE ALREADY DEPLOYED INTO BATTLE!' : '⚠️ NO SPARE HERO ASSIGNED IN SLOT #4', 0, 2);
      }
      ctx.restore();

      // 5. Loot & Sample Bag Collected So Far in This Run (Top-Right of Road)
      const bag = run.lootBag || { cash: 0, common: 0, rare: 0, superRare: 0 };
      ctx.save();
      ctx.translate(760, -1145);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-250, -52, 500, 104, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 11.5px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎒 CURRENT EXPEDITION LOOT & SAMPLES (RETREAT SAVES 65%!)', 0, -28);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 14px Orbitron, sans-serif';
      ctx.fillText(
        `💵 $${bag.cash || 0}  ·  🟢 Common: ${bag.common || 0}  ·  🟠 Rare: ${bag.rare || 0}  ·  🟣 Super: ${bag.superRare || 0}`,
        0,
        2
      );
      ctx.fillStyle = '#86efac';
      ctx.font = '700 11.5px Rajdhani, sans-serif';
      ctx.fillText(`Clear all ${maxWaves} Waves for 100% Full Bonus${isCapture ? ' + 🚩 Capture Planet!' : '!'}`, 0, 26);
      ctx.restore();

      // 6. Draw the 3 Active Helldiver Heroes on the Left Side of the Capybara Go! Path
      const activeHeroes = run.activeHeroes || [];
      for (let i = 0; i < activeHeroes.length; i++) {
        const h = activeHeroes[i];
        if (!h || h.dead) continue;
        const hx = h.x || (-520 + (i === 0 ? 90 : 0));
        const hz = h.z || (-900 + (i === 1 ? -135 : (i === 2 ? 135 : 0)));

        ctx.save();
        ctx.translate(hx, hz);

        // Shield Aura if active
        if ((h.shield || 0) > 0) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, -12, 42, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Draw Mech if Mech Pilot class or equipped Mech
        if (h.classId === 'cls_mechpilot' || h.equip?.mech) {
          this.drawPatriotMechSprite(ctx, 0, 0, this.time * 6 + i, 0.95, true);
        } else {
          this.drawCarbotBean(ctx, 0, 0, {
            bodyColor: h.bodyColor || '#1e293b',
            capeColor: h.capeColor || '#eab308',
            trimColor: h.trimColor || '#facc15',
            visorColor: '#38bdf8',
            isCommander: true,
            hasRifle: true,
            bobPhase: this.time * 7 + i
          });
        }

        // HP Bar & Level Badge above Hero
        const hpRatio = Math.max(0, Math.min(1, h.hp / Math.max(1, h.maxHp)));
        ctx.fillStyle = '#090d14';
        ctx.fillRect(-54, -68, 108, 13);
        ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.25 ? '#facc15' : '#ef4444');
        ctx.fillRect(-52, -66, 104 * hpRatio, 9);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-54, -68, 108, 13);

        ctx.fillStyle = '#fde047';
        ctx.font = '900 10.5px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${h.icon || '🦅'} ${h.name} (Lv.${h.level}/100)`, 0, -76);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 9.5px Orbitron, sans-serif';
        ctx.fillText(`❤️ ${Math.ceil(h.hp)}/${Math.round(h.maxHp)} · ⚔️ ${Math.round(h.atk)}`, 0, 38);
        ctx.restore();
      }

      // 7. Draw Deployed Engineer Turret Sentries on the Path
      for (const s of (run.sentries || [])) {
        this.drawSingleTurretMount(ctx, s.x, s.z, '#a855f7', 99, 99, 0, this.time, '🗼 SENTRY');
      }

      // 8. Draw Advancing Enemy Wave (Strictly Single Faction: Bugs OR Bots!)
      for (const en of (state.enemies || [])) {
        this.drawEnemy(ctx, en);
      }
    }

    drawFloorSector(ctx, x, z, w, h, bg, accent, title) {
      ctx.save();
      ctx.fillStyle = bg;
      ctx.fillRect(x, z, w, h);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, z, w, h);
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = accent;
      ctx.font = '900 13px Orbitron, sans-serif';
      ctx.fillText(title, x + 18, z + 26);
      ctx.restore();
    }

    // ========================================================================
    // 2. SPLIT CONVEYOR BELT NETWORK (NO FAKE ITEMS WHEN EMPTY!)
    //    - Belt 1: conv_raw_e710 (Purple #a855f7) -> ONLY E-710 Stations
    //    - Belt 2: conv_raw_iron (Cyan #38bdf8)   -> ONLY Iron Stations & Ammo Press
    //    - Belt 3: conv_counter_auto (Green)      -> 7 Horizontal Lane Belts (Pickup -> Counter #1..7)
    //    - Belts 4–6: conv_gate_1/2/3             -> Ammo Press -> Gate Layers 1/2/3
    // ========================================================================
    drawConveyorNetwork(ctx, state, mode = 'shop') {
      if (mode === 'war') return;

      // 1. PURPLE BIO-FUEL & BUG UNIQUE BELT (conv_raw_e710): Connects Port Oil (z=160), Sand (z=600) & Bile (z=820)
      const e710BeltLvl = state.conveyorLevels?.conv_raw_e710 || 0;
      const e710Items = window.GameConfig.ITEMS.filter((it) => it.recipe.raw_e710 && (state.unlocked[it.id] || it.id === 'cloth'));
      const maxE710Z = e710Items.length > 0 ? Math.max(820, ...e710Items.map((it) => it.inputPos.z)) : 820;
      this.drawBeltPath(ctx, [
        { x: -1200, z: 160 },
        { x: -960, z: 160 },
        { x: -960, z: 120 },
        { x: -960, z: maxE710Z }
      ], e710BeltLvl, '#a855f7');
      this.drawBeltPath(ctx, [{ x: -1200, z: 600 }, { x: -960, z: 600 }], e710BeltLvl, '#eab308');
      this.drawBeltPath(ctx, [{ x: -1200, z: 820 }, { x: -960, z: 820 }], e710BeltLvl, '#84cc16');

      for (const item of e710Items) {
        this.drawBeltPath(ctx, [
          { x: -960, z: item.inputPos.z - 12 },
          { x: item.inputPos.x, z: item.inputPos.z - 12 }
        ], e710BeltLvl, '#a855f7');
      }

      // 2. CYAN SUPER IRON & BOT UNIQUE BELT (conv_raw_iron): Connects Port Iron (z=380), Titanium (z=1040) & Q-Core (z=1260)
      const ironBeltLvl = state.conveyorLevels?.conv_raw_iron || 0;
      const ironItems = window.GameConfig.ITEMS.filter((it) => it.recipe.raw_iron && (state.unlocked[it.id] || it.id === 'gun'));
      const maxIronZ = ironItems.length > 0 ? Math.max(1260, ...ironItems.map((it) => it.inputPos.z)) : 1260;
      this.drawBeltPath(ctx, [
        { x: -1200, z: 380 },
        { x: -910, z: 380 },
        { x: -910, z: maxIronZ }
      ], ironBeltLvl, '#38bdf8');
      this.drawBeltPath(ctx, [{ x: -1200, z: 1040 }, { x: -910, z: 1040 }], ironBeltLvl, '#ec4899');
      this.drawBeltPath(ctx, [{ x: -1200, z: 1260 }, { x: -910, z: 1260 }], ironBeltLvl, '#06b6d4');

      for (const item of ironItems) {
        this.drawBeltPath(ctx, [
          { x: -910, z: item.inputPos.z + 12 },
          { x: item.inputPos.x, z: item.inputPos.z + 12 }
        ], ironBeltLvl, '#38bdf8');
      }

      // 3. 7 DEDICATED HORIZONTAL OUTPUT-TO-COUNTER BELTS (conv_counter_auto -> 1 to 3 Physical Counters!)
      const counterBeltLvl = state.conveyorLevels?.conv_counter_auto || 0;
      for (const item of window.GameConfig.ITEMS) {
        if (!state.unlocked[item.id]) continue;
        const cCount = state.getUnlockedCounterCount ? state.getUnlockedCounterCount(item.id) : 1;
        const endX = cCount >= 3 ? item.counter3Pos.x : (cCount >= 2 ? item.counter2Pos.x : item.counterPos.x);
        this.drawBeltPath(ctx, [
          { x: item.pickupPos.x, z: item.pickupPos.z },
          { x: endX, z: item.counterPos.z }
        ], counterBeltLvl, item.color);
      }
    }

    // Draws ONLY the physical conveyor belt track & animated directional rollers (NO FAKE ITEMS!)
    drawBeltPath(ctx, pts, level, color) {
      if (pts.length < 2) return;
      ctx.save();

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].z);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].z);
      }

      if (!level || level <= 0) {
        // Lv.0 Locked Blueprint Path (NOT automated yet!)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.11)';
        ctx.lineWidth = 16;
        ctx.stroke();
        ctx.strokeStyle = color || 'rgba(250, 204, 21, 0.22)';
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.restore();
        return;
      }

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 24;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 18;
      ctx.stroke();

      const speedMult = 1 + (level - 1) * 0.14;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const len = Math.hypot(dx, dz);
        if (len < 1) continue;
        const ang = Math.atan2(dz, dx);

        ctx.save();
        ctx.translate(a.x, a.z);
        ctx.rotate(ang);

        ctx.strokeStyle = color || '#facc15';
        ctx.globalAlpha = 0.72;
        ctx.lineWidth = 2.4;
        const step = 26;
        const phase = (this.beltPhase * speedMult) % step;
        for (let d = phase; d < len - 6; d += step) {
          ctx.beginPath();
          ctx.moveTo(d - 5, -5);
          ctx.lineTo(d + 3, 0);
          ctx.lineTo(d - 5, 5);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
    }

    // Draws ONLY REAL IN-TRANSIT ITEMS (`state.beltPackets`) moving along unlocked belts!
    drawBeltPackets(ctx, state, mode = 'shop') {
      if (!state.beltPackets || state.beltPackets.length === 0) return;
      for (const pkt of state.beltPackets) {
        const isGateBelt = pkt.beltId && pkt.beltId.startsWith('conv_gate_');
        if (mode === 'shop' && isGateBelt) continue;
        if (mode === 'war' && !isGateBelt) continue;
        const pt = this.getPointAlongPath(pkt.path, pkt.progress);
        ctx.save();
        ctx.translate(pt.x, pt.z);

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pkt.color || '#facc15';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pkt.icon || '📦', 0, 1);

        if (pkt.qty && pkt.qty > 1) {
          ctx.fillStyle = '#fde047';
          ctx.font = '900 9px Orbitron, sans-serif';
          ctx.fillText(`x${pkt.qty}`, 11, -9);
        }
        ctx.restore();
      }
    }

    // ========================================================================
    // 3. INTERACTIVE TRIGGER PADS (SAFE OFFSETS — NEVER CRUSH PLAYER!)
    // ========================================================================
    drawFloorPads(ctx, state, mode = 'shop') {
      const L = window.GameConfig.LOCATIONS;
      if (mode === 'war') return;

      this.drawPadBox(
        ctx,
        L.armoryLoadoutPad.x,
        L.armoryLoadoutPad.z,
        152,
        68,
        '#a855f7',
        '🛡️ ARMORY LOADOUT',
        'Tap or Step to Equip Gear'
      );

      // HYBRID IDLE + BURGER PLEASE DESIGN:
      // Keep Step-and-Pay on the floor ONLY for LOCKED (Lv.0) Production Lines!
      // Once unlocked, machines & 3-counter bays are upgraded by CLICKING/TAPPING them (no floor clutter)!
      for (const item of window.GameConfig.ITEMS) {
        const isUnlocked = !!state.unlocked[item.id];
        if (!isUnlocked) {
          const rem = Math.max(0, state.unlockRemaining[item.id] ?? item.unlockCost);
          this.drawPadBox(
            ctx,
            item.stationPos.x,
            item.stationPos.z,
            210,
            92,
            item.color,
            `🔓 STEP OR TAP: ${item.icon} $${rem}`,
            `Build ${item.shortName} (${item.recipeText})`
          );
        }
      }
    }

    drawPadBox(ctx, x, z, w, h, color, title, subtitle) {
      const p = this.lastPlayerPos || { x: 0, z: 0 };
      const isNear = Math.hypot(p.x - x, p.z - z) < 250;

      ctx.save();
      ctx.translate(x, z);
      ctx.fillStyle = isNear ? 'rgba(15, 23, 42, 0.94)' : 'rgba(15, 23, 42, 0.78)';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 8);
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = isNear ? 3 : 2;
      if (!isNear) ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = '900 11.5px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, 0, (isNear && subtitle) ? -7 : 1);

      if (isNear && subtitle) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 10.5px Rajdhani, sans-serif';
        ctx.fillText(subtitle, 0, 11);
      }
      ctx.restore();
    }

    // ========================================================================
    // 4. NIGHTFALL CASTLE GATES (EAST GATE & SOUTH BRIDGE GATE) + 6 WATCHTOWERS
    //    All upgraded with Shop $REQ and powered by Shop 🧱 Turret Ammo!
    // ========================================================================
    drawSingleTurretMount(ctx, x, z, color, ammo, maxAmmo, angle, timeSinceFire, label = "TURRET") {
      ctx.save();
      ctx.translate(x, z);
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = color || "#facc15";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.rotate(angle || 0);
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, -5, 22, 10);
      ctx.fillStyle = color || "#facc15";
      ctx.fillRect(14, -4, 9, 8);
      ctx.restore();

      ctx.fillStyle = "#fde047";
      ctx.font = "900 8.5px Orbitron, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, 0, 28);
      ctx.restore();
    }

    drawLeftHandTransportPortsAndShips(ctx, state) {
      const PL = window.GameConfig.PORT_LOGISTICS;
      if (!PL) return;
      const pState = state.portLogistics || {
        portsUnlocked: 1,
        shipsCount: 1,
        unloadSpeedLvl: 1,
        storageLimitLvl: 1,
        shipCargoLvl: 1
      };
      const portsUnlocked = pState.portsUnlocked || 1;
      const ships = state.transportShips || [];
      const oilStock = state.rawExtractors?.raw_e710?.stock || 0;
      const ironStock = state.rawExtractors?.raw_iron?.stock || 0;
      const maxStorage = state.getPortStorageLimit ? state.getPortStorageLimit() : 25;
      const unloadRate = state.getPortUnloadRate ? state.getPortUnloadRate() : 1.5;

      // Left-Hand Deep-Space Docking Trench Banner (x: -2060..-1680, z: 40..1160)
      ctx.save();
      ctx.fillStyle = 'rgba(6, 12, 24, 0.88)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-2065, 55, 380, 1110, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🛸 LEFT-HAND TRANSPORT PORT (${ships.length}/${PL.maxShips} SHIPS)`, -1875, 84);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '700 11px Rajdhani, sans-serif';
      ctx.fillText(`Fixed Start: +1🛢️ & +1⛏️/s · Unload: ${unloadRate.toFixed(1)}/s · Cap: ${maxStorage}`, -1875, 102);

      // Draw 4 Orbital Docking Ports along the left hull
      for (const port of PL.portPositions) {
        const isUnlocked = port.index <= portsUnlocked;
        ctx.save();
        ctx.translate(port.x, port.z);

        // Docking Pier extending left
        ctx.fillStyle = isUnlocked ? '#1e293b' : 'rgba(15, 23, 42, 0.45)';
        ctx.strokeStyle = isUnlocked ? '#facc15' : '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-215, -62, 290, 124, 12);
        ctx.fill();
        ctx.stroke();

        // Glowing Landing Pad Ring
        ctx.fillStyle = isUnlocked ? 'rgba(56, 189, 248, 0.16)' : 'rgba(30, 41, 59, 0.3)';
        ctx.strokeStyle = isUnlocked ? '#38bdf8' : '#64748b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-115, 0, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isUnlocked ? '#fde047' : '#94a3b8';
        ctx.font = '900 10.5px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isUnlocked ? `⚓ ${port.label}` : `🔒 PORT #${port.index} (LOCKED)`, -70, -44);

        if (!isUnlocked) {
          const addPortCost = state.getAddPortCost ? state.getAddPortCost() : 280;
          ctx.fillStyle = '#4ade80';
          ctx.font = '900 10px Orbitron, sans-serif';
          ctx.fillText(`👆 TAP TO ADD PORT ($${addPortCost})`, -70, 6);
        } else {
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '700 10px Rajdhani, sans-serif';
          ctx.fillText(`Unloads 🛢️ Oil & ⛏️ Iron ➔ Silos`, -55, 46);
        }
        ctx.restore();
      }

      // Draw Animated Transport Ships flying in from the left space corridor & unloading at Ports!
      for (let i = 0; i < ships.length; i++) {
        const sh = ships[i];
        const portCfg = PL.portPositions[(sh.portIndex || 0) % PL.portPositions.length] || PL.portPositions[0];
        let sx = portCfg.x - 115;
        let sz = portCfg.z;
        if (sh.state === 'inbound') {
          sx = -2420 + (portCfg.x - 115 - (-2420)) * Math.min(1, sh.progress || 0);
        } else if (sh.state === 'outbound') {
          sx = (portCfg.x - 115) + (-2420 - (portCfg.x - 115)) * Math.min(1, sh.progress || 0);
        }

        ctx.save();
        ctx.translate(sx, sz);

        // Engine flame
        const flameLen = sh.state === 'docked' ? 12 : (28 + Math.sin(this.time * 18 + i) * 8);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        if (sh.state === 'outbound') {
          ctx.ellipse(48, 0, flameLen, 10, 0, 0, Math.PI * 2);
        } else {
          ctx.ellipse(-48, 0, flameLen, 10, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // Transport Ship Hull (Pelican Cargo Dropship style)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-42, -26, 84, 52, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.font = '900 9px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🛸 SHIP #${i + 1} (${sh.sourceName || 'Orbit'})`, 0, -32);

        const cOil = Math.ceil(sh.cargoOil || 0);
        const cIron = Math.ceil(sh.cargoIron || 0);
        const cSand = Math.ceil(sh.cargoSand || 0);
        const cTi = Math.ceil(sh.cargoTitanium || 0);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 9.5px Orbitron, sans-serif';
        ctx.fillText(
          (cSand > 0 || cTi > 0) ? `🛢️${cOil} ⛏️${cIron} 🏜️${cSand} 🔩${cTi}` : `🛢️${cOil} ⛏️${cIron}`,
          0,
          3
        );

        if (sh.state === 'docked') {
          const uProg = Math.max(0, Math.min(1, sh.unloadProgress || 0.5));
          ctx.fillStyle = '#090d14';
          ctx.fillRect(-34, 12, 68, 8);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(-32, 13, 64 * uProg, 6);
        }
        ctx.restore();
      }

      // Bottom Interactive Upgrade Button on the Left Port Trench
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(-2045, 1112, 340, 42, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10.5px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`👆 TAP PORT: 🛸 BUY SHIP / ⚓ ADD PORT / ⚡ UNLOAD`, -1875, 1137);
      ctx.restore();
    }

    drawRawQuarryAndAmmoPress(ctx, state) {
      // 1. Draw the Left-Hand Orbital Docking Ports (#1-#4) & Animated Transport Ships
      this.drawLeftHandTransportPortsAndShips(ctx, state);

      // 2. Draw all 6 Port Cargo Storage Silos (2 Basic + 2 Bug Unique + 2 Bot Unique) & Pickup Pads
      const maxPortCap = state.getPortStorageLimit ? state.getPortStorageLimit() : 25;
      for (const raw of window.GameConfig.RAW_EXTRACTORS) {
        const rs = state.rawExtractors[raw.id];
        const stock = rs ? Math.floor(rs.stock || 0) : 0;
        const maxBuf = rs ? (rs.maxBuffer || maxPortCap) : maxPortCap;
        const fillRatio = Math.max(0, Math.min(1, stock / Math.max(1, maxBuf)));

        this.drawStationConnectorPipe(
          ctx,
          { x: -1685, z: raw.z },
          { x: raw.x, z: raw.z },
          { x: raw.pickupX, z: raw.pickupZ },
          raw.color
        );

        ctx.save();
        ctx.translate(raw.x, raw.z);

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = raw.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-102, -46, 204, 92, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#090d14';
        ctx.fillRect(-86, 16, 172, 12);
        ctx.fillStyle = raw.color;
        ctx.fillRect(-84, 18, 168 * fillRatio, 8);

        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(raw.itemIcon, -62, -10);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10.5px Orbitron, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${raw.shortName.toUpperCase()}`, -36, -20);

        ctx.fillStyle = '#fde047';
        ctx.font = '900 11.5px Orbitron, sans-serif';
        ctx.fillText(`ORE: ${stock} / ${maxBuf}`, -36, -3);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 9.5px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(raw.planetLevels || 'Super Earth + Planets', 0, 38);
        ctx.restore();

        this.drawPadBox(
          ctx,
          raw.pickupX,
          raw.pickupZ,
          164,
          70,
          stock > 0 ? raw.color : '#64748b',
          `📤 PICK ${raw.itemIcon} (${stock}/${maxBuf})`,
          raw.planetLevels || 'Port Pickup Pad'
        );
      }
    }

    drawStationConnectorPipe(ctx, inPos, stPos, outPos, color) {
      ctx.save();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(inPos.x, inPos.z);
      ctx.lineTo(stPos.x, stPos.z);
      ctx.lineTo(outPos.x, outPos.z);
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(inPos.x, inPos.z);
      ctx.lineTo(stPos.x, stPos.z);
      ctx.lineTo(outPos.x, outPos.z);
      ctx.stroke();
      ctx.restore();
    }

    // ========================================================================
    // 6. SECTOR B: 7 HORIZONTAL ARSENAL PRODUCTION LANES
    // ========================================================================
    drawArsenalFactories(ctx, state) {
      for (const item of window.GameConfig.ITEMS) {
        if (!state.unlocked[item.id]) continue;
        const st = state.stations[item.id];
        const lvl = st ? (st.level || 1) : 1;
        const stock = st ? st.stock : 0;
        const maxBuf = st ? (st.maxBuffer || item.maxBuffer) : item.maxBuffer;
        const isMax = stock >= maxBuf;
        const hasIngredients = state.hasStationIngredients ? state.hasStationIngredients(item, st) : true;
        const prog = isMax ? 1 : (st ? st.progress / st.cycleTime : 0);

        this.drawStationConnectorPipe(ctx, item.inputPos, item.stationPos, item.pickupPos, item.color);

        const inStock = st?.inputStock || {};
        const parts = [];
        if (item.recipe.raw_iron) parts.push(`⛏️${inStock.raw_iron || 0}/${item.recipe.raw_iron}`);
        if (item.recipe.raw_e710) parts.push(`🛢️${inStock.raw_e710 || 0}/${item.recipe.raw_e710}`);
        const hopperStr = parts.join(' ');

        // 1. Input Hopper Pad (Left)
        this.drawPadBox(
          ctx,
          item.inputPos.x,
          item.inputPos.z,
          164,
          80,
          hasIngredients ? '#38bdf8' : '#ef4444',
          `📥 HOPPER: ${hopperStr}`,
          hasIngredients ? `Recipe: ${item.recipeText}` : `⚠️ FEED RAW ORE HERE!`
        );

        // 2. Fabricator Machine (Center)
        ctx.save();
        ctx.translate(item.stationPos.x, item.stationPos.z);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;
        ctx.fillRect(-58, -58, 116, 116);
        ctx.strokeRect(-58, -58, 116, 116);

        ctx.strokeStyle = hasIngredients ? item.color : '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(-50, -50, 100, 100);

        ctx.save();
        if (!isMax && hasIngredients) ctx.rotate(this.time * (3.2 + lvl * 0.2));
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, -6, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, 0, -6);

        ctx.fillStyle = '#090d14';
        ctx.fillRect(-48, 34, 96, 12);
        ctx.fillStyle = !hasIngredients ? '#ef4444' : (isMax ? '#facc15' : item.color);
        ctx.fillRect(-46, 36, 92 * Math.min(1, prog), 8);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.fillText(`${item.icon} ${item.shortName.toUpperCase()} (Lv.${lvl}/10)`, 0, -68);

        const upgCost = state.getStationUpgradeCost ? state.getStationUpgradeCost(item.id) : 100;
        const stMax = lvl >= 10;
        ctx.fillStyle = stMax ? '#16a34a' : '#0f172a';
        ctx.strokeStyle = stMax ? '#4ade80' : item.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(-84, 58, 168, 25, 6);
        ctx.fill();
        ctx.stroke();
        const ab = st || {};
        ctx.fillStyle = stMax ? '#4ade80' : '#fde047';
        ctx.font = '900 9.5px Orbitron, sans-serif';
        ctx.fillText(
          `🎛️ TAP POPUP: 💰${ab.priceLvl || 1} ⚡${ab.speedLvl || 1} 📦${ab.yieldLvl || 1} 🏪${ab.counterLvl || 1}`,
          0,
          71
        );

        ctx.restore();

        // 3. Output Pickup Pad (Right)
        this.drawPadBox(
          ctx,
          item.pickupPos.x,
          item.pickupPos.z,
          158,
          80,
          isMax ? '#facc15' : item.color,
          `📤 READY: ${stock}/${maxBuf} ${item.icon}`,
          `Carry to Counter #${item.tier} or Belt`
        );
      }
    }

    // ========================================================================
    // 7. SECTOR C: 7 DEDICATED ITEM SALES COUNTERS, PER-COUNTER CASH & QUEUES
    //    (1 Item = 1 Dedicated Sales Counter + Drop Pad + Cash Stack + Queue)
    // ========================================================================
    // ========================================================================
    // 7. SECTOR C: EXPANDABLE 1-TO-3 PHYSICAL COUNTERS PER LANE (MAX Lv.10!)
    //    - Lv.1–3: 1 Physical Counter Desk (x = 500)
    //    - Lv.4–7: 2 Physical Counter Desks (x = 500, x = 820) — 2x Checkout Speed & Buffer!
    //    - Lv.8–10: 3 Physical Counter Desks (x = 500, x = 820, x = 1140) — 3x Checkout Speed!
    // ========================================================================
    drawDedicatedCountersAndCash(ctx, state) {
      const L = window.GameConfig.LOCATIONS;

      for (const item of window.GameConfig.ITEMS) {
        if (!state.unlocked[item.id]) continue;
        const st = state.stations[item.id];
        const lvl = st ? (st.level || 1) : 1;
        const unlockedDesks = state.getUnlockedCounterCount ? state.getUnlockedCounterCount(item.id) : (lvl >= 8 ? 3 : (lvl >= 4 ? 2 : 1));
        const count = state.counterBuffer[item.id] || 0;
        const sellPrice = state.getItemSellPrice(item);
        const upgCost = state.getStationUpgradeCost ? state.getStationUpgradeCost(item.id) : 100;

        // 1. Dedicated Drop / Stock Pad on the West side of this item's Counter Hall
        this.drawPadBox(
          ctx,
          item.counterDropPos.x,
          item.counterDropPos.z,
          132,
          76,
          count > 0 ? '#22c55e' : item.color,
          `📦 STOCK ${item.icon}`,
          `Drop ${item.shortName}`
        );

        // 2. Render all 3 Counter Desk Slots (x = 500, 820, 1140)
        const deskPositions = [
          { idx: 1, pos: item.counterPos, reqLvl: 1 },
          { idx: 2, pos: item.counter2Pos || { x: 820, z: item.counterPos.z }, reqLvl: 4 },
          { idx: 3, pos: item.counter3Pos || { x: 1140, z: item.counterPos.z }, reqLvl: 8 }
        ];

        for (const desk of deskPositions) {
          const isDeskActive = unlockedDesks >= desk.idx;
          ctx.save();
          ctx.translate(desk.pos.x, desk.pos.z);

          if (!isDeskActive) {
            // Expansion Slot Blueprint for Counter #2 (Lv.4) or Counter #3 (Lv.8)
            ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
            ctx.lineWidth = 2;
            ctx.setLineDash([7, 6]);
            ctx.fillRect(-110, -44, 220, 88);
            ctx.strokeRect(-110, -44, 220, 88);
            ctx.setLineDash([]);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '900 10.5px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`🔒 +COUNTER DESK #${desk.idx} (UNLOCKS AT Lv.${desk.reqLvl})`, 0, -4);
            ctx.fillStyle = '#fde047';
            ctx.font = '700 10px Rajdhani, sans-serif';
            ctx.fillText(`👆 Tap Lane to Upgrade Lv.${lvl}/10 ($${upgCost})`, 0, 14);
          } else {
            // Active Physical Sales Counter Desk!
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = desk.idx === 3 ? '#facc15' : (count > 0 ? item.color : '#475569');
            ctx.lineWidth = desk.idx === 3 ? 4.5 : 3.5;
            ctx.fillRect(-114, -46, 228, 92);
            ctx.strokeRect(-114, -46, 228, 92);

            ctx.fillStyle = count > 0 ? 'rgba(34, 197, 94, 0.22)' : 'rgba(15, 23, 42, 0.75)';
            ctx.fillRect(-102, -32, 204, 64);

            ctx.fillStyle = item.color;
            ctx.font = '900 10.5px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(
              `COUNTER ${item.tier}-${desk.idx} (${unlockedDesks}/3 DESKS · Lv.${lvl}/10)`,
              0,
              -54
            );

            ctx.font = '24px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.icon, -88, -2);

            ctx.fillStyle = count > 0 ? '#4ade80' : '#f87171';
            ctx.font = '900 16px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`STOCK x${count}`, 0, -4);

            ctx.fillStyle = '#fde047';
            ctx.font = '700 11.5px Rajdhani, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`$${sellPrice}/ea`, 92, -4);

            // Click-to-Upgrade Pill on the primary counter desk
            if (desk.idx === unlockedDesks) {
              ctx.fillStyle = lvl >= 10 ? '#16a34a' : '#0284c7';
              ctx.beginPath();
              ctx.roundRect(-86, 14, 172, 20, 5);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = '900 9.5px Orbitron, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(
                lvl >= 10 ? '✅ MAX 3 COUNTERS (Lv.10)' : `👆 TAP +UPGRADE Lv.${lvl + 1}/10 ($${upgCost})`,
                0,
                25
              );
            }
          }
          ctx.restore();
        }

        // 3. Dedicated Cash Stack for this 3-Counter Bay (`state.counterCash[item.id]`)
        const cashVal = (state.counterCash && state.counterCash[item.id]) || 0;
        const cx = item.cashPos.x;
        const cz = item.cashPos.z;

        this.drawPadBox(
          ctx,
          cx,
          cz,
          126,
          72,
          cashVal > 0 ? '#22c55e' : '#facc15',
          cashVal > 0 ? `💵 +$${cashVal}` : `💵 VAULT #${item.tier}`,
          cashVal > 0 ? `Step or Tap to Collect` : `Counter #${item.tier} Vault`
        );

        const billCount = Math.min(28, Math.ceil(cashVal / 20));
        if (billCount > 0) {
          for (let i = 0; i < billCount; i++) {
            const col = i % 2;
            const layer = Math.floor(i / 2);
            const bx = cx - 18 + col * 36;
            const by = cz - 26 - layer * 3.5;
            ctx.fillStyle = '#22c55e';
            ctx.strokeStyle = '#14532d';
            ctx.lineWidth = 1.5;
            ctx.fillRect(bx - 13, by - 6, 26, 11);
            ctx.strokeRect(bx - 13, by - 6, 26, 11);
          }
        }
      }

      // Trash / Clear Stack Pad
      const TC = L.trashCanZone;
      this.drawPadBox(ctx, TC.x, TC.z, 132, 76, '#ef4444', '🗑️ DUMP / CLEAR', 'Clear Held Stack');
    }

    drawSortedEntities(ctx, state, mode = 'shop') {
      const renderList = [];

      renderList.push({
        z: state.player.z,
        draw: () => this.drawPlayerCommander(ctx, state)
      });

      if (mode !== 'war') {
        for (const w of state.workers) {
          if (w.z < -180) continue;
          renderList.push({
            z: w.z,
            draw: () => this.drawSeafWorker(ctx, w)
          });
        }

        for (const c of state.customers) {
          renderList.push({
            z: c.z,
            draw: () => this.drawHelldiverCustomer(ctx, c, state)
          });
        }
      } else {


        for (const e of state.enemies) {
          renderList.push({
            z: e.z,
            draw: () => this.drawEnemy(ctx, e)
          });
        }
      }

      renderList.sort((a, b) => a.z - b.z);
      for (const item of renderList) {
        item.draw();
      }
    }

    drawCarbotBean(ctx, x, z, opts) {
      const {
        bodyColor = '#1e293b',
        capeColor = '#eab308',
        trimColor = '#facc15',
        visorColor = '#f97316',
        isCommander = false,
        hasRifle = false,
        weaponId = 'w_liberator',
        walkPhase = 0,
        scale = 1,
        label = '',
        subLabel = '',
        stack = []
      } = opts;

      ctx.save();
      ctx.translate(x, z);
      ctx.scale(scale, scale);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      ctx.ellipse(0, 20, 20, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      const capeWave = Math.sin(walkPhase * 1.5) * 4;
      ctx.fillStyle = capeColor;
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-14, -8);
      ctx.lineTo(14, -8);
      ctx.lineTo(19 + capeWave, 19);
      ctx.lineTo(-19 + capeWave, 19);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const footL = Math.sin(walkPhase) * 5;
      const footR = -Math.sin(walkPhase) * 5;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(-8, 18 + footL * 0.4, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(8, 18 + footR * 0.4, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const bounce = Math.abs(Math.sin(walkPhase)) * 2.5;
      ctx.save();
      ctx.translate(0, -bounce);

      ctx.fillStyle = bodyColor;
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-17, -22, 34, 38, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = trimColor;
      ctx.fillRect(-13, 0, 26, 5);
      ctx.beginPath();
      ctx.arc(0, 2.5, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = visorColor;
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-12, -15, 24, 11, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-6, -12, 4, 2, -0.2, 0, Math.PI * 2);
      ctx.fill();

      if (isCommander) {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-14, -16);
        ctx.lineTo(-25, -27);
        ctx.lineTo(-16, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(14, -16);
        ctx.lineTo(25, -27);
        ctx.lineTo(16, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = bodyColor;
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-18, 3, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (hasRifle) {
        if (weaponId === 'w_autocannon') {
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(8, -5, 26, 10);
          ctx.strokeRect(8, -5, 26, 10);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(28, -3, 6, 6);
        } else if (weaponId === 'w_quasar') {
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(8, -4, 24, 9);
          ctx.strokeRect(8, -4, 24, 9);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(26, -2, 6, 5);
        } else if (weaponId === 'w_breaker') {
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(9, -2, 20, 7);
          ctx.strokeRect(9, -2, 20, 7);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(14, 0, 7, 4);
        } else {
          ctx.fillStyle = '#334155';
          ctx.fillRect(10, -1, 18, 6);
          ctx.strokeRect(10, -1, 18, 6);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(14, 0, 5, 4);
        }
      }

      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(18, 3, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      if (stack && stack.length > 0) {
        const maxDraw = Math.min(stack.length, 15);
        for (let i = 0; i < maxDraw; i++) {
          const entry = stack[i];
          const sy = -30 - i * 10;
          const sway = Math.sin(this.time * 6 + i * 0.4) * (i * 0.4);
          ctx.fillStyle = entry.color || '#facc15';
          ctx.strokeStyle = '#090d14';
          ctx.lineWidth = 2;
          ctx.fillRect(-12 + sway, sy - 6, 24, 9);
          ctx.strokeRect(-12 + sway, sy - 6, 24, 9);
          if (i === maxDraw - 1) {
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(entry.icon || '📦', sway, sy - 11);
          }
        }
      }

      if (label) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10.5px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, 34);
      }
      if (subLabel) {
        ctx.fillStyle = '#fde047';
        ctx.font = '700 10px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(subLabel, 0, 46);
      }

      ctx.restore();
    }

    drawPlayerCommander(ctx, state) {
      const p = state.player;
      const eq = state.getEquippedItems ? state.getEquippedItems() : {};
      const armor = eq.armor || { bodyColor: '#1e293b', capeColor: '#eab308', trimColor: '#facc15' };
      const weapon = eq.weapon || { id: 'w_liberator' };
      const backpack = eq.backpack || { hasDrone: false };
      const mount = eq.mount || { id: 'm_foot' };

      if (p.z < window.GameConfig.WORLD.wallZ + 30) {
        ctx.save();
        ctx.translate(p.x, p.z);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, window.GameConfig.PLAYER.attackRange, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const labelText = `🦅 YOU (${p.inventory.length}/${state.getPlayerMaxCapacity()})`;

      if (mount.id === 'm_mech') {
        this.drawPatriotMechSprite(ctx, p.x, p.z, p.walkPhase * 0.25, 1.28, true, p.inventory);
        ctx.save();
        ctx.fillStyle = '#fde047';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🤖 MECH PILOT — ${labelText}`, p.x, p.z + 44);
        ctx.restore();
      } else if (mount.id === 'm_vehicle') {
        this.drawReconVehicleSprite(ctx, p.x, p.z, p.walkPhase * 0.25, 1.28, true, p.inventory);
        ctx.save();
        ctx.fillStyle = '#fde047';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🚙 RECON DRIVER — ${labelText}`, p.x, p.z + 38);
        ctx.restore();
      } else {
        this.drawCarbotBean(ctx, p.x, p.z, {
          bodyColor: armor.bodyColor || '#1e293b',
          capeColor: armor.capeColor || '#eab308',
          trimColor: armor.trimColor || '#facc15',
          visorColor: '#f97316',
          isCommander: true,
          hasRifle: true,
          weaponId: weapon.id,
          walkPhase: p.walkPhase || 0,
          scale: 1.15,
          label: labelText,
          stack: p.inventory
        });
      }

      if (backpack.hasDrone) {
        const dx = p.x + Math.cos(this.time * 3.2) * 52;
        const dz = p.z - 28 + Math.sin(this.time * 3.2) * 26;
        this.drawGuardDogDrone(ctx, dx, dz, this.time);
      }
    }

    drawSeafWorker(ctx, w) {
      const roleStyles = {
        miner:   { body: '#0f766e', cape: '#2dd4bf', visor: '#99f6e4', title: '🛸 PICK PORT RAW' },
        hauler:  { body: '#854d0e', cape: '#facc15', visor: '#fef08a', title: '📦 HAUL GOODS' },
        sales:   { body: '#581c87', cape: '#a855f7', visor: '#e9d5ff', title: '🫡 SALES CASHIER' },
        cash:    { body: '#14532d', cape: '#22c55e', visor: '#86efac', title: '💵 PICK MONEY' },
        ammo:    { body: '#7c2d12', cape: '#f97316', visor: '#fed7aa', title: '🔧 FACTORY TECH' },
        war:     { body: '#7f1d1d', cape: '#ef4444', visor: '#fca5a5', title: '⚓ PORT DOCKMASTER' }
      };
      const st = roleStyles[w.role] || roleStyles.hauler;
      this.drawCarbotBean(ctx, w.x, w.z, {
        bodyColor: st.body,
        capeColor: st.cape,
        trimColor: '#f8fafc',
        visorColor: st.visor,
        isCommander: false,
        walkPhase: w.walkPhase || 0,
        scale: 0.94,
        label: st.title,
        subLabel: w.taskLabel || '',
        stack: w.inventory
      });
    }

    drawHelldiverCustomer(ctx, c, state = {}) {
      const isVip = c.item && c.item.tier >= 5;
      this.drawCarbotBean(ctx, c.x, c.z, {
        bodyColor: isVip ? '#3b0764' : (c.color || '#1e293b'),
        capeColor: isVip ? '#f59e0b' : '#dc2626',
        trimColor: isVip ? '#fde047' : '#facc15',
        visorColor: isVip ? '#fef08a' : '#fb923c',
        isCommander: isVip,
        hasRifle: true,
        walkPhase: c.walkPhase || 0,
        scale: isVip ? 1.1 : 1.0,
        label: '',
        stack: []
      });

      ctx.save();
      ctx.translate(c.x, c.z - 42);
      ctx.fillStyle = c.state === 'leaving' ? '#16a34a' : '#0f172a';
      ctx.strokeStyle = c.state === 'leaving' ? '#4ade80' : (c.item?.color || '#facc15');
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-44, -16, 88, 28, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (c.state === 'to_hellpod') {
        ctx.fillText(`🚀 TO HELLPOD EXIT`, 0, -2);
      } else if (c.state === 'leaving') {
        ctx.fillText('😊 DEMOCRACY!', 0, -2);
      } else if (c.orders && c.orders.length > 1) {
        const summary = c.orders
          .map((o) => `${o.item.icon}${o.received}/${o.qty}`)
          .join(' ');
        ctx.fillText(summary, 0, -2);
      } else {
        ctx.fillText(`${c.item.icon} ${c.received}/${c.qty} (#${c.item.tier})`, 0, -2);
      }
      ctx.restore();
    }

    // ========================================================================
    // ALL-EPISODE CARBOT ANIMATIONS ENEMY SPRITES (Ep1–Ep10+)
    // Supports:
    //  - Terminids: hunter (Ep1/2), bug (Charger Ep1/3), spewer (Bile Spewer Ep2/5), titan (Bile Titan Ep1/4)
    //  - Automatons: trooper (Ep3/7), devastator (Rocket Devastator Ep3/6), hulk (Ep3/7), strider (Factory Strider Ep8/9)
    // ========================================================================
    drawEnemy(ctx, e) {
      ctx.save();
      ctx.translate(e.x, e.z);
      const type = e.type || 'trooper';
      let defaultScale = 1.05;
      if (type === 'hunter') defaultScale = 0.92;
      else if (type === 'bug') defaultScale = 1.08;
      else if (type === 'spewer') defaultScale = 1.22;
      else if (type === 'titan') defaultScale = 1.65;
      else if (type === 'devastator') defaultScale = 1.22;
      else if (type === 'hulk') defaultScale = 1.45;
      else if (type === 'strider') defaultScale = 1.72;

      const scale = e.previewScale || defaultScale;
      const t = e.phase ?? this.time;
      ctx.scale(scale, scale);

      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 18, type === 'titan' || type === 'strider' ? 26 : 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      const wobble = Math.sin(t * 7.5) * 2.2;
      ctx.translate(0, wobble * 0.45);

      if (type === 'hunter') {
        // Ep1/Ep2 Carbot Scavenger / Leaping Hunter Bug (Fluttering wings + wagging pink tongue + derpy eyes)
        const wingFlap = Math.sin(t * 18) * 6;
        ctx.fillStyle = 'rgba(253, 224, 71, 0.45)';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(-14, -8 + wingFlap * 0.4, 10, 5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(14, -8 - wingFlap * 0.4, 10, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fb923c';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 2, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Wagging pink tongue
        const tongueX = Math.sin(t * 10) * 4;
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.ellipse(tongueX, 13, 4.5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Derpy Carbot Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, 4, 4.5, 0, Math.PI * 2);
        ctx.arc(6, 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#090d14';
        ctx.beginPath();
        ctx.arc(-7, 4, 1.8, 0, Math.PI * 2);
        ctx.arc(7, 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'bug') {
        // Ep1/Ep3 Carbot Armored Charger Bug
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3;
        for (const side of [-1, 1]) {
          for (let l = -1; l <= 1; l++) {
            ctx.beginPath();
            ctx.moveTo(side * 12, l * 5);
            ctx.lineTo(side * 22, l * 8 + Math.sin(t * 12 + l) * 3);
            ctx.stroke();
          }
        }
        ctx.fillStyle = '#65a30d';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 2, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(-8, 12, 4, 0, Math.PI * 2);
        ctx.arc(8, 12, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'spewer') {
        // Ep2/Ep5 Carbot Bile Spewer (Bloated glowing neon-green acid sac)
        const pulse = 1 + Math.sin(t * 6) * 0.08;
        ctx.save();
        ctx.scale(pulse, 1 / pulse);
        ctx.fillStyle = '#a3e635';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -4, 21, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#bef264';
        ctx.beginPath();
        ctx.arc(-8, -8, 4.5, 0, Math.PI * 2);
        ctx.arc(7, -10, 3.5, 0, Math.PI * 2);
        ctx.arc(2, -2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Head + dripping green bile
        ctx.fillStyle = '#3f6212';
        ctx.beginPath();
        ctx.arc(0, 11, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(0, 18 + Math.sin(t * 9) * 2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'titan') {
        // Ep1/Ep4 Carbot Bile Titan Boss (4 towering stilted spider legs + glowing acid belly)
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;
        for (const side of [-1, 1]) {
          for (const fb of [-1, 1]) {
            const kneeX = side * 26;
            const kneeY = fb * 8 - 10 + Math.sin(t * 6 + side + fb) * 4;
            const footX = side * 34;
            const footY = fb * 15 + 14;
            ctx.beginPath();
            ctx.moveTo(side * 10, fb * 4);
            ctx.lineTo(kneeX, kneeY);
            ctx.lineTo(footX, footY);
            ctx.stroke();
          }
        }
        // Glowing green acid underbelly
        ctx.fillStyle = '#84cc16';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -6, 16, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Armored dark carapace crest
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-14, -18, 28, 22, 8);
        ctx.fill();
        ctx.stroke();

        // Glowing acid jaws
        ctx.fillStyle = '#bef264';
        ctx.beginPath();
        ctx.arc(-5, 8, 3.5, 0, Math.PI * 2);
        ctx.arc(5, 8, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'devastator') {
        // Ep3/Ep6 Malevelon Creek Rocket Devastator (Dual 6-tube shoulder rocket pods!)
        ctx.fillStyle = '#991b1b';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3.5;
        // Dual shoulder rocket pods
        ctx.fillRect(-21, -28, 13, 14);
        ctx.strokeRect(-21, -28, 13, 14);
        ctx.fillRect(8, -28, 13, 14);
        ctx.strokeRect(8, -28, 13, 14);
        ctx.fillStyle = '#facc15';
        for (const rx of [-17, -12, 12, 17]) {
          ctx.beginPath();
          ctx.arc(rx, -21, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Broad armored torso
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(-19, -16, 38, 32, 8);
        ctx.fill();
        ctx.stroke();

        // Skull head & glowing red eyes
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, -4, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-3.5, -5, 2.8, 0, Math.PI * 2);
        ctx.arc(3.5, -5, 2.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'strider') {
        // Ep8/Ep9 Carbot Factory Strider ("AT-AT Mechanical Dog" Mega-Boss!)
        const legStep = Math.sin(t * 5) * 4;
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3.5;
        // 4 heavy mechanical walker legs
        ctx.fillRect(-24, 6 + legStep, 9, 16);
        ctx.strokeRect(-24, 6 + legStep, 9, 16);
        ctx.fillRect(-10, 8 - legStep, 9, 16);
        ctx.strokeRect(-10, 8 - legStep, 9, 16);
        ctx.fillRect(4, 6 + legStep, 9, 16);
        ctx.strokeRect(4, 6 + legStep, 9, 16);
        ctx.fillRect(16, 8 - legStep, 9, 16);
        ctx.strokeRect(16, 8 - legStep, 9, 16);

        // Colossal armored walker body
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-26, -22, 52, 30, 8);
        ctx.fill();
        ctx.stroke();

        // Dorsal top cannon turret
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-10, -32, 20, 10);
        ctx.strokeRect(-10, -32, 20, 10);
        ctx.fillRect(-3, -42, 6, 12);
        ctx.strokeRect(-3, -42, 6, 12);

        // Glowing red factory bay slit & chin gatling guns
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-16, -6, 32, 6);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-12, 6, 5, 10);
        ctx.fillRect(7, 6, 5, 10);
      } else {
        // Ep3/Ep7 Trooper or Flame-Saw Hulk Boss
        const isHulk = type === 'hulk';
        ctx.fillStyle = isHulk ? '#7f1d1d' : '#334155';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(-18, -20, 36, 36, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, -6, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-4, -7, 3, 0, Math.PI * 2);
        ctx.arc(4, -7, 3, 0, Math.PI * 2);
        ctx.fill();

        if (isHulk) {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(-22, 2, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(18, -4, 9, 14);
          ctx.strokeRect(18, -4, 9, 14);
        }
      }

      if (!e.previewScale) {
        const hpRatio = Math.max(0, Math.min(1, e.hp / e.maxHp));
        ctx.fillStyle = '#090d14';
        ctx.fillRect(-20, -34, 40, 7);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-19, -33, 38 * hpRatio, 5);
      }
      ctx.restore();
    }

    drawProjectilesAndArcs(ctx, state) {
      for (const arc of state.flyingArcs) {
        const t = Math.min(1, arc.t / arc.duration);
        const x = arc.sx + (arc.tx - arc.sx) * t;
        const z = arc.sz + (arc.tz - arc.sz) * t - Math.sin(t * Math.PI) * 55;
        ctx.save();
        ctx.translate(x, z);
        ctx.fillStyle = arc.color || '#facc15';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(arc.icon || '📦', 0, 1);
        ctx.restore();
      }

      for (const b of state.tracers) {
        ctx.save();
        ctx.strokeStyle = b.color || '#facc15';
        ctx.lineWidth = b.width || 3.5;
        ctx.beginPath();
        ctx.moveTo(b.sx, b.sz);
        ctx.lineTo(b.tx, b.tz);
        ctx.stroke();
        ctx.restore();
      }

      for (const ex of state.explosions) {
        const p = Math.min(1, ex.t / ex.duration);
        ctx.save();
        ctx.translate(ex.x, ex.z);
        ctx.fillStyle = `rgba(250, 204, 21, ${1 - p})`;
        ctx.strokeStyle = `rgba(239, 68, 68, ${1 - p})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, ex.maxR * p, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Carbot Ep1/Ep7 Eagle-1 500KG Bomb Flyover Jet Silhouette & Red Stratagem Beacon Beam!
    drawEagleFlyover(ctx, state) {
      return; // removed from player-facing v0.0.23-rework
      if (!state.eagleFlyover) return;
      const ef = state.eagleFlyover;
      const p = Math.min(1, ef.t / ef.duration);
      const jx = ef.sx + (ef.tx - ef.sx) * p;
      const jz = ef.sz + (ef.tz - ef.sz) * p;

      // Red vertical stratagem beacon beam at target center
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, -900);
      ctx.lineTo(0, -1850);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 16px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🦅 EAGLE-1 500KG INBOUND (⬆️➡️⬇️⬇️⬇️)!', 0, -920);

      // Sweeping jet shadow
      ctx.translate(jx, jz);
      ctx.rotate(-0.35);
      ctx.fillStyle = 'rgba(9, 13, 20, 0.65)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(90, 0);
      ctx.lineTo(-40, -75);
      ctx.lineTo(-20, 0);
      ctx.lineTo(-40, 75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Mindustry Core Shard, Multi-Base Orbital Receiver & Split Shop/War Rapid-Transit Portal
    renderMindustryTechTree(canvas, state, selectedNodeId) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const cw = Math.max(300, Math.floor(rect.width || 860));
      const ch = Math.max(240, Math.floor(rect.height || 320));
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Mindustry dark schematic background + grid
      ctx.fillStyle = '#070b12';
      ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cw; gx += 28) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, ch);
        ctx.stroke();
      }
      for (let gy = 0; gy < ch; gy += 28) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(cw, gy);
        ctx.stroke();
      }

      const nodes = window.GameConfig.MINDUSTRY_TECH_NODES || [];
      const nodeMap = {};
      for (const n of nodes) nodeMap[n.id] = n;

      // 1. Draw Mindustry Orthogonal / Diagonal Conduit Pipes (Parent -> Child)
      for (const n of nodes) {
        if (!n.parentId || !nodeMap[n.parentId]) continue;
        const p = nodeMap[n.parentId];
        const px = p.nx * cw;
        const py = p.ny * ch;
        const cx = n.nx * cw;
        const cy = n.ny * ch;
        const pLvl = state.getTechNodeLevel ? state.getTechNodeLevel(p.id) : 0;
        const nLvl = state.getTechNodeLevel ? state.getTechNodeLevel(n.id) : 0;
        const midY = (py + cy) * 0.5;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, midY);
        ctx.lineTo(cx, midY);
        ctx.lineTo(cx, cy);

        if (nLvl > 0) {
          ctx.strokeStyle = n.color || '#4ade80';
          ctx.lineWidth = 4;
          ctx.stroke();
        } else if (pLvl > 0 || p.id === 'core_shard') {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Draw Each Mindustry Tech Node Box
      const boxW = cw < 520 ? 68 : 118;
      const boxH = cw < 520 ? 44 : 52;

      for (const n of nodes) {
        const cx = n.nx * cw;
        const cy = n.ny * ch;
        const lvl = state.getTechNodeLevel ? state.getTechNodeLevel(n.id) : 0;
        const unlockedParent = !n.parentId || (state.getTechNodeLevel ? state.getTechNodeLevel(n.parentId) > 0 : true);
        const isSelected = n.id === selectedNodeId;

        ctx.save();
        ctx.translate(cx, cy);

        ctx.fillStyle = lvl > 0 ? '#132a23' : (unlockedParent ? '#1e293b' : '#0f141f');
        ctx.strokeStyle = isSelected ? '#ffffff' : (lvl > 0 ? (n.color || '#4ade80') : (unlockedParent ? '#facc15' : '#334155'));
        ctx.lineWidth = isSelected ? 3.5 : 2.2;

        ctx.beginPath();
        ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = cw < 520 ? '15px sans-serif' : '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.icon, cw < 520 ? 0 : -boxW / 2 + 18, cw < 520 ? -6 : -4);

        ctx.fillStyle = lvl > 0 ? '#4ade80' : (unlockedParent ? '#fde047' : '#64748b');
        ctx.font = cw < 520 ? '900 8.5px Orbitron, sans-serif' : '900 9.5px Orbitron, sans-serif';
        if (cw < 520) {
          ctx.fillText(`Lv.${lvl}/${n.maxLevel}`, 0, 12);
        } else {
          ctx.textAlign = 'left';
          const shortTitle = n.name.length > 14 ? n.name.slice(0, 13) + '..' : n.name;
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(shortTitle, -boxW / 2 + 32, -7);
          ctx.fillStyle = lvl > 0 ? '#4ade80' : (unlockedParent ? '#fde047' : '#94a3b8');
          ctx.fillText(`Lv.${lvl}/${n.maxLevel}`, -boxW / 2 + 32, 9);
        }

        ctx.restore();
      }

      ctx.restore();
    }
  }

  window.WorldRenderer2D = WorldRenderer2D;
})();

````

## `tests/package.test.js`

````javascript
const fs=require('fs'),assert=require('assert'),path=require('path'),root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const t of ['500KG BOOST','btn-open-github','modal-github','JSZip'])assert.ok(!html.includes(t),`removed: ${t}`);for(const t of ['idle-bottom-nav','rework.css','rework-ui.js'])assert.ok(html.includes(t),`present: ${t}`);for(const m of html.matchAll(/(?:src|href)="\.\/(css|js)\/([^"?]+)"/g)){const f=path.join(root,m[1],m[2]);if(['style.css','config.js','audio.js','shop-upgrades.js','war-run.js','war-casualties.js','war-supplies.js','war-supply-ui.js','war-events.js','war-ui.js','game.js'].includes(m[2]))continue;assert.ok(fs.existsSync(f),`changed dependency exists: ${f}`);}console.log('PASS package');

````

## `tests/war-combat.test.js`

````javascript
const assert=require('assert');const E=require('../js/war-combat.js');
const heroes=Array.from({length:4},(_,i)=>({id:`h${i}`,name:`Hero ${i}`,level:10,classId:'x',classDef:{baseHp:500,baseAtk:55}}));
assert.throws(()=>E.create({config:{WAR_COMBAT:{}},heroes:heroes.slice(0,3)}),/Exactly four/);
let s=E.create({config:{WAR_COMBAT:{}},node:{type:'battle'},difficulty:8,faction:'bugs',heroes});assert.equal(s.heroes.length,4);assert.ok(s.enemies.length>=2);const second=s.enemies[1].hp;s.enemies[0].hp=0;s.enemies[0].alive=false;E.tick(s,.1,{});assert.equal(s.status,'active');assert.ok(s.enemies[1].hp<=second);for(let i=0;i<3000&&s.status==='active';i++)E.tick(s,.1,{});assert.ok(['victory','defeat'].includes(s.status));console.log('PASS war-combat');

````

## `tools/validate-art-assets.js`

````javascript
#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const manifestPath=path.join(root,'assets/data/art-manifest.json');
const production=process.argv.includes('--production');
const strictFiles=process.argv.includes('--strict-files')||production;
const errors=[],warnings=[];
const allowedTypes=new Set(['character','portrait','enemy','boss','effect','background','ui','building','prop','icon']);
const allowedStatus=new Set(['placeholder','review','approved','deprecated']);
const requiredFields=['id','type','faction','variant','asset','status','sourceOwner','licence','required'];
const forbidden=['final','new','copy','test','capybara','redive','carbot'];
const fileRegex=/^[a-z0-9]+(?:-[a-z0-9]+)*\.(webp|png|svg|json)$/;
function fail(msg){errors.push(msg);}function warn(msg){warnings.push(msg);}
function readJson(file){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){fail(`Invalid JSON: ${path.relative(root,file)}: ${e.message}`);return null;}}
const manifest=readJson(manifestPath);
if(!manifest){finish();}
if(!Array.isArray(manifest.assets))fail('Manifest assets must be an array.');
const ids=new Set(),assetPaths=new Set(),hashes=new Map();
for(const [i,a] of (manifest.assets||[]).entries()){
 const label=`assets[${i}]`;
 for(const f of requiredFields)if(a[f]===undefined||a[f]===null||a[f]==='')fail(`${label} missing ${f}`);
 if(ids.has(a.id))fail(`Duplicate id: ${a.id}`);ids.add(a.id);
 if(!allowedTypes.has(a.type))fail(`${a.id}: invalid type ${a.type}`);
 if(!allowedStatus.has(a.status))fail(`${a.id}: invalid status ${a.status}`);
 if(production&&a.required&&a.status!=='approved')fail(`${a.id}: required production asset is not approved`);
 if(a.sourceOwner!=='project-original')warn(`${a.id}: sourceOwner requires licence review: ${a.sourceOwner}`);
 if(a.licence!=='project-owned')warn(`${a.id}: licence requires review: ${a.licence}`);
 if(typeof a.asset!=='string'||!a.asset.startsWith('assets/art/'))fail(`${a.id}: asset path must start assets/art/`);
 const base=path.basename(a.asset||'');
 if(!fileRegex.test(base))fail(`${a.id}: invalid filename ${base}`);
 const lower=base.toLowerCase();
 if(base!==lower)fail(`${a.id}: filename must be lowercase: ${base}`);
 if(/[ _]/.test(base))fail(`${a.id}: spaces and underscores are forbidden: ${base}`);
 for(const word of forbidden)if(new RegExp(`(^|-)${word}(-|\\.)`).test(lower))fail(`${a.id}: prohibited term '${word}' in ${base}`);
 if(assetPaths.has(a.asset))fail(`Duplicate asset path: ${a.asset}`);assetPaths.add(a.asset);
 const absolute=path.join(root,a.asset);
 if(!fs.existsSync(absolute)){(strictFiles?fail:warn)(`${a.id}: missing file ${a.asset}`);continue;}
 const stat=fs.statSync(absolute);if(!stat.isFile())fail(`${a.id}: asset is not a file`);
 if(stat.size===0)fail(`${a.id}: asset is empty`);
 const hash=crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
 if(hashes.has(hash))fail(`${a.id}: duplicate binary content with ${hashes.get(hash)}`);else hashes.set(hash,a.id);
 if(base.endsWith('.svg')){
  const svg=fs.readFileSync(absolute,'utf8');
  if(/<script\b/i.test(svg))fail(`${a.id}: SVG contains script`);
  if(/(?:href|xlink:href)\s*=\s*["']https?:/i.test(svg))fail(`${a.id}: SVG contains external URL`);
  if(!/viewBox\s*=/.test(svg))fail(`${a.id}: SVG missing viewBox`);
 }
 if(a.metadata){const meta=path.join(root,a.metadata);if(!fs.existsSync(meta))(strictFiles?fail:warn)(`${a.id}: missing metadata ${a.metadata}`);}
 if(a.dimensions){for(const k of ['width','height','maxWidth','maxHeight'])if(a.dimensions[k]!==undefined&&(!Number.isInteger(a.dimensions[k])||a.dimensions[k]<=0))fail(`${a.id}: invalid dimensions.${k}`);}
}
const mandatoryRoles=['defender','assault','ranged','support'];
for(const role of mandatoryRoles)if(!(manifest.assets||[]).some(a=>a.type==='character'&&a.role===role&&a.required))fail(`Missing required squad role: ${role}`);
for(const faction of ['bug','machine']){
 const standard=(manifest.assets||[]).filter(a=>a.type==='enemy'&&a.faction===faction&&a.variant==='standard').length;
 const elite=(manifest.assets||[]).filter(a=>a.type==='enemy'&&a.faction===faction&&a.variant==='elite').length;
 const boss=(manifest.assets||[]).filter(a=>a.type==='boss'&&a.faction===faction).length;
 if(standard<4)fail(`${faction}: requires at least 4 standard enemies`);if(elite<2)fail(`${faction}: requires at least 2 elite enemies`);if(boss<1)fail(`${faction}: requires at least 1 boss`);
}
function walk(dir){if(!fs.existsSync(dir))return[];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const f of walk(path.join(root,'assets/art'))){const rel=path.relative(root,f).replaceAll('\\','/');if(!assetPaths.has(rel))warn(`Unlisted production asset: ${rel}`);}
finish();
function finish(){for(const x of warnings)console.warn(`WARN ${x}`);for(const x of errors)console.error(`ERROR ${x}`);console.log(`Art validation: ${errors.length} error(s), ${warnings.length} warning(s). Mode: ${production?'production':strictFiles?'strict-files':'manifest'}.`);process.exitCode=errors.length?1:0;}

````
