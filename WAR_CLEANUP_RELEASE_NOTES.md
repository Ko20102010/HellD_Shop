# War cleanup — v0.0.21-war-cleanup

Date: 27 October 2026

## Root cause
The current expedition UI was layered over the obsolete Capybara wave-war panel and the Shop world canvas. `setViewMode('war')` still activated the old panel and moved the Shop camera to the removed battlefield, producing the overlapping background shown in the reported screenshot.

## Removed
- Legacy `#war-game-panel`, wave route, retreat bar and roguelike draft DOM.
- Legacy Capybara wave-combat engine, enemy spawning, retreat, wave rewards and old victory/defeat paths.
- Obsolete War HUD updater, event listeners, runtime perk state and perk save fields.
- Obsolete War camera repositioning and implicit legacy-run launch.

## Fixed
- Current expedition and combat interfaces now use an opaque full-viewport War surface.
- Shop canvas, zoom controls, joystick and building popover are hidden while War is active.
- Returning to Shop restores the Shop UI and hides War surfaces.
- Sample Search and Planet Capture now use one path: loadout → route → event/combat → reward.

## Compatibility
The storage key and current `warRun` schema are unchanged. Old `capybaraRun` saves are not resumed; they are converted to the existing safe migration-notice state.
