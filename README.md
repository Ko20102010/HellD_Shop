# HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon (`v0.0.05`)

An arcade factory-automation, logistics, and 3-layer sequential base-defense web game inspired by **Burger Please!**, **Whiteout Survival Playable Ads**, **Factorio**, and **CarbotAnimations' Helldivers 2 cartoons** ([Pro vs Noobs | Helldivers 2 Ep7](http://www.youtube.com/watch?v=bn0GTO_zvAg)), built from the [Modular Game Prompt Library](https://docs.google.com/document/d/1ZoW7Oou5QpTyvwD6vrczKuXv0nW42JgLJC-au62H7Pw/edit?usp=drivesdk&ouid=114024991701964609548).

---

## 🎮 Core Gameplay Features (`v0.0.05` — 20+ Hour Campaign Edition)

1. **True 1-Item Start & Step-by-Step Unlock Progression**:
   - You start with **ONLY `🦺 B-01 Tactical Cloth` (`Lv.1`) unlocked** and **manual raw harvesting** in Sector A (`🛢️ E-710 Field` & `⛏️ Iron Vein`).
   - All other 6 production lines (`🔫 Gun`, `📦 Crate`, `🎒 Jump Pack`, `🚙 Vehicle`, `🤖 Mech`, `🚀 Super Destroyer`), the `🧱 Munitions Press`, both `Auto-Mining Drills`, and all 5 `Factorio Conveyor Belts` start at **`Lv.0 (LOCKED)`** and must be unlocked and upgraded!
2. **20 Upgrade Levels (`Lv.1 ➔ Lv.20`) Across Every Belt, Machine, Quarry, Gate & Skill**:
   - Every **Conveyor Belt** starts at `Lv.0` (off) and upgrades from **`Lv.1` to `Lv.20`**, scaling belt speed and batch transfer size.
   - Every **Production Machine & Ammo Press** upgrades from **`Lv.1` to `Lv.20`**, increasing crafting speed (`+15%/lvl`), output buffer (`+2/lvl`), and product sell price (`+12%/lvl`).
   - Both **Quarry Auto-Drills**, all **3 Gate Layers**, all **8 SEAF/Commander Upgrades**, and all **6 Permanent Warbond Skills** scale from **`Lv.1` to `Lv.20`**.
3. **Anti-Crush Safe Unlock Pads & Obstacle Ejection**:
   - Unlock/Upgrade pads (`unlockPos`) are positioned `145px` south of each machine footprint so unlocking a new station never spawns a solid desk/machine on top of your character, backed by an automatic `ejectEntityFromObstacles()` safety check.
4. **Wave & Rest Phase System (`🌊 Wave Siege + ⏳ Rest & Repair Time`)**:
   - Enjoy a **45-second Preparation Phase** before Wave 1 and a **35-second Rest & Repair Time** between every wave (with an optional **`⚔️ Next Wave`** button to call waves early for a `+25% $REQ` bonus).
   - Every 5th wave (`Wave 5, 10, 15...`) is a **💀 Boss Siege Wave**.
5. **Strict Broken-Gate Manual Repair Rule (`破門無自動回血，必須手動修復`)**:
   - Enemies attack **Outer Gate 3 (`z = -1320`) ➔ Middle Gate 2 (`z = -840`) ➔ Inner Core Gate 1 (`z = -360`)** in sequence.
   - When a Gate Layer reaches `0 HP`, it enters the **BROKEN (`broken = true`)** state: **all automatic HP recovery is disabled** until you (or a hired SEAF Gate Engineer) stand on that Gate's **`🔧 MANUAL REBUILD PAD`** to repair it!
6. **20+ Hour Endgame Meta-Progression (`🏆 8-Planet Galactic Campaign, 20 Milestones, Prestige Ascension & Live Mini-Map Radar`)**:
   - Battle across **8 Planetary Sectors (`Waves 1–200+`)**, complete **20 Command Milestones** for free `⭐ Forever Medals`, perform **Galactic Prestige Ascensions** (`Wave 10+`) for permanent compounding `x2.0` income multipliers, and navigate the `4200 × 3800` base with the **Live Tactical Mini-Map Radar** and 1-tap camera teleport buttons (`⛏️ 礦區`, `⚙️ 工廠`, `💵 櫃檯`, `🛡️ 城門`).

---

## 📜 Complete Version History & Changelog (`v0.0.00` – `v0.0.05`)

### `v0.0.05` — Anti-Crush Fix, 1-Item Start, Wave + Rest System, Broken-Gate Manual Repair Rule, 20-Level Belts/Machines & 20hr+ Campaign
- **Fixed Machine Unlock Crushing Character**: Moved all machine `unlockPos` pads `145px` south of `stationPos` and added `ejectEntityFromObstacles()` in `js/game.js` so unlocking a machine never traps the player inside its collision box.
- **True 1-Item Start (`🦺 Cloth` Only)**: Locked `🔫 Gun`, `🧱 Ammo Press`, `⛏️ Auto Iron Drill`, `🛢️ Auto E-710 Pump`, and all 5 `Conveyor Belts` at `Lv.0` on a fresh save (`helldivers_please_save_v0005`) so early progression starts with manual harvesting and Cloth weaving.
- **Wave + Rest Phase System**: Added structured waves (`Wave 1` to `Wave 200+`) separated by `35s` peaceful Rest & Repair phases and an early-wave call button (`⚔️ Next Wave`).
- **Broken Gate No-Auto-Heal Rule**: Gates at `0 HP` (`broken = true`) receive zero automatic HP regen from skills, belts, or stratagems until manually repaired on their pad.
- **20 Upgrade Levels (`Lv.1–20`) on Everything**: All 5 Conveyor Belts, 7 Production Stations, Munitions Press, 2 Quarry Extractors, 3 Gate Layers, 8 Staff Upgrades, and 6 Forever Skills now support 20 upgrade levels.
- **20+ Hour Endgame Loop**: Added the **8-Planet Galactic Campaign**, **20 Command Milestones**, **Galactic Prestige Ascension (`x2.0` compounding multiplier)**, **Live Tactical Mini-Map Radar**, and **Quick Teleport Camera Buttons**.

### `v0.0.04` — Production Recipes, Harvest Quarry + Scale Expansion, 3-Layer Sequential Gates, Zero-Overlap `4200×3800` Map, Commander Loadout & 12-Character Preview
- **Item Production Recipe System (`Input Hopper ➔ Fabricator ➔ Output Pad`)**: Every factory station and the Munitions Press consumes raw `⛏️ Iron` and/or `🛢️ E-710` from its Input Hopper to craft items.
- **Manual Raw Harvest Area + Expandable Auto-Quarry Scale**: Added manual harvest vein circles (`⛏️ Iron Vein` & `🛢️ E-710 Field`), expandable multi-rig Auto-Drills, and hireable **⛏️ SEAF Quarry Miners**.
- **3 Sequential Defense Gate Layers (`Gate 3 Outer ➔ Gate 2 Middle ➔ Gate 1 Inner`)**: Redesigned the Northern War Zone into 3 concentric horizontal defense walls (`z = -1320`, `z = -840`, `z = -360`).
- **Expanded `4200 × 3800` Zero-Overlap Map**: Eliminated overlap between Sector C and Sector D.
- **Main Character (`主角色`) 4-Slot Equipment Loadout (`🛡️ 裝備 Loadout`) & 12-Character Preview (`🎭 角色 Preview`)**.

### `v0.0.03` — Startup Black-Screen Hotfix & Versioned ZIP Naming
- **Fixed Black Screen / Startup Crash**: Exported `window.SoundEngine = ProceduralAudioEngine` in `js/audio.js` with full method aliases and added a `roundRect` polyfill.
- **Versioned `.ZIP` Filename**: Included the version string in the downloadable repository archive.

### `v0.0.02` — 2D Factorio + Carbot Vector Overhaul, 3 Gates, Turret Ammo Conveyors & Permanent Skill Tree
- **2D Top-Down Factorio + Carbot Art Engine**: Switched to high-DPI 2D vector rendering with animated Factorio conveyor belts and Carbot bean characters.
- **Direct + Counter Gun Selling**, **Turret Ammo (`🧱`)**, and **Permanent Warbond Skill Tree (`🌟 Forever Skills`)**.

### `v0.0.01` — CarbotAnimations Bean Characters, Solid Collision & Northern War-Zone Loop
- **Carbot-Style Chubby Characters**, **AABB Solid Obstacles**, and **Northern War-Zone Loop**.

### `v0.0.00` — Initial Prototype Release
- **Initial Helldivers × Burger Please! Tycoon**: 7-tier Super Earth Arsenal progression, SEAF staff automation, mobile virtual joystick, and GitHub Pages packager.
