import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression,EXTTextureWebP} from '@gltf-transform/extensions';
import {dedup,weld,simplifyPrimitive,prune,reorder,quantize} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';

// Original author files are retained. Generated files preserve named interactive nodes.
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const directory='public/models/optimized';await fs.mkdir(directory,{recursive:true});
const specs=[
 {id:'discman',source:'discman_d150/scene.gltf'},
 {id:'bible',source:'holy_bible/scene.gltf'},
 {id:'pokedex',source:'pokedex/scene.gltf'},
 {id:'portrait',source:'portrait/family-frame.gltf'},
];
const triangleCount=root=>root.listMeshes().reduce((sum,mesh)=>sum+mesh.listPrimitives().reduce((n,p)=>n+(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3,0),0);
const srgbToLinear=x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4;
const report=[];
for(const spec of specs){
 const source=path.join('public/models',spec.source),json=JSON.parse(await fs.readFile(source,'utf8'));
 const files=new Set([source,...[...(json.buffers||[]),...(json.images||[])].filter(x=>x.uri&&!x.uri.startsWith('data:')).map(x=>path.join(path.dirname(source),x.uri))]);
 const originalBytes=(await Promise.all([...files].map(file=>fs.stat(file)))).reduce((n,s)=>n+s.size,0);
 const doc=await io.read(source),root=doc.getRoot(),beforeTriangles=triangleCount(root),nodeNames=root.listNodes().map(n=>n.getName()).filter(Boolean);
 let removedUVBytes=0;
 if(spec.id==='pokedex'){
  for(const mesh of root.listMeshes())for(const prim of mesh.listPrimitives()){
   const original=prim.getAttribute('TEXCOORD_0');
   for(const semantic of prim.listSemantics().filter(s=>/^TEXCOORD_[1-9]/.test(s))){
    const uv=prim.getAttribute(semantic);assert.deepEqual(uv.getArray(),original.getArray(),'Only identical UV sets can be removed');removedUVBytes+=uv.getArray().byteLength;prim.setAttribute(semantic,null);
   }
  }
  for(const mat of root.listMaterials())if(mat.getAlphaMode()==='BLEND'){
   const texture=mat.getBaseColorTexture(),data=await sharp(texture.getImage()).ensureAlpha().raw().toBuffer();
   assert.equal(mat.getBaseColorFactor()[3],1);for(let i=3;i<data.length;i+=4)assert.equal(data[i],255,'Only fully opaque materials may switch to OPAQUE');mat.setAlphaMode('OPAQUE');
  }
 }
 if(spec.id==='bible')for(const mat of root.listMaterials())if(mat.getName()==='gold_paint'){
  const texture=mat.getBaseColorTexture(),pixels=await sharp(texture.getImage()).ensureAlpha().raw().toBuffer(),color=[255,206,104,255];
  for(let i=0;i<pixels.length;i++)assert.equal(pixels[i],color[i%4],'Gold color must remain uniform');
  const factor=mat.getBaseColorFactor();mat.setBaseColorTexture(null).setBaseColorFactor([srgbToLinear(1)*factor[0],srgbToLinear(206/255)*factor[1],srgbToLinear(104/255)*factor[2],factor[3]]);
 }
 await doc.transform(weld());
 for(const mesh of root.listMeshes()){
  const prims=mesh.listPrimitives(),maxTriangles=Math.max(...prims.map(p=>(p.getIndices()?.getCount()||0)/3));
  const parentNames=root.listNodes().filter(n=>n.getMesh()===mesh).map(n=>{let names=[];for(let p=n;p&&p.propertyType==='Node';p=p.getParentNode())names.push(p.getName());return names.join('/');}).join(' ');
  let options=null;
  if(spec.id==='bible'&&/^TEXT [12]/.test(mesh.getName()))options={ratio:.25,error:.00005,lockBorder:true};
  if(spec.id==='pokedex'&&maxTriangles>10000)options={ratio:.6,error:.0001,lockBorder:true};
  if(spec.id==='discman'&&maxTriangles>10000&&!/button|lid|sony|control|volume/i.test(parentNames))options={ratio:.65,error:.0001,lockBorder:true};
  if(options)for(const prim of prims)simplifyPrimitive(prim,{simplifier:MeshoptSimplifier,...options});
 }
 await doc.transform(prune({keepLeaves:true,keepAttributes:true,keepSolidTextures:true,keepExtras:true}),dedup({keepUniqueNames:true}));
 let texturePixels=0,originalTexturePixels=0;
 for(const image of json.images||[]){const info=await sharp(path.join(path.dirname(source),image.uri)).metadata();originalTexturePixels+=info.width*info.height;}
 for(const texture of root.listTextures()){
  const info=await sharp(texture.getImage()).metadata(),name=texture.getURI()||texture.getName();
  let max=spec.id==='portrait'?512:1024;
  if(spec.id==='bible')max=/normal/i.test(name)?256:512;
  if(spec.id==='pokedex'&&/baseColor/i.test(name))max=2048;
  const pipeline=sharp(texture.getImage()).resize({width:max,height:max,fit:'inside',withoutEnlargement:true});
  const image=await (spec.id==='portrait'?pipeline.jpeg({quality:94,chromaSubsampling:'4:4:4'}):pipeline.webp({lossless:true,effort:6})).toBuffer();
  const resized=await sharp(image).metadata();texturePixels+=resized.width*resized.height;
  texture.setImage(image).setMimeType(spec.id==='portrait'?'image/jpeg':'image/webp').setURI(name.replace(/\.[^.]+$/,spec.id==='portrait'?'.jpg':'.webp'));
 }
 if(spec.id!=='portrait')doc.createExtension(EXTTextureWebP).setRequired(true);
 // Explicit cleanup avoids removing named anchors, pivots, or material names used by controls.
 await doc.transform(reorder({encoder:MeshoptEncoder,target:'size',cleanup:false}),quantize({quantizePosition:16,quantizeNormal:12,quantizeTexcoord:16,cleanup:false}));
 await doc.transform(prune({keepLeaves:true,keepAttributes:true,keepSolidTextures:true,keepExtras:true}),dedup({keepUniqueNames:true}));
 doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
 const target=path.join(directory,spec.id+'.glb');await io.write(target,doc);
 const verified=await io.read(target),afterNames=verified.getRoot().listNodes().map(n=>n.getName());for(const name of nodeNames)assert(afterNames.includes(name),'Lost interactive node '+name);
 const inputFiles=[...files].map(file=>path.relative('public',file).replaceAll('\\','/')),hash=createHash('sha256');
 for(const file of inputFiles){const data=await fs.readFile(path.join('public',file));hash.update(file+'\0').update(file.endsWith('.gltf')?data.toString('utf8').replace(/\r\n/g,'\n'):data);}
 const row={id:spec.id,source:spec.source,file:'models/optimized/'+spec.id+'.glb',inputFiles,sourceSha256:hash.digest('hex'),optimizedSha256:createHash('sha256').update(await fs.readFile(target)).digest('hex'),originalBytes,optimizedBytes:(await fs.stat(target)).size,beforeTriangles,afterTriangles:triangleCount(verified.getRoot()),removedUVBytes,originalTexturePixels,texturePixels};report.push(row);console.log(JSON.stringify(row));
}
await fs.writeFile(path.join(directory,'manifest.json'),JSON.stringify({models:report},null,2)+'\n');
