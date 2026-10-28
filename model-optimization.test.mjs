import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {loadRoomModels,roomModels} from './public/model-loader.js';
import {rememberPropAppearance,restorePropAppearance} from './public/imported-props.js';
import {createFamilyFrame} from './public/family-frame.js';

const source=fs.readFileSync('src/engine.js','utf8'),start=source.indexOf('e_='),end=source.indexOf(',t_=',start);
// Read with the exact Meshopt decoder shipped by the site, not only the build dependency.
const decoder=new Function('return '+source.slice(start+3,end))();
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':decoder});
const manifest=JSON.parse(fs.readFileSync('public/models/optimized/manifest.json','utf8'));

test('portrait integration retains the supplied photo material, UVs and indexed geometry',()=>{
 const disposed=[];const uv=new Float32Array([.51,.03,.86,.03,.86,.28]);
 const texture={isTexture:true,dispose(){disposed.push('texture');}},material={map:texture,dispose(){disposed.push('material');}};
 const geometry={attributes:{uv:{array:uv}},index:{array:new Uint16Array([0,1,2])},dispose(){disposed.push('geometry');}};
 const mesh={isMesh:true,geometry,material},source={traverse(fn){fn(mesh);},updateMatrixWorld(){},position:{sub(){}}};
 class Group{constructor(){this.userData={};this.children=[];this.rotation={};this.scale={setScalar(){}};}add(child){this.children.push(child);}}
 class Vector3{}
 class Box3{setFromObject(){return this;}getCenter(){return {};}getSize(){return {y:1};}}
 const frame=createFamilyFrame({Group,Box3,Vector3,familyFrameScene:source});
 assert.equal(mesh.geometry,geometry);assert.equal(mesh.material,material);assert.equal(mesh.material.map,texture);
 assert.deepEqual([...uv],[...new Float32Array([.51,.03,.86,.03,.86,.28])]);assert.deepEqual([...geometry.index.array],[0,1,2]);
 assert.equal(frame.root.userData.familyFrameModel,'3dwstudio');frame.dispose();assert.deepEqual(disposed,['geometry','material','texture']);
});

test('optimized objects decode with the site runtime and preserve interactive node names',async()=>{
 await decoder.ready;
 for(const entry of manifest.models){
  const hash=createHash('sha256');for(const file of entry.inputFiles){const data=fs.readFileSync('public/'+file);hash.update(file+'\0').update(file.endsWith('.gltf')?data.toString('utf8').replace(/\r\n/g,'\n'):data);}
  assert.equal(hash.digest('hex'),entry.sourceSha256,'Regenerate optimized models after changing a source');
  assert.equal(createHash('sha256').update(fs.readFileSync('public/'+entry.file)).digest('hex'),entry.optimizedSha256);
  const original=await io.read('public/models/'+entry.source),optimized=await io.read('public/'+entry.file);
  const names=new Set(optimized.getRoot().listNodes().map(n=>n.getName()));
  for(const node of original.getRoot().listNodes())if(node.getName())assert(names.has(node.getName()),'Lost node: '+node.getName());
  assert(entry.optimizedBytes<entry.originalBytes*.5,entry.id+' must be substantially smaller');
  assert(entry.afterTriangles<=entry.beforeTriangles);
  assert(optimized.hasExtension('EXT_meshopt_compression'));
  if(entry.id==='discman'){
   const find=(doc,name)=>doc.getRoot().listNodes().find(n=>n.getName()===name);
   assert.deepEqual(find(optimized,'Empty_59').getMatrix(),find(original,'Empty_59').getMatrix(),'Lid pivot must not change');
   for(const name of ['lcd_pane','discman_silk_screen'])assert(optimized.getRoot().listMaterials().some(m=>m.getName()===name),name);
  }
  if(entry.id==='pokedex'){
   for(const mesh of optimized.getRoot().listMeshes())for(const prim of mesh.listPrimitives())assert(!prim.listSemantics().some(s=>/^TEXCOORD_[1-9]/.test(s)));
   assert(optimized.getRoot().listMaterials().every(m=>m.getAlphaMode()==='OPAQUE'));
  }
  if(entry.id==='bible'){
   const gold=optimized.getRoot().listMaterials().find(m=>m.getName()==='gold_paint');
   assert.equal(gold.getBaseColorTexture(),null);assert(gold.getBaseColorFactor()[1]>.6&&gold.getBaseColorFactor()[1]<.63);
  }
 }
 const before=manifest.models.reduce((n,m)=>n+m.originalBytes,0),after=manifest.models.reduce((n,m)=>n+m.optimizedBytes,0);
 assert(after<before*.25,'Combined optimized payload must remain below 25% of the original');
});

test('inspection restores authored colors without copying the room hover tint',()=>{
 for(const emissive of [[0,0,0],[1,1,1]]){
  const original={userData:{},emissiveIntensity:1,emissive:{value:[...emissive],toArray(){return [...this.value];},fromArray(a){this.value=[...a];}}};
  rememberPropAppearance(original);original.emissive.value=[1,.46,.06];original.emissiveIntensity=.16;
  const clone={...original,userData:structuredClone(original.userData),emissive:{...original.emissive,value:[...original.emissive.value]}};
  restorePropAppearance(clone);assert.deepEqual(clone.emissive.value,emissive);assert.equal(clone.emissiveIntensity,1);
  assert.equal(original.emissiveIntensity,.16,'Restoring the inspector copy must not mutate the live room');
 }
});

test('model loading installs the decoder and falls back independently without hiding other objects',async()=>{
 const requests=[],warnings=[];
 class Loader{
  setMeshoptDecoder(value){assert.equal(value,decoder);return this;}
  async loadAsync(url){requests.push(url);if(url.includes('optimized/bible.glb'))throw Error('Network failure');return {scene:{userData:{},url}};}
 }
 const models=await loadRoomModels({Loader,decoder,baseURL:'https://example.com/portfolio/model-loader.js',warn:(...args)=>warnings.push(args)});
 assert.equal(models.bibleScene.userData.assetVariant,'original');assert(models.bibleScene.url.includes('/portfolio/models/holy_bible/scene.gltf?v='));
 for(const key of ['familyFrameScene','pokedexScene','discmanScene'])assert.equal(models[key].userData.assetVariant,'optimized');
 assert.equal(requests.length,5);assert.equal(warnings.length,1);assert.equal(roomModels.length,4);
});

test('procedural room avoids downloading the inactive classic assets',()=>{
 const start=source.indexOf('async function n_('),end=source.indexOf('function r_(',start);
 const calls=[],fakeScene=class{},state={roomVersion:'novo-quarto-3d'},paths={room:'room',props:'props',tv:'tv',console:'console',cartridge:'cartridge',sprite:'sprite',roomTextures:{base:'base',tv:'tv-light'}};
 class GLTFLoader{setMeshoptDecoder(){}load(url,done){calls.push(url);done({scene:{}});}}
 class TextureLoader{loadAsync(url){calls.push(url);return Promise.resolve({});}}
 const factory=new Function('Eh','Rs','eg','e_','pd','Ka','Lh','Ah','document','loadPortfolioImage','t_',source.slice(start,end)+'return n_;');
 const load=factory(state,fakeScene,GLTFLoader,decoder,TextureLoader,'sRGB',paths,[],{fonts:{load:async()=>{}}},async()=>({}),{});
 return load({capabilities:{getMaxAnisotropy:()=>4}},()=>{}).then(()=>{assert.deepEqual(calls,['tv','cartridge']);});
});
