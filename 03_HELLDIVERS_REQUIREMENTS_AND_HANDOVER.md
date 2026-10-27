# HELLDIVERS PLEASE! Requirements, Inventory and Release Handover

## How to use this handover
Upload these three Markdown files in a future conversation. This file provides the requirements and file inventory. `02_HELLDIVERS_REWORK_SOURCE_BUNDLE.md` contains the complete text of every file present in the v0.0.23-rework overlay.

## Expected complete v0.0.22 repository structure
The baseline `index.html` references the following runtime files:

```text
index.html
css/style.css
js/config.js
js/audio.js
js/shop-upgrades.js
js/war-run.js
js/war-casualties.js
js/war-supplies.js
js/war-supply-ui.js
js/war-events.js
js/war-combat.js
js/war-combat-ui.js
js/war-ui.js
js/world.js
js/game.js
README.md
```

## Files known to have been supplied during the conversation
- `index.html`
- `style.css`
- `config.js`
- `audio.js`
- `game.js`
- `shop-upgrades.js`
- `war-run.js`
- `war-casualties.js`
- `war-supplies.js`
- `war-supply-ui.js`
- `war-events.js`
- `war-combat.js`
- `war-combat-ui.js`
- `war-ui.js`
- `world.js`
- `README.md`
- phase and maintenance release notes

## v0.0.23-rework overlay files
```text
v0.0.23-rework/index.html
v0.0.23-rework/css/rework.css
v0.0.23-rework/js/rework-ui.js
v0.0.23-rework/js/war-combat.js
v0.0.23-rework/js/war-combat-ui.js
v0.0.23-rework/js/world.js
v0.0.23-rework/tests/war-combat.test.js
v0.0.23-rework/tests/package.test.js
v0.0.23-rework/RELEASE_NOTES.md
```

## Installation model
The rework is an **overlay update**. Copy the overlay contents over a complete v0.0.22 installation while preserving the `css/`, `js/` and `tests/` paths.

## Acceptance criteria
### Save launch
- Exactly three save slots are displayed first.
- Populated slots show Continue.
- Empty slots show Start New Game.
- Merely opening the selector does not modify storage.
- No migration or automatic Slot 1 copy occurs.

### Squad
- Deployment requires exactly four valid active characters.
- All four appear in combat.
- No spare slot, reserve team or replacement drop exists.

### Combat
- Standard encounter has at least two enemies.
- Each enemy has independent HP, attack timing and defeat state.
- Defeating one enemy does not end the encounter while another survives.
- Normal attacks and skills are visually distinct.
- HP changes are associated with attack or skill events.
- Victory occurs only after every enemy is defeated.
- Defeat occurs after all four characters are unable to fight.

### Navigation and UI
- Persistent buttons: Home, Squad, Battle, Industry, Menu.
- One primary section is visible at a time.
- No horizontal page scrolling at 320 CSS pixels.
- Controls have visible keyboard focus and practical touch sizes.
- Battle hides unrelated factory interaction controls.

### Removed features
Production UI and executable handlers must not contain live references to:
```text
500KG BOOST
btn-call-stratagem
strat-arrow
GitHub ZIP
btn-open-github
modal-github
JSZip
btn-ingame-dl-full
btn-ingame-dl-update
```

## Tests executed for the packaged rework
- JavaScript syntax checks for each changed JavaScript file: passed.
- Four-character combat enforcement: passed.
- Multi-enemy creation: passed.
- Encounter remains active while another enemy survives: passed.
- Combat reaches victory or defeat: passed.
- Package checks for removed features and new references: passed.
- ZIP integrity: passed.

## Tests not executed
- Real-browser startup and console check.
- Real-browser save-slot interaction.
- Physical-phone portrait and landscape test.
- End-to-end deployment test.
- Full regression against every unchanged v0.0.22 module.

## Package identity
- Package name: `HELLDIVERS-PLEASE-v0.0.23-rework.zip`
- SHA-256 at delivery: `6ea7123b1e98eb6b9ed2fb7465385a1c8cc8a7f0f0990642927fb78c6522e225`

## Version history relevant to the rework
- v0.0.15: deterministic expedition routes.
- v0.0.16: event-driven expedition UI.
- v0.0.17: vertical expedition combat with three formation positions.
- v0.0.18: mission supplies.
- v0.0.19: casualties and progression.
- v0.0.20: sample-based Shop upgrade costs.
- v0.0.21: obsolete War-system cleanup and opaque War surface.
- v0.0.22: War black-screen visibility fix.
- v0.0.23 original update: rejected after review.
- v0.0.23-rework: current overlay target, no save migration.

## Recommended next-session procedure
1. Read `01_HELLDIVERS_PROJECT_CONTEXT.md`.
2. Reconstruct the overlay from `02_HELLDIVERS_REWORK_SOURCE_BUNDLE.md` if the ZIP is unavailable.
3. Obtain or restore a complete v0.0.22 repository before running the full application.
4. Overlay the rework files.
5. Run package and combat tests.
6. Run a local static server and perform real-browser checks.
7. Fix any console, layout, navigation or save-slot defects.
8. Rebuild the ZIP, recompute SHA-256 and report untested areas honestly.

## Artwork implementation controls
- Run `node tools/validate-art-assets.js` during planning.
- Run `node tools/validate-art-assets.js --strict-files` after asset integration.
- Run `node tools/validate-art-assets.js --production` before any artwork-qualified release.
- Follow `ART_IMPLEMENTATION_CHECKLIST.md`; do not label placeholder artwork as final.
