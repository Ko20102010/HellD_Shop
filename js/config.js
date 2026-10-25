// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.02
// Module: Configuration, 2D Factorio Map, 3 Gates, Conveyors & Permanent Skills
// ============================================================================

window.GameConfig = {
  VERSION: 'v0.0.02',
  STORAGE_KEY: 'helldivers_please_save_v0002',
  LEGACY_KEYS: ['helldivers_please_save_v0001', 'helldivers_please_save_v0000'],

  // Expanded 2D Factorio + Carbot World Bounds (Center is 0,0)
  // Shop Floor: y in [-220, +980], x in [-1250, +1250]
  // Outer War Zone: y in [-1050, -220], x in [-1250, +1250]
  WORLD: {
    minX: -1240,
    maxX: 1240,
    minZ: -1020,
    maxZ: 960,
    wallZ: -220, // Perimeter defensive wall separating Shop Floor (z > -220) and War Zone (z < -220)
    gateWidth: 150
  },

  PLAYER: {
    baseSpeed: 255,
    sprintMultiplier: 1.55,
    baseCapacity: 14,
    pickupRadius: 88,
    transferInterval: 0.065, // ~15 items/sec parabolic transfer
    attackRange: 250,
    attackCooldown: 0.22,
    attackDamage: 26,
    plowRadius: 95
  },

  // --------------------------------------------------------------------------
  // RAW MATERIAL EXTRACTORS (Upgradable Generation Speed!)
  // --------------------------------------------------------------------------
  RAW_EXTRACTORS: [
    {
      id: 'raw_iron',
      name: 'Super Iron Ore Drill',
      shortName: 'Iron Drill',
      icon: '⛏️',
      color: '#38bdf8',
      x: -920,
      z: 660,
      padX: -790,
      padZ: 660,
      baseCycleTime: 1.8,
      baseUpgradeCost: 80,
      costScale: 1.55,
      maxBuffer: 20,
      desc: 'Extracts raw Super Iron Ore to accelerate Gun, Vehicle & Mech assembly and feed the Munitions Press.'
    },
    {
      id: 'raw_e710',
      name: 'E-710 Hyper-Fuel Pump',
      shortName: 'E-710 Pump',
      icon: '🛢️',
      color: '#a855f7',
      x: -920,
      z: 360,
      padX: -790,
      padZ: 360,
      baseCycleTime: 2.0,
      baseUpgradeCost: 100,
      costScale: 1.55,
      maxBuffer: 20,
      desc: 'Refines raw E-710 fuel to accelerate Cloth, Stratagem, Exosuit & Destroyer output and turret ammo synthesis.'
    }
  ],

  // --------------------------------------------------------------------------
  // MUNITIONS PRESS (Produces Turret Ammo 🧱 for Gate Turrets!)
  // Starts with manual hauling (搬) to Gate Turrets; upgradable to Conveyor Belts!
  // --------------------------------------------------------------------------
  AMMO_PRESS: {
    id: 'ammo',
    name: 'Munitions Ammo Press',
    shortName: 'Ammo Press',
    icon: '🧱',
    color: '#f97316',
    x: -640,
    z: 60,
    padX: -520,
    padZ: 60,
    baseCycleTime: 1.15,
    maxBuffer: 30,
    initialStock: 10,
    desc: 'Synthesizes Heavy Turret Ammo (🧱). Carry (搬) ammo to Gate Turrets or build Factorio Conveyor Belts!'
  },

  // --------------------------------------------------------------------------
  // THREE NORTHERN WAR-ZONE DEFENSE GATES (Start with 1, Expand to 3)
  // Enemies attack active Gates. If ANY Gate HP reaches 0 -> Base Overrun (Lose)!
  // --------------------------------------------------------------------------
  GATES: [
    {
      id: 'gate_1',
      index: 0,
      name: 'Gate Alpha (Center)',
      shortName: 'Gate Alpha',
      x: 0,
      z: -220,
      turretX: 0,
      turretZ: -150,
      ammoPadX: -95,
      ammoPadZ: -140,
      unlockPadX: 0,
      unlockPadZ: -140,
      unlockedAtStart: true,
      unlockCost: 0,
      baseMaxHp: 600,
      turretName: 'A/AC-8 Dual Autocannon',
      turretRange: 390,
      turretFireRate: 0.42,
      turretDamage: 38,
      maxAmmo: 40,
      initialAmmo: 18,
      conveyorId: 'conv_gate_1',
      conveyorCost: 180,
      color: '#facc15',
      desc: 'Primary central blast gate to the Automaton War Zone.'
    },
    {
      id: 'gate_2',
      index: 1,
      name: 'Gate Beta (West Wing)',
      shortName: 'Gate Beta',
      x: -620,
      z: -220,
      turretX: -620,
      turretZ: -150,
      ammoPadX: -715,
      ammoPadZ: -140,
      unlockPadX: -620,
      unlockPadZ: -135,
      unlockedAtStart: false,
      unlockCost: 400,
      baseMaxHp: 850,
      turretName: 'A/MG-43 Heavy Gatling Sentry',
      turretRange: 420,
      turretFireRate: 0.28,
      turretDamage: 32,
      maxAmmo: 50,
      initialAmmo: 25,
      conveyorId: 'conv_gate_2',
      conveyorCost: 260,
      color: '#38bdf8',
      desc: 'Unlocks the Western Front Gate, spawns +40% more Helldiver customers & rich Scrap veins!'
    },
    {
      id: 'gate_3',
      index: 2,
      name: 'Gate Gamma (East Wing)',
      shortName: 'Gate Gamma',
      x: 620,
      z: -220,
      turretX: 620,
      turretZ: -150,
      ammoPadX: 525,
      ammoPadZ: -140,
      unlockPadX: 620,
      unlockPadZ: -135,
      unlockedAtStart: false,
      unlockCost: 850,
      baseMaxHp: 1200,
      turretName: 'A/MLS-4X Railcannon Sentry',
      turretRange: 460,
      turretFireRate: 0.50,
      turretDamage: 75,
      maxAmmo: 60,
      initialAmmo: 30,
      conveyorId: 'conv_gate_3',
      conveyorCost: 380,
      color: '#f97316',
      desc: 'Unlocks the Eastern Heavy Sector, high-value Hulk hunting & +60% Helldiver customer surge!'
    }
  ],

  // --------------------------------------------------------------------------
  // FACTORIO CONVEYOR BELT UPGRADES
  // --------------------------------------------------------------------------
  CONVEYORS: [
    {
      id: 'conv_raw_feed',
      name: 'Raw Ore -> Factory & Ammo Belt',
      icon: '⚙️',
      cost: 140,
      padX: -780,
      padZ: 210,
      color: '#38bdf8',
      desc: 'Connects Iron & E-710 Drills directly to the Munitions Press & Assembly Lines (+50% output speed)!'
    },
    {
      id: 'conv_gate_1',
      name: 'Ammo Belt -> Gate Alpha Turret',
      icon: '⏩',
      cost: 180,
      gateId: 'gate_1',
      padX: -210,
      padZ: -140,
      color: '#facc15',
      desc: 'Factorio conveyor belt automatically feeds 🧱 Ammo from the Munitions Press into Gate Alpha Turret!'
    },
    {
      id: 'conv_gate_2',
      name: 'Ammo Belt -> Gate Beta Turret',
      icon: '⏩',
      cost: 260,
      gateId: 'gate_2',
      padX: -820,
      padZ: -140,
      color: '#38bdf8',
      desc: 'Factorio conveyor belt automatically feeds 🧱 Ammo into Gate Beta Turret (West)!'
    },
    {
      id: 'conv_gate_3',
      name: 'Ammo Belt -> Gate Gamma Turret',
      icon: '⏩',
      cost: 380,
      gateId: 'gate_3',
      padX: 410,
      padZ: -140,
      color: '#f97316',
      desc: 'Factorio conveyor belt automatically feeds 🧱 Ammo into Gate Gamma Turret (East)!'
    },
    {
      id: 'conv_counter_auto',
      name: 'Factory -> Sales Counter Belt',
      icon: '🛒',
      cost: 320,
      padX: -140,
      padZ: 280,
      color: '#22c55e',
      desc: 'Factorio logistics belt automatically transfers finished Guns, Cloth & Gear to the Sales Counter!'
    }
  ],

  // --------------------------------------------------------------------------
  // 7 ARSENAL PRODUCTION LINES (Both Cloth & Gun Unlocked at Start!)
  // --------------------------------------------------------------------------
  ITEMS: [
    {
      id: 'cloth',
      tier: 1,
      name: 'B-01 Tactical Cape & Armor',
      shortName: 'Cape & Armor',
      icon: '🦺',
      color: '#facc15',
      unlockedAtStart: true,
      unlockCost: 0,
      sellPrice: 25,
      cycleTime: 1.5,
      maxBuffer: 14,
      initialStock: 4,
      rawType: 'raw_e710',
      stationPos: { x: -380, z: 420 },
      pickupPos: { x: -260, z: 420 },
      unlockPos: { x: -320, z: 420 },
      description: 'Standard-issue titanium-weave Helldiver armor and cape. Unlocked at start!'
    },
    {
      id: 'gun',
      tier: 2,
      name: 'AR-23 Liberator Rifle',
      shortName: 'Liberator Gun',
      icon: '🔫',
      color: '#38bdf8',
      unlockedAtStart: true,
      unlockCost: 0,
      sellPrice: 45,
      cycleTime: 1.65,
      maxBuffer: 14,
      initialStock: 4,
      rawType: 'raw_iron',
      stationPos: { x: -380, z: 210 },
      pickupPos: { x: -260, z: 210 },
      unlockPos: { x: -320, z: 210 },
      description: 'High-demand bullpup assault rifle for Helldiver squads. Unlocked & pre-stocked at start!'
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
      sellPrice: 75,
      cycleTime: 2.1,
      maxBuffer: 12,
      initialStock: 3,
      rawType: 'raw_e710',
      stationPos: { x: -380, z: 630 },
      pickupPos: { x: -260, z: 630 },
      unlockPos: { x: -260, z: 630 },
      description: 'Refined Element-710 fuel cells, stims, and high-explosive magazines.'
    },
    {
      id: 'equipment',
      tier: 4,
      name: 'SH-32 Ballistic Jump Pack',
      shortName: 'Tac-Equipment',
      icon: '🎒',
      color: '#a855f7',
      unlockedAtStart: false,
      unlockCost: 400,
      sellPrice: 140,
      cycleTime: 2.6,
      maxBuffer: 10,
      initialStock: 2,
      rawType: 'raw_e710',
      stationPos: { x: -40, z: 630 },
      pickupPos: { x: 80, z: 630 },
      unlockPos: { x: 80, z: 630 },
      description: 'Personal shield generators, jump packs, and orbital laser beacons.'
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
      sellPrice: 310,
      cycleTime: 3.3,
      maxBuffer: 8,
      initialStock: 2,
      rawType: 'raw_iron',
      stationPos: { x: 340, z: 660 },
      pickupPos: { x: 340, z: 530 },
      unlockPos: { x: 340, z: 530 },
      description: 'All-terrain armored buggy mounted with a heavy twin-linked HMG.'
    },
    {
      id: 'mech',
      tier: 6,
      name: 'EXO-45 Patriot Exosuit (機甲)',
      shortName: 'Patriot Mech (機甲)',
      icon: '🤖',
      color: '#ef4444',
      unlockedAtStart: false,
      unlockCost: 2800,
      sellPrice: 680,
      cycleTime: 4.2,
      maxBuffer: 6,
      initialStock: 2,
      rawType: 'raw_iron',
      stationPos: { x: 680, z: 660 },
      pickupPos: { x: 680, z: 530 },
      unlockPos: { x: 680, z: 530 },
      description: 'Heavy bipedal combat walker armed with rocket pods and rotary cannon.'
    },
    {
      id: 'warship',
      tier: 7,
      name: 'SES Super Destroyer (Warship)',
      shortName: 'Super Destroyer',
      icon: '🚀',
      color: '#ec4899',
      unlockedAtStart: false,
      unlockCost: 6500,
      sellPrice: 1650,
      cycleTime: 5.2,
      maxBuffer: 5,
      initialStock: 1,
      rawType: 'raw_e710',
      stationPos: { x: 980, z: 660 },
      pickupPos: { x: 980, z: 530 },
      unlockPos: { x: 980, z: 530 },
      description: 'Orbital Battleship Warship charter packet with full 500kg Eagle bay.'
    }
  ],

  // --------------------------------------------------------------------------
  // MULTI-STALL SALES COUNTER & SKY-HIGH CASH TOWERS
  // --------------------------------------------------------------------------
  LOCATIONS: {
    counterDropZone: { x: 120, z: 220, radius: 130 },
    counterTable: { x: 260, z: 220, width: 220, depth: 340 },
    cashRegisterZone: { x: 280, z: 450, radius: 125 },
    trashCanZone: { x: -560, z: 460, radius: 75 },
    customerSpawn: { x: 1120, z: 220 },
    customerQueueStart: { x: 430, z: 220 },
    customerQueueSpacing: 76,
    customerExit: { x: 1120, z: -40 },
    // War Zone Cryo-Pods (Thaw frozen Helldivers with E-710)
    brazierWest: { x: -420, z: -560, radius: 95, cost: 3 },
    brazierEast: { x: 420, z: -560, radius: 95, cost: 3 }
  },

  // --------------------------------------------------------------------------
  // IN-RUN UPGRADES (SEAF Staff, Raw Speed, Turret Boosts)
  // --------------------------------------------------------------------------
  UPGRADES: [
    {
      id: 'raw_speed_boost',
      name: 'Overclock Raw Material Drills',
      icon: '⛏️',
      baseCost: 90,
      costMultiplier: 1.55,
      maxLevel: 15,
      description: 'Increases Super Iron & E-710 Raw Extractor speed by +35% per level and speeds up Munitions Press.'
    },
    {
      id: 'seaf_ammo_hauler',
      name: 'Hire SEAF Ammo Hauler (搬彈兵)',
      icon: '🧱',
      baseCost: 110,
      costMultiplier: 1.65,
      maxLevel: 6,
      description: 'Deploys a Carbot SEAF Trooper who automatically carries (搬) 🧱 Ammo from the Munitions Press to Gate Turrets!'
    },
    {
      id: 'seaf_carrier',
      name: 'Hire SEAF Logistics Trooper',
      icon: '🪖',
      baseCost: 120,
      costMultiplier: 1.65,
      maxLevel: 8,
      description: 'Deploys an automated Carbot SEAF Trooper who hauls Guns, Cloth & Gear from factories to the Sales Counter.'
    },
    {
      id: 'seaf_cashier',
      name: 'Deploy Auto-Cashier Drone',
      icon: '🤖',
      baseCost: 220,
      costMultiplier: 2.0,
      maxLevel: 3,
      description: 'Automatically serves queued Helldivers faster and streams Requisition bills straight to your account.'
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
      icon: '⚙️',
      baseCost: 180,
      costMultiplier: 1.75,
      maxLevel: 10,
      description: 'Speeds up all 7 weapon, vehicle, mech, and warship assembly lines by +22% per level.'
    }
  ],

  // --------------------------------------------------------------------------
  // PERMANENT SKILL TREE (KEPT FOREVER EVEN WHEN A GATE FALLS / LOSE!)
  // Uses Warbond Medals (⭐) earned from serving customers, killing enemies,
  // or converting Requisition ($REQ -> ⭐).
  // --------------------------------------------------------------------------
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
      desc: 'PERMANENT: +35% Raw Material & Munitions Press generation speed forever.'
    },
    {
      id: 'perm_gate_armor',
      name: 'Super Titanium Gate Bulkheads',
      icon: '🛡️',
      baseMedalCost: 2,
      costScale: 1.5,
      maxLevel: 15,
      desc: 'PERMANENT: +40% Max Gate HP on all 3 Gates and +6 HP/sec automatic Gate self-repair forever.'
    },
    {
      id: 'perm_turret_power',
      name: 'Orbital Autoloader Munitions',
      icon: '🗼',
      baseMedalCost: 3,
      costScale: 1.6,
      maxLevel: 12,
      desc: 'PERMANENT: +35% Gate Turret damage and 25% chance per shot not to consume 🧱 Ammo forever.'
    },
    {
      id: 'perm_start_grant',
      name: 'Ministry Priority Drop Grant',
      icon: '💰',
      baseMedalCost: 3,
      costScale: 1.6,
      maxLevel: 10,
      desc: 'PERMANENT: Start every new deployment (after defeat/reset) with +$250 Requisition and +4 Carry Capacity per level.'
    },
    {
      id: 'perm_commander_elite',
      name: 'Viper Commando Stim Infusion',
      icon: '🦅',
      baseMedalCost: 3,
      costScale: 1.6,
      maxLevel: 10,
      desc: 'PERMANENT: +15% Commander & SEAF move speed and +35% personal rifle damage forever.'
    }
  ]
};
