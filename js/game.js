// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.09 (All-Episode Carbot Art, Real-Item-Only Split Belts,
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

    getUnlockedCounterCount(itemId) {
      const st = this.stations?.[itemId];
      const lvl = Math.max(st?.level || 1, st?.counterLvl || 1);
      if (lvl >= 8) return 3;
      if (lvl >= 4) return 2;
      return 1;
    }

    getMaxWorkerCap() {
      const cLvl = this.cloneRoomLevel || 1;
      return 3 + cLvl * 3; // Lv.1 = 6 workers, Lv.10 = 33 workers
    }

    getCloneRoomUpgradeCost() {
      const cLvl = this.cloneRoomLevel || 1;
      return Math.round(140 * Math.pow(1.42, cLvl - 1));
    }

    getCloneHireCost() {
      const count = (this.workers || []).length;
      return Math.round(70 * Math.pow(1.18, count));
    }

    initWarFoundation() {
      const engine = window.WarRunEngine;
      this.warProgress = engine
        ? engine.migrateProgress(this.warProgress, this.sampleSearchDiff || 1)
        : (this.warProgress || { schemaVersion: 1, highestSampleDifficulty: this.sampleSearchDiff || 1,
            completedSampleRuns: 0, completedCaptureRuns: 0, discoveredEvents: {},
            discoveredRelics: {}, injuredHeroes: {}, autoUltimateEnabled: false });
      if (this.warRun && engine && !engine.isValidRun(this.warRun, CFG)) {
        this.warRun = null;
        this.warMigrationNoticePending = true;
      }
    }

    createWarFoundationRun(options) {
      const engine = window.WarRunEngine;
      if (!engine) {
        console.error('WarRunEngine is unavailable; deterministic route was not created.');
        return null;
      }
      this.initWarFoundation();
      this.warRun = engine.createRun(options, CFG);
      return this.warRun;
    }

    getShopWarPowerMult() {
      let score = 0;
      for (const item of CFG.ITEMS) {
        if (this.unlocked?.[item.id]) {
          const st = this.stations?.[item.id] || {};
          score += 12 + ((st.level || 1) - 1) * 4 + ((st.priceLvl || 1) - 1) * 2 + ((st.speedLvl || 1) - 1) * 2 + ((st.yieldLvl || 1) - 1) * 3;
        }
      }
      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors?.[raw.id];
        if (rs && rs.level > 0) score += rs.level * 4;
      }
      return 1 + score * 0.015;
    }

    // ========================================================================
    // NEW IN v0.0.11: NIGHTFALL WATCHTOWERS, STRONGHOLDS (據點) & WAR SQUAD MANAGER
    // ========================================================================
    getAbilityLevel(targetType, targetId, abilityKey) {
      if (targetType === 'station') {
        const st = this.stations?.[targetId];
        return st ? (st[abilityKey] || 1) : 1;
      } else if (targetType === 'raw') {
        const rs = this.rawExtractors?.[targetId];
        return rs ? (rs[abilityKey] || Math.max(1, rs.level || 1)) : 1;
      } else if (targetType === 'ammo') {
        return this.ammoPress ? (this.ammoPress[abilityKey] || Math.max(1, this.ammoPress.level || 1)) : 1;
      }
      return 1;
    }

    getAbilityUpgradeCost(targetType, targetId, abilityDef) {
      const curLvl = this.getAbilityLevel(targetType, targetId, abilityDef.key);
      let base = 90;
      if (targetType === 'station') {
        const itemCfg = this.getItemConfig(targetId);
        base = (itemCfg?.baseUpgradeCost || 80) * (abilityDef.baseCostMult || 1.0);
      } else if (targetType === 'raw') {
        const rawCfg = CFG.RAW_EXTRACTORS.find((r) => r.id === targetId);
        base = (rawCfg?.baseUpgradeCost || 110) * (abilityDef.baseCostMult || 1.0);
      } else if (targetType === 'ammo') {
        base = (CFG.AMMO_PRESS.baseUpgradeCost || 120) * (abilityDef.baseCostMult || 1.0);
      }
      return Math.round(base * Math.pow(abilityDef.costScale || 1.35, curLvl - 1));
    }

    upgradeBuildingAbility(targetType, targetId, abilityKey) {
      const abilities = CFG.BUILDING_ABILITIES?.[targetType] || [];
      const abDef = abilities.find((a) => a.key === abilityKey);
      if (!abDef) return;
      const curLvl = this.getAbilityLevel(targetType, targetId, abilityKey);
      if (curLvl >= 10) return;
      const cost = this.getAbilityUpgradeCost(targetType, targetId, abDef);
      if (this.cash < cost) {
        this.spawnFloatingText(this.player.x, this.player.z - 35, `⚠️ NEED $${cost} FOR ${abDef.icon}`, '#ef4444');
        return;
      }
      this.cash -= cost;

      if (targetType === 'station') {
        const st = this.stations[targetId];
        const prevDesks = this.getUnlockedCounterCount(targetId);
        st[abilityKey] = curLvl + 1;
        // Keep overall station level synced to highest sub-ability
        st.level = Math.max(
          st.level || 1,
          st.priceLvl || 1,
          st.speedLvl || 1,
          st.yieldLvl || 1,
          st.counterLvl || 1
        );
        const newDesks = this.getUnlockedCounterCount(targetId);
        const itemCfg = this.getItemConfig(targetId);
        if (newDesks > prevDesks) {
          this.spawnFloatingText(
            itemCfg.counterPos.x + (newDesks - 1) * 320,
            itemCfg.counterPos.z - 55,
            `🎉 EXPANDED TO ${newDesks}/3 COUNTERS (${itemCfg.shortName})!`,
            '#4ade80'
          );
        } else {
          this.spawnFloatingText(
            itemCfg.stationPos.x,
            itemCfg.stationPos.z - 45,
            `${abDef.icon} ${abDef.name} Lv.${st[abilityKey]}/10!`,
            '#fde047'
          );
        }
      } else if (targetType === 'raw') {
        const rs = this.rawExtractors[targetId];
        if ((rs.level || 0) === 0) rs.level = 1;
        rs[abilityKey] = curLvl + 1;
        rs.level = Math.max(rs.level || 1, rs.speedLvl || 1, rs.yieldLvl || 1, rs.bufferLvl || 1);
      } else if (targetType === 'ammo') {
        if ((this.ammoPress.level || 0) === 0) this.ammoPress.level = 1;
        this.ammoPress[abilityKey] = curLvl + 1;
        this.ammoPress.level = Math.max(
          this.ammoPress.level || 1,
          this.ammoPress.speedLvl || 1,
          this.ammoPress.yieldLvl || 1,
          this.ammoPress.bufferLvl || 1
        );
      }

      this.recalcDerivedStats();
      this.buildSolidObstacles();
      this.audio.playUnlock();
      this.saveGame();
      this.renderBuildingPopover();
      this.updateHUD();
    }

    openBuildingPopover(type, id) {
      this.selectedInspectTarget = { type, id };
      const pop = document.getElementById('building-upgrade-popover');
      if (pop) pop.classList.add('open');
      this.renderBuildingPopover();
      this.updateHUD();
    }

    closeBuildingPopover() {
      document.getElementById('building-upgrade-popover')?.classList.remove('open');
    }

    renderBuildingPopover() {
      const pop = document.getElementById('building-upgrade-popover');
      if (!pop || !pop.classList.contains('open')) return;
      const titleEl = document.getElementById('popover-building-title');
      const statsEl = document.getElementById('popover-building-stats');
      const listEl = document.getElementById('popover-abilities-list');
      if (!titleEl || !statsEl || !listEl) return;

      const sel = this.selectedInspectTarget || { type: 'station', id: 'cloth' };
      listEl.innerHTML = '';

      if (sel.type === 'station') {
        const item = this.getItemConfig(sel.id) || CFG.ITEMS[0];
        const isUnlocked = !!this.unlocked[item.id];
        const st = this.stations[item.id];

        if (!isUnlocked) {
          const rem = this.unlockRemaining[item.id] ?? item.unlockCost;
          titleEl.textContent = `🔒 ${item.icon} ${item.name} (Locked Lv.0)`;
          statsEl.textContent = `Recipe: ${item.recipeText} · Base Price: $${item.sellPrice}`;
          const row = document.createElement('div');
          row.className = 'popover-ability-row';
          row.innerHTML = `
            <div class="popover-ability-meta">
              <div class="popover-ability-name">🔓 Construct ${item.shortName} &amp; Counter #${item.tier}</div>
              <div class="popover-ability-desc">Unlocks this production lane (can produce Simple Mk.I with Basic 🛢️/⛏️, or Mk.II/Mk.III with Planet Unique Ores!).</div>
            </div>
            <button class="buy-btn" ${this.cash < rem ? 'disabled' : ''}>🔓 Unlock ($${rem})</button>
          `;
          row.querySelector('button').addEventListener('click', () => {
            this.triggerSelectedInspectorUpgrade();
            this.renderBuildingPopover();
          });
          listEl.appendChild(row);
          return;
        }

        const batchOut = 1 + Math.floor(((st.yieldLvl || 1)) / 3);
        const desks = this.getUnlockedCounterCount(item.id);
        const prodTier = this.getStationProductionTier(item.id);
        titleEl.textContent = `${item.icon} ${item.name} (Lv.${st.level || 1}/10 · ${prodTier.shortBadge})`;
        statsEl.textContent = `💵 Price: $${this.getItemSellPrice(item)} (${prodTier.badge}) · ⚡ ${st.cycleTime.toFixed(2)}s · 📦 1 Raw ➔ ${batchOut}x · 🏪 ${desks}/3 Desks`;

        for (const ab of (CFG.BUILDING_ABILITIES.station || [])) {
          const curLvl = this.getAbilityLevel('station', item.id, ab.key);
          const isMax = curLvl >= 10;
          const cost = this.getAbilityUpgradeCost('station', item.id, ab);
          let dotsHtml = '<span class="popover-level-dots">';
          for (let d = 1; d <= 10; d++) {
            dotsHtml += `<span class="popover-dot ${d <= curLvl ? 'filled' : ''}"></span>`;
          }
          dotsHtml += '</span>';

          const row = document.createElement('div');
          row.className = 'popover-ability-row';
          row.innerHTML = `
            <div class="popover-ability-meta">
              <div class="popover-ability-name">${ab.icon} ${ab.name} (Lv.${curLvl}/10) ${dotsHtml}</div>
              <div class="popover-ability-desc">${ab.desc}</div>
            </div>
            <button class="buy-btn" ${(isMax || this.cash < cost) ? 'disabled' : ''}>
              ${isMax ? 'MAX Lv.10' : `⬆️ $${cost}`}
            </button>
          `;
          row.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            this.upgradeBuildingAbility('station', item.id, ab.key);
          });
          listEl.appendChild(row);
        }
      }
    }

    getHellpodUpgradeCost() {
      const lvl = this.hellpodBayLevel || 1;
      return Math.round(140 * Math.pow(1.45, lvl - 1));
    }

    getHellpodDropFee() {
      return 0;
    }

    triggerRoguelikePerkDraft() {
      const pool = CFG.ROGUELIKE_CARDS || [];
      if (pool.length === 0) return;
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      this.pendingPerkChoices = shuffled.slice(0, 3);
      this.perkAutoPickTimer = 14.0;
      this.renderRoguelikeDraftBar();
    }

    selectRoguelikePerk(cardId) {
      const card = (CFG.ROGUELIKE_CARDS || []).find((c) => c.id === cardId);
      if (!card) return;
      this.roguelikePerks[cardId] = (this.roguelikePerks[cardId] || 0) + 1;
      this.pendingPerkChoices = [];
      this.audio.playUnlock();
      this.recalcDerivedStats();
      this.renderRoguelikeDraftBar();
      this.spawnFloatingText(
        this.player.x,
        this.player.z - 55,
        `🎲 PERK EQUIPPED: ${card.name} (Lv.${this.roguelikePerks[cardId]})!`,
        card.color
      );
    }

    renderRoguelikeDraftBar() {
      const bar = document.getElementById('roguelike-draft-bar');
      const container = document.getElementById('rk-cards-container');
      const progEl = document.getElementById('rk-mission-progress');
      if (!bar || !container) return;

      if (this.viewMode !== 'war' || !this.pendingPerkChoices || this.pendingPerkChoices.length === 0) {
        bar.classList.remove('visible');
        return;
      }

      bar.classList.add('visible');
      if (progEl && this.capybaraRun) {
        progEl.textContent = `${this.capybaraRun.mode === 'capture' ? '🚩 CAPTURE' : '🧬 SAMPLE'} WAVE ${this.capybaraRun.wave}/${this.capybaraRun.maxWaves}`;
      }
      container.innerHTML = '';
      for (const c of this.pendingPerkChoices) {
        const curLvl = this.roguelikePerks[c.id] || 0;
        const btn = document.createElement('button');
        btn.className = 'rk-card-btn';
        btn.style.borderColor = c.color || '#facc15';
        btn.innerHTML = `
          <div style="font-size:1.25rem;">${c.icon}</div>
          <div class="rk-card-title">${c.name} ${curLvl > 0 ? `(Lv.${curLvl + 1})` : '(NEW!)'}</div>
          <div class="rk-card-desc">${c.desc}</div>
        `;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectRoguelikePerk(c.id);
        });
        container.appendChild(btn);
      }
    }

    handleCanvasBuildingClick(wx, wz) {
      if (this.viewMode === 'war') return false;

      if (wx >= -2050 && wx <= -1260 && wz >= -420 && wz <= -50) {
        this.audio.playPickup();
        this.cloneModalPage = 'vat';
        this.renderCloneRoomModal();
        document.getElementById('modal-clone-room')?.classList.add('open');
        return true;
      }

      if (wx >= -1255 && wx <= -435 && wz >= -420 && wz <= -50) {
        this.audio.playPickup();
        this.trainingModalPage = 'overview';
        this.renderTrainingRoomModal();
        document.getElementById('modal-training-room')?.classList.add('open');
        return true;
      }

      if (wx >= -2150 && wx <= -1660 && wz >= 40 && wz <= 1360) {
        this.audio.playPickup();
        this.portModalPage = 'overview';
        this.renderPortLogisticsModal();
        document.getElementById('modal-port-logistics')?.classList.add('open');
        return true;
      }

      if (Math.hypot(wx - 920, wz - (-210)) < 220) {
        this.selectedInspectTarget = { type: 'hellpod', id: 'hellpod' };
        this.audio.playPickup();
        this.spawnFloatingText(220, -140, `🚀 ${this.totalHellpodDrops || 0} SERVED HELLDIVERS DEPARTED TO ORBIT!`, '#38bdf8');
        return true;
      }

      for (const raw of CFG.RAW_EXTRACTORS) {
        const nearSilo = Math.hypot(wx - raw.x, wz - raw.z) < 110;
        const nearPick = Math.hypot(wx - raw.pickupX, wz - raw.pickupZ) < 95;
        if (nearSilo || nearPick) {
          const rs = this.rawExtractors[raw.id];
          const maxCap = this.getPlayerMaxCapacity();
          if (rs && rs.stock >= 1 && this.player.inventory.length < maxCap) {
            rs.stock--;
            this.player.inventory.push({ id: raw.id, icon: raw.itemIcon, color: raw.color });
            this.audio.playPickup();
            this.spawnArc(raw.x, raw.z, this.player.x, this.player.z - 20, raw.itemIcon, raw.color);
            this.spawnFloatingText(raw.pickupX, raw.pickupZ - 30, `+1 ${raw.itemIcon} PICKED FROM PORT!`, raw.color);
            this.updateHUD();
          } else {
            this.audio.playPickup();
            this.portModalPage = 'overview';
            this.renderPortLogisticsModal();
            document.getElementById('modal-port-logistics')?.classList.add('open');
          }
          return true;
        }
      }

      for (const item of CFG.ITEMS) {
        if (this.unlocked[item.id] && Math.hypot(wx - item.cashPos.x, wz - item.cashPos.z) < 95) {
          const cVal = this.counterCash[item.id] || 0;
          if (cVal > 0) {
            this.cash += cVal;
            this.counterCash[item.id] = 0;
            this.syncTotalCashOnGround();
            this.audio.playCash();
            this.spawnFloatingText(item.cashPos.x, item.cashPos.z - 30, `+$${cVal} REQ (#${item.tier})`, '#4ade80');
            this.updateHUD();
            return true;
          }
        }

        const nearStation = Math.hypot(wx - item.stationPos.x, wz - item.stationPos.z) < 115;
        const nearCounter1 = Math.hypot(wx - item.counterPos.x, wz - item.counterPos.z) < 125;
        const nearCounter2 = item.counter2Pos && Math.hypot(wx - item.counter2Pos.x, wz - item.counter2Pos.z) < 125;
        const nearCounter3 = item.counter3Pos && Math.hypot(wx - item.counter3Pos.x, wz - item.counter3Pos.z) < 125;

        if (nearStation || nearCounter1 || nearCounter2 || nearCounter3) {
          this.audio.playPickup();
          this.openBuildingPopover('station', item.id);
          return true;
        }
      }

      return false;
    }

    triggerSelectedInspectorUpgrade() {
      const sel = this.selectedInspectTarget || { type: 'station', id: 'cloth' };
      const item = this.getItemConfig(sel.id) || CFG.ITEMS[0];
      const isUnlocked = !!this.unlocked[item.id];
      const st = this.stations[item.id];
      if (!isUnlocked) {
        const rem = this.unlockRemaining[item.id] ?? item.unlockCost;
        if (this.cash >= rem) {
          this.cash -= rem;
          this.unlockRemaining[item.id] = 0;
          this.unlocked[item.id] = true;
          st.level = 1;
          st.stock = item.initialStock || 2;
          st.inputStock = {
            raw_iron: item.initialInput?.raw_iron || 4,
            raw_e710: item.initialInput?.raw_e710 || 4
          };
          this.counterBuffer[item.id] = 2;
          this.recalcDerivedStats();
          this.buildSolidObstacles();
          this.audio.playUnlock();
          this.spawnFloatingText(item.stationPos.x, item.stationPos.z - 45, `🎉 UNLOCKED ${item.shortName.toUpperCase()}!`, item.color);
        }
      } else if ((st.level || 1) < 10) {
        const upgCost = this.getStationUpgradeCost(item.id);
        if (this.cash >= upgCost) {
          const prevCounters = this.getUnlockedCounterCount(item.id);
          this.cash -= upgCost;
          st.level = (st.level || 1) + 1;
          const newCounters = this.getUnlockedCounterCount(item.id);
          this.recalcDerivedStats();
          this.buildSolidObstacles();
          this.audio.playUnlock();
          if (newCounters > prevCounters) {
            this.spawnFloatingText(
              item.counterPos.x + (newCounters - 1) * 320,
              item.counterPos.z - 55,
              `🎉 EXPANDED TO ${newCounters}/3 PHYSICAL COUNTERS (${item.shortName.toUpperCase()})!`,
              '#4ade80'
            );
          } else {
            this.spawnFloatingText(
              item.stationPos.x,
              item.stationPos.z - 45,
              `⬆️ ${item.shortName.toUpperCase()} Lv.${st.level}/10!`,
              item.color
            );
          }
        }
      }
      this.updateHUD();
    }

    setViewMode(mode, subPage = null) {
      if (subPage) this.warSubPage = subPage;
      this.viewMode = mode === 'war' ? 'war' : 'shop';
      const shopBtn = document.getElementById('btn-mode-shop');
      const sampleBtn = document.getElementById('btn-mode-sample');
      const captureBtn = document.getElementById('btn-mode-capture');
      const warPanel = document.getElementById('war-game-panel');
      const idleBar = document.getElementById('idle-inspector-bar');
      const retreatBar = document.getElementById('capybara-wave-retreat-bar');

      if (this.viewMode === 'war') {
        this.closeBuildingPopover();
        idleBar?.classList.add('hidden-bar');
        warPanel?.classList.add('visible');
        shopBtn?.classList.remove('active-shop');
        sampleBtn?.classList.toggle('active-war', this.warSubPage === 'sample');
        captureBtn?.classList.toggle('active-war', this.warSubPage === 'capture');
        this.player.x = -520;
        this.player.z = -900;
        this.pointerTarget = null;
        this.world.camX = 0;
        this.world.camZ = -1040;
        if (!this.capybaraRun || !this.capybaraRun.active) {
          if (this.warSubPage === 'capture') {
            this.startPlanetCaptureRun(this.targetCapturePlanetId);
          } else {
            this.startSampleSearchRun(this.sampleSearchDiff || 1);
          }
        }
      } else {
        warPanel?.classList.remove('visible');
        if (retreatBar) retreatBar.style.display = 'none';
        idleBar?.classList.remove('hidden-bar');
        sampleBtn?.classList.remove('active-war');
        captureBtn?.classList.remove('active-war');
        shopBtn?.classList.add('active-shop');
        if (this.player.z < -160) {
          this.player.x = -120;
          this.player.z = 240;
          this.pointerTarget = null;
          this.world.camX = -120;
          this.world.camZ = 240;
        }
        this.spawnFloatingText(this.player.x, this.player.z - 40, '🏪 SUPER DESTROYER SHOP & PORT PAGE', '#4ade80');
      }
      this.updateHUD();
    }
    initRunState() {
      const grantLvl = this.foreverSkills?.perm_start_grant || 0;
      this.cash = 60 + grantLvl * 150;
      this.cashOnGround = 30;
      this.totalServed = 0;
      this.totalKills = 0;
      this.isDefeated = false;
      this.waveNumber = 1;

      this.player = {
        x: -100,
        z: 220,
        walkPhase: 0,
        inventory: [],
        attackTimer: 0
      };

      // v0.0.14: 6 Left-Hand Port Cargo Silos (2 Basic start with 4 stock; ALL 4 Unique Faction Ores start at 0!)
      this.rawExtractors = {};
      for (const raw of CFG.RAW_EXTRACTORS) {
        const isUnique = raw.tierGroup === 'mid_unique' || raw.tierGroup === 'high_unique';
        this.rawExtractors[raw.id] = {
          level: 1,
          speedLvl: 1,
          yieldLvl: 1,
          bufferLvl: 1,
          stock: isUnique ? 0 : (raw.startStock ?? 4),
          maxBuffer: 25,
          progress: 0,
          cycleTime: 1.0
        };
      }

      this.conveyorLevels = {};
      this.conveyors = {};
      this.conveyorRemaining = {};
      for (const c of CFG.CONVEYORS) {
        this.conveyorLevels[c.id] = 0;
        this.conveyors[c.id] = false;
        this.conveyorRemaining[c.id] = c.baseCost;
      }

      this.beltPackets = [];

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
          priceLvl: 1,
          speedLvl: 1,
          yieldLvl: 1,
          counterLvl: 1,
          uniqueMidBoost: false,
          uniqueHighBoost: false,
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
      this.selectedInspectTarget = { type: 'station', id: 'cloth' };
      this.cloneRoomLevel = this.cloneRoomLevel || 1;
      this.hiredClonesCount = this.hiredClonesCount || 0;
      this.workerJobs = this.workerJobs || {
        miner: 0,
        hauler: 0,
        sales: 0,
        cash: 0,
        ammo: 0,
        war: 0
      };

      this.hellpodBayLevel = this.hellpodBayLevel || 1;
      this.totalHellpodDrops = this.totalHellpodDrops || 0;
      this.roguelikePerks = {};
      this.pendingPerkChoices = [];
      this.perkAutoPickTimer = 0;
      this.superSamples = this.superSamples || 0;
      this.samples = this.samples || { common: 0, rare: 0, superRare: 0 };

      this.portLogistics = this.portLogistics || {
        superEarthDrillLvl: 1,
        portsUnlocked: 1,
        shipsCount: 1,
        unloadSpeedLvl: 1,
        storageLimitLvl: 1,
        shipCargoLvl: 1
      };
      if (!this.portLogistics.superEarthDrillLvl) this.portLogistics.superEarthDrillLvl = 1;
      this.fixedStartSupplyBuffer = { oil: 2, iron: 2 };
      this.transportShips = [];
      this.initTransportShips();

      this.initSpaceMapState();
      this.initHelldiverRoster();

      this.warSubPage = 'sample';
      this.sampleSearchDiff = 1;
      this.targetCapturePlanetId = 'sp_heeth';
      this.capybaraRun = null;
      this.warRun = null;
      this.warProgress = this.warProgress || null;
      this.warMigrationNoticePending = false;
      this.initWarFoundation();

      this.workers = [];
      this.customers = [];
      this.enemies = [];
      this.flyingArcs = [];
      this.tracers = [];
      this.explosions = [];
      this.eagleFlyover = null;
      this.solidObstacles = [];

      this.syncWorkers();
      this.recalcDerivedStats();
      this.buildSolidObstacles();
    }

    syncTotalCashOnGround() {
      let sum = 0;
      for (const item of CFG.ITEMS) {
        sum += this.counterCash[item.id] || 0;
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

    getStationProductionTier(itemId) {
      const st = this.stations?.[itemId] || {};
      const hasHighUnique =
        (this.rawExtractors?.raw_bile?.stock || 0) >= 1 ||
        (this.rawExtractors?.raw_qcore?.stock || 0) >= 1 ||
        !!st.uniqueHighBoost;
      const hasMidUnique =
        (this.rawExtractors?.raw_sand?.stock || 0) >= 1 ||
        (this.rawExtractors?.raw_titanium?.stock || 0) >= 1 ||
        !!st.uniqueMidBoost ||
        !!st.uniqueSandBoost ||
        !!st.uniqueTitaniumBoost;

      if (hasHighUnique) {
        return {
          tier: 3,
          mult: 3.5,
          shortBadge: '🟣 Mk.III Apex',
          badge: '🟣 Mk.III Apex (x3.5 Value · Lv.7–10 🧪/⚛️)'
        };
      }
      if (hasMidUnique) {
        return {
          tier: 2,
          mult: 2.2,
          shortBadge: '🟠 Mk.II Enhanced',
          badge: '🟠 Mk.II Enhanced (x2.2 Value · Lv.4–6 🏜️/🔩)'
        };
      }
      return {
        tier: 1,
        mult: 1.0,
        shortBadge: '🟢 Mk.I Simple',
        badge: '🟢 Mk.I Simple (Basic 🛢️/⛏️ Only)'
      };
    }

    getItemSellPrice(item) {
      const itemCfg = typeof item === 'object' ? item : this.getItemConfig(item);
      const base = itemCfg?.sellPrice || 30;
      const st = this.stations[itemCfg?.id] || {};
      const stLvl = st.level || 1;
      const priceAbLvl = st.priceLvl || 1;
      const machineQualityMult = (1 + (stLvl - 1) * 0.10) * (1 + (priceAbLvl - 1) * 0.25);
      const permLvl = this.foreverSkills.perm_gun_value || 0;
      const eq = this.getEquippedItems();
      const armorBonus = eq.armor?.sellBonus || 0;
      const baseSellMult = this.getActiveBaseConfig().sellMult || 1.0;
      const prodTier = this.getStationProductionTier(itemCfg?.id);
      const sampleMult = (1 + (this.superSamples || 0) * 0.15) * prodTier.mult;
      const counterCountMult = 1 + (this.getUnlockedCounterCount(itemCfg?.id) - 1) * 0.25;
      const prestigeMult = this.getPrestigeMultiplier() * sampleMult * counterCountMult;
      const buff = this.stratagemBuffTimer > 0 ? 1.5 : 1.0;
      return Math.round(base * machineQualityMult * (1 + permLvl * 0.20 + armorBonus) * baseSellMult * prestigeMult * buff);
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

    getRawUpgradeCost(rawId) {
      const rawCfg = CFG.RAW_EXTRACTORS.find((r) => r.id === rawId);
      const lvl = this.rawExtractors[rawId]?.level || 0;
      if (lvl === 0) return rawCfg.unlockCost || 110;
      return Math.round(rawCfg.baseUpgradeCost * Math.pow(rawCfg.costScale, lvl - 1));
    }

    getStationUpgradeCost(itemId) {
      const itemCfg = this.getItemConfig(itemId);
      const lvl = this.stations[itemId]?.level || 1;
      return Math.round(itemCfg.baseUpgradeCost * Math.pow(itemCfg.costScale, lvl - 1));
    }

    getConveyorUpgradeCost(convId) {
      const cCfg = CFG.CONVEYORS.find((c) => c.id === convId);
      const lvl = this.conveyorLevels[convId] || 0;
      return Math.round(cCfg.baseCost * Math.pow(cCfg.costScale, lvl));
    }
    recalcDerivedStats() {
      const rawSkill = this.foreverSkills.perm_raw_speed || 0;
      const craftSkill = this.foreverSkills.perm_craft_speed || 0;
      const baseCfg = this.getActiveBaseConfig();
      const drillTechMult = 1 + this.getTechNodeLevel('tech_pneumatic_drill') * 0.18 + this.getTechNodeLevel('tech_laser_bore') * 0.25;
      const factoryTechMult = 1 + this.getTechNodeLevel('tech_silicon_smelter') * 0.20 + this.getTechNodeLevel('tech_overdrive_dome') * 0.30;
      const buff = this.stratagemBuffTimer > 0 ? 2.0 : 1.0;

      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[raw.id];
        if (!rs) continue;
        const lvl = Math.max(1, rs.level || 1);
        const speedAb = rs.speedLvl || 1;
        const bufAb = rs.bufferLvl || 1;
        const planetMult = raw.id === 'raw_iron' ? (baseCfg.ironMult || 1.0) : (baseCfg.e710Mult || 1.0);
        const speedMult = (1 + (lvl - 1) * 0.20) * (1 + (speedAb - 1) * 0.22) * (1 + rawSkill * 0.18) * drillTechMult * planetMult * buff;
        rs.cycleTime = Math.max(0.14, raw.baseCycleTime / speedMult);
        rs.maxBuffer = Math.max(this.getPortStorageLimit(), raw.baseBuffer + (lvl - 1) * 3 + (bufAb - 1) * 5);
      }

      for (const item of CFG.ITEMS) {
        const st = this.stations[item.id];
        const lvl = Math.max(1, st.level || 1);
        const speedAb = st.speedLvl || 1;
        const cCount = this.getUnlockedCounterCount(item.id);
        const speedMult = (1 + (lvl - 1) * 0.18) * (1 + (speedAb - 1) * 0.22) * (1 + craftSkill * 0.15) * factoryTechMult * buff;
        st.cycleTime = Math.max(0.18, item.cycleTime / speedMult);
        st.maxBuffer = item.maxBuffer + (lvl - 1) * 2 + (cCount - 1) * 8;
      }
    }

    buildSolidObstacles() {
      const obs = [];
      for (const raw of CFG.RAW_EXTRACTORS) {
        obs.push({ x: raw.x, z: raw.z, hx: 82, hz: 36, label: raw.shortName });
      }
      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        obs.push({ x: item.stationPos.x, z: item.stationPos.z, hx: 52, hz: 52, label: item.shortName });
        const cCount = this.getUnlockedCounterCount(item.id);
        obs.push({ x: item.counterPos.x, z: item.counterPos.z, hx: 68, hz: 46, label: `Counter #${item.tier}-1` });
        if (cCount >= 2 && item.counter2Pos) {
          obs.push({ x: item.counter2Pos.x, z: item.counter2Pos.z, hx: 68, hz: 46, label: `Counter #${item.tier}-2` });
        }
        if (cCount >= 3 && item.counter3Pos) {
          obs.push({ x: item.counter3Pos.x, z: item.counter3Pos.z, hx: 68, hz: 46, label: `Counter #${item.tier}-3` });
        }
      }
      this.solidObstacles = obs;
      if (this.player) this.ejectEntityFromObstacles(this.player, 24);
    }

    ejectEntityFromObstacles(ent, radius = 22) {
      for (let pass = 0; pass < 3; pass++) {
        for (const ob of this.solidObstacles) {
          const ex = ob.hx + radius;
          const ez = ob.hz + radius;
          const dx = ent.x - ob.x;
          const dz = ent.z - ob.z;
          if (Math.abs(dx) < ex && Math.abs(dz) < ez) {
            const ox = ex - Math.abs(dx);
            const oz = ez - Math.abs(dz);
            if (ox < oz) {
              ent.x += dx >= 0 ? ox + 2 : -(ox + 2);
            } else {
              ent.z += dz >= 0 ? oz + 2 : -(oz + 2);
            }
          }
        }
      }
    }

    moveWithCollision(ent, vx, vz, dt, radius = 22) {
      const W = CFG.WORLD;
      const minZ = this.viewMode === 'war' ? W.minZ + 60 : -460;
      const maxZ = this.viewMode === 'war' ? -180 : W.maxZ - 60;
      let nx = Math.max(W.minX + 60, Math.min(W.maxX - 60, ent.x + vx * dt));
      for (const ob of this.solidObstacles) {
        if (Math.abs(nx - ob.x) < ob.hx + radius && Math.abs(ent.z - ob.z) < ob.hz + radius) {
          nx = vx > 0 ? ob.x - (ob.hx + radius) : ob.x + (ob.hx + radius);
        }
      }
      ent.x = nx;

      let nz = Math.max(minZ, Math.min(maxZ, ent.z + vz * dt));
      for (const ob of this.solidObstacles) {
        if (Math.abs(ent.x - ob.x) < ob.hx + radius && Math.abs(nz - ob.z) < ob.hz + radius) {
          nz = vz > 0 ? ob.z - (ob.hz + radius) : ob.z + (ob.hz + radius);
        }
      }
      ent.z = nz;
    }

    loop(now) {
      const dt = Math.min(0.08, Math.max(0.001, (now - this.lastTime) / 1000));
      this.lastTime = now;

      try {
        this.update(dt);
        this.world.render(this, dt);
        this.renderCharacterShowcaseFrame(dt);
      } catch (err) {
        console.error('Game loop frame error:', err);
      }

      requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
      this.playTimeSeconds += dt;
      if (this.stratagemCooldown > 0) this.stratagemCooldown = Math.max(0, this.stratagemCooldown - dt);
      if (this.stratagemBuffTimer > 0) {
        this.stratagemBuffTimer = Math.max(0, this.stratagemBuffTimer - dt);
        if (this.stratagemBuffTimer === 0) this.recalcDerivedStats();
      }
      if (this.stationPadCooldown > 0) this.stationPadCooldown = Math.max(0, this.stationPadCooldown - dt);
      if (this.beltPadCooldown > 0) this.beltPadCooldown = Math.max(0, this.beltPadCooldown - dt);
      if (this.armoryPadCooldown > 0) this.armoryPadCooldown = Math.max(0, this.armoryPadCooldown - dt);

      if (this.pendingPerkChoices && this.pendingPerkChoices.length > 0) {
        this.perkAutoPickTimer -= dt;
        if (this.perkAutoPickTimer <= 0) {
          this.selectRoguelikePerk(this.pendingPerkChoices[0].id);
        }
      }

      this.updatePlayerMovement(dt);
      this.updateRawAndAmmoProduction(dt);
      this.updateArsenalFactories(dt);
      this.updateConveyorAutomation(dt);
      this.updateBeltPackets(dt);
      this.updatePlayerInteractions(dt);
      this.updateWorkers(dt);
      this.updateCustomersAndSales(dt);
      if (this.viewMode === 'war') {
        this.updateCapybaraRoguelikeWar(dt);
      }
      this.updateMindustryBasesAndAllies(dt);
      this.updateVisualEffects(dt);
      this.checkMilestones(dt);
      this.updateHUD();
    }

    updateMindustryBasesAndAllies(dt) {
      this.basePassiveReqTimer = (this.basePassiveReqTimer || 0) + dt;
      if (this.basePassiveReqTimer >= 1.0) {
        this.basePassiveReqTimer -= 1.0;
        const passiveIncome = this.getTotalPassiveBaseIncome();
        if (passiveIncome > 0) {
          this.cash += passiveIncome;
        }
      }
    }

    checkMilestones(dt) {
      this.milestoneCheckTimer -= dt;
      if (this.milestoneCheckTimer > 0) return;
      this.milestoneCheckTimer = 1.0;

      for (const m of (CFG.MILESTONES || [])) {
        if (this.claimedMilestones[m.id]) continue;
        let current = 0;
        if (m.type === 'served') current = this.lifetimeServed;
        else if (m.type === 'kills') current = this.lifetimeKills;
        else if (m.type === 'wave') current = this.highestWave;
        else if (m.type === 'unlocks') current = Object.values(this.unlocked).filter(Boolean).length;

        if (current >= m.target) {
          this.claimedMilestones[m.id] = true;
          this.medals += m.medalReward;
          this.saveGame();
          this.audio.playUnlock();
          this.spawnFloatingText(
            this.player.x,
            this.player.z - 48,
            `🏆 MILESTONE: ${m.name} (+${m.medalReward} ⭐)!`,
            '#fde047'
          );
        }
      }
    }

    updatePlayerMovement(dt) {
      const p = this.player;
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
        const dx = this.pointerTarget.x - p.x;
        const dz = this.pointerTarget.z - p.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 14) {
          vx = dx / dist;
          vz = dz / dist;
        } else {
          this.pointerTarget = null;
        }
      }

      const speed = this.getPlayerMoveSpeed();
      if (vx !== 0 || vz !== 0) {
        p.walkPhase += dt * 11;
        this.moveWithCollision(p, vx * speed, vz * speed, dt, 22);
      }
    }

    updateRawAndAmmoProduction(dt) {
      this.updatePortAndSpaceLogistics(dt);
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
            // Multi-Output Yield Ability (`yieldLvl`): 1 raw batch produces up to 4x goods + raw-save chance!
            const yieldAb = st.yieldLvl || 1;
            if (Math.random() < (yieldAb - 1) * 0.07) {
              if (item.recipe.raw_iron) st.inputStock.raw_iron = (st.inputStock.raw_iron || 0) + 1;
              if (item.recipe.raw_e710) st.inputStock.raw_e710 = (st.inputStock.raw_e710 || 0) + 1;
            }
            const outGoods = 1 + Math.floor(yieldAb / 3);
            st.stock = Math.min(maxBuf, st.stock + outGoods);
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

      // 1. PURPLE BIO-FUEL & BUG UNIQUE BELT (`conv_raw_e710`): Pipes 🛢️ Oil (plus Lv.4-6 🏜️ Sand & Lv.7-10 🧪 Bile Crystal) to E-710 Hoppers!
      const e710BeltLvl = this.conveyorLevels?.conv_raw_e710 || 0;
      if (e710BeltLvl > 0) {
        const e710Stock = this.rawExtractors.raw_e710;
        const sandStock = this.rawExtractors.raw_sand;
        const bileStock = this.rawExtractors.raw_bile;
        const transferCap = 1 + Math.floor(e710BeltLvl / 4);
        const maxHopperFill = 8 + e710BeltLvl * 2;
        const speed = 0.95 + e710BeltLvl * 0.08;

        for (const item of CFG.ITEMS) {
          if (!this.unlocked[item.id] || !item.recipe.raw_e710) continue;
          const st = this.stations[item.id];
          const targetKey = `hopper_${item.id}_e710`;
          const curTotal = (st.inputStock.raw_e710 || 0) + this.countInFlightToTarget(targetKey);
          if (curTotal < maxHopperFill) {
            if (bileStock && bileStock.stock >= 1) {
              bileStock.stock -= 1;
              this.spawnBeltPacket({
                beltId: 'conv_raw_e710',
                targetKey,
                path: [
                  { x: -1200, z: 820 },
                  { x: -960, z: 820 },
                  { x: -960, z: item.inputPos.z - 12 },
                  { x: item.inputPos.x, z: item.inputPos.z - 12 }
                ],
                icon: '🧪',
                color: '#84cc16',
                qty: 3,
                speed,
                onArrive: () => {
                  st.inputStock.raw_e710 = (st.inputStock.raw_e710 || 0) + 3;
                  st.uniqueHighBoost = true;
                }
              });
            } else if (sandStock && sandStock.stock >= 1) {
              sandStock.stock -= 1;
              this.spawnBeltPacket({
                beltId: 'conv_raw_e710',
                targetKey,
                path: [
                  { x: -1200, z: 600 },
                  { x: -960, z: 600 },
                  { x: -960, z: item.inputPos.z - 12 },
                  { x: item.inputPos.x, z: item.inputPos.z - 12 }
                ],
                icon: '🏜️',
                color: '#eab308',
                qty: 2,
                speed,
                onArrive: () => {
                  st.inputStock.raw_e710 = (st.inputStock.raw_e710 || 0) + 2;
                  st.uniqueMidBoost = true;
                }
              });
            } else if (e710Stock && e710Stock.stock >= 1) {
              const take = Math.min(transferCap, Math.floor(e710Stock.stock), maxHopperFill - curTotal);
              if (take > 0) {
                e710Stock.stock -= take;
                this.spawnBeltPacket({
                  beltId: 'conv_raw_e710',
                  targetKey,
                  path: [
                    { x: -1200, z: 160 },
                    { x: -960, z: 160 },
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

      // 2. CYAN SUPER IRON & BOT UNIQUE BELT (`conv_raw_iron`): Pipes ⛏️ Iron (plus Lv.4-6 🔩 Titanium & Lv.7-10 ⚛️ Quantum Core) to Iron Hoppers!
      const ironBeltLvl = this.conveyorLevels?.conv_raw_iron || 0;
      if (ironBeltLvl > 0) {
        const ironStock = this.rawExtractors.raw_iron;
        const tiStock = this.rawExtractors.raw_titanium;
        const qcoreStock = this.rawExtractors.raw_qcore;
        const transferCap = 1 + Math.floor(ironBeltLvl / 4);
        const maxHopperFill = 8 + ironBeltLvl * 2;
        const speed = 0.95 + ironBeltLvl * 0.08;

        for (const item of CFG.ITEMS) {
          if (!this.unlocked[item.id] || !item.recipe.raw_iron) continue;
          const st = this.stations[item.id];
          const targetKey = `hopper_${item.id}_iron`;
          const curTotal = (st.inputStock.raw_iron || 0) + this.countInFlightToTarget(targetKey);
          if (curTotal < maxHopperFill) {
            if (qcoreStock && qcoreStock.stock >= 1) {
              qcoreStock.stock -= 1;
              this.spawnBeltPacket({
                beltId: 'conv_raw_iron',
                targetKey,
                path: [
                  { x: -1200, z: 1260 },
                  { x: -910, z: 1260 },
                  { x: -910, z: item.inputPos.z + 12 },
                  { x: item.inputPos.x, z: item.inputPos.z + 12 }
                ],
                icon: '⚛️',
                color: '#06b6d4',
                qty: 3,
                speed,
                onArrive: () => {
                  st.inputStock.raw_iron = (st.inputStock.raw_iron || 0) + 3;
                  st.uniqueHighBoost = true;
                }
              });
            } else if (tiStock && tiStock.stock >= 1) {
              tiStock.stock -= 1;
              this.spawnBeltPacket({
                beltId: 'conv_raw_iron',
                targetKey,
                path: [
                  { x: -1200, z: 1040 },
                  { x: -910, z: 1040 },
                  { x: -910, z: item.inputPos.z + 12 },
                  { x: item.inputPos.x, z: item.inputPos.z + 12 }
                ],
                icon: '🔩',
                color: '#ec4899',
                qty: 2,
                speed,
                onArrive: () => {
                  st.inputStock.raw_iron = (st.inputStock.raw_iron || 0) + 2;
                  st.uniqueMidBoost = true;
                }
              });
            } else if (ironStock && ironStock.stock >= 1) {
              const take = Math.min(transferCap, Math.floor(ironStock.stock), maxHopperFill - curTotal);
              if (take > 0) {
                ironStock.stock -= take;
                this.spawnBeltPacket({
                  beltId: 'conv_raw_iron',
                  targetKey,
                  path: [
                    { x: -1200, z: 380 },
                    { x: -910, z: 380 },
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

      // 3. 7 DEDICATED HORIZONTAL OUTPUT-TO-COUNTER BELTS (`conv_counter_auto`)
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

    updatePlayerInteractions(dt) {
      const p = this.player;
      const L = CFG.LOCATIONS;
      const maxCap = this.getPlayerMaxCapacity();

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

      if (this.cashOnGround > 0 && L.cashRegisterZone && Math.hypot(p.x - L.cashRegisterZone.x, p.z - L.cashRegisterZone.z) < L.cashRegisterZone.radius) {
        const collect = this.cashOnGround;
        this.cash += collect;
        for (const k of Object.keys(this.counterCash)) this.counterCash[k] = 0;
        this.cashOnGround = 0;
        this.audio.playCash();
        this.spawnFloatingText(p.x, p.z - 30, `+$${collect} REQ`, '#4ade80');
      }

      const distTrash = Math.hypot(p.x - L.trashCanZone.x, p.z - L.trashCanZone.z);
      if (distTrash < L.trashCanZone.radius && p.inventory.length > 0) {
        p.inventory = [];
        this.audio.playPickup();
        this.spawnFloatingText(p.x, p.z - 25, '🗑️ STACK CLEARED', '#f87171');
      }

      const distArmory = Math.hypot(p.x - L.armoryLoadoutPad.x, p.z - L.armoryLoadoutPad.z);
      if (distArmory < L.armoryLoadoutPad.radius && this.armoryPadCooldown <= 0) {
        this.armoryPadCooldown = 4.5;
        this.renderLoadoutModal();
        document.getElementById('modal-loadout')?.classList.add('open');
      }

      this.transferCooldown -= dt;
      if (this.transferCooldown > 0) return;

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

      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const distCounter = Math.hypot(p.x - item.counterDropPos.x, p.z - item.counterDropPos.z);
        if (distCounter < 105) {
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

      for (const raw of CFG.RAW_EXTRACTORS) {
        const rs = this.rawExtractors[raw.id];
        if (!rs) continue;
        const distPickPort = Math.min(
          Math.hypot(p.x - raw.pickupX, p.z - raw.pickupZ),
          Math.hypot(p.x - raw.x, p.z - raw.z)
        );
        if (distPickPort < 95 && rs.stock >= 1 && p.inventory.length < maxCap) {
          rs.stock--;
          p.inventory.push({ id: raw.id, icon: raw.itemIcon, color: raw.color });
          this.transferCooldown = CFG.PLAYER.transferInterval;
          this.audio.playPickup();
          this.spawnArc(raw.x, raw.z, p.x, p.z - 20, raw.itemIcon, raw.color);
          this.spawnFloatingText(p.x, p.z - 35, `+1 ${raw.itemIcon} FROM PORT`, raw.color);
          return;
        }
      }

      for (const item of CFG.ITEMS) {
        if (!this.unlocked[item.id]) continue;
        const st = this.stations[item.id];
        const distHopper = Math.hypot(p.x - item.inputPos.x, p.z - item.inputPos.z);
        if (distHopper < 95) {
          const rawIdx = p.inventory.findIndex(
            (it) =>
              ((it.id === 'raw_iron' || it.id === 'raw_titanium' || it.id === 'raw_qcore') && item.recipe.raw_iron) ||
              ((it.id === 'raw_e710' || it.id === 'raw_sand' || it.id === 'raw_bile') && item.recipe.raw_e710)
          );
          if (rawIdx !== -1) {
            const entry = p.inventory.splice(rawIdx, 1)[0];
            if (entry.id === 'raw_bile') {
              st.inputStock.raw_e710 = (st.inputStock.raw_e710 || 0) + 3;
              st.uniqueHighBoost = true;
            } else if (entry.id === 'raw_sand') {
              st.inputStock.raw_e710 = (st.inputStock.raw_e710 || 0) + 2;
              st.uniqueMidBoost = true;
            } else if (entry.id === 'raw_qcore') {
              st.inputStock.raw_iron = (st.inputStock.raw_iron || 0) + 3;
              st.uniqueHighBoost = true;
            } else if (entry.id === 'raw_titanium') {
              st.inputStock.raw_iron = (st.inputStock.raw_iron || 0) + 2;
              st.uniqueMidBoost = true;
            } else {
              st.inputStock[entry.id] = (st.inputStock[entry.id] || 0) + 1;
            }
            this.transferCooldown = CFG.PLAYER.transferInterval;
            this.audio.playPickup();
            this.spawnArc(p.x, p.z - 20, item.inputPos.x, item.inputPos.z, entry.icon, entry.color);
            return;
          }
        }
      }

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

      for (const item of CFG.ITEMS) {
        const distPad = Math.min(Math.hypot(p.x - item.stationPos.x, p.z - item.stationPos.z), Math.hypot(p.x - item.unlockPos.x, p.z - item.unlockPos.z));
        if (distPad < 92 && !this.unlocked[item.id] && this.cash > 0) {
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
      }
    }

    getTotalAssignedJobs() {
      const j = this.workerJobs || {};
      return (j.miner || 0) + (j.hauler || 0) + (j.sales || 0) + (j.cash || 0) + (j.ammo || 0) + (j.war || 0);
    }

    syncWorkers() {
      if (!this.workerJobs) {
        this.workerJobs = { miner: 0, hauler: 0, sales: 0, cash: 0, ammo: 0, war: 0 };
      }
      const maxCap = this.getMaxWorkerCap();
      const targetTotal = Math.min(maxCap, this.hiredClonesCount || 0);

      while (this.workers.length < targetTotal) {
        const idx = this.workers.length;
        this.workers.push({
          role: 'hauler',
          slotIndex: idx,
          x: -1655 + (idx % 4) * 45,
          z: -210 + Math.floor(idx / 4) * 35,
          walkPhase: idx,
          taskLabel: '🧬 Cloned',
          assistTimer: 0,
          inventory: []
        });
      }
      if (this.workers.length > targetTotal) {
        this.workers.length = targetTotal;
      }

      const roleQueue = [];
      for (const jobCfg of (CFG.CLONE_JOBS || [])) {
        const count = Math.max(0, this.workerJobs[jobCfg.id] || 0);
        for (let k = 0; k < count; k++) roleQueue.push(jobCfg.id);
      }

      for (let i = 0; i < this.workers.length; i++) {
        const w = this.workers[i];
        const newRole = roleQueue[i] || 'cash';
        if (w.role !== newRole) {
          w.role = newRole;
          w.inventory = [];
        }
        w.slotIndex = i;
      }
    }

    hireSeafClone() {
      const maxCap = this.getMaxWorkerCap();
      if ((this.hiredClonesCount || 0) >= maxCap) {
        this.spawnFloatingText(-1500, -130, `⚠️ CLONE ROOM FULL (${maxCap}/${maxCap}) — UPGRADE CLONE ROOM!`, '#ef4444');
        return;
      }
      const cost = this.getCloneHireCost();
      if (this.cash < cost) {
        this.spawnFloatingText(-1500, -130, `⚠️ NEED $${cost} TO CLONE SEAF`, '#ef4444');
        return;
      }
      this.cash -= cost;
      this.hiredClonesCount = (this.hiredClonesCount || 0) + 1;

      const jobOrder = ['miner', 'hauler', 'sales', 'cash', 'ammo', 'war'];
      let bestJob = 'miner';
      let minVal = 999;
      for (const jId of jobOrder) {
        const val = this.workerJobs[jId] || 0;
        if (val < minVal) {
          minVal = val;
          bestJob = jId;
        }
      }
      this.workerJobs[bestJob] = (this.workerJobs[bestJob] || 0) + 1;

      this.syncWorkers();
      this.audio.playUnlock();
      this.saveGame();
      this.renderCloneRoomModal();
      this.updateHUD();
      this.spawnFloatingText(-1500, -135, `🧬 CLONED SEAF WORKER #${this.hiredClonesCount} (ASSIGNED: ${bestJob.toUpperCase()})!`, '#4ade80');
    }

    upgradeCloneRoom() {
      if ((this.cloneRoomLevel || 1) >= 10) return;
      const cost = this.getCloneRoomUpgradeCost();
      if (this.cash < cost) {
        this.spawnFloatingText(-1500, -130, `⚠️ NEED $${cost} TO UPGRADE CLONE ROOM`, '#ef4444');
        return;
      }
      this.cash -= cost;
      this.cloneRoomLevel = (this.cloneRoomLevel || 1) + 1;
      this.syncWorkers();
      this.audio.playUnlock();
      this.saveGame();
      this.renderCloneRoomModal();
      this.updateHUD();
      this.spawnFloatingText(-1500, -140, `🧬 CLONE ROOM Lv.${this.cloneRoomLevel}/10! MAX WORKERS: ${this.getMaxWorkerCap()}!`, '#4ade80');
    }

    adjustWorkerJob(jobId, delta) {
      if (!this.workerJobs) return;
      const cur = this.workerJobs[jobId] || 0;
      if (delta > 0) {
        const totalAssigned = this.getTotalAssignedJobs();
        if (totalAssigned >= (this.hiredClonesCount || 0)) {
          let donor = null;
          let maxCount = 0;
          for (const k of Object.keys(this.workerJobs)) {
            if (k !== jobId && (this.workerJobs[k] || 0) > maxCount) {
              maxCount = this.workerJobs[k];
              donor = k;
            }
          }
          if (donor && maxCount > 0) {
            this.workerJobs[donor]--;
            this.workerJobs[jobId] = cur + 1;
          } else {
            return;
          }
        } else {
          this.workerJobs[jobId] = cur + 1;
        }
      } else if (delta < 0 && cur > 0) {
        this.workerJobs[jobId] = cur - 1;
      }
      this.syncWorkers();
      this.audio.playPickup();
      this.saveGame();
      this.renderCloneRoomModal();
      this.updateHUD();
    }

    autoBalanceWorkerJobs() {
      const total = this.hiredClonesCount || 0;
      const keys = ['miner', 'hauler', 'sales', 'cash', 'ammo', 'war'];
      for (const k of keys) this.workerJobs[k] = 0;
      for (let i = 0; i < total; i++) {
        const k = keys[i % keys.length];
        this.workerJobs[k]++;
      }
      this.syncWorkers();
      this.audio.playUnlock();
      this.saveGame();
      this.renderCloneRoomModal();
      this.updateHUD();
    }

    renderCloneRoomModal() {
      const sumEl = document.getElementById('clone-room-summary');
      const jobsTitle = document.getElementById('clone-jobs-title');
      const jobsGrid = document.getElementById('clone-jobs-grid');
      if (!sumEl || !jobsGrid) return;

      this.cloneModalPage = this.cloneModalPage || 'vat';
      const page = this.cloneModalPage;

      const cLvl = this.cloneRoomLevel || 1;
      const maxCap = this.getMaxWorkerCap();
      const totalClones = this.hiredClonesCount || 0;
      const assigned = this.getTotalAssignedJobs();
      const unassigned = Math.max(0, totalClones - assigned);
      const hCost = this.getCloneHireCost();
      const uCost = this.getCloneRoomUpgradeCost();

      jobsGrid.innerHTML = '';
      for (const jCfg of (CFG.CLONE_JOBS || [])) {
        const count = this.workerJobs?.[jCfg.id] || 0;
        const card = document.createElement('div');
        card.className = 'upgrade-item';
        card.style.borderColor = jCfg.color;
        card.innerHTML = `
          <div class="upgrade-info">
            <h4 style="color:${jCfg.color};">${jCfg.icon} ${jCfg.name}: <span style="color:#fde047;">${count} Assigned</span></h4>
            <p>${jCfg.desc}</p>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button class="hud-btn btn-job-minus" style="padding:6px 11px;font-size:0.85rem;" ${count <= 0 ? 'disabled' : ''}>➖</button>
            <span style="font-family:var(--font-display);font-weight:900;font-size:0.9rem;min-width:22px;text-align:center;">${count}</span>
            <button class="buy-btn btn-job-plus" style="padding:6px 11px;font-size:0.85rem;" ${totalClones <= 0 ? 'disabled' : ''}>➕</button>
          </div>
        `;
        card.querySelector('.btn-job-minus').addEventListener('click', () => this.adjustWorkerJob(jCfg.id, -1));
        card.querySelector('.btn-job-plus').addEventListener('click', () => this.adjustWorkerJob(jCfg.id, 1));
        jobsGrid.appendChild(card);
      }

      if (page === 'vat') {
        if (jobsTitle) jobsTitle.style.display = 'none';
        jobsGrid.style.display = 'none';

        sumEl.innerHTML = `
          <div style="width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
              <div style="font-family:var(--font-display);font-weight:900;color:#4ade80;font-size:0.96rem;">
                🧬 PAGE 1: SEAF CLONE VAT CHAMBER (Lv.${cLvl}/10 · WORKERS: ${totalClones}/${maxCap})
              </div>
              <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.9rem;">
                💵 Wallet: $${Math.floor(this.cash)}
              </div>
            </div>
            <p style="font-size:0.8rem;color:#cbd5e1;margin-bottom:12px;">
              Upgrade the Clone Vat Chamber to increase your Worker Upper Limit (up to 30) and worker move speed (+8%/Lv). Hire SEAF Clones here, then open Page 2 to assign them across 6 Shop Jobs!
            </p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin-bottom:12px;">
              <button class="buy-btn" id="btn-hire-seaf-clone" style="padding:12px;font-size:0.88rem;" ${totalClones >= maxCap || this.cash < hCost ? 'disabled' : ''}>
                ${totalClones >= maxCap ? `MAX ${maxCap} WORKERS` : `➕ Clone +1 SEAF Worker ($${hCost})`}
              </button>
              <button class="buy-btn medal-btn" id="btn-upgrade-clone-room" style="padding:12px;font-size:0.88rem;" ${cLvl >= 10 || this.cash < uCost ? 'disabled' : ''}>
                ${cLvl >= 10 ? '✅ CLONE ROOM MAX Lv.10' : `⬆️ Upgrade Clone Room Lv.${cLvl + 1}/10 ($${uCost} · +3 Cap)`}
              </button>
            </div>
            <button class="hud-btn" id="btn-clone-goto-jobs" style="width:100%;border-color:#38bdf8;color:#7dd3fc;padding:12px;font-size:0.9rem;">
              📋 Go to Page 2: Assign Workers Across 6 Sector Jobs (${assigned}/${totalClones} Assigned) ➔
            </button>
          </div>
        `;
        document.getElementById('btn-hire-seaf-clone')?.addEventListener('click', () => this.hireSeafClone());
        document.getElementById('btn-upgrade-clone-room')?.addEventListener('click', () => this.upgradeCloneRoom());
        document.getElementById('btn-clone-goto-jobs')?.addEventListener('click', () => {
          this.cloneModalPage = 'jobs';
          this.renderCloneRoomModal();
        });
      } else {
        if (jobsTitle) {
          jobsTitle.style.display = 'block';
          jobsTitle.innerHTML = `📋 PAGE 2: ASSIGN SEAF CLONES ACROSS 6 SECTOR JOBS (UNASSIGNED: <span id="clone-unassigned-count">${unassigned}</span>)`;
        }
        jobsGrid.style.display = 'grid';

        sumEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
            <button class="hud-btn" id="btn-clone-back-vat" style="border-color:#facc15;color:#fde047;padding:7px 14px;">
              ⬅️ Back to Page 1: Clone Vat &amp; Hire (${totalClones}/${maxCap})
            </button>
            <div style="font-family:var(--font-display);font-weight:900;color:#4ade80;font-size:0.9rem;">
              📋 6-SECTOR WORKER JOB ASSIGNMENT
            </div>
            <button class="hud-btn" id="btn-auto-balance-jobs" style="border-color:#38bdf8;color:#7dd3fc;">
              ⚖️ Auto-Balance All (${totalClones})
            </button>
          </div>
        `;
        document.getElementById('btn-clone-back-vat')?.addEventListener('click', () => {
          this.cloneModalPage = 'vat';
          this.renderCloneRoomModal();
        });
        document.getElementById('btn-auto-balance-jobs')?.addEventListener('click', () => this.autoBalanceWorkerJobs());
      }
    }

    updateWorkers(dt) {
      const eliteBonus = 1 + (this.foreverSkills.perm_commander_elite || 0) * 0.10;
      const cloneSpdBonus = 1 + ((this.cloneRoomLevel || 1) - 1) * 0.08;
      const reservedHoppers = new Set();
      const reservedOutputLanes = new Set();
      const reservedCounters = new Set();

      for (const w of this.workers) {
        w.walkPhase += dt * 10;
        const slotIdx = w.slotIndex || 0;
        const speed = 215 * cloneSpdBonus * eliteBonus;
        const carryCap = 3 + Math.floor((this.cloneRoomLevel || 1) / 2);

        if (w.role === 'miner') {
          if (w.inventory.length === 0) {
            const needyHoppers = [];
            for (const item of CFG.ITEMS) {
              if (!this.unlocked[item.id]) continue;
              const st = this.stations[item.id];
              if (item.recipe.raw_e710) needyHoppers.push({ rawId: 'raw_e710', stock: st.inputStock.raw_e710 || 0 });
              if (item.recipe.raw_iron) needyHoppers.push({ rawId: 'raw_iron', stock: st.inputStock.raw_iron || 0 });
            }
            needyHoppers.sort((a, b) => a.stock - b.stock);
            let chosenRawId = (needyHoppers[slotIdx % Math.max(1, needyHoppers.length)] || { rawId: 'raw_e710' }).rawId;
            if (chosenRawId === 'raw_e710') {
              if ((this.rawExtractors.raw_bile?.stock || 0) >= 1 && slotIdx % 2 === 1) chosenRawId = 'raw_bile';
              else if ((this.rawExtractors.raw_sand?.stock || 0) >= 1 && slotIdx % 2 === 1) chosenRawId = 'raw_sand';
            } else if (chosenRawId === 'raw_iron') {
              if ((this.rawExtractors.raw_qcore?.stock || 0) >= 1 && slotIdx % 2 === 1) chosenRawId = 'raw_qcore';
              else if ((this.rawExtractors.raw_titanium?.stock || 0) >= 1 && slotIdx % 2 === 1) chosenRawId = 'raw_titanium';
            }
            const rawCfg = CFG.RAW_EXTRACTORS.find((r) => r.id === chosenRawId) || CFG.RAW_EXTRACTORS[0];
            const rs = this.rawExtractors[rawCfg.id];
            const targetX = rawCfg.pickupX;
            const targetZ = rawCfg.pickupZ;
            w.taskLabel = `🛸 Pick Port ${rawCfg.itemIcon}`;

            const dx = targetX - w.x;
            const dz = targetZ - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else if (rs && rs.stock >= 1) {
              const take = Math.min(carryCap, Math.floor(rs.stock));
              if (take > 0) {
                rs.stock -= take;
                for (let k = 0; k < take; k++) w.inventory.push({ id: rawCfg.id, icon: rawCfg.itemIcon, color: rawCfg.color });
              }
            }
          } else {
            const heldId = w.inventory[0].id;
            const isBugOre = heldId === 'raw_e710' || heldId === 'raw_sand' || heldId === 'raw_bile';
            const mapKey = isBugOre ? 'raw_e710' : 'raw_iron';
            const candidates = [];
            for (const item of CFG.ITEMS) {
              if (!this.unlocked[item.id] || !item.recipe[mapKey]) continue;
              const st = this.stations[item.id];
              candidates.push({ key: item.id, pos: item.inputPos, hopper: st.inputStock, st, count: st.inputStock[mapKey] || 0, name: `${item.icon} Hopper` });
            }
            if (candidates.length === 0) { w.inventory = []; continue; }
            candidates.sort((a, b) => a.count - b.count);
            const chosen = candidates.find((c) => !reservedHoppers.has(`${c.key}_${mapKey}`)) || candidates[0];
            reservedHoppers.add(`${chosen.key}_${mapKey}`);
            w.taskLabel = `📥 Feed ${chosen.name}`;
            const dx = chosen.pos.x - w.x;
            const dz = chosen.pos.z - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const mult = (heldId === 'raw_bile' || heldId === 'raw_qcore') ? 3 : ((heldId === 'raw_sand' || heldId === 'raw_titanium') ? 2 : 1);
              chosen.hopper[mapKey] = (chosen.hopper[mapKey] || 0) + w.inventory.length * mult;
              if (heldId === 'raw_bile' || heldId === 'raw_qcore') chosen.st.uniqueHighBoost = true;
              if (heldId === 'raw_sand' || heldId === 'raw_titanium') chosen.st.uniqueMidBoost = true;
              w.inventory = [];
            }
          }
        } else if (w.role === 'hauler') {
          if (w.inventory.length > 0) {
            const heldId = w.inventory[0].id;
            const itemCfg = this.getItemConfig(heldId) || CFG.ITEMS[0];
            w.taskLabel = `📦 Stock #${itemCfg.tier}`;
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
          } else {
            const readyItems = CFG.ITEMS.filter((it) => this.unlocked[it.id] && (this.stations[it.id]?.stock || 0) > 0 && !reservedOutputLanes.has(it.id));
            const chosenLane = readyItems.length > 0 ? readyItems[slotIdx % readyItems.length] : CFG.ITEMS[0];
            reservedOutputLanes.add(chosenLane.id);
            w.taskLabel = `📤 Pickup ${chosenLane.icon}`;
            const dx = chosenLane.pickupPos.x - w.x;
            const dz = chosenLane.pickupPos.z - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 28) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const st = this.stations[chosenLane.id];
              const take = Math.min(carryCap, st?.stock || 0);
              if (take > 0) {
                st.stock -= take;
                for (let k = 0; k < take; k++) w.inventory.push({ id: chosenLane.id, icon: chosenLane.icon, color: chosenLane.color });
              }
            }
          }
        } else if (w.role === 'sales') {
          const unlockedItems = CFG.ITEMS.filter((it) => this.unlocked[it.id]);
          const targetLane = unlockedItems[slotIdx % Math.max(1, unlockedItems.length)] || CFG.ITEMS[0];
          const deskCount = this.getUnlockedCounterCount(targetLane.id);
          const deskIdx = slotIdx % deskCount;
          const tx = deskIdx === 2 ? targetLane.counter3Pos.x : (deskIdx === 1 ? targetLane.counter2Pos.x : targetLane.counterPos.x);
          const tz = targetLane.counterPos.z - 52;
          w.taskLabel = `🫡 Sales #${targetLane.tier}-${deskIdx + 1}`;
          const dx = tx - w.x;
          const dz = tz - w.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 20) {
            w.x += (dx / dist) * speed * dt;
            w.z += (dz / dist) * speed * dt;
          }
        } else if (w.role === 'cash') {
          const unlockedItems = CFG.ITEMS.filter((it) => this.unlocked[it.id]);
          const cashLanes = unlockedItems.filter((it) => (this.counterCash[it.id] || 0) > 0 && !reservedCounters.has(it.id));
          const target = cashLanes.length > 0 ? cashLanes[0] : unlockedItems[slotIdx % Math.max(1, unlockedItems.length)];
          if (target) {
            reservedCounters.add(target.id);
            w.taskLabel = `💵 Pick Cash #${target.tier}`;
            const dx = target.cashPos.x - w.x;
            const dz = target.cashPos.z - w.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 26) {
              w.x += (dx / dist) * speed * dt;
              w.z += (dz / dist) * speed * dt;
            } else {
              const cVal = this.counterCash[target.id] || 0;
              if (cVal > 0) {
                this.cash += cVal;
                this.counterCash[target.id] = 0;
                this.syncTotalCashOnGround();
                this.audio.playCash();
                this.spawnFloatingText(target.cashPos.x, target.cashPos.z - 28, `+$${cVal} COLLECTED!`, '#4ade80');
              }
            }
          }
        } else if (w.role === 'ammo') {
          const unlockedItems = CFG.ITEMS.filter((it) => this.unlocked[it.id]);
          const targetLane = unlockedItems[slotIdx % Math.max(1, unlockedItems.length)] || CFG.ITEMS[0];
          w.taskLabel = `🔧 Overclock ${targetLane.icon}`;
          const tx = targetLane.stationPos.x;
          const tz = targetLane.stationPos.z + 64;
          const dx = tx - w.x;
          const dz = tz - w.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 28) {
            w.x += (dx / dist) * speed * dt;
            w.z += (dz / dist) * speed * dt;
          } else {
            const st = this.stations[targetLane.id];
            if (st) st.progress += dt * 0.35;
          }
        } else if (w.role === 'war') {
          const ports = CFG.PORT_LOGISTICS.portPositions || [];
          const pCfg = ports[slotIdx % Math.max(1, ports.length)] || { x: -1820, z: 210 };
          w.taskLabel = `⚓ Dockmaster #${(slotIdx % 4) + 1}`;
          const tx = pCfg.x + 95;
          const tz = pCfg.z;
          const dx = tx - w.x;
          const dz = tz - w.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 24) {
            w.x += (dx / dist) * speed * dt;
            w.z += (dz / dist) * speed * dt;
          }
        }
      }
    }
    spawnCustomer(forcedItemId = null) {
      const unlockedItems = CFG.ITEMS.filter((it) => this.unlocked[it.id]);
      if (unlockedItems.length === 0) return;

      let totalLevels = 0;
      for (const it of unlockedItems) {
        totalLevels += (this.stations[it.id]?.level || 1);
      }

      // Dynamic Queue Capacity scales from 18 up to 46 as production grows!
      const maxQueue = Math.min(46, 16 + unlockedItems.length * 3 + Math.floor(totalLevels * 0.4));
      const activeCount = this.customers.filter((c) => c.state === 'queueing').length;
      if (activeCount >= maxQueue) return;

      // Build Mixed Multi-Item Order List (`orders`)
      const orders = [];
      let primaryItem = null;
      if (forcedItemId && this.unlocked[forcedItemId]) {
        primaryItem = this.getItemConfig(forcedItemId);
      }
      if (!primaryItem) {
        primaryItem = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
      }

      // Quantity scales with station level and wave number so production is challenged!
      const stLvl = this.stations[primaryItem.id]?.level || 1;
      const baseNeed = 1 + Math.floor((stLvl - 1) / 3) + Math.floor((this.waveNumber - 1) / 4);
      const primaryQty = Math.min(6, Math.max(1, primaryItem.tier <= 3 ? baseNeed + (Math.random() > 0.4 ? 1 : 0) : Math.ceil(baseNeed * 0.6)));
      orders.push({ item: primaryItem, qty: primaryQty, received: 0 });

      // If 2+ items are unlocked, 65% of customers have Mixed Loadout Needs (2 to 3 different items)!
      if (!forcedItemId && unlockedItems.length >= 2 && Math.random() < 0.65) {
        const otherItems = unlockedItems.filter((it) => it.id !== primaryItem.id);
        const secondItem = otherItems[Math.floor(Math.random() * otherItems.length)];
        if (secondItem) {
          const secQty = Math.min(4, 1 + Math.floor((this.stations[secondItem.id]?.level || 1) / 4));
          orders.push({ item: secondItem, qty: secQty, received: 0 });
        }
        if (unlockedItems.length >= 3 && Math.random() < 0.35) {
          const thirdPool = otherItems.filter((it) => it.id !== secondItem?.id);
          const thirdItem = thirdPool[Math.floor(Math.random() * thirdPool.length)];
          if (thirdItem) {
            orders.push({ item: thirdItem, qty: 1, received: 0 });
          }
        }
      }

      const qStart = primaryItem.queueStart || CFG.LOCATIONS.customerQueueStart;

      this.customers.push({
        x: CFG.LOCATIONS.customerSpawn.x,
        z: qStart.z + (Math.random() - 0.5) * 60,
        walkPhase: Math.random() * 6,
        orders,
        orderIndex: 0,
        item: primaryItem,
        qty: primaryQty,
        received: 0,
        highestTierBought: primaryItem.tier,
        podTubeIndex: Math.floor(Math.random() * 4),
        state: 'queueing',
        color: primaryItem.id === 'gun' ? '#0f172a' : '#1e293b'
      });
    }

    completeCustomerItemReceive(cust, directToWallet = false) {
      const curOrder = cust.orders ? cust.orders[cust.orderIndex || 0] : null;
      const activeItem = curOrder ? curOrder.item : cust.item;
      if (curOrder) {
        curOrder.received++;
        cust.received = curOrder.received;
        cust.qty = curOrder.qty;
      } else {
        cust.received++;
      }
      if (activeItem.tier > (cust.highestTierBought || 1)) {
        cust.highestTierBought = activeItem.tier;
      }

      const unitPrice = this.getItemSellPrice(activeItem);
      const itemId = activeItem.id;
      if (directToWallet || (this.upgrades.seaf_cashier || 0) > 0 || (this.workerJobs?.sales || 0) > 0) {
        this.cash += unitPrice;
        this.audio.playCash();
        this.spawnFloatingText(cust.x, cust.z - 48, `+$${unitPrice} ${activeItem.icon} SOLD!`, '#4ade80');
      } else {
        this.counterCash[itemId] = (this.counterCash[itemId] || 0) + unitPrice;
        this.syncTotalCashOnGround();
        this.audio.playCash();
        this.spawnFloatingText(cust.x, cust.z - 48, `+$${unitPrice} ${activeItem.icon} (#${activeItem.tier})`, '#facc15');
      }

      const doneCurrent = curOrder ? (curOrder.received >= curOrder.qty) : (cust.received >= cust.qty);
      if (doneCurrent) {
        if (cust.orders && (cust.orderIndex + 1) < cust.orders.length) {
          // Advance to the next item in this customer's Mixed Order!
          cust.orderIndex++;
          const nextOrd = cust.orders[cust.orderIndex];
          cust.item = nextOrd.item;
          cust.qty = nextOrd.qty;
          cust.received = nextOrd.received;
          this.spawnFloatingText(cust.x, cust.z - 64, `🔀 NEXT NEED: ${nextOrd.qty}x ${nextOrd.item.icon}!`, '#38bdf8');
        } else {
          // All mixed items fulfilled! Now march to the 4 Orbital Hellpod Launch Tubes on the Bridge!
          cust.state = 'to_hellpod';
          this.totalServed++;
          this.lifetimeServed++;
          if (this.totalServed % 5 === 0) {
            this.medals++;
            this.spawnFloatingText(cust.x, cust.z - 70, `🎖️ +1 ⭐ FOREVER MEDAL!`, '#fde047');
            this.saveGame();
          }
        }
      }
    }

    launchCustomerInHellpod(cust) {
      // v0.0.10 Rule #3: Hellpods on the Shop page do NOT auto-send to War Zone and earn NO money.
      // They simply send the geared customer out into orbit and add their loadout tier to `gearedClientsPool`
      // so they can volunteer or be hired by the player during War Games!
      const tier = cust.highestTierBought || cust.item?.tier || 1;
      this.totalHellpodDrops = (this.totalHellpodDrops || 0) + 1;
      if (!this.gearedClientsPool) this.gearedClientsPool = [];
      if (this.gearedClientsPool.length < 30) {
        this.gearedClientsPool.push(tier);
      }

      const tubeX = 920 - 150 + (cust.podTubeIndex || 0) * 100;
      this.spawnArc(tubeX, -95, tubeX, -230, '🚀', '#38bdf8');
      this.spawnFloatingText(
        tubeX,
        -135,
        `🚀 CLIENT DEPARTED IN HELLPOD (STANDBY POOL: ${this.gearedClientsPool.length})`,
        '#93c5fd'
      );
    }

    // ========================================================================
    // GAME-BY-GAME ROGUELIKE WAR OPERATIONS, CLIENT VOLUNTEERS/HIRE & HEROES
    // ========================================================================
    updateCustomersAndSales(dt) {
      const unlockedItems = CFG.ITEMS.filter((it) => this.unlocked[it.id]);
      let totalStationLevels = 0;
      let totalDesks = 0;
      for (const it of unlockedItems) {
        totalStationLevels += (this.stations[it.id]?.level || 1);
        totalDesks += this.getUnlockedCounterCount(it.id);
      }

      this.customerSpawnTimer -= dt;
      if (this.customerSpawnTimer <= 0) {
        // Customer arrival rate speeds up dramatically as you unlock more items & expand counters!
        const spawnInterval = Math.max(0.38, 2.25 - unlockedItems.length * 0.22 - totalStationLevels * 0.025);
        this.customerSpawnTimer = spawnInterval;
        this.spawnCustomer();
        // Burst spawn a 2nd customer when multiple counter desks are open!
        if (totalDesks >= 4 && Math.random() < 0.45) {
          this.spawnCustomer();
        }
      }

      // Group active queueing customers across the 1-to-3 physical counter desks in each lane!
      const activeCustomers = this.customers.filter((c) => c.state === 'queueing');
      const perItemIndex = {};

      for (const c of activeCustomers) {
        const itemId = c.item.id;
        const idx = perItemIndex[itemId] || 0;
        perItemIndex[itemId] = idx + 1;

        const deskCount = this.getUnlockedCounterCount(itemId);
        const subLine = idx % deskCount;
        const rankInSubLine = Math.floor(idx / deskCount);
        const qStart = c.item.queueStart || CFG.LOCATIONS.customerQueueStart;

        const tx = qStart.x + rankInSubLine * 74;
        const tz = qStart.z + (subLine - (deskCount - 1) * 0.5) * 32;
        const dx = tx - c.x;
        const dz = tz - c.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 8) {
          c.x += (dx / dist) * 235 * dt;
          c.z += (dz / dist) * 235 * dt;
          c.walkPhase += dt * 11;
        }
      }

      // Move Geared Helldivers (`to_hellpod`) to the 4 Orbital Hellpod Launch Tubes at (220, -100)!
      for (let i = this.customers.length - 1; i >= 0; i--) {
        const c = this.customers[i];
        if (c.state === 'to_hellpod' || c.state === 'leaving') {
          const tubeX = 920 - 150 + ((c.podTubeIndex || 0) % 4) * 100;
          const tubeZ = -200;
          const dx = tubeX - c.x;
          const dz = tubeZ - c.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 32) {
            this.launchCustomerInHellpod(c);
            this.customers.splice(i, 1);
          } else {
            c.x += (dx / dist) * 275 * dt;
            c.z += (dz / dist) * 275 * dt;
            c.walkPhase += dt * 13;
          }
        }
      }

      // Multi-Counter Checkout: 1, 2, or 3 physical counters in a lane serve up to 3 customers per tick!
      this.cashierTimer -= dt;
      if (this.cashierTimer <= 0) {
        const salesStaff = this.workerJobs?.sales || 0;
        const cashierSpeed = 0.22 / (1 + (this.upgrades.seaf_cashier || 0) * 0.22 + salesStaff * 0.30);
        this.cashierTimer = cashierSpeed;

        for (const it of unlockedItems) {
          const deskCount = this.getUnlockedCounterCount(it.id);
          let servedAtThisLane = 0;
          for (const c of activeCustomers) {
            if (c.item.id !== it.id) continue;
            const qStart = it.queueStart || CFG.LOCATIONS.customerQueueStart;
            if ((this.counterBuffer[it.id] || 0) > 0 && Math.abs(c.x - qStart.x) < 320) {
              this.counterBuffer[it.id]--;
              const deskX = servedAtThisLane === 2 ? (it.counter3Pos?.x || 1140) : (servedAtThisLane === 1 ? (it.counter2Pos?.x || 820) : it.counterPos.x);
              this.spawnArc(deskX, it.counterPos.z, c.x, c.z - 15, it.icon, it.color);
              this.completeCustomerItemReceive(c, false);
              servedAtThisLane++;
              if (servedAtThisLane >= deskCount) break;
            }
          }
        }
      }
    }

    // ========================================================================
    // WAVE + REST TIME SYSTEM, ALL-EPISODE CARBOT ENEMIES & 3-LAYER GATE SIEGE
    // ========================================================================
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

      this.eagleFlyover = {
        sx: -1200,
        sz: -250,
        tx: 1200,
        tz: -1750,
        t: 0,
        duration: 0.65
      };

      for (const e of this.enemies) {
        e.hp -= 380;
        this.explosions.push({ x: e.x, z: e.z, maxR: 95, t: 0, duration: 0.45 });
      }
      this.spawnFloatingText(this.player.x, this.player.z - 45, '🦅 EAGLE-1 500KG DROPPED! 2X FACTORY SPEED & +50% SELL VALUE!', '#facc15');
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

      const samplesPillEl = document.getElementById('hud-samples-pill');
      if (samplesPillEl && this.samples) {
        samplesPillEl.textContent = `🟢${this.samples.common || 0} 🟠${this.samples.rare || 0} 🟣${this.samples.superRare || 0}`;
      }
      const shipsHudEl = document.getElementById('hud-ships-count');
      if (shipsHudEl && this.portLogistics) {
        shipsHudEl.textContent = `${this.portLogistics.shipsCount || 1}🛸/${this.portLogistics.portsUnlocked || 1}⚓`;
      }
      const heroesHudEl = document.getElementById('hud-heroes-count');
      if (heroesHudEl && this.helldiverRoster) {
        heroesHudEl.textContent = `${this.helldiverRoster.length}`;
      }
      const planetsHudEl = document.getElementById('hud-planets-owned');
      const drawerPlanetsEl = document.getElementById('hud-drawer-planets');
      if (this.spacePlanets) {
        const ownedCnt = (CFG.SPACE_MAP_PLANETS || []).filter((p) => this.spacePlanets[p.id]?.owned).length;
        const totCnt = (CFG.SPACE_MAP_PLANETS || []).length;
        if (planetsHudEl) planetsHudEl.textContent = `${ownedCnt}/${totCnt}`;
        if (drawerPlanetsEl) drawerPlanetsEl.textContent = `${ownedCnt} / ${totCnt} Planets`;
      }

      const slotLabelEl = document.getElementById('hud-save-slot-label');
      const drawerSlotEl = document.getElementById('hud-drawer-slot');
      if (slotLabelEl) slotLabelEl.textContent = `Slot ${this.currentSaveSlot || 1}`;
      if (drawerSlotEl) drawerSlotEl.textContent = `Slot #${this.currentSaveSlot || 1}`;

      const seafEl = document.getElementById('hud-seaf');
      if (seafEl) seafEl.textContent = `${this.workers.length}`;

      const servedEl = document.getElementById('hud-served');
      if (servedEl) servedEl.textContent = `${this.totalServed}`;

      const cloneCountEl = document.getElementById('hud-clone-count');
      if (cloneCountEl) {
        cloneCountEl.textContent = `${this.hiredClonesCount || 0}/${this.getMaxWorkerCap()}`;
      }

      for (const raw of CFG.RAW_EXTRACTORS) {
        const bEl = document.getElementById(`inv-badge-${raw.id}`);
        if (bEl) {
          const c = this.player.inventory.filter((it) => it.id === raw.id).length;
          bEl.textContent = `${raw.itemIcon} ${c}`;
        }
      }

      for (const item of CFG.ITEMS) {
        const badge = document.getElementById(`inv-badge-${item.id}`);
        if (badge) {
          const count = this.player.inventory.filter((it) => it.id === item.id).length;
          badge.textContent = `${item.icon} ${count}`;
        }
      }

      const pageSampleBtn = document.getElementById('btn-war-page-sample');
      const pageCaptureBtn = document.getElementById('btn-war-page-capture');
      const diffWrapEl = document.getElementById('war-sample-diff-wrap');
      if (pageSampleBtn && pageCaptureBtn) {
        pageSampleBtn.classList.toggle('active-sec', this.warSubPage !== 'capture');
        pageCaptureBtn.classList.toggle('active-sec', this.warSubPage === 'capture');
      }
      if (diffWrapEl) {
        diffWrapEl.style.display = this.warSubPage === 'capture' ? 'none' : 'flex';
      }

      const shopSynEl = document.getElementById('war-shop-synergy-badge');
      if (shopSynEl) {
        const pct = Math.round((this.getShopWarPowerMult() - 1) * 100);
        shopSynEl.innerHTML = `🏪 Shop Boost: <strong>+${pct}% ATK/HP</strong>`;
      }

      const run = this.capybaraRun;
      const matchNumEl = document.getElementById('war-match-num');
      if (matchNumEl) matchNumEl.textContent = `${run ? run.wave : 1}`;

      const stageProgEl = document.getElementById('war-stage-progress-text');
      const xpFillEl = document.getElementById('war-xp-fill');
      if (stageProgEl && run) {
        const aliveCnt = (run.activeHeroes || []).filter((h) => h && !h.dead).length;
        const hasSpare = run.spareHero && !run.spareHero.dead && !run.spareUsed;
        stageProgEl.textContent = `${run.mode === 'capture' ? `🚩 Capture ${run.planetName}` : `🧬 Sample Diff-${run.difficulty}`} · Wave ${run.wave}/${run.maxWaves} · ${aliveCnt}/3 Active + ${hasSpare ? '1' : '0'} Spare`;
        if (xpFillEl) {
          xpFillEl.style.width = `${Math.min(100, Math.round((run.wave / Math.max(1, run.maxWaves)) * 100))}%`;
        }
      }

      const inspTitle = document.getElementById('idle-inspector-title');
      const inspSub = document.getElementById('idle-inspector-sub');
      const inspBtn = document.getElementById('btn-idle-quick-upgrade');
      const beltBtn = document.getElementById('btn-idle-belt-upgrade');
      if (inspTitle && inspBtn) {
        const sel = this.selectedInspectTarget || { type: 'station', id: 'cloth' };
        const item = this.getItemConfig(sel.id) || CFG.ITEMS[0];
        const isUnl = !!this.unlocked[item.id];
        const sl = isUnl ? (this.stations[item.id]?.level || 1) : 0;
        const desks = isUnl ? this.getUnlockedCounterCount(item.id) : 0;
        const sc = !isUnl ? (this.unlockRemaining[item.id] ?? item.unlockCost) : this.getStationUpgradeCost(item.id);
        const prodTier = this.getStationProductionTier(item.id);
        inspTitle.textContent = `${item.icon} ${item.shortName} (Lv.${sl}/10 · ${desks}/3 Counters · $${this.getItemSellPrice(item)} · ${prodTier.shortBadge})`;
        if (inspSub) {
          inspSub.textContent = `Produces Simple Mk.I with 🛢️/⛏️, or Mk.II (x2.2) with Lv.4–6 🏜️/🔩, or Mk.III (x3.5) with Lv.7–10 🧪/⚛️!`;
        }
        inspBtn.textContent = sl >= 10 ? 'MAX Lv.10' : (!isUnl ? `🔓 Unlock ($${sc})` : `⬆️ Lv.${sl + 1}/10 ($${sc})`);
        inspBtn.disabled = sl >= 10 || this.cash < sc;

        if (beltBtn) {
          const nextBelt = CFG.CONVEYORS.find((c) => (this.conveyorLevels[c.id] || 0) < 10) || CFG.CONVEYORS[0];
          const bl = this.conveyorLevels[nextBelt.id] || 0;
          const bc = this.getConveyorUpgradeCost(nextBelt.id);
          beltBtn.textContent = bl >= 10 ? '🔗 Belts MAX' : `🔗 ${nextBelt.icon} Belt Lv.${bl + 1}/10 ($${bc})`;
          beltBtn.disabled = bl >= 10 || this.cash < bc;
        }
      }
    }

    renderLoadoutModal() {
      const cashSpan = document.getElementById('loadout-modal-cash');
      if (cashSpan) cashSpan.textContent = `$${Math.floor(this.cash)}`;

      const grid = document.getElementById('loadout-grid');
      if (!grid) return;
      grid.innerHTML = '';

      this.loadoutPage = this.loadoutPage || 'weapon';
      const categories = [
        { key: 'weapon', title: '🔫 Page 1: Primary Weapon' },
        { key: 'armor', title: '🦺 Page 2: Tactical Armor' },
        { key: 'backpack', title: '🛸 Page 3: Drone & Pack' },
        { key: 'mount', title: '🤖 Page 4: Vehicle & Mech' }
      ];

      const navBar = document.createElement('div');
      navBar.style = 'grid-column: 1 / -1; display:flex; gap:8px; flex-wrap:wrap; margin-bottom:6px;';
      for (const cat of categories) {
        const btn = document.createElement('button');
        btn.className = this.loadoutPage === cat.key ? 'buy-btn' : 'hud-btn';
        btn.textContent = cat.title;
        btn.addEventListener('click', () => {
          this.loadoutPage = cat.key;
          this.renderLoadoutModal();
        });
        navBar.appendChild(btn);
      }
      grid.appendChild(navBar);

      const activeCat = categories.find((c) => c.key === this.loadoutPage) || categories[0];
      const items = CFG.COMMANDER_EQUIPMENT[activeCat.key] || [];
      for (const eqItem of items) {
        const isOwned = !!this.ownedEquipment[eqItem.id];
        const isEquipped = this.equipped[activeCat.key] === eqItem.id;
        const canBuy = !isOwned && this.cash >= eqItem.cost;

        const card = document.createElement('div');
        card.className = 'upgrade-item';
        if (isEquipped) {
          card.style.borderColor = '#facc15';
          card.style.background = 'rgba(250, 204, 21, 0.14)';
        }
        card.innerHTML = `
          <div class="upgrade-info">
            <div style="font-size:0.7rem;color:#38bdf8;font-weight:700;">${activeCat.title}</div>
            <h4>${eqItem.icon} ${eqItem.name} <span style="color:#fde047;font-size:0.78rem;">(${eqItem.zhName})</span></h4>
            <p>${eqItem.desc}</p>
          </div>
          <button class="buy-btn ${isEquipped ? 'medal-btn' : ''}" ${(!isOwned && !canBuy) ? 'disabled' : ''}>
            ${isEquipped ? '✅ EQUIPPED' : (isOwned ? '🛡️ EQUIP' : `🔓 $${eqItem.cost}`)}
          </button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          if (isOwned) {
            this.equipped[activeCat.key] = eqItem.id;
            this.recalcDerivedStats();
            this.saveGame();
            this.audio.playPickup();
            this.renderLoadoutModal();
            this.updateHUD();
          } else if (this.cash >= eqItem.cost) {
            this.cash -= eqItem.cost;
            this.ownedEquipment[eqItem.id] = true;
            this.equipped[activeCat.key] = eqItem.id;
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

    renderUpgradesModal() {
      const list = document.getElementById('upgrades-list');
      if (!list) return;
      list.innerHTML = '';

      this.upgradesModalPage = this.upgradesModalPage || 'stations';
      const page = this.upgradesModalPage;

      const navBar = document.createElement('div');
      navBar.style = 'grid-column: 1 / -1; display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px; background:rgba(15,23,42,0.9); padding:10px; border-radius:10px; border:1px solid #38bdf8;';
      const pages = [
        { id: 'stations', label: '🏪 Page 1: 7 Production Stations & Counters' },
        { id: 'belts', label: '🔗 Page 2: 3 Shop Conveyor Belts' },
        { id: 'suit', label: '⚡ Page 3: Commander Exosuit & Automation' }
      ];
      for (const pg of pages) {
        const b = document.createElement('button');
        b.className = page === pg.id ? 'buy-btn' : 'hud-btn';
        b.textContent = pg.label;
        b.addEventListener('click', () => {
          this.upgradesModalPage = pg.id;
          this.renderUpgradesModal();
        });
        navBar.appendChild(b);
      }
      list.appendChild(navBar);

      if (page === 'stations') {
        for (const item of CFG.ITEMS) {
          const isUnlocked = !!this.unlocked[item.id];
          const st = this.stations[item.id];
          const lvl = isUnlocked ? (st.level || 1) : 0;
          const isMax = lvl >= 10;
          const cost = !isUnlocked ? (this.unlockRemaining[item.id] ?? item.unlockCost) : this.getStationUpgradeCost(item.id);
          const prodTier = this.getStationProductionTier(item.id);

          const card = document.createElement('div');
          card.className = 'upgrade-item';
          card.innerHTML = `
            <div class="upgrade-info">
              <h4>${item.icon} ${item.name} &amp; Counter #${item.tier} (Lv.${lvl}/10)</h4>
              <p>${item.recipeText} · Mode: <strong>${prodTier.shortBadge}</strong> · Sell: <strong>$${this.getItemSellPrice(item)}</strong></p>
            </div>
            <button class="buy-btn" ${(isMax || this.cash < cost) ? 'disabled' : ''}>
              ${isMax ? 'MAX Lv.10' : (!isUnlocked ? `🔓 Unlock $${cost}` : `⬆️ Lv.${lvl + 1} ($${cost})`)}
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
              this.saveGame();
              this.renderUpgradesModal();
              this.updateHUD();
            }
          });
          list.appendChild(card);
        }
      } else if (page === 'belts') {
        for (const c of CFG.CONVEYORS) {
          const lvl = this.conveyorLevels[c.id] || 0;
          const isMax = lvl >= 10;
          const cost = this.getConveyorUpgradeCost(c.id);
          const card = document.createElement('div');
          card.className = 'upgrade-item';
          card.innerHTML = `
            <div class="upgrade-info">
              <h4>${c.icon} ${c.name} (Lv.${lvl}/10)</h4>
              <p>${c.desc}</p>
            </div>
            <button class="buy-btn" ${(isMax || this.cash < cost) ? 'disabled' : ''}>
              ${isMax ? 'MAX Lv.10' : (lvl === 0 ? `🔓 Unlock $${cost}` : `⬆️ Lv.${lvl + 1} ($${cost})`)}
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
              this.saveGame();
              this.renderUpgradesModal();
              this.updateHUD();
            }
          });
          list.appendChild(card);
        }
      } else {
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
              ${isMax ? 'MAX Lv.10' : `💵 $${cost}`}
            </button>
          `;
          card.querySelector('button').addEventListener('click', () => {
            if (!isMax && this.cash >= cost) {
              this.cash -= cost;
              this.upgrades[upg.id] = lvl + 1;
              this.syncWorkers();
              this.recalcDerivedStats();
              this.audio.playUnlock();
              this.saveGame();
              this.renderUpgradesModal();
              this.updateHUD();
            }
          });
          list.appendChild(card);
        }
      }
    }

    renderSkillsModal() {
      const medalSpan = document.getElementById('skill-modal-medals');
      if (medalSpan) medalSpan.textContent = `${this.medals}`;
      const cashSpan = document.getElementById('skill-modal-cash');
      if (cashSpan) cashSpan.textContent = `$${Math.floor(this.cash)}`;

      const buyMedalBtn = document.getElementById('btn-buy-medal');
      if (buyMedalBtn) buyMedalBtn.disabled = this.cash < 150;

      this.skillsModalPage = this.skillsModalPage || 'tree';
      const treeWrap = document.querySelector('.mindustry-tree-wrap');
      const list = document.getElementById('skill-tree-list');

      const treeCanvas = document.getElementById('mindustry-tree-canvas');
      if (treeCanvas && this.world.renderMindustryTechTree) {
        this.world.renderMindustryTechTree(treeCanvas, this, this.selectedTechNodeId);
      }
      this.renderMindustryNodeInspector();

      if (!list) return;
      list.innerHTML = '';

      const navBar = document.createElement('div');
      navBar.style = 'grid-column: 1 / -1; display:flex; gap:8px; flex-wrap:wrap; margin-bottom:6px;';
      const b1 = document.createElement('button');
      b1.className = this.skillsModalPage === 'tree' ? 'buy-btn' : 'hud-btn';
      b1.textContent = '🌟 Page 1: Visual Node Tech Tree Schematic';
      b1.addEventListener('click', () => {
        this.skillsModalPage = 'tree';
        this.renderSkillsModal();
      });
      const b2 = document.createElement('button');
      b2.className = this.skillsModalPage === 'skills' ? 'buy-btn medal-btn' : 'hud-btn';
      b2.textContent = '📋 Page 2: Forever Warbond Skills List';
      b2.addEventListener('click', () => {
        this.skillsModalPage = 'skills';
        this.renderSkillsModal();
      });
      navBar.appendChild(b1);
      navBar.appendChild(b2);
      list.appendChild(navBar);

      if (this.skillsModalPage === 'tree') {
        if (treeWrap) treeWrap.style.display = 'block';
        return;
      }

      if (treeWrap) treeWrap.style.display = 'none';

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
            ${isMax ? 'MAX Lv.10' : `⭐ ${medalCost} Medals`}
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
            ${isMax ? 'MAX Lv.10' : (!parentUnlocked ? '🔒 Unlock Parent First' : `⭐ Research (${medalCost} Medals)`)}
          </button>
          <button class="buy-btn" id="btn-research-node-req" ${(!parentUnlocked || isMax || this.cash < reqCost) ? 'disabled' : ''}>
            ${isMax ? 'MAX Lv.10' : (!parentUnlocked ? '🔒 Locked' : `💵 Research ($${reqCost})`)}
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
      const basesGrid = document.getElementById('mindustry-bases-grid');
      const planetsGrid = document.getElementById('campaign-planets-grid');
      const msGrid = document.getElementById('campaign-milestones-grid');

      this.campaignModalPage = this.campaignModalPage || 'milestones';
      const page = this.campaignModalPage;
      const hrs = Math.floor(this.playTimeSeconds / 3600);
      const mins = Math.floor((this.playTimeSeconds % 3600) / 60);
      const secs = Math.floor(this.playTimeSeconds % 60);

      if (summaryBox) {
        summaryBox.innerHTML = `
          <div>
            <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.95rem;">
              🏆 COMMAND MILESTONES &amp; SECTOR BASES (⏱️ ${hrs}h ${mins}m ${secs}s · 🫡 Served: ${this.lifetimeServed} · 💀 Kills: ${this.lifetimeKills})
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="${page === 'milestones' ? 'buy-btn' : 'hud-btn'}" id="btn-camp-page-ms">🏆 Page 1: 20 Milestones</button>
            <button class="${page === 'bases' ? 'buy-btn medal-btn' : 'hud-btn'}" id="btn-camp-page-bases">🏛️ Page 2: 6 Sector Bases</button>
          </div>
        `;
        document.getElementById('btn-camp-page-ms')?.addEventListener('click', () => {
          this.campaignModalPage = 'milestones';
          this.renderCampaignModal();
        });
        document.getElementById('btn-camp-page-bases')?.addEventListener('click', () => {
          this.campaignModalPage = 'bases';
          this.renderCampaignModal();
        });
      }

      if (planetsGrid) planetsGrid.style.display = 'none';
      if (basesGrid) basesGrid.style.display = page === 'bases' ? 'grid' : 'none';
      if (msGrid) msGrid.style.display = page === 'milestones' ? 'grid' : 'none';

      if (basesGrid && page === 'bases') {
        basesGrid.innerHTML = '';
        for (const b of (CFG.MINDUSTRY_BASES || [])) {
          const isUnlocked = !!this.unlockedBases?.[b.id];
          const isActive = this.activeBaseId === b.id;
          const canUnlock = !isUnlocked && this.cash >= b.unlockCost;
          const card = document.createElement('div');
          card.className = 'upgrade-item';
          card.innerHTML = `
            <div class="upgrade-info">
              <h4>${b.icon} ${b.name} (${b.code})</h4>
              <p>${b.desc}</p>
            </div>
            <button class="buy-btn ${isActive ? 'medal-btn' : ''}" ${(!isUnlocked && !canUnlock) ? 'disabled' : ''}>
              ${isActive ? '🏛️ ACTIVE' : (isUnlocked ? '🚀 Switch' : `🔓 $${b.unlockCost}`)}
            </button>
          `;
          card.querySelector('button')?.addEventListener('click', () => {
            if (isUnlocked) {
              this.activeBaseId = b.id;
            } else if (this.cash >= b.unlockCost) {
              this.cash -= b.unlockCost;
              this.unlockedBases[b.id] = true;
              this.activeBaseId = b.id;
            }
            this.recalcDerivedStats();
            this.saveGame();
            this.renderCampaignModal();
            this.updateHUD();
          });
          basesGrid.appendChild(card);
        }
      }

      if (msGrid && page === 'milestones') {
        msGrid.innerHTML = '';
        for (const m of (CFG.MILESTONES || [])) {
          const done = !!this.claimedMilestones[m.id];
          const card = document.createElement('div');
          card.className = 'upgrade-item';
          card.innerHTML = `
            <div class="upgrade-info">
              <h4 style="color:${done ? '#4ade80' : '#fde047'};">${done ? '✅' : '🏆'} ${m.name}</h4>
              <p>${m.desc} · Reward: <strong>+${m.medalReward} ⭐ Medals</strong></p>
            </div>
            <span class="version-pill">${done ? 'CLAIMED' : 'IN PROGRESS'}</span>
          `;
          msGrid.appendChild(card);
        }
      }
    }

    getSuperEarthDrillRate() {
      const lvl = this.portLogistics?.superEarthDrillLvl || 1;
      return 1.0 + (lvl - 1) * 0.55;
    }

    getSuperEarthDrillCost() {
      const lvl = this.portLogistics?.superEarthDrillLvl || 1;
      return Math.round(140 * Math.pow(1.42, lvl - 1));
    }

    upgradeSuperEarthDrill() {
      const lvl = this.portLogistics?.superEarthDrillLvl || 1;
      if (lvl >= 10) return;
      const cost = this.getSuperEarthDrillCost();
      if (this.cash < cost) {
        this.spawnFloatingText(this.player.x, this.player.z - 35, `⚠️ NEED $${cost} TO UPGRADE SUPER EARTH CORE DRILL`, '#ef4444');
        return;
      }
      this.cash -= cost;
      this.portLogistics.superEarthDrillLvl = lvl + 1;
      this.audio.playUnlock();
      this.saveGame();
      this.renderSpaceMapModal();
      this.renderPortLogisticsModal();
      this.updateHUD();
    }

    getPortStorageLimit() {
      const lvl = this.portLogistics?.storageLimitLvl || 1;
      return 25 + (lvl - 1) * 25;
    }

    getPortUnloadRate() {
      const lvl = this.portLogistics?.unloadSpeedLvl || 1;
      const dockmasters = this.workerJobs?.war || 0;
      return (1.6 + (lvl - 1) * 0.95) * (1 + dockmasters * 0.20);
    }

    getShipCargoCap() {
      const lvl = this.portLogistics?.shipCargoLvl || 1;
      return 6 + (lvl - 1) * 5;
    }

    getBuyShipCost() {
      const PL = CFG.PORT_LOGISTICS;
      const cnt = this.portLogistics?.shipsCount || 1;
      return Math.round(PL.baseBuyShipCost * Math.pow(PL.buyShipCostScale, cnt - 1));
    }

    getAddPortCost() {
      const PL = CFG.PORT_LOGISTICS;
      const cnt = this.portLogistics?.portsUnlocked || 1;
      return Math.round(PL.baseAddPortCost * Math.pow(PL.addPortCostScale, cnt - 1));
    }

    getPortUpgradeCost(key) {
      const PL = CFG.PORT_LOGISTICS;
      const lvl = this.portLogistics?.[key] || 1;
      if (key === 'unloadSpeedLvl') return Math.round(PL.baseUnloadSpeedCost * Math.pow(PL.unloadSpeedCostScale, lvl - 1));
      if (key === 'storageLimitLvl') return Math.round(PL.baseStorageLimitCost * Math.pow(PL.storageLimitCostScale, lvl - 1));
      return Math.round(PL.baseShipCargoCost * Math.pow(PL.shipCargoCostScale, lvl - 1));
    }

    initTransportShips() {
      const count = this.portLogistics?.shipsCount || 1;
      const ports = this.portLogistics?.portsUnlocked || 1;
      if (!Array.isArray(this.transportShips)) this.transportShips = [];
      while (this.transportShips.length < count) {
        const idx = this.transportShips.length;
        this.transportShips.push({
          id: `ship_${idx + 1}`,
          index: idx,
          portIndex: idx % Math.max(1, ports),
          state: 'inbound',
          progress: 0.35 + (idx * 0.22) % 0.6,
          unloadProgress: 0,
          cargoOil: 2,
          cargoIron: 2,
          cargoSand: 0,
          cargoBile: 0,
          cargoTitanium: 0,
          cargoQcore: 0,
          sourcePlanetId: 'planet_halltown',
          sourceName: 'Super Earth HQ'
        });
      }
      if (this.transportShips.length > count) {
        this.transportShips.length = count;
      }
      const maxS = this.getPortStorageLimit();
      for (const raw of CFG.RAW_EXTRACTORS) {
        const isUnique = raw.tierGroup === 'mid_unique' || raw.tierGroup === 'high_unique';
        if (!this.rawExtractors[raw.id]) {
          this.rawExtractors[raw.id] = {
            level: 1,
            speedLvl: 1,
            yieldLvl: 1,
            bufferLvl: 1,
            stock: isUnique ? 0 : 4,
            maxBuffer: maxS,
            progress: 0,
            cycleTime: 1.0
          };
        }
        this.rawExtractors[raw.id].maxBuffer = maxS;
      }
    }

    buyTransportShip() {
      const PL = CFG.PORT_LOGISTICS;
      if ((this.portLogistics.shipsCount || 1) >= PL.maxShips) return;
      const cost = this.getBuyShipCost();
      if (this.cash < cost) {
        this.spawnFloatingText(this.player.x, this.player.z - 35, `⚠️ NEED $${cost} TO BUY TRANSPORT SHIP`, '#ef4444');
        return;
      }
      this.cash -= cost;
      this.portLogistics.shipsCount = (this.portLogistics.shipsCount || 1) + 1;
      this.initTransportShips();
      this.audio.playUnlock();
      this.spawnFloatingText(-1820, 320, `🛸 PURCHASED TRANSPORT SHIP #${this.portLogistics.shipsCount}!`, '#38bdf8');
      this.saveGame();
      this.renderPortLogisticsModal();
      this.renderSpaceMapModal();
      this.updateHUD();
    }

    addDockingPort() {
      const PL = CFG.PORT_LOGISTICS;
      if ((this.portLogistics.portsUnlocked || 1) >= PL.maxPorts) return;
      const cost = this.getAddPortCost();
      if (this.cash < cost) {
        this.spawnFloatingText(this.player.x, this.player.z - 35, `⚠️ NEED $${cost} TO ADD DOCKING PORT`, '#ef4444');
        return;
      }
      this.cash -= cost;
      this.portLogistics.portsUnlocked = (this.portLogistics.portsUnlocked || 1) + 1;
      this.initTransportShips();
      this.audio.playUnlock();
      this.spawnFloatingText(-1820, 480, `⚓ BUILT LEFT-HAND DOCKING PORT #${this.portLogistics.portsUnlocked}!`, '#facc15');
      this.saveGame();
      this.renderPortLogisticsModal();
      this.renderSpaceMapModal();
      this.updateHUD();
    }

    upgradePortStat(key) {
      const cur = this.portLogistics[key] || 1;
      if (cur >= 10) return;
      const cost = this.getPortUpgradeCost(key);
      if (this.cash < cost) {
        this.spawnFloatingText(this.player.x, this.player.z - 35, `⚠️ NEED $${cost} FOR PORT UPGRADE`, '#ef4444');
        return;
      }
      this.cash -= cost;
      this.portLogistics[key] = cur + 1;
      this.initTransportShips();
      this.audio.playUnlock();
      this.saveGame();
      this.renderPortLogisticsModal();
      this.renderSpaceMapModal();
      this.updateHUD();
    }

    updatePortAndSpaceLogistics(dt) {
      const maxPortStorage = this.getPortStorageLimit();
      for (const raw of CFG.RAW_EXTRACTORS) {
        if (this.rawExtractors[raw.id]) this.rawExtractors[raw.id].maxBuffer = maxPortStorage;
      }

      const seRate = this.getSuperEarthDrillRate();
      this.fixedStartSupplyBuffer = this.fixedStartSupplyBuffer || { oil: 2, iron: 2 };
      this.fixedStartSupplyBuffer.oil = Math.min(60, (this.fixedStartSupplyBuffer.oil || 0) + seRate * dt);
      this.fixedStartSupplyBuffer.iron = Math.min(60, (this.fixedStartSupplyBuffer.iron || 0) + seRate * dt);

      this.updateSpaceMapAndTravianWars(dt);

      const unloadRate = this.getPortUnloadRate();
      const cargoCap = this.getShipCargoCap();
      const shipSpeed = 0.44 + ((this.portLogistics?.shipCargoLvl || 1) - 1) * 0.06;
      const portsUnlocked = Math.max(1, this.portLogistics?.portsUnlocked || 1);

      this.initTransportShips();
      for (let i = 0; i < this.transportShips.length; i++) {
        const sh = this.transportShips[i];
        sh.portIndex = i % portsUnlocked;

        if (sh.state === 'inbound') {
          sh.progress = (sh.progress || 0) + shipSpeed * dt;
          if (sh.progress >= 1) {
            sh.progress = 1;
            sh.state = 'docked';
            sh.unloadProgress = 0;
          }
        } else if (sh.state === 'docked') {
          const totalCargo = Math.max(
            0.1,
            (sh.cargoOil || 0) + (sh.cargoIron || 0) + (sh.cargoSand || 0) + (sh.cargoBile || 0) + (sh.cargoTitanium || 0) + (sh.cargoQcore || 0)
          );
          const unloadStep = unloadRate * dt;
          sh.unloadProgress = Math.min(1, (sh.unloadProgress || 0) + unloadStep / Math.max(1, totalCargo * 0.5));

          if (sh.unloadProgress >= 1) {
            const addMap = {
              raw_e710: Math.round(sh.cargoOil || 0),
              raw_iron: Math.round(sh.cargoIron || 0),
              raw_sand: Math.round(sh.cargoSand || 0),
              raw_bile: Math.round(sh.cargoBile || 0),
              raw_titanium: Math.round(sh.cargoTitanium || 0),
              raw_qcore: Math.round(sh.cargoQcore || 0)
            };
            for (const [rKey, addQty] of Object.entries(addMap)) {
              if (this.rawExtractors[rKey] && addQty > 0) {
                this.rawExtractors[rKey].stock = Math.min(maxPortStorage, (this.rawExtractors[rKey].stock || 0) + addQty);
              }
            }
            sh.cargoOil = 0;
            sh.cargoIron = 0;
            sh.cargoSand = 0;
            sh.cargoBile = 0;
            sh.cargoTitanium = 0;
            sh.cargoQcore = 0;
            sh.state = 'outbound';
            sh.progress = 0;
          }
        } else {
          sh.progress = (sh.progress || 0) + shipSpeed * 1.15 * dt;
          if (sh.progress >= 1) {
            sh.progress = 0;
            sh.state = 'inbound';

            let pickedOil = 0;
            let pickedIron = 0;
            let pickedSand = 0;
            let pickedBile = 0;
            let pickedTi = 0;
            let pickedQcore = 0;
            let pickedName = 'Super Earth HQ';

            const takeStartOil = Math.min(Math.ceil(cargoCap * 0.4), Math.floor(this.fixedStartSupplyBuffer.oil || 0));
            const takeStartIron = Math.min(Math.ceil(cargoCap * 0.4), Math.floor(this.fixedStartSupplyBuffer.iron || 0));
            if (takeStartOil >= 1 || takeStartIron >= 1) {
              pickedOil += takeStartOil;
              pickedIron += takeStartIron;
              this.fixedStartSupplyBuffer.oil -= takeStartOil;
              this.fixedStartSupplyBuffer.iron -= takeStartIron;
            }

            const ownedPlanets = (CFG.SPACE_MAP_PLANETS || []).filter((p) => !p.isHome && this.spacePlanets?.[p.id]?.owned);
            if (ownedPlanets.length > 0) {
              const targetP = ownedPlanets[(i + Math.floor(this.playTimeSeconds)) % ownedPlanets.length];
              const ps = this.spacePlanets[targetP.id];
              if (ps) {
                const remCap = Math.max(2, cargoCap - (pickedOil + pickedIron));
                const pOil = Math.min(remCap, Math.floor(ps.storedOil || 0));
                const pIron = Math.min(Math.max(0, remCap - pOil), Math.floor(ps.storedIron || 0));
                const pSand = Math.min(Math.ceil(cargoCap * 0.4), Math.floor(ps.storedSand || 0));
                const pBile = Math.min(Math.ceil(cargoCap * 0.4), Math.floor(ps.storedBile || 0));
                const pTi = Math.min(Math.ceil(cargoCap * 0.4), Math.floor(ps.storedTitanium || 0));
                const pQc = Math.min(Math.ceil(cargoCap * 0.4), Math.floor(ps.storedQcore || 0));
                if (pOil > 0 || pIron > 0 || pSand > 0 || pBile > 0 || pTi > 0 || pQc > 0) {
                  ps.storedOil = Math.max(0, (ps.storedOil || 0) - pOil);
                  ps.storedIron = Math.max(0, (ps.storedIron || 0) - pIron);
                  ps.storedSand = Math.max(0, (ps.storedSand || 0) - pSand);
                  ps.storedBile = Math.max(0, (ps.storedBile || 0) - pBile);
                  ps.storedTitanium = Math.max(0, (ps.storedTitanium || 0) - pTi);
                  ps.storedQcore = Math.max(0, (ps.storedQcore || 0) - pQc);
                  pickedOil += pOil;
                  pickedIron += pIron;
                  pickedSand += pSand;
                  pickedBile += pBile;
                  pickedTi += pTi;
                  pickedQcore += pQc;
                  pickedName = targetP.name.split(' ')[0];
                }
              }
            }

            if (pickedOil <= 0 && pickedIron <= 0) {
              pickedOil = 1;
              pickedIron = 1;
            }
            sh.cargoOil = pickedOil;
            sh.cargoIron = pickedIron;
            sh.cargoSand = pickedSand;
            sh.cargoBile = pickedBile;
            sh.cargoTitanium = pickedTi;
            sh.cargoQcore = pickedQcore;
            sh.sourceName = pickedName;
          }
        }
      }
    }

    renderPortLogisticsModal() {
      const sumEl = document.getElementById('port-logistics-summary');
      const upgTitle = document.getElementById('port-upgrades-title');
      const upgGrid = document.getElementById('port-upgrades-grid');
      const shipTitle = document.getElementById('port-ships-title');
      const shipGrid = document.getElementById('transport-ships-list');
      if (!sumEl || !upgGrid || !shipGrid) return;

      this.portModalPage = this.portModalPage || 'overview';
      const page = this.portModalPage;
      const PL = CFG.PORT_LOGISTICS;
      const p = this.portLogistics;
      const maxS = this.getPortStorageLimit();
      const seRate = this.getSuperEarthDrillRate();

      const buyShipCost = this.getBuyShipCost();
      const addPortCost = this.getAddPortCost();
      const unloadCost = this.getPortUpgradeCost('unloadSpeedLvl');
      const storageCost = this.getPortUpgradeCost('storageLimitLvl');
      const cargoCost = this.getPortUpgradeCost('shipCargoLvl');
      const seDrillCost = this.getSuperEarthDrillCost();

      upgGrid.innerHTML = `
        <div class="upgrade-card" style="border-color:#facc15;">
          <div class="upg-top"><span class="upg-title">🌍 Super Earth Core Drill (Lv.${p.superEarthDrillLvl || 1}/10)</span></div>
          <p class="upg-desc">Upgrades Super Earth's base orbital extraction rate (+${seRate.toFixed(2)} 🛢️/s &amp; +${seRate.toFixed(2)} ⛏️/s).</p>
          <button class="buy-btn" id="btn-port-upg-sedrill" ${(p.superEarthDrillLvl || 1) >= 10 || this.cash < seDrillCost ? 'disabled' : ''}>
            ${(p.superEarthDrillLvl || 1) >= 10 ? 'MAX Lv.10' : `⬆️ Upgrade Super Earth Drill Lv.${(p.superEarthDrillLvl || 1) + 1} ($${seDrillCost})`}
          </button>
        </div>
        <div class="upgrade-card">
          <div class="upg-top"><span class="upg-title">🛸 Buy Transport Ship (${p.shipsCount}/${PL.maxShips})</span></div>
          <p class="upg-desc">Adds a new Orbital Cargo Ship hauling ores from Super Earth &amp; Captured Planets to Left-Hand Port!</p>
          <button class="buy-btn" id="btn-port-buy-ship" ${p.shipsCount >= PL.maxShips || this.cash < buyShipCost ? 'disabled' : ''}>
            ${p.shipsCount >= PL.maxShips ? 'MAX 10 SHIPS' : `➕ Buy Ship #${p.shipsCount + 1} ($${buyShipCost})`}
          </button>
        </div>
        <div class="upgrade-card">
          <div class="upg-top"><span class="upg-title">⚓ Add Left-Hand Docking Port (${p.portsUnlocked}/${PL.maxPorts})</span></div>
          <p class="upg-desc">Builds an additional physical Docking Pier on the left side of the ship so multiple ships unload in parallel!</p>
          <button class="buy-btn medal-btn" id="btn-port-add-port" ${p.portsUnlocked >= PL.maxPorts || this.cash < addPortCost ? 'disabled' : ''}>
            ${p.portsUnlocked >= PL.maxPorts ? 'MAX 4 PORTS' : `➕ Add Port #${p.portsUnlocked + 1} ($${addPortCost})`}
          </button>
        </div>
        <div class="upgrade-card">
          <div class="upg-top"><span class="upg-title">⚡ Port Unloading Speed (Lv.${p.unloadSpeedLvl}/10)</span></div>
          <p class="upg-desc">Unloads docked Transport Ships faster (${this.getPortUnloadRate().toFixed(1)} ➔ ${(this.getPortUnloadRate() + 0.95).toFixed(1)} raw/sec).</p>
          <button class="buy-btn" id="btn-port-upg-unload" ${p.unloadSpeedLvl >= 10 || this.cash < unloadCost ? 'disabled' : ''}>
            ${p.unloadSpeedLvl >= 10 ? 'MAX Lv.10' : `⬆️ Upgrade Lv.${p.unloadSpeedLvl + 1} ($${unloadCost})`}
          </button>
        </div>
        <div class="upgrade-card">
          <div class="upg-top"><span class="upg-title">📦 Port Ore Storage Limit (Lv.${p.storageLimitLvl}/10)</span></div>
          <p class="upg-desc">Increases capacity (${maxS} ➔ ${maxS + 25} max) for all 6 Port Ore Silos (🛢️/⛏️/🏜️/🧪/🔩/⚛️).</p>
          <button class="buy-btn" id="btn-port-upg-storage" ${p.storageLimitLvl >= 10 || this.cash < storageCost ? 'disabled' : ''}>
            ${p.storageLimitLvl >= 10 ? 'MAX Lv.10' : `⬆️ Upgrade Lv.${p.storageLimitLvl + 1} ($${storageCost})`}
          </button>
        </div>
        <div class="upgrade-card">
          <div class="upg-top"><span class="upg-title">🚀 Ship Cargo Capacity &amp; Thrusters (Lv.${p.shipCargoLvl}/10)</span></div>
          <p class="upg-desc">Each Transport Ship carries more ore per trip (${this.getShipCargoCap()} ➔ ${this.getShipCargoCap() + 5} units) &amp; flies faster!</p>
          <button class="buy-btn" id="btn-port-upg-cargo" ${p.shipCargoLvl >= 10 || this.cash < cargoCost ? 'disabled' : ''}>
            ${p.shipCargoLvl >= 10 ? 'MAX Lv.10' : `⬆️ Upgrade Lv.${p.shipCargoLvl + 1} ($${cargoCost})`}
          </button>
        </div>
      `;

      document.getElementById('btn-port-upg-sedrill')?.addEventListener('click', () => this.upgradeSuperEarthDrill());
      document.getElementById('btn-port-buy-ship')?.addEventListener('click', () => this.buyTransportShip());
      document.getElementById('btn-port-add-port')?.addEventListener('click', () => this.addDockingPort());
      document.getElementById('btn-port-upg-unload')?.addEventListener('click', () => this.upgradePortStat('unloadSpeedLvl'));
      document.getElementById('btn-port-upg-storage')?.addEventListener('click', () => this.upgradePortStat('storageLimitLvl'));
      document.getElementById('btn-port-upg-cargo')?.addEventListener('click', () => this.upgradePortStat('shipCargoLvl'));

      shipGrid.innerHTML = (this.transportShips || []).map((sh, idx) => `
        <div class="upgrade-card" style="padding:8px 10px;">
          <div style="font-family:var(--font-display);font-weight:800;color:#38bdf8;font-size:0.8rem;">
            🛸 Transport Ship #${idx + 1} (Docking Port #${(sh.portIndex || 0) + 1})
          </div>
          <div style="font-size:0.75rem;color:#e2e8f0;margin-top:3px;">
            Route: <strong>${sh.sourceName || 'Super Earth'} ➔ HallTown</strong> · Status: <strong style="color:#fde047;">${sh.state.toUpperCase()}</strong> · Cargo: 🛢️${Math.ceil(sh.cargoOil || 0)} ⛏️${Math.ceil(sh.cargoIron || 0)} 🏜️${Math.ceil(sh.cargoSand || 0)} 🧪${Math.ceil(sh.cargoBile || 0)} 🔩${Math.ceil(sh.cargoTitanium || 0)} ⚛️${Math.ceil(sh.cargoQcore || 0)}
          </div>
        </div>
      `).join('');

      if (page === 'overview') {
        if (upgTitle) upgTitle.style.display = 'none';
        upgGrid.style.display = 'none';
        if (shipTitle) shipTitle.style.display = 'none';
        shipGrid.style.display = 'none';

        const siloCards = CFG.RAW_EXTRACTORS.map((r) => {
          const st = Math.floor(this.rawExtractors?.[r.id]?.stock || 0);
          return `
            <div style="background:rgba(15,23,42,0.92);border:1.5px solid ${r.color};border-radius:10px;padding:10px;">
              <div style="font-family:var(--font-display);font-weight:900;color:${r.color};font-size:0.8rem;">${r.itemIcon} ${r.shortName.toUpperCase()}</div>
              <div style="font-size:1.08rem;font-weight:900;color:#fff;margin:3px 0;">Ore Stored: ${st} / ${maxS}</div>
              <div style="font-size:0.71rem;color:#cbd5e1;">Source: ${r.planetLevels}</div>
            </div>
          `;
        }).join('');

        sumEl.innerHTML = `
          <div style="width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
              <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.94rem;">
                🛸 PAGE 1: 6 PORT ORE SILOS (2 BASIC + 2 BUG UNIQUE [Lv.4-6 / 7-10] + 2 BOT UNIQUE [Lv.4-6 / 7-10])
              </div>
              <div style="font-family:var(--font-display);font-weight:900;color:#4ade80;font-size:0.9rem;">
                💵 Wallet: $${Math.floor(this.cash)}
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:8px;margin-bottom:12px;">
              ${siloCards}
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px;">
              <button class="buy-btn" id="btn-port-goto-facilities" style="padding:11px;font-size:0.86rem;">
                ⚓ Page 2: Port Docks, Super Earth Drill &amp; Storage Upgrades ➔
              </button>
              <button class="buy-btn medal-btn" id="btn-port-goto-fleet" style="padding:11px;font-size:0.86rem;">
                🛸 Page 3: Transport Ship Fleet &amp; Routes (${p.shipsCount}/${PL.maxShips} Ships) ➔
              </button>
            </div>
          </div>
        `;
        document.getElementById('btn-port-goto-facilities')?.addEventListener('click', () => {
          this.portModalPage = 'facilities';
          this.renderPortLogisticsModal();
        });
        document.getElementById('btn-port-goto-fleet')?.addEventListener('click', () => {
          this.portModalPage = 'fleet';
          this.renderPortLogisticsModal();
        });
      } else if (page === 'facilities') {
        if (upgTitle) upgTitle.style.display = 'block';
        upgGrid.style.display = 'grid';
        if (shipTitle) shipTitle.style.display = 'none';
        shipGrid.style.display = 'none';

        sumEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
            <button class="hud-btn" id="btn-port-back-overview" style="border-color:#facc15;color:#fde047;padding:7px 14px;">
              ⬅️ Page 1: 6 Ore Silos Overview
            </button>
            <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.9rem;">
              ⚓ PAGE 2: PORT &amp; SUPER EARTH UPGRADES · 💵 $${Math.floor(this.cash)}
            </div>
            <button class="hud-btn" id="btn-port-switch-fleet" style="border-color:#38bdf8;color:#7dd3fc;">
              🛸 Page 3: Ship Fleet ➔
            </button>
          </div>
        `;
        document.getElementById('btn-port-back-overview')?.addEventListener('click', () => {
          this.portModalPage = 'overview';
          this.renderPortLogisticsModal();
        });
        document.getElementById('btn-port-switch-fleet')?.addEventListener('click', () => {
          this.portModalPage = 'fleet';
          this.renderPortLogisticsModal();
        });
      } else {
        if (upgTitle) upgTitle.style.display = 'none';
        upgGrid.style.display = 'none';
        if (shipTitle) shipTitle.style.display = 'block';
        shipGrid.style.display = 'grid';

        sumEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
            <button class="hud-btn" id="btn-port-back-overview" style="border-color:#facc15;color:#fde047;padding:7px 14px;">
              ⬅️ Page 1: 6 Ore Silos Overview
            </button>
            <div style="font-family:var(--font-display);font-weight:900;color:#4ade80;font-size:0.9rem;">
              🛸 PAGE 3: TRANSPORT SHIP FLEET (${p.shipsCount}/${PL.maxShips} SHIPS) · 💵 $${Math.floor(this.cash)}
            </div>
            <button class="hud-btn" id="btn-port-switch-fac" style="border-color:#38bdf8;color:#7dd3fc;">
              ⚓ Page 2: Port Upgrades ➔
            </button>
          </div>
        `;
        document.getElementById('btn-port-back-overview')?.addEventListener('click', () => {
          this.portModalPage = 'overview';
          this.renderPortLogisticsModal();
        });
        document.getElementById('btn-port-switch-fac')?.addEventListener('click', () => {
          this.portModalPage = 'facilities';
          this.renderPortLogisticsModal();
        });
      }
    }

    initSpaceMapState() {
      if (!this.spacePlanets) this.spacePlanets = {};
      for (const p of (CFG.SPACE_MAP_PLANETS || [])) {
        if (!this.spacePlanets[p.id]) {
          this.spacePlanets[p.id] = {
            owned: !!p.ownedAtStart,
            mineLvl: 1,
            storageLvl: 1,
            storedOil: p.ownedAtStart ? 6 : 0,
            storedIron: p.ownedAtStart ? 6 : 0,
            storedSand: 0,
            storedBile: 0,
            storedTitanium: 0,
            storedQcore: 0,
            buildings: {
              def_wall: p.ownedAtStart ? 1 : 0,
              def_flak: 0,
              def_rail: 0
            },
            garrison: {
              g_seaf_militia: p.ownedAtStart ? 2 : 0,
              g_seaf_heavy: 0,
              g_helldiver_vet: p.ownedAtStart ? 1 : 0,
              g_patriot_mech: 0
            },
            enemyArmy: p.ownedAtStart ? 0 : Math.round(25 + p.difficulty * 18),
            enemyThreshold: Math.round(85 + p.difficulty * 55)
          };
        } else {
          if (typeof this.spacePlanets[p.id].storedSand !== 'number') this.spacePlanets[p.id].storedSand = 0;
          if (typeof this.spacePlanets[p.id].storedBile !== 'number') this.spacePlanets[p.id].storedBile = 0;
          if (typeof this.spacePlanets[p.id].storedTitanium !== 'number') this.spacePlanets[p.id].storedTitanium = 0;
          if (typeof this.spacePlanets[p.id].storedQcore !== 'number') this.spacePlanets[p.id].storedQcore = 0;
        }
      }
      this.selectedSpacePlanetId = this.selectedSpacePlanetId || 'planet_halltown';
      this.spaceMapPage = this.spaceMapPage || 'map';
      this.superEarthSubPage = this.superEarthSubPage || 'ores';
      this.planetDefSubPage = this.planetDefSubPage || 'buildings';
      this.travianBattleLogs = this.travianBattleLogs || [
        '📡 [System] Galactic Space Map ready! Click 🌍 Super Earth to view all 6 Ore Numbers & Upgrades, or click any Bug/Bot Planet (Lv.1–10) to inspect its Raw/sec & No. of Ore!'
      ];
      this.galacticDayTimer = this.galacticDayTimer || 0;
    }

    isPlanetAdjacentToOwned(planetId) {
      const pCfg = (CFG.SPACE_MAP_PLANETS || []).find((p) => p.id === planetId);
      if (!pCfg) return false;
      return (pCfg.links || []).some((linkedId) => this.spacePlanets?.[linkedId]?.owned);
    }

    getPlanetStorageCap(planetId) {
      const ps = this.spacePlanets?.[planetId];
      const lvl = ps?.storageLvl || 1;
      return 30 + (lvl - 1) * 35;
    }

    getPlanetMineRate(planetId) {
      const pCfg = (CFG.SPACE_MAP_PLANETS || []).find((p) => p.id === planetId);
      const ps = this.spacePlanets?.[planetId];
      if (!pCfg || !ps) return 1.0;
      if (pCfg.isHome) return this.getSuperEarthDrillRate() * 2;
      return pCfg.baseMineRate * (1 + ((ps.mineLvl || 1) - 1) * 0.42);
    }

    getPlanetOreRatesBreakdown(planetId) {
      const pCfg = (CFG.SPACE_MAP_PLANETS || []).find((p) => p.id === planetId) || CFG.SPACE_MAP_PLANETS[0];
      const ps = this.spacePlanets?.[planetId] || {};
      if (pCfg.isHome) {
        const seRate = this.getSuperEarthDrillRate();
        return {
          oreVeins: pCfg.oreVeins || 2,
          oilPerSec: seRate,
          ironPerSec: seRate,
          uniquePerSec: 0,
          uniqueIcon: '🌍',
          uniqueName: 'All 4 Faction Unique Silos (🏜️/🧪/🔩/⚛️)',
          totalRawPerSec: seRate * 2
        };
      }
      const rate = this.getPlanetMineRate(planetId);
      const oilPerSec = rate * (pCfg.oilRatio || 0);
      const ironPerSec = rate * (pCfg.ironRatio || 0);
      const uRatio = (pCfg.sandRatio || 0) + (pCfg.bileRatio || 0) + (pCfg.titaniumRatio || 0) + (pCfg.qcoreRatio || 0);
      const uniquePerSec = rate * uRatio;
      const totalRawPerSec = oilPerSec + ironPerSec + uniquePerSec;
      let uniqueStored = 0;
      if (pCfg.uniqueType === 'raw_sand') uniqueStored = Math.floor(ps.storedSand || 0);
      else if (pCfg.uniqueType === 'raw_bile') uniqueStored = Math.floor(ps.storedBile || 0);
      else if (pCfg.uniqueType === 'raw_titanium') uniqueStored = Math.floor(ps.storedTitanium || 0);
      else if (pCfg.uniqueType === 'raw_qcore') uniqueStored = Math.floor(ps.storedQcore || 0);

      return {
        oreVeins: pCfg.oreVeins || (pCfg.difficulty + 1),
        oilPerSec,
        ironPerSec,
        uniquePerSec,
        uniqueStored,
        uniqueIcon: pCfg.uniqueOreIcon || '✨',
        uniqueName: pCfg.uniqueOreName || 'None (Lv.1–3 Basic Planet)',
        hasUnique: !!pCfg.uniqueType,
        totalRawPerSec
      };
    }

    getPlanetDefenseStats(planetId) {
      const ps = this.spacePlanets?.[planetId];
      if (!ps) return { wallLvl: 0, wallShield: 0, totalDef: 0, troopDef: 0, bldDef: 0, dailyUpkeep: 0 };
      const wallLvl = ps.buildings?.def_wall || 0;
      const flakLvl = ps.buildings?.def_flak || 0;
      const railLvl = ps.buildings?.def_rail || 0;

      const wallShield = wallLvl * 480 + flakLvl * 180 + railLvl * 320;
      const defBonusMult = 1 + wallLvl * 0.15 + flakLvl * 0.05 + railLvl * 0.10;
      const rawBldDef = wallLvl * 65 + flakLvl * 210 + railLvl * 450;

      let rawTroopDef = 0;
      let rawRaidAtk = 0;
      let dailyUpkeep = wallLvl * 3 + flakLvl * 5 + railLvl * 9;

      for (const u of (CFG.PLANET_GARRISON_UNITS || [])) {
        const cnt = ps.garrison?.[u.id] || 0;
        rawTroopDef += cnt * u.defValue;
        rawRaidAtk += cnt * u.atkValue;
        dailyUpkeep += cnt * u.dailyWage;
      }

      const totalDef = Math.round((rawBldDef + rawTroopDef) * defBonusMult);
      return {
        wallLvl,
        flakLvl,
        railLvl,
        wallShield,
        defBonusMult,
        troopDef: Math.round(rawTroopDef * defBonusMult),
        bldDef: Math.round(rawBldDef * defBonusMult),
        totalDef,
        raidAtk: rawRaidAtk,
        dailyUpkeep
      };
    }

    updateSpaceMapAndTravianWars(dt) {
      this.initSpaceMapState();
      const planets = CFG.SPACE_MAP_PLANETS || [];

      this.galacticDayTimer = (this.galacticDayTimer || 0) + dt;
      if (this.galacticDayTimer >= 25.0) {
        this.galacticDayTimer = 0;
        let totalDailyWage = 0;
        for (const p of planets) {
          if (p.isHome || !this.spacePlanets[p.id]?.owned) continue;
          const st = this.getPlanetDefenseStats(p.id);
          totalDailyWage += st.dailyUpkeep;
        }
        if (totalDailyWage > 0) {
          this.cash = Math.max(0, this.cash - totalDailyWage);
        }
      }

      for (const p of planets) {
        const ps = this.spacePlanets[p.id];
        if (!ps || p.isHome) continue;

        if (ps.owned) {
          const cap = this.getPlanetStorageCap(p.id);
          const rate = this.getPlanetMineRate(p.id);
          ps.storedOil = Math.min(cap, (ps.storedOil || 0) + rate * (p.oilRatio || 0) * dt);
          ps.storedIron = Math.min(cap, (ps.storedIron || 0) + rate * (p.ironRatio || 0) * dt);
          if (p.sandRatio > 0) ps.storedSand = Math.min(cap, (ps.storedSand || 0) + rate * p.sandRatio * dt);
          if (p.bileRatio > 0) ps.storedBile = Math.min(cap, (ps.storedBile || 0) + rate * p.bileRatio * dt);
          if (p.titaniumRatio > 0) ps.storedTitanium = Math.min(cap, (ps.storedTitanium || 0) + rate * p.titaniumRatio * dt);
          if (p.qcoreRatio > 0) ps.storedQcore = Math.min(cap, (ps.storedQcore || 0) + rate * p.qcoreRatio * dt);
        } else if (this.isPlanetAdjacentToOwned(p.id)) {
          const growth = (0.65 + p.difficulty * 0.48) * dt;
          ps.enemyArmy = (ps.enemyArmy || 0) + growth;
          if (ps.enemyArmy >= ps.enemyThreshold) {
            this.triggerEnemyPlanetInvasion(p);
          }
        }
      }
    }

    triggerEnemyPlanetInvasion(attackerCfg) {
      const atkState = this.spacePlanets[attackerCfg.id];
      if (!atkState) return;

      const linkedOwned = (attackerCfg.links || [])
        .map((id) => (CFG.SPACE_MAP_PLANETS || []).find((p) => p.id === id))
        .filter((p) => p && this.spacePlanets[p.id]?.owned);

      if (linkedOwned.length === 0) {
        atkState.enemyArmy = atkState.enemyThreshold * 0.5;
        return;
      }

      const targetCfg = linkedOwned.find((p) => !p.isHome) || linkedOwned[0];
      const defState = this.spacePlanets[targetCfg.id];
      const defStats = this.getPlanetDefenseStats(targetCfg.id);

      const enemyTroops = Math.round(atkState.enemyArmy);
      const atkPower = Math.round(enemyTroops * (11 + attackerCfg.difficulty * 4.2));
      const defPower = Math.max(50, defStats.totalDef + (targetCfg.isHome ? 650 : 0));

      atkState.enemyArmy = Math.round(atkState.enemyThreshold * 0.18);

      let wallDrop = 0;
      const oldWall = defState.buildings.def_wall || 0;
      if (oldWall > 0 && atkPower > defStats.wallShield * 0.65) {
        wallDrop = atkPower > defStats.wallShield * 1.4 ? Math.min(oldWall, 2) : 1;
        defState.buildings.def_wall = Math.max(0, oldWall - wallDrop);
      }

      const ratio = atkPower / Math.max(1, defPower);
      const troopLossPct = Math.min(1.0, Math.pow(ratio, 1.15) * 0.65);
      let remainingTroops = 0;
      for (const u of (CFG.PLANET_GARRISON_UNITS || [])) {
        const cur = defState.garrison[u.id] || 0;
        const lost = Math.min(cur, Math.ceil(cur * troopLossPct));
        defState.garrison[u.id] = Math.max(0, cur - lost);
        remainingTroops += defState.garrison[u.id];
      }

      let bldDropMsg = '';
      if (defState.buildings.def_wall === 0 && atkPower > defPower) {
        if ((defState.buildings.def_flak || 0) > 0) {
          defState.buildings.def_flak--;
          bldDropMsg += ' · 🗼Flak -1Lv';
        }
        if ((defState.buildings.def_rail || 0) > 0 && ratio > 1.35) {
          defState.buildings.def_rail--;
          bldDropMsg += ' · ⚡Rail -1Lv';
        }
        if ((defState.mineLvl || 1) > 1) {
          defState.mineLvl--;
          bldDropMsg += ' · ⛏️Mine -1Lv';
        }
      }

      const remBuildings = (defState.buildings.def_wall || 0) + (defState.buildings.def_flak || 0) + (defState.buildings.def_rail || 0);

      if (!targetCfg.isHome && remainingTroops <= 0 && remBuildings <= 0 && atkPower > defPower) {
        defState.owned = false;
        defState.enemyArmy = Math.round(40 + targetCfg.difficulty * 25);
        const logMsg = `💀 [PLANET LOST] ${attackerCfg.name} (Lv.${attackerCfg.difficulty} · ${enemyTroops} Army, PWR ${atkPower}) overwhelmed ${targetCfg.name} (DEF ${defPower})! Wall & Garrison wiped out — Planet Control LOST!`;
        this.travianBattleLogs.unshift(logMsg);
        this.spawnFloatingText(this.player.x, this.player.z - 55, `💀 LOST CONTROL OF ${targetCfg.name.toUpperCase()}!`, '#ef4444');
      } else {
        const logMsg = `🛡️ [DEFENSE REPORT] ${attackerCfg.name} (${enemyTroops} Army, PWR ${atkPower}) attacked ${targetCfg.name} (DEF ${defPower}). Wall Lv.${oldWall}➔${defState.buildings.def_wall}${bldDropMsg} · Troops lost: ${Math.round(troopLossPct * 100)}%. Planet Held!`;
        this.travianBattleLogs.unshift(logMsg);
        this.spawnFloatingText(this.player.x, this.player.z - 55, `🛡️ ${targetCfg.name.toUpperCase()} DEFENDED AGAINST INVASION!`, '#38bdf8');
      }

      if (this.travianBattleLogs.length > 15) this.travianBattleLogs.length = 15;
      if (document.getElementById('modal-space-map')?.classList.contains('open')) {
        this.renderSpaceMapModal();
      }
      this.updateHUD();
    }

    sendPreemptiveTroopAttack(enemyPlanetId) {
      const enemyCfg = (CFG.SPACE_MAP_PLANETS || []).find((p) => p.id === enemyPlanetId);
      const enemyState = this.spacePlanets?.[enemyPlanetId];
      if (!enemyCfg || !enemyState || enemyState.owned) return;

      let totalRaidPower = 0;
      let totalTroopsSent = 0;
      for (const p of (CFG.SPACE_MAP_PLANETS || [])) {
        const ps = this.spacePlanets[p.id];
        if (!ps || !ps.owned) continue;
        for (const u of (CFG.PLANET_GARRISON_UNITS || [])) {
          const cnt = ps.garrison?.[u.id] || 0;
          if (cnt > 0) {
            totalRaidPower += cnt * u.atkValue;
            totalTroopsSent += cnt;
          }
        }
      }

      if (totalTroopsSent <= 0) {
        this.spawnFloatingText(this.player.x, this.player.z - 40, '⚠️ HIRE GARRISON TROOPS ON YOUR PLANETS FIRST TO LAUNCH A STRIKE!', '#ef4444');
        return;
      }

      const armyReduction = Math.max(18, Math.round(totalRaidPower / Math.max(4, 6 + enemyCfg.difficulty * 2)));
      const oldArmy = Math.round(enemyState.enemyArmy || 0);
      enemyState.enemyArmy = Math.max(0, oldArmy - armyReduction);

      for (const p of (CFG.SPACE_MAP_PLANETS || [])) {
        const ps = this.spacePlanets[p.id];
        if (!ps || !ps.owned) continue;
        for (const u of (CFG.PLANET_GARRISON_UNITS || [])) {
          if ((ps.garrison[u.id] || 0) > 1 && Math.random() < 0.25) {
            ps.garrison[u.id]--;
          }
        }
      }

      const logMsg = `⚔️ [PRE-EMPTIVE RAID] Our Garrison Strike Force (${totalTroopsSent} units, ATK ${totalRaidPower}) raided ${enemyCfg.name}! Enemy Army reduced from ${oldArmy} ➔ ${Math.round(enemyState.enemyArmy)}.`;
      this.travianBattleLogs.unshift(logMsg);
      this.audio.playStratagem();
      this.spawnFloatingText(this.player.x, this.player.z - 50, `⚔️ RAIDED ${enemyCfg.name.toUpperCase()}: ENEMY ARMY -${armyReduction}!`, '#4ade80');
      this.saveGame();
      this.renderSpaceMapModal();
      this.updateHUD();
    }

    renderSpaceMapModal() {
      this.initSpaceMapState();
      const bannerEl = document.getElementById('space-map-summary-banner');
      const mapWrapEl = document.getElementById('space-map-canvas-wrap');
      const inspEl = document.getElementById('space-planet-inspector');
      const logTitleEl = document.getElementById('travian-battle-log-title');
      const logEl = document.getElementById('travian-battle-log');
      const gridTitleEl = document.getElementById('space-planets-grid-title');
      const gridEl = document.getElementById('space-planets-grid');
      if (!bannerEl || !inspEl || !gridEl) return;

      this.spaceMapPage = this.spaceMapPage || 'map';
      const page = this.spaceMapPage;
      const planets = CFG.SPACE_MAP_PLANETS || [];
      const ownedCount = planets.filter((p) => this.spacePlanets[p.id]?.owned).length;
      const selCfg = planets.find((p) => p.id === this.selectedSpacePlanetId) || planets[0];
      const selState = this.spacePlanets[selCfg.id];
      const isOwned = !!selState.owned;
      const isAdj = this.isPlanetAdjacentToOwned(selCfg.id);
      const defStats = this.getPlanetDefenseStats(selCfg.id);
      const oreInfo = this.getPlanetOreRatesBreakdown(selCfg.id);

      this.drawSpaceMapCanvas();

      if (logEl) {
        logEl.innerHTML = (this.travianBattleLogs || []).map((msg) => `<div style="margin-bottom:6px;border-bottom:1px solid rgba(148,163,184,0.18);padding-bottom:4px;">${msg}</div>`).join('');
      }

      if (page === 'map') {
        if (mapWrapEl) mapWrapEl.style.display = 'block';
        inspEl.style.display = 'none';
        if (logTitleEl) logTitleEl.style.display = 'none';
        if (logEl) logEl.style.display = 'none';
        if (gridTitleEl) gridTitleEl.style.display = 'none';
        gridEl.style.display = 'none';

        bannerEl.innerHTML = `
          <div>
            <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.92rem;">
              🪐 GALACTIC SPACE MAP: ${ownedCount}/${planets.length} PLANETS LIBERATED · CLICK 🌍 SUPER EARTH OR ANY PLANET!
            </div>
            <div style="font-size:0.75rem;color:#e2e8f0;margin-top:2px;">
              🐛 Bugs: Lv.1–3 Basic 🛢️ · <strong>Lv.4–6 Unique #1 🏜️ Sand</strong> · <strong>Lv.7–10 Unique #2 🧪 Crystal</strong> |
              🤖 Bots: Lv.1–3 Basic ⛏️ · <strong>Lv.4–6 Unique #1 🔩 Titanium</strong> · <strong>Lv.7–10 Unique #2 ⚛️ Q-Core</strong>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button class="buy-btn" id="btn-sp-click-superearth" style="padding:6px 12px;font-size:0.78rem;">
              🌍 Inspect Super Earth HQ (Ores &amp; Upgrades)
            </button>
            <button class="hud-btn" id="btn-sp-open-logs" style="border-color:#f97316;color:#fdba74;">
              📜 Battle Reports (${(this.travianBattleLogs || []).length}) ➔
            </button>
          </div>
        `;
        document.getElementById('btn-sp-click-superearth')?.addEventListener('click', () => {
          this.selectedSpacePlanetId = 'planet_halltown';
          this.spaceMapPage = 'planet';
          this.superEarthSubPage = 'ores';
          this.renderSpaceMapModal();
        });
        document.getElementById('btn-sp-open-logs')?.addEventListener('click', () => {
          this.spaceMapPage = 'logs';
          this.renderSpaceMapModal();
        });
        return;
      }

      if (mapWrapEl) mapWrapEl.style.display = 'none';
      if (gridTitleEl) gridTitleEl.style.display = 'none';
      gridEl.style.display = 'none';

      if (page === 'logs') {
        inspEl.style.display = 'none';
        if (logTitleEl) logTitleEl.style.display = 'block';
        if (logEl) logEl.style.display = 'block';
        bannerEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
            <button class="hud-btn" id="btn-sp-back-map" style="border-color:#facc15;color:#fde047;padding:7px 14px;">
              ⬅️ Back to Space Map
            </button>
            <div style="font-family:var(--font-display);font-weight:900;color:#f97316;font-size:0.92rem;">
              📜 TRAVIAN-STYLE PLANETARY DEFENSE BATTLE REPORTS
            </div>
          </div>
        `;
        document.getElementById('btn-sp-back-map')?.addEventListener('click', () => {
          this.spaceMapPage = 'map';
          this.renderSpaceMapModal();
        });
        return;
      }

      if (logTitleEl) logTitleEl.style.display = 'none';
      if (logEl) logEl.style.display = 'none';
      inspEl.style.display = 'block';

      if (page === 'planet') {
        if (selCfg.isHome) {
          this.superEarthSubPage = this.superEarthSubPage || 'ores';
          const seSub = this.superEarthSubPage;
          const p = this.portLogistics;
          const PL = CFG.PORT_LOGISTICS;
          const maxS = this.getPortStorageLimit();
          const seRate = this.getSuperEarthDrillRate();
          const seDrillCost = this.getSuperEarthDrillCost();
          const storageCost = this.getPortUpgradeCost('storageLimitLvl');
          const unloadCost = this.getPortUpgradeCost('unloadSpeedLvl');
          const buyShipCost = this.getBuyShipCost();
          const addPortCost = this.getAddPortCost();
          const cargoCost = this.getPortUpgradeCost('shipCargoLvl');

          bannerEl.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
              <button class="hud-btn" id="btn-sp-back-map" style="border-color:#facc15;color:#fde047;padding:7px 14px;">
                ⬅️ Back to Space Map
              </button>
              <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.94rem;">
                🌍 SUPER EARTH ORBITAL HQ — NO. OF ORE: 6 SILOS (2 CORE VEINS · +${(seRate * 2).toFixed(2)} RAW/SEC)
              </div>
              <div style="display:flex;gap:6px;">
                <button class="${seSub === 'ores' ? 'buy-btn' : 'hud-btn'}" id="btn-se-tab-ores">📊 Page 1: Ore Numbers &amp; Raw/sec</button>
                <button class="${seSub === 'upgrades' ? 'buy-btn medal-btn' : 'hud-btn'}" id="btn-se-tab-upgrades">⬆️ Page 2: Super Earth Upgrades</button>
              </div>
            </div>
          `;
          document.getElementById('btn-sp-back-map')?.addEventListener('click', () => {
            this.spaceMapPage = 'map';
            this.renderSpaceMapModal();
          });
          document.getElementById('btn-se-tab-ores')?.addEventListener('click', () => {
            this.superEarthSubPage = 'ores';
            this.renderSpaceMapModal();
          });
          document.getElementById('btn-se-tab-upgrades')?.addEventListener('click', () => {
            this.superEarthSubPage = 'upgrades';
            this.renderSpaceMapModal();
          });

          if (seSub === 'ores') {
            const oreCards = CFG.RAW_EXTRACTORS.map((r) => {
              const curStock = Math.floor(this.rawExtractors?.[r.id]?.stock || 0);
              const perSec = (r.id === 'raw_e710' || r.id === 'raw_iron') ? `+${seRate.toFixed(2)}/sec (Super Earth Core)` : 'Hauled from Captured Planets';
              return `
                <div style="background:rgba(15,23,42,0.92);border:1.5px solid ${r.color};border-radius:10px;padding:10px;">
                  <div style="font-family:var(--font-display);font-weight:900;color:${r.color};font-size:0.82rem;">${r.itemIcon} ${r.shortName.toUpperCase()}</div>
                  <div style="font-size:1.1rem;font-weight:900;color:#fff;margin:4px 0;">No. of Ore: ${curStock} / ${maxS}</div>
                  <div style="font-size:0.74rem;color:#86efac;font-weight:700;">⚡ ${perSec}</div>
                  <div style="font-size:0.7rem;color:#94a3b8;margin-top:2px;">${r.planetLevels}</div>
                </div>
              `;
            }).join('');

            inspEl.innerHTML = `
              <div style="background:rgba(250,204,21,0.12);border:1.5px solid #facc15;border-radius:10px;padding:10px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <div>
                  <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.92rem;">
                    ⛏️ SUPER EARTH ORE SUMMARY — NO. OF ORE SILOS: 6 · CORE DRILL Lv.${p.superEarthDrillLvl || 1}/10
                  </div>
                  <div style="font-size:0.78rem;color:#e2e8f0;margin-top:2px;">
                    ⚡ <strong>Super Earth Raw/sec: +${seRate.toFixed(2)} 🛢️ Oil/sec &amp; +${seRate.toFixed(2)} ⛏️ Iron/sec (Total: +${(seRate * 2).toFixed(2)} Raw/sec)</strong> · Storage Cap: <strong>${maxS} per Ore</strong>
                  </div>
                </div>
                <button class="buy-btn medal-btn" id="btn-se-goto-upg" style="padding:9px 16px;font-size:0.84rem;">
                  ⬆️ Go to Super Earth Upgrades Page ➔
                </button>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:10px;">
                ${oreCards}
              </div>
            `;
            document.getElementById('btn-se-goto-upg')?.addEventListener('click', () => {
              this.superEarthSubPage = 'upgrades';
              this.renderSpaceMapModal();
            });
          } else {
            inspEl.innerHTML = `
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
                <div class="upgrade-card" style="border-color:#facc15;">
                  <div class="upg-top"><span class="upg-title">🌍 Super Earth Core Drill (Lv.${p.superEarthDrillLvl || 1}/10)</span></div>
                  <p class="upg-desc">Increases Super Earth's base 🛢️ Oil/sec &amp; ⛏️ Iron/sec (+${seRate.toFixed(2)}/s ➔ +${(seRate + 0.55).toFixed(2)}/s each)!</p>
                  <button class="buy-btn" id="btn-se-upg-drill" ${(p.superEarthDrillLvl || 1) >= 10 || this.cash < seDrillCost ? 'disabled' : ''}>
                    ${(p.superEarthDrillLvl || 1) >= 10 ? 'MAX Lv.10' : `⬆️ Upgrade Core Drill Lv.${(p.superEarthDrillLvl || 1) + 1} ($${seDrillCost})`}
                  </button>
                </div>
                <div class="upgrade-card" style="border-color:#38bdf8;">
                  <div class="upg-top"><span class="upg-title">📦 Super Earth Ore Storage (Lv.${p.storageLimitLvl}/10)</span></div>
                  <p class="upg-desc">Raises max storage capacity for all 6 Ore Silos (${maxS} ➔ ${maxS + 25} per ore).</p>
                  <button class="buy-btn" id="btn-se-upg-storage" ${p.storageLimitLvl >= 10 || this.cash < storageCost ? 'disabled' : ''}>
                    ${p.storageLimitLvl >= 10 ? 'MAX Lv.10' : `⬆️ Upgrade Ore Storage Lv.${p.storageLimitLvl + 1} ($${storageCost})`}
                  </button>
                </div>
                <div class="upgrade-card" style="border-color:#4ade80;">
                  <div class="upg-top"><span class="upg-title">⚡ Port Unloading Speed (Lv.${p.unloadSpeedLvl}/10)</span></div>
                  <p class="upg-desc">Unloads Transport Ships faster at Super Earth Port (${this.getPortUnloadRate().toFixed(1)}/s).</p>
                  <button class="buy-btn" id="btn-se-upg-unload" ${p.unloadSpeedLvl >= 10 || this.cash < unloadCost ? 'disabled' : ''}>
                    ${p.unloadSpeedLvl >= 10 ? 'MAX Lv.10' : `⬆️ Upgrade Unload Speed Lv.${p.unloadSpeedLvl + 1} ($${unloadCost})`}
                  </button>
                </div>
                <div class="upgrade-card" style="border-color:#a855f7;">
                  <div class="upg-top"><span class="upg-title">🛸 Orbital Transport Ships (${p.shipsCount}/${PL.maxShips})</span></div>
                  <p class="upg-desc">Buy more Transport Ships to haul mined ores from Captured Planets to Super Earth!</p>
                  <button class="buy-btn" id="btn-se-buy-ship" ${p.shipsCount >= PL.maxShips || this.cash < buyShipCost ? 'disabled' : ''}>
                    ${p.shipsCount >= PL.maxShips ? 'MAX 10 SHIPS' : `➕ Buy Ship #${p.shipsCount + 1} ($${buyShipCost})`}
                  </button>
                </div>
                <div class="upgrade-card" style="border-color:#eab308;">
                  <div class="upg-top"><span class="upg-title">⚓ Left-Hand Docking Ports (${p.portsUnlocked}/${PL.maxPorts})</span></div>
                  <p class="upg-desc">Add Docking Piers so multiple Transport Ships can unload in parallel.</p>
                  <button class="buy-btn medal-btn" id="btn-se-add-port" ${p.portsUnlocked >= PL.maxPorts || this.cash < addPortCost ? 'disabled' : ''}>
                    ${p.portsUnlocked >= PL.maxPorts ? 'MAX 4 PORTS' : `➕ Add Port #${p.portsUnlocked + 1} ($${addPortCost})`}
                  </button>
                </div>
                <div class="upgrade-card" style="border-color:#ec4899;">
                  <div class="upg-top"><span class="upg-title">🚀 Ship Cargo Capacity (Lv.${p.shipCargoLvl}/10)</span></div>
                  <p class="upg-desc">Increases each ship's ore capacity (${this.getShipCargoCap()} ➔ ${this.getShipCargoCap() + 5} units/trip).</p>
                  <button class="buy-btn" id="btn-se-upg-cargo" ${p.shipCargoLvl >= 10 || this.cash < cargoCost ? 'disabled' : ''}>
                    ${p.shipCargoLvl >= 10 ? 'MAX Lv.10' : `⬆️ Upgrade Ship Cargo Lv.${p.shipCargoLvl + 1} ($${cargoCost})`}
                  </button>
                </div>
              </div>
            `;
            document.getElementById('btn-se-upg-drill')?.addEventListener('click', () => this.upgradeSuperEarthDrill());
            document.getElementById('btn-se-upg-storage')?.addEventListener('click', () => this.upgradePortStat('storageLimitLvl'));
            document.getElementById('btn-se-upg-unload')?.addEventListener('click', () => this.upgradePortStat('unloadSpeedLvl'));
            document.getElementById('btn-se-buy-ship')?.addEventListener('click', () => this.buyTransportShip());
            document.getElementById('btn-se-add-port')?.addEventListener('click', () => this.addDockingPort());
            document.getElementById('btn-se-upg-cargo')?.addEventListener('click', () => this.upgradePortStat('shipCargoLvl'));
          }
          return;
        }

        const maxCap = this.getPlanetStorageCap(selCfg.id);
        const mainIcon = selCfg.faction === 'bugs' ? '🛢️' : '⛏️';
        const mainRate = selCfg.faction === 'bugs' ? oreInfo.oilPerSec : oreInfo.ironPerSec;
        const mainStored = selCfg.faction === 'bugs' ? Math.floor(selState.storedOil || 0) : Math.floor(selState.storedIron || 0);

        bannerEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
            <button class="hud-btn" id="btn-sp-back-map" style="border-color:#facc15;color:#fde047;padding:7px 14px;">
              ⬅️ Back to Space Map
            </button>
            <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.92rem;">
              🪐 ${selCfg.name.toUpperCase()} (Lv.${selCfg.difficulty}/10) — ⛏️ NO. OF ORE: ${oreInfo.oreVeins} VEINS · ⚡ +${oreInfo.totalRawPerSec.toFixed(2)} RAW/SEC
            </div>
            <div style="font-family:var(--font-display);font-weight:900;color:#4ade80;font-size:0.86rem;">
              💵 $${Math.floor(this.cash)}
            </div>
          </div>
        `;
        document.getElementById('btn-sp-back-map')?.addEventListener('click', () => {
          this.spaceMapPage = 'map';
          this.renderSpaceMapModal();
        });

        const kpiCards = `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin-bottom:14px;">
            <div style="background:rgba(15,23,42,0.92);border:2px solid #facc15;border-radius:10px;padding:12px;">
              <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.8rem;">⛏️ NO. OF ORE (礦脈數量與儲量)</div>
              <div style="font-size:1.12rem;font-weight:900;color:#fff;margin:4px 0;">
                ${oreInfo.oreVeins} Ore Veins (${oreInfo.hasUnique ? 'Main + Unique' : 'Basic Only'})
              </div>
              <div style="font-size:0.78rem;color:#86efac;font-weight:700;">
                Stored: ${mainIcon} ${mainStored}/${maxCap} ${oreInfo.hasUnique ? `· ${oreInfo.uniqueIcon} ${oreInfo.uniqueStored}/${maxCap}` : ''}
              </div>
            </div>
            <div style="background:rgba(15,23,42,0.92);border:2px solid #4ade80;border-radius:10px;padding:12px;">
              <div style="font-family:var(--font-display);font-weight:900;color:#86efac;font-size:0.8rem;">⚡ RAW PER SEC (每秒總產量)</div>
              <div style="font-size:1.12rem;font-weight:900;color:#4ade80;margin:4px 0;">
                +${oreInfo.totalRawPerSec.toFixed(2)} Raw / sec
              </div>
              <div style="font-size:0.76rem;color:#cbd5e1;">
                ${mainIcon} Main: <strong>+${mainRate.toFixed(2)}/s</strong> · ${oreInfo.hasUnique ? `${oreInfo.uniqueIcon} Unique: <strong>+${oreInfo.uniquePerSec.toFixed(2)}/s</strong>` : 'No Unique Ore (Lv.1–3)'}
              </div>
            </div>
            <div style="background:rgba(15,23,42,0.92);border:2px solid ${selCfg.color};border-radius:10px;padding:12px;">
              <div style="font-family:var(--font-display);font-weight:900;color:#38bdf8;font-size:0.8rem;">✨ FACTION UNIQUE RESOURCE TIER</div>
              <div style="font-size:0.96rem;font-weight:900;color:#fef08a;margin:4px 0;">
                ${oreInfo.uniqueName}
              </div>
              <div style="font-size:0.74rem;color:#cbd5e1;">
                ${selCfg.difficulty <= 3 ? 'Lv.1–3 Basic Planet (Capture Lv.4–6 or Lv.7–10 for Unique Ores!)' : (selCfg.difficulty <= 6 ? 'Lv.4–6 Mid-Tier Unique (#1) — 2.2x Shop Value!' : 'Lv.7–10 High-Tier Unique (#2) — 3.5x Shop Value!')}
              </div>
            </div>
          </div>
        `;

        if (isOwned) {
          inspEl.innerHTML = `
            <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <div style="font-family:var(--font-display);font-weight:900;color:#4ade80;font-size:1rem;">
                🚩 CAPTURED PLANET: ${selCfg.name} (${selCfg.zhName})
              </div>
              <span class="version-pill" style="border-color:#4ade80;color:#86efac;">Mine Drill Lv.${selState.mineLvl}/10 · Storage Lv.${selState.storageLvl}/10</span>
            </div>
            ${kpiCards}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;">
              <button class="buy-btn" id="btn-sp-goto-econ" style="padding:13px;font-size:0.88rem;">
                ⛏️ Page 3A: Economy &amp; Mine Upgrade Page (Drill Lv.${selState.mineLvl}/10) ➔
              </button>
              <button class="buy-btn medal-btn" id="btn-sp-goto-defense" style="padding:13px;font-size:0.88rem;">
                🛡️ Page 3B: Defense &amp; Garrison Page (Wall Lv.${selState.buildings?.def_wall || 0} · DEF ${defStats.totalDef}) ➔
              </button>
            </div>
          `;
          document.getElementById('btn-sp-goto-econ')?.addEventListener('click', () => {
            this.spaceMapPage = 'econ';
            this.renderSpaceMapModal();
          });
          document.getElementById('btn-sp-goto-defense')?.addEventListener('click', () => {
            this.spaceMapPage = 'defense';
            this.renderSpaceMapModal();
          });
        } else {
          const armyPct = Math.min(100, Math.round(((selState.enemyArmy || 0) / Math.max(1, selState.enemyThreshold)) * 100));
          inspEl.innerHTML = `
            <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <div style="font-family:var(--font-display);font-weight:900;color:#f87171;font-size:1rem;">
                🏴‍☠️ ENEMY PLANET: ${selCfg.name} (${selCfg.zhName})
              </div>
              <span class="version-pill" style="border-color:#ef4444;color:#fca5a5;">👾 Enemy Army: ${Math.round(selState.enemyArmy)}/${selState.enemyThreshold} (${armyPct}%)</span>
            </div>
            ${kpiCards}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;">
              <button class="hud-btn" id="btn-sp-raid-army" ${!isAdj ? 'disabled' : ''} style="border-color:#38bdf8;color:#7dd3fc;padding:12px;font-size:0.86rem;">
                ⚔️ Send Pre-Emptive Troop Strike (Reduce Enemy Army · Cannot Capture)
              </button>
              <button class="buy-btn" id="btn-sp-start-capture" ${!isAdj ? 'disabled' : ''} style="background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;padding:12px;font-size:0.88rem;">
                ${isAdj ? `🚩 Launch 10-Wave Capture (Lv.${selCfg.difficulty}/10 · Capybara Go!)` : '🔒 Must Capture Adjacent Linked Planet First'}
              </button>
            </div>
          `;
          document.getElementById('btn-sp-raid-army')?.addEventListener('click', () => {
            this.sendPreemptiveTroopAttack(selCfg.id);
          });
          document.getElementById('btn-sp-start-capture')?.addEventListener('click', () => {
            this.targetCapturePlanetId = selCfg.id;
            document.getElementById('modal-space-map')?.classList.remove('open');
            this.startPlanetCaptureRun(selCfg.id);
          });
        }
        return;
      }

      if (page === 'econ') {
        const mineCost = Math.round(130 * Math.pow(1.42, (selState.mineLvl || 1) - 1));
        const storCost = Math.round(120 * Math.pow(1.40, (selState.storageLvl || 1) - 1));
        const maxCap = this.getPlanetStorageCap(selCfg.id);
        const mainIcon = selCfg.faction === 'bugs' ? '🛢️' : '⛏️';
        const mainRate = selCfg.faction === 'bugs' ? oreInfo.oilPerSec : oreInfo.ironPerSec;
        const mainStored = selCfg.faction === 'bugs' ? Math.floor(selState.storedOil || 0) : Math.floor(selState.storedIron || 0);

        bannerEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
            <div style="display:flex;gap:6px;">
              <button class="hud-btn" id="btn-sp-back-planet" style="border-color:#facc15;color:#fde047;padding:7px 12px;">
                ⬅️ Back to Planet Overview
              </button>
              <button class="hud-btn" id="btn-sp-back-map" style="border-color:#94a3b8;color:#cbd5e1;padding:7px 12px;">
                🗺️ Space Map
              </button>
            </div>
            <div style="font-family:var(--font-display);font-weight:900;color:#4ade80;font-size:0.9rem;">
              ⛏️ ECONOMY PAGE: ${selCfg.name.toUpperCase()} (${oreInfo.oreVeins} VEINS · +${oreInfo.totalRawPerSec.toFixed(2)} RAW/SEC)
            </div>
            <button class="hud-btn" id="btn-sp-switch-def" style="border-color:#38bdf8;color:#7dd3fc;">
              🛡️ Go to Defense Page ➔
            </button>
          </div>
        `;

        inspEl.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:14px;">
            <div style="background:rgba(15,23,42,0.9);border:1.5px solid #a855f7;border-radius:10px;padding:10px;">
              <div style="font-family:var(--font-display);font-weight:900;color:#e9d5ff;font-size:0.8rem;">${mainIcon} MAIN ORE STORAGE &amp; RAW/SEC</div>
              <div style="font-size:1.02rem;font-weight:900;color:#fff;margin:4px 0;">
                Stored: ${mainIcon} ${mainStored} / ${maxCap}
              </div>
              <div style="font-size:0.76rem;color:#4ade80;font-weight:700;">⚡ Output: +${mainRate.toFixed(2)} ${mainIcon}/sec</div>
            </div>
            <div style="background:rgba(15,23,42,0.9);border:1.5px solid #facc15;border-radius:10px;padding:10px;">
              <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.8rem;">${oreInfo.uniqueIcon} UNIQUE FACTION ORE</div>
              <div style="font-size:1.02rem;font-weight:900;color:#fef08a;margin:4px 0;">
                ${oreInfo.hasUnique ? `Stored: ${oreInfo.uniqueIcon} ${oreInfo.uniqueStored} / ${maxCap}` : 'None (Lv.1–3 Basic Planet)'}
              </div>
              <div style="font-size:0.76rem;color:#cbd5e1;">${oreInfo.hasUnique ? `⚡ Output: +${oreInfo.uniquePerSec.toFixed(2)} ${oreInfo.uniqueIcon}/sec` : 'Capture Lv.4–6 or Lv.7–10 for Unique Ores'}</div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;">
            <div class="upgrade-card" style="border-color:#4ade80;">
              <div class="upg-top"><span class="upg-title">⛏️ Planetary Mine Drill (Lv.${selState.mineLvl}/10)</span></div>
              <p class="upg-desc">Boosts total Raw/sec on this planet (+42% per level · Current: +${oreInfo.totalRawPerSec.toFixed(2)}/s)!</p>
              <button class="buy-btn" id="btn-sp-upg-mine" ${selState.mineLvl >= 10 || this.cash < mineCost ? 'disabled' : ''}>
                ${selState.mineLvl >= 10 ? 'MAX Lv.10' : `⬆️ Upgrade Mine Drill Lv.${selState.mineLvl + 1}/10 ($${mineCost})`}
              </button>
            </div>
            <div class="upgrade-card" style="border-color:#38bdf8;">
              <div class="upg-top"><span class="upg-title">📦 Planet Ore Storage Silo (Lv.${selState.storageLvl}/10)</span></div>
              <p class="upg-desc">Expands planetary ore buffer (${maxCap} ➔ ${maxCap + 35}) for Transport Ships!</p>
              <button class="buy-btn" id="btn-sp-upg-storage" ${selState.storageLvl >= 10 || this.cash < storCost ? 'disabled' : ''}>
                ${selState.storageLvl >= 10 ? 'MAX Lv.10' : `⬆️ Upgrade Planet Storage Lv.${selState.storageLvl + 1}/10 ($${storCost})`}
              </button>
            </div>
          </div>
        `;

        document.getElementById('btn-sp-back-planet')?.addEventListener('click', () => {
          this.spaceMapPage = 'planet';
          this.renderSpaceMapModal();
        });
        document.getElementById('btn-sp-back-map')?.addEventListener('click', () => {
          this.spaceMapPage = 'map';
          this.renderSpaceMapModal();
        });
        document.getElementById('btn-sp-switch-def')?.addEventListener('click', () => {
          this.spaceMapPage = 'defense';
          this.renderSpaceMapModal();
        });
        document.getElementById('btn-sp-upg-mine')?.addEventListener('click', () => {
          if (this.cash >= mineCost && selState.mineLvl < 10) {
            this.cash -= mineCost;
            selState.mineLvl++;
            this.audio.playUnlock();
            this.saveGame();
            this.renderSpaceMapModal();
          }
        });
        document.getElementById('btn-sp-upg-storage')?.addEventListener('click', () => {
          if (this.cash >= storCost && selState.storageLvl < 10) {
            this.cash -= storCost;
            selState.storageLvl++;
            this.audio.playUnlock();
            this.saveGame();
            this.renderSpaceMapModal();
          }
        });
        return;
      }

      if (page === 'defense') {
        this.planetDefSubPage = this.planetDefSubPage || 'buildings';
        const defSub = this.planetDefSubPage;

        bannerEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
            <div style="display:flex;gap:6px;">
              <button class="hud-btn" id="btn-sp-back-planet" style="border-color:#facc15;color:#fde047;padding:7px 12px;">
                ⬅️ Back to Planet
              </button>
              <button class="hud-btn" id="btn-sp-back-map" style="border-color:#94a3b8;color:#cbd5e1;padding:7px 12px;">
                🗺️ Space Map
              </button>
            </div>
            <div style="font-family:var(--font-display);font-weight:900;color:#38bdf8;font-size:0.9rem;">
              🛡️ DEFENSE PAGE: ${selCfg.name.toUpperCase()} (DEF ${defStats.totalDef})
            </div>
            <div style="display:flex;gap:6px;">
              <button class="${defSub === 'buildings' ? 'buy-btn' : 'hud-btn'}" id="btn-def-tab-bld">🧱 Sub-Page 1: Wall &amp; Turrets</button>
              <button class="${defSub === 'troops' ? 'buy-btn medal-btn' : 'hud-btn'}" id="btn-def-tab-troops">🪖 Sub-Page 2: Hire Troops</button>
            </div>
          </div>
        `;

        document.getElementById('btn-sp-back-planet')?.addEventListener('click', () => {
          this.spaceMapPage = 'planet';
          this.renderSpaceMapModal();
        });
        document.getElementById('btn-sp-back-map')?.addEventListener('click', () => {
          this.spaceMapPage = 'map';
          this.renderSpaceMapModal();
        });
        document.getElementById('btn-def-tab-bld')?.addEventListener('click', () => {
          this.planetDefSubPage = 'buildings';
          this.renderSpaceMapModal();
        });
        document.getElementById('btn-def-tab-troops')?.addEventListener('click', () => {
          this.planetDefSubPage = 'troops';
          this.renderSpaceMapModal();
        });

        if (defSub === 'buildings') {
          const bldCards = (CFG.PLANET_DEFENSE_BUILDINGS || []).map((b) => {
            const bLvl = selState.buildings?.[b.id] || 0;
            const bCost = Math.round(b.baseBuildCost * Math.pow(b.costScale, bLvl));
            return `
              <div style="background:rgba(30,41,59,0.9);border:1.5px solid ${b.color};border-radius:10px;padding:12px;">
                <div style="font-family:var(--font-display);font-weight:800;color:${b.color};font-size:0.84rem;">
                  ${b.icon} ${b.name} (Lv.${bLvl}/10)
                </div>
                <div style="font-size:0.75rem;color:#cbd5e1;margin:6px 0;">
                  ${b.breaksFirst ? '🧱 <strong>Breaks First!</strong> ' : ''}+${b.defPowerPerLvl} DEF · Upkeep: $${b.dailyMaintPerLvl}/day
                </div>
                <button class="buy-btn btn-planet-bld" data-bld="${b.id}" ${bLvl >= 10 || this.cash < bCost ? 'disabled' : ''} style="width:100%;padding:8px;font-size:0.8rem;">
                  ${bLvl >= 10 ? 'MAX Lv.10' : `🔨 Build Lv.${bLvl + 1} ($${bCost})`}
                </button>
              </div>
            `;
          }).join('');

          inspEl.innerHTML = `
            <div style="background:rgba(250,204,21,0.1);border:1px solid #facc15;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:0.78rem;color:#fde047;">
              🧱 <strong>SUB-PAGE 1: PLANETARY WALL &amp; TURRET FORTIFICATIONS</strong> · Wall Shield: <strong>${defStats.wallShield}</strong> (Breaks First!) · Daily Upkeep: <strong>$${defStats.dailyUpkeep}/day</strong>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
              ${bldCards}
            </div>
          `;
          inspEl.querySelectorAll('.btn-planet-bld').forEach((btn) => {
            btn.addEventListener('click', () => {
              const bId = btn.getAttribute('data-bld');
              const bCfg = CFG.PLANET_DEFENSE_BUILDINGS.find((x) => x.id === bId);
              const curL = selState.buildings[bId] || 0;
              const cost = Math.round(bCfg.baseBuildCost * Math.pow(bCfg.costScale, curL));
              if (curL < 10 && this.cash >= cost) {
                this.cash -= cost;
                selState.buildings[bId] = curL + 1;
                this.audio.playUnlock();
                this.saveGame();
                this.renderSpaceMapModal();
              }
            });
          });
        } else {
          const unitCards = (CFG.PLANET_GARRISON_UNITS || []).map((u) => {
            const uCnt = selState.garrison?.[u.id] || 0;
            return `
              <div style="background:rgba(30,41,59,0.9);border:1.5px solid ${u.color};border-radius:10px;padding:12px;">
                <div style="font-family:var(--font-display);font-weight:800;color:${u.color};font-size:0.84rem;">
                  ${u.icon} ${u.name} (Stationed: ${uCnt})
                </div>
                <div style="font-size:0.75rem;color:#cbd5e1;margin:6px 0;">
                  🛡️ DEF ${u.defValue} · ⚔️ Raid ${u.atkValue} · Wage: $${u.dailyWage}/day
                </div>
                <button class="buy-btn btn-planet-hire" data-unit="${u.id}" ${this.cash < u.hireCost ? 'disabled' : ''} style="width:100%;padding:8px;font-size:0.8rem;">
                  ➕ Hire +1 ($${u.hireCost})
                </button>
              </div>
            `;
          }).join('');

          inspEl.innerHTML = `
            <div style="background:rgba(34,197,94,0.1);border:1px solid #22c55e;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:0.78rem;color:#86efac;">
              🪖 <strong>SUB-PAGE 2: HIRE GARRISON TROOPS</strong> · Troop DEF: <strong>${defStats.troopDef}</strong> · Raid ATK: <strong>${defStats.raidAtk}</strong>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;">
              ${unitCards}
            </div>
          `;
          inspEl.querySelectorAll('.btn-planet-hire').forEach((btn) => {
            btn.addEventListener('click', () => {
              const uId = btn.getAttribute('data-unit');
              const uCfg = CFG.PLANET_GARRISON_UNITS.find((x) => x.id === uId);
              if (this.cash >= uCfg.hireCost) {
                this.cash -= uCfg.hireCost;
                selState.garrison[uId] = (selState.garrison[uId] || 0) + 1;
                this.audio.playUnlock();
                this.saveGame();
                this.renderSpaceMapModal();
              }
            });
          });
        }
      }
    }

    drawSpaceMapCanvas() {
      const canvas = document.getElementById('space-map-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, '#130d1e');
      grad.addColorStop(0.45, '#050914');
      grad.addColorStop(0.55, '#050914');
      grad.addColorStop(1, '#1c0b12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.font = '900 12px Orbitron, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#eab308';
      ctx.fillText('🐛 BUGS (Lv.1-3:🛢️ | Lv.4-6:🏜️ Sand | Lv.7-10:🧪 Crystal)', 16, 24);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#facc15';
      ctx.fillText('🌍 CLICK SUPER EARTH OR ANY PLANET', w * 0.5, 24);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('🤖 BOTS (Lv.1-3:⛏️ | Lv.4-6:🔩 Titanium | Lv.7-10:⚛️ Q-Core)', w - 16, 24);

      const planets = CFG.SPACE_MAP_PLANETS || [];
      for (const p of planets) {
        const x1 = p.nx * w;
        const y1 = p.ny * h;
        for (const lid of (p.links || [])) {
          const lp = planets.find((x) => x.id === lid);
          if (!lp) continue;
          const bothOwned = this.spacePlanets[p.id]?.owned && this.spacePlanets[lp.id]?.owned;
          const oneOwned = this.spacePlanets[p.id]?.owned || this.spacePlanets[lp.id]?.owned;
          ctx.strokeStyle = bothOwned ? 'rgba(74, 222, 128, 0.65)' : (oneOwned ? 'rgba(250, 204, 21, 0.42)' : 'rgba(148, 163, 184, 0.22)');
          ctx.lineWidth = bothOwned ? 3 : 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(lp.nx * w, lp.ny * h);
          ctx.stroke();
        }
      }

      for (const p of planets) {
        const px = p.nx * w;
        const py = p.ny * h;
        const ps = this.spacePlanets[p.id];
        const owned = !!ps?.owned;
        const isSel = this.selectedSpacePlanetId === p.id;
        const adj = !owned && this.isPlanetAdjacentToOwned(p.id);
        const oreInfo = this.getPlanetOreRatesBreakdown(p.id);

        ctx.save();
        ctx.translate(px, py);
        ctx.fillStyle = p.isHome ? '#0f2942' : (owned ? '#064e3b' : (p.faction === 'bugs' ? '#3b2506' : '#3b0a14'));
        ctx.strokeStyle = isSel ? '#facc15' : (owned ? '#4ade80' : (adj ? '#f97316' : p.color));
        ctx.lineWidth = isSel ? 4 : (adj ? 3 : 2.2);
        ctx.beginPath();
        ctx.arc(0, 0, p.isHome ? 27 : 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = p.isHome ? '18px sans-serif' : '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.isHome ? '🌍' : (owned ? '🚩' : (p.faction === 'bugs' ? '🐛' : '🤖')), 0, 0);

        ctx.fillStyle = isSel ? '#fde047' : '#ffffff';
        ctx.font = '900 9.5px Orbitron, sans-serif';
        ctx.fillText(p.isHome ? '🌍 Super Earth HQ' : `${p.name.split(' ')[0]} Lv.${p.difficulty}`, 0, p.isHome ? -33 : -24);

        const mIcon = p.isHome ? '🛢️+⛏️' : (p.faction === 'bugs' ? '🛢️' : '⛏️');
        const uIcon = oreInfo.hasUnique ? `+${oreInfo.uniqueIcon}` : '';
        ctx.fillStyle = p.isHome ? '#fde047' : (owned ? '#86efac' : (adj ? '#fdba74' : '#cbd5e1'));
        ctx.font = '700 9px Rajdhani, sans-serif';
        ctx.fillText(
          `${mIcon}${uIcon} · ${oreInfo.totalRawPerSec.toFixed(1)}/s · ${oreInfo.oreVeins}Ore`,
          0,
          p.isHome ? 36 : 26
        );
        ctx.restore();
      }
    }
    initHelldiverRoster() {
      if (!Array.isArray(this.helldiverRoster) || this.helldiverRoster.length === 0) {
        this.nextHeroUid = 5;
        this.helldiverRoster = [
          this.createHelldiverHero('cls_vanguard', 'Capt. Raynor', 5, 'h_starter_1'),
          this.createHelldiverHero('cls_bulwark', 'Sgt. Titan', 4, 'h_starter_2'),
          this.createHelldiverHero('cls_medic', 'Doc Mercy', 4, 'h_starter_3'),
          this.createHelldiverHero('cls_sniper', 'Ghost Viper', 4, 'h_starter_4')
        ];
        this.capybaraLineup = ['h_starter_1', 'h_starter_2', 'h_starter_3', 'h_starter_4'];
      }
      for (const h of this.helldiverRoster) {
        this.recalcHeroStats(h);
      }
    }

    createHelldiverHero(classId, customName = null, startLvl = 1, forcedId = null) {
      const cls = (CFG.HELLDIVER_CLASSES || []).find((c) => c.id === classId) || CFG.HELLDIVER_CLASSES[0];
      const uid = forcedId || `hero_${Date.now()}_${(this.nextHeroUid = (this.nextHeroUid || 10) + 1)}`;
      const callsigns = ['Viper', 'Hawk', 'Wolf', 'Nova', 'Rex', 'Blaze', 'Iron', 'Storm', 'Zero', 'Apex'];
      const hero = {
        id: uid,
        classId: cls.id,
        name: customName || `${cls.name.split(' ')[0]} ${callsigns[Math.floor(Math.random() * callsigns.length)]}`,
        icon: cls.icon,
        color: cls.color,
        bodyColor: cls.bodyColor,
        capeColor: cls.capeColor,
        trimColor: cls.trimColor,
        level: startLvl,
        maxLevel: 100,
        equip: { weapon: true, armor: true, pack: false, mech: classId === 'cls_mechpilot' },
        maxHp: cls.baseHp,
        hp: cls.baseHp,
        atk: cls.baseAtk,
        fireRate: cls.baseFireRate,
        stats100: { ...cls.baseStats100 }
      };
      this.recalcHeroStats(hero);
      return hero;
    }

    recalcHeroStats(hero) {
      const cls = (CFG.HELLDIVER_CLASSES || []).find((c) => c.id === hero.classId) || CFG.HELLDIVER_CLASSES[0];
      const lvl = Math.max(1, Math.min(100, hero.level || 1));
      const scale = 0.22 + (lvl / 100) * 0.78;
      hero.stats100 = {
        firepower: Math.min(100, Math.round(cls.baseStats100.firepower * scale)),
        vitality: Math.min(100, Math.round(cls.baseStats100.vitality * scale)),
        agility: Math.min(100, Math.round(cls.baseStats100.agility * scale)),
        tactics: Math.min(100, Math.round(cls.baseStats100.tactics * scale))
      };
      const eqHpMult = 1 + (hero.equip?.armor ? 0.25 : 0) + (hero.equip?.pack ? 0.20 : 0) + (hero.equip?.mech ? 0.55 : 0);
      const eqAtkMult = 1 + (hero.equip?.weapon ? 0.25 : 0) + (hero.equip?.mech ? 0.45 : 0);
      hero.maxHp = Math.round((cls.baseHp + (lvl - 1) * 32 + hero.stats100.vitality * 4) * eqHpMult);
      hero.hp = hero.maxHp;
      hero.atk = Math.round((cls.baseAtk + (lvl - 1) * 3.4 + hero.stats100.firepower * 0.5) * eqAtkMult);
      hero.fireRate = Math.max(0.14, cls.baseFireRate * (1 - hero.stats100.agility * 0.003));
    }

    getHeroTrainCost(hero, levels = 1) {
      let cashCost = 0;
      let sampleCost = 0;
      for (let i = 0; i < levels; i++) {
        const l = (hero.level || 1) + i;
        if (l >= 100) break;
        cashCost += Math.round(45 + l * 18);
        if (l >= 15) sampleCost += 1;
      }
      return { cashCost, sampleCost };
    }

    hireHelldiverHero(classId) {
      const cls = (CFG.HELLDIVER_CLASSES || []).find((c) => c.id === classId);
      if (!cls) return;
      if (this.cash < cls.hireCost) {
        this.spawnFloatingText(this.player.x, this.player.z - 35, `⚠️ NEED $${cls.hireCost} TO HIRE ${cls.name.toUpperCase()}`, '#ef4444');
        return;
      }
      this.cash -= cls.hireCost;
      const newHero = this.createHelldiverHero(classId, null, 1);
      this.helldiverRoster.push(newHero);

      for (let s = 0; s < 4; s++) {
        const curId = this.capybaraLineup[s];
        if (!curId || !this.helldiverRoster.some((h) => h.id === curId)) {
          this.capybaraLineup[s] = newHero.id;
          break;
        }
      }
      this.audio.playUnlock();
      this.spawnFloatingText(-840, -240, `🎖️ HIRED ${newHero.name.toUpperCase()} (${cls.name})!`, cls.color);
      this.saveGame();
      this.renderTrainingRoomModal();
      this.updateHUD();
    }

    trainHelldiverHero(heroId, levels = 1) {
      const hero = (this.helldiverRoster || []).find((h) => h.id === heroId);
      if (!hero || hero.level >= 100) return;
      const actualLvls = Math.min(levels, 100 - hero.level);
      const { cashCost, sampleCost } = this.getHeroTrainCost(hero, actualLvls);
      if (this.cash < cashCost || (this.samples.common || 0) < sampleCost) {
        this.spawnFloatingText(this.player.x, this.player.z - 35, `⚠️ NEED $${cashCost} & 🟢${sampleCost} SAMPLES TO TRAIN!`, '#ef4444');
        return;
      }
      this.cash -= cashCost;
      this.samples.common = Math.max(0, (this.samples.common || 0) - sampleCost);
      hero.level += actualLvls;
      this.recalcHeroStats(hero);
      this.audio.playUnlock();
      this.spawnFloatingText(-840, -240, `⬆️ ${hero.name.toUpperCase()} TRAINED TO Lv.${hero.level}/100!`, '#4ade80');
      this.saveGame();
      this.renderTrainingRoomModal();
      this.updateHUD();
    }

    equipHelldiverHeroAllGear(heroId) {
      const hero = (this.helldiverRoster || []).find((h) => h.id === heroId);
      if (!hero) return;
      const cost = 120;
      if (this.cash < cost) {
        this.spawnFloatingText(this.player.x, this.player.z - 35, `⚠️ NEED $${cost} TO EQUIP FULL 4-SLOT SHOP GEAR`, '#ef4444');
        return;
      }
      this.cash -= cost;
      hero.equip = { weapon: true, armor: true, pack: true, mech: true };
      this.recalcHeroStats(hero);
      this.audio.playUnlock();
      this.spawnFloatingText(-840, -240, `🛡️ ${hero.name.toUpperCase()} EQUIPPED WITH 4-SLOT SHOP GEAR!`, '#facc15');
      this.saveGame();
      this.renderTrainingRoomModal();
      this.updateHUD();
    }

    renderTrainingRoomModal() {
      this.initHelldiverRoster();
      const sumEl = document.getElementById('training-room-summary');
      const lineupTitle = document.getElementById('training-lineup-title');
      const lineupGrid = document.getElementById('training-lineup-grid');
      const rosterTitle = document.getElementById('training-roster-title');
      const rosterGrid = document.getElementById('training-roster-grid');
      const recruitTitle = document.getElementById('training-recruit-title');
      const recruitGrid = document.getElementById('training-recruit-grid');
      if (!sumEl || !lineupGrid || !rosterGrid || !recruitGrid) return;

      this.trainingModalPage = this.trainingModalPage || 'overview';
      const page = this.trainingModalPage;

      const slotTitles = [
        '⚔️ SLOT #1: ACTIVE FRONT VANGUARD',
        '⚔️ SLOT #2: ACTIVE MID SUPPORT',
        '⚔️ SLOT #3: ACTIVE REAR FIREPOWER',
        '🚀 SLOT #4: ORBITAL SPARE REINFORCEMENT (Auto-Drops if 1 Dies!)'
      ];

      lineupGrid.innerHTML = [0, 1, 2, 3].map((sIdx) => {
        const hId = this.capybaraLineup[sIdx];
        const h = this.helldiverRoster.find((x) => x.id === hId);
        const options = this.helldiverRoster.map((r) => `<option value="${r.id}" ${r.id === hId ? 'selected' : ''}>${r.icon} ${r.name} (Lv.${r.level}/100)</option>`).join('');
        return `
          <div class="upgrade-card" style="border-color:${sIdx === 3 ? '#f97316' : '#4ade80'};">
            <div style="font-family:var(--font-display);font-weight:900;color:${sIdx === 3 ? '#fdba74' : '#86efac'};font-size:0.78rem;margin-bottom:4px;">
              ${slotTitles[sIdx]}
            </div>
            <select class="lineup-slot-select" data-slot="${sIdx}" style="width:100%;background:#0f172a;color:#fde047;border:1px solid #facc15;border-radius:6px;padding:5px;font-family:var(--font-display);font-size:0.76rem;">
              <option value="">-- Select Helldiver Hero --</option>
              ${options}
            </select>
            <div style="font-size:0.74rem;color:#cbd5e1;margin-top:5px;">
              ${h ? `❤️ HP: <strong>${h.maxHp}</strong> · ⚔️ ATK: <strong>${h.atk}</strong> · Stats(100): 🔥${h.stats100.firepower} 🛡️${h.stats100.vitality} ⚡${h.stats100.agility} 🧠${h.stats100.tactics}` : '⚠️ Slot Empty — Assign a Hero!'}
            </div>
          </div>
        `;
      }).join('');

      lineupGrid.querySelectorAll('.lineup-slot-select').forEach((sel) => {
        sel.addEventListener('change', () => {
          const slot = parseInt(sel.getAttribute('data-slot'), 10);
          const chosenId = sel.value || null;
          const otherIdx = this.capybaraLineup.indexOf(chosenId);
          if (chosenId && otherIdx !== -1 && otherIdx !== slot) {
            this.capybaraLineup[otherIdx] = this.capybaraLineup[slot];
          }
          this.capybaraLineup[slot] = chosenId;
          this.saveGame();
          this.renderTrainingRoomModal();
        });
      });

      rosterGrid.innerHTML = this.helldiverRoster.map((h) => {
        const cls = (CFG.HELLDIVER_CLASSES || []).find((c) => c.id === h.classId) || CFG.HELLDIVER_CLASSES[0];
        const c1 = this.getHeroTrainCost(h, 1);
        const c5 = this.getHeroTrainCost(h, 5);
        const fullGear = h.equip?.weapon && h.equip?.armor && h.equip?.pack && h.equip?.mech;
        const skillBadges = (cls.skills || []).map((sk) => {
          const unlocked = h.level >= sk.reqLvl;
          return `<div style="font-size:0.71rem;color:${unlocked ? '#4ade80' : '#64748b'};">${unlocked ? '✅' : `🔒Lv.${sk.reqLvl}`} ${sk.icon} <strong>${sk.name}</strong>: ${sk.desc}</div>`;
        }).join('');

        return `
          <div class="upgrade-card" style="border-color:${cls.color};">
            <div class="upg-top">
              <span class="upg-title" style="color:${cls.color};">${cls.icon} ${h.name} — Lv.${h.level}/100</span>
              <span class="version-pill">${cls.name}</span>
            </div>
            <div style="font-size:0.74rem;color:#fde047;margin:3px 0;">
              ❤️ HP: ${h.maxHp} · ⚔️ ATK: ${h.atk} · 🔥Firepower: ${h.stats100.firepower}/100 · 🛡️Vitality: ${h.stats100.vitality}/100 · ⚡Agility: ${h.stats100.agility}/100 · 🧠Tactics: ${h.stats100.tactics}/100
            </div>
            <div style="background:rgba(9,13,20,0.85);padding:6px;border-radius:6px;margin:4px 0;">
              ${skillBadges}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">
              <button class="buy-btn btn-train-1" data-hero="${h.id}" ${h.level >= 100 || this.cash < c1.cashCost || this.samples.common < c1.sampleCost ? 'disabled' : ''}>
                ${h.level >= 100 ? 'MAX Lv.100' : `⬆️ +1 Lv ($${c1.cashCost}${c1.sampleCost ? ` + 🟢${c1.sampleCost}` : ''})`}
              </button>
              <button class="buy-btn medal-btn btn-train-5" data-hero="${h.id}" ${h.level >= 100 || this.cash < c5.cashCost || this.samples.common < c5.sampleCost ? 'disabled' : ''}>
                ${h.level >= 100 ? 'MAX' : `⬆️ +5 Lv ($${c5.cashCost}${c5.sampleCost ? ` + 🟢${c5.sampleCost}` : ''})`}
              </button>
              <button class="hud-btn btn-equip-hero" data-hero="${h.id}" ${fullGear || this.cash < 120 ? 'disabled' : ''} style="border-color:#38bdf8;color:#7dd3fc;">
                ${fullGear ? '🛡️ 4-Slot Gear Equipped' : '🛡️ Equip 4-Slot Gear ($120)'}
              </button>
            </div>
          </div>
        `;
      }).join('');

      rosterGrid.querySelectorAll('.btn-train-1').forEach((b) => {
        b.addEventListener('click', () => this.trainHelldiverHero(b.getAttribute('data-hero'), 1));
      });
      rosterGrid.querySelectorAll('.btn-train-5').forEach((b) => {
        b.addEventListener('click', () => this.trainHelldiverHero(b.getAttribute('data-hero'), 5));
      });
      rosterGrid.querySelectorAll('.btn-equip-hero').forEach((b) => {
        b.addEventListener('click', () => this.equipHelldiverHeroAllGear(b.getAttribute('data-hero')));
      });

      recruitGrid.innerHTML = (CFG.HELLDIVER_CLASSES || []).map((cls) => `
        <div class="upgrade-card" style="border-color:${cls.color};">
          <div class="upg-top">
            <span class="upg-title" style="color:${cls.color};">${cls.icon} ${cls.name} (${cls.zhName})</span>
            <span class="version-pill">Max Lv.100</span>
          </div>
          <p class="upg-desc">${cls.desc}</p>
          <div style="font-size:0.72rem;color:#86efac;margin-bottom:6px;">
            Lv.100 Caps: 🔥${cls.baseStats100.firepower} · 🛡️${cls.baseStats100.vitality} · ⚡${cls.baseStats100.agility} · 🧠${cls.baseStats100.tactics}
          </div>
          <button class="buy-btn btn-hire-class" data-cls="${cls.id}" ${this.cash < cls.hireCost ? 'disabled' : ''}>
            ➕ Hire ${cls.name} ($${cls.hireCost})
          </button>
        </div>
      `).join('');

      recruitGrid.querySelectorAll('.btn-hire-class').forEach((b) => {
        b.addEventListener('click', () => this.hireHelldiverHero(b.getAttribute('data-cls')));
      });

      // Sub-Page Visibility Routing (`overview` ➔ `roster` | `recruit`)
      if (page === 'overview') {
        if (lineupTitle) lineupTitle.style.display = 'block';
        lineupGrid.style.display = 'grid';
        if (rosterTitle) rosterTitle.style.display = 'none';
        rosterGrid.style.display = 'none';
        if (recruitTitle) recruitTitle.style.display = 'none';
        recruitGrid.style.display = 'none';

        sumEl.innerHTML = `
          <div style="width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
              <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.94rem;">
                🏋️ HELLDIVER TRAINING ROOM (3 ACTIVE + 1 SPARE SQUAD · ${this.helldiverRoster.length} HEROES)
              </div>
              <div style="font-family:var(--font-display);font-weight:900;color:#4ade80;font-size:0.88rem;">
                💵 $${Math.floor(this.cash)} | 🟢${this.samples.common} 🟠${this.samples.rare} 🟣${this.samples.superRare}
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-top:6px;">
              <button class="buy-btn" id="btn-train-goto-roster" style="padding:11px;font-size:0.86rem;">
                🏋️ Next Page: Train Heroes (Lv.1–100, Skills &amp; 4-Slot Gear) ➔
              </button>
              <button class="buy-btn medal-btn" id="btn-train-goto-recruit" style="padding:11px;font-size:0.86rem;">
                ➕ Next Page: Recruit New Helldivers (6 Classes) ➔
              </button>
            </div>
          </div>
        `;
        document.getElementById('btn-train-goto-roster')?.addEventListener('click', () => {
          this.trainingModalPage = 'roster';
          this.renderTrainingRoomModal();
        });
        document.getElementById('btn-train-goto-recruit')?.addEventListener('click', () => {
          this.trainingModalPage = 'recruit';
          this.renderTrainingRoomModal();
        });
      } else if (page === 'roster') {
        if (lineupTitle) lineupTitle.style.display = 'none';
        lineupGrid.style.display = 'none';
        if (rosterTitle) rosterTitle.style.display = 'block';
        rosterGrid.style.display = 'grid';
        if (recruitTitle) recruitTitle.style.display = 'none';
        recruitGrid.style.display = 'none';

        sumEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
            <button class="hud-btn" id="btn-train-back-overview" style="border-color:#facc15;color:#fde047;padding:7px 14px;">
              ⬅️ Back to 3+1 Squad Lineup
            </button>
            <div style="font-family:var(--font-display);font-weight:900;color:#fde047;font-size:0.9rem;">
              🎖️ TRAIN HEROES Lv.1–100 &amp; EQUIP GEAR · 💵 $${Math.floor(this.cash)} | 🟢${this.samples.common}
            </div>
            <button class="hud-btn" id="btn-train-switch-recruit" style="border-color:#38bdf8;color:#7dd3fc;">
              ➕ Go to Recruit Classes ➔
            </button>
          </div>
        `;
        document.getElementById('btn-train-back-overview')?.addEventListener('click', () => {
          this.trainingModalPage = 'overview';
          this.renderTrainingRoomModal();
        });
        document.getElementById('btn-train-switch-recruit')?.addEventListener('click', () => {
          this.trainingModalPage = 'recruit';
          this.renderTrainingRoomModal();
        });
      } else {
        if (lineupTitle) lineupTitle.style.display = 'none';
        lineupGrid.style.display = 'none';
        if (rosterTitle) rosterTitle.style.display = 'none';
        rosterGrid.style.display = 'none';
        if (recruitTitle) recruitTitle.style.display = 'block';
        recruitGrid.style.display = 'grid';

        sumEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
            <button class="hud-btn" id="btn-train-back-overview" style="border-color:#facc15;color:#fde047;padding:7px 14px;">
              ⬅️ Back to 3+1 Squad Lineup
            </button>
            <div style="font-family:var(--font-display);font-weight:900;color:#38bdf8;font-size:0.9rem;">
              ➕ RECRUIT NEW HELLDIVER ARCHETYPES (${this.helldiverRoster.length} IN ROSTER) · 💵 $${Math.floor(this.cash)}
            </div>
            <button class="hud-btn" id="btn-train-switch-roster" style="border-color:#4ade80;color:#86efac;">
              🏋️ Train Heroes Lv.1–100 ➔
            </button>
          </div>
        `;
        document.getElementById('btn-train-back-overview')?.addEventListener('click', () => {
          this.trainingModalPage = 'overview';
          this.renderTrainingRoomModal();
        });
        document.getElementById('btn-train-switch-roster')?.addEventListener('click', () => {
          this.trainingModalPage = 'roster';
          this.renderTrainingRoomModal();
        });
      }
    }

    // ========================================================================
    // NEW IN v0.0.12: CAPYBARA GO! ROGUELIKE PATH ATTACK ENGINE (2 PAGES)
    // - Page 1: 🧬 Sample Search (Diff 1-10: 1-3 Common 🟢, 4-6 Rare 🟠, 7-10 Super Rare 🟣)
    // - Page 2: 🚩 Planet Capture (Select adjacent planet on Space Map, 10 Waves,
    //           Retreat after each wave, True Permadeath on Hero Death, 3 Active + 1 Spare!)
    // ========================================================================
    buildCapybaraRunSquad() {
      this.initHelldiverRoster();
      // Auto-populate any missing lineup slots from available roster
      for (let s = 0; s < 4; s++) {
        if (!this.capybaraLineup[s] || !this.helldiverRoster.some((h) => h.id === this.capybaraLineup[s])) {
          const unused = this.helldiverRoster.find((h) => !this.capybaraLineup.includes(h.id));
          this.capybaraLineup[s] = unused ? unused.id : null;
        }
      }

      const shopMult = this.getShopWarPowerMult();
      const makeCombatant = (heroId, slotIndex) => {
        const h = this.helldiverRoster.find((x) => x.id === heroId);
        if (!h) return null;
        this.recalcHeroStats(h);
        const cls = (CFG.HELLDIVER_CLASSES || []).find((c) => c.id === h.classId) || CFG.HELLDIVER_CLASSES[0];
        const maxHp = Math.round(h.maxHp * shopMult);
        return {
          ...h,
          slotIndex,
          maxHp,
          hp: maxHp,
          atk: Math.round(h.atk * shopMult),
          shield: h.classId === 'cls_bulwark' ? Math.round(maxHp * 0.25) : 0,
          miracleReady: h.classId === 'cls_medic' && h.level >= 60,
          dead: false,
          fireCooldown: 0.2,
          skillTimers: [1.5, 3.0, 5.0],
          skills: cls.skills || [],
          x: -560 + (slotIndex === 0 ? 110 : 0),
          z: -900 + (slotIndex === 1 ? -140 : (slotIndex === 2 ? 140 : 0))
        };
      };

      const activeHeroes = [0, 1, 2].map((idx) => makeCombatant(this.capybaraLineup[idx], idx)).filter(Boolean);
      const spareHero = makeCombatant(this.capybaraLineup[3], 3);
      return { activeHeroes, spareHero };
    }

    launchPreparedWarRun(options) {
      const availableIds = window.WarCasualtyEngine?.availableLineup(this) || this.capybaraLineup;
      if (availableIds.filter(Boolean).length < 3) return false;
      this.createWarFoundationRun(options);
      if (!this.warRun) return false;
      this.warRun.supplies = options.supplies || {};
      this.warRun.contractMode = options.contractMode || 'standard';
      this.warRun.rewardMult = Number(options.rewardMult || 1);
      this.warRun.supplyEffects = options.supplyEffects || {
        hpMult: 1, attackMult: 1, startingEnergy: 0,
        damageReduction: 0, enemyAttackMult: 1, startingShield: 0
      };
      if (this.viewMode !== 'war') this.setViewMode('war', options.mode);
      this.saveGame();
      window.WarUI?.show(this);
      return true;
    }

    startSampleSearchRun(diff = null, legacyCombat = false) {
      const chosenDiff = Math.max(1, Math.min(10, parseInt(diff || this.sampleSearchDiff || 1, 10)));
      this.sampleSearchDiff = chosenDiff;
      this.warSubPage = 'sample';

      const { activeHeroes, spareHero } = this.buildCapybaraRunSquad();
      const availableIds = window.WarCasualtyEngine?.availableLineup(this) || this.capybaraLineup;
      if (activeHeroes.length === 0) {
        this.spawnFloatingText(this.player.x, this.player.z - 45, '⚠️ NEED 3 AVAILABLE HELLDIVERS! RECOVER INJURED HEROES OR CHANGE LINEUP.', '#ef4444');
        this.renderTrainingRoomModal();
        document.getElementById('modal-training-room')?.classList.add('open');
        return;
      }

      const faction = chosenDiff % 2 === 1 ? 'bugs' : 'autobots';
      if (!legacyCombat) {
        window.WarSupplyUI?.open(this, {
          mode: 'sample', difficulty: chosenDiff, faction, seed: Date.now()
        }, (options) => this.launchPreparedWarRun(options));
        return;
      }
      this.capybaraRun = {
        active: true,
        mode: 'sample',
        difficulty: chosenDiff,
        faction,
        planetId: null,
        planetName: `Sample Sector Diff-${chosenDiff}`,
        wave: 1,
        maxWaves: 5,
        phase: 'combat',
        activeHeroes,
        spareHero,
        spareUsed: false,
        sentries: [],
        lootBag: { cash: 0, common: 0, rare: 0, superRare: 0 }
      };

      const retreatBar = document.getElementById('capybara-wave-retreat-bar');
      if (retreatBar) retreatBar.style.display = 'none';
      if (this.viewMode !== 'war') this.setViewMode('war', 'sample');
      this.spawnCapybaraWaveEnemies();
      this.saveGame();
      this.updateHUD();
    }

    startPlanetCaptureRun(planetId = null, legacyCombat = false) {
      this.initSpaceMapState();
      let targetId = planetId || this.targetCapturePlanetId;
      let pCfg = (CFG.SPACE_MAP_PLANETS || []).find((p) => p.id === targetId && !p.isHome && !this.spacePlanets[p.id]?.owned);
      if (!pCfg || !this.isPlanetAdjacentToOwned(pCfg.id)) {
        // Pick first available adjacent enemy planet
        pCfg = (CFG.SPACE_MAP_PLANETS || []).find((p) => !p.isHome && !this.spacePlanets[p.id]?.owned && this.isPlanetAdjacentToOwned(p.id));
      }
      if (!pCfg) {
        this.spawnFloatingText(this.player.x, this.player.z - 45, '🎉 ALL ADJACENT PLANETS CAPTURED! CHECK SPACE MAP!', '#4ade80');
        this.renderSpaceMapModal();
        document.getElementById('modal-space-map')?.classList.add('open');
        return;
      }

      this.targetCapturePlanetId = pCfg.id;
      this.warSubPage = 'capture';

      const { activeHeroes, spareHero } = this.buildCapybaraRunSquad();
      const availableIds = window.WarCasualtyEngine?.availableLineup(this) || this.capybaraLineup;
      if (activeHeroes.length === 0) {
        this.spawnFloatingText(this.player.x, this.player.z - 45, '⚠️ NEED 3 AVAILABLE HELLDIVERS! RECOVER INJURED HEROES OR CHANGE LINEUP.', '#ef4444');
        this.renderTrainingRoomModal();
        document.getElementById('modal-training-room')?.classList.add('open');
        return;
      }

      if (!legacyCombat) {
        window.WarSupplyUI?.open(this, {
          mode: 'capture', difficulty: pCfg.difficulty, faction: pCfg.faction,
          planetId: pCfg.id, planetName: pCfg.name, seed: Date.now()
        }, (options) => this.launchPreparedWarRun(options));
        return;
      }
      this.capybaraRun = {
        active: true,
        mode: 'capture',
        difficulty: pCfg.difficulty,
        faction: pCfg.faction, // Strictly 'bugs' OR 'autobots'
        planetId: pCfg.id,
        planetName: pCfg.name,
        wave: 1,
        maxWaves: 10, // At least 10 Waves required for Planet Capture!
        phase: 'combat',
        activeHeroes,
        spareHero,
        spareUsed: false,
        sentries: [],
        lootBag: { cash: 0, common: 0, rare: 0, superRare: 0 }
      };

      const retreatBar = document.getElementById('capybara-wave-retreat-bar');
      if (retreatBar) retreatBar.style.display = 'none';
      if (this.viewMode !== 'war') this.setViewMode('war', 'capture');
      this.spawnCapybaraWaveEnemies();
      this.saveGame();
      this.updateHUD();
    }

    startWarNodeCombat() {
      if (!this.warRun || !this.warRun.active) return;
      this.warRun.phase = 'combat';
      window.WarCombatUI?.start(this);
    }

    resumeWarExpeditionAfterCombat() {
      if (!this.warRun || !this.warRun.active) return false;
      this.capybaraRun = null;
      this.enemies = [];
      this.warRun.phase = 'reward';
      window.WarUI?.showReward(this);
      this.saveGame();
      return true;
    }

    spawnCapybaraWaveEnemies() {
      const run = this.capybaraRun;
      if (!run) return;
      this.enemies = [];
      const diff = run.difficulty || 1;
      const wave = run.wave || 1;
      const isBugs = run.faction === 'bugs';

      // Harder difficulty scaling as requested by user!
      const count = 6 + wave * 2 + Math.floor(diff * 1.4);
      const hpScale = (1 + (diff - 1) * 0.85) * (1 + (wave - 1) * 0.32);
      const dmgScale = (1 + (diff - 1) * 0.55) * (1 + (wave - 1) * 0.22);

      const bugTypes = ['hunter', 'bug', 'spewer', 'titan'];
      const botTypes = ['trooper', 'devastator', 'hulk', 'strider'];
      const pool = isBugs ? bugTypes : botTypes;

      for (let i = 0; i < count; i++) {
        let typeIdx = 0;
        if (i === count - 1 && (wave % 3 === 0 || wave === run.maxWaves || diff >= 6)) {
          typeIdx = 3; // Apex Boss (Bile Titan or Factory Strider)
        } else if (i % 4 === 0 && (wave >= 2 || diff >= 3)) {
          typeIdx = 2; // Elite (Bile Spewer or Hulk)
        } else if (i % 2 === 1) {
          typeIdx = 1;
        }
        const eType = pool[typeIdx];
        const baseHp = typeIdx === 3 ? 620 : (typeIdx === 2 ? 310 : (typeIdx === 1 ? 175 : 115));
        const baseDmg = typeIdx === 3 ? 48 : (typeIdx === 2 ? 28 : (typeIdx === 1 ? 19 : 13));
        const hp = Math.round(baseHp * hpScale);

        this.enemies.push({
          id: Math.random(),
          type: eType,
          x: 240 + i * 95 + (Math.random() - 0.5) * 40,
          z: -900 + ((i % 3) - 1) * 130 + (Math.random() - 0.5) * 30,
          hp,
          maxHp: hp,
          dmg: Math.round(baseDmg * dmgScale),
          speed: typeIdx === 0 ? 145 : (typeIdx === 3 ? 88 : 112),
          attackCooldown: 0.5
        });
      }
    }

    updateCapybaraRoguelikeWar(dt) {
      const run = this.capybaraRun;
      if (!run || !run.active) return;

      if (run.phase === 'decision') {
        // Waiting for player to click Continue Next Wave or Retreat after wave
        return;
      }

      const aliveHeroes = (run.activeHeroes || []).filter((h) => h && !h.dead && h.hp > 0);
      if (aliveHeroes.length === 0) {
        this.handleCapybaraSquadWipeout();
        return;
      }

      // 1. Update Active Helldiver Heroes (Basic Attacks + Unlocked Lv.1/25/60 Class Skills!)
      const arcStacks = this.roguelikePerks?.rk_arc_chain || 0;
      const stimStacks = this.roguelikePerks?.rk_viper_stims || 0;

      for (const h of aliveHeroes) {
        h.fireCooldown = Math.max(0, (h.fireCooldown || 0) - dt * (1 + stimStacks * 0.20));

        // Find closest enemy on the path
        let target = null;
        let bestDist = 9999;
        for (const e of this.enemies) {
          if (e.hp <= 0) continue;
          const d = Math.hypot(e.x - h.x, e.z - h.z);
          if (d < bestDist) {
            bestDist = d;
            target = e;
          }
        }

        if (target && h.fireCooldown <= 0) {
          h.fireCooldown = h.fireRate || 0.30;
          const isCrit = Math.random() < (0.12 + (h.stats100?.agility || 50) * 0.0035);
          const dmg = Math.round(h.atk * (isCrit ? 2.1 : 1.0));
          target.hp -= dmg;
          this.tracers.push({
            sx: h.x + 18,
            sz: h.z - 10,
            tx: target.x,
            tz: target.z,
            color: isCrit ? '#facc15' : (h.color || '#38bdf8'),
            width: isCrit ? 5 : 3,
            t: 0,
            duration: 0.09
          });
          this.audio.playLaser();

          // Arc Chain Perk
          if (arcStacks > 0 && this.enemies.length > 1) {
            for (let c = 0; c < Math.min(2, this.enemies.length); c++) {
              const other = this.enemies[c];
              if (other !== target && other.hp > 0) {
                other.hp -= Math.round(dmg * 0.45 * arcStacks);
              }
            }
          }
        }

        // Cast Unlocked Class Skills (Lv.1, Lv.25, Lv.60)
        for (let sIdx = 0; sIdx < (h.skills || []).length; sIdx++) {
          const sk = h.skills[sIdx];
          if (h.level < sk.reqLvl || sk.cd <= 0) continue;
          h.skillTimers[sIdx] = (h.skillTimers[sIdx] || sk.cd) - dt;
          if (h.skillTimers[sIdx] <= 0 && this.enemies.length > 0) {
            h.skillTimers[sIdx] = Math.max(2.2, sk.cd * (1 - (h.stats100?.tactics || 50) * 0.0035));
            this.triggerHeroClassSkill(h, sk);
          }
        }
      }

      // 2. Update Deployed Engineer Sentries
      for (const s of (run.sentries || [])) {
        s.cd = (s.cd || 0) - dt;
        if (s.cd <= 0 && this.enemies.length > 0) {
          s.cd = 0.28;
          const t = this.enemies[0];
          t.hp -= s.dmg;
          this.tracers.push({ sx: s.x, sz: s.z - 10, tx: t.x, tz: t.z, color: '#a855f7', width: 3, t: 0, duration: 0.08 });
        }
      }

      // Clean up killed enemies & add wave loot
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        if (this.enemies[i].hp <= 0) {
          const deadE = this.enemies[i];
          this.enemies.splice(i, 1);
          this.totalKills++;
          this.lifetimeKills++;
          run.lootBag.cash += Math.round(18 + run.difficulty * 8);
          this.explosions.push({ x: deadE.x, z: deadE.z, maxR: 36, t: 0, duration: 0.22 });
        }
      }

      // 3. Advance Enemies Leftward toward the 3 Active Helldivers!
      for (const e of this.enemies) {
        // Pick closest living active hero
        let closestHero = aliveHeroes[0];
        let minD = 9999;
        for (const h of aliveHeroes) {
          const d = Math.hypot(e.x - h.x, e.z - h.z);
          if (d < minD) {
            minD = d;
            closestHero = h;
          }
        }
        if (!closestHero) continue;

        if (minD > 58) {
          const dx = closestHero.x - e.x;
          const dz = closestHero.z - e.z;
          e.x += (dx / minD) * e.speed * dt;
          e.z += (dz / minD) * e.speed * dt;
        } else {
          e.attackCooldown = (e.attackCooldown || 0) - dt;
          if (e.attackCooldown <= 0) {
            e.attackCooldown = 0.95;
            // Check Dodge & Bulwark Riot Shield
            if (closestHero.classId === 'cls_sniper' && closestHero.level >= 25 && Math.random() < 0.30) {
              this.spawnFloatingText(closestHero.x, closestHero.z - 40, '💨 DODGED!', '#38bdf8');
              continue;
            }
            let incomingDmg = e.dmg;
            if (closestHero.classId === 'cls_bulwark') incomingDmg = Math.round(incomingDmg * 0.65);

            if ((closestHero.shield || 0) > 0) {
              const abs = Math.min(closestHero.shield, incomingDmg);
              closestHero.shield -= abs;
              incomingDmg -= abs;
            }
            closestHero.hp -= incomingDmg;
            this.spawnFloatingText(closestHero.x, closestHero.z - 34, `-${incomingDmg} 💥`, '#ef4444');

            // Check Hero Death & True Permadeath + Slot #4 Spare Reinforcement!
            if (closestHero.hp <= 0) {
              this.handleCapybaraHeroDeath(closestHero);
            }
          }
        }
      }

      // 4. Check if Current Wave is Cleared!
      if (this.enemies.length === 0) {
        this.completeCapybaraWave();
      }
    }

    triggerHeroClassSkill(hero, sk) {
      const run = this.capybaraRun;
      if (!run) return;
      this.spawnFloatingText(hero.x, hero.z - 58, `${sk.icon} ${sk.name.split('(')[0].trim()}!`, hero.color || '#facc15');

      if (sk.id === 'sk_stim' || sk.id === 'sk_infusion' || sk.id === 'sk_rally') {
        for (const h of (run.activeHeroes || [])) {
          if (h && !h.dead) {
            const heal = Math.round(h.maxHp * (sk.id === 'sk_stim' ? 0.24 : 0.18));
            h.hp = Math.min(h.maxHp, h.hp + heal);
          }
        }
        return;
      }
      if (sk.id === 'sk_dome') {
        for (const h of (run.activeHeroes || [])) {
          if (h && !h.dead) h.shield = (h.shield || 0) + Math.round(h.maxHp * 0.30);
        }
        return;
      }
      if (sk.id === 'sk_sentry') {
        if ((run.sentries || []).length < 3) {
          run.sentries.push({ x: hero.x + 85, z: hero.z + (Math.random() - 0.5) * 90, dmg: Math.round(hero.atk * 0.65), cd: 0.2 });
        }
        return;
      }

      // Offensive AoE / Single-Target Skills
      const mult = (sk.id === 'sk_500kg' || sk.id === 'sk_railcannon' || sk.id === 'sk_hellbomb' || sk.id === 'sk_emancipator') ? 4.8 : 2.4;
      const skillDmg = Math.round(hero.atk * mult);
      for (const e of this.enemies) {
        e.hp -= skillDmg;
        this.explosions.push({ x: e.x, z: e.z, maxR: 52, t: 0, duration: 0.26 });
      }
      this.audio.playStratagem();
    }

    handleCapybaraHeroDeath(fallenHero) {
      const run = this.capybaraRun;
      if (!run) return;

      // Check if Bio-Medic's Lv.60 Miracle Shield can save them once!
      const medic = (run.activeHeroes || []).find((h) => h && !h.dead && h.miracleReady);
      if (medic) {
        medic.miracleReady = false;
        fallenHero.hp = Math.round(fallenHero.maxHp * 0.50);
        this.spawnFloatingText(fallenHero.x, fallenHero.z - 60, `✨ MIRACLE DEFIBRILLATOR SAVED ${fallenHero.name.toUpperCase()}!`, '#4ade80');
        return;
      }

      // TRUE PERMADEATH: Remove fallen Helldiver permanently from helldiverRoster & capybaraLineup!
      fallenHero.dead = true;
      fallenHero.hp = 0;
      this.helldiverRoster = (this.helldiverRoster || []).filter((h) => h.id !== fallenHero.id);
      this.capybaraLineup = (this.capybaraLineup || []).map((id) => (id === fallenHero.id ? null : id));

      this.world.triggerCameraShake(14, 0.4);
      this.spawnFloatingText(
        fallenHero.x,
        fallenHero.z - 65,
        `💀 ${fallenHero.name.toUpperCase()} KIA (PERMADEATH — HIRE NEW IN TRAINING ROOM)!`,
        '#ef4444'
      );

      // Immediately check Slot #4 Orbital Spare Reinforcement!
      if (run.spareHero && !run.spareHero.dead && !run.spareUsed) {
        run.spareUsed = true;
        const sp = run.spareHero;
        sp.x = fallenHero.x;
        sp.z = fallenHero.z;
        const idx = run.activeHeroes.indexOf(fallenHero);
        if (idx !== -1) {
          run.activeHeroes[idx] = sp;
        } else {
          run.activeHeroes.push(sp);
        }
        run.spareHero = null;

        // Hellpod kinetic slam damage on drop
        for (const e of this.enemies) {
          e.hp -= 380;
          this.explosions.push({ x: e.x, z: e.z, maxR: 65, t: 0, duration: 0.35 });
        }
        this.audio.playStratagem();
        this.spawnFloatingText(sp.x, sp.z - 85, `🚀 SPARE REINFORCEMENT DROPPED: ${sp.name.toUpperCase()} (Lv.${sp.level})!`, '#facc15');
      }
      this.saveGame();
      this.updateHUD();
    }

    completeCapybaraWave() {
      const run = this.capybaraRun;
      if (!run) return;

      const diff = run.difficulty || 1;
      const diffCfg = (CFG.SAMPLE_DIFFICULTIES || []).find((d) => d.diff === diff) || CFG.SAMPLE_DIFFICULTIES[0];

      // Add Wave Sample & Cash Rewards into run.lootBag
      // Diff 1-3: Normal (🟢) only | Diff 4-6: Normal + Rare (🟠) | Diff 7-10: Normal + Rare + Super Rare (🟣)!
      const addCommon = Math.max(1, Math.round((diffCfg.common[0] + diffCfg.common[1]) * 0.25));
      const addRare = diff >= 4 ? Math.max(1, Math.round((diffCfg.rare[0] + diffCfg.rare[1]) * 0.25)) : 0;
      const addSuper = diff >= 7 ? Math.max(1, Math.round((diffCfg.superRare[0] + diffCfg.superRare[1]) * 0.30)) : 0;

      run.lootBag.common += addCommon;
      run.lootBag.rare += addRare;
      run.lootBag.superRare += addSuper;
      run.lootBag.cash += Math.round(diffCfg.cashReward * 0.28);

      // Check if Final Wave (Wave 10/10 for Capture, Wave 5/5 for Sample Search) is cleared!
      if (run.wave >= run.maxWaves) {
        this.finishCapybaraExpeditionVictory();
        return;
      }

      // Pause after wave for the Post-Wave Retreat vs. Continue Decision!
      run.phase = 'decision';
      const retreatBar = document.getElementById('capybara-wave-retreat-bar');
      const titleEl = document.getElementById('retreat-bar-title');
      const descEl = document.getElementById('retreat-bar-desc');
      const aliveCount = (run.activeHeroes || []).filter((h) => h && !h.dead).length;
      const hasSpare = run.spareHero && !run.spareHero.dead && !run.spareUsed;

      if (titleEl) {
        titleEl.textContent = `🚁 WAVE ${run.wave}/${run.maxWaves} CLEARED — CONTINUE TO WAVE ${run.wave + 1} OR RETREAT?`;
      }
      if (descEl) {
        descEl.innerHTML = `
          Surviving Squad: <strong>${aliveCount}/3 Active Helldivers + ${hasSpare ? '1 Spare Ready' : '0 Spare'}</strong> ·
          Current Loot Bag: <strong>💵 $${run.lootBag.cash} · 🟢 ${run.lootBag.common} · 🟠 ${run.lootBag.rare} · 🟣 ${run.lootBag.superRare}</strong>.<br/>
          If you <strong>🚁 Retreat Now</strong>, all surviving Helldivers return safely with <strong>65% of collected resources</strong>. If you continue and a Helldiver dies, they <strong>die permanently</strong>!
        `;
      }
      if (retreatBar) retreatBar.style.display = 'block';
      this.audio.playUnlock();
      this.updateHUD();
    }

    continueNextCapybaraWave() {
      const run = this.capybaraRun;
      if (!run || !run.active) return;
      const retreatBar = document.getElementById('capybara-wave-retreat-bar');
      if (retreatBar) retreatBar.style.display = 'none';

      run.wave++;
      run.phase = 'combat';
      this.triggerRoguelikePerkDraft();
      this.spawnCapybaraWaveEnemies();
      this.audio.playStratagem();
      this.updateHUD();
    }

    retreatFromCapybaraRun() {
      const run = this.capybaraRun;
      if (!run || !run.active) return;
      const retreatBar = document.getElementById('capybara-wave-retreat-bar');
      if (retreatBar) retreatBar.style.display = 'none';

      // Retreat keeps 65% of collected resources & saves all surviving Helldivers!
      const keepRatio = 0.65;
      const gotCash = Math.round((run.lootBag.cash || 0) * keepRatio);
      const gotCommon = Math.floor((run.lootBag.common || 0) * keepRatio);
      const gotRare = Math.floor((run.lootBag.rare || 0) * keepRatio);
      const gotSuper = Math.floor((run.lootBag.superRare || 0) * keepRatio);

      this.cash += gotCash;
      this.samples.common = (this.samples.common || 0) + gotCommon;
      this.samples.rare = (this.samples.rare || 0) + gotRare;
      this.samples.superRare = (this.samples.superRare || 0) + gotSuper;
      this.superSamples = this.samples.superRare;

      run.active = false;
      if (this.warRun) this.warRun.active = false;
      this.enemies = [];
      this.setViewMode('shop');
      this.audio.playPickup();
      this.spawnFloatingText(
        this.player.x,
        this.player.z - 55,
        `🚁 RETREATED SAFELY! KEPT +$${gotCash} · +🟢${gotCommon} +🟠${gotRare} +🟣${gotSuper}!`,
        '#fde047'
      );
      this.saveGame();
      this.updateHUD();
    }

    finishCapybaraExpeditionVictory() {
      const run = this.capybaraRun;
      if (!run) return;
      const retreatBar = document.getElementById('capybara-wave-retreat-bar');
      if (retreatBar) retreatBar.style.display = 'none';

      const gotCash = run.lootBag.cash || 0;
      const gotCommon = run.lootBag.common || 0;
      const gotRare = run.lootBag.rare || 0;
      const gotSuper = run.lootBag.superRare || 0;

      this.cash += gotCash;
      this.medals += Math.max(2, Math.ceil(run.difficulty * 0.8));
      this.samples.common = (this.samples.common || 0) + gotCommon;
      this.samples.rare = (this.samples.rare || 0) + gotRare;
      this.samples.superRare = (this.samples.superRare || 0) + gotSuper;
      this.superSamples = this.samples.superRare;

      if (this.warRun?.active) {
        // Legacy combat already credited its encounter rewards above; do not duplicate them in expedition loot.
        this.resumeWarExpeditionAfterCombat();
        this.updateHUD();
        return;
      }

      if (run.mode === 'capture' && run.planetId && this.spacePlanets[run.planetId]) {
        const ps = this.spacePlanets[run.planetId];
        ps.owned = true;
        ps.mineLvl = Math.max(1, ps.mineLvl || 1);
        ps.storageLvl = Math.max(1, ps.storageLvl || 1);
        ps.storedOil = 10;
        ps.storedIron = 10;
        const pCfg = (CFG.SPACE_MAP_PLANETS || []).find((x) => x.id === run.planetId);
        ps.storedSand = pCfg?.sandRatio > 0 ? 6 : 0;
        ps.storedBile = pCfg?.bileRatio > 0 ? 5 : 0;
        ps.storedTitanium = pCfg?.titaniumRatio > 0 ? 6 : 0;
        ps.storedQcore = pCfg?.qcoreRatio > 0 ? 5 : 0;
        ps.buildings = { def_wall: 1, def_flak: 1, def_rail: 0 };
        ps.garrison = { g_seaf_militia: 3, g_seaf_heavy: 1, g_helldiver_vet: 1, g_patriot_mech: 0 };
        this.travianBattleLogs.unshift(`🚩 [VICTORY] Liberated ${run.planetName} after clearing all 10 Waves! Transport Ships are now hauling its ore to HallTown!`);
      }

      run.active = false;
      if (this.warRun) this.warRun.active = false;
      this.enemies = [];
      this.setViewMode('shop');
      this.audio.playUnlock();
      this.spawnFloatingText(
        this.player.x,
        this.player.z - 65,
        run.mode === 'capture'
          ? `🚩 PLANET CAPTURED: ${run.planetName.toUpperCase()}! +$${gotCash} · +🟢${gotCommon} 🟠${gotRare} 🟣${gotSuper}!`
          : `🧬 SAMPLE SEARCH COMPLETE! +$${gotCash} · +🟢${gotCommon} 🟠${gotRare} 🟣${gotSuper}!`,
        '#4ade80'
      );
      this.saveGame();
      this.updateHUD();
    }

    handleCapybaraSquadWipeout() {
      const run = this.capybaraRun;
      if (!run) return;
      const retreatBar = document.getElementById('capybara-wave-retreat-bar');
      if (retreatBar) retreatBar.style.display = 'none';

      run.active = false;
      if (this.warRun) this.warRun.active = false;
      this.enemies = [];
      this.setViewMode('shop');
      this.spawnFloatingText(
        this.player.x,
        this.player.z - 65,
        `💀 SQUAD WIPED OUT ON WAVE ${run.wave}! HIRE NEW HELLDIVERS IN THE TRAINING ROOM!`,
        '#ef4444'
      );
      this.saveGame();
      this.renderTrainingRoomModal();
      document.getElementById('modal-training-room')?.classList.add('open');
      this.updateHUD();
    }

    getSlotStorageKey(slotNum = null) {
      const s = Math.max(1, Math.min(3, parseInt(slotNum || this.currentSaveSlot || 1, 10)));
      return `${CFG.STORAGE_KEY}_slot_${s}`;
    }

    serializeState() {
      return {
        version: CFG.VERSION,
        savedAt: new Date().toLocaleTimeString(),
        saveSlot: this.currentSaveSlot || 1,
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
        cloneRoomLevel: this.cloneRoomLevel,
        hiredClonesCount: this.hiredClonesCount,
        workerJobs: this.workerJobs,
        hellpodBayLevel: this.hellpodBayLevel,
        totalHellpodDrops: this.totalHellpodDrops,
        roguelikePerks: this.roguelikePerks,
        superSamples: this.superSamples,
        samples: this.samples,
        portLogistics: this.portLogistics,
        spacePlanets: this.spacePlanets,
        travianBattleLogs: this.travianBattleLogs,
        helldiverRoster: this.helldiverRoster,
        capybaraLineup: this.capybaraLineup,
        sampleSearchDiff: this.sampleSearchDiff,
        targetCapturePlanetId: this.targetCapturePlanetId,
        warProgress: this.warProgress,
        warRun: this.warRun && this.warRun.active ? this.warRun : null,
        ownedEquipment: this.ownedEquipment,
        equipped: this.equipped,
        waveNumber: this.waveNumber,
        totalServed: this.totalServed,
        totalKills: this.totalKills,
        rawExtractors: this.rawExtractors,
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

    saveGame(slotOverride = null) {
      try {
        if (!this.currentSaveSlot) {
          this.currentSaveSlot = Math.max(1, Math.min(3, parseInt(localStorage.getItem('helldivers_please_active_slot') || '1', 10)));
        }
        const targetSlot = slotOverride ? Math.max(1, Math.min(3, parseInt(slotOverride, 10))) : this.currentSaveSlot;
        const json = JSON.stringify(this.serializeState());
        localStorage.setItem(this.getSlotStorageKey(targetSlot), json);
        localStorage.setItem(CFG.STORAGE_KEY, json);
        localStorage.setItem('helldivers_please_active_slot', String(this.currentSaveSlot));
        const codeInput = document.getElementById('save-code-box');
        if (codeInput) codeInput.value = btoa(unescape(encodeURIComponent(json)));
      } catch (e) {
        // Ignore storage errors in sandboxed iframes
      }
    }

    getSaveSlotSummary(slotNum) {
      try {
        let raw = localStorage.getItem(this.getSlotStorageKey(slotNum));
        if (!raw && slotNum === 1) {
          raw = localStorage.getItem(CFG.STORAGE_KEY);
        }
        if (!raw) return { exists: false, slotNum };
        const data = JSON.parse(raw);
        const ownedPlanets = data.spacePlanets
          ? Object.values(data.spacePlanets).filter((p) => p && p.owned).length
          : 1;
        const heroesCount = Array.isArray(data.helldiverRoster) ? data.helldiverRoster.length : 4;
        return {
          exists: true,
          slotNum,
          version: data.version || CFG.VERSION,
          savedAt: data.savedAt || 'Auto-Saved',
          cash: Math.floor(data.cash ?? 60),
          medals: data.medals ?? 3,
          ownedPlanets,
          heroesCount,
          playTimeSeconds: Math.floor(data.playTimeSeconds || 0)
        };
      } catch (e) {
        return { exists: false, slotNum };
      }
    }

    switchSaveSlot(slotNum) {
      const target = Math.max(1, Math.min(3, parseInt(slotNum, 10) || 1));
      this.saveGame(this.currentSaveSlot || 1);
      this.currentSaveSlot = target;
      try {
        localStorage.setItem('helldivers_please_active_slot', String(target));
      } catch (e) {}

      const slotRaw = localStorage.getItem(this.getSlotStorageKey(target));
      if (slotRaw) {
        this.loadGame(slotRaw, target);
      } else {
        this.resetSlotToFreshStart(target, false);
      }
      this.renderSaveModal();
      this.updateHUD();
      this.spawnFloatingText(this.player.x, this.player.z - 40, `💾 SWITCHED TO SAVE SLOT #${target}!`, '#38bdf8');
    }

    resetSlotToFreshStart(slotNum = null, showToast = true) {
      const target = Math.max(1, Math.min(3, parseInt(slotNum || this.currentSaveSlot || 1, 10)));
      try {
        localStorage.removeItem(this.getSlotStorageKey(target));
        if (target === 1) localStorage.removeItem(CFG.STORAGE_KEY);
      } catch (e) {}

      if (target === (this.currentSaveSlot || 1)) {
        this.medals = 3;
        this.prestigeCount = 0;
        this.highestWave = 1;
        this.lifetimeServed = 0;
        this.lifetimeKills = 0;
        this.playTimeSeconds = 0;
        this.claimedMilestones = {};
        for (const sk of CFG.PERMANENT_SKILLS) this.foreverSkills[sk.id] = 0;
        this.techNodes = { core_shard: 1 };
        for (const tn of (CFG.MINDUSTRY_TECH_NODES || [])) {
          if (tn.id !== 'core_shard') this.techNodes[tn.id] = 0;
        }
        this.unlockedBases = { base_alpha: true };
        this.activeBaseId = 'base_alpha';
        this.ownedEquipment = { w_liberator: true, a_standard: true, b_none: true, m_foot: true };
        this.equipped = { weapon: 'w_liberator', armor: 'a_standard', backpack: 'b_none', mount: 'm_foot' };
        this.cloneRoomLevel = 1;
        this.hiredClonesCount = 0;
        this.workerJobs = { miner: 0, hauler: 0, sales: 0, cash: 0, ammo: 0, war: 0 };
        this.samples = { common: 0, rare: 0, superRare: 0 };
        this.superSamples = 0;
        this.portLogistics = {
          superEarthDrillLvl: 1,
          portsUnlocked: 1,
          shipsCount: 1,
          unloadSpeedLvl: 1,
          storageLimitLvl: 1,
          shipCargoLvl: 1
        };
        this.spacePlanets = null;
        this.helldiverRoster = null;
        this.warProgress = null;
        this.warRun = null;
        this.initRunState();
        this.ensureStarterSetup();
        this.spawnCustomer('cloth');
        this.spawnCustomer('cloth');
        this.saveGame(target);
      }
      this.renderSaveModal();
      this.updateHUD();
      if (showToast) {
        this.spawnFloatingText(this.player.x, this.player.z - 40, `🗑️ SAVE SLOT #${target} RESET TO FRESH START!`, '#f87171');
      }
    }

    redeployAfterDefeat() {
      this.resetSlotToFreshStart(this.currentSaveSlot || 1, true);
    }

    renderSaveModal() {
      const bannerEl = document.getElementById('save-modal-active-banner');
      const slotsPage = document.getElementById('save-slots-page');
      const codePage = document.getElementById('save-code-page');
      const gridEl = document.getElementById('save-slots-grid');
      const codeSlotNameEl = document.getElementById('save-code-slot-name');
      if (!gridEl) return;

      this.saveModalPage = this.saveModalPage || 'slots';
      const activeSlot = this.currentSaveSlot || 1;
      if (bannerEl) {
        bannerEl.textContent = `💾 CURRENT ACTIVE SLOT: SAVE SLOT #${activeSlot} / 3 (Auto-Save Active)`;
      }
      if (codeSlotNameEl) {
        codeSlotNameEl.textContent = `Slot #${activeSlot}`;
      }

      if (slotsPage) slotsPage.style.display = this.saveModalPage === 'slots' ? 'block' : 'none';
      if (codePage) codePage.style.display = this.saveModalPage === 'code' ? 'block' : 'none';

      gridEl.innerHTML = [1, 2, 3].map((sNum) => {
        const isCur = sNum === activeSlot;
        const info = this.getSaveSlotSummary(sNum);
        const mins = Math.floor((info.playTimeSeconds || 0) / 60);
        const secs = (info.playTimeSeconds || 0) % 60;
        return `
          <div class="upgrade-card" style="border:2px solid ${isCur ? '#4ade80' : '#38bdf8'};background:${isCur ? 'rgba(34,197,94,0.12)' : 'rgba(15,23,42,0.92)'};padding:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-family:var(--font-display);font-weight:900;font-size:0.95rem;color:${isCur ? '#4ade80' : '#fde047'};">
                💾 SAVE SLOT #${sNum}
              </span>
              <span class="version-pill" style="border-color:${isCur ? '#4ade80' : '#64748b'};color:${isCur ? '#86efac' : '#cbd5e1'};">
                ${isCur ? '✅ ACTIVE SLOT' : (info.exists ? `Saved (${info.savedAt})` : 'EMPTY SLOT')}
              </span>
            </div>
            ${info.exists ? `
              <div style="font-size:0.8rem;color:#e2e8f0;line-height:1.5;margin-bottom:10px;">
                💵 Requisition: <strong style="color:#4ade80;">$${info.cash}</strong> · ⭐ Medals: <strong style="color:#fde047;">${info.medals}</strong><br/>
                🪐 Planets Owned: <strong>${info.ownedPlanets}/21</strong> · 🎖️ Heroes: <strong>${info.heroesCount}</strong> · ⏱️ Time: <strong>${mins}m ${secs}s</strong>
              </div>
            ` : `
              <div style="font-size:0.8rem;color:#94a3b8;line-height:1.5;margin-bottom:10px;">
                Empty Save Slot — Click <strong>Start Slot #${sNum}</strong> to begin a fresh campaign in Slot #${sNum}, or <strong>Save Here</strong> to copy current progress!
              </div>
            `}
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="buy-btn btn-slot-switch" data-slot="${sNum}" style="flex:1;">
                ${isCur ? `✅ Active (Slot #${sNum})` : (info.exists ? `📂 Load Slot #${sNum}` : `🆕 Start Slot #${sNum}`)}
              </button>
              <button class="hud-btn btn-slot-save" data-slot="${sNum}" style="border-color:#38bdf8;color:#7dd3fc;">
                💾 Save Here
              </button>
              <button class="hud-btn btn-slot-reset" data-slot="${sNum}" style="border-color:#ef4444;color:#fca5a5;">
                🗑️ Reset
              </button>
            </div>
          </div>
        `;
      }).join('');

      gridEl.querySelectorAll('.btn-slot-switch').forEach((btn) => {
        btn.addEventListener('click', () => {
          const s = parseInt(btn.getAttribute('data-slot'), 10);
          this.switchSaveSlot(s);
        });
      });
      gridEl.querySelectorAll('.btn-slot-save').forEach((btn) => {
        btn.addEventListener('click', () => {
          const s = parseInt(btn.getAttribute('data-slot'), 10);
          this.saveGame(s);
          this.renderSaveModal();
          this.spawnFloatingText(this.player.x, this.player.z - 35, `💾 SAVED PROGRESS TO SLOT #${s}!`, '#4ade80');
        });
      });
      gridEl.querySelectorAll('.btn-slot-reset').forEach((btn) => {
        btn.addEventListener('click', () => {
          const s = parseInt(btn.getAttribute('data-slot'), 10);
          this.resetSlotToFreshStart(s, true);
        });
      });
    }

    loadGame(rawJson = null, slotOverride = null) {
      try {
        if (!this.currentSaveSlot) {
          this.currentSaveSlot = Math.max(1, Math.min(3, parseInt(localStorage.getItem('helldivers_please_active_slot') || '1', 10)));
        }
        const targetSlot = slotOverride || this.currentSaveSlot;
        let saved = rawJson || localStorage.getItem(this.getSlotStorageKey(targetSlot));
        if (!saved && targetSlot === 1) {
          saved = localStorage.getItem(CFG.STORAGE_KEY);
        }
        if (!saved) return;
        const data = JSON.parse(saved);
        const isCurrentVersion = data.version === CFG.VERSION || data.version === 'v0.0.14';

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
        if (typeof data.cloneRoomLevel === 'number') this.cloneRoomLevel = data.cloneRoomLevel;
        if (typeof data.hiredClonesCount === 'number') this.hiredClonesCount = data.hiredClonesCount;
        if (data.workerJobs) Object.assign(this.workerJobs, data.workerJobs);
        if (typeof data.hellpodBayLevel === 'number') this.hellpodBayLevel = data.hellpodBayLevel;
        if (typeof data.totalHellpodDrops === 'number') this.totalHellpodDrops = data.totalHellpodDrops;
        if (data.roguelikePerks) Object.assign(this.roguelikePerks, data.roguelikePerks);
        if (typeof data.superSamples === 'number') this.superSamples = data.superSamples;
        if (data.samples) Object.assign(this.samples, data.samples);
        if (data.portLogistics) {
          this.portLogistics = Object.assign(
            { superEarthDrillLvl: 1, portsUnlocked: 1, shipsCount: 1, unloadSpeedLvl: 1, storageLimitLvl: 1, shipCargoLvl: 1 },
            data.portLogistics
          );
        }
        if (data.spacePlanets && isCurrentVersion) {
          this.spacePlanets = data.spacePlanets;
          this.initSpaceMapState();
        }
        if (Array.isArray(data.travianBattleLogs)) this.travianBattleLogs = data.travianBattleLogs;
        if (Array.isArray(data.helldiverRoster) && data.helldiverRoster.length > 0) {
          this.helldiverRoster = data.helldiverRoster;
        }
        if (Array.isArray(data.capybaraLineup)) this.capybaraLineup = data.capybaraLineup;
        if (typeof data.sampleSearchDiff === 'number') this.sampleSearchDiff = data.sampleSearchDiff;
        if (typeof data.targetCapturePlanetId === 'string') this.targetCapturePlanetId = data.targetCapturePlanetId;
        if (data.warProgress && typeof data.warProgress === 'object') this.warProgress = data.warProgress;
        if (data.warRun && typeof data.warRun === 'object') this.warRun = data.warRun;
        if (data.capybaraRun?.active && !data.warRun) {
          this.warRun = null;
          this.warMigrationNoticePending = true;
        }
        this.initWarFoundation();
        this.initTransportShips();
        this.initHelldiverRoster();
        if (data.ownedEquipment) Object.assign(this.ownedEquipment, data.ownedEquipment);
        if (data.equipped) Object.assign(this.equipped, data.equipped);

        if (typeof data.cash === 'number') this.cash = data.cash;
        if (typeof data.waveNumber === 'number') this.waveNumber = Math.max(1, data.waveNumber);
        if (typeof data.totalServed === 'number') this.totalServed = data.totalServed;
        if (typeof data.totalKills === 'number') this.totalKills = data.totalKills;

        if (data.rawExtractors && isCurrentVersion) {
          for (const raw of CFG.RAW_EXTRACTORS) {
            if (data.rawExtractors[raw.id]) {
              Object.assign(this.rawExtractors[raw.id], data.rawExtractors[raw.id]);
            }
          }
        }
        if (data.conveyorLevels) {
          for (const c of CFG.CONVEYORS) {
            if (typeof data.conveyorLevels[c.id] === 'number') {
              this.conveyorLevels[c.id] = Math.min(10, data.conveyorLevels[c.id]);
              this.conveyors[c.id] = this.conveyorLevels[c.id] > 0;
            }
          }
        }
        if (data.conveyorRemaining) Object.assign(this.conveyorRemaining, data.conveyorRemaining);
        if (data.unlocked) Object.assign(this.unlocked, data.unlocked);
        if (data.unlockRemaining) Object.assign(this.unlockRemaining, data.unlockRemaining);

        if (data.stations) {
          for (const item of CFG.ITEMS) {
            if (data.stations[item.id] && this.stations[item.id]) {
              this.stations[item.id].level = Math.min(10, Math.max(1, data.stations[item.id].level || 1));
              this.stations[item.id].priceLvl = Math.min(10, Math.max(1, data.stations[item.id].priceLvl || 1));
              this.stations[item.id].speedLvl = Math.min(10, Math.max(1, data.stations[item.id].speedLvl || 1));
              this.stations[item.id].yieldLvl = Math.min(10, Math.max(1, data.stations[item.id].yieldLvl || 1));
              this.stations[item.id].counterLvl = Math.min(10, Math.max(1, data.stations[item.id].counterLvl || 1));
              this.stations[item.id].stock = Math.max(0, data.stations[item.id].stock || 0);
              if (data.stations[item.id].inputStock) {
                Object.assign(this.stations[item.id].inputStock, data.stations[item.id].inputStock);
              }
            }
          }
        }

        if (data.counterBuffer) {
          for (const item of CFG.ITEMS) {
            if (typeof data.counterBuffer[item.id] === 'number') {
              this.counterBuffer[item.id] = Math.max(0, data.counterBuffer[item.id]);
            }
          }
        }
        if (data.counterCash) {
          for (const item of CFG.ITEMS) {
            if (typeof data.counterCash[item.id] === 'number') {
              this.counterCash[item.id] = Math.max(0, data.counterCash[item.id]);
            }
          }
          this.syncTotalCashOnGround();
        }

        if (data.upgrades) {
          for (const k of Object.keys(this.upgrades)) {
            if (typeof data.upgrades[k] === 'number') {
              this.upgrades[k] = data.upgrades[k];
            }
          }
        }

        this.syncWorkers();
        this.recalcDerivedStats();
        this.buildSolidObstacles();
      } catch (e) {
        // Ignore corrupted save data
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
        const pt = this.world.screenToWorld(e.clientX, e.clientY);
        if (this.handleCanvasBuildingClick(pt.x, pt.z)) {
          return;
        }
        pointerDown = true;
        this.pointerTarget = pt;
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

      document.getElementById('btn-snap-quarry')?.addEventListener('click', () => {
        if (this.viewMode !== 'shop') this.setViewMode('shop');
        this.pointerTarget = { x: -1650, z: 420 };
      });
      document.getElementById('btn-snap-factory')?.addEventListener('click', () => {
        if (this.viewMode !== 'shop') this.setViewMode('shop');
        this.pointerTarget = { x: -450, z: 390 };
      });
      document.getElementById('btn-snap-counter')?.addEventListener('click', () => {
        if (this.viewMode !== 'shop') this.setViewMode('shop');
        this.pointerTarget = { x: 520, z: 390 };
      });
      document.getElementById('btn-snap-gates')?.addEventListener('click', () => {
        this.spaceMapPage = 'map';
        this.renderSpaceMapModal();
        document.getElementById('modal-space-map')?.classList.add('open');
      });

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

      document.getElementById('btn-mode-shop')?.addEventListener('click', () => this.setViewMode('shop'));
      document.getElementById('btn-mode-bases')?.addEventListener('click', () => {
        this.campaignModalPage = 'bases';
        this.renderCampaignModal();
        document.getElementById('modal-campaign')?.classList.add('open');
      });
      document.getElementById('btn-mode-tech')?.addEventListener('click', () => {
        this.skillsModalPage = 'tree';
        this.renderSkillsModal();
        document.getElementById('modal-skills')?.classList.add('open');
      });

      document.getElementById('btn-idle-open-popup')?.addEventListener('click', () => {
        const sel = this.selectedInspectTarget || { type: 'station', id: 'cloth' };
        this.openBuildingPopover(sel.type, sel.id);
      });
      document.getElementById('btn-close-popover')?.addEventListener('click', () => {
        this.closeBuildingPopover();
      });

      document.getElementById('btn-open-clone-top')?.addEventListener('click', () => {
        this.cloneModalPage = 'vat';
        this.renderCloneRoomModal();
        document.getElementById('modal-clone-room')?.classList.add('open');
      });
      document.getElementById('btn-close-clone-room')?.addEventListener('click', () => {
        document.getElementById('modal-clone-room')?.classList.remove('open');
      });

      document.getElementById('btn-war-page-sample')?.addEventListener('click', () => {
        const diffSel = document.getElementById('sample-diff-select');
        const diff = diffSel ? parseInt(diffSel.value, 10) : (this.sampleSearchDiff || 1);
        this.startSampleSearchRun(diff);
      });
      document.getElementById('btn-war-page-capture')?.addEventListener('click', () => {
        this.spaceMapPage = 'map';
        this.renderSpaceMapModal();
        document.getElementById('modal-space-map')?.classList.add('open');
      });
      document.getElementById('btn-war-back-shop')?.addEventListener('click', () => {
        this.setViewMode('shop');
      });
      document.getElementById('btn-war-open-training')?.addEventListener('click', () => {
        this.trainingModalPage = 'overview';
        this.renderTrainingRoomModal();
        document.getElementById('modal-training-room')?.classList.add('open');
      });
      document.getElementById('btn-war-start-match')?.addEventListener('click', () => {
        if (this.warSubPage === 'capture') {
          this.startPlanetCaptureRun(this.targetCapturePlanetId);
        } else {
          this.startSampleSearchRun(this.sampleSearchDiff || 1);
        }
      });

      document.getElementById('btn-idle-quick-upgrade')?.addEventListener('click', () => {
        this.triggerSelectedInspectorUpgrade();
      });
      document.getElementById('btn-idle-belt-upgrade')?.addEventListener('click', () => {
        const nextBelt = CFG.CONVEYORS.find((c) => (this.conveyorLevels[c.id] || 0) < 10) || CFG.CONVEYORS[0];
        const bl = this.conveyorLevels[nextBelt.id] || 0;
        const bc = this.getConveyorUpgradeCost(nextBelt.id);
        if (bl < 10 && this.cash >= bc) {
          this.cash -= bc;
          this.conveyorLevels[nextBelt.id] = bl + 1;
          this.conveyors[nextBelt.id] = true;
          this.conveyorRemaining[nextBelt.id] = this.getConveyorUpgradeCost(nextBelt.id);
          this.recalcDerivedStats();
          this.audio.playUnlock();
          this.spawnFloatingText(this.player.x, this.player.z - 40, `🔗 ${nextBelt.name.toUpperCase()} Lv.${bl + 1}/10!`, nextBelt.color);
          this.updateHUD();
        }
      });

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
        this.campaignModalPage = 'milestones';
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
        this.upgradesModalPage = 'stations';
        this.renderUpgradesModal();
        document.getElementById('modal-seaf')?.classList.add('open');
      });
      document.getElementById('btn-close-seaf')?.addEventListener('click', () => {
        document.getElementById('modal-seaf')?.classList.remove('open');
      });

      document.getElementById('btn-open-skills')?.addEventListener('click', () => {
        this.skillsModalPage = 'tree';
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

      // 3-Save-Slot Modal & Export/Import Bindings
      const openSaveManager = () => {
        this.saveGame();
        this.saveModalPage = 'slots';
        this.renderSaveModal();
        document.getElementById('modal-save')?.classList.add('open');
      };
      document.getElementById('btn-open-save')?.addEventListener('click', openSaveManager);
      document.getElementById('btn-open-save-top')?.addEventListener('click', openSaveManager);
      document.getElementById('btn-close-save')?.addEventListener('click', () => {
        document.getElementById('modal-save')?.classList.remove('open');
      });
      document.getElementById('btn-save-tab-slots')?.addEventListener('click', () => {
        this.saveModalPage = 'slots';
        this.renderSaveModal();
      });
      document.getElementById('btn-save-tab-code')?.addEventListener('click', () => {
        this.saveGame();
        this.saveModalPage = 'code';
        this.renderSaveModal();
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
            this.loadGame(json, this.currentSaveSlot || 1);
            this.saveGame(this.currentSaveSlot || 1);
            this.renderSaveModal();
            document.getElementById('modal-save')?.classList.remove('open');
            this.spawnFloatingText(this.player.x, this.player.z - 30, `📥 SAVE LOADED INTO SLOT #${this.currentSaveSlot || 1}!`, '#38bdf8');
          } catch (e) {
            this.spawnFloatingText(this.player.x, this.player.z - 30, '⚠️ INVALID SAVE CODE', '#ef4444');
          }
        }
      });
      document.getElementById('btn-reset-save')?.addEventListener('click', () => {
        this.resetSlotToFreshStart(this.currentSaveSlot || 1, true);
        document.getElementById('modal-save')?.classList.remove('open');
      });

      document.getElementById('btn-open-port-top')?.addEventListener('click', () => {
        this.portModalPage = 'overview';
        this.renderPortLogisticsModal();
        document.getElementById('modal-port-logistics')?.classList.add('open');
      });
      document.getElementById('btn-close-port-logistics')?.addEventListener('click', () => {
        document.getElementById('modal-port-logistics')?.classList.remove('open');
      });

      document.getElementById('btn-open-training-top')?.addEventListener('click', () => {
        this.trainingModalPage = 'overview';
        this.renderTrainingRoomModal();
        document.getElementById('modal-training-room')?.classList.add('open');
      });
      document.getElementById('btn-close-training-room')?.addEventListener('click', () => {
        document.getElementById('modal-training-room')?.classList.remove('open');
      });

      document.getElementById('btn-open-space-map')?.addEventListener('click', () => {
        this.spaceMapPage = 'map';
        this.renderSpaceMapModal();
        document.getElementById('modal-space-map')?.classList.add('open');
      });
      document.getElementById('btn-close-space-map')?.addEventListener('click', () => {
        document.getElementById('modal-space-map')?.classList.remove('open');
      });

      const spaceCanvas = document.getElementById('space-map-canvas');
      spaceCanvas?.addEventListener('pointerdown', (e) => {
        const rect = spaceCanvas.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
        const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
        let bestP = null;
        let bestD = 0.12;
        for (const p of (CFG.SPACE_MAP_PLANETS || [])) {
          const d = Math.hypot(nx - p.nx, ny - p.ny);
          if (d < bestD) {
            bestD = d;
            bestP = p;
          }
        }
        if (bestP) {
          this.selectedSpacePlanetId = bestP.id;
          this.spaceMapPage = 'planet';
          if (bestP.isHome) this.superEarthSubPage = 'ores';
          this.audio.playPickup();
          this.renderSpaceMapModal();
        }
      });

      document.getElementById('btn-mode-sample')?.addEventListener('click', () => {
        const diffSel = document.getElementById('sample-diff-select');
        const diff = diffSel ? parseInt(diffSel.value, 10) : (this.sampleSearchDiff || 1);
        this.startSampleSearchRun(diff);
      });
      document.getElementById('sample-diff-select')?.addEventListener('change', (e) => {
        const diff = parseInt(e.target.value, 10) || 1;
        this.sampleSearchDiff = diff;
        if (this.viewMode === 'war' && this.warSubPage === 'sample') {
          this.startSampleSearchRun(diff);
        }
      });

      document.getElementById('btn-mode-capture')?.addEventListener('click', () => {
        this.spaceMapPage = 'map';
        this.renderSpaceMapModal();
        document.getElementById('modal-space-map')?.classList.add('open');
      });

      document.getElementById('btn-wave-continue')?.addEventListener('click', () => {
        this.continueNextCapybaraWave();
      });
      document.getElementById('btn-wave-retreat')?.addEventListener('click', () => {
        this.retreatFromCapybaraRun();
      });
      document.getElementById('btn-war-retreat-now')?.addEventListener('click', () => {
        this.retreatFromCapybaraRun();
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
      setTimeout(() => {
        if (window.game?.warRun?.active) {
          if (window.game.warRun.phase === 'combat') window.WarCombatUI?.start(window.game);
          else window.WarUI?.show(window.game);
        }
      }, 0);
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootHelldiversGame);
  } else {
    bootHelldiversGame();
  }
})();
