# War Redesign Phase 1 Foundation

Version: v0.0.15-phase1
Date: 27 October 2026

## Implemented
- Added deterministic seeded expedition route engine in `js/war-run.js`.
- Added 12-node Sample Search and 20-node Planet Capture route definitions.
- Added route rules: battle first, boss last, guaranteed camp, no consecutive camps, no early elites, and faction event for capture routes.
- Added `warProgress` migration defaults and validation.
- Added active `warRun` save/load persistence without changing the existing localStorage key.
- Added safe disposal of malformed or legacy incompatible active War state.
- Added Node.js tests covering 200 generated routes, repeatability and migration clamping.

## Compatibility
- Existing v0.0.14 Shop, roster, planet and sample data remain compatible.
- Existing localStorage key is unchanged.
- The current wave battle remains operational during Phase 1; later phases will switch UI and combat to expedition nodes.

## Rollback
Redeploy the previous v0.0.14 package. The extra `warProgress` and `warRun` save fields are optional and ignored by the old code.
