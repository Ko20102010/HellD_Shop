/* ==========================================================================
   HELLDIVERS PLEASE! — Super Earth Logistics & War-Zone Tycoon (v0.0.01)
   js/game.js — Shop + Top War-Zone Loop (Whiteout Survival Ad Loop in Helldivers),
   Solid AABB Obstacle Collision, Carbot Characters & LocalStorage Engine
   ========================================================================== */

(function () {
  const CFG = window.GAME_CONFIG;
  const WB = window.WorldBuilder;
  const SFX = window.audioEngine;

  // --- Primary Persistent Game State ---
  // Starts with $100 Requisition Slips AND both Cloth (🦺) & Gun (🔫) 100% unlocked!
  const state = {
    cash: 100,
    totalEarned: 100,
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
    hasWarTurret: false,
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
    z: 1.8,
    vx: 0,
    vz: 0,
    angle: 0,
    stack: [], // Array of itemType strings
    sprintTimer: 0,
    fireCooldown: 0,
    mesh: null
  };

  // Solid Obstacle Colliders (Prevents walking through machines, counter, walls, pods)
  const staticColliders = []; // { minX, maxX, minZ, maxZ, activeFn }

  const stationRuntimes = {};
  const unlockZoneRuntimes = {};
  const counterBuffer = {
    cloth: 4, // Pre-stocked at start so Helldivers can immediately buy!
    gun: 4,   // Pre-stocked at start so Helldivers can immediately buy!
    resource: 1,
    equipment: 0,
    vehicle: 0,
    mech: 0,
    warship: 0
  };
  let counterStackGroup = null;
  let counterStackMeshes = [];

  // Sky-High 3D Green Cash Columns (Module 2.2.I / 2.2.K - Twin Columns stacking 40+ high)
  const cashPile = {
    amount: 40, // Pre-stacked $40 on the cash column at start so player can immediately vacuum cash too!
    pos: { x: 2.8, z: 2.2 },
    bricksGroup: null,
    bricks: [],
    wavePhase: 0
  };

  // Armory Warming Benches / Prep Pods (Module 1.9 Warming Bench / Module 1.11 Dine-in Table)
  const armoryPods = [
    { id: 'pod_bay_1', unlocked: true, x: 3.8, z: 2.5, busyTimer: 0, mesh: null },
    { id: 'pod_bay_2', unlocked: false, x: 3.8, z: 6.2, busyTimer: 0, mesh: null }
  ];

  // --- Outer War Zone Entities (z: -10.0 to -29.0, Module 1.9 Whiteout Survival Loop) ---
  const sporeDrifts = []; // Plowable Alien Spore-Ash Drifts -> drops 'resource' (E-710/Coal)
  const warEnemies = [];  // Carbot Automatons, Hulks & Terminid Bugs -> auto-fire hunting
  const cryoPods = [];    // Frozen Helldivers + Thermal Braziers -> feed resource to thaw into customers!
  const bulletTracers = [];
  let warTurretMesh = null;
  let warTurretCooldown = 0;

  const customers = [];
  const seafAgents = [];
  let seafCashierMesh = null;
  const flyingParcels = [];
  const explosionParticles = [];
  const superDestroyers = [];
  let guideLine = null;

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
    return 18 + state.upgrades.playerCapacity * 6;
  }

  function getPlayerSpeed() {
    const base = 7.8 * (1 + state.upgrades.playerSpeed * 0.14);
    const sprintMult = player.sprintTimer > 0 ? 1.45 : 1.0;
    const buffMult = state.overdriveTimer > 0 ? 1.25 : 1.0;
    return base * sprintMult * buffMult;
  }

  function getSeafMaxStack() {
    return 6 + state.upgrades.seafSpeed * 3;
  }

  function getSeafSpeed() {
    const base = 5.6 * (1 + state.upgrades.seafSpeed * 0.16);
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
        version: CFG.VERSION || 'v0.0.01',
        cash: Math.floor(state.cash),
        totalEarned: Math.floor(state.totalEarned),
        servedCount: state.servedCount,
        unlockedStations: state.unlockedStations,
        unlockedZones: state.unlockedZones,
        zonePaid: state.zonePaid,
        seafHaulers: state.seafHaulers,
        hasSeafCashier: state.hasSeafCashier,
        hasArmoryPod2: state.hasArmoryPod2,
        hasWarTurret: state.hasWarTurret,
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
      // Guarantee basic items (Cloth & Gun) are ALWAYS unlocked!
      state.unlockedStations.station_cloth = true;
      state.unlockedStations.station_gun = true;
      if (data.unlockedZones) Object.assign(state.unlockedZones, data.unlockedZones);
      if (data.zonePaid) Object.assign(state.zonePaid, data.zonePaid);
      if (typeof data.seafHaulers === 'number') state.seafHaulers = data.seafHaulers;
      if (typeof data.hasSeafCashier === 'boolean') state.hasSeafCashier = data.hasSeafCashier;
      if (typeof data.hasArmoryPod2 === 'boolean') state.hasArmoryPod2 = data.hasArmoryPod2;
      if (typeof data.hasWarTurret === 'boolean') state.hasWarTurret = data.hasWarTurret;
      if (data.upgrades) Object.assign(state.upgrades, data.upgrades);
    } catch (e) {
      // Ignore corrupt save
    }
  }

  // --- Solid AABB Collision System (Prevents walking through objects & walls!) ---
  function addCollider(cx, cz, halfW, halfD, activeFn = null) {
    staticColliders.push({
      minX: cx - halfW,
      maxX: cx + halfW,
      minZ: cz - halfD,
      maxZ: cz + halfD,
      activeFn
    });
  }

  function resolveCollisions(entity, radius = 0.52) {
    // World outer boundary (Shop z: +10.8 to Outer War Zone z: -28.5)
    entity.x = Math.max(-12.2, Math.min(12.2, entity.x));
    entity.z = Math.max(-28.5, Math.min(10.8, entity.z));

    for (let i = 0; i < staticColliders.length; i++) {
      const col = staticColliders[i];
      if (col.activeFn && !col.activeFn()) continue;

      const closestX = Math.max(col.minX, Math.min(entity.x, col.maxX));
      const closestZ = Math.max(col.minZ, Math.min(entity.z, col.maxZ));
      const dx = entity.x - closestX;
      const dz = entity.z - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        if (distSq > 0.00001) {
          const dist = Math.sqrt(distSq);
          const overlap = radius - dist;
          entity.x += (dx / dist) * overlap;
          entity.z += (dz / dist) * overlap;
        } else {
          // Inside box center fallback: push out along shortest axis
          const leftPen = Math.abs(entity.x - col.minX);
          const rightPen = Math.abs(col.maxX - entity.x);
          const topPen = Math.abs(entity.z - col.minZ);
          const botPen = Math.abs(col.maxZ - entity.z);
          const minPen = Math.min(leftPen, rightPen, topPen, botPen);
          if (minPen === leftPen) entity.x = col.minX - radius;
          else if (minPen === rightPen) entity.x = col.maxX + radius;
          else if (minPen === topPen) entity.z = col.minZ - radius;
          else entity.z = col.maxZ + radius;
        }
      }
    }
  }

  // --- Scene Initialization ---
  function initScene() {
    const canvas = document.getElementById('game-canvas');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12161f);
    scene.fog = new THREE.FogExp2(0x12161f, 0.012);

    const aspect = window.innerWidth / window.innerHeight;
    const fov = aspect < 1.0 ? 54 : 44;
    camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 180);
    camera.position.set(0, 21, 19);
    camera.lookAt(0, 0, 1);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffbeb, 0.8);
    sun.position.set(14, 30, 16);
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0x38bdf8, 0.3);
    rim.position.set(-16, 18, -18);
    scene.add(rim);

    buildEnvironmentAndWarZone();
    buildStationsAndZones();
    buildCounterAndPods();
    buildCharacters();

    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    const aspect = window.innerWidth / window.innerHeight;
    camera.fov = aspect < 1.0 ? 54 : 44;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // --- Build Shop Hangar + Top Outer War Zone (Module 2.1.K + 2.1.I + Carbot Style) ---
  function buildEnvironmentAndWarZone() {
    // Outer Alien Planetary Surface
    const planetGround = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 140),
      new THREE.MeshLambertMaterial({ color: 0x1a1d26 })
    );
    planetGround.rotation.x = -Math.PI / 2;
    planetGround.position.y = -0.12;
    scene.add(planetGround);

    // 1. Indoor Shop Hangar Deck Floor (z: -9.5 to +11.5)
    const hangarFloor = new THREE.Mesh(
      new THREE.BoxGeometry(26, 0.16, 21),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    );
    hangarFloor.position.set(0, -0.08, 1.0);
    scene.add(hangarFloor);

    // Central Embarkation Hall Carpet
    const centralHall = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 0.04, 20.5),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    centralHall.position.set(0, 0.01, 1.0);
    scene.add(centralHall);

    // West Factory Wing Floor (Warm Honey Deck)
    const westFloor = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.04, 20),
      new THREE.MeshLambertMaterial({ color: 0xb45309 })
    );
    westFloor.position.set(-9.0, 0.01, 1.0);
    scene.add(westFloor);

    // East Heavy Hangar Floor
    const eastFloor = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.04, 20),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    eastFloor.position.set(9.0, 0.01, 1.0);
    scene.add(eastFloor);

    // 2. Fortified Palisade / Blast Wall at Top of Shop (z = -9.5) with Open North Gate (x: -2.8..+2.8)
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfbc02d });

    // Left North Blast Wall (x: -12.8 to -2.8)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(10.0, 1.8, 0.9), wallMat);
    leftWall.position.set(-7.8, 0.9, -9.5);
    const leftStripe = new THREE.Mesh(new THREE.BoxGeometry(10.05, 0.25, 0.95), stripeMat);
    leftStripe.position.set(-7.8, 1.5, -9.5);
    scene.add(leftWall, leftStripe);
    addCollider(-7.8, -9.5, 5.0, 0.55);

    // Right North Blast Wall (x: +2.8 to +12.8)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(10.0, 1.8, 0.9), wallMat);
    rightWall.position.set(7.8, 0.9, -9.5);
    const rightStripe = new THREE.Mesh(new THREE.BoxGeometry(10.05, 0.25, 0.95), stripeMat);
    rightStripe.position.set(7.8, 1.5, -9.5);
    scene.add(rightWall, rightStripe);
    addCollider(7.8, -9.5, 5.0, 0.55);

    // North Gate Archway Pillars (x = -2.8 and x = +2.8, z = -9.5)
    [-2.8, 2.8].forEach((gx) => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.5, 2.6, 10),
        new THREE.MeshLambertMaterial({ color: 0xfbc02d })
      );
      pillar.position.set(gx, 1.3, -9.5);
      scene.add(pillar);
    });

    // Gate Floor Caution Road leading out into the War Area
    const gateRoad = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.04, 19.5),
      new THREE.MeshLambertMaterial({ color: 0x27272a })
    );
    gateRoad.position.set(0, 0.01, -19.2);
    scene.add(gateRoad);

    // Floating Label for the North War-Zone Gate
    const worldLabels = document.getElementById('world-labels');
    const gateLabel = document.createElement('div');
    gateLabel.className = 'world-station-tag';
    gateLabel.style.borderColor = '#ef4444';
    gateLabel.style.background = 'rgba(127, 29, 29, 0.9)';
    gateLabel.textContent = '⚔️ NORTH GATE → WALK OUT TO WAR ZONE (Hunt Bots, Plow E-710, Thaw Helldivers)';
    worldLabels.appendChild(gateLabel);
    window._gateLabelEl = gateLabel;

    // 3. Outer War Zone Terrain & Carbot Red Automaton Outpost Bunker (z: -10.0 to -29.0)
    const warFloor = new THREE.Mesh(
      new THREE.BoxGeometry(26, 0.08, 19.5),
      new THREE.MeshLambertMaterial({ color: 0x2e2622 }) // Volcanic battlefield dirt
    );
    warFloor.position.set(0, -0.04, -19.5);
    scene.add(warFloor);

    // Carbot Automaton Red-Glowing Outpost Bunker at top of War Zone (0, 0, -26.8) (Video 00:12!)
    const bunkerGroup = new THREE.Group();
    bunkerGroup.position.set(0, 0, -26.8);
    const bunkerBody = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 2.5, 3.4),
      new THREE.MeshLambertMaterial({ color: 0x374151 })
    );
    bunkerBody.position.y = 1.25;
    const redDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.6, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xff1744 })
    );
    redDoor.position.set(0, 0.8, 1.72);
    const redVents = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.45, 1.6),
      new THREE.MeshBasicMaterial({ color: 0xff3d00 })
    );
    redVents.position.set(0, 2.55, 0);
    bunkerGroup.add(bunkerBody, redDoor, redVents);
    scene.add(bunkerGroup);
    addCollider(0, -26.8, 3.3, 1.8);

    // 4. Spawn Plowable Alien Spore-Ash Drifts (Module 1.9 Snowplow -> Coal/E-710)
    const driftCoords = [
      { x: -4.5, z: -13.5 },
      { x: -7.5, z: -14.2 },
      { x: 4.5, z: -13.5 },
      { x: 7.5, z: -14.2 },
      { x: -5.2, z: -19.5 },
      { x: 5.2, z: -19.5 },
      { x: -8.5, z: -21.0 },
      { x: 8.5, z: -21.0 }
    ];
    driftCoords.forEach((dc, idx) => {
      const mesh = new THREE.Group();
      mesh.position.set(dc.x, 0, dc.z);
      const mound1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.75, 10, 8),
        new THREE.MeshLambertMaterial({ color: 0xd8b4fe })
      );
      mound1.scale.set(1.2, 0.45, 1.1);
      mound1.position.y = 0.2;
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.32, 0),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      crystal.position.set(0, 0.55, 0);
      mesh.add(mound1, crystal);
      scene.add(mesh);

      sporeDrifts.push({
        id: 'drift_' + idx,
        x: dc.x,
        z: dc.z,
        active: true,
        respawnTimer: 0,
        mesh
      });
    });

    // 5. Spawn 2 Cryo-Frozen Helldiver Pods + Thermal Braziers (Module 1.9 Thawing Frozen Survivors!)
    const cryoCoords = [
      { id: 'cryo_left', x: -8.2, z: -17.2 },
      { id: 'cryo_right', x: 8.2, z: -17.2 }
    ];
    cryoCoords.forEach((cc) => {
      const podMesh = WB.createCryoPodAndBrazierMesh();
      podMesh.position.set(cc.x, 0, cc.z);
      scene.add(podMesh);
      // Solid collider for the ice block & brazier itself, while green pad at (cc.x - 1.1, cc.z + 1.3) is walkable
      addCollider(cc.x, cc.z, 1.3, 0.75);

      const bubbleEl = document.createElement('div');
      bubbleEl.className = 'world-bubble';
      bubbleEl.innerHTML = `<span>🥶 THAW: 📦×2</span>`;
      worldLabels.appendChild(bubbleEl);

      cryoPods.push({
        id: cc.id,
        x: cc.x,
        z: cc.z,
        padX: cc.x - 1.1,
        padZ: cc.z + 1.3,
        needed: 2,
        maxNeeded: 2,
        thawedTimer: 0,
        mesh: podMesh,
        bubbleEl
      });
    });

    // 6. Spawn Carbot Automatons, Hulk Boss & Terminid Bugs in the War Zone
    const enemySpawns = [
      { type: 'automaton', homeX: -3.2, homeZ: -16.8, maxHp: 60 },
      { type: 'automaton', homeX: 3.2, homeZ: -16.8, maxHp: 60 },
      { type: 'bug', homeX: -5.5, homeZ: -22.5, maxHp: 80 },
      { type: 'bug', homeX: 5.5, homeZ: -22.5, maxHp: 80 },
      { type: 'hulk', homeX: 0.0, homeZ: -22.8, maxHp: 160 }
    ];
    enemySpawns.forEach((es, idx) => {
      const mesh = WB.createEnemyRig(es.type);
      mesh.position.set(es.homeX, 0, es.homeZ);
      scene.add(mesh);

      const hpEl = document.createElement('div');
      hpEl.className = 'world-station-tag';
      hpEl.style.borderColor = '#ef4444';
      hpEl.textContent = es.type === 'hulk' ? '💀 HULK BOSS (160 HP)' : es.type === 'bug' ? '🪲 CHARGER BUG' : '🤖 AUTOMATON';
      worldLabels.appendChild(hpEl);

      warEnemies.push({
        id: 'enemy_' + idx,
        type: es.type,
        x: es.homeX,
        z: es.homeZ,
        homeX: es.homeX,
        homeZ: es.homeZ,
        hp: es.maxHp,
        maxHp: es.maxHp,
        deadTimer: 0,
        wanderAngle: idx * 1.3,
        mesh,
        hpEl
      });
    });

    // Trash / Scrap Recycler Bin inside shop (-3.8, 5.8) with solid collider
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
    addCollider(-3.8, 5.8, 0.52, 0.52);

    // 3 Orbiting Super Destroyers in Low Orbit
    const shipCoords = [
      { x: -16, y: 16, z: -34 },
      { x: 0, y: 18, z: -38 },
      { x: 16, y: 16, z: -34 }
    ];
    shipCoords.forEach((sc) => {
      const ship = WB.createSuperDestroyerMesh();
      ship.position.set(sc.x, sc.y, sc.z);
      scene.add(ship);
      superDestroyers.push(ship);
    });

    // Dynamic Onboarding Guide Line on Floor
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.08, 1.8),
      new THREE.Vector3(-6.1, 0.08, -0.5)
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

  // --- Build Production Stations & Solid Colliders ---
  function buildStationsAndZones() {
    const worldLabels = document.getElementById('world-labels');

    CFG.STATIONS.forEach((st) => {
      const group = new THREE.Group();
      const itemCfg = CFG.ITEMS[st.itemType];

      // Machine Gantry Base
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 1.2, 2.0),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      base.position.set(st.machinePos.x, 0.6, st.machinePos.z);

      const topAccent = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.24, 2.1),
        new THREE.MeshLambertMaterial({ color: itemCfg.color })
      );
      topAccent.position.set(st.machinePos.x, 1.25, st.machinePos.z);

      const rotor = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.45, 0),
        new THREE.MeshLambertMaterial({ color: itemCfg.accent })
      );
      rotor.position.set(st.machinePos.x, 1.85, st.machinePos.z);

      // Output Shelf Table
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.65, 1.4),
        new THREE.MeshLambertMaterial({ color: 0x475569 })
      );
      shelf.position.set(st.shelfPos.x, 0.325, st.shelfPos.z);

      // Glowing Pickup Trigger Pad (Green Ring - Walkable)
      const pad = new THREE.Mesh(
        new THREE.RingGeometry(0.72, 1.02, 24),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(st.pickupPos.x, 0.04, st.pickupPos.z);

      const shelfItemsGroup = new THREE.Group();
      shelfItemsGroup.position.set(st.shelfPos.x, 0.68, st.shelfPos.z);

      group.add(base, topAccent, rotor, shelf, pad, shelfItemsGroup);
      scene.add(group);

      // Add SOLID COLLIDERS for Machine Gantry & Output Shelf so player cannot walk through them!
      addCollider(st.machinePos.x, st.machinePos.z, 1.2, 1.05, () => !!state.unlockedStations[st.id]);
      addCollider(st.shelfPos.x, st.shelfPos.z, 0.75, 0.75, () => !!state.unlockedStations[st.id]);

      const labelEl = document.createElement('div');
      labelEl.className = 'world-station-tag';
      labelEl.textContent = `${itemCfg.icon} ${itemCfg.shortName} ($${itemCfg.price})`;
      worldLabels.appendChild(labelEl);

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
        count: isUnlocked ? 6 : 0, // Pre-stock 6 items on unlocked shelves at start!
        timer: 0,
        labelEl,
        maxEl
      };
      syncStationShelfMeshes(stationRuntimes[st.id]);
    });

    // Ground Unlock Zones
    CFG.UNLOCK_ZONES.forEach((uz) => {
      if (state.zonePaid[uz.id] === undefined) {
        state.zonePaid[uz.id] = 0;
      }
      if (uz.type === 'station' && state.unlockedStations[uz.targetId]) {
        state.unlockedZones[uz.id] = true;
      }

      const padGroup = new THREE.Group();
      padGroup.position.set(uz.pos.x, 0.03, uz.pos.z);

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.06, 1.75),
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
    // Central Quartermaster Counter (x: 0, z: 4.2) — SOLID COLLIDER!
    const counterGroup = new THREE.Group();
    counterGroup.position.set(0, 0, 4.2);

    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.9, 1.3),
      new THREE.MeshLambertMaterial({ color: 0xb91c1c })
    );
    desk.position.y = 0.45;

    const topPlate = new THREE.Mesh(
      new THREE.BoxGeometry(4.55, 0.12, 1.45),
      new THREE.MeshLambertMaterial({ color: 0xf8fafc })
    );
    topPlate.position.y = 0.92;

    // Green Cashier Trigger Pad behind counter (x: 0, z: 2.3)
    const servicePad = new THREE.Mesh(
      new THREE.RingGeometry(1.0, 1.35, 28),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
    );
    servicePad.rotation.x = -Math.PI / 2;
    servicePad.position.set(0, 0.04, -1.9);

    counterStackGroup = new THREE.Group();
    counterStackGroup.position.set(0, 1.0, 0);

    counterGroup.add(desk, topPlate, servicePad, counterStackGroup);
    scene.add(counterGroup);

    // Solid Collider for Counter Desk (Player walks around it or stands on pad at z=2.3)
    addCollider(0, 4.2, 2.25, 0.72);

    // Cash Pile Base & Sky-High Twin 3D Columns (Module 2.2.I / 2.2.K)
    const cashPad = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.06, 1.5),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.45 })
    );
    cashPad.position.set(cashPile.pos.x, 0.03, cashPile.pos.z);
    scene.add(cashPad);

    cashPile.bricksGroup = new THREE.Group();
    cashPile.bricksGroup.position.set(cashPile.pos.x, 0.08, cashPile.pos.z);
    scene.add(cashPile.bricksGroup);
    syncCashBricks();
    syncCounterVisuals();

    // Armory Warming Benches / Prep Pods (with solid collider on the rack)
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
        new THREE.BoxGeometry(0.95, 1.2, 0.4),
        new THREE.MeshLambertMaterial({ color: 0xfbc02d })
      );
      rack.position.set(0, 0.65, -0.7);

      podGroup.add(platform, rack);
      podGroup.visible = pod.unlocked;
      scene.add(podGroup);
      pod.mesh = podGroup;

      addCollider(pod.x, pod.z - 0.7, 0.55, 0.35, () => pod.unlocked);
    });

    if (state.hasWarTurret) {
      spawnWarTurretMesh();
    }
  }

  function spawnWarTurretMesh() {
    if (warTurretMesh) return;
    const g = new THREE.Group();
    g.position.set(-3.8, 0, -12.0);
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.75, 0.6, 8),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    base.position.y = 0.3;
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, 0.9),
      new THREE.MeshLambertMaterial({ color: 0xfbc02d })
    );
    head.position.y = 0.85;
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8),
      new THREE.MeshLambertMaterial({ color: 0x94a3b8 })
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.85, -0.65);
    g.add(base, head, barrel);
    scene.add(g);
    warTurretMesh = g;
    addCollider(-3.8, -12.0, 0.65, 0.65);
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
    cashPile.wavePhase = 1.0;
    syncCashBricks();
  }

  function syncCashBricks() {
    const targetBricks = Math.min(Math.ceil(cashPile.amount / 6), 56);
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

    if (state.hasSeafCashier) {
      spawnSeafCashierMesh();
    }

    const totalHaulers = Math.max(state.seafHaulers, state.upgrades.seafCount);
    state.seafHaulers = totalHaulers;
    state.upgrades.seafCount = totalHaulers;
    while (seafAgents.length < totalHaulers) {
      spawnSeafHauler();
    }

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

  // --- Spawn & Manage Helldiver Customers ---
  function spawnCustomer(fromWarZonePos = null) {
    if (customers.length >= 7) return;
    const unlockedItems = getUnlockedItemTypes();
    const itemType = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
    const isVip = itemType === 'mech' || itemType === 'warship' || Math.random() < 0.18;
    const qty = isVip ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2) + 1;

    const mesh = WB.createCharacterRig(isVip ? 'vip' : 'customer');
    const spawnX = fromWarZonePos ? fromWarZonePos.x : (Math.random() - 0.5) * 3.5;
    const spawnZ = fromWarZonePos ? fromWarZonePos.z : 10.6;
    mesh.position.set(spawnX, 0, spawnZ);
    mesh.rotation.y = Math.PI;
    scene.add(mesh);

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
      state: 'queue',
      assignedPod: null,
      mesh,
      bubbleEl,
      qtyEl: bubbleEl.querySelector('.order-qty'),
      patienceFillEl: bubbleEl.querySelector('.patience-fill')
    });
  }

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

  // --- Main Update Loop ---
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
    updateWarZone(dt);
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

    player.x += player.vx * dt;
    player.z += player.vz * dt;

    // Enforce Solid Obstacle Collisions!
    resolveCollisions(player, 0.54);

    if (len > 0.05) {
      player.angle = Math.atan2(player.vx, player.vz);
    }

    animateCharacterRig(player, dt, len > 0.05);

    // Check Trash / Recycler Bin Proximity (-3.8, 5.8)
    if (player.stack.length > 0 && Math.hypot(player.x - -3.8, player.z - 5.8) < 1.35) {
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
    ud.animTime += dt * (isMoving ? 14 : 3);

    // Carbot Bean Waddle Animation
    ud.bodyGroup.position.y = isMoving ? Math.abs(Math.sin(ud.animTime)) * 0.11 : 0;
    ud.bodyGroup.rotation.z = isMoving ? Math.sin(ud.animTime) * 0.08 : 0;
    ud.leftLeg.rotation.x = isMoving ? Math.sin(ud.animTime) * 0.6 : 0;
    ud.rightLeg.rotation.x = isMoving ? -Math.sin(ud.animTime) * 0.6 : 0;

    // Flowing Cape Physics
    ud.capeGroup.rotation.x = (isMoving ? 0.42 : 0.14) + Math.sin(ud.animTime * 0.8) * 0.09;

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

  // --- Update Outer War Zone (Module 1.9 Whiteout Survival Playable-Ad Loop!) ---
  function updateWarZone(dt) {
    // 1. Plowing Alien Spore-Ash Drifts (Pushing snow clears terrain & drops E-710 Resource!)
    sporeDrifts.forEach((dr) => {
      if (!dr.active) {
        dr.respawnTimer -= dt;
        if (dr.respawnTimer <= 0) {
          dr.active = true;
          dr.mesh.visible = true;
        }
        return;
      }
      dr.mesh.rotation.y += dt * 1.2;
      const dist = Math.hypot(player.x - dr.x, player.z - dr.z);
      if (dist < 1.35 && player.stack.length < getPlayerMaxStack()) {
        dr.active = false;
        dr.respawnTimer = 12.0;
        dr.mesh.visible = false;

        // Add E-710 Resource crate to player back-stack + sideways spore spray!
        player.stack.push('resource');
        syncCharacterStackVisuals(player);
        SFX.playItemStack(player.stack.length);
        spawnFloatingToast(dr.x, 1.5, dr.z, '🚜 PLOWED E-710 FUEL (+1 📦)', '#4ade80');
        updateHUD();
      }
    });

    // 2. Thawing Cryo-Frozen Helldivers at Thermal Braziers (Feeding resource melts ice -> new customer + $40!)
    cryoPods.forEach((cp) => {
      if (cp.thawedTimer > 0) {
        cp.thawedTimer -= dt;
        if (cp.thawedTimer <= 0) {
          cp.needed = cp.maxNeeded;
          cp.mesh.userData.iceBlock.visible = true;
          cp.mesh.userData.innerHelldiver.visible = true;
          cp.bubbleEl.innerHTML = `<span>🥶 THAW: 📦×${cp.needed}</span>`;
        }
        return;
      }

      const dist = Math.hypot(player.x - cp.padX, player.z - cp.padZ);
      if (dist < 1.4 && player.stack.length > 0 && pickupCooldown <= 0) {
        pickupCooldown = 0.14;
        const donatedItem = player.stack.pop();
        syncCharacterStackVisuals(player);
        cp.needed--;
        SFX.playCashSpend(cp.maxNeeded - cp.needed);
        spawnFlyingParcel(
          new THREE.Vector3(player.x, 1.3, player.z),
          new THREE.Vector3(cp.x - 1.1, 1.0, cp.z),
          donatedItem,
          false
        );
        updateHUD();

        if (cp.needed > 0) {
          cp.bubbleEl.innerHTML = `<span>🥶 THAW: 📦×${cp.needed}</span>`;
        } else {
          // Thawed! Melt ice block, pop "😊" bubble, spawn customer marching to shop + $45 bonus!
          cp.thawedTimer = 14.0;
          cp.mesh.userData.iceBlock.visible = false;
          cp.mesh.userData.innerHelldiver.visible = false;
          cp.bubbleEl.innerHTML = `<span>😊 THAWED! +$45</span>`;
          SFX.playOrderComplete();
          addCashToPile(45);
          spawnFloatingToast(cp.x, 2.2, cp.z, '😊 HELldiver THAWED! (+$45 TO CASH TOWER)', '#fde047');
          spawnCustomer({ x: 0, z: -9.0 });
        }
      }
    });

    // 3. Auto-Hunting Carbot Automatons, Hulks & Terminid Chargers
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    warTurretCooldown = Math.max(0, warTurretCooldown - dt);

    let closestEnemy = null;
    let closestDist = 5.6;

    warEnemies.forEach((en) => {
      if (en.deadTimer > 0) {
        en.deadTimer -= dt;
        if (en.deadTimer <= 0) {
          en.hp = en.maxHp;
          en.x = en.homeX;
          en.z = en.homeZ;
          en.mesh.visible = true;
          en.hpEl.style.display = 'block';
        }
        return;
      }

      // Gentle patrol around home coordinate in the War Zone
      en.wanderAngle += dt * 1.4;
      en.x = en.homeX + Math.sin(en.wanderAngle) * 1.4;
      en.z = en.homeZ + Math.cos(en.wanderAngle * 0.8) * 0.9;
      en.mesh.position.set(en.x, 0, en.z);
      en.mesh.rotation.y = Math.atan2(player.x - en.x, player.z - en.z);
      en.mesh.userData.bodyGroup.position.y = Math.abs(Math.sin(en.wanderAngle * 4)) * 0.08;

      const labelPrefix =
        en.type === 'hulk' ? '💀 HULK' : en.type === 'bug' ? '🪲 BUG' : '🤖 BOT';
      en.hpEl.textContent = `${labelPrefix} (${Math.ceil(en.hp)}/${en.maxHp})`;

      const d = Math.hypot(player.x - en.x, player.z - en.z);
      if (d < closestDist) {
        closestDist = d;
        closestEnemy = en;
      }

      // Gate Sentry Turret auto-fire if unlocked
      if (state.hasWarTurret && warTurretMesh && warTurretCooldown <= 0) {
        const td = Math.hypot(-3.8 - en.x, -12.0 - en.z);
        if (td < 9.5) {
          warTurretCooldown = 0.28;
          warTurretMesh.rotation.y = Math.atan2(en.x - -3.8, en.z - -12.0);
          fireTracer(new THREE.Vector3(-3.8, 0.9, -12.0), en, 14);
        }
      }
    });

    // Player Auto-Fires Weapon when near an Enemy in the War Zone!
    if (closestEnemy && player.fireCooldown <= 0) {
      player.fireCooldown = 0.22;
      player.angle = Math.atan2(closestEnemy.x - player.x, closestEnemy.z - player.z);
      const dmg = Math.round(20 * getFactorySpeedMult());
      SFX.playGunshot();
      fireTracer(new THREE.Vector3(player.x, 0.9, player.z), closestEnemy, dmg);
    }

    // Update Bullet Tracers
    for (let i = bulletTracers.length - 1; i >= 0; i--) {
      const bt = bulletTracers[i];
      bt.life -= dt;
      if (bt.life <= 0) {
        scene.remove(bt.mesh);
        bulletTracers.splice(i, 1);
      }
    }
  }

  function fireTracer(startVec, enemy, dmg) {
    const endVec = new THREE.Vector3(enemy.x, 0.9, enemy.z);
    const geo = new THREE.BufferGeometry().setFromPoints([startVec, endVec]);
    const mat = new THREE.LineBasicMaterial({ color: 0xfef08a });
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    bulletTracers.push({ mesh: line, life: 0.07 });

    enemy.hp -= dmg;
    if (enemy.hp <= 0) {
      enemy.deadTimer = 9.0;
      enemy.mesh.visible = false;
      enemy.hpEl.style.display = 'none';

      // Reward Loot Stack + Cash!
      const rewardItem = enemy.type === 'hulk' ? 'equipment' : 'resource';
      const cashReward = enemy.type === 'hulk' ? 55 : 22;
      state.cash += cashReward;
      state.totalEarned += cashReward;

      const drops = enemy.type === 'hulk' ? 2 : 1;
      for (let d = 0; d < drops; d++) {
        if (player.stack.length < getPlayerMaxStack()) {
          player.stack.push(rewardItem);
          spawnFlyingParcel(
            new THREE.Vector3(enemy.x, 1.0, enemy.z),
            new THREE.Vector3(player.x, 1.4, player.z),
            rewardItem,
            false
          );
        } else {
          counterBuffer[rewardItem] = (counterBuffer[rewardItem] || 0) + 1;
          syncCounterVisuals();
        }
      }
      syncCharacterStackVisuals(player);
      SFX.playOrderComplete();
      spawnFloatingToast(
        enemy.x,
        1.8,
        enemy.z,
        `💥 ELIMINATED! +$${cashReward} & +${drops} ${CFG.ITEMS[rewardItem].icon}`,
        '#fde047'
      );
      updateHUD();
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

    // 1. Player drops items onto Counter when standing on/near Green Cashier Pad (0, 2.3)
    const distToCounterPad = Math.hypot(player.x - 0, player.z - 2.3);
    if (distToCounterPad < 2.2 && player.stack.length > 0 && serveCooldown <= 0) {
      serveCooldown = 0.055;
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

    // 2. Serve queued customers whenever matching items are on the Counter Tray!
    // (Works automatically when items are on the tray or when Player/SEAF Cashier is present!)
    const queuedCustomers = customers.filter((c) => c.state === 'queue');
    if (queuedCustomers.length > 0 && serveCooldown <= 0) {
      const front = queuedCustomers[0];
      const distFront = Math.hypot(front.x - 0, front.z - 5.6);
      if (distFront < 1.5 && counterBuffer[front.itemType] > 0) {
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
        updateHUD();
      }
    }

    // 3. Move Customers in Queue, Warming Benches & Departure
    let queueIndex = 0;
    for (let i = customers.length - 1; i >= 0; i--) {
      const c = customers[i];
      if (c.state === 'queue') {
        const targetX = 0;
        const targetZ = 5.6 + queueIndex * 1.3;
        queueIndex++;

        const dx = targetX - c.x;
        const dz = targetZ - c.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.12) {
          c.x += (dx / dist) * 4.6 * dt;
          c.z += (dz / dist) * 4.6 * dt;
          c.angle = Math.atan2(dx, dz);
          animateCharacterRig(c, dt, true);
        } else {
          c.angle = Math.PI;
          animateCharacterRig(c, dt, false);
        }

        c.patience = Math.max(25, c.patience - dt * 1.1);
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
            const tip = Math.round(CFG.ITEMS[c.itemType].price * 0.6 * getPriceMultiplier());
            addCashToPile(tip);
            spawnFloatingToast(pod.x, 1.8, pod.z, `😊 +$${tip} BENCH BONUS!`, '#facc15');
            c.state = 'depart';
            c.assignedPod = null;
          }
        }
      } else if (c.state === 'depart') {
        const dx = 4.5 - c.x;
        const dz = 12.2 - c.z;
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

    customerSpawnTimer += dt * (state.overdriveTimer > 0 ? 2.0 : 1.0);
    if (customerSpawnTimer >= 2.4) {
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
    spawnFloatingToast(c.x, 2.1, c.z, `😊 +$${payout} FOR SUPER EARTH!`, '#4ade80');

    // Module 1.9 / 2.3.I: Customer pops a happy "😊" bubble and walks to the warming bench!
    c.bubbleEl.innerHTML = `<span>😊 READY!</span>`;

    const freePod = armoryPods.find(
      (p) => p.unlocked && p.busyTimer <= 0 && !customers.some((other) => other.assignedPod === p)
    );
    if (freePod) {
      c.state = 'pod';
      c.assignedPod = freePod;
      freePod.busyTimer = 1.8;
    } else {
      c.state = 'depart';
    }
    updateHUD();
  }

  // --- Cash Pile Pickup (Module 1.9 / 1.11) ---
  function updateCashPickup(dt) {
    if (cashPile.wavePhase > 0) {
      cashPile.wavePhase = Math.max(0, cashPile.wavePhase - dt * 3);
      cashPile.bricks.forEach((b, idx) => {
        const s = 1 + Math.sin(cashPile.wavePhase * Math.PI * 2 + idx * 0.3) * 0.25 * cashPile.wavePhase;
        b.scale.set(1, Math.max(1, s), 1);
      });
    }

    const dist = Math.hypot(player.x - cashPile.pos.x, player.z - cashPile.pos.z);
    if (dist < 1.75 && cashPile.amount > 0) {
      const take = Math.max(1, Math.ceil(cashPile.amount * 0.4));
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

  // --- Step-on-Pad Ground Unlock Zones ---
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
        const stepPay = Math.min(state.cash, rem, Math.max(2, Math.ceil(uz.cost / 20)));

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
        stRun.count = 5;
        syncStationShelfMeshes(stRun);
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
      spawnFloatingToast(uz.pos.x, 2.2, uz.pos.z, `🪑 WARMING BENCH #2 ONLINE!`, '#4ade80');
    } else if (uz.type === 'war_turret') {
      state.hasWarTurret = true;
      spawnWarTurretMesh();
      spawnFloatingToast(uz.pos.x, 2.2, uz.pos.z, `🔫 GATE SENTRY TURRET ONLINE!`, '#fde047');
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

    const now = performance.now() * 0.001;
    superDestroyers.forEach((ship, i) => {
      ship.position.y = 16 + Math.sin(now * 1.2 + i) * 0.4;
    });

    if (guideLine) {
      let targetX = -6.1;
      let targetZ = -0.5;
      if (cashPile.amount > 15) {
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

  // --- Camera Follow (Tracks Player smoothly into the Outer War Zone too!) ---
  function updateCameraAndLabels(dt) {
    if (cameraShake > 0) {
      cameraShake = Math.max(0, cameraShake - dt * 2.5);
    }
    const shakeX = (Math.random() - 0.5) * cameraShake * 0.6;
    const shakeZ = (Math.random() - 0.5) * cameraShake * 0.6;

    const isPortrait = window.innerWidth < window.innerHeight;
    const baseCamY = isPortrait ? 24.0 : 20.5;
    const baseCamZOffset = isPortrait ? 19.5 : 16.5;

    const targetCamX = player.x * 0.75 + shakeX;
    const targetCamZ = player.z + baseCamZOffset + shakeZ;
    camera.position.x += (targetCamX - camera.position.x) * Math.min(1, dt * 6);
    camera.position.y += (baseCamY - camera.position.y) * Math.min(1, dt * 6);
    camera.position.z += (targetCamZ - camera.position.z) * Math.min(1, dt * 6);
    camera.lookAt(player.x * 0.6, 0, player.z - 1.0);

    if (window._gateLabelEl) {
      projectToDOM(0, 2.7, -9.5, window._gateLabelEl);
    }

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

    CFG.UNLOCK_ZONES.forEach((uz) => {
      if (state.unlockedZones[uz.id]) return;
      const uzRun = unlockZoneRuntimes[uz.id];
      projectToDOM(uz.pos.x, 0.5, uz.pos.z, uzRun.domEl);
    });

    customers.forEach((c) => {
      projectToDOM(c.x, 2.15, c.z, c.bubbleEl);
    });

    cryoPods.forEach((cp) => {
      projectToDOM(cp.x + 0.4, 2.3, cp.z, cp.bubbleEl);
    });

    warEnemies.forEach((en) => {
      if (en.deadTimer <= 0) {
        projectToDOM(en.x, en.type === 'hulk' ? 2.4 : 1.9, en.z, en.hpEl);
      }
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
    el.style.display = 'flex';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  // --- Helldivers 500kg Orbital Liberty Overdrive ---
  function triggerOrbitalOverdrive() {
    state.overdriveTimer = 20.0;
    state.stratIndex = 0;
    SFX.playHeroicFanfareAndBlast(true);
    triggerScreenFlash();
    cameraShake = 1.2;

    for (let i = 0; i < 24; i++) {
      const col = i < 10 ? 0xfff59d : i < 18 ? 0xff6d00 : 0x334155;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.45 + Math.random() * 0.4, 8, 8),
        new THREE.MeshBasicMaterial({ color: col })
      );
      sphere.position.set((Math.random() - 0.5) * 3, 0.5, -18.5 + (Math.random() - 0.5) * 2);
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
    const verEl = document.getElementById('hud-version');
    if (verEl && CFG.VERSION) verEl.textContent = CFG.VERSION;

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

    if (tickerEl) {
      if (player.z < -9.5) {
        tickerEl.textContent = `⚔️ WAR ZONE: Plow Spore-Drifts for 📦 E-710, Auto-Hunt Bots/Hulks, or Thaw 🥶 Cryo-Helldivers!`;
      } else if (cashPile.amount >= 20) {
        tickerEl.textContent = `💵 Walk over the Green Cash Tower ($${cashPile.amount}) or walk North out the Gate to the War Zone!`;
      } else {
        const nextZone = CFG.UNLOCK_ZONES.find((z) => !state.unlockedZones[z.id]);
        if (nextZone) {
          const rem = nextZone.cost - (state.zonePaid[nextZone.id] || 0);
          tickerEl.textContent = `🎯 Next: Step on [${nextZone.title}] ($${rem}) OR walk North through the Gate to hunt in the War Area!`;
        } else {
          tickerEl.textContent = `🌟 All Factory Wings & North War Zone Operational! For Super Earth!`;
        }
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

  // --- Bind UI Controls & Multi-Touch Virtual Joystick ---
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
