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
