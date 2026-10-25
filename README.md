# HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon (`v0.0.06`)

An arcade factory-automation, logistics, and 3-layer sequential base-defense web game inspired by **Burger Please!**, **Whiteout Survival Playable Ads**, **Factorio**, and **CarbotAnimations' Helldivers 2 cartoons** (across **all episodes Ep1–Ep10+**, including [Pro vs Noobs | Helldivers 2 Ep7](http://www.youtube.com/watch?v=bn0GTO_zvAg)), built from the [Modular Game Prompt Library](https://docs.google.com/document/d/1ZoW7Oou5QpTyvwD6vrczKuXv0nW42JgLJC-au62H7Pw/edit?usp=drivesdk&ouid=114024991701964609548).

---

## 🎮 Core Gameplay Features (`v0.0.06` — All-Episode Carbot, Real-Packet Split Belts, 7 Dedicated Counters & Smart SEAF AI Edition)

1. **All-Episode CarbotAnimations *Helldivers 2* Roster (`Ep1–Ep10+` — 16 Animated Units)**:
   - Expanded enemy and character artwork across the entire Carbot *Helldivers 2* series:
     - **Terminids (Bugs)**: **Scavenger / Leaping Hunter Bug** (`Ep1/Ep2` with fluttering wings, derpy eyes & wagging pink tongue), **Armored Charger** (`Ep1/Ep3`), **Bile Spewer** (`Ep2/Ep5` with pulsating neon-green bloated acid sac), and **Bile Titan Boss** (`Ep1/Ep4` on 4 towering stilted spider legs).
     - **Automatons (Bots)**: **Skull Trooper Bot** (`Ep3/Ep7`), **Rocket Devastator** (`Ep3/Ep6 Malevelon Creek` with dual 6-tube shoulder rocket pods), **Flame-Saw Hulk Boss** (`Ep3/Ep7`), and **Factory Strider Mega-Boss** (`Ep8/Ep9` 4-legged "AT-AT Mechanical Dog" walker with dorsal cannon & chin gatlings).
     - **Super Earth Visual Gags**: **Eagle-1 500KG Fighter Jet Flyover Shadow** & red stratagem beacon beam when calling `🦅 500KG BOOST`, panic sweat drops (`💧`) on low-HP Gates, and all **16 animated units** in the **`🎭 角色 Preview`** modal.
2. **Real-Item-Only Conveyor Belt Rendering (`Zero Fake Items on Empty Belts!`)**:
   - Belts no longer display fake looping icons when a source machine is empty (`stock === 0`).
   - Instead, belts render animated directional chevron rollers (`>>>`) when unlocked, and **ONLY display physical item packets (`state.beltPackets`) when real items are actively in transit** from a non-empty source to a non-full destination!
3. **Split Raw Material Conveyor Belts (`Never Mix Different Raw Materials on One Belt`)**:
   - **`🛢️ E-710 Fuel Belt` (`conv_raw_e710`, Purple `#a855f7`, Lv.0–20)**: Connects **ONLY the `🛢️ E-710 Auto-Pump`** along a dedicated purple pipeline (`x = -960`) to the E-710 input hoppers of stations that require `🛢️ E-710` (`🦺 Cloth`, `📦 Crate`, `🎒 Jump Pack`, `🚙 Vehicle`, `🤖 Mech`, `🚀 Warship`).
   - **`⛏️ Super Iron Belt` (`conv_raw_iron`, Cyan `#38bdf8`, Lv.0–20)**: Connects **ONLY the `⛏️ Super Iron Auto-Drill`** along a separate parallel cyan pipeline (`x = -910`) to the Iron input hoppers of stations that require `⛏️ Iron` (`🔫 Gun`, `🧱 Ammo Press`, `📦 Crate`, `🎒 Jump Pack`, `🚙 Vehicle`, `🤖 Mech`, `🚀 Warship`).
4. **One Item = One Dedicated Sales Counter (`7 Horizontal Assembly-to-Retail Lanes`)**:
   - Every product has its **own dedicated Sales Counter (`Counter #1` through `Counter #7`)**, its own **Drop Pad**, its own **`$REQ` Cash Stack**, its own **Customer Queue Line**, and its own **straight horizontal Output-to-Counter Belt**:
     - **Counter #1 (`z = 120`)**: `🦺 B-01 Tactical Cloth`
     - **Counter #2 (`z = 390`)**: `🔫 AR-23 Liberator Gun`
     - **Counter #3 (`z = 660`)**: `📦 Munitions Crate`
     - **Counter #4 (`z = 930`)**: `🎒 SH-32 Jump Pack`
     - **Counter #5 (`z = 1200`)**: `🚙 M-102 Recon Vehicle`
     - **Counter #6 (`z = 1470`)**: `🤖 EXO-45 Patriot Mech`
     - **Counter #7 (`z = 1740`)**: `🚀 SES Super Destroyer`
5. **Smart SEAF Staff AI (`Unique Task Reservation + Belt-Aware Role Switching`)**:
   - **⛏️ SEAF Quarry Miners**: Spread across distinct needy hoppers (`reservedHoppers`); if a Raw Belt (`conv_raw_e710` or `conv_raw_iron`) is already automated (`Lv.1+`), Miners automatically switch to **Hand-Mining directly from the Manual Vein** to supply bonus raw ore instead of duplicating the belt!
   - **🪖 SEAF Logistics Troopers**: Haul finished products to their Dedicated Counters when `conv_counter_auto` is `Lv.0`. Once `conv_counter_auto` is automated (`Lv.1+`), Logistics Troopers automatically switch to **Cashier & Floor Cash Collector Patrol** — patrolling Counters `#1–#7` to auto-collect `$REQ` cash stacks directly into your wallet!
   - **🧱 SEAF Gate Engineers**: Prioritize **1) Manually repairing any Broken (`0 HP`) or Damaged Gate Layer (`Gate 3 ➔ Gate 2 ➔ Gate 1`)**, then **2) Hauling `🧱 Ammo` to Gate Layers whose Ammo Belt is `Lv.0`**, then **3) Assisting at the Munitions Ammo Press (`+1 ⛏️ Iron` feed)**!

---

## 📜 Complete Version History & Changelog (`v0.0.00` – `v0.0.06`)

### `v0.0.06` — All-Episode Carbot Art (`Ep1–Ep10+`), Real-Item-Only Split Belts, 7 Dedicated Item Counters & Smart SEAF AI
- **All-Episode CarbotAnimations Art (`Ep1–Ep10+`)**: Added 4 new iconic enemies across Terminid & Automaton episodes (**Scavenger Hunter Bug**, **Bile Spewer**, **Bile Titan Boss**, and **Factory Strider Mega-Boss**), **Eagle-1 500KG Flyover Jet Shadow**, low-HP gate sweat drops (`💧`), and expanded the **`🎭 角色 Preview`** showcase to **16 animated units**.
- **Fixed Conveyor Belt Visual Confusion (Real-Item-Only Packets)**: Removed fake looping belt icons when a machine has `0` stock; belts now only draw `state.beltPackets` when real items are actively moving from source to destination.
- **Split Raw Material Conveyor Belts (`conv_raw_e710` & `conv_raw_iron`)**: Separated raw material transport into a dedicated **Purple E-710 Fuel Belt (`x = -960`)** and a dedicated **Cyan Super Iron Belt (`x = -910`)** so different raw materials never mix on the same belt.
- **7 Dedicated Item Sales Counters (`1 Item = 1 Counter`)**: Redesigned Sector B & Sector C into 7 parallel horizontal lanes (`z = 120` to `z = 1740`), giving every item its own Dedicated Counter (`Counter #1`–`#7`), dedicated customer queue, and per-counter `$REQ` cash stack.
- **Smart SEAF Staff AI**: Added unique task reservation (preventing workers from clumping on the same task) and belt-aware role switching (Miners switch to manual vein mining when raw belts are active; Logistics switch to Cashier & Cash Collector patrol when counter belts are active; Engineers prioritize broken/damaged gate repair).

### `v0.0.05` — Anti-Crush Fix, 1-Item Start, Wave + Rest System, Broken-Gate Manual Repair Rule, 20-Level Belts/Machines & 20hr+ Campaign
- **Fixed Machine Unlock Crushing Character**: Moved all machine `unlockPos` pads south of `stationPos` and added `ejectEntityFromObstacles()` in `js/game.js`.
- **True 1-Item Start (`🦺 Cloth` Only)**: Locked `🔫 Gun`, `🧱 Ammo Press`, `⛏️ Auto Iron Drill`, `🛢️ Auto E-710 Pump`, and all `Conveyor Belts` at `Lv.0` on a fresh save.
- **Wave + Rest Phase System**: Added structured waves (`Wave 1` to `Wave 200+`) separated by `35s` peaceful Rest & Repair phases and an early-wave call button (`⚔️ Next Wave`).
- **Broken Gate No-Auto-Heal Rule**: Gates at `0 HP` (`broken = true`) receive zero automatic HP regen until manually repaired on their pad.
- **20 Upgrade Levels (`Lv.1–20`) on Everything** and **20+ Hour Endgame Loop** (8 Planets, 20 Milestones, Galactic Prestige Ascension & Live Mini-Map Radar).

### `v0.0.04` — Production Recipes, Harvest Quarry + Scale Expansion, 3-Layer Sequential Gates, Zero-Overlap Map, Commander Loadout & 12-Character Preview
- **Item Production Recipe System (`Input Hopper ➔ Fabricator ➔ Output Pad`)**, **Manual Raw Harvest Area + Expandable Auto-Quarry Scale**, **3 Sequential Defense Gate Layers (`Gate 3 Outer ➔ Gate 2 Middle ➔ Gate 1 Inner`)**, and **Main Character 4-Slot Equipment Loadout (`🛡️ 裝備 Loadout`)**.

### `v0.0.03` — Startup Black-Screen Hotfix & Versioned ZIP Naming
- **Fixed Black Screen / Startup Crash** (`window.SoundEngine` export + `roundRect` polyfill) and added version string to the `.ZIP` filename.

### `v0.0.02` — 2D Factorio + Carbot Vector Overhaul, 3 Gates, Turret Ammo Conveyors & Permanent Skill Tree
- **2D Top-Down Factorio + Carbot Art Engine**, **Direct + Counter Gun Selling**, **Turret Ammo (`🧱`)**, and **Permanent Warbond Skill Tree (`🌟 Forever Skills`)**.

### `v0.0.01` — CarbotAnimations Bean Characters, Solid Collision & Northern War-Zone Loop
- **Carbot-Style Chubby Characters**, **AABB Solid Obstacles**, and **Northern War-Zone Loop**.

### `v0.0.00` — Initial Prototype Release
- **Initial Helldivers × Burger Please! Tycoon**: 7-tier Super Earth Arsenal progression, SEAF staff automation, mobile virtual joystick, and GitHub Pages packager.
