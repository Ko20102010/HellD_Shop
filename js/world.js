/* ==========================================================================
   HELLDIVERS PLEASE! — Super Earth Logistics & War-Zone Tycoon (v0.0.01)
   js/world.js — CarbotAnimations Style Chibi Helldivers, Automatons & Props
   Inspired by CarbotAnimations "Pro vs Noobs | Helldivers 2 Ep7" (bn0GTO_zvAg)
   + Whiteout Survival Playable-Ad War Zone (Cryo-Pods, Braziers, Spore Drifts)
   ========================================================================== */

window.WorldBuilder = {
  // Build a stackable 3D Item Mesh for any of the 7 War Materiel types
  createItemMesh(itemType) {
    const group = new THREE.Group();
    const cfg = window.GAME_CONFIG.ITEMS[itemType] || window.GAME_CONFIG.ITEMS.cloth;

    if (itemType === 'cloth') {
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

  // CarbotAnimations Helldivers 2 Bean Character Rig (Video bn0GTO_zvAg)
  // Chubby cartoon bean/potato body, big glossy amber visor or Winged Hero Helmet, stubby waddling legs & flapping cape!
  createCharacterRig(role = 'player') {
    const root = new THREE.Group();

    let beanColor = 0x4b5563; // Carbot slate-grey bean suit
    let visorColor = 0xffb300; // Carbot glossy golden-orange visor
    let capeColor = 0x1f2937;
    let trimColor = 0xfbc02d;

    if (role === 'player') {
      beanColor = 0x3f4756; // Carbot Pro Helldiver dark slate
      visorColor = 0x1e293b; // Dark knight faceplate with glowing winged crest
      capeColor = 0x111827;
      trimColor = 0xfbc02d;
    } else if (role === 'seaf' || role === 'seaf_cashier') {
      beanColor = 0x0284c7; // SEAF Sky-Blue bean suit
      visorColor = 0xfffbeb;
      capeColor = 0x0369a1;
      trimColor = 0x7dd3fc;
    } else if (role === 'vip') {
      beanColor = 0x4c1d95;
      visorColor = 0xfef08a;
      capeColor = 0xb45309;
      trimColor = 0xfacc15;
    }

    // Cartoon ground shadow disc
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.54, 18),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    // Stubby Carbot Waddling Feet
    const legGeo = new THREE.CylinderGeometry(0.11, 0.12, 0.32, 10);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.18, 0.16, 0);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.18, 0.16, 0);
    bodyGroup.add(leftLeg, rightLeg);

    // Chubby Carbot Bean / Potato Body (Rounded bottom + dome head seamlessly merged!)
    // Black cartoon cel-outline shell (slightly larger back-facing or dark rim)
    const outlineBean = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.47, 0.88, 16),
      new THREE.MeshBasicMaterial({ color: 0x090d14 })
    );
    outlineBean.position.y = 0.66;
    bodyGroup.add(outlineBean);

    const mainBean = new THREE.Mesh(
      new THREE.CylinderGeometry(0.39, 0.44, 0.86, 16),
      new THREE.MeshLambertMaterial({ color: beanColor })
    );
    mainBean.position.y = 0.67;
    bodyGroup.add(mainBean);

    const domeHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.395, 16, 14),
      new THREE.MeshLambertMaterial({ color: beanColor })
    );
    domeHead.position.y = 1.09;
    bodyGroup.add(domeHead);

    // Big Rounded Carbot Visor on upper bean face
    const visorBorder = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.34, 0.24),
      new THREE.MeshBasicMaterial({ color: 0x090d14 })
    );
    visorBorder.position.set(0, 1.05, 0.26);
    bodyGroup.add(visorBorder);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.28, 0.26),
      new THREE.MeshBasicMaterial({ color: visorColor })
    );
    visor.position.set(0, 1.05, 0.27);
    bodyGroup.add(visor);

    // Carbot Glossy White Specular Shine Pill on top-left of visor (00:06 in video)
    const shine = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.07, 0.275),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    shine.position.set(-0.13, 1.12, 0.275);
    bodyGroup.add(shine);

    // If Player OR VIP: Add the iconic Carbot DP-40 Winged Helmet Crests (00:03 & 00:44 in video!)
    if (role === 'player' || role === 'vip') {
      [-1, 1].forEach((side) => {
        const wingGroup = new THREE.Group();
        wingGroup.position.set(side * 0.38, 1.18, 0.08);
        wingGroup.rotation.z = side * -0.28;

        // Outer dark wing fin
        const wingOuter = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.62, 0.22),
          new THREE.MeshLambertMaterial({ color: 0x1e293b })
        );
        // Glowing golden-orange inner edge (Carbot signature!)
        const wingGold = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.66, 0.24),
          new THREE.MeshBasicMaterial({ color: 0xffb300 })
        );
        wingGold.position.x = -side * 0.05;

        wingGroup.add(wingOuter, wingGold);
        bodyGroup.add(wingGroup);
      });
    }

    // Stubby Carbot Nubs / Arms holding a miniature Liberator Rifle on the right side
    const armGeo = new THREE.SphereGeometry(0.13, 10, 10);
    const armMat = new THREE.MeshLambertMaterial({ color: beanColor });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.44, 0.68, 0.18);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.44, 0.68, 0.18);
    bodyGroup.add(leftArm, rightArm);

    // Miniature Gun in right hand (for auto-firing in the War Zone!)
    const miniGun = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.14, 0.42),
      new THREE.MeshLambertMaterial({ color: 0x111827 })
    );
    miniGun.position.set(0.46, 0.68, 0.36);
    bodyGroup.add(miniGun);

    // Short Flapping Carbot Triangle/Trapezoid Cape on the back (00:06 & 00:20 in video)
    const capeGroup = new THREE.Group();
    capeGroup.position.set(0, 0.88, -0.38);
    const capeMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 0.68, 4),
      new THREE.MeshLambertMaterial({ color: capeColor })
    );
    capeMesh.rotation.y = Math.PI / 4;
    capeMesh.position.y = -0.28;
    const capeTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.07, 0.08),
      new THREE.MeshBasicMaterial({ color: trimColor })
    );
    capeTrim.position.set(0, -0.56, 0);
    capeGroup.add(capeMesh, capeTrim);
    bodyGroup.add(capeGroup);

    // Back-Stack Holder (Module 1.9: stacks items vertically on the back/overhead!)
    const stackHolder = new THREE.Group();
    stackHolder.position.set(0, 1.38, -0.18);
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

  // CarbotAnimations Automaton Bot & Hulk Boss Rig (00:14, 00:22, 00:41, 00:47 in video!)
  // Grey tin-can cylinder body + stick legs + oversized white cartoon skull head + 2 big glowing red eyes!
  createEnemyRig(type = 'automaton') {
    const root = new THREE.Group();

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(type === 'hulk' ? 0.85 : 0.48, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    if (type === 'hulk') {
      // Carbot Hulk Boss (00:16 & 00:41): Massive boxy dark-grey torso, white skull face, dual glowing orange blade/flamer arms!
      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 1.35, 0.95),
        new THREE.MeshLambertMaterial({ color: 0x374151 })
      );
      torso.position.y = 1.05;
      bodyGroup.add(torso);

      const vents = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.45, 1.0),
        new THREE.MeshBasicMaterial({ color: 0xff6d00 })
      );
      vents.position.set(0, 1.35, -0.05);
      bodyGroup.add(vents);

      const skull = new THREE.Mesh(
        new THREE.SphereGeometry(0.36, 14, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      skull.position.set(0, 1.22, 0.45);
      bodyGroup.add(skull);

      [-0.12, 0.12].forEach((ex) => {
        const eye = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xff1744 })
        );
        eye.position.set(ex, 1.24, 0.78);
        bodyGroup.add(eye);
      });

      // Dual Glowing Orange-Red Flame/Saw Arms (00:16 in video)
      [-0.82, 0.82].forEach((ax) => {
        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.32, 0.95),
          new THREE.MeshBasicMaterial({ color: 0xff3d00 })
        );
        arm.position.set(ax, 1.05, 0.35);
        bodyGroup.add(arm);
      });
    } else if (type === 'bug') {
      // Carbot Terminid Charger / Bug
      const carapace = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 10),
        new THREE.MeshLambertMaterial({ color: 0x4d7c0f })
      );
      carapace.scale.set(1.0, 0.7, 1.35);
      carapace.position.y = 0.48;
      const tail = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x84cc16 })
      );
      tail.position.set(0, 0.45, -0.55);
      bodyGroup.add(carapace, tail);
    } else {
      // Standard Carbot Automaton Trooper (00:22 & 00:47): Grey cylinder tin-can + white skull + 2 big red eyes!
      const canTorso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.26, 0.68, 12),
        new THREE.MeshLambertMaterial({ color: 0x64748b })
      );
      canTorso.position.y = 0.62;
      bodyGroup.add(canTorso);

      // Oversized White Cartoon Skull Head
      const skull = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 16, 14),
        new THREE.MeshBasicMaterial({ color: 0xf8fafc })
      );
      skull.position.y = 1.26;
      const jaw = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.22, 0.34),
        new THREE.MeshBasicMaterial({ color: 0xf8fafc })
      );
      jaw.position.set(0, 1.02, 0.06);
      bodyGroup.add(skull, jaw);

      // Two Big Glowing Red Dot Eyes (00:22 in video)
      [-0.13, 0.13].forEach((ex) => {
        const eye = new THREE.Mesh(
          new THREE.SphereGeometry(0.095, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0xff1744 })
        );
        eye.position.set(ex, 1.25, 0.33);
        bodyGroup.add(eye);
      });
    }

    root.userData = { bodyGroup, animTime: Math.random() * 10 };
    return root;
  },

  // Cryo-Frozen Helldiver Block + Thermal Brazier Beacon (Whiteout Survival Thawing Mechanic in Helldivers Style!)
  createCryoPodAndBrazierMesh() {
    const group = new THREE.Group();

    // Thermal Brazier Beacon on Left (-1.1, 0, 0)
    const brazierBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 0.75, 10),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    );
    brazierBase.position.set(-1.1, 0.38, 0);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.65, 8),
      new THREE.MeshBasicMaterial({ color: 0xff6d00 })
    );
    flame.position.set(-1.1, 0.95, 0);
    group.add(brazierBase, flame);

    // Frozen Helldiver inside Translucent Ice Block on Right (0.6, 0, 0)
    const innerHelldiver = this.createCharacterRig('customer');
    innerHelldiver.position.set(0.6, 0, 0);
    group.add(innerHelldiver);

    const iceBlock = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 1.85, 1.05),
      new THREE.MeshLambertMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.58
      })
    );
    iceBlock.position.set(0.6, 0.95, 0);
    group.add(iceBlock);

    // Green Trigger Pad in front of Brazier (-1.1, 0.03, 1.3)
    const pad = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.92, 20),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(-1.1, 0.03, 1.3);
    group.add(pad);

    group.userData = { iceBlock, innerHelldiver, flame };
    return group;
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
