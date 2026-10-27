# War Redesign Phase 3 — Vertical expedition combat

Version: v0.0.17-phase3
Date: 27 October 2026

## Implemented
- Replaced Phase 2's five-wave combat bridge with a short vertical expedition battle engine.
- Three formation positions: Front, Middle and Rear, each with distinct combat modifiers.
- Hero health, energy, shields, automatic attacks and manual ultimates.
- Persistent Auto Ultimate setting and 1×/2× battle speed control.
- Normal, elite and boss scaling with 75-second enrage.
- Six elite modifiers: Armoured, Berserk, Regenerating, Explosive, Suppressing and Commanding.
- Two-phase Bile Titan and Factory Strider boss behaviour.
- Responsive portrait and short-landscape combat UI.
- Active combat snapshot persists inside `warRun` and is resumed after reload.

## Compatibility
Existing v0.0.14 through v0.0.16-phase2 saves remain accepted. Storage key remains unchanged.

## Known limitations
The reserve hero reinforcement, explicit pre-battle formation editor and class-specific animation assets are not included in Phase 3. The current formation order follows the first three lineup slots. Physical-device and real-browser verification were not performed.
