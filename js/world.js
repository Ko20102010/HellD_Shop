// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.06 (All-Episode Carbot Art, Real-Item-Only Split Belts,
//                   7 Dedicated Item Counters & Smart SEAF AI Edition)
// Module: High-DPI 2D Factorio + CarbotAnimations Ep1–Ep10+ Vector World,
//         4600x4000 Zero-Overlap Layout, Real-Packet Conveyor Rendering,
//         Split Raw Belts (Purple E-710 / Cyan Iron), 7 Dedicated Sales Counters,
//         Eagle-1 500kg Flyover Jet Shadow & Live Tactical Mini-Map Radar
// ============================================================================

(function () {
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const radius = Math.min(typeof r === 'number' ? r : 8, w / 2, h / 2);
      this.moveTo(x + radius, y);
      this.arcTo(x + w, y, x + w, y + h, radius);
      this.arcTo(x + w, y + h, x, y + h, radius);
      this.arcTo(x, y + h, x, y, radius);
      this.arcTo(x, y, x + w, y, radius);
      this.closePath();
      return this;
    };
  }

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

      this.camX = -120;
      this.camZ = 220;
      this.zoom = 0.54;
      this.targetZoom = 0.54;
      this.shakeTimer = 0;
      this.shakeIntensity = 0;

      this.beltPhase = 0;
      this.time = 0;

      this.craters = [];
      for (let i = 0; i < 68; i++) {
        const seed = (i * 9301 + 49297) % 233280;
        const rx = ((seed / 233280) - 0.5) * 3400;
        const rz = -260 - ((i * 4177) % 1580);
        const rad = 26 + (i % 6) * 12;
        this.craters.push({ x: rx, z: rz, r: rad });
      }

      this.handleResize();
      window.addEventListener('resize', () => this.handleResize());

      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.07 : 0.07;
        this.setZoom(this.targetZoom + delta);
      }, { passive: false });
    }

    setZoom(z) {
      this.targetZoom = Math.max(0.26, Math.min(1.35, z));
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

    getPointAlongPath(pts, progress) {
      if (!pts || pts.length === 0) return { x: 0, z: 0, angle: 0 };
      if (pts.length === 1) return { x: pts[0].x, z: pts[0].z, angle: 0 };
      const clamped = Math.max(0, Math.min(1, progress));
      let totalLen = 0;
      const segLens = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const d = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].z - pts[i].z);
        segLens.push(d);
        totalLen += d;
      }
      if (totalLen <= 0.001) return { x: pts[0].x, z: pts[0].z, angle: 0 };
      let targetDist = clamped * totalLen;
      for (let i = 0; i < segLens.length; i++) {
        const sLen = segLens[i];
        if (targetDist <= sLen || i === segLens.length - 1) {
          const t = sLen > 0 ? (targetDist / sLen) : 0;
          const a = pts[i];
          const b = pts[i + 1];
          return {
            x: a.x + (b.x - a.x) * t,
            z: a.z + (b.z - a.z) * t,
            angle: Math.atan2(b.z - a.z, b.x - a.x)
          };
        }
        targetDist -= sLen;
      }
      const last = pts[pts.length - 1];
      return { x: last.x, z: last.z, angle: 0 };
    }

    render(state, dt) {
      this.time += dt;
      this.beltPhase = (this.beltPhase + dt * 52) % 24;
      this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * 10);

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

      ctx.fillStyle = '#090d14';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.translate(this.width * 0.5 + shakeX, this.height * 0.5 + shakeY);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-this.camX, -this.camZ);

      this.drawTerrainAndGrid(ctx, state);
      this.drawConveyorNetwork(ctx, state);
      this.drawFloorPads(ctx, state);
      this.drawThreeLayerGates(ctx, state);
      this.drawRawQuarryAndAmmoPress(ctx, state);
      this.drawArsenalFactories(ctx, state);
      this.drawDedicatedCountersAndCash(ctx, state);
      this.drawBeltPackets(ctx, state);
      this.drawWarZoneObjects(ctx, state);
      this.drawSortedEntities(ctx, state);
      this.drawProjectilesAndArcs(ctx, state);
      this.drawEagleFlyover(ctx, state);
      ctx.restore();

      // Draw Live Tactical Mini-Map Radar in Screen Space (Bottom-Right above buttons)
      this.drawMiniMapRadar(ctx, state);

      ctx.restore();
    }

    // ========================================================================
    // LIVE TACTICAL MINI-MAP RADAR (4600x4000 Base with 7 Lanes & 3 Gates)
    // ========================================================================
    drawMiniMapRadar(ctx, state) {
      if (this.width < 640) return;
      const mw = 164;
      const mh = 148;
      const mx = this.width - mw - 14;
      const my = this.height - mh - 76;
      const W = window.GameConfig.WORLD;
      const worldW = W.maxX - W.minX;
      const worldH = W.maxZ - W.minZ;

      const toMiniX = (wx) => mx + ((wx - W.minX) / worldW) * mw;
      const toMiniY = (wz) => my + ((wz - W.minZ) / worldH) * mh;

      ctx.save();
      ctx.fillStyle = 'rgba(9, 13, 20, 0.90)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(mx, my, mw, mh, 8);
      ctx.fill();
      ctx.stroke();

      // Sector A (Quarry)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.fillRect(toMiniX(-2080), toMiniY(-120), (1050 / worldW) * mw, (2050 / worldH) * mh);
      // Sector B (7 Factory Lanes)
      ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
      ctx.fillRect(toMiniX(-990), toMiniY(-120), (1040 / worldW) * mw, (2050 / worldH) * mh);
      // Sector C (7 Dedicated Item Counters & Queues)
      ctx.fillStyle = 'rgba(34, 197, 94, 0.18)';
      ctx.fillRect(toMiniX(120), toMiniY(-120), (2080 / worldW) * mw, (2050 / worldH) * mh);

      // 3 Gate Layers on minimap
      for (const g of window.GameConfig.GATES) {
        const gs = state.gates[g.id];
        const gy = toMiniY(g.z);
        ctx.strokeStyle = gs?.broken ? '#ef4444' : g.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toMiniX(W.corridorMinX), gy);
        ctx.lineTo(toMiniX(W.corridorMaxX), gy);
        ctx.stroke();
      }

      // 7 Dedicated Counters on minimap (green dots)
      for (const item of window.GameConfig.ITEMS) {
        if (!state.unlocked[item.id]) continue;
        ctx.fillStyle = item.color;
        ctx.fillRect(toMiniX(item.counterPos.x) - 2, toMiniY(item.counterPos.z) - 1.5, 4, 3);
      }

      // Enemies on minimap (red/purple dots)
      for (const e of state.enemies) {
        ctx.fillStyle = (e.type === 'titan' || e.type === 'strider') ? '#a855f7' : '#ef4444';
        ctx.beginPath();
        ctx.arc(toMiniX(e.x), toMiniY(e.z), (e.type === 'titan' || e.type === 'strider' || e.type === 'hulk') ? 3.5 : 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Player on minimap (pulsing gold dot)
      const px = toMiniX(state.player.x);
      const py = toMiniY(state.player.z);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(px, py, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 9.5px Orbitron, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('📡 RADAR (7 LANES)', mx + 6, my + 12);
      ctx.restore();
    }

    // ========================================================================
    // LIVE ANIMATED 2D CHARACTER SHOWCASE CARD RENDERER (16 UNITS — EP1 TO EP10+)
    // ========================================================================
    renderCharacterPreviewCard(canvas, charDef, phase) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = 150;
      const ch = 136;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const grad = ctx.createRadialGradient(cw / 2, ch / 2, 10, cw / 2, ch / 2, 80);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#090d14');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cw; gx += 25) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, ch);
        ctx.stroke();
      }
      for (let gy = 0; gy < ch; gy += 25) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(cw, gy);
        ctx.stroke();
      }

      const cx = cw * 0.5;
      const cy = ch * 0.62;

      if (charDef.renderType === 'bean') {
        const ro = charDef.renderOpts || {};
        this.drawCarbotBean(ctx, cx, cy, {
          bodyColor: ro.bodyColor,
          capeColor: ro.capeColor,
          trimColor: ro.trimColor,
          visorColor: ro.visorColor,
          isCommander: ro.isCommander,
          hasRifle: ro.hasRifle,
          weaponId: 'w_liberator',
          walkPhase: phase * 6,
          scale: 1.40,
          label: '',
          stack: ro.stack || []
        });

        if (ro.hasDrone) {
          this.drawGuardDogDrone(ctx, cx + Math.cos(phase * 3) * 38, cy - 28 + Math.sin(phase * 3) * 12, phase);
        }

        if (ro.orderBubble) {
          ctx.save();
          ctx.translate(cx, cy - 52);
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-36, -13, 72, 24, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 12px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ro.orderBubble, 0, -1);
          ctx.restore();
        }
      } else if (charDef.renderType === 'enemy') {
        const type = charDef.renderOpts?.type || 'trooper';
        let previewScale = 1.45;
        if (type === 'titan' || type === 'strider') previewScale = 1.18;
        else if (type === 'hulk' || type === 'devastator' || type === 'spewer') previewScale = 1.38;
        this.drawEnemy(ctx, {
          type,
          x: cx,
          z: cy + 6,
          hp: 100,
          maxHp: 100,
          previewScale,
          phase
        });
      } else if (charDef.renderType === 'mech') {
        this.drawPatriotMechSprite(ctx, cx, cy + 4, phase, 1.32, true);
      } else if (charDef.renderType === 'vehicle') {
        this.drawReconVehicleSprite(ctx, cx, cy + 6, phase, 1.32, true);
      } else if (charDef.renderType === 'turret') {
        this.drawSingleTurretMount(
          ctx,
          cx,
          cy + 4,
          '#facc15',
          36,
          50,
          Math.sin(phase * 2.2) * 0.7 - Math.PI / 2,
          (Math.floor(phase * 6) % 2 === 0) ? this.time : -10,
          'GATE 3/2/1 SENTRY'
        );
      }

      ctx.restore();
    }

    drawGuardDogDrone(ctx, x, z, phase = 0) {
      ctx.save();
      ctx.translate(x, z);
      const bob = Math.sin(phase * 6) * 3;
      ctx.translate(0, bob);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-12, -6, 7, 0, Math.PI * 2);
      ctx.arc(12, -6, 7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-11, -7, 22, 14, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawPatriotMechSprite(ctx, x, z, phase = 0, scale = 1, showPilot = false, stack = []) {
      ctx.save();
      ctx.translate(x, z);
      ctx.scale(scale, scale);
      const step = Math.sin(phase * 5) * 4.5;

      ctx.fillStyle = 'rgba(0,0,0,0.48)';
      ctx.beginPath();
      ctx.ellipse(0, 26, 28, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3.5;
      ctx.fillRect(-17, 6 + step * 0.5, 11, 18);
      ctx.strokeRect(-17, 6 + step * 0.5, 11, 18);
      ctx.fillRect(6, 6 - step * 0.5, 11, 18);
      ctx.strokeRect(6, 6 - step * 0.5, 11, 18);

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(-24, -28, 48, 38, 9);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-15, -15, 30, 8);
      ctx.strokeRect(-15, -15, 30, 8);

      if (showPilot) {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(-14, -28);
        ctx.lineTo(-24, -38);
        ctx.lineTo(-8, -28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(14, -28);
        ctx.lineTo(24, -38);
        ctx.lineTo(8, -28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-36, -24, 12, 26);
      ctx.strokeRect(-36, -24, 12, 26);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-30, -16, 2.8, 0, Math.PI * 2);
      ctx.arc(-30, -6, 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.fillRect(24, -18, 15, 20);
      ctx.strokeRect(24, -18, 15, 20);

      if (stack && stack.length > 0) {
        const maxDraw = Math.min(stack.length, 14);
        for (let i = 0; i < maxDraw; i++) {
          const entry = stack[i];
          const sy = -36 - i * 9;
          ctx.fillStyle = entry.color || '#facc15';
          ctx.strokeStyle = '#090d14';
          ctx.lineWidth = 2;
          ctx.fillRect(-12, sy - 5, 24, 8);
          ctx.strokeRect(-12, sy - 5, 24, 8);
        }
      }

      ctx.restore();
    }

    drawReconVehicleSprite(ctx, x, z, phase = 0, scale = 1, showPilot = false, stack = []) {
      ctx.save();
      ctx.translate(x, z);
      ctx.scale(scale, scale);
      const bounce = Math.abs(Math.sin(phase * 8)) * 2;

      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 20, 32, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(0, -bounce);

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-18, 13, 9, 0, Math.PI * 2);
      ctx.arc(18, 13, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.roundRect(-28, -12, 56, 24, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.fillRect(-14, -23, 28, 12);
      ctx.strokeRect(-14, -23, 28, 12);

      ctx.fillStyle = '#334155';
      ctx.fillRect(4, -30, 24, 6);
      ctx.strokeRect(4, -30, 24, 6);

      if (stack && stack.length > 0) {
        const maxDraw = Math.min(stack.length, 12);
        for (let i = 0; i < maxDraw; i++) {
          const entry = stack[i];
          const sy = -34 - i * 8;
          ctx.fillStyle = entry.color || '#facc15';
          ctx.strokeStyle = '#090d14';
          ctx.lineWidth = 2;
          ctx.fillRect(-24, sy, 20, 7);
          ctx.strokeRect(-24, sy, 20, 7);
        }
      }

      ctx.restore();
    }

    // ========================================================================
    // 1. TERRAIN, SECTORS & 3-LAYER WAR CORRIDOR (4600 x 4000 ZERO OVERLAP)
    // ========================================================================
    drawTerrainAndGrid(ctx, state) {
      const W = window.GameConfig.WORLD;

      const warGrad = ctx.createLinearGradient(0, W.minZ, 0, W.wallZ);
      warGrad.addColorStop(0, '#1a1025');
      warGrad.addColorStop(0.5, '#231f33');
      warGrad.addColorStop(1, '#2b3248');
      ctx.fillStyle = warGrad;
      ctx.fillRect(W.minX - 150, W.minZ - 150, (W.maxX - W.minX) + 300, (W.wallZ - W.minZ) + 150);

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.fillRect(W.minX, W.minZ, W.corridorMinX - W.minX, W.wallZ - W.minZ);
      ctx.strokeRect(W.minX, W.minZ, W.corridorMinX - W.minX, W.wallZ - W.minZ);
      ctx.fillRect(W.corridorMaxX, W.minZ, W.maxX - W.corridorMaxX, W.wallZ - W.minZ);
      ctx.strokeRect(W.corridorMaxX, W.minZ, W.maxX - W.corridorMaxX, W.wallZ - W.minZ);

      ctx.save();
      ctx.fillStyle = 'rgba(248, 113, 113, 0.28)';
      ctx.font = '900 22px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      const waveBanner = state.waveState === 'rest'
        ? `⏳ WAVE ${state.waveNumber} INCOMING IN ${Math.ceil(state.waveTimer)}s (REST & REPAIR TIME)`
        : `🚨 WAVE ${state.waveNumber} ACTIVE — ${state.enemies.length + state.waveEnemiesToSpawn} ENEMIES REMAINING!`;
      ctx.fillText(waveBanner, 0, -1760);
      ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
      ctx.fillText('🛡️ OUTER DEFENSE ZONE (BETWEEN GATE 3 & GATE 2)', 0, -1040);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillText('🛡️ INNER CITADEL ZONE (BETWEEN GATE 2 & CORE GATE 1)', 0, -560);
      ctx.restore();

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

      ctx.fillStyle = '#141c2b';
      ctx.fillRect(W.minX, W.wallZ, W.maxX - W.minX, W.maxZ - W.wallZ);

      // Sector A: Raw Quarry & Munitions Press (West)
      this.drawFloorSector(
        ctx,
        -2120,
        -120,
        1080,
        2050,
        '#112236',
        '#38bdf8',
        'SECTOR A: MANUAL HARVEST QUARRY, SPLIT AUTO-DRILLS (🛢️ E-710 / ⛏️ IRON) & AMMO PRESS'
      );

      // Sector B: 7 Parallel Arsenal Production Lanes (Center)
      this.drawFloorSector(
        ctx,
        -1000,
        -120,
        1060,
        2050,
        '#1b2434',
        '#facc15',
        'SECTOR B: 7 ARSENAL PRODUCTION LANES (SPLIT RAW HOPPERS ➔ FABRICATOR ➔ OUTPUT PAD)'
      );

      // Sector C: 7 Dedicated Item Sales Counters, Cash Stacks & Customer Queues (East)
      this.drawFloorSector(
        ctx,
        100,
        -120,
        2150,
        2050,
        '#142924',
        '#22c55e',
        'SECTOR C: 7 DEDICATED ITEM SALES COUNTERS (1 ITEM = 1 COUNTER + DEDICATED QUEUE & CASH STACK)'
      );

      // Subtle horizontal lane dividers across Sector B & Sector C for each of the 7 items
      for (const item of window.GameConfig.ITEMS) {
        const rz = item.stationPos.z;
        ctx.save();
        ctx.strokeStyle = state.unlocked[item.id] ? 'rgba(250, 204, 21, 0.14)' : 'rgba(148, 163, 184, 0.06)';
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 10]);
        ctx.beginPath();
        ctx.moveTo(-980, rz - 135);
        ctx.lineTo(2150, rz - 135);
        ctx.stroke();
        ctx.restore();
      }

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = W.minX; x <= W.maxX; x += 80) {
        ctx.moveTo(x, W.wallZ);
        ctx.lineTo(x, W.maxZ);
      }
      for (let z = W.wallZ; z <= W.maxZ; z += 80) {
        ctx.moveTo(W.minX, z);
        ctx.lineTo(W.maxX, z);
      }
      ctx.stroke();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 16;
      ctx.strokeRect(W.minX, W.minZ, W.maxX - W.minX, W.maxZ - W.minZ);
    }

    drawFloorSector(ctx, x, z, w, h, bg, accent, title) {
      ctx.save();
      ctx.fillStyle = bg;
      ctx.fillRect(x, z, w, h);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.38;
      ctx.lineWidth = 3.5;
      ctx.setLineDash([14, 9]);
      ctx.strokeRect(x, z, w, h);
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = accent;
      ctx.font = '900 14.5px Orbitron, sans-serif';
      ctx.fillText(title, x + 20, z + 30);
      ctx.restore();
    }

    // ========================================================================
    // 2. SPLIT CONVEYOR BELT NETWORK (NO FAKE ITEMS WHEN EMPTY!)
    //    - Belt 1: conv_raw_e710 (Purple #a855f7) -> ONLY E-710 Stations
    //    - Belt 2: conv_raw_iron (Cyan #38bdf8)   -> ONLY Iron Stations & Ammo Press
    //    - Belt 3: conv_counter_auto (Green)      -> 7 Horizontal Lane Belts (Pickup -> Counter #1..7)
    //    - Belts 4–6: conv_gate_1/2/3             -> Ammo Press -> Gate Layers 1/2/3
    // ========================================================================
    drawConveyorNetwork(ctx, state) {
      const AP = window.GameConfig.AMMO_PRESS;
      const gates = window.GameConfig.GATES;

      // 1. PURPLE E-710 FUEL BELT (conv_raw_e710): Connects ONLY E-710 Auto-Pump (-1200, 240) along x = -960
      const e710BeltLvl = state.conveyorLevels?.conv_raw_e710 || 0;
      const e710Items = window.GameConfig.ITEMS.filter((it) => it.recipe.raw_e710 && (state.unlocked[it.id] || it.id === 'cloth'));
      const maxE710Z = e710Items.length > 0 ? Math.max(...e710Items.map((it) => it.inputPos.z)) : 660;
      this.drawBeltPath(ctx, [
        { x: -1200, z: 240 },
        { x: -960, z: 240 },
        { x: -960, z: 120 },
        { x: -960, z: maxE710Z }
      ], e710BeltLvl, '#a855f7');

      for (const item of e710Items) {
        this.drawBeltPath(ctx, [
          { x: -960, z: item.inputPos.z - 12 },
          { x: item.inputPos.x, z: item.inputPos.z - 12 }
        ], e710BeltLvl, '#a855f7');
      }

      // 2. CYAN SUPER IRON BELT (conv_raw_iron): Connects ONLY Super Iron Auto-Drill (-1200, 780) along x = -910
      const ironBeltLvl = state.conveyorLevels?.conv_raw_iron || 0;
      const ironItems = window.GameConfig.ITEMS.filter((it) => it.recipe.raw_iron && (state.unlocked[it.id] || it.id === 'gun'));
      const maxIronZ = ironItems.length > 0 ? Math.max(1320, ...ironItems.map((it) => it.inputPos.z)) : 1320;
      this.drawBeltPath(ctx, [
        { x: -1200, z: 780 },
        { x: -910, z: 780 },
        { x: -910, z: 390 },
        { x: -910, z: maxIronZ }
      ], ironBeltLvl, '#38bdf8');

      // Branch from Iron Belt to Munitions Ammo Press Hopper
      this.drawBeltPath(ctx, [
        { x: -1200, z: 780 },
        { x: -1360, z: 780 },
        { x: AP.inputPos.x, z: AP.inputPos.z }
      ], ironBeltLvl, '#38bdf8');

      for (const item of ironItems) {
        this.drawBeltPath(ctx, [
          { x: -910, z: item.inputPos.z + 12 },
          { x: item.inputPos.x, z: item.inputPos.z + 12 }
        ], ironBeltLvl, '#38bdf8');
      }

      // 3. GATE TURRET AMMO BELTS (conv_gate_1, conv_gate_2, conv_gate_3)
      for (const g of gates) {
        const beltLvl = state.conveyorLevels?.[g.conveyorId] || 0;
        const path = [
          { x: AP.padX, z: AP.padZ },
          { x: -860, z: AP.padZ },
          { x: -860, z: g.turretZ },
          { x: g.leftTurretX, z: g.turretZ }
        ];
        this.drawBeltPath(ctx, path, beltLvl, g.color);
      }

      // 4. 7 DEDICATED HORIZONTAL OUTPUT-TO-COUNTER BELTS (conv_counter_auto)
      const counterBeltLvl = state.conveyorLevels?.conv_counter_auto || 0;
      for (const item of window.GameConfig.ITEMS) {
        if (!state.unlocked[item.id]) continue;
        this.drawBeltPath(ctx, [
          { x: item.pickupPos.x, z: item.pickupPos.z },
          { x: item.counterPos.x, z: item.counterPos.z }
        ], counterBeltLvl, item.color);
      }
    }

    // Draws ONLY the physical conveyor belt track & animated directional rollers (NO FAKE ITEMS!)
    drawBeltPath(ctx, pts, level, color) {
      if (pts.length < 2) return;
      ctx.save();

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].z);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].z);
      }

      if (!level || level <= 0) {
        // Lv.0 Locked Blueprint Path (NOT automated yet!)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.11)';
        ctx.lineWidth = 16;
        ctx.stroke();
        ctx.strokeStyle = color || 'rgba(250, 204, 21, 0.22)';
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.restore();
        return;
      }

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 24;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 18;
      ctx.stroke();

      const speedMult = 1 + (level - 1) * 0.14;
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
        ctx.globalAlpha = 0.72;
        ctx.lineWidth = 2.4;
        const step = 26;
        const phase = (this.beltPhase * speedMult) % step;
        for (let d = phase; d < len - 6; d += step) {
          ctx.beginPath();
          ctx.moveTo(d - 5, -5);
          ctx.lineTo(d + 3, 0);
          ctx.lineTo(d - 5, 5);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
    }

    // Draws ONLY REAL IN-TRANSIT ITEMS (`state.beltPackets`) moving along unlocked belts!
    drawBeltPackets(ctx, state) {
      if (!state.beltPackets || state.beltPackets.length === 0) return;
      for (const pkt of state.beltPackets) {
        const pt = this.getPointAlongPath(pkt.path, pkt.progress);
        ctx.save();
        ctx.translate(pt.x, pt.z);

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pkt.color || '#facc15';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pkt.icon || '📦', 0, 1);

        if (pkt.qty && pkt.qty > 1) {
          ctx.fillStyle = '#fde047';
          ctx.font = '900 9px Orbitron, sans-serif';
          ctx.fillText(`x${pkt.qty}`, 11, -9);
        }
        ctx.restore();
      }
    }

    // ========================================================================
    // 3. INTERACTIVE TRIGGER PADS (SAFE OFFSETS — NEVER CRUSH PLAYER!)
    // ========================================================================
    drawFloorPads(ctx, state) {
      const L = window.GameConfig.LOCATIONS;

      this.drawPadBox(
        ctx,
        L.armoryLoadoutPad.x,
        L.armoryLoadoutPad.z,
        168,
        104,
        '#a855f7',
        '🛡️ EQUIP LOADOUT',
        'Weapons, Guard Dog & Mechs'
      );

      // Conveyor Belt Pads (Lv.0 Locked -> Lv.1..20 Upgrade!)
      for (const c of window.GameConfig.CONVEYORS) {
        const lvl = state.conveyorLevels?.[c.id] || 0;
        const isMax = lvl >= c.maxLevel;
        const rem = Math.max(0, state.conveyorRemaining?.[c.id] ?? state.getConveyorUpgradeCost(c.id));
        const activeCount = (state.beltPackets || []).filter((p) => p.beltId === c.id).length;
        const title = isMax
          ? `${c.icon} BELT MAX (Lv.20)`
          : (lvl === 0 ? `🔓 UNLOCK BELT $${rem}` : `⬆️ BELT Lv.${lvl + 1}/20 ($${rem})`);
        const sub = lvl === 0
          ? `${c.name} (Off)`
          : (activeCount > 0 ? `Lv.${lvl}/20 — Moving ${activeCount} Load(s)` : `Lv.${lvl}/20 — Idle (Waiting Stock)`);
        this.drawPadBox(ctx, c.padX, c.padZ, 184, 82, c.color, title, sub);
      }

      // Item Unlock & Machine Level 1..20 Upgrade Pads (Safely offset +118px South of stationPos!)
      for (const item of window.GameConfig.ITEMS) {
        const isUnlocked = !!state.unlocked[item.id];
        const st = state.stations[item.id];
        const lvl = st ? (st.level || 0) : 0;

        if (!isUnlocked) {
          // Draw blueprint placeholder box at stationPos (Non-solid until unlocked!)
          ctx.save();
          ctx.translate(item.stationPos.x, item.stationPos.z);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 6]);
          ctx.fillRect(-56, -56, 112, 112);
          ctx.strokeRect(-56, -56, 112, 112);
          ctx.setLineDash([]);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '900 12px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`🔒 ${item.icon} ${item.shortName.toUpperCase()}`, 0, -4);
          ctx.font = '700 11px Rajdhani, sans-serif';
          ctx.fillText(`Blueprint Site (Stand Below to Build)`, 0, 14);
          ctx.restore();

          // Locked Counter Blueprint Placeholder in Sector C
          ctx.save();
          ctx.translate(item.counterPos.x, item.counterPos.z);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.fillRect(-70, -44, 140, 88);
          ctx.strokeRect(-70, -44, 140, 88);
          ctx.setLineDash([]);
          ctx.fillStyle = '#64748b';
          ctx.font = '900 11px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`🔒 ${item.icon} COUNTER #${item.tier}`, 0, 4);
          ctx.restore();

          const rem = Math.max(0, state.unlockRemaining[item.id] ?? item.unlockCost);
          this.drawPadBox(
            ctx,
            item.unlockPos.x,
            item.unlockPos.z,
            184,
            82,
            item.color,
            `🔓 UNLOCK ${item.icon} $${rem}`,
            `${item.shortName} (${item.recipeText})`
          );
        } else {
          // Machine is unlocked -> Show Lv.1..20 Upgrade Pad at item.unlockPos!
          const isMax = lvl >= item.maxLevel;
          const upgCost = state.getStationUpgradeCost ? state.getStationUpgradeCost(item.id) : 100;
          this.drawPadBox(
            ctx,
            item.unlockPos.x,
            item.unlockPos.z,
            184,
            72,
            isMax ? '#4ade80' : item.color,
            isMax ? `✅ ${item.icon} MAX Lv.20` : `⬆️ UPGRADE ${item.icon} Lv.${lvl + 1}/20 ($${upgCost})`,
            `Lv.${lvl}/20 | +15% Speed & +12% Value`
          );
        }
      }
    }

    drawPadBox(ctx, x, z, w, h, color, title, subtitle) {
      ctx.save();
      ctx.translate(x, z);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
      ctx.fillRect(-w / 2, -h / 2, w, h);

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = '900 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, 0, -5);

      if (subtitle) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 11px Rajdhani, sans-serif';
        ctx.fillText(subtitle, 0, 14);
      }
      ctx.restore();
    }

    // ========================================================================
    // 4. THREE SEQUENTIAL DEFENSE GATE LAYERS (Lv.1–20 | BROKEN = NO AUTO-HEAL)
    // ========================================================================
    drawThreeLayerGates(ctx, state) {
      const W = window.GameConfig.WORLD;
      const gates = window.GameConfig.GATES;
      const cMinX = W.corridorMinX;
      const cMaxX = W.corridorMaxX;
      const halfOpen = W.gateOpeningWidth * 0.5;

      for (const g of gates) {
        const gs = state.gates[g.id];
        if (!gs) continue;
        const wallY = g.z;
        const isBroken = !!gs.broken || gs.hp <= 0;
        const defLvl = gs.defenseLevel || 1;
        const isMax = defLvl >= (g.maxLevel || 20);
        const upgCost = state.getGateUpgradeCost ? state.getGateUpgradeCost(g.id) : 160;

        ctx.save();
        ctx.fillStyle = isBroken ? '#334155' : '#1e293b';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;

        ctx.fillRect(cMinX, wallY - 22, (-halfOpen) - cMinX, 44);
        ctx.strokeRect(cMinX, wallY - 22, (-halfOpen) - cMinX, 44);

        ctx.fillRect(halfOpen, wallY - 22, cMaxX - halfOpen, 44);
        ctx.strokeRect(halfOpen, wallY - 22, cMaxX - halfOpen, 44);

        ctx.fillStyle = g.color;
        ctx.fillRect(cMinX + 16, wallY - 5, (-halfOpen) - cMinX - 32, 10);
        ctx.fillRect(halfOpen + 16, wallY - 5, cMaxX - halfOpen - 32, 10);

        ctx.translate(g.x, g.z);

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 3.5;
        ctx.fillRect(-halfOpen - 16, -30, 28, 60);
        ctx.strokeRect(-halfOpen - 16, -30, 28, 60);
        ctx.fillRect(halfOpen - 12, -30, 28, 60);
        ctx.strokeRect(halfOpen - 12, -30, 28, 60);

        const hpRatio = Math.max(0, Math.min(1, gs.hp / gs.maxHp));
        const underAttack = (this.time - (gs.lastHitTime || -10)) < 0.6;

        // Carbot panic sweat drops when gate HP is low!
        if (!isBroken && hpRatio < 0.45) {
          ctx.font = '16px sans-serif';
          ctx.fillText('💧', -halfOpen - 28, -22 + Math.sin(this.time * 9) * 5);
          ctx.fillText('💧', halfOpen + 24, -22 + Math.cos(this.time * 9) * 5);
        }

        if (isBroken) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
          ctx.fillRect(-halfOpen + 12, -14, W.gateOpeningWidth - 24, 28);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 8]);
          ctx.strokeRect(-halfOpen + 12, -14, W.gateOpeningWidth - 24, 28);
          ctx.setLineDash([]);

          ctx.fillStyle = '#fca5a5';
          ctx.font = '900 13px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`💥 ${g.shortName.toUpperCase()} BROKEN! (NO AUTO-HEAL — REPAIR ON PAD!)`, 0, 5);
        } else {
          ctx.fillStyle = underAttack ? 'rgba(239, 68, 68, 0.48)' : 'rgba(56, 189, 248, 0.24)';
          ctx.fillRect(-halfOpen + 12, -14, W.gateOpeningWidth - 24, 28);
          ctx.strokeStyle = underAttack ? '#ef4444' : g.color;
          ctx.lineWidth = 3.5;
          ctx.setLineDash([12, 6]);
          ctx.strokeRect(-halfOpen + 12, -14, W.gateOpeningWidth - 24, 28);
          ctx.setLineDash([]);
        }

        const barW = 300;
        const barH = 20;
        ctx.fillStyle = '#090d14';
        ctx.fillRect(-barW / 2, -58, barW, barH);
        ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.25 ? '#facc15' : '#ef4444');
        ctx.fillRect(-barW / 2 + 2, -56, (barW - 4) * hpRatio, barH - 4);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-barW / 2, -58, barW, barH);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11.5px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `🛡️ LAYER ${g.layerOrder} — ${g.shortName.toUpperCase()} (Lv.${defLvl}/20): ${Math.ceil(gs.hp)}/${gs.maxHp} HP`,
          0,
          -44
        );
        ctx.restore();

        this.drawPadBox(
          ctx,
          g.ammoPadX,
          g.ammoPadZ,
          178,
          76,
          isBroken ? '#ef4444' : '#f97316',
          isBroken ? `🔧 MANUAL REBUILD (${Math.ceil(gs.hp)}/${gs.maxHp})` : `🧱 LOAD AMMO & REPAIR`,
          isBroken ? `Stand Here to Repair Broken Gate!` : `Ammo: ${gs.ammo}/${gs.maxAmmo || g.maxAmmo} | +HP Repair`
        );

        this.drawPadBox(
          ctx,
          g.upgradePadX,
          g.upgradePadZ,
          176,
          76,
          isMax ? '#4ade80' : g.color,
          isMax ? `✅ FORTIFIED MAX Lv.20` : `⬆️ FORTIFY Lv.${defLvl + 1}/20 ($${upgCost})`,
          `+Max HP & Dual Turret DMG`
        );

        this.drawSingleTurretMount(
          ctx,
          g.leftTurretX,
          g.turretZ,
          g.color,
          gs.ammo,
          gs.maxAmmo || g.maxAmmo,
          gs.turretAngle ?? -Math.PI / 2,
          gs.lastFireTime,
          `${g.shortName} L-Sentry`
        );
        this.drawSingleTurretMount(
          ctx,
          g.rightTurretX,
          g.turretZ,
          g.color,
          gs.ammo,
          gs.maxAmmo || g.maxAmmo,
          gs.turretAngle ?? -Math.PI / 2,
          gs.lastFireTime,
          `${g.shortName} R-Sentry`
        );
      }
    }

    drawSingleTurretMount(ctx, tx, tz, color, ammo, maxAmmo, angle, lastFireTime, labelText) {
      ctx.save();
      ctx.translate(tx, tz);

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const ammoRatio = Math.max(0, Math.min(1, ammo / Math.max(1, maxAmmo)));
      ctx.strokeStyle = ammo > 0 ? '#f97316' : '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ammoRatio);
      ctx.stroke();

      ctx.save();
      ctx.rotate(angle ?? -Math.PI / 2);

      const kick = (this.time - (lastFireTime || 0)) < 0.12 ? -5 : 0;
      ctx.translate(kick, 0);

      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3;
      ctx.fillRect(6, -11, 28, 7);
      ctx.strokeRect(6, -11, 28, 7);
      ctx.fillRect(6, 4, 28, 7);
      ctx.strokeRect(6, 4, 28, 7);

      if ((this.time - (lastFireTime || 0)) < 0.08) {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(38, -7, 7, 0, Math.PI * 2);
        ctx.arc(38, 7, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = ammo > 0 ? 'rgba(15, 23, 42, 0.9)' : 'rgba(185, 28, 28, 0.95)';
      ctx.fillRect(-56, 30, 112, 20);
      ctx.strokeStyle = ammo > 0 ? '#f97316' : '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-56, 30, 112, 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10.5px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        ammo > 0 ? `🧱 ${ammo}/${maxAmmo} (${labelText})` : `⚠️ NO AMMO (搬🧱!)`,
        0,
        44
      );

      ctx.restore();
    }

    // ========================================================================
    // 5. SECTOR A: MANUAL HARVEST QUARRY + AUTO-MINING RIGS (Lv.0 Locked -> Lv.20)
    // ========================================================================
    drawRawQuarryAndAmmoPress(ctx, state) {
      for (const raw of window.GameConfig.RAW_EXTRACTORS) {
        const rs = state.rawExtractors[raw.id];
        const lvl = rs ? rs.level : 0;
        const isMax = lvl >= (raw.maxLevel || 20);
        const stock = rs ? rs.stock : 0;
        const maxBuf = rs ? rs.maxBuffer : raw.baseBuffer;
        const upgradeCost = state.getRawUpgradeCost ? state.getRawUpgradeCost(raw.id) : 110;

        // A. Manual Harvest Field (Available at Start!)
        const hp = raw.harvestPos;
        ctx.save();
        ctx.translate(hp.x, hp.z);

        ctx.fillStyle = raw.id === 'raw_iron' ? 'rgba(56, 189, 248, 0.14)' : 'rgba(168, 85, 247, 0.14)';
        ctx.beginPath();
        ctx.arc(0, 0, hp.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = raw.color;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 + this.time * 0.25;
          const nx = Math.cos(ang) * 68;
          const nz = Math.sin(ang) * 58;
          const pulse = 1 + Math.sin(this.time * 4 + i) * 0.12;
          ctx.save();
          ctx.translate(nx, nz);
          ctx.scale(pulse, pulse);
          ctx.fillStyle = raw.color;
          ctx.strokeStyle = '#090d14';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(raw.itemIcon, 0, 1);
          ctx.restore();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 13px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${raw.itemIcon} MANUAL ${raw.shortName.toUpperCase()}`, 0, -hp.radius - 18);
        ctx.fillStyle = '#fde047';
        ctx.font = '700 12px Rajdhani, sans-serif';
        ctx.fillText(`✋ Walk Inside to Harvest ${raw.itemIcon} by Hand!`, 0, -hp.radius - 2);
        ctx.restore();

        // B. Auto-Extractor Rig Bay (Starts at Lv.0 Locked -> Upgrades Lv.1..20)
        ctx.save();
        ctx.translate(raw.x, raw.z);

        ctx.fillStyle = lvl > 0 ? '#1e293b' : 'rgba(15, 23, 42, 0.45)';
        ctx.strokeStyle = lvl > 0 ? '#090d14' : 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 4;
        ctx.fillRect(-105, -75, 210, 150);
        ctx.strokeRect(-105, -75, 210, 150);

        if (lvl <= 0) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '900 13px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`🔒 AUTO ${raw.shortName.toUpperCase()} (LOCKED Lv.0/20)`, 0, -6);
          ctx.fillStyle = '#fde047';
          ctx.font = '700 12px Rajdhani, sans-serif';
          ctx.fillText(`Stand on Pad Below ($${upgradeCost}) to Build Auto-Rig!`, 0, 16);
        } else {
          const visibleRigs = Math.min(5, 1 + Math.floor((lvl - 1) / 4));
          const rigOffsets = [
            { x: 0, z: 0 },
            { x: -55, z: -28 },
            { x: 55, z: -28 },
            { x: -55, z: 28 },
            { x: 55, z: 28 }
          ];
          for (let rIdx = 0; rIdx < visibleRigs; rIdx++) {
            const ro = rigOffsets[rIdx];
            ctx.save();
            ctx.translate(ro.x, ro.z);
            const rigScale = visibleRigs === 1 ? 0.95 : 0.62;
            ctx.scale(rigScale, rigScale);
            ctx.rotate(this.time * (2.0 + lvl * 0.25) + rIdx);
            ctx.fillStyle = raw.color;
            ctx.strokeStyle = '#090d14';
            ctx.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
              ctx.rotate(Math.PI / 3);
              ctx.fillRect(-7, -38, 14, 76);
              ctx.strokeRect(-7, -38, 14, 76);
            }
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }

          const prog = rs ? (rs.progress / rs.cycleTime) : 0;
          ctx.fillStyle = '#090d14';
          ctx.fillRect(-90, 56, 180, 12);
          ctx.fillStyle = raw.color;
          ctx.fillRect(-88, 58, 176 * Math.min(1, prog), 8);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 13px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${raw.icon} AUTO ${raw.shortName.toUpperCase()} (Lv.${lvl}/20 — ${visibleRigs} RIGS)`, 0, -88);
          ctx.fillStyle = '#facc15';
          ctx.font = '700 12px Rajdhani, sans-serif';
          ctx.fillText(`Auto Rate: ${(1 / (rs?.cycleTime || 1.5)).toFixed(1)}/s | Stored: ${stock}/${maxBuf}`, 0, -72);
        }
        ctx.restore();

        if (lvl > 0) {
          this.drawPadBox(
            ctx,
            raw.pickupX,
            raw.pickupZ,
            152,
            80,
            raw.color,
            `📤 PICKUP ${raw.itemIcon} (${stock}/${maxBuf})`,
            `Take Raw ${raw.shortName} to Hoppers`
          );
        }

        this.drawPadBox(
          ctx,
          raw.padX,
          raw.padZ,
          184,
          80,
          isMax ? '#4ade80' : raw.color,
          isMax ? `✅ MAX SCALE Lv.20` : (lvl === 0 ? `🔓 UNLOCK AUTO ${raw.itemIcon} ($${upgradeCost})` : `⬆️ UPGRADE Lv.${lvl + 1}/20 ($${upgradeCost})`),
          lvl === 0 ? `Automates ${raw.shortName} Extraction` : `Expand Rigs, Buffer & Speed`
        );
      }

      // E. Munitions Ammo Press (Starts Locked Lv.0 -> Upgrades Lv.1..20!)
      const AP = window.GameConfig.AMMO_PRESS;
      const apLvl = state.ammoPress.level || 0;
      const apMax = apLvl >= (AP.maxLevel || 20);
      const ammoStock = state.ammoPress.stock;
      const ammoInIron = state.ammoPress.inputStock?.raw_iron || 0;
      const ammoProg = state.ammoPress.progress / state.ammoPress.cycleTime;
      const apCost = state.getAmmoPressUpgradeCost ? state.getAmmoPressUpgradeCost() : AP.unlockCost;

      if (apLvl <= 0) {
        ctx.save();
        ctx.translate(AP.x, AP.z);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.fillRect(-60, -60, 120, 120);
        ctx.strokeRect(-60, -60, 120, 120);
        ctx.setLineDash([]);
        ctx.fillStyle = '#fdba74';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🔒 🧱 MUNITIONS PRESS (Lv.0/20)`, 0, -4);
        ctx.font = '700 11px Rajdhani, sans-serif';
        ctx.fillText(`Unlock Below ($${apCost}) to Craft Turret Ammo`, 0, 14);
        ctx.restore();
      } else {
        this.drawStationConnectorPipe(ctx, AP.inputPos, { x: AP.x, z: AP.z }, { x: AP.padX, z: AP.padZ }, '#f97316');

        this.drawPadBox(
          ctx,
          AP.inputPos.x,
          AP.inputPos.z,
          155,
          82,
          ammoInIron > 0 ? '#38bdf8' : '#ef4444',
          `📥 AMMO HOPPER: ⛏️${ammoInIron}`,
          ammoInIron > 0 ? `Recipe: 1⛏️ ➔ 3🧱 Ammo` : `⚠️ DROP ⛏️ IRON HERE!`
        );

        ctx.save();
        ctx.translate(AP.x, AP.z);
        ctx.fillStyle = '#27272a';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;
        ctx.fillRect(-62, -62, 124, 124);
        ctx.strokeRect(-62, -62, 124, 124);

        const stampScale = ammoInIron > 0 ? (0.85 + 0.15 * Math.sin(this.time * 8)) : 0.9;
        ctx.save();
        ctx.scale(stampScale, stampScale);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-32, -32, 64, 64);
        ctx.strokeRect(-32, -32, 64, 64);
        ctx.restore();

        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧱', 0, -2);

        ctx.fillStyle = '#090d14';
        ctx.fillRect(-52, 42, 104, 12);
        ctx.fillStyle = ammoInIron > 0 ? '#f97316' : '#ef4444';
        ctx.fillRect(-50, 44, 100 * Math.min(1, ammoProg), 8);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 12.5px Orbitron, sans-serif';
        ctx.fillText(`🧱 MUNITIONS PRESS (Lv.${apLvl}/20)`, 0, -72);
        ctx.restore();

        this.drawPadBox(
          ctx,
          AP.padX,
          AP.padZ,
          158,
          82,
          '#f97316',
          `📤 PICKUP 🧱 AMMO (${ammoStock}/${state.ammoPress.maxBuffer})`,
          `Carry (搬) to Gate Layers 3/2/1`
        );
      }

      this.drawPadBox(
        ctx,
        AP.unlockPos.x,
        AP.unlockPos.z,
        182,
        74,
        apMax ? '#4ade80' : '#f97316',
        apMax ? `✅ AMMO PRESS MAX Lv.20` : (apLvl === 0 ? `🔓 UNLOCK 🧱 PRESS ($${apCost})` : `⬆️ UPGRADE PRESS Lv.${apLvl + 1}/20 ($${apCost})`),
        `1x ⛏️ Iron ➔ 3x 🧱 Turret Ammo`
      );
    }

    drawStationConnectorPipe(ctx, inPos, stPos, outPos, color) {
      ctx.save();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(inPos.x, inPos.z);
      ctx.lineTo(stPos.x, stPos.z);
      ctx.lineTo(outPos.x, outPos.z);
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(inPos.x, inPos.z);
      ctx.lineTo(stPos.x, stPos.z);
      ctx.lineTo(outPos.x, outPos.z);
      ctx.stroke();
      ctx.restore();
    }

    // ========================================================================
    // 6. SECTOR B: 7 HORIZONTAL ARSENAL PRODUCTION LANES
    // ========================================================================
    drawArsenalFactories(ctx, state) {
      for (const item of window.GameConfig.ITEMS) {
        if (!state.unlocked[item.id]) continue;
        const st = state.stations[item.id];
        const lvl = st ? (st.level || 1) : 1;
        const stock = st ? st.stock : 0;
        const maxBuf = st ? (st.maxBuffer || item.maxBuffer) : item.maxBuffer;
        const isMax = stock >= maxBuf;
        const hasIngredients = state.hasStationIngredients ? state.hasStationIngredients(item, st) : true;
        const prog = isMax ? 1 : (st ? st.progress / st.cycleTime : 0);

        this.drawStationConnectorPipe(ctx, item.inputPos, item.stationPos, item.pickupPos, item.color);

        const inStock = st?.inputStock || {};
        const parts = [];
        if (item.recipe.raw_iron) parts.push(`⛏️${inStock.raw_iron || 0}/${item.recipe.raw_iron}`);
        if (item.recipe.raw_e710) parts.push(`🛢️${inStock.raw_e710 || 0}/${item.recipe.raw_e710}`);
        const hopperStr = parts.join(' ');

        // 1. Input Hopper Pad (Left)
        this.drawPadBox(
          ctx,
          item.inputPos.x,
          item.inputPos.z,
          164,
          80,
          hasIngredients ? '#38bdf8' : '#ef4444',
          `📥 HOPPER: ${hopperStr}`,
          hasIngredients ? `Recipe: ${item.recipeText}` : `⚠️ FEED RAW ORE HERE!`
        );

        // 2. Fabricator Machine (Center)
        ctx.save();
        ctx.translate(item.stationPos.x, item.stationPos.z);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;
        ctx.fillRect(-58, -58, 116, 116);
        ctx.strokeRect(-58, -58, 116, 116);

        ctx.strokeStyle = hasIngredients ? item.color : '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(-50, -50, 100, 100);

        ctx.save();
        if (!isMax && hasIngredients) ctx.rotate(this.time * (3.2 + lvl * 0.2));
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, -6, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, 0, -6);

        ctx.fillStyle = '#090d14';
        ctx.fillRect(-48, 34, 96, 12);
        ctx.fillStyle = !hasIngredients ? '#ef4444' : (isMax ? '#facc15' : item.color);
        ctx.fillRect(-46, 36, 92 * Math.min(1, prog), 8);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 12.5px Orbitron, sans-serif';
        ctx.fillText(`${item.icon} ${item.shortName.toUpperCase()} (Lv.${lvl}/20)`, 0, -72);
        ctx.fillStyle = hasIngredients ? '#fde047' : '#fca5a5';
        ctx.font = '700 11.5px Rajdhani, sans-serif';
        ctx.fillText(hasIngredients ? `Recipe: ${item.recipeText}` : `⏸️ WAITING FOR RAW INPUT`, 0, -57);

        ctx.restore();

        // 3. Output Pickup Pad (Right)
        this.drawPadBox(
          ctx,
          item.pickupPos.x,
          item.pickupPos.z,
          158,
          80,
          isMax ? '#facc15' : item.color,
          `📤 READY: ${stock}/${maxBuf} ${item.icon}`,
          `Carry to Counter #${item.tier} or Belt`
        );
      }
    }

    // ========================================================================
    // 7. SECTOR C: 7 DEDICATED ITEM SALES COUNTERS, PER-COUNTER CASH & QUEUES
    //    (1 Item = 1 Dedicated Sales Counter + Drop Pad + Cash Stack + Queue)
    // ========================================================================
    drawDedicatedCountersAndCash(ctx, state) {
      const L = window.GameConfig.LOCATIONS;

      for (const item of window.GameConfig.ITEMS) {
        if (!state.unlocked[item.id]) continue;
        const count = state.counterBuffer[item.id] || 0;
        const sellPrice = state.getItemSellPrice(item);

        // 1. Dedicated Drop / Stock Pad on the West side of this item's Counter
        this.drawPadBox(
          ctx,
          item.counterDropPos.x,
          item.counterDropPos.z,
          144,
          82,
          count > 0 ? '#22c55e' : item.color,
          `📦 STOCK ${item.icon}`,
          `Drop ${item.shortName} Here`
        );

        // 2. Dedicated Counter Table for this specific Item
        ctx.save();
        ctx.translate(item.counterPos.x, item.counterPos.z);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = count > 0 ? item.color : '#475569';
        ctx.lineWidth = 4;
        ctx.fillRect(-76, -48, 152, 96);
        ctx.strokeRect(-76, -48, 152, 96);

        ctx.fillStyle = count > 0 ? 'rgba(34, 197, 94, 0.22)' : 'rgba(15, 23, 42, 0.72)';
        ctx.fillRect(-66, -34, 132, 68);

        ctx.fillStyle = item.color;
        ctx.font = '900 11.5px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`COUNTER #${item.tier}: ${item.shortName.toUpperCase()}`, 0, -56);

        ctx.font = '26px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, -54, -2);

        ctx.fillStyle = count > 0 ? '#4ade80' : '#f87171';
        ctx.font = '900 18px Orbitron, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`x${count}`, 56, -6);

        ctx.fillStyle = '#fde047';
        ctx.font = '700 12px Rajdhani, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`$${sellPrice}/ea`, 56, 18);

        ctx.restore();

        // 3. Dedicated Cash Stack for this Counter (`state.counterCash[item.id]`)
        const cashVal = (state.counterCash && state.counterCash[item.id]) || 0;
        const cx = item.cashPos.x;
        const cz = item.cashPos.z;

        this.drawPadBox(
          ctx,
          cx,
          cz,
          128,
          76,
          cashVal > 0 ? '#22c55e' : '#facc15',
          cashVal > 0 ? `💵 +$${cashVal}` : `💵 CASH #${item.tier}`,
          cashVal > 0 ? `Walk Here to Collect` : `Counter #${item.tier} Vault`
        );

        const billCount = Math.min(28, Math.ceil(cashVal / 20));
        if (billCount > 0) {
          for (let i = 0; i < billCount; i++) {
            const col = i % 2;
            const layer = Math.floor(i / 2);
            const bx = cx - 18 + col * 36;
            const by = cz - 26 - layer * 3.5;
            ctx.fillStyle = '#22c55e';
            ctx.strokeStyle = '#14532d';
            ctx.lineWidth = 1.5;
            ctx.fillRect(bx - 13, by - 6, 26, 11);
            ctx.strokeRect(bx - 13, by - 6, 26, 11);
          }
        }
      }

      // Trash / Clear Stack Pad
      const TC = L.trashCanZone;
      this.drawPadBox(ctx, TC.x, TC.z, 136, 82, '#ef4444', '🗑️ DUMP / CLEAR', 'Clear Held Stack');
    }

    drawWarZoneObjects(ctx, state) {
      for (const s of state.snowTiles) {
        if (s.cleared) continue;
        ctx.save();
        ctx.translate(s.x, s.z);
        ctx.fillStyle = 'rgba(203, 213, 225, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const pod of state.cryoPods) {
        ctx.save();
        ctx.translate(pod.x, pod.z);
        ctx.fillStyle = pod.rescued ? '#1e293b' : '#0284c7';
        ctx.strokeStyle = pod.rescued ? '#475569' : '#38bdf8';
        ctx.lineWidth = 3;
        ctx.fillRect(-40, -40, 80, 80);
        ctx.strokeRect(-40, -40, 80, 80);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        if (pod.rescued) {
          ctx.fillText(`❄️ THAWING (${Math.ceil(pod.cooldown)}s)`, 0, 5);
        } else {
          ctx.fillText(`🥶 CRYO HELLDIVER`, 0, -48);
          ctx.fillStyle = '#facc15';
          ctx.fillText(`Feed ${pod.needed - pod.fed} Items -> +1 SEAF!`, 0, 54);
          this.drawCarbotBean(ctx, 0, 6, {
            bodyColor: '#38bdf8',
            capeColor: '#0284c7',
            visorColor: '#bae6fd',
            isCommander: false,
            scale: 0.78,
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
        ctx.arc(0, 0, 17, 0, Math.PI * 2);
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
        hasRifle = false,
        weaponId = 'w_liberator',
        walkPhase = 0,
        scale = 1,
        label = '',
        subLabel = '',
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
      ctx.beginPath();
      ctx.arc(0, 2.5, 3.2, 0, Math.PI * 2);
      ctx.fill();

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

      if (hasRifle) {
        if (weaponId === 'w_autocannon') {
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(8, -5, 26, 10);
          ctx.strokeRect(8, -5, 26, 10);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(28, -3, 6, 6);
        } else if (weaponId === 'w_quasar') {
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(8, -4, 24, 9);
          ctx.strokeRect(8, -4, 24, 9);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(26, -2, 6, 5);
        } else if (weaponId === 'w_breaker') {
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(9, -2, 20, 7);
          ctx.strokeRect(9, -2, 20, 7);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(14, 0, 7, 4);
        } else {
          ctx.fillStyle = '#334155';
          ctx.fillRect(10, -1, 18, 6);
          ctx.strokeRect(10, -1, 18, 6);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(14, 0, 5, 4);
        }
      }

      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(18, 3, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      if (stack && stack.length > 0) {
        const maxDraw = Math.min(stack.length, 15);
        for (let i = 0; i < maxDraw; i++) {
          const entry = stack[i];
          const sy = -30 - i * 10;
          const sway = Math.sin(this.time * 6 + i * 0.4) * (i * 0.4);
          ctx.fillStyle = entry.color || '#facc15';
          ctx.strokeStyle = '#090d14';
          ctx.lineWidth = 2;
          ctx.fillRect(-12 + sway, sy - 6, 24, 9);
          ctx.strokeRect(-12 + sway, sy - 6, 24, 9);
          if (i === maxDraw - 1) {
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(entry.icon || '📦', sway, sy - 11);
          }
        }
      }

      if (label) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10.5px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, 34);
      }
      if (subLabel) {
        ctx.fillStyle = '#fde047';
        ctx.font = '700 10px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(subLabel, 0, 46);
      }

      ctx.restore();
    }

    drawPlayerCommander(ctx, state) {
      const p = state.player;
      const eq = state.getEquippedItems ? state.getEquippedItems() : {};
      const armor = eq.armor || { bodyColor: '#1e293b', capeColor: '#eab308', trimColor: '#facc15' };
      const weapon = eq.weapon || { id: 'w_liberator' };
      const backpack = eq.backpack || { hasDrone: false };
      const mount = eq.mount || { id: 'm_foot' };

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

      const labelText = `🦅 YOU (${p.inventory.length}/${state.getPlayerMaxCapacity()})`;

      if (mount.id === 'm_mech') {
        this.drawPatriotMechSprite(ctx, p.x, p.z, p.walkPhase * 0.25, 1.28, true, p.inventory);
        ctx.save();
        ctx.fillStyle = '#fde047';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🤖 MECH PILOT — ${labelText}`, p.x, p.z + 44);
        ctx.restore();
      } else if (mount.id === 'm_vehicle') {
        this.drawReconVehicleSprite(ctx, p.x, p.z, p.walkPhase * 0.25, 1.28, true, p.inventory);
        ctx.save();
        ctx.fillStyle = '#fde047';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🚙 RECON DRIVER — ${labelText}`, p.x, p.z + 38);
        ctx.restore();
      } else {
        this.drawCarbotBean(ctx, p.x, p.z, {
          bodyColor: armor.bodyColor || '#1e293b',
          capeColor: armor.capeColor || '#eab308',
          trimColor: armor.trimColor || '#facc15',
          visorColor: '#f97316',
          isCommander: true,
          hasRifle: true,
          weaponId: weapon.id,
          walkPhase: p.walkPhase || 0,
          scale: 1.15,
          label: labelText,
          stack: p.inventory
        });
      }

      if (backpack.hasDrone) {
        const dx = p.x + Math.cos(this.time * 3.2) * 52;
        const dz = p.z - 28 + Math.sin(this.time * 3.2) * 26;
        this.drawGuardDogDrone(ctx, dx, dz, this.time);
      }
    }

    drawSeafWorker(ctx, w) {
      const isAmmo = w.role === 'ammo';
      const isMiner = w.role === 'miner';
      this.drawCarbotBean(ctx, w.x, w.z, {
        bodyColor: isMiner ? '#0f766e' : (isAmmo ? '#7c2d12' : '#1d4ed8'),
        capeColor: isMiner ? '#2dd4bf' : (isAmmo ? '#f97316' : '#38bdf8'),
        trimColor: '#f8fafc',
        visorColor: isMiner ? '#99f6e4' : (isAmmo ? '#fb923c' : '#38bdf8'),
        isCommander: false,
        walkPhase: w.walkPhase || 0,
        scale: 0.94,
        label: isMiner ? '⛏️ SEAF MINER' : (isAmmo ? '🧱 SEAF ENGINEER' : '🪖 SEAF LOGISTICS'),
        subLabel: w.taskLabel || '',
        stack: w.inventory
      });
    }

    drawHelldiverCustomer(ctx, c) {
      const isVip = c.item && c.item.tier >= 5;
      this.drawCarbotBean(ctx, c.x, c.z, {
        bodyColor: isVip ? '#3b0764' : (c.color || '#1e293b'),
        capeColor: isVip ? '#f59e0b' : '#dc2626',
        trimColor: isVip ? '#fde047' : '#facc15',
        visorColor: isVip ? '#fef08a' : '#fb923c',
        isCommander: isVip,
        hasRifle: true,
        walkPhase: c.walkPhase || 0,
        scale: isVip ? 1.1 : 1.0,
        label: '',
        stack: []
      });

      ctx.save();
      ctx.translate(c.x, c.z - 42);
      ctx.fillStyle = c.state === 'leaving' ? '#16a34a' : '#0f172a';
      ctx.strokeStyle = c.state === 'leaving' ? '#4ade80' : (c.item?.color || '#facc15');
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-44, -16, 88, 28, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 12.5px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (c.state === 'leaving') {
        ctx.fillText('😊 DEMOCRACY!', 0, -2);
      } else {
        ctx.fillText(`${c.item.icon} ${c.received}/${c.qty} (#${c.item.tier})`, 0, -2);
      }
      ctx.restore();
    }

    // ========================================================================
    // ALL-EPISODE CARBOT ANIMATIONS ENEMY SPRITES (Ep1–Ep10+)
    // Supports:
    //  - Terminids: hunter (Ep1/2), bug (Charger Ep1/3), spewer (Bile Spewer Ep2/5), titan (Bile Titan Ep1/4)
    //  - Automatons: trooper (Ep3/7), devastator (Rocket Devastator Ep3/6), hulk (Ep3/7), strider (Factory Strider Ep8/9)
    // ========================================================================
    drawEnemy(ctx, e) {
      ctx.save();
      ctx.translate(e.x, e.z);
      const type = e.type || 'trooper';
      let defaultScale = 1.05;
      if (type === 'hunter') defaultScale = 0.92;
      else if (type === 'bug') defaultScale = 1.08;
      else if (type === 'spewer') defaultScale = 1.22;
      else if (type === 'titan') defaultScale = 1.65;
      else if (type === 'devastator') defaultScale = 1.22;
      else if (type === 'hulk') defaultScale = 1.45;
      else if (type === 'strider') defaultScale = 1.72;

      const scale = e.previewScale || defaultScale;
      const t = e.phase ?? this.time;
      ctx.scale(scale, scale);

      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 18, type === 'titan' || type === 'strider' ? 26 : 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      const wobble = Math.sin(t * 7.5) * 2.2;
      ctx.translate(0, wobble * 0.45);

      if (type === 'hunter') {
        // Ep1/Ep2 Carbot Scavenger / Leaping Hunter Bug (Fluttering wings + wagging pink tongue + derpy eyes)
        const wingFlap = Math.sin(t * 18) * 6;
        ctx.fillStyle = 'rgba(253, 224, 71, 0.45)';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(-14, -8 + wingFlap * 0.4, 10, 5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(14, -8 - wingFlap * 0.4, 10, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fb923c';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 2, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Wagging pink tongue
        const tongueX = Math.sin(t * 10) * 4;
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.ellipse(tongueX, 13, 4.5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Derpy Carbot Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, 4, 4.5, 0, Math.PI * 2);
        ctx.arc(6, 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#090d14';
        ctx.beginPath();
        ctx.arc(-7, 4, 1.8, 0, Math.PI * 2);
        ctx.arc(7, 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'bug') {
        // Ep1/Ep3 Carbot Armored Charger Bug
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3;
        for (const side of [-1, 1]) {
          for (let l = -1; l <= 1; l++) {
            ctx.beginPath();
            ctx.moveTo(side * 12, l * 5);
            ctx.lineTo(side * 22, l * 8 + Math.sin(t * 12 + l) * 3);
            ctx.stroke();
          }
        }
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
      } else if (type === 'spewer') {
        // Ep2/Ep5 Carbot Bile Spewer (Bloated glowing neon-green acid sac)
        const pulse = 1 + Math.sin(t * 6) * 0.08;
        ctx.save();
        ctx.scale(pulse, 1 / pulse);
        ctx.fillStyle = '#a3e635';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -4, 21, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#bef264';
        ctx.beginPath();
        ctx.arc(-8, -8, 4.5, 0, Math.PI * 2);
        ctx.arc(7, -10, 3.5, 0, Math.PI * 2);
        ctx.arc(2, -2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Head + dripping green bile
        ctx.fillStyle = '#3f6212';
        ctx.beginPath();
        ctx.arc(0, 11, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(0, 18 + Math.sin(t * 9) * 2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'titan') {
        // Ep1/Ep4 Carbot Bile Titan Boss (4 towering stilted spider legs + glowing acid belly)
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;
        for (const side of [-1, 1]) {
          for (const fb of [-1, 1]) {
            const kneeX = side * 26;
            const kneeY = fb * 8 - 10 + Math.sin(t * 6 + side + fb) * 4;
            const footX = side * 34;
            const footY = fb * 15 + 14;
            ctx.beginPath();
            ctx.moveTo(side * 10, fb * 4);
            ctx.lineTo(kneeX, kneeY);
            ctx.lineTo(footX, footY);
            ctx.stroke();
          }
        }
        // Glowing green acid underbelly
        ctx.fillStyle = '#84cc16';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -6, 16, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Armored dark carapace crest
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-14, -18, 28, 22, 8);
        ctx.fill();
        ctx.stroke();

        // Glowing acid jaws
        ctx.fillStyle = '#bef264';
        ctx.beginPath();
        ctx.arc(-5, 8, 3.5, 0, Math.PI * 2);
        ctx.arc(5, 8, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'devastator') {
        // Ep3/Ep6 Malevelon Creek Rocket Devastator (Dual 6-tube shoulder rocket pods!)
        ctx.fillStyle = '#991b1b';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3.5;
        // Dual shoulder rocket pods
        ctx.fillRect(-21, -28, 13, 14);
        ctx.strokeRect(-21, -28, 13, 14);
        ctx.fillRect(8, -28, 13, 14);
        ctx.strokeRect(8, -28, 13, 14);
        ctx.fillStyle = '#facc15';
        for (const rx of [-17, -12, 12, 17]) {
          ctx.beginPath();
          ctx.arc(rx, -21, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Broad armored torso
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(-19, -16, 38, 32, 8);
        ctx.fill();
        ctx.stroke();

        // Skull head & glowing red eyes
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, -4, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-3.5, -5, 2.8, 0, Math.PI * 2);
        ctx.arc(3.5, -5, 2.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'strider') {
        // Ep8/Ep9 Carbot Factory Strider ("AT-AT Mechanical Dog" Mega-Boss!)
        const legStep = Math.sin(t * 5) * 4;
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 3.5;
        // 4 heavy mechanical walker legs
        ctx.fillRect(-24, 6 + legStep, 9, 16);
        ctx.strokeRect(-24, 6 + legStep, 9, 16);
        ctx.fillRect(-10, 8 - legStep, 9, 16);
        ctx.strokeRect(-10, 8 - legStep, 9, 16);
        ctx.fillRect(4, 6 + legStep, 9, 16);
        ctx.strokeRect(4, 6 + legStep, 9, 16);
        ctx.fillRect(16, 8 - legStep, 9, 16);
        ctx.strokeRect(16, 8 - legStep, 9, 16);

        // Colossal armored walker body
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-26, -22, 52, 30, 8);
        ctx.fill();
        ctx.stroke();

        // Dorsal top cannon turret
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-10, -32, 20, 10);
        ctx.strokeRect(-10, -32, 20, 10);
        ctx.fillRect(-3, -42, 6, 12);
        ctx.strokeRect(-3, -42, 6, 12);

        // Glowing red factory bay slit & chin gatling guns
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-16, -6, 32, 6);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-12, 6, 5, 10);
        ctx.fillRect(7, 6, 5, 10);
      } else {
        // Ep3/Ep7 Trooper or Flame-Saw Hulk Boss
        const isHulk = type === 'hulk';
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
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(18, -4, 9, 14);
          ctx.strokeRect(18, -4, 9, 14);
        }
      }

      if (!e.previewScale) {
        const hpRatio = Math.max(0, Math.min(1, e.hp / e.maxHp));
        ctx.fillStyle = '#090d14';
        ctx.fillRect(-20, -34, 40, 7);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-19, -33, 38 * hpRatio, 5);
      }
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

    // Carbot Ep1/Ep7 Eagle-1 500KG Bomb Flyover Jet Silhouette & Red Stratagem Beacon Beam!
    drawEagleFlyover(ctx, state) {
      if (!state.eagleFlyover) return;
      const ef = state.eagleFlyover;
      const p = Math.min(1, ef.t / ef.duration);
      const jx = ef.sx + (ef.tx - ef.sx) * p;
      const jz = ef.sz + (ef.tz - ef.sz) * p;

      // Red vertical stratagem beacon beam at target center
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, -900);
      ctx.lineTo(0, -1850);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 16px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🦅 EAGLE-1 500KG INBOUND (⬆️➡️⬇️⬇️⬇️)!', 0, -920);

      // Sweeping jet shadow
      ctx.translate(jx, jz);
      ctx.rotate(-0.35);
      ctx.fillStyle = 'rgba(9, 13, 20, 0.65)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(90, 0);
      ctx.lineTo(-40, -75);
      ctx.lineTo(-20, 0);
      ctx.lineTo(-40, 75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  window.WorldRenderer2D = WorldRenderer2D;
})();
