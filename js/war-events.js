(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.WarEventEngine=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
function clone(v){return JSON.parse(JSON.stringify(v));}
function pickEvent(run,config){const list=config.WAR_EVENTS||[];if(!list.length)return null;const idx=((run.seed>>>0)+(run.nodeIndex*17))%list.length;return clone(list[idx]);}
function canAfford(game,cost){return Object.entries(cost||{}).every(([k,v])=>Number(game[k]||0)>=Number(v||0));}
function applyChoice(game,run,choice){if(!choice||!canAfford(game,choice.cost))return{ok:false,message:'Required resources are unavailable.'};
 Object.entries(choice.cost||{}).forEach(([k,v])=>game[k]=Math.max(0,Number(game[k]||0)-Number(v||0)));
 const o=choice.outcome||{};run.loot.cash+=Number(o.cash||0);run.loot.common+=Number(o.common||0);run.loot.rare+=Number(o.rare||0);run.loot.superRare+=Number(o.superRare||0);
 return{ok:true,message:`Choice resolved. +$${Number(o.cash||0)} · Samples ${Number(o.common||0)}/${Number(o.rare||0)}/${Number(o.superRare||0)}`,healPct:Number(o.healPct||0)};
}
function rewardChoices(run,config){const list=config.WAR_REWARDS||[];if(!list.length)return[];const out=[];for(let i=0;i<3;i++)out.push(clone(list[((run.seed>>>0)+run.nodeIndex*7+i*3)%list.length]));return out;}
return{pickEvent,canAfford,applyChoice,rewardChoices};
});
