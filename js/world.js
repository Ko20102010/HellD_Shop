/* ==========================================================================
   HELLDIVERS PLEASE! — Super Earth Logistics & Arsenal Tycoon
   js/world.js — 3D Meshes, Chibi Helldiver Stickmen, Verlet Capes & Items
   Combines Module 2.1.K/G (Burger Please + Super Destroyers) & 2.2.K/F/G
   ========================================================================== */

window.WorldBuilder = {
  // Build a stackable 3D Item Mesh for any of the 7 War Materiel types
  createItemMesh(itemType) {
    const group = new THREE.Group();
    const cfg = window.GAME_CONFIG.ITEMS[itemType] || window.GAME_CONFIG.ITEMS.cloth;

    if (itemType === 'cloth') {
      // Folded B-01 Tactical Tunic + Yellow Helldiver Trim (layered like a Burger patty stack)
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.12, 0.42),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.05, 0.44),
        new THREE.MeshLambertMaterial({ color: 0xfbc02d })
      );
      stripe.position.y = 0.06;
      const badge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.04, 8),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      badge.position.y = 0.09;
      group.add(base, stripe, badge);
    } else if (itemType === 'gun') {
      // AR-23 Liberator Bullpup Rifle on Yellow Polymer Rack
      const crateBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.07, 0.34),
        new THREE.MeshLambertMaterial({ color: 0x334155 })
      );
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.12, 0.12),
        new THREE.MeshLambertMaterial({ color: 0x0f172a })
      );
      body.position.y = 0.08;
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.28, 6),
        new THREE.MeshLambertMaterial({ color: 0x94a3b8 })
      );
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(0.24, 0.09, 0);
      const yellowGrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.13, 0.14),
        new THREE.MeshLambertMaterial({ color: 0xfbc02d })
      );
      yellowGrip.position.set(-0.1, 0.08, 0);
      group.add(crateBase, body, barrel, yellowGrip);
    } else if (itemType === 'resource') {
      // Hellpod Supply Ammo & Stim Pack Crate
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.22, 0.4),
        new THREE.MeshLambertMaterial({ color: 0x16a34a })
      );
      const lid = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.06, 0.43),
        new THREE.MeshLambertMaterial({ color: 0xfacc15 })
      );
      lid.position.y = 0.1;
      group.add(box, lid);
    } else if (itemType === 'equipment') {
      // SH-32 Energy Shield Generator Dome + Pack
      const pack = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.12, 0.44),
        new THREE.MeshLambertMaterial({ color: 0x0284c7 })
      );
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshLambertMaterial({ color: 0x38bdf8 })
      );
      dome.position.y = 0.06;
      group.add(pack, dome);
    } else if (itemType === 'vehicle') {
      // Miniature M-102 Fast Recon Vehicle (車)
      const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.16, 0.44),
        new THREE.MeshLambertMaterial({ color: 0x4d7c0f })
      );
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.14, 0.36),
        new THREE.MeshLambertMaterial({ color: 0xfacc15 })
      );
      cabin.position.set(-0.04, 0.13, 0);
      const turret = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      turret.rotation.z = Math.PI / 2;
      turret.position.set(0.18, 0.22, 0);
      group.add(chassis, cabin, turret);
    } else if (itemType === 'mech') {
      // Miniature EXO-45 Patriot Exosuit Mech (機甲)
      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.28, 0.42),
        new THREE.MeshLambertMaterial({ color: 0xd97706 })
      );
      torso.position.y = 0.08;
      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.08, 0.24),
        new THREE.MeshLambertMaterial({ color: 0xfef08a })
      );
      visor.position.y = 0.12;
      const pod = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.18, 0.14),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      pod.position.set(0, 0.14, 0.26);
      group.add(torso, visor, pod);
    } else if (itemType === 'warship') {
      // Wedge-Hulled Super Destroyer Orbital Warship (戰艦)
      const hull = new THREE.Mesh(
        new THREE.ConeGeometry(0.34, 0.78, 4),
        new THREE.MeshLambertMaterial({ color: 0x334155 })
      );
      hull.rotation.z = -Math.PI / 2;
      hull.rotation.x = Math.PI / 4;
      hull.position.y = 0.08;
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.14, 0.22),
        new THREE.MeshLambertMaterial({ color: 0xa855f7 })
      );
      bridge.position.set(-0.12, 0.18, 0);
      const glow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.06, 8),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      glow.rotation.z = Math.PI / 2;
      glow.position.set(-0.38, 0.08, 0);
      group.add(hull, bridge, glow);
    } else {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.16, 0.4),
        new THREE.MeshLambertMaterial({ color: cfg.color })
      );
      group.add(box);
    }

    return group;
  },

  // Module 2.2.K + 2.2.F/G: Chibi Stickman Rig with Helldivers Helmet & Dynamic Flowing Cape
  createCharacterRig(role = 'player') {
    const root = new THREE.Group();

    // Role Palettes:
    // 'player': Crimson Manager Cap (#e84118) + Super Earth Black/Gold Officer Armor & Gold-Trimmed Cape
    // 'seaf': SEAF Sky-Blue Trooper (#0284c7) + White/Blue Helmet & Tactical Pack
    // 'customer': Helldiver Black/Yellow Trooper (#1e293b + #fbc02d) with Cyan Visor & Flowing Black Cape
    // 'vip': Super Admiral (#7e22ce + #fbc02d) with Golden Cape
    let torsoColor = 0x1e293b;
    let accentColor = 0xfbc02d;
    let helmetColor = 0x0f172a;
    let visorColor = 0x38bdf8;
    let capeColor = 0x111827;

    if (role === 'player') {
      torsoColor = 0x1e293b;
      accentColor = 0xfbc02d;
      helmetColor = 0xe84118; // Burger Please! iconic crimson manager cap/helmet
      visorColor = 0xfef08a;
      capeColor = 0xb91c1c;
    } else if (role === 'seaf' || role === 'seaf_cashier') {
      torsoColor = 0x0284c7; // SEAF Blue Armor
      accentColor = 0xe0f2fe;
      helmetColor = 0x0369a1;
      visorColor = 0x7dd3fc;
      capeColor = 0x075985;
    } else if (role === 'vip') {
      torsoColor = 0x581c87;
      accentColor = 0xfacc15;
      helmetColor = 0xfacc15;
      visorColor = 0xffffff;
      capeColor = 0xca8a04;
    }

    // Shadow disc
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.45, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    // Body Group (bobs when walking)
    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.42, 8);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.14, 0.21, 0);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.14, 0.21, 0);
    bodyGroup.add(leftLeg, rightLeg);

    // Tapered Chibi Torso (Module 2.2.K)
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.31, 0.72, 12),
      new THREE.MeshLambertMaterial({ color: torsoColor })
    );
    torso.position.y = 0.72;
    bodyGroup.add(torso);

    // Helldiver Yellow Hazard Chest Stripe
    const chestStripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.275, 0.285, 0.14, 12),
      new THREE.MeshLambertMaterial({ color: accentColor })
    );
    chestStripe.position.y = 0.85;
    bodyGroup.add(chestStripe);

    // Sphere Head + Visor + Cap Visor (Module 2.2.K & 2.2.F)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.29, 14, 12),
      new THREE.MeshLambertMaterial({ color: helmetColor })
    );
    head.position.y = 1.32;
    bodyGroup.add(head);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.12, 0.18),
      new THREE.MeshBasicMaterial({ color: visorColor })
    );
    visor.position.set(0, 1.33, 0.22);
    bodyGroup.add(visor);

    if (role === 'player') {
      // Forward-facing Crimson Manager Cap Brim (Module 2.2.K)
      const brim = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.05, 0.26),
        new THREE.MeshLambertMaterial({ color: 0xe84118 })
      );
      brim.position.set(0, 1.44, 0.24);
      bodyGroup.add(brim);
    }

    // Flowing 3-Segment Cape (Module 2.2.F / 2.2.G)
    const capeGroup = new THREE.Group();
    capeGroup.position.set(0, 1.02, -0.26);
    const capeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.78, 0.04),
      new THREE.MeshLambertMaterial({ color: capeColor })
    );
    capeMesh.position.y = -0.36;
    const capeTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.09, 0.05),
      new THREE.MeshLambertMaterial({ color: accentColor })
    );
    capeTrim.position.y = -0.71;
    capeGroup.add(capeMesh, capeTrim);
    bodyGroup.add(capeGroup);

    // Arms (held forward when carrying items)
    const armGeo = new THREE.CylinderGeometry(0.075, 0.07, 0.45, 8);
    const armMat = new THREE.MeshLambertMaterial({ color: accentColor });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.32, 0.78, 0.12);
    leftArm.rotation.x = Math.PI / 3;
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.32, 0.78, 0.12);
    rightArm.rotation.x = Math.PI / 3;
    bodyGroup.add(leftArm, rightArm);

    // Back/Front Carry Stack Holder (Module 1.11 / 2.4.K)
    const stackHolder = new THREE.Group();
    stackHolder.position.set(0, 0.92, 0.46);
    bodyGroup.add(stackHolder);

    root.userData = {
      bodyGroup,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      capeGroup,
      stackHolder,
      stackMeshes: [],
      animTime: Math.random() * 10
    };

    return root;
  },

  // Build Sky-High 3D Green Cash Brick (Module 2.2.K & 2.2.I)
  createCashBrickMesh() {
    const brick = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.09, 0.28),
      new THREE.MeshLambertMaterial({ color: 0x2ecc71 })
    );
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.095, 0.29),
      new THREE.MeshLambertMaterial({ color: 0xfef08a })
    );
    brick.add(body, band);
    return brick;
  },

  // Build Orbiting Super Destroyer Starship (Module 2.1.G)
  createSuperDestroyerMesh() {
    const ship = new THREE.Group();
    const hullMat = new THREE.MeshLambertMaterial({ color: 0x263238 });
    const trimMat = new THREE.MeshLambertMaterial({ color: 0xfbc02d });

    const mainWedge = new THREE.Mesh(new THREE.ConeGeometry(2.6, 9.5, 4), hullMat);
    mainWedge.rotation.x = Math.PI / 2;
    mainWedge.rotation.z = Math.PI / 4;

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 2.4), hullMat);
    bridge.position.set(0, 0.8, -2.2);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 6.5), trimMat);
    stripe.position.set(0, -0.2, 0);

    const thruster = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.9, 0.5, 10),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    thruster.rotation.x = Math.PI / 2;
    thruster.position.set(0, 0, -4.8);

    ship.add(mainWedge, bridge, stripe, thruster);
    return ship;
  }
};
