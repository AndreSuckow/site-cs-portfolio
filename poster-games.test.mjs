import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
const games=JSON.parse(fs.readFileSync('poster-games.json','utf8'));
function setup(){
 const html=fs.readFileSync('src/room-discoveries.html','utf8').replace('type="application/json">[]','type="application/json">'+JSON.stringify(games));
 const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://portfolio.test/'}),w=dom.window,d=w.document;
 w.matchMedia=()=>({matches:true});w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 w.eval(fs.readFileSync('public/room-discoveries.js','utf8').replace(/^import .*;\r?\n/gm,''));
 w.eval(fs.readFileSync('public/poster-games.js','utf8'));
 return {dom,w,d,dialog:d.querySelector('dialog'),player:d.querySelector('[data-poster-game]'),frame:d.querySelector('iframe')};
}
test('all four supplied games open from the shared poster inspector without loading a provider early',async()=>{
 const {dom,w,d,dialog,player,frame}=setup();
 try{
  assert.equal(games.length,4);assert.equal(frame.getAttribute('src'),null);
  assert.match(frame.getAttribute('allow'),/fullscreen 'none'/);assert(!frame.hasAttribute('allowfullscreen'));
  for(const game of games){
   const trigger=d.querySelector(`[data-room-inspect="${game.id}"]`);trigger.focus();trigger.click();await new Promise(r=>setTimeout(r,10));
   assert(dialog.open);assert.equal(dialog.dataset.object,game.id);assert(!d.querySelector('[data-poster-actions]').hidden);
   assert.equal(d.querySelector('[data-poster-game-title]').textContent,game.gameTitle);
   let synchronous=false;player.requestFullscreen=()=>{synchronous=true;return Promise.reject(Error('denied'));};
   d.querySelector('[data-poster-play]').click();assert(synchronous);assert.equal(frame.src,game.embedUrl);assert(!player.hidden);
   await new Promise(r=>setTimeout(r,0));assert.match(d.querySelector('[data-game-status]').textContent,/navegador/);
   d.querySelector('[data-game-exit]').click();assert(!dialog.open);assert(player.hidden);assert.equal(frame.getAttribute('src'),null);
   assert.equal(d.activeElement,trigger);assert.equal(d.body.style.overflow,'');
  }
 }finally{dom.window.close();}
});
test('late fullscreen completion after leaving is undone and Escape unloads the game',async()=>{
 const {dom,w,d,dialog,player,frame}=setup();
 try{
  let resolve,exits=0;player.requestFullscreen=()=>new Promise(r=>{resolve=r;});
  d.exitFullscreen=async()=>{exits++;Object.defineProperty(d,'fullscreenElement',{configurable:true,value:null});};
  d.querySelector('[data-room-inspect="poster-megaman"]').click();await new Promise(r=>setTimeout(r,10));
  d.querySelector('[data-poster-play]').click();
  dialog.dispatchEvent(new w.Event('cancel',{cancelable:true}));assert(!dialog.open);assert.equal(frame.getAttribute('src'),null);
  Object.defineProperty(d,'fullscreenElement',{configurable:true,value:player});resolve();await new Promise(r=>setTimeout(r,0));
  assert.equal(exits,1);assert(player.hidden);
 }finally{dom.window.close();}
});
