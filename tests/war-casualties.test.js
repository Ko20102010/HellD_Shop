const assert=require('assert');
const casualty=require('../js/war-casualties.js');
const cfg={WAR_RECOVERY_COSTS:{injured:{cash:180,common:2},critical:{cash:500,rare:2}}};
function game(){return{cash:1000,samples:{common:10,rare:5},warProgress:{injuredHeroes:{},fallenHeroes:{}},helldiverRoster:[{id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'}],capybaraLineup:['a','b','c',null]};}
let g=game();let combat={heroes:[{id:'a',name:'A',hp:0,maxHp:100,alive:false},{id:'b',name:'B',hp:50,maxHp:100,alive:true}]};
let r=casualty.resolveDefeat(g,combat,'standard');assert.deepStrictEqual(r.injured,['a']);assert.strictEqual(g.helldiverRoster.length,3);assert(casualty.unavailable(g.warProgress,'a'));assert.deepStrictEqual(casualty.availableLineup(g),['b','c']);
let rec=casualty.recover(g,'a',cfg);assert(rec.ok);assert.strictEqual(g.cash,500);assert.strictEqual(g.samples.rare,3);assert(!casualty.unavailable(g.warProgress,'a'));
g=game();r=casualty.resolveDefeat(g,combat,'hardcore');assert.deepStrictEqual(r.fallen,['a']);assert.strictEqual(g.helldiverRoster.length,2);assert.strictEqual(g.capybaraLineup[0],null);assert(g.warProgress.fallenHeroes.a);
g=game();g.warProgress.injuredHeroes.a={severity:'injured',remainingExpeditions:1};casualty.afterSuccessfulExpedition(g.warProgress);assert(!g.warProgress.injuredHeroes.a);
g=game();g.cash=0;g.warProgress.injuredHeroes.a={severity:'injured',remainingExpeditions:1,name:'A'};const before=JSON.stringify(g);assert(!casualty.recover(g,'a',cfg).ok);assert.strictEqual(JSON.stringify(g),before);
console.log('PASS war-casualties: standard injury, critical recovery, hardcore death, lineup removal, natural recovery and atomic failure');
