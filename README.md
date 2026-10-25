# HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon (`v0.0.04`)

An arcade factory-automation, logistics, and 3-layer sequential base-defense web game inspired by **Burger Please!**, **Whiteout Survival Playable Ads**, **Factorio**, and **CarbotAnimations' Helldivers 2 cartoons** ([Pro vs Noobs | Helldivers 2 Ep7](http://www.youtube.com/watch?v=bn0GTO_zvAg)), built from the [Modular Game Prompt Library](https://docs.google.com/document/d/1ZoW7Oou5QpTyvwD6vrczKuXv0nW42JgLJC-au62H7Pw/edit?usp=drivesdk&ouid=114024991701964609548).

---

## 🎮 Core Gameplay Features (`v0.0.04`)

1. **Full Raw -> Factory Production Recipe Process (`原料配方加工鏈`)**:
   - Every item requires raw materials (`⛏️ Super Iron Ore` and/or `🛢️ E-710 Fuel`) inside its **`📥 INPUT HOPPER`** before the machine can craft output:
     - `🔫 AR-23 Liberator Gun`: `1x ⛏️ Iron` ➔ `1x 🔫 Gun`
     - `🦺 B-01 Tactical Cloth`: `1x 🛢️ E-710` ➔ `1x 🦺 Cloth`
     - `🧱 Munitions Ammo Press`: `1x ⛏️ Iron` ➔ `3x 🧱 Turret Ammo`
     - `📦 E-710 Munitions Crate`: `1x ⛏️ Iron + 1x 🛢️ E-710` ➔ `1x 📦 Crate`
     - `🎒 SH-32 Jump Pack`: `1x ⛏️ Iron + 2x 🛢️ E-710` ➔ `1x 🎒 Jump Pack`
     - `🚙 M-102 Recon Vehicle (車)`: `2x ⛏️ Iron + 1x 🛢️ E-710` ➔ `1x 🚙 Vehicle`
     - `🤖 EXO-45 Patriot Mech (機甲)`: `3x ⛏️ Iron + 2x 🛢️ E-710` ➔ `1x 🤖 Mech`
     - `🚀 SES Super Destroyer (戰艦)`: `4x ⛏️ Iron + 4x 🛢️ E-710` ➔ `1x 🚀 Warship`
2. **Manual Harvest Quarry at Start + Expandable Multi-Rig Auto-Mining Scale (`礦區手動採集 & 自動化擴建`)**:
   - Walk over the **`⛏️ Super Iron Vein`** or **`🛢️ E-710 Geyser Field`** in Sector A at the start to harvest raw materials by hand onto your back-stack.
   - Upgrade **Quarry Scale (`Scale Lv.1 -> Lv.5+`)** to deploy **1 to 5+ physical rotating Auto-Drill Rigs**, hire **⛏️ SEAF Quarry Miners**, or unlock the **⚙️ Factorio Raw Ore Conveyor Belt** to automatically pipe raw materials into all factory Input Hoppers.
3. **Three Sequential Defense Gate Layers (`三層縱深防禦城門: Gate 3 ➔ Gate 2 ➔ Gate 1`)**:
   - Instead of three side-by-side gates, the Northern War Corridor is fortified by **Three Concentric Defense Layers**:
     - **Layer 3 — Outer Gate 3 (`z = -1320`)**: First line of defense with Dual Forward Sentries, an Ammo/Repair Pad, and a Defense Fortification Upgrade Pad. Enemies **must break Outer Gate 3 first** before advancing south!
     - **Layer 2 — Middle Gate 2 (`z = -840`)**: Second line of defense with Dual Heavy Autocannons. Holds the line if Gate 3 is breached (and you can still walk up to Gate 3's pad to **rebuild** it!).
     - **Layer 1 — Inner Gate 1 (`z = -360`)**: Final core wall protecting the Factory Floor with Dual Railcannon Sentries. Only if **Inner Gate 1 reaches `0 HP`** is the sector overrun (resetting the current run while preserving all **⭐ Forever Medals**, **🛡️ Commander Loadout Gear**, and **🌟 Permanent Skill Tree** upgrades).
4. **Expanded `4200 × 3800` Zero-Overlap 2D Factorio Map**:
   - Over **3.3x larger area** with separated sectors (`Northern 3-Layer War Corridor`, `Sector A: Raw Quarry & Drills`, `Sector B: Central Arsenal Assembly Lines`, `Sector C: Quartermaster Sales Counter & Cash Vault`, and `Sector D: Heavy Vehicle, Mech & Destroyer Hangar`) and zero overlapping boxes or labels.
5. **Main Character (`主角色`) 4-Slot Equipment & Loadout System (`🛡️ 裝備 Loadout`)**:
   - Unlock and equip **Primary Weapons** (`AR-23 Liberator`, `SG-225 Breaker 3-Pellet Shotgun`, `LAS-99 Quasar Explosive Cannon`), **Tactical Armors** (`DP-40 Hero`, `SC-30 Trailblazer Scout`, `FS-05 Devastator Heavy Plate`), **Backpacks** (`B-1 Supply Pack`, orbiting **`🛸 AX/LAS-5 Guard Dog Laser Drone`**), and **Combat Mounts** (visibly drive the **`🚙 M-102 Recon Vehicle`** or pilot the **`🤖 EXO-45 Patriot Mech`** on the map!).
6. **Live 12-Character Preview Gallery (`🎭 角色 Preview` / 全角色動態預覽圖鑑)**:
   - Inspect all 12 animated Carbot-style characters, SEAF staff, VIP buyers, Automaton & Terminid enemies, Vehicles, Mechs, and Turrets at 60FPS.

---

## 📜 Complete Version History & Changelog (`v0.0.00` – `v0.0.04`)

### `v0.0.04` — Production Recipes, Harvest Quarry + Scale Expansion, 3-Layer Sequential Gates, Zero-Overlap `4200×3800` Map, Commander Loadout & 12-Character Preview
- **Item Production Recipe System (`Input Hopper ➔ Fabricator ➔ Output Pad`)**: Every factory station and the Munitions Press now consumes raw `⛏️ Iron` and/or `🛢️ E-710` from its Input Hopper to craft items.
- **Manual Raw Harvest Area + Expandable Auto-Quarry Scale**: Added manual harvest vein circles (`⛏️ Iron Vein` & `🛢️ E-710 Field`) for early-game hand harvesting, expandable multi-rig Auto-Drills (`Scale Lv.1–5+` rendering up to 5 drill rigs per bay), and hireable **⛏️ SEAF Quarry Miners**.
- **3 Sequential Defense Gate Layers (`Gate 3 Outer ➔ Gate 2 Middle ➔ Gate 1 Inner`)**: Redesigned the Northern War Zone into 3 concentric horizontal defense walls (`z = -1320`, `z = -840`, `z = -360`). Enemies must break Outer Gate 3 first, then Middle Gate 2, and finally Inner Gate 1 (`0 HP` on Gate 1 = Lose). Each layer has Dual Sentry Turrets, a Repair/Rebuild & Ammo Pad, and a Defense Fortification Upgrade Pad.
- **Expanded `4200 × 3800` Zero-Overlap Map**: Eliminated all overlap between Sector C (Quartermaster Counter & Cash Vault) and Sector D (Heavy Hangar) with wide logistics corridors and wider zoom range (`0.28x`–`1.35x`).
- **Main Character (`主角色`) 4-Slot Equipment Loadout (`🛡️ 裝備 Loadout`)**: Added equippable Weapons, Armors, an orbiting `🛸 Guard Dog` laser drone, and rideable `🚙 Recon Vehicle` / `🤖 Patriot Mech` mounts.
- **Live 12-Character Preview Gallery (`🎭 角色 Preview`)**: Added `#modal-characters` showcasing all 12 Carbot characters, SEAF roles, enemies, vehicles, and mechs.

### `v0.0.03` — Startup Black-Screen Hotfix & Versioned ZIP Naming
- **Fixed Black Screen / Startup Crash**: Exported `window.SoundEngine = ProceduralAudioEngine` in `js/audio.js` with full method aliases (`playCash`, `playPickup`, `playUnlock`, `playLaser`, `playStratagem`, `toggle`), added a `CanvasRenderingContext2D.prototype.roundRect` polyfill in `js/world.js`, and rendered the first frame synchronously on boot.
- **Versioned `.ZIP` Filename**: Included the version string in both the downloadable repository archive (`helldivers_please_v0.0.03_github_repo.zip`) and in-game JSZip packager.

### `v0.0.02` — 2D Factorio + Carbot Vector Overhaul, 3 Gates, Turret Ammo Conveyors & Permanent Skill Tree
- **2D Top-Down Factorio + Carbot Art Engine**: Switched to crisp high-DPI 2D vector rendering with animated Factorio conveyor belts, rotating drill rigs, and waddling Carbot bean characters.
- **Direct + Counter Gun Selling**: Allowed selling `🔫 Guns` and `🦺 Cloth` both via the Quartermaster Counter and directly from the player's hands to queued Helldivers.
- **Turret Ammo (`🧱`) & Conveyor Automation**: Added the Munitions Ammo Press (`🧱`), manual ammo hauling (`搬`), **🧱 SEAF Ammo Haulers**, and unlockable Factorio Conveyor Belts.
- **Permanent Warbond Skill Tree (`🌟 Forever Skills`)**: Added 6 permanent Warbond skills purchased with `⭐ Forever Medals` that persist even after gate defeat.

### `v0.0.01` — CarbotAnimations Bean Characters, Solid Collision & Northern War-Zone Loop
- **Carbot-Style Chubby Characters**: Redesigned characters after CarbotAnimations' *Helldivers 2* episodes with winged helmets, glossy visors, and flowing capes.
- **Starter Economy & Solid Obstacles**: Unlocked `🦺 Cloth` and `🔫 Gun` at start with initial cash and AABB collision on walls, tables, and machines.
- **Northern War-Zone Loop**: Added outer snowfield/ash plowing, Cryo-Frozen Helldiver rescue braziers, and auto-combat against Automatons.

### `v0.0.00` — Initial Prototype Release
- **Initial Helldivers × Burger Please! Tycoon**: 7-tier Super Earth Arsenal progression (`🦺 Cloth`, `🔫 Gun`, `📦 Crate`, `🎒 Equipment`, `🚙 Vehicle`, `🤖 Mech`, `🚀 Super Destroyer`), SEAF staff automation, mobile virtual joystick, and GitHub Pages packager.
