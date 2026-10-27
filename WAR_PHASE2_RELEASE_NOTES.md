# War Redesign Phase 2 — Event-driven expedition UI

Version: v0.0.16-phase2
Date: 27 October 2026

## Implemented
- Full-screen responsive expedition encounter surface.
- Node progress HUD, extraction action and on-demand route map.
- Event choices with resource validation and deterministic results.
- Camp, armoury, merchant and hazard node interactions.
- Three-choice temporary expedition reward draft.
- Save after every encounter state transition.
- Resume of non-combat expedition state after reload.
- Keyboard focus, Escape-to-close map, ARIA live results, 44 px controls and phone/landscape layouts.
- Current battle implementation connected as a temporary Phase 2 combat bridge.

## Known limitation
Phase 2 intentionally reuses the existing five-wave Sample combat whenever a battle, elite or boss node is engaged. Phase 3 replaces this bridge with the new short vertical encounter combat engine. The initial event library contains six deterministic event templates; additional narrative variants remain content work rather than an engine dependency.

## Compatibility
Existing v0.0.14 and v0.0.15-phase1 saves remain supported. Storage key is unchanged.
