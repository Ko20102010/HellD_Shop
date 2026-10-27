# War Redesign Phase 4 — Shop mission supplies

Version: v0.0.18-phase4
Date: 27 October 2026

## Implemented
- Added a pre-launch mission supply screen for Sample Search and Planet Capture.
- Integrated all seven factory product lanes into War.
- Stock is revalidated at launch and consumed atomically, exactly once.
- Failed validation consumes nothing; failed expedition creation refunds consumed stock.
- Selected supplies and calculated effects persist in `warRun`.
- Supply effects apply to every new expedition battle.

## Supply effects
- Cape & Armour: +10% maximum HP.
- Liberator Rifle: +12% attack.
- Munitions Crate: 25 starting energy.
- Jump Pack: +8% damage avoidance.
- Recon Vehicle: -10% enemy attack.
- Patriot Mech: 20% starting shield.
- Super Destroyer: 50 starting energy, superseding the crate's 25 when both are selected.

## Compatibility and rollback
The localStorage key and prior schema remain valid. Older runs without supply fields use neutral defaults. Roll back by redeploying v0.0.17-phase3; optional saved supply fields are ignored.
