/* ==========================================================================
   HELLDIVERS PLEASE! — Super Earth Logistics & Arsenal Tycoon
   js/audio.js — Procedural Web Audio Synthesizer (Zero External Sound Files)
   Combines Module 3.2.K (Burger Please ASMR) & Module 3.2.F (Helldivers Audio)
   ========================================================================== */

class ProceduralAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.muted = false;
    this.initialized = false;
    this.cashCombo = 0;
    this.lastCashTime = 0;
  }

  init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.75;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (err) {
      // Graceful fallback if blocked
    }
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.75, this.ctx.currentTime);
    }
    return this.muted;
  }

  // Module 3.2.K: Burger/Item Stack Thud (playBurgerStack)
  playItemStack(stackCount = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const pitchOffset = Math.min(stackCount * 9, 220);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(185 + pitchOffset, now);
    osc.frequency.exponentialRampToValueAtTime(70 + pitchOffset * 0.3, now + 0.045);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  // Module 3.2.I / 3.2.K: Pitch-Ascending Cash Pickup Cascade
  playCashPickup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastCashTime > 0.45) {
      this.cashCombo = 0;
    } else {
      this.cashCombo = Math.min(this.cashCombo + 1, 24);
    }
    this.lastCashTime = now;

    const freq = 587.33 * Math.pow(2, (this.cashCombo * 0.5) / 12);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.075);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Module 3.2.K: Cash Spend Pentatonic Chime into Unlock Zones
  playCashSpend(step = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = scale[step % scale.length];
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  // Module 3.2.K: Customer Order Satisfied Dual-Sine Bell Ding
  playOrderComplete() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [1046.5, 1318.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);
      gain.gain.setValueAtTime(0.22, now + idx * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.42);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.45);
    });
  }

  // Module 3.2.F: Helldivers Stratagem Terminal Beep & Error
  playStratagemKey(isSuccess = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isSuccess) {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1320, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  // Module 3.2.F: Heroic 4-Note Brass Leitmotif (F3 -> E3 -> D3 -> A2) + 500kg Blast
  playHeroicFanfareAndBlast(with500kg = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 4-Note Helldivers Brass Motif: F3 (174.61), E3 (164.81), D3 (146.83), A2 (110.00)
    const notes = [
      { f: 174.61, t: 0.0, d: 0.22 },
      { f: 164.81, t: 0.24, d: 0.22 },
      { f: 146.83, t: 0.48, d: 0.28 },
      { f: 220.00, t: 0.78, d: 0.55 }
    ];

    notes.forEach((n) => {
      [-6, 0, 6].forEach((detune) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        osc.detune.setValueAtTime(detune, now + n.t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, now + n.t);

        gain.gain.setValueAtTime(0.08, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.02);
      });
    });

    if (with500kg) {
      // 90ms Audio Ducking then Seismic Drop (Module 3.2.F)
      this.masterGain.gain.setValueAtTime(0.15, now + 0.85);
      this.masterGain.gain.setValueAtTime(0.75, now + 0.94);

      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(98, now + 0.94);
      subOsc.frequency.exponentialRampToValueAtTime(22, now + 2.1);

      subGain.gain.setValueAtTime(0.45, now + 0.94);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.15);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now + 0.94);
      subOsc.stop(now + 2.2);
    }
  }
}

window.audioEngine = new ProceduralAudioEngine();
