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
