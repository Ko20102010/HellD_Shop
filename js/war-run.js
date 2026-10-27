// ============================================================================
// HELLDIVERS PLEASE! v0.0.15 Phase 1
// Deterministic War Expedition foundation: seed, route, validation, migration.
// ============================================================================
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WarRunEngine = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const VALID_TYPES = new Set(['battle', 'elite', 'event', 'camp', 'armoury', 'merchant', 'hazard', 'boss']);

  function clampInt(value, min, max, fallback) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  }

  function normaliseSeed(seed) {
    const n = Number(seed);
    if (!Number.isFinite(n)) return 1;
    const unsigned = (Math.trunc(n) >>> 0);
    return unsigned || 1;
  }

  function nextRandom(state) {
    state.seed = normaliseSeed(state.seed);
    state.rngIndex = clampInt(state.rngIndex, 0, 0x7fffffff, 0);
    let x = (state.seed + Math.imul(state.rngIndex + 1, 0x9e3779b9)) >>> 0;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17; x >>>= 0;
    x ^= x << 5; x >>>= 0;
    state.rngIndex += 1;
    return x / 4294967296;
  }

  function weightedType(rngState, nodeTypes, difficulty) {
    const entries = Object.entries(nodeTypes || {}).filter(([id, def]) => {
      if (!VALID_TYPES.has(id) || id === 'boss') return false;
      if (id === 'hazard' && difficulty <= 3) return false;
      return Number(def && def.weight) > 0;
    });
    const total = entries.reduce((sum, [, def]) => sum + Number(def.weight), 0);
    if (!entries.length || total <= 0) return 'battle';
    let roll = nextRandom(rngState) * total;
    for (const [id, def] of entries) {
      roll -= Number(def.weight);
      if (roll <= 0) return id;
    }
    return entries[entries.length - 1][0];
  }

  function generateRoute(options) {
    const mode = options.mode === 'capture' ? 'capture' : 'sample';
    const difficulty = clampInt(options.difficulty, 1, 10, 1);
    const expedition = options.expedition || {};
    const nodeCount = clampInt(expedition.nodeCount, 3, 40, mode === 'capture' ? 20 : 12);
    const rng = { seed: normaliseSeed(options.seed), rngIndex: 0 };
    const route = [];

    for (let i = 0; i < nodeCount; i++) {
      let type;
      if (i === 0) type = 'battle';
      else if (i === nodeCount - 1) type = expedition.finalNodeType || 'boss';
      else type = weightedType(rng, options.nodeTypes, difficulty);

      if (type === 'elite' && i + 1 < (expedition.minEliteNode || 4)) type = 'battle';
      if (type === 'camp' && route[i - 1] && route[i - 1].type === 'camp') type = 'event';
      route.push({
        id: `node_${String(i + 1).padStart(2, '0')}`,
        index: i,
        type,
        faction: options.faction || 'bugs',
        resolved: false
      });
    }

    if (expedition.guaranteedCampBeforeBoss && !route.slice(1, -1).some((n) => n.type === 'camp')) {
      const campIndex = Math.max(1, nodeCount - 3);
      route[campIndex].type = 'camp';
    }
    if (mode === 'capture' && expedition.requiredFactionEvent && !route.slice(1, -1).some((n) => n.type === 'event')) {
      route[Math.max(1, nodeCount - 4)].type = 'event';
    }
    return { route, rngIndex: rng.rngIndex };
  }

  function createRun(options, config) {
    const cfg = config || {};
    const mode = options.mode === 'capture' ? 'capture' : 'sample';
    const difficulty = clampInt(options.difficulty, 1, 10, 1);
    const seed = normaliseSeed(options.seed || Date.now());
    const generated = generateRoute({
      mode,
      difficulty,
      faction: options.faction,
      seed,
      expedition: cfg.WAR_EXPEDITIONS && cfg.WAR_EXPEDITIONS[mode],
      nodeTypes: cfg.WAR_NODE_TYPES
    });
    return {
      schemaVersion: SCHEMA_VERSION,
      id: options.id || `run_${seed}_${mode}`,
      seed,
      rngIndex: generated.rngIndex,
      mode,
      difficulty,
      faction: options.faction === 'autobots' ? 'autobots' : 'bugs',
      planetId: options.planetId || null,
      planetName: options.planetName || null,
      phase: 'travel',
      nodeIndex: 0,
      route: generated.route,
      resolvedNodes: {},
      pendingEncounter: null,
      pendingChoices: [],
      pendingRewards: [],
      loot: { cash: 0, common: 0, rare: 0, superRare: 0, items: {} },
      active: true
    };
  }

  function validateRoute(route, expectedCount) {
    if (!Array.isArray(route) || route.length !== expectedCount) return false;
    if (route[0]?.type !== 'battle' || route[route.length - 1]?.type !== 'boss') return false;
    if (!route.some((n, i) => i > 0 && i < route.length - 1 && n.type === 'camp')) return false;
    for (let i = 0; i < route.length; i++) {
      const node = route[i];
      if (!node || node.index !== i || !VALID_TYPES.has(node.type)) return false;
      if (i > 0 && node.type === 'camp' && route[i - 1].type === 'camp') return false;
      if (i < 3 && node.type === 'elite') return false;
    }
    return true;
  }

  function isValidRun(run, config) {
    if (!run || run.schemaVersion !== SCHEMA_VERSION || !run.active) return false;
    const mode = run.mode === 'capture' ? 'capture' : 'sample';
    const expected = config?.WAR_EXPEDITIONS?.[mode]?.nodeCount || (mode === 'capture' ? 20 : 12);
    return validateRoute(run.route, expected) && run.nodeIndex >= 0 && run.nodeIndex < expected;
  }

  function defaultProgress(existingDifficulty) {
    return {
      schemaVersion: SCHEMA_VERSION,
      highestSampleDifficulty: clampInt(existingDifficulty, 1, 10, 1),
      completedSampleRuns: 0,
      completedCaptureRuns: 0,
      discoveredEvents: {},
      discoveredRelics: {},
      injuredHeroes: {},
      fallenHeroes: {},
      highestHardcoreDifficulty: 0,
      autoUltimateEnabled: false
    };
  }

  function migrateProgress(value, existingDifficulty) {
    const base = defaultProgress(existingDifficulty);
    if (!value || typeof value !== 'object') return base;
    return {
      ...base,
      ...value,
      schemaVersion: SCHEMA_VERSION,
      highestSampleDifficulty: clampInt(value.highestSampleDifficulty, 1, 10, base.highestSampleDifficulty),
      completedSampleRuns: clampInt(value.completedSampleRuns, 0, 1000000, 0),
      completedCaptureRuns: clampInt(value.completedCaptureRuns, 0, 1000000, 0),
      discoveredEvents: value.discoveredEvents && typeof value.discoveredEvents === 'object' ? value.discoveredEvents : {},
      discoveredRelics: value.discoveredRelics && typeof value.discoveredRelics === 'object' ? value.discoveredRelics : {},
      injuredHeroes: value.injuredHeroes && typeof value.injuredHeroes === 'object' ? value.injuredHeroes : {},
      fallenHeroes: value.fallenHeroes && typeof value.fallenHeroes === 'object' ? value.fallenHeroes : {},
      highestHardcoreDifficulty: clampInt(value.highestHardcoreDifficulty, 0, 10, 0),
      autoUltimateEnabled: !!value.autoUltimateEnabled
    };
  }

  return {
    SCHEMA_VERSION,
    normaliseSeed,
    nextRandom,
    generateRoute,
    createRun,
    validateRoute,
    isValidRun,
    defaultProgress,
    migrateProgress
  };
});
