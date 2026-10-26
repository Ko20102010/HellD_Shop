# HELLDIVERS PLEASE! — Nightfall: Kingdom Frontier TD Castle Defense, Dedicated Shop Clone Sector & Tactical War Squad Manager (`v0.0.11`)

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

### `v0.0.11` — *Nightfall: Kingdom Frontier TD* Castle Defense & Stronghold Counter-Attack (`據點`), Zero War Econ Buildings (100% Shop Funded), Dedicated Shop Clone Sector D & Manageable War Squads
- **Removed Old 3-Gate Corridor War Setting ➔ Replaced with *Nightfall: Kingdom Frontier TD* Castle & River Bridge Map (`image_97ae56.jpg`)**:
  - **Western Super Earth Frontier Castle Compound (`x = -1440..-220, z = -1520..-480`)**: Features the **Super Earth Citadel Keep**, **Curved Perimeter Castle Walls (`Lv.1–10`)**, **East Frontier Gate (`gate_3`)**, **South Stone Arch Bridge Gate (`gate_2`)** over the winding **River Moat**, **6 Upgradable Circular Watchtowers (`tw_1`–`tw_6`, `Lv.1–10`)**, and **3 Squad Barracks with 2x4 Troop Formation Grids**.
  - **Zero Economy Buildings in the War Zone**: 100% of `$REQ` money, `🧱 Turret Ammo`, and `🦺/🔫/🎒/🚙/🤖` equipment come from your **Super Destroyer Shop**.
  - **Hybrid Wave Pace (`🌙 Nightfall Wave` + `🔥 Continuous Siege: OFF/ON` Toggle)**: Choose between *Nightfall*'s **Day/Prep Phase + Nightfall Wave** rhythm or toggle **`🔥 Continuous Siege: ON`** for non-stop enemy waves.
  - **Castle Defense + Sally-Out Counter-Attack on 3 Eastern Enemy Strongholds (`⚔️ 出擊攻打據點`)**: Switch between **`🏰 固守王國城堡 (Hold Castle TD)`** and **`⚔️ 出擊攻打據點 (Sally Out & Raze 據點)`** (or tap any of the 3 Eastern Strongholds—`North Bot Cave`, `Central River Iron Fortress`, `South Terminid Bio-Hive`) to send your Hero and Managed War Squads across the River Bridge to destroy enemy `據點` for massive `$REQ`, `⭐ Forever Medals`, and `🧬 Super Samples`!
- **Dedicated Physical Area in Shop for the Clone Room & Squad Muster (`🧬 SECTOR D`, `x = -2080..-420, z = -435..-42`)**: Expanded the northern Super Destroyer deck with a full walled **Bio-Clone Vat Chamber (6 Vats + 6-Sector Job Roster Board)** on the Left Wing and a **War Squad Formation Muster Bay** on the Right Wing.
- **Manageable War Squad System (`🪖 小隊 Squad` & `#modal-squad`)**: Manage **Alpha Vanguard Rifle Squad (`8/8`)**, **Bravo Jump-Pack & Heavy Squad (`8/8`)**, and **Charlie Patriot Exosuit Squad (`8/8`)** (up to `24` formation troops + Named Hero), recruit soldiers using Shop `$REQ`, `🫡 Geared Shop Clients`, or `🔫/🚙/🤖` Shop stock, upgrade Squad Gear Tiers (`Lv.1–10`), and issue real-time Castle Garrison or Stronghold Sally-Out orders.

### `v0.0.10` — Idle Building Multi-Ability Pop-Up Window, SEAF Clone Vat Room & 6-Sector Job Board, Pure Departure Hellpods & Game-by-Game Roguelike War Operations (Attack/Defense, Shop Power Bonus, Client Volunteers/Mercenaries & Gen-1 Martyrdom Heroes)
- **Idle Tap Pop-Up Multi-Ability Upgrade Window (`#building-upgrade-popover`)**: Tapping any Shop Machine, Counter Desk, Quarry Auto-Drill, or Ammo Press opens a compact Idle-Tycoon Pop-Up Window to independently upgrade **💰 Unit Sale Price (`priceLvl`)**, **⚡ Crafting/Drill Speed (`speedLvl`)**, **📦 1 Raw ➔ More Goods (`yieldLvl`, up to `4x` items per raw ore!)**, and **🏪 Counter Desk Expansion (`counterLvl`, `1 -> 2 -> 3` physical counters)**.
- **SEAF Clone Vat Room (`🧬 克隆培育室`) & 6-Sector Job Assignment Board (`#modal-clone-room`)**: Replaced War Zone cryo-pod thawing with a dedicated **SEAF Clone Vat Room (`x = -1500, z = -95`)** on the Super Destroyer deck. Upgrade the Clone Room (`Lv.1–10`) to raise your **Worker Upper Limit (`6 -> 33` max clones)**, hire SEAF Clones, and freely assign them across **6 Sector Jobs**: `⛏️ Pick Raw`, `📦 Haul Goods`, `🫡 Sales Cashier`, `💵 Pick Money`, `🧱 Pick Ammo`, and `⚔️ Pick War`.
- **Pure Departure Hellpods & Geared Client Standby Pool**: Served Helldiver customers exit via the 4 Hellpod Tubes (`x = 220, z = -100`) with **zero auto-war spawn and zero drop fee**, entering your **Geared Client Standby Pool (`gearedClientsPool`)** with the exact weapon/vehicle/mech tier they purchased.
- **Redesigned Game-by-Game War Operations (`#war-game-panel`)**:
  - **(a) In-Match Battle XP & 3-Card Roguelike Draft**: Kill enemies to gain Battle XP (`💎`), level up your in-run Roguelike rank, and draft stackable tactical perks.
  - **(b) Separate Attack vs. Defense Sections**: Switch between **⚔️ Attack Op (5-Stage Forward Expedition `0% -> 100%`)** and **🛡️ Defense Op (5-Wave Fortress Bastion Holdout)**.
  - **(c) Game-by-Game Match Loop + Shop Scale Power Bonus**: Each War Game is a self-contained 5-Wave match where your **Shop's scale & ability levels directly buff your squad's ATK & HP (`🏪 Shop Scale Bonus: +X% ATK/HP`)**.
  - **(d) Low-Control Player Participation (`🤖 Auto-Pilot: ON/OFF`)**: Auto-maneuvers, dodges, collects drops, and auto-fires so you can play effortlessly with 1-tap stratagems, or take manual control anytime.
  - **(e) Clients Affect the War (Free Volunteers + Paid Mercenaries)**: Served Shop Clients have a **free volunteer chance** at the start of each War Game, or you can click **`🫡 Pay Client to Join ($60)`** to hire geared clients from your pool to drop in with the gear they bought!
  - **(f) Named Heroes with Gen-1 Permadeath Martyrdom & Clone DNA Rebirth**: Recruit **General Brasch 🦅**, **John Helldiver 💀**, **Eagle-1 Ace ✈️**, and **Viper Commando 🐍**. If your Hero dies in their Gen-1 deployment, they detonate a screen-wiping **Martyrdom Hellbomb (`+1 ⭐ Martyr Medal`)**, leave a **🪦 Martyr Memorial**, and can be re-cloned into **`Gen-2+` with `+35% Martyr Legacy Stats`**!

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
