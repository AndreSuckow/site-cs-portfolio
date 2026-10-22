import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
const html=fs.readFileSync('public/index.html','utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,5));
async function until(check){for(let i=0;i<100;i++){if(check())return;await tick();}assert.fail('Loading screen did not finish');}
function setup({webgl=true}={}){
 const dom=new JSDOM(html,{url:'http://localhost:4173/',runScripts:'outside-only'}),w=dom.window,d=w.document;
 d.querySelectorAll('noscript').forEach(node=>node.remove());
 w.matchMedia=()=>({matches:true});w.requestIdleCallback=callback=>callback();w.console.error=()=>{};
 Object.defineProperty(d,'readyState',{value:'complete'});
 w.HTMLCanvasElement.prototype.getContext=()=>webgl?{getExtension:()=>({loseContext(){}})}:null;
 let slow,resolveEngine,rejectEngine,resolveFonts,progress;const active=[];
 const timeout=w.setTimeout.bind(w);w.setTimeout=(callback,delay,...args)=>{if(delay===10000){slow=callback;return 9999;}return timeout(callback,delay,...args);};
 Object.defineProperty(d,'fonts',{value:{ready:new Promise(resolve=>{resolveFonts=resolve;})}});
 const enginePromise=new Promise((resolve,reject)=>{resolveEngine=()=>resolve({setActive:value=>active.push(value)});rejectEngine=reject;});
 // The unsupported-WebGL branch never consumes the deferred engine.
 enginePromise.catch(()=>{});
 w.__engineStart=options=>{progress=options.onProgress;return enginePromise;};
 w.eval(d.querySelector('[data-loading-guard]').textContent);
 const source=fs.readFileSync('src/boot.js','utf8').replace(/import\(`\.\/engine\.js\?v=cs-mode-3`\)/,'Promise.resolve({start:window.__engineStart})').replaceAll('import.meta','({url:location.href})').replace(/export\{[^}]+\};?\s*$/,'');
 w.eval(source);
 return {dom,w,d,active,finish:resolveEngine,fail:rejectEngine,fonts:resolveFonts,slow:()=>slow(),progress:value=>progress(value)};
}

test('initial screen is present before boot; the site waits for the engine, fonts and first frames',async()=>{
 const s=setup();await tick();const loader=s.d.querySelector('[data-loader]');
 assert(!loader.hidden);assert.equal(s.d.documentElement.dataset.siteLoading,'true');
 assert.equal(s.d.querySelector('main').getAttribute('aria-busy'),'true');
 s.progress(1);assert.equal(s.d.querySelector('[data-loader-pct]').textContent,'99%');
 s.finish();await tick();assert.equal(s.d.documentElement.dataset.siteLoading,'true','Fonts still pending');
 s.slow();s.d.querySelector('[data-loader-fallback]').focus();assert.equal(s.d.activeElement,s.d.querySelector('[data-loader-fallback]'));
 s.fonts();await until(()=>loader.hidden);
 assert(!s.d.documentElement.hasAttribute('data-site-loading'));
 assert.equal(s.d.querySelector('[role=progressbar]').getAttribute('aria-valuenow'),'100');
 assert(!s.d.querySelector('main').hasAttribute('aria-busy'));assert.equal(s.d.activeElement,s.d.querySelector('main'));s.dom.window.close();
});

test('WebGL unavailability and initialization errors reveal the readable 2D version',async()=>{
 for(const webgl of [false,true]){const s=setup({webgl});await tick();if(webgl)s.fail(Error('GPU initialization failed'));s.fonts();await until(()=>s.d.querySelector('[data-loader]').hidden);assert.equal(s.d.documentElement.dataset.mode,'2d');assert(!s.d.documentElement.hasAttribute('data-site-loading'));s.dom.window.close();}
});

test('slow loading offers 2D and a late engine cannot override that choice',async()=>{
 const s=setup();await tick();const button=s.d.querySelector('[data-loader-fallback]');assert(button.hidden);
 s.slow();assert(!button.hidden);button.click();assert.equal(s.d.documentElement.dataset.mode,'2d');assert(s.d.querySelector('[data-loader]').hidden);
 s.finish();s.fonts();await until(()=>!s.d.documentElement.hasAttribute('data-site-loading'));
 assert.equal(s.d.documentElement.dataset.mode,'2d');assert(!s.active.includes(true));s.dom.window.close();
});
