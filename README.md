# HELLDIVERS PLEASE! — Super Earth Arsenal, Mindustry Multi-Base & 2D Factorio Tycoon (`v0.0.07`)

An arcade factory-automation, Mindustry multi-base logistics, and 3-layer sequential war-front web game inspired by **Burger Please!**, **Whiteout Survival Playable Ads**, **Factorio**, **Mindustry**, and **CarbotAnimations' Helldivers 2 cartoons** (across **all episodes Ep1–Ep10+**, including [Pro vs Noobs | Helldivers 2 Ep7](http://www.youtube.com/watch?v=bn0GTO_zvAg)), built from the [Modular Game Prompt Library](https://docs.google.com/document/d/1ZoW7Oou5QpTyvwD6vrczKuXv0nW42JgLJC-au62H7Pw/edit?usp=drivesdk&ouid=114024991701964609548).

---

## 🎮 Core Gameplay Features (`v0.0.07` — Mobile-First HUD, Mindustry Multi-Base, Visual Tech Tree & Split Shop/War Front Edition)

1. **Mobile-First Playable Portrait HUD (`100% Phone-Playable — Collapsible ☰ Menu Drawer & Pinch Zoom`)**:
   - On mobile phones (`<= 900px`), the top HUD condenses into a sleek 2-row micro-bar (`<10%` of screen height) while all secondary modal buttons collapse into a toggleable **`☰ 選單 (Menu)`** drawer so **88%+ of the mobile screen is unobstructed 2D Canvas**.
   - Repositioned the Virtual Joystick cleanly above the iOS Safari bottom toolbar, added **2-finger Pinch-to-Zoom**, and auto-scaled the portrait mobile camera zoom (`0.36x`) so the factory and war front are immediately readable on phones.
2. **Split Shop vs. War Front Architecture + 4 Dedicated War-Only Functions (`🏪 工廠 Shop Base` | `⚔️ 戰場 War Front`)**:
   - Switch instantly between **`🏪 工廠 Shop Base`** (Quarry, 7 Production Lanes, and 7 Dedicated Item Counters) and **`⚔️ 戰場 War Front`** (3-Layer Defense Corridor + **`#war-command-dock`**).
   - **4 New War-Only Tactical Functions** bridge your Factory output directly into active War Front combat:
     - **`🪖 +SEAF Squad`**: Consumes `1x 🔫 Gun` from your factory/counter (or `$80`) to deploy an autonomous Carbot SEAF Rifleman on the War Front.
     - **`🚙 +Recon Buggy`**: Consumes `1x 🚙 Vehicle` (or `$180`) to deploy an autonomous HMG Recon Buggy patrolling the active Front Gate.
     - **`🤖 +Patriot Mech`**: Consumes `1x 🤖 Patriot Mech` (or `$320`) to deploy a heavy bipedal Exosuit Walker that fires rockets and miniguns at Bile Titans, Hulks, and Factory Striders.
     - **`💚 Mend Tower (Lv.0–20)`**: Builds Mindustry-style green **Mend Projectors** behind all 3 Gate Layers that continuously heal Gate HP and reload turret ammo.
3. **Mindustry Multi-Base Planetary Sector Network (`🪐 多基地 Bases` — 6 Conquerable Sector Bases)**:
   - Establish and switch between **6 Planetary Sector Bases** (*Sector Alpha-01: Angel's Venture Core*, *Sector Beta-02: Heeth Cryo-Refinery*, *Sector Gamma-03: Tien Kwan Mech Foundry*, *Sector Delta-04: Malevelon Creek Fortress*, *Sector Epsilon-05: Meridia Bio-Core*, and *Sector Zeta-06: Cyberstan Mega-Citadel*).
   - Each base features distinct resource deposit multipliers (`⛏️ Iron`, `🛢️ E-710`, `💵 Sell Value`) and operates a **Mindustry Orbital Launch Pad** that passively beams `$REQ/s`, `🛢️ E-710`, `⛏️ Iron`, and `🧱 Ammo` to your active base!
4. **Mindustry-Style Visual Node Tech Tree (`🌟 Mindustry 科技樹` — 13 Connected Schematic Nodes)**:
   - Interactive 2D schematic canvas starting from **`🏛️ Core: Super Earth Shard`** with parent-to-child conduit pipes branching across **Extraction & Launch Pads**, **Silicon Foundry & Overdrive Dome**, **Plastanium Walls & Mend Projectors**, and **Commander & Allied War Units** (researchable with either `⭐ Medals` or `💵 $REQ`).

---

## 📜 Complete Version History & Changelog (`v0.0.00` – `v0.0.07`)

### `v0.0.07` — Mobile-First Portrait HUD Fix, Mindustry Multi-Base Sector Network, Mindustry Visual Node Tech Tree & Split Shop / War Front Architecture
- **Fixed Mobile Phone Playability (`image.png` Fix)**: Collapsed the 9 rows of wrapping top buttons on mobile screens into a toggleable **`☰ 選單 (Menu)`** drawer, hid verbose stat labels on narrow screens so all key stats fit on a single compact row, raised the Virtual Joystick above the mobile browser bottom bar, and added 2-finger pinch-to-zoom + `0.36x` mobile default zoom.
- **Mindustry Multi-Base System (`🪐 多基地 Bases`)**: Added 6 conquerable/switchable Planetary Sector Bases (`Alpha` through `Zeta`) with per-base deposit multipliers (`⛏️ Iron`, `🛢️ E-710`, `💵 Sell Price`) and background **Orbital Launch Pad** exports (`+$REQ/s`, `+🛢️`, `+⛏️`, `+🧱`).
- **Mindustry Visual Node Tech Tree (`🌟 Mindustry 科技樹`)**: Built an interactive 2D node-and-branch schematic tech tree (`#mindustry-tree-canvas`) rooted at `Core: Super Earth Shard` with 13 connected research nodes across 4 branches.
- **Split Shop vs. War Front Mode Switcher + 4 War-Only Functions**: Added a 1-tap `🏪 工廠 Shop Base` / `⚔️ 戰場 War Front` mode switcher and the **War Command Deployment Dock** (`🪖 +SEAF Squad`, `🚙 +Recon Buggy`, `🤖 +Patriot Mech`, and `💚 Mindustry Mend Tower`).

### `v0.0.06` — All-Episode Carbot Art (`Ep1–Ep10+`), Real-Item-Only Split Belts, 7 Dedicated Item Counters & Smart SEAF AI
- **All-Episode CarbotAnimations Art (`Ep1–Ep10+`)**: Added Scavenger Hunter Bug, Bile Spewer, Bile Titan Boss, Rocket Devastator, Factory Strider Mega-Boss, Eagle-1 500KG Flyover Jet Shadow, and 17 animated units in `🎭 角色 Preview`.
- **Real-Item-Only Split Conveyor Belts**: Removed fake looping belt icons on empty belts and split raw transport into Purple `🛢️ E-710 Belt` (`conv_raw_e710`) and Cyan `⛏️ Super Iron Belt` (`conv_raw_iron`).
- **7 Dedicated Item Sales Counters (`1 Item = 1 Counter`) & Smart SEAF AI**.

### `v0.0.05` — Anti-Crush Fix, 1-Item Start, Wave + Rest System, Broken-Gate Manual Repair Rule, 20-Level Belts/Machines & 20hr+ Campaign
- **Safe Unlock Pads & Obstacle Ejection**, **True 1-Item Start (`🦺 Cloth` Only)**, **Wave + Rest Phase System**, **Broken Gate No-Auto-Heal Rule**, and **20 Upgrade Levels (`Lv.1–20`)**.

### `v0.0.04` — Production Recipes, Harvest Quarry + Scale Expansion, 3-Layer Sequential Gates, Zero-Overlap Map, Commander Loadout & Character Preview
- **Item Production Recipe System (`Input Hopper ➔ Fabricator ➔ Output Pad`)**, **Manual Raw Harvest Area + Auto-Drills**, **3 Sequential Defense Gate Layers**, and **Commander 4-Slot Equipment Loadout**.

### `v0.0.03` — Startup Black-Screen Hotfix & Versioned ZIP Naming
- **Fixed Black Screen / Startup Crash** (`window.SoundEngine` export + `roundRect` polyfill) and added version string to the `.ZIP` filename.

### `v0.0.02` — 2D Factorio + Carbot Vector Overhaul, 3 Gates, Turret Ammo Conveyors & Permanent Skill Tree
- **2D Top-Down Factorio + Carbot Art Engine**, **Direct + Counter Gun Selling**, **Turret Ammo (`🧱`)**, and **Permanent Warbond Skill Tree**.

### `v0.0.01` — CarbotAnimations Bean Characters, Solid Collision & Northern War-Zone Loop
- **Carbot-Style Chubby Characters**, **AABB Solid Obstacles**, and **Northern War-Zone Loop**.

### `v0.0.00` — Initial Prototype Release
- **Initial Helldivers × Burger Please! Tycoon**: 7-tier Super Earth Arsenal progression, SEAF staff automation, mobile virtual joystick, and GitHub Pages packager.
