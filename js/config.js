// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.04
// Module: Configuration, 4200x3800 Zero-Overlap Map, Raw Harvest Quarry,
//         Item Production Recipes, 3-Layer Sequential Defense Gates,
//         Main Character Equipment Loadout & 12-Unit Character Preview Roster
// ============================================================================

window.GameConfig = {
  VERSION: 'v0.0.04',
  STORAGE_KEY: 'helldivers_please_save_v0004',
  LEGACY_KEYS: [
    'helldivers_please_save_v0003',
    'helldivers_please_save_v0002',
    'helldivers_please_save_v0001',
    'helldivers_please_save_v0000'
  ],

  // Massively Expanded 4200 x 3800 2D Factorio + Carbot World (Zero Overlap!)
  WORLD: {
    minX: -2100,
    maxX: 2100,
    minZ: -1950,
    maxZ: 1850,
    wallZ: -200,
    corridorMinX: -1650,
    corridorMaxX: 1650,
    gateOpeningWidth: 320
  },

  PLAYER: {
    baseSpeed: 280,
    sprintMultiplier: 1.55,
    baseCapacity: 16,
    pickupRadius: 92,
    transferInterval: 0.06,
    attackRange: 280,
    attackCooldown: 0.22,
    attackDamage: 28,
    plowRadius: 105
  },

  // --------------------------------------------------------------------------
  // MAIN CHARACTER (主角色) 4-SLOT EQUIPMENT & LOADOUT SYSTEM (🛡️ 裝備 Loadout)
  // --------------------------------------------------------------------------
  COMMANDER_EQUIPMENT: {
    weapon: [
      {
        id: 'w_liberator',
        slot: 'weapon',
        name: 'AR-23 Liberator Bullpup Rifle',
        zhName: 'AR-23 解放者突擊步槍',
        icon: '🔫',
        cost: 0,
        unlockedAtStart: true,
        damageMult: 1.0,
        fireRateMult: 1.0,
        pelletCount: 1,
        tracerColor: '#38bdf8',
        desc: 'Standard-issue Helldiver assault rifle. Reliable single-target rapid fire (28 DMG).'
      },
      {
        id: 'w_breaker',
        slot: 'weapon',
        name: 'SG-225 Breaker Auto-Shotgun',
        zhName: 'SG-225 破擊者全自動霰彈槍',
        icon: '💥',
        cost: 240,
        unlockedAtStart: false,
        damageMult: 0.85,
        fireRateMult: 1.15,
        pelletCount: 3,
        tracerColor: '#f97316',
        desc: 'Fires a 3-pellet heavy flechette spread (2.55x total burst damage) that shreds bug swarms!'
      },
      {
        id: 'w_quasar',
        slot: 'weapon',
        name: 'LAS-99 Quasar Heavy Cannon',
        zhName: 'LAS-99 類星體重型雷射砲',
        icon: '⚡',
        cost: 620,
        unlockedAtStart: false,
        damageMult: 3.4,
        fireRateMult: 0.85,
        pelletCount: 1,
        explosive: true,
        tracerColor: '#facc15',
        desc: 'High-energy golden plasma beam (3.4x DMG + AoE splash explosion) built to melt Automaton Hulks!'
      }
    ],
    armor: [
      {
        id: 'a_standard',
        slot: 'armor',
        name: 'DP-40 Hero of the Federation',
        zhName: 'DP-40 聯邦英雄戰術裝甲',
        icon: '🦺',
        cost: 0,
        unlockedAtStart: true,
        speedMult: 1.0,
        bonusCap: 0,
        harvestMult: 1.0,
        sellBonus: 0,
        bodyColor: '#1e293b',
        capeColor: '#eab308',
        trimColor: '#facc15',
        desc: 'Classic winged Carbot Commander armor with balanced mobility and protection.'
      },
      {
        id: 'a_scout',
        slot: 'armor',
        name: 'SC-30 Trailblazer Scout Armor',
        zhName: 'SC-30 開拓者高速偵察裝甲',
        icon: '🏃',
        cost: 220,
        unlockedAtStart: false,
        speedMult: 1.32,
        bonusCap: 4,
        harvestMult: 1.6,
        sellBonus: 0,
        bodyColor: '#14532d',
        capeColor: '#22c55e',
        trimColor: '#86efac',
        desc: '+32% Move Speed, +4 Carry Stack, and +60% faster manual Ore Harvesting & Gate Repair!'
      },
      {
        id: 'a_juggernaut',
        slot: 'armor',
        name: 'FS-05 Devastator Heavy Plate',
        zhName: 'FS-05 毀滅者重裝泰坦甲',
        icon: '🛡️',
        cost: 480,
        unlockedAtStart: false,
        speedMult: 1.12,
        bonusCap: 12,
        harvestMult: 1.25,
        sellBonus: 0.25,
        bodyColor: '#7f1d1d',
        capeColor: '#f59e0b',
        trimColor: '#fde047',
        desc: '+12 Max Carry Stack Capacity, +12% Move Speed, and +25% Requisition Sale Price on all items!'
      }
    ],
    backpack: [
      {
        id: 'b_none',
        slot: 'backpack',
        name: 'Standard Tactical Rig',
        zhName: '標準後勤背架',
        icon: '🎒',
        cost: 0,
        unlockedAtStart: true,
        bonusCap: 0,
        hasDrone: false,
        autoHarvest: false,
        desc: 'Standard vertical back-stack frame.'
      },
      {
        id: 'b_supply',
        slot: 'backpack',
        name: 'B-1 Heavy Supply Pack',
        zhName: 'B-1 重型彈藥補給背包',
        icon: '📦',
        cost: 280,
        unlockedAtStart: false,
        bonusCap: 10,
        hasDrone: false,
        autoHarvest: false,
        ammoBonus: true,
        desc: '+10 Max Carry Stack Capacity and loads +5 🧱 Ammo per crate into Gate Turrets!'
      },
      {
        id: 'b_rover',
        slot: 'backpack',
        name: 'AX/LAS-5 "Guard Dog" Laser Drone',
        zhName: 'AX/LAS-5 護衛犬自動雷射無人機',
        icon: '🛸',
        cost: 540,
        unlockedAtStart: false,
        bonusCap: 6,
        hasDrone: true,
        autoHarvest: true,
        desc: 'Deploys an orbiting Guard Dog drone that auto-fires lasers at enemies AND auto-mines Raw Ore from afar!'
      }
    ],
    mount: [
      {
        id: 'm_foot',
        slot: 'mount',
        name: 'On Foot (Commander Boots)',
        zhName: '徒步作戰 (指揮官戰靴)',
        icon: '🥾',
        cost: 0,
        unlockedAtStart: true,
        speedMult: 1.0,
        bonusCap: 0,
        damageMult: 1.0,
        desc: 'Standard agile foot mobility.'
      },
      {
        id: 'm_vehicle',
        slot: 'mount',
        name: 'Ride M-102 Fast Recon Vehicle (車)',
        zhName: '騎乘 M-102 戰術偵察車',
        icon: '🚙',
        cost: 750,
        unlockedAtStart: false,
        speedMult: 1.55,
        bonusCap: 10,
        damageMult: 1.4,
        desc: 'Drive the armored Carbot Recon Buggy! Grants +55% Move Speed, +10 Carry Stack & HMG fire!'
      },
      {
        id: 'm_mech',
        slot: 'mount',
        name: 'Pilot EXO-45 Patriot Exosuit (機甲)',
        zhName: '駕駛 EXO-45 愛國者雙足機甲',
        icon: '🤖',
        cost: 1500,
        unlockedAtStart: false,
        speedMult: 1.28,
        bonusCap: 18,
        damageMult: 2.5,
        desc: 'Pilot the towering Patriot Mech! Grants +18 Carry Stack, 2.5x Weapon Damage & rapid Gate repair!'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // FULL CHARACTER, STAFF, ENEMY & MECH ROSTER FOR IN-GAME PREVIEW (角色圖鑑)
  // --------------------------------------------------------------------------
  CHARACTER_ROSTER: [
    {
      id: 'char_commander',
      name: 'DP-40 Hero Commander (You)',
      zhName: '聯邦英雄指揮官 (可裝備武器/護衛犬/機甲)',
      faction: 'Super Earth Command',
      badge: '🦅 PLAYABLE HERO',
      badgeColor: '#facc15',
      renderType: 'bean',
      renderOpts: {
        bodyColor: '#1e293b',
        capeColor: '#eab308',
        trimColor: '#facc15',
        visorColor: '#f97316',
        isCommander: true,
        hasRifle: true,
        hasDrone: true,
        stack: [
          { icon: '⛏️', color: '#38bdf8' },
          { icon: '🔫', color: '#38bdf8' }
        ]
      },
      stats: '4 Equipment Slots: Weapon 🔫 | Armor 🦺 | Guard Dog 🛸 | Mount 🤖',
      desc: 'Main character with customizable 4-slot loadout! Harvests raw ore, feeds factory hoppers, sells gear, repairs the 3 Gate Layers, and pilots Vehicles & Mechs.'
    },
    {
      id: 'char_helldiver',
      name: 'Helldiver Squad Customer',
      zhName: '標準絕地戰兵買家 (B-01 戰術裝甲)',
      faction: 'Helldiver Corps',
      badge: '🫡 CUSTOMER',
      badgeColor: '#38bdf8',
      renderType: 'bean',
      renderOpts: {
        bodyColor: '#0f172a',
        capeColor: '#dc2626',
        trimColor: '#facc15',
        visorColor: '#fb923c',
        isCommander: false,
        hasRifle: true,
        orderBubble: '🔫 0/2'
      },
      stats: 'Orders: 🔫 Gun, 🦺 Cloth, 📦 Munitions, 🎒 Jump Pack',
      desc: 'Chubby Carbot bean Helldiver queuing in Sector C. Can be served from the Quartermaster Counter tray OR directly from your hands!'
    },
    {
      id: 'char_vip_admiral',
      name: 'Skull Admiral VIP Customer',
      zhName: '骷髏上將 VIP 買家 (高階艦長)',
      faction: 'Super Earth Fleet',
      badge: '👑 VIP BUYER',
      badgeColor: '#a855f7',
      renderType: 'bean',
      renderOpts: {
        bodyColor: '#3b0764',
        capeColor: '#f59e0b',
        trimColor: '#fde047',
        visorColor: '#fef08a',
        isCommander: true,
        hasRifle: true,
        orderBubble: '🤖 0/1'
      },
      stats: 'Orders: 🚙 Recon Vehicle, 🤖 Patriot Mech, 🚀 Super Destroyer',
      desc: 'Veteran Carbot Admiral in royal purple-and-gold ceremonial armor with winged crest. Pays $310–$1,650+ for vehicles, mechs, and warships.'
    },
    {
      id: 'char_seaf_miner',
      name: 'SEAF Raw Quarry Miner (採礦兵)',
      zhName: 'SEAF 礦區採集兵 (原料補給員)',
      faction: 'SEAF Mining Corps',
      badge: '⛏️ RAW MINER',
      badgeColor: '#38bdf8',
      renderType: 'bean',
      renderOpts: {
        bodyColor: '#0f766e',
        capeColor: '#2dd4bf',
        trimColor: '#facc15',
        visorColor: '#99f6e4',
        isCommander: false,
        stack: [
          { icon: '⛏️', color: '#38bdf8' },
          { icon: '🛢️', color: '#a855f7' }
        ]
      },
      stats: 'Carry: 4 Raw Ore/Fuel | Route: Raw Quarry -> Factory Input Hoppers',
      desc: 'Dedicated mining trooper who harvests ⛏️ Super Iron and 🛢️ E-710 from Sector A and feeds them into your factory Input Hoppers so production never stops!'
    },
    {
      id: 'char_seaf_logistics',
      name: 'SEAF Logistics Trooper',
      zhName: 'SEAF 藍甲後勤搬運兵',
      faction: 'SEAF Support',
      badge: '🪖 AUTO-STAFF',
      badgeColor: '#38bdf8',
      renderType: 'bean',
      renderOpts: {
        bodyColor: '#1d4ed8',
        capeColor: '#38bdf8',
        trimColor: '#f8fafc',
        visorColor: '#bae6fd',
        isCommander: false,
        stack: [
          { icon: '🔫', color: '#38bdf8' },
          { icon: '🦺', color: '#facc15' }
        ]
      },
      stats: 'Carry: 4 Items | Route: Factory Output -> Sales Counter',
      desc: 'Loyal Super Earth Armed Forces trooper in sky-blue armor. Automatically collects finished Guns, Cloth, and Gear from assembly lines and stocks the Sales Counter.'
    },
    {
      id: 'char_seaf_ammo',
      name: 'SEAF Munitions Hauler (搬彈兵)',
      zhName: 'SEAF 重裝搬彈與修門工兵',
      faction: 'SEAF Ordnance',
      badge: '🧱 AMMO & REPAIR',
      badgeColor: '#f97316',
      renderType: 'bean',
      renderOpts: {
        bodyColor: '#7c2d12',
        capeColor: '#f97316',
        trimColor: '#fed7aa',
        visorColor: '#fb923c',
        isCommander: false,
        stack: [
          { icon: '🧱', color: '#f97316' },
          { icon: '🧱', color: '#f97316' }
        ]
      },
      stats: 'Carry: 4 Crates (12 🧱 Ammo) | Supplies & Repairs Gate Layers 3, 2, 1',
      desc: 'Ordnance specialist who hauls (搬) 🧱 Ammo from the Munitions Press to the 3 Sequential Gate Layers (Gate 3 -> Gate 2 -> Gate 1) and repairs damaged gates!'
    },
    {
      id: 'char_automaton_trooper',
      name: 'Automaton Skull Trooper',
      zhName: '機器人骷髏步兵 (Automaton)',
      faction: 'Automaton Legion',
      badge: '💀 ENEMY WAVE',
      badgeColor: '#ef4444',
      renderType: 'enemy',
      renderOpts: { type: 'trooper' },
      stats: 'HP: 95 | Attacks: Gate 3 -> Gate 2 -> Gate 1 | Drops: $35 + 🛢️',
      desc: 'Carbot-style gunmetal bot chassis with a white cartoon skull faceplate and glowing red eyes. Attacks Outer Gate 3 first, then Middle Gate 2, then Inner Gate 1.'
    },
    {
      id: 'char_automaton_hulk',
      name: 'Automaton Flame-Saw Hulk Boss',
      zhName: '機器人巨型毀滅者 (Hulk 裝甲首領)',
      faction: 'Automaton Legion',
      badge: '🪚 BOSS SIEGE',
      badgeColor: '#dc2626',
      renderType: 'enemy',
      renderOpts: { type: 'hulk' },
      stats: 'HP: 310 | Siege DMG: 24 | Drops: $95 + +1 ⭐ Forever Medal!',
      desc: 'Towering crimson-and-gunmetal Carbot Hulk armed with a spinning orange buzzsaw arm, heavy flamethrower, and glowing red skull eyes.'
    },
    {
      id: 'char_terminid_bug',
      name: 'Terminid Charger Bug',
      zhName: '蟲族裝甲衝鋒蟲 (Terminid)',
      faction: 'Terminid Swarm',
      badge: '🪲 FAST SWARM',
      badgeColor: '#84cc16',
      renderType: 'enemy',
      renderOpts: { type: 'bug' },
      stats: 'HP: 80 | Speed: 110 (Fast) | Drops: $35 + 🛢️ E-710',
      desc: 'Chubby Carbot olive-green chitinous bug with yellow snapping mandibles and skittering legs that rushes the active Defense Gate layer in packs.'
    },
    {
      id: 'char_patriot_mech',
      name: 'EXO-45 Patriot Exosuit (機甲)',
      zhName: 'EXO-45 愛國者雙足機甲 (可販售 & 主角可駕駛)',
      faction: 'Super Earth Heavy Armor',
      badge: '🤖 TIER-6 MECH',
      badgeColor: '#f97316',
      renderType: 'mech',
      renderOpts: {},
      stats: 'Recipe: 3⛏️ Iron + 2🛢️ E-710 | Sell: $680+ | Wearable Mount!',
      desc: 'Heavily armored bipedal walker armed with shoulder rocket pods and rotary gatling cannon. Produce it for VIPs OR equip it in 🛡️ Loadout to pilot it yourself!'
    },
    {
      id: 'char_recon_vehicle',
      name: 'M-102 Fast Recon Vehicle (車)',
      zhName: 'M-102 戰術偵察車 (可販售 & 主角可騎乘)',
      faction: 'Super Earth Motor Pool',
      badge: '🚙 TIER-5 VEHICLE',
      badgeColor: '#eab308',
      renderType: 'vehicle',
      renderOpts: {},
      stats: 'Recipe: 2⛏️ Iron + 1🛢️ E-710 | Sell: $310+ | Wearable Mount!',
      desc: 'All-terrain armored tactical buggy with yellow roll-cage and roof HMG turret. Produce it for Helldivers OR equip it in 🛡️ Loadout for +55% move speed!'
    },
    {
      id: 'char_gate_turret',
      name: '3-Layer Defense Gate & Dual Sentries',
      zhName: '三層縱深防禦城門 & 雙聯裝機砲塔',
      faction: 'Super Earth Defense Grid',
      badge: '🗼 3-LAYER DEFENSE',
      badgeColor: '#22c55e',
      renderType: 'turret',
      renderOpts: {},
      stats: 'Layers: Outer Gate 3 -> Middle Gate 2 -> Inner Gate 1 (Repairable!)',
      desc: 'Three concentric blast walls across the Northern Corridor, each guarded by Dual Automated Sentries and a Repair/Ammo Pad.'
    }
  ],

  // --------------------------------------------------------------------------
  // SECTOR A: MANUAL HARVEST QUARRY + EXPANDABLE AUTO-MINING RIGS (Scale 1..5)
  // --------------------------------------------------------------------------
  RAW_EXTRACTORS: [
    {
      id: 'raw_iron',
      name: 'Super Iron Quarry & Drill Array',
      shortName: 'Iron Quarry',
      itemIcon: '⛏️',
      icon: '⛏️',
      color: '#38bdf8',
      // Manual Harvest Vein Area (Walk here at start to harvest Iron by hand!)
      harvestPos: { x: -1740, z: 180, radius: 135 },
      // Expandable Auto-Drill Rig Array (Scale Lv.1 -> Lv.5 adds more rigs!)
      x: -1400,
      z: 180,
      pickupX: -1150,
      pickupZ: 180,
      padX: -1400,
      padZ: 350,
      baseCycleTime: 1.45,
      baseUpgradeCost: 75,
      costScale: 1.55,
      baseBuffer: 24,
      desc: 'Walk over the ⛏️ Iron Vein to harvest by hand at start, or upgrade Scale (Lv.1–5+) to deploy multi-rig Auto-Drills!'
    },
    {
      id: 'raw_e710',
      name: 'E-710 Fuel Field & Pump Array',
      shortName: 'E-710 Field',
      itemIcon: '🛢️',
      icon: '🛢️',
      color: '#a855f7',
      // Manual Harvest Geyser Area (Walk here at start to harvest E-710 by hand!)
      harvestPos: { x: -1740, z: 680, radius: 135 },
      // Expandable Auto-Pump Rig Array
      x: -1400,
      z: 680,
      pickupX: -1150,
      pickupZ: 680,
      padX: -1400,
      padZ: 850,
      baseCycleTime: 1.55,
      baseUpgradeCost: 85,
      costScale: 1.55,
      baseBuffer: 24,
      desc: 'Walk over the 🛢️ E-710 Geysers to harvest by hand at start, or upgrade Scale (Lv.1–5+) to expand Auto-Pumps!'
    }
  ],

  // --------------------------------------------------------------------------
  // MUNITIONS AMMO PRESS (Requires 1x ⛏️ Iron -> Produces 3x 🧱 Turret Ammo!)
  // --------------------------------------------------------------------------
  AMMO_PRESS: {
    id: 'ammo',
    name: 'Munitions Ammo Press',
    shortName: 'Ammo Press',
    icon: '🧱',
    color: '#f97316',
    recipe: { raw_iron: 1 },
    outputBatch: 3,
    initialInput: { raw_iron: 8 },
    inputPos: { x: -1700, z: 1280 },
    x: -1440,
    z: 1280,
    padX: -1180,
    padZ: 1280,
    baseCycleTime: 1.25,
    maxBuffer: 36,
    initialStock: 12,
    desc: 'Consumes 1x ⛏️ Iron Ore in its Input Hopper to press 3x 🧱 Heavy Turret Ammo for Gate Layers 3, 2, and 1!'
  },

  // --------------------------------------------------------------------------
  // THREE SEQUENTIAL NORTHERN WAR-ZONE DEFENSE GATE LAYERS
  // (Enemies MUST break Outer Gate 3 -> then Middle Gate 2 -> finally Inner Gate 1!)
  // --------------------------------------------------------------------------
  GATES: [
    {
      id: 'gate_3',
      layerOrder: 3, // Outer Layer (First attacked!)
      name: 'Outer Gate 3 — Forward Bastion (第3層外門)',
      shortName: 'Outer Gate 3',
      x: 0,
      z: -1320,
      leftTurretX: -280,
      rightTurretX: 280,
      turretX: -280,
      turretZ: -1250,
      ammoPadX: 0,
      ammoPadZ: -1200,
      upgradePadX: -480,
      upgradePadZ: -1200,
      unlockedAtStart: true,
      baseUpgradeCost: 140,
      baseMaxHp: 900,
      turretName: 'Dual A/MG-43 Forward Sentries',
      turretRange: 460,
      turretFireRate: 0.34,
      turretDamage: 34,
      maxAmmo: 50,
      initialAmmo: 30,
      conveyorId: 'conv_gate_3',
      conveyorCost: 240,
      color: '#f97316',
      desc: 'FIRST DEFENSE LAYER (z = -1320): Enemies must break Outer Gate 3 before they can advance to Gate 2! Can be repaired & rebuilt anytime.'
    },
    {
      id: 'gate_2',
      layerOrder: 2, // Middle Layer (Attacked only after Gate 3 is broken!)
      name: 'Middle Gate 2 — Citadel Wall (第2層中門)',
      shortName: 'Middle Gate 2',
      x: 0,
      z: -840,
      leftTurretX: -280,
      rightTurretX: 280,
      turretX: -280,
      turretZ: -770,
      ammoPadX: 0,
      ammoPadZ: -720,
      upgradePadX: -480,
      upgradePadZ: -720,
      unlockedAtStart: true,
      baseUpgradeCost: 180,
      baseMaxHp: 850,
      turretName: 'Dual A/AC-8 Heavy Autocannons',
      turretRange: 470,
      turretFireRate: 0.32,
      turretDamage: 42,
      maxAmmo: 50,
      initialAmmo: 30,
      conveyorId: 'conv_gate_2',
      conveyorCost: 200,
      color: '#38bdf8',
      desc: 'SECOND DEFENSE LAYER (z = -840): Holds the line if Outer Gate 3 falls. Stand on its pad to load 🧱 Ammo or repair/rebuild!'
    },
    {
      id: 'gate_1',
      layerOrder: 1, // Inner Core Layer (Final wall! 0 HP = Lose!)
      name: 'Inner Gate 1 — Core Arsenal Wall (第1層核心內門)',
      shortName: 'Inner Gate 1',
      x: 0,
      z: -360,
      leftTurretX: -280,
      rightTurretX: 280,
      turretX: -280,
      turretZ: -290,
      ammoPadX: 0,
      ammoPadZ: -240,
      upgradePadX: -480,
      upgradePadZ: -240,
      unlockedAtStart: true,
      baseUpgradeCost: 220,
      baseMaxHp: 800,
      turretName: 'Dual A/MLS-4X Railcannon Sentries',
      turretRange: 490,
      turretFireRate: 0.30,
      turretDamage: 52,
      maxAmmo: 60,
      initialAmmo: 36,
      conveyorId: 'conv_gate_1',
      conveyorCost: 160,
      color: '#facc15',
      desc: 'FINAL INNER LAYER (z = -360): Protects the Factory Floor! Only attacked if Gate 3 and Gate 2 are broken. If Inner Gate 1 hits 0 HP = Defeat!'
    }
  ],

  CONVEYORS: [
    {
      id: 'conv_raw_feed',
      name: 'Quarry -> All Factory Input Hoppers Belt',
      icon: '⚙️',
      cost: 150,
      padX: -1150,
      padZ: 430,
      color: '#38bdf8',
      desc: 'Factorio Raw Ore Conveyor! Automatically pipes ⛏️ Iron & 🛢️ E-710 from the Quarry into all Factory & Ammo Input Hoppers (+40% crafting speed)!'
    },
    {
      id: 'conv_gate_1',
      name: 'Ammo Belt -> Inner Gate 1 Turrets',
      icon: '⏩',
      cost: 160,
      gateId: 'gate_1',
      padX: 480,
      padZ: -240,
      color: '#facc15',
      desc: 'Automatically feeds 🧱 Ammo from the Munitions Press to Inner Gate 1 Dual Turrets and slowly auto-repairs Gate 1!'
    },
    {
      id: 'conv_gate_2',
      name: 'Ammo Belt -> Middle Gate 2 Turrets',
      icon: '⏩',
      cost: 200,
      gateId: 'gate_2',
      padX: 480,
      padZ: -720,
      color: '#38bdf8',
      desc: 'Automatically feeds 🧱 Ammo to Middle Gate 2 Dual Turrets and slowly auto-repairs Gate 2!'
    },
    {
      id: 'conv_gate_3',
      name: 'Ammo Belt -> Outer Gate 3 Turrets',
      icon: '⏩',
      cost: 240,
      gateId: 'gate_3',
      padX: 480,
      padZ: -1200,
      color: '#f97316',
      desc: 'Automatically feeds 🧱 Ammo all the way to Outer Gate 3 Dual Turrets and slowly auto-repairs Gate 3!'
    },
    {
      id: 'conv_counter_auto',
      name: 'Factory Output -> Sales Counter Belt',
      icon: '🛒',
      cost: 280,
      padX: 180,
      padZ: 340,
      color: '#22c55e',
      desc: 'Factorio Logistics Belt! Automatically transfers finished Guns, Cloth, Vehicles & Mechs from Output Pads to the Sales Counter!'
    }
  ],

  // --------------------------------------------------------------------------
  // ALL 7 PRODUCTION ITEMS WITH EXPLICIT RAW MATERIAL RECIPES & ZERO-OVERLAP POSITIONS
  // --------------------------------------------------------------------------
  ITEMS: [
    {
      id: 'gun',
      tier: 1,
      name: 'AR-23 Liberator Rifle',
      shortName: 'Liberator Gun',
      icon: '🔫',
      color: '#38bdf8',
      unlockedAtStart: true,
      unlockCost: 0,
      sellPrice: 45,
      cycleTime: 1.55,
      maxBuffer: 14,
      initialStock: 4,
      rawType: 'raw_iron',
      recipe: { raw_iron: 1 },
      recipeText: '1x ⛏️ Iron -> 1x 🔫 Gun',
      initialInput: { raw_iron: 8 },
      inputPos: { x: -640, z: 160 },
      stationPos: { x: -380, z: 160 },
      pickupPos: { x: -120, z: 160 },
      unlockPos: { x: -380, z: 160 },
      description: 'Requires 1x ⛏️ Super Iron Ore in its Input Hopper to forge 1x AR-23 Liberator Rifle.'
    },
    {
      id: 'cloth',
      tier: 2,
      name: 'B-01 Tactical Cape & Armor',
      shortName: 'Cape & Armor',
      icon: '🦺',
      color: '#facc15',
      unlockedAtStart: true,
      unlockCost: 0,
      sellPrice: 30,
      cycleTime: 1.45,
      maxBuffer: 14,
      initialStock: 4,
      rawType: 'raw_e710',
      recipe: { raw_e710: 1 },
      recipeText: '1x 🛢️ E-710 -> 1x 🦺 Cloth',
      initialInput: { raw_e710: 8 },
      inputPos: { x: -640, z: 520 },
      stationPos: { x: -380, z: 520 },
      pickupPos: { x: -120, z: 520 },
      unlockPos: { x: -380, z: 520 },
      description: 'Requires 1x 🛢️ E-710 Polymer in its Input Hopper to weave 1x B-01 Tactical Armor & Cape.'
    },
    {
      id: 'resource',
      tier: 3,
      name: 'E-710 Munitions Crate',
      shortName: 'Munitions Crate',
      icon: '📦',
      color: '#22c55e',
      unlockedAtStart: false,
      unlockCost: 150,
      sellPrice: 85,
      cycleTime: 2.0,
      maxBuffer: 12,
      initialStock: 3,
      rawType: 'raw_e710',
      recipe: { raw_iron: 1, raw_e710: 1 },
      recipeText: '1⛏️ + 1🛢️ -> 1x 📦 Crate',
      initialInput: { raw_iron: 5, raw_e710: 5 },
      inputPos: { x: -640, z: 880 },
      stationPos: { x: -380, z: 880 },
      pickupPos: { x: -120, z: 880 },
      unlockPos: { x: -380, z: 880 },
      description: 'Combines 1x ⛏️ Iron + 1x 🛢️ E-710 to pack high-value ordnance crates.'
    },
    {
      id: 'equipment',
      tier: 4,
      name: 'SH-32 Ballistic Jump Pack',
      shortName: 'Tac-Jump Pack',
      icon: '🎒',
      color: '#a855f7',
      unlockedAtStart: false,
      unlockCost: 400,
      sellPrice: 155,
      cycleTime: 2.5,
      maxBuffer: 10,
      initialStock: 2,
      rawType: 'raw_e710',
      recipe: { raw_iron: 1, raw_e710: 2 },
      recipeText: '1⛏️ + 2🛢️ -> 1x 🎒 Pack',
      initialInput: { raw_iron: 4, raw_e710: 6 },
      inputPos: { x: -640, z: 1240 },
      stationPos: { x: -380, z: 1240 },
      pickupPos: { x: -120, z: 1240 },
      unlockPos: { x: -380, z: 1240 },
      description: 'Combines 1x ⛏️ Iron + 2x 🛢️ E-710 to assemble personal shield & jump packs.'
    },
    {
      id: 'vehicle',
      tier: 5,
      name: 'M-102 Fast Recon Vehicle (車)',
      shortName: 'Recon Vehicle (車)',
      icon: '🚙',
      color: '#f97316',
      unlockedAtStart: false,
      unlockCost: 1100,
      sellPrice: 340,
      cycleTime: 3.1,
      maxBuffer: 8,
      initialStock: 2,
      rawType: 'raw_iron',
      recipe: { raw_iron: 2, raw_e710: 1 },
      recipeText: '2⛏️ + 1🛢️ -> 1x 🚙 Vehicle',
      initialInput: { raw_iron: 6, raw_e710: 4 },
      inputPos: { x: 740, z: 1000 },
      stationPos: { x: 1020, z: 1000 },
      pickupPos: { x: 1300, z: 1000 },
      unlockPos: { x: 1020, z: 1000 },
      description: 'Combines 2x ⛏️ Iron + 1x 🛢️ E-710 in Sector D Hangar to build armored Recon Vehicles.'
    },
    {
      id: 'mech',
      tier: 6,
      name: 'EXO-45 Patriot Exosuit (機甲)',
      shortName: 'Patriot Mech (機甲)',
      icon: '🤖',
      color: '#ef4444',
      unlockedAtStart: false,
      unlockCost: 2600,
      sellPrice: 720,
      cycleTime: 3.9,
      maxBuffer: 6,
      initialStock: 2,
      rawType: 'raw_iron',
      recipe: { raw_iron: 3, raw_e710: 2 },
      recipeText: '3⛏️ + 2🛢️ -> 1x 🤖 Mech',
      initialInput: { raw_iron: 6, raw_e710: 4 },
      inputPos: { x: 740, z: 1300 },
      stationPos: { x: 1020, z: 1300 },
      pickupPos: { x: 1300, z: 1300 },
      unlockPos: { x: 1020, z: 1300 },
      description: 'Combines 3x ⛏️ Iron + 2x 🛢️ E-710 to construct bipedal EXO-45 Patriot Walkers.'
    },
    {
      id: 'warship',
      tier: 7,
      name: 'SES Super Destroyer (Warship)',
      shortName: 'Super Destroyer',
      icon: '🚀',
      color: '#ec4899',
      unlockedAtStart: false,
      unlockCost: 6000,
      sellPrice: 1750,
      cycleTime: 4.8,
      maxBuffer: 5,
      initialStock: 1,
      rawType: 'raw_e710',
      recipe: { raw_iron: 4, raw_e710: 4 },
      recipeText: '4⛏️ + 4🛢️ -> 1x 🚀 Warship',
      initialInput: { raw_iron: 8, raw_e710: 8 },
      inputPos: { x: 740, z: 1600 },
      stationPos: { x: 1020, z: 1600 },
      pickupPos: { x: 1300, z: 1600 },
      unlockPos: { x: 1020, z: 1600 },
      description: 'Combines 4x ⛏️ Iron + 4x 🛢️ E-710 in Orbital Drydock to commission SES Super Destroyers.'
    }
  ],

  // --------------------------------------------------------------------------
  // ZERO-OVERLAP KEY LOCATIONS ACROSS THE 4200 x 3800 WORLD
  // --------------------------------------------------------------------------
  LOCATIONS: {
    armoryLoadoutPad: { x: 180, z: 680, radius: 95 },
    counterDropZone: { x: 640, z: 220, radius: 120 },
    counterTable: { x: 900, z: 220, width: 240, depth: 340 },
    cashRegisterZone: { x: 900, z: 540, radius: 120 },
    trashCanZone: { x: -1720, z: 1560, radius: 85 },
    customerSpawn: { x: 1920, z: 220 },
    customerQueueStart: { x: 1160, z: 220 },
    customerQueueSpacing: 86,
    customerExit: { x: 1920, z: -40 },
    brazierWest: { x: -760, z: -1540, radius: 95, cost: 3 },
    brazierEast: { x: 760, z: -1540, radius: 95, cost: 3 }
  },

  UPGRADES: [
    {
      id: 'seaf_miner',
      name: 'Hire SEAF Quarry Miner (採礦兵)',
      icon: '⛏️',
      baseCost: 95,
      costMultiplier: 1.6,
      maxLevel: 8,
      description: 'Deploys a SEAF Miner who automatically hauls ⛏️ Iron & 🛢️ E-710 from the Quarry into Factory & Ammo Input Hoppers!'
    },
    {
      id: 'raw_speed_boost',
      name: 'Overclock Quarry & Expand Scale',
      icon: '⚙️',
      baseCost: 90,
      costMultiplier: 1.55,
      maxLevel: 15,
      description: 'Increases Super Iron & E-710 Auto-Drill generation speed (+35%/lvl) and expands Quarry capacity.'
    },
    {
      id: 'seaf_ammo_hauler',
      name: 'Hire SEAF Ammo & Gate Engineer (搬彈修門兵)',
      icon: '🧱',
      baseCost: 110,
      costMultiplier: 1.65,
      maxLevel: 8,
      description: 'Deploys a SEAF Engineer who carries (搬) 🧱 Ammo from the Munitions Press to Gate Layers 3, 2, 1 AND repairs damaged Gates!'
    },
    {
      id: 'seaf_carrier',
      name: 'Hire SEAF Logistics Trooper',
      icon: '🪖',
      baseCost: 120,
      costMultiplier: 1.65,
      maxLevel: 8,
      description: 'Deploys a SEAF Trooper who hauls finished Guns, Cloth, Vehicles & Mechs from Output Pads to the Sales Counter.'
    },
    {
      id: 'seaf_cashier',
      name: 'Deploy Auto-Cashier Drone',
      icon: '🤖',
      baseCost: 220,
      costMultiplier: 2.0,
      maxLevel: 4,
      description: 'Automatically serves queued Helldivers faster and streams Requisition bills straight to your wallet.'
    },
    {
      id: 'player_boots',
      name: 'Jump-Jet Servo Boots',
      icon: '⚡',
      baseCost: 100,
      costMultiplier: 1.6,
      maxLevel: 8,
      description: 'Increases Commander movement speed (+14%/lvl) and War-Zone snowplow radius.'
    },
    {
      id: 'player_exo_rig',
      name: 'Heavy Back-Stack Rig',
      icon: '🎒',
      baseCost: 130,
      costMultiplier: 1.65,
      maxLevel: 8,
      description: 'Adds +5 max carry capacity to your vertical back-stack per upgrade level.'
    },
    {
      id: 'factory_overclock',
      name: 'Super Uranium Factory Turbines',
      icon: '🔋',
      baseCost: 180,
      costMultiplier: 1.75,
      maxLevel: 10,
      description: 'Speeds up all 7 weapon, vehicle, mech, and warship assembly lines by +22% per level.'
    }
  ],

  PERMANENT_SKILLS: [
    {
      id: 'perm_gun_value',
      name: 'High-Caliber Arsenal Contracts',
      icon: '🔫',
      baseMedalCost: 2,
      costScale: 1.5,
      maxLevel: 15,
      desc: 'PERMANENT: +25% sale price on all Guns, Cloth, Vehicles, Mechs & Warships forever (kept after defeat).'
    },
    {
      id: 'perm_raw_speed',
      name: 'Deep-Mantle Tectonic Drills',
      icon: '⛏️',
      baseMedalCost: 2,
      costScale: 1.5,
      maxLevel: 15,
      desc: 'PERMANENT: +35% Raw Material Quarry & Munitions Press speed + 30% chance to save Raw Ore when crafting!'
    },
    {
      id: 'perm_gate_armor',
      name: '3-Layer Titanium Gate Bulkheads',
      icon: '🛡️',
      baseMedalCost: 2,
      costScale: 1.5,
      maxLevel: 15,
      desc: 'PERMANENT: +40% Max HP on all 3 Gate Layers (Gate 3, Gate 2, Gate 1) and +8 HP/sec automatic Gate self-repair forever.'
    },
    {
      id: 'perm_turret_power',
      name: 'Orbital Autoloader Munitions',
      icon: '🗼',
      baseMedalCost: 3,
      costScale: 1.6,
      maxLevel: 12,
      desc: 'PERMANENT: +35% Gate Turret damage across all 3 Layers and 25% chance per shot not to consume 🧱 Ammo forever.'
    },
    {
      id: 'perm_start_grant',
      name: 'Ministry Priority Drop Grant',
      icon: '💰',
      baseMedalCost: 3,
      costScale: 1.6,
      maxLevel: 10,
      desc: 'PERMANENT: Start every deployment with +$250 Requisition, +4 Carry Capacity, and +4 Raw Ore in all Hoppers per level.'
    },
    {
      id: 'perm_commander_elite',
      name: 'Viper Commando Stim Infusion',
      icon: '🦅',
      baseMedalCost: 3,
      costScale: 1.6,
      maxLevel: 10,
      desc: 'PERMANENT: +15% Commander & SEAF move speed and +35% personal weapon & Guard Dog drone damage forever.'
    }
  ]
};
