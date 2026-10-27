# Phone UI maintenance release

Date: 27 October 2026
Baseline: HELLDIVERS PLEASE! v0.0.14

## Changed
- `index.html`: browser zoom restored in viewport metadata.
- `css/style.css`: compact phone HUD, two-column drawer, 44 px touch targets, narrow modal layouts, bottom-sheet battle decisions, orientation tuning, focus states and reduced-motion handling.
- `README.md`: release notes added.

## Compatibility
- No save-data schema change.
- No JavaScript API change.
- Existing v0.0.14 localStorage keys remain unchanged.

## Rollback
Restore `index.html`, `style.css`, and `README.md` from the pre-change backup or redeploy the previous package.
