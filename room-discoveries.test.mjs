import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
const html=fs.readFileSync('src/room-discoveries.html','utf8');
test('drawer opens one notebook, preserves the game lists, and restores focus and scroll',()=>{
 const dom=new JSDOM('<html data-mode="3d" data-room-version="novo-quarto-3d"><body>'+html+'</body></html>',{runScripts:'outside-only',url:'http://localhost:4173/'}),w=dom.window,d=w.document;
 const pending=[];w.setTimeout=fn=>{pending.push(fn);return pending.length;};w.matchMedia=()=>({matches:false});
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){if(this.open){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));}};
 w.eval(fs.readFileSync('public/room-discoveries.js','utf8'));
 const trigger=d.querySelector('[data-room-notebook]'),dialog=d.getElementById('games-notebook');
 assert(!d.querySelector('[data-room-discoveries]'));
 trigger.focus();d.body.style.overflow='auto';const changes=[];let stopped=0,resumed=0;
 d.addEventListener('room:drawer',event=>changes.push(event.detail));d.addEventListener('resume:skill-open',()=>stopped++);d.addEventListener('resume:skill-close',()=>resumed++);
 trigger.click();trigger.click();assert.equal(pending.length,0);assert.equal(stopped,1);assert.equal(d.body.style.overflow,'hidden');assert(!dialog.open);
 assert.equal(d.querySelector('[data-drawer-focus]').dataset.phase,'opening');
 d.dispatchEvent(new w.CustomEvent('room:drawer-opened'));assert(!dialog.open,'Drawer must open before the notebook modal');assert.equal(d.querySelector('[data-drawer-focus]').dataset.phase,'fading');
 d.dispatchEvent(new w.CustomEvent('room:drawer-ready'));assert(dialog.open);assert(d.querySelector('[data-drawer-focus]').hidden);assert.equal(d.activeElement,dialog.querySelector('[data-notebook-close]'));
 assert.equal(dialog.querySelectorAll('.games-notebook__completed s').length,4);
 assert.equal(dialog.querySelectorAll('#games-pending-title + ul li').length,9);
 assert.equal(dialog.querySelector('.games-notebook__pages > section:first-child').getAttribute('aria-labelledby'),'games-pending-title');
 assert.equal(dialog.querySelector('.games-notebook__pages > section:last-child').getAttribute('aria-labelledby'),'games-completed-title');
 assert(dialog.textContent.includes('Mega Man X'));assert(dialog.textContent.includes('Super Mario RPG'));
 dialog.querySelector('[data-notebook-close]').click();assert(!dialog.open);assert.equal(resumed,1);assert.deepEqual(changes,[true,false]);assert.equal(d.body.style.overflow,'auto');assert.equal(d.activeElement,trigger);
 const bible=d.querySelector('[data-room-bible]');assert.equal(bible.href,'https://www.bibliaonline.com.br/ntlh/livros');assert.equal(bible.target,'_blank');assert(bible.rel.includes('noopener'));
 trigger.click();d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));d.dispatchEvent(new w.CustomEvent('room:drawer-ready'));
 assert(!dialog.open,'Escape cancels pending opening and ignores a late completion');assert(d.querySelector('[data-drawer-focus]').hidden);assert.equal(d.body.style.overflow,'auto');
 dom.window.close();
});

test('Bible, Pokedex and family share inspection controls, with the reading link only on the Bible',()=>{
 const dom=new JSDOM('<html data-mode="3d" data-room-version="novo-quarto-3d"><body>'+html+'</body></html>',{runScripts:'outside-only',url:'http://localhost:4173/'}),w=dom.window,d=w.document,queue=[];
 w.matchMedia=()=>({matches:false});w.setTimeout=fn=>queue.push(fn);
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 w.eval(fs.readFileSync('public/room-discoveries.js','utf8'));
 const dialog=d.getElementById('games-notebook'),views=[],drawers=[];
 d.addEventListener('room:notebook-view',event=>views.push(event.detail));d.addEventListener('room:drawer',event=>drawers.push(event.detail));
 for(const [kind,title] of [['bible','Bíblia Sagrada'],['pokedex','Pokédex'],['family','Quadro da família']]){
  d.querySelector(`[data-room-inspect="${kind}"]`).click();queue.shift()();assert(dialog.open);assert.equal(dialog.dataset.object,kind);assert.equal(d.getElementById('notebook-title').textContent,title);
  assert.equal(dialog.querySelector('[data-room-bible]').hidden,kind!=='bible');assert(dialog.querySelector('.notebook-inspector__text').hidden);
  assert(dialog.querySelector('[data-notebook-canvas]').getAttribute('aria-label').includes(title));
  dialog.querySelector('[data-notebook-close]').click();assert(!dialog.open);
 }
 assert.deepEqual(views,['bible',false,'pokedex',false,'family',false]);assert.deepEqual(drawers,[],'Inspecting tabletop objects does not open the desk drawer');
 dom.window.close();
});
