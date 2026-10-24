/* ==========================================================================
   HELLDIVERS PLEASE! — Super Earth Logistics & Arsenal Tycoon
   js/game.js — Main Game Loop, Physics, AI, Stratagems & LocalStorage Engine
   ========================================================================== */

(function () {
  const CFG = window.GAME_CONFIG;
  const WB = window.WorldBuilder;
  const SFX = window.audioEngine;

  // --- Primary Persistent Game State ---
  const state = {
    cash: 45, // Starter Requisition Slips so player can immediately feel progression
    totalEarned: 45,
    servedCount: 0,
    unlockedStations: {
      station_cloth: true,
      station_gun: true,
      station_resource: false,
      station_equipment: false,
      station_vehicle: false,
      station_mech: false,
      station_warship: false
    },
    unlockedZones: {},
    zonePaid: {},
    seafHaulers: 0,
    hasSeafCashier: false,
    hasArmoryPod2: false,
    upgrades: {
      playerSpeed: 0,
      playerCapacity: 0,
      seafCount: 0,
      seafSpeed: 0,
      factorySpeed: 0,
      requisitionBonus: 0
    },
    overdriveTimer: 0,
    stratIndex: 0
  };

  // --- Runtime Entities ---
  let scene, camera, renderer;
  let clock;
  let animFrameId = null;

  const player = {
    x: 0,
    z: 2.2,
    vx: 0,
    vz: 0,
    angle: 0,
    stack: [], // Array of itemType strings
    sprintTimer: 0,
    mesh: null
  };

  const stationRuntimes = {};
  const unlockZoneRuntimes = {};
  const counterBuffer = {
    cloth: 0,
    gun: 0,
    resource: 0,
    equipment: 0,
    vehicle: 0,
    mech: 0,
    warship: 0
  };
  let counterStackGroup = null;
  let counterStackMeshes = [];

  // Cash Pile Runtime (Towering 3D Columns - Module 2.2.I / 2.2.K)
  const cashPile = {
    amount: 0,
    pos: { x: 2.8, z: 2.2 },
    bricksGroup: null,
    bricks: [],
    wavePhase: 0
  };

  // Armory Prep Pods (Dine-in table equivalent)
  const armoryPods = [
    { id: 'pod_bay_1', unlocked: true, x: 3.6, z: 2.5, busyTimer: 0, mesh: null },
    { id: 'pod_bay_2', unlocked: false, x: 3.6, z: 6.2, busyTimer: 0, mesh: null }
  ];

  const customers = [];
  const seafAgents = [];
  let seafCashierMesh = null;
  const flyingParcels = [];
  const explosionParticles = [];
  const superDestroyers = [];
  let guideLine = null;
  let escalatorSteps = [];

  // Input Tracking
  const keys = {};
  const joystick = {
    active: false,
    touchId: null,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0
  };
  let targetClickPos = null;
  let cameraShake = 0;

  // --- Computed Stats ---
  function getPlayerMaxStack() {
    return 12 + state.upgrades.playerCapacity * 6;
  }

  function getPlayerSpeed() {
    const base = 7.4 * (1 + state.upgrades.playerSpeed * 0.14);
    const sprintMult = player.sprintTimer > 0 ? 1.45 : 1.0;
    const buffMult = state.overdriveTimer > 0 ? 1.25 : 1.0;
    return base * sprintMult * buffMult;
  }

  function getSeafMaxStack() {
    return 6 + state.upgrades.seafSpeed * 3;
  }

  function getSeafSpeed() {
    const base = 5.4 * (1 + state.upgrades.seafSpeed * 0.16);
    return state.overdriveTimer > 0 ? base * 1.35 : base;
  }

  function getFactorySpeedMult() {
    const base = 1 + state.upgrades.factorySpeed * 0.22;
    return state.overdriveTimer > 0 ? base * 2.0 : base;
  }

  function getPriceMultiplier() {
    const base = 1 + state.upgrades.requisitionBonus * 0.2;
    return state.overdriveTimer > 0 ? base * 1.5 : base;
  }

  function getUnlockedItemTypes() {
    const list = [];
    CFG.STATIONS.forEach((st) => {
      if (state.unlockedStations[st.id]) {
        list.push(st.itemType);
      }
    });
    return list.length ? list : ['cloth', 'gun'];
  }

  // --- LocalStorage Save / Load (Module 3.3) ---
  function saveGame() {
    try {
      const payload = {
        cash: Math.floor(state.cash),
        totalEarned: Math.floor(state.totalEarned),
        servedCount: state.servedCount,
        unlockedStations: state.unlockedStations,
        unlockedZones: state.unlockedZones,
        zonePaid: state.zonePaid,
        seafHaulers: state.seafHaulers,
        hasSeafCashier: state.hasSeafCashier,
        hasArmoryPod2: state.hasArmoryPod2,
        upgrades: state.upgrades
      };
      localStorage.setItem(CFG.STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Sandbox safe
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(CFG.STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.cash === 'number') state.cash = data.cash;
      if (typeof data.totalEarned === 'number') state.totalEarned = data.totalEarned;
      if (typeof data.servedCount === 'number') state.servedCount = data.servedCount;
      if (data.unlockedStations) Object.assign(state.unlockedStations, data.unlockedStations);
      if (data.unlockedZones) Object.assign(state.unlockedZones, data.unlockedZones);
      if (data.zonePaid) Object.assign(state.zonePaid, data.zonePaid);
      if (typeof data.seafHaulers === 'number') state.seafHaulers = data.seafHaulers;
      if (typeof data.hasSeafCashier === 'boolean') state.hasSeafCashier = data.hasSeafCashier;
      if (typeof data.hasArmoryPod2 === 'boolean') state.hasArmoryPod2 = data.hasArmoryPod2;
      if (data.upgrades) Object.assign(state.upgrades, data.upgrades);
    } catch (e) {
      // Ignore corrupt save
    }
  }

  // --- Scene Initialization ---
  function initScene() {
    const canvas = document.getElementById('game-canvas');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12161f);
    scene.fog = new THREE.FogExp2(0x12161f, 0.015);

    camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 160);
    camera.position.set(0, 21, 19);
    camera.lookAt(0, 0, 1);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Lighting (Warm Interior + Orbital Rim Light)
    const ambient = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffbeb, 0.78);
    sun.position.set(14, 28, 16);
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0x38bdf8, 0.28);
    rim.position.set(-16, 18, -14);
    scene.add(rim);

    buildEnvironment();
    buildStationsAndZones();
    buildCounterAndPods();
    buildCharacters();

    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // --- Build Hangar & Planetary Environment (Module 2.1.K + 2.1.G) ---
  function buildEnvironment() {
    // Outer Alien Planetary Surface (Module 2.1.F/G)
    const planetGround = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshLambertMaterial({ color: 0x1e2229 })
    );
    planetGround.rotation.x = -Math.PI / 2;
    planetGround.position.y = -0.12;
    scene.add(planetGround);

    // Main Hangar Deck Floor (Burger Please! bright readable honey-amber & cream tiles)
    const hangarFloor = new THREE.Mesh(
      new THREE.BoxGeometry(28, 0.16, 24),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    );
    hangarFloor.position.set(0, -0.08, 0);
    scene.add(hangarFloor);

    // Central Embarkation Hall Carpet/Tile (Warm Cream/Slate Contrast)
    const centralHall = new THREE.Mesh(
      new THREE.BoxGeometry(10.5, 0.04, 22),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    centralHall.position.set(0, 0.01, 0.5);
    scene.add(centralHall);

    // West Factory Wing Floor (Infantry & Gear - Warm Honey Industrial Deck)
    const westFloor = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 0.04, 20),
      new THREE.MeshLambertMaterial({ color: 0xb45309 })
    );
    westFloor.position.set(-9.5, 0.01, 0.5);
    scene.add(westFloor);

    // East Heavy Hangar Floor (Vehicles & Mechs)
    const eastFloor = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 0.04, 20),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    eastFloor.position.set(9.5, 0.01, 0.5);
    scene.add(eastFloor);

    // Helldivers Hazard Stripes along Wing Borders
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfbc02d });
    [-5.2, 5.2].forEach((xPos) => {
      const borderLine = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 20), stripeMat);
      borderLine.position.set(xPos, 0.02, 0.5);
      scene.add(borderLine);
    });

    // 2F Escalator Ramp & North Orbital Drydock Deck (Module 2.1.K)
    const northDeck = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.5, 5.5),
      new THREE.MeshLambertMaterial({ color: 0x1e1b4b })
    );
    northDeck.position.set(0, 0.25, -11.2);
    scene.add(northDeck);

    // Escalator Ramp Visual
    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.2, 3.2),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    ramp.position.set(-1.8, 0.16, -8.2);
    ramp.rotation.x = 0.12;
    scene.add(ramp);

    // Escalator Yellow Safety Handrails
    [-3.0, -0.6].forEach((rx) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.55, 3.2),
        new THREE.MeshLambertMaterial({ color: 0xfbc02d })
      );
      rail.position.set(rx, 0.35, -8.2);
      scene.add(rail);
    });

    for (let i = 0; i < 6; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.06, 0.32),
        new THREE.MeshLambertMaterial({ color: i % 2 === 0 ? 0x0f172a : 0xfbc02d })
      );
      step.position.set(-1.8, 0.22, -6.9 - i * 0.48);
      scene.add(step);
      escalatorSteps.push(step);
    }

    // Trash / Scrap Recycler Bin (Module 1.1 / 1.11)
    const trashGroup = new THREE.Group();
    trashGroup.position.set(-3.8, 0, 5.8);
    const binMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.45, 0.9, 12),
      new THREE.MeshLambertMaterial({ color: 0xef4444 })
    );
    binMesh.position.y = 0.45;
    const binRing = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.85, 20),
      new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
    );
    binRing.rotation.x = -Math.PI / 2;
    binRing.position.y = 0.03;
    trashGroup.add(binMesh, binRing);
    scene.add(trashGroup);

    // 3 Orbiting Super Destroyers in Low Orbit (Module 2.1.G)
    const shipCoords = [
      { x: -16, y: 15, z: -26 },
      { x: 0, y: 17, z: -30 },
      { x: 16, y: 15, z: -26 }
    ];
    shipCoords.forEach((sc) => {
      const ship = WB.createSuperDestroyerMesh();
      ship.position.set(sc.x, sc.y, sc.z);
      scene.add(ship);
      superDestroyers.push(ship);
    });

    // Dynamic Onboarding Guide Line on Floor
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.08, 2.2),
      new THREE.Vector3(-6.2, 0.08, -1.5)
    ]);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xfef08a,
      dashSize: 0.5,
      gapSize: 0.3
    });
    guideLine = new THREE.Line(lineGeo, lineMat);
    guideLine.computeLineDistances();
    scene.add(guideLine);
  }

  // --- Build Production Stations & Ground Unlock Zones ---
  function buildStationsAndZones() {
    const worldLabels = document.getElementById('world-labels');

    CFG.STATIONS.forEach((st) => {
      const group = new THREE.Group();
      const itemCfg = CFG.ITEMS[st.itemType];

      // Machine Gantry Base
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.2, 2.2),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      base.position.set(st.machinePos.x, 0.6, st.machinePos.z);

      const topAccent = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.24, 2.3),
        new THREE.MeshLambertMaterial({ color: itemCfg.color })
      );
      topAccent.position.set(st.machinePos.x, 1.25, st.machinePos.z);

      // Spinning Gear / Core Beacon on top of Machine
      const rotor = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.45, 0),
        new THREE.MeshLambertMaterial({ color: itemCfg.accent })
      );
      rotor.position.set(st.machinePos.x, 1.85, st.machinePos.z);

      // Output Shelf Table
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.65, 1.5),
        new THREE.MeshLambertMaterial({ color: 0x475569 })
      );
      shelf.position.set(st.shelfPos.x, 0.325, st.shelfPos.z);

      // Glowing Pickup Trigger Pad (Green Ring)
      const pad = new THREE.Mesh(
        new THREE.RingGeometry(0.75, 1.05, 24),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(st.pickupPos.x, 0.04, st.pickupPos.z);

      const shelfItemsGroup = new THREE.Group();
      shelfItemsGroup.position.set(st.shelfPos.x, 0.68, st.shelfPos.z);

      group.add(base, topAccent, rotor, shelf, pad, shelfItemsGroup);
      scene.add(group);

      // Floating HTML Label for Station
      const labelEl = document.createElement('div');
      labelEl.className = 'world-station-tag';
      labelEl.textContent = `${itemCfg.icon} ${itemCfg.shortName} ($${itemCfg.price})`;
      worldLabels.appendChild(labelEl);

      // Floating "MAX" Tag (Module 2.3.K)
      const maxEl = document.createElement('div');
      maxEl.className = 'world-max-tag';
      maxEl.textContent = 'MAX';
      maxEl.style.display = 'none';
      worldLabels.appendChild(maxEl);

      const isUnlocked = !!state.unlockedStations[st.id];
      group.visible = isUnlocked;
      labelEl.style.display = isUnlocked ? 'block' : 'none';

      stationRuntimes[st.id] = {
        cfg: st,
        group,
        rotor,
        shelfItemsGroup,
        shelfMeshes: [],
        count: isUnlocked ? 4 : 0, // Pre-stock starter stations
        timer: 0,
        labelEl,
        maxEl
      };
      syncStationShelfMeshes(stationRuntimes[st.id]);
    });

    // Ground Unlock Zones (Module 1.11 & 2.3.K)
    CFG.UNLOCK_ZONES.forEach((uz) => {
      if (state.zonePaid[uz.id] === undefined) {
        state.zonePaid[uz.id] = 0;
      }
      // Check if already unlocked via station or flag
      if (uz.type === 'station' && state.unlockedStations[uz.targetId]) {
        state.unlockedZones[uz.id] = true;
      }

      const padGroup = new THREE.Group();
      padGroup.position.set(uz.pos.x, 0.03, uz.pos.z);

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.06, 1.8),
        new THREE.MeshBasicMaterial({
          color: uz.isSeaf ? 0x38bdf8 : 0xfbc02d,
          transparent: true,
          opacity: 0.35
        })
      );
      padGroup.add(frame);
      scene.add(padGroup);

      const domEl = document.createElement('div');
      domEl.className = 'world-unlock-label' + (uz.isSeaf ? ' seaf-pad' : '');
      domEl.innerHTML = `
        <div class="unlock-title">${uz.title}</div>
        <div class="unlock-cost">💵 $<span class="cost-val">${uz.cost - state.zonePaid[uz.id]}</span></div>
        <div class="unlock-progress"><div class="unlock-progress-fill"></div></div>
      `;
      worldLabels.appendChild(domEl);

      const alreadyDone = !!state.unlockedZones[uz.id];
      padGroup.visible = !alreadyDone;
      domEl.style.display = !alreadyDone ? 'block' : 'none';

      unlockZoneRuntimes[uz.id] = {
        cfg: uz,
        padGroup,
        domEl,
        costValEl: domEl.querySelector('.cost-val'),
        fillEl: domEl.querySelector('.unlock-progress-fill')
      };
    });
  }

  function syncStationShelfMeshes(stRun) {
    while (stRun.shelfMeshes.length < stRun.count) {
      const idx = stRun.shelfMeshes.length;
      const mesh = WB.createItemMesh(stRun.cfg.itemType);
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      mesh.position.set((col - 0.5) * 0.58, row * 0.22, 0);
      stRun.shelfItemsGroup.add(mesh);
      stRun.shelfMeshes.push(mesh);
    }
    while (stRun.shelfMeshes.length > stRun.count) {
      const m = stRun.shelfMeshes.pop();
      stRun.shelfItemsGroup.remove(m);
    }
  }

  // --- Build Quartermaster Counter, Cash Column & Armory Prep Pods ---
  function buildCounterAndPods() {
    // Central Quartermaster Counter (x: 0, z: 4.2)
    const counterGroup = new THREE.Group();
    counterGroup.position.set(0, 0, 4.2);

    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.9, 1.3),
      new THREE.MeshLambertMaterial({ color: 0xb91c1c }) // Burger Please crimson counter with Super Earth Gold top
    );
    desk.position.y = 0.45;

    const topPlate = new THREE.Mesh(
      new THREE.BoxGeometry(4.55, 0.12, 1.45),
      new THREE.MeshLambertMaterial({ color: 0xf8fafc })
    );
    topPlate.position.y = 0.92;

    // Drop-off / Service Trigger Pad behind counter (x: 0, z: 2.3)
    const servicePad = new THREE.Mesh(
      new THREE.RingGeometry(1.0, 1.35, 28),
      new THREE.MeshBasicMaterial({ color: 0xfbc02d, side: THREE.DoubleSide })
    );
    servicePad.rotation.x = -Math.PI / 2;
    servicePad.position.set(0, 0.04, -1.8);

    counterStackGroup = new THREE.Group();
    counterStackGroup.position.set(0, 1.0, 0);

    counterGroup.add(desk, topPlate, servicePad, counterStackGroup);
    scene.add(counterGroup);

    // Cash Pile Base & Towering 3D Columns (Module 2.2.I / 2.2.K)
    const cashPad = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.06, 1.5),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.45 })
    );
    cashPad.position.set(cashPile.pos.x, 0.03, cashPile.pos.z);
    scene.add(cashPad);

    cashPile.bricksGroup = new THREE.Group();
    cashPile.bricksGroup.position.set(cashPile.pos.x, 0.08, cashPile.pos.z);
    scene.add(cashPile.bricksGroup);

    // Armory Prep Pods (where Helldivers gear up after getting supplies)
    armoryPods.forEach((pod) => {
      if (pod.id === 'pod_bay_2' && state.hasArmoryPod2) {
        pod.unlocked = true;
      }
      const podGroup = new THREE.Group();
      podGroup.position.set(pod.x, 0, pod.z);

      const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.25, 0.18, 8),
        new THREE.MeshLambertMaterial({ color: 0x334155 })
      );
      platform.position.y = 0.09;

      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.2, 0.35),
        new THREE.MeshLambertMaterial({ color: 0xfbc02d })
      );
      rack.position.set(0, 0.65, -0.7);

      podGroup.add(platform, rack);
      podGroup.visible = pod.unlocked;
      scene.add(podGroup);
      pod.mesh = podGroup;
    });
  }

  function syncCounterVisuals() {
    while (counterStackMeshes.length > 0) {
      const m = counterStackMeshes.pop();
      counterStackGroup.remove(m);
    }
    const types = Object.keys(counterBuffer);
    let slotIdx = 0;
    types.forEach((t) => {
      const count = counterBuffer[t] || 0;
      if (count <= 0) return;
      const xOffset = -1.6 + slotIdx * 0.65;
      const visCount = Math.min(count, 10);
      for (let i = 0; i < visCount; i++) {
        const mesh = WB.createItemMesh(t);
        mesh.scale.set(0.75, 0.75, 0.75);
        mesh.position.set(xOffset, i * 0.16, 0);
        counterStackGroup.add(mesh);
        counterStackMeshes.push(mesh);
      }
      slotIdx++;
    });
  }

  function addCashToPile(amount) {
    cashPile.amount += Math.round(amount);
    cashPile.wavePhase = 1.0; // Trigger wave ripple (Module 2.4.K)
    syncCashBricks();
  }

  function syncCashBricks() {
    const targetBricks = Math.min(Math.ceil(cashPile.amount / 8), 48);
    while (cashPile.bricks.length < targetBricks) {
      const idx = cashPile.bricks.length;
      const brick = WB.createCashBrickMesh();
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      brick.position.set((col - 0.5) * 0.56, row * 0.11, 0);
      cashPile.bricksGroup.add(brick);
      cashPile.bricks.push(brick);
    }
    while (cashPile.bricks.length > targetBricks) {
      const b = cashPile.bricks.pop();
      cashPile.bricksGroup.remove(b);
    }
  }

  // --- Build Player, SEAF Troopers & Customers ---
  function buildCharacters() {
    player.mesh = WB.createCharacterRig('player');
    player.mesh.position.set(player.x, 0, player.z);
    scene.add(player.mesh);

    // Sync SEAF Cashier if unlocked
    if (state.hasSeafCashier) {
      spawnSeafCashierMesh();
    }

    // Sync SEAF Haulers
    const totalHaulers = Math.max(state.seafHaulers, state.upgrades.seafCount);
    state.seafHaulers = totalHaulers;
    state.upgrades.seafCount = totalHaulers;
    while (seafAgents.length < totalHaulers) {
      spawnSeafHauler();
    }

    // Spawn 2 initial Helldiver Customers
    spawnCustomer();
    spawnCustomer();
  }

  function spawnSeafCashierMesh() {
    if (seafCashierMesh) return;
    seafCashierMesh = WB.createCharacterRig('seaf_cashier');
    seafCashierMesh.position.set(-1.1, 0, 2.7);
    scene.add(seafCashierMesh);
  }

  function spawnSeafHauler() {
    const mesh = WB.createCharacterRig('seaf');
    const idx = seafAgents.length;
    const startX = -2.5 + (idx % 3) * 2.2;
    const startZ = -2.0 - Math.floor(idx / 3) * 2.0;
    mesh.position.set(startX, 0, startZ);
    scene.add(mesh);

    seafAgents.push({
      id: 'seaf_' + idx,
      x: startX,
      z: startZ,
      vx: 0,
      vz: 0,
      angle: 0,
      stack: [],
      targetStationId: null,
      state: 'idle',
      mesh
    });
  }

  function syncCharacterStackVisuals(entity) {
    const holder = entity.mesh.userData.stackHolder;
    const meshes = entity.mesh.userData.stackMeshes;

    while (meshes.length > entity.stack.length) {
      const m = meshes.pop();
      holder.remove(m);
    }
    while (meshes.length < entity.stack.length) {
      const idx = meshes.length;
      const itemType = entity.stack[idx];
      const m = WB.createItemMesh(itemType);
      m.position.set(0, idx * 0.21, 0);
      holder.add(m);
      meshes.push(m);
    }
  }

  // --- Spawn & Manage Helldiver Customers (Module 1.11 + 2.2.F) ---
  function spawnCustomer() {
    if (customers.length >= 6) return;
    const unlockedItems = getUnlockedItemTypes();
    const itemType = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
    const isVip = itemType === 'mech' || itemType === 'warship' || Math.random() < 0.18;
    const qty = isVip ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 3) + 1;

    const mesh = WB.createCharacterRig(isVip ? 'vip' : 'customer');
    const spawnX = (Math.random() - 0.5) * 3.5;
    const spawnZ = 12.2;
    mesh.position.set(spawnX, 0, spawnZ);
    mesh.rotation.y = Math.PI;
    scene.add(mesh);

    // Floating Order Bubble (Module 2.3.K)
    const worldLabels = document.getElementById('world-labels');
    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'world-bubble' + (isVip ? ' vip-order' : '');
    const cfg = CFG.ITEMS[itemType];
    bubbleEl.innerHTML = `
      <span class="order-icon">${cfg.icon}</span>
      <span class="order-qty">×${qty}</span>
      <div class="patience-bar"><div class="patience-fill" style="height:100%"></div></div>
    `;
    worldLabels.appendChild(bubbleEl);

    customers.push({
      x: spawnX,
      z: spawnZ,
      angle: Math.PI,
      itemType,
      needed: qty,
      maxNeeded: qty,
      isVip,
      patience: 100,
      state: 'queue', // 'queue' | 'pod' | 'depart'
      assignedPod: null,
      mesh,
      bubbleEl,
      qtyEl: bubbleEl.querySelector('.order-qty'),
      patienceFillEl: bubbleEl.querySelector('.patience-fill')
    });
  }

  // --- Parabolic Flying Item / Cash Effect (Module 2.4.K / 2.4.I) ---
  function spawnFlyingParcel(startPos, endPos, itemType, isCash = false) {
    const mesh = isCash ? WB.createCashBrickMesh() : WB.createItemMesh(itemType);
    mesh.position.copy(startPos);
    scene.add(mesh);
    flyingParcels.push({
      mesh,
      p0: startPos.clone(),
      p1: endPos.clone(),
      t: 0,
      duration: 0.22
    });
  }

  // --- Floating 2D Toast Text ---
  function spawnFloatingToast(worldX, worldY, worldZ, text, color = '#4ade80') {
    const pos = new THREE.Vector3(worldX, worldY, worldZ);
    pos.project(camera);
    const sx = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const sy = (-pos.y * 0.5 + 0.5) * window.innerHeight;

    const el = document.createElement('div');
    el.className = 'floating-toast';
    el.style.left = `${sx}px`;
    el.style.top = `${sy}px`;
    el.style.color = color;
    el.textContent = text;
    document.getElementById('world-labels').appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 950);
  }

  // --- Update Loop Sections ---
  let pickupCooldown = 0;
  let serveCooldown = 0;
  let unlockDrainCooldown = 0;
  let customerSpawnTimer = 0;
  let saveTimer = 0;

  function updateGame(dt) {
    if (state.overdriveTimer > 0) {
      state.overdriveTimer = Math.max(0, state.overdriveTimer - dt);
      updateStratagemUI();
    }
    if (player.sprintTimer > 0) {
      player.sprintTimer = Math.max(0, player.sprintTimer - dt);
    }

    updatePlayerMovement(dt);
    updateStations(dt);
    updateSeafAI(dt);
    updateCounterAndCustomers(dt);
    updateUnlockZones(dt);
    updateCashPickup(dt);
    updateFlyingParcelsAndVFX(dt);
    updateCameraAndLabels(dt);

    saveTimer += dt;
    if (saveTimer > 4.0) {
      saveTimer = 0;
      saveGame();
    }
  }

  function updatePlayerMovement(dt) {
    let moveX = 0;
    let moveZ = 0;

    if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

    if (joystick.active) {
      moveX = joystick.dx;
      moveZ = joystick.dy;
    } else if (moveX === 0 && moveZ === 0 && targetClickPos) {
      const dx = targetClickPos.x - player.x;
      const dz = targetClickPos.z - player.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.25) {
        moveX = dx / dist;
        moveZ = dz / dist;
      } else {
        targetClickPos = null;
      }
    } else if (moveX !== 0 || moveZ !== 0) {
      targetClickPos = null;
    }

    const len = Math.hypot(moveX, moveZ);
    if (len > 1) {
      moveX /= len;
      moveZ /= len;
    }

    const speed = getPlayerSpeed();
    player.vx = moveX * speed;
    player.vz = moveZ * speed;

    player.x = Math.max(-12.2, Math.min(12.2, player.x + player.vx * dt));
    player.z = Math.max(-11.2, Math.min(10.8, player.z + player.vz * dt));

    if (len > 0.05) {
      player.angle = Math.atan2(player.vx, player.vz);
    }

    animateCharacterRig(player, dt, len > 0.05);

    // Check Trash / Recycler Bin Proximity (-3.8, 5.8)
    if (player.stack.length > 0 && Math.hypot(player.x - -3.8, player.z - 5.8) < 1.25) {
      player.stack.pop();
      syncCharacterStackVisuals(player);
      SFX.playItemStack(1);
      updateHUD();
    }
  }

  function animateCharacterRig(entity, dt, isMoving) {
    const mesh = entity.mesh;
    if (!mesh) return;
    mesh.position.set(entity.x, 0, entity.z);
    mesh.rotation.y = entity.angle;

    const ud = mesh.userData;
    ud.animTime += dt * (isMoving ? 13 : 3);

    // Step cycle bobbing (Module 2.2.K)
    ud.bodyGroup.position.y = isMoving ? Math.abs(Math.sin(ud.animTime)) * 0.09 : 0;
    ud.leftLeg.rotation.x = isMoving ? Math.sin(ud.animTime) * 0.55 : 0;
    ud.rightLeg.rotation.x = isMoving ? -Math.sin(ud.animTime) * 0.55 : 0;

    // Flowing Cape Physics (Module 2.2.F/G)
    ud.capeGroup.rotation.x = (isMoving ? 0.38 : 0.12) + Math.sin(ud.animTime * 0.8) * 0.08;

    // Towering Spine Stack Sway Dynamics (Module 2.4.K)
    const stackMeshes = ud.stackMeshes;
    for (let i = 0; i < stackMeshes.length; i++) {
      const sm = stackMeshes[i];
      const swayZ = Math.sin(ud.animTime * 0.7 + i * 0.25) * 0.03 * Math.min(i, 12);
      const inertiaX = isMoving ? -0.025 * Math.min(i, 12) : 0;
      sm.rotation.z = swayZ;
      sm.rotation.x = inertiaX;
      sm.position.z = isMoving ? -i * 0.012 : 0;
    }
  }

  // --- Update Production Stations & Pickup ---
  function updateStations(dt) {
    const speedMult = getFactorySpeedMult();
    pickupCooldown = Math.max(0, pickupCooldown - dt);

    CFG.STATIONS.forEach((st) => {
      if (!state.unlockedStations[st.id]) return;
      const stRun = stationRuntimes[st.id];
      stRun.rotor.rotation.y += dt * 2.5 * speedMult;

      if (stRun.count < st.maxShelf) {
        stRun.timer += dt * speedMult;
        if (stRun.timer >= st.craftInterval) {
          stRun.timer = 0;
          stRun.count++;
          syncStationShelfMeshes(stRun);
        }
      }

      // Check Player Pickup Proximity
      const dist = Math.hypot(player.x - st.pickupPos.x, player.z - st.pickupPos.z);
      if (dist < 1.45 && stRun.count > 0 && player.stack.length < getPlayerMaxStack() && pickupCooldown <= 0) {
        pickupCooldown = 0.065;
        stRun.count--;
        syncStationShelfMeshes(stRun);
        player.stack.push(st.itemType);
        syncCharacterStackVisuals(player);
        SFX.playItemStack(player.stack.length);
        spawnFlyingParcel(
          new THREE.Vector3(st.shelfPos.x, 1.0, st.shelfPos.z),
          new THREE.Vector3(player.x, 1.4, player.z),
          st.itemType,
          false
        );
        updateHUD();
      }
    });
  }

  // --- Autonomous SEAF Logistics Trooper AI ---
  function updateSeafAI(dt) {
    const seafSpeed = getSeafSpeed();
    const maxCarry = getSeafMaxStack();

    seafAgents.forEach((agent, idx) => {
      if (agent.stack.length >= maxCarry || (agent.stack.length > 0 && agent.state === 'deliver')) {
        agent.state = 'deliver';
        const tx = -0.8 + (idx % 3) * 0.8;
        const tz = 2.2;
        const dx = tx - agent.x;
        const dz = tz - agent.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.35) {
          agent.x += (dx / dist) * seafSpeed * dt;
          agent.z += (dz / dist) * seafSpeed * dt;
          agent.angle = Math.atan2(dx, dz);
          animateCharacterRig(agent, dt, true);
        } else {
          // Unload into Counter Buffer
          if (agent.stack.length > 0) {
            const item = agent.stack.pop();
            counterBuffer[item] = (counterBuffer[item] || 0) + 1;
            syncCharacterStackVisuals(agent);
            syncCounterVisuals();
          } else {
            agent.state = 'idle';
          }
          animateCharacterRig(agent, dt, false);
        }
      } else {
        // Choose most needed unlocked station
        let chosenSt = null;
        if (customers.length > 0) {
          const wantedType = customers[0].itemType;
          const matching = CFG.STATIONS.find(
            (s) => s.itemType === wantedType && state.unlockedStations[s.id] && stationRuntimes[s.id].count > 0
          );
          if (matching) chosenSt = matching;
        }
        if (!chosenSt) {
          const available = CFG.STATIONS.filter(
            (s) => state.unlockedStations[s.id] && stationRuntimes[s.id].count > 0
          );
          if (available.length > 0) {
            chosenSt = available[idx % available.length];
          }
        }

        if (chosenSt) {
          const dx = chosenSt.pickupPos.x - agent.x;
          const dz = chosenSt.pickupPos.z - agent.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0.45) {
            agent.x += (dx / dist) * seafSpeed * dt;
            agent.z += (dz / dist) * seafSpeed * dt;
            agent.angle = Math.atan2(dx, dz);
            animateCharacterRig(agent, dt, true);
          } else {
            const stRun = stationRuntimes[chosenSt.id];
            if (stRun.count > 0 && agent.stack.length < maxCarry) {
              stRun.count--;
              syncStationShelfMeshes(stRun);
              agent.stack.push(chosenSt.itemType);
              syncCharacterStackVisuals(agent);
            }
            if (agent.stack.length > 0) {
              agent.state = 'deliver';
            }
            animateCharacterRig(agent, dt, false);
          }
        } else {
          animateCharacterRig(agent, dt, false);
        }
      }
    });
  }

  // --- Update Counter Service, Customer Queue & Armory Pods ---
  function updateCounterAndCustomers(dt) {
    serveCooldown = Math.max(0, serveCooldown - dt);

    // 1. Player drops matching or buffered items onto Counter when near (0, 2.4)
    const distToCounter = Math.hypot(player.x - 0, player.z - 2.3);
    if (distToCounter < 1.75 && player.stack.length > 0 && serveCooldown <= 0) {
      serveCooldown = 0.06;
      const item = player.stack.pop();
      counterBuffer[item] = (counterBuffer[item] || 0) + 1;
      syncCharacterStackVisuals(player);
      syncCounterVisuals();
      SFX.playItemStack(player.stack.length);
      spawnFlyingParcel(
        new THREE.Vector3(player.x, 1.3, player.z),
        new THREE.Vector3(0, 1.1, 4.2),
        item,
        false
      );
      updateHUD();
    }

    // 2. Serve front customer if Player OR SEAF Cashier is at counter
    const cashierPresent = state.hasSeafCashier || distToCounter < 2.1;
    const queuedCustomers = customers.filter((c) => c.state === 'queue');

    if (cashierPresent && queuedCustomers.length > 0 && serveCooldown <= 0) {
      const front = queuedCustomers[0];
      const distFront = Math.hypot(front.x - 0, front.z - 5.6);
      if (distFront < 1.2 && counterBuffer[front.itemType] > 0) {
        serveCooldown = 0.12;
        counterBuffer[front.itemType]--;
        front.needed--;
        syncCounterVisuals();
        front.qtyEl.textContent = `×${front.needed}`;

        spawnFlyingParcel(
          new THREE.Vector3(0, 1.1, 4.2),
          new THREE.Vector3(front.x, 1.2, front.z),
          front.itemType,
          false
        );

        if (front.needed <= 0) {
          completeCustomerOrder(front);
        }
      }
    }

    // 3. Move Customers in Queue, Armory Pods & Departure
    let queueIndex = 0;
    for (let i = customers.length - 1; i >= 0; i--) {
      const c = customers[i];
      if (c.state === 'queue') {
        const targetX = 0;
        const targetZ = 5.6 + queueIndex * 1.35;
        queueIndex++;

        const dx = targetX - c.x;
        const dz = targetZ - c.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.12) {
          c.x += (dx / dist) * 4.5 * dt;
          c.z += (dz / dist) * 4.5 * dt;
          c.angle = Math.atan2(dx, dz);
          animateCharacterRig(c, dt, true);
        } else {
          c.angle = Math.PI;
          animateCharacterRig(c, dt, false);
        }

        // Patience gentle decay & visual bar
        c.patience = Math.max(20, c.patience - dt * 1.2);
        c.patienceFillEl.style.height = `${c.patience}%`;
        c.patienceFillEl.style.backgroundColor =
          c.patience > 55 ? '#22c55e' : c.patience > 30 ? '#f59e0b' : '#ef4444';
      } else if (c.state === 'pod') {
        const pod = c.assignedPod;
        const dx = pod.x - c.x;
        const dz = pod.z - c.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.2) {
          c.x += (dx / dist) * 5.2 * dt;
          c.z += (dz / dist) * 5.2 * dt;
          c.angle = Math.atan2(dx, dz);
          animateCharacterRig(c, dt, true);
        } else {
          animateCharacterRig(c, dt, false);
          pod.busyTimer -= dt;
          if (pod.busyTimer <= 0) {
            // Bonus Tip from Armory Pod!
            const tip = Math.round(CFG.ITEMS[c.itemType].price * 0.5 * getPriceMultiplier());
            addCashToPile(tip);
            spawnFloatingToast(pod.x, 1.8, pod.z, `+$${tip} ARMORY TIP!`, '#facc15');
            c.state = 'depart';
            c.assignedPod = null;
          }
        }
      } else if (c.state === 'depart') {
        const dx = 4.5 - c.x;
        const dz = 13.0 - c.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.3) {
          c.x += (dx / dist) * 6.0 * dt;
          c.z += (dz / dist) * 6.0 * dt;
          c.angle = Math.atan2(dx, dz);
          animateCharacterRig(c, dt, true);
        } else {
          scene.remove(c.mesh);
          if (c.bubbleEl && c.bubbleEl.parentNode) {
            c.bubbleEl.parentNode.removeChild(c.bubbleEl);
          }
          customers.splice(i, 1);
        }
      }
    }

    // Spawn new Helldiver Customers continuously
    customerSpawnTimer += dt * (state.overdriveTimer > 0 ? 2.0 : 1.0);
    if (customerSpawnTimer >= 2.6) {
      customerSpawnTimer = 0;
      if (customers.filter((c) => c.state === 'queue').length < 5) {
        spawnCustomer();
      }
    }
  }

  function completeCustomerOrder(c) {
    const unitPrice = CFG.ITEMS[c.itemType].price;
    const payout = Math.round(unitPrice * c.maxNeeded * getPriceMultiplier());

    addCashToPile(payout);
    state.servedCount++;
    SFX.playOrderComplete();
    spawnFloatingToast(c.x, 2.1, c.z, `🫡 +$${payout} FOR SUPER EARTH!`, '#4ade80');

    c.bubbleEl.innerHTML = `<span>🫡 READY!</span>`;

    // Check if an Armory Prep Pod is open
    const freePod = armoryPods.find(
      (p) => p.unlocked && p.busyTimer <= 0 && !customers.some((other) => other.assignedPod === p)
    );
    if (freePod) {
      c.state = 'pod';
      c.assignedPod = freePod;
      freePod.busyTimer = 2.0;
    } else {
      c.state = 'depart';
    }
    updateHUD();
  }

  // --- Cash Pile Pickup (Module 1.11 / 2.4.K) ---
  function updateCashPickup(dt) {
    if (cashPile.wavePhase > 0) {
      cashPile.wavePhase = Math.max(0, cashPile.wavePhase - dt * 3);
      cashPile.bricks.forEach((b, idx) => {
        const s = 1 + Math.sin(cashPile.wavePhase * Math.PI * 2 + idx * 0.3) * 0.25 * cashPile.wavePhase;
        b.scale.set(1, Math.max(1, s), 1);
      });
    }

    const dist = Math.hypot(player.x - cashPile.pos.x, player.z - cashPile.pos.z);
    if (dist < 1.65 && cashPile.amount > 0) {
      const take = Math.max(1, Math.ceil(cashPile.amount * 0.35));
      cashPile.amount -= take;
      state.cash += take;
      state.totalEarned += take;
      syncCashBricks();
      SFX.playCashPickup();
      spawnFlyingParcel(
        new THREE.Vector3(cashPile.pos.x, 0.8, cashPile.pos.z),
        new THREE.Vector3(player.x, 1.3, player.z),
        'cloth',
        true
      );
      pulseStatPill('cash-pill-el');
      updateHUD();
    }
  }

  // --- Step-on-Pad Ground Unlock Zones (Module 1.11 & 2.3.K) ---
  let spendStepCounter = 0;
  function updateUnlockZones(dt) {
    unlockDrainCooldown = Math.max(0, unlockDrainCooldown - dt);

    CFG.UNLOCK_ZONES.forEach((uz) => {
      if (state.unlockedZones[uz.id]) return;
      const uzRun = unlockZoneRuntimes[uz.id];
      const dist = Math.hypot(player.x - uz.pos.x, player.z - uz.pos.z);

      if (dist < 1.45 && state.cash > 0 && unlockDrainCooldown <= 0) {
        unlockDrainCooldown = 0.045;
        const rem = uz.cost - (state.zonePaid[uz.id] || 0);
        const stepPay = Math.min(state.cash, rem, Math.max(2, Math.ceil(uz.cost / 22)));

        if (stepPay > 0) {
          state.cash -= stepPay;
          state.zonePaid[uz.id] = (state.zonePaid[uz.id] || 0) + stepPay;
          SFX.playCashSpend(spendStepCounter++);

          const newRem = Math.max(0, uz.cost - state.zonePaid[uz.id]);
          uzRun.costValEl.textContent = newRem;
          uzRun.fillEl.style.width = `${((uz.cost - newRem) / uz.cost) * 100}%`;
          updateHUD();

          if (newRem <= 0) {
            triggerZoneUnlock(uz, uzRun);
          }
        }
      }
    });
  }

  function triggerZoneUnlock(uz, uzRun) {
    state.unlockedZones[uz.id] = true;
    uzRun.padGroup.visible = false;
    uzRun.domEl.style.display = 'none';

    SFX.playHeroicFanfareAndBlast(false);
    triggerScreenFlash();

    if (uz.type === 'station') {
      state.unlockedStations[uz.targetId] = true;
      const stRun = stationRuntimes[uz.targetId];
      if (stRun) {
        stRun.group.visible = true;
        stRun.labelEl.style.display = 'block';
        stRun.count = 4;
        syncStationShelfMeshes(stRun);
        // Elastic Squash-and-Stretch pop (Module 2.4.I)
        stRun.group.scale.set(1.25, 0.65, 1.25);
        setTimeout(() => stRun.group.scale.set(1, 1, 1), 220);
      }
      spawnFloatingToast(uz.pos.x, 2.2, uz.pos.z, `🔓 UNLOCKED: ${uz.title}!`, '#fde047');
    } else if (uz.type === 'seaf_hauler') {
      state.seafHaulers++;
      state.upgrades.seafCount = state.seafHaulers;
      spawnSeafHauler();
      spawnFloatingToast(uz.pos.x, 2.2, uz.pos.z, `🪖 SEAF TROOPER DEPLOYED!`, '#38bdf8');
    } else if (uz.type === 'seaf_cashier') {
      state.hasSeafCashier = true;
      spawnSeafCashierMesh();
      spawnFloatingToast(uz.pos.x, 2.2, uz.pos.z, `🎖️ SEAF QUARTERMASTER ON DUTY!`, '#38bdf8');
    } else if (uz.type === 'armory_pod') {
      state.hasArmoryPod2 = true;
      armoryPods[1].unlocked = true;
      if (armoryPods[1].mesh) armoryPods[1].mesh.visible = true;
      spawnFloatingToast(uz.pos.x, 2.2, uz.pos.z, `🪑 ARMORY POD #2 ONLINE!`, '#4ade80');
    }

    saveGame();
    updateHUD();
    renderUpgradesModal();
  }

  // --- Update Parabolic Parcels, Orbiting Destroyers & 500kg Blast VFX ---
  function updateFlyingParcelsAndVFX(dt) {
    for (let i = flyingParcels.length - 1; i >= 0; i--) {
      const fp = flyingParcels[i];
      fp.t += dt / fp.duration;
      if (fp.t >= 1) {
        scene.remove(fp.mesh);
        flyingParcels.splice(i, 1);
      } else {
        // Quadratic Bezier Arc: P(t) = lerp(P0,P1,t) + (0, 4*h*t*(1-t), 0) (Module 2.4.I/K)
        fp.mesh.position.lerpVectors(fp.p0, fp.p1, fp.t);
        fp.mesh.position.y += 4 * 1.8 * fp.t * (1 - fp.t);
        fp.mesh.rotation.y += dt * 10;
      }
    }

    for (let i = explosionParticles.length - 1; i >= 0; i--) {
      const ep = explosionParticles[i];
      ep.life -= dt;
      if (ep.life <= 0) {
        scene.remove(ep.mesh);
        explosionParticles.splice(i, 1);
      } else {
        ep.mesh.position.addScaledVector(ep.vel, dt);
        const s = 1 + (1 - ep.life / ep.maxLife) * 2.2;
        ep.mesh.scale.set(s, s, s);
      }
    }

    // Gentle hover on Super Destroyers
    const now = performance.now() * 0.001;
    superDestroyers.forEach((ship, i) => {
      ship.position.y = 15 + Math.sin(now * 1.2 + i) * 0.4;
    });

    // Dynamic Onboarding Guide Line points to next best objective
    if (guideLine) {
      let targetX = -6.2;
      let targetZ = -1.5;
      if (cashPile.amount > 0) {
        targetX = cashPile.pos.x;
        targetZ = cashPile.pos.z;
      } else if (player.stack.length > 0) {
        targetX = 0;
        targetZ = 2.3;
      } else {
        const nextZone = CFG.UNLOCK_ZONES.find(
          (z) => !state.unlockedZones[z.id] && state.cash >= z.cost - (state.zonePaid[z.id] || 0)
        );
        if (nextZone) {
          targetX = nextZone.pos.x;
          targetZ = nextZone.pos.z;
        }
      }
      const posArr = guideLine.geometry.attributes.position.array;
      posArr[0] = player.x;
      posArr[1] = 0.08;
      posArr[2] = player.z;
      posArr[3] = targetX;
      posArr[4] = 0.08;
      posArr[5] = targetZ;
      guideLine.geometry.attributes.position.needsUpdate = true;
      guideLine.computeLineDistances();
    }
  }

  // --- Camera Follow & 3D-to-2D World Projections ---
  function updateCameraAndLabels(dt) {
    if (cameraShake > 0) {
      cameraShake = Math.max(0, cameraShake - dt * 2.5);
    }
    const shakeX = (Math.random() - 0.5) * cameraShake * 0.6;
    const shakeZ = (Math.random() - 0.5) * cameraShake * 0.6;

    const targetCamX = player.x * 0.65 + shakeX;
    const targetCamZ = player.z * 0.65 + 17.5 + shakeZ;
    camera.position.x += (targetCamX - camera.position.x) * Math.min(1, dt * 6);
    camera.position.z += (targetCamZ - camera.position.z) * Math.min(1, dt * 6);
    camera.lookAt(player.x * 0.45, 0, player.z * 0.45 - 0.5);

    // Project Station Labels & MAX Tags
    CFG.STATIONS.forEach((st) => {
      if (!state.unlockedStations[st.id]) return;
      const stRun = stationRuntimes[st.id];
      projectToDOM(st.machinePos.x, 2.35, st.machinePos.z, stRun.labelEl);

      if (stRun.count >= st.maxShelf) {
        stRun.maxEl.style.display = 'block';
        projectToDOM(st.shelfPos.x, 2.2, st.shelfPos.z, stRun.maxEl);
      } else {
        stRun.maxEl.style.display = 'none';
      }
    });

    // Project Ground Unlock Labels
    CFG.UNLOCK_ZONES.forEach((uz) => {
      if (state.unlockedZones[uz.id]) return;
      const uzRun = unlockZoneRuntimes[uz.id];
      projectToDOM(uz.pos.x, 0.5, uz.pos.z, uzRun.domEl);
    });

    // Project Customer Order Bubbles
    customers.forEach((c) => {
      projectToDOM(c.x, 2.25, c.z, c.bubbleEl);
    });
  }

  function projectToDOM(wx, wy, wz, el) {
    if (!el) return;
    const v = new THREE.Vector3(wx, wy, wz);
    v.project(camera);
    if (v.z > 1) {
      el.style.display = 'none';
      return;
    }
    const x = (v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-v.y * 0.5 + 0.5) * window.innerHeight;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  // --- Helldivers 500kg Orbital Liberty Overdrive (Module 2.4.G & 3.2.F) ---
  function triggerOrbitalOverdrive() {
    state.overdriveTimer = 20.0;
    state.stratIndex = 0;
    SFX.playHeroicFanfareAndBlast(true);
    triggerScreenFlash();
    cameraShake = 1.2;

    // Spawn 500kg Mushroom Fireball Plume in background canyon (0, 0, -15)
    for (let i = 0; i < 24; i++) {
      const col = i < 10 ? 0xfff59d : i < 18 ? 0xff6d00 : 0x334155;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.45 + Math.random() * 0.4, 8, 8),
        new THREE.MeshBasicMaterial({ color: col })
      );
      sphere.position.set((Math.random() - 0.5) * 3, 0.5, -14.5 + (Math.random() - 0.5) * 2);
      scene.add(sphere);
      explosionParticles.push({
        mesh: sphere,
        vel: new THREE.Vector3((Math.random() - 0.5) * 4, 4 + Math.random() * 7, (Math.random() - 0.5) * 4),
        life: 1.4,
        maxLife: 1.4
      });
    }

    spawnFloatingToast(player.x, 2.4, player.z, '🦅 500KG LIBERTY OVERDRIVE! (2X SPEED & PAY!)', '#fef08a');
    updateStratagemUI();
  }

  function handleStratagemInput(dir) {
    const expected = CFG.STRATAGEM_SEQUENCE[state.stratIndex];
    if (dir === expected) {
      state.stratIndex++;
      SFX.playStratagemKey(true);
      updateStratagemUI();
      if (state.stratIndex >= CFG.STRATAGEM_SEQUENCE.length) {
        triggerOrbitalOverdrive();
      }
    } else {
      state.stratIndex = 0;
      SFX.playStratagemKey(false);
      updateStratagemUI(true);
    }
  }

  function updateStratagemUI(isError = false) {
    const card = document.getElementById('stratagem-card');
    const arrows = document.querySelectorAll('.strat-arrow');
    const btn = document.getElementById('btn-call-stratagem');

    if (state.overdriveTimer > 0) {
      card.classList.add('active-buff');
      btn.textContent = `🔥 ${Math.ceil(state.overdriveTimer)}s`;
    } else {
      card.classList.remove('active-buff');
      btn.textContent = '🦅 500KG BOOST';
    }

    arrows.forEach((el, idx) => {
      el.classList.toggle('matched', idx < state.stratIndex || state.overdriveTimer > 0);
      el.classList.toggle('error', isError);
    });
  }

  function triggerScreenFlash() {
    const flash = document.getElementById('screen-flash');
    if (!flash) return;
    flash.style.opacity = '1';
    setTimeout(() => {
      flash.style.opacity = '0';
    }, 150);
  }

  function pulseStatPill(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 140);
  }

  // --- HUD & Modal Updates ---
  function updateHUD() {
    const cashEl = document.getElementById('hud-cash');
    const carryEl = document.getElementById('hud-carry');
    const seafEl = document.getElementById('hud-seaf');
    const servedEl = document.getElementById('hud-served');
    const tickerEl = document.getElementById('objective-text');

    if (cashEl) cashEl.textContent = Math.floor(state.cash);
    if (carryEl) {
      carryEl.textContent = `${player.stack.length}/${getPlayerMaxStack()}`;
      const maxBadge = document.getElementById('hud-carry-max');
      if (maxBadge) {
        maxBadge.style.display = player.stack.length >= getPlayerMaxStack() ? 'inline' : 'none';
      }
    }
    if (seafEl) {
      seafEl.textContent = state.seafHaulers + (state.hasSeafCashier ? 1 : 0);
    }
    if (servedEl) {
      servedEl.textContent = state.servedCount;
    }

    // Update Skewed Tactical Inventory Counts
    const counts = {};
    player.stack.forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    });
    Object.keys(CFG.ITEMS).forEach((k) => {
      const badge = document.getElementById(`inv-badge-${k}`);
      if (badge) {
        const c = counts[k] || 0;
        const bCount = counterBuffer[k] || 0;
        badge.querySelector('.inv-count').textContent = `${c} (Tray:${bCount})`;
        badge.classList.toggle('active', c > 0 || bCount > 0);
      }
    });

    // Dynamic Objective Ticker
    if (tickerEl) {
      const nextZone = CFG.UNLOCK_ZONES.find((z) => !state.unlockedZones[z.id]);
      if (cashPile.amount >= 20) {
        tickerEl.textContent = `💵 Walk over the Green Cash Pile ($${cashPile.amount}) by the Counter to collect Requisition!`;
      } else if (nextZone) {
        const rem = nextZone.cost - (state.zonePaid[nextZone.id] || 0);
        tickerEl.textContent = `🎯 Next Expansion: Step on [${nextZone.title}] pad ($${rem} left) or haul gear to Helldivers!`;
      } else {
        tickerEl.textContent = `🌟 All Factory Wings & 2F Orbital Warship Drydock Operational! Spread Managed Democracy!`;
      }
    }
  }

  function getUpgradeCost(upg) {
    const lvl = state.upgrades[upg.id] || 0;
    return Math.round(upg.baseCost * Math.pow(upg.costMult, lvl));
  }

  function renderUpgradesModal() {
    const container = document.getElementById('upgrades-list');
    if (!container) return;
    container.innerHTML = '';

    CFG.UPGRADES.forEach((upg) => {
      const lvl = state.upgrades[upg.id] || 0;
      const isMax = lvl >= upg.maxLevel;
      const cost = getUpgradeCost(upg);
      const canAfford = state.cash >= cost && !isMax;

      const card = document.createElement('div');
      card.className = 'upgrade-item' + (upg.isSeaf ? ' seaf-highlight' : '');
      card.innerHTML = `
        <div class="upg-info">
          <h3><span>${upg.icon}</span> ${upg.title}</h3>
          <p>${upg.desc}</p>
          <span class="upg-lvl-badge">Tier ${lvl} / ${upg.maxLevel}</span>
        </div>
        <button class="upg-buy-btn" data-upg="${upg.id}" ${canAfford ? '' : 'disabled'}>
          ${isMax ? 'MAXED' : `💵 $${cost}`}
        </button>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('.upg-buy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-upg');
        buyUpgrade(id);
      });
    });
  }

  function buyUpgrade(id) {
    const upg = CFG.UPGRADES.find((u) => u.id === id);
    if (!upg) return;
    const lvl = state.upgrades[id] || 0;
    if (lvl >= upg.maxLevel) return;
    const cost = getUpgradeCost(upg);
    if (state.cash < cost) return;

    state.cash -= cost;
    state.upgrades[id] = lvl + 1;

    if (id === 'seafCount') {
      state.seafHaulers = state.upgrades.seafCount;
      while (seafAgents.length < state.seafHaulers) {
        spawnSeafHauler();
      }
    }

    SFX.playOrderComplete();
    saveGame();
    updateHUD();
    renderUpgradesModal();
  }

  // --- Bind UI Controls & Multi-Touch Virtual Joystick (Module 3.1) ---
  function bindEvents() {
    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        player.sprintTimer = 2.5;
      }
      if (e.code === 'KeyR') {
        player.stack = [];
        syncCharacterStackVisuals(player);
        updateHUD();
      }
    });

    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
    });

    const joyZone = document.getElementById('joystick-zone');
    const joyBase = document.getElementById('joystick-base');
    const joyKnob = document.getElementById('joystick-knob');

    function startJoy(clientX, clientY, id = null) {
      SFX.init();
      joystick.active = true;
      joystick.touchId = id;
      joystick.startX = clientX;
      joystick.startY = clientY;
      joystick.dx = 0;
      joystick.dy = 0;
      joyBase.style.display = 'block';
      joyBase.style.left = `${clientX}px`;
      joyBase.style.top = `${clientY}px`;
      joyKnob.style.transform = `translate(-50%, -50%)`;
    }

    function moveJoy(clientX, clientY) {
      if (!joystick.active) return;
      const rawDx = clientX - joystick.startX;
      const rawDy = clientY - joystick.startY;
      const maxR = 42;
      const dist = Math.hypot(rawDx, rawDy);
      const clamped = Math.min(dist, maxR);
      const angle = Math.atan2(rawDy, rawDx);
      const kx = Math.cos(angle) * clamped;
      const ky = Math.sin(angle) * clamped;

      joyKnob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
      joystick.dx = dist > 4 ? rawDx / maxR : 0;
      joystick.dy = dist > 4 ? rawDy / maxR : 0;
    }

    function endJoy() {
      joystick.active = false;
      joystick.touchId = null;
      joystick.dx = 0;
      joystick.dy = 0;
      joyBase.style.display = 'none';
    }

    joyZone.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        startJoy(t.clientX, t.clientY, t.identifier);
      },
      { passive: false }
    );

    joyZone.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === joystick.touchId) {
            moveJoy(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
          }
        }
      },
      { passive: false }
    );

    joyZone.addEventListener('touchend', endJoy);
    joyZone.addEventListener('touchcancel', endJoy);

    joyZone.addEventListener('mousedown', (e) => {
      startJoy(e.clientX, e.clientY, 'mouse');
    });
    window.addEventListener('mousemove', (e) => {
      if (joystick.active && joystick.touchId === 'mouse') {
        moveJoy(e.clientX, e.clientY);
      }
    });
    window.addEventListener('mouseup', () => {
      if (joystick.touchId === 'mouse') endJoy();
    });

    // Click on Canvas outside joystick to walk to point
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('pointerdown', (e) => {
      SFX.init();
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, hit)) {
        targetClickPos = { x: hit.x, z: hit.z };
      }
    });

    // HUD & Action Buttons
    document.getElementById('btn-open-seaf').addEventListener('click', () => {
      SFX.init();
      renderUpgradesModal();
      document.getElementById('modal-seaf').classList.add('open');
    });

    document.getElementById('btn-close-seaf').addEventListener('click', () => {
      document.getElementById('modal-seaf').classList.remove('open');
    });

    document.getElementById('btn-open-save').addEventListener('click', () => {
      SFX.init();
      saveGame();
      try {
        const raw = localStorage.getItem(CFG.STORAGE_KEY) || '{}';
        document.getElementById('save-code-box').value = btoa(encodeURIComponent(raw));
      } catch (e) {
        document.getElementById('save-code-box').value = '';
      }
      document.getElementById('modal-save').classList.add('open');
    });

    document.getElementById('btn-close-save').addEventListener('click', () => {
      document.getElementById('modal-save').classList.remove('open');
    });

    document.getElementById('btn-copy-save').addEventListener('click', () => {
      const box = document.getElementById('save-code-box');
      box.select();
      try {
        document.execCommand('copy');
      } catch (e) {}
      spawnFloatingToast(player.x, 2.2, player.z, '💾 SAVE CODE COPIED!', '#38bdf8');
    });

    document.getElementById('btn-import-save').addEventListener('click', () => {
      const box = document.getElementById('save-code-box');
      try {
        const decoded = decodeURIComponent(atob(box.value.trim()));
        const parsed = JSON.parse(decoded);
        if (typeof parsed.cash === 'number') {
          localStorage.setItem(CFG.STORAGE_KEY, decoded);
          window.location.reload();
        }
      } catch (e) {
        spawnFloatingToast(player.x, 2.2, player.z, '⚠️ INVALID SAVE CODE', '#ef4444');
      }
    });

    document.getElementById('btn-reset-save').addEventListener('click', () => {
      try {
        localStorage.removeItem(CFG.STORAGE_KEY);
      } catch (e) {}
      window.location.reload();
    });

    document.getElementById('btn-mute').addEventListener('click', (e) => {
      const muted = SFX.toggleMute();
      e.currentTarget.textContent = muted ? '🔇 Muted' : '🔊 Audio';
    });

    document.getElementById('btn-sprint').addEventListener('click', () => {
      SFX.init();
      player.sprintTimer = 3.5;
      SFX.playStratagemKey(true);
      spawnFloatingToast(player.x, 2.0, player.z, '⚡ JET-BOOT SPRINT!', '#38bdf8');
    });

    document.getElementById('btn-clear-stack').addEventListener('click', () => {
      SFX.init();
      player.stack = [];
      syncCharacterStackVisuals(player);
      SFX.playItemStack(1);
      updateHUD();
    });

    // Stratagem Arrow Buttons & Instant Boost Button
    document.querySelectorAll('.strat-arrow').forEach((arrowEl) => {
      arrowEl.addEventListener('click', () => {
        SFX.init();
        const dir = arrowEl.getAttribute('data-dir');
        handleStratagemInput(dir);
      });
    });

    document.getElementById('btn-call-stratagem').addEventListener('click', () => {
      SFX.init();
      triggerOrbitalOverdrive();
    });

    document.getElementById('objective-ticker').addEventListener('click', () => {
      SFX.init();
      renderUpgradesModal();
      document.getElementById('modal-seaf').classList.add('open');
    });
  }

  // --- Boot Game ---
  window.onload = function () {
    loadGame();
    initScene();
    bindEvents();
    updateHUD();

    clock = new THREE.Clock();
    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      updateGame(dt);
      renderer.render(scene, camera);
    }
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animate();
  };
})();
