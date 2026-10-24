/* ==========================================================================
   HELLDIVERS PLEASE! — Super Earth Logistics & Arsenal Tycoon
   js/config.js — Game Balance, Production Tiers, Unlock Zones & SEAF Config
   ========================================================================== */

window.GAME_CONFIG = {
  STORAGE_KEY: 'helldivers_please_save_v1',

  // 7 Progressive War Materiel Types (Burger Please! style stackable items)
  ITEMS: {
    cloth: {
      id: 'cloth',
      name: 'B-01 Tactical Cloth & Cape',
      shortName: 'Cloth/Armor',
      zhName: '基礎戰術布甲披風',
      icon: '🦺',
      price: 12,
      color: 0xfbc02d,
      accent: 0x1e293b,
      tier: 1
    },
    gun: {
      id: 'gun',
      name: 'AR-23 Liberator Rifle',
      shortName: 'Liberator Gun',
      zhName: '解放者標準步槍',
      icon: '🔫',
      price: 18,
      color: 0x475569,
      accent: 0xfbc02d,
      tier: 1
    },
    resource: {
      id: 'resource',
      name: 'Hellpod Ammo & Stim Pack',
      shortName: 'Supply Crate',
      zhName: '彈藥與醫療補給箱',
      icon: '📦',
      price: 28,
      color: 0x22c55e,
      accent: 0xfacc15,
      tier: 2
    },
    equipment: {
      id: 'equipment',
      name: 'SH-32 Shield & Heavy Gear',
      shortName: 'Shield Gear',
      zhName: '能量護盾與重裝備',
      icon: '🛡️',
      price: 45,
      color: 0x38bdf8,
      accent: 0x0284c7,
      tier: 2
    },
    vehicle: {
      id: 'vehicle',
      name: 'M-102 Fast Recon Vehicle (車)',
      shortName: 'Recon Vehicle',
      zhName: 'M-102 戰術偵察車',
      icon: '🚙',
      price: 85,
      color: 0x65a30d,
      accent: 0xfacc15,
      tier: 3
    },
    mech: {
      id: 'mech',
      name: 'EXO-45 Patriot Exosuit (機甲)',
      shortName: 'Patriot Mech',
      zhName: 'EXO-45 愛國者機甲',
      icon: '🤖',
      price: 150,
      color: 0xd97706,
      accent: 0xef4444,
      tier: 3
    },
    warship: {
      id: 'warship',
      name: 'Super Destroyer Warship Core (戰艦)',
      shortName: 'Warship Core',
      zhName: '超級驅逐艦艦體核心',
      icon: '🚀',
      price: 280,
      color: 0xa855f7,
      accent: 0x38bdf8,
      tier: 4
    }
  },

  // Factory Production Stations placed around the Hangar
  STATIONS: [
    {
      id: 'station_cloth',
      itemType: 'cloth',
      title: 'B-01 Cloth & Cape Loom',
      zhTitle: '基礎布甲織造機',
      unlockedByDefault: true,
      unlockCost: 0,
      machinePos: { x: -11.5, z: -6.5 },
      shelfPos: { x: -8.2, z: -6.5 },
      pickupPos: { x: -6.2, z: -6.5 },
      craftInterval: 0.75,
      maxShelf: 18,
      wing: 'west'
    },
    {
      id: 'station_gun',
      itemType: 'gun',
      title: 'AR-23 Liberator Gun Line',
      zhTitle: '解放者步槍產線',
      unlockedByDefault: true,
      unlockCost: 0,
      machinePos: { x: -11.5, z: -1.5 },
      shelfPos: { x: -8.2, z: -1.5 },
      pickupPos: { x: -6.2, z: -1.5 },
      craftInterval: 0.85,
      maxShelf: 18,
      wing: 'west'
    },
    {
      id: 'station_resource',
      itemType: 'resource',
      title: 'Ammo & Stim Resource Line',
      zhTitle: '戰略物資補給產線',
      unlockedByDefault: false,
      unlockCost: 60,
      machinePos: { x: -11.5, z: 3.5 },
      shelfPos: { x: -8.2, z: 3.5 },
      pickupPos: { x: -6.2, z: 3.5 },
      craftInterval: 0.95,
      maxShelf: 16,
      wing: 'west'
    },
    {
      id: 'station_equipment',
      itemType: 'equipment',
      title: 'Shield & Stratagem Forge',
      zhTitle: '護盾與重裝備鍛造台',
      unlockedByDefault: false,
      unlockCost: 140,
      machinePos: { x: -11.5, z: 8.2 },
      shelfPos: { x: -8.2, z: 8.2 },
      pickupPos: { x: -6.2, z: 8.2 },
      craftInterval: 1.1,
      maxShelf: 16,
      wing: 'west'
    },
    {
      id: 'station_vehicle',
      itemType: 'vehicle',
      title: 'FRV Recon Vehicle Hangar (車)',
      zhTitle: '戰術偵察車組裝廠',
      unlockedByDefault: false,
      unlockCost: 260,
      machinePos: { x: 11.5, z: -6.2 },
      shelfPos: { x: 8.2, z: -6.2 },
      pickupPos: { x: 6.2, z: -6.2 },
      craftInterval: 1.25,
      maxShelf: 12,
      wing: 'east'
    },
    {
      id: 'station_mech',
      itemType: 'mech',
      title: 'EXO-45 Patriot Mech Gantry (機甲)',
      zhTitle: '愛國者機甲重工架',
      unlockedByDefault: false,
      unlockCost: 480,
      machinePos: { x: 11.5, z: -0.5 },
      shelfPos: { x: 8.2, z: -0.5 },
      pickupPos: { x: 6.2, z: -0.5 },
      craftInterval: 1.45,
      maxShelf: 10,
      wing: 'east'
    },
    {
      id: 'station_warship',
      itemType: 'warship',
      title: '2F Orbital Warship Drydock (戰艦)',
      zhTitle: '二樓超級戰艦船塢',
      unlockedByDefault: false,
      unlockCost: 850,
      machinePos: { x: 3.8, z: -11.8 },
      shelfPos: { x: 0.5, z: -10.8 },
      pickupPos: { x: -1.8, z: -9.8 },
      craftInterval: 1.75,
      maxShelf: 8,
      wing: 'north2f'
    }
  ],

  // Ground-Projected Unlockable Zones (Burger Please! step-on-pad cash drain)
  UNLOCK_ZONES: [
    {
      id: 'unlock_resource',
      type: 'station',
      targetId: 'station_resource',
      title: '📦 Unlock Resource Line',
      cost: 60,
      pos: { x: -6.2, z: 3.5 }
    },
    {
      id: 'unlock_seaf_1',
      type: 'seaf_hauler',
      targetId: 'seaf_hauler_1',
      title: '🪖 Hire SEAF Trooper #1',
      cost: 80,
      pos: { x: -3.2, z: -4.2 },
      isSeaf: true
    },
    {
      id: 'unlock_seaf_cashier',
      type: 'seaf_cashier',
      targetId: 'seaf_cashier_1',
      title: '🎖️ Hire SEAF Cashier',
      cost: 110,
      pos: { x: -2.2, z: 1.8 },
      isSeaf: true
    },
    {
      id: 'unlock_equipment',
      type: 'station',
      targetId: 'station_equipment',
      title: '🛡️ Unlock Equipment Forge',
      cost: 140,
      pos: { x: -6.2, z: 8.2 }
    },
    {
      id: 'unlock_table_2',
      type: 'armory_pod',
      targetId: 'pod_bay_2',
      title: '🪑 Expand Armory Pod #2',
      cost: 180,
      pos: { x: 3.6, z: 6.2 }
    },
    {
      id: 'unlock_vehicle',
      type: 'station',
      targetId: 'station_vehicle',
      title: '🚙 Unlock Vehicle Factory (車)',
      cost: 260,
      pos: { x: 6.2, z: -6.2 }
    },
    {
      id: 'unlock_seaf_2',
      type: 'seaf_hauler',
      targetId: 'seaf_hauler_2',
      title: '🪖 Hire SEAF Heavy Crew #2',
      cost: 320,
      pos: { x: 3.4, z: -3.8 },
      isSeaf: true
    },
    {
      id: 'unlock_mech',
      type: 'station',
      targetId: 'station_mech',
      title: '🤖 Unlock Patriot Mech Bay (機甲)',
      cost: 480,
      pos: { x: 6.2, z: -0.5 }
    },
    {
      id: 'unlock_warship',
      type: 'station',
      targetId: 'station_warship',
      title: '🚀 Unlock 2F Warship Dock (戰艦)',
      cost: 850,
      pos: { x: -1.8, z: -9.8 }
    }
  ],

  // Upgrades in the SEAF Command & Logistics Modal
  UPGRADES: [
    {
      id: 'playerSpeed',
      title: 'Jet-Boot Thruster Servo',
      desc: 'Increases Commander movement speed by +16% per tier.',
      icon: '⚡',
      baseCost: 50,
      costMult: 1.65,
      maxLevel: 8
    },
    {
      id: 'playerCapacity',
      title: 'Exoskeletal Spine Rack',
      desc: 'Increases Commander back-stack capacity (+6 items/tier).',
      icon: '🎒',
      baseCost: 65,
      costMult: 1.7,
      maxLevel: 8
    },
    {
      id: 'seafCount',
      title: 'Recruit SEAF Logistics Trooper',
      desc: 'Hires an additional autonomous SEAF soldier to haul gear.',
      icon: '🪖',
      baseCost: 90,
      costMult: 1.85,
      maxLevel: 6,
      isSeaf: true
    },
    {
      id: 'seafSpeed',
      title: 'SEAF Tactical Drill & Stack',
      desc: 'Boosts all SEAF Troopers speed (+18%) and carry stack (+3).',
      icon: '🎖️',
      baseCost: 85,
      costMult: 1.75,
      maxLevel: 6,
      isSeaf: true
    },
    {
      id: 'factorySpeed',
      title: 'Super Earth Overclock Directive',
      desc: 'Accelerates all unlocked weapon, vehicle, mech & ship assembly (+22%).',
      icon: '⚙️',
      baseCost: 110,
      costMult: 1.8,
      maxLevel: 8
    },
    {
      id: 'requisitionBonus',
      title: 'Ministry of Prosperity Grant',
      desc: 'Helldivers pay +20% more Requisition Slips ($) per order.',
      icon: '💵',
      baseCost: 130,
      costMult: 1.85,
      maxLevel: 6
    }
  ],

  // Stratagem Sequence for Orbital Liberty Overdrive (↑ → ↓ ↓ ↓)
  STRATAGEM_SEQUENCE: ['UP', 'RIGHT', 'DOWN', 'DOWN', 'DOWN']
};
