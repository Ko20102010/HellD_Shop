# Phase 6 — Shop sample-based upgrades

Version: v0.0.20-phase6
Date: 27 October 2026

## Implemented
- Production stations now progress to Level 20.
- Levels 1–3 use requisition only.
- Levels 4–10 require Common Samples.
- Levels 11–15 require Rare Samples.
- Levels 16–20 require Super Rare Samples.
- Conveyor and Commander upgrades retain Level 10 caps and begin requiring Common Samples from Level 4.
- Added shared atomic multi-currency upgrade transactions and rollback.
- Added resource wallet, category filters, affordability filters, tier labels, 20-segment progress bars, cost tokens, current/next effects and ARIA live purchase messages.
- Updated the quick Shop inspector to honour sample costs and the new Level 20 station cap.
- Existing station levels migrate unchanged and are now clamped to 20 instead of 10.

## Cost schedule
- Common: Levels 4–10 cost 2, 3, 5, 7, 10, 14 and 20.
- Rare: Levels 11–15 cost 8, 10, 12, 15 and 18.
- Super Rare: Levels 16–20 cost 2, 3, 4, 6 and 8.

## Compatibility
The storage key is unchanged. Existing Level 1–10 saves require no destructive migration. Older builds may clamp Level 11–20 stations back to Level 10, so rollback should use a pre-Phase-6 save if advanced research has already been purchased.
