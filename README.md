# HELLDIVERS PLEASE! — SES Super Destroyer Warship, 3-Counter Expansion & Capybara Go! Roguelike War Tycoon (`v0.0.09`)

An arcade factory-automation, Mindustry multi-base logistics, and *Capybara Go!* / Tower-Defense Roguelike War-Front web game inspired by **Burger Please!**, **Whiteout Survival Playable Ads**, **Capybara Go!**, **Factorio**, **Mindustry**, and **CarbotAnimations' Helldivers 2 cartoons** (across **all episodes Ep1–Ep10+**, including [Pro vs Noobs | Helldivers 2 Ep7](http://www.youtube.com/watch?v=bn0GTO_zvAg)), built from the [Modular Game Prompt Library](https://docs.google.com/document/d/1ZoW7Oou5QpTyvwD6vrczKuXv0nW42JgLJC-au62H7Pw/edit?usp=drivesdk&ouid=114024991701964609548).

---

## 🎮 Core Gameplay Features (`v0.0.09` — Idle Click-to-Upgrade, 3-Counter Physical Expansion, Mixed Customer Needs, Hellpod Boarding Loop & Capybara Go! Roguelike War Edition)

1. **Hybrid Idle Click-to-Upgrade + Selected Step-to-Pay (`85% Fewer Floor Pads`)**:
   - **Tap/Click Any Building on Canvas to Upgrade (`Lv.1–10`)**: Tap any **Factory Machine**, **3-Counter Bay**, **Quarry Auto-Drill**, **Ammo Press**, **Hellpod Launch Bay**, or **War Gate** directly on the 2D canvas (or use the bottom `#idle-inspector-bar`) to upgrade it immediately—eliminating 85% of floor step pads!
   - **Step-and-Pay Preserved for New Unlocks (`Lv.0 -> Lv.1`)**: Stepping onto a locked `Lv.0` production blueprint (`🔓 STEP OR TAP TO BUILD`) still streams Requisition slips to construct the station, keeping the tactile feel of *Burger Please!* without cluttering the floor.
2. **Max Level `10` + Physical 1-to-3 Counter Expansion (`Lv.1 = 1 Desk ➔ Lv.4 = 2 Desks ➔ Lv.8 = 3 Desks`)**:
   - All stations, drills, belts, and gates now have a tight, impactful **Max Level of `10` (`Lv.1–10`)**.
   - **Physical 3-Counter Expansion Hall**: Upgrading any production lane physically builds new Checkout Counter Desks side-by-side (`x = 500`, `x = 820`, `x = 1140`):
     - **Lv.1–3**: **1 Physical Counter Desk**
     - **Lv.4–7**: **2 Physical Counter Desks** (`2x` parallel customer queues, `2x` checkout speed, `+25%` combo price bonus)
     - **Lv.8–10 (`MAX`)**: **3 Physical Counter Desks** (`3x` parallel queues, `3x` checkout speed, `+50%` combo price bonus)
3. **Rapid Customer Surge + Mixed Multi-Item Orders (`Mixed Loadout Needs & Scaling Quantities`)**:
   - As you unlock more items and expand your counters, customer arrival intervals accelerate down to `0.38s` (up to `46` active Helldivers on deck!).
   - **Mixed Multi-Item Loadouts**: Incoming Helldivers request **2 to 3 different items** in a single order (e.g., `2x 🦺 Cloth + 2x 🔫 Gun + 1x 📦 Crate`) with quantities scaling up to `6x` as your factory grows, moving from counter to counter until their full combat loadout is complete.
4. **Shop-to-Hellpod Boarding Queue, Paid Orbital Drop Toll & War Front Reinforcements**:
   - Once a Helldiver customer finishes buying their mixed loadout at your Counters, they march north to the **4 Orbital Hellpod Launch Tubes (`x = 220, z = -100`)** on the Super Destroyer Bridge!
   - Boarding a Hellpod **pays you an Orbital Drop Deployment Fee (`+$45–$280+`)**, fires a downward orbital launch beam, and **drops that exact geared Helldiver (`🪖 Rifleman`, `🚙 Recon Buggy`, or `🤖 Patriot Mech`) into the War Zone as a live reinforcement**!
5. **Redesigned War Zone: *Capybara Go!* 5-Stage Attack Expeditions + 3-Gate Tower Defense Sieges + Roguelike Perk Drafts & Victory Chests (獎勵)**:
   - **Dual Mission Modes (`⚔️ Attack Op` & `🛡️ Defense Op`)**: Alternate between **5-Stage *Capybara Go!* Forward Attack Expeditions** (marching with your Hellpod-dropped squad to destroy the Enemy Command Fortress) and **3-Gate Tower Defense Sieges**!
   - **3-Card Roguelike Tactical Perk Draft (`#roguelike-draft-bar`)**: Every stage cleared triggers a 3-card Roguelike draft (`⚡ ARC-3 Chain Lightning`, `🦅 Eagle-1 Napalm Carpet`, `🚀 Hellpod Kinetic Slam`, `💉 Viper Lifesteal Stims`, `🔥 Orbital Gatling Overclock`, `🛡️ FX-12 Dome Shield Relay`, `🤖 Emergency Patriot Drop`, `💰 Ministry War Spoils`).
   - **Operation Victory Chest Rewards (`🎁 任務完成豐厚獎勵`)**: Clearing Stage 5/5 awards a massive **Requisition Bounty (`+$550 × Wave`)**, **Permanent Warbond Medals (`+4–15 ⭐`)**, and **Super Uranium Samples (`+1 🧬` = `+15%` permanent all-damage & production multiplier)**!

---

## 📜 Complete Version History & Changelog (`v0.0.00` – `v0.0.09`)

### `v0.0.09` — Idle Click-to-Upgrade, Max Lv.10 + 3-Counter Physical Expansion, Mixed Customer Orders, Hellpod Drop Fee Loop & Capybara Go! Roguelike War Zone
- **Hybrid Idle Click-to-Upgrade + Selected Step-to-Pay**: Removed 85% of floor step pads; players now tap/click any unlocked Machine, 3-Counter Bay, Quarry Rig, Ammo Press, Hellpod Bay, or Gate directly on the 2D canvas (or via `#idle-inspector-bar`) to upgrade, while keeping Step-and-Pay for unlocking `Lv.0` stations.
- **Max Level `10` & Physical 1-to-3 Counter Expansion**: Set `MAX_LEVEL: 10` and widened the Starboard Counter Hall (`maxX: 2700`) so each lane physically expands from **1 Counter Desk (`Lv.1–3`)** to **2 Counter Desks (`Lv.4–7`)** and **3 Counter Desks (`Lv.8–10`)**.
- **Scaling Customer Rush & Mixed Multi-Item Orders**: Customers arrive much faster as production grows and demand **Mixed Loadout Orders** (`2–3` distinct items and higher quantities per customer).
- **Shop-to-Hellpod Boarding & Paid Orbital Drop Loop**: Served Helldiver customers march to the **4 Hellpod Launch Tubes**, pay an **Orbital Drop Fee (`+$45–$280+`)**, and launch into the War Zone as live allied reinforcements.
- ***Capybara Go!* × Tower Defense War Zone Redesign + Victory Rewards (獎勵) + Harder Balance**: Added alternating **5-Stage Attack Expeditions** & **3-Gate Defense Sieges**, **8 stackable Roguelike Perk Cards**, **Operation Victory Chest Rewards (`💵 + ⭐ + 🧬 Super Samples`)**, and significantly tougher enemy wave scaling.

### `v0.0.08` — Startup Freeze Fix, Minimalist 1-Row HUD (90%+ Clutter Hidden), True Split Scene Rendering & SES Super Destroyer Warship Deck
- **Fixed Game Freeze on Open (`LOCATIONS.cashRegisterZone` Fix)**, **Minimalist Single-Row Floating HUD (`< 8%` Screen Footprint)**, **True Split Scene Rendering (`Shop` vs. `War`)**, and ***Helldivers 2* SES Super Destroyer Orbital Warship Background**.

### `v0.0.07` — Mobile-First Portrait HUD Fix, Mindustry Multi-Base Sector Network, Mindustry Visual Node Tech Tree & Split Shop / War Front Architecture
- **Mobile Portrait HUD Drawer & Pinch Zoom**, **Mindustry Multi-Base System (`🪐 多基地 Bases`)**, **Mindustry Visual Node Tech Tree (`🌟 Mindustry 科技樹`)**, and **War Command Deployment Dock**.

### `v0.0.06` — All-Episode Carbot Art (`Ep1–Ep10+`), Real-Item-Only Split Belts, 7 Dedicated Item Counters & Smart SEAF AI
- **All-Episode CarbotAnimations Art (`Ep1–Ep10+`)**, **Real-Item-Only Split Conveyor Belts**, **7 Dedicated Item Sales Counters**, and **Smart SEAF AI**.

### `v0.0.05` — Anti-Crush Fix, 1-Item Start, Wave + Rest System, Broken-Gate Manual Repair Rule, 20-Level Belts/Machines & 20hr+ Campaign
- **Safe Unlock Pads & Obstacle Ejection**, **True 1-Item Start (`🦺 Cloth` Only)**, **Wave + Rest Phase System**, and **Broken Gate No-Auto-Heal Rule**.

### `v0.0.04` — Production Recipes, Harvest Quarry + Scale Expansion, 3-Layer Sequential Gates, Zero-Overlap Map, Commander Loadout & Character Preview
- **Item Production Recipe System**, **Manual Raw Harvest Area + Auto-Drills**, **3 Sequential Defense Gate Layers**, and **Commander 4-Slot Equipment Loadout**.

### `v0.0.03` — Startup Black-Screen Hotfix & Versioned ZIP Naming
- **Fixed Black Screen / Startup Crash** (`window.SoundEngine` export + `roundRect` polyfill) and added version string to the `.ZIP` filename.

### `v0.0.02` — 2D Factorio + Carbot Vector Overhaul, 3 Gates, Turret Ammo Conveyors & Permanent Skill Tree
- **2D Top-Down Factorio + Carbot Art Engine**, **Direct + Counter Gun Selling**, **Turret Ammo (`🧱`)**, and **Permanent Warbond Skill Tree**.

### `v0.0.01` — CarbotAnimations Bean Characters, Solid Collision & Northern War-Zone Loop
- **Carbot-Style Chubby Characters**, **AABB Solid Obstacles**, and **Northern War-Zone Loop**.

### `v0.0.00` — Initial Prototype Release
- **Initial Helldivers × Burger Please! Tycoon**: 7-tier Super Earth Arsenal progression, SEAF staff automation, mobile virtual joystick, and GitHub Pages packager.
