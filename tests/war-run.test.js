const assert = require('assert');
const engine = require('../js/war-run.js');
const config = {
  WAR_EXPEDITIONS: {
    sample: { nodeCount: 12, finalNodeType: 'boss', guaranteedCampBeforeBoss: true, minEliteNode: 4 },
    capture: { nodeCount: 20, finalNodeType: 'boss', guaranteedCampBeforeBoss: true, requiredFactionEvent: true, minEliteNode: 4 }
  },
  WAR_NODE_TYPES: {
    battle: { weight: 38 }, elite: { weight: 10 }, event: { weight: 18 }, camp: { weight: 10 },
    armoury: { weight: 8 }, merchant: { weight: 7 }, hazard: { weight: 6 }, boss: { weight: 0 }
  }
};

for (const mode of ['sample', 'capture']) {
  const count = mode === 'sample' ? 12 : 20;
  for (let seed = 1; seed <= 100; seed++) {
    const run = engine.createRun({ mode, seed, difficulty: (seed % 10) + 1, faction: seed % 2 ? 'bugs' : 'autobots' }, config);
    assert.strictEqual(run.route.length, count);
    assert(engine.validateRoute(run.route, count));
    assert(engine.isValidRun(run, config));
    if (mode === 'capture') assert(run.route.slice(1, -1).some(n => n.type === 'event'));
  }
}

const a = engine.createRun({ mode: 'sample', seed: 987654, difficulty: 7, faction: 'bugs' }, config);
const b = engine.createRun({ mode: 'sample', seed: 987654, difficulty: 7, faction: 'bugs' }, config);
assert.deepStrictEqual(a.route, b.route);

const p = engine.migrateProgress({ highestSampleDifficulty: 99, completedSampleRuns: -2, autoUltimateEnabled: 1 }, 4);
assert.strictEqual(p.highestSampleDifficulty, 10);
assert.strictEqual(p.completedSampleRuns, 0);
assert.strictEqual(p.autoUltimateEnabled, true);

console.log('PASS war-run: 200 deterministic routes, constraints, validation and progress migration');
