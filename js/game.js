// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.02
// Module: Core 2D Factorio + Carbot Simulation, 3-Gate Siege, Conveyors,
//         Raw Speed Upgrades, Direct Gun Selling & Permanent Skill Tree
// ============================================================================

(function () {
  const CFG = window.GameConfig;

  class HelldiversFactorioGame {
    constructor() {
      this.audio = new window.SoundEngine();
      this.canvasEl = document.getElementById('game-canvas');
      this.fxLayer = document.getElementById('world-labels');
      this.world = new window.WorldRenderer2D(this.canvasEl);

      // Persistent Forever State (NEVER lost on defeat!)
      this.medals = 3;
      this.foreverSkills = {};
      for (const sk of CFG.PERMANENT_SKILLS) {
        this.foreverSkills[sk.id] = 0;
      }

      // Initialize Run State
      this.initRunState();

      // Input state
      this.keys = {};
      this.joyVec = { x: 0, z: 0 };
      this.pointerTarget = null;
      this.sprintToggle = false;
      this.isDefeated = false;
      this.stratSeq = [];

      // Timers
      this.transferCooldown = 0;
      this.customerSpawnTimer = 0.6;
      this.cashierTimer = 0;
      this.enemySpawnTimer = 2.0;
      this.conveyorTickTimer = 0;
      this.rawPadCooldown = 0;
      this.stratagemCooldown = 0;
      this.stratagemBuffTimer = 0;

      // Load saved state (preserving Forever Skills + current run)
      this.loadGame();

      // Ensure initial setup has plenty of Guns & Cloth ready to sell immediately
      this.ensureStarterSetup();

      // Bind UI & Input
      this.bindEvents();
      this.updateHUD();

      // Spawn immediate initial Helldivers (First customer ALWAYS orders 🔫 Gun!)
      this.spawnCustomer('gun');
      this.spawnCustomer('cloth');

      // Start 60FPS loop
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    initRunState() {
      const grantLvl = this.foreverSkills?.perm_start_grant || 0;
      this.cash = 120 + grantLvl * 250;
      this.cashOnGround = 45;
      this.totalServed = 0;
      this.totalKills = 0;
      this.isDefeated = false;

      this.player = {
        x: -60,
        z: 260,
        walkPhase: 0,
        inventory: [],
        attackTimer: 0
      };

      this.rawExtractors = {};
      for (const raw of CFG.RAW_EXTRACTORS) {
        this.rawExtractors[raw.id] = {
          level: 1,
          stock: 4,
          progress: 0,
          cycleTime: raw.baseCycleTime
        };
      }

      this.ammoPress = {
        stock: CFG.AMMO_PRESS.initialStock || 10,
        progress: 0,
        cycleTime: CFG.AMMO_PRESS.baseCycleTime
      };

      this.gates = {};
      const armorLvl = this.foreverSkills?.perm_gate_armor || 0;
      const hpMult = 1 + armorLvl * 0.4;
      for (const g of CFG.GATES) {
        const maxHp = Math.round(g.baseMaxHp * hpMult);
        this.gates[g.id] = {
          unlocked: g.unlockedAtStart,
          unlockRemaining: g.unlockCost,
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
      for (let gx = -900; gx <= 900; gx += 180) {
        for (let gz = -880; gz <= -320; gz += 160) {
          this.snowTiles.push({ x: gx, z: gz, cleared: false, respawnTimer: 0 });
        }
      }

      this.cryoPods = [
        { id: 'west', x: -420, z: -560, fed: 0, needed: 3, rescued: false, cooldown: 0 },
        { id: 'east', x: 420, z: -560, fed: 0, needed: 3, rescued: false, cooldown: 0 }
      ];

      this.recalcDerivedStats();
      this.buildSolidObstacles();
    }

    ensureStarterSetup() {
      this.unlocked.cloth = true;
      this.unlocked.gun = true;
      if ((this.stations.gun?.stock || 0) < 2 && (this.counterBuffer.gun || 0) < 1) {
        this.stations.gun.stock = 4;
        this.counterBuffer.gun = 3;
      }
      if ((this.stations.cloth?.stock || 0) < 2 && (this.counterBuffer.cloth || 0) < 1) {
        this.stations.cloth.stock = 4;
        this.counterBuffer.cloth = 3;
      }
      if (this.player.inventory.length === 0 && this.totalServed === 0) {
        const gunCfg = this.getItemConfig('gun');
        const clothCfg = this.getItemConfig('cloth');
        this.player.inventory.push(
          { id: 'gun', icon: gunCfg.icon, color: gunCfg.color },
          { id: 'gun', icon: gunCfg.icon, color: gunCfg.color },
          { id: 'cloth', icon: clothCfg.icon, color: clothCfg.color }
        );
      }
      this.syncWorkers();
      this.recalcDerivedStats();
      this.buildSolidObstacles();
    }

    getItemConfig(id) {
      return CFG.ITEMS.find((i) => i.id === id);
    }

    getItemSellPrice(item) {
      const base = typeof item === 'object' ? item.sellPrice : (this.getItemConfig(item)?.sellPrice || 25);
      const permLvl = this.foreverSkills.perm_gun_value || 0;
      const buff = this.stratagemBuffTimer > 0 ? 1.5 : 1.0;
      return Math.round(base * (1 + permLvl * 0.25) * buff);
    }

    getPlayerMaxCapacity() {
      const rigLvl = this.upgrades.player_exo_rig || 0;
      const grantLvl = this.foreverSkills.perm_start_grant || 0;
      return CFG.PLAYER.baseCapacity + rigLvl * 5 + grantLvl * 4;
    }

    getPlayerMoveSpeed() {
      const bootLvl = this.upgrades.player_boots || 0;
      const eliteLvl = this.foreverSkills.perm_commander_elite || 0;
      const sprint = (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.sprintToggle) ? CFG.PLAYER.sprintMultiplier : 1.0;
      const strat = this.stratagemBuffTimer > 0 ? 1.35 : 1.0;
      return CFG.PLAYER.baseSpeed * (1 + bootLvl * 0.14) * (1 + eliteLvl * 0.15) * sprint * strat;
    }

    getRawUpgradeCost(rawId) {
      const rawCfg = CFG.RAW_EXTRACTORS.find((r) => r.id === rawId);
      const lvl = this.rawExtractors[rawId]?.level || 1;
      return Math.round(rawCfg.baseUpgradeCost * Math.pow(rawCfg.costScale, lvl - 1));
    }

    recalcDerivedStats() {
      const rawUpgLvl = this.upgrades.raw_speed_boost || 0;
      const permRawLvl = this.foreverSkills.perm_raw_speed || 0;
      const factoryLvl = this.upgrades.factory_overclock || 0;
      const rawBeltBonus = this.conveyors.conv_raw_feed ? 1.5 : 1.0;
      const stratBonus = this.stratagemBuffTimer > 0 ? 2.0 : 1.0;

      for (const rawCfg of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[rawCfg.id];
        if (!rs) continue;
        const speedMult = (1 + (rs.level - 1) * 0.35) * (1 + rawUpgLvl * 0.35) * (1 + permRawLvl * 0.35) * stratBonus;
        rs.cycleTime = Math.max(0.22, rawCfg.baseCycleTime / speedMult);
      }

      const avgRawLvl = ((this.rawExtractors.raw_iron?.level || 1) + (this.rawExtractors.raw_e710?.level || 1)) * 0.5;
      const ammoSpeedMult = (1 + (avgRawLvl - 1) * 0.25) * (1 + rawUpgLvl * 0.3) * (1 + permRawLvl * 0.35) * rawBeltBonus * stratBonus;
      this.ammoPress.cycleTime = Math.max(0.20, CFG.AMMO_PRESS.baseCycleTime / ammoSpeedMult);

      for (const item of CFG.ITEMS) {
        const st = this.stations[item.id];
        if (!st) continue;
        const linkedRawLvl = this.rawExtractors[item.rawType]?.level || 1;
        const prodSpeed = (1 + factoryLvl * 0.22) * (1 + (linkedRawLvl - 1) * 0.2) * rawBeltBonus * stratBonus;
        st.cycleTime = Math.max(0.25, item.cycleTime / prodSpeed);
      }

      const armorLvl = this.foreverSkills.perm_gate_armor || 0;
      const hpMult = 1 + armorLvl * 0.4;
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs) continue;
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
      const wallY = W.wallZ;

      boxes.push({ minX: -1260, maxX: -685, minZ: wallY - 24, maxZ: wallY + 24 });
      boxes.push({ minX: -555, maxX: -65, minZ: wallY - 24, maxZ: wallY + 24 });
      boxes.push({ minX: 65, maxX: 555, minZ: wallY - 24, maxZ: wallY + 24 });
      boxes.push({ minX: 685, maxX: 1260, minZ: wallY - 24, maxZ: wallY + 24 });

      for (const g of CFG.GATES) {
        if (!this.gates[g.id]?.unlocked) {
          boxes.push({ minX: g.x - 68, maxX: g.x + 68, minZ: wallY - 22, maxZ: wallY + 22 });
        }
      }

      for (const raw of CFG.RAW_EXTRACTORS) {
        boxes.push({ minX: raw.x - 55, maxX: raw.x + 55, minZ: raw.z - 55, maxZ: raw.z + 55 });
      }

      const AP = CFG.AMMO_PRESS;
      boxes.push({ minX: AP.x - 50, maxX: AP.x + 50, minZ: AP.z - 50, maxZ: AP.z + 50 });

      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const p = item.stationPos;
        boxes.push({ minX: p.x - 48, maxX: p.x + 48, minZ: p.z - 48, maxZ: p.z + 48 });
      }

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
      const nx = Math.max(W.minX + 28, Math.min(W.maxX - 28, entity.x + dx));
      const nz = Math.max(W.minZ + 28, Math.min(W.maxZ - 28, entity.z + dz));

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

      requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
      if (this.stratagemCooldown > 0) this.stratagemCooldown = Math.max(0, this.stratagemCooldown - dt);
      if (this.stratagemBuffTimer > 0) {
        this.stratagemBuffTimer = Math.max(0, this.stratagemBuffTimer - dt);
        if (this.stratagemBuffTimer === 0) this.recalcDerivedStats();
      }
      if (this.rawPadCooldown > 0) this.rawPadCooldown = Math.max(0, this.rawPadCooldown - dt);

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

    updateRawAndAmmoProduction(dt) {
      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[raw.id];
        if (!rs) continue;
        if (rs.stock < raw.maxBuffer) {
          rs.progress += dt;
          if (rs.progress >= rs.cycleTime) {
            rs.progress = 0;
            rs.stock++;
          }
        }
      }

      if (this.ammoPress.stock < CFG.AMMO_PRESS.maxBuffer) {
        this.ammoPress.progress += dt;
        if (this.ammoPress.progress >= this.ammoPress.cycleTime) {
          this.ammoPress.progress = 0;
          this.ammoPress.stock++;
        }
      }
    }

    updateArsenalFactories(dt) {
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const st = this.stations[item.id];
        if (st.stock < item.maxBuffer) {
          st.progress += dt;
          if (st.progress >= st.cycleTime) {
            st.progress = 0;
            st.stock++;
          }
        }
      }
    }

    updateConveyorAutomation(dt) {
      this.conveyorTickTimer += dt;
      if (this.conveyorTickTimer < 0.45) return;
      this.conveyorTickTimer = 0;

      if (this.conveyors.conv_raw_feed) {
        for (const raw of CFG.RAW_EXTRACTORS) {
          const rs = this.rawExtractors[raw.id];
          if (rs && rs.stock > 0) {
            rs.stock--;
            if (this.ammoPress.stock < CFG.AMMO_PRESS.maxBuffer) {
              this.ammoPress.stock++;
            }
          }
        }
      }

      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs || !gs.unlocked) continue;
        if (this.conveyors[g.conveyorId] && gs.ammo < g.maxAmmo && this.ammoPress.stock > 0) {
          this.ammoPress.stock--;
          gs.ammo = Math.min(g.maxAmmo, gs.ammo + 2);
        }
      }

      if (this.conveyors.conv_counter_auto) {
        for (const item of CFG.ITEMS) {
          if (!this.unlocked[item.id]) continue;
          const st = this.stations[item.id];
          if (st && st.stock > 0 && (this.counterBuffer[item.id] || 0) < 25) {
            st.stock--;
            this.counterBuffer[item.id] = (this.counterBuffer[item.id] || 0) + 1;
          }
        }
      }
    }

    updatePlayerInteractions(dt) {
      const p = this.player;
      const L = CFG.LOCATIONS;
      const maxCap = this.getPlayerMaxCapacity();

      // Cash Vacuum at Cash Register Pad
      const distCash = Math.hypot(p.x - L.cashRegisterZone.x, p.z - L.cashRegisterZone.z);
      if (distCash < L.cashRegisterZone.radius && this.cashOnGround > 0) {
        const collect = this.cashOnGround;
        this.cash += collect;
        this.cashOnGround = 0;
        this.audio.playCash();
        this.spawnFloatingText(p.x, p.z - 30, `+$${collect} REQ`, '#4ade80');
      }

      // Trash Can Dump Pad
      const distTrash = Math.hypot(p.x - L.trashCanZone.x, p.z - L.trashCanZone.z);
      if (distTrash < L.trashCanZone.radius && p.inventory.length > 0) {
        p.inventory = [];
        this.audio.playPickup();
        this.spawnFloatingText(p.x, p.z - 25, '🗑️ STACK CLEARED', '#f87171');
      }

      // Raw Material Drill Upgrade Pad (Upgrade Raw Generation Speed on-map!)
      if (this.rawPadCooldown <= 0) {
        for (const raw of CFG.RAW_EXTRACTORS) {
          const distRaw = Math.hypot(p.x - raw.padX, p.z - raw.padZ);
          if (distRaw < 72) {
            const cost = this.getRawUpgradeCost(raw.id);
            if (this.cash >= cost) {
              this.cash -= cost;
              this.rawExtractors[raw.id].level++;
              this.rawPadCooldown = 0.55;
              this.recalcDerivedStats();
              this.audio.playUnlock();
              this.spawnFloatingText(raw.x, raw.z - 35, `⬆️ ${raw.shortName} Lv.${this.rawExtractors[raw.id].level}!`, raw.color);
            }
          }
        }
      }

      this.transferCooldown -= dt;
      if (this.transferCooldown > 0) return;

      // DIRECT HAND-TO-CUSTOMER SELLING (Fixes Gun / Item Selling 100%!)
      for (const cust of this.customers) {
        if (cust.state === 'leaving') continue;
        const dCust = Math.hypot(p.x - cust.x, p.z - cust.z);
        if (dCust < 135) {
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

      // Counter Drop-Off Pad
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

      // Pickup 🧱 Ammo from Munitions Press
      const AP = CFG.AMMO_PRESS;
      const distAmmoPickup = Math.hypot(p.x - AP.padX, p.z - AP.padZ);
      if (distAmmoPickup < 82 && this.ammoPress.stock > 0 && p.inventory.length < maxCap) {
        this.ammoPress.stock--;
        p.inventory.push({ id: 'ammo', icon: '🧱', color: '#f97316' });
        this.transferCooldown = CFG.PLAYER.transferInterval;
        this.audio.playPickup();
        this.spawnArc(AP.x, AP.z, p.x, p.z - 20, '🧱', '#f97316');
        return;
      }

      // Manual Ammo Input (搬) + Gate Repair at Gate Turret Ammo Pads
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs || !gs.unlocked) continue;
        const distPad = Math.hypot(p.x - g.ammoPadX, p.z - g.ammoPadZ);
        if (distPad < 82) {
          const ammoIdx = p.inventory.findIndex((it) => it.id === 'ammo');
          if (ammoIdx !== -1 && gs.ammo < g.maxAmmo) {
            p.inventory.splice(ammoIdx, 1);
            gs.ammo = Math.min(g.maxAmmo, gs.ammo + 3);
            this.transferCooldown = CFG.PLAYER.transferInterval;
            this.audio.playPickup();
            this.spawnArc(p.x, p.z - 20, g.turretX, g.turretZ, '🧱', '#f97316');
            this.spawnFloatingText(g.turretX, g.turretZ - 28, `+3 🧱 TURRET AMMO`, '#f97316');
            return;
          }
          if (gs.hp < gs.maxHp) {
            gs.hp = Math.min(gs.maxHp, gs.hp + 25);
            this.transferCooldown = 0.2;
            this.spawnFloatingText(g.x, g.z - 35, `🔧 +25 GATE HP`, '#4ade80');
            return;
          }
        }
      }

      // Pickup Arsenal Items (🔫 Gun, 🦺 Cloth, etc.)
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const st = this.stations[item.id];
        const distPick = Math.hypot(p.x - item.pickupPos.x, p.z - item.pickupPos.z);
        if (distPick < 82 && st.stock > 0 && p.inventory.length < maxCap) {
          st.stock--;
          p.inventory.push({ id: item.id, icon: item.icon, color: item.color });
          this.transferCooldown = CFG.PLAYER.transferInterval;
          this.audio.playPickup();
          this.spawnArc(item.stationPos.x, item.stationPos.z, p.x, p.z - 20, item.icon, item.color);
          return;
        }
      }

      // Unlock Locked Arsenal Stations
      for (const item of CFG.ITEMS) {
        if (this.unlocked[item.id]) continue;
        const distUnlock = Math.hypot(p.x - item.unlockPos.x, p.z - item.unlockPos.z);
        if (distUnlock < 85 && this.cash > 0) {
          const step = Math.min(this.cash, this.unlockRemaining[item.id], Math.max(10, Math.ceil(item.unlockCost * 0.12)));
          this.cash -= step;
          this.unlockRemaining[item.id] -= step;
          this.transferCooldown = 0.05;
          this.audio.playPickup();
          if (this.unlockRemaining[item.id] <= 0) {
            this.unlocked[item.id] = true;
            this.stations[item.id].stock = item.initialStock || 2;
            this.counterBuffer[item.id] = 1;
            this.buildSolidObstacles();
            this.audio.playUnlock();
            this.spawnFloatingText(item.stationPos.x, item.stationPos.z - 40, `🎉 UNLOCKED ${item.shortName.toUpperCase()}!`, '#facc15');
          }
          return;
        }
      }

      // Unlock Gate 2 (West) & Gate 3 (East)
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs || gs.unlocked) continue;
        const distGatePad = Math.hypot(p.x - g.unlockPadX, p.z - g.unlockPadZ);
        if (distGatePad < 88 && this.cash > 0) {
          const step = Math.min(this.cash, gs.unlockRemaining, Math.max(15, Math.ceil(g.unlockCost * 0.12)));
          this.cash -= step;
          gs.unlockRemaining -= step;
          this.transferCooldown = 0.05;
          this.audio.playPickup();
          if (gs.unlockRemaining <= 0) {
            gs.unlocked = true;
            gs.hp = gs.maxHp;
            gs.ammo = g.initialAmmo;
            this.buildSolidObstacles();
            this.audio.playUnlock();
            this.medals += 1;
            this.spawnFloatingText(g.x, g.z - 45, `🚧 ${g.shortName.toUpperCase()} OPENED! (+1 ⭐ MEDAL)`, '#38bdf8');
          }
          return;
        }
      }

      // Unlock Factorio Conveyor Belts
      for (const c of CFG.CONVEYORS) {
        if (this.conveyors[c.id]) continue;
        if (c.gateId && !this.gates[c.gateId]?.unlocked) continue;
        const distConv = Math.hypot(p.x - c.padX, p.z - c.padZ);
        if (distConv < 78 && this.cash > 0) {
          const step = Math.min(this.cash, this.conveyorRemaining[c.id], Math.max(10, Math.ceil(c.cost * 0.15)));
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

      // Feed War-Zone Cryo-Pods
      for (const pod of this.cryoPods) {
        if (pod.rescued) continue;
        const dPod = Math.hypot(p.x - pod.x, p.z - pod.z);
        if (dPod < 85 && p.inventory.length > 0) {
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

    syncWorkers() {
      const targetLogistics = this.upgrades.seaf_carrier || 0;
      const targetAmmo = this.upgrades.seaf_ammo_hauler || 0;

      const curLogistics = this.workers.filter((w) => w.role === 'logistics').length;
      const curAmmo = this.workers.filter((w) => w.role === 'ammo').length;

      for (let i = curLogistics; i < targetLogistics; i++) {
        this.workers.push({
          role: 'logistics',
          x: -120 + (i % 3) * 45,
          z: 320,
          walkPhase: i,
          inventory: []
        });
      }

      for (let i = curAmmo; i < targetAmmo; i++) {
        this.workers.push({
          role: 'ammo',
          x: -480 + (i % 3) * 45,
          z: -20,
          walkPhase: i,
          inventory: []
        });
      }
    }

    updateWorkers(dt) {
      const speed = 185 * (1 + (this.foreverSkills.perm_commander_elite || 0) * 0.15);
      const L = CFG.LOCATIONS;
      const AP = CFG.AMMO_PRESS;

      for (const w of this.workers) {
        w.walkPhase += dt * 10;

        if (w.role === 'ammo') {
          if (w.inventory.length === 0) {
            const dx = AP.padX - w.x;
            const dz = AP.padZ - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 24) {
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
            let bestGate = CFG.GATES[0];
            let lowestRatio = 999;
            for (const g of CFG.GATES) {
              const gs = this.gates[g.id];
              if (gs && gs.unlocked) {
                const r = gs.ammo / g.maxAmmo;
                if (r < lowestRatio) {
                  lowestRatio = r;
                  bestGate = g;
                }
              }
            }
            const dx = bestGate.ammoPadX - w.x;
            const dz = bestGate.ammoPadZ - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 24) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const gs = this.gates[bestGate.id];
              if (gs) {
                gs.ammo = Math.min(bestGate.maxAmmo, gs.ammo + w.inventory.length * 3);
              }
              w.inventory = [];
            }
          }
        } else {
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
            if (dist > 26) {
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

    spawnCustomer(forcedItemId = null) {
      const unlockedGates = CFG.GATES.filter((g) => this.gates[g.id]?.unlocked).length;
      const maxQueue = 6 + unlockedGates * 2;
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
        if (gunItem && Math.random() < 0.48) {
          chosenItem = gunItem;
        } else {
          chosenItem = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
        }
      }

      const qty = chosenItem.tier <= 2 ? (1 + Math.floor(Math.random() * 2)) : 1;
      const spawn = CFG.LOCATIONS.customerSpawn;

      this.customers.push({
        x: spawn.x,
        z: spawn.z + (Math.random() - 0.5) * 80,
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
      const unlockedGates = CFG.GATES.filter((g) => this.gates[g.id]?.unlocked).length;
      const spawnInterval = Math.max(1.4, 3.6 - unlockedGates * 0.65);

      this.customerSpawnTimer -= dt;
      if (this.customerSpawnTimer <= 0) {
        this.customerSpawnTimer = spawnInterval;
        this.spawnCustomer();
      }

      const qStart = CFG.LOCATIONS.customerQueueStart;
      const activeCustomers = this.customers.filter((c) => c.state !== 'leaving');
      activeCustomers.forEach((c, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const tx = qStart.x + row * 78;
        const tz = qStart.z - 55 + col * 110;
        const dx = tx - c.x;
        const dz = tz - c.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 8) {
          c.x += (dx / dist) * 190 * dt;
          c.z += (dz / dist) * 190 * dt;
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
            c.x += (dx / dist) * 230 * dt;
            c.z += (dz / dist) * 230 * dt;
            c.walkPhase += dt * 12;
          }
        }
      }

      // MULTI-STALL COUNTER SERVING: Serve ANY customer whose requested item is in counterBuffer!
      this.cashierTimer -= dt;
      if (this.cashierTimer <= 0) {
        const cashierSpeed = 0.28 / (1 + (this.upgrades.seaf_cashier || 0) * 0.5);
        for (const c of activeCustomers) {
          const itemId = c.item.id;
          if ((this.counterBuffer[itemId] || 0) > 0 && Math.abs(c.x - qStart.x) < 260) {
            this.counterBuffer[itemId]--;
            this.cashierTimer = cashierSpeed;
            this.spawnArc(CFG.LOCATIONS.counterTable.x, CFG.LOCATIONS.counterTable.z, c.x, c.z - 15, c.item.icon, c.item.color);
            this.completeCustomerItemReceive(c, false);
            break;
          }
        }
      }
    }

    updateWarZoneAndGates(dt) {
      const armorLvl = this.foreverSkills.perm_gate_armor || 0;
      if (armorLvl > 0) {
        for (const g of CFG.GATES) {
          const gs = this.gates[g.id];
          if (gs && gs.unlocked && gs.hp > 0 && gs.hp < gs.maxHp) {
            gs.hp = Math.min(gs.maxHp, gs.hp + armorLvl * 6 * dt);
          }
        }
      }

      const unlockedGateList = CFG.GATES.filter((g) => this.gates[g.id]?.unlocked);
      this.enemySpawnTimer -= dt;
      if (this.enemySpawnTimer <= 0 && this.enemies.length < 7 + unlockedGateList.length * 4) {
        this.enemySpawnTimer = Math.max(2.2, 4.8 - unlockedGateList.length * 0.65);
        const targetGate = unlockedGateList[Math.floor(Math.random() * unlockedGateList.length)] || CFG.GATES[0];
        const roll = Math.random();
        let type = 'trooper';
        let hp = 95;
        let dmg = 11;
        let speed = 78;
        if (roll > 0.80) {
          type = 'hulk';
          hp = 290;
          dmg = 24;
          speed = 52;
        } else if (roll > 0.45) {
          type = 'bug';
          hp = 80;
          dmg = 9;
          speed = 105;
        }
        this.enemies.push({
          type,
          x: targetGate.x + (Math.random() - 0.5) * 360,
          z: CFG.WORLD.minZ + 60 + Math.random() * 160,
          hp,
          maxHp: hp,
          dmg,
          speed,
          targetGateId: targetGate.id,
          attackCooldown: 0
        });
      }

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        const gCfg = CFG.GATES.find((g) => g.id === e.targetGateId) || CFG.GATES[0];
        const gs = this.gates[gCfg.id];

        const targetX = gCfg.x;
        const targetZ = gCfg.z - 28;
        const dx = targetX - e.x;
        const dz = targetZ - e.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 34) {
          e.x += (dx / dist) * e.speed * dt;
          e.z += (dz / dist) * e.speed * dt;
        } else if (gs && gs.unlocked) {
          e.attackCooldown -= dt;
          if (e.attackCooldown <= 0) {
            e.attackCooldown = 1.05;
            gs.hp = Math.max(0, gs.hp - e.dmg);
            gs.lastHitTime = this.world.time;
            this.spawnFloatingText(gCfg.x, gCfg.z - 35, `-${e.dmg} 🛡️ ${gCfg.shortName}`, '#ef4444');

            if (gs.hp <= 0) {
              this.triggerGateDefeat(gCfg);
              return;
            }
          }
        }
      }

      const turretPwrLvl = this.foreverSkills.perm_turret_power || 0;
      const turretDmgMult = 1 + turretPwrLvl * 0.35;
      const freeAmmoChance = Math.min(0.6, turretPwrLvl * 0.08);

      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs || !gs.unlocked) continue;
        gs.fireCooldown = Math.max(0, gs.fireCooldown - dt);
        if (gs.ammo <= 0 || gs.fireCooldown > 0) continue;

        let closest = null;
        let bestDist = g.turretRange;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - g.turretX, e.z - g.turretZ);
          if (d < bestDist) {
            bestDist = d;
            closest = e;
          }
        }

        if (closest) {
          gs.turretAngle = Math.atan2(closest.z - g.turretZ, closest.x - g.turretX);
          gs.fireCooldown = g.turretFireRate;
          gs.lastFireTime = this.world.time;
          if (Math.random() > freeAmmoChance) {
            gs.ammo = Math.max(0, gs.ammo - 1);
          }

          const dmg = Math.round(g.turretDamage * turretDmgMult);
          closest.hp -= dmg;
          this.tracers.push({
            sx: g.turretX,
            sz: g.turretZ,
            tx: closest.x,
            tz: closest.z,
            color: g.color,
            width: 4,
            t: 0,
            duration: 0.09
          });
          this.audio.playLaser();

          if (closest.hp <= 0) {
            this.handleEnemyKilled(closest);
          }
        }
      }

      this.player.attackTimer = Math.max(0, this.player.attackTimer - dt);
      if (this.player.attackTimer <= 0 && this.enemies.length > 0) {
        let target = null;
        let minDist = CFG.PLAYER.attackRange;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - this.player.x, e.z - this.player.z);
          if (d < minDist) {
            minDist = d;
            target = e;
          }
        }
        if (target) {
          this.player.attackTimer = CFG.PLAYER.attackCooldown;
          const eliteLvl = this.foreverSkills.perm_commander_elite || 0;
          const pDmg = Math.round(CFG.PLAYER.attackDamage * (1 + eliteLvl * 0.35));
          target.hp -= pDmg;
          this.tracers.push({
            sx: this.player.x,
            sz: this.player.z - 12,
            tx: target.x,
            tz: target.z,
            color: '#38bdf8',
            width: 3,
            t: 0,
            duration: 0.08
          });
          this.audio.playLaser();
          if (target.hp <= 0) {
            this.handleEnemyKilled(target);
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
          this.cash += 8;
          this.spawnFloatingText(s.x, s.z, `+$8 ⛏️ ORE`, '#38bdf8');
        }
      }

      for (let i = this.warDrops.length - 1; i >= 0; i--) {
        const d = this.warDrops[i];
        if (Math.hypot(this.player.x - d.x, this.player.z - d.z) < 75) {
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
        cashValue: isHulk ? 90 : 35,
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
          <strong>${breachedGate.name}</strong> reached <strong>0 HP</strong> and was breached by Automaton forces!<br><br>
          📊 <strong>Run Summary:</strong> Served <strong>${this.totalServed} Helldivers</strong> &amp; eliminated <strong>${this.totalKills} Enemies</strong>.<br>
          🎖️ <strong>Evacuated Reward:</strong> Earned <strong>+${bonusMedals} ⭐ Forever Warbond Medals</strong> (Total: <strong>${this.medals} ⭐</strong>).<br>
          🌟 <strong>All Permanent Skill Tree upgrades are 100% preserved forever!</strong>
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
      this.spawnFloatingText(this.player.x, this.player.z - 40, '🦅 NEW HELLPOD DEPLOYED — FOREVER SKILLS ACTIVE!', '#facc15');
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
        e.hp -= 220;
        this.explosions.push({ x: e.x, z: e.z, maxR: 95, t: 0, duration: 0.45 });
        if (e.hp <= 0) this.handleEnemyKilled(e);
      }
      this.enemies = this.enemies.filter((e) => e.hp > 0);

      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (gs && gs.unlocked) {
          gs.hp = Math.min(gs.maxHp, gs.hp + 200);
          gs.ammo = g.maxAmmo;
          this.explosions.push({ x: g.x, z: g.z - 90, maxR: 130, t: 0, duration: 0.5 });
        }
      }
      this.spawnFloatingText(this.player.x, this.player.z - 45, '🦅 500KG DROPPED! GATES REPAIRED & 2X FACTORY OVERCLOCK!', '#facc15');
    }

    updateHUD() {
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

      // Update inventory item badges
      for (const item of CFG.ITEMS) {
        const badge = document.getElementById(`inv-badge-${item.id}`);
        if (badge) {
          const count = this.player.inventory.filter((it) => it.id === item.id).length;
          badge.textContent = `${item.icon} ${count}`;
        }
      }

      const gateEl = document.getElementById('hud-gates-hp');
      if (gateEl) {
        let lowestPct = 100;
        let lowGateName = 'Alpha';
        for (const g of CFG.GATES) {
          const gs = this.gates[g.id];
          if (gs && gs.unlocked) {
            const pct = Math.round((gs.hp / gs.maxHp) * 100);
            if (pct < lowestPct) {
              lowestPct = pct;
              lowGateName = g.shortName;
            }
          }
        }
        gateEl.textContent = `${lowestPct}%`;
        gateEl.style.color = lowestPct > 50 ? '#4ade80' : (lowestPct > 25 ? '#facc15' : '#ef4444');

        const objEl = document.getElementById('objective-text');
        if (objEl) {
          const g1 = this.gates.gate_1;
          if (lowestPct < 45) {
            objEl.textContent = `🚨 WARNING: ${lowGateName} at ${lowestPct}% HP! Stand on its 🧱 Ammo/Repair Pad or call 🦅 500KG BOOST!`;
          } else if (g1 && g1.ammo === 0) {
            objEl.textContent = `⚠️ Gate Alpha Turret is OUT OF AMMO! Carry (搬) 🧱 Ammo from the Munitions Press or unlock the Ammo Conveyor Belt!`;
          } else {
            objEl.textContent = `DIRECTIVE: Sell 🔫 Guns ($${this.getItemSellPrice('gun')}) & 🦺 Cloth ($${this.getItemSellPrice('cloth')}), upgrade ⛏️ Raw Speed, and defend all 3 Gates!`;
          }
        }
      }
    }

    renderUpgradesModal() {
      const list = document.getElementById('upgrades-list');
      if (!list) return;
      list.innerHTML = '';

      // 1. Raw Material Drill Speed Upgrades
      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[raw.id];
        const cost = this.getRawUpgradeCost(raw.id);
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4>${raw.icon} ${raw.name} (Lv.${rs.level})</h4>
            <p>${raw.desc} Current cycle: ${rs.cycleTime.toFixed(2)}s</p>
          </div>
          <button class="buy-btn" ${this.cash < cost ? 'disabled' : ''}>
            ⬆️ $${cost}
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

      // 2. Factorio Conveyor Belt Automation Upgrades
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

      // 3. Standard SEAF Staff & Commander Upgrades
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
        const saved = rawJson || localStorage.getItem(CFG.STORAGE_KEY);
        if (!saved) return;
        const data = JSON.parse(saved);
        if (typeof data.medals === 'number') this.medals = data.medals;
        if (data.foreverSkills) Object.assign(this.foreverSkills, data.foreverSkills);
        if (typeof data.cash === 'number') this.cash = Math.max(80, data.cash);
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

      // Virtual Touch Joystick
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

      // Zoom Buttons
      document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
        this.world.setZoom(this.world.targetZoom + 0.14);
      });
      document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
        this.world.setZoom(this.world.targetZoom - 0.14);
      });
      document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
        this.world.setZoom(0.72);
      });

      // Stratagem Keypad Arrows + Trigger Button
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

      // Audio Toggle
      document.getElementById('btn-mute')?.addEventListener('click', () => {
        const enabled = this.audio.toggle();
        const btn = document.getElementById('btn-mute');
        if (btn) btn.textContent = enabled ? '🔊 Audio' : '🔇 Muted';
      });

      // Modals Open/Close
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

      // Defeat Modal Buttons
      document.getElementById('btn-redeploy-now')?.addEventListener('click', () => {
        this.redeployAfterDefeat();
      });
      document.getElementById('btn-defeat-open-skills')?.addEventListener('click', () => {
        this.renderSkillsModal();
        document.getElementById('modal-skills')?.classList.add('open');
      });

      // Save Modal
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

      // GitHub ZIP Modal
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
      if (statusEl) statusEl.textContent = '⏳ Packaging v0.0.02 modular repository (.zip)...';

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
      a.download = isFullPackage ? 'helldivers_please_v0.0.02_full_repo.zip' : 'helldivers_please_v0.0.02_update_code.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (statusEl) statusEl.textContent = `✅ Downloaded ${a.download} (v0.0.02)!`;
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.game = new HelldiversFactorioGame();
  });
})();
