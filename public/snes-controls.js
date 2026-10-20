// Native dialog shares the existing engine scroll suspension and focus behavior.
const pause=document.getElementById('pause-dialog');
const root=document.documentElement;
let previousFocus=null;
function togglePause(){
 if(document.querySelector('[data-drawer-focus]:not([hidden])'))return;
 if(pause.open){pause.close();return;}
 if(root.dataset.mode!=='3d'||document.querySelector('dialog[open]'))return;
 previousFocus=document.activeElement;
 root.dataset.paused='true';
 pause.showModal();
 document.dispatchEvent(new CustomEvent('resume:skill-open'));
 document.dispatchEvent(new CustomEvent('portfolio:pause',{detail:true}));
 pause.querySelector('[data-unpause]').focus({preventScroll:true});
}
document.addEventListener('portfolio:toggle-pause',togglePause);
pause.querySelector('[data-unpause]').addEventListener('click',()=>pause.close());
pause.addEventListener('close',()=>{
 delete root.dataset.paused;
 document.dispatchEvent(new CustomEvent('portfolio:pause',{detail:false}));
 if(!document.querySelector('dialog[open]'))document.dispatchEvent(new CustomEvent('resume:skill-close'));
 previousFocus?.focus({preventScroll:true});
});
document.addEventListener('keydown',event=>{
 if(event.repeat||event.isComposing||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
 if(event.code==='KeyP'&&(pause.open||!document.querySelector('dialog[open]'))){event.preventDefault();togglePause();}
});
new MutationObserver(()=>{if(root.dataset.mode!=='3d'&&pause.open)pause.close();}).observe(root,{attributes:true,attributeFilter:['data-mode']});
