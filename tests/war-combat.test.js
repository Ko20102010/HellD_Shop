const assert=require('assert');
const combat=require('../js/war-combat.js');
const cfg={WAR_COMBAT:{enrageSeconds:75,formationBonuses:{front:{damageReduction:.15,threat:1.2},middle:{energyGain:.1,threat:1},rear:{attack:.15,threat:.75}},eliteModifiers:[{id:'armoured',name:'Armoured',defence:.28},{id:'berserk',name:'Berserk',speed:.22},{id:'regenerating',name:'Regenerating',regen:.012},{id:'explosive',name:'Explosive',deathDamage:.06},{id:'suppressing',name:'Suppressing',energyPenalty:.3},{id:'commanding',name:'Commanding',attack:.2}],ultimates:{cls_vanguard:{name:'Strike',damage:4.8},cls_bulwark:{name:'Barrier',shield:.32},cls_medic:{name:'Heal',heal:.36}}}};
const roster=[
{id:'a',name:'A',classId:'cls_vanguard',level:20,classDef:{baseHp:450,baseAtk:48}},
{id:'b',name:'B',classId:'cls_bulwark',level:20,classDef:{baseHp:650,baseAtk:38}},
{id:'c',name:'C',classId:'cls_medic',level:20,classDef:{baseHp:480,baseAtk:32}}
];
function run(type='battle',difficulty=3,seed=3){const s=combat.create({config:cfg,node:{type},difficulty,faction:'bugs',seed,nodeIndex:2,heroes:roster,autoUltimate:true});for(let i=0;i<2000&&s.status==='active';i++)combat.tick(s,.1,cfg.WAR_COMBAT);return s;}
for(const type of ['battle','elite','boss']){const s=run(type);assert(['victory','defeat'].includes(s.status));assert(Number.isFinite(s.enemy.hp));assert(s.heroes.every(h=>Number.isFinite(h.hp)&&h.energy>=0&&h.energy<=100));}
const u=combat.create({config:cfg,node:{type:'battle'},difficulty:1,faction:'bugs',seed:1,nodeIndex:0,heroes:roster});u.heroes[0].energy=100;const hp=u.enemy.hp;assert(combat.ultimate(u,0,cfg.WAR_COMBAT));assert(u.enemy.hp<hp);assert.strictEqual(u.heroes[0].energy,0);assert.strictEqual(combat.ultimate(u,0,cfg.WAR_COMBAT),false);
const shield=combat.create({config:cfg,node:{type:'battle'},difficulty:1,faction:'bugs',seed:1,nodeIndex:0,heroes:roster});shield.heroes[1].energy=100;assert(combat.ultimate(shield,1,cfg.WAR_COMBAT));assert(shield.heroes.every(h=>h.shield>0));
const snap=combat.snapshot(shield);snap.heroes[0].hp=0;assert.notStrictEqual(shield.heroes[0].hp,0);
console.log('PASS war-combat: normal/elite/boss completion, finite state, energy bounds, ultimates, shields and save snapshot');
