// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.06 (All-Episode Carbot Art, Split Raw Belts, 7 Dedicated
//                   Item Counters, Real Belt Packets & Smart SEAF AI Edition)
// ============================================================================

window.GameConfig = {
  VERSION: 'v0.0.06',
  STORAGE_KEY: 'helldivers_please_save_v0006',
  MAX_LEVEL: 20,

  // Expanded 4600 x 4000 2D Factorio + Carbot World for 7 Full Horizontal Lanes
  WORLD: {
    minX: -2200,
    maxX: 2400,
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
    initialRestTime: 45,
    betweenWaveRestTime: 35,
    baseEnemyCount: 5,
    enemiesPerWave: 3,
    spawnIntervalInWave: 1.85,
    bossWaveEvery: 5
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
    { id: 'ms_wave_5', name: 'Angel\'s Venture Veteran', desc: 'Clear Enemy Wave 5.', check: (g) => g.waveNumber > 5, rewardMedals: 3 },
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
      maxLevel: 20,
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
      maxLevel: 20,
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
    maxLevel: 20,
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
      maxLevel: 20,
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
      maxLevel: 20,
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
      maxLevel: 20,
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
      maxLevel: 20,
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
      maxLevel: 20,
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
      maxLevel: 20,
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
      maxLevel: 20,
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
      counterDropPos: { x: 310, z: 120 },
      counterPos: { x: 520, z: 120 },
      cashPos: { x: 720, z: 120 },
      queueStart: { x: 920, z: 120 },
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
      maxLevel: 20,
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
      counterDropPos: { x: 310, z: 390 },
      counterPos: { x: 520, z: 390 },
      cashPos: { x: 720, z: 390 },
      queueStart: { x: 920, z: 390 },
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
      maxLevel: 20,
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
      counterDropPos: { x: 310, z: 660 },
      counterPos: { x: 520, z: 660 },
      cashPos: { x: 720, z: 660 },
      queueStart: { x: 920, z: 660 },
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
      maxLevel: 20,
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
      counterDropPos: { x: 310, z: 930 },
      counterPos: { x: 520, z: 930 },
      cashPos: { x: 720, z: 930 },
      queueStart: { x: 920, z: 930 },
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
      maxLevel: 20,
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
      counterDropPos: { x: 310, z: 1200 },
      counterPos: { x: 520, z: 1200 },
      cashPos: { x: 720, z: 1200 },
      queueStart: { x: 920, z: 1200 },
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
      maxLevel: 20,
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
      counterDropPos: { x: 310, z: 1470 },
      counterPos: { x: 520, z: 1470 },
      cashPos: { x: 720, z: 1470 },
      queueStart: { x: 920, z: 1470 },
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
      maxLevel: 20,
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
      counterDropPos: { x: 310, z: 1740 },
      counterPos: { x: 520, z: 1740 },
      cashPos: { x: 720, z: 1740 },
      queueStart: { x: 920, z: 1740 },
      description: 'LANE 7 (Lv.1–20): Combines 4x ⛏️ Iron + 4x 🛢️ E-710 to charter SES Super Destroyers at Dedicated Counter #7.'
    }
  ],

  LOCATIONS: {
    armoryLoadoutPad: { x: -160, z: -40, radius: 95 },
    trashCanZone: { x: -1820, z: 1680, radius: 85 },
    customerSpawn: { x: 2050, z: 660 },
    customerExit: { x: 2050, z: -60 },
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
      maxLevel: 20,
      description: 'Smart AI (Lv.1–20): Hauls un-belted Raw Ore to unique hoppers, OR hand-mines bonus ore from Quarry Veins once Raw Belts are active!'
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
      name: 'Hire & Train Smart SEAF Gate Engineer (搬彈修門工兵)',
      icon: '🧱',
      baseCost: 150,
      costMultiplier: 1.45,
      maxLevel: 20,
      description: 'Smart AI (Lv.1–20): Prioritizes manually rebuilding Broken/Damaged Gates, then supplies un-belted Gate Turrets or boosts Ammo Press!'
    },
    {
      id: 'seaf_carrier',
      name: 'Hire & Train Smart SEAF Logistics & Cashier',
      icon: '🪖',
      baseCost: 140,
      costMultiplier: 1.45,
      maxLevel: 20,
      description: 'Smart AI (Lv.1–20): Stocks un-belted Item Counters, OR patrols all 7 Counters to serve customers faster & auto-collect $REQ when Belts are on!'
    },
    {
      id: 'seaf_cashier',
      name: 'Upgrade Auto-Cashier Drone Array (All 7 Counters)',
      icon: '🤖',
      baseCost: 240,
      costMultiplier: 1.48,
      maxLevel: 20,
      description: 'Automatically serves queued Helldivers across all 7 Item Counters faster (+20%/lvl up to Lv.20) and streams Requisition straight to your wallet.'
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

  PERMANENT_SKILLS: [
    {
      id: 'perm_gun_value',
      name: 'High-Caliber Arsenal Contracts',
      icon: '🔫',
      baseMedalCost: 2,
      costScale: 1.38,
      maxLevel: 20,
      desc: 'PERMANENT (Lv.1–20): +20% sale price across all 7 Item Counters forever.'
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
