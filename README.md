# HELLDIVERS PLEASE! — SES Super Destroyer Warship, Mindustry Multi-Base & 2D Factorio Tycoon (`v0.0.08`)

An arcade factory-automation, Mindustry multi-base logistics, and 3-layer sequential war-front web game inspired by **Burger Please!**, **Whiteout Survival Playable Ads**, **Factorio**, **Mindustry**, and **CarbotAnimations' Helldivers 2 cartoons** (across **all episodes Ep1–Ep10+**, including [Pro vs Noobs | Helldivers 2 Ep7](http://www.youtube.com/watch?v=bn0GTO_zvAg)), built from the [Modular Game Prompt Library](https://docs.google.com/document/d/1ZoW7Oou5QpTyvwD6vrczKuXv0nW42JgLJC-au62H7Pw/edit?usp=drivesdk&ouid=114024991701964609548).

---

## 🎮 Core Gameplay Features (`v0.0.08` — Minimalist 1-Row HUD, True Split Scenes, SES Super Destroyer Warship Deck & Freeze Fix Edition)

1. **Instant Playability & 60FPS Loop Protection (`Fixed Freeze on Open`)**:
   - Fixed the frame-1 `LOCATIONS.cashRegisterZone` undefined reference that halted the `requestAnimationFrame` loop on load in `v0.0.07`, and wrapped the 60FPS update/render loop in defensive error guards so gameplay never freezes.
2. **Ultra-Clean Minimalist 1-Row Top Pill Bar (`< 8%` Screen Footprint — 90%+ of UI Hidden by Default)**:
   - **Single Top Pill Bar**: Displays only the essentials during active gameplay: **`💵 $Cash`**, **`⭐ Medals`**, **`🎒 Carry`**, **`🏪 工廠 Shop Base`** | **`⚔️ 戰場 War Front`**, and **`☰ 選單`**.
   - **Unified Command Center Drawer (`☰ 選單`)**: Over 90% of secondary stats, wave/gate status pills, quick teleports, inventory badges, and modal buttons (`🪐 多基地 Bases`, `🌟 Mindustry 科技樹`, `🪖 SEAF & Upgrades`, `🛡️ 裝備 Loadout`, `🎭 角色 Preview`, `🦅 500KG`, `📦 GitHub ZIP`, `💾 Save`) stay tucked inside the collapsible drawer until tapped.
   - **Proximity-Aware World Labels**: Floor pads on the 2D canvas show only a clean 1-line icon + cost/stock badge from afar, revealing their detailed 2nd-line recipe/subtitle only when your Commander stands within `250px`.
3. **True Split Scene Rendering (`🏪 Shop Base` vs. `⚔️ War Front` — Zero Visual Bleed)**:
   - When **`🏪 工廠 Shop Base`** is active, the canvas renders **ONLY the SES Super Destroyer Orbital Warship Deck**—the Planetary War Zone and 3 Gate Layers are completely separated and never visible above the shop.
   - When **`⚔️ 戰場 War Front`** is active, the canvas renders **ONLY the Planetary 3-Layer Defense Corridor** (Gates 3/2/1, Dual Sentries, Mindustry Mend Projectors, Allied Squads/Buggies/Mechs, and Enemies), while both simulations continue running in the background.
4. **Authentic *Helldivers 2* SES Super Destroyer Orbital Warship Shop Deck**:
   - The Shop is housed aboard an orbital **SES Super Destroyer Warship** complete with a **deep-space twinkling starfield**, **glowing planetary horizon curvature in low orbit**, **2 flanking allied Super Destroyers (`SES Wings of Liberty` & `SES Fist of Democracy`)**, **4 stern ion thruster plumes**, **forward panoramic bridge viewport windows**, the **Galactic War Holotable & Mindustry Core**, and **4 glowing Hellpod Drop Tubes**.

---

## 📜 Complete Version History & Changelog (`v0.0.00` – `v0.0.08`)

### `v0.0.08` — Startup Freeze Fix, Minimalist 1-Row HUD (90%+ Clutter Hidden), True Split Scene Rendering & SES Super Destroyer Warship Deck
- **Fixed Game Freeze on Open (`LOCATIONS.cashRegisterZone` Fix)**: Restored safe `cashRegisterZone`, `counterDropZone`, and `customerQueueStart` coordinates in `GameConfig.LOCATIONS` and added defensive guards in `updatePlayerInteractions()` and `loop(now)` so the 60FPS loop runs immediately on startup.
- **Minimalist Single-Row Floating HUD (`< 8%` Screen Footprint)**: Moved over 90% of always-on HUD banners, wave/gate status pills, quick teleports, and modal buttons into the collapsible **`☰ 選單`** Command Drawer, leaving only a single sleek top pill bar (`💵`, `⭐`, `🎒`, `🏪 Shop`, `⚔️ War`, `☰ 選單`) and proximity-aware 2D pad labels.
- **True Split Scene Rendering (`Shop` vs. `War`)**: Completely separated Shop rendering (`drawSuperDestroyerWarshipDeck`) and War rendering (`drawPlanetaryWarFrontTerrain`) so the War Zone is never visible from the Shop Deck and player movement is cleanly bounded to the active scene.
- ***Helldivers 2* SES Super Destroyer Orbital Warship Background**: Redesigned the Shop environment as an orbital Super Destroyer warship interior & hull with deep-space starfield, glowing planetary limb, flanking allied Destroyers, stern ion thrusters, bridge viewports, and 4 Hellpod launch tubes.

### `v0.0.07` — Mobile-First Portrait HUD Fix, Mindustry Multi-Base Sector Network, Mindustry Visual Node Tech Tree & Split Shop / War Front Architecture
- **Mobile Portrait HUD Drawer & Pinch Zoom**: Added collapsible menu drawer (`☰ 選單`) and 2-finger pinch-to-zoom.
- **Mindustry Multi-Base System (`🪐 多基地 Bases`)**: Added 6 conquerable/switchable Planetary Sector Bases (`Alpha` through `Zeta`) with per-base deposit multipliers (`⛏️ Iron`, `🛢️ E-710`, `💵 Sell Price`) and background **Orbital Launch Pad** exports (`+$REQ/s`, `+🛢️`, `+⛏️`, `+🧱`).
- **Mindustry Visual Node Tech Tree (`🌟 Mindustry 科技樹`)**: Built an interactive 2D node-and-branch schematic tech tree (`#mindustry-tree-canvas`) rooted at `Core: Super Earth Shard` with 13 connected research nodes across 4 branches.
- **Split Shop vs. War Front Mode Switcher + 4 War-Only Functions**: Added `🏪 工廠 Shop Base` / `⚔️ 戰場 War Front` mode switcher and the **War Command Deployment Dock** (`🪖 +SEAF Squad`, `🚙 +Recon Buggy`, `🤖 +Patriot Mech`, and `💚 Mindustry Mend Tower`).

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
