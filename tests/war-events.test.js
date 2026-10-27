const assert=require('assert');
const events=require('../js/war-events.js');
const config={WAR_EVENTS:[{id:'one',title:'One',choices:[]}],WAR_REWARDS:[
{id:'a',title:'A'},{id:'b',title:'B'},{id:'c',title:'C'},{id:'d',title:'D'}]};
const run={seed:42,nodeIndex:2,loot:{cash:0,common:0,rare:0,superRare:0}};
assert.strictEqual(events.pickEvent(run,config).id,'one');
const game={raw_iron:3};
const choice={cost:{raw_iron:2},outcome:{cash:120,common:2,rare:1}};
assert(events.canAfford(game,choice.cost));
const result=events.applyChoice(game,run,choice);
assert(result.ok); assert.strictEqual(game.raw_iron,1); assert.deepStrictEqual(run.loot,{cash:120,common:2,rare:1,superRare:0});
assert.strictEqual(events.applyChoice(game,run,choice).ok,false);
const rewards=events.rewardChoices(run,config); assert.strictEqual(rewards.length,3);
rewards[0].title='changed'; assert.notStrictEqual(config.WAR_REWARDS[0].title,'changed');
console.log('PASS war-events: deterministic selection, costs, outcomes, unavailable state and reward cloning');
