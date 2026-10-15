// Generate the maintained CS portfolio from its own template and engine sources.
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const runtimeVersion=createHash('sha256').update(['src/engine.js','src/boot.js','profile.json','public/cs-interactions.js','public/contact-form.js','public/mobile-reading.js','public/custom.css','public/hobby-icons.js','public/audio-controller.js','public/new-room.js'].map(file=>fs.readFileSync(file,'utf8')).join('\n')).digest('hex').slice(0,12);
const versionRuntime=source=>source.replaceAll('?v=cs-mode-3',`?v=${runtimeVersion}`).replace('src="/cs-interactions.js"',`src="/cs-interactions.js?v=${runtimeVersion}"`).replace('src="/contact-form.js"',`src="/contact-form.js?v=${runtimeVersion}"`).replace('src="/mobile-reading.js"',`src="/mobile-reading.js?v=${runtimeVersion}"`);
const p=JSON.parse(fs.readFileSync('profile.json','utf8'));
const skillDetails=JSON.parse(fs.readFileSync('skill-details.json','utf8'));
const csPortfolio=require('./cs-portfolio.cjs');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for(const branch of p.skills)for(const skill of branch.skills)if(!skillDetails[skill.name]?.definition||!skillDetails[skill.name]?.experiences?.length)throw Error(`Missing skill explanation: ${skill.name}`);
let html=fs.readFileSync('src/portfolio.html','utf8');
function replaceSection(id,content){
 const start=html.indexOf(`<section id="${id}"`);if(start<0)throw Error(`Section not found: ${id}`);
 const tags=/<section\b[^>]*>|<\/section>/g;tags.lastIndex=start;let depth=0,end=-1;
 for(let match;(match=tags.exec(html));){depth+=match[0].startsWith('</')?-1:1;if(depth===0){end=tags.lastIndex;break;}}
 if(end<0)throw Error(`Unbalanced section: ${id}`);html=html.slice(0,start)+content+html.slice(end);
}
const sections=csPortfolio.sections(p);
for(const [id,key] of [['sobre','about'],['experiencia','experience'],['projetos','projects'],['skills','skills'],['hobbies','hobbies'],['contato','contact']])replaceSection(id,sections[key]);
html=html.replace(/(<meta name="description" content=")[^"]+/,`$1${esc(p.headline)}`).replace(/(<meta name="author" content=")[^"]+/,`$1${esc(p.name)}`);
html=html.replace(/(<span class="hero__name">)[\s\S]*?(<\/span>)/,`$1${esc(p.name)}$2`).replace(/(<span class="hero__role">)[\s\S]*?(<\/span>)/,`$1${esc(p.role)}$2`).replace(/(<span class="brand__name">)[\s\S]*?(<\/span>)/,`$1${esc(p.shortName)}$2`);
html=html.replace(/(<p class="hero__lead">)[\s\S]*?(<\/p>)/,`$1${esc(p.headline)}$2`).replace(/(<p class="hero__intro">)[\s\S]*?(<\/p>)/,`$1${esc(p.intro)}$2`);
html=html.replace(/(<script id="skill-details"[^>]*>)[\s\S]*?(<\/script>)/,(_,start,end)=>start+JSON.stringify(skillDetails).replaceAll('<',String.fromCharCode(92)+'u003c')+end);
html=csPortfolio.decorate(html,p);
fs.writeFileSync('public/index.html',versionRuntime(html));
fs.writeFileSync('public/boot.js',versionRuntime(fs.readFileSync('src/boot.js','utf8')));
let engine=fs.readFileSync('src/engine.js','utf8');
function replaceData(name,next,data){const start=engine.indexOf(`${name}=`),end=engine.indexOf(`,${next}=`,start);if(start<0||end<0)throw Error(`Data boundary missing: ${name}`);engine=engine.slice(0,start)+`${name}=${JSON.stringify(data)}`+engine.slice(end);}
const {experience:xp,skills:sk,achievements:ac,projects:pr,...person}=p;
replaceData('Eh','Dh',person);replaceData('Dh','Oh',xp);replaceData('Oh','kh',sk);replaceData('kh','Ah',ac);replaceData('Ah','jh',pr);
const assetSizes=Object.fromEntries(['/models/room.glb','/models/props.glb','/models/tv.glb','/models/console.glb','/models/cartridge.glb','/textures/room.webp','/textures/room-tv.webp',p.photo,'/img/room-wide.webp'].map(x=>[x,fs.statSync('public'+x).size]));
engine=engine.replace(/t_=\{[^}]*\}/,'t_='+JSON.stringify(assetSizes));
fs.writeFileSync('public/engine.js',versionRuntime(engine));
const page = (title,body)=>`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · André Suckow</title><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/custom.css"></head><body class="document-page"><main class="container"><nav class="document-actions"><a class="btn" href="/">← Voltar ao jogo</a><button class="btn" onclick="window.print()">Imprimir / salvar PDF</button><a class="btn btn--primary" download href="${p.cvPdf}">Baixar PDF</a></nav>${body}<footer><p>André Suckow · ${p.email}</p></footer></main></body></html>`;
const cv = `<header><p class="eyebrow">Ficha completa · AS-16</p><h1>${p.name}</h1><p class="document-subtitle">${p.roleLong}</p><p>${p.location} · <a href="mailto:${p.email}">${p.email}</a> · <a href="tel:+5541995830758">${p.phone}</a></p></header><section><h2>Resumo profissional</h2>${p.bio.map(x=>`<p>${x}</p>`).join('')}</section><section><h2>Experiência profissional</h2>${xp.filter(x=>!x.invitation).sort((a,b)=>b.start-a.start).map(x=>`<article><h3>${x.role} · ${x.org}</h3><p class="muted">${x.period}</p><ul>${x.bullets.map(y=>`<li>${y}</li>`).join('')}</ul></article>`).join('')}</section><section><h2>Habilidades e tecnologias</h2><p>${sk.flatMap(x=>x.skills.map(y=>y.name)).join(' · ')}</p></section><section><h2>Formação acadêmica</h2><h3>Análise e Desenvolvimento de Sistemas</h3><p>Estácio de Sá · Junho de 2019 – Dezembro de 2021</p><h2>Idiomas</h2><p>Inglês intermediário (B1)</p></section>`;
fs.mkdirSync('public/curriculo',{recursive:true});fs.writeFileSync('public/curriculo/index.html',page('Currículo',cv));
for(const x of pr){fs.mkdirSync(`public/cases/${x.slug}`,{recursive:true});fs.writeFileSync(`public/cases/${x.slug}/index.html`,page(x.title,`<header><p class="eyebrow">Ficha da missão · ${x.cartTitle}</p><h1>${x.title}</h1><p class="document-subtitle">${x.subtitle}</p></header><section><h2>A missão</h2><p>${x.summary}</p>${x.screenshot?`<img class="case-site-image" src="${x.screenshot.src}" alt="${esc(x.screenshot.alt)}" width="${x.screenshot.width}" height="${x.screenshot.height}">`:``}${x.caseStory?`<h2>Minha participação na primeira equipe de CS</h2><p>${x.caseStory}</p>`:``}<h2>Habilidades aplicadas</h2><div class="resume-tags">${x.stack.map(y=>`<span>${y}</span>`).join('')}</div>${x.demoUrl?`<a class="btn" href="${x.demoUrl}" target="_blank" rel="noopener">Visitar empresa ↗</a>`:``}<p class="muted">Esta ficha apresenta uma experiência profissional descrita no currículo. Não contém materiais confidenciais de clientes.</p></section><a class="btn btn--primary" href="mailto:${p.email}">Conversar sobre esta experiência</a>`));}
console.log('Currículo, conteúdo 2D e motor 3D personalizados.');


