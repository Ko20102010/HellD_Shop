// ============================================================================
// HELLDIVERS PLEASE! — Super Earth Arsenal & 2D Factorio War-Zone Tycoon
// Version: v0.0.07 (All-Episode Carbot Art, Real-Item-Only Split Belts,
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
      const isMobileScreen = (window.innerWidth || 1280) < 768;
      this.zoom = isMobileScreen ? 0.36 : 0.54;
      this.targetZoom = this.zoom;
      this.pinchStartDist = null;
      this.pinchStartZoom = this.zoom;
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

      // Deep-space starfield for SES Super Destroyer Orbital Warship backdrop
      this.spaceStars = [];
      for (let i = 0; i < 140; i++) {
        const s1 = (i * 7919 + 104729) % 100000;
        const s2 = (i * 15485863 + 32452843) % 100000;
        this.spaceStars.push({
          x: -3600 + (s1 / 100000) * 7600,
          z: -1400 + (s2 / 100000) * 4400,
          r: 1.2 + (i % 4) * 0.9,
          speed: 1.5 + (i % 5) * 0.7,
          color: i % 7 === 0 ? '#38bdf8' : (i % 5 === 0 ? '#fde047' : '#f8fafc')
        });
      }
      this.lastPlayerPos = { x: -100, z: 220 };

      this.handleResize();
      window.addEventListener('resize', () => this.handleResize());

      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.07 : 0.07;
        this.setZoom(this.targetZoom + delta);
      }, { passive: false });

      // 2-Finger Pinch-to-Zoom for Mobile Phones
      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          this.pinchStartDist = Math.hypot(dx, dy);
          this.pinchStartZoom = this.targetZoom;
        }
      }, { passive: true });
      this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length === 2 && this.pinchStartDist > 10) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const ratio = dist / this.pinchStartDist;
          this.setZoom(this.pinchStartZoom * ratio);
        }
      }, { passive: true });
      this.canvas.addEventListener('touchend', () => {
        this.pinchStartDist = null;
      }, { passive: true });
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

      this.lastPlayerPos = { x: state.player.x, z: state.player.z };
      const isWarMode = state.viewMode === 'war';

      ctx.fillStyle = isWarMode ? '#090d14' : '#03060c';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.translate(this.width * 0.5 + shakeX, this.height * 0.5 + shakeY);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-this.camX, -this.camZ);

      if (isWarMode) {
        // TRUE SPLIT WAR FRONT SCENE: Render ONLY the Planetary 3-Layer War Front!
        this.drawPlanetaryWarFrontTerrain(ctx, state);
        this.drawConveyorNetwork(ctx, state, 'war');
        this.drawFloorPads(ctx, state, 'war');
        this.drawThreeLayerGates(ctx, state);
        this.drawBeltPackets(ctx, state, 'war');
        this.drawWarZoneObjects(ctx, state);
        this.drawSortedEntities(ctx, state, 'war');
        this.drawProjectilesAndArcs(ctx, state);
        this.drawEagleFlyover(ctx, state);
      } else {
        // TRUE SPLIT SHOP SCENE: Render ONLY the SES Super Destroyer Orbital Warship Deck!
        this.drawSuperDestroyerWarshipDeck(ctx, state);
        this.drawConveyorNetwork(ctx, state, 'shop');
        this.drawFloorPads(ctx, state, 'shop');
        this.drawRawQuarryAndAmmoPress(ctx, state);
        this.drawArsenalFactories(ctx, state);
        this.drawDedicatedCountersAndCash(ctx, state);
        this.drawBeltPackets(ctx, state, 'shop');
        this.drawSortedEntities(ctx, state, 'shop');
        this.drawProjectilesAndArcs(ctx, state);
      }
      ctx.restore();

      // Draw Live Tactical Mini-Map Radar on wider screens only
      if (this.width >= 900) {
        this.drawMiniMapRadar(ctx, state);
      }

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
    // 1A. SES SUPER DESTROYER ORBITAL WARSHIP DECK (SHOP MODE — NO WAR ZONE!)
    //     Authentic Helldivers 2 Orbital Warship Bridge, Hull, Starfield & Planet
    // ========================================================================
    drawSuperDestroyerWarshipDeck(ctx, state) {
      const activeBaseCfg = state.getActiveBaseConfig ? state.getActiveBaseConfig() : { color: '#38bdf8', code: 'SECTOR ALPHA-01', floorTint: '#111927' };
      const planetColor = activeBaseCfg.color || '#38bdf8';

      // 1. Deep Space Starfield Backdrop around the Super Destroyer
      ctx.fillStyle = '#03060d';
      ctx.fillRect(-3800, -1600, 8000, 4600);

      for (let i = 0; i < this.spaceStars.length; i++) {
        const st = this.spaceStars[i];
        const twinkle = 0.45 + 0.55 * Math.sin(this.time * st.speed + i);
        ctx.fillStyle = st.color;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(st.x, st.z, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 2. Glowing Planetary Horizon Limb in Low Orbit ahead of the Warship Bow (z < -200)
      ctx.save();
      const limbGrad = ctx.createRadialGradient(0, -2500, 1400, 0, -2500, 2380);
      limbGrad.addColorStop(0, '#071324');
      limbGrad.addColorStop(0.76, '#0c223d');
      limbGrad.addColorStop(0.93, planetColor);
      limbGrad.addColorStop(0.97, 'rgba(56, 189, 248, 0.25)');
      limbGrad.addColorStop(1, 'rgba(3, 6, 13, 0)');
      ctx.fillStyle = limbGrad;
      ctx.beginPath();
      ctx.arc(0, -2500, 2380, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Flanking Allied SES Super Destroyers cruising in Low Orbit (Port & Starboard)
      this.drawAlliedOrbitingDestroyer(ctx, -2560, 420 + Math.sin(this.time * 0.6) * 25, 0.85, 'SES WINGS OF LIBERTY');
      this.drawAlliedOrbitingDestroyer(ctx, 2660, 680 + Math.cos(this.time * 0.5) * 25, 0.85, 'SES FIST OF DEMOCRACY');

      // 4. Main SES Super Destroyer Outer Armored Hull Silhouette & Stern Engine Thrusters
      ctx.save();
      // Ion Engine Plumes at the Stern (z = 1970)
      for (const ex of [-1150, -450, 450, 1150]) {
        const thrustLen = 190 + Math.sin(this.time * 16 + ex) * 28;
        const tGrad = ctx.createLinearGradient(ex, 1960, ex, 1960 + thrustLen);
        tGrad.addColorStop(0, '#38bdf8');
        tGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.55)');
        tGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.moveTo(ex - 95, 1960);
        ctx.lineTo(ex + 95, 1960);
        ctx.lineTo(ex + 45, 1960 + thrustLen);
        ctx.lineTo(ex - 45, 1960 + thrustLen);
        ctx.closePath();
        ctx.fill();

        // Thruster nozzle housing
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.fillRect(ex - 105, 1935, 210, 32);
        ctx.strokeRect(ex - 105, 1935, 210, 32);
      }

      // Outer Armored Warship Hull Polygon (Angled Destroyer Bow + Broad Hangar Wings)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-980, -280);
      ctx.lineTo(980, -280);
      ctx.lineTo(2290, -80);
      ctx.lineTo(2290, 1950);
      ctx.lineTo(-2190, 1950);
      ctx.lineTo(-2190, -80);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner Hangar Deck Floor (Metallic Gunmetal Plating)
      ctx.fillStyle = '#0e1524';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-920, -220);
      ctx.lineTo(920, -220);
      ctx.lineTo(2210, -40);
      ctx.lineTo(2210, 1900);
      ctx.lineTo(-2110, 1900);
      ctx.lineTo(-2110, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 5. Forward Panoramic Bridge Viewport Windows (Looking out into Orbit at z = -220..-155)
      ctx.save();
      for (let wi = -3; wi <= 3; wi++) {
        const wx = wi * 230;
        const glassGrad = ctx.createLinearGradient(wx, -218, wx, -155);
        glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        glassGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
        ctx.fillStyle = glassGrad;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.fillRect(wx - 104, -215, 208, 56);
        ctx.strokeRect(wx - 104, -215, 208, 56);
      }
      ctx.fillStyle = '#fde047';
      ctx.font = '900 14px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🚀 SES SUPER DESTROYER BRIDGE — ORBITING ${activeBaseCfg.code}`, 0, -182);
      ctx.restore();

      // 6. Subtle Gunmetal Deck Plating Seams & Super Earth Emblem Watermark
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = -2080; x <= 2160; x += 160) {
        ctx.moveTo(x, -40);
        ctx.lineTo(x, 1890);
      }
      for (let z = -40; z <= 1890; z += 135) {
        ctx.moveTo(-2080, z);
        ctx.lineTo(2160, z);
      }
      ctx.stroke();

      // Watermarked Super Earth Skull & Wings Emblem in Hangar Center
      ctx.translate(-460, 930);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.035)';
      ctx.beginPath();
      ctx.arc(0, 0, 280, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.07)';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      // 7. Three Clean Hangar Bay Deck Zones (Port Extraction Bay, Center Arsenal Bay, Starboard Requisition Bay)
      this.drawFloorSector(
        ctx,
        -2080,
        -25,
        1040,
        1890,
        'rgba(17, 34, 54, 0.55)',
        '#38bdf8',
        '⛏️ PORT CARGO BAY: RAW ORE & AMMO'
      );

      this.drawFloorSector(
        ctx,
        -990,
        -25,
        1040,
        1890,
        'rgba(27, 36, 52, 0.55)',
        '#facc15',
        '⚙️ CENTER HANGAR: 7 ARSENAL LANES'
      );

      this.drawFloorSector(
        ctx,
        100,
        -25,
        2060,
        1890,
        'rgba(20, 41, 36, 0.55)',
        '#22c55e',
        '💵 STARBOARD DECK: 7 HELLDIVER COUNTERS'
      );

      // 8. Bridge Galactic War Hologram Table, Mindustry Core & 4 Hellpod Drop Tubes
      this.drawMindustryCoreAndPortal(ctx, state);
      this.drawBridgeHellpodLaunchBay(ctx, state);
    }

    drawAlliedOrbitingDestroyer(ctx, x, z, scale, shipName) {
      ctx.save();
      ctx.translate(x, z);
      ctx.scale(scale, scale);

      // Thruster glow
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 210, 42, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wedge Destroyer Silhouette
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -220);
      ctx.lineTo(110, 180);
      ctx.lineTo(40, 200);
      ctx.lineTo(-40, 200);
      ctx.lineTo(-110, 180);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gold Super Earth hull stripe
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -170);
      ctx.lineTo(0, 160);
      ctx.stroke();

      ctx.fillStyle = 'rgba(250, 204, 21, 0.65)';
      ctx.font = '900 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(shipName, 0, 245);
      ctx.restore();
    }

    drawBridgeHellpodLaunchBay(ctx, state) {
      ctx.save();
      ctx.translate(220, -100);

      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-210, -48, 420, 92, 12);
      ctx.fill();
      ctx.stroke();

      // 4 Circular Hellpod Launch Tubes
      for (let i = 0; i < 4; i++) {
        const hx = -135 + i * 90;
        const pulse = 0.65 + 0.35 * Math.sin(this.time * 5 + i);
        ctx.fillStyle = '#090d14';
        ctx.strokeStyle = `rgba(250, 204, 21, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hx, 6, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚀', hx, 7);
      }

      ctx.fillStyle = '#fca5a5';
      ctx.font = '900 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚀 4x HELLPOD DROP TUBES (TAP ⚔️ WAR FRONT TO DROP)', 0, -28);
      ctx.restore();
    }

    // ========================================================================
    // 1B. PLANETARY WAR FRONT TERRAIN (WAR MODE ONLY — NO SHOP VISIBLE!)
    // ========================================================================
    drawPlanetaryWarFrontTerrain(ctx, state) {
      const W = window.GameConfig.WORLD;

      const warGrad = ctx.createLinearGradient(0, W.minZ - 200, 0, W.wallZ + 220);
      warGrad.addColorStop(0, '#140c1c');
      warGrad.addColorStop(0.5, '#1e1b2e');
      warGrad.addColorStop(1, '#273042');
      ctx.fillStyle = warGrad;
      ctx.fillRect(W.minX - 250, W.minZ - 250, (W.maxX - W.minX) + 500, (W.wallZ - W.minZ) + 520);

      // Flanking Canyon Walls outside the 3-Layer Defense Corridor
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.fillRect(W.minX, W.minZ, W.corridorMinX - W.minX, (W.wallZ - W.minZ) + 160);
      ctx.strokeRect(W.minX, W.minZ, W.corridorMinX - W.minX, (W.wallZ - W.minZ) + 160);
      ctx.fillRect(W.corridorMaxX, W.minZ, W.maxX - W.corridorMaxX, (W.wallZ - W.minZ) + 160);
      ctx.strokeRect(W.corridorMaxX, W.minZ, W.maxX - W.corridorMaxX, (W.wallZ - W.minZ) + 160);

      // Clean Wave Header at North Edge
      ctx.save();
      ctx.fillStyle = 'rgba(248, 113, 113, 0.45)';
      ctx.font = '900 20px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      const waveBanner = state.waveState === 'rest'
        ? `⏳ WAVE ${state.waveNumber} IN ${Math.ceil(state.waveTimer)}s`
        : `🚨 WAVE ${state.waveNumber} — ${state.enemies.length + state.waveEnemiesToSpawn} HOSTILES`;
      ctx.fillText(waveBanner, 0, -1760);
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

      // Mindustry Mend Projectors behind Gate Layers if unlocked
      const mendLvl = state.mendProjectorLevel || 0;
      if (mendLvl > 0) {
        for (const g of window.GameConfig.GATES) {
          ctx.save();
          ctx.translate(g.x + 210, g.z + 75);
          const ringR = 26 + ((this.time * 45) % 90);
          const alpha = Math.max(0, 1 - (ringR - 26) / 90) * 0.45;
          ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, ringR, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#064e3b';
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 3;
          ctx.fillRect(-22, -22, 44, 44);
          ctx.strokeRect(-22, -22, 44, 44);
          ctx.fillStyle = '#4ade80';
          ctx.font = '900 10px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`💚 MEND Lv.${mendLvl}`, 0, -28);
          ctx.font = '16px sans-serif';
          ctx.fillText('💚', 0, 5);
          ctx.restore();
        }
      }

      // Southern Citadel Trench & Hellpod Extraction Beacon back to Super Destroyer Shop
      ctx.save();
      ctx.translate(0, -140);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-240, -32, 480, 64, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚀 PELICAN-1 / HELLPOD UPLINK — TAP 🏪 SHOP TO RETURN TO WARSHIP', 0, 4);
      ctx.restore();
    }

    drawFloorSector(ctx, x, z, w, h, bg, accent, title) {
      ctx.save();
      ctx.fillStyle = bg;
      ctx.fillRect(x, z, w, h);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, z, w, h);
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = accent;
      ctx.font = '900 13px Orbitron, sans-serif';
      ctx.fillText(title, x + 18, z + 26);
      ctx.restore();
    }

    // ========================================================================
    // 2. SPLIT CONVEYOR BELT NETWORK (NO FAKE ITEMS WHEN EMPTY!)
    //    - Belt 1: conv_raw_e710 (Purple #a855f7) -> ONLY E-710 Stations
    //    - Belt 2: conv_raw_iron (Cyan #38bdf8)   -> ONLY Iron Stations & Ammo Press
    //    - Belt 3: conv_counter_auto (Green)      -> 7 Horizontal Lane Belts (Pickup -> Counter #1..7)
    //    - Belts 4–6: conv_gate_1/2/3             -> Ammo Press -> Gate Layers 1/2/3
    // ========================================================================
    drawConveyorNetwork(ctx, state, mode = 'shop') {
      const AP = window.GameConfig.AMMO_PRESS;
      const gates = window.GameConfig.GATES;

      if (mode === 'war') {
        for (const g of gates) {
          const beltLvl = state.conveyorLevels?.[g.conveyorId] || 0;
          const path = [
            { x: -560, z: -150 },
            { x: -560, z: g.turretZ },
            { x: g.leftTurretX, z: g.turretZ }
          ];
          this.drawBeltPath(ctx, path, beltLvl, g.color);
        }
        return;
      }

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

      // Gate Turret Ammo Belts are rendered in War Mode ('war') only

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
    drawBeltPackets(ctx, state, mode = 'shop') {
      if (!state.beltPackets || state.beltPackets.length === 0) return;
      for (const pkt of state.beltPackets) {
        const isGateBelt = pkt.beltId && pkt.beltId.startsWith('conv_gate_');
        if (mode === 'shop' && isGateBelt) continue;
        if (mode === 'war' && !isGateBelt) continue;
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
    drawFloorPads(ctx, state, mode = 'shop') {
      const L = window.GameConfig.LOCATIONS;

      if (mode === 'war') {
        for (const c of window.GameConfig.CONVEYORS) {
          if (!c.gateId) continue;
          const lvl = state.conveyorLevels?.[c.id] || 0;
          const isMax = lvl >= c.maxLevel;
          const rem = Math.max(0, state.conveyorRemaining?.[c.id] ?? state.getConveyorUpgradeCost(c.id));
          const title = isMax ? `${c.icon} MAX Lv.20` : (lvl === 0 ? `🔓 BELT $${rem}` : `⬆️ BELT Lv.${lvl + 1} ($${rem})`);
          this.drawPadBox(ctx, c.padX, c.padZ, 162, 68, c.color, title, c.name);
        }
        return;
      }

      this.drawPadBox(
        ctx,
        L.armoryLoadoutPad.x,
        L.armoryLoadoutPad.z,
        156,
        74,
        '#a855f7',
        '🛡️ ARMORY LOADOUT',
        'Weapons, Guard Dog & Mechs'
      );

      // Shop Conveyor Belt Pads (Only non-gate belts in Shop Mode!)
      for (const c of window.GameConfig.CONVEYORS) {
        if (c.gateId) continue;
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
      const p = this.lastPlayerPos || { x: 0, z: 0 };
      const isNear = Math.hypot(p.x - x, p.z - z) < 250;

      ctx.save();
      ctx.translate(x, z);
      ctx.fillStyle = isNear ? 'rgba(15, 23, 42, 0.94)' : 'rgba(15, 23, 42, 0.78)';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 8);
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = isNear ? 3 : 2;
      if (!isNear) ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = '900 11.5px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, 0, (isNear && subtitle) ? -7 : 1);

      if (isNear && subtitle) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 10.5px Rajdhani, sans-serif';
        ctx.fillText(subtitle, 0, 11);
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

    drawSortedEntities(ctx, state, mode = 'shop') {
      const renderList = [];

      renderList.push({
        z: state.player.z,
        draw: () => this.drawPlayerCommander(ctx, state)
      });

      if (mode !== 'war') {
        for (const w of state.workers) {
          if (w.z < -180) continue;
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
      } else {
        if (state.alliedUnits) {
          for (const u of state.alliedUnits) {
            renderList.push({
              z: u.z,
              draw: () => this.drawAlliedWarUnit(ctx, u)
            });
          }
        }

        for (const e of state.enemies) {
          renderList.push({
            z: e.z,
            draw: () => this.drawEnemy(ctx, e)
          });
        }
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

    // Mindustry Core Shard, Multi-Base Orbital Receiver & Split Shop/War Rapid-Transit Portal
    drawMindustryCoreAndPortal(ctx, state) {
      const baseCfg = state.getActiveBaseConfig ? state.getActiveBaseConfig() : { name: 'Base Alpha', code: 'SECTOR ALPHA-01', color: '#facc15' };
      ctx.save();
      ctx.translate(-520, -90);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = baseCfg.color || '#facc15';
      ctx.lineWidth = 4;
      ctx.fillRect(-70, -54, 140, 108);
      ctx.strokeRect(-70, -54, 140, 108);

      const pulse = 1 + Math.sin(this.time * 4) * 0.08;
      ctx.save();
      ctx.scale(pulse, pulse);
      ctx.fillStyle = baseCfg.color || '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏛️', 0, 1);

      ctx.fillStyle = '#fde047';
      ctx.font = '900 11.5px Orbitron, sans-serif';
      ctx.fillText(`🏛️ MINDUSTRY CORE: ${baseCfg.code}`, 0, -64);
      ctx.fillStyle = '#4ade80';
      ctx.font = '700 11px Rajdhani, sans-serif';
      const exportIncome = state.getTotalPassiveBaseIncome ? state.getTotalPassiveBaseIncome() : 0;
      ctx.fillText(`🚀 Launch Pad Network: +$${exportIncome}/s Passive`, 0, 68);
      ctx.restore();

      // Mindustry Mend Projectors behind Gate Layers if unlocked (`state.mendProjectorLevel > 0`)
      const mendLvl = state.mendProjectorLevel || 0;
      if (mendLvl > 0) {
        for (const g of window.GameConfig.GATES) {
          ctx.save();
          ctx.translate(g.x + 210, g.z + 75);
          const ringR = 26 + ((this.time * 45) % 90);
          const alpha = Math.max(0, 1 - (ringR - 26) / 90) * 0.45;
          ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, ringR, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#064e3b';
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 3;
          ctx.fillRect(-22, -22, 44, 44);
          ctx.strokeRect(-22, -22, 44, 44);
          ctx.fillStyle = '#4ade80';
          ctx.font = '900 10px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`💚 MEND Lv.${mendLvl}`, 0, -28);
          ctx.font = '16px sans-serif';
          ctx.fillText('💚', 0, 5);
          ctx.restore();
        }
      }
    }

    // Draws Allied Combat Units Deployed on the War Front (`deploy_squad`, `deploy_buggy`, `deploy_mech`)
    drawAlliedWarUnit(ctx, u) {
      if (u.unitType === 'deploy_mech') {
        this.drawPatriotMechSprite(ctx, u.x, u.z, this.time * 1.4, 1.15, true, []);
      } else if (u.unitType === 'deploy_buggy') {
        this.drawReconVehicleSprite(ctx, u.x, u.z, this.time * 1.6, 1.12, true, []);
      } else {
        this.drawCarbotBean(ctx, u.x, u.z, {
          bodyColor: '#1d4ed8',
          capeColor: '#facc15',
          trimColor: '#fde047',
          visorColor: '#38bdf8',
          isCommander: false,
          hasRifle: true,
          weaponId: 'w_liberator',
          walkPhase: this.time * 8,
          scale: 0.96,
          label: ''
        });
      }
      ctx.save();
      ctx.translate(u.x, u.z);
      const hpRatio = Math.max(0, Math.min(1, u.hp / u.maxHp));
      ctx.fillStyle = '#090d14';
      ctx.fillRect(-20, -38, 40, 6);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(-19, -37, 38 * hpRatio, 4);
      ctx.fillStyle = '#86efac';
      ctx.font = '900 9.5px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(u.label || 'ALLIED UNIT', 0, -42);
      ctx.restore();
    }

    // Interactive 2D Mindustry-Style Visual Node Tech Tree Renderer
    renderMindustryTechTree(canvas, state, selectedNodeId) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const cw = Math.max(300, Math.floor(rect.width || 860));
      const ch = Math.max(240, Math.floor(rect.height || 320));
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Mindustry dark schematic background + grid
      ctx.fillStyle = '#070b12';
      ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cw; gx += 28) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, ch);
        ctx.stroke();
      }
      for (let gy = 0; gy < ch; gy += 28) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(cw, gy);
        ctx.stroke();
      }

      const nodes = window.GameConfig.MINDUSTRY_TECH_NODES || [];
      const nodeMap = {};
      for (const n of nodes) nodeMap[n.id] = n;

      // 1. Draw Mindustry Orthogonal / Diagonal Conduit Pipes (Parent -> Child)
      for (const n of nodes) {
        if (!n.parentId || !nodeMap[n.parentId]) continue;
        const p = nodeMap[n.parentId];
        const px = p.nx * cw;
        const py = p.ny * ch;
        const cx = n.nx * cw;
        const cy = n.ny * ch;
        const pLvl = state.getTechNodeLevel ? state.getTechNodeLevel(p.id) : 0;
        const nLvl = state.getTechNodeLevel ? state.getTechNodeLevel(n.id) : 0;
        const midY = (py + cy) * 0.5;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, midY);
        ctx.lineTo(cx, midY);
        ctx.lineTo(cx, cy);

        if (nLvl > 0) {
          ctx.strokeStyle = n.color || '#4ade80';
          ctx.lineWidth = 4;
          ctx.stroke();
        } else if (pLvl > 0 || p.id === 'core_shard') {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Draw Each Mindustry Tech Node Box
      const boxW = cw < 520 ? 68 : 118;
      const boxH = cw < 520 ? 44 : 52;

      for (const n of nodes) {
        const cx = n.nx * cw;
        const cy = n.ny * ch;
        const lvl = state.getTechNodeLevel ? state.getTechNodeLevel(n.id) : 0;
        const unlockedParent = !n.parentId || (state.getTechNodeLevel ? state.getTechNodeLevel(n.parentId) > 0 : true);
        const isSelected = n.id === selectedNodeId;

        ctx.save();
        ctx.translate(cx, cy);

        ctx.fillStyle = lvl > 0 ? '#132a23' : (unlockedParent ? '#1e293b' : '#0f141f');
        ctx.strokeStyle = isSelected ? '#ffffff' : (lvl > 0 ? (n.color || '#4ade80') : (unlockedParent ? '#facc15' : '#334155'));
        ctx.lineWidth = isSelected ? 3.5 : 2.2;

        ctx.beginPath();
        ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = cw < 520 ? '15px sans-serif' : '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.icon, cw < 520 ? 0 : -boxW / 2 + 18, cw < 520 ? -6 : -4);

        ctx.fillStyle = lvl > 0 ? '#4ade80' : (unlockedParent ? '#fde047' : '#64748b');
        ctx.font = cw < 520 ? '900 8.5px Orbitron, sans-serif' : '900 9.5px Orbitron, sans-serif';
        if (cw < 520) {
          ctx.fillText(`Lv.${lvl}/${n.maxLevel}`, 0, 12);
        } else {
          ctx.textAlign = 'left';
          const shortTitle = n.name.length > 14 ? n.name.slice(0, 13) + '..' : n.name;
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(shortTitle, -boxW / 2 + 32, -7);
          ctx.fillStyle = lvl > 0 ? '#4ade80' : (unlockedParent ? '#fde047' : '#94a3b8');
          ctx.fillText(`Lv.${lvl}/${n.maxLevel}`, -boxW / 2 + 32, 9);
        }

        ctx.restore();
      }

      ctx.restore();
    }
  }

  window.WorldRenderer2D = WorldRenderer2D;
})();
