// The File is cloned directly into this frame; it is never uploaded by this player.
const session=new URL(location.href).searchParams.get('session');
const message=document.getElementById('message');
let accepted=false,poll=0;
function report(state){parent.postMessage({type:'local-rom:status',session,state},location.origin);}
function fail(){clearInterval(poll);message.hidden=false;message.textContent='Não foi possível carregar o emulador ou a ROM. Use Tentar novamente ou Trocar ROM na barra acima.';report('error');}
window.addEventListener('message',event=>{
 if(accepted||event.source!==parent||event.origin!==location.origin||event.data?.type!=='local-rom:load'||event.data.session!==session)return;
 const file=event.data.file;
 if(!(file instanceof File)||! /\.(sfc|smc)$/i.test(file.name)||file.size<32768||file.size>16*1024*1024){fail();return;}
 accepted=true;
 window.EJS_player='#game';window.EJS_core='snes';window.EJS_gameUrl=file;
 window.EJS_gameName=file.name.replace(/\.(sfc|smc)$/i,'');
 window.EJS_pathtodata='https://cdn.emulatorjs.org/4.2.3/data/';
 window.EJS_language='pt-BR';window.EJS_color='#ffad32';window.EJS_backgroundColor='#090d16';
 window.EJS_startOnLoaded=false;window.EJS_startButtonName='Iniciar jogo';window.EJS_fullscreenOnLoaded=false;
 window.EJS_Buttons={fullscreen:false,exitEmulation:false};
 window.EJS_disableLocalStorage=true;window.EJS_CacheLimit=0;window.EJS_threads=false;
 window.EJS_ready=()=>{
  message.hidden=true;
  const start=document.querySelector('.ejs_start_button');
  if(start){start.setAttribute('role','button');start.tabIndex=0;start.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();start.click();}});}
 };
 window.EJS_onGameStart=()=>{clearInterval(poll);message.hidden=true;report('started');};
 const script=document.createElement('script');script.src=window.EJS_pathtodata+'loader.js';script.onerror=fail;document.body.append(script);
 poll=setInterval(()=>{if(window.EJS_emulator?.failedToStart)fail();},1000);
});
window.addEventListener('error',fail);
window.addEventListener('unhandledrejection',fail);
document.addEventListener('click',event=>{if(event.target.closest?.('.ejs_start_button'))report('fullscreen');},true);
window.addEventListener('pagehide',()=>clearInterval(poll));
if(parent!==window)parent.postMessage({type:'local-rom:ready',session},location.origin);
