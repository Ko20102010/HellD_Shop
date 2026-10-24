# 💀 HELLDIVERS PLEASE! — Super Earth Arsenal & War-Zone Tycoon (`v0.0.01`)

A 3D mobile-first & desktop arcade idle tycoon web game combining **"Burger Please!"** (`Module 1.11`), **"Whiteout Survival Playable-Ad War Zone"** (`Module 1.9`), **"Helldivers 1 & 2"** (`Modules 1.6 & 1.7`), and **CarbotAnimations Helldivers 2 Chibi Bean Character Design** (`Pro vs Noobs | Helldivers 2 Ep7`).

- **Current Version**: `v0.0.01`

---

## 📋 Version History & Changelog (所有版本與更新紀錄)

### `v0.0.01` — CarbotAnimations Character Redesign, Solid Collisions, Starter Fix & Outer War Zone (`Module 1.9`)
- **1. CarbotAnimations Character & Enemy Redesign (`youtube.com/watch?v=bn0GTO_zvAg`)**:
  - **Chubby Carbot Bean Helldivers**: Rebuilt all player, customer, and SEAF 3D character rigs into cute, rounded Carbot bean/potato bodies with cel-shaded dark rims, big glossy amber-yellow visors (with white specular shine pills), stubby waddling legs, and flapping triangular back-capes.
  - **Pro Helldiver Winged Crest Helmet**: Equipped the Player Commander and VIP Admirals with the iconic Carbot **DP-40 Hero of the Federation Winged Crest Helmet** (dark knight faceplate flanked by twin curved gold-trimmed winged horns).
  - **Carbot Automatons & Hulk Bosses**: Added Carbot-style tin-can Automatons with oversized white cartoon skull heads and two big glowing red dot eyes, plus dual-flamer/saw **Hulk Bosses** and **Terminid Charger Bugs**.
- **2. Guaranteed Starter Basic Items & Pre-Stocked Economy Fix**:
  - **Starter Basic Items Unlocked (`🦺 Cloth` + `🔫 Gun`)**: Both `B-01 Tactical Cloth & Cape Loom` and `AR-23 Liberator Gun Line` are 100% unlocked from second 0 (and forced unlocked on save load so old saves can never lock guns).
  - **Pre-Stocked Shelves, Counter & Cash**: Both starter shelves start pre-stocked with `6` items each, the Quartermaster Counter Tray starts pre-stocked with `4 Cloth + 4 Guns`, the Cash Tower starts with `$40` ready to vacuum, and your wallet starts with `$100` Requisition Slips.
  - **Zero-Deadlock Counter Service**: Queued Helldivers are served automatically whenever matching items are on the Counter Tray—no need to stand frozen on a specific spot if the tray is stocked.
- **3. Solid Obstacle Collision Physics (`resolveCollisions`)**:
  - Added deterministic AABB + circle collision resolution so the player can no longer walk through solid objects:
    - Blocks walking through the **Quartermaster Counter Desk**, all **Production Machine Gantries**, **Output Shelves**, **Warming Benches / Armory Pods**, the **Trash Recycler Bin**, **Cryo-Pod Ice Blocks**, the **Automaton Bunker**, and the **North Blast Walls**.
    - Left a wide-open **Fortified North Gate (`x: -2.8..+2.8, z: -9.5`)** at the top of the shop to walk out into the War Area.
- **4. Top-of-Shop Outer War Area (`Module 1.9` Whiteout Survival Playable-Ad Loop in Helldivers Style)**:
  - **Walk Out the North Gate (`z < -9.5`)**: Walk north out of the shop through the fortified blast gate into the **Outer Planetary War Zone (`z: -10.0` to `-28.5`)**:
    1. **Plowing Alien Spore-Ash Drifts (`Snowplowing → Coal/E-710`)**: Push through glowing purple/green Spore-Ash Drifts outside the gate to clear terrain and stack **`📦 E-710 Fuel / Supply Crates`** vertically on your back (drifts regenerate every 12s).
    2. **Auto-Firing Hunting Loop (`Polar Bear Hunting → Loot & Cash`)**: Stop or walk within `5.6m` of patrolling **Carbot Automatons**, **Terminid Bugs**, or the **Hulk Boss** outside the gate to automatically aim and fire yellow Liberator tracer rounds, harvesting **`📦 Supply / 🛡️ Shield Gear`** onto your back-stack plus instant **`$22–$55` Requisition Slips**.
    3. **Thawing Cryo-Frozen Helldivers (`Brazier Thawing → New Customers + Cash Tower`)**: Walk up to the green pad beside either **Cryo-Frozen Helldiver Pod (`🥶 THAW: 📦×2`)** in the War Zone to feed 2 items into the Thermal Brazier -> melts the ice block -> pops a happy **`😊 THAWED! +$45`** bubble -> sends the rescued Helldiver marching through the North Gate into your Shop and adds `$45` to the towering 3D green cash columns!
    4. **Unlockable Gate Sentry Turret (`$150`)**: Step on the white-dashed construction pad outside the North Gate to build an automated Gatling Sentry Turret that shoots nearby Automatons and Bugs.

---

### `v0.0.00` — Initial Complete Release & Mobile Optimization
- **Version Standard**: Initialized canonical version numbering at `v0.0.00` across `js/config.js`, the top-left HUD banner, the in-game GitHub ZIP Packager, and repository documentation.
- **Core Gameplay Loop (Module `1.11` Burger Please! × Helldivers Logistics)**:
  - Implemented automatic fabrication timers, output shelves with bouncing `MAX` tags (`2.3.K`), and proximity pickup rings.
  - Built the **Towering Back-Stack Carry Engine** with velocity-lagged spring inertia sway (`2.4.K`) and quadratic Bezier parabolic item transfer waterfalls (`2.4.I` / `2.4.K`).
  - Added the central **Quartermaster Counter** with independent buffer trays for all 7 war materiel types.
  - Added **Helldiver Customer FIFO Queue**, floating head-space order bubbles with live color-coded patience bars (`2.3.A` / `2.3.K`), **Armory Prep Pods / Warming Benches**, and **Sky-High 3D Green Requisition Slip (`$`) Columns** (`2.2.I` / `2.2.K`).
- **7 Progressive Factory Production Lines (Ground-Projected Dashed Unlock Pads)**:
  1. `🦺 B-01 Tactical Cloth & Cape Loom` — Starter unlocked ($0), $15/unit (West Wing).
  2. `🔫 AR-23 Liberator Rifle Line` — Starter unlocked ($0), $20/unit (West Wing).
  3. `📦 E-710 & Ammo Supply Line` — Unlock Pad: $60, $30/unit (West Wing).
  4. `🛡️ SH-32 Shield & Heavy Equipment Forge` — Unlock Pad: $140, $48/unit (West Wing).
  5. `🚙 M-102 Fast Recon Vehicle Hangar (車)` — Unlock Pad: $260, $90/unit (East Heavy Wing).
  6. `🤖 EXO-45 Patriot Exosuit Mech Gantry (機甲)` — Unlock Pad: $480, $160/unit (East Heavy Wing).
  7. `🚀 Orbital Super Destroyer Warship Drydock (戰艦)` — Unlock Pad: $850, $300/unit (East Heavy Wing).
- **Autonomous SEAF (`Super Earth Armed Forces`) Staff & Upgrades**:
  - Added on-floor blue-dashed SEAF recruitment pads and the **🪖 SEAF & Upgrades** command modal (up to 6 SEAF Haulers + SEAF Cashier).
- **Helldivers 1 & 2 Tactical Features (Modules `1.6`, `1.7`, `2.1.G`, `2.3.F/G`, `2.4.G`, `3.2.F`)**:
  - Added 3 low-orbit **Super Destroyers** in the skybox and interactive **Eagle 500kg Liberty Overdrive (`↑ → ↓ ↓ ↓`)** (`2×` speed & payout for 20s).
- **Mobile Phone Playability & Responsive Design (Module `3.1`)**:
  - Multi-touch floating virtual joystick, tap-to-walk raycasting, adaptive portrait/landscape 3D camera, and zero-asset Web Audio API synthesis.

---

## 📁 Repository Structure (GitHub Pages Ready)

```text
.
├── index.html          # Main game entry point (v0.0.01, strictly relative paths)
├── .nojekyll           # Bypasses Jekyll processing on GitHub Pages
├── README.md           # Project documentation & full version changelog (v0.0.00 -> v0.0.01)
├── css/
│   └── style.css       # Mobile-first responsive HUD, safe-area insets & world-space tags
└── js/
    ├── config.js       # Version v0.0.01, 7 item tiers, unlock pads & SEAF upgrades
    ├── audio.js        # Zero-asset Procedural Web Audio API synthesizer (gunfire, stack, thaw, 500kg)
    ├── world.js        # Three.js (r128) Carbot Helldivers, Winged Helmet, Automatons, Hulks & Cryo-Pods
    └── game.js         # Core loop, solid AABB collision, Outer War Zone loop, SEAF AI & LocalStorage
```

## 🚀 Deploying to GitHub Pages

1. Upload all files in this repository to your GitHub repository root.
2. Go to **Settings → Pages** in your GitHub repository.
3. Under **Build and deployment**, select **Deploy from a branch** and choose `main` (root `/`).
4. Your game will be live at `https://<your-username>.github.io/<your-repo>/`.
