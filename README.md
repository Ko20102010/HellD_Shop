# 💀 HELLDIVERS PLEASE! — Super Earth Arsenal & Logistics Tycoon

A 3D arcade idle tycoon web game combining the addictive **"Burger Please!"** back-stacking & store expansion gameplay loop with the **"Helldivers 1 & 2"** universe, built from the *Modular Game Prompt Library*.

## 🎮 Gameplay Overview

Instead of flipping burgers, you command the **Super Earth Orbital Embarkation & Munitions Hangar**:
- **Start with Basic Issue (`🦺 Simple Cloth/Armor` & `🔫 Liberator Guns`)**: Pick up freshly fabricated B-01 Tactical Capes and AR-23 Liberator Rifles onto your towering back-stack (with real-time spring inertia sway) and deliver them to the Quartermaster Counter!
- **Progressive Factory Expansion**: Collect towering 3D columns of green **Requisition Slips (`$`)** and step on ground-projected dashed unlock zones to expand your arsenal:
  1. `🦺 B-01 Tactical Cloth & Cape Loom` (Unlocked at Start)
  2. `🔫 AR-23 Liberator Rifle Line` (Unlocked at Start)
  3. `📦 Hellpod Ammo & Stim Supply Line` ($60)
  4. `🛡️ SH-32 Shield & Heavy Equipment Forge` ($140)
  5. `🚙 M-102 Fast Recon Vehicle Hangar (車)` ($260)
  6. `🤖 EXO-45 Patriot Exosuit Mech Gantry (機甲)` ($480)
  7. `🚀 2F Escalator & Orbital Super Destroyer Warship Drydock (戰艦)` ($850)
- **Hire SEAF (`Super Earth Armed Forces`) Staff**: Recruit autonomous blue-armored **SEAF Logistics Troopers** to haul weapons, vehicles, mechs, and warship cores from factory shelves to the counter, and hire a **SEAF Quartermaster Cashier** to serve queued Helldivers automatically.
- **Eagle 500kg Liberty Overdrive (`↑ → ↓ ↓ ↓`)**: Key in the iconic Helldivers Stratagem sequence (or tap the HUD boost button) to trigger an orbital 500kg detonation and double all factory speed and Requisition payouts for 20 seconds!

## 📁 Repository Structure (GitHub Pages Ready)

```text
.
├── index.html          # Main game entry point (uses strictly relative paths)
├── .nojekyll           # Bypasses Jekyll processing on GitHub Pages
├── README.md           # Project documentation & deployment guide
├── css/
│   └── style.css       # Responsive HUD, skewed tactical cards & world-space bubbles
└── js/
    ├── config.js       # 7 item tiers, station coordinates, unlock pads & SEAF upgrades
    ├── audio.js        # Zero-asset Procedural Web Audio API synthesizer
    ├── world.js        # Three.js (r128) 3D chibi Helldivers, Verlet capes & item meshes
    └── game.js         # Core game loop, SEAF AI, parabolic physics & LocalStorage engine
```

## 🚀 Deploying to GitHub Pages

1. Upload all files in this repository to your GitHub repository root.
2. Go to **Settings → Pages** in your GitHub repository.
3. Under **Build and deployment**, select **Deploy from a branch** and choose `main` (root `/`).
4. Your game will be live at `https://<your-username>.github.io/<your-repo>/`.
