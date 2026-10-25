// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.02
// Module: High-DPI 2D Factorio + CarbotAnimations Vector World Renderer
// ============================================================================

(function () {
  class WorldRenderer2D {
    constructor(canvasEl) {
      this.canvas = canvasEl || document.getElementById('game-canvas');
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.display = 'block';
      this.ctx = this.canvas.getContext('2d');

      this.width = window.innerWidth || 1280;
      this.height = window.innerHeight || 720;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Camera state (world coordinates)
      this.camX = 0;
      this.camZ = 220;
      this.zoom = 0.72; // Default zoom to see big Factorio shop floor clearly
      this.targetZoom = 0.72;
      this.shakeTimer = 0;
      this.shakeIntensity = 0;

      // Animated conveyor phase
      this.beltPhase = 0;
      this.time = 0;

      // Pre-generated war zone craters & rocks for deterministic 2D rendering
      this.craters = [];
      for (let i = 0; i < 42; i++) {
        const seed = (i * 9301 + 49297) % 233280;
        const rx = ((seed / 233280) - 0.5) * 2280;
        const rz = -280 - ((i * 4177) % 700);
        const rad = 24 + (i % 5) * 12;
        this.craters.push({ x: rx, z: rz, r: rad, rot: (i * 1.1) });
      }

      this.handleResize();
      window.addEventListener('resize', () => this.handleResize());

      // Mouse wheel zoom support
      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.08 : 0.08;
        this.setZoom(this.targetZoom + delta);
      }, { passive: false });
    }

    setZoom(z) {
      this.targetZoom = Math.max(0.42, Math.min(1.35, z));
    }

    handleResize() {
      this.width = window.innerWidth || 1280;
      this.height = window.innerHeight || 720;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
    }

    triggerCameraShake(intensity = 10, duration = 0.35) {
      this.shakeIntensity = intensity;
      this.shakeTimer = duration;
    }

    // Convert screen pixel (clientX, clientY) to world (x, z)
    screenToWorld(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const wx = this.camX + (sx - this.width * 0.5) / this.zoom;
      const wz = this.camZ + (sy - this.height * 0.5) / this.zoom;
      return { x: wx, z: wz };
    }

    worldToScreen(wx, wz) {
      const sx = (wx - this.camX) * this.zoom + this.width * 0.5;
      const sy = (wz - this.camZ) * this.zoom + this.height * 0.5;
      return { x: sx, y: sy };
    }

    // ========================================================================
    // MAIN 2D FACTORIO + CARBOT ANIMATIONS RENDER FRAME
    // ========================================================================
    render(state, dt) {
      this.time += dt;
      this.beltPhase = (this.beltPhase + dt * 48) % 24;
      this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * 10);

      // Smoothly follow player
      const targetX = state.player.x;
      const targetZ = state.player.z;
      this.camX += (targetX - this.camX) * Math.min(1, dt * 8.5);
      this.camZ += (targetZ - this.camZ) * Math.min(1, dt * 8.5);

      let shakeX = 0;
      let shakeY = 0;
      if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
        shakeX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
        shakeY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      }

      const ctx = this.ctx;
      ctx.save();
      ctx.scale(this.dpr, this.dpr);

      // Background clear
      ctx.fillStyle = '#090d14';
      ctx.fillRect(0, 0, this.width, this.height);

      // Camera transform
      ctx.translate(this.width * 0.5 + shakeX, this.height * 0.5 + shakeY);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-this.camX, -this.camZ);

      // 1. Draw Floor & War Zone Terrain
      this.drawTerrainAndGrid(ctx, state);

      // 2. Draw Factorio Conveyor Belts (Both Planned & Active Animated Belts)
      this.drawConveyorNetwork(ctx, state);

      // 3. Draw Trigger Pads (Unlock Pads, Raw Pads, Ammo Pads, Counter Pad)
      this.drawFloorPads(ctx, state);

      // 4. Draw Perimeter Wall & 3 Defense Gates + Gate HP Bars + Gate Turrets
      this.drawPerimeterAndGates(ctx, state);

      // 5. Draw Raw Material Drills & Munitions Ammo Press
      this.drawRawDrillsAndAmmoPress(ctx, state);

      // 6. Draw 7 Arsenal Assembly Machines
      this.drawArsenalFactories(ctx, state);

      // 7. Draw Multi-Stall Sales Counter, Cash Towers & Trash Incinerator
      this.drawCounterAndCashTowers(ctx, state);

      // 8. Draw War Zone Snow/Ash Tiles, Frozen Helldiver Cryo-Pods & Loot Drops
      this.drawWarZoneObjects(ctx, state);

      // 9. Y-Sorted Dynamic Entities (Player, SEAF Staff, Customers, Enemies)
      this.drawSortedEntities(ctx, state);

      // 10. Draw Parabolic Flying Items, Bullets, Laser Beams & Explosions
      this.drawProjectilesAndArcs(ctx, state);

      ctx.restore();
    }

    drawTerrainAndGrid(ctx, state) {
      const W = window.GameConfig.WORLD;

      // Outer War-Zone Ground (North of wallZ = -220)
      const warGrad = ctx.createLinearGradient(0, W.minZ, 0, W.wallZ);
      warGrad.addColorStop(0, '#1e1b2e');
      warGrad.addColorStop(0.6, '#27293d');
      warGrad.addColorStop(1, '#31374d');
      ctx.fillStyle = warGrad;
      ctx.fillRect(W.minX - 100, W.minZ - 100, (W.maxX - W.minX) + 200, (W.wallZ - W.minZ) + 100);

      // War-Zone Craters & Scorch Marks
      for (const c of this.craters) {
        ctx.save();
        ctx.translate(c.x, c.z);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Expanded Factorio Industrial Shop Floor (South of wallZ = -220)
      ctx.fillStyle = '#161f2e';
      ctx.fillRect(W.minX, W.wallZ, W.maxX - W.minX, W.maxZ - W.wallZ);

      // Distinct Factorio Sector Zones on Shop Floor
      this.drawFloorSector(ctx, -1180, -180, 560, 1080, '#132338', '#38bdf8', 'SECTOR A: RAW EXTRACTION & MUNITIONS');
      this.drawFloorSector(ctx, -560, 80, 620, 820, '#1b2434', '#facc15', 'SECTOR B: ARSENAL ASSEMBLY LINES');
      this.drawFloorSector(ctx, 100, 40, 460, 540, '#172b26', '#22c55e', 'SECTOR C: HELLDIVER SALES COUNTER');
      this.drawFloorSector(ctx, 240, 460, 940, 440, '#261e2e', '#f97316', 'SECTOR D: HEAVY VEHICLE, MECH & DESTROYER BAY');

      // Crisp Factorio Metal Grid Lines (60px grid)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.09)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = W.minX; x <= W.maxX; x += 60) {
        ctx.moveTo(x, W.wallZ);
        ctx.lineTo(x, W.maxZ);
      }
      for (let z = W.wallZ; z <= W.maxZ; z += 60) {
        ctx.moveTo(W.minX, z);
        ctx.lineTo(W.maxX, z);
      }
      ctx.stroke();

      // Outer Shop Perimeter Walls
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 14;
      ctx.strokeRect(W.minX, W.minZ, W.maxX - W.minX, W.maxZ - W.minZ);
    }

    drawFloorSector(ctx, x, z, w, h, bg, accent, title) {
      ctx.save();
      ctx.fillStyle = bg;
      ctx.fillRect(x, z, w, h);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 8]);
      ctx.strokeRect(x, z, w, h);
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = accent;
      ctx.font = '900 15px Orbitron, sans-serif';
      ctx.fillText(title, x + 16, z + 26);
      ctx.restore();
    }

    drawConveyorNetwork(ctx, state) {
      const AP = window.GameConfig.AMMO_PRESS;
      const gates = window.GameConfig.GATES;

      const rawUnlocked = !!state.conveyors.conv_raw_feed;
      this.drawBeltPath(ctx, [
        { x: -920, z: 660 },
        { x: -920, z: 360 },
        { x: -640, z: 360 },
        { x: -640, z: 60 }
      ], rawUnlocked, '#38bdf8', '⛏️');

      for (const g of gates) {
        const unlocked = !!state.conveyors[g.conveyorId];
        const path = [
          { x: AP.x, z: AP.z },
          { x: AP.x, z: -85 },
          { x: g.turretX, z: -85 },
          { x: g.turretX, z: g.turretZ }
        ];
        this.drawBeltPath(ctx, path, unlocked, g.color, '🧱');
      }

      const counterBelt = !!state.conveyors.conv_counter_auto;
      this.drawBeltPath(ctx, [
        { x: -260, z: 420 },
        { x: -260, z: 220 },
        { x: 210, z: 220 }
      ], counterBelt, '#22c55e', '🔫');
    }

    drawBeltPath(ctx, pts, active, color, itemIcon) {
      if (pts.length < 2) return;
      ctx.save();

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].z);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].z);
      }

      if (!active) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
        ctx.lineWidth = 22;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.28)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.restore();
        return;
      }

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 28;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 22;
      ctx.stroke();

      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const len = Math.hypot(dx, dz);
        if (len < 1) continue;
        const ang = Math.atan2(dz, dx);

        ctx.save();
        ctx.translate(a.x, a.z);
        ctx.rotate(ang);

        ctx.strokeStyle = color || '#facc15';
        ctx.lineWidth = 2.5;
        const step = 24;
        for (let d = this.beltPhase; d < len - 6; d += step) {
          ctx.beginPath();
          ctx.moveTo(d - 5, -6);
          ctx.lineTo(d + 3, 0);
          ctx.lineTo(d - 5, 6);
          ctx.stroke();
        }

        const itemStep = 72;
        const itemPhase = (this.time * 55) % itemStep;
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let d = itemPhase; d < len - 12; d += itemStep) {
          ctx.save();
          ctx.translate(d, 0);
          ctx.rotate(-ang);
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillText(itemIcon, 0, 1);
          ctx.restore();
        }

        ctx.restore();
      }

      ctx.restore();
    }

    drawFloorPads(ctx, state) {
      const L = window.GameConfig.LOCATIONS;

      this.drawPadBox(ctx, L.counterDropZone.x, L.counterDropZone.z, 130, 140, '#22c55e', '📦 DROP / SELL', 'Stock Counter or Direct Sell');
      this.drawPadBox(ctx, L.cashRegisterZone.x, L.cashRegisterZone.z, 120, 110, '#facc15', '💵 COLLECT $REQ', 'Walk Here to Vacuum Cash');

      for (const c of window.GameConfig.CONVEYORS) {
        if (state.conveyors[c.id]) continue;
        if (c.gateId && !state.gates[c.gateId]?.unlocked) continue;
        const rem = Math.max(0, state.conveyorRemaining[c.id] ?? c.cost);
        this.drawPadBox(ctx, c.padX, c.padZ, 115, 76, c.color, `${c.icon} BELT $${rem}`, c.name);
      }

      for (const item of window.GameConfig.ITEMS) {
        if (state.unlocked[item.id]) continue;
        const rem = Math.max(0, state.unlockRemaining[item.id] ?? item.unlockCost);
        this.drawPadBox(
          ctx,
          item.unlockPos.x,
          item.unlockPos.z,
          140,
          96,
          item.color,
          `🔓 UNLOCK ${item.icon} $${rem}`,
          item.shortName
        );
      }

      for (const g of window.GameConfig.GATES) {
        const gs = state.gates[g.id];
        if (!gs || gs.unlocked) continue;
        const rem = Math.max(0, gs.unlockRemaining ?? g.unlockCost);
        this.drawPadBox(
          ctx,
          g.unlockPadX,
          g.unlockPadZ,
          165,
          92,
          g.color,
          `🚧 OPEN ${g.shortName.toUpperCase()} $${rem}`,
          'Unlocks Gate, Turret & Customer Surge'
        );
      }
    }

    drawPadBox(ctx, x, z, w, h, color, title, subtitle) {
      ctx.save();
      ctx.translate(x, z);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.fillRect(-w / 2, -h / 2, w, h);

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = '900 13px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, 0, -4);

      if (subtitle) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '700 11px Rajdhani, sans-serif';
        ctx.fillText(subtitle, 0, 15);
      }
      ctx.restore();
    }

    drawPerimeterAndGates(ctx, state) {
      const W = window.GameConfig.WORLD;
      const gates = window.GameConfig.GATES;

      const wallY = W.wallZ;
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;

      const segments = [
        [-1240, -695],
        [-545, -75],
        [75, 545],
        [695, 1240]
      ];
      for (const [x1, x2] of segments) {
        ctx.fillRect(x1, wallY - 22, x2 - x1, 44);
        ctx.strokeRect(x1, wallY - 22, x2 - x1, 44);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x1 + 6, wallY - 6, x2 - x1 - 12, 12);
        ctx.fillStyle = '#334155';
      }
      ctx.restore();

      for (const g of gates) {
        const gs = state.gates[g.id];
        const unlocked = gs && gs.unlocked;
        ctx.save();
        ctx.translate(g.x, g.z);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 3;
        ctx.fillRect(-82, -28, 22, 56);
        ctx.strokeRect(-82, -28, 22, 56);
        ctx.fillRect(60, -28, 22, 56);
        ctx.strokeRect(60, -28, 22, 56);

        if (!unlocked) {
          ctx.fillStyle = '#475569';
          ctx.fillRect(-60, -18, 120, 36);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(-60, -18, 120, 36);
          ctx.fillStyle = '#f8fafc';
          ctx.font = '900 13px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`🔒 ${g.shortName.toUpperCase()} (LOCKED)`, 0, 5);
          ctx.restore();
          continue;
        }

        const hpRatio = Math.max(0, Math.min(1, gs.hp / gs.maxHp));
        const underAttack = (this.time - (gs.lastHitTime || -10)) < 0.6;
        ctx.fillStyle = underAttack ? 'rgba(239, 68, 68, 0.45)' : 'rgba(56, 189, 248, 0.22)';
        ctx.fillRect(-60, -12, 120, 24);
        ctx.strokeStyle = underAttack ? '#ef4444' : g.color;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
        ctx.strokeRect(-60, -12, 120, 24);
        ctx.setLineDash([]);

        const barW = 148;
        const barH = 16;
        ctx.fillStyle = '#090d14';
        ctx.fillRect(-barW / 2, -52, barW, barH);
        ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.25 ? '#facc15' : '#ef4444');
        ctx.fillRect(-barW / 2 + 2, -50, (barW - 4) * hpRatio, barH - 4);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-barW / 2, -52, barW, barH);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🛡️ ${g.shortName}: ${Math.ceil(gs.hp)}/${gs.maxHp} HP`, 0, -40);
        ctx.restore();

        this.drawPadBox(
          ctx,
          g.ammoPadX,
          g.ammoPadZ,
          96,
          64,
          '#f97316',
          `🧱 LOAD AMMO`,
          `搬 Ammo + Repair`
        );

        this.drawGateTurret(ctx, g, gs);
      }
    }

    drawGateTurret(ctx, g, gs) {
      ctx.save();
      ctx.translate(g.turretX, g.turretZ);

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const ammoRatio = Math.max(0, Math.min(1, gs.ammo / g.maxAmmo));
      ctx.strokeStyle = gs.ammo > 0 ? '#f97316' : '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ammoRatio);
      ctx.stroke();

      ctx.save();
      ctx.rotate(gs.turretAngle ?? -Math.PI / 2);

      const kick = (this.time - (gs.lastFireTime || 0)) < 0.12 ? -5 : 0;
      ctx.translate(kick, 0);

      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3;
      ctx.fillRect(6, -11, 28, 7);
      ctx.strokeRect(6, -11, 28, 7);
      ctx.fillRect(6, 4, 28, 7);
      ctx.strokeRect(6, 4, 28, 7);

      if ((this.time - (gs.lastFireTime || 0)) < 0.08) {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(38, -7, 7, 0, Math.PI * 2);
        ctx.arc(38, 7, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = gs.ammo > 0 ? 'rgba(15, 23, 42, 0.9)' : 'rgba(185, 28, 28, 0.95)';
      ctx.fillRect(-52, 30, 104, 20);
      ctx.strokeStyle = gs.ammo > 0 ? '#f97316' : '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-52, 30, 104, 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        gs.ammo > 0 ? `🧱 AMMO: ${gs.ammo}/${g.maxAmmo}` : `⚠️ NO AMMO (搬🧱!)`,
        0,
        44
      );

      ctx.restore();
    }

    drawRawDrillsAndAmmoPress(ctx, state) {
      for (const raw of window.GameConfig.RAW_EXTRACTORS) {
        const rs = state.rawExtractors[raw.id];
        const lvl = rs ? rs.level : 1;
        const stock = rs ? rs.stock : 0;
        const upgradeCost = state.getRawUpgradeCost ? state.getRawUpgradeCost(raw.id) : 100;

        ctx.save();
        ctx.translate(raw.x, raw.z);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;
        ctx.fillRect(-62, -62, 124, 124);
        ctx.strokeRect(-62, -62, 124, 124);

        ctx.save();
        ctx.rotate(this.time * (1.8 + lvl * 0.45));
        ctx.fillStyle = raw.color;
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-8, -42, 16, 84);
          ctx.strokeRect(-8, -42, 16, 84);
        }
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        const prog = rs ? (rs.progress / rs.cycleTime) : 0;
        ctx.fillStyle = '#090d14';
        ctx.fillRect(-54, 44, 108, 10);
        ctx.fillStyle = raw.color;
        ctx.fillRect(-52, 46, 104 * Math.min(1, prog), 6);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 13px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${raw.icon} ${raw.shortName} Lv.${lvl}`, 0, -72);
        ctx.fillStyle = '#facc15';
        ctx.font = '700 12px Rajdhani, sans-serif';
        ctx.fillText(`Speed: ${(1 / (rs?.cycleTime || 1.8)).toFixed(1)}/s | Buffer: ${stock}/${raw.maxBuffer}`, 0, -56);
        ctx.restore();

        this.drawPadBox(
          ctx,
          raw.padX,
          raw.padZ,
          122,
          88,
          raw.color,
          `⬆️ SPEED Lv.${lvl + 1} ($${upgradeCost})`,
          `Stand to Upgrade / Boost`
        );
      }

      const AP = window.GameConfig.AMMO_PRESS;
      const ammoStock = state.ammoPress.stock;
      const ammoProg = state.ammoPress.progress / state.ammoPress.cycleTime;

      ctx.save();
      ctx.translate(AP.x, AP.z);
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 4;
      ctx.fillRect(-58, -58, 116, 116);
      ctx.strokeRect(-58, -58, 116, 116);

      const stampScale = 0.85 + 0.15 * Math.sin(this.time * 8);
      ctx.save();
      ctx.scale(stampScale, stampScale);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-32, -32, 64, 64);
      ctx.strokeRect(-32, -32, 64, 64);
      ctx.restore();

      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧱', 0, 0);

      ctx.fillStyle = '#090d14';
      ctx.fillRect(-50, 42, 100, 10);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-48, 44, 96 * Math.min(1, ammoProg), 6);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px Orbitron, sans-serif';
      ctx.fillText(`🧱 MUNITIONS PRESS`, 0, -68);
      ctx.restore();

      this.drawPadBox(
        ctx,
        AP.padX,
        AP.padZ,
        118,
        88,
        '#f97316',
        `🧱 PICKUP AMMO (${ammoStock})`,
        `Carry (搬) to Gate Turrets!`
      );
    }

    drawArsenalFactories(ctx, state) {
      for (const item of window.GameConfig.ITEMS) {
        if (!state.unlocked[item.id]) continue;
        const st = state.stations[item.id];
        const stock = st ? st.stock : 0;
        const isMax = stock >= item.maxBuffer;
        const prog = isMax ? 1 : (st ? st.progress / st.cycleTime : 0);

        ctx.save();
        ctx.translate(item.stationPos.x, item.stationPos.z);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;
        ctx.fillRect(-56, -56, 112, 112);
        ctx.strokeRect(-56, -56, 112, 112);

        ctx.strokeStyle = item.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(-48, -48, 96, 96);

        ctx.save();
        if (!isMax) ctx.rotate(this.time * 3.2);
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, -4, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, 0, -4);

        ctx.fillStyle = '#090d14';
        ctx.fillRect(-46, 34, 92, 12);
        ctx.fillStyle = isMax ? '#ef4444' : item.color;
        ctx.fillRect(-44, 36, 88 * Math.min(1, prog), 8);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 13px Orbitron, sans-serif';
        ctx.fillText(`${item.icon} ${item.shortName}`, 0, -68);

        ctx.restore();

        this.drawPadBox(
          ctx,
          item.pickupPos.x,
          item.pickupPos.z,
          104,
          82,
          isMax ? '#ef4444' : item.color,
          isMax ? `${item.icon} MAX (${stock}/${item.maxBuffer})` : `${item.icon} READY: ${stock}/${item.maxBuffer}`,
          `Sell: $${state.getItemSellPrice(item)}`
        );
      }
    }

    drawCounterAndCashTowers(ctx, state) {
      const L = window.GameConfig.LOCATIONS;
      const T = L.counterTable;

      ctx.save();
      ctx.translate(T.x, T.z);

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.fillRect(-T.width / 2, -T.depth / 2, T.width, T.depth);
      ctx.strokeRect(-T.width / 2, -T.depth / 2, T.width, T.depth);

      ctx.fillStyle = '#facc15';
      ctx.font = '900 14px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🦅 QUARTERMASTER COUNTER', 0, -T.depth / 2 - 12);

      const items = window.GameConfig.ITEMS;
      let rowY = -T.depth / 2 + 28;
      for (const item of items) {
        if (!state.unlocked[item.id]) continue;
        const count = state.counterBuffer[item.id] || 0;
        ctx.fillStyle = count > 0 ? 'rgba(34, 197, 94, 0.22)' : 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(-T.width / 2 + 12, rowY - 14, T.width - 24, 34);
        ctx.strokeStyle = count > 0 ? item.color : '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-T.width / 2 + 12, rowY - 14, T.width - 24, 34);

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 13px Rajdhani, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.icon} ${item.shortName}`, -T.width / 2 + 20, rowY + 7);

        ctx.fillStyle = count > 0 ? '#4ade80' : '#94a3b8';
        ctx.font = '900 14px Orbitron, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`x${count}`, T.width / 2 - 20, rowY + 7);

        rowY += 42;
      }
      ctx.restore();

      const cashVal = state.cashOnGround || 0;
      const billCount = Math.min(48, Math.ceil(cashVal / 15));
      if (billCount > 0) {
        const cx = L.cashRegisterZone.x;
        const cz = L.cashRegisterZone.z - 20;
        for (let i = 0; i < billCount; i++) {
          const col = i % 2;
          const layer = Math.floor(i / 2);
          const bx = cx - 22 + col * 44;
          const by = cz - layer * 4;
          ctx.fillStyle = '#22c55e';
          ctx.strokeStyle = '#14532d';
          ctx.lineWidth = 1.5;
          ctx.fillRect(bx - 16, by - 8, 32, 14);
          ctx.strokeRect(bx - 16, by - 8, 32, 14);
        }
        ctx.fillStyle = '#4ade80';
        ctx.font = '900 15px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`💵 +$${cashVal}`, cx, cz - Math.floor(billCount / 2) * 4 - 18);
      }

      const TC = L.trashCanZone;
      this.drawPadBox(ctx, TC.x, TC.z, 92, 82, '#ef4444', '🗑️ DUMP / CLEAR', 'Clear Held Stack');
    }

    drawWarZoneObjects(ctx, state) {
      for (const s of state.snowTiles) {
        if (s.cleared) continue;
        ctx.save();
        ctx.translate(s.x, s.z);
        ctx.fillStyle = 'rgba(203, 213, 225, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const pod of state.cryoPods) {
        ctx.save();
        ctx.translate(pod.x, pod.z);
        ctx.fillStyle = pod.rescued ? '#1e293b' : '#0284c7';
        ctx.strokeStyle = pod.rescued ? '#475569' : '#38bdf8';
        ctx.lineWidth = 3;
        ctx.fillRect(-38, -38, 76, 76);
        ctx.strokeRect(-38, -38, 76, 76);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        if (pod.rescued) {
          ctx.fillText(`❄️ THAWING (${Math.ceil(pod.cooldown)}s)`, 0, 5);
        } else {
          ctx.fillText(`🥶 CRYO HELLDIVER`, 0, -46);
          ctx.fillStyle = '#facc15';
          ctx.fillText(`Feed ${pod.needed - pod.fed} 📦/🛢️ -> +1 SEAF!`, 0, 52);
          this.drawCarbotBean(ctx, 0, 6, {
            bodyColor: '#38bdf8',
            capeColor: '#0284c7',
            visorColor: '#bae6fd',
            isCommander: false,
            scale: 0.75,
            walkPhase: 0
          });
        }
        ctx.restore();
      }

      for (const d of state.warDrops) {
        ctx.save();
        ctx.translate(d.x, d.z + Math.sin(this.time * 5 + d.id) * 4);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = d.color || '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.icon, 0, 1);
        ctx.restore();
      }
    }

    drawSortedEntities(ctx, state) {
      const renderList = [];

      renderList.push({
        z: state.player.z,
        draw: () => this.drawPlayerCommander(ctx, state)
      });

      for (const w of state.workers) {
        renderList.push({
          z: w.z,
          draw: () => this.drawSeafWorker(ctx, w)
        });
      }

      for (const c of state.customers) {
        renderList.push({
          z: c.z,
          draw: () => this.drawHelldiverCustomer(ctx, c)
        });
      }

      for (const e of state.enemies) {
        renderList.push({
          z: e.z,
          draw: () => this.drawEnemy(ctx, e)
        });
      }

      renderList.sort((a, b) => a.z - b.z);
      for (const item of renderList) {
        item.draw();
      }
    }

    drawCarbotBean(ctx, x, z, opts) {
      const {
        bodyColor = '#1e293b',
        capeColor = '#eab308',
        trimColor = '#facc15',
        visorColor = '#f97316',
        isCommander = false,
        walkPhase = 0,
        scale = 1,
        label = '',
        stack = []
      } = opts;

      ctx.save();
      ctx.translate(x, z);
      ctx.scale(scale, scale);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      ctx.ellipse(0, 20, 20, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      const capeWave = Math.sin(walkPhase * 1.5) * 4;
      ctx.fillStyle = capeColor;
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-14, -8);
      ctx.lineTo(14, -8);
      ctx.lineTo(19 + capeWave, 19);
      ctx.lineTo(-19 + capeWave, 19);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const footL = Math.sin(walkPhase) * 5;
      const footR = -Math.sin(walkPhase) * 5;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(-8, 18 + footL * 0.4, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(8, 18 + footR * 0.4, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const bounce = Math.abs(Math.sin(walkPhase)) * 2.5;
      ctx.save();
      ctx.translate(0, -bounce);

      ctx.fillStyle = bodyColor;
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-17, -22, 34, 38, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = trimColor;
      ctx.fillRect(-13, 0, 26, 5);

      ctx.fillStyle = visorColor;
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-12, -15, 24, 11, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-6, -12, 4, 2, -0.2, 0, Math.PI * 2);
      ctx.fill();

      if (isCommander) {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-14, -16);
        ctx.lineTo(-25, -27);
        ctx.lineTo(-16, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(14, -16);
        ctx.lineTo(25, -27);
        ctx.lineTo(16, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = bodyColor;
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-18, 3, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(18, 3, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      if (stack && stack.length > 0) {
        const maxDraw = Math.min(stack.length, 14);
        for (let i = 0; i < maxDraw; i++) {
          const entry = stack[i];
          const sy = -30 - i * 11;
          const sway = Math.sin(this.time * 6 + i * 0.4) * (i * 0.45);
          ctx.fillStyle = entry.color || '#facc15';
          ctx.strokeStyle = '#090d14';
          ctx.lineWidth = 2;
          ctx.fillRect(-12 + sway, sy - 6, 24, 10);
          ctx.strokeRect(-12 + sway, sy - 6, 24, 10);
          if (i === maxDraw - 1) {
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(entry.icon || '📦', sway, sy - 11);
          }
        }
      }

      if (label) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, 34);
      }

      ctx.restore();
    }

    drawPlayerCommander(ctx, state) {
      const p = state.player;
      if (p.z < window.GameConfig.WORLD.wallZ + 30) {
        ctx.save();
        ctx.translate(p.x, p.z);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, window.GameConfig.PLAYER.attackRange, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      this.drawCarbotBean(ctx, p.x, p.z, {
        bodyColor: '#1e293b',
        capeColor: '#eab308',
        trimColor: '#facc15',
        visorColor: '#f97316',
        isCommander: true,
        walkPhase: p.walkPhase || 0,
        scale: 1.12,
        label: `🦅 YOU (${p.inventory.length}/${state.getPlayerMaxCapacity()})`,
        stack: p.inventory
      });
    }

    drawSeafWorker(ctx, w) {
      const isAmmo = w.role === 'ammo';
      this.drawCarbotBean(ctx, w.x, w.z, {
        bodyColor: isAmmo ? '#7c2d12' : '#1d4ed8',
        capeColor: isAmmo ? '#f97316' : '#38bdf8',
        trimColor: '#f8fafc',
        visorColor: '#38bdf8',
        isCommander: false,
        walkPhase: w.walkPhase || 0,
        scale: 0.92,
        label: isAmmo ? '🧱 SEAF AMMO' : '🪖 SEAF STAFF',
        stack: w.inventory
      });
    }

    drawHelldiverCustomer(ctx, c) {
      this.drawCarbotBean(ctx, c.x, c.z, {
        bodyColor: c.color || '#1e293b',
        capeColor: '#dc2626',
        trimColor: '#facc15',
        visorColor: '#fb923c',
        isCommander: false,
        walkPhase: c.walkPhase || 0,
        scale: 1.0,
        label: '',
        stack: []
      });

      ctx.save();
      ctx.translate(c.x, c.z - 42);
      ctx.fillStyle = c.state === 'leaving' ? '#16a34a' : '#0f172a';
      ctx.strokeStyle = c.state === 'leaving' ? '#4ade80' : '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-42, -16, 84, 28, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (c.state === 'leaving') {
        ctx.fillText('😊 DEMOCRACY!', 0, -2);
      } else {
        ctx.fillText(`${c.item.icon} ${c.received}/${c.qty}`, 0, -2);
      }
      ctx.restore();
    }

    drawEnemy(ctx, e) {
      ctx.save();
      ctx.translate(e.x, e.z);
      const isHulk = e.type === 'hulk';
      const isBug = e.type === 'bug';
      const scale = isHulk ? 1.45 : (isBug ? 1.0 : 1.05);
      ctx.scale(scale, scale);

      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      if (isBug) {
        ctx.fillStyle = '#65a30d';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 2, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(-8, 12, 4, 0, Math.PI * 2);
        ctx.arc(8, 12, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = isHulk ? '#7f1d1d' : '#334155';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(-18, -20, 36, 36, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, -6, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-4, -7, 3, 0, Math.PI * 2);
        ctx.arc(4, -7, 3, 0, Math.PI * 2);
        ctx.fill();

        if (isHulk) {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(-22, 2, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      const hpRatio = Math.max(0, Math.min(1, e.hp / e.maxHp));
      ctx.fillStyle = '#090d14';
      ctx.fillRect(-20, -32, 40, 7);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-19, -31, 38 * hpRatio, 5);
      ctx.restore();
    }

    drawProjectilesAndArcs(ctx, state) {
      for (const arc of state.flyingArcs) {
        const t = Math.min(1, arc.t / arc.duration);
        const x = arc.sx + (arc.tx - arc.sx) * t;
        const z = arc.sz + (arc.tz - arc.sz) * t - Math.sin(t * Math.PI) * 55;
        ctx.save();
        ctx.translate(x, z);
        ctx.fillStyle = arc.color || '#facc15';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(arc.icon || '📦', 0, 1);
        ctx.restore();
      }

      for (const b of state.tracers) {
        ctx.save();
        ctx.strokeStyle = b.color || '#facc15';
        ctx.lineWidth = b.width || 3.5;
        ctx.beginPath();
        ctx.moveTo(b.sx, b.sz);
        ctx.lineTo(b.tx, b.tz);
        ctx.stroke();
        ctx.restore();
      }

      for (const ex of state.explosions) {
        const p = Math.min(1, ex.t / ex.duration);
        ctx.save();
        ctx.translate(ex.x, ex.z);
        ctx.fillStyle = `rgba(250, 204, 21, ${1 - p})`;
        ctx.strokeStyle = `rgba(239, 68, 68, ${1 - p})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, ex.maxR * p, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  window.WorldRenderer2D = WorldRenderer2D;
})();
