import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {whatsappMessage} from './public/cs-model.js';
const html=fs.readFileSync('public/index.html','utf8');
test('Tempo livre shares the supplied family description and icons across the portfolio',()=>{
 const dom=new JSDOM(html),d=dom.window.document;
 for(const link of d.querySelectorAll('a[data-nav-tab="hobbies"]'))assert.equal(link.textContent.replace(/^05/,''),'Tempo livre');
 assert.equal(d.querySelector('#hobbies-title').textContent,'Tempo livre');
 const family=d.querySelector('[data-hobby-icon="family"]').closest('article');assert.equal(family.querySelector('h3').textContent,'Família');assert(family.textContent.includes('Meus pais, minha esposa e meus quatro filhos'));
 assert.equal(d.querySelectorAll('[data-hobby-icon]').length,6);dom.window.close();
});

test('WhatsApp greeting uses Sao Paulo time at the morning, afternoon and evening boundaries',()=>{
 for(const [time,part] of [['04:59','boa noite'],['05:00','bom dia'],['11:59','bom dia'],['12:00','boa tarde'],['17:59','boa tarde'],['18:00','boa noite']]){
  const message=whatsappMessage(new Date(`2026-10-14T${time}:00-03:00`));assert(message.includes(part));assert(message.endsWith('Temos uma oportunidade para você!'));
 }
});

test('CS content uses verified contacts and treats Sua companhia as an invitation',()=>{
 const dom=new JSDOM(html),d=dom.window.document;
 assert.equal(d.querySelectorAll('.phase').length,3);assert(d.querySelectorAll('.phase')[2].textContent.includes('Sua companhia'));
 assert(!/Front.end|React|TypeScript|WordPress/.test(d.querySelector('#inicio').textContent));
 assert(d.querySelector('#skills').textContent.includes('Desenvolvimento Front-end'));
 assert(d.querySelector('#sobre').textContent.includes('Campo Largo – PR'));
 assert(d.querySelector('#sobre a[href="https://www.linkedin.com/in/andresuckow/"]'));
 assert(d.querySelector('#sobre a[href="mailto:andre.suckow.dev@gmail.com"]'));
 assert.equal(d.querySelectorAll('#inicio .hero__actions .btn').length,3);
 assert(d.querySelector('#inicio a[href="https://www.linkedin.com/in/andresuckow/"]'));
 assert.equal(d.querySelectorAll('[data-pad="a"], [data-pad="b"]').length,2);
 assert.equal(d.querySelectorAll('.attribute__trigger').length,5);
 for(const button of d.querySelectorAll('.attribute__trigger'))assert(d.getElementById(button.getAttribute('aria-describedby')).textContent.length>40);
 assert(d.querySelector('#hobbies a[href="https://www.instagram.com/tf.church/"]'));
 const company=d.querySelector('[data-tv="projetos/demo/onboarding"]');assert.equal(company.href,'https://marqhr.com/');assert(company.closest('.resume-project').querySelector('.resume-tags'));
 dom.window.close();
});

function setup(){
 const dom=new JSDOM(html,{url:'http://localhost:4173/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 let visible=false;const intervals=new Map();let id=0;
 w.document.getElementById('fim').getBoundingClientRect=()=>visible?{top:50,bottom:700}:{top:2000,bottom:2700};
 w.setInterval=fn=>{intervals.set(++id,fn);return id;};w.clearInterval=id=>intervals.delete(id);w.whatsappMessage=whatsappMessage;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 w.eval(fs.readFileSync('public/cs-interactions.js','utf8').replace(/^import .*;\r?\n/gm,''));
 return {dom,w,intervals,setVisible:value=>{visible=value;w.document.dispatchEvent(new w.Event('scroll'));},tick:()=>{[...intervals.values()].forEach(fn=>fn());}};
}
test('Continue starts only at the final screen, cancels when leaving, and opens Game Over once at zero',()=>{
 const s=setup(),d=s.w.document,dialog=d.querySelector('#game-over-dialog');assert.equal(s.intervals.size,0);
 s.setVisible(true);for(let i=0;i<4;i++)s.tick();assert.equal(d.querySelector('#continue-count').textContent,'5');assert(!dialog.open);
 s.setVisible(false);assert.equal(s.intervals.size,0);for(let i=0;i<10;i++)s.tick();assert(!dialog.open);
 s.setVisible(true);for(let i=0;i<9;i++)s.tick();assert.equal(d.querySelector('#continue-count').textContent,'0');assert(dialog.open);assert.equal(d.activeElement.id,'game-over-title');
 d.querySelector('[data-game-over-close]').click();assert(!dialog.open);s.setVisible(false);s.setVisible(true);assert.equal(s.intervals.size,0);s.dom.window.close();
});
test('Attribute descriptions are available by tap and dismiss with Escape',()=>{
 const s=setup(),d=s.w.document,button=d.querySelector('.attribute__trigger');button.click();assert(button.closest('.attribute').classList.contains('is-open'));
 d.dispatchEvent(new s.w.KeyboardEvent('keydown',{key:'Escape'}));assert(!button.closest('.attribute').classList.contains('is-open'));s.dom.window.close();
});
