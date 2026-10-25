// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.04
// Module: High-DPI 2D Factorio + CarbotAnimations Vector World,
//         4200x3800 Zero-Overlap Layout, 3-Layer Sequential Defense Gates,
//         Recipe Hoppers, Expandable Quarry Rigs, Wearable Mechs & Character Preview
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
      this.zoom = 0.56;
      this.targetZoom = 0.56;
      this.shakeTimer = 0;
      this.shakeIntensity = 0;

      this.beltPhase = 0;
      this.time = 0;

      this.craters = [];
      for (let i = 0; i < 64; i++) {
        const seed = (i * 9301 + 49297) % 233280;
        const rx = ((seed / 233280) - 0.5) * 3100;
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
      this.targetZoom = Math.max(0.28, Math.min(1.35, z));
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

      ctx.translate(this.width * 0.5 + shakeX, this.height * 0.5 + shakeY);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-this.camX, -this.camZ);

      this.drawTerrainAndGrid(ctx, state);
      this.drawConveyorNetwork(ctx, state);
      this.drawFloorPads(ctx, state);
      this.drawThreeLayerGates(ctx, state);
      this.drawRawQuarryAndAmmoPress(ctx, state);
      this.drawArsenalFactories(ctx, state);
      this.drawCounterAndCashTowers(ctx, state);
      this.drawWarZoneObjects(ctx, state);
      this.drawSortedEntities(ctx, state);
      this.drawProjectilesAndArcs(ctx, state);

      ctx.restore();
    }

    // ========================================================================
    // LIVE ANIMATED 2D CHARACTER SHOWCASE CARD RENDERER (角色預覽圖鑑)
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
          scale: 1.42,
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
        this.drawEnemy(ctx, {
          type,
          x: cx,
          z: cy + 4,
          hp: 100,
          maxHp: 100,
          previewScale: type === 'hulk' ? 1.55 : 1.5,
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

      // Rotor blades
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-12, -6, 7, 0, Math.PI * 2);
      ctx.arc(12, -6, 7, 0, Math.PI * 2);
      ctx.stroke();

      // Drone body
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-11, -7, 22, 14, 5);
      ctx.fill();
      ctx.stroke();

      // Glowing laser eye
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

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.48)';
      ctx.beginPath();
      ctx.ellipse(0, 26, 28, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mech Legs
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3.5;
      ctx.fillRect(-17, 6 + step * 0.5, 11, 18);
      ctx.strokeRect(-17, 6 + step * 0.5, 11, 18);
      ctx.fillRect(6, 6 - step * 0.5, 11, 18);
      ctx.strokeRect(6, 6 - step * 0.5, 11, 18);

      // Heavy Boxy Carbot Mech Hull
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(-24, -28, 48, 38, 9);
      ctx.fill();
      ctx.stroke();

      // Yellow Mech Visor Slit
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-15, -15, 30, 8);
      ctx.strokeRect(-15, -15, 30, 8);

      // Optional Commander Winged Crest on Mech Roof when piloted!
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

      // Left Rocket Pod
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-36, -24, 12, 26);
      ctx.strokeRect(-36, -24, 12, 26);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-30, -16, 2.8, 0, Math.PI * 2);
      ctx.arc(-30, -6, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Right Rotary Gatling Cannon
      ctx.fillStyle = '#475569';
      ctx.fillRect(24, -18, 15, 20);
      ctx.strokeRect(24, -18, 15, 20);

      // Back stack if piloted by player
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

      // Off-road tires
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#090d14';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-18, 13, 9, 0, Math.PI * 2);
      ctx.arc(18, 13, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Armored Buggy Hull
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.roundRect(-28, -12, 56, 24, 8);
      ctx.fill();
      ctx.stroke();

      // Roll Cage & Windshield
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-14, -23, 28, 12);
      ctx.strokeRect(-14, -23, 28, 12);

      // Roof HMG Turret
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
    // 1. TERRAIN, SECTORS & 3-LAYER WAR CORRIDOR (4200 x 3800 ZERO OVERLAP)
    // ========================================================================
    drawTerrainAndGrid(ctx, state) {
      const W = window.GameConfig.WORLD;

      // Northern War-Zone Scorched Battlefield (z: -1950 to -200)
      const warGrad = ctx.createLinearGradient(0, W.minZ, 0, W.wallZ);
      warGrad.addColorStop(0, '#1a1025');
      warGrad.addColorStop(0.5, '#231f33');
      warGrad.addColorStop(1, '#2b3248');
      ctx.fillStyle = warGrad;
      ctx.fillRect(W.minX - 150, W.minZ - 150, (W.maxX - W.minX) + 300, (W.wallZ - W.minZ) + 150);

      // Flanking canyon walls outside the 3-Layer War Corridor
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.fillRect(W.minX, W.minZ, W.corridorMinX - W.minX, W.wallZ - W.minZ);
      ctx.strokeRect(W.minX, W.minZ, W.corridorMinX - W.minX, W.wallZ - W.minZ);
      ctx.fillRect(W.corridorMaxX, W.minZ, W.maxX - W.corridorMaxX, W.wallZ - W.minZ);
      ctx.strokeRect(W.corridorMaxX, W.minZ, W.maxX - W.corridorMaxX, W.wallZ - W.minZ);

      // War Corridor Zone Labels
      ctx.save();
      ctx.fillStyle = 'rgba(248, 113, 113, 0.25)';
      ctx.font = '900 22px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ AUTOMATON & TERMINID DROP ZONE — ATTACKS GATE 3 FIRST!', 0, -1760);
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

      // Southern Super Earth Mega-Factory Floor (z: -200 to +1850)
      ctx.fillStyle = '#141c2b';
      ctx.fillRect(W.minX, W.wallZ, W.maxX - W.minX, W.maxZ - W.wallZ);

      // 4 Non-Overlapping Industrial Sectors with Generous Walkways
      this.drawFloorSector(
        ctx,
        -2000,
        -120,
        960,
        1820,
        '#112236',
        '#38bdf8',
        'SECTOR A: RAW HARVEST QUARRY, AUTO-DRILLS & MUNITIONS PRESS'
      );
      this.drawFloorSector(
        ctx,
        -940,
        -120,
        1300,
        1820,
        '#1b2434',
        '#facc15',
        'SECTOR B: ARSENAL PRODUCTION LINES (RAW HOPPER ➔ MACHINE ➔ OUTPUT)'
      );
      this.drawFloorSector(
        ctx,
        460,
        -120,
        1540,
        840,
        '#142924',
        '#22c55e',
        'SECTOR C: QUARTERMASTER SALES COUNTER, QUEUE PLAZA & CASH VAULT'
      );
      this.drawFloorSector(
        ctx,
        460,
        820,
        1540,
        880,
        '#241a2c',
        '#f97316',
        'SECTOR D: HEAVY VEHICLE, PATRIOT MECH & SUPER DESTROYER HANGAR'
      );

      // Factorio Blueprint Grid
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

      // World Outer Boundary Frame
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
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = accent;
      ctx.font = '900 16px Orbitron, sans-serif';
      ctx.fillText(title, x + 20, z + 30);
      ctx.restore();
    }

    // ========================================================================
    // 2. FACTORIO CONVEYOR BELT NETWORK
    // ========================================================================
    drawConveyorNetwork(ctx, state) {
      const AP = window.GameConfig.AMMO_PRESS;
      const gates = window.GameConfig.GATES;

      // Raw Quarry -> Factory Input Hoppers Conveyor Belt
      const rawUnlocked = !!state.conveyors.conv_raw_feed;
      this.drawBeltPath(ctx, [
        { x: -1150, z: 180 },
        { x: -1150, z: 680 },
        { x: -640, z: 680 },
        { x: -640, z: 160 }
      ], rawUnlocked, '#38bdf8', '⛏️');

      // Munitions Press -> 3 Gate Layers Conveyor Spine
      for (const g of gates) {
        const unlocked = !!state.conveyors[g.conveyorId];
        const path = [
          { x: AP.padX, z: AP.padZ },
          { x: -820, z: AP.padZ },
          { x: -820, z: g.turretZ },
          { x: g.leftTurretX, z: g.turretZ }
        ];
        this.drawBeltPath(ctx, path, unlocked, g.color, '🧱');
      }

      // Factory Output -> Sales Counter Conveyor Belt
      const counterBelt = !!state.conveyors.conv_counter_auto;
      this.drawBeltPath(ctx, [
        { x: -120, z: 520 },
        { x: -120, z: 220 },
        { x: 640, z: 220 }
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
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
        ctx.lineWidth = 22;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
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

        const itemStep = 76;
        const itemPhase = (this.time * 58) % itemStep;
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

    // ========================================================================
    // 3. INTERACTIVE TRIGGER PADS (ZERO OVERLAP)
    // ========================================================================
    drawFloorPads(ctx, state) {
      const L = window.GameConfig.LOCATIONS;

      this.drawPadBox(
        ctx,
        L.counterDropZone.x,
        L.counterDropZone.z,
        150,
        140,
        '#22c55e',
        '📦 DROP / SELL',
        'Stock Counter or Direct Sell'
      );

      this.drawPadBox(
        ctx,
        L.cashRegisterZone.x,
        L.cashRegisterZone.z,
        150,
        110,
        '#facc15',
        '💵 COLLECT $REQ',
        'Walk Here to Vacuum Cash'
      );

      this.drawPadBox(
        ctx,
        L.armoryLoadoutPad.x,
        L.armoryLoadoutPad.z,
        165,
        110,
        '#a855f7',
        '🛡️ EQUIP LOADOUT',
        'Weapons, Guard Dog & Mechs'
      );

      for (const c of window.GameConfig.CONVEYORS) {
        if (state.conveyors[c.id]) continue;
        const rem = Math.max(0, state.conveyorRemaining[c.id] ?? c.cost);
        this.drawPadBox(ctx, c.padX, c.padZ, 155, 86, c.color, `${c.icon} BELT $${rem}`, c.name);
      }

      for (const item of window.GameConfig.ITEMS) {
        if (state.unlocked[item.id]) continue;
        const rem = Math.max(0, state.unlockRemaining[item.id] ?? item.unlockCost);
        this.drawPadBox(
          ctx,
          item.unlockPos.x,
          item.unlockPos.z,
          175,
          104,
          item.color,
          `🔓 UNLOCK ${item.icon} $${rem}`,
          `${item.shortName} (${item.recipeText})`
        );
      }
    }

    drawPadBox(ctx, x, z, w, h, color, title, subtitle) {
      ctx.save();
      ctx.translate(x, z);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
      ctx.fillRect(-w / 2, -h / 2, w, h);

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = '900 13px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, 0, -5);

      if (subtitle) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 11.5px Rajdhani, sans-serif';
        ctx.fillText(subtitle, 0, 14);
      }
      ctx.restore();
    }

    // ========================================================================
    // 4. THREE SEQUENTIAL DEFENSE GATE LAYERS (GATE 3 -> GATE 2 -> GATE 1)
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
        const isBroken = gs.hp <= 0;
        const defLvl = gs.defenseLevel || 1;
        const upgCost = state.getGateUpgradeCost ? state.getGateUpgradeCost(g.id) : 160;

        ctx.save();
        // Left & Right Armored Blast Walls across the War Corridor
        ctx.fillStyle = isBroken ? '#334155' : '#1e293b';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;

        // Left wall segment (cMinX to -halfOpen)
        ctx.fillRect(cMinX, wallY - 22, (-halfOpen) - cMinX, 44);
        ctx.strokeRect(cMinX, wallY - 22, (-halfOpen) - cMinX, 44);

        // Right wall segment (+halfOpen to cMaxX)
        ctx.fillRect(halfOpen, wallY - 22, cMaxX - halfOpen, 44);
        ctx.strokeRect(halfOpen, wallY - 22, cMaxX - halfOpen, 44);

        // Hazard stripes along wall segments
        ctx.fillStyle = g.color;
        ctx.fillRect(cMinX + 16, wallY - 5, (-halfOpen) - cMinX - 32, 10);
        ctx.fillRect(halfOpen + 16, wallY - 5, cMaxX - halfOpen - 32, 10);

        // Central Blast Gate Doorway (-halfOpen to +halfOpen)
        ctx.translate(g.x, g.z);

        // Gate Pillars
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 3.5;
        ctx.fillRect(-halfOpen - 16, -30, 28, 60);
        ctx.strokeRect(-halfOpen - 16, -30, 28, 60);
        ctx.fillRect(halfOpen - 12, -30, 28, 60);
        ctx.strokeRect(halfOpen - 12, -30, 28, 60);

        const hpRatio = Math.max(0, Math.min(1, gs.hp / gs.maxHp));
        const underAttack = (this.time - (gs.lastHitTime || -10)) < 0.6;

        if (isBroken) {
          // Broken / Breached Gate Barrier
          ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
          ctx.fillRect(-halfOpen + 12, -14, W.gateOpeningWidth - 24, 28);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 8]);
          ctx.strokeRect(-halfOpen + 12, -14, W.gateOpeningWidth - 24, 28);
          ctx.setLineDash([]);

          ctx.fillStyle = '#fca5a5';
          ctx.font = '900 14px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`💥 ${g.shortName.toUpperCase()} BREACHED! (STAND ON PAD TO REBUILD)`, 0, 5);
        } else {
          // Active Laser/Blast Shield Gate
          ctx.fillStyle = underAttack ? 'rgba(239, 68, 68, 0.48)' : 'rgba(56, 189, 248, 0.24)';
          ctx.fillRect(-halfOpen + 12, -14, W.gateOpeningWidth - 24, 28);
          ctx.strokeStyle = underAttack ? '#ef4444' : g.color;
          ctx.lineWidth = 3.5;
          ctx.setLineDash([12, 6]);
          ctx.strokeRect(-halfOpen + 12, -14, W.gateOpeningWidth - 24, 28);
          ctx.setLineDash([]);
        }

        // Gate Layer HP Bar Overhead
        const barW = 280;
        const barH = 20;
        ctx.fillStyle = '#090d14';
        ctx.fillRect(-barW / 2, -58, barW, barH);
        ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.25 ? '#facc15' : '#ef4444');
        ctx.fillRect(-barW / 2 + 2, -56, (barW - 4) * hpRatio, barH - 4);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-barW / 2, -58, barW, barH);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `🛡️ LAYER ${g.layerOrder} — ${g.shortName.toUpperCase()} (Lv.${defLvl}): ${Math.ceil(gs.hp)}/${gs.maxHp} HP`,
          0,
          -44
        );
        ctx.restore();

        // Central Load Ammo + Repair/Rebuild Pad
        this.drawPadBox(
          ctx,
          g.ammoPadX,
          g.ammoPadZ,
          170,
          76,
          isBroken ? '#ef4444' : '#f97316',
          isBroken ? `🔧 REBUILD ${g.shortName.toUpperCase()}` : `🧱 LOAD AMMO & REPAIR`,
          `Ammo: ${gs.ammo}/${g.maxAmmo} | +HP Repair`
        );

        // Left Upgrade Gate Defense Level Pad
        this.drawPadBox(
          ctx,
          g.upgradePadX,
          g.upgradePadZ,
          170,
          76,
          g.color,
          `⬆️ FORTIFY Lv.${defLvl + 1} ($${upgCost})`,
          `+Max HP & Dual Turret DMG`
        );

        // Dual Sentry Turrets (Left & Right of the Gate Opening!)
        this.drawSingleTurretMount(
          ctx,
          g.leftTurretX,
          g.turretZ,
          g.color,
          gs.ammo,
          g.maxAmmo,
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
          g.maxAmmo,
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
    // 5. SECTOR A: MANUAL HARVEST QUARRY + EXPANDABLE AUTO-MINING RIGS
    // ========================================================================
    drawRawQuarryAndAmmoPress(ctx, state) {
      for (const raw of window.GameConfig.RAW_EXTRACTORS) {
        const rs = state.rawExtractors[raw.id];
        const lvl = rs ? rs.level : 1;
        const stock = rs ? rs.stock : 0;
        const maxBuf = rs ? rs.maxBuffer : raw.baseBuffer;
        const upgradeCost = state.getRawUpgradeCost ? state.getRawUpgradeCost(raw.id) : 100;

        // A. Manual Harvest Field (Rich Ore Veins / E-710 Geysers at raw.harvestPos)
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

        // Draw 6 animated ore crystal / geyser nodes inside the harvest circle
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

        // B. Expandable Multi-Rig Auto-Extractor Array (Scale Lv.1 -> up to 5 visible rigs!)
        const visibleRigs = Math.min(5, lvl);
        ctx.save();
        ctx.translate(raw.x, raw.z);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#090d14';
        ctx.lineWidth = 4;
        ctx.fillRect(-105, -75, 210, 150);
        ctx.strokeRect(-105, -75, 210, 150);

        // Render 1..5 animated drill rigs based on Scale Level!
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
          ctx.rotate(this.time * (2.0 + lvl * 0.35) + rIdx);
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
        ctx.fillText(`${raw.icon} AUTO ${raw.shortName.toUpperCase()} (SCALE Lv.${lvl} — ${visibleRigs} RIGS)`, 0, -88);
        ctx.fillStyle = '#facc15';
        ctx.font = '700 12px Rajdhani, sans-serif';
        ctx.fillText(`Auto Rate: ${(1 / (rs?.cycleTime || 1.5)).toFixed(1)}/s | Stored: ${stock}/${maxBuf}`, 0, -72);
        ctx.restore();

        // C. Raw Output Pickup Pad (Take raw ore from Auto-Drill buffer)
        this.drawPadBox(
          ctx,
          raw.pickupX,
          raw.pickupZ,
          148,
          86,
          raw.color,
          `📤 PICKUP ${raw.itemIcon} (${stock}/${maxBuf})`,
          `Take Raw ${raw.shortName} to Hoppers`
        );

        // D. Expand Quarry Scale & Speed Pad
        this.drawPadBox(
          ctx,
          raw.padX,
          raw.padZ,
          178,
          82,
          raw.color,
          `⬆️ EXPAND SCALE Lv.${lvl + 1} ($${upgradeCost})`,
          `Add Drill Rig & +35% Speed`
        );
      }

      // E. Munitions Ammo Press with Input Hopper (Requires 1x ⛏️ Iron -> 3x 🧱 Ammo)
      const AP = window.GameConfig.AMMO_PRESS;
      const ammoStock = state.ammoPress.stock;
      const ammoInIron = state.ammoPress.inputStock?.raw_iron || 0;
      const ammoProg = state.ammoPress.progress / state.ammoPress.cycleTime;

      // Connector pipe from Input Hopper -> Ammo Press -> Output Pad
      this.drawStationConnectorPipe(ctx, AP.inputPos, { x: AP.x, z: AP.z }, { x: AP.padX, z: AP.padZ }, '#f97316');

      // Ammo Press Input Hopper Pad
      this.drawPadBox(
        ctx,
        AP.inputPos.x,
        AP.inputPos.z,
        155,
        88,
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
      ctx.font = '900 13px Orbitron, sans-serif';
      ctx.fillText(`🧱 MUNITIONS PRESS (1⛏️ ➔ 3🧱)`, 0, -72);
      ctx.restore();

      this.drawPadBox(
        ctx,
        AP.padX,
        AP.padZ,
        155,
        88,
        '#f97316',
        `📤 PICKUP 🧱 AMMO (${ammoStock})`,
        `Carry (搬) to Gate Layers 3/2/1`
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
    // 6. SECTOR B & D: ARSENAL PRODUCTION LINES (HOPPER -> MACHINE -> OUTPUT)
    // ========================================================================
    drawArsenalFactories(ctx, state) {
      for (const item of window.GameConfig.ITEMS) {
        if (!state.unlocked[item.id]) continue;
        const st = state.stations[item.id];
        const stock = st ? st.stock : 0;
        const isMax = stock >= item.maxBuffer;
        const hasIngredients = state.hasStationIngredients ? state.hasStationIngredients(item, st) : true;
        const prog = isMax ? 1 : (st ? st.progress / st.cycleTime : 0);

        // Draw connecting pipeline from Input Hopper -> Machine -> Output Pad
        this.drawStationConnectorPipe(ctx, item.inputPos, item.stationPos, item.pickupPos, item.color);

        // Format Input Hopper stock string
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
          162,
          86,
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
        ctx.fillRect(-60, -60, 120, 120);
        ctx.strokeRect(-60, -60, 120, 120);

        ctx.strokeStyle = hasIngredients ? item.color : '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(-52, -52, 104, 104);

        ctx.save();
        if (!isMax && hasIngredients) ctx.rotate(this.time * 3.4);
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
        ctx.font = '900 13px Orbitron, sans-serif';
        ctx.fillText(`${item.icon} ${item.shortName.toUpperCase()}`, 0, -74);
        ctx.fillStyle = hasIngredients ? '#fde047' : '#fca5a5';
        ctx.font = '700 11.5px Rajdhani, sans-serif';
        ctx.fillText(hasIngredients ? `Recipe: ${item.recipeText}` : `⏸️ WAITING FOR RAW INPUT`, 0, -59);

        ctx.restore();

        // 3. Output Pickup Pad (Right)
        this.drawPadBox(
          ctx,
          item.pickupPos.x,
          item.pickupPos.z,
          158,
          86,
          isMax ? '#facc15' : item.color,
          `📤 READY: ${stock}/${item.maxBuffer} ${item.icon}`,
          `Sell Price: $${state.getItemSellPrice(item)}`
        );
      }
    }

    // ========================================================================
    // 7. SECTOR C: QUARTERMASTER SALES COUNTER & CASH VAULT (ZERO OVERLAP)
    // ========================================================================
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
      ctx.fillText('🦅 QUARTERMASTER COUNTER', 0, -T.depth / 2 - 14);

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
        const cz = L.cashRegisterZone.z - 22;
        for (let i = 0; i < billCount; i++) {
          const col = i % 2;
          const layer = Math.floor(i / 2);
          const bx = cx - 24 + col * 48;
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
      this.drawPadBox(ctx, TC.x, TC.z, 130, 84, '#ef4444', '🗑️ DUMP / CLEAR', 'Clear Held Stack');
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
        if (weaponId === 'w_quasar') {
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
        ctx.font = '900 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, 34);
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
        label: isMiner ? '⛏️ SEAF MINER' : (isAmmo ? '🧱 SEAF ENGINEER' : '🪖 SEAF STAFF'),
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
      const scale = e.previewScale || (isHulk ? 1.45 : (isBug ? 1.0 : 1.05));
      const t = e.phase ?? this.time;
      ctx.scale(scale, scale);

      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      const wobble = Math.sin(t * 7) * 2;
      ctx.translate(0, wobble * 0.4);

      if (isBug) {
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
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(18, -4, 9, 14);
          ctx.strokeRect(18, -4, 9, 14);
        }
      }

      if (!e.previewScale) {
        const hpRatio = Math.max(0, Math.min(1, e.hp / e.maxHp));
        ctx.fillStyle = '#090d14';
        ctx.fillRect(-20, -32, 40, 7);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-19, -31, 38 * hpRatio, 5);
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
  }

  window.WorldRenderer2D = WorldRenderer2D;
})();
