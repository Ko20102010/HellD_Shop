// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.06 (All-Episode Carbot Art, Split Raw Belts, 7 Dedicated
//                   Item Counters, Real Belt Packets & Smart SEAF AI Edition)
// ============================================================================

window.GameConfig = {
  VERSION: 'v0.0.12',
  STORAGE_KEY: 'helldivers_please_save_v0012',
  MAX_LEVEL: 10,

  // Expanded 4600 x 4000 2D Factorio + Carbot World for 7 Full Horizontal Lanes
  WORLD: {
    minX: -2200,
    maxX: 2700,
    minZ: -1950,
    maxZ: 2050,
    wallZ: -200,
    corridorMinX: -1650,
    corridorMaxX: 1650,
    gateOpeningWidth: 320
  },

  PLAYER: {
    baseSpeed: 285,
    sprintMultiplier: 1.55,
    baseCapacity: 14,
    pickupRadius: 92,
    transferInterval: 0.06,
    attackRange: 285,
    attackCooldown: 0.24,
    attackDamage: 26,
    plowRadius: 105
  },

  WAVE_CONFIG: {
    initialRestTime: 22,
    betweenWaveRestTime: 18,
    baseEnemyCount: 8,
    enemiesPerWave: 5,
    spawnIntervalInWave: 1.15,
    bossWaveEvery: 3
  },

  // --------------------------------------------------------------------------
  // 8-PLANET GALACTIC CAMPAIGN (20+ Hours Long-Term Progression)
  // --------------------------------------------------------------------------
  CAMPAIGN_PLANETS: [
    {
      id: 'planet_1',
      index: 1,
      name: 'Sector 1: Angels Venture (安傑爾冒險星)',
      waveStart: 1,
      waveEnd: 5,
      reqMult: 1.0,
      enemyHpMult: 1.0,
      rewardMedals: 3,
      desc: 'Training Operation: Establish your first Cloth Counter & Gun Counter and hold Outer Gate 3 through Wave 5.'
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
      desc: 'Terminid Hunter & Bile Spewer Front: Split your E-710 & Iron belts and survive Wave 15.'
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
      desc: 'Liberate the EXO-45 Patriot Exosuit Counter and upgrade dedicated Counter Belts to Lv.10+.'
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
      desc: 'Rocket Devastator & Hulk Siege: Fortify all 3 Gate Layers to Lv.12+ and deploy Guard Dog drones.'
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
      desc: 'Bile Titan Swarm: Open the SES Super Destroyer Counter and push factory stations toward Lv.15.'
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
      desc: 'Factory Strider Assault: Max out Lv.20 Turbo Conveyor Belts and Lv.20 Gate Railcannons.'
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
      desc: 'Supreme Super Earth Offensive: Full Lv.20 Mega-Factory mastery across all 7 dedicated counters.'
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

  MILESTONES: [
    { id: 'ms_first_cloth', name: 'First Cape Woven', desc: 'Serve 5 Helldiver customers at the Cloth Counter.', check: (g) => g.totalServed >= 5, rewardMedals: 1 },
    { id: 'ms_unlock_gun', name: 'Second Amendment of Super Earth', desc: 'Unlock the AR-23 Liberator Gun line & Gun Counter.', check: (g) => !!g.unlocked.gun, rewardMedals: 1 },
    { id: 'ms_unlock_iron_drill', name: 'Automated Metallurgy', desc: 'Unlock the Auto Iron Quarry Drill (Lv.1+).', check: (g) => (g.rawExtractors.raw_iron?.level || 0) >= 1, rewardMedals: 1 },
    { id: 'ms_unlock_e710_pump', name: 'Element-710 Pipeline', desc: 'Unlock the Auto E-710 Fuel Pump (Lv.1+).', check: (g) => (g.rawExtractors.raw_e710?.level || 0) >= 1, rewardMedals: 1 },
    { id: 'ms_first_belt', name: 'Factorio Initiate', desc: 'Unlock your first Conveyor Belt (Lv.1+).', check: (g) => Object.values(g.conveyorLevels || {}).some((v) => v >= 1), rewardMedals: 2 },
    { id: 'ms_split_raw_belts', name: 'Dual-Resource Logistics', desc: 'Unlock both the E-710 Belt and Iron Belt (Lv.1+).', check: (g) => (g.conveyorLevels?.conv_raw_e710 >= 1) && (g.conveyorLevels?.conv_raw_iron >= 1), rewardMedals: 3 },
    { id: 'ms_wave_5', name: 'Angels Venture Veteran', desc: 'Clear Enemy Wave 5.', check: (g) => g.waveNumber > 5, rewardMedals: 3 },
    { id: 'ms_wave_15', name: 'Heeth Survivor', desc: 'Clear Enemy Wave 15.', check: (g) => g.waveNumber > 15, rewardMedals: 5 },
    { id: 'ms_wave_30', name: 'Hero of Tien Kwan', desc: 'Clear Enemy Wave 30.', check: (g) => g.waveNumber > 30, rewardMedals: 8 },
    { id: 'ms_wave_50', name: 'Legend of Malevelon Creek', desc: 'Clear Enemy Wave 50.', check: (g) => g.waveNumber > 50, rewardMedals: 15 },
    { id: 'ms_served_100', name: 'Quartermaster General', desc: 'Serve 100 Helldiver customers across your career.', check: (g) => g.lifetimeServed >= 100, rewardMedals: 4 },
    { id: 'ms_served_500', name: 'Arsenal of Democracy', desc: 'Serve 500 Helldiver customers across your career.', check: (g) => g.lifetimeServed >= 500, rewardMedals: 10 },
    { id: 'ms_kills_200', name: 'Scrap Metal Collector', desc: 'Eliminate 200 enemies across your career.', check: (g) => g.lifetimeKills >= 200, rewardMedals: 5 },
    { id: 'ms_kills_1000', name: 'Bane of Cyberstan', desc: 'Eliminate 1,000 enemies across your career.', check: (g) => g.lifetimeKills >= 1000, rewardMedals: 15 },
    { id: 'ms_unlock_mech', name: 'Heavy Walker Assembly', desc: 'Unlock the EXO-45 Patriot Mech line & Counter.', check: (g) => !!g.unlocked.mech, rewardMedals: 5 },
    { id: 'ms_unlock_warship', name: 'Orbital Fleet Admiral', desc: 'Unlock the SES Super Destroyer Drydock & Counter.', check: (g) => !!g.unlocked.warship, rewardMedals: 10 },
    { id: 'ms_belt_lv20', name: 'Lv.20 Turbo Belt Master', desc: 'Upgrade any Conveyor Belt to Max Level 20.', check: (g) => Object.values(g.conveyorLevels || {}).some((v) => v >= 20), rewardMedals: 12 },
    { id: 'ms_station_lv20', name: 'Lv.20 Overclocked Foundry', desc: 'Upgrade any Production Machine to Max Level 20.', check: (g) => Object.values(g.stations || {}).some((s) => (s.level || 0) >= 20), rewardMedals: 12 },
    { id: 'ms_gate_lv20', name: 'Lv.20 Impenetrable Bastion', desc: 'Fortify any Defense Gate Layer to Max Level 20.', check: (g) => Object.values(g.gates || {}).some((gt) => (gt.defenseLevel || 1) >= 20), rewardMedals: 12 },
    { id: 'ms_quarry_lv20', name: 'Lv.20 Deep-Core Excavator', desc: 'Upgrade any Raw Quarry Drill to Max Level 20.', check: (g) => Object.values(g.rawExtractors || {}).some((r) => (r.level || 0) >= 20), rewardMedals: 12 },
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
  // ALL-EPISODE CARBOTANIMATIONS HELLDIVERS 2 CHARACTER & ENEMY ROSTER (16 UNITS)
  // References Carbot Helldivers 2 Ep1 through Ep10+!
  // --------------------------------------------------------------------------
  CHARACTER_ROSTER: [
    {
      id: 'char_commander',
      name: 'DP-40 Hero Commander (You)',
      zhName: '聯邦英雄指揮官 (全集主角 / 可裝備機甲與護衛犬)',
      faction: 'Super Earth Command (Ep1–Ep10)',
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
      stats: '4 Loadout Slots: Weapon 🔫 | Armor 🦺 | Guard Dog 🛸 | Mount 🤖',
      desc: 'Wears the winged DP-40 Hero helmet from Carbot Ep7. Harvests raw ore, feeds hoppers, sells at all 7 dedicated counters, and calls Eagle-1 500kg bombs!'
    },
    {
      id: 'char_helldiver',
      name: 'B-01 Cadet Helldiver Customer',
      zhName: 'B-01 新兵絕地戰兵買家 (Ep1–Ep7 經典豆子兵)',
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
      stats: 'Queues at Dedicated Item Counters 1–4 (Cloth, Gun, Crate, Pack)',
      desc: 'Chubby Carbot bean Helldiver who queues directly in front of the specific Item Counter for the gear they want to buy!'
    },
    {
      id: 'char_vip_admiral',
      name: 'Skull Admiral VIP Buyer',
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
      stats: 'Queues at Heavy Counters 5–7 (Vehicle, Patriot Mech, Destroyer)',
      desc: 'Veteran Carbot Admiral in royal purple-and-gold ceremonial armor. Orders high-ticket Recon Vehicles, Patriot Mechs, and Super Destroyers.'
    },
    {
      id: 'char_seaf_miner',
      name: 'SEAF Smart Quarry Miner (採礦兵)',
      zhName: 'SEAF 智能礦區採集兵 (不重複ベルト工作)',
      faction: 'SEAF Mining Corps',
      badge: '⛏️ SMART MINER',
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
      stats: 'Smart AI: Hauls un-belted Raw Ore OR Hand-Mines Veins when Belt is on!',
      desc: 'Never duplicates active belts or clumps with other miners! Reserves unique hoppers, and switches to hand-mining bonus ore when raw belts are active.'
    },
    {
      id: 'char_seaf_logistics',
      name: 'SEAF Smart Logistics & Cashier Trooper',
      zhName: 'SEAF 智能後勤與收銀兵 (ベルト自動化後轉為收銀)',
      faction: 'SEAF Support',
      badge: '🪖 SMART LOGISTICS',
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
      stats: 'Smart AI: Stocks un-belted Counters OR Assists Cashier & Collects $REQ!',
      desc: 'Prioritizes factories without a Counter Belt. Once counters are belt-automated, automatically patrols the 7 Counters to serve customers faster & vacuum cash!'
    },
    {
      id: 'char_seaf_ammo',
      name: 'SEAF Smart Gate Engineer (搬彈修門工兵)',
      zhName: 'SEAF 智能修門與搬彈工兵',
      faction: 'SEAF Ordnance',
      badge: '🧱 GATE ENGINEER',
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
      stats: 'Smart AI: Rebuilds Broken Gates -> Supplies Un-Belted Turrets -> Boosts Press',
      desc: 'Prioritizes manually rebuilding Broken/Damaged Gates (since broken gates cannot auto-heal!), then supplies un-belted turrets.'
    },
    {
      id: 'char_terminid_hunter',
      name: 'Terminid Scavenger & Hunter (Ep1/Ep2)',
      zhName: '蟲族跳蟲與獵手 (Carbot Ep1 吐舌頭小蟲)',
      faction: 'Terminid Swarm (Ep1–Ep4)',
      badge: '🪲 LEAPING BUG',
      badgeColor: '#fb923c',
      renderType: 'enemy',
      renderOpts: { type: 'hunter' },
      stats: 'Speed: 135 (Very Fast) | Derpy Tongue & Wings | Drops: $30 + 🛢️',
      desc: 'Iconic Carbot orange-and-tan jumping bug with wide derpy eyes, fluttering little wings, and a wagging pink tongue!'
    },
    {
      id: 'char_terminid_bug',
      name: 'Terminid Armored Charger (Ep1/Ep3)',
      zhName: '蟲族重甲衝鋒蟲 (Carbot 鐵頭巨蟲)',
      faction: 'Terminid Swarm (Ep1–Ep6)',
      badge: '🪲 ARMORED CHARGER',
      badgeColor: '#84cc16',
      renderType: 'enemy',
      renderOpts: { type: 'bug' },
      stats: 'HP: 110 | Speed: 105 | Heavy Chitin Crest | Drops: $40 + 🛢️',
      desc: 'Chubby Carbot olive-green armored beetle with heavy brow plates, yellow mandibles, and glowing orange tail bulb.'
    },
    {
      id: 'char_bile_spewer',
      name: 'Terminid Bile Spewer (Ep2/Ep5)',
      zhName: '蟲族酸液噴吐蟲 (Carbot 螢光綠大肚蟲)',
      faction: 'Terminid Swarm (Ep2–Ep8)',
      badge: '🧪 ACID ARTILLERY',
      badgeColor: '#4ade80',
      renderType: 'enemy',
      renderOpts: { type: 'spewer' },
      stats: 'HP: 165 | Siege DMG: 18 | Glowing Acid Sac | Drops: $65 + 🛢️',
      desc: 'Waddling Carbot bug with a massive pulsing neon-green acid abdomen that projectile-vomits corrosive bile at gates!'
    },
    {
      id: 'char_bile_titan',
      name: 'Terminid Bile Titan Boss (Ep1/Ep4)',
      zhName: '蟲族膽汁泰坦首領 (Carbot 超長腿巨型蜘蛛蟲)',
      faction: 'Terminid Swarm Boss (Ep1–Ep9)',
      badge: '🕷️ TITAN BOSS',
      badgeColor: '#22c55e',
      renderType: 'enemy',
      renderOpts: { type: 'titan' },
      stats: 'Boss Wave Unit | HP: 420 | Siege DMG: 32 | Drops: $150 + ⭐ Medal!',
      desc: 'Towering Carbot Bile Titan on four stilted chitinous legs with a glowing green underbelly andacid breath!'
    },
    {
      id: 'char_automaton_trooper',
      name: 'Automaton Skull Trooper (Ep3/Ep7)',
      zhName: '機器人骷髏步兵 (Carbot 紅眼機器兵)',
      faction: 'Automaton Legion (Ep3–Ep10)',
      badge: '💀 BOT TROOPER',
      badgeColor: '#ef4444',
      renderType: 'enemy',
      renderOpts: { type: 'trooper' },
      stats: 'HP: 95 | Attacks: Gate 3 -> Gate 2 -> Gate 1 | Drops: $35 + ⛏️ Iron',
      desc: 'Carbot gunmetal bot chassis with a white cartoon skull faceplate and glowing red eyes.'
    },
    {
      id: 'char_rocket_devastator',
      name: 'Automaton Rocket Devastator (Ep3/Ep6)',
      zhName: '機器人火箭蹂躪者 (Carbot 無限肩扛火箭兵)',
      faction: 'Automaton Legion (Ep3–Ep9)',
      badge: '🚀 ROCKET SPAMMER',
      badgeColor: '#f97316',
      renderType: 'enemy',
      renderOpts: { type: 'devastator' },
      stats: 'HP: 180 | Dual Shoulder Rocket Pods | Drops: $75 + ⛏️ Iron',
      desc: 'Famous Carbot Malevelon Creek nightmare with wide red shoulder armor and dual 6-tube rocket pods on its back!'
    },
    {
      id: 'char_automaton_hulk',
      name: 'Automaton Flame-Saw Hulk Boss (Ep3/Ep7)',
      zhName: '機器人巨型毀滅者 (Carbot 雙鋸噴火 Hulk)',
      faction: 'Automaton Legion Boss',
      badge: '🪚 HULK BOSS',
      badgeColor: '#dc2626',
      renderType: 'enemy',
      renderOpts: { type: 'hulk' },
      stats: 'Boss Unit | HP: 320 | Siege DMG: 25 | Drops: $115 + ⭐ Medal!',
      desc: 'Towering crimson Carbot Hulk armed with a spinning orange buzzsaw arm, heavy flamethrower, and glowing back vents.'
    },
    {
      id: 'char_factory_strider',
      name: 'Automaton Factory Strider Boss (Ep8/Ep9)',
      zhName: '機器人移動工廠巨獸 (Carbot 四足機械大狗)',
      faction: 'Automaton Mega-Boss (Ep8+)',
      badge: '🐕‍🦺 STRIDER BOSS',
      badgeColor: '#991b1b',
      renderType: 'enemy',
      renderOpts: { type: 'strider' },
      stats: 'Mega-Boss | HP: 520 | Top Cannon & Chin Gatlings | Drops: $220 + 2 ⭐!',
      desc: 'Carbot’s giant four-legged mechanical dog walker with a dorsal heavy cannon turret, twin chin gatling guns, and angry red eyes!'
    },
    {
      id: 'char_patriot_mech',
      name: 'EXO-45 Patriot Exosuit (Ep4/Ep7)',
      zhName: 'EXO-45 愛國者雙足機甲 (可升至 Lv.20 & 主角可駕駛)',
      faction: 'Super Earth Heavy Armor',
      badge: '🤖 TIER-6 MECH',
      badgeColor: '#f97316',
      renderType: 'mech',
      renderOpts: {},
      stats: 'Recipe: 3⛏️ Iron + 2🛢️ E-710 | Dedicated Counter #6 | Wearable Mount!',
      desc: 'Bipedal combat walker from Carbot Ep4 (Tien Kwan) & Ep7. Sold at Counter #6 OR equipped in 🛡️ Loadout to pilot yourself!'
    },
    {
      id: 'char_recon_vehicle',
      name: 'M-102 Fast Recon Vehicle & Eagle-1',
      zhName: 'M-102 戰術偵察車 (Dedicated Counter #5 & 可騎乘)',
      faction: 'Super Earth Motor Pool',
      badge: '🚙 TIER-5 VEHICLE',
      badgeColor: '#eab308',
      renderType: 'vehicle',
      renderOpts: {},
      stats: 'Recipe: 2⛏️ Iron + 1🛢️ E-710 | Dedicated Counter #5 | Wearable Mount!',
            desc: 'All-terrain Carbot tactical buggy with yellow roll-cage and roof HMG turret. Sold at Counter #5 or driven by the Commander!'
    },
    {
      id: 'char_gate_turret',
      name: 'A/MG-43 & A/MLS-4X Gate Sentries (Ep1–Ep10)',
      zhName: '三層防線雙聯裝機槍與電磁軌道砲塔 (Lv.1–20)',
      faction: 'Super Earth Automated Defense',
      badge: '🛡️ 3-LAYER SENTRY',
      badgeColor: '#22c55e',
      renderType: 'turret',
      renderOpts: {},
      stats: 'Requires: 🧱 Turret Ammo | Upgradable Lv.1–20 | 2 Sentries per Gate Layer',
      desc: 'Automated Carbot dual-barrel sentry turrets guarding Outer Gate 3, Middle Gate 2, and Inner Gate 1.'
    }
  ],

  // --------------------------------------------------------------------------
  // SECTOR A: MANUAL HARVEST QUARRY (AT START) + AUTO-DRILL RIGS (Lv.0 -> Lv.20)
  // --------------------------------------------------------------------------
  RAW_EXTRACTORS: [
    {
      id: 'raw_e710',
      name: 'E-710 Fuel Field & Auto-Pump Array',
      shortName: 'E-710 Pump',
      itemIcon: '🛢️',
      icon: '🛢️',
      color: '#a855f7',
      unlockedAtStart: false,
      unlockCost: 110,
      maxLevel: 10,
      harvestPos: { x: -1820, z: 240, radius: 135 },
      x: -1460,
      z: 240,
      pickupX: -1200,
      pickupZ: 240,
      padX: -1460,
      padZ: 410,
      baseCycleTime: 1.85,
      baseUpgradeCost: 110,
      costScale: 1.38,
      baseBuffer: 18,
      desc: 'Walk inside the 🛢️ E-710 Field to harvest by hand at start! Unlock Auto-Pump (Lv.1–20) and connect the Purple E-710 Belt.'
    },
    {
      id: 'raw_iron',
      name: 'Super Iron Quarry & Auto-Drill Array',
      shortName: 'Iron Drill',
      itemIcon: '⛏️',
      icon: '⛏️',
      color: '#38bdf8',
      unlockedAtStart: false,
      unlockCost: 140,
      maxLevel: 10,
      harvestPos: { x: -1820, z: 780, radius: 135 },
      x: -1460,
      z: 780,
      pickupX: -1200,
      pickupZ: 780,
      padX: -1460,
      padZ: 950,
      baseCycleTime: 1.80,
      baseUpgradeCost: 140,
      costScale: 1.38,
      baseBuffer: 18,
      desc: 'Walk inside the ⛏️ Iron Vein to harvest by hand! Unlock Auto-Drill (Lv.1–20) and connect the Cyan Iron Belt.'
    }
  ],

  // --------------------------------------------------------------------------
  // MUNITIONS AMMO PRESS (Lv.0 Locked -> Lv.1..20! Uses 1x ⛏️ Iron -> 3x 🧱 Ammo)
  // --------------------------------------------------------------------------
  AMMO_PRESS: {
    id: 'ammo',
    name: 'Munitions Ammo Press',
    shortName: 'Ammo Press',
    icon: '🧱',
    color: '#f97316',
    unlockedAtStart: false,
    unlockCost: 130,
    baseUpgradeCost: 120,
    costScale: 1.36,
    maxLevel: 10,
    recipe: { raw_iron: 1 },
    outputBatch: 3,
    initialInput: { raw_iron: 6 },
    inputPos: { x: -1760, z: 1360 },
    x: -1500,
    z: 1360,
    padX: -1240,
    padZ: 1360,
    unlockPos: { x: -1500, z: 1520 },
    baseCycleTime: 1.55,
    maxBuffer: 30,
    initialStock: 9,
    desc: 'Consumes 1x ⛏️ Iron Ore in its Input Hopper to press 3x 🧱 Heavy Turret Ammo. Fed by the Cyan Iron Belt!'
  },

  // --------------------------------------------------------------------------
  // THREE SEQUENTIAL NORTHERN WAR-ZONE DEFENSE GATE LAYERS (Lv.1 -> Lv.20)
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
      maxLevel: 10,
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
      maxLevel: 10,
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
      maxLevel: 10,
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
  // SPLIT SINGLE-RESOURCE CONVEYOR BELTS (ALL START AT Lv.0 LOCKED -> Lv.20!)
  // - Raw belts are SPLIT into TWO separate belts:
  //   1) `conv_raw_e710` (Purple E-710 Fuel Belt — ONLY connects E-710 Pump to E-710 Hoppers!)
  //   2) `conv_raw_iron` (Cyan Iron Ore Belt — ONLY connects Iron Drill to Iron Hoppers!)
  // - Output belts: `conv_counter_auto` upgrades all 7 Dedicated Factory-to-Counter Belts!
  // - Gate Ammo belts: `conv_gate_1`, `conv_gate_2`, `conv_gate_3` feed 🧱 Ammo!
  // - IMPORTANT: Belts ONLY show moving item packets when real items are in transit!
  // --------------------------------------------------------------------------
  CONVEYORS: [
    {
      legacyId: 'conv_raw_feed',
      id: 'conv_raw_e710',
      name: '🛢️ E-710 Fuel Belt (E-710 Pump ➔ E-710 Hoppers Only)',
      icon: '🛢️',
      rawType: 'raw_e710',
      baseCost: 150,
      costScale: 1.35,
      maxLevel: 10,
      padX: -1180,
      padZ: 70,
      color: '#a855f7',
      desc: 'DEDICATED E-710 BELT (Lv.0–20): Pipes ONLY 🛢️ E-710 from the E-710 Auto-Pump to factories that require E-710. Shows 🛢️ packets only when actually transporting!'
    },
    {
      id: 'conv_raw_iron',
      name: '⛏️ Super Iron Belt (Iron Drill ➔ Iron & Ammo Hoppers Only)',
      icon: '⛏️',
      rawType: 'raw_iron',
      baseCost: 170,
      costScale: 1.35,
      maxLevel: 10,
      padX: -1180,
      padZ: 560,
      color: '#38bdf8',
      desc: 'DEDICATED IRON BELT (Lv.0–20): Pipes ONLY ⛏️ Super Iron from the Iron Auto-Drill to Gun, Ammo Press & Heavy Hoppers. Never mixes with E-710!'
    },
    {
      id: 'conv_counter_auto',
      name: '🛒 Dedicated Factory ➔ 7 Item Counters Belt Array',
      icon: '🛒',
      baseCost: 220,
      costScale: 1.35,
      maxLevel: 10,
      padX: 160,
      padZ: -40,
      color: '#22c55e',
      desc: 'DEDICATED COUNTER BELTS (Lv.0–20): Connects each unlocked machine’s Output Pad straight to its own Dedicated Sales Counter! Only shows items when moving stock!'
    },
    {
      id: 'conv_gate_1',
      name: '⏩ Ammo Belt ➔ Inner Gate 1 Turrets',
      icon: '⏩',
      baseCost: 190,
      costScale: 1.35,
      maxLevel: 10,
      gateId: 'gate_1',
      padX: 480,
      padZ: -240,
      color: '#facc15',
      desc: 'Feeds 🧱 Ammo from the Munitions Press to Inner Gate 1 Turrets & maintains unbroken Gate 1. Shows 🧱 packets only when transferring ammo!'
    },
    {
      id: 'conv_gate_2',
      name: '⏩ Ammo Belt ➔ Middle Gate 2 Turrets',
      icon: '⏩',
      baseCost: 260,
      costScale: 1.35,
      maxLevel: 10,
      gateId: 'gate_2',
      padX: 480,
      padZ: -720,
      color: '#38bdf8',
      desc: 'Feeds 🧱 Ammo to Middle Gate 2 Turrets & maintains unbroken Gate 2. Upgrade Lv.1–20!'
    },
    {
      id: 'conv_gate_3',
      name: '⏩ Ammo Belt ➔ Outer Gate 3 Turrets',
      icon: '⏩',
      baseCost: 340,
      costScale: 1.35,
      maxLevel: 10,
      gateId: 'gate_3',
      padX: 480,
      padZ: -1200,
      color: '#f97316',
      desc: 'Feeds 🧱 Ammo to Outer Gate 3 Turrets & maintains unbroken Gate 3. Upgrade Lv.1–20!'
    }
  ],

  // --------------------------------------------------------------------------
  // 7 HORIZONTAL PRODUCTION & RETAIL LANES (1 ITEM = 1 DEDICATED COUNTER!)
  // Every row `z` has:
  // - `inputPos`:    x = -760 (Fed by split E-710 / Iron belts or Miners)
  // - `stationPos`:  x = -460 (Fabricator Machine Lv.1–20)
  // - `unlockPos`:   x = -460, z + 118 (Safe offset below machine — never crushes player!)
  // - `pickupPos`:   x = -160 (Factory Output Pad)
  // - Dedicated Belt from `pickupPos (x=-160)` straight to `counterPos (x=+520)`!
  // - `counterDropPos`: x = +310 (Drop pad to manually stock this item's counter)
  // - `counterPos`:     x = +520 (Dedicated Sales Counter for THIS item only!)
  // - `cashPos`:        x = +720 (Dedicated Requisition Cash Stack for THIS counter!)
  // - `queueStart`:     x = +920 (Dedicated Helldiver Customer Queue for THIS item!)
  // --------------------------------------------------------------------------
  ITEMS: [
    {
      id: 'cloth',
      tier: 1,
      rowIndex: 0,
      name: 'B-01 Tactical Cape & Armor',
      shortName: 'Cape & Armor',
      counterName: 'Counter #1: Cape & Armor Desk',
      icon: '🦺',
      color: '#facc15',
      unlockedAtStart: true, // ONLY THIS ONE ITEM IS UNLOCKED AT START!
      unlockCost: 0,
      baseUpgradeCost: 80,
      costScale: 1.35,
      maxLevel: 10,
      sellPrice: 30,
      cycleTime: 1.75,
      maxBuffer: 12,
      initialStock: 2,
      rawType: 'raw_e710',
      recipe: { raw_e710: 1 },
      recipeText: '1x 🛢️ E-710 ➔ 1x 🦺 Cloth',
      initialInput: { raw_e710: 4 },
      inputPos: { x: -760, z: 120 },
      stationPos: { x: -460, z: 120 },
      unlockPos: { x: -460, z: 238 },
      pickupPos: { x: -160, z: 120 },
      counterDropPos: { x: 280, z: 120 },
      counterPos: { x: 500, z: 120 },
      counter2Pos: { x: 820, z: 120 },
      counter3Pos: { x: 1140, z: 120 },
      cashPos: { x: 1420, z: 120 },
      queueStart: { x: 1600, z: 120 },
      description: 'LANE 1 (Lv.1–20): Uses 1x 🛢️ E-710 (Purple Belt) to weave B-01 Capes and sells them at Dedicated Counter #1.'
    },
    {
      id: 'gun',
      tier: 2,
      rowIndex: 1,
      name: 'AR-23 Liberator Rifle',
      shortName: 'Liberator Gun',
      counterName: 'Counter #2: Arms & Rifle Desk',
      icon: '🔫',
      color: '#38bdf8',
      unlockedAtStart: false,
      unlockCost: 120,
      baseUpgradeCost: 110,
      costScale: 1.35,
      maxLevel: 10,
      sellPrice: 55,
      cycleTime: 1.9,
      maxBuffer: 12,
      initialStock: 2,
      rawType: 'raw_iron',
      recipe: { raw_iron: 1 },
      recipeText: '1x ⛏️ Iron ➔ 1x 🔫 Gun',
      initialInput: { raw_iron: 4 },
      inputPos: { x: -760, z: 390 },
      stationPos: { x: -460, z: 390 },
      unlockPos: { x: -460, z: 508 },
      pickupPos: { x: -160, z: 390 },
      counterDropPos: { x: 280, z: 390 },
      counterPos: { x: 500, z: 390 },
      counter2Pos: { x: 820, z: 390 },
      counter3Pos: { x: 1140, z: 390 },
      cashPos: { x: 1420, z: 390 },
      queueStart: { x: 1600, z: 390 },
      description: 'LANE 2 (Lv.1–20): Uses 1x ⛏️ Super Iron (Cyan Belt) to forge Liberator Rifles and sells them at Dedicated Counter #2.'
    },
    {
      id: 'resource',
      tier: 3,
      rowIndex: 2,
      name: 'E-710 Munitions Crate',
      shortName: 'Munitions Crate',
      counterName: 'Counter #3: Ordnance Crate Desk',
      icon: '📦',
      color: '#22c55e',
      unlockedAtStart: false,
      unlockCost: 350,
      baseUpgradeCost: 180,
      costScale: 1.36,
      maxLevel: 10,
      sellPrice: 110,
      cycleTime: 2.3,
      maxBuffer: 12,
      initialStock: 2,
      rawType: 'raw_e710',
      recipe: { raw_iron: 1, raw_e710: 1 },
      recipeText: '1⛏️ + 1🛢️ ➔ 1x 📦 Crate',
      initialInput: { raw_iron: 3, raw_e710: 3 },
      inputPos: { x: -760, z: 660 },
      stationPos: { x: -460, z: 660 },
      unlockPos: { x: -460, z: 778 },
      pickupPos: { x: -160, z: 660 },
      counterDropPos: { x: 280, z: 660 },
      counterPos: { x: 500, z: 660 },
      counter2Pos: { x: 820, z: 660 },
      counter3Pos: { x: 1140, z: 660 },
      cashPos: { x: 1420, z: 660 },
      queueStart: { x: 1600, z: 660 },
      description: 'LANE 3 (Lv.1–20): Combines 1x ⛏️ Iron + 1x 🛢️ E-710 and sells Munitions Crates at Dedicated Counter #3.'
    },
    {
      id: 'equipment',
      tier: 4,
      rowIndex: 3,
      name: 'SH-32 Ballistic Jump Pack',
      shortName: 'Tac-Jump Pack',
      counterName: 'Counter #4: Jump Pack & Shield Desk',
      icon: '🎒',
      color: '#a855f7',
      unlockedAtStart: false,
      unlockCost: 900,
      baseUpgradeCost: 320,
      costScale: 1.36,
      maxLevel: 10,
      sellPrice: 220,
      cycleTime: 2.8,
      maxBuffer: 10,
      initialStock: 2,
      rawType: 'raw_e710',
      recipe: { raw_iron: 1, raw_e710: 2 },
      recipeText: '1⛏️ + 2🛢️ ➔ 1x 🎒 Pack',
      initialInput: { raw_iron: 3, raw_e710: 4 },
      inputPos: { x: -760, z: 930 },
      stationPos: { x: -460, z: 930 },
      unlockPos: { x: -460, z: 1048 },
      pickupPos: { x: -160, z: 930 },
      counterDropPos: { x: 280, z: 930 },
      counterPos: { x: 500, z: 930 },
      counter2Pos: { x: 820, z: 930 },
      counter3Pos: { x: 1140, z: 930 },
      cashPos: { x: 1420, z: 930 },
      queueStart: { x: 1600, z: 930 },
      description: 'LANE 4 (Lv.1–20): Combines 1x ⛏️ Iron + 2x 🛢️ E-710 and sells Jump Packs at Dedicated Counter #4.'
    },
    {
      id: 'vehicle',
      tier: 5,
      rowIndex: 4,
      name: 'M-102 Fast Recon Vehicle (車)',
      shortName: 'Recon Vehicle (車)',
      counterName: 'Counter #5: Recon Vehicle Showroom',
      icon: '🚙',
      color: '#f97316',
      unlockedAtStart: false,
      unlockCost: 2400,
      baseUpgradeCost: 650,
      costScale: 1.38,
      maxLevel: 10,
      sellPrice: 480,
      cycleTime: 3.5,
      maxBuffer: 8,
      initialStock: 1,
      rawType: 'raw_iron',
      recipe: { raw_iron: 2, raw_e710: 1 },
      recipeText: '2⛏️ + 1🛢️ ➔ 1x 🚙 Vehicle',
      initialInput: { raw_iron: 4, raw_e710: 2 },
      inputPos: { x: -760, z: 1200 },
      stationPos: { x: -460, z: 1200 },
      unlockPos: { x: -460, z: 1318 },
      pickupPos: { x: -160, z: 1200 },
      counterDropPos: { x: 280, z: 1200 },
      counterPos: { x: 500, z: 1200 },
      counter2Pos: { x: 820, z: 1200 },
      counter3Pos: { x: 1140, z: 1200 },
      cashPos: { x: 1420, z: 1200 },
      queueStart: { x: 1600, z: 1200 },
      description: 'LANE 5 (Lv.1–20): Combines 2x ⛏️ Iron + 1x 🛢️ E-710 to build Recon Buggy Vehicles for Dedicated Counter #5.'
    },
    {
      id: 'mech',
      tier: 6,
      rowIndex: 5,
      name: 'EXO-45 Patriot Exosuit (機甲)',
      shortName: 'Patriot Mech (機甲)',
      counterName: 'Counter #6: Patriot Mech Hangar Desk',
      icon: '🤖',
      color: '#ef4444',
      unlockedAtStart: false,
      unlockCost: 6500,
      baseUpgradeCost: 1400,
      costScale: 1.38,
      maxLevel: 10,
      sellPrice: 1100,
      cycleTime: 4.4,
      maxBuffer: 6,
      initialStock: 1,
      rawType: 'raw_iron',
      recipe: { raw_iron: 3, raw_e710: 2 },
      recipeText: '3⛏️ + 2🛢️ ➔ 1x 🤖 Mech',
      initialInput: { raw_iron: 6, raw_e710: 4 },
      inputPos: { x: -760, z: 1470 },
      stationPos: { x: -460, z: 1470 },
      unlockPos: { x: -460, z: 1588 },
      pickupPos: { x: -160, z: 1470 },
      counterDropPos: { x: 280, z: 1470 },
      counterPos: { x: 500, z: 1470 },
      counter2Pos: { x: 820, z: 1470 },
      counter3Pos: { x: 1140, z: 1470 },
      cashPos: { x: 1420, z: 1470 },
      queueStart: { x: 1600, z: 1470 },
      description: 'LANE 6 (Lv.1–20): Combines 3x ⛏️ Iron + 2x 🛢️ E-710 to construct Patriot Mechs for Dedicated Counter #6.'
    },
    {
      id: 'warship',
      tier: 7,
      rowIndex: 6,
      name: 'SES Super Destroyer (Warship)',
      shortName: 'Super Destroyer',
      counterName: 'Counter #7: Orbital Destroyer Charter Desk',
      icon: '🚀',
      color: '#ec4899',
      unlockedAtStart: false,
      unlockCost: 18000,
      baseUpgradeCost: 3500,
      costScale: 1.40,
      maxLevel: 10,
      sellPrice: 2800,
      cycleTime: 5.5,
      maxBuffer: 5,
      initialStock: 1,
      rawType: 'raw_e710',
      recipe: { raw_iron: 4, raw_e710: 4 },
      recipeText: '4⛏️ + 4🛢️ ➔ 1x 🚀 Warship',
      initialInput: { raw_iron: 8, raw_e710: 8 },
      inputPos: { x: -760, z: 1740 },
      stationPos: { x: -460, z: 1740 },
      unlockPos: { x: -460, z: 1858 },
      pickupPos: { x: -160, z: 1740 },
      counterDropPos: { x: 280, z: 1740 },
      counterPos: { x: 500, z: 1740 },
      counter2Pos: { x: 820, z: 1740 },
      counter3Pos: { x: 1140, z: 1740 },
      cashPos: { x: 1420, z: 1740 },
      queueStart: { x: 1600, z: 1740 },
      description: 'LANE 7 (Lv.1–20): Combines 4x ⛏️ Iron + 4x 🛢️ E-710 to charter SES Super Destroyers at Dedicated Counter #7.'
    }
  ],

  LOCATIONS: {
    armoryLoadoutPad: { x: -160, z: -40, radius: 95 },
    cloneRoom: { x: -1500, z: -95, radius: 135, baseCost: 140, costScale: 1.42, maxLevel: 10, baseHireCost: 70, hireCostScale: 1.20 },
    hellpodBay: { x: 220, z: -100, radius: 130, baseCost: 140, costScale: 1.45, maxLevel: 10, baseDropFee: 0 },
    trashCanZone: { x: -1820, z: 1680, radius: 85 },
    cashRegisterZone: { x: 1420, z: 120, radius: 115 },
    counterDropZone: { x: 280, z: 120, radius: 105 },
    customerQueueStart: { x: 1600, z: 120 },
    customerSpawn: { x: 2420, z: 660 },
    customerExit: { x: 220, z: -100 },
    brazierWest: { x: -760, z: -1540, radius: 95, cost: 3 },
    brazierEast: { x: 760, z: -1540, radius: 95, cost: 3 }
  },

  UPGRADES: [
    {
      id: 'seaf_miner',
      name: 'Hire & Train Smart SEAF Quarry Miner (採礦兵)',
      icon: '⛏️',
      baseCost: 130,
      costMultiplier: 1.45,
      maxLevel: 10,
      description: 'Smart AI (Lv.1–20): Hauls un-belted Raw Ore to unique hoppers, OR hand-mines bonus ore from Quarry Veins once Raw Belts are active!'
    },
    {
      id: 'raw_speed_boost',
      name: 'Overclock Quarry & Tectonic Drills',
      icon: '⚙️',
      baseCost: 120,
      costMultiplier: 1.42,
      maxLevel: 10,
      description: 'Increases Super Iron & E-710 Auto-Drill speed (+25%/lvl) and expands Quarry storage buffer up to Lv.20.'
    },
    {
      id: 'seaf_ammo_hauler',
      name: 'Hire & Train Smart SEAF Gate Engineer (搬彈修門工兵)',
      icon: '🧱',
      baseCost: 150,
      costMultiplier: 1.45,
      maxLevel: 10,
      description: 'Smart AI (Lv.1–20): Prioritizes manually rebuilding Broken/Damaged Gates, then supplies un-belted Gate Turrets or boosts Ammo Press!'
    },
    {
      id: 'seaf_carrier',
      name: 'Hire & Train Smart SEAF Logistics & Cashier',
      icon: '🪖',
      baseCost: 140,
      costMultiplier: 1.45,
      maxLevel: 10,
      description: 'Smart AI (Lv.1–20): Stocks un-belted Item Counters, OR patrols all 7 Counters to serve customers faster & auto-collect $REQ when Belts are on!'
    },
    {
      id: 'seaf_cashier',
      name: 'Upgrade Auto-Cashier Drone Array (All 7 Counters)',
      icon: '🤖',
      baseCost: 240,
      costMultiplier: 1.48,
      maxLevel: 10,
      description: 'Automatically serves queued Helldivers across all 7 Item Counters faster (+20%/lvl up to Lv.20) and streams Requisition straight to your wallet.'
    },
    {
      id: 'player_boots',
      name: 'Jump-Jet Servo Boots',
      icon: '⚡',
      baseCost: 110,
      costMultiplier: 1.40,
      maxLevel: 10,
      description: 'Increases Commander movement speed (+8%/lvl up to Lv.20) and War-Zone snowplow radius.'
    },
    {
      id: 'player_exo_rig',
      name: 'Heavy Back-Stack Exo-Rig',
      icon: '🎒',
      baseCost: 130,
      costMultiplier: 1.42,
      maxLevel: 10,
      description: 'Adds +3 max carry capacity to your vertical back-stack per upgrade level (up to Lv.20).'
    },
    {
      id: 'factory_overclock',
      name: 'Super Uranium Factory Turbines',
      icon: '🔋',
      baseCost: 200,
      costMultiplier: 1.48,
      maxLevel: 10,
      description: 'Speeds up all 7 weapon, vehicle, mech, and warship assembly lines by +15% per level (up to Lv.20).'
    }
  ],

  PERMANENT_SKILLS: [
    {
      id: 'perm_gun_value',
      name: 'High-Caliber Arsenal Contracts',
      icon: '🔫',
      baseMedalCost: 2,
      costScale: 1.38,
      maxLevel: 10,
      desc: 'PERMANENT (Lv.1–20): +20% sale price across all 7 Item Counters forever.'
    },
    {
      id: 'perm_raw_speed',
      name: 'Deep-Mantle Tectonic Drills',
      icon: '⛏️',
      baseMedalCost: 2,
      costScale: 1.38,
      maxLevel: 10,
      desc: 'PERMANENT (Lv.1–20): +25% Raw Quarry & Munitions Press speed + 2.5% chance/lvl to save Raw Ore when crafting!'
    },
    {
      id: 'perm_gate_armor',
      name: '3-Layer Titanium Gate Bulkheads',
      icon: '🛡️',
      baseMedalCost: 2,
      costScale: 1.38,
      maxLevel: 10,
      desc: 'PERMANENT (Lv.1–20): +30% Max HP on all 3 Gate Layers and +5 HP/s maintenance on UNBROKEN gates (broken gates require manual repair!).'
    },
    {
      id: 'perm_turret_power',
      name: 'Orbital Autoloader Munitions',
      icon: '🗼',
      baseMedalCost: 3,
      costScale: 1.40,
      maxLevel: 10,
      desc: 'PERMANENT (Lv.1–20): +25% Gate Turret damage across all 3 Layers and +2.5% chance/lvl not to consume 🧱 Ammo.'
    },
    {
      id: 'perm_start_grant',
      name: 'Ministry Priority Drop Grant',
      icon: '💰',
      baseMedalCost: 3,
      costScale: 1.40,
      maxLevel: 10,
      desc: 'PERMANENT (Lv.1–20): Start every deployment with +$150 Requisition and +2 Carry Capacity per level.'
    },
    {
      id: 'perm_commander_elite',
      name: 'Viper Commando Stim Infusion',
      icon: '🦅',
      baseMedalCost: 3,
      costScale: 1.40,
      maxLevel: 10,
      desc: 'PERMANENT (Lv.1–20): +10% Commander & SEAF move speed and +25% personal weapon & Guard Dog drone damage forever.'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.07: MINDUSTRY MULTI-BASE PLANETARY SECTOR SYSTEM
  // Players can establish up to 6 Planetary Sector Bases, switch their active
  // command between unlocked bases, and receive passive Orbital Launch Pad
  // exports ($REQ/s, 🛢️ E-710, ⛏️ Iron, 🧱 Ammo) from all conquered bases!
  // --------------------------------------------------------------------------
  MINDUSTRY_BASES: [
    {
      id: 'base_alpha',
      code: 'SECTOR ALPHA-01',
      name: 'Base 1: Angels Venture Core (起始主基地)',
      icon: '🏛️',
      color: '#facc15',
      unlockedAtStart: true,
      unlockCost: 0,
      reqWave: 1,
      ironMult: 1.0,
      e710Mult: 1.0,
      sellMult: 1.0,
      passiveReqPerSec: 4,
      passiveE710Per10s: 1,
      passiveIronPer10s: 1,
      floorTint: '#141c2b',
      desc: 'Starter Mindustry Core Sector. Balanced Super Iron & E-710 deposits. Launch Pad exports +$4/s & +1 🛢️/⛏️ every 10s when operating in background.'
    },
    {
      id: 'base_beta',
      code: 'SECTOR BETA-02',
      name: 'Base 2: Heeth E-710 Cryo-Refinery (高純度燃料基地)',
      icon: '🛢️',
      color: '#a855f7',
      unlockedAtStart: false,
      unlockCost: 380,
      reqWave: 2,
      ironMult: 1.15,
      e710Mult: 1.85,
      sellMult: 1.25,
      passiveReqPerSec: 14,
      passiveE710Per10s: 3,
      passiveIronPer10s: 1,
      floorTint: '#17152e',
      desc: 'Rich E-710 Geyser Sector (+85% E-710 Pump Speed, +25% Sell Price). Background Launch Pad beams +$14/s & +3 🛢️ E-710 every 10s to your active base!'
    },
    {
      id: 'base_gamma',
      code: 'SECTOR GAMMA-03',
      name: 'Base 3: Tien Kwan Mech & Iron Foundry (重工與鐵礦基地)',
      icon: '⛏️',
      color: '#38bdf8',
      unlockedAtStart: false,
      unlockCost: 850,
      reqWave: 4,
      ironMult: 2.0,
      e710Mult: 1.25,
      sellMult: 1.5,
      passiveReqPerSec: 32,
      passiveE710Per10s: 2,
      passiveIronPer10s: 4,
      floorTint: '#112433',
      desc: 'Heavy Metallurgy Sector (2.0x Iron Drill Speed, +50% Sell Price). Background Launch Pad beams +$32/s & +4 ⛏️ Super Iron every 10s to your active base!'
    },
    {
      id: 'base_delta',
      code: 'SECTOR DELTA-04',
      name: 'Base 4: Malevelon Creek Munitions Fortress (前線軍火要塞)',
      icon: '🛡️',
      color: '#f97316',
      unlockedAtStart: false,
      unlockCost: 1800,
      reqWave: 7,
      ironMult: 1.75,
      e710Mult: 1.75,
      sellMult: 1.85,
      passiveReqPerSec: 68,
      passiveE710Per10s: 3,
      passiveIronPer10s: 3,
      passiveAmmoPer10s: 4,
      floorTint: '#261822',
      desc: 'Fortified Jungle Sector (1.75x Raw Extraction, +85% Sell Price). Background Launch Pad beams +$68/s & +4 🧱 Turret Ammo every 10s to your active base!'
    },
    {
      id: 'base_epsilon',
      code: 'SECTOR EPSILON-05',
      name: 'Base 5: Meridia Supercolony Bio-Core (超級蟲巢提煉中心)',
      icon: '🧪',
      color: '#22c55e',
      unlockedAtStart: false,
      unlockCost: 3600,
      reqWave: 12,
      ironMult: 2.2,
      e710Mult: 2.6,
      sellMult: 2.4,
      passiveReqPerSec: 145,
      passiveE710Per10s: 6,
      passiveIronPer10s: 5,
      passiveAmmoPer10s: 6,
      floorTint: '#132a1f',
      desc: 'High-Yield Bio-Fuel Sector (2.6x E-710, 2.4x Sell Value). Background Launch Pad beams +$145/s & massive raw shipments to your active base!'
    },
    {
      id: 'base_zeta',
      code: 'SECTOR ZETA-06',
      name: 'Base 6: Cyberstan Orbital Mega-Citadel (生化斯坦終極星際母基地)',
      icon: '🚀',
      color: '#ef4444',
      unlockedAtStart: false,
      unlockCost: 7500,
      reqWave: 18,
      ironMult: 3.0,
      e710Mult: 3.0,
      sellMult: 3.5,
      passiveReqPerSec: 320,
      passiveE710Per10s: 8,
      passiveIronPer10s: 8,
      passiveAmmoPer10s: 10,
      floorTint: '#28141c',
      desc: 'Supreme Mindustry Core Citadel (3.0x All Extraction, 3.5x Sell Price). Background Launch Pad beams +$320/s & full orbital resupply to all bases!'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.07: MINDUSTRY-STYLE VISUAL NODE TECH TREE (13 CONNECTED NODES)
  // Visual 2D schematic tree starting from `core_shard` (x: 0.50, y: 0.10)
  // branching into 4 Mindustry paths: Extraction, Factory, Defense, Allied War!
  // --------------------------------------------------------------------------
  MINDUSTRY_TECH_NODES: [
    {
      id: 'core_shard',
      parentId: null,
      branch: 'core',
      name: 'Core: Super Earth Shard',
      zhName: '核心：超級地球指揮母核',
      icon: '🏛️',
      color: '#facc15',
      nx: 0.50,
      ny: 0.11,
      maxLevel: 10,
      baseMedalCost: 1,
      reqCost: 100,
      linkedPermId: 'perm_start_grant',
      desc: 'Root Mindustry Command Core. Unlocks all 4 research branches and grants +$150 starting Requisition & +2 Carry Stack per level.'
    },
    // Branch 1 (Left-Outer): Extraction & Multi-Base Launch Pads
    {
      id: 'tech_pneumatic_drill',
      parentId: 'core_shard',
      branch: 'extraction',
      name: 'Pneumatic & Laser Drills',
      zhName: '氣動與雷射深層鑽機',
      icon: '⛏️',
      color: '#38bdf8',
      nx: 0.14,
      ny: 0.36,
      maxLevel: 10,
      baseMedalCost: 1,
      reqCost: 120,
      linkedPermId: 'perm_raw_speed',
      desc: '+25% Raw Quarry & Munitions Press speed per level + 2.5% chance not to consume Raw Ore.'
    },
    {
      id: 'tech_titanium_belts',
      parentId: 'tech_pneumatic_drill',
      branch: 'extraction',
      name: 'Titanium Dual-Split Belts',
      zhName: '鈦合金雙軌高速輸送帶',
      icon: '⚙️',
      color: '#38bdf8',
      nx: 0.14,
      ny: 0.62,
      maxLevel: 10,
      baseMedalCost: 2,
      reqCost: 220,
      desc: 'Boosts all Split Raw Belt (🛢️/⛏️) & Counter Belt packet transit speeds by +20% per level.'
    },
    {
      id: 'tech_launch_pads',
      parentId: 'tech_titanium_belts',
      branch: 'extraction',
      name: 'Orbital Mass Driver & Launch Pads',
      zhName: '星際質量投射器 (多基地產量加倍)',
      icon: '🚀',
      color: '#38bdf8',
      nx: 0.14,
      ny: 0.88,
      maxLevel: 10,
      baseMedalCost: 3,
      reqCost: 400,
      desc: 'Mindustry Inter-Base Logistics: +35% passive $REQ, 🛢️ E-710, and ⛏️ Iron exported from all your other conquered Sector Bases!'
    },
    // Branch 2 (Left-Inner): Factory Silicon Foundry & Arsenal Contracts
    {
      id: 'tech_silicon_foundry',
      parentId: 'core_shard',
      branch: 'factory',
      name: 'High-Caliber Arsenal Contracts',
      zhName: '高價值軍火貿易合約',
      icon: '💵',
      color: '#22c55e',
      nx: 0.38,
      ny: 0.36,
      maxLevel: 10,
      baseMedalCost: 1,
      reqCost: 140,
      linkedPermId: 'perm_gun_value',
      desc: '+20% sale value across all 7 Dedicated Item Counters forever.'
    },
    {
      id: 'tech_overdrive_dome',
      parentId: 'tech_silicon_foundry',
      branch: 'factory',
      name: 'Mindustry Overdrive Projector',
      zhName: '超頻力場投射器 (全產線加速)',
      icon: '🔋',
      color: '#22c55e',
      nx: 0.38,
      ny: 0.62,
      maxLevel: 10,
      baseMedalCost: 2,
      reqCost: 260,
      desc: 'Radiates an Overdrive Dome across all 7 Production Lanes (+18% crafting speed per level).'
    },
    {
      id: 'tech_mech_drydock',
      parentId: 'tech_overdrive_dome',
      branch: 'factory',
      name: 'T5 Exponential Reconstructor',
      zhName: '五階指數級機甲與戰艦重構廠',
      icon: '🤖',
      color: '#22c55e',
      nx: 0.38,
      ny: 0.88,
      maxLevel: 10,
      baseMedalCost: 3,
      reqCost: 450,
      desc: '+30% Vehicle, Patriot Mech & Super Destroyer crafting speed and -20% War Front deployment cost!'
    },
    // Branch 3 (Right-Inner): Mindustry Walls, Mend Projectors & Foreshadow Turrets
    {
      id: 'tech_plastanium_walls',
      parentId: 'core_shard',
      branch: 'defense',
      name: 'Plastanium & Surge Gate Walls',
      zhName: '塑鋼與巨浪合金三層城門',
      icon: '🛡️',
      color: '#f97316',
      nx: 0.62,
      ny: 0.36,
      maxLevel: 10,
      baseMedalCost: 1,
      reqCost: 130,
      linkedPermId: 'perm_gate_armor',
      desc: '+30% Max HP on Gate Layers 3, 2, 1 and +5 HP/s maintenance on unbroken gates.'
    },
    {
      id: 'tech_mend_projector',
      parentId: 'tech_plastanium_walls',
      branch: 'defense',
      name: 'Mindustry Mend & Reload Dome',
      zhName: 'Mindustry 修復與自動裝填塔',
      icon: '💚',
      color: '#f97316',
      nx: 0.62,
      ny: 0.62,
      maxLevel: 10,
      baseMedalCost: 2,
      reqCost: 240,
      linkedPermId: 'perm_turret_power',
      desc: '+25% Gate Turret damage, +2.5% ammo-save chance, and boosts War Front Mend Projector healing by +35%/lvl.'
    },
    {
      id: 'tech_foreshadow_rail',
      parentId: 'tech_mend_projector',
      branch: 'defense',
      name: 'Foreshadow Orbital Railcannon',
      zhName: '預兆級電磁軌道巨砲塔',
      icon: '⚡',
      color: '#f97316',
      nx: 0.62,
      ny: 0.88,
      maxLevel: 10,
      baseMedalCost: 3,
      reqCost: 480,
      desc: 'Gate Sentries fire piercing railcannon beams that deal +40% bonus damage to Hulks, Bile Titans & Factory Striders!'
    },
    // Branch 4 (Right-Outer): Commander, Smart SEAF AI & Allied War Units
    {
      id: 'tech_viper_commando',
      parentId: 'core_shard',
      branch: 'command',
      name: 'Viper Commando Exo-Servos',
      zhName: '毒蛇突擊隊外骨骼與無人機',
      icon: '🦅',
      color: '#a855f7',
      nx: 0.86,
      ny: 0.36,
      maxLevel: 10,
      baseMedalCost: 1,
      reqCost: 150,
      linkedPermId: 'perm_commander_elite',
      desc: '+10% Commander & SEAF move speed and +25% personal weapon & Guard Dog drone damage.'
    },
    {
      id: 'tech_smart_seaf_ai',
      parentId: 'tech_viper_commando',
      branch: 'command',
      name: 'Mindustry Logic Processor AI',
      zhName: 'Mindustry 邏輯處理器 (SEAF 效率倍增)',
      icon: '🧠',
      color: '#a855f7',
      nx: 0.86,
      ny: 0.62,
      maxLevel: 10,
      baseMedalCost: 2,
      reqCost: 260,
      desc: 'Equips SEAF Miners, Logistics & Engineers with Mindustry Micro-Processors (+25% carry stack & +30% repair speed/lvl).'
    },
    {
      id: 'tech_war_unit_command',
      parentId: 'tech_smart_seaf_ai',
      branch: 'command',
      name: 'War-Zone Allied Mech Command',
      zhName: '戰區盟軍機甲與車隊指揮部',
      icon: '⚔️',
      color: '#a855f7',
      nx: 0.86,
      ny: 0.88,
      maxLevel: 10,
      baseMedalCost: 3,
      reqCost: 460,
      desc: 'Allied SEAF Squads, Recon Buggies & Patriot Mechs deployed on the War Front gain +40% HP and +35% firepower per level!'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.07: DEDICATED WAR-FRONT TACTICAL DEPLOYMENTS
  // Bridges the Shop & War Zone: convert produced factory items (🔫 Gun,
  // 🚙 Vehicle, 🤖 Mech) OR Requisition ($) into active allied War-Zone units!
  // --------------------------------------------------------------------------
  WAR_DEPLOYMENTS: [
    {
      id: 'deploy_squad',
      name: '🪖 SEAF Rifle Squad',
      zhName: '派遣 SEAF 步槍班',
      itemCostId: 'gun',
      cashFallbackCost: 80,
      hp: 260,
      damage: 24,
      fireRate: 0.35,
      range: 360,
      speed: 135,
      color: '#38bdf8',
      desc: 'Consumes 1x 🔫 Gun (or $80) to deploy an autonomous SEAF Rifleman on the War Front!'
    },
    {
      id: 'deploy_buggy',
      name: '🚙 FRV Recon Patrol',
      zhName: '派遣偵察戰車巡邏',
      itemCostId: 'vehicle',
      cashFallbackCost: 180,
      hp: 580,
      damage: 46,
      fireRate: 0.25,
      range: 420,
      speed: 185,
      color: '#eab308',
      desc: 'Consumes 1x 🚙 Vehicle (or $180) to deploy a fast HMG Recon Buggy patrolling the Gate Layers!'
    },
    {
      id: 'deploy_mech',
      name: '🤖 Patriot Mech Walker',
      zhName: '派遣愛國者重型機甲',
      itemCostId: 'mech',
      cashFallbackCost: 320,
      hp: 1200,
      damage: 95,
      fireRate: 0.28,
      range: 460,
      speed: 110,
      color: '#f97316',
      desc: 'Consumes 1x 🤖 Patriot Mech (or $320) to deploy an autonomous Heavy Exosuit on the War Front!'
    },
    {
      id: 'build_mender',
      name: '💚 Mindustry Mend Tower',
      zhName: '建造 Mindustry 綠光修復塔',
      itemCostId: null,
      cashFallbackCost: 160,
      color: '#4ade80',
      desc: 'Builds/Upgrades Mindustry Mend Projectors ($160) behind all 3 Gate Layers that auto-heal gates & reload turret ammo!'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.09: CAPYBARA GO! × HELLDIVERS 2 ROGUELIKE PERK CARDS
  // Earned every Stage / Wave level-up during Attack & Defense Operations!
  // --------------------------------------------------------------------------
  ROGUELIKE_CARDS: [
    {
      id: 'rk_arc_chain',
      name: '⚡ ARC-3 Lightning Thrower',
      zhName: '閃電鏈折射 (攻擊彈射+2目標)',
      icon: '⚡',
      color: '#38bdf8',
      desc: 'All Commander & Squad attacks chain lightning to +2 nearby enemies for +35% bonus damage per stack!'
    },
    {
      id: 'rk_eagle_napalm',
      name: '🦅 Eagle-1 Napalm Carpet',
      zhName: '飛鷹凝固汽油彈轟炸 (每6秒全場火海)',
      icon: '🦅',
      color: '#f97316',
      desc: 'Calls an automatic Eagle-1 Napalm Air-Strike every 6 seconds that burns the enemy frontline!'
    },
    {
      id: 'rk_hellpod_crush',
      name: '🚀 Hellpod Kinetic Slam',
      zhName: '絕地空投艙重擊 (新兵空投造成450範圍傷害)',
      icon: '🚀',
      color: '#facc15',
      desc: 'Every Helldiver customer launched from your Shop Hellpods slams into enemies for 450 AoE damage + +30% Squad HP!'
    },
    {
      id: 'rk_viper_stims',
      name: '💉 Experimental Viper Stims',
      zhName: '實驗性毒蛇興奮劑 (擊殺回血18% + 攻速+25%)',
      icon: '💉',
      color: '#4ade80',
      desc: 'Heals your War Squad & Active Gate for 18% HP on Boss/Elite kills and boosts all fire rates by +25%!'
    },
    {
      id: 'rk_orbital_gatling',
      name: '🔥 Orbital Gatling Overclock',
      zhName: '軌道機砲超頻 (子彈數量+1 & 砲塔傷害+40%)',
      icon: '🔥',
      color: '#ef4444',
      desc: 'Adds +1 extra projectile to every shot and increases all 3 Gate Sentry Turrets damage by +40%!'
    },
    {
      id: 'rk_shield_relay',
      name: '🛡️ FX-12 Dome Shield Relay',
      zhName: 'FX-12 穹頂護盾中繼器 (最大HP+45% & 減傷25%)',
      icon: '🛡️',
      color: '#a855f7',
      desc: 'Projects a Super Earth energy dome that grants +45% Max HP and 25% Damage Reduction to Gates & Allied Squads!'
    },
    {
      id: 'rk_patriot_drop',
      name: '🤖 Emergency Patriot Mech Drop',
      zhName: '緊急空投愛國者機甲 (+1台免費機甲 & 機甲傷害+40%)',
      icon: '🤖',
      color: '#eab308',
      desc: 'Immediately drops 1 Free EXO-45 Patriot Mech onto the battlefield and boosts all Mech damage by +40%!'
    },
    {
      id: 'rk_war_spoils',
      name: '💰 Ministry War Spoils Contract',
      zhName: '軍需部戰利品合約 (戰場賞金與空投費+50%)',
      icon: '💰',
      color: '#22c55e',
      desc: 'Increases all War-Zone kill bounties, Mission Victory Chests, and Shop Hellpod Drop Fees by +50%!'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.10: IDLE TAP POP-UP MULTI-ABILITY UPGRADE DEFINITIONS
  // Tapping any Machine, Counter, Quarry Drill, or Ammo Press opens a compact
  // Idle-Tycoon Pop-Up Window to upgrade individual abilities (Lv.1-10)!
  // --------------------------------------------------------------------------
  BUILDING_ABILITIES: {
    station: [
      {
        key: 'priceLvl',
        icon: '💰',
        name: 'Unit Sale Price (單價提升)',
        desc: '+25% Requisition sale price per item at this Counter.',
        baseCostMult: 0.85,
        costScale: 1.34
      },
      {
        key: 'speedLvl',
        icon: '⚡',
        name: 'Crafting Speed (製造加速)',
        desc: '+22% faster fabrication speed & conveyor output rate.',
        baseCostMult: 0.90,
        costScale: 1.35
      },
      {
        key: 'yieldLvl',
        icon: '📦',
        name: '1 Raw ➔ More Goods (原料倍增產出)',
        desc: '1 raw batch crafts +1 extra finished item (Lv.3/6/9 -> up to 4x goods!) + +7% raw-save chance/lvl.',
        baseCostMult: 1.15,
        costScale: 1.40
      },
      {
        key: 'counterLvl',
        icon: '🏪',
        name: 'Counter Desks & Shelf (櫃檯擴建 1➔3)',
        desc: 'Lv.4 unlocks 2nd Counter Desk, Lv.8 unlocks 3rd Counter Desk + +25% checkout speed & shelf cap!',
        baseCostMult: 1.05,
        costScale: 1.38
      }
    ],
    raw: [
      {
        key: 'speedLvl',
        icon: '⚡',
        name: 'Drill / Pump Speed (採集速度)',
        desc: '+25% faster auto-extraction cycle & adds extra drill rigs.',
        baseCostMult: 0.90,
        costScale: 1.35
      },
      {
        key: 'yieldLvl',
        icon: '📦',
        name: 'Batch Yield (單次採集產量)',
        desc: '+1 extra Raw Ore produced every cycle per 2 levels (up to 6x per cycle!).',
        baseCostMult: 1.10,
        costScale: 1.38
      },
      {
        key: 'bufferLvl',
        icon: '🗄️',
        name: 'Storage & Belt Feed (容量與輸送)',
        desc: '+6 max storage buffer & +20% faster raw belt packet transfer.',
        baseCostMult: 0.80,
        costScale: 1.32
      }
    ],
    ammo: [
      {
        key: 'speedLvl',
        icon: '⚡',
        name: 'Press Stamp Speed (壓製速度)',
        desc: '+25% faster munitions stamping speed.',
        baseCostMult: 0.90,
        costScale: 1.35
      },
      {
        key: 'yieldLvl',
        icon: '🧱',
        name: '1 Iron ➔ More Ammo (1鐵產更多彈藥)',
        desc: '1x ⛏️ Iron produces +1 extra 🧱 Turret Ammo per level (from 3x up to 12x per Iron!).',
        baseCostMult: 1.10,
        costScale: 1.38
      },
      {
        key: 'bufferLvl',
        icon: '🗄️',
        name: 'Ordnance Magazine Cap (彈藥庫容量)',
        desc: '+8 max ammo storage & +25% faster Gate Ammo Belt feed.',
        baseCostMult: 0.80,
        costScale: 1.32
      }
    ]
  },

  // --------------------------------------------------------------------------
  // NEW IN v0.0.10: SEAF CLONE VAT ROOM & 6 ASSIGNABLE SECTOR JOBS
  // No need to thaw cryo pods in the War Zone! Upgrade the Clone Room to raise
  // your Worker Upper Limit (4 -> 30), hire SEAF Clones, and freely assign them!
  // --------------------------------------------------------------------------
  CLONE_JOBS: [
    {
      id: 'miner',
      icon: '⛏️',
      name: 'Quarry Miner (採礦與投料)',
      shortName: 'Pick Raw',
      color: '#38bdf8',
      desc: 'Harvests 🛢️ E-710 & ⛏️ Iron in the Quarry and feeds Machine Hoppers.'
    },
    {
      id: 'hauler',
      icon: '📦',
      name: 'Factory Hauler (成品搬運)',
      shortName: 'Haul Goods',
      color: '#facc15',
      desc: 'Carries finished items from Factory Output Pads to the 7 Counter Bays.'
    },
    {
      id: 'sales',
      icon: '🫡',
      name: 'Counter Sales (櫃檯銷售收銀)',
      shortName: 'Sales Desk',
      color: '#a855f7',
      desc: 'Staffs the 7 Counters to check out Helldiver customers +30% faster per worker!'
    },
    {
      id: 'cash',
      icon: '💵',
      name: 'Cash Collector (自動收錢專員)',
      shortName: 'Pick Money',
      color: '#22c55e',
      desc: 'Patrols all 7 Counter Cash Vaults and vacuums $REQ bills straight to your wallet.'
    },
    {
      id: 'ammo',
      icon: '🧱',
      name: 'Ammo & Gate Tech (搬彈與修門)',
      shortName: 'Pick Ammo',
      color: '#f97316',
      desc: 'Feeds ⛏️ Iron to the Munitions Press, loads 🧱 Turret Ammo & repairs Defense Gates.'
    },
    {
      id: 'war',
      icon: '⚔️',
      name: 'War Front Reserve (戰場參戰部隊)',
      shortName: 'Pick War',
      color: '#ef4444',
      desc: 'Deploys directly into every War Game (Attack & Defense) as an allied SEAF Rifleman!'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.10: NAMED WAR HEROES (WITH GEN-1 PERMADEATH MARTYRDOM & CLONE REBIRTH)
  // Heroes lead your War Game squad! On their first design (Gen-1), if their HP
  // hits 0 in battle, they die heroically (detonating a Martyrdom Hellbomb,
  // earning +1 ⭐ Martyr Medal, and unlocking stronger Gen-2+ Clone DNA rebirth!).
  // --------------------------------------------------------------------------
  WAR_HEROES: [
    {
      id: 'hero_brasch',
      name: 'General Brasch',
      zhName: '傳奇英雄：布拉쉬將軍',
      icon: '🦅',
      color: '#facc15',
      hireCost: 180,
      reviveCloneCost: 140,
      baseHp: 950,
      baseDmg: 68,
      fireRate: 0.22,
      abilityName: '500KG Martyr Hellbomb & Dual HMG',
      desc: 'Super Earth’s toughest tactician. Fires twin HMGs. If killed in Gen-1, triggers a screen-wiping 500KG Martyrdom Nuke (+1 ⭐ Medal) & unlocks Gen-2+ Clone DNA (+35% stats/gen)!'
    },
    {
      id: 'hero_john',
      name: 'John Helldiver',
      zhName: '無雙戰神：約翰·絕地戰兵',
      icon: '💀',
      color: '#38bdf8',
      hireCost: 260,
      reviveCloneCost: 190,
      baseHp: 1150,
      baseDmg: 92,
      fireRate: 0.20,
      abilityName: 'Quasar Overcharge & Orbital Laser',
      desc: 'One-man army armed with a rapid-fire Quasar Cannon. If killed, unleashes an Orbital Laser sweep across all enemies & returns +35% stronger per Clone Gen!'
    },
    {
      id: 'hero_eagle',
      name: 'Eagle-1 Ace Pilot',
      zhName: '空戰王牌：飛鷹一號戰機長',
      icon: '✈️',
      color: '#f97316',
      hireCost: 380,
      reviveCloneCost: 260,
      baseHp: 1050,
      baseDmg: 115,
      fireRate: 0.24,
      abilityName: 'Carpet Napalm & Cluster Strike',
      desc: 'Calls automatic Eagle airstrikes every 5s during War Games. If shot down, drops a full payload of Cluster Bombs & unlocks stronger Clone DNA!'
    },
    {
      id: 'hero_viper',
      name: 'Viper Commando Alpha',
      zhName: '叢林死神：毒蛇突擊隊長',
      icon: '🐍',
      color: '#4ade80',
      hireCost: 520,
      reviveCloneCost: 340,
      baseHp: 1450,
      baseDmg: 140,
      fireRate: 0.18,
      abilityName: 'Super-Stim Aura (+25% Squad SPD/HEAL)',
      desc: 'Boosts all allied Client Mercenaries & SEAF troops by +25% attack speed and heals them every wave!'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.11: NIGHTFALL: KINGDOM FRONTIER TD × CASTLE DEFENSE & STRONGHOLD (據點) MAP
  // 100% of $REQ money, 🧱 Turret Ammo, and 🦺/🔫/🎒/🚙/🤖 gear come from your Shop!
  //Zero economy buildings in War Zone — focus on Castle Defense & Sally-Out Counter-Attack!
  // --------------------------------------------------------------------------
  NIGHTFALL_CASTLE: {
    keep: {
      x: -940,
      z: -1020,
      name: 'Super Earth Frontier Citadel Keep',
      zhName: '超級地球王國邊境主堡'
    },
    // 6 Upgradable Frontier Watchtowers (Lv.1-10) around the Castle Perimeter & River Bridge
    // Powered by 🧱 Turret Ammo stamped in your Shop's Munitions Press!
    watchtowers: [
      {
        id: 'tw_1',
        slot: 1,
        name: 'Tower #1: North Bastion MG Sentry',
        zhName: '1號北側城牆機槍塔',
        icon: '🗼',
        color: '#38bdf8',
        x: -540,
        z: -1430,
        baseCost: 110,
        costScale: 1.35,
        baseDmg: 32,
        fireRate: 0.34,
        range: 520,
        unlockedAtStart: true
      },
      {
        id: 'tw_2',
        slot: 2,
        name: 'Tower #2: Upper East Gate Autocannon',
        zhName: '2號東門北翼機砲塔',
        icon: '🗼',
        color: '#facc15',
        x: -230,
        z: -1210,
        baseCost: 120,
        costScale: 1.35,
        baseDmg: 38,
        fireRate: 0.32,
        range: 540,
        unlockedAtStart: true
      },
      {
        id: 'tw_3',
        slot: 3,
        name: 'Tower #3: Lower East Gate Flak Tower',
        zhName: '3號東門南翼高爆塔',
        icon: '🗼',
        color: '#facc15',
        x: -230,
        z: -820,
        baseCost: 140,
        costScale: 1.35,
        baseDmg: 42,
        fireRate: 0.32,
        range: 540,
        unlockedAtStart: true
      },
      {
        id: 'tw_4',
        slot: 4,
        name: 'Tower #4: South Stone Bridge Bastion',
        zhName: '4號南側石橋守衛塔',
        icon: '🗼',
        color: '#f97316',
        x: -500,
        z: -510,
        baseCost: 160,
        costScale: 1.36,
        baseDmg: 48,
        fireRate: 0.30,
        range: 560,
        unlockedAtStart: true
      },
      {
        id: 'tw_5',
        slot: 5,
        name: 'Tower #5: West Bridgehead Rail-Tower',
        zhName: '5號西橋頭電磁軌道塔',
        icon: '⚡',
        color: '#a855f7',
        x: -860,
        z: -510,
        baseCost: 190,
        costScale: 1.38,
        baseDmg: 58,
        fireRate: 0.28,
        range: 580,
        unlockedAtStart: false
      },
      {
        id: 'tw_6',
        slot: 6,
        name: 'Tower #6: River Island Forward Outpost',
        zhName: '6號河心前哨巨砲塔',
        icon: '🚀',
        color: '#4ade80',
        x: 60,
        z: -740,
        baseCost: 240,
        costScale: 1.40,
        baseDmg: 72,
        fireRate: 0.26,
        range: 620,
        unlockedAtStart: false
      }
    ],
    // 3 Destructible Eastern Enemy Strongholds (據點) across the River Moat
    // Players can command their Hero + Managed War Squads to Sally Out (出擊攻打據點) and raze them!
    strongholds: [
      {
        id: 'sh_north_bot',
        index: 1,
        name: 'North Bot Cave Stronghold',
        zhName: '北側機器人山洞據點 (據點 #1)',
        icon: '🤖',
        bossType: 'hulk',
        color: '#ef4444',
        x: 960,
        z: -1420,
        baseHp: 1400,
        rewardCash: 480,
        rewardMedals: 2,
        desc: 'Spawns Automaton Troopers, Rocket Devastators & Flame-Saw Hulks marching toward the East Castle Gate.'
      },
      {
        id: 'sh_mid_outpost',
        index: 2,
        name: 'Central River Iron Fortress',
        zhName: '中路河岸重裝要塞 (據點 #2)',
        icon: '🏴‍☠️',
        bossType: 'strider',
        color: '#f97316',
        x: 1080,
        z: -980,
        baseHp: 1900,
        rewardCash: 720,
        rewardMedals: 3,
        desc: 'Heavily armored river crossing stronghold guarded by Factory Striders. Raze it for massive $REQ & Forever Medals!'
      },
      {
        id: 'sh_south_hive',
        index: 3,
        name: 'South Terminid Bio-Hive Cave',
        zhName: '南側終結族超級蟲巢 (據點 #3)',
        icon: '🪲',
        bossType: 'titan',
        color: '#a855f7',
        x: 920,
        z: -520,
        baseHp: 2400,
        rewardCash: 980,
        rewardMedals: 4,
        desc: 'Breeds Scavenger Hunters, Bile Spewers & Bile Titans that swarm across the South Stone Arch Bridge!'
      }
    ]
  },

  // --------------------------------------------------------------------------
  // NEW IN v0.0.11: MANAGEABLE WAR SQUADS (🪖 戰術小隊管理 — JOINS CASTLE DEFENSE & STRONGHOLD ATTACK!)
  // Visible in neat 2x4 troop formation grids (like Nightfall: Kingdom Frontier TD) both in
  // Shop Sector D (Clone & Squad Muster Bay) and inside the Frontier Castle Compound!
  // --------------------------------------------------------------------------
  WAR_SQUADS: [
    {
      id: 'squad_alpha',
      name: 'Alpha Vanguard Rifle Squad',
      zhName: '阿爾法先鋒步槍小隊 (8人方陣)',
      icon: '🪖',
      color: '#38bdf8',
      unitType: 'deploy_squad',
      maxSize: 8,
      initialSize: 4,
      recruitCashCost: 65,
      gearItemIds: ['cloth', 'gun'],
      gearUpgradeBaseCost: 110,
      baseUnitHp: 320,
      baseUnitDmg: 30,
      fireRate: 0.30,
      range: 420,
      speed: 150,
      shopFormationPos: { x: -1020, z: -230 },
      castleBarracksPos: { x: -640, z: -1240 },
      bridgePostPos: { x: -110, z: -1020 },
      desc: 'Frontline Helldiver infantry formation (up to 8 soldiers). Equipped with Shop 🦺 Armor & 🔫 Liberator Rifles!'
    },
    {
      id: 'squad_bravo',
      name: 'Bravo Jump-Pack & Heavy Squad',
      zhName: '布拉沃噴射重裝小隊 (8人方陣)',
      icon: '🚀',
      color: '#facc15',
      unitType: 'deploy_buggy',
      maxSize: 8,
      initialSize: 2,
      recruitCashCost: 115,
      gearItemIds: ['resource', 'equipment', 'vehicle'],
      gearUpgradeBaseCost: 165,
      baseUnitHp: 560,
      baseUnitDmg: 52,
      fireRate: 0.26,
      range: 460,
      speed: 175,
      shopFormationPos: { x: -780, z: -230 },
      castleBarracksPos: { x: -640, z: -920 },
      bridgePostPos: { x: -580, z: -410 },
      desc: 'Fast mobile strike platoon (up to 8 units). Uses Shop 📦 Grenades, 🎒 Jump Packs & 🚙 Recon Buggies to guard the Stone Bridge!'
    },
    {
      id: 'squad_charlie',
      name: 'Charlie Patriot Exosuit Squad',
      zhName: '查理愛國者機甲小隊 (8人方陣)',
      icon: '🤖',
      color: '#f97316',
      unitType: 'deploy_mech',
      maxSize: 8,
      initialSize: 1,
      recruitCashCost: 220,
      gearItemIds: ['mech', 'warship'],
      gearUpgradeBaseCost: 260,
      baseUnitHp: 1250,
      baseUnitDmg: 98,
      fireRate: 0.24,
      range: 510,
      speed: 125,
      shopFormationPos: { x: -540, z: -230 },
      castleBarracksPos: { x: -960, z: -720 },
      bridgePostPos: { x: 80, z: -980 },
      desc: 'Heavy armored walker formation (up to 8 Patriot Mechs). Crushes Enemy Strongholds (據點) when ordered to Sally Out!'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.12: LEFT-HAND TRANSPORT SHIP & PORT LOGISTICS (左舷運輸艦與港口系統)
  // - At start, raw providing speed is fixed at 1 per Oil (🛢️) and 1 per Iron (⛏️).
  // - Raw ore is dropped off by Transport Ships on the left-hand side of HallTown!
  // - Buy more Transport Ships (1->10), add more Docking Ports (1->4), and upgrade
  //   Port Unloading Speed (Lv.1-10), Port Storage Limit (Lv.1-10), & Ship Cargo!
  // --------------------------------------------------------------------------
  PORT_LOGISTICS: {
    fixedStartOilPerSec: 1.0,
    fixedStartIronPerSec: 1.0,
    maxPorts: 4,
    maxShips: 10,
    maxUpgradeLevel: 10,
    baseBuyShipCost: 160,
    buyShipCostScale: 1.48,
    baseAddPortCost: 280,
    addPortCostScale: 1.85,
    baseUnloadSpeedCost: 130,
    unloadSpeedCostScale: 1.42,
    baseStorageLimitCost: 140,
    storageLimitCostScale: 1.42,
    baseShipCargoCost: 150,
    shipCargoCostScale: 1.44,
    portPositions: [
      { id: 'port_1', index: 1, x: -1820, z: 210, label: 'PORT #1 (North Oil/Ore Dock)' },
      { id: 'port_2', index: 2, x: -1820, z: 490, label: 'PORT #2 (Central Cargo Dock)' },
      { id: 'port_3', index: 3, x: -1820, z: 770, label: 'PORT #3 (South Heavy Dock)' },
      { id: 'port_4', index: 4, x: -1820, z: 1050, label: 'PORT #4 (Deep-Space Mega Dock)' }
    ]
  },

  // --------------------------------------------------------------------------
  // NEW IN v0.0.12: GALACTIC SPACE MAP (🪐 星際戰略星圖 — BUGS OR AUTOBOTS, 1 FACTION/PLANET)
  // - Each planet has ONE enemy faction ('bugs' OR 'autobots') and specific Ore!
  // - Captured planets must upgrade Mine Level & Storage Limit; Transport Ships fly
  //   from HallTown to pick up stored ore and unload at the Left-Hand Port!
  // - Enemy planets accumulate Army based on Difficulty (1-10); once Enemy Army
  //   reaches Attack Threshold, it launches a Travian-style auto-calculated war on
  //   our closest linked planet!
  // --------------------------------------------------------------------------
  SPACE_MAP_PLANETS: [
    {
      id: 'planet_halltown',
      name: 'SES HallTown Mother Ship (母艦基地)',
      zhName: 'HallTown 戰艦母港 (固定起始 +1🛢️/+1⛏️)',
      isHome: true,
      ownedAtStart: true,
      difficulty: 0,
      faction: 'super_earth',
      factionLabel: '🦅 SUPER EARTH HQ',
      oreName: 'Starter Orbital Supply (1🛢️ Oil + 1⛏️ Iron/s)',
      oreIcon: '🛸',
      oilRatio: 0.5,
      ironRatio: 0.5,
      bonusOreType: 'titanium',
      baseMineRate: 2.0,
      nx: 0.50,
      ny: 0.52,
      color: '#facc15',
      links: ['sp_heeth', 'sp_angels', 'sp_fenrir', 'sp_tienkwan'],
      desc: 'Your Super Destroyer Orbital Hub! Produces a fixed 1 Oil + 1 Iron per cycle at start and dispatches Transport Ships to all captured planets.'
    },
    {
      id: 'sp_heeth',
      name: 'Heeth E-710 Bio-Refinery',
      zhName: '希斯星 (Lv.1 蟲族 · 高純度石油礦)',
      isHome: false,
      ownedAtStart: true,
      difficulty: 1,
      faction: 'bugs',
      factionLabel: '🐛 TERMINID BUGS ONLY',
      oreName: 'Pure E-710 Bio-Oil (80%🛢️ Oil · 20%⛏️ Iron)',
      oreIcon: '🛢️',
      oilRatio: 0.80,
      ironRatio: 0.20,
      bonusOreType: '바이오_oil',
      baseMineRate: 1.4,
      nx: 0.28,
      ny: 0.36,
      color: '#a855f7',
      links: ['planet_halltown', 'sp_fenrir', 'sp_turing'],
      desc: 'Captured Terminid Frontier (Diff 1). Rich in E-710 Crude Oil. Keep garrison troops & walls ready against Fenrir & Turing bug swarms!'
    },
    {
      id: 'sp_angels',
      name: 'Angels Venture Iron Crater',
      zhName: '安傑爾星 (Lv.1 機器人 · 高純度鐵礦)',
      isHome: false,
      ownedAtStart: false,
      difficulty: 1,
      faction: 'autobots',
      factionLabel: '🤖 AUTOMATON BOTS ONLY',
      oreName: 'Super Iron Vein (20%🛢️ Oil · 80%⛏️ Iron)',
      oreIcon: '⛏️',
      oilRatio: 0.20,
      ironRatio: 0.80,
      bonusOreType: 'ferro_ore',
      baseMineRate: 1.6,
      nx: 0.72,
      ny: 0.36,
      color: '#38bdf8',
      links: ['planet_halltown', 'sp_tienkwan', 'sp_malevelon'],
      desc: 'Automaton Mining Outpost (Diff 1). Rich in Super Iron Ore. Adjacent to HallTown — ideal first planet to capture!'
    },
    {
      id: 'sp_fenrir',
      name: 'Fenrir III Spore Badlands',
      zhName: '芬里爾三號 (Lv.2 蟲族 · 雙倍生物油礦)',
      isHome: false,
      ownedAtStart: false,
      difficulty: 2,
      faction: 'bugs',
      factionLabel: '🐛 TERMINID BUGS ONLY',
      oreName: 'Volatile Spore Oil (85%🛢️ Oil · 15%⛏️ Iron)',
      oreIcon: '🧪',
      oilRatio: 0.85,
      ironRatio: 0.15,
      bonusOreType: 'spore_oil',
      baseMineRate: 2.2,
      nx: 0.24,
      ny: 0.68,
      color: '#22c55e',
      links: ['planet_halltown', 'sp_heeth', 'sp_estanu'],
      desc: 'Terminid Breeding Grounds (Diff 2). High-pressure E-710 geysers. Frequently builds bug armies to attack Heeth and HallTown!'
    },
    {
      id: 'sp_tienkwan',
      name: 'Tien Kwan Mech Forge',
      zhName: '天關工業星 (Lv.3 機器人 · 鈦合金重鐵礦)',
      isHome: false,
      ownedAtStart: false,
      difficulty: 3,
      faction: 'autobots',
      factionLabel: '🤖 AUTOMATON BOTS ONLY',
      oreName: 'Titanium-Iron Alloy (15%🛢️ Oil · 85%⛏️ Iron)',
      oreIcon: '🔩',
      oilRatio: 0.15,
      ironRatio: 0.85,
      bonusOreType: 'titanium',
      baseMineRate: 2.8,
      nx: 0.76,
      ny: 0.68,
      color: '#60a5fa',
      links: ['planet_halltown', 'sp_angels', 'sp_vandalon'],
      desc: 'Automaton Heavy Foundry (Diff 3). Produces massive Titanium-Iron shipments for Guns, Vehicles, and Patriot Mechs.'
    },
    {
      id: 'sp_turing',
      name: 'Turing Xeno-Jungle',
      zhName: '圖靈叢林星 (Lv.4 蟲族 · 濃縮蟲油與稀有晶礦)',
      isHome: false,
      ownedAtStart: false,
      difficulty: 4,
      faction: 'bugs',
      factionLabel: '🐛 TERMINID BUGS ONLY',
      oreName: 'Xeno-Crystal Oil (75%🛢️ Oil · 25%⛏️ Iron)',
      oreIcon: '🟠',
      oilRatio: 0.75,
      ironRatio: 0.25,
      bonusOreType: 'xeno_crystal',
      baseMineRate: 3.5,
      nx: 0.11,
      ny: 0.22,
      color: '#f59e0b',
      links: ['sp_heeth', 'sp_estanu', 'sp_meridia'],
      desc: 'Dense Terminid Jungle (Diff 4). High E-710 extraction rate + passive Rare Sample crystal resonance.'
    },
    {
      id: 'sp_malevelon',
      name: 'Malevelon Creek',
      zhName: '瑪萊弗隆溪谷 (Lv.5 機器人 · 雙料軍工礦脈)',
      isHome: false,
      ownedAtStart: false,
      difficulty: 5,
      faction: 'autobots',
      factionLabel: '🤖 AUTOMATON BOTS ONLY',
      oreName: 'Creek Chromium & Fuel (45%🛢️ Oil · 55%⛏️ Iron)',
      oreIcon: '⚙️',
      oilRatio: 0.45,
      ironRatio: 0.55,
      bonusOreType: 'chromium',
      baseMineRate: 4.4,
      nx: 0.89,
      ny: 0.22,
      color: '#ef4444',
      links: ['sp_angels', 'sp_vandalon', 'sp_cyberstan'],
      desc: 'Infamous Automaton Fortress World (Diff 5). Balanced high-output Chromium Iron & Synthetic Fuel veins.'
    },
    {
      id: 'sp_estanu',
      name: 'Estanu Hive Core',
      zhName: '埃斯塔努蟲巢星 (Lv.6 蟲族 · 深層超純度石油)',
      isHome: false,
      ownedAtStart: false,
      difficulty: 6,
      faction: 'bugs',
      factionLabel: '🐛 TERMINID BUGS ONLY',
      oreName: 'Deep-Mantle E-710 (90%🛢️ Oil · 10%⛏️ Iron)',
      oreIcon: '🛢️',
      oilRatio: 0.90,
      ironRatio: 0.10,
      bonusOreType: 'deep_e710',
      baseMineRate: 5.5,
      nx: 0.12,
      ny: 0.84,
      color: '#10b981',
      links: ['sp_fenrir', 'sp_turing', 'sp_meridia'],
      desc: 'Subterranean Terminid Mega-Nest (Diff 6). Massive E-710 output to power Jump Packs, Mechs, and Super Destroyers.'
    },
    {
      id: 'sp_vandalon',
      name: 'Vandalon IV Cyber-Mines',
      zhName: '范達隆四號 (Lv.7 機器人 · 超重型鋼鐵母礦)',
      isHome: false,
      ownedAtStart: false,
      difficulty: 7,
      faction: 'autobots',
      factionLabel: '🤖 AUTOMATON BOTS ONLY',
      oreName: 'Heavy Durasteel Ore (15%🛢️ Oil · 85%⛏️ Iron)',
      oreIcon: '⛏️',
      oilRatio: 0.15,
      ironRatio: 0.85,
      bonusOreType: 'durasteel',
      baseMineRate: 6.8,
      nx: 0.88,
      ny: 0.84,
      color: '#3b82f6',
      links: ['sp_tienkwan', 'sp_malevelon', 'sp_cyberstan'],
      desc: 'Glacial Automaton Strip-Mine (Diff 7). Huge Super Iron output; heavily guarded by Hulks and Rocket Devastators.'
    },
    {
      id: 'sp_meridia',
      name: 'Meridia Supercolony',
      zhName: '梅里迪亞超級蟲巢 (Lv.9 蟲族 · 暗物質黑油礦)',
      isHome: false,
      ownedAtStart: false,
      difficulty: 9,
      faction: 'bugs',
      factionLabel: '🐛 TERMINID BUGS ONLY',
      oreName: 'Dark-Fluid Hyper Oil (65%🛢️ Oil · 35%⛏️ Iron)',
      oreIcon: '🟣',
      oilRatio: 0.65,
      ironRatio: 0.35,
      bonusOreType: 'dark_fluid',
      baseMineRate: 9.0,
      nx: 0.32,
      ny: 0.12,
      color: '#c084fc',
      links: ['sp_turing', 'sp_estanu', 'sp_cyberstan'],
      desc: 'Apex Terminid Supercolony (Diff 9). Produces massive Dark-Fluid E-710 & Iron, but swarms with Bile Titans!'
    },
    {
      id: 'sp_cyberstan',
      name: 'Cyberstan Iron Citadel',
      zhName: '生化斯坦機械母星 (Lv.10 機器人 · 終極星際母礦)',
      isHome: false,
      ownedAtStart: false,
      difficulty: 10,
      faction: 'autobots',
      factionLabel: '🤖 AUTOMATON BOTS ONLY',
      oreName: 'Cyberstan Supreme Core (50%🛢️ Oil · 50%⛏️ Iron)',
      oreIcon: '👑',
      oilRatio: 0.50,
      ironRatio: 0.50,
      bonusOreType: 'cyber_core',
      baseMineRate: 12.5,
      nx: 0.68,
      ny: 0.12,
      color: '#f43f5e',
      links: ['sp_malevelon', 'sp_vandalon', 'sp_meridia'],
      desc: 'Difficulty 10 Automaton Homeworld! Maximum mining yield across all ores, guarded by Factory Strider armadas.'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.12: CAPTURED PLANET GARRISON UNITS & TRAVIAN DEFENSE BUILDINGS
  // - Hire SEAF or Helldivers (including Patriot Mechs) with daily wage & combat value!
  // - Defensive buildings are expensive to build, cheap to maintain, hard to destroy,
  //   and enemy invasions MUST break the Planetary Wall first!
  // --------------------------------------------------------------------------
  PLANET_GARRISON_UNITS: [
    {
      id: 'g_seaf_militia',
      name: 'SEAF Planetary Militia',
      zhName: 'SEAF 行星民兵班',
      icon: '👷',
      hireCost: 45,
      dailyWage: 6,
      defValue: 28,
      atkValue: 22,
      color: '#38bdf8',
      desc: 'Low daily wage ($6/day). Good basic garrison infantry to absorb attrition.'
    },
    {
      id: 'g_seaf_heavy',
      name: 'SEAF Heavy Autocannon Squad',
      zhName: 'SEAF 重裝機砲班',
      icon: '🪖',
      hireCost: 95,
      dailyWage: 15,
      defValue: 68,
      atkValue: 55,
      color: '#22c55e',
      desc: 'Moderate wage ($15/day). High defense value & strong pre-emptive raid firepower.'
    },
    {
      id: 'g_helldiver_vet',
      name: 'Stationed Helldiver Veteran',
      zhName: '駐守精銳絕地戰兵',
      icon: '🫡',
      hireCost: 190,
      dailyWage: 32,
      defValue: 155,
      atkValue: 140,
      color: '#facc15',
      desc: 'Elite orbital garrison ($32/day). Crushes enemy invasion waves and leads attrition strikes.'
    },
    {
      id: 'g_patriot_mech',
      name: 'Garrison EXO-45 Patriot Mech',
      zhName: '駐守愛國者重型機甲',
      icon: '🤖',
      hireCost: 420,
      itemCostId: 'mech',
      dailyWage: 68,
      defValue: 380,
      atkValue: 340,
      color: '#f97316',
      desc: 'Heavy armored walker ($68/day, or use 1x Shop 🤖 Mech). Massive 380 Defense & 340 Raid Power!'
    }
  ],

  PLANET_DEFENSE_BUILDINGS: [
    {
      id: 'def_wall',
      name: 'Planetary Ferrocrete Wall',
      zhName: '行星鋼筋裝甲城牆 (優先承受傷害)',
      icon: '🧱',
      baseBuildCost: 260,
      costScale: 1.48,
      maxLevel: 10,
      dailyMaintPerLvl: 3,
      wallShieldPerLvl: 480,
      defBonusPctPerLvl: 15,
      defPowerPerLvl: 65,
      breaksFirst: true,
      color: '#facc15',
      desc: 'Expensive to build ($260+), tiny upkeep ($3/day). Grants +480 Structural Shield & +15% Total Planet DEF/lvl. Enemy attacks MUST break the Wall first before damaging turrets or mines!'
    },
    {
      id: 'def_flak',
      name: 'Orbital Flak & Gatling Bastion',
      zhName: '防空機砲防禦堡壘 (城牆保護)',
      icon: '🗼',
      baseBuildCost: 350,
      costScale: 1.50,
      maxLevel: 10,
      dailyMaintPerLvl: 5,
      wallShieldPerLvl: 180,
      defBonusPctPerLvl: 5,
      defPowerPerLvl: 210,
      breaksFirst: false,
      color: '#38bdf8',
      desc: 'Heavy automated turret network ($350+ build, only $5/day maintenance). Adds +210 Defense Firepower/lvl and cannot be leveled down while the Wall stands!'
    },
    {
      id: 'def_rail',
      name: 'Foreshadow Railgun Citadel',
      zhName: '電磁軌道巨砲要塞 (極難摧毀)',
      icon: '⚡',
      baseBuildCost: 540,
      costScale: 1.55,
      maxLevel: 10,
      dailyMaintPerLvl: 9,
      wallShieldPerLvl: 320,
      defBonusPctPerLvl: 10,
      defPowerPerLvl: 450,
      breaksFirst: false,
      color: '#a855f7',
      desc: 'Supreme planetary defense citadel ($540+ build, only $9/day maintenance). Adds +450 Defense Firepower/lvl and +10% DEF bonus. Protected behind the Planetary Wall!'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.12: SHOP TRAINING & RECRUITMENT ROOM — 6 HELLDIVER CLASSES (MAX Lv.100 & SKILLS)
  // - Max Level 100 (`maxLevel: 100`), 4 Core Ability Stats scaled up to 100 (`firepower`, `vitality`, `agility`, `tactics`)
  // - 3 Class Skills per Helldiver (`Lv.1`, `Lv.25`, `Lv.60` + `Lv.100 Apex Passive`)
  // - Used in the 3-Active + 1-Spare Capybara Go! Roguelike Squad (with true Permadeath!)
  // --------------------------------------------------------------------------
  HELLDIVER_CLASSES: [
    {
      id: 'cls_vanguard',
      name: 'Assault Vanguard',
      zhName: '突擊先鋒戰兵',
      icon: '🦅',
      color: '#facc15',
      hireCost: 140,
      baseHp: 420,
      baseAtk: 38,
      baseFireRate: 0.32,
      baseStats100: { firepower: 86, vitality: 80, agility: 78, tactics: 76 },
      bodyColor: '#1e293b',
      capeColor: '#eab308',
      trimColor: '#facc15',
      skills: [
        { reqLvl: 1, id: 'sk_frag', icon: '💥', name: 'G-12 Frag Barrage (破片手雷彈幕)', cd: 4.5, desc: 'Throws an explosive frag every 4.5s dealing 220% AoE damage to enemy packs.' },
        { reqLvl: 25, id: 'sk_rally', icon: '📣', name: 'For Super Earth! (民主戰吼激勵)', cd: 8.0, desc: 'Boosts all 3 active Helldivers ATK by +30% for 4s and heals 12% Max HP.' },
        { reqLvl: 60, id: 'sk_500kg', icon: '🦅', name: 'Eagle 500KG Call-In (500KG飛鷹轟炸)', cd: 12.0, desc: 'Calls an Eagle-1 500KG bomb onto the enemy wave for 650% massive AoE damage!' }
      ],
      desc: 'Balanced frontline leader (Max Lv.100). Combines rapid rifle fire, squad morale healing, and 500KG air-strikes.'
    },
    {
      id: 'cls_bulwark',
      name: 'Heavy Bulwark Tank',
      zhName: '重裝防暴壁壘',
      icon: '🛡️',
      color: '#38bdf8',
      hireCost: 165,
      baseHp: 640,
      baseAtk: 30,
      baseFireRate: 0.36,
      baseStats100: { firepower: 70, vitality: 100, agility: 62, tactics: 82 },
      bodyColor: '#0f172a',
      capeColor: '#0284c7',
      trimColor: '#38bdf8',
      skills: [
        { reqLvl: 1, id: 'sk_shield', icon: '🛡️', name: 'SH-20 Riot Shield (動能防暴盾)', cd: 0, desc: 'Passive: Reduces incoming damage by 35% and intercepts frontline projectiles.' },
        { reqLvl: 25, id: 'sk_dome', icon: '🔵', name: 'FX-12 Squad Barrier (全隊護盾力場)', cd: 7.5, desc: 'Grants a 30% Max HP absorption shield to all 3 active Helldivers.' },
        { reqLvl: 60, id: 'sk_hmg', icon: '🔥', name: 'HMG Bastion Overdrive (重機槍傾瀉)', cd: 10.5, desc: 'Fires an armor-shredding HMG storm dealing 500% damage and knocking enemies back.' }
      ],
      desc: 'Unbreakable frontline tank (Max Lv.100, 100 Vitality). Keeps your squad alive during Diff 7–10 Captures so nobody permadies!'
    },
    {
      id: 'cls_sniper',
      name: 'Viper Recon Sniper',
      zhName: '毒蛇反器材狙擊手',
      icon: '🎯',
      color: '#ef4444',
      hireCost: 180,
      baseHp: 350,
      baseAtk: 56,
      baseFireRate: 0.42,
      baseStats100: { firepower: 98, vitality: 64, agility: 100, tactics: 78 },
      bodyColor: '#14532d',
      capeColor: '#dc2626',
      trimColor: '#fca5a5',
      skills: [
        { reqLvl: 1, id: 'sk_amr', icon: '🎯', name: 'APW-1 Weakpoint Crit (反器材弱點狙擊)', cd: 4.0, desc: '+35% Crit Chance; fires a high-caliber round dealing 280% single-target crit damage.' },
        { reqLvl: 25, id: 'sk_cloak', icon: '💨', name: 'Scout Smoke Evasion (煙霧閃避披風)', cd: 0, desc: 'Passive: +30% Dodge Chance and +40% bonus damage against Elite/Boss armor.' },
        { reqLvl: 60, id: 'sk_railcannon', icon: '⚡', name: 'Orbital Railcannon (軌道電磁砲秒殺)', cd: 11.0, desc: 'Orbital laser locks onto the strongest Boss/Elite for 880% armor-piercing damage!' }
      ],
      desc: 'Deadly Boss & Hulk executioner (Max Lv.100, 98 Firepower / 100 Agility). Deletes Chargers, Hulks, and Bile Titans.'
    },
    {
      id: 'cls_medic',
      name: 'Bio-Medic Officer',
      zhName: '戰地醫療救援官',
      icon: '💉',
      color: '#22c55e',
      hireCost: 175,
      baseHp: 460,
      baseAtk: 28,
      baseFireRate: 0.34,
      baseStats100: { firepower: 65, vitality: 88, agility: 80, tactics: 100 },
      bodyColor: '#064e3b',
      capeColor: '#22c55e',
      trimColor: '#bbf7d0',
      skills: [
        { reqLvl: 1, id: 'sk_stim', icon: '💚', name: 'P-11 Stim Pistol (醫療針劑手槍)', cd: 3.8, desc: 'Heals the most injured active Helldiver for 24% Max HP every 3.8 seconds.' },
        { reqLvl: 25, id: 'sk_infusion', icon: '🧪', name: 'Experimental Infusion (實驗性全隊回血)', cd: 7.0, desc: 'Heals all 3 active Helldivers for 18% HP and grants +25% Damage Reduction.' },
        { reqLvl: 60, id: 'sk_miracle', icon: '✨', name: 'Democracy Protects (奇蹟免死護盾)', cd: 15.0, desc: 'Prevents fatal permadeath once per battle on an ally, restoring 50% HP immediately!' }
      ],
      desc: 'Essential squad survival specialist (Max Lv.100, 100 Tactics). Prevents costly Helldiver Permadeath in high-difficulty runs!'
    },
    {
      id: 'cls_engineer',
      name: 'Arc & Demo Engineer',
      zhName: '電弧與哨戒塔工程師',
      icon: '⚡',
      color: '#a855f7',
      hireCost: 195,
      baseHp: 410,
      baseAtk: 44,
      baseFireRate: 0.33,
      baseStats100: { firepower: 92, vitality: 74, agility: 82, tactics: 96 },
      bodyColor: '#3b0764',
      capeColor: '#a855f7',
      trimColor: '#e9d5ff',
      skills: [
        { reqLvl: 1, id: 'sk_arc', icon: '⚡', name: 'ARC-12 Blitzer Chain (電弧閃電鏈)', cd: 3.5, desc: 'Jolts up to 3 enemies with chain lightning for 190% damage and brief stun.' },
        { reqLvl: 25, id: 'sk_sentry', icon: '🗼', name: 'A/G-16 Gatling Sentry (部署機槍哨戒塔)', cd: 6.5, desc: 'Deploys an automated sentry turret that fires alongside your 3 Helldivers.' },
        { reqLvl: 60, id: 'sk_hellbomb', icon: '☢️', name: 'NUX-223 Mini-Hellbomb (戰術地獄火核彈)', cd: 13.0, desc: 'Detonates a tactical Hellbomb across the path for 720% AoE plasma damage!' }
      ],
      desc: 'AoE crowd-control & turret master (Max Lv.100). Melts huge bug swarms and bot patrols with chain lightning.'
    },
    {
      id: 'cls_mechpilot',
      name: 'Exosuit Mech Pilot',
      zhName: '愛國者機甲王牌駕駛',
      icon: '🤖',
      color: '#f97316',
      hireCost: 260,
      baseHp: 780,
      baseAtk: 62,
      baseFireRate: 0.28,
      baseStats100: { firepower: 100, vitality: 96, agility: 72, tactics: 88 },
      bodyColor: '#7c2d12',
      capeColor: '#f97316',
      trimColor: '#fde047',
      skills: [
        { reqLvl: 1, id: 'sk_rockets', icon: '🚀', name: 'EXO-45 Rocket Pod Salvo (機甲火箭齊射)', cd: 4.5, desc: 'Fires heavy anti-tank missiles dealing 320% splash damage.' },
        { reqLvl: 25, id: 'sk_hull', icon: '🔩', name: 'Titanium Walker Hull (鈦合金機甲裝甲)', cd: 0, desc: 'Passive: +45% Max HP and reflects 30% damage back at attackers.' },
        { reqLvl: 60, id: 'sk_emancipator', icon: '🤖', name: 'Quad-Autocannon Salvo (四聯機砲毀滅齊射)', cd: 10.0, desc: 'Unleashes twin-autocannon explosive shells for 780% total devastation!' }
      ],
      desc: 'Apex heavy walker pilot (Max Lv.100, 100 Firepower / 96 Vitality). Dominates Difficulty 8–10 Sample & Capture operations!'
    }
  ],

  // --------------------------------------------------------------------------
  // NEW IN v0.0.12: SAMPLE SEARCH DIFFICULTY TABLE (1-10)
  // - Diff 1-3: Normal (Common 🟢) Sample only
  // - Diff 4-6: Normal (🟢) + Rare (🟠) Samples
  // - Diff 7-10: Normal (🟢) + Rare (🟠) + Super Rare (🟣) Samples
  // --------------------------------------------------------------------------
  SAMPLE_DIFFICULTIES: [
    { diff: 1, name: '1 - Trivial (微不足道)', tierText: '🟢 Normal Sample Only', common: [2, 4], rare: [0, 0], superRare: [0, 0], hpMult: 1.0, atkMult: 1.0, cashReward: 120 },
    { diff: 2, name: '2 - Easy (簡單任務)', tierText: '🟢 Normal Sample Only', common: [4, 7], rare: [0, 0], superRare: [0, 0], hpMult: 1.45, atkMult: 1.30, cashReward: 190 },
    { diff: 3, name: '3 - Medium (中等作戰)', tierText: '🟢 Normal Sample Only', common: [6, 10], rare: [0, 0], superRare: [0, 0], hpMult: 2.0, atkMult: 1.65, cashReward: 280 },
    { diff: 4, name: '4 - Challenging (具挑戰性)', tierText: '🟢 Normal + 🟠 Rare Samples', common: [7, 12], rare: [2, 4], superRare: [0, 0], hpMult: 2.8, atkMult: 2.15, cashReward: 420 },
    { diff: 5, name: '5 - Hard (困難作戰)', tierText: '🟢 Normal + 🟠 Rare Samples', common: [9, 15], rare: [3, 6], superRare: [0, 0], hpMult: 3.8, atkMult: 2.75, cashReward: 600 },
    { diff: 6, name: '6 - Extreme (極端作戰)', tierText: '🟢 Normal + 🟠 Rare Samples', common: [12, 18], rare: [5, 9], superRare: [0, 0], hpMult: 5.2, atkMult: 3.50, cashReward: 850 },
    { diff: 7, name: '7 - Suicide Mission (自殺任務)', tierText: '🟢 + 🟠 Rare + 🟣 Super Rare!', common: [14, 22], rare: [6, 11], superRare: [1, 2], hpMult: 7.0, atkMult: 4.40, cashReward: 1200 },
    { diff: 8, name: '8 - Impossible (不可能任務)', tierText: '🟢 + 🟠 Rare + 🟣 Super Rare!', common: [16, 26], rare: [8, 14], superRare: [2, 3], hpMult: 9.5, atkMult: 5.60, cashReward: 1650 },
    { diff: 9, name: '9 - Helldive (絕地潛兵)', tierText: '🟢 + 🟠 Rare + 🟣 Super Rare!', common: [20, 32], rare: [10, 18], superRare: [3, 5], hpMult: 12.8, atkMult: 7.20, cashReward: 2300 },
    { diff: 10, name: '10 - Super Helldive (超級絕地潛兵)', tierText: '🟢 + 🟠 Rare + 🟣 Super Rare!', common: [25, 40], rare: [14, 24], superRare: [5, 8], hpMult: 17.0, atkMult: 9.20, cashReward: 3200 }
  ]
};
