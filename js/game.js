// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.04
// Module: Core 2D Factorio + Carbot Simulation, Raw -> Factory Recipe Process,
//         Manual Harvest Quarry + Expandable Drill Scale, 3-Layer Sequential Gates
//         (Gate 3 -> Gate 2 -> Gate 1), Main Character 4-Slot Loadout &
//         Live 12-Character Showcase Gallery (全角色圖鑑)
// ============================================================================

(function () {
  const CFG = window.GameConfig;

  class HelldiversFactorioGame {
    constructor() {
      const AudioCtor = window.SoundEngine || window.ProceduralAudioEngine;
      this.audio = AudioCtor ? new AudioCtor() : {
        playCash() {},
        playPickup() {},
        playUnlock() {},
        playLaser() {},
        playStratagem() {},
        toggle() { return true; }
      };
      this.canvasEl = document.getElementById('game-canvas');
      this.fxLayer = document.getElementById('world-labels');
      this.world = new window.WorldRenderer2D(this.canvasEl);

      // Persistent Forever State (NEVER lost on defeat!)
      this.medals = 3;
      this.foreverSkills = {};
      for (const sk of CFG.PERMANENT_SKILLS) {
        this.foreverSkills[sk.id] = 0;
      }

      // Main Character (主角色) Owned & Equipped Loadout (Persists across runs!)
      this.ownedEquipment = {
        w_liberator: true,
        a_standard: true,
        b_none: true,
        m_foot: true
      };
      this.equipped = {
        weapon: 'w_liberator',
        armor: 'a_standard',
        backpack: 'b_none',
        mount: 'm_foot'
      };

      // Initialize Run State
      this.initRunState();

      // Input state
      this.keys = {};
      this.joyVec = { x: 0, z: 0 };
      this.pointerTarget = null;
      this.sprintToggle = false;
      this.isDefeated = false;
      this.stratSeq = [];
      this.charPreviewCanvases = [];
      this.previewPhase = 0;

      // Timers
      this.transferCooldown = 0;
      this.harvestCooldown = 0;
      this.customerSpawnTimer = 0.6;
      this.cashierTimer = 0;
      this.enemySpawnTimer = 2.0;
      this.conveyorTickTimer = 0;
      this.rawPadCooldown = 0;
      this.gatePadCooldown = 0;
      this.armoryPadCooldown = 0;
      this.droneFireTimer = 0;
      this.stratagemCooldown = 0;
      this.stratagemBuffTimer = 0;

      // Load saved state
      this.loadGame();

      // Ensure starter setup has raw materials in hoppers & initial Guns/Cloth ready
      this.ensureStarterSetup();

      // Build Character Showcase Modal Cards (全角色動態預覽圖鑑)
      this.initCharacterShowcaseModal();

      // Bind UI & Input
      this.bindEvents();
      this.updateHUD();

      // Spawn immediate initial Helldivers (First customer ALWAYS orders 🔫 Gun!)
      this.spawnCustomer('gun');
      this.spawnCustomer('cloth');

      // Render first frame immediately so canvas is never black
      this.world.render(this, 0.016);
      this.renderCharacterShowcaseFrame(0.016);

      // Start 60FPS loop
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    // ========================================================================
    // INITIALIZE & ANIMATE 12-CHARACTER SHOWCASE MODAL (全角色預覽圖鑑)
    // ========================================================================
    initCharacterShowcaseModal() {
      const grid = document.getElementById('char-showcase-grid');
      if (!grid || !CFG.CHARACTER_ROSTER) return;
      grid.innerHTML = '';
      this.charPreviewCanvases = [];

      for (const ch of CFG.CHARACTER_ROSTER) {
        const card = document.createElement('div');
        card.className = 'char-card';
        card.innerHTML = `
          <div class="char-canvas-box">
            <canvas width="150" height="136"></canvas>
          </div>
          <div class="char-meta">
            <span class="char-badge" style="background:${ch.badgeColor || '#facc15'};">${ch.badge}</span>
            <div class="char-name-en">${ch.name}</div>
            <div class="char-name-zh">${ch.zhName}</div>
            <div class="char-stats-line">${ch.stats}</div>
            <p class="char-desc-text">${ch.desc}</p>
          </div>
        `;
        const cEl = card.querySelector('canvas');
        this.charPreviewCanvases.push({ canvas: cEl, def: ch });
        grid.appendChild(card);
      }
    }

    renderCharacterShowcaseFrame(dt) {
      const modal = document.getElementById('modal-characters');
      if (!modal || !modal.classList.contains('open')) return;
      this.previewPhase += dt;
      for (let i = 0; i < this.charPreviewCanvases.length; i++) {
        const item = this.charPreviewCanvases[i];
        this.world.renderCharacterPreviewCard(item.canvas, item.def, this.previewPhase + i * 0.35);
      }
    }

    // ========================================================================
    // MAIN CHARACTER EQUIPMENT HELPERS
    // ========================================================================
    getEquippedItems() {
      const eq = CFG.COMMANDER_EQUIPMENT;
      return {
        weapon: eq.weapon.find((w) => w.id === this.equipped.weapon) || eq.weapon[0],
        armor: eq.armor.find((a) => a.id === this.equipped.armor) || eq.armor[0],
        backpack: eq.backpack.find((b) => b.id === this.equipped.backpack) || eq.backpack[0],
        mount: eq.mount.find((m) => m.id === this.equipped.mount) || eq.mount[0]
      };
    }

    initRunState() {
      const grantLvl = this.foreverSkills?.perm_start_grant || 0;
      this.cash = 150 + grantLvl * 250;
      this.cashOnGround = 45;
      this.totalServed = 0;
      this.totalKills = 0;
      this.isDefeated = false;

      this.player = {
        x: -100,
        z: 220,
        walkPhase: 0,
        inventory: [],
        attackTimer: 0
      };

      this.rawExtractors = {};
      for (const raw of CFG.RAW_EXTRACTORS) {
        this.rawExtractors[raw.id] = {
          level: 1,
          stock: 6,
          maxBuffer: raw.baseBuffer,
          progress: 0,
          cycleTime: raw.baseCycleTime
        };
      }

      this.ammoPress = {
        inputStock: {
          raw_iron: (CFG.AMMO_PRESS.initialInput?.raw_iron || 8) + grantLvl * 4
        },
        stock: CFG.AMMO_PRESS.initialStock || 12,
        progress: 0,
        cycleTime: CFG.AMMO_PRESS.baseCycleTime
      };

      // Three Sequential Defense Gate Layers (Outer Gate 3 -> Middle Gate 2 -> Inner Gate 1)
      this.gates = {};
      const armorLvl = this.foreverSkills?.perm_gate_armor || 0;
      const hpMult = 1 + armorLvl * 0.4;
      for (const g of CFG.GATES) {
        const maxHp = Math.round(g.baseMaxHp * hpMult);
        this.gates[g.id] = {
          unlocked: true,
          defenseLevel: 1,
          hp: maxHp,
          maxHp: maxHp,
          ammo: g.initialAmmo,
          turretAngle: -Math.PI / 2,
          fireCooldown: 0,
          lastFireTime: -10,
          lastHitTime: -10
        };
      }

      this.conveyors = {};
      this.conveyorRemaining = {};
      for (const c of CFG.CONVEYORS) {
        this.conveyors[c.id] = false;
        this.conveyorRemaining[c.id] = c.cost;
      }

      this.unlocked = {};
      this.unlockRemaining = {};
      this.stations = {};
      this.counterBuffer = {};
      for (const item of CFG.ITEMS) {
        this.unlocked[item.id] = !!item.unlockedAtStart;
        this.unlockRemaining[item.id] = item.unlockCost;
        this.stations[item.id] = {
          inputStock: {
            raw_iron: (item.initialInput?.raw_iron || 0) + (item.recipe.raw_iron ? grantLvl * 4 : 0),
            raw_e710: (item.initialInput?.raw_e710 || 0) + (item.recipe.raw_e710 ? grantLvl * 4 : 0)
          },
          stock: item.unlockedAtStart ? (item.initialStock || 4) : 0,
          progress: 0,
          cycleTime: item.cycleTime
        };
        this.counterBuffer[item.id] = item.unlockedAtStart ? 3 : 0;
      }

      this.upgrades = {};
      for (const upg of CFG.UPGRADES) {
        this.upgrades[upg.id] = 0;
      }

      this.workers = [];
      this.customers = [];
      this.enemies = [];
      this.warDrops = [];
      this.flyingArcs = [];
      this.tracers = [];
      this.explosions = [];

      this.snowTiles = [];
      for (let gx = -1200; gx <= 1200; gx += 240) {
        for (let gz = -1700; gz <= -440; gz += 220) {
          this.snowTiles.push({ x: gx, z: gz, cleared: false, respawnTimer: 0 });
        }
      }

      this.cryoPods = [
        { id: 'west', x: CFG.LOCATIONS.brazierWest.x, z: CFG.LOCATIONS.brazierWest.z, fed: 0, needed: 3, rescued: false, cooldown: 0 },
        { id: 'east', x: CFG.LOCATIONS.brazierEast.x, z: CFG.LOCATIONS.brazierEast.z, fed: 0, needed: 3, rescued: false, cooldown: 0 }
      ];

      this.recalcDerivedStats();
      this.buildSolidObstacles();
    }

    ensureStarterSetup() {
      this.unlocked.cloth = true;
      this.unlocked.gun = true;

      for (const item of CFG.ITEMS) {
        if (!this.stations[item.id].inputStock) {
          this.stations[item.id].inputStock = {
            raw_iron: item.initialInput?.raw_iron || 6,
            raw_e710: item.initialInput?.raw_e710 || 6
          };
        }
      }
      if (!this.ammoPress.inputStock) {
        this.ammoPress.inputStock = { raw_iron: 8 };
      }

      if ((this.stations.gun?.stock || 0) < 2 && (this.counterBuffer.gun || 0) < 1) {
        this.stations.gun.stock = 4;
        this.stations.gun.inputStock.raw_iron = Math.max(6, this.stations.gun.inputStock.raw_iron || 0);
        this.counterBuffer.gun = 3;
      }
      if ((this.stations.cloth?.stock || 0) < 2 && (this.counterBuffer.cloth || 0) < 1) {
        this.stations.cloth.stock = 4;
        this.stations.cloth.inputStock.raw_e710 = Math.max(6, this.stations.cloth.inputStock.raw_e710 || 0);
        this.counterBuffer.cloth = 3;
      }

      // Give player starter Guns, Cloth, and Raw Iron so they can immediately sell & feed hoppers
      if (this.player.inventory.length === 0 && this.totalServed === 0) {
        const gunCfg = this.getItemConfig('gun');
        const clothCfg = this.getItemConfig('cloth');
        this.player.inventory.push(
          { id: 'gun', icon: gunCfg.icon, color: gunCfg.color },
          { id: 'gun', icon: gunCfg.icon, color: gunCfg.color },
          { id: 'cloth', icon: clothCfg.icon, color: clothCfg.color },
          { id: 'raw_iron', icon: '⛏️', color: '#38bdf8' },
          { id: 'raw_e710', icon: '🛢️', color: '#a855f7' }
        );
      }

      // Ensure all 3 gate layers exist and have valid defenseLevel
      for (const g of CFG.GATES) {
        if (!this.gates[g.id]) {
          this.gates[g.id] = {
            unlocked: true,
            defenseLevel: 1,
            hp: g.baseMaxHp,
            maxHp: g.baseMaxHp,
            ammo: g.initialAmmo,
            turretAngle: -Math.PI / 2,
            fireCooldown: 0,
            lastFireTime: -10,
            lastHitTime: -10
          };
        } else {
          this.gates[g.id].unlocked = true;
          if (!this.gates[g.id].defenseLevel) this.gates[g.id].defenseLevel = 1;
        }
      }

      this.syncWorkers();
      this.recalcDerivedStats();
      this.buildSolidObstacles();
    }

    hasStationIngredients(itemCfg, st) {
      if (!st || !st.inputStock) return false;
      const reqIron = itemCfg.recipe?.raw_iron || 0;
      const reqE710 = itemCfg.recipe?.raw_e710 || 0;
      return (st.inputStock.raw_iron || 0) >= reqIron && (st.inputStock.raw_e710 || 0) >= reqE710;
    }

    getItemConfig(id) {
      return CFG.ITEMS.find((i) => i.id === id);
    }

    getItemSellPrice(item) {
      const base = typeof item === 'object' ? item.sellPrice : (this.getItemConfig(item)?.sellPrice || 30);
      const permLvl = this.foreverSkills.perm_gun_value || 0;
      const eq = this.getEquippedItems();
      const armorBonus = eq.armor?.sellBonus || 0;
      const buff = this.stratagemBuffTimer > 0 ? 1.5 : 1.0;
      return Math.round(base * (1 + permLvl * 0.25 + armorBonus) * buff);
    }

    getPlayerMaxCapacity() {
      const rigLvl = this.upgrades.player_exo_rig || 0;
      const grantLvl = this.foreverSkills.perm_start_grant || 0;
      const eq = this.getEquippedItems();
      const eqBonus = (eq.armor?.bonusCap || 0) + (eq.backpack?.bonusCap || 0) + (eq.mount?.bonusCap || 0);
      return CFG.PLAYER.baseCapacity + rigLvl * 5 + grantLvl * 4 + eqBonus;
    }

    getPlayerMoveSpeed() {
      const bootLvl = this.upgrades.player_boots || 0;
      const eliteLvl = this.foreverSkills.perm_commander_elite || 0;
      const eq = this.getEquippedItems();
      const armorSpeed = eq.armor?.speedMult || 1.0;
      const mountSpeed = eq.mount?.speedMult || 1.0;
      const sprint = (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.sprintToggle) ? CFG.PLAYER.sprintMultiplier : 1.0;
      const strat = this.stratagemBuffTimer > 0 ? 1.35 : 1.0;
      return CFG.PLAYER.baseSpeed * (1 + bootLvl * 0.14) * (1 + eliteLvl * 0.15) * armorSpeed * mountSpeed * sprint * strat;
    }

    getRawUpgradeCost(rawId) {
      const rawCfg = CFG.RAW_EXTRACTORS.find((r) => r.id === rawId);
      const lvl = this.rawExtractors[rawId]?.level || 1;
      return Math.round(rawCfg.baseUpgradeCost * Math.pow(rawCfg.costScale, lvl - 1));
    }

    getGateUpgradeCost(gateId) {
      const gCfg = CFG.GATES.find((g) => g.id === gateId);
      const lvl = this.gates[gateId]?.defenseLevel || 1;
      return Math.round((gCfg?.baseUpgradeCost || 160) * Math.pow(1.55, lvl - 1));
    }

    recalcDerivedStats() {
      const rawUpgLvl = this.upgrades.raw_speed_boost || 0;
      const permRawLvl = this.foreverSkills.perm_raw_speed || 0;
      const factoryLvl = this.upgrades.factory_overclock || 0;
      const rawBeltBonus = this.conveyors.conv_raw_feed ? 1.4 : 1.0;
      const stratBonus = this.stratagemBuffTimer > 0 ? 2.0 : 1.0;

      for (const rawCfg of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[rawCfg.id];
        if (!rs) continue;
        rs.maxBuffer = rawCfg.baseBuffer + (rs.level - 1) * 8 + rawUpgLvl * 4;
        const speedMult = (1 + (rs.level - 1) * 0.38) * (1 + rawUpgLvl * 0.35) * (1 + permRawLvl * 0.35) * stratBonus;
        rs.cycleTime = Math.max(0.20, rawCfg.baseCycleTime / speedMult);
      }

      const avgRawLvl = ((this.rawExtractors.raw_iron?.level || 1) + (this.rawExtractors.raw_e710?.level || 1)) * 0.5;
      const ammoSpeedMult = (1 + (avgRawLvl - 1) * 0.25) * (1 + rawUpgLvl * 0.3) * (1 + permRawLvl * 0.35) * rawBeltBonus * stratBonus;
      this.ammoPress.cycleTime = Math.max(0.20, CFG.AMMO_PRESS.baseCycleTime / ammoSpeedMult);

      for (const item of CFG.ITEMS) {
        const st = this.stations[item.id];
        if (!st) continue;
        const linkedRawLvl = this.rawExtractors[item.rawType]?.level || 1;
        const prodSpeed = (1 + factoryLvl * 0.22) * (1 + (linkedRawLvl - 1) * 0.18) * rawBeltBonus * stratBonus;
        st.cycleTime = Math.max(0.25, item.cycleTime / prodSpeed);
      }

      const armorLvl = this.foreverSkills.perm_gate_armor || 0;
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs) continue;
        const defLvl = gs.defenseLevel || 1;
        const hpMult = (1 + armorLvl * 0.4) * (1 + (defLvl - 1) * 0.35);
        const newMax = Math.round(g.baseMaxHp * hpMult);
        if (newMax > gs.maxHp) {
          gs.hp += (newMax - gs.maxHp);
        }
        gs.maxHp = newMax;
      }
    }

    buildSolidObstacles() {
      const boxes = [];
      const W = CFG.WORLD;
      const cMinX = W.corridorMinX;
      const cMaxX = W.corridorMaxX;
      const halfOpen = W.gateOpeningWidth * 0.5;

      // Flanking canyon walls outside the Northern War Corridor
      boxes.push({ minX: W.minX, maxX: cMinX, minZ: W.minZ, maxZ: W.wallZ });
      boxes.push({ minX: cMaxX, maxX: W.maxX, minZ: W.minZ, maxZ: W.wallZ });

      // 3 Gate Layer Blast Walls (leaving the central gate doorway open for the player to walk through!)
      for (const g of CFG.GATES) {
        boxes.push({ minX: cMinX, maxX: -halfOpen - 10, minZ: g.z - 22, maxZ: g.z + 22 });
        boxes.push({ minX: halfOpen + 10, maxX: cMaxX, minZ: g.z - 22, maxZ: g.z + 22 });
      }

      // Raw Extractor Auto-Drill Rigs
      for (const raw of CFG.RAW_EXTRACTORS) {
        boxes.push({ minX: raw.x - 95, maxX: raw.x + 95, minZ: raw.z - 65, maxZ: raw.z + 65 });
      }

      // Munitions Press Machine
      const AP = CFG.AMMO_PRESS;
      boxes.push({ minX: AP.x - 54, maxX: AP.x + 54, minZ: AP.z - 54, maxZ: AP.z + 54 });

      // Unlocked Arsenal Fabricator Machines
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const p = item.stationPos;
        boxes.push({ minX: p.x - 52, maxX: p.x + 52, minZ: p.z - 52, maxZ: p.z + 52 });
      }

      // Quartermaster Counter Table
      const T = CFG.LOCATIONS.counterTable;
      boxes.push({
        minX: T.x - T.width * 0.45,
        maxX: T.x + T.width * 0.45,
        minZ: T.z - T.depth * 0.46,
        maxZ: T.z + T.depth * 0.46
      });

      this.obstacles = boxes;
    }

    moveWithCollision(entity, dx, dz, radius = 20) {
      const W = CFG.WORLD;
      const nx = Math.max(W.minX + 32, Math.min(W.maxX - 32, entity.x + dx));
      const nz = Math.max(W.minZ + 32, Math.min(W.maxZ - 32, entity.z + dz));

      let canX = true;
      for (const b of this.obstacles) {
        if (nx + radius > b.minX && nx - radius < b.maxX && entity.z + radius > b.minZ && entity.z - radius < b.maxZ) {
          canX = false;
          break;
        }
      }
      if (canX) entity.x = nx;

      let canZ = true;
      for (const b of this.obstacles) {
        if (entity.x + radius > b.minX && entity.x - radius < b.maxX && nz + radius > b.minZ && nz - radius < b.maxZ) {
          canZ = false;
          break;
        }
      }
      if (canZ) entity.z = nz;
    }

    loop(now) {
      const dt = Math.min(0.08, Math.max(0.001, (now - this.lastTime) / 1000));
      this.lastTime = now;

      if (!this.isDefeated) {
        this.update(dt);
      }
      this.world.render(this, dt);
      this.renderCharacterShowcaseFrame(dt);

      requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
      if (this.stratagemCooldown > 0) this.stratagemCooldown = Math.max(0, this.stratagemCooldown - dt);
      if (this.stratagemBuffTimer > 0) {
        this.stratagemBuffTimer = Math.max(0, this.stratagemBuffTimer - dt);
        if (this.stratagemBuffTimer === 0) this.recalcDerivedStats();
      }
      if (this.rawPadCooldown > 0) this.rawPadCooldown = Math.max(0, this.rawPadCooldown - dt);
      if (this.gatePadCooldown > 0) this.gatePadCooldown = Math.max(0, this.gatePadCooldown - dt);
      if (this.armoryPadCooldown > 0) this.armoryPadCooldown = Math.max(0, this.armoryPadCooldown - dt);
      if (this.harvestCooldown > 0) this.harvestCooldown = Math.max(0, this.harvestCooldown - dt);

      this.updatePlayerMovement(dt);
      this.updateRawAndAmmoProduction(dt);
      this.updateArsenalFactories(dt);
      this.updateConveyorAutomation(dt);
      this.updatePlayerInteractions(dt);
      this.updateWorkers(dt);
      this.updateCustomersAndSales(dt);
      this.updateWarZoneAndGates(dt);
      this.updateVisualEffects(dt);
      this.updateHUD();
    }

    updatePlayerMovement(dt) {
      let vx = this.joyVec.x;
      let vz = this.joyVec.z;

      if (this.keys['KeyW'] || this.keys['ArrowUp']) vz -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) vz += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) vx -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) vx += 1;

      if (vx !== 0 || vz !== 0) {
        this.pointerTarget = null;
        const len = Math.hypot(vx, vz);
        vx /= len;
        vz /= len;
      } else if (this.pointerTarget) {
        const dx = this.pointerTarget.x - this.player.x;
        const dz = this.pointerTarget.z - this.player.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 14) {
          vx = dx / dist;
          vz = dz / dist;
        } else {
          this.pointerTarget = null;
        }
      }

      if (vx !== 0 || vz !== 0) {
        const speed = this.getPlayerMoveSpeed();
        this.moveWithCollision(this.player, vx * speed * dt, vz * speed * dt, 20);
        this.player.walkPhase += dt * 12;
      }
    }

    // ========================================================================
    // RAW QUARRY AUTO-DRILLS & RECIPE-BASED PRODUCTION
    // ========================================================================
    updateRawAndAmmoProduction(dt) {
      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[raw.id];
        if (!rs) continue;
        if (rs.stock < rs.maxBuffer) {
          rs.progress += dt;
          if (rs.progress >= rs.cycleTime) {
            rs.progress = 0;
            // Higher Scale levels produce extra raw ore per cycle!
            const batch = 1 + Math.floor((rs.level - 1) / 2);
            rs.stock = Math.min(rs.maxBuffer, rs.stock + batch);
          }
        }
      }

      // Munitions Ammo Press requires 1x ⛏️ Iron in its Input Hopper!
      const apIn = this.ammoPress.inputStock;
      const reqIron = CFG.AMMO_PRESS.recipe.raw_iron || 1;
      if (this.ammoPress.stock < CFG.AMMO_PRESS.maxBuffer && (apIn.raw_iron || 0) >= reqIron) {
        this.ammoPress.progress += dt;
        if (this.ammoPress.progress >= this.ammoPress.cycleTime) {
          this.ammoPress.progress = 0;
          const saveChance = Math.min(0.45, (this.foreverSkills.perm_raw_speed || 0) * 0.04);
          if (Math.random() > saveChance) {
            apIn.raw_iron = Math.max(0, apIn.raw_iron - reqIron);
          }
          this.ammoPress.stock = Math.min(
            CFG.AMMO_PRESS.maxBuffer,
            this.ammoPress.stock + (CFG.AMMO_PRESS.outputBatch || 3)
          );
        }
      }
    }

    updateArsenalFactories(dt) {
      const saveChance = Math.min(0.45, (this.foreverSkills.perm_raw_speed || 0) * 0.04);
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const st = this.stations[item.id];
        if (!st) continue;
        if (st.stock < item.maxBuffer && this.hasStationIngredients(item, st)) {
          st.progress += dt;
          if (st.progress >= st.cycleTime) {
            st.progress = 0;
            if (Math.random() > saveChance) {
              if (item.recipe.raw_iron) {
                st.inputStock.raw_iron = Math.max(0, (st.inputStock.raw_iron || 0) - item.recipe.raw_iron);
              }
              if (item.recipe.raw_e710) {
                st.inputStock.raw_e710 = Math.max(0, (st.inputStock.raw_e710 || 0) - item.recipe.raw_e710);
              }
            }
            st.stock++;
          }
        }
      }
    }

    updateConveyorAutomation(dt) {
      this.conveyorTickTimer += dt;
      if (this.conveyorTickTimer < 0.42) return;
      this.conveyorTickTimer = 0;

      // 1. Raw Quarry -> All Factory & Ammo Input Hoppers Belt
      if (this.conveyors.conv_raw_feed) {
        const ironStock = this.rawExtractors.raw_iron;
        const e710Stock = this.rawExtractors.raw_e710;

        // Feed Ammo Press Hopper
        if (ironStock && ironStock.stock > 0 && (this.ammoPress.inputStock.raw_iron || 0) < 16) {
          ironStock.stock--;
          this.ammoPress.inputStock.raw_iron = (this.ammoPress.inputStock.raw_iron || 0) + 1;
        }

        // Feed Unlocked Item Factory Hoppers
        for (const item of CFG.ITEMS) {
          if (!this.unlocked[item.id]) continue;
          const st = this.stations[item.id];
          if (!st) continue;
          if (item.recipe.raw_iron && ironStock && ironStock.stock > 0 && (st.inputStock.raw_iron || 0) < 16) {
            ironStock.stock--;
            st.inputStock.raw_iron = (st.inputStock.raw_iron || 0) + 1;
          }
          if (item.recipe.raw_e710 && e710Stock && e710Stock.stock > 0 && (st.inputStock.raw_e710 || 0) < 16) {
            e710Stock.stock--;
            st.inputStock.raw_e710 = (st.inputStock.raw_e710 || 0) + 1;
          }
        }
      }

      // 2. Ammo Belts -> Gate Layer Turrets + Slow Auto-Repair
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs) continue;
        if (this.conveyors[g.conveyorId]) {
          if (gs.ammo < g.maxAmmo && this.ammoPress.stock > 0) {
            this.ammoPress.stock--;
            gs.ammo = Math.min(g.maxAmmo, gs.ammo + 3);
          }
          if (gs.hp < gs.maxHp) {
            gs.hp = Math.min(gs.maxHp, gs.hp + 6);
          }
        }
      }

      // 3. Factory Output -> Sales Counter Belt
      if (this.conveyors.conv_counter_auto) {
        for (const item of CFG.ITEMS) {
          if (!this.unlocked[item.id]) continue;
          const st = this.stations[item.id];
          if (st && st.stock > 0 && (this.counterBuffer[item.id] || 0) < 28) {
            st.stock--;
            this.counterBuffer[item.id] = (this.counterBuffer[item.id] || 0) + 1;
          }
        }
      }
    }

    // ========================================================================
    // PLAYER INTERACTIONS: MANUAL HARVEST, HOPPER FEEDING, SELLING & GATES
    // ========================================================================
    updatePlayerInteractions(dt) {
      const p = this.player;
      const L = CFG.LOCATIONS;
      const maxCap = this.getPlayerMaxCapacity();
      const eq = this.getEquippedItems();
      const harvestSpeedMult = eq.armor?.harvestMult || 1.0;

      // 1. Collect Cash Vault
      const distCash = Math.hypot(p.x - L.cashRegisterZone.x, p.z - L.cashRegisterZone.z);
      if (distCash < L.cashRegisterZone.radius && this.cashOnGround > 0) {
        const collect = this.cashOnGround;
        this.cash += collect;
        this.cashOnGround = 0;
        this.audio.playCash();
        this.spawnFloatingText(p.x, p.z - 30, `+$${collect} REQ`, '#4ade80');
      }

      // 2. Trash / Clear Stack
      const distTrash = Math.hypot(p.x - L.trashCanZone.x, p.z - L.trashCanZone.z);
      if (distTrash < L.trashCanZone.radius && p.inventory.length > 0) {
        p.inventory = [];
        this.audio.playPickup();
        this.spawnFloatingText(p.x, p.z - 25, '🗑️ STACK CLEARED', '#f87171');
      }

      // 3. Walk onto Armory Loadout Pad to open Equipment Modal
      const distArmory = Math.hypot(p.x - L.armoryLoadoutPad.x, p.z - L.armoryLoadoutPad.z);
      if (distArmory < L.armoryLoadoutPad.radius && this.armoryPadCooldown <= 0) {
        this.armoryPadCooldown = 4.5;
        this.renderLoadoutModal();
        document.getElementById('modal-loadout')?.classList.add('open');
      }

      // 4. Manual Harvest Quarry Veins (Walk inside ⛏️ Iron Vein or 🛢️ E-710 Field to harvest by hand!)
      if (this.harvestCooldown <= 0 && p.inventory.length < maxCap) {
        const harvestRangeBonus = eq.backpack?.autoHarvest ? 160 : 0;
        for (const raw of CFG.RAW_EXTRACTORS) {
          const hp = raw.harvestPos;
          const dVein = Math.hypot(p.x - hp.x, p.z - hp.z);
          if (dVein <= hp.radius + harvestRangeBonus) {
            p.inventory.push({ id: raw.id, icon: raw.itemIcon, color: raw.color });
            this.harvestCooldown = 0.22 / harvestSpeedMult;
            this.audio.playPickup();
            this.spawnArc(hp.x, hp.z, p.x, p.z - 20, raw.itemIcon, raw.color);
            this.spawnFloatingText(p.x, p.z - 35, `+1 ${raw.itemIcon} HARVESTED`, raw.color);
            break;
          }
        }
      }

      // 5. Expand Quarry Scale & Speed Pad
      if (this.rawPadCooldown <= 0) {
        for (const raw of CFG.RAW_EXTRACTORS) {
          const distRaw = Math.hypot(p.x - raw.padX, p.z - raw.padZ);
          if (distRaw < 88) {
            const cost = this.getRawUpgradeCost(raw.id);
            if (this.cash >= cost) {
              this.cash -= cost;
              this.rawExtractors[raw.id].level++;
              this.rawPadCooldown = 0.55;
              this.recalcDerivedStats();
              this.audio.playUnlock();
              this.spawnFloatingText(
                raw.x,
                raw.z - 45,
                `⬆️ ${raw.shortName} SCALE Lv.${this.rawExtractors[raw.id].level}!`,
                raw.color
              );
            }
          }
        }
      }

      // 6. Upgrade Gate Defense Level Pads
      if (this.gatePadCooldown <= 0) {
        for (const g of CFG.GATES) {
          const distUpg = Math.hypot(p.x - g.upgradePadX, p.z - g.upgradePadZ);
          if (distUpg < 88) {
            const cost = this.getGateUpgradeCost(g.id);
            if (this.cash >= cost) {
              this.cash -= cost;
              const gs = this.gates[g.id];
              gs.defenseLevel = (gs.defenseLevel || 1) + 1;
              this.gatePadCooldown = 0.55;
              this.recalcDerivedStats();
              gs.hp = gs.maxHp;
              this.audio.playUnlock();
              this.spawnFloatingText(g.x, g.z - 50, `🛡️ ${g.shortName} FORTIFIED Lv.${gs.defenseLevel}!`, g.color);
            }
          }
        }
      }

      this.transferCooldown -= dt;
      if (this.transferCooldown > 0) return;

      // 7. Direct Selling to Queued Helldivers
      for (const cust of this.customers) {
        if (cust.state === 'leaving') continue;
        const dCust = Math.hypot(p.x - cust.x, p.z - cust.z);
        if (dCust < 145) {
          const idx = p.inventory.findIndex((it) => it.id === cust.item.id);
          if (idx !== -1) {
            const soldEntry = p.inventory.splice(idx, 1)[0];
            this.transferCooldown = CFG.PLAYER.transferInterval;
            this.spawnArc(p.x, p.z - 20, cust.x, cust.z - 15, soldEntry.icon, soldEntry.color);
            this.completeCustomerItemReceive(cust, true);
            return;
          }
        }
      }

      // 8. Drop Finished Products onto Quartermaster Sales Counter
      const distCounter = Math.hypot(p.x - L.counterDropZone.x, p.z - L.counterDropZone.z);
      if (distCounter < L.counterDropZone.radius) {
        const idx = p.inventory.findIndex((it) => CFG.ITEMS.some((cfg) => cfg.id === it.id));
        if (idx !== -1) {
          const entry = p.inventory.splice(idx, 1)[0];
          this.counterBuffer[entry.id] = (this.counterBuffer[entry.id] || 0) + 1;
          this.transferCooldown = CFG.PLAYER.transferInterval;
          this.audio.playPickup();
          this.spawnArc(p.x, p.z - 20, L.counterTable.x, L.counterTable.z, entry.icon, entry.color);
          return;
        }
      }

      // 9. Pickup Raw Ore from Auto-Drill Output Pads
      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[raw.id];
        const distPickRaw = Math.hypot(p.x - raw.pickupX, p.z - raw.pickupZ);
        if (distPickRaw < 88 && rs && rs.stock > 0 && p.inventory.length < maxCap) {
          rs.stock--;
          p.inventory.push({ id: raw.id, icon: raw.itemIcon, color: raw.color });
          this.transferCooldown = CFG.PLAYER.transferInterval;
          this.audio.playPickup();
          this.spawnArc(raw.x, raw.z, p.x, p.z - 20, raw.itemIcon, raw.color);
          return;
        }
      }

      // 10. Feed Raw Iron into Munitions Ammo Press Input Hopper
      const AP = CFG.AMMO_PRESS;
      const distAmmoIn = Math.hypot(p.x - AP.inputPos.x, p.z - AP.inputPos.z);
      if (distAmmoIn < 92) {
        const ironIdx = p.inventory.findIndex((it) => it.id === 'raw_iron');
        if (ironIdx !== -1) {
          const entry = p.inventory.splice(ironIdx, 1)[0];
          this.ammoPress.inputStock.raw_iron = (this.ammoPress.inputStock.raw_iron || 0) + 1;
          this.transferCooldown = CFG.PLAYER.transferInterval;
          this.audio.playPickup();
          this.spawnArc(p.x, p.z - 20, AP.inputPos.x, AP.inputPos.z, entry.icon, entry.color);
          return;
        }
      }

      // 11. Pickup 🧱 Turret Ammo from Munitions Press Output Pad
      const distAmmoPickup = Math.hypot(p.x - AP.padX, p.z - AP.padZ);
      if (distAmmoPickup < 88 && this.ammoPress.stock > 0 && p.inventory.length < maxCap) {
        this.ammoPress.stock--;
        p.inventory.push({ id: 'ammo', icon: '🧱', color: '#f97316' });
        this.transferCooldown = CFG.PLAYER.transferInterval;
        this.audio.playPickup();
        this.spawnArc(AP.x, AP.z, p.x, p.z - 20, '🧱', '#f97316');
        return;
      }

      // 12. Feed Raw Materials (⛏️ Iron / 🛢️ E-710) into Factory Input Hoppers
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const st = this.stations[item.id];
        const distHopper = Math.hypot(p.x - item.inputPos.x, p.z - item.inputPos.z);
        if (distHopper < 92) {
          const rawIdx = p.inventory.findIndex(
            (it) => (it.id === 'raw_iron' && item.recipe.raw_iron) || (it.id === 'raw_e710' && item.recipe.raw_e710)
          );
          if (rawIdx !== -1) {
            const entry = p.inventory.splice(rawIdx, 1)[0];
            st.inputStock[entry.id] = (st.inputStock[entry.id] || 0) + 1;
            this.transferCooldown = CFG.PLAYER.transferInterval;
            this.audio.playPickup();
            this.spawnArc(p.x, p.z - 20, item.inputPos.x, item.inputPos.z, entry.icon, entry.color);
            return;
          }
        }
      }

      // 13. Pickup Finished Items from Factory Output Pads
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const st = this.stations[item.id];
        const distPick = Math.hypot(p.x - item.pickupPos.x, p.z - item.pickupPos.z);
        if (distPick < 88 && st.stock > 0 && p.inventory.length < maxCap) {
          st.stock--;
          p.inventory.push({ id: item.id, icon: item.icon, color: item.color });
          this.transferCooldown = CFG.PLAYER.transferInterval;
          this.audio.playPickup();
          this.spawnArc(item.stationPos.x, item.stationPos.z, p.x, p.z - 20, item.icon, item.color);
          return;
        }
      }

      // 14. Load 🧱 Ammo & Repair / Rebuild Gate Layers 3, 2, 1
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs) continue;
        const distPad = Math.hypot(p.x - g.ammoPadX, p.z - g.ammoPadZ);
        if (distPad < 95) {
          const ammoIdx = p.inventory.findIndex((it) => it.id === 'ammo');
          const ammoPerCrate = eq.backpack?.ammoBonus ? 5 : 3;
          if (ammoIdx !== -1 && gs.ammo < g.maxAmmo) {
            p.inventory.splice(ammoIdx, 1);
            gs.ammo = Math.min(g.maxAmmo, gs.ammo + ammoPerCrate);
            this.transferCooldown = CFG.PLAYER.transferInterval;
            this.audio.playPickup();
            this.spawnArc(p.x, p.z - 20, g.leftTurretX, g.turretZ, '🧱', '#f97316');
            this.spawnFloatingText(g.x, g.z - 32, `+${ammoPerCrate} 🧱 TURRET AMMO`, '#f97316');
            return;
          }
          if (gs.hp < gs.maxHp) {
            const wasBroken = gs.hp <= 0;
            const repairAmt = Math.round(40 * harvestSpeedMult * (eq.mount?.id === 'm_mech' ? 1.8 : 1.0));
            gs.hp = Math.min(gs.maxHp, gs.hp + repairAmt);
            this.transferCooldown = 0.18;
            this.spawnFloatingText(
              g.x,
              g.z - 38,
              wasBroken ? `🔧 ${g.shortName.toUpperCase()} REBUILT! (+${repairAmt} HP)` : `🔧 +${repairAmt} GATE HP`,
              '#4ade80'
            );
            return;
          }
        }
      }

      // 15. Unlock New Production Lines
      for (const item of CFG.ITEMS) {
        if (this.unlocked[item.id]) continue;
        const distUnlock = Math.hypot(p.x - item.unlockPos.x, p.z - item.unlockPos.z);
        if (distUnlock < 95 && this.cash > 0) {
          const step = Math.min(this.cash, this.unlockRemaining[item.id], Math.max(15, Math.ceil(item.unlockCost * 0.14)));
          this.cash -= step;
          this.unlockRemaining[item.id] -= step;
          this.transferCooldown = 0.05;
          this.audio.playPickup();
          if (this.unlockRemaining[item.id] <= 0) {
            this.unlocked[item.id] = true;
            this.stations[item.id].stock = item.initialStock || 2;
            this.stations[item.id].inputStock = {
              raw_iron: item.initialInput?.raw_iron || 6,
              raw_e710: item.initialInput?.raw_e710 || 6
            };
            this.counterBuffer[item.id] = 1;
            this.buildSolidObstacles();
            this.audio.playUnlock();
            this.spawnFloatingText(item.stationPos.x, item.stationPos.z - 45, `🎉 UNLOCKED ${item.shortName.toUpperCase()}!`, '#facc15');
          }
          return;
        }
      }

      // 16. Build Factorio Conveyor Belts
      for (const c of CFG.CONVEYORS) {
        if (this.conveyors[c.id]) continue;
        const distConv = Math.hypot(p.x - c.padX, p.z - c.padZ);
        if (distConv < 90 && this.cash > 0) {
          const step = Math.min(this.cash, this.conveyorRemaining[c.id], Math.max(15, Math.ceil(c.cost * 0.15)));
          this.cash -= step;
          this.conveyorRemaining[c.id] -= step;
          this.transferCooldown = 0.05;
          this.audio.playPickup();
          if (this.conveyorRemaining[c.id] <= 0) {
            this.conveyors[c.id] = true;
            this.recalcDerivedStats();
            this.audio.playUnlock();
            this.spawnFloatingText(c.padX, c.padZ - 35, `⚙️ CONVEYOR BELT ACTIVE!`, c.color);
          }
          return;
        }
      }

      // 17. Thaw Cryo-Frozen Helldivers in the War Zone
      for (const pod of this.cryoPods) {
        if (pod.rescued) continue;
        const dPod = Math.hypot(p.x - pod.x, p.z - pod.z);
        if (dPod < 95 && p.inventory.length > 0) {
          const dropped = p.inventory.pop();
          pod.fed++;
          this.transferCooldown = 0.12;
          this.spawnArc(p.x, p.z - 20, pod.x, pod.z, dropped.icon, dropped.color);
          if (pod.fed >= pod.needed) {
            pod.rescued = true;
            pod.cooldown = 35;
            this.upgrades.seaf_carrier = (this.upgrades.seaf_carrier || 0) + 1;
            this.syncWorkers();
            this.audio.playUnlock();
            this.spawnFloatingText(pod.x, pod.z - 40, `🥶 HELLDIVER THAWED -> +1 FREE SEAF!`, '#38bdf8');
          }
          return;
        }
      }
    }

    // ========================================================================
    // SEAF WORKERS: MINERS (⛏️), AMMO/GATE ENGINEERS (🧱), LOGISTICS (🪖)
    // ========================================================================
    syncWorkers() {
      const targetMiners = this.upgrades.seaf_miner || 0;
      const targetLogistics = this.upgrades.seaf_carrier || 0;
      const targetAmmo = this.upgrades.seaf_ammo_hauler || 0;

      const curMiners = this.workers.filter((w) => w.role === 'miner').length;
      const curLogistics = this.workers.filter((w) => w.role === 'logistics').length;
      const curAmmo = this.workers.filter((w) => w.role === 'ammo').length;

      for (let i = curMiners; i < targetMiners; i++) {
        this.workers.push({
          role: 'miner',
          x: -1150 + (i % 3) * 45,
          z: 420,
          walkPhase: i,
          inventory: []
        });
      }

      for (let i = curLogistics; i < targetLogistics; i++) {
        this.workers.push({
          role: 'logistics',
          x: 120 + (i % 3) * 45,
          z: 320,
          walkPhase: i,
          inventory: []
        });
      }

      for (let i = curAmmo; i < targetAmmo; i++) {
        this.workers.push({
          role: 'ammo',
          x: -480 + (i % 3) * 45,
          z: -140,
          walkPhase: i,
          inventory: []
        });
      }
    }

    updateWorkers(dt) {
      const speed = 205 * (1 + (this.foreverSkills.perm_commander_elite || 0) * 0.15);
      const L = CFG.LOCATIONS;
      const AP = CFG.AMMO_PRESS;

      for (const w of this.workers) {
        w.walkPhase += dt * 10;

        if (w.role === 'miner') {
          // SEAF Quarry Miner: Hauls ⛏️ Iron & 🛢️ E-710 from Quarry to Factory Hoppers
          if (w.inventory.length === 0) {
            // Find which raw material is most needed across unlocked stations
            let needIron = (this.ammoPress.inputStock.raw_iron || 0) < 6;
            let needE710 = false;
            for (const item of CFG.ITEMS) {
              if (!this.unlocked[item.id]) continue;
              const st = this.stations[item.id];
              if (item.recipe.raw_iron && (st.inputStock.raw_iron || 0) < 6) needIron = true;
              if (item.recipe.raw_e710 && (st.inputStock.raw_e710 || 0) < 6) needE710 = true;
            }
            const rawCfg = (needE710 && !needIron)
              ? CFG.RAW_EXTRACTORS[1]
              : (Math.random() < 0.55 ? CFG.RAW_EXTRACTORS[0] : CFG.RAW_EXTRACTORS[1]);

            const dx = rawCfg.pickupX - w.x;
            const dz = rawCfg.pickupZ - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const rs = this.rawExtractors[rawCfg.id];
              const take = Math.max(2, Math.min(4, rs.stock));
              rs.stock = Math.max(0, rs.stock - take);
              for (let k = 0; k < take; k++) {
                w.inventory.push({ id: rawCfg.id, icon: rawCfg.itemIcon, color: rawCfg.color });
              }
            }
          } else {
            const heldId = w.inventory[0].id;
            // Find station hopper needing heldId
            let targetPos = AP.inputPos;
            let targetHopper = this.ammoPress.inputStock;
            let bestCount = heldId === 'raw_iron' ? (this.ammoPress.inputStock.raw_iron || 0) : 999;

            for (const item of CFG.ITEMS) {
              if (!this.unlocked[item.id]) continue;
              if (!item.recipe[heldId]) continue;
              const st = this.stations[item.id];
              const cur = st.inputStock[heldId] || 0;
              if (cur < bestCount) {
                bestCount = cur;
                targetPos = item.inputPos;
                targetHopper = st.inputStock;
              }
            }

            const dx = targetPos.x - w.x;
            const dz = targetPos.z - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              targetHopper[heldId] = (targetHopper[heldId] || 0) + w.inventory.length;
              w.inventory = [];
            }
          }
        } else if (w.role === 'ammo') {
          // SEAF Ammo & Gate Engineer: Hauls 🧱 Ammo to Gate Layers 3, 2, 1 & Repairs Gates!
          if (w.inventory.length === 0) {
            const dx = AP.padX - w.x;
            const dz = AP.padZ - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 26) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else if (this.ammoPress.stock > 0) {
              const take = Math.min(4, this.ammoPress.stock);
              this.ammoPress.stock -= take;
              for (let k = 0; k < take; k++) {
                w.inventory.push({ id: 'ammo', icon: '🧱', color: '#f97316' });
              }
            }
          } else {
            let bestGate = this.getActiveFrontGate();
            let lowestScore = 999;
            for (const g of CFG.GATES) {
              const gs = this.gates[g.id];
              if (!gs) continue;
              const score = (gs.ammo / g.maxAmmo) + (gs.hp / gs.maxHp);
              if (score < lowestScore) {
                lowestScore = score;
                bestGate = g;
              }
            }
            const dx = bestGate.ammoPadX - w.x;
            const dz = bestGate.ammoPadZ - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const gs = this.gates[bestGate.id];
              if (gs) {
                gs.ammo = Math.min(bestGate.maxAmmo, gs.ammo + w.inventory.length * 3);
                gs.hp = Math.min(gs.maxHp, gs.hp + 45);
              }
              w.inventory = [];
            }
          }
        } else {
          // SEAF Logistics Trooper: Hauls finished goods to the Quartermaster Counter
          if (w.inventory.length === 0) {
            let chosen = null;
            for (const c of this.customers) {
              if (c.state !== 'leaving' && (this.stations[c.item.id]?.stock || 0) > 0) {
                chosen = c.item;
                break;
              }
            }
            if (!chosen) {
              const unlockedItems = CFG.ITEMS.filter((it) => this.unlocked[it.id] && (this.stations[it.id]?.stock || 0) > 0);
              if (unlockedItems.length > 0) {
                chosen = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
              }
            }
            if (!chosen) continue;

            const dx = chosen.pickupPos.x - w.x;
            const dz = chosen.pickupPos.z - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const st = this.stations[chosen.id];
              const take = Math.min(4, st.stock);
              st.stock -= take;
              for (let k = 0; k < take; k++) {
                w.inventory.push({ id: chosen.id, icon: chosen.icon, color: chosen.color });
              }
            }
          } else {
            const dx = L.counterDropZone.x - w.x;
            const dz = L.counterDropZone.z - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              for (const entry of w.inventory) {
                this.counterBuffer[entry.id] = (this.counterBuffer[entry.id] || 0) + 1;
              }
              w.inventory = [];
            }
          }
        }
      }
    }

    // ========================================================================
    // CUSTOMERS & SALES QUEUE
    // ========================================================================
    spawnCustomer(forcedItemId = null) {
      const maxQueue = 10;
      const activeCount = this.customers.filter((c) => c.state !== 'leaving').length;
      if (activeCount >= maxQueue) return;

      const unlockedItems = CFG.ITEMS.filter((it) => this.unlocked[it.id]);
      if (unlockedItems.length === 0) return;

      let chosenItem = null;
      if (forcedItemId) {
        chosenItem = this.getItemConfig(forcedItemId);
      }
      if (!chosenItem) {
        const gunItem = this.getItemConfig('gun');
        if (gunItem && Math.random() < 0.45) {
          chosenItem = gunItem;
        } else {
          chosenItem = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
        }
      }

      const qty = chosenItem.tier <= 2 ? (1 + Math.floor(Math.random() * 2)) : 1;
      const spawn = CFG.LOCATIONS.customerSpawn;

      this.customers.push({
        x: spawn.x,
        z: spawn.z + (Math.random() - 0.5) * 90,
        walkPhase: Math.random() * 6,
        item: chosenItem,
        qty: qty,
        received: 0,
        state: 'queueing',
        color: chosenItem.id === 'gun' ? '#0f172a' : '#1e293b'
      });
    }

    completeCustomerItemReceive(cust, directToWallet = false) {
      cust.received++;
      const unitPrice = this.getItemSellPrice(cust.item);
      if (directToWallet || (this.upgrades.seaf_cashier || 0) > 0) {
        this.cash += unitPrice;
        this.audio.playCash();
        this.spawnFloatingText(cust.x, cust.z - 48, `+$${unitPrice} ${cust.item.icon} SOLD!`, '#4ade80');
      } else {
        this.cashOnGround += unitPrice;
        this.audio.playCash();
        this.spawnFloatingText(cust.x, cust.z - 48, `+$${unitPrice} ${cust.item.icon}`, '#facc15');
      }

      if (cust.received >= cust.qty) {
        cust.state = 'leaving';
        this.totalServed++;
        if (this.totalServed % 5 === 0) {
          this.medals++;
          this.spawnFloatingText(cust.x, cust.z - 70, `🎖️ +1 ⭐ FOREVER MEDAL!`, '#fde047');
          this.saveGame();
        }
      }
    }

    updateCustomersAndSales(dt) {
      this.customerSpawnTimer -= dt;
      if (this.customerSpawnTimer <= 0) {
        this.customerSpawnTimer = 2.4;
        this.spawnCustomer();
      }

      const qStart = CFG.LOCATIONS.customerQueueStart;
      const activeCustomers = this.customers.filter((c) => c.state !== 'leaving');
      activeCustomers.forEach((c, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const tx = qStart.x + row * 88;
        const tz = qStart.z - 60 + col * 120;
        const dx = tx - c.x;
        const dz = tz - c.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 8) {
          c.x += (dx / dist) * 200 * dt;
          c.z += (dz / dist) * 200 * dt;
          c.walkPhase += dt * 10;
        }
      });

      const exit = CFG.LOCATIONS.customerExit;
      for (let i = this.customers.length - 1; i >= 0; i--) {
        const c = this.customers[i];
        if (c.state === 'leaving') {
          const dx = exit.x - c.x;
          const dz = exit.z - c.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 25) {
            this.customers.splice(i, 1);
          } else {
            c.x += (dx / dist) * 240 * dt;
            c.z += (dz / dist) * 240 * dt;
            c.walkPhase += dt * 12;
          }
        }
      }

      this.cashierTimer -= dt;
      if (this.cashierTimer <= 0) {
        const cashierSpeed = 0.26 / (1 + (this.upgrades.seaf_cashier || 0) * 0.5);
        for (const c of activeCustomers) {
          const itemId = c.item.id;
          if ((this.counterBuffer[itemId] || 0) > 0 && Math.abs(c.x - qStart.x) < 320) {
            this.counterBuffer[itemId]--;
            this.cashierTimer = cashierSpeed;
            this.spawnArc(CFG.LOCATIONS.counterTable.x, CFG.LOCATIONS.counterTable.z, c.x, c.z - 15, c.item.icon, c.item.color);
            this.completeCustomerItemReceive(c, false);
            break;
          }
        }
      }
    }

    // ========================================================================
    // 3-LAYER SEQUENTIAL GATE SIEGE (OUTER GATE 3 -> MIDDLE GATE 2 -> INNER GATE 1)
    // ========================================================================
    getActiveFrontGate() {
      // Order: Outer Gate 3 (z=-1320) -> Middle Gate 2 (z=-840) -> Inner Gate 1 (z=-360)
      const g3 = CFG.GATES.find((g) => g.id === 'gate_3');
      const g2 = CFG.GATES.find((g) => g.id === 'gate_2');
      const g1 = CFG.GATES.find((g) => g.id === 'gate_1');
      if (this.gates.gate_3 && this.gates.gate_3.hp > 0) return g3;
      if (this.gates.gate_2 && this.gates.gate_2.hp > 0) return g2;
      return g1;
    }

    updateWarZoneAndGates(dt) {
      // Permanent Skill: Automatic Gate Self-Repair
      const armorLvl = this.foreverSkills.perm_gate_armor || 0;
      if (armorLvl > 0) {
        for (const g of CFG.GATES) {
          const gs = this.gates[g.id];
          if (gs && gs.hp > 0 && gs.hp < gs.maxHp) {
            gs.hp = Math.min(gs.maxHp, gs.hp + armorLvl * 8 * dt);
          }
        }
      }

      // Spawn Enemy Waves at the Northern Drop Zone (z = -1850)
      this.enemySpawnTimer -= dt;
      if (this.enemySpawnTimer <= 0 && this.enemies.length < 14) {
        this.enemySpawnTimer = 2.6;
        const roll = Math.random();
        let type = 'trooper';
        let hp = 95;
        let dmg = 12;
        let speed = 82;
        if (roll > 0.80) {
          type = 'hulk';
          hp = 310;
          dmg = 24;
          speed = 56;
        } else if (roll > 0.45) {
          type = 'bug';
          hp = 80;
          dmg = 9;
          speed = 112;
        }
        this.enemies.push({
          type,
          x: (Math.random() - 0.5) * 520,
          z: CFG.WORLD.minZ + 80 + Math.random() * 120,
          hp,
          maxHp: hp,
          dmg,
          speed,
          attackCooldown: 0
        });
      }

      // Enemies ALWAYS target the current outermost unbroken Gate Layer (Gate 3 -> Gate 2 -> Gate 1)
      const activeGateCfg = this.getActiveFrontGate();
      const activeGateState = this.gates[activeGateCfg.id];

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        const targetX = Math.max(-140, Math.min(140, e.x * 0.6));
        const targetZ = activeGateCfg.z - 28;
        const dx = targetX - e.x;
        const dz = targetZ - e.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 34) {
          e.x += (dx / dist) * e.speed * dt;
          e.z += (dz / dist) * e.speed * dt;
        } else if (activeGateState) {
          e.attackCooldown -= dt;
          if (e.attackCooldown <= 0) {
            e.attackCooldown = 1.05;
            const prevHp = activeGateState.hp;
            activeGateState.hp = Math.max(0, activeGateState.hp - e.dmg);
            activeGateState.lastHitTime = this.world.time;
            this.spawnFloatingText(activeGateCfg.x, activeGateCfg.z - 38, `-${e.dmg} 🛡️ ${activeGateCfg.shortName}`, '#ef4444');

            if (prevHp > 0 && activeGateState.hp <= 0) {
              this.world.triggerCameraShake(14, 0.45);
              if (activeGateCfg.id === 'gate_1') {
                // Inner Gate 1 reached 0 HP -> DEFEAT!
                this.triggerGateDefeat(activeGateCfg);
                return;
              } else {
                // Outer Gate 3 or Middle Gate 2 was breached -> Enemies advance to the next layer!
                const nextName = activeGateCfg.id === 'gate_3' ? 'MIDDLE GATE 2' : 'INNER GATE 1';
                this.spawnFloatingText(
                  activeGateCfg.x,
                  activeGateCfg.z - 65,
                  `💥 ${activeGateCfg.shortName.toUpperCase()} BREACHED! ENEMIES ADVANCING TO ${nextName}!`,
                  '#f97316'
                );
              }
            }
          }
        }
      }

      // Dual Sentry Turrets on all 3 Gate Layers
      const turretPwrLvl = this.foreverSkills.perm_turret_power || 0;
      const freeAmmoChance = Math.min(0.6, turretPwrLvl * 0.08);

      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs) continue;
        gs.fireCooldown = Math.max(0, gs.fireCooldown - dt);
        if (gs.ammo <= 0 || gs.fireCooldown > 0) continue;

        const defLvl = gs.defenseLevel || 1;
        const turretDmgMult = (1 + turretPwrLvl * 0.35) * (1 + (defLvl - 1) * 0.25);

        // Both Left & Right Sentry Turrets scan for enemies in range
        const mounts = [
          { x: g.leftTurretX, z: g.turretZ },
          { x: g.rightTurretX, z: g.turretZ }
        ];
        let firedThisTick = false;

        for (const m of mounts) {
          let closest = null;
          let bestDist = g.turretRange;
          for (const e of this.enemies) {
            if (e.hp <= 0) continue;
            const d = Math.hypot(e.x - m.x, e.z - m.z);
            if (d < bestDist) {
              bestDist = d;
              closest = e;
            }
          }

          if (closest) {
            gs.turretAngle = Math.atan2(closest.z - m.z, closest.x - m.x);
            firedThisTick = true;
            const dmg = Math.round(g.turretDamage * turretDmgMult);
            closest.hp -= dmg;
            this.tracers.push({
              sx: m.x,
              sz: m.z,
              tx: closest.x,
              tz: closest.z,
              color: g.color,
              width: 4,
              t: 0,
              duration: 0.09
            });
            if (closest.hp <= 0) {
              this.handleEnemyKilled(closest);
            }
          }
        }

        if (firedThisTick) {
          gs.fireCooldown = g.turretFireRate;
          gs.lastFireTime = this.world.time;
          if (Math.random() > freeAmmoChance) {
            gs.ammo = Math.max(0, gs.ammo - 1);
          }
          this.audio.playLaser();
        }
      }

      // Main Character Personal Weapon & Mount Attack + Guard Dog Rover Drone
      const eq = this.getEquippedItems();
      const wep = eq.weapon;
      const mount = eq.mount;
      const eliteLvl = this.foreverSkills.perm_commander_elite || 0;

      this.player.attackTimer = Math.max(0, this.player.attackTimer - dt);
      if (this.player.attackTimer <= 0 && this.enemies.length > 0) {
        let target = null;
        let minDist = CFG.PLAYER.attackRange;
        for (const e of this.enemies) {
          if (e.hp <= 0) continue;
          const d = Math.hypot(e.x - this.player.x, e.z - this.player.z);
          if (d < minDist) {
            minDist = d;
            target = e;
          }
        }
        if (target) {
          this.player.attackTimer = CFG.PLAYER.attackCooldown / (wep.fireRateMult || 1.0);
          const pellets = wep.pelletCount || 1;
          const perPelletDmg = Math.round(
            CFG.PLAYER.attackDamage * (wep.damageMult || 1.0) * (mount.damageMult || 1.0) * (1 + eliteLvl * 0.35)
          );

          for (let pIdx = 0; pIdx < pellets; pIdx++) {
            target.hp -= perPelletDmg;
            const spreadX = (pIdx - (pellets - 1) * 0.5) * 14;
            this.tracers.push({
              sx: this.player.x,
              sz: this.player.z - 14,
              tx: target.x + spreadX,
              tz: target.z,
              color: wep.tracerColor || '#38bdf8',
              width: wep.explosive ? 6 : 3.5,
              t: 0,
              duration: 0.09
            });
          }
          if (wep.explosive || mount.id === 'm_mech') {
            this.explosions.push({ x: target.x, z: target.z, maxR: 48, t: 0, duration: 0.22 });
          }
          this.audio.playLaser();
          if (target.hp <= 0) {
            this.handleEnemyKilled(target);
          }
        }
      }

      // Orbiting Guard Dog Laser Drone Auto-Fire
      if (eq.backpack?.hasDrone && this.enemies.length > 0) {
        this.droneFireTimer = Math.max(0, this.droneFireTimer - dt);
        if (this.droneFireTimer <= 0) {
          let dTarget = null;
          let dMin = 340;
          for (const e of this.enemies) {
            if (e.hp <= 0) continue;
            const d = Math.hypot(e.x - this.player.x, e.z - this.player.z);
            if (d < dMin) {
              dMin = d;
              dTarget = e;
            }
          }
          if (dTarget) {
            this.droneFireTimer = 0.25;
            const droneDmg = Math.round(22 * (1 + eliteLvl * 0.35));
            dTarget.hp -= droneDmg;
            const dx = this.player.x + Math.cos(this.world.time * 3.2) * 52;
            const dz = this.player.z - 28 + Math.sin(this.world.time * 3.2) * 26;
            this.tracers.push({
              sx: dx,
              sz: dz,
              tx: dTarget.x,
              tz: dTarget.z,
              color: '#facc15',
              width: 2.5,
              t: 0,
              duration: 0.08
            });
            if (dTarget.hp <= 0) {
              this.handleEnemyKilled(dTarget);
            }
          }
        }
      }

      this.enemies = this.enemies.filter((e) => e.hp > 0);

      for (const s of this.snowTiles) {
        if (s.cleared) {
          s.respawnTimer -= dt;
          if (s.respawnTimer <= 0) s.cleared = false;
        } else if (Math.hypot(this.player.x - s.x, this.player.z - s.z) < CFG.PLAYER.plowRadius) {
          s.cleared = true;
          s.respawnTimer = 28;
          this.cash += 10;
          this.spawnFloatingText(s.x, s.z, `+$10 ⛏️ ORE`, '#38bdf8');
        }
      }

      for (let i = this.warDrops.length - 1; i >= 0; i--) {
        const d = this.warDrops[i];
        if (Math.hypot(this.player.x - d.x, this.player.z - d.z) < 85) {
          this.warDrops.splice(i, 1);
          this.cash += d.cashValue || 35;
          if (d.medalValue) {
            this.medals += d.medalValue;
            this.spawnFloatingText(d.x, d.z - 20, `+${d.medalValue} ⭐ FOREVER MEDAL!`, '#fde047');
          } else {
            this.spawnFloatingText(d.x, d.z - 20, `+$${d.cashValue} ${d.icon}`, '#4ade80');
          }
          this.audio.playCash();
        }
      }

      for (const pod of this.cryoPods) {
        if (pod.rescued) {
          pod.cooldown -= dt;
          if (pod.cooldown <= 0) {
            pod.rescued = false;
            pod.fed = 0;
          }
        }
      }
    }

    handleEnemyKilled(enemy) {
      this.totalKills++;
      const isHulk = enemy.type === 'hulk';
      this.explosions.push({
        x: enemy.x,
        z: enemy.z,
        maxR: isHulk ? 68 : 36,
        t: 0,
        duration: 0.3
      });
      this.warDrops.push({
        id: Math.random(),
        x: enemy.x,
        z: enemy.z,
        icon: isHulk ? '⭐' : '🛢️',
        color: isHulk ? '#facc15' : '#a855f7',
        cashValue: isHulk ? 95 : 35,
        medalValue: isHulk ? 1 : 0
      });
    }

    triggerGateDefeat(breachedGate) {
      this.isDefeated = true;
      const bonusMedals = Math.max(1, Math.floor(this.totalServed / 4) + Math.floor(this.totalKills / 5));
      this.medals += bonusMedals;
      this.saveGame();
      this.world.triggerCameraShake(18, 0.6);

      const summaryEl = document.getElementById('defeat-summary-text');
      if (summaryEl) {
        summaryEl.innerHTML = `
          All 3 Defense Layers (Outer Gate 3 ➔ Middle Gate 2 ➔ <strong>${breachedGate.name}</strong>) were breached by Automaton forces!<br><br>
          📊 <strong>Run Summary:</strong> Served <strong>${this.totalServed} Helldivers</strong> &amp; eliminated <strong>${this.totalKills} Enemies</strong>.<br>
          🎖️ <strong>Evacuated Reward:</strong> Earned <strong>+${bonusMedals} ⭐ Forever Warbond Medals</strong> (Total: <strong>${this.medals} ⭐</strong>).<br>
          🌟 <strong>All Permanent Skill Tree upgrades &amp; Commander Loadout Gear are 100% preserved forever!</strong>
        `;
      }
      document.getElementById('modal-defeat')?.classList.add('open');
      this.updateHUD();
    }

    redeployAfterDefeat() {
      document.getElementById('modal-defeat')?.classList.remove('open');
      this.initRunState();
      this.ensureStarterSetup();
      this.spawnCustomer('gun');
      this.spawnCustomer('cloth');
      this.saveGame();
      this.updateHUD();
      this.spawnFloatingText(this.player.x, this.player.z - 40, '🦅 NEW HELLPOD DEPLOYED — FOREVER SKILLS & LOADOUT ACTIVE!', '#facc15');
    }

    spawnArc(sx, sz, tx, tz, icon, color) {
      this.flyingArcs.push({ sx, sz, tx, tz, icon, color, t: 0, duration: 0.24 });
    }

    updateVisualEffects(dt) {
      for (let i = this.flyingArcs.length - 1; i >= 0; i--) {
        this.flyingArcs[i].t += dt;
        if (this.flyingArcs[i].t >= this.flyingArcs[i].duration) {
          this.flyingArcs.splice(i, 1);
        }
      }
      for (let i = this.tracers.length - 1; i >= 0; i--) {
        this.tracers[i].t += dt;
        if (this.tracers[i].t >= this.tracers[i].duration) {
          this.tracers.splice(i, 1);
        }
      }
      for (let i = this.explosions.length - 1; i >= 0; i--) {
        this.explosions[i].t += dt;
        if (this.explosions[i].t >= this.explosions[i].duration) {
          this.explosions.splice(i, 1);
        }
      }
    }

    spawnFloatingText(wx, wz, text, color = '#facc15') {
      if (!this.fxLayer) return;
      const screen = this.world.worldToScreen(wx, wz);
      const el = document.createElement('div');
      el.className = 'floating-text';
      el.style.left = `${screen.x}px`;
      el.style.top = `${screen.y}px`;
      el.style.color = color;
      el.textContent = text;
      this.fxLayer.appendChild(el);
      setTimeout(() => el.remove(), 1150);
    }

    trigger500kgStratagem() {
      if (this.stratagemCooldown > 0) {
        this.spawnFloatingText(this.player.x, this.player.z - 35, `⏳ 500KG COOLDOWN (${Math.ceil(this.stratagemCooldown)}s)`, '#f87171');
        return;
      }
      this.stratagemCooldown = 18;
      this.stratagemBuffTimer = 10;
      this.recalcDerivedStats();
      this.audio.playStratagem();
      this.world.triggerCameraShake(16, 0.5);

      for (const e of this.enemies) {
        e.hp -= 240;
        this.explosions.push({ x: e.x, z: e.z, maxR: 95, t: 0, duration: 0.45 });
        if (e.hp <= 0) this.handleEnemyKilled(e);
      }
      this.enemies = this.enemies.filter((e) => e.hp > 0);

      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (gs) {
          gs.hp = Math.min(gs.maxHp, gs.hp + 300);
          gs.ammo = g.maxAmmo;
          this.explosions.push({ x: g.x, z: g.z - 60, maxR: 130, t: 0, duration: 0.5 });
        }
      }
      this.spawnFloatingText(this.player.x, this.player.z - 45, '🦅 500KG DROPPED! ALL 3 GATE LAYERS REPAIRED & 2X FACTORY BOOST!', '#facc15');
    }

    updateHUD() {
      const verEl = document.getElementById('hud-version');
      if (verEl) verEl.textContent = CFG.VERSION;

      const cashEl = document.getElementById('hud-cash');
      if (cashEl) cashEl.textContent = `$${Math.floor(this.cash)}`;

      const medalEl = document.getElementById('hud-medals');
      if (medalEl) medalEl.textContent = `${this.medals}`;

      const carryEl = document.getElementById('hud-carry');
      if (carryEl) carryEl.textContent = `${this.player.inventory.length}`;

      const carryMaxEl = document.getElementById('hud-carry-max');
      if (carryMaxEl) carryMaxEl.textContent = `${this.getPlayerMaxCapacity()}`;

      const seafEl = document.getElementById('hud-seaf');
      if (seafEl) seafEl.textContent = `${this.workers.length}`;

      const servedEl = document.getElementById('hud-served');
      if (servedEl) servedEl.textContent = `${this.totalServed}`;

      // Update inventory badges (including raw_iron & raw_e710!)
      const rawIronBadge = document.getElementById('inv-badge-raw_iron');
      if (rawIronBadge) {
        const c = this.player.inventory.filter((it) => it.id === 'raw_iron').length;
        rawIronBadge.textContent = `⛏️ ${c}`;
      }
      const rawE710Badge = document.getElementById('inv-badge-raw_e710');
      if (rawE710Badge) {
        const c = this.player.inventory.filter((it) => it.id === 'raw_e710').length;
        rawE710Badge.textContent = `🛢️ ${c}`;
      }

      for (const item of CFG.ITEMS) {
        const badge = document.getElementById(`inv-badge-${item.id}`);
        if (badge) {
          const count = this.player.inventory.filter((it) => it.id === item.id).length;
          badge.textContent = `${item.icon} ${count}`;
        }
      }

      // Show 3-Layer Gate Status in HUD
      const gateEl = document.getElementById('hud-gates-hp');
      if (gateEl) {
        const p3 = Math.round(((this.gates.gate_3?.hp || 0) / (this.gates.gate_3?.maxHp || 1)) * 100);
        const p2 = Math.round(((this.gates.gate_2?.hp || 0) / (this.gates.gate_2?.maxHp || 1)) * 100);
        const p1 = Math.round(((this.gates.gate_1?.hp || 0) / (this.gates.gate_1?.maxHp || 1)) * 100);
        gateEl.textContent = `G3:${p3}% G2:${p2}% G1:${p1}%`;
        gateEl.style.color = p1 > 50 ? '#4ade80' : (p1 > 25 ? '#facc15' : '#ef4444');

        const objEl = document.getElementById('objective-text');
        if (objEl) {
          if (p3 === 0 && p2 === 0) {
            objEl.textContent = `🚨 CRITICAL: Outer Gate 3 & Middle Gate 2 breached! Repair INNER GATE 1 (${p1}% HP) now or call 🦅 500KG BOOST!`;
          } else if (p3 === 0) {
            objEl.textContent = `⚠️ Outer Gate 3 breached! Enemies attacking MIDDLE GATE 2 (${p2}% HP) — stand on Gate 3 Pad to rebuild!`;
          } else {
            objEl.textContent = `DIRECTIVE: Harvest ⛏️ Iron & 🛢️ E-710 in Sector A ➔ Feed Factory Input Hoppers ➔ Sell 🔫 Guns ($${this.getItemSellPrice('gun')}) & defend Gate 3 ➔ Gate 2 ➔ Gate 1!`;
          }
        }
      }
    }

    // ========================================================================
    // MAIN CHARACTER 4-SLOT EQUIPMENT & LOADOUT MODAL (🛡️ 裝備 Loadout)
    // ========================================================================
    renderLoadoutModal() {
      const cashSpan = document.getElementById('loadout-modal-cash');
      if (cashSpan) cashSpan.textContent = `$${Math.floor(this.cash)}`;

      const grid = document.getElementById('loadout-grid');
      if (!grid) return;
      grid.innerHTML = '';

      const categories = [
        { key: 'weapon', title: '🔫 PRIMARY WEAPON (主武器)' },
        { key: 'armor', title: '🦺 TACTICAL ARMOR (戰術裝甲)' },
        { key: 'backpack', title: '🛸 BACKPACK & GUARD DOG DRONE (背包與無人機)' },
        { key: 'mount', title: '🤖 COMBAT MOUNT / EXOSUIT (騎乘載具與機甲)' }
      ];

      for (const cat of categories) {
        const items = CFG.COMMANDER_EQUIPMENT[cat.key] || [];
        for (const eqItem of items) {
          const isOwned = !!this.ownedEquipment[eqItem.id];
          const isEquipped = this.equipped[cat.key] === eqItem.id;
          const canBuy = !isOwned && this.cash >= eqItem.cost;

          const card = document.createElement('div');
          card.className = 'upgrade-item';
          if (isEquipped) {
            card.style.borderColor = '#facc15';
            card.style.background = 'rgba(250, 204, 21, 0.14)';
          }
          card.innerHTML = `
            <div class="upgrade-info">
              <div style="font-size:0.7rem;color:#38bdf8;font-weight:700;">${cat.title}</div>
              <h4>${eqItem.icon} ${eqItem.name} <span style="color:#fde047;font-size:0.78rem;">(${eqItem.zhName})</span></h4>
              <p>${eqItem.desc}</p>
            </div>
            <button class="buy-btn ${isEquipped ? 'medal-btn' : ''}" ${(!isOwned && !canBuy) ? 'disabled' : ''}>
              ${isEquipped ? '✅ EQUIPPED' : (isOwned ? '🛡️ EQUIP' : `🔓 $${eqItem.cost}`)}
            </button>
          `;
          card.querySelector('button').addEventListener('click', () => {
            if (isOwned) {
              this.equipped[cat.key] = eqItem.id;
              this.recalcDerivedStats();
              this.saveGame();
              this.audio.playPickup();
              this.renderLoadoutModal();
              this.updateHUD();
              this.spawnFloatingText(this.player.x, this.player.z - 40, `🛡️ EQUIPPED ${eqItem.name.toUpperCase()}!`, '#facc15');
            } else if (this.cash >= eqItem.cost) {
              this.cash -= eqItem.cost;
              this.ownedEquipment[eqItem.id] = true;
              this.equipped[cat.key] = eqItem.id;
              this.recalcDerivedStats();
              this.saveGame();
              this.audio.playUnlock();
              this.renderLoadoutModal();
              this.updateHUD();
              this.spawnFloatingText(this.player.x, this.player.z - 40, `🎉 UNLOCKED & EQUIPPED ${eqItem.name.toUpperCase()}!`, '#4ade80');
            }
          });
          grid.appendChild(card);
        }
      }
    }

    renderUpgradesModal() {
      const list = document.getElementById('upgrades-list');
      if (!list) return;
      list.innerHTML = '';

      // 1. Quarry Scale & Speed Upgrades
      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[raw.id];
        const cost = this.getRawUpgradeCost(raw.id);
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4>${raw.icon} ${raw.name} (Scale Lv.${rs.level})</h4>
            <p>${raw.desc} Current cycle: ${rs.cycleTime.toFixed(2)}s | Buffer: ${rs.maxBuffer}</p>
          </div>
          <button class="buy-btn" ${this.cash < cost ? 'disabled' : ''}>
            ⬆️ Scale $${cost}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (this.cash >= cost) {
            this.cash -= cost;
            rs.level++;
            this.recalcDerivedStats();
            this.audio.playUnlock();
            this.renderUpgradesModal();
            this.updateHUD();
          }
        });
        list.appendChild(card);
      }

      // 2. 3-Layer Gate Defense Fortification Upgrades
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        const cost = this.getGateUpgradeCost(g.id);
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4>🛡️ ${g.name} (Defense Lv.${gs.defenseLevel || 1})</h4>
            <p>${g.desc} Max HP: ${gs.maxHp} | Repairs Gate to 100%!</p>
          </div>
          <button class="buy-btn" ${this.cash < cost ? 'disabled' : ''}>
            ⬆️ Fortify $${cost}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (this.cash >= cost) {
            this.cash -= cost;
            gs.defenseLevel = (gs.defenseLevel || 1) + 1;
            this.recalcDerivedStats();
            gs.hp = gs.maxHp;
            this.audio.playUnlock();
            this.renderUpgradesModal();
            this.updateHUD();
          }
        });
        list.appendChild(card);
      }

      // 3. Factorio Conveyor Belts
      for (const c of CFG.CONVEYORS) {
        const owned = !!this.conveyors[c.id];
        const rem = Math.max(0, this.conveyorRemaining[c.id] ?? c.cost);
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4>${c.icon} ${c.name} ${owned ? '✅ ACTIVE' : ''}</h4>
            <p>${c.desc}</p>
          </div>
          <button class="buy-btn" ${(owned || this.cash < rem) ? 'disabled' : ''}>
            ${owned ? 'BUILT' : `⚙️ $${rem}`}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (!owned && this.cash >= rem) {
            this.cash -= rem;
            this.conveyorRemaining[c.id] = 0;
            this.conveyors[c.id] = true;
            this.recalcDerivedStats();
            this.audio.playUnlock();
            this.renderUpgradesModal();
            this.updateHUD();
          }
        });
        list.appendChild(card);
      }

      // 4. SEAF Staff & Factory Upgrades
      for (const upg of CFG.UPGRADES) {
        const lvl = this.upgrades[upg.id] || 0;
        const isMax = lvl >= upg.maxLevel;
        const cost = Math.round(upg.baseCost * Math.pow(upg.costMultiplier, lvl));
        const canAfford = !isMax && this.cash >= cost;
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4>${upg.icon} ${upg.name} (Lv.${lvl}/${upg.maxLevel})</h4>
            <p>${upg.description}</p>
          </div>
          <button class="upg-buy-btn buy-btn" data-upg="${upg.id}" ${canAfford ? '' : 'disabled'}>
            ${isMax ? 'MAXED' : `💵 $${cost}`}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (!isMax && this.cash >= cost) {
            this.cash -= cost;
            this.upgrades[upg.id] = lvl + 1;
            this.syncWorkers();
            this.recalcDerivedStats();
            this.audio.playUnlock();
            this.renderUpgradesModal();
            this.updateHUD();
          }
        });
        list.appendChild(card);
      }
    }

    renderSkillsModal() {
      const medalSpan = document.getElementById('skill-modal-medals');
      if (medalSpan) medalSpan.textContent = `${this.medals}`;

      const buyMedalBtn = document.getElementById('btn-buy-medal');
      if (buyMedalBtn) {
        buyMedalBtn.disabled = this.cash < 150;
      }

      const list = document.getElementById('skill-tree-list');
      if (!list) return;
      list.innerHTML = '';

      for (const sk of CFG.PERMANENT_SKILLS) {
        const lvl = this.foreverSkills[sk.id] || 0;
        const isMax = lvl >= sk.maxLevel;
        const medalCost = Math.max(1, Math.round(sk.baseMedalCost * Math.pow(sk.costScale, lvl)));
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.style.borderColor = 'rgba(168, 85, 247, 0.55)';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4 style="color:#fde047;">${sk.icon} ${sk.name} (Forever Lv.${lvl}/${sk.maxLevel})</h4>
            <p>${sk.desc}</p>
          </div>
          <button class="buy-btn medal-btn" ${(isMax || this.medals < medalCost) ? 'disabled' : ''}>
            ${isMax ? 'MAXED' : `⭐ ${medalCost} Medals`}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (!isMax && this.medals >= medalCost) {
            this.medals -= medalCost;
            this.foreverSkills[sk.id] = lvl + 1;
            this.recalcDerivedStats();
            this.saveGame();
            this.audio.playUnlock();
            this.renderSkillsModal();
            this.updateHUD();
          }
        });
        list.appendChild(card);
      }
    }

    serializeState() {
      return {
        version: CFG.VERSION,
        cash: this.cash,
        medals: this.medals,
        foreverSkills: this.foreverSkills,
        ownedEquipment: this.ownedEquipment,
        equipped: this.equipped,
        totalServed: this.totalServed,
        totalKills: this.totalKills,
        rawExtractors: this.rawExtractors,
        gates: this.gates,
        conveyors: this.conveyors,
        conveyorRemaining: this.conveyorRemaining,
        unlocked: this.unlocked,
        unlockRemaining: this.unlockRemaining,
        upgrades: this.upgrades
      };
    }

    saveGame() {
      try {
        const json = JSON.stringify(this.serializeState());
        localStorage.setItem(CFG.STORAGE_KEY, json);
        const codeInput = document.getElementById('save-code-box');
        if (codeInput) codeInput.value = btoa(unescape(encodeURIComponent(json)));
      } catch (e) {
        // Ignore storage errors in sandboxed iframes
      }
    }

    loadGame(rawJson = null) {
      try {
        let saved = rawJson || localStorage.getItem(CFG.STORAGE_KEY);
        if (!saved && CFG.LEGACY_KEYS) {
          for (const k of CFG.LEGACY_KEYS) {
            const legacy = localStorage.getItem(k);
            if (legacy) {
              saved = legacy;
              break;
            }
          }
        }
        if (!saved) return;
        const data = JSON.parse(saved);
        if (typeof data.medals === 'number') this.medals = data.medals;
        if (data.foreverSkills) Object.assign(this.foreverSkills, data.foreverSkills);
        if (data.ownedEquipment) Object.assign(this.ownedEquipment, data.ownedEquipment);
        if (data.equipped) Object.assign(this.equipped, data.equipped);
        if (typeof data.cash === 'number') this.cash = Math.max(100, data.cash);
        if (typeof data.totalServed === 'number') this.totalServed = data.totalServed;
        if (typeof data.totalKills === 'number') this.totalKills = data.totalKills;
        if (data.rawExtractors) {
          for (const k of Object.keys(data.rawExtractors)) {
            if (this.rawExtractors[k]) Object.assign(this.rawExtractors[k], data.rawExtractors[k]);
          }
        }
        if (data.gates) {
          for (const k of Object.keys(data.gates)) {
            if (this.gates[k]) {
              Object.assign(this.gates[k], data.gates[k]);
              this.gates[k].unlocked = true;
              if (this.gates[k].hp <= 0) this.gates[k].hp = this.gates[k].maxHp;
            }
          }
        }
        if (data.conveyors) Object.assign(this.conveyors, data.conveyors);
        if (data.conveyorRemaining) Object.assign(this.conveyorRemaining, data.conveyorRemaining);
        if (data.unlocked) Object.assign(this.unlocked, data.unlocked);
        if (data.unlockRemaining) Object.assign(this.unlockRemaining, data.unlockRemaining);
        if (data.upgrades) Object.assign(this.upgrades, data.upgrades);
        this.recalcDerivedStats();
        this.syncWorkers();
        this.buildSolidObstacles();
      } catch (e) {
        // Ignore corrupt save
      }
    }

    bindEvents() {
      window.addEventListener('keydown', (e) => {
        this.keys[e.code] = true;
      });
      window.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;
      });

      const canvas = this.world.canvas;
      let pointerDown = false;
      const updateTargetFromEvent = (clientX, clientY) => {
        const pt = this.world.screenToWorld(clientX, clientY);
        this.pointerTarget = pt;
      };

      canvas.addEventListener('pointerdown', (e) => {
        pointerDown = true;
        updateTargetFromEvent(e.clientX, e.clientY);
      });
      canvas.addEventListener('pointermove', (e) => {
        if (pointerDown) updateTargetFromEvent(e.clientX, e.clientY);
      });
      window.addEventListener('pointerup', () => {
        pointerDown = false;
      });

      const joyZone = document.getElementById('joystick-zone');
      const joyKnob = document.getElementById('joystick-knob');
      if (joyZone && joyKnob) {
        let joyActive = false;
        const maxR = 38;
        const updateJoy = (clientX, clientY) => {
          const rect = joyZone.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          let dx = clientX - cx;
          let dy = clientY - cy;
          const dist = Math.hypot(dx, dy);
          if (dist > maxR) {
            dx = (dx / dist) * maxR;
            dy = (dy / dist) * maxR;
          }
          joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
          this.joyVec.x = dx / maxR;
          this.joyVec.z = dy / maxR;
        };
        const resetJoy = () => {
          joyActive = false;
          joyKnob.style.transform = 'translate(0px, 0px)';
          this.joyVec.x = 0;
          this.joyVec.z = 0;
        };
        joyZone.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          joyActive = true;
          updateJoy(e.clientX, e.clientY);
        });
        window.addEventListener('pointermove', (e) => {
          if (joyActive) updateJoy(e.clientX, e.clientY);
        });
        window.addEventListener('pointerup', resetJoy);
        window.addEventListener('pointercancel', resetJoy);
      }

      document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
        this.world.setZoom(this.world.targetZoom + 0.12);
      });
      document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
        this.world.setZoom(this.world.targetZoom - 0.12);
      });
      document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
        this.world.setZoom(0.56);
      });

      document.querySelectorAll('.strat-arrow').forEach((btn) => {
        btn.addEventListener('click', () => {
          const dir = btn.getAttribute('data-dir');
          this.stratSeq.push(dir);
          if (this.stratSeq.length >= 5) {
            this.stratSeq = [];
            this.trigger500kgStratagem();
          }
        });
      });
      document.getElementById('btn-call-stratagem')?.addEventListener('click', () => this.trigger500kgStratagem());

      document.getElementById('btn-clear-stack')?.addEventListener('click', () => {
        this.player.inventory = [];
        this.spawnFloatingText(this.player.x, this.player.z - 25, '🗑️ STACK CLEARED', '#f87171');
      });
      document.getElementById('btn-sprint')?.addEventListener('click', () => {
        this.sprintToggle = !this.sprintToggle;
        const btn = document.getElementById('btn-sprint');
        if (btn) btn.style.borderColor = this.sprintToggle ? '#4ade80' : '#facc15';
      });

      document.getElementById('btn-mute')?.addEventListener('click', () => {
        const enabled = this.audio.toggle();
        const btn = document.getElementById('btn-mute');
        if (btn) btn.textContent = enabled ? '🔊 Audio' : '🔇 Muted';
      });

      // Main Character Loadout Modal Open/Close
      document.getElementById('btn-open-loadout')?.addEventListener('click', () => {
        this.renderLoadoutModal();
        document.getElementById('modal-loadout')?.classList.add('open');
      });
      document.getElementById('btn-close-loadout')?.addEventListener('click', () => {
        document.getElementById('modal-loadout')?.classList.remove('open');
      });

      // Character Preview Showcase Modal Open/Close
      document.getElementById('btn-open-characters')?.addEventListener('click', () => {
        document.getElementById('modal-characters')?.classList.add('open');
      });
      document.getElementById('btn-close-characters')?.addEventListener('click', () => {
        document.getElementById('modal-characters')?.classList.remove('open');
      });
      document.getElementById('btn-play-from-chars')?.addEventListener('click', () => {
        document.getElementById('modal-characters')?.classList.remove('open');
      });

      document.getElementById('btn-open-seaf')?.addEventListener('click', () => {
        this.renderUpgradesModal();
        document.getElementById('modal-seaf')?.classList.add('open');
      });
      document.getElementById('btn-close-seaf')?.addEventListener('click', () => {
        document.getElementById('modal-seaf')?.classList.remove('open');
      });

      document.getElementById('btn-open-skills')?.addEventListener('click', () => {
        this.renderSkillsModal();
        document.getElementById('modal-skills')?.classList.add('open');
      });
      document.getElementById('btn-close-skills')?.addEventListener('click', () => {
        document.getElementById('modal-skills')?.classList.remove('open');
      });
      document.getElementById('btn-buy-medal')?.addEventListener('click', () => {
        if (this.cash >= 150) {
          this.cash -= 150;
          this.medals += 1;
          this.saveGame();
          this.audio.playUnlock();
          this.renderSkillsModal();
          this.updateHUD();
        }
      });

      document.getElementById('btn-redeploy-now')?.addEventListener('click', () => {
        this.redeployAfterDefeat();
      });
      document.getElementById('btn-defeat-open-skills')?.addEventListener('click', () => {
        this.renderSkillsModal();
        document.getElementById('modal-skills')?.classList.add('open');
      });

      document.getElementById('btn-open-save')?.addEventListener('click', () => {
        this.saveGame();
        document.getElementById('modal-save')?.classList.add('open');
      });
      document.getElementById('btn-close-save')?.addEventListener('click', () => {
        document.getElementById('modal-save')?.classList.remove('open');
      });
      document.getElementById('btn-copy-save')?.addEventListener('click', () => {
        this.saveGame();
        const input = document.getElementById('save-code-box');
        if (input) {
          input.select();
          navigator.clipboard?.writeText(input.value);
          this.spawnFloatingText(this.player.x, this.player.z - 30, '📋 SAVE CODE COPIED!', '#4ade80');
        }
      });
      document.getElementById('btn-import-save')?.addEventListener('click', () => {
        const input = document.getElementById('save-code-box');
        if (input && input.value.trim()) {
          try {
            const json = decodeURIComponent(escape(atob(input.value.trim())));
            this.loadGame(json);
            this.saveGame();
            document.getElementById('modal-save')?.classList.remove('open');
            this.spawnFloatingText(this.player.x, this.player.z - 30, '📥 SAVE LOADED!', '#38bdf8');
          } catch (e) {
            this.spawnFloatingText(this.player.x, this.player.z - 30, '⚠️ INVALID SAVE CODE', '#ef4444');
          }
        }
      });
      document.getElementById('btn-reset-save')?.addEventListener('click', () => {
        this.redeployAfterDefeat();
        document.getElementById('modal-save')?.classList.remove('open');
      });

      document.getElementById('btn-open-github')?.addEventListener('click', () => {
        document.getElementById('modal-github')?.classList.add('open');
      });
      document.getElementById('btn-close-github')?.addEventListener('click', () => {
        document.getElementById('modal-github')?.classList.remove('open');
      });
      document.getElementById('btn-ingame-dl-full')?.addEventListener('click', () => this.downloadGitHubZip(true));
      document.getElementById('btn-ingame-dl-update')?.addEventListener('click', () => this.downloadGitHubZip(false));
    }

    async downloadGitHubZip(isFullPackage = true) {
      const statusEl = document.getElementById('ingame-dl-status');
      if (!window.JSZip) {
        if (statusEl) statusEl.textContent = '⚠️ JSZip library not loaded.';
        return;
      }
      if (statusEl) statusEl.textContent = `⏳ Packaging ${CFG.VERSION} modular repository (.zip)...`;

      const zip = new window.JSZip();
      const files = window.__REPO_SOURCE_FILES__ || {};
      if (files['index.html']) {
        for (const [path, content] of Object.entries(files)) {
          if (!isFullPackage && path === '.nojekyll') continue;
          zip.file(path, content);
        }
      } else {
        zip.file('index.html', document.documentElement.outerHTML);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isFullPackage
        ? `helldivers_please_${CFG.VERSION}_full_repo.zip`
        : `helldivers_please_${CFG.VERSION}_update_code.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (statusEl) statusEl.textContent = `✅ Downloaded ${a.download} (${CFG.VERSION})!`;
    }
  }

  function bootHelldiversGame() {
    if (!window.game) {
      window.game = new HelldiversFactorioGame();
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootHelldiversGame);
  } else {
    bootHelldiversGame();
  }
})();
