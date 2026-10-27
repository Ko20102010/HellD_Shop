# HELLDIVERS PLEASE! Project Context and Decisions

## Purpose
This file is a durable handover summary for a future Microsoft Copilot conversation. Read this file before changing the application.

## Trusted version policy
- Original trusted baseline: **v0.0.22**, supplied by the user on 27 October 2026.
- Current update target: **v0.0.23-rework**.
- The earlier `v0.0.23-update` package was reviewed and rejected. Do not use it as a baseline.
- Use the newest user-provided complete source or release package as authoritative.
- Never rebuild from screenshots or conversation memory when source exists.

## Application description
A static browser game built with HTML, CSS and JavaScript. It combines an idle factory/industry layer with a War expedition mode. The current hosting model is compatible with static hosting such as GitHub Pages. The application uses browser local storage for three save slots.

## User requirements
1. Battle presentation should resemble a simple character-focused idle RPG.
2. Exactly four active squad characters must appear in battle.
3. There is no reserve or spare team.
4. Encounters may contain more than one enemy.
5. Characters must visibly walk, perform normal attacks and activate skills.
6. Remove player-facing `500KG BOOST`, arrow-sequence and GitHub ZIP/export controls.
7. On application launch, show three save slots before the main game.
8. Do not add save migration. Do not copy or convert save data automatically.
9. Simplify navigation to Home, Squad, Battle, Industry and Menu.
10. Move detailed factory systems under Industry rather than showing everything simultaneously.
11. Use original compact 2D cartoon characters with large equipment, thick outlines and readable silhouettes. Named games and animation works are high-level references only; do not copy their assets or designs.
12. Preserve working v0.0.22 behaviour not directly affected by these requirements.

## Save-data decision
- **No save migration.**
- **No storage-key change.**
- Opening the save selector must not write, copy, convert or delete slots.
- Existing save/load/reset logic remains responsible for each slot.
- A destructive reset must retain its existing confirmation behaviour.

## Critical release gates
A release is blocked if any of the following is confirmed:
- Startup or Battle opens to a black screen.
- Fewer than four active characters can deploy.
- A fifth active or spare character appears.
- Normal battles contain only one enemy.
- Battle ends while another enemy remains alive.
- Opening the app modifies save data.
- Any changed CSS or JavaScript file is not referenced by `index.html`.
- `500KG BOOST`, GitHub ZIP or JSZip remains player-facing.
- Included tests cannot run from their documented path.
- An uncaught exception breaks launch, navigation, save selection or combat.

## Honest verification policy
Always separate:
- automated checks actually executed;
- simulated logic checks;
- real-browser checks;
- physical-device checks;
- deployment checks.
Never claim a check that was not performed.

## Current rework summary
The v0.0.23-rework overlay currently includes:
- four-member deployment validation;
- multi-enemy combat state and independent enemy attacks;
- a simplified canvas battle renderer with compact original bean-style figures;
- normal attack lines, skill rings, hit feedback, HP and energy bars;
- five-button bottom navigation;
- automatic opening of the existing save-slot selector;
- removal of the visible 500KG control and GitHub ZIP packager from `index.html`;
- responsive CSS additions;
- focused combat and package tests.

## Known limitations
- The rework was not tested in a real browser or on a physical phone.
- The delivered rework is an overlay, not a full standalone repository.
- Some unchanged v0.0.22 files were unavailable in the execution workspace at packaging time.
- The visual system is an initial original canvas treatment, not a full sprite-sheet art production pass.

## Rollback
Restore the replaced v0.0.22 files. No migration reversal or save-data rollback is required.

## Artwork production controls added
- Art manifest: `assets/data/art-manifest.json`.
- Validator: `tools/validate-art-assets.js`.
- Validation rules: `ART_ASSET_VALIDATION_RULES.md`.
- Implementation checklist: `ART_IMPLEMENTATION_CHECKLIST.md`.
- Current manifest entries are intentionally `placeholder`; production mode must fail until approved assets exist.
