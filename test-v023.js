const assert=require('assert');const E=require('./war-combat.js');
const heroes=Array.from({length:4},(_,i)=>({id:'h'+i,name:'H'+i,level:1,classId:'c',classDef:{baseHp:500,baseAtk:50}}));
let s=E.create({config:{WAR_COMBAT:{}},node:{type:'battle'},difficulty:6,faction:'bugs',heroes});
assert.equal(s.heroes.length,4);assert.ok(s.enemies.length>=2);for(let i=0;i<2000&&s.status==='active';i++)E.tick(s,.1,{});assert.ok(['victory','defeat'].includes(s.status));
let legacy={status:'active',elapsed:0,speed:1,heroes:[{alive:true,hp:100,maxHp:100,attack:100,energy:0,attackTimer:0,form:{}}],enemy:{alive:true,hp:10,maxHp:10,attack:0,attackTimer:9},log:[]};E.tick(legacy,.1,{});assert.equal(legacy.status,'victory');console.log('PASS: 4 heroes, multi-enemy battle, legacy combat migration');
