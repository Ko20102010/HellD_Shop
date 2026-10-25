// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.05 (20+ Hour Long-Term Campaign & 20-Level Automation Edition)
// Module: Configuration, 4200x3800 Zero-Overlap Map, 1-Item Start Progression,
//         20-Level Upgrades for All Belts/Machines/Quarry/Gates, Wave & Rest
//         System, 8-Planet Galactic Campaign & 12-Unit Character Roster
// ============================================================================

window.GameConfig = {
  VERSION: 'v0.0.05',
  // Fresh save key so legacy v0.0.03/v0.0.04 saves don't pre-unlock belts or items!
  STORAGE_KEY: 'helldivers_please_save_v0005',
  MAX_LEVEL: 20,

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
    baseCapacity: 14,
    pickupRadius: 92,
    transferInterval: 0.06,
    attackRange: 280,
    attackCooldown: 0.24,
    attackDamage: 26,
    plowRadius: 105
  },

  // --------------------------------------------------------------------------
  // WAVE & REST TIME SYSTEM (Designed for 20+ Hours / 200+ Waves Progression)
  // --------------------------------------------------------------------------
  WAVE_CONFIG: {
    initialRestTime: 45,       // 45s peaceful prep before Wave 1 begins
    betweenWaveRestTime: 35,   // 35s rest & repair time between waves
    baseEnemyCount: 5,         // Wave 1 has 5 enemies
    enemiesPerWave: 3,         // +3 enemies per wave
    spawnIntervalInWave: 1.85, // Time between enemy spawns during an active wave
    bossWaveEvery: 5           // Every 5th wave is a Boss Siege Wave!
  },

  // --------------------------------------------------------------------------
  // 8-PLANET GALACTIC CAMPAIGN (20+ Hours Long-Term Progression)
  // --------------------------------------------------------------------------
  CAMPAIGN_PLANETS: [
    {
      id: 'planet_1',
      index: 1,
      name: 'Sector 1: Angel\'s Venture (安傑爾冒險星)',
      waveStart: 1,
      waveEnd: 5,
      reqMult: 1.0,
      enemyHpMult: 1.0,
      rewardMedals: 3,
      desc: 'Training Operation: Establish your first Cloth & Gun lines and hold Outer Gate 3 through Wave 5.'
    },
    {
      id: 'planet_2',
      index: 2,
      name: 'Sector 2: Heeth Cryo-Tundra (希斯冰原星)',
      waveStart: 6,
      waveEnd: 15,
      reqMult: 1.35,
      enemyHpMult: 1.4,
      rewardMedals: 6,
      desc: 'Terminid Swarm Front: Expand Quarry Drills to Lv.5+, unlock Munitions Crates, and survive Wave 15.'
    },
    {
      id: 'planet_3',
      index: 3,
      name: 'Sector 3: Tien Kwan Mech Forge (天關機甲工業星)',
      waveStart: 16,
      waveEnd: 30,
      reqMult: 1.8,
      enemyHpMult: 2.1,
      rewardMedals: 10,
      desc: 'Liberate the EXO-45 Patriot Exosuit factories and upgrade Conveyor Belts to Lv.10+.'
    },
    {
      id: 'planet_4',
      index: 4,
      name: 'Sector 4: Malevelon Creek (瑪레弗隆溪谷)',
      waveStart: 31,
      waveEnd: 50,
      reqMult: 2.5,
      enemyHpMult: 3.2,
      rewardMedals: 16,
      desc: 'Heavy Automaton Hulk Siege: Fortify all 3 Gate Layers to Lv.12+ and deploy Guard Dog drones.'
    },
    {
      id: 'planet_5',
      index: 5,
      name: 'Sector 5: Meridia Supercolony (梅里迪亞超級蟲巢)',
      waveStart: 51,
      waveEnd: 75,
      reqMult: 3.5,
      enemyHpMult: 4.8,
      rewardMedals: 25,
      desc: 'High-Intensity Swarm: Commission SES Super Destroyers and push factory stations toward Lv.15.'
    },
    {
      id: 'planet_6',
      index: 6,
      name: 'Sector 6: Cyberstan Outskirts (生化斯坦外圍防線)',
      waveStart: 76,
      waveEnd: 100,
      reqMult: 5.0,
      enemyHpMult: 7.0,
      rewardMedals: 40,
      desc: 'Armored Legion Assault: Max out Lv.20 Turbo Conveyor Belts and Lv.20 Gate Railcannons.'
    },
    {
      id: 'planet_7',
      index: 7,
      name: 'Sector 7: Cyberstan Iron Citadel (生化斯坦核心母星)',
      waveStart: 101,
      waveEnd: 150,
      reqMult: 7.5,
      enemyHpMult: 10.5,
      rewardMedals: 65,
      desc: 'Supreme Super Earth Offensive: Full Lv.20 Mega-Factory mastery across all 7 production lines.'
    },
    {
      id: 'planet_8',
      index: 8,
      name: 'Sector 8: Endless Galactic Front (無盡銀河遠征 Wave 151+)',
      waveStart: 151,
      waveEnd: 9999,
      reqMult: 12.0,
      enemyHpMult: 15.0,
      rewardMedals: 100,
      desc: 'Infinite 20+ Hour Endgame Mode with compounding Prestige Ascension multipliers!'
    }
  ],

  // --------------------------------------------------------------------------
  // 24 LONG-TERM COMMAND MILESTONES / ACHIEVEMENTS (🏆 成就系統)
  // --------------------------------------------------------------------------
  MILESTONES: [
    { id: 'ms_first_cloth', name: 'First Cape Woven', desc: 'Serve 5 Helldiver customers.', check: (g) => g.totalServed >= 5, rewardMedals: 1 },
    { id: 'ms_unlock_gun', name: 'Second Amendment of Super Earth', desc: 'Unlock the AR-23 Liberator Gun factory.', check: (g) => !!g.unlocked.gun, rewardMedals: 1 },
    { id: 'ms_unlock_iron_drill', name: 'Automated Metallurgy', desc: 'Unlock the Auto Iron Quarry Drill (Lv.1+).', check: (g) => (g.rawExtractors.raw_iron?.level || 0) >= 1, rewardMedals: 1 },
    { id: 'ms_unlock_e710_pump', name: 'Element-710 Pipeline', desc: 'Unlock the Auto E-710 Fuel Pump (Lv.1+).', check: (g) => (g.rawExtractors.raw_e710?.level || 0) >= 1, rewardMedals: 1 },
    { id: 'ms_first_belt', name: 'Factorio Initiate', desc: 'Unlock your first Conveyor Belt (Lv.1+).', check: (g) => Object.values(g.conveyorLevels || {}).some((v) => v >= 1), rewardMedals: 2 },
    { id: 'ms_wave_5', name: 'Angel\'s Venture Veteran', desc: 'Clear Enemy Wave 5.', check: (g) => g.waveNumber > 5, rewardMedals: 3 },
    { id: 'ms_wave_15', name: 'Heeth Survivor', desc: 'Clear Enemy Wave 15.', check: (g) => g.waveNumber > 15, rewardMedals: 5 },
    { id: 'ms_wave_30', name: 'Hero of Tien Kwan', desc: 'Clear Enemy Wave 30.', check: (g) => g.waveNumber > 30, rewardMedals: 8 },
    { id: 'ms_wave_50', name: 'Legend of Malevelon Creek', desc: 'Clear Enemy Wave 50.', check: (g) => g.waveNumber > 50, rewardMedals: 15 },
    { id: 'ms_served_100', name: 'Quartermaster General', desc: 'Serve 100 Helldiver customers across your career.', check: (g) => g.lifetimeServed >= 100, rewardMedals: 4 },
    { id: 'ms_served_500', name: ' Arsenal of Democracy', desc: 'Serve 500 Helldiver customers across your career.', check: (g) => g.lifetimeServed >= 500, rewardMedals: 10 },
    { id: 'ms_kills_200', name: 'Scrap Metal Collector', desc: 'Eliminate 200 enemies across your career.', check: (g) => g.lifetimeKills >= 200, rewardMedals: 5 },
    { id: 'ms_kills_1000', name: 'Bane of Cyberstan', desc: 'Eliminate 1,000 enemies across your career.', check: (g) => g.lifetimeKills >= 1000, rewardMedals: 15 },
    { id: 'ms_unlock_mech', name: 'Heavy Walker Assembly', desc: 'Unlock the EXO-45 Patriot Mech factory.', check: (g) => !!g.unlocked.mech, rewardMedals: 5 },
    { id: 'ms_unlock_warship', name: 'Orbital Fleet Admiral', desc: 'Unlock the SES Super Destroyer Drydock.', check: (g) => !!g.unlocked.warship, rewardMedals: 10 },
    { id: 'ms_belt_lv20', name: 'Lv.20 Turbo Belt Master', desc: 'Upgrade any Conveyor Belt to Max Level 20.', check: (g) => Object.values(g.conveyorLevels || {}).some((v) => v >= 20), rewardMedals: 12 },
    { id: 'ms_station_lv20', name: 'Lv.20 Overclocked Foundry', desc: 'Upgrade any Production Machine to Max Level 20.', check: (g) => Object.values(g.stations || {}).some((s) => (s.level || 0) >= 20), rewardMedals: 12 },
    { id: 'ms_quarry_lv20', name: 'Lv.20 Deep-Core Excavator', desc: 'Upgrade any Raw Quarry Drill to Max Level 20.', check: (g) => Object.values(g.rawExtractors || {}).some((r) => (r.level || 0) >= 20), rewardMedals: 12 },
    { id: 'ms_gate_lv20', name: 'Lv.20 Impenetrable Citadel', desc: 'Fortify any Defense Gate Layer to Max Level 20.', check: (g) => Object.values(g.gates || {}).some((gt) => (gt.defenseLevel || 0) >= 20), rewardMedals: 12 },
    { id: 'ms_ascend_1', name: 'First Galactic Ascension', desc: 'Perform a Galactic Prestige Ascension (Wave 10+) for permanent x2 income.', check: (g) => (g.prestigeCount || 0) >= 1, rewardMedals: 10 }
  ],

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
        desc: 'Standard-issue Helldiver assault rifle. Reliable single-target rapid fire (26 DMG).'
      },
      {
        id: 'w_breaker',
        slot: 'weapon',
        name: 'SG-225 Breaker Auto-Shotgun',
        zhName: 'SG-225 破擊者全自動霰彈槍',
        icon: '💥',
        cost: 350,
        unlockedAtStart: false,
        damageMult: 0.9,
        fireRateMult: 1.15,
        pelletCount: 3,
        tracerColor: '#f97316',
        desc: 'Fires a 3-pellet heavy flechette spread (2.7x total burst damage) that shreds bug swarms!'
      },
      {
        id: 'w_quasar',
        slot: 'weapon',
        name: 'LAS-99 Quasar Heavy Cannon',
        zhName: 'LAS-99 類星體重型雷射砲',
        icon: '⚡',
        cost: 950,
        unlockedAtStart: false,
        damageMult: 3.6,
        fireRateMult: 0.9,
        pelletCount: 1,
        explosive: true,
        tracerColor: '#facc15',
        desc: 'High-energy golden plasma beam (3.6x DMG + AoE splash explosion) built to melt Automaton Hulks!'
      },
      {
        id: 'w_autocannon',
        slot: 'weapon',
        name: 'AC-8 Heavy Flak Autocannon',
        zhName: 'AC-8 重型高爆機砲',
        icon: '🚀',
        cost: 2400,
        unlockedAtStart: false,
        damageMult: 5.5,
        fireRateMult: 1.25,
        pelletCount: 2,
        explosive: true,
        tracerColor: '#ef4444',
        desc: 'Endgame twin-shell explosive autocannon (11x total burst DMG + heavy splash)!'
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
        cost: 320,
        unlockedAtStart: false,
        speedMult: 1.32,
        bonusCap: 4,
        harvestMult: 1.65,
        sellBonus: 0,
        bodyColor: '#14532d',
        capeColor: '#22c55e',
        trimColor: '#86efac',
        desc: '+32% Move Speed, +4 Carry Stack, and +65% faster manual Ore Harvesting & Gate Repair!'
      },
      {
        id: 'a_juggernaut',
        slot: 'armor',
        name: 'FS-05 Devastator Heavy Plate',
        zhName: 'FS-05 毀滅者重裝泰坦甲',
        icon: '🛡️',
        cost: 780,
        unlockedAtStart: false,
        speedMult: 1.15,
        bonusCap: 12,
        harvestMult: 1.35,
        sellBonus: 0.25,
        bodyColor: '#7f1d1d',
        capeColor: '#f59e0b',
        trimColor: '#fde047',
        desc: '+12 Max Carry Stack Capacity, +15% Move Speed, and +25% Requisition Sale Price on all items!'
      },
      {
        id: 'a_admiral',
        slot: 'armor',
        name: 'SA-99 Super Citizen Gold Plate',
        zhName: 'SA-99 超級公民黃金統帥甲',
        icon: '👑',
        cost: 2200,
        unlockedAtStart: false,
        speedMult: 1.38,
        bonusCap: 22,
        harvestMult: 2.2,
        sellBonus: 0.60,
        bodyColor: '#3b0764',
        capeColor: '#facc15',
        trimColor: '#fef08a',
        desc: '+22 Carry Stack, +38% Speed, 2.2x Manual Repair/Harvest speed, and +60% Sale Price!'
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
        cost: 380,
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
        cost: 850,
        unlockedAtStart: false,
        bonusCap: 8,
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
        cost: 1200,
        unlockedAtStart: false,
        speedMult: 1.55,
        bonusCap: 12,
        damageMult: 1.5,
        desc: 'Drive the armored Carbot Recon Buggy! Grants +55% Move Speed, +12 Carry Stack & HMG fire!'
      },
      {
        id: 'm_mech',
        slot: 'mount',
        name: 'Pilot EXO-45 Patriot Exosuit (機甲)',
        zhName: '駕駛 EXO-45 愛國者雙足機甲',
        icon: '🤖',
        cost: 2800,
        unlockedAtStart: false,
        speedMult: 1.30,
        bonusCap: 24,
        damageMult: 2.8,
        desc: 'Pilot the towering Patriot Mech! Grants +24 Carry Stack, 2.8x Weapon Damage & 2x Gate repair speed!'
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
          { icon: '🛢️', color: '#a855f7' },
          { icon: '🦺', color: '#facc15' }
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
        orderBubble: '🦺 0/1'
      },
      stats: 'Orders: 🦺 Cloth (At Start), then 🔫 Gun, 📦 Munitions, 🎒 Jump Pack',
      desc: 'Chubby Carbot bean Helldiver queuing in Sector C. Only orders items you have unlocked! Can be served from the Counter or directly from your hands.'
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
      desc: 'Veteran Carbot Admiral in royal purple-and-gold ceremonial armor with winged crest. Pays massive Requisition slips for vehicles, mechs, and warships.'
    },
    {
      id: 'char_seaf_miner',
      name: 'SEAF Raw Quarry Miner (採礦兵)',
      zhName: 'SEAF 礦區採集兵 (Lv.1–20 原料補給員)',
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
      stats: 'Upgradable Lv.1–20 | Route: Raw Quarry -> Factory Input Hoppers',
      desc: 'Dedicated mining trooper who harvests ⛏️ Super Iron and 🛢️ E-710 from Sector A and feeds them into your factory Input Hoppers.'
    },
    {
      id: 'char_seaf_logistics',
      name: 'SEAF Logistics Trooper',
      zhName: 'SEAF 藍甲後勤搬運兵 (Lv.1–20)',
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
          { icon: '🦺', color: '#facc15' },
          { icon: '🔫', color: '#38bdf8' }
        ]
      },
      stats: 'Upgradable Lv.1–20 | Route: Factory Output -> Sales Counter',
      desc: 'Loyal Super Earth Armed Forces trooper in sky-blue armor. Automatically collects finished Cloth, Guns, and Gear from assembly lines and stocks the Sales Counter.'
    },
    {
      id: 'char_seaf_ammo',
      name: 'SEAF Munitions & Gate Engineer (搬彈修門工兵)',
      zhName: 'SEAF 重裝搬彈與修門工兵 (Lv.1–20)',
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
      stats: 'Upgradable Lv.1–20 | Supplies & Manually Repairs Gate Layers 3, 2, 1',
      desc: 'Ordnance specialist who hauls (搬) 🧱 Ammo from the Munitions Press to the 3 Sequential Gate Layers and manually repairs damaged or broken gates!'
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
      stats: 'Wave Enemy | Attacks: Gate 3 -> Gate 2 -> Gate 1 | Drops: $35 + 🛢️',
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
      stats: 'Boss Wave Unit | Siege DMG: 24 | Drops: $110 + +1 ⭐ Forever Medal!',
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
      stats: 'Fast Wave Unit | Speed: 112 | Drops: $35 + 🛢️ E-710',
      desc: 'Chubby Carbot olive-green chitinous bug with yellow snapping mandibles and skittering legs that rushes the active Defense Gate layer in packs.'
    },
    {
      id: 'char_patriot_mech',
      name: 'EXO-45 Patriot Exosuit (機甲)',
      zhName: 'EXO-45 愛國者雙足機甲 (可升至 Lv.20 & 主角可駕駛)',
      faction: 'Super Earth Heavy Armor',
      badge: '🤖 TIER-6 MECH',
      badgeColor: '#f97316',
      renderType: 'mech',
      renderOpts: {},
      stats: 'Recipe: 3⛏️ Iron + 2🛢️ E-710 | Upgradable Lv.1–20 | Wearable Mount!',
      desc: 'Heavily armored bipedal walker armed with shoulder rocket pods and rotary gatling cannon. Produce it for VIPs OR equip it in 🛡️ Loadout to pilot it yourself!'
    },
    {
      id: 'char_recon_vehicle',
      name: 'M-102 Fast Recon Vehicle (車)',
      zhName: 'M-102 戰術偵察車 (可升至 Lv.20 & 主角可騎乘)',
      faction: 'Super Earth Motor Pool',
      badge: '🚙 TIER-5 VEHICLE',
      badgeColor: '#eab308',
      renderType: 'vehicle',
      renderOpts: {},
      stats: 'Recipe: 2⛏️ Iron + 1🛢️ E-710 | Upgradable Lv.1–20 | Wearable Mount!',
      desc: 'All-terrain armored tactical buggy with yellow roll-cage and roof HMG turret. Produce it for Helldivers OR equip it in 🛡️ Loadout for +55% move speed!'
    },
    {
      id: 'char_gate_turret',
      name: '3-Layer Defense Gate & Dual Sentries',
      zhName: '三層縱深防禦城門 (Lv.1–20 強化 & 破門需手動修復)',
      faction: 'Super Earth Defense Grid',
      badge: '🗼 3-LAYER DEFENSE',
      badgeColor: '#22c55e',
      renderType: 'turret',
      renderOpts: {},
      stats: 'Layers: Outer Gate 3 -> Middle Gate 2 -> Inner Gate 1 (Lv.1–20)',
      desc: 'Three concentric blast walls across the Northern Corridor. When broken (0 HP), a gate CANNOT auto-heal until manually repaired on its pad!'
    }
  ],

  // --------------------------------------------------------------------------
  // SECTOR A: MANUAL HARVEST QUARRY (AT START) + AUTO-DRILL RIGS (Lv.0 Locked -> Lv.20)
  // --------------------------------------------------------------------------
  RAW_EXTRACTORS: [
    {
      id: 'raw_e710',
      name: 'E-710 Fuel Field & Auto-Pump Array',
      shortName: 'E-710 Pump',
      itemIcon: '🛢️',
      icon: '🛢️',
      color: '#a855f7',
      unlockedAtStart: false, // Starts at Lv.0 (Manual Harvest Only at Start!)
      unlockCost: 110,
      maxLevel: 20,
      harvestPos: { x: -1740, z: 180, radius: 135 },
      x: -1400,
      z: 180,
      pickupX: -1150,
      pickupZ: 180,
      padX: -1400,
      padZ: 345,
      baseCycleTime: 1.9,
      baseUpgradeCost: 110,
      costScale: 1.38,
      baseBuffer: 16,
      desc: 'Walk inside the 🛢️ E-710 Field to harvest by hand at start! Unlock Auto-Pump (Lv.1) and upgrade up to Lv.20 for 5-Rig Hyper Extraction.'
    },
    {
      id: 'raw_iron',
      name: 'Super Iron Quarry & Auto-Drill Array',
      shortName: 'Iron Drill',
      itemIcon: '⛏️',
      icon: '⛏️',
      color: '#38bdf8',
      unlockedAtStart: false, // Starts at Lv.0 (Manual Harvest Only at Start!)
      unlockCost: 140,
      maxLevel: 20,
      harvestPos: { x: -1740, z: 680, radius: 135 },
      x: -1400,
      z: 680,
      pickupX: -1150,
      pickupZ: 680,
      padX: -1400,
      padZ: 845,
      baseCycleTime: 1.85,
      baseUpgradeCost: 140,
      costScale: 1.38,
      baseBuffer: 16,
      desc: 'Walk inside the ⛏️ Iron Vein to harvest by hand! Unlock Auto-Drill (Lv.1) and upgrade up to Lv.20 for 5-Rig Deep-Core Mining.'
    }
  ],

  // --------------------------------------------------------------------------
  // MUNITIONS AMMO PRESS (Lv.0 Locked -> Lv.1..20! Requires 1x ⛏️ Iron -> 3x 🧱 Ammo)
  // --------------------------------------------------------------------------
  AMMO_PRESS: {
    id: 'ammo',
    name: 'Munitions Ammo Press',
    shortName: 'Ammo Press',
    icon: '🧱',
    color: '#f97316',
    unlockedAtStart: false, // Must be unlocked ($130) then upgraded Lv.1 -> Lv.20!
    unlockCost: 130,
    baseUpgradeCost: 120,
    costScale: 1.36,
    maxLevel: 20,
    recipe: { raw_iron: 1 },
    outputBatch: 3,
    initialInput: { raw_iron: 6 },
    inputPos: { x: -1700, z: 1280 },
    x: -1440,
    z: 1280,
    padX: -1180,
    padZ: 1280,
    // Place unlock/upgrade pad BELOW the press so the machine never crushes the player!
    unlockPos: { x: -1440, z: 1445 },
    baseCycleTime: 1.6,
    maxBuffer: 30,
    initialStock: 9,
    desc: 'Consumes 1x ⛏️ Iron Ore in its Input Hopper to press 3x 🧱 Heavy Turret Ammo. Upgradable from Lv.1 to Lv.20!'
  },

  // --------------------------------------------------------------------------
  // THREE SEQUENTIAL NORTHERN WAR-ZONE DEFENSE GATE LAYERS (Lv.1 -> Lv.20)
  // (Enemies MUST break Outer Gate 3 -> then Middle Gate 2 -> finally Inner Gate 1!)
  // (When a Gate reaches 0 HP, NO auto HP recovery until manually repaired!)
  // --------------------------------------------------------------------------
  GATES: [
    {
      id: 'gate_3',
      layerOrder: 3,
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
      maxLevel: 20,
      baseUpgradeCost: 150,
      costScale: 1.35,
      baseMaxHp: 750,
      turretName: 'Dual A/MG-43 Forward Sentries',
      turretRange: 460,
      turretFireRate: 0.38,
      turretDamage: 30,
      maxAmmo: 45,
      initialAmmo: 18,
      conveyorId: 'conv_gate_3',
      color: '#f97316',
      desc: 'FIRST DEFENSE LAYER (z = -1320): Enemies attack Gate 3 first! Upgradable Lv.1–20. If broken (0 HP), NO auto-heal until manually repaired on pad!'
    },
    {
      id: 'gate_2',
      layerOrder: 2,
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
      maxLevel: 20,
      baseUpgradeCost: 190,
      costScale: 1.35,
      baseMaxHp: 850,
      turretName: 'Dual A/AC-8 Heavy Autocannons',
      turretRange: 470,
      turretFireRate: 0.35,
      turretDamage: 38,
      maxAmmo: 50,
      initialAmmo: 18,
      conveyorId: 'conv_gate_2',
      color: '#38bdf8',
      desc: 'SECOND DEFENSE LAYER (z = -840): Attacked only after Outer Gate 3 is broken. Upgradable Lv.1–20. No auto-heal when broken!'
    },
    {
      id: 'gate_1',
      layerOrder: 1,
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
      maxLevel: 20,
      baseUpgradeCost: 240,
      costScale: 1.35,
      baseMaxHp: 950,
      turretName: 'Dual A/MLS-4X Railcannon Sentries',
      turretRange: 490,
      turretFireRate: 0.32,
      turretDamage: 48,
      maxAmmo: 60,
      initialAmmo: 24,
      conveyorId: 'conv_gate_1',
      color: '#facc15',
      desc: 'FINAL INNER LAYER (z = -360): Protects the Factory Floor! Upgradable Lv.1–20. If Inner Gate 1 hits 0 HP = Defeat!'
    }
  ],

  // --------------------------------------------------------------------------
  // 5 FACTORIO CONVEYOR BELTS (ALL START AT Lv.0 LOCKED -> UPGRADABLE TO Lv.20!)
  // --------------------------------------------------------------------------
  CONVEYORS: [
    {
      id: 'conv_raw_feed',
      name: 'Quarry -> All Factory Input Hoppers Belt',
      icon: '⚙️',
      baseCost: 180,
      costScale: 1.35,
      maxLevel: 20,
      padX: -1150,
      padZ: 430,
      color: '#38bdf8',
      desc: 'Starts LOCKED (Lv.0). Unlock Lv.1 to pipe ⛏️ Iron & 🛢️ E-710 into Hoppers, and upgrade up to Lv.20 for hyper-speed raw feeding!'
    },
    {
      id: 'conv_counter_auto',
      name: 'Factory Output -> Sales Counter Belt',
      icon: '🛒',
      baseCost: 260,
      costScale: 1.35,
      maxLevel: 20,
      padX: 180,
      padZ: 340,
      color: '#22c55e',
      desc: 'Starts LOCKED (Lv.0). Unlock Lv.1 to auto-transfer finished goods to the Sales Counter, and upgrade up to Lv.20 for turbo logistics!'
    },
    {
      id: 'conv_gate_1',
      name: 'Ammo Belt -> Inner Gate 1 Turrets',
      icon: '⏩',
      baseCost: 200,
      costScale: 1.35,
      maxLevel: 20,
      gateId: 'gate_1',
      padX: 480,
      padZ: -240,
      color: '#facc15',
      desc: 'Starts LOCKED (Lv.0). Feeds 🧱 Ammo to Inner Gate 1 Turrets & repairs unbroken Gate 1. Upgrade Lv.1–20 for rapid autoloading!'
    },
    {
      id: 'conv_gate_2',
      name: 'Ammo Belt -> Middle Gate 2 Turrets',
      icon: '⏩',
      baseCost: 280,
      costScale: 1.35,
      maxLevel: 20,
      gateId: 'gate_2',
      padX: 480,
      padZ: -720,
      color: '#38bdf8',
      desc: 'Starts LOCKED (Lv.0). Feeds 🧱 Ammo to Middle Gate 2 Turrets & repairs unbroken Gate 2. Upgrade Lv.1–20!'
    },
    {
      id: 'conv_gate_3',
      name: 'Ammo Belt -> Outer Gate 3 Turrets',
      icon: '⏩',
      baseCost: 360,
      costScale: 1.35,
      maxLevel: 20,
      gateId: 'gate_3',
      padX: 480,
      padZ: -1200,
      color: '#f97316',
      desc: 'Starts LOCKED (Lv.0). Feeds 🧱 Ammo to Outer Gate 3 Turrets & repairs unbroken Gate 3. Upgrade Lv.1–20!'
    }
  ],

  // --------------------------------------------------------------------------
  // ALL 7 PRODUCTION ITEMS:
  // - ONLY Tier 1 (`cloth`) is unlocked at start (Lv.1)!
  // - All other 6 items start LOCKED (Lv.0) and every machine upgrades to Lv.20!
  // - `unlockPos` is offset +145px South of `stationPos` so unlocking NEVER crushes the player!
  // --------------------------------------------------------------------------
  ITEMS: [
    {
      id: 'cloth',
      tier: 1,
      name: 'B-01 Tactical Cape & Armor',
      shortName: 'Cape & Armor',
      icon: '🦺',
      color: '#facc15',
      unlockedAtStart: true, // ONLY THIS ONE ITEM IS UNLOCKED AT START!
      unlockCost: 0,
      baseUpgradeCost: 80,
      costScale: 1.35,
      maxLevel: 20,
      sellPrice: 30,
      cycleTime: 1.75,
      maxBuffer: 12,
      initialStock: 2,
      rawType: 'raw_e710',
      recipe: { raw_e710: 1 },
      recipeText: '1x 🛢️ E-710 -> 1x 🦺 Cloth',
      initialInput: { raw_e710: 4 },
      inputPos: { x: -640, z: 160 },
      stationPos: { x: -380, z: 160 },
      pickupPos: { x: -120, z: 160 },
      unlockPos: { x: -380, z: 305 }, // Safe offset below machine!
      description: 'STARTER LINE (Lv.1–20): Harvest 🛢️ E-710 in Sector A and feed Hopper to weave B-01 Capes. Upgrade to Lv.20 for +15%/lvl speed & +12%/lvl value!'
    },
    {
      id: 'gun',
      tier: 2,
      name: 'AR-23 Liberator Rifle',
      shortName: 'Liberator Gun',
      icon: '🔫',
      color: '#38bdf8',
      unlockedAtStart: false, // Locked at start! Unlock for $120 after selling Cloth!
      unlockCost: 120,
      baseUpgradeCost: 110,
      costScale: 1.35,
      maxLevel: 20,
      sellPrice: 55,
      cycleTime: 1.9,
      maxBuffer: 12,
      initialStock: 2,
      rawType: 'raw_iron',
      recipe: { raw_iron: 1 },
      recipeText: '1x ⛏️ Iron -> 1x 🔫 Gun',
      initialInput: { raw_iron: 4 },
      inputPos: { x: -640, z: 520 },
      stationPos: { x: -380, z: 520 },
      pickupPos: { x: -120, z: 520 },
      unlockPos: { x: -380, z: 665 }, // Safe offset below machine!
      description: 'Requires 1x ⛏️ Super Iron Ore in its Input Hopper to forge 1x AR-23 Liberator Rifle. Upgradable Lv.1–20!'
    },
    {
      id: 'resource',
      tier: 3,
      name: 'E-710 Munitions Crate',
      shortName: 'Munitions Crate',
      icon: '📦',
      color: '#22c55e',
      unlockedAtStart: false,
      unlockCost: 350,
      baseUpgradeCost: 180,
      costScale: 1.36,
      maxLevel: 20,
      sellPrice: 110,
      cycleTime: 2.3,
      maxBuffer: 12,
      initialStock: 2,
      rawType: 'raw_e710',
      recipe: { raw_iron: 1, raw_e710: 1 },
      recipeText: '1⛏️ + 1🛢️ -> 1x 📦 Crate',
      initialInput: { raw_iron: 3, raw_e710: 3 },
      inputPos: { x: -640, z: 880 },
      stationPos: { x: -380, z: 880 },
      pickupPos: { x: -120, z: 880 },
      unlockPos: { x: -380, z: 1025 }, // Safe offset below machine!
      description: 'Combines 1x ⛏️ Iron + 1x 🛢️ E-710 to pack high-value ordnance crates. Upgradable Lv.1–20!'
    },
    {
      id: 'equipment',
      tier: 4,
      name: 'SH-32 Ballistic Jump Pack',
      shortName: 'Tac-Jump Pack',
      icon: '🎒',
      color: '#a855f7',
      unlockedAtStart: false,
      unlockCost: 900,
      baseUpgradeCost: 320,
      costScale: 1.36,
      maxLevel: 20,
      sellPrice: 220,
      cycleTime: 2.8,
      maxBuffer: 10,
      initialStock: 2,
      rawType: 'raw_e710',
      recipe: { raw_iron: 1, raw_e710: 2 },
      recipeText: '1⛏️ + 2🛢️ -> 1x 🎒 Pack',
      initialInput: { raw_iron: 3, raw_e710: 4 },
      inputPos: { x: -640, z: 1240 },
      stationPos: { x: -380, z: 1240 },
      pickupPos: { x: -120, z: 1240 },
      unlockPos: { x: -380, z: 1385 }, // Safe offset below machine!
      description: 'Combines 1x ⛏️ Iron + 2x 🛢️ E-710 to assemble personal shield & jump packs. Upgradable Lv.1–20!'
    },
    {
      id: 'vehicle',
      tier: 5,
      name: 'M-102 Fast Recon Vehicle (車)',
      shortName: 'Recon Vehicle (車)',
      icon: '🚙',
      color: '#f97316',
      unlockedAtStart: false,
      unlockCost: 2400,
      baseUpgradeCost: 650,
      costScale: 1.38,
      maxLevel: 20,
      sellPrice: 480,
      cycleTime: 3.5,
      maxBuffer: 8,
      initialStock: 1,
      rawType: 'raw_iron',
      recipe: { raw_iron: 2, raw_e710: 1 },
      recipeText: '2⛏️ + 1🛢️ -> 1x 🚙 Vehicle',
      initialInput: { raw_iron: 4, raw_e710: 2 },
      inputPos: { x: 740, z: 960 },
      stationPos: { x: 1020, z: 960 },
      pickupPos: { x: 1300, z: 960 },
      unlockPos: { x: 1020, z: 1095 }, // Safe offset below machine!
      description: 'Combines 2x ⛏️ Iron + 1x 🛢️ E-710 in Sector D Hangar to build armored Recon Vehicles. Upgradable Lv.1–20!'
    },
    {
      id: 'mech',
      tier: 6,
      name: 'EXO-45 Patriot Exosuit (機甲)',
      shortName: 'Patriot Mech (機甲)',
      icon: '🤖',
      color: '#ef4444',
      unlockedAtStart: false,
      unlockCost: 6500,
      baseUpgradeCost: 1400,
      costScale: 1.38,
      maxLevel: 20,
      sellPrice: 1100,
      cycleTime: 4.4,
      maxBuffer: 6,
      initialStock: 1,
      rawType: 'raw_iron',
      recipe: { raw_iron: 3, raw_e710: 2 },
      recipeText: '3⛏️ + 2🛢️ -> 1x 🤖 Mech',
      initialInput: { raw_iron: 6, raw_e710: 4 },
      inputPos: { x: 740, z: 1260 },
      stationPos: { x: 1020, z: 1260 },
      pickupPos: { x: 1300, z: 1260 },
      unlockPos: { x: 1020, z: 1395 }, // Safe offset below machine!
      description: 'Combines 3x ⛏️ Iron + 2x 🛢️ E-710 to construct bipedal EXO-45 Patriot Walkers. Upgradable Lv.1–20!'
    },
    {
      id: 'warship',
      tier: 7,
      name: 'SES Super Destroyer (Warship)',
      shortName: 'Super Destroyer',
      icon: '🚀',
      color: '#ec4899',
      unlockedAtStart: false,
      unlockCost: 18000,
      baseUpgradeCost: 3500,
      costScale: 1.40,
      maxLevel: 20,
      sellPrice: 2800,
      cycleTime: 5.5,
      maxBuffer: 5,
      initialStock: 1,
      rawType: 'raw_e710',
      recipe: { raw_iron: 4, raw_e710: 4 },
      recipeText: '4⛏️ + 4🛢️ -> 1x 🚀 Warship',
      initialInput: { raw_iron: 8, raw_e710: 8 },
      inputPos: { x: 740, z: 1560 },
      stationPos: { x: 1020, z: 1560 },
      pickupPos: { x: 1300, z: 1560 },
      unlockPos: { x: 1020, z: 1695 }, // Safe offset below machine!
      description: 'Combines 4x ⛏️ Iron + 4x 🛢️ E-710 in Orbital Drydock to commission SES Super Destroyers. Upgradable Lv.1–20!'
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

  // ALL UPGRADES HAVE 20 LEVELS FOR 20+ HOUR PROGRESSION!
  UPGRADES: [
    {
      id: 'seaf_miner',
      name: 'Hire & Train SEAF Quarry Miner (採礦兵)',
      icon: '⛏️',
      baseCost: 130,
      costMultiplier: 1.45,
      maxLevel: 20,
      description: 'Deploys & upgrades SEAF Miners (up to 8 active miners + +15% haul speed per level up to Lv.20) to feed Factory Hoppers!'
    },
    {
      id: 'raw_speed_boost',
      name: 'Overclock Quarry & Tectonic Drills',
      icon: '⚙️',
      baseCost: 120,
      costMultiplier: 1.42,
      maxLevel: 20,
      description: 'Increases Super Iron & E-710 Auto-Drill speed (+25%/lvl) and expands Quarry storage buffer up to Lv.20.'
    },
    {
      id: 'seaf_ammo_hauler',
      name: 'Hire & Train SEAF Gate Engineer (搬彈修門工兵)',
      icon: '🧱',
      baseCost: 150,
      costMultiplier: 1.45,
      maxLevel: 20,
      description: 'Deploys & upgrades SEAF Engineers (up to 8 engineers + faster manual gate repair up to Lv.20) to supply & repair Gate Layers 3, 2, 1!'
    },
    {
      id: 'seaf_carrier',
      name: 'Hire & Train SEAF Logistics Trooper',
      icon: '🪖',
      baseCost: 140,
      costMultiplier: 1.45,
      maxLevel: 20,
      description: 'Deploys & upgrades SEAF Logistics Troopers (up to 8 troopers + +15% speed/lvl up to Lv.20) to haul finished items to the Counter.'
    },
    {
      id: 'seaf_cashier',
      name: 'Upgrade Auto-Cashier Drone Array',
      icon: '🤖',
      baseCost: 240,
      costMultiplier: 1.48,
      maxLevel: 20,
      description: 'Automatically serves queued Helldivers faster (+20% serve speed/lvl up to Lv.20) and streams Requisition bills straight to your wallet.'
    },
    {
      id: 'player_boots',
      name: 'Jump-Jet Servo Boots',
      icon: '⚡',
      baseCost: 110,
      costMultiplier: 1.40,
      maxLevel: 20,
      description: 'Increases Commander movement speed (+8%/lvl up to Lv.20) and War-Zone snowplow radius.'
    },
    {
      id: 'player_exo_rig',
      name: 'Heavy Back-Stack Exo-Rig',
      icon: '🎒',
      baseCost: 130,
      costMultiplier: 1.42,
      maxLevel: 20,
      description: 'Adds +3 max carry capacity to your vertical back-stack per upgrade level (up to Lv.20).'
    },
    {
      id: 'factory_overclock',
      name: 'Super Uranium Factory Turbines',
      icon: '🔋',
      baseCost: 200,
      costMultiplier: 1.48,
      maxLevel: 20,
      description: 'Speeds up all 7 weapon, vehicle, mech, and warship assembly lines by +15% per level (up to Lv.20).'
    }
  ],

  // ALL PERMANENT SKILLS HAVE 20 LEVELS!
  PERMANENT_SKILLS: [
    {
      id: 'perm_gun_value',
      name: 'High-Caliber Arsenal Contracts',
      icon: '🔫',
      baseMedalCost: 2,
      costScale: 1.38,
      maxLevel: 20,
      desc: 'PERMANENT (Lv.1–20): +20% sale price on all Cloth, Guns, Vehicles, Mechs & Warships forever.'
    },
    {
      id: 'perm_raw_speed',
      name: 'Deep-Mantle Tectonic Drills',
      icon: '⛏️',
      baseMedalCost: 2,
      costScale: 1.38,
      maxLevel: 20,
      desc: 'PERMANENT (Lv.1–20): +25% Raw Quarry & Munitions Press speed + 2.5% chance/lvl to save Raw Ore when crafting!'
    },
    {
      id: 'perm_gate_armor',
      name: '3-Layer Titanium Gate Bulkheads',
      icon: '🛡️',
      baseMedalCost: 2,
      costScale: 1.38,
      maxLevel: 20,
      desc: 'PERMANENT (Lv.1–20): +30% Max HP on all 3 Gate Layers and +5 HP/s maintenance on UNBROKEN gates (broken gates require manual repair!).'
    },
    {
      id: 'perm_turret_power',
      name: 'Orbital Autoloader Munitions',
      icon: '🗼',
      baseMedalCost: 3,
      costScale: 1.40,
      maxLevel: 20,
      desc: 'PERMANENT (Lv.1–20): +25% Gate Turret damage across all 3 Layers and +2.5% chance/lvl not to consume 🧱 Ammo.'
    },
    {
      id: 'perm_start_grant',
      name: 'Ministry Priority Drop Grant',
      icon: '💰',
      baseMedalCost: 3,
      costScale: 1.40,
      maxLevel: 20,
      desc: 'PERMANENT (Lv.1–20): Start every deployment with +$150 Requisition and +2 Carry Capacity per level.'
    },
    {
      id: 'perm_commander_elite',
      name: 'Viper Commando Stim Infusion',
      icon: '🦅',
      baseMedalCost: 3,
      costScale: 1.40,
      maxLevel: 20,
      desc: 'PERMANENT (Lv.1–20): +10% Commander & SEAF move speed and +25% personal weapon & Guard Dog drone damage forever.'
    }
  ]
};
