import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { createCanvas, DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';

// Read the complete original DOCX, including manual line breaks between runs.
const xml = new AdmZip('documents/curriculo-original.docx').readAsText('word/document.xml');
const tree = new XMLParser({preserveOrder:true,ignoreAttributes:false,trimValues:false}).parse(xml);
const textOf = node => Array.isArray(node) ? node.map(textOf).join('') : Object.entries(node).map(([key,value]) => key === 'w:t' ? value.map(item => item['#text'] ?? '').join('') : key === 'w:br' ? '\n' : key === 'w:tab' ? ' ' : key === ':@' ? '' : typeof value === 'object' ? textOf(value) : '').join('');
const paragraphs=[];
function collect(nodes){for(const node of nodes)for(const [key,value] of Object.entries(node)){if(key==='w:p')paragraphs.push(textOf(value));else if(Array.isArray(value))collect(value);}}
collect(tree);
const source=paragraphs.map(s=>s.replace(/[–—]/g,'-').replace(/\s+/g,' ').trim()).filter(Boolean);
const normalized=s=>s.replace(/\s+/g,' ').trim();
const outDir=path.resolve('output/pdf');
const previewDir=path.resolve('tmp/pdfs');
fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(previewDir,{recursive:true});
const output=path.join(outDir,'curriculo-andre-suckow.pdf');
const doc=new PDFDocument({size:'A4',margins:{top:44,bottom:44,left:48,right:48},bufferPages:true,info:{Title:'Currículo - André Luis Suckow',Author:'André Luis Suckow',Subject:'Customer Success, Onboarding e Implantação de Software SaaS',Language:'pt-BR'}});
const stream=fs.createWriteStream(output);doc.pipe(stream);
doc.registerFont('Body','C:/Windows/Fonts/arial.ttf');
doc.registerFont('Bold','C:/Windows/Fonts/arialbd.ttf');
const left=48,width=doc.page.width-96,bottom=doc.page.height-50;
const rendered=[];
function block(text,{size=10,bold=false,gap=4,indent=0,color='#222222'}={}){
  doc.font(bold?'Bold':'Body').fontSize(size).fillColor(color);
  const options={width:width-indent,lineGap:1.4};
  const height=doc.heightOfString(text,options);
  if(doc.y+height>bottom)throw Error(`Planned page overflows: ${text.slice(0,80)}`);
  doc.text(text,left+indent,doc.y,options);rendered.push(text);doc.y+=gap;
}
function heading(index){doc.y+=10;block(source[index],{size:12,bold:true,gap:9});}
function bullets(start,end){
  for(let i=start;i<=end;i++){
    let text=source[i];
    // Original DOCX has four sentences broken across separate paragraphs.
    while(i<end&&!/^[•●]/.test(source[i+1]))text+=' '+source[++i];
    // Original also contains two bullet items inside a single paragraph.
    const parts=text.split(/\s+(?=•)/);
    for(const part of parts){
      const training=part.startsWith('• Condução de treinamentos individuais e coletivos');
      const content=training?part+' Mais de 300 empresas treinadas.':part;
      block(content,{indent:part.startsWith('●')?18:8,gap:3});
    }
  }
}
function job(start,end){
  doc.y+=10;block(source[start],{size:12,bold:true,gap:4});
  block(source[start+1],{bold:true,gap:3});
  let firstBullet=start+2;
  while(firstBullet<=end&&!/^[•●]/.test(source[firstBullet]))block(source[firstBullet++],{size:9.8,color:'#555555',gap:3});
  doc.y+=5;bullets(firstBullet,end);
}
function newPage(){doc.addPage();block('ANDRÉ LUIS SUCKOW',{size:11,bold:true,gap:4,color:'#555555'});doc.y+=8;}

block(source[0],{size:21,bold:true,gap:7});
block(source[1],{size:11,bold:true,gap:6});
block(source[2],{size:10,gap:3,color:'#555555'});
block(source[3],{size:10,gap:8,color:'#555555'});
heading(4);for(let i=5;i<=7;i++)block(source[i],{gap:8});
heading(8);job(9,17);
newPage();block('EXPERIÊNCIAS PROFISSIONAIS (continuação)',{size:12,bold:true,gap:6});
job(18,38);job(39,49);
newPage();block('EXPERIÊNCIAS PROFISSIONAIS (continuação)',{size:12,bold:true,gap:6});
job(50,59);
heading(60);for(let i=61;i<=66;i++)block(source[i],{indent:8,gap:2});
heading(67);for(let i=68;i<=74;i++)block(source[i],{indent:8,gap:2});
heading(75);block(source[76],{bold:true,gap:3});block(source[77],{gap:3});block(source[78],{gap:3});
heading(79);block(source[80]);

const pages=doc.bufferedPageRange();
if(pages.count!==3)throw Error(`Expected 3 pages, got ${pages.count}`);
for(let i=0;i<pages.count;i++){
  doc.switchToPage(i);
  const previousBottom=doc.page.margins.bottom;doc.page.margins.bottom=0;
  doc.font('Body').fontSize(8).fillColor('#666666').text(`${i+1} / ${pages.count}`,left,doc.page.height-34,{width,align:'right',lineBreak:false});
  doc.page.margins.bottom=previousBottom;
}
doc.end();await new Promise((resolve,reject)=>{stream.on('finish',resolve);stream.on('error',reject);});

globalThis.DOMMatrix=DOMMatrix;globalThis.ImageData=ImageData;globalThis.Path2D=Path2D;
const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
const pdf=await getDocument({data:new Uint8Array(fs.readFileSync(output)),useSystemFonts:true}).promise;
if(pdf.numPages!==3)throw Error(`Unexpected rendered page count: ${pdf.numPages}`);
let extracted='';
const geometries=[];
for(let i=1;i<=pdf.numPages;i++){
  const page=await pdf.getPage(i);const viewport=page.getViewport({scale:1.5});
  const canvas=createCanvas(Math.ceil(viewport.width),Math.ceil(viewport.height));
  await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
  fs.writeFileSync(path.join(previewDir,`curriculo-page-${i}.png`),canvas.toBuffer('image/png'));
  const content=await page.getTextContent();extracted+=content.items.map(item=>item.str).join(' ')+' ';
  const invalid=content.items.filter(item=>item.str.trim()&&(item.transform[4]<40||item.transform[5]<20||item.transform[4]+item.width>page.view[2]-35));
  if(invalid.length)throw Error(`Text outside margins on page ${i}: ${invalid.map(x=>x.str).join('|')}`);
  geometries.push({page:i,width:canvas.width,height:canvas.height,textItems:content.items.length});
}
// Verify every original paragraph remains present, not just the summarized profile.
const actual=normalized(extracted);
if(!actual.includes('Mais de 300 empresas treinadas.'))throw Error('Training total missing from PDF');
for(const paragraph of source)if(!actual.includes(normalized(paragraph)))throw Error(`Missing original content: ${paragraph}`);
fs.writeFileSync(path.join(previewDir,'verification.json'),JSON.stringify({source:'documents/curriculo-original.docx',output,pages:pdf.numPages,originalParagraphs:source.length,allOriginalParagraphsPresent:true,geometries},null,2));
fs.copyFileSync(output,'public/curriculo-andre-suckow.pdf');
console.log(`PDF created and rendered: ${pdf.numPages} pages; all ${source.length} original paragraphs verified.`);
