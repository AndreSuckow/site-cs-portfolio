const dialog=document.getElementById('games-notebook');
const drawerFocus=document.querySelector('[data-drawer-focus]');
let previousFocus=null,previousOverflow='',opening=false,activeObject='notebook';
const objects={notebook:{title:'Meu caderno de jogos',hint:'Segure e arraste o caderno para girar. Use a roda do mouse ou dois dedos para aproximar.',label:'Caderno de jogos'},bible:{title:'Bíblia Sagrada',hint:'Segure e arraste para girar a Bíblia. Para ler, use o link abaixo.',label:'Bíblia Sagrada'},pokedex:{title:'Pokédex',hint:'Segure e arraste a Pokédex para examinar os detalhes.',label:'Pokédex'},family:{title:'Quadro da família',hint:'Segure e arraste o quadro para girar. Ilustração de família.',label:'Quadro da família'}};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function openNotebook(kind='notebook'){
 if(!objects[kind])return;
 if(opening||dialog.open||document.querySelector('dialog[open]'))return;
 activeObject=kind;opening=true;
 const item=objects[kind];dialog.querySelector('#notebook-title').textContent=item.title;dialog.querySelector('#notebook-description').textContent=item.hint;dialog.querySelector('[data-notebook-canvas]').setAttribute('aria-label',item.label+' em 3D. Arraste ou use as setas para girar. Mais e menos ajustam o zoom; Home reposiciona.');dialog.querySelector('.notebook-inspector__text').hidden=kind!=='notebook';dialog.querySelector('[data-room-bible]').hidden=kind!=='bible';dialog.querySelector('.notebook-inspector__error').hidden=true;dialog.dataset.object=kind;
 dialog.querySelector('.eyebrow').textContent={notebook:'Super Nintendo · Minhas aventuras',bible:'Leitura e fé',pokedex:'Coleção de jogos',family:'Memórias de família'}[kind];
 dialog.querySelector('.notebook-inspector__tools').setAttribute('aria-label','Manusear '+item.label);
 const actions={left:'Girar para a esquerda',right:'Girar para a direita',in:'Aproximar',out:'Afastar',reset:'Reposicionar'};
 dialog.querySelectorAll('[data-notebook-view]').forEach(button=>button.setAttribute('aria-label',actions[button.dataset.notebookView]+': '+item.label));
 previousFocus=document.activeElement;previousOverflow=document.body.style.overflow;
 document.dispatchEvent(new CustomEvent('resume:skill-open'));
 document.body.style.overflow='hidden';
 if(kind==='notebook'){
  drawerFocus.hidden=false;drawerFocus.dataset.phase='opening';
  document.dispatchEvent(new CustomEvent('room:drawer',{detail:true}));
 }else setTimeout(showInspector,reduced()?0:150);
}
function showInspector(){
  if(!opening)return;
  const kind=activeObject;
  opening=false;dialog.showModal();
  drawerFocus.hidden=true;delete drawerFocus.dataset.phase;
  document.dispatchEvent(new CustomEvent('room:notebook-view',{detail:kind}));
  const canvas=dialog.querySelector('[data-notebook-canvas]');
  if(canvas.dataset.ready!=='true'){dialog.dataset.viewer='unavailable';if(kind==='notebook')dialog.querySelector('.notebook-inspector__text').open=true;dialog.querySelector('.notebook-inspector__error').hidden=false;}
  dialog.querySelector('[data-notebook-close]').focus({preventScroll:true});
}
document.addEventListener('room:drawer-focus',event=>{drawerFocus.style.setProperty('--drawer-x',event.detail.x+'px');drawerFocus.style.setProperty('--drawer-y',event.detail.y+'px');});
document.addEventListener('room:drawer-opened',()=>{if(opening&&activeObject==='notebook')drawerFocus.dataset.phase='fading';});
document.addEventListener('room:drawer-ready',()=>{if(opening&&activeObject==='notebook')showInspector();});
function cancelOpening(){
 if(!opening||activeObject!=='notebook')return;
 opening=false;drawerFocus.hidden=true;delete drawerFocus.dataset.phase;
 document.dispatchEvent(new CustomEvent('room:drawer',{detail:false}));
 document.body.style.overflow=previousOverflow;
 document.dispatchEvent(new CustomEvent('resume:skill-close'));
 previousFocus?.focus({preventScroll:true});
}
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&opening){event.preventDefault();cancelOpening();}},{capture:true});
document.addEventListener('room:discover',event=>{
 openNotebook(event.detail);
});
document.querySelector('[data-room-notebook]').addEventListener('click',()=>openNotebook());
document.querySelectorAll('[data-room-inspect]').forEach(button=>button.addEventListener('click',()=>openNotebook(button.dataset.roomInspect)));
dialog.querySelector('[data-notebook-close]').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{
 document.dispatchEvent(new CustomEvent('room:notebook-view',{detail:false}));
 document.body.style.overflow=previousOverflow;
 if(activeObject==='notebook')document.dispatchEvent(new CustomEvent('room:drawer',{detail:false}));
 if(!document.querySelector('dialog[open]'))document.dispatchEvent(new CustomEvent('resume:skill-close'));
 (previousFocus?.isConnected?previousFocus:document.getElementById('stage-canvas'))?.focus({preventScroll:true});
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
new MutationObserver(()=>{if(document.documentElement.dataset.mode!=='3d')cancelOpening();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-mode']});
