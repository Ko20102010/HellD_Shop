// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.07 (All-Episode Carbot Art, Real-Item-Only Split Belts,
//                   7 Dedicated Item Counters & Smart SEAF AI Edition)
// Module: Core Simulation, Anti-Crush Obstacle Ejection, 1-Item Start,
//         Real-Packet Belt System (No Fake Items on Empty Belts),
//         Split Raw Belts (Purple E-710 / Cyan Iron), 7 Dedicated Counters,
//         Smart SEAF Task Dispatcher & All-Episode Carbot Enemy Roster
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

      // Persistent Forever Meta-Progression (Kept across Defeat & Prestige Ascension!)
      this.medals = 3;
      this.prestigeCount = 0;
      this.highestWave = 1;
      this.lifetimeServed = 0;
      this.lifetimeKills = 0;
      this.playTimeSeconds = 0;
      this.claimedMilestones = {};

      this.foreverSkills = {};
      for (const sk of CFG.PERMANENT_SKILLS) {
        this.foreverSkills[sk.id] = 0;
      }

      // Mindustry Visual Tech Tree Nodes (core_shard starts at Lv.1!)
      this.techNodes = { core_shard: 1 };
      for (const tn of (CFG.MINDUSTRY_TECH_NODES || [])) {
        if (tn.id !== 'core_shard') this.techNodes[tn.id] = 0;
      }
      this.selectedTechNodeId = 'tech_pneumatic_drill';

      // Mindustry Multi-Base Planetary Sector Network
      this.unlockedBases = { base_alpha: true };
      this.activeBaseId = 'base_alpha';
      this.basePassiveReqTimer = 0;
      this.baseLaunchTimer = 0;

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
      this.customerSpawnTimer = 0.8;
      this.cashierTimer = 0;
      this.conveyorTickTimer = 0;
      this.rawPadCooldown = 0;
      this.gatePadCooldown = 0;
      this.stationPadCooldown = 0;
      this.beltPadCooldown = 0;
      this.armoryPadCooldown = 0;
      this.droneFireTimer = 0;
      this.stratagemCooldown = 0;
      this.stratagemBuffTimer = 0;
      this.milestoneCheckTimer = 1.0;

      // Load v0.0.06 save state
      this.loadGame();

      // Ensure starter setup (ONLY 🦺 Cloth unlocked at start, player never trapped)
      this.ensureStarterSetup();

      // Build Character Showcase Modal Cards (16 Units — Ep1 to Ep10+)
      this.initCharacterShowcaseModal();

      // Bind UI & Input
      this.bindEvents();
      this.updateHUD();

      // Spawn initial Helldiver customers ordering 🦺 Cloth at Counter #1
      this.spawnCustomer('cloth');
      this.spawnCustomer('cloth');

      // Render first frame immediately so canvas is never black
      this.world.render(this, 0.016);
      this.renderCharacterShowcaseFrame(0.016);

      // Start 60FPS loop
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    // ========================================================================
    // INITIALIZE & ANIMATE 16-CHARACTER SHOWCASE MODAL (Carbot Ep1–Ep10+)
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

    getEquippedItems() {
      const eq = CFG.COMMANDER_EQUIPMENT;
      return {
        weapon: eq.weapon.find((w) => w.id === this.equipped.weapon) || eq.weapon[0],
        armor: eq.armor.find((a) => a.id === this.equipped.armor) || eq.armor[0],
        backpack: eq.backpack.find((b) => b.id === this.equipped.backpack) || eq.backpack[0],
        mount: eq.mount.find((m) => m.id === this.equipped.mount) || eq.mount[0]
      };
    }

    getCurrentPlanet() {
      const w = this.waveNumber || 1;
      for (const p of CFG.CAMPAIGN_PLANETS) {
        if (w >= p.waveStart && w <= p.waveEnd) return p;
      }
      return CFG.CAMPAIGN_PLANETS[CFG.CAMPAIGN_PLANETS.length - 1];
    }

    getPrestigeMultiplier() {
      return Math.pow(2.0, this.prestigeCount || 0);
    }

    getActiveBaseConfig() {
      const list = CFG.MINDUSTRY_BASES || [];
      return list.find((b) => b.id === this.activeBaseId) || list[0] || {
        id: 'base_alpha',
        code: 'SECTOR ALPHA-01',
        name: 'Base 1: Angels Venture Core',
        ironMult: 1.0,
        e710Mult: 1.0,
        sellMult: 1.0,
        floorTint: '#141c2b'
      };
    }

    getTechNodeLevel(nodeId) {
      const node = (CFG.MINDUSTRY_TECH_NODES || []).find((n) => n.id === nodeId);
      if (!node) return 0;
      if (node.linkedPermId) {
        const permVal = this.foreverSkills?.[node.linkedPermId] || 0;
        const nodeVal = this.techNodes?.[nodeId] || (nodeId === 'core_shard' ? 1 : 0);
        return Math.max(permVal, nodeVal);
      }
      return this.techNodes?.[nodeId] || (nodeId === 'core_shard' ? 1 : 0);
    }

    getTotalPassiveBaseIncome() {
      const launchMult = 1 + this.getTechNodeLevel('tech_launch_pads') * 0.35;
      let total = 0;
      for (const b of (CFG.MINDUSTRY_BASES || [])) {
        if (this.unlockedBases?.[b.id]) {
          total += Math.round((b.passiveReqPerSec || 0) * launchMult);
        }
      }
      return total;
    }

    setViewMode(mode) {
      this.viewMode = mode === 'war' ? 'war' : 'shop';
      const shopBtn = document.getElementById('btn-mode-shop');
      const warBtn = document.getElementById('btn-mode-war');
      const warDock = document.getElementById('war-command-dock');

      if (this.viewMode === 'war') {
        shopBtn?.classList.remove('active-shop');
        warBtn?.classList.add('active-war');
        warDock?.classList.add('visible');
        const fg = this.getActiveFrontGate();
        this.player.x = 0;
        this.player.z = fg.ammoPadZ;
        this.pointerTarget = null;
        this.world.camX = 0;
        this.world.camZ = fg.z + 80;
        this.spawnFloatingText(this.player.x, this.player.z - 40, '⚔️ WAR FRONT COMMAND ACTIVE — DEPLOY UNITS BELOW!', '#ef4444');
      } else {
        warBtn?.classList.remove('active-war');
        shopBtn?.classList.add('active-shop');
        warDock?.classList.remove('visible');
        if (this.player.z < -160) {
          this.player.x = -120;
          this.player.z = 240;
          this.pointerTarget = null;
          this.world.camX = -120;
          this.world.camZ = 240;
        }
        this.spawnFloatingText(this.player.x, this.player.z - 40, '🏪 SHOP & FACTORY VIEW ACTIVE', '#4ade80');
      }
      this.updateHUD();
    }

    deployWarUnit(deployId) {
      const dCfg = (CFG.WAR_DEPLOYMENTS || []).find((d) => d.id === deployId);
      if (!dCfg) return;

      if (deployId === 'build_mender') {
        const curLvl = this.mendProjectorLevel || 0;
        if (curLvl >= 20) return;
        const cost = Math.round(160 * Math.pow(1.35, curLvl));
        if (this.cash < cost) {
          this.spawnFloatingText(this.player.x, this.player.z - 35, `⚠️ NEED $${cost} FOR MEND TOWER`, '#ef4444');
          return;
        }
        this.cash -= cost;
        this.mendProjectorLevel = curLvl + 1;
        this.audio.playUnlock();
        this.spawnFloatingText(this.player.x, this.player.z - 45, `💚 MINDUSTRY MEND PROJECTOR Lv.${this.mendProjectorLevel}/20 ONLINE!`, '#4ade80');
        this.updateHUD();
        return;
      }

      // Check if player has 1x of `dCfg.itemCostId` in hand inventory, factory station stock, or counter buffer!
      const itemId = dCfg.itemCostId;
      let consumedItem = false;
      const invIdx = this.player.inventory.findIndex((it) => it.id === itemId);
      if (invIdx !== -1) {
        this.player.inventory.splice(invIdx, 1);
        consumedItem = true;
      } else if ((this.stations[itemId]?.stock || 0) > 0) {
        this.stations[itemId].stock--;
        consumedItem = true;
      } else if ((this.counterBuffer[itemId] || 0) > 0) {
        this.counterBuffer[itemId]--;
        consumedItem = true;
      }

      const discountMult = Math.max(0.4, 1 - this.getTechNodeLevel('tech_mech_drydock') * 0.04);
      const cashCost = Math.round(dCfg.cashFallbackCost * discountMult);

      if (!consumedItem) {
        if (this.cash < cashCost) {
          this.spawnFloatingText(this.player.x, this.player.z - 35, `⚠️ NEED 1x ${itemId.toUpperCase()} OR $${cashCost}!`, '#ef4444');
          return;
        }
        this.cash -= cashCost;
      }

      const cmdLvl = this.getTechNodeLevel('tech_war_unit_command');
      const hpMult = 1 + cmdLvl * 0.40;
      const dmgMult = 1 + cmdLvl * 0.35;
      const fg = this.getActiveFrontGate();
      const maxHp = Math.round(dCfg.hp * hpMult);

      this.alliedUnits.push({
        id: Math.random(),
        unitType: deployId,
        label: dCfg.name,
        x: (Math.random() - 0.5) * 260,
        z: fg.z - 55,
        hp: maxHp,
        maxHp,
        damage: Math.round(dCfg.damage * dmgMult),
        fireRate: dCfg.fireRate,
        fireCooldown: 0,
        range: dCfg.range,
        speed: dCfg.speed,
        color: dCfg.color,
        patrolDir: Math.random() > 0.5 ? 1 : -1
      });

      this.audio.playUnlock();
      this.spawnFloatingText(
        0,
        fg.z - 60,
        consumedItem ? `⚔️ DEPLOYED ${dCfg.name.toUpperCase()} (USED 1x FACTORY ITEM)!` : `⚔️ DEPLOYED ${dCfg.name.toUpperCase()} ($${cashCost})!`,
        dCfg.color
      );
      this.updateHUD();
    }

    // ========================================================================
    // INITIALIZE RUN STATE (ONLY 🦺 CLOTH UNLOCKED AT START! ALL 6 BELTS Lv.0!)
    // ========================================================================
    initRunState() {
      const grantLvl = this.foreverSkills?.perm_start_grant || 0;
      this.cash = 60 + grantLvl * 150;
      this.cashOnGround = 30;
      this.totalServed = 0;
      this.totalKills = 0;
      this.isDefeated = false;

      // Wave & Rest System State
      this.waveNumber = 1;
      this.waveState = 'rest';
      this.waveTimer = CFG.WAVE_CONFIG.initialRestTime;
      this.waveTotalEnemies = CFG.WAVE_CONFIG.baseEnemyCount;
      this.waveEnemiesToSpawn = 0;
      this.waveSpawnCooldown = 0;

      this.player = {
        x: -100,
        z: 220,
        walkPhase: 0,
        inventory: [],
        attackTimer: 0
      };

      // Raw Quarry Extractors start at Lv.0 (Locked — Manual Harvest at Start!)
      this.rawExtractors = {};
      for (const raw of CFG.RAW_EXTRACTORS) {
        this.rawExtractors[raw.id] = {
          level: raw.unlockedAtStart ? 1 : 0,
          stock: 0,
          maxBuffer: raw.baseBuffer,
          progress: 0,
          cycleTime: raw.baseCycleTime
        };
      }

      // Munitions Ammo Press starts at Lv.0 (Locked — Unlock for $130!)
      this.ammoPress = {
        level: CFG.AMMO_PRESS.unlockedAtStart ? 1 : 0,
        inputStock: {
          raw_iron: (CFG.AMMO_PRESS.initialInput?.raw_iron || 6) + grantLvl * 2
        },
        stock: CFG.AMMO_PRESS.initialStock || 9,
        maxBuffer: CFG.AMMO_PRESS.maxBuffer,
        progress: 0,
        cycleTime: CFG.AMMO_PRESS.baseCycleTime
      };

      // Three Sequential Defense Gate Layers (Outer Gate 3 -> Middle Gate 2 -> Inner Gate 1)
      this.gates = {};
      const armorLvl = this.foreverSkills?.perm_gate_armor || 0;
      const hpMult = 1 + armorLvl * 0.3;
      for (const g of CFG.GATES) {
        const maxHp = Math.round(g.baseMaxHp * hpMult);
        this.gates[g.id] = {
          unlocked: true,
          defenseLevel: 1,
          broken: false,
          hp: maxHp,
          maxHp: maxHp,
          ammo: g.initialAmmo,
          maxAmmo: g.maxAmmo,
          turretAngle: -Math.PI / 2,
          fireCooldown: 0,
          lastFireTime: -10,
          lastHitTime: -10
        };
      }

      // All 6 Conveyor Belts start at Lv.0 (LOCKED — NOT AUTOMATED AT START!)
      this.conveyorLevels = {};
      this.conveyors = {};
      this.conveyorRemaining = {};
      for (const c of CFG.CONVEYORS) {
        this.conveyorLevels[c.id] = 0;
        this.conveyors[c.id] = false;
        this.conveyorRemaining[c.id] = c.baseCost;
      }

      // Real In-Transit Conveyor Belt Packets (Empty when no items are moving!)
      this.beltPackets = [];

      // Items: ONLY `cloth` (Tier 1) is unlocked at start (Lv.1)! All other 6 items start at Lv.0!
      // Each item has its OWN Dedicated Counter Buffer (`this.counterBuffer[item.id]`)
      // and its OWN Dedicated Counter Cash Vault (`this.counterCash[item.id]`)!
      this.unlocked = {};
      this.unlockRemaining = {};
      this.stations = {};
      this.counterBuffer = {};
      this.counterCash = {};
      for (const item of CFG.ITEMS) {
        const isStart = !!item.unlockedAtStart;
        this.unlocked[item.id] = isStart;
        this.unlockRemaining[item.id] = item.unlockCost;
        this.stations[item.id] = {
          level: isStart ? 1 : 0,
          inputStock: {
            raw_iron: (item.initialInput?.raw_iron || 0) + (item.recipe.raw_iron ? grantLvl * 2 : 0),
            raw_e710: (item.initialInput?.raw_e710 || 0) + (item.recipe.raw_e710 ? grantLvl * 2 : 0)
          },
          stock: isStart ? (item.initialStock || 2) : 0,
          maxBuffer: item.maxBuffer,
          progress: 0,
          cycleTime: item.cycleTime
        };
        this.counterBuffer[item.id] = isStart ? 2 : 0;
        this.counterCash[item.id] = isStart ? 30 : 0;
      }
      this.syncTotalCashOnGround();

      this.upgrades = {};
      for (const upg of CFG.UPGRADES) {
        this.upgrades[upg.id] = 0;
      }

      this.viewMode = 'shop';
      this.mendProjectorLevel = 0;
      this.mendTickTimer = 0;
      this.alliedUnits = [];
      this.workers = [];
      this.customers = [];
      this.enemies = [];
      this.warDrops = [];
      this.flyingArcs = [];
      this.tracers = [];
      this.explosions = [];
      this.eagleFlyover = null;

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

    syncTotalCashOnGround() {
      let sum = 0;
      if (this.counterCash) {
        for (const k of Object.keys(this.counterCash)) {
          sum += (this.counterCash[k] || 0);
        }
      }
      this.cashOnGround = sum;
    }

    ensureStarterSetup() {
      this.unlocked.cloth = true;
      if (!this.stations.cloth.level || this.stations.cloth.level < 1) {
        this.stations.cloth.level = 1;
      }
      if ((this.stations.cloth?.stock || 0) < 1 && (this.counterBuffer.cloth || 0) < 1 && this.totalServed === 0) {
        this.stations.cloth.stock = 2;
        this.stations.cloth.inputStock.raw_e710 = Math.max(4, this.stations.cloth.inputStock.raw_e710 || 0);
        this.counterBuffer.cloth = 2;
      }

      if (this.player.inventory.length === 0 && this.totalServed === 0) {
        const clothCfg = this.getItemConfig('cloth');
        this.player.inventory.push(
          { id: 'cloth', icon: clothCfg.icon, color: clothCfg.color },
          { id: 'cloth', icon: clothCfg.icon, color: clothCfg.color },
          { id: 'raw_e710', icon: '🛢️', color: '#a855f7' }
        );
      }

      for (const c of CFG.CONVEYORS) {
        const lvl = this.conveyorLevels[c.id] || 0;
        this.conveyors[c.id] = lvl > 0;
      }

      this.syncTotalCashOnGround();
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
      const itemCfg = typeof item === 'object' ? item : this.getItemConfig(item);
      const base = itemCfg?.sellPrice || 30;
      const stLvl = this.stations[itemCfg?.id]?.level || 1;
      const machineQualityMult = 1 + (stLvl - 1) * 0.12;
      const permLvl = this.foreverSkills.perm_gun_value || 0;
      const eq = this.getEquippedItems();
      const armorBonus = eq.armor?.sellBonus || 0;
      const planetMult = this.getCurrentPlanet().reqMult || 1.0;
      const baseSellMult = this.getActiveBaseConfig().sellMult || 1.0;
      const prestigeMult = this.getPrestigeMultiplier();
      const buff = this.stratagemBuffTimer > 0 ? 1.5 : 1.0;
      return Math.round(base * machineQualityMult * (1 + permLvl * 0.20 + armorBonus) * planetMult * baseSellMult * prestigeMult * buff);
    }

    getPlayerMaxCapacity() {
      const rigLvl = this.upgrades.player_exo_rig || 0;
      const grantLvl = this.foreverSkills.perm_start_grant || 0;
      const eq = this.getEquippedItems();
      const eqBonus = (eq.armor?.bonusCap || 0) + (eq.backpack?.bonusCap || 0) + (eq.mount?.bonusCap || 0);
      return CFG.PLAYER.baseCapacity + rigLvl * 3 + grantLvl * 2 + eqBonus;
    }

    getPlayerMoveSpeed() {
      const bootLvl = this.upgrades.player_boots || 0;
      const eliteLvl = this.foreverSkills.perm_commander_elite || 0;
      const eq = this.getEquippedItems();
      const armorSpeed = eq.armor?.speedMult || 1.0;
      const mountSpeed = eq.mount?.speedMult || 1.0;
      const sprint = (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.sprintToggle) ? CFG.PLAYER.sprintMultiplier : 1.0;
      const strat = this.stratagemBuffTimer > 0 ? 1.35 : 1.0;
      return CFG.PLAYER.baseSpeed * (1 + bootLvl * 0.08) * (1 + eliteLvl * 0.10) * armorSpeed * mountSpeed * sprint * strat;
    }

    // ------------------------------------------------------------------------
    // 20-LEVEL COST FORMULAS FOR QUARRY, AMMO PRESS, MACHINES, BELTS & GATES
    // ------------------------------------------------------------------------
    getRawUpgradeCost(rawId) {
      const rawCfg = CFG.RAW_EXTRACTORS.find((r) => r.id === rawId);
      const lvl = this.rawExtractors[rawId]?.level || 0;
      if (lvl === 0) return rawCfg.unlockCost || 110;
      return Math.round(rawCfg.baseUpgradeCost * Math.pow(rawCfg.costScale, lvl));
    }

    getAmmoPressUpgradeCost() {
      const AP = CFG.AMMO_PRESS;
      const lvl = this.ammoPress?.level || 0;
      if (lvl === 0) return AP.unlockCost || 130;
      return Math.round(AP.baseUpgradeCost * Math.pow(AP.costScale, lvl));
    }

    getStationUpgradeCost(itemId) {
      const itemCfg = this.getItemConfig(itemId);
      const lvl = this.stations[itemId]?.level || 1;
      return Math.round((itemCfg.baseUpgradeCost || 100) * Math.pow(itemCfg.costScale || 1.35, lvl - 1));
    }

    getConveyorUpgradeCost(convId) {
      const cCfg = CFG.CONVEYORS.find((c) => c.id === convId);
      const lvl = this.conveyorLevels?.[convId] || 0;
      return Math.round((cCfg?.baseCost || 150) * Math.pow(cCfg?.costScale || 1.35, lvl));
    }

    getGateUpgradeCost(gateId) {
      const gCfg = CFG.GATES.find((g) => g.id === gateId);
      const lvl = this.gates[gateId]?.defenseLevel || 1;
      return Math.round((gCfg?.baseUpgradeCost || 160) * Math.pow(gCfg?.costScale || 1.35, lvl - 1));
    }

    recalcDerivedStats() {
      const rawUpgLvl = this.upgrades.raw_speed_boost || 0;
      const permRawLvl = this.getTechNodeLevel('tech_pneumatic_drill');
      const overdriveDomeLvl = this.getTechNodeLevel('tech_overdrive_dome');
      const factoryLvl = (this.upgrades.factory_overclock || 0) + overdriveDomeLvl;
      const activeBaseCfg = this.getActiveBaseConfig();
      const e710BeltLvl = this.conveyorLevels?.conv_raw_e710 || 0;
      const ironBeltLvl = this.conveyorLevels?.conv_raw_iron || 0;
      const stratBonus = this.stratagemBuffTimer > 0 ? 2.0 : 1.0;
      const prestigeMult = this.getPrestigeMultiplier();

      // 1. Raw Quarry Extractors (Lv.0 = Off, Lv.1..20 = Active)
      for (const rawCfg of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[rawCfg.id];
        if (!rs) continue;
        const lvl = rs.level || 0;
        rs.maxBuffer = rawCfg.baseBuffer + lvl * 4 + rawUpgLvl * 3;
        if (lvl > 0) {
          const baseDepositMult = rawCfg.id === 'raw_e710' ? (activeBaseCfg.e710Mult || 1.0) : (activeBaseCfg.ironMult || 1.0);
          const speedMult = (1 + (lvl - 1) * 0.22) * (1 + rawUpgLvl * 0.25) * (1 + permRawLvl * 0.25) * baseDepositMult * stratBonus * prestigeMult;
          rs.cycleTime = Math.max(0.16, rawCfg.baseCycleTime / speedMult);
        } else {
          rs.cycleTime = rawCfg.baseCycleTime;
        }
      }

      // 2. Munitions Ammo Press (Lv.0 = Off, Lv.1..20 = Active)
      const apLvl = this.ammoPress.level || 0;
      const ironBeltBonus = ironBeltLvl > 0 ? (1 + ironBeltLvl * 0.08) : 1.0;
      this.ammoPress.maxBuffer = CFG.AMMO_PRESS.maxBuffer + apLvl * 4;
      if (apLvl > 0) {
        const ammoSpeedMult = (1 + (apLvl - 1) * 0.20) * (1 + rawUpgLvl * 0.20) * (1 + permRawLvl * 0.25) * ironBeltBonus * stratBonus;
        this.ammoPress.cycleTime = Math.max(0.18, CFG.AMMO_PRESS.baseCycleTime / ammoSpeedMult);
      } else {
        this.ammoPress.cycleTime = CFG.AMMO_PRESS.baseCycleTime;
      }

      // 3. Arsenal Factory Stations (Lv.1..20)
      for (const item of CFG.ITEMS) {
        const st = this.stations[item.id];
        if (!st) continue;
        const stLvl = Math.max(1, st.level || 1);
        st.maxBuffer = item.maxBuffer + (stLvl - 1) * 2;
        const linkedRawLvl = this.rawExtractors[item.rawType]?.level || 0;
        const beltLvlForStation = item.rawType === 'raw_e710' ? e710BeltLvl : ironBeltLvl;
        const stationBeltBonus = beltLvlForStation > 0 ? (1 + beltLvlForStation * 0.08) : 1.0;
        const prodSpeed = (1 + (stLvl - 1) * 0.15) * (1 + factoryLvl * 0.15) * (1 + linkedRawLvl * 0.08) * stationBeltBonus * stratBonus;
        st.cycleTime = Math.max(0.22, item.cycleTime / prodSpeed);
      }

      // 4. 3-Layer Defense Gates (Lv.1..20 — Broken gates NEVER auto-gain HP!)
      const armorLvl = this.foreverSkills.perm_gate_armor || 0;
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs) continue;
        const defLvl = gs.defenseLevel || 1;
        gs.maxAmmo = g.maxAmmo + (defLvl - 1) * 5;
        const hpMult = (1 + armorLvl * 0.30) * (1 + (defLvl - 1) * 0.28);
        const newMax = Math.round(g.baseMaxHp * hpMult);
        if (newMax > gs.maxHp && !gs.broken && gs.hp > 0) {
          gs.hp += (newMax - gs.maxHp);
        }
        gs.maxHp = newMax;
      }
    }

    // ========================================================================
    // SOLID OBSTACLES & ANTI-CRUSH EJECTION SAFETY
    // ========================================================================
    buildSolidObstacles() {
      const boxes = [];
      const W = CFG.WORLD;
      const cMinX = W.corridorMinX;
      const cMaxX = W.corridorMaxX;
      const halfOpen = W.gateOpeningWidth * 0.5;

      // Flanking canyon walls outside the Northern War Corridor
      boxes.push({ minX: W.minX, maxX: cMinX, minZ: W.minZ, maxZ: W.wallZ });
      boxes.push({ minX: cMaxX, maxX: W.maxX, minZ: W.minZ, maxZ: W.wallZ });

      // 3 Gate Layer Blast Walls
      for (const g of CFG.GATES) {
        boxes.push({ minX: cMinX, maxX: -halfOpen - 10, minZ: g.z - 22, maxZ: g.z + 22 });
        boxes.push({ minX: halfOpen + 10, maxX: cMaxX, minZ: g.z - 22, maxZ: g.z + 22 });
      }

      // Unlocked Raw Extractor Auto-Drill Rigs (Only solid when level > 0!)
      for (const raw of CFG.RAW_EXTRACTORS) {
        if ((this.rawExtractors[raw.id]?.level || 0) > 0) {
          boxes.push({ minX: raw.x - 95, maxX: raw.x + 95, minZ: raw.z - 65, maxZ: raw.z + 65 });
        }
      }

      // Unlocked Munitions Press Machine (Only solid when level > 0!)
      const AP = CFG.AMMO_PRESS;
      if ((this.ammoPress?.level || 0) > 0) {
        boxes.push({ minX: AP.x - 54, maxX: AP.x + 54, minZ: AP.z - 54, maxZ: AP.z + 54 });
      }

      // Unlocked Arsenal Fabricator Machines & Dedicated Item Counters
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const p = item.stationPos;
        boxes.push({ minX: p.x - 52, maxX: p.x + 52, minZ: p.z - 52, maxZ: p.z + 52 });

        // Dedicated Sales Counter Table for this unlocked item
        const cp = item.counterPos;
        boxes.push({ minX: cp.x - 68, maxX: cp.x + 68, minZ: cp.z - 42, maxZ: cp.z + 42 });
      }

      this.obstacles = boxes;

      // Immediately eject the player & workers if any newly built machine/counter overlaps them!
      if (this.player) this.ejectEntityFromObstacles(this.player, 24);
      if (this.workers) {
        for (const w of this.workers) this.ejectEntityFromObstacles(w, 20);
      }
    }

    ejectEntityFromObstacles(entity, radius = 24) {
      if (!this.obstacles) return;
      for (const b of this.obstacles) {
        if (
          entity.x + radius > b.minX &&
          entity.x - radius < b.maxX &&
          entity.z + radius > b.minZ &&
          entity.z - radius < b.maxZ
        ) {
          const dLeft = Math.abs((entity.x + radius) - b.minX);
          const dRight = Math.abs(b.maxX - (entity.x - radius));
          const dTop = Math.abs((entity.z + radius) - b.minZ);
          const dBottom = Math.abs(b.maxZ - (entity.z - radius));
          const minD = Math.min(dLeft, dRight, dTop, dBottom);
          if (minD === dBottom) entity.z = b.maxZ + radius + 6;
          else if (minD === dTop) entity.z = b.minZ - radius - 6;
          else if (minD === dRight) entity.x = b.maxX + radius + 6;
          else entity.x = b.minX - radius - 6;
        }
      }
    }

    moveWithCollision(entity, dx, dz, radius = 20) {
      this.ejectEntityFromObstacles(entity, radius);

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
      this.playTimeSeconds += dt;
      if (this.stratagemCooldown > 0) this.stratagemCooldown = Math.max(0, this.stratagemCooldown - dt);
      if (this.stratagemBuffTimer > 0) {
        this.stratagemBuffTimer = Math.max(0, this.stratagemBuffTimer - dt);
        if (this.stratagemBuffTimer === 0) this.recalcDerivedStats();
      }
      if (this.rawPadCooldown > 0) this.rawPadCooldown = Math.max(0, this.rawPadCooldown - dt);
      if (this.gatePadCooldown > 0) this.gatePadCooldown = Math.max(0, this.gatePadCooldown - dt);
      if (this.stationPadCooldown > 0) this.stationPadCooldown = Math.max(0, this.stationPadCooldown - dt);
      if (this.beltPadCooldown > 0) this.beltPadCooldown = Math.max(0, this.beltPadCooldown - dt);
      if (this.armoryPadCooldown > 0) this.armoryPadCooldown = Math.max(0, this.armoryPadCooldown - dt);
      if (this.harvestCooldown > 0) this.harvestCooldown = Math.max(0, this.harvestCooldown - dt);

      this.updatePlayerMovement(dt);
      this.updateRawAndAmmoProduction(dt);
      this.updateArsenalFactories(dt);
      this.updateConveyorAutomation(dt);
      this.updateBeltPackets(dt);
      this.updatePlayerInteractions(dt);
      this.updateWorkers(dt);
      this.updateCustomersAndSales(dt);
      this.updateWaveAndGates(dt);
      this.updateMindustryBasesAndAllies(dt);
      this.updateVisualEffects(dt);
      this.checkMilestones(dt);
      this.updateHUD();
    }

    updateMindustryBasesAndAllies(dt) {
      // 1. Mindustry Multi-Base Passive $REQ & Orbital Launch Pad Resource Shipments
      this.basePassiveReqTimer = (this.basePassiveReqTimer || 0) + dt;
      if (this.basePassiveReqTimer >= 1.0) {
        this.basePassiveReqTimer -= 1.0;
        const passiveIncome = this.getTotalPassiveBaseIncome();
        if (passiveIncome > 0) {
          this.cash += passiveIncome;
        }
      }

      this.baseLaunchTimer = (this.baseLaunchTimer || 0) + dt;
      if (this.baseLaunchTimer >= 10.0) {
        this.baseLaunchTimer -= 10.0;
        const launchMult = 1 + this.getTechNodeLevel('tech_launch_pads') * 0.35;
        let bonusE710 = 0;
        let bonusIron = 0;
        let bonusAmmo = 0;
        for (const b of (CFG.MINDUSTRY_BASES || [])) {
          if (!this.unlockedBases?.[b.id] || b.id === this.activeBaseId) continue;
          bonusE710 += Math.round((b.passiveE710Per10s || 0) * launchMult);
          bonusIron += Math.round((b.passiveIronPer10s || 0) * launchMult);
          bonusAmmo += Math.round((b.passiveAmmoPer10s || 0) * launchMult);
        }
        if (bonusE710 > 0 && this.rawExtractors.raw_e710) {
          this.rawExtractors.raw_e710.stock = Math.min(this.rawExtractors.raw_e710.maxBuffer + 20, this.rawExtractors.raw_e710.stock + bonusE710);
          if (this.stations.cloth) this.stations.cloth.inputStock.raw_e710 = (this.stations.cloth.inputStock.raw_e710 || 0) + Math.ceil(bonusE710 * 0.5);
        }
        if (bonusIron > 0 && this.rawExtractors.raw_iron) {
          this.rawExtractors.raw_iron.stock = Math.min(this.rawExtractors.raw_iron.maxBuffer + 20, this.rawExtractors.raw_iron.stock + bonusIron);
        }
        if (bonusAmmo > 0) {
          for (const g of CFG.GATES) {
            const gs = this.gates[g.id];
            if (gs) gs.ammo = Math.min(gs.maxAmmo || g.maxAmmo, gs.ammo + bonusAmmo);
          }
        }
        if (bonusE710 > 0 || bonusIron > 0) {
          this.spawnFloatingText(-520, -130, `🚀 ORBITAL LAUNCH PAD: +${bonusE710}🛢️ +${bonusIron}⛏️`, '#38bdf8');
        }
      }

      // 2. Mindustry Mend Projectors behind Gate Layers (`this.mendProjectorLevel > 0`)
      if ((this.mendProjectorLevel || 0) > 0) {
        const mendTechBonus = 1 + this.getTechNodeLevel('tech_mend_projector') * 0.35;
        const healPerSec = this.mendProjectorLevel * 12 * mendTechBonus;
        for (const g of CFG.GATES) {
          const gs = this.gates[g.id];
          if (!gs) continue;
          if (gs.hp < gs.maxHp) {
            gs.hp = Math.min(gs.maxHp, gs.hp + healPerSec * dt);
            if (gs.hp >= gs.maxHp * 0.25) gs.broken = false;
          }
        }
        this.mendTickTimer = (this.mendTickTimer || 0) + dt;
        if (this.mendTickTimer >= 4.0) {
          this.mendTickTimer = 0;
          for (const g of CFG.GATES) {
            const gs = this.gates[g.id];
            if (gs) gs.ammo = Math.min(gs.maxAmmo || g.maxAmmo, gs.ammo + Math.ceil(this.mendProjectorLevel * 0.5));
          }
        }
      }

      // 3. Allied War-Front Units (`this.alliedUnits`) Patrol & Combat
      const fg = this.getActiveFrontGate();
      const targetZ = fg.z - 55;
      for (let i = this.alliedUnits.length - 1; i >= 0; i--) {
        const u = this.alliedUnits[i];
        u.fireCooldown = Math.max(0, u.fireCooldown - dt);

        // Find closest enemy
        let closest = null;
        let minDist = u.range || 380;
        for (const e of this.enemies) {
          if (e.hp <= 0) continue;
          const d = Math.hypot(e.x - u.x, e.z - u.z);
          if (d < minDist) {
            minDist = d;
            closest = e;
          }
        }

        if (closest) {
          if (u.fireCooldown <= 0) {
            u.fireCooldown = u.fireRate || 0.3;
            closest.hp -= u.damage;
            this.tracers.push({
              sx: u.x,
              sz: u.z - 12,
              tx: closest.x,
              tz: closest.z,
              color: u.color || '#38bdf8',
              width: u.unitType === 'deploy_mech' ? 5.5 : 3.2,
              t: 0,
              duration: 0.09
            });
            if (u.unitType === 'deploy_mech') {
              this.explosions.push({ x: closest.x, z: closest.z, maxR: 42, t: 0, duration: 0.2 });
            }
            this.audio.playLaser();
            if (closest.hp <= 0) {
              this.handleEnemyKilled(closest);
            }
          }
        } else {
          // Patrol horizontally in front of the active Front Gate
          const dz = targetZ - u.z;
          if (Math.abs(dz) > 20) {
            u.z += Math.sign(dz) * u.speed * dt;
          } else {
            u.x += u.patrolDir * u.speed * 0.65 * dt;
            if (u.x > 260) u.patrolDir = -1;
            if (u.x < -260) u.patrolDir = 1;
          }
        }
      }
      this.enemies = this.enemies.filter((e) => e.hp > 0);
    }

    checkMilestones(dt) {
      this.milestoneCheckTimer -= dt;
      if (this.milestoneCheckTimer > 0) return;
      this.milestoneCheckTimer = 1.5;

      for (const ms of CFG.MILESTONES) {
        if (this.claimedMilestones[ms.id]) continue;
        if (ms.check(this)) {
          this.claimedMilestones[ms.id] = true;
          this.medals += ms.rewardMedals;
          this.audio.playUnlock();
          this.spawnFloatingText(
            this.player.x,
            this.player.z - 55,
            `🏆 MILESTONE: ${ms.name.toUpperCase()} (+${ms.rewardMedals} ⭐ MEDALS!)`,
            '#fde047'
          );
          this.saveGame();
        }
      }
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
    // RAW QUARRY AUTO-DRILLS (ONLY IF Lv.1+) & RECIPE-BASED PRODUCTION
    // ========================================================================
    updateRawAndAmmoProduction(dt) {
      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[raw.id];
        if (!rs || (rs.level || 0) <= 0) continue;
        if (rs.stock < rs.maxBuffer) {
          rs.progress += dt;
          if (rs.progress >= rs.cycleTime) {
            rs.progress = 0;
            const batch = 1 + Math.floor((rs.level - 1) / 4);
            rs.stock = Math.min(rs.maxBuffer, rs.stock + batch);
          }
        }
      }

      if ((this.ammoPress.level || 0) >= 1) {
        const apIn = this.ammoPress.inputStock;
        const reqIron = CFG.AMMO_PRESS.recipe.raw_iron || 1;
        if (this.ammoPress.stock < this.ammoPress.maxBuffer && (apIn.raw_iron || 0) >= reqIron) {
          this.ammoPress.progress += dt;
          if (this.ammoPress.progress >= this.ammoPress.cycleTime) {
            this.ammoPress.progress = 0;
            const saveChance = Math.min(0.50, (this.foreverSkills.perm_raw_speed || 0) * 0.025);
            if (Math.random() > saveChance) {
              apIn.raw_iron = Math.max(0, apIn.raw_iron - reqIron);
            }
            const outBatch = (CFG.AMMO_PRESS.outputBatch || 3) + Math.floor((this.ammoPress.level - 1) / 5);
            this.ammoPress.stock = Math.min(this.ammoPress.maxBuffer, this.ammoPress.stock + outBatch);
          }
        }
      }
    }

    updateArsenalFactories(dt) {
      const saveChance = Math.min(0.50, (this.foreverSkills.perm_raw_speed || 0) * 0.025);
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const st = this.stations[item.id];
        if (!st || (st.level || 0) <= 0) continue;
        const maxBuf = st.maxBuffer || item.maxBuffer;
        if (st.stock < maxBuf && this.hasStationIngredients(item, st)) {
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

    // ========================================================================
    // REAL-PACKET SPLIT CONVEYOR BELT AUTOMATION (NO FAKE ITEMS ON EMPTY BELTS!)
    // - Spawns physical packets in `this.beltPackets` ONLY when source has stock > 0!
    // - Delivers the items when the packet reaches 100% progress along its belt path!
    // ========================================================================
    countInFlightToTarget(targetKey) {
      let sum = 0;
      for (const pkt of this.beltPackets) {
        if (pkt.targetKey === targetKey) sum += (pkt.qty || 1);
      }
      return sum;
    }

    spawnBeltPacket(opts) {
      this.beltPackets.push({
        beltId: opts.beltId,
        targetKey: opts.targetKey || '',
        path: opts.path,
        icon: opts.icon,
        color: opts.color,
        qty: opts.qty || 1,
        progress: 0,
        speed: opts.speed || 1.25,
        onArrive: opts.onArrive
      });
    }

    updateBeltPackets(dt) {
      for (let i = this.beltPackets.length - 1; i >= 0; i--) {
        const pkt = this.beltPackets[i];
        pkt.progress += pkt.speed * dt;
        if (pkt.progress >= 1) {
          this.beltPackets.splice(i, 1);
          if (typeof pkt.onArrive === 'function') {
            pkt.onArrive();
          }
        }
      }
    }

    updateConveyorAutomation(dt) {
      this.conveyorTickTimer += dt;
      if (this.conveyorTickTimer < 0.38) return;
      this.conveyorTickTimer = 0;

      const AP = CFG.AMMO_PRESS;

      // 1. PURPLE E-710 FUEL BELT (`conv_raw_e710`): ONLY moves 🛢️ E-710 from E-710 Pump to E-710 Hoppers!
      const e710BeltLvl = this.conveyorLevels?.conv_raw_e710 || 0;
      if (e710BeltLvl > 0) {
        const e710Stock = this.rawExtractors.raw_e710;
        const transferCap = 1 + Math.floor(e710BeltLvl / 4);
        const maxHopperFill = 8 + e710BeltLvl * 2;
        const speed = 0.95 + e710BeltLvl * 0.08;

        if (e710Stock && e710Stock.stock > 0) {
          for (const item of CFG.ITEMS) {
            if (!this.unlocked[item.id] || !item.recipe.raw_e710) continue;
            if (e710Stock.stock <= 0) break;
            const st = this.stations[item.id];
            const targetKey = `hopper_${item.id}_e710`;
            const curTotal = (st.inputStock.raw_e710 || 0) + this.countInFlightToTarget(targetKey);
            if (curTotal < maxHopperFill) {
              const take = Math.min(transferCap, e710Stock.stock, maxHopperFill - curTotal);
              if (take > 0) {
                e710Stock.stock -= take;
                this.spawnBeltPacket({
                  beltId: 'conv_raw_e710',
                  targetKey,
                  path: [
                    { x: -1200, z: 240 },
                    { x: -960, z: 240 },
                    { x: -960, z: item.inputPos.z - 12 },
                    { x: item.inputPos.x, z: item.inputPos.z - 12 }
                  ],
                  icon: '🛢️',
                  color: '#a855f7',
                  qty: take,
                  speed,
                  onArrive: () => {
                    st.inputStock.raw_e710 = (st.inputStock.raw_e710 || 0) + take;
                  }
                });
              }
            }
          }
        }
      }

      // 2. CYAN SUPER IRON BELT (`conv_raw_iron`): ONLY moves ⛏️ Super Iron from Iron Drill to Iron & Ammo Hoppers!
      const ironBeltLvl = this.conveyorLevels?.conv_raw_iron || 0;
      if (ironBeltLvl > 0) {
        const ironStock = this.rawExtractors.raw_iron;
        const transferCap = 1 + Math.floor(ironBeltLvl / 4);
        const maxHopperFill = 8 + ironBeltLvl * 2;
        const speed = 0.95 + ironBeltLvl * 0.08;

        if (ironStock && ironStock.stock > 0) {
          // A. Feed Munitions Ammo Press Hopper if unlocked
          if ((this.ammoPress.level || 0) > 0 && ironStock.stock > 0) {
            const apKey = 'hopper_ammo_press_iron';
            const curAp = (this.ammoPress.inputStock.raw_iron || 0) + this.countInFlightToTarget(apKey);
            if (curAp < maxHopperFill) {
              const take = Math.min(transferCap, ironStock.stock, maxHopperFill - curAp);
              if (take > 0) {
                ironStock.stock -= take;
                this.spawnBeltPacket({
                  beltId: 'conv_raw_iron',
                  targetKey: apKey,
                  path: [
                    { x: -1200, z: 780 },
                    { x: -1360, z: 780 },
                    { x: AP.inputPos.x, z: AP.inputPos.z }
                  ],
                  icon: '⛏️',
                  color: '#38bdf8',
                  qty: take,
                  speed,
                  onArrive: () => {
                    this.ammoPress.inputStock.raw_iron = (this.ammoPress.inputStock.raw_iron || 0) + take;
                  }
                });
              }
            }
          }

          // B. Feed Iron-using Arsenal Station Hoppers
          for (const item of CFG.ITEMS) {
            if (!this.unlocked[item.id] || !item.recipe.raw_iron) continue;
            if (ironStock.stock <= 0) break;
            const st = this.stations[item.id];
            const targetKey = `hopper_${item.id}_iron`;
            const curTotal = (st.inputStock.raw_iron || 0) + this.countInFlightToTarget(targetKey);
            if (curTotal < maxHopperFill) {
              const take = Math.min(transferCap, ironStock.stock, maxHopperFill - curTotal);
              if (take > 0) {
                ironStock.stock -= take;
                this.spawnBeltPacket({
                  beltId: 'conv_raw_iron',
                  targetKey,
                  path: [
                    { x: -1200, z: 780 },
                    { x: -910, z: 780 },
                    { x: -910, z: item.inputPos.z + 12 },
                    { x: item.inputPos.x, z: item.inputPos.z + 12 }
                  ],
                  icon: '⛏️',
                  color: '#38bdf8',
                  qty: take,
                  speed,
                  onArrive: () => {
                    st.inputStock.raw_iron = (st.inputStock.raw_iron || 0) + take;
                  }
                });
              }
            }
          }
        }
      }

      // 3. GATE TURRET AMMO BELTS (`conv_gate_1`, `conv_gate_2`, `conv_gate_3`)
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs) continue;
        const beltLvl = this.conveyorLevels?.[g.conveyorId] || 0;
        if (beltLvl > 0) {
          const maxAmmo = gs.maxAmmo || g.maxAmmo;
          const gateKey = `gate_ammo_${g.id}`;
          const inFlightAmmo = this.countInFlightToTarget(gateKey);
          if (gs.ammo + inFlightAmmo < maxAmmo && this.ammoPress.stock > 0) {
            const takeCrates = Math.min(this.ammoPress.stock, 1 + Math.floor(beltLvl / 6));
            const ammoGain = takeCrates * (2 + Math.floor(beltLvl / 4));
            this.ammoPress.stock -= takeCrates;
            this.spawnBeltPacket({
              beltId: g.conveyorId,
              targetKey: gateKey,
              path: [
                { x: AP.padX, z: AP.padZ },
                { x: -860, z: AP.padZ },
                { x: -860, z: g.turretZ },
                { x: g.leftTurretX, z: g.turretZ }
              ],
              icon: '🧱',
              color: g.color,
              qty: takeCrates,
              speed: 0.85 + beltLvl * 0.07,
              onArrive: () => {
                gs.ammo = Math.min(gs.maxAmmo || g.maxAmmo, gs.ammo + ammoGain);
              }
            });
          }
          // STRICT RULE: If the gate is broken (0 HP), NO auto HP recovery!
          if (!gs.broken && gs.hp > 0 && gs.hp < gs.maxHp) {
            gs.hp = Math.min(gs.maxHp, gs.hp + beltLvl * 1.5);
          }
        }
      }

      // 4. 7 DEDICATED HORIZONTAL OUTPUT-TO-COUNTER BELTS (`conv_counter_auto`)
      const counterBeltLvl = this.conveyorLevels?.conv_counter_auto || 0;
      if (counterBeltLvl > 0) {
        const batch = 1 + Math.floor(counterBeltLvl / 4);
        const maxCounter = 18 + counterBeltLvl * 2;
        const speed = 1.15 + counterBeltLvl * 0.08;
        for (const item of CFG.ITEMS) {
          if (!this.unlocked[item.id]) continue;
          const st = this.stations[item.id];
          const counterKey = `counter_${item.id}`;
          const curCounterTotal = (this.counterBuffer[item.id] || 0) + this.countInFlightToTarget(counterKey);
          if (st && st.stock > 0 && curCounterTotal < maxCounter) {
            const take = Math.min(batch, st.stock, maxCounter - curCounterTotal);
            if (take > 0) {
              st.stock -= take;
              this.spawnBeltPacket({
                beltId: 'conv_counter_auto',
                targetKey: counterKey,
                path: [
                  { x: item.pickupPos.x, z: item.pickupPos.z },
                  { x: item.counterPos.x, z: item.counterPos.z }
                ],
                icon: item.icon,
                color: item.color,
                qty: take,
                speed,
                onArrive: () => {
                  this.counterBuffer[item.id] = (this.counterBuffer[item.id] || 0) + take;
                }
              });
            }
          }
        }
      }
    }

    // ========================================================================
    // PLAYER INTERACTIONS: MANUAL HARVEST, HOPPERS, 7 DEDICATED COUNTERS & GATES
    // ========================================================================
    updatePlayerInteractions(dt) {
      const p = this.player;
      const L = CFG.LOCATIONS;
      const maxCap = this.getPlayerMaxCapacity();
      const eq = this.getEquippedItems();
      const harvestSpeedMult = eq.armor?.harvestMult || 1.0;

      // 1. Collect Cash from ANY of the 7 Dedicated Counter Cash Stacks!
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const cVal = this.counterCash[item.id] || 0;
        if (cVal <= 0) continue;
        const distCash = Math.hypot(p.x - item.cashPos.x, p.z - item.cashPos.z);
        if (distCash < 105) {
          this.cash += cVal;
          this.counterCash[item.id] = 0;
          this.syncTotalCashOnGround();
          this.audio.playCash();
          this.spawnFloatingText(item.cashPos.x, item.cashPos.z - 30, `+$${cVal} REQ (#${item.tier})`, '#4ade80');
        }
      }

      // Fallback: if cashOnGround was set directly by tests/legacy, allow collecting near Counter #1
      if (this.cashOnGround > 0 && Math.hypot(p.x - L.cashRegisterZone.x, p.z - L.cashRegisterZone.z) < L.cashRegisterZone.radius) {
        const collect = this.cashOnGround;
        this.cash += collect;
        for (const k of Object.keys(this.counterCash)) this.counterCash[k] = 0;
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

      // 3. Walk onto Armory Loadout Pad
      const distArmory = Math.hypot(p.x - L.armoryLoadoutPad.x, p.z - L.armoryLoadoutPad.z);
      if (distArmory < L.armoryLoadoutPad.radius && this.armoryPadCooldown <= 0) {
        this.armoryPadCooldown = 4.5;
        this.renderLoadoutModal();
        document.getElementById('modal-loadout')?.classList.add('open');
      }

      // 4. Manual Harvest Quarry Veins (Available at Start!)
      if (this.harvestCooldown <= 0 && p.inventory.length < maxCap) {
        const harvestRangeBonus = eq.backpack?.autoHarvest ? 160 : 0;
        for (const raw of CFG.RAW_EXTRACTORS) {
          const hp = raw.harvestPos;
          const dVein = Math.hypot(p.x - hp.x, p.z - hp.z);
          if (dVein <= hp.radius + harvestRangeBonus) {
            p.inventory.push({ id: raw.id, icon: raw.itemIcon, color: raw.color });
            this.harvestCooldown = 0.24 / harvestSpeedMult;
            this.audio.playPickup();
            this.spawnArc(hp.x, hp.z, p.x, p.z - 20, raw.itemIcon, raw.color);
            this.spawnFloatingText(p.x, p.z - 35, `+1 ${raw.itemIcon} HARVESTED`, raw.color);
            break;
          }
        }
      }

      // 5. Unlock / Upgrade Quarry Auto-Drill Scale (Lv.0 -> Lv.20)
      if (this.rawPadCooldown <= 0) {
        for (const raw of CFG.RAW_EXTRACTORS) {
          const rs = this.rawExtractors[raw.id];
          if ((rs.level || 0) >= (raw.maxLevel || 20)) continue;
          const distRaw = Math.hypot(p.x - raw.padX, p.z - raw.padZ);
          if (distRaw < 88) {
            const cost = this.getRawUpgradeCost(raw.id);
            if (this.cash >= cost) {
              this.cash -= cost;
              rs.level = (rs.level || 0) + 1;
              if (rs.level === 1) rs.stock = 4;
              this.rawPadCooldown = 0.55;
              this.recalcDerivedStats();
              this.buildSolidObstacles();
              this.audio.playUnlock();
              this.spawnFloatingText(
                raw.x,
                raw.z - 45,
                rs.level === 1 ? `🎉 AUTO ${raw.shortName.toUpperCase()} UNLOCKED (Lv.1/20)!` : `⬆️ ${raw.shortName} Lv.${rs.level}/20!`,
                raw.color
              );
            }
          }
        }
      }

      // 6. Unlock / Upgrade Munitions Ammo Press (Lv.0 -> Lv.20 at safe offset AP.unlockPos)
      const AP = CFG.AMMO_PRESS;
      if (this.stationPadCooldown <= 0 && (this.ammoPress.level || 0) < (AP.maxLevel || 20)) {
        const distApUpg = Math.hypot(p.x - AP.unlockPos.x, p.z - AP.unlockPos.z);
        if (distApUpg < 88) {
          const cost = this.getAmmoPressUpgradeCost();
          if (this.cash >= cost) {
            this.cash -= cost;
            this.ammoPress.level = (this.ammoPress.level || 0) + 1;
            this.stationPadCooldown = 0.55;
            this.recalcDerivedStats();
            this.buildSolidObstacles();
            this.audio.playUnlock();
            this.spawnFloatingText(
              AP.x,
              AP.z - 45,
              this.ammoPress.level === 1 ? `🎉 MUNITIONS PRESS UNLOCKED (Lv.1/20)!` : `⬆️ AMMO PRESS Lv.${this.ammoPress.level}/20!`,
              '#f97316'
            );
          }
        }
      }

      // 7. Upgrade Gate Defense Level Pads (Lv.1 -> Lv.20)
      if (this.gatePadCooldown <= 0) {
        for (const g of CFG.GATES) {
          const gs = this.gates[g.id];
          if ((gs.defenseLevel || 1) >= (g.maxLevel || 20)) continue;
          const distUpg = Math.hypot(p.x - g.upgradePadX, p.z - g.upgradePadZ);
          if (distUpg < 88) {
            const cost = this.getGateUpgradeCost(g.id);
            if (this.cash >= cost) {
              this.cash -= cost;
              gs.defenseLevel = (gs.defenseLevel || 1) + 1;
              this.gatePadCooldown = 0.55;
              this.recalcDerivedStats();
              gs.broken = false;
              gs.hp = gs.maxHp;
              this.audio.playUnlock();
              this.spawnFloatingText(g.x, g.z - 50, `🛡️ ${g.shortName} FORTIFIED Lv.${gs.defenseLevel}/20!`, g.color);
            }
          }
        }
      }

      this.transferCooldown -= dt;
      if (this.transferCooldown > 0) return;

      // 8. Direct Selling to Queued Helldivers at any of the 7 Counters
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

      // 9. Drop Finished Products onto ANY of the 7 Dedicated Item Sales Counters!
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const distCounter = Math.hypot(p.x - item.counterDropPos.x, p.z - item.counterDropPos.z);
        if (distCounter < 105) {
          // Prefer dropping this counter's matching item; if player holds another finished item, route it to its own counter!
          let idx = p.inventory.findIndex((it) => it.id === item.id);
          if (idx === -1) {
            idx = p.inventory.findIndex((it) => CFG.ITEMS.some((cfg) => cfg.id === it.id));
          }
          if (idx !== -1) {
            const entry = p.inventory.splice(idx, 1)[0];
            const targetCfg = this.getItemConfig(entry.id) || item;
            this.counterBuffer[entry.id] = (this.counterBuffer[entry.id] || 0) + 1;
            this.transferCooldown = CFG.PLAYER.transferInterval;
            this.audio.playPickup();
            this.spawnArc(p.x, p.z - 20, targetCfg.counterPos.x, targetCfg.counterPos.z, entry.icon, entry.color);
            return;
          }
        }
      }

      // 10. Pickup Raw Ore from Auto-Drill Output Pads (Only when Auto-Drill is unlocked!)
      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[raw.id];
        if (!rs || (rs.level || 0) <= 0) continue;
        const distPickRaw = Math.hypot(p.x - raw.pickupX, p.z - raw.pickupZ);
        if (distPickRaw < 88 && rs.stock > 0 && p.inventory.length < maxCap) {
          rs.stock--;
          p.inventory.push({ id: raw.id, icon: raw.itemIcon, color: raw.color });
          this.transferCooldown = CFG.PLAYER.transferInterval;
          this.audio.playPickup();
          this.spawnArc(raw.x, raw.z, p.x, p.z - 20, raw.itemIcon, raw.color);
          return;
        }
      }

      // 11. Feed Raw Iron into Munitions Ammo Press Input Hopper & Pickup 🧱 Ammo
      if ((this.ammoPress.level || 0) >= 1) {
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

        const distAmmoPickup = Math.hypot(p.x - AP.padX, p.z - AP.padZ);
        if (distAmmoPickup < 88 && this.ammoPress.stock > 0 && p.inventory.length < maxCap) {
          this.ammoPress.stock--;
          p.inventory.push({ id: 'ammo', icon: '🧱', color: '#f97316' });
          this.transferCooldown = CFG.PLAYER.transferInterval;
          this.audio.playPickup();
          this.spawnArc(AP.x, AP.z, p.x, p.z - 20, '🧱', '#f97316');
          return;
        }
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

      // 14. Load 🧱 Ammo & Manually Repair / Rebuild Broken Gate Layers 3, 2, 1
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs) continue;
        const distPad = Math.hypot(p.x - g.ammoPadX, p.z - g.ammoPadZ);
        if (distPad < 95) {
          const ammoIdx = p.inventory.findIndex((it) => it.id === 'ammo');
          const ammoPerCrate = eq.backpack?.ammoBonus ? 5 : 3;
          const maxAmmo = gs.maxAmmo || g.maxAmmo;
          if (ammoIdx !== -1 && gs.ammo < maxAmmo) {
            p.inventory.splice(ammoIdx, 1);
            gs.ammo = Math.min(maxAmmo, gs.ammo + ammoPerCrate);
            this.transferCooldown = CFG.PLAYER.transferInterval;
            this.audio.playPickup();
            this.spawnArc(p.x, p.z - 20, g.leftTurretX, g.turretZ, '🧱', '#f97316');
            this.spawnFloatingText(g.x, g.z - 32, `+${ammoPerCrate} 🧱 TURRET AMMO`, '#f97316');
            return;
          }
          // Manual Repair on Pad: CAN repair broken (0 HP) gates!
          if (gs.hp < gs.maxHp) {
            const wasBroken = gs.broken || gs.hp <= 0;
            const repairAmt = Math.round(45 * harvestSpeedMult * (eq.mount?.id === 'm_mech' ? 2.0 : 1.0));
            gs.hp = Math.min(gs.maxHp, gs.hp + repairAmt);
            if (gs.hp > 0) gs.broken = false;
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

      // 15. Unlock New Production Lines OR Upgrade Unlocked Machines (Lv.1 -> Lv.20) at Safe Offset Pad!
      for (const item of CFG.ITEMS) {
        const distPad = Math.hypot(p.x - item.unlockPos.x, p.z - item.unlockPos.z);
        if (distPad < 92) {
          if (!this.unlocked[item.id]) {
            if (this.cash > 0) {
              const step = Math.min(this.cash, this.unlockRemaining[item.id], Math.max(15, Math.ceil(item.unlockCost * 0.14)));
              this.cash -= step;
              this.unlockRemaining[item.id] -= step;
              this.transferCooldown = 0.05;
              this.audio.playPickup();
              if (this.unlockRemaining[item.id] <= 0) {
                this.unlocked[item.id] = true;
                this.stations[item.id].level = 1;
                this.stations[item.id].stock = item.initialStock || 2;
                this.stations[item.id].inputStock = {
                  raw_iron: item.initialInput?.raw_iron || 4,
                  raw_e710: item.initialInput?.raw_e710 || 4
                };
                this.counterBuffer[item.id] = 1;
                this.stationPadCooldown = 0.8;
                this.recalcDerivedStats();
                this.buildSolidObstacles();
                this.audio.playUnlock();
                this.spawnFloatingText(
                  item.stationPos.x,
                  item.stationPos.z - 45,
                  `🎉 UNLOCKED ${item.shortName.toUpperCase()} & COUNTER #${item.tier}!`,
                  '#facc15'
                );
              }
              return;
            }
          } else if (this.stationPadCooldown <= 0) {
            const st = this.stations[item.id];
            if ((st.level || 1) < (item.maxLevel || 20)) {
              const upgCost = this.getStationUpgradeCost(item.id);
              if (this.cash >= upgCost) {
                this.cash -= upgCost;
                st.level = (st.level || 1) + 1;
                this.stationPadCooldown = 0.55;
                this.recalcDerivedStats();
                this.audio.playUnlock();
                this.spawnFloatingText(
                  item.stationPos.x,
                  item.stationPos.z - 45,
                  `⬆️ ${item.shortName.toUpperCase()} UPGRADED Lv.${st.level}/20!`,
                  item.color
                );
                return;
              }
            }
          }
        }
      }

      // 16. Unlock & Upgrade Factorio Conveyor Belts (Lv.0 -> Lv.1..20)
      for (const c of CFG.CONVEYORS) {
        const curLvl = this.conveyorLevels[c.id] || 0;
        if (curLvl >= (c.maxLevel || 20)) continue;
        const distConv = Math.hypot(p.x - c.padX, p.z - c.padZ);
        if (distConv < 90 && this.beltPadCooldown <= 0 && this.cash > 0) {
          const fullCost = this.getConveyorUpgradeCost(c.id);
          if (this.conveyorRemaining[c.id] == null || this.conveyorRemaining[c.id] <= 0) {
            this.conveyorRemaining[c.id] = fullCost;
          }
          const step = Math.min(this.cash, this.conveyorRemaining[c.id], Math.max(15, Math.ceil(fullCost * 0.18)));
          this.cash -= step;
          this.conveyorRemaining[c.id] -= step;
          this.transferCooldown = 0.05;
          this.audio.playPickup();
          if (this.conveyorRemaining[c.id] <= 0) {
            this.conveyorLevels[c.id] = curLvl + 1;
            this.conveyors[c.id] = true;
            this.conveyorRemaining[c.id] = this.getConveyorUpgradeCost(c.id);
            this.beltPadCooldown = 0.6;
            this.recalcDerivedStats();
            this.audio.playUnlock();
            this.spawnFloatingText(
              c.padX,
              c.padZ - 35,
              curLvl === 0 ? `⚙️ ${c.name.toUpperCase()} UNLOCKED (Lv.1/20)!` : `⬆️ ${c.name.toUpperCase()} Lv.${curLvl + 1}/20!`,
              c.color
            );
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
            pod.cooldown = 40;
            this.upgrades.seaf_carrier = Math.min(20, (this.upgrades.seaf_carrier || 0) + 1);
            this.syncWorkers();
            this.audio.playUnlock();
            this.spawnFloatingText(pod.x, pod.z - 40, `🥶 HELLDIVER THAWED -> +1 FREE SEAF!`, '#38bdf8');
          }
          return;
        }
      }
    }

    // ========================================================================
    // SMART SEAF WORKERS (Unique Task Assignment + Belt-Aware Role Switching!)
    //  - Miners: Hand-mine veins when Raw Belts are active, spread across distinct hoppers
    //  - Logistics: Haul to Dedicated Counters when Counter Belt is Lv.0; switch to
    //               Cashier & Floor Cash Collector Patrol when Counter Belt is Lv.1+!
    //  - Engineers: Prioritize broken/damaged Gate repair, then non-belted Gate ammo,
    //               then Munitions Press Iron assistance!
    // ========================================================================
    syncWorkers() {
      const targetMiners = Math.min(8, this.upgrades.seaf_miner || 0);
      const targetLogistics = Math.min(8, this.upgrades.seaf_carrier || 0);
      const targetAmmo = Math.min(8, this.upgrades.seaf_ammo_hauler || 0);

      const curMiners = this.workers.filter((w) => w.role === 'miner').length;
      const curLogistics = this.workers.filter((w) => w.role === 'logistics').length;
      const curAmmo = this.workers.filter((w) => w.role === 'ammo').length;

      for (let i = curMiners; i < targetMiners; i++) {
        this.workers.push({
          role: 'miner',
          slotIndex: i,
          x: -1150 + (i % 3) * 45,
          z: 420 + i * 30,
          walkPhase: i,
          taskLabel: '⛏️ Ready',
          assistTimer: 0,
          inventory: []
        });
      }

      for (let i = curLogistics; i < targetLogistics; i++) {
        this.workers.push({
          role: 'logistics',
          slotIndex: i,
          x: 240 + (i % 3) * 45,
          z: 220 + i * 45,
          walkPhase: i,
          taskLabel: '🪖 Ready',
          assistTimer: 0,
          inventory: []
        });
      }

      for (let i = curAmmo; i < targetAmmo; i++) {
        this.workers.push({
          role: 'ammo',
          slotIndex: i,
          x: -480 + (i % 3) * 45,
          z: -140,
          walkPhase: i,
          taskLabel: '🧱 Ready',
          assistTimer: 0,
          inventory: []
        });
      }
    }

    updateWorkers(dt) {
      const eliteBonus = 1 + (this.foreverSkills.perm_commander_elite || 0) * 0.10;
      const AP = CFG.AMMO_PRESS;
      const reservedHoppers = new Set();
      const reservedOutputLanes = new Set();
      const reservedCounters = new Set();

      for (const w of this.workers) {
        w.walkPhase += dt * 10;
        const slotIdx = w.slotIndex || 0;

        // --------------------------------------------------------------------
        // 1. ⛏️ SEAF QUARRY MINERS (Belt-Aware + Unique Hopper Reservation)
        // --------------------------------------------------------------------
        if (w.role === 'miner') {
          const minerLvl = this.upgrades.seaf_miner || 1;
          const speed = 205 * (1 + (minerLvl - 1) * 0.10) * eliteBonus;
          const carryCap = 3 + Math.floor(minerLvl / 3);

          if (w.inventory.length === 0) {
            // Find which hoppers currently have the lowest stock
            const needyHoppers = [];
            if ((this.ammoPress.level || 0) > 0) {
              needyHoppers.push({
                rawId: 'raw_iron',
                stock: this.ammoPress.inputStock.raw_iron || 0,
                label: '🧱 Ammo Press'
              });
            }
            for (const item of CFG.ITEMS) {
              if (!this.unlocked[item.id]) continue;
              const st = this.stations[item.id];
              if (item.recipe.raw_e710) {
                needyHoppers.push({
                  rawId: 'raw_e710',
                  stock: st.inputStock.raw_e710 || 0,
                  label: item.shortName
                });
              }
              if (item.recipe.raw_iron) {
                needyHoppers.push({
                  rawId: 'raw_iron',
                  stock: st.inputStock.raw_iron || 0,
                  label: item.shortName
                });
              }
            }
            needyHoppers.sort((a, b) => a.stock - b.stock);
            const chosenNeed = needyHoppers[slotIdx % Math.max(1, needyHoppers.length)] || { rawId: 'raw_e710' };
            const rawCfg = CFG.RAW_EXTRACTORS.find((r) => r.id === chosenNeed.rawId) || CFG.RAW_EXTRACTORS[0];
            const rs = this.rawExtractors[rawCfg.id];
            const beltId = rawCfg.id === 'raw_e710' ? 'conv_raw_e710' : 'conv_raw_iron';
            const isBeltAutomated = (this.conveyorLevels?.[beltId] || 0) > 0;

            // BELT-AWARE RULE: If the raw belt is ALREADY automated (Lv.1+), the belt moves auto-drill output!
            // So the Miner walks to the Manual Vein (`harvestPos`) to hand-mine bonus ore instead of duplicating the belt!
            const useAutoPickup = !isBeltAutomated && rs && rs.level > 0 && rs.stock > 0;
            const targetX = useAutoPickup ? rawCfg.pickupX : rawCfg.harvestPos.x + Math.cos(slotIdx * 1.7) * 35;
            const targetZ = useAutoPickup ? rawCfg.pickupZ : rawCfg.harvestPos.z + Math.sin(slotIdx * 1.7) * 35;
            w.taskLabel = useAutoPickup ? `📤 Pickup ${rawCfg.itemIcon}` : `⛏️ Vein Mining ${rawCfg.itemIcon}`;

            const dx = targetX - w.x;
            const dz = targetZ - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              if (useAutoPickup && rs.stock > 0) {
                const take = Math.min(carryCap, rs.stock);
                rs.stock -= take;
                for (let k = 0; k < take; k++) {
                  w.inventory.push({ id: rawCfg.id, icon: rawCfg.itemIcon, color: rawCfg.color });
                }
              } else {
                const handYield = Math.min(3, carryCap);
                for (let k = 0; k < handYield; k++) {
                  w.inventory.push({ id: rawCfg.id, icon: rawCfg.itemIcon, color: rawCfg.color });
                }
              }
            }
          } else {
            const heldId = w.inventory[0].id;
            const candidates = [];

            if (heldId === 'raw_iron' && (this.ammoPress.level || 0) > 0) {
              candidates.push({
                key: 'ammo_press',
                pos: AP.inputPos,
                hopper: this.ammoPress.inputStock,
                count: this.ammoPress.inputStock.raw_iron || 0,
                name: 'Ammo Hopper'
              });
            }

            for (const item of CFG.ITEMS) {
              if (!this.unlocked[item.id] || !item.recipe[heldId]) continue;
              const st = this.stations[item.id];
              candidates.push({
                key: item.id,
                pos: item.inputPos,
                hopper: st.inputStock,
                count: st.inputStock[heldId] || 0,
                name: `${item.icon} Hopper`
              });
            }

            if (candidates.length === 0) {
              w.inventory = [];
              continue;
            }

            candidates.sort((a, b) => a.count - b.count);
            let chosen = candidates.find((c) => !reservedHoppers.has(`${c.key}_${heldId}`)) || candidates[0];
            reservedHoppers.add(`${chosen.key}_${heldId}`);
            w.taskLabel = `📥 Feed ${chosen.name}`;

            const dx = chosen.pos.x - w.x;
            const dz = chosen.pos.z - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              chosen.hopper[heldId] = (chosen.hopper[heldId] || 0) + w.inventory.length;
              w.inventory = [];
            }
          }
        }

        // --------------------------------------------------------------------
        // 2. 🧱 SEAF GATE ENGINEERS (Priority: Broken/Damaged Gate Repair -> Unbelted Gate Ammo -> Ammo Press Assist)
        // --------------------------------------------------------------------
        else if (w.role === 'ammo') {
          const engLvl = this.upgrades.seaf_ammo_hauler || 1;
          const speed = 205 * (1 + (engLvl - 1) * 0.10) * eliteBonus;

          // Check if any Gate Layer is broken or damaged (< 90% HP)
          let damagedGate = null;
          for (const g of CFG.GATES) {
            const gs = this.gates[g.id];
            if (gs && (gs.broken || gs.hp < gs.maxHp * 0.90)) {
              damagedGate = g;
              break;
            }
          }

          // Check if any Gate Layer lacks an automated belt (or is low on ammo)
          let ammoNeedyGate = null;
          for (const g of CFG.GATES) {
            const gs = this.gates[g.id];
            if (!gs) continue;
            const beltLvl = this.conveyorLevels?.[g.conveyorId] || 0;
            const maxAmmo = gs.maxAmmo || g.maxAmmo;
            if ((beltLvl === 0 && gs.ammo < maxAmmo * 0.85) || gs.ammo < maxAmmo * 0.35) {
              ammoNeedyGate = g;
              break;
            }
          }

          if (damagedGate && w.inventory.length === 0) {
            // Priority 1: Walk straight to the damaged/broken Gate's Repair Pad!
            w.taskLabel = `🔧 Repair ${damagedGate.shortName}`;
            const dx = damagedGate.ammoPadX - w.x;
            const dz = damagedGate.ammoPadZ - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const gs = this.gates[damagedGate.id];
              if (gs && gs.hp < gs.maxHp) {
                gs.hp = Math.min(gs.maxHp, gs.hp + (32 + engLvl * 6) * dt);
                if (gs.hp > 0) gs.broken = false;
              }
            }
          } else if (w.inventory.length === 0 && ammoNeedyGate && (this.ammoPress.level || 0) > 0 && this.ammoPress.stock > 0) {
            // Priority 2: Pick up 🧱 Ammo from Munitions Press for non-belted/low gate
            w.taskLabel = `📤 Pickup 🧱 Ammo`;
            const dx = AP.padX - w.x;
            const dz = AP.padZ - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 26) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const take = Math.min(4 + Math.floor(engLvl / 4), this.ammoPress.stock);
              this.ammoPress.stock -= take;
              for (let k = 0; k < take; k++) {
                w.inventory.push({ id: 'ammo', icon: '🧱', color: '#f97316' });
              }
            }
          } else if (w.inventory.length > 0) {
            const targetGate = ammoNeedyGate || damagedGate || this.getActiveFrontGate();
            w.taskLabel = `🧱 Load ${targetGate.shortName}`;
            const dx = targetGate.ammoPadX - w.x;
            const dz = targetGate.ammoPadZ - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const gs = this.gates[targetGate.id];
              if (gs) {
                gs.ammo = Math.min(gs.maxAmmo || targetGate.maxAmmo, gs.ammo + w.inventory.length * 3);
                w.inventory = [];
                if (gs.hp < gs.maxHp) {
                  gs.hp = Math.min(gs.maxHp, gs.hp + (28 + engLvl * 5) * dt);
                  if (gs.hp > 0) gs.broken = false;
                }
              }
            }
          } else {
            // Priority 3: All gates healthy & belted -> Assist at Munitions Press or Patrol Front Gate!
            if ((this.ammoPress.level || 0) > 0) {
              w.taskLabel = `⚙️ Assist Ammo Press`;
              const tx = AP.inputPos.x + Math.cos(slotIdx * 2) * 28;
              const tz = AP.inputPos.z + Math.sin(slotIdx * 2) * 28;
              const dx = tx - w.x;
              const dz = tz - w.z;
              const dist = Math.hypot(dx, dz);
              if (dist > 26) {
                w.x += (dx / dist) * speed * dt;
                w.z += (dz / dist) * speed * dt;
              } else {
                w.assistTimer = (w.assistTimer || 0) + dt;
                if (w.assistTimer >= 3.2) {
                  w.assistTimer = 0;
                  this.ammoPress.inputStock.raw_iron = Math.min(30, (this.ammoPress.inputStock.raw_iron || 0) + 1);
                }
              }
            } else {
              const fg = this.getActiveFrontGate();
              w.taskLabel = `🛡️ Patrol ${fg.shortName}`;
              const dx = fg.ammoPadX - w.x;
              const dz = fg.ammoPadZ - w.z;
              const dist = Math.hypot(dx, dz);
              if (dist > 28) {
                w.x += (dx / dist) * speed * dt;
                w.z += (dz / dist) * speed * dt;
              }
            }
          }
        }

        // --------------------------------------------------------------------
        // 3. 🪖 SEAF LOGISTICS TROOPERS (Belt-Aware: Haul to Dedicated Counter OR Cashier & Cash Vault Patrol!)
        // --------------------------------------------------------------------
        else {
          const logLvl = this.upgrades.seaf_carrier || 1;
          const speed = 210 * (1 + (logLvl - 1) * 0.10) * eliteBonus;
          const carryCap = 3 + Math.floor(logLvl / 3);
          const counterBeltAutomated = (this.conveyorLevels?.conv_counter_auto || 0) > 0;

          if (w.inventory.length > 0) {
            // Deliver held finished items to their SPECIFIC Dedicated Item Counter!
            const heldId = w.inventory[0].id;
            const itemCfg = this.getItemConfig(heldId) || CFG.ITEMS[0];
            w.taskLabel = `🛒 Stock Counter #${itemCfg.tier}`;
            const dx = itemCfg.counterDropPos.x - w.x;
            const dz = itemCfg.counterDropPos.z - w.z;
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
            continue;
          }

          // When `conv_counter_auto` is Lv.0 (NOT automated), haul finished goods from factory output pads!
          let chosenLane = null;
          if (!counterBeltAutomated) {
            const readyItems = CFG.ITEMS.filter(
              (it) => this.unlocked[it.id] && (this.stations[it.id]?.stock || 0) > 0 && !reservedOutputLanes.has(it.id)
            );
            if (readyItems.length > 0) {
              chosenLane = readyItems[slotIdx % readyItems.length];
              reservedOutputLanes.add(chosenLane.id);
            }
          }

          if (chosenLane) {
            w.taskLabel = `📤 Pickup ${chosenLane.icon}`;
            const dx = chosenLane.pickupPos.x - w.x;
            const dz = chosenLane.pickupPos.z - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const st = this.stations[chosenLane.id];
              const take = Math.min(carryCap, st.stock);
              if (take > 0) {
                st.stock -= take;
                for (let k = 0; k < take; k++) {
                  w.inventory.push({ id: chosenLane.id, icon: chosenLane.icon, color: chosenLane.color });
                }
              }
            }
          } else {
            // BELT-AWARE CASHIER & CASH COLLECTOR PATROL:
            // When `conv_counter_auto` is active (Lv.1+) or no output pads have stock,
            // Logistics Troopers patrol the 7 Dedicated Counters to auto-collect `$REQ` cash stacks!
            const unlockedCounters = CFG.ITEMS.filter((it) => this.unlocked[it.id]);
            const cashCounters = unlockedCounters.filter((it) => (this.counterCash[it.id] || 0) > 0 && !reservedCounters.has(it.id));
            const targetCounter = cashCounters.length > 0
              ? cashCounters[0]
              : unlockedCounters[slotIdx % Math.max(1, unlockedCounters.length)];

            if (targetCounter) {
              reservedCounters.add(targetCounter.id);
              const hasCash = (this.counterCash[targetCounter.id] || 0) > 0;
              w.taskLabel = hasCash ? `💵 Collect Cash #${targetCounter.tier}` : `🫡 Cashier #${targetCounter.tier}`;
              const tx = hasCash ? targetCounter.cashPos.x : targetCounter.counterPos.x;
              const tz = hasCash ? targetCounter.cashPos.z : targetCounter.counterPos.z + 55;
              const dx = tx - w.x;
              const dz = tz - w.z;
              const dist = Math.hypot(dx, dz);
              if (dist > 26) {
                w.x += (dx / dist) * speed * dt;
                w.z += (dz / dist) * speed * dt;
              } else if (hasCash) {
                const collected = this.counterCash[targetCounter.id] || 0;
                if (collected > 0) {
                  this.cash += collected;
                  this.counterCash[targetCounter.id] = 0;
                  this.syncTotalCashOnGround();
                  this.audio.playCash();
                  this.spawnFloatingText(
                    targetCounter.cashPos.x,
                    targetCounter.cashPos.z - 28,
                    `+$${collected} SEAF COLLECTED!`,
                    '#4ade80'
                  );
                }
              }
            }
          }
        }
      }
    }

    // ========================================================================
    // CUSTOMERS & 7 DEDICATED ITEM SALES COUNTERS
    // (Customers queue directly in front of their ordered item's Counter!)
    // ========================================================================
    spawnCustomer(forcedItemId = null) {
      const maxQueue = 16;
      const activeCount = this.customers.filter((c) => c.state !== 'leaving').length;
      if (activeCount >= maxQueue) return;

      const unlockedItems = CFG.ITEMS.filter((it) => this.unlocked[it.id]);
      if (unlockedItems.length === 0) return;

      let chosenItem = null;
      if (forcedItemId && this.unlocked[forcedItemId]) {
        chosenItem = this.getItemConfig(forcedItemId);
      }
      if (!chosenItem) {
        chosenItem = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
      }

      const qty = chosenItem.tier <= 2 ? (1 + Math.floor(Math.random() * 2)) : 1;
      const qStart = chosenItem.queueStart || CFG.LOCATIONS.customerQueueStart;

      this.customers.push({
        x: CFG.LOCATIONS.customerSpawn.x,
        z: qStart.z + (Math.random() - 0.5) * 60,
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
      const itemId = cust.item.id;
      if (directToWallet || (this.upgrades.seaf_cashier || 0) > 0) {
        this.cash += unitPrice;
        this.audio.playCash();
        this.spawnFloatingText(cust.x, cust.z - 48, `+$${unitPrice} ${cust.item.icon} SOLD!`, '#4ade80');
      } else {
        this.counterCash[itemId] = (this.counterCash[itemId] || 0) + unitPrice;
        this.syncTotalCashOnGround();
        this.audio.playCash();
        this.spawnFloatingText(cust.x, cust.z - 48, `+$${unitPrice} ${cust.item.icon} (#${cust.item.tier})`, '#facc15');
      }

      if (cust.received >= cust.qty) {
        cust.state = 'leaving';
        this.totalServed++;
        this.lifetimeServed++;
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
        const unlockedCount = CFG.ITEMS.filter((it) => this.unlocked[it.id]).length;
        this.customerSpawnTimer = Math.max(1.3, 2.7 - unlockedCount * 0.16);
        this.spawnCustomer();
      }

      // Group active customers by their target item's Dedicated Counter Queue!
      const activeCustomers = this.customers.filter((c) => c.state !== 'leaving');
      const perItemIndex = {};

      for (const c of activeCustomers) {
        const itemId = c.item.id;
        const idx = perItemIndex[itemId] || 0;
        perItemIndex[itemId] = idx + 1;

        const qStart = c.item.queueStart || CFG.LOCATIONS.customerQueueStart;
        const tx = qStart.x + idx * 86;
        const tz = qStart.z + ((idx % 2 === 0) ? -14 : 14);
        const dx = tx - c.x;
        const dz = tz - c.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 8) {
          c.x += (dx / dist) * 215 * dt;
          c.z += (dz / dist) * 215 * dt;
          c.walkPhase += dt * 10;
        }
      }

      const exit = CFG.LOCATIONS.customerExit;
      for (let i = this.customers.length - 1; i >= 0; i--) {
        const c = this.customers[i];
        if (c.state === 'leaving') {
          const dx = exit.x - c.x;
          const dz = c.item.queueStart.z - c.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 30) {
            this.customers.splice(i, 1);
          } else {
            c.x += (dx / dist) * 250 * dt;
            c.z += (dz / dist) * 250 * dt;
            c.walkPhase += dt * 12;
          }
        }
      }

      // Dedicated Per-Counter Checkout!
      this.cashierTimer -= dt;
      if (this.cashierTimer <= 0) {
        const cashierSpeed = 0.24 / (1 + (this.upgrades.seaf_cashier || 0) * 0.20);
        for (const c of activeCustomers) {
          const itemId = c.item.id;
          const qStart = c.item.queueStart || CFG.LOCATIONS.customerQueueStart;
          if ((this.counterBuffer[itemId] || 0) > 0 && Math.abs(c.x - qStart.x) < 260) {
            this.counterBuffer[itemId]--;
            this.cashierTimer = cashierSpeed;
            this.spawnArc(
              c.item.counterPos.x,
              c.item.counterPos.z,
              c.x,
              c.z - 15,
              c.item.icon,
              c.item.color
            );
            this.completeCustomerItemReceive(c, false);
            break;
          }
        }
      }
    }

    // ========================================================================
    // WAVE + REST TIME SYSTEM, ALL-EPISODE CARBOT ENEMIES & 3-LAYER GATE SIEGE
    // ========================================================================
    getActiveFrontGate() {
      const g3 = CFG.GATES.find((g) => g.id === 'gate_3');
      const g2 = CFG.GATES.find((g) => g.id === 'gate_2');
      const g1 = CFG.GATES.find((g) => g.id === 'gate_1');
      if (this.gates.gate_3 && !this.gates.gate_3.broken && this.gates.gate_3.hp > 0) return g3;
      if (this.gates.gate_2 && !this.gates.gate_2.broken && this.gates.gate_2.hp > 0) return g2;
      return g1;
    }

    startNextWave(earlyBonus = false) {
      if (this.waveState === 'combat') return;
      if (earlyBonus) {
        const bonusReq = Math.round(45 * this.waveNumber * this.getPrestigeMultiplier());
        this.cash += bonusReq;
        this.audio.playCash();
        this.spawnFloatingText(this.player.x, this.player.z - 45, `⚔️ EARLY WAVE CALL: +$${bonusReq} BONUS REQ!`, '#4ade80');
      }

      this.waveState = 'combat';
      const WC = CFG.WAVE_CONFIG;
      this.waveTotalEnemies = WC.baseEnemyCount + (this.waveNumber - 1) * WC.enemiesPerWave;
      this.waveEnemiesToSpawn = this.waveTotalEnemies;
      this.waveSpawnCooldown = 0.2;
      this.audio.playStratagem();

      const isBossWave = (this.waveNumber % WC.bossWaveEvery) === 0;
      this.spawnFloatingText(
        this.player.x,
        this.player.z - 65,
        isBossWave
          ? `🚨 BOSS SIEGE WAVE ${this.waveNumber} INCOMING (${this.waveTotalEnemies} ENEMIES)!`
          : `🌊 WAVE ${this.waveNumber} INCOMING (${this.waveTotalEnemies} ENEMIES)!`,
        '#ef4444'
      );
    }

    completeCurrentWave() {
      const clearedWave = this.waveNumber;
      const planet = this.getCurrentPlanet();
      const waveRewardCash = Math.round((80 + clearedWave * 35) * planet.reqMult * this.getPrestigeMultiplier());
      const isBossWave = (clearedWave % CFG.WAVE_CONFIG.bossWaveEvery) === 0;
      const waveRewardMedals = isBossWave ? 3 : 1;

      this.cash += waveRewardCash;
      this.medals += waveRewardMedals;
      this.waveNumber++;
      if (this.waveNumber > this.highestWave) {
        this.highestWave = this.waveNumber;
      }

      this.waveState = 'rest';
      this.waveTimer = CFG.WAVE_CONFIG.betweenWaveRestTime;
      this.audio.playUnlock();
      this.saveGame();

      this.spawnFloatingText(
        this.player.x,
        this.player.z - 60,
        `🎉 WAVE ${clearedWave} CLEARED! +$${waveRewardCash} & +${waveRewardMedals} ⭐! (${this.waveTimer}s REST TIME)`,
        '#4ade80'
      );
    }

    // Spawns All-Episode Carbot Enemies (Ep1–Ep10+: hunter, bug, spewer, titan, trooper, devastator, hulk, strider)
    spawnWaveEnemy() {
      const planet = this.getCurrentPlanet();
      const waveScale = (1 + (this.waveNumber - 1) * 0.14) * (planet.enemyHpMult || 1.0);
      const isBossWave = (this.waveNumber % CFG.WAVE_CONFIG.bossWaveEvery) === 0;
      const roll = Math.random();

      let type = 'trooper';
      let hp = Math.round(90 * waveScale);
      let dmg = Math.round(11 * (1 + (this.waveNumber - 1) * 0.08));
      let speed = 84;

      if ((isBossWave && roll > 0.72) || (this.waveNumber >= 8 && roll > 0.90)) {
        type = Math.random() > 0.5 ? 'strider' : 'titan';
        hp = Math.round(420 * waveScale);
        dmg = Math.round(28 * (1 + (this.waveNumber - 1) * 0.08));
        speed = 48;
      } else if ((isBossWave && roll > 0.45) || (this.waveNumber >= 3 && roll > 0.78)) {
        type = 'hulk';
        hp = Math.round(280 * waveScale);
        dmg = Math.round(22 * (1 + (this.waveNumber - 1) * 0.08));
        speed = 58;
      } else if (this.waveNumber >= 2 && roll > 0.60) {
        type = Math.random() > 0.5 ? 'devastator' : 'spewer';
        hp = Math.round(150 * waveScale);
        dmg = Math.round(15 * (1 + (this.waveNumber - 1) * 0.08));
        speed = 68;
      } else if (roll > 0.35) {
        type = Math.random() > 0.45 ? 'bug' : 'hunter';
        hp = Math.round((type === 'hunter' ? 62 : 82) * waveScale);
        dmg = Math.round(9 * (1 + (this.waveNumber - 1) * 0.08));
        speed = type === 'hunter' ? 128 : 110;
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

    updateWarZoneAndGates(dt) {
      return this.updateWaveAndGates(dt);
    }

    updateWaveAndGates(dt) {
      // 1. STRICT RULE: Permanent Skill auto-maintenance ONLY heals UNBROKEN gates (`!gs.broken && gs.hp > 0`)!
      const armorLvl = this.foreverSkills.perm_gate_armor || 0;
      if (armorLvl > 0) {
        for (const g of CFG.GATES) {
          const gs = this.gates[g.id];
          if (gs && !gs.broken && gs.hp > 0 && gs.hp < gs.maxHp) {
            gs.hp = Math.min(gs.maxHp, gs.hp + armorLvl * 5 * dt);
          }
        }
      }

      // 2. Wave & Rest Phase State Machine
      if (this.waveState === 'rest') {
        this.waveTimer -= dt;
        if (this.waveTimer <= 0) {
          this.startNextWave(false);
        }
      } else if (this.waveState === 'combat') {
        if (this.waveEnemiesToSpawn > 0) {
          this.waveSpawnCooldown -= dt;
          if (this.waveSpawnCooldown <= 0 && this.enemies.length < 18) {
            this.waveSpawnCooldown = CFG.WAVE_CONFIG.spawnIntervalInWave;
            this.waveEnemiesToSpawn--;
            this.spawnWaveEnemy();
          }
        } else if (this.enemies.length === 0) {
          this.completeCurrentWave();
        }
      }

      // 3. Enemies march toward the outermost unbroken Gate Layer (Gate 3 -> Gate 2 -> Gate 1)
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
              activeGateState.hp = 0;
              activeGateState.broken = true;
              this.world.triggerCameraShake(14, 0.45);
              if (activeGateCfg.id === 'gate_1') {
                this.triggerGateDefeat(activeGateCfg);
                return;
              } else {
                this.spawnFloatingText(
                  activeGateCfg.x,
                  activeGateCfg.z - 65,
                  `💥 ${activeGateCfg.shortName.toUpperCase()} BROKEN! (NO AUTO-HEAL — REPAIR ON PAD!)`,
                  '#f97316'
                );
              }
            }
          }
        }
      }

      // 4. Dual Sentry Turrets on all 3 Gate Layers
      const turretPwrLvl = this.foreverSkills.perm_turret_power || 0;
      const freeAmmoChance = Math.min(0.65, turretPwrLvl * 0.025);

      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (!gs) continue;
        gs.fireCooldown = Math.max(0, gs.fireCooldown - dt);
        if (gs.ammo <= 0 || gs.fireCooldown > 0) continue;

        const defLvl = gs.defenseLevel || 1;
        const turretDmgMult = (1 + turretPwrLvl * 0.25) * (1 + (defLvl - 1) * 0.22);

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
          gs.fireCooldown = Math.max(0.12, g.turretFireRate / (1 + (defLvl - 1) * 0.05));
          gs.lastFireTime = this.world.time;
          if (Math.random() > freeAmmoChance) {
            gs.ammo = Math.max(0, gs.ammo - 1);
          }
          this.audio.playLaser();
        }
      }

      // 5. Main Character Personal Weapon & Mount Attack + Guard Dog Rover Drone
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
            CFG.PLAYER.attackDamage * (wep.damageMult || 1.0) * (mount.damageMult || 1.0) * (1 + eliteLvl * 0.25)
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
            const droneDmg = Math.round(22 * (1 + eliteLvl * 0.25));
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
      this.lifetimeKills++;
      const isBoss = enemy.type === 'hulk' || enemy.type === 'titan' || enemy.type === 'strider';
      this.explosions.push({
        x: enemy.x,
        z: enemy.z,
        maxR: isBoss ? 76 : 36,
        t: 0,
        duration: 0.32
      });
      this.warDrops.push({
        id: Math.random(),
        x: enemy.x,
        z: enemy.z,
        icon: isBoss ? '⭐' : '🛢️',
        color: isBoss ? '#facc15' : '#a855f7',
        cashValue: Math.round((isBoss ? 120 : 35) * this.getPrestigeMultiplier()),
        medalValue: isBoss ? 1 : 0
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
          All 3 Defense Layers (Outer Gate 3 ➔ Middle Gate 2 ➔ <strong>${breachedGate.name}</strong>) were breached on <strong>Wave ${this.waveNumber}</strong>!<br><br>
          📊 <strong>Run Summary:</strong> Reached <strong>Wave ${this.waveNumber}</strong> | Served <strong>${this.totalServed} Helldivers</strong> | Eliminated <strong>${this.totalKills} Enemies</strong>.<br>
          🎖️ <strong>Evacuated Reward:</strong> Earned <strong>+${bonusMedals} ⭐ Forever Warbond Medals</strong> (Total: <strong>${this.medals} ⭐</strong>).<br>
          🌟 <strong>All Permanent Skill Tree upgrades, Achievements &amp; Commander Loadout Gear are 100% preserved forever!</strong>
        `;
      }
      document.getElementById('modal-defeat')?.classList.add('open');
      this.updateHUD();
    }

    redeployAfterDefeat() {
      document.getElementById('modal-defeat')?.classList.remove('open');
      this.initRunState();
      this.ensureStarterSetup();
      this.spawnCustomer('cloth');
      this.spawnCustomer('cloth');
      this.saveGame();
      this.updateHUD();
      this.spawnFloatingText(this.player.x, this.player.z - 40, '🦅 NEW HELLPOD DEPLOYED — FOREVER SKILLS & LOADOUT ACTIVE!', '#facc15');
    }

    trigger500kgStratagem() {
      if (this.stratagemCooldown > 0) {
        this.spawnFloatingText(this.player.x, this.player.z - 35, `⏳ 500KG COOLDOWN (${Math.ceil(this.stratagemCooldown)}s)`, '#f87171');
        return;
      }
      this.stratagemCooldown = 20;
      this.stratagemBuffTimer = 10;
      this.recalcDerivedStats();
      this.audio.playStratagem();
      this.world.triggerCameraShake(16, 0.5);

      // Carbot Eagle-1 Fighter Jet Flyover Shadow
      this.eagleFlyover = {
        sx: -1200,
        sz: -250,
        tx: 1200,
        tz: -1750,
        t: 0,
        duration: 0.65
      };

      for (const e of this.enemies) {
        e.hp -= 280;
        this.explosions.push({ x: e.x, z: e.z, maxR: 95, t: 0, duration: 0.45 });
        if (e.hp <= 0) this.handleEnemyKilled(e);
      }
      this.enemies = this.enemies.filter((e) => e.hp > 0);

      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        if (gs) {
          gs.ammo = gs.maxAmmo || g.maxAmmo;
          if (!gs.broken && gs.hp > 0) {
            gs.hp = Math.min(gs.maxHp, gs.hp + 250);
          }
          this.explosions.push({ x: g.x, z: g.z - 60, maxR: 130, t: 0, duration: 0.5 });
        }
      }
      this.spawnFloatingText(this.player.x, this.player.z - 45, '🦅 EAGLE-1 500KG DROPPED! TURRETS RELOADED & 2X FACTORY BOOST!', '#facc15');
    }

    spawnArc(sx, sz, tx, tz, icon, color) {
      this.flyingArcs.push({ sx, sz, tx, tz, icon, color, t: 0, duration: 0.24 });
    }

    updateVisualEffects(dt) {
      if (this.eagleFlyover) {
        this.eagleFlyover.t += dt;
        if (this.eagleFlyover.t >= this.eagleFlyover.duration) {
          this.eagleFlyover = null;
        }
      }
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

      const waveEl = document.getElementById('hud-wave-status');
      const skipBtn = document.getElementById('btn-skip-rest');
      if (waveEl) {
        if (this.waveState === 'rest') {
          waveEl.textContent = `W${this.waveNumber} in ${Math.ceil(this.waveTimer)}s (Rest)`;
          waveEl.style.color = '#38bdf8';
          if (skipBtn) skipBtn.style.display = 'inline-flex';
        } else {
          const rem = this.enemies.length + this.waveEnemiesToSpawn;
          waveEl.textContent = `Wave ${this.waveNumber} (${rem} left)`;
          waveEl.style.color = '#ef4444';
          if (skipBtn) skipBtn.style.display = 'none';
        }
      }

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

      const gateEl = document.getElementById('hud-gates-hp');
      if (gateEl) {
        const p3 = Math.round(((this.gates.gate_3?.hp || 0) / (this.gates.gate_3?.maxHp || 1)) * 100);
        const p2 = Math.round(((this.gates.gate_2?.hp || 0) / (this.gates.gate_2?.maxHp || 1)) * 100);
        const p1 = Math.round(((this.gates.gate_1?.hp || 0) / (this.gates.gate_1?.maxHp || 1)) * 100);
        gateEl.textContent = `G3:${p3}% G2:${p2}% G1:${p1}%`;
        gateEl.style.color = p1 > 50 ? '#4ade80' : (p1 > 25 ? '#facc15' : '#ef4444');

        const warUnitsEl = document.getElementById('hud-war-units-count');
        if (warUnitsEl) warUnitsEl.textContent = `${(this.alliedUnits || []).length}`;

        const baseNameEl = document.getElementById('hud-active-base-name');
        if (baseNameEl) {
          const bc = this.getActiveBaseConfig();
          baseNameEl.textContent = bc.code ? bc.code.replace('SECTOR ', '') : 'Alpha';
        }

        const mendCostEl = document.getElementById('cost-build-mender');
        if (mendCostEl) {
          const ml = this.mendProjectorLevel || 0;
          const mc = Math.round(160 * Math.pow(1.35, ml));
          mendCostEl.textContent = ml >= 20 ? 'MAX Lv.20' : `Lv.${ml} ($${mc})`;
        }

        const objEl = document.getElementById('objective-text');
        if (objEl) {
          const planet = this.getCurrentPlanet();
          if (this.gates.gate_3?.broken || this.gates.gate_2?.broken) {
            objEl.textContent = `🚨 GATE BROKEN (NO AUTO-HEAL!): Walk onto the Broken Gate's 🔧 REBUILD PAD to manually repair it!`;
          } else if (!this.unlocked.gun) {
            objEl.textContent = `[${planet.name}] STEP 1: Harvest 🛢️ E-710 in Sector A ➔ Feed 🦺 Cloth Hopper ➔ Sell at Counter #1 to save $120 & unlock 🔫 Gun + Counter #2!`;
          } else if (this.waveState === 'rest') {
            objEl.textContent = `[${planet.name}] ⏳ REST PHASE (${Math.ceil(this.waveTimer)}s): Upgrade Split Belts (🛢️/⛏️) & 7 Counters (Lv.1–20) or click ⚔️ Next Wave!`;
          } else {
            objEl.textContent = `[${planet.name}] 🚨 WAVE ${this.waveNumber} SIEGE: Defend Outer Gate 3 ➔ Gate 2 ➔ Gate 1 & expand all 7 Dedicated Counter Lanes!`;
          }
        }
      }
    }

    // ========================================================================
    // MODALS: LOADOUT, 20-LEVEL UPGRADES, SKILLS & 20HR+ CAMPAIGN/MILESTONES
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
            } else if (this.cash >= eqItem.cost) {
              this.cash -= eqItem.cost;
              this.ownedEquipment[eqItem.id] = true;
              this.equipped[cat.key] = eqItem.id;
              this.recalcDerivedStats();
              this.saveGame();
              this.audio.playUnlock();
              this.renderLoadoutModal();
              this.updateHUD();
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

      // 1. Quarry Auto-Drills (Lv.0 Locked -> Lv.20)
      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[raw.id];
        const lvl = rs.level || 0;
        const isMax = lvl >= (raw.maxLevel || 20);
        const cost = this.getRawUpgradeCost(raw.id);
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4>${raw.icon} ${raw.name} (Lv.${lvl}/20)</h4>
            <p>${raw.desc}</p>
          </div>
          <button class="buy-btn" ${(isMax || this.cash < cost) ? 'disabled' : ''}>
            ${isMax ? 'MAX Lv.20' : (lvl === 0 ? `🔓 Unlock $${cost}` : `⬆️ Lv.${lvl + 1} ($${cost})`)}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (!isMax && this.cash >= cost) {
            this.cash -= cost;
            rs.level = lvl + 1;
            if (rs.level === 1) rs.stock = 4;
            this.recalcDerivedStats();
            this.buildSolidObstacles();
            this.audio.playUnlock();
            this.renderUpgradesModal();
            this.updateHUD();
          }
        });
        list.appendChild(card);
      }

      // 2. Munitions Ammo Press (Lv.0 Locked -> Lv.20)
      {
        const AP = CFG.AMMO_PRESS;
        const apLvl = this.ammoPress.level || 0;
        const isMax = apLvl >= (AP.maxLevel || 20);
        const cost = this.getAmmoPressUpgradeCost();
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4>🧱 ${AP.name} (Lv.${apLvl}/20)</h4>
            <p>${AP.desc}</p>
          </div>
          <button class="buy-btn" ${(isMax || this.cash < cost) ? 'disabled' : ''}>
            ${isMax ? 'MAX Lv.20' : (apLvl === 0 ? `🔓 Unlock $${cost}` : `⬆️ Lv.${apLvl + 1} ($${cost})`)}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (!isMax && this.cash >= cost) {
            this.cash -= cost;
            this.ammoPress.level = apLvl + 1;
            this.recalcDerivedStats();
            this.buildSolidObstacles();
            this.audio.playUnlock();
            this.renderUpgradesModal();
            this.updateHUD();
          }
        });
        list.appendChild(card);
      }

      // 3. All 7 Production Machines + Dedicated Counters (Lv.0 Locked -> Lv.20)
      for (const item of CFG.ITEMS) {
        const isUnlocked = !!this.unlocked[item.id];
        const st = this.stations[item.id];
        const lvl = isUnlocked ? (st.level || 1) : 0;
        const isMax = lvl >= (item.maxLevel || 20);
        const cost = !isUnlocked ? (this.unlockRemaining[item.id] ?? item.unlockCost) : this.getStationUpgradeCost(item.id);

        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4>${item.icon} ${item.name} &amp; Counter #${item.tier} (Lv.${lvl}/20)</h4>
            <p>${item.description} | Sell: $${this.getItemSellPrice(item)}</p>
          </div>
          <button class="buy-btn" ${(isMax || this.cash < cost) ? 'disabled' : ''}>
            ${isMax ? 'MAX Lv.20' : (!isUnlocked ? `🔓 Unlock $${cost}` : `⬆️ Lv.${lvl + 1} ($${cost})`)}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (!isMax && this.cash >= cost) {
            this.cash -= cost;
            if (!isUnlocked) {
              this.unlocked[item.id] = true;
              this.unlockRemaining[item.id] = 0;
              st.level = 1;
              st.stock = item.initialStock || 2;
              this.counterBuffer[item.id] = 1;
            } else {
              st.level = lvl + 1;
            }
            this.recalcDerivedStats();
            this.buildSolidObstacles();
            this.audio.playUnlock();
            this.renderUpgradesModal();
            this.updateHUD();
          }
        });
        list.appendChild(card);
      }

      // 4. All 6 Factorio Conveyor Belts (Lv.0 Locked -> Lv.20)
      for (const c of CFG.CONVEYORS) {
        const lvl = this.conveyorLevels[c.id] || 0;
        const isMax = lvl >= (c.maxLevel || 20);
        const cost = this.getConveyorUpgradeCost(c.id);
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4>${c.icon} ${c.name} (Lv.${lvl}/20)</h4>
            <p>${c.desc}</p>
          </div>
          <button class="buy-btn" ${(isMax || this.cash < cost) ? 'disabled' : ''}>
            ${isMax ? 'MAX Lv.20' : (lvl === 0 ? `🔓 Unlock $${cost}` : `⬆️ Lv.${lvl + 1} ($${cost})`)}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (!isMax && this.cash >= cost) {
            this.cash -= cost;
            this.conveyorLevels[c.id] = lvl + 1;
            this.conveyors[c.id] = true;
            this.conveyorRemaining[c.id] = this.getConveyorUpgradeCost(c.id);
            this.recalcDerivedStats();
            this.audio.playUnlock();
            this.renderUpgradesModal();
            this.updateHUD();
          }
        });
        list.appendChild(card);
      }

      // 5. 3-Layer Gate Defense Fortification (Lv.1 -> Lv.20)
      for (const g of CFG.GATES) {
        const gs = this.gates[g.id];
        const lvl = gs.defenseLevel || 1;
        const isMax = lvl >= (g.maxLevel || 20);
        const cost = this.getGateUpgradeCost(g.id);
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.innerHTML = `
          <div class="upgrade-info">
            <h4>🛡️ ${g.name} (Lv.${lvl}/20) ${gs.broken ? '💥 BROKEN' : ''}</h4>
            <p>${g.desc} Max HP: ${gs.maxHp}</p>
          </div>
          <button class="buy-btn" ${(isMax || this.cash < cost) ? 'disabled' : ''}>
            ${isMax ? 'MAX Lv.20' : `⬆️ Fortify Lv.${lvl + 1} ($${cost})`}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (!isMax && this.cash >= cost) {
            this.cash -= cost;
            gs.defenseLevel = lvl + 1;
            this.recalcDerivedStats();
            gs.broken = false;
            gs.hp = gs.maxHp;
            this.audio.playUnlock();
            this.renderUpgradesModal();
            this.updateHUD();
          }
        });
        list.appendChild(card);
      }

      // 6. SEAF Staff & Commander Upgrades (Lv.0 -> Lv.20)
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
            ${isMax ? 'MAX Lv.20' : `💵 $${cost}`}
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
      const cashSpan = document.getElementById('skill-modal-cash');
      if (cashSpan) cashSpan.textContent = `$${Math.floor(this.cash)}`;

      const buyMedalBtn = document.getElementById('btn-buy-medal');
      if (buyMedalBtn) {
        buyMedalBtn.disabled = this.cash < 150;
      }

      // Render 2D Mindustry Visual Tech Tree Canvas & Selected Node Inspector
      const treeCanvas = document.getElementById('mindustry-tree-canvas');
      if (treeCanvas && this.world.renderMindustryTechTree) {
        this.world.renderMindustryTechTree(treeCanvas, this, this.selectedTechNodeId);
      }
      this.renderMindustryNodeInspector();

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
            ${isMax ? 'MAX Lv.20' : `⭐ ${medalCost} Medals`}
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

    renderMindustryNodeInspector() {
      const box = document.getElementById('mindustry-node-inspector');
      if (!box) return;
      const nodes = CFG.MINDUSTRY_TECH_NODES || [];
      const node = nodes.find((n) => n.id === this.selectedTechNodeId) || nodes[0];
      if (!node) return;

      const lvl = this.getTechNodeLevel(node.id);
      const isMax = lvl >= node.maxLevel;
      const parentNode = node.parentId ? nodes.find((n) => n.id === node.parentId) : null;
      const parentUnlocked = !parentNode || this.getTechNodeLevel(parentNode.id) > 0;
      const medalCost = Math.max(1, Math.round((node.baseMedalCost || 1) * Math.pow(1.36, lvl)));
      const reqCost = Math.round((node.reqCost || 140) * Math.pow(1.42, lvl));

      box.innerHTML = `
        <div style="flex:1 1 280px;">
          <div style="font-size:0.7rem;color:${node.color || '#facc15'};font-weight:800;">
            ${parentNode ? `🔗 REQUIRES PARENT: ${parentNode.icon} ${parentNode.name} (${parentUnlocked ? '✅ UNLOCKED' : '🔒 LOCKED'})` : '🏛️ ROOT COMMAND CORE NODE'}
          </div>
          <h4 style="font-family:var(--font-display);font-size:0.9rem;color:#fde047;margin:2px 0;">
            ${node.icon} ${node.name} <span style="font-size:0.78rem;color:#f8fafc;">(${node.zhName}) — Lv.${lvl}/${node.maxLevel}</span>
          </h4>
          <p style="font-size:0.76rem;color:#cbd5e1;">${node.desc}</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="buy-btn medal-btn" id="btn-research-node-medal" ${(!parentUnlocked || isMax || this.medals < medalCost) ? 'disabled' : ''}>
            ${isMax ? 'MAX Lv.20' : (!parentUnlocked ? '🔒 Unlock Parent First' : `⭐ Research (${medalCost} Medals)`)}
          </button>
          <button class="buy-btn" id="btn-research-node-req" ${(!parentUnlocked || isMax || this.cash < reqCost) ? 'disabled' : ''}>
            ${isMax ? 'MAX Lv.20' : (!parentUnlocked ? '🔒 Locked' : `💵 Research ($${reqCost})`)}
          </button>
        </div>
      `;

      const upgradeNode = (useMedals) => {
        if (!parentUnlocked || isMax) return;
        if (useMedals) {
          if (this.medals < medalCost) return;
          this.medals -= medalCost;
        } else {
          if (this.cash < reqCost) return;
          this.cash -= reqCost;
        }
        const nextLvl = lvl + 1;
        this.techNodes[node.id] = nextLvl;
        if (node.linkedPermId) {
          this.foreverSkills[node.linkedPermId] = nextLvl;
        }
        this.recalcDerivedStats();
        this.saveGame();
        this.audio.playUnlock();
        this.renderSkillsModal();
        this.updateHUD();
      };

      box.querySelector('#btn-research-node-medal')?.addEventListener('click', () => upgradeNode(true));
      box.querySelector('#btn-research-node-req')?.addEventListener('click', () => upgradeNode(false));
    }

    renderCampaignModal() {
      const summaryBox = document.getElementById('campaign-summary-box');
      const planet = this.getCurrentPlanet();
      const hrs = Math.floor(this.playTimeSeconds / 3600);
      const mins = Math.floor((this.playTimeSeconds % 3600) / 60);
      const secs = Math.floor(this.playTimeSeconds % 60);

      if (summaryBox) {
        const canAscend = this.waveNumber >= 10;
        const nextMult = Math.pow(2.0, (this.prestigeCount || 0) + 1);
        summaryBox.innerHTML = `
          <div>
            <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.95rem;">
              🪐 CURRENT OPERATION: ${planet.name} | 🌊 WAVE ${this.waveNumber} (Record: Wave ${this.highestWave})
            </div>
            <div style="font-size:0.8rem;color:#cbd5e1;margin-top:4px;">
              ⏱️ Play Time: <strong>${hrs}h ${mins}m ${secs}s</strong> | 🫡 Lifetime Served: <strong>${this.lifetimeServed}</strong> | 💀 Lifetime Kills: <strong>${this.lifetimeKills}</strong> | 🎖️ Ascension Tier: <strong>Lv.${this.prestigeCount} (x${this.getPrestigeMultiplier()} Income)</strong>
            </div>
          </div>
          <button class="buy-btn medal-btn" id="btn-ascend-galaxy" ${canAscend ? '' : 'disabled'}>
            ${canAscend ? `🎖️ Ascend Galaxy -> x${nextMult} Forever!` : `🔒 Reach Wave 10 to Ascend`}
          </button>
        `;
        summaryBox.querySelector('#btn-ascend-galaxy')?.addEventListener('click', () => {
          if (this.waveNumber >= 10) {
            const rewardMedals = this.waveNumber * 2;
            this.prestigeCount = (this.prestigeCount || 0) + 1;
            this.medals += rewardMedals;
            this.redeployAfterDefeat();
            this.renderCampaignModal();
            this.spawnFloatingText(
              this.player.x,
              this.player.z - 50,
              `🎖️ GALACTIC ASCENSION Lv.${this.prestigeCount}! x${this.getPrestigeMultiplier()} INCOME + ${rewardMedals} ⭐!`,
              '#fde047'
            );
          }
        });
      }

      const basesGrid = document.getElementById('mindustry-bases-grid');
      if (basesGrid) {
        basesGrid.innerHTML = '';
        for (const b of (CFG.MINDUSTRY_BASES || [])) {
          const isUnlocked = !!this.unlockedBases?.[b.id];
          const isActive = this.activeBaseId === b.id;
          const canUnlock = !isUnlocked && (this.cash >= b.unlockCost || this.highestWave >= b.reqWave);
          const card = document.createElement('div');
          card.className = 'upgrade-item';
          if (isActive) {
            card.style.borderColor = '#4ade80';
            card.style.background = 'rgba(34, 197, 94, 0.14)';
          } else if (isUnlocked) {
            card.style.borderColor = b.color;
          }
          card.innerHTML = `
            <div class="upgrade-info">
              <div style="font-size:0.68rem;color:${b.color};font-weight:800;">${b.code} | ⛏️x${b.ironMult} 🛢️x${b.e710Mult} 💵x${b.sellMult}</div>
              <h4>${b.icon} ${b.name}</h4>
              <p>${b.desc}</p>
            </div>
            <button class="buy-btn ${isActive ? 'medal-btn' : ''}" ${(!isUnlocked && !canUnlock) ? 'disabled' : ''}>
              ${isActive ? '🏛️ ACTIVE BASE' : (isUnlocked ? '🚀 Switch Base' : (this.highestWave >= b.reqWave ? '🔓 Claim Free (Wave Req Met)' : `🔓 Unlock $${b.unlockCost}`))}
            </button>
          `;
          card.querySelector('button')?.addEventListener('click', () => {
            if (isUnlocked) {
              this.activeBaseId = b.id;
              this.recalcDerivedStats();
              this.saveGame();
              this.audio.playUnlock();
              this.renderCampaignModal();
              this.updateHUD();
              this.spawnFloatingText(this.player.x, this.player.z - 45, `🪐 DEPLOYED TO ${b.code}!`, b.color);
            } else if (this.highestWave >= b.reqWave || this.cash >= b.unlockCost) {
              if (this.highestWave < b.reqWave) this.cash -= b.unlockCost;
              this.unlockedBases[b.id] = true;
              this.activeBaseId = b.id;
              this.recalcDerivedStats();
              this.saveGame();
              this.audio.playUnlock();
              this.renderCampaignModal();
              this.updateHUD();
              this.spawnFloatingText(this.player.x, this.player.z - 45, `🎉 CONQUERED ${b.code} — LAUNCH PAD ONLINE!`, '#4ade80');
            }
          });
          basesGrid.appendChild(card);
        }
      }

      const planetGrid = document.getElementById('campaign-planets-grid');
      if (planetGrid) {
        planetGrid.innerHTML = '';
        for (const p of CFG.CAMPAIGN_PLANETS) {
          const isCurrent = p.id === planet.id;
          const isCleared = this.highestWave > p.waveEnd;
          const card = document.createElement('div');
          card.className = 'upgrade-item';
          if (isCurrent) card.style.borderColor = '#facc15';
          card.innerHTML = `
            <div class="upgrade-info">
              <h4 style="color:${isCleared ? '#4ade80' : (isCurrent ? '#facc15' : '#f8fafc')};">
                ${isCleared ? '✅' : (isCurrent ? '🪐' : '🔒')} ${p.name} (Waves ${p.waveStart}–${p.waveEnd})
              </h4>
              <p>${p.desc} | Income Mult: x${p.reqMult}</p>
            </div>
          `;
          planetGrid.appendChild(card);
        }
      }

      const msGrid = document.getElementById('campaign-milestones-grid');
      if (msGrid) {
        msGrid.innerHTML = '';
        for (const ms of CFG.MILESTONES) {
          const done = !!this.claimedMilestones[ms.id];
          const card = document.createElement('div');
          card.className = 'upgrade-item';
          if (done) card.style.borderColor = '#4ade80';
          card.innerHTML = `
            <div class="upgrade-info">
              <h4 style="color:${done ? '#4ade80' : '#f8fafc'};">${done ? '🏆' : '🎯'} ${ms.name}</h4>
              <p>${ms.desc}</p>
            </div>
            <span class="version-pill" style="border-color:${done ? '#4ade80' : '#facc15'};color:${done ? '#4ade80' : '#fde047'};">
              ${done ? 'CLAIMED' : `+${ms.rewardMedals} ⭐`}
            </span>
          `;
          msGrid.appendChild(card);
        }
      }
    }

    serializeState() {
      return {
        version: CFG.VERSION,
        cash: this.cash,
        medals: this.medals,
        prestigeCount: this.prestigeCount,
        highestWave: this.highestWave,
        lifetimeServed: this.lifetimeServed,
        lifetimeKills: this.lifetimeKills,
        playTimeSeconds: this.playTimeSeconds,
        claimedMilestones: this.claimedMilestones,
        foreverSkills: this.foreverSkills,
        techNodes: this.techNodes,
        unlockedBases: this.unlockedBases,
        activeBaseId: this.activeBaseId,
        mendProjectorLevel: this.mendProjectorLevel,
        ownedEquipment: this.ownedEquipment,
        equipped: this.equipped,
        waveNumber: this.waveNumber,
        totalServed: this.totalServed,
        totalKills: this.totalKills,
        rawExtractors: this.rawExtractors,
        ammoPress: this.ammoPress,
        gates: this.gates,
        conveyorLevels: this.conveyorLevels,
        conveyorRemaining: this.conveyorRemaining,
        unlocked: this.unlocked,
        unlockRemaining: this.unlockRemaining,
        stations: this.stations,
        counterBuffer: this.counterBuffer,
        counterCash: this.counterCash,
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
        if (typeof data.prestigeCount === 'number') this.prestigeCount = data.prestigeCount;
        if (typeof data.highestWave === 'number') this.highestWave = data.highestWave;
        if (typeof data.lifetimeServed === 'number') this.lifetimeServed = data.lifetimeServed;
        if (typeof data.lifetimeKills === 'number') this.lifetimeKills = data.lifetimeKills;
        if (typeof data.playTimeSeconds === 'number') this.playTimeSeconds = data.playTimeSeconds;
        if (data.claimedMilestones) Object.assign(this.claimedMilestones, data.claimedMilestones);
        if (data.foreverSkills) Object.assign(this.foreverSkills, data.foreverSkills);
        if (data.techNodes) Object.assign(this.techNodes, data.techNodes);
        if (data.unlockedBases) Object.assign(this.unlockedBases, data.unlockedBases);
        if (typeof data.activeBaseId === 'string') this.activeBaseId = data.activeBaseId;
        if (typeof data.mendProjectorLevel === 'number') this.mendProjectorLevel = data.mendProjectorLevel;
        if (data.ownedEquipment) Object.assign(this.ownedEquipment, data.ownedEquipment);
        if (data.equipped) Object.assign(this.equipped, data.equipped);
        if (typeof data.cash === 'number') this.cash = Math.max(40, data.cash);
        if (typeof data.waveNumber === 'number') this.waveNumber = Math.max(1, data.waveNumber);
        if (typeof data.totalServed === 'number') this.totalServed = data.totalServed;
        if (typeof data.totalKills === 'number') this.totalKills = data.totalKills;

        if (data.rawExtractors) {
          for (const k of Object.keys(data.rawExtractors)) {
            if (this.rawExtractors[k]) Object.assign(this.rawExtractors[k], data.rawExtractors[k]);
          }
        }
        if (data.ammoPress) Object.assign(this.ammoPress, data.ammoPress);
        if (data.gates) {
          for (const k of Object.keys(data.gates)) {
            if (this.gates[k]) {
              Object.assign(this.gates[k], data.gates[k]);
              this.gates[k].unlocked = true;
            }
          }
        }
        if (data.conveyorLevels) {
          Object.assign(this.conveyorLevels, data.conveyorLevels);
          for (const c of CFG.CONVEYORS) {
            this.conveyors[c.id] = (this.conveyorLevels[c.id] || 0) > 0;
          }
        }
        if (data.conveyorRemaining) Object.assign(this.conveyorRemaining, data.conveyorRemaining);
        if (data.unlocked) Object.assign(this.unlocked, data.unlocked);
        if (data.unlockRemaining) Object.assign(this.unlockRemaining, data.unlockRemaining);
        if (data.stations) {
          for (const k of Object.keys(data.stations)) {
            if (this.stations[k]) Object.assign(this.stations[k], data.stations[k]);
          }
        }
        if (data.counterBuffer) Object.assign(this.counterBuffer, data.counterBuffer);
        if (data.counterCash) Object.assign(this.counterCash, data.counterCash);
        if (data.upgrades) Object.assign(this.upgrades, data.upgrades);
        this.syncTotalCashOnGround();
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
        this.world.setZoom(0.54);
      });

      // Quick Teleport / Camera Snap Buttons for the 4600x4000 Base
      document.getElementById('btn-snap-quarry')?.addEventListener('click', () => {
        this.pointerTarget = { x: -1650, z: 420 };
      });
      document.getElementById('btn-snap-factory')?.addEventListener('click', () => {
        this.pointerTarget = { x: -450, z: 390 };
      });
      document.getElementById('btn-snap-counter')?.addEventListener('click', () => {
        this.pointerTarget = { x: 520, z: 390 };
      });
      document.getElementById('btn-snap-gates')?.addEventListener('click', () => {
        this.setViewMode('war');
      });

      // Mobile Drawer Toggle (`☰ 選單`)
      const drawerEl = document.getElementById('hud-menu-drawer');
      const closeMobileDrawer = () => drawerEl?.classList.remove('drawer-open');
      document.getElementById('btn-toggle-menu')?.addEventListener('click', (e) => {
        e.stopPropagation();
        drawerEl?.classList.toggle('drawer-open');
      });
      drawerEl?.querySelectorAll('button').forEach((b) => {
        if (!b.classList.contains('strat-arrow')) {
          b.addEventListener('click', closeMobileDrawer);
        }
      });

      // Split Shop vs. War Front Mode Switcher + Mindustry Bases & Tech Shortcuts
      document.getElementById('btn-mode-shop')?.addEventListener('click', () => this.setViewMode('shop'));
      document.getElementById('btn-mode-war')?.addEventListener('click', () => this.setViewMode('war'));
      document.getElementById('btn-mode-bases')?.addEventListener('click', () => {
        this.renderCampaignModal();
        document.getElementById('modal-campaign')?.classList.add('open');
      });
      document.getElementById('btn-mode-tech')?.addEventListener('click', () => {
        this.renderSkillsModal();
        document.getElementById('modal-skills')?.classList.add('open');
      });

      // War Front Deployment Dock Buttons
      document.getElementById('btn-deploy-squad')?.addEventListener('click', () => this.deployWarUnit('deploy_squad'));
      document.getElementById('btn-deploy-buggy')?.addEventListener('click', () => this.deployWarUnit('deploy_buggy'));
      document.getElementById('btn-deploy-mech')?.addEventListener('click', () => this.deployWarUnit('deploy_mech'));
      document.getElementById('btn-build-mender')?.addEventListener('click', () => this.deployWarUnit('build_mender'));

      // Interactive Mindustry Visual Tech Tree Canvas Click/Tap Selection
      const treeCanvas = document.getElementById('mindustry-tree-canvas');
      treeCanvas?.addEventListener('pointerdown', (e) => {
        const rect = treeCanvas.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
        const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
        let bestNode = null;
        let bestDist = 0.16;
        for (const n of (CFG.MINDUSTRY_TECH_NODES || [])) {
          const d = Math.hypot(nx - n.nx, ny - n.ny);
          if (d < bestDist) {
            bestDist = d;
            bestNode = n;
          }
        }
        if (bestNode) {
          this.selectedTechNodeId = bestNode.id;
          this.audio.playPickup();
          this.renderSkillsModal();
        }
      });

      document.getElementById('btn-skip-rest')?.addEventListener('click', () => {
        this.startNextWave(true);
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

      document.getElementById('btn-open-loadout')?.addEventListener('click', () => {
        this.renderLoadoutModal();
        document.getElementById('modal-loadout')?.classList.add('open');
      });
      document.getElementById('btn-close-loadout')?.addEventListener('click', () => {
        document.getElementById('modal-loadout')?.classList.remove('open');
      });

      document.getElementById('btn-open-campaign')?.addEventListener('click', () => {
        this.renderCampaignModal();
        document.getElementById('modal-campaign')?.classList.add('open');
      });
      document.getElementById('btn-close-campaign')?.addEventListener('click', () => {
        document.getElementById('modal-campaign')?.classList.remove('open');
      });

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
