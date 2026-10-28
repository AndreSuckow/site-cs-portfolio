const dialog=document.getElementById('games-notebook');
const games=JSON.parse(document.getElementById('poster-games').textContent);
const play=dialog.querySelector('[data-poster-play]');
const player=dialog.querySelector('[data-poster-game]');
const frame=player.querySelector('iframe');
const status=player.querySelector('[data-game-status]');
const fullscreen=player.querySelector('[data-game-fullscreen]');
const exit=player.querySelector('[data-game-exit]');
let epoch=0,activeGame=null,slowTimer=0,exiting=false;

function syncFullscreen(){
 fullscreen.textContent=document.fullscreenElement===player?'Sair da tela cheia':'Tela cheia';
 fullscreen.setAttribute('aria-pressed',String(document.fullscreenElement===player));
}
function requestFullscreen(){
 const token=epoch;
 if(!player.requestFullscreen){status.textContent='Tela cheia indisponível neste navegador. Você pode jogar nesta janela.';return;}
 try{
  Promise.resolve(player.requestFullscreen({navigationUI:'hide'})).then(()=>{
   if(token!==epoch&&document.fullscreenElement===player)document.exitFullscreen?.().catch(()=>{});
   syncFullscreen();
  }).catch(()=>{if(token===epoch&&activeGame)status.textContent='O navegador não liberou tela cheia. Você pode jogar nesta janela.';});
 }catch{status.textContent='O navegador não liberou tela cheia. Você pode jogar nesta janela.';}
}
function stopGame(){
 epoch++;clearTimeout(slowTimer);activeGame=null;delete dialog.dataset.playing;
 // Navigate away immediately to stop the external emulator, sound and network activity.
 frame.removeAttribute('src');frame.title='Jogo';player.hidden=true;
 if(document.fullscreenElement===player)document.exitFullscreen?.().catch(()=>{});
 syncFullscreen();
}
function exitGame(){
 if(exiting||!activeGame)return;
 exiting=true;stopGame();dialog.close();exiting=false;
}
play.addEventListener('click',()=>{
 const game=games.find(item=>item.id===dialog.dataset.object);
 if(!game||activeGame||!dialog.open)return;
 activeGame=game;epoch++;exiting=false;
 document.dispatchEvent(new CustomEvent('room:notebook-view',{detail:false}));
 player.querySelector('[data-game-title]').textContent=game.gameTitle;
 const external=player.querySelector('[data-game-external]');external.href=game.url;
 frame.title='Jogar '+game.gameTitle;
 status.textContent='Abrindo jogo… O site pode pedir um clique para iniciar.';
 player.hidden=false;dialog.dataset.playing='true';
 // Called in the original click, before any asynchronous loading loses user activation.
 requestFullscreen();
 frame.src=game.embedUrl;
 exit.focus({preventScroll:true});
 const token=epoch;
 slowTimer=setTimeout(()=>{if(token===epoch&&activeGame)status.textContent='Se o jogo não aparecer, tente novamente ou use “Abrir no site”.';},12000);
});
frame.addEventListener('load',()=>{
 if(!activeGame)return;clearTimeout(slowTimer);
 status.textContent='Use os controles do jogo para iniciar. Se não aparecer, escolha “Abrir no site”.';
});
frame.addEventListener('error',()=>{if(activeGame)status.textContent='Não foi possível abrir aqui. Tente novamente ou use “Abrir no site”.';});
exit.addEventListener('click',exitGame);
fullscreen.addEventListener('click',()=>{if(!activeGame)return;if(document.fullscreenElement===player)document.exitFullscreen?.().catch(()=>{});else requestFullscreen();});
player.querySelector('[data-game-retry]').addEventListener('click',()=>{if(!activeGame)return;status.textContent='Abrindo jogo novamente…';frame.src=activeGame.embedUrl;});
dialog.addEventListener('cancel',event=>{if(activeGame){event.preventDefault();exitGame();}});
dialog.addEventListener('close',stopGame);
document.addEventListener('fullscreenchange',syncFullscreen);
