# 🦅 HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon (`v0.0.03`)

A hybrid **2D Factorio Industrial Automation + Burger Please Arcade Tycoon + Whiteout Survival War-Zone Defense** web game set in the **Helldivers 2** universe with **CarbotAnimations 2D vector cartoon aesthetics**.

---

## 📋 Version History & Changelog

### `v0.0.03` — Black Screen / Audio Boot Fix & Versioned `.ZIP` Filename (Current)
1. **Fixed Black Screen / Startup Crash (`SoundEngine` & `roundRect` Boot Fix)**:
   - Fixed a startup `TypeError` in `js/audio.js` where `window.SoundEngine` was not exported alongside `window.ProceduralAudioEngine`, which previously halted initialization before the 2D canvas rendered.
   - Added immediate first-frame rendering (`this.world.render(this, 0.016)`) and a `document.readyState` boot check so the 2D Factorio + Carbot world renders immediately on load in all browsers and Canvas views.
   - Added a `CanvasRenderingContext2D.prototype.roundRect` polyfill so Carbot bean characters and UI bubbles render on all mobile and desktop browsers without error.
2. **Versioned `.ZIP` Package Filename**:
   - Renamed the repository archive to include the semantic version number directly in the `.zip` filename (`helldivers_please_v0.0.03_github_repo.zip`, plus in-game `helldivers_please_v0.0.03_full_repo.zip` and `helldivers_please_v0.0.03_update_code.zip`).

---

### `v0.0.02` — 2D Factorio Overhaul, 3 Defense Gates, Turret Ammo Conveyors, Raw Speed & Forever Skill Tree
1. **Fixed Gun (`🔫`) Selling & Multi-Stall Queue**:
   - **No More Queue Deadlocks**: Helldiver customers waiting at the Quartermaster Counter are served **simultaneously regardless of queue order** whenever their requested item (`🔫 Gun`, `🦺 Cloth`, etc.) is in the counter tray.
   - **Direct Hand-to-Customer Selling**: Walking near the Sales Counter or directly near any queued Helldiver while holding their requested item (`🔫 Gun`, `🦺 Cloth`, etc.) immediately sells it straight from your hands with a `+$45 🔫 SOLD!` popup!
   - **Guaranteed Early Gun Orders**: The counter starts pre-stocked with `3x 🔫 AR-23 Liberator Guns` and `3x 🦺 B-01 Tactical Cloth`, and the very first arriving Helldiver is guaranteed to buy a `🔫 Gun`.
2. **Expanded 2D Shop Floor (`2480 × 1980` Map + Zoom Controls)**:
   - Expanded the industrial floor into 4 color-coded Factorio sectors (**Sector A: Raw Extraction & Munitions**, **Sector B: Arsenal Assembly Lines**, **Sector C: Helldiver Sales Counter**, and **Sector D: Heavy Vehicle, Mech & Destroyer Bay**) with `+ / − / 🔍` and mouse-wheel zoom controls.
3. **2D Factorio + CarbotAnimations Vector Art Engine**:
   - Switched to a crisp, high-DPI **2D Top-Down Canvas Renderer** combining **Factorio** industrial machinery (rotating mining bore cogs, animated chevron conveyor belts `>>>` with moving items, hydraulic munitions press, and blueprint grid floors) with **CarbotAnimations** 2D cartoon characters (thick black ink outlines, chubby bean bodies, glossy orange-gold visors, DP-40 Winged Helmet, and red-eyed skull Automatons & Flame-Saw Hulks).
4. **Three Northern War-Zone Gates (Start with 1, Expand to 3)**:
   - **Gate Alpha (Center)** starts unlocked. Expand to **Gate Beta (West Wing)** and **Gate Gamma (East Wing)** to unlock additional heavy sentry turrets, wider War-Zone access, and massive Helldiver customer surges.
5. **Enemies Attack Gates & Gate HP = 0 Means Defeat (Lose)**:
   - Automaton Troopers, Terminid Bugs, and Flame-Saw Hulks march from the Northern War Zone to attack active Gates. Every Gate has a live HP bar; if **any Gate's HP reaches `0`**, the base is overrun (Defeat) and the factory run resets while preserving all **🌟 Forever Skills** and **⭐ Warbond Medals**.
6. **Permanent Warbond Skill Tree (`🌟 Forever Skills` — Kept Even After Defeat)**:
   - Added 6 permanent skills (`High-Caliber Arsenal Contracts`, `Deep-Mantle Tectonic Drills`, `Super Titanium Gate Bulkheads`, `Orbital Autoloader Munitions`, `Ministry Priority Drop Grant`, and `Viper Commando Stim Infusion`) upgraded with **⭐ Forever Medals** that persist forever across defeats and resets.
7. **Turret Ammo Input — Manual Hauling (`搬`) to Factorio Conveyor Belts**:
   - Gate Turrets require **🧱 Ammo** from the **Munitions Press** to fire at attacking enemies. Start by manually hauling (`搬`) `🧱 Ammo` (or hiring a **🧱 SEAF Ammo Hauler**), then unlock **Factorio Conveyor Belts** to automatically feed `🧱 Ammo` straight into Gate Alpha, Beta, and Gamma Turrets!
8. **Upgradable Raw Material Generation Speed (`⛏️` & `🛢️`)**:
   - Added **Super Iron Ore Drill (`⛏️`)** and **E-710 Hyper-Fuel Pump (`🛢️`)** extractors that can be upgraded on-map or in the Upgrades menu to generate raw materials faster and accelerate all assembly lines and ammo synthesis.

---

### `v0.0.01` — Carbot Aesthetics, Unlocked Basic Items, Solid Collisions & Northern War Zone
- Added CarbotAnimations chubby bean proportions and glossy visors inspired by *Pro vs Noobs | Helldivers 2 Ep7*.
- Unlocked **B-01 Tactical Cloth (`🦺`)** and **AR-23 Liberator Gun (`🔫`)** at game start with `$100` starting Requisition so players never start stuck at `$0`.
- Added solid AABB obstacle collision resolution around all factory machines, walls, and counters.
- Added the Northern War Zone with ash/snow plowing, Frozen Helldiver Cryo-Pods, and Automaton hunting.

---

### `v0.0.00` — Initial Prototype Release
- Core *Burger Please!* style Helldiver Arsenal Tycoon loop with 7 equipment tiers (`Cloth`, `Gun`, `Munitions`, `Equipment`, `Recon Vehicle 車`, `Patriot Exosuit 機甲`, `SES Super Destroyer Warship`).
- SEAF automated carriers and cashier drones, procedural Web Audio SFX, mobile virtual joystick, and built-in GitHub `.zip` packager.

---

## 📱 Mobile Phone & Desktop Controls
- **Mobile / Touch**: Use the **bottom-left floating Virtual Joystick** or **tap/drag anywhere on the map** to walk, plus on-screen **⚡ SPRINT**, **🗑️ DUMP**, and **+ / − Zoom** buttons.
- **Desktop**: **WASD / Arrow Keys** or **Click-and-Drag** to move, **Shift** to sprint, and **Mouse Wheel** to zoom in/out.

---

## 🚀 Deploying to GitHub Pages
1. Upload `index.html`, `README.md`, `css/style.css`, and the `js/` folder (`config.js`, `audio.js`, `world.js`, `game.js`) to the root of your GitHub repository.
2. Open **Settings → Pages** in your GitHub repository, select **Deploy from a branch (`main` / `/root`)**, and click **Save**.
