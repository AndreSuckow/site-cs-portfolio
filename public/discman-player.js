const audio=new Audio();audio.preload='none';
export const discmanState={index:0,title:'CPM 22 - Dias Atrás',playing:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
let tracks=[],loaded=false,pending=false,sequence=0,messageText='';
const panel=document.querySelector('[data-discman-player]');
function update(message){
 if(message!==undefined)messageText=message;
 discmanState.playing=!audio.paused&&!audio.ended;
 panel.querySelector('[data-discman-title]').textContent=discmanState.title;
 const button=panel.querySelector('[data-discman-toggle]');button.textContent=discmanState.playing?'❚❚ Pausar':'▶ Reproduzir';button.setAttribute('aria-pressed',String(discmanState.playing));button.disabled=pending;
 panel.querySelector('[data-discman-status]').textContent=messageText;
 for(const item of panel.querySelectorAll('[data-discman-track]'))item.setAttribute('aria-current',String(+item.dataset.discmanTrack===discmanState.index));
}
async function load(){
 if(loaded)return;
 try{const url=new URL('./audio/discman/playlist.json',import.meta.url);url.search=new URL(import.meta.url).search;const response=await fetch(url);if(!response.ok)throw Error();tracks=await response.json();if(tracks.length!==5)throw Error();loaded=true;
 const list=panel.querySelector('[data-discman-tracks]');list.replaceChildren();tracks.forEach((track,i)=>{const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.dataset.discmanTrack=i;button.textContent=String(i+1).padStart(2,'0')+' · '+track.title;button.addEventListener('click',()=>select(i));li.append(button);list.append(li);});update();
 }catch{update('Não foi possível carregar a lista. Feche e abra o Discman para tentar novamente.');}
}
function select(index){sequence++;audio.pause();audio.removeAttribute('src');audio.load();discmanState.index=(index+5)%5;discmanState.title=tracks[discmanState.index]?.title||'Faixa a escolher';pending=false;update('');}
async function toggle(){
 if(pending)return;if(!audio.paused){audio.pause();return;}
 const current=++sequence;await load();if(current!==sequence||!document.querySelector('#games-notebook[open][data-object="discman"]'))return;
 const track=tracks[discmanState.index];if(!track?.file){update('Esta faixa está reservada. A música será escolhida depois.');return;}
 pending=true;update('Carregando música…');
 try{const url=new URL('./audio/discman/'+encodeURIComponent(track.file),import.meta.url).href;if(audio.src!==url)audio.src=url;await audio.play();if(current!==sequence){audio.pause();return;}pending=false;update('');}
 catch{if(current!==sequence)return;pending=false;audio.pause();update('Áudio ainda não disponível. Adicione o MP3 autorizado à pasta do Discman.');}
}
function control(action){if(action==='toggle')void toggle();else if(action==='pause'){sequence++;pending=false;audio.pause();update('');}else if(action==='previous'||action==='next')select(discmanState.index+(action==='next'?1:-1));}
panel.querySelector('[data-discman-toggle]').addEventListener('click',()=>control('toggle'));
for(const button of panel.querySelectorAll('[data-discman-skip]'))button.addEventListener('click',()=>control(button.dataset.discmanSkip));
document.addEventListener('discman:control',event=>{if(document.querySelector('#games-notebook[open][data-object="discman"]'))control(event.detail);});
document.addEventListener('room:notebook-view',event=>{if(event.detail==='discman'){void load();update();}else{sequence++;pending=false;audio.pause();update();}});
audio.addEventListener('pause',()=>update());audio.addEventListener('play',()=>update());audio.addEventListener('ended',()=>update('Fim da faixa. Escolha outra música ou reproduza novamente.'));
document.addEventListener('portfolio:pause',event=>{if(event.detail)audio.pause();});
update();
