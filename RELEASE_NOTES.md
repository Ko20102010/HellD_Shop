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

## Battle crash hotfix
- Replaced `CanvasRenderingContext2D.roundRect()` with a path-based rounded rectangle helper for older mobile browsers.
- Rewrote ambiguous compact conditional alpha expressions.
- Added missing-canvas and missing-context guards.
- Added a controlled battle-render error state instead of allowing an uncaught animation-loop crash.
- Added a compatibility test using a Canvas mock without `roundRect()`.
