(function(){'use strict';
function activate(id){document.getElementById(id)?.click();}
function bind(){document.querySelectorAll('#idle-bottom-nav [data-target]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.target)));const title=document.querySelector('#modal-save .modal-title');if(title)title.textContent='💾 SELECT A SAVE SLOT';window.setTimeout(()=>{const open=document.getElementById('btn-open-save-top')||document.getElementById('btn-open-save');open?.click();},80);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
