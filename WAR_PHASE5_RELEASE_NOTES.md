# War Redesign Phase 5 — Casualties and progression

Version: v0.0.19-phase5
Date: 27 October 2026

## Implemented
- Standard Operation: 100% rewards, injuries instead of normal permanent death.
- Helldive Contract: 150% combat-node requisition, explicit permanent-death warning.
- Injured and critical hero records persist in `warProgress`.
- Critical recovery costs $500 and 2 Rare samples; injury recovery costs $180 and 2 Common samples.
- Injured heroes are unavailable for launch and recover naturally after successful expeditions.
- Hardcore deaths remove the hero from roster and lineup and create a fallen-hero record.
- Completed Sample runs update unlocked difficulty; hardcore completions update a separate best difficulty.
- Completing Planet Capture now persists planet ownership and mine level.
- The supply screen displays injured heroes and recovery controls.

## Compatibility
Existing saves through v0.0.18-phase4 remain accepted. New progress fields are optional and default safely.

## Rollback
Redeploy v0.0.18-phase4. It ignores the additional progress fields, but any hero permanently removed during a hardcore run cannot be reconstructed automatically by older code; restore a pre-hardcore save if roster rollback is required.
