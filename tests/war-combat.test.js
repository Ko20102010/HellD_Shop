const assert=require('assert');const E=require('../js/war-combat.js');
const heroes=Array.from({length:4},(_,i)=>({id:`h${i}`,name:`Hero ${i}`,level:10,classId:'x',classDef:{baseHp:500,baseAtk:55}}));
assert.throws(()=>E.create({config:{WAR_COMBAT:{}},heroes:heroes.slice(0,3)}),/Exactly four/);
let s=E.create({config:{WAR_COMBAT:{}},node:{type:'battle'},difficulty:8,faction:'bugs',heroes});assert.equal(s.heroes.length,4);assert.ok(s.enemies.length>=2);const second=s.enemies[1].hp;s.enemies[0].hp=0;s.enemies[0].alive=false;E.tick(s,.1,{});assert.equal(s.status,'active');assert.ok(s.enemies[1].hp<=second);for(let i=0;i<3000&&s.status==='active';i++)E.tick(s,.1,{});assert.ok(['victory','defeat'].includes(s.status));console.log('PASS war-combat');
