// Optional real-browser gameplay check using an isolated headless Chrome profile.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import os from 'node:os';
const executable=process.env.GAME_TEST_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:4173/';
const output=path.resolve('tmp/portfolio-browser');fs.mkdirSync(output,{recursive:true});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function connect(url){
 const ws=new WebSocket(url),pending=new Map();let next=0;const errors=[];
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 ws.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const request=pending.get(message.id);if(request){clearTimeout(request.timeout);pending.delete(message.id);message.error?request.reject(Error(JSON.stringify(message.error))):request.resolve(message.result);}}else if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails);});
 return {errors,send:(method,params={})=>new Promise((resolve,reject)=>{const id=++next,timeout=setTimeout(()=>{pending.delete(id);reject(Error(`Timeout: ${method}`));},12000);pending.set(id,{resolve,reject,timeout});ws.send(JSON.stringify({id,method,params}));}),close:()=>ws.close()};
}
let browser,page,child;
try{
 assert(fs.existsSync(executable),'Chrome not found; set GAME_TEST_CHROME.');
 const response=await fetch(base);assert.equal(response.status,200,'Start npm run dev before this check.');
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'cv-game-browser-'));
 const localTest=new URL(base).hostname==='127.0.0.1'||new URL(base).hostname==='localhost';
 const testSandboxArgs=process.env.GAME_TEST_NO_SANDBOX==='1'&&localTest?['--no-sandbox']:[];
 child=spawn(executable,['--headless=new',...testSandboxArgs,'--disable-extensions','--disable-background-networking','--no-first-run','--no-default-browser-check','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
 const endpoint=await new Promise((resolve,reject)=>{let buffer='';const timer=setTimeout(()=>reject(Error('Chrome did not start within 15 seconds.')),15000);child.once('error',reject);child.stderr.on('data',data=>{buffer+=data;const match=buffer.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1]);}});});
 browser=await connect(endpoint);
 const targets=await (await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
 page=await connect(targets.find(target=>target.type==='page').webSocketDebuggerUrl);
 await page.send('Page.enable');await page.send('Runtime.enable');
 const evaluate=async expression=>{const result=await page.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
 const until=async(expression,label)=>{for(let i=0;i<150;i++){if(await evaluate(expression))return;await wait(60);}throw Error(`Timed out: ${label}`);};
 const key=async(value,type='keyDown')=>{const codes={ArrowRight:'ArrowRight',Enter:'Enter',e:'KeyE'};await page.send('Input.dispatchKeyEvent',{type,key:value,code:codes[value]||value,windowsVirtualKeyCode:value==='Enter'?13:value==='ArrowRight'?39:69});};

 await page.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await page.send('Page.navigate',{url:base});
 await until('document.querySelector("#stage-canvas") && document.querySelectorAll(".skill-item").length===15','restored portfolio');
 await until('document.readyState==="complete" && document.documentElement.dataset.mode==="3d" && document.querySelector("[data-loader]").hidden','3D engine initialized');
 assert.equal(await evaluate('!!document.querySelector("#retro-intro")'),false,'Home must not include the RPG intro');
 await wait(2500);
 fs.writeFileSync(path.join(output,'desktop.png'),Buffer.from((await page.send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate('document.querySelector(".skill-item").click()');
 await until('document.querySelector("#skill-dialog").open','skill explanation');
 assert(await evaluate('document.querySelector("#skill-dialog-title").textContent.length>0'));
 await evaluate('document.querySelector("[data-skill-close]").click()');
 assert.equal(await evaluate('document.querySelector("#skill-dialog").open'),false);
 await evaluate(`document.querySelector('.site-nav a[href="#sobre"]').click()`);
 await until('!document.querySelector("[data-hud-chapter]").hidden && document.querySelector("[data-hud-label]").textContent==="SOBRE"','About active on the TV');
 await wait(1800);
 fs.writeFileSync(path.join(output,'cs-about-3d.png'),Buffer.from((await page.send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 // The CRT camera eases into position; locate a real bar instead of assuming one pixel.
 let attributeHit=false;
 for(const y of [535,575,615,655,695]){
  for(const x of [900,1000,1100]){
   await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});await wait(90);
   attributeHit=await evaluate('!document.querySelector("[data-hud-tooltip]").hidden && document.querySelector("[data-hud-tooltip]").textContent.length>40');
   if(attributeHit)break;
  }if(attributeHit)break;
 }
 await until('!document.querySelector("[data-hud-tooltip]").hidden && document.querySelector("[data-hud-tooltip]").textContent.length>40','attribute tooltip through the real 3D raycast');
 fs.writeFileSync(path.join(output,'cs-tooltip-3d.png'),Buffer.from((await page.send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate(`document.querySelector('.site-nav a[href="#hobbies"]').click()`);
 await until('document.querySelector("[data-hud-label]").textContent==="HOBBIES"','Hobbies active on the TV');
 await wait(1600);
 fs.writeFileSync(path.join(output,'cs-hobbies-3d.png'),Buffer.from((await page.send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate(`document.querySelector('.site-nav a[href="#projetos"]').click()`);
 await until('document.querySelector("[data-hud-label]").textContent==="PROJETOS"','Projects active on the TV');
 await evaluate(`document.querySelector('[data-cart="onboarding"]').click()`);
 await wait(2400);
 fs.writeFileSync(path.join(output,'cs-project-3d.png'),Buffer.from((await page.send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await page.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await evaluate('document.querySelector("[data-toggle=mode]")?.click()');
 await wait(250);
 await evaluate('window.scrollTo(0,0)');
 fs.writeFileSync(path.join(output,'mobile.png'),Buffer.from((await page.send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),true,'Restored portfolio fits mobile width');
 await evaluate('document.querySelector("#sobre").scrollIntoView();document.querySelector(".attribute__trigger").focus();document.querySelector(".attribute__trigger").click()');
 await wait(180);
 assert.equal(await evaluate('getComputedStyle(document.querySelector(".attribute__tooltip")).display'), 'block');
 fs.writeFileSync(path.join(output,'cs-tooltip-mobile.png'),Buffer.from((await page.send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate('document.querySelector("#hobbies").scrollIntoView()');
 await wait(180);
 fs.writeFileSync(path.join(output,'cs-hobbies-mobile.png'),Buffer.from((await page.send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 assert.equal(await evaluate('document.querySelector("#game-over-dialog").open'),false,'Game Over must not open at Hobbies');
 await evaluate('document.querySelector("#fim").scrollIntoView()');
 await until('document.querySelector("#continue-count").textContent!=="9"','final Continue begins');
 await until('document.querySelector("#game-over-dialog").open','Game Over at zero');
 assert.equal(await evaluate('document.querySelector("#continue-count").textContent'),'0');
 assert.equal(await evaluate('document.activeElement.id'),'game-over-title');
 assert(await evaluate('document.querySelector("#game-over-dialog [data-whatsapp]").href.includes("?text=")'));
 fs.writeFileSync(path.join(output,'cs-game-over.png'),Buffer.from((await page.send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate('document.querySelector("[data-game-over-close]").click()');
 assert.equal(await evaluate('document.querySelector("#game-over-dialog").open'),false);
 await evaluate('document.querySelector("[data-reload]").click()');
 await until('document.querySelector("#continue-count")?.textContent==="9" && scrollY<10','restart restores the beginning');
 assert.equal(page.errors.length,0,JSON.stringify(page.errors));
 fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify({restored:true,checks:['CS home','no RPG introduction','15 skills','skill dialog open and close','about and hobbies in 3D','mobile tooltip','hobbies do not trigger Game Over','final countdown reaches zero','Game Over focus and WhatsApp','reload restarts at the beginning','mobile width'],exceptions:page.errors},null,2));
 console.log('PASS: CS portfolio, skill dialogs, mobile width and zero runtime exceptions.');
}finally{page?.close();if(browser){await browser.send('Browser.close').catch(()=>{});browser.close();}else child?.kill();}
