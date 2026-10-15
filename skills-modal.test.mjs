import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html=fs.readFileSync('public/index.html','utf8');
const enhancements=fs.readFileSync('public/enhancements.js','utf8');
const engine=fs.readFileSync('public/engine.js','utf8');
const profile=JSON.parse(fs.readFileSync('profile.json','utf8'));
const activeNames=new Set(profile.skills.flatMap(b=>b.skills.map(s=>s.name)));
const details=Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync('skill-details.json','utf8'))).filter(([name])=>activeNames.has(name)));
function setup(mode='2d'){
  const dom=new JSDOM(html,{runScripts:'outside-only',url:'http://localhost:4173/'});
  const {window}=dom;
  // jsdom has no top layer: emulate only its native open/close lifecycle.
  // Browser focus trapping, Escape and backdrop rendering remain browser QA.
  window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  window.HTMLDialogElement.prototype.close=function(){if(!this.open)return;this.removeAttribute('open');this.dispatchEvent(new window.Event('close'));};
  window.document.documentElement.dataset.mode=mode;
  window.eval(enhancements);
  return {dom,window,document:window.document,dialog:window.document.getElementById('skill-dialog')};
}

test('all active CS skills open their own explanation and company experiences',()=>{
  const {dom,document,dialog}=setup();
  const buttons=[...document.querySelectorAll('.skill-item')];
  assert.equal(buttons.length,activeNames.size);
  for(const button of buttons){
    const name=button.textContent.trim();button.click();
    assert(dialog.open,name);
    assert.equal(dialog.querySelector('h2').textContent,name);
    assert.equal(dialog.querySelector('[data-skill-definition]').textContent,details[name].definition);
    const cards=[...dialog.querySelectorAll('.skill-modal__experience')];
    assert.equal(cards.length,details[name].experiences.length);
    cards.forEach((card,i)=>{
      assert.equal(card.querySelector('.skill-modal__company').textContent,details[name].experiences[i].company);
      assert.equal(card.querySelector('p').textContent,details[name].experiences[i].description);
    });
    dialog.querySelector('[data-skill-close]').click();assert(!dialog.open);
  }
  dom.window.close();
});

test('closing restores the exact overflow style and 2D trigger focus',()=>{
  const {dom,document,dialog}=setup();
  const button=document.querySelector('.skill-item');
  document.body.style.overflow='auto';button.focus();
  let opened=0,closed=0;
  document.addEventListener('resume:skill-open',()=>opened++);
  document.addEventListener('resume:skill-close',()=>closed++);
  button.click();assert.equal(document.body.style.overflow,'hidden');
  assert.equal(document.activeElement.id,'skill-dialog-title');
  // Repeated activation must not replace the original restoration state.
  button.click();assert.equal(opened,1);
  dialog.close();assert.equal(document.body.style.overflow,'auto');
  assert.equal(document.activeElement,button);assert.equal(closed,1);
  dom.window.close();
});

test('3D activation uses the actual engine action to open the same DOM modal',()=>{
  const {dom,window,document,dialog}=setup('3d');
  const start=engine.indexOf('dC=class');const end=engine.indexOf(',fC=',start);
  assert(start>=0&&end>start);
  window.eval(`const ${engine.slice(start,end)}; window.SkillScreenModel=dC;`);
  const actionStart=engine.indexOf('g.onAction=');const actionEnd=engine.indexOf(',g.onSelect=',actionStart);
  window.CSS={escape:value=>value};
  window.eval(`window.skillAction=${engine.slice(actionStart+'g.onAction='.length,actionEnd)};`);
  // Supply only the sound callback referenced by the original action path.
  window.k={select:()=>{}};
  const screen=Object.create(window.SkillScreenModel.prototype);
  screen.onAction=window.skillAction;
  const first=document.querySelector('.skill-item');
  assert(engine.includes('t.addItem({id:u,rect:d,kind:`action`,label:'));
  screen.activate({id:first.dataset.tv,kind:'action'});
  assert(dialog.open);assert.equal(dialog.querySelector('h2').textContent,first.textContent.trim());
  dialog.close();assert.equal(document.activeElement.id,'stage-canvas');
  // Navigation/selecting an item remains separate from opening its details.
  screen.onSelect=()=>{};screen.activate({id:first.dataset.tv,kind:'select'});assert(!dialog.open);
  dom.window.close();
});

test('active skills reference maintained companies or the personal portfolio',()=>{
  const companies=new Set(profile.experience.filter(item=>!item.invitation).map(item=>item.org));
  for(const [name,detail] of Object.entries(details))for(const experience of detail.experiences){
    if(experience.kind==='personal-project'){
      assert.equal(name,'Desenvolvimento');assert.equal(experience.company,'Este portfólio');
    }else assert(companies.has(experience.company));
  }
});
