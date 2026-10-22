// A tangible notebook: printed pages, page block, back cover and metal spiral.
// Uses the room engine's Three.js runtime instead of loading a second copy.
import {drawDiscmanDisplay} from './discman.js?v=cs-mode-3';
import {discmanState} from './discman-player.js?v=cs-mode-3';
import {inspectionLayout,inspectionPointFrame,inspectionZoom,clampInspectionZoom} from './inspection-layout.js?v=cs-mode-3';
export function createNotebookViewer(T,canvas,dialog,inspection=null){
 const {Scene,Group,Mesh,BoxGeometry,PlaneGeometry,BufferGeometry,BufferAttribute,BasicMaterial,Material,HemisphereLight,DirectionalLight,CanvasTexture,PerspectiveCamera,Renderer,Raycaster,Vector2,Box3,Vector3,SRGB}=T;
 const renderer=new Renderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.outputColorSpace=SRGB;renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0,0);
 const scene=new Scene(),book=new Group(),camera=new PerspectiveCamera(38,1,.1,30);scene.add(book);camera.position.set(0,0,6.2);
 scene.add(new HemisphereLight(0xfff4df,0x323b59,1.6));const key=new DirectionalLight(0xfff1d9,3);key.position.set(-3,5,6);scene.add(key);const fill=new DirectionalLight(0xb5cdff,.7);fill.position.set(4,0,-2);scene.add(fill);
 const resources=[],materials=[],listeners=[];let active=false,frame=0,zoom=inspectionZoom.initial,distance=6.2,offsetX=0;
 const actions=dialog.querySelector('.notebook-inspector__actions');
 const zoomIn=dialog.querySelector('[data-notebook-view="in"]'),zoomOut=dialog.querySelector('[data-notebook-view="out"]');
 const pointers=new Map(),ray=new Raycaster(),ndc=new Vector2();
 const discman=dialog.dataset.object==='discman';
 const inspectionPoints=new Map();
 function* framePoints(){const meshes=[],point=new Vector3();book.updateWorldMatrix(true,true);book.traverseVisible(mesh=>{if(mesh.isMesh)meshes.push(mesh);});for(const mesh of meshes)for(const local of inspectionPoints.get(mesh.geometry)||[])yield point.copy(local).applyMatrix4(mesh.matrixWorld);}
 function visibleBounds(object){const bounds=new Box3();object.updateWorldMatrix(true,true);object.traverseVisible(mesh=>{if(!mesh.isMesh)return;if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));});return bounds;}
 const material=options=>{const m=new Material({roughness:.72,metalness:.04,...options});materials.push(m);return m;};
 function box(w,h,d,z,m){const geometry=new BoxGeometry(w,h,d);resources.push(geometry);const mesh=new Mesh(geometry,m);mesh.position.z=z;book.add(mesh);return mesh;}
 if(!inspection){
 const edge=material({color:'#9ca6b8'}),bottom=material({color:'#68758c'}),cover=material({color:'#141833'}),rim=material({color:'#34415e'});
 box(2.42,3.62,.055,-.065,[rim,rim,rim,rim,cover,cover]);
 box(2.32,3.5,.075,0,[edge,bottom,edge,bottom,cover,cover]);
 // Fine layers remain visible when the notebook is held sideways.
 for(let i=0;i<5;i++)box(2.325,3.505,.002,-.027+i*.012,material({color:i%2?'#d1d6df':'#6e7b92'}));
 function texture(draw,w=1200,h=1800){const page=document.createElement('canvas');page.width=w;page.height=h;draw(page.getContext('2d'),w,h);const map=new CanvasTexture(page);map.colorSpace=SRGB;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());resources.push(map);return map;}
 const print=texture((c,w,h)=>{
  c.fillStyle='#141833';c.fillRect(0,0,w,h);c.fillStyle='#ffb547';c.fillRect(0,0,w,12);
  c.font='600 25px "Space Grotesk", sans-serif';c.fillText('SUPER NINTENDO · MINHAS AVENTURAS',82,118);
  c.fillStyle='#f4f1e8';c.font='700 53px "Space Grotesk", sans-serif';c.fillText('MEU CADERNO DE JOGOS',82,192,1040);
  c.strokeStyle='#ffb547';c.lineWidth=3;c.beginPath();c.moveTo(82,231);c.lineTo(w-82,231);c.stroke();
  c.fillStyle='#aeb6c8';c.font='28px Inter, sans-serif';c.fillText('As próximas aventuras e os jogos que já completei.',82,286);
  c.strokeStyle='#74603c';c.lineWidth=1;c.beginPath();c.moveTo(76,341);c.lineTo(76,h-90);c.stroke();
  let y=375;
  for(const section of dialog.querySelectorAll('.games-notebook__page')){
   const complete=!!section.querySelector('s');c.fillStyle='#ffb547';c.font='700 35px "Space Grotesk", sans-serif';c.fillText(section.querySelector('h3').textContent.toUpperCase(),104,y);y+=67;
   for(const li of section.querySelectorAll('li')){
    const text=(li.querySelector('s')?.textContent||li.textContent).trim();
    c.strokeStyle=complete?'#ffb547':'#8a96b0';c.lineWidth=2;c.strokeRect(104,y-25,23,23);
    if(complete){c.beginPath();c.moveTo(108,y-15);c.lineTo(115,y-7);c.lineTo(126,y-25);c.stroke();}
    c.font='34px Inter, sans-serif';c.fillStyle=complete?'#aeb6c8':'#f4f1e8';c.fillText(text,156,y,930);
    if(complete){c.strokeStyle='#ffb547';c.lineWidth=2;c.beginPath();c.moveTo(156,y-12);c.lineTo(Math.min(w-82,156+c.measureText(text).width),y-12);c.stroke();}
    c.strokeStyle='#354263';c.lineWidth=1;c.beginPath();c.moveTo(100,y+24);c.lineTo(w-82,y+24);c.stroke();y+=77;
   }
   y+=63;
  }
 });
 const plane=new PlaneGeometry(2.32,3.5);resources.push(plane);const face=new Mesh(plane,material({map:print}));face.position.z=.04;book.add(face);
 const back=texture((c,w,h)=>{c.fillStyle='#141833';c.fillRect(0,0,w,h);c.strokeStyle='#ffb547';c.lineWidth=5;c.strokeRect(70,70,w-140,h-140);c.textAlign='center';c.fillStyle='#ffb547';c.font='700 105px "Pixelify Sans",monospace';c.fillText('AS · 16',w/2,h*.46);c.fillStyle='#f4f1e8';c.font='38px "Space Grotesk",sans-serif';c.fillText('MEU CADERNO DE JOGOS',w/2,h*.53);});
 const backFace=new Mesh(plane,material({map:back}));backFace.rotation.y=Math.PI;backFace.position.z=-.094;book.add(backFace);
 // Binding loops run around the top edge, including their hidden rear half.
 for(let ring=0;ring<18;ring++){
  const positions=[],colors=[],indices=[],segments=28,sides=8,x=-1.07+ring*2.14/17;
  for(let i=0;i<=segments;i++)for(let j=0;j<=sides;j++){
   const a=i/segments*Math.PI*2,b=j/sides*Math.PI*2;
   positions.push(x+.013*Math.cos(b),1.71+(.14+.013*Math.sin(b))*Math.cos(a),.015+(.11+.013*Math.sin(b))*Math.sin(a));
   const light=.43+.5*Math.max(0,Math.sin(a)*.5+Math.cos(b)*.5);colors.push(light*.86,light*.91,light);
   if(i<segments&&j<sides){const v=i*(sides+1)+j,n=v+sides+1;indices.push(v,n,v+1,n,n+1,v+1);}
  }
  const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(positions),3));geometry.setAttribute('color',new BufferAttribute(new Float32Array(colors),3));geometry.setIndex(indices);geometry.computeVertexNormals();resources.push(geometry);book.add(new Mesh(geometry,material({vertexColors:true})));
 }
 }else{
  const object=inspection;
  const clonedMaps=new Map();
  object.traverse(mesh=>{
   if(!mesh.isMesh)return;
   mesh.geometry=mesh.geometry.clone();resources.push(mesh.geometry);
   if(discman){const positions=mesh.geometry.attributes.position,index=mesh.geometry.index,tight=new Box3(),points=[],seen=new Set();for(let i=0;i<(index?index.count:positions.count);i++){const vertex=index?index.getX(i):i;if(seen.has(vertex))continue;seen.add(vertex);const point=new Vector3().fromBufferAttribute(positions,vertex);tight.expandByPoint(point);points.push(point);}mesh.geometry.boundingBox=tight;inspectionPoints.set(mesh.geometry,points);}
   const convert=m=>{
    const copy=m.isMeshStandardMaterial?m.clone():material({color:m.color,transparent:m.transparent,opacity:m.opacity,side:m.side,roughness:.72,metalness:.04});
    if(m.isMeshStandardMaterial)materials.push(copy);
    for(const [key,value] of Object.entries(m))if(value?.isTexture){
     if(!clonedMaps.has(value)){const texture=value.clone();texture.needsUpdate=true;clonedMaps.set(value,texture);resources.push(texture);}
     copy[key]=clonedMaps.get(value);
    }
    return copy;
   };
   mesh.material=Array.isArray(mesh.material)?mesh.material.map(convert):convert(mesh.material);
  });
  book.add(object);object.updateMatrixWorld(true);
  const bounds=discman?visibleBounds(object):new Box3().setFromObject(object),center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3());
  object.position.sub(center);const scale=3.3/Math.max(size.x,size.y,size.z);book.scale.setScalar(scale);
 }
 const envelope=discman?visibleBounds(book):new Box3().setFromObject(book);
 const radius=Math.hypot(Math.max(Math.abs(envelope.min.x),Math.abs(envelope.max.x)),Math.max(Math.abs(envelope.min.y),Math.abs(envelope.max.y)),Math.max(Math.abs(envelope.min.z),Math.abs(envelope.max.z)));
 let closeView=false,boxSignature='',viewOffsetX=0,viewOffsetY=0;
 const volumeWheels=[];if(discman)book.traverse(object=>{if(object.userData.discmanVolumeWheel)volumeWheels.push({object,rest:object.rotation.y});});
 const displays=[];if(discman)book.traverse(mesh=>{if(mesh.userData.discmanScreen)displays.push(mesh.material.map);});
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function render(time=0){frame=0;if(!active)return;if(discman){for(const {object,rest} of volumeWheels)object.rotation.y=rest+(discmanState.volume-.7)*Math.PI*2;for(const map of displays){drawDiscmanDisplay(map.image,discmanState,time);map.needsUpdate=true;}if(closeView){const r=canvas.getBoundingClientRect(),signature=[book.rotation.x,book.rotation.y,book.rotation.z,r.width,r.height].join('/');if(signature!==boxSignature){boxSignature=signature;book.updateMatrixWorld(true);({distance,viewOffsetX,viewOffsetY}=inspectionPointFrame({width:r.width,height:r.height,points:framePoints(),fov:camera.fov}));}}}camera.zoom=zoom;if(closeView){const r=canvas.getBoundingClientRect();camera.setViewOffset(r.width,r.height,viewOffsetX*zoom,viewOffsetY*zoom,r.width,r.height);}camera.position.set(offsetX/zoom,0,distance);camera.far=Math.max(30,distance+radius*3);camera.updateProjectionMatrix();renderer.render(scene,camera);if(discman)schedule();}
 function schedule(){if(active&&!frame)frame=requestAnimationFrame(render);}
 function setZoom(value){
  zoom=clampInspectionZoom(value);
  zoomIn.disabled=zoom>=inspectionZoom.max;zoomOut.disabled=zoom<=inspectionZoom.min;
  zoomIn.title=zoomIn.disabled?'Ampliação máxima atingida':'Ampliar objeto (+)';
  zoomOut.title=zoomOut.disabled?'Redução mínima atingida':'Reduzir objeto (−)';
  schedule();
 }
 function fit(){if(!active)return;const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;closeView=discman;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;if(closeView){offsetX=0;boxSignature='';}else({distance,offsetX}=inspectionLayout({width:r.width,height:r.height,actionsWidth:actions.getBoundingClientRect().width,radius,fov:camera.fov}));schedule();}
 function reset(){if(discman)book.rotation.set(-.82,.04,0);else book.rotation.set(.24,-.46,-.035);setZoom(discman ? .95 : inspectionZoom.initial);}
 function listen(target,event,handler,options){target.addEventListener(event,handler,options);listeners.push(()=>target.removeEventListener(event,handler,options));}
 listen(canvas,'animationend',schedule);
 function intersections(e){const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);return ray.intersectObject(book,true);}
 function hit(e){return intersections(e).length>0;}
 function discmanAction(e){
  const target=intersections(e)[0],action=target?.object.userData.discmanAction;
  if(action!=='skip')return action;
  const local=target.object.worldToLocal(target.point.clone());return local.z>=target.object.userData.discmanSkipMid?'previous':'next';
 }
 let buttonPress=null;
 listen(canvas,'pointerdown',e=>{
  if(!active||e.button>0||(!pointers.size&&!hit(e)))return;
  e.preventDefault();canvas.focus({preventScroll:true});pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-held');
  if(discman){const action=discmanAction(e);buttonPress=action?{action,x:e.clientX,y:e.clientY,id:e.pointerId,volume:discmanState.volume}:null;}
 });
 listen(canvas,'pointermove',e=>{
  const before=pointers.get(e.pointerId);if(!before){if(discman){const action=discmanAction(e);canvas.style.cursor=action==='volume'?'ew-resize':action?'pointer':'';canvas.title=({toggle:'Ouvir / pausar',play:'Ouvir',pause:'Pausar',previous:'Retroceder: faixa anterior',next:'Próxima faixa',volume:'Volume: arraste para os lados'})[action]||'';}return;}e.preventDefault();
  if(buttonPress?.action==='volume'&&pointers.size===1){document.dispatchEvent(new CustomEvent('discman:volume',{detail:buttonPress.volume+(e.clientX-buttonPress.x)/140}));pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});schedule();return;}
  if(pointers.size>1)buttonPress=null;
  if(buttonPress&&Math.hypot(e.clientX-buttonPress.x,e.clientY-buttonPress.y)>8)buttonPress=null;
  const dx=e.clientX-before.x,dy=e.clientY-before.y;
  if(pointers.size===2){const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)[1],oldDistance=Math.hypot(before.x-other.x,before.y-other.y),distance=Math.hypot(e.clientX-other.x,e.clientY-other.y);setZoom(zoom*distance/Math.max(1,oldDistance));}
  else{book.rotation.y+=dx*.009;book.rotation.x=clamp(book.rotation.x+dy*.007,-1.35,1.35);}
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});schedule();
 });
 function release(e){if(buttonPress?.id===e.pointerId){const press=buttonPress;buttonPress=null;if(press.action!=='volume'&&e.type==='pointerup'&&Math.hypot(e.clientX-press.x,e.clientY-press.y)<=8)document.dispatchEvent(new CustomEvent('discman:control',{detail:press.action}));}pointers.delete(e.pointerId);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(!pointers.size)canvas.classList.remove('is-held');}
 for(const event of ['pointerup','pointercancel','lostpointercapture'])listen(canvas,event,release);
 listen(canvas,'wheel',e=>{if(!active)return;e.preventDefault();setZoom(zoom*Math.exp(-e.deltaY*.001));},{passive:false});
 listen(canvas,'keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey)return;const arrows={ArrowLeft:[-.18,0],ArrowRight:[.18,0],ArrowUp:[0,-.14],ArrowDown:[0,.14]};
  if(arrows[e.key]){e.preventDefault();const [x,y]=arrows[e.key];book.rotation.y+=x;book.rotation.x=clamp(book.rotation.x+y,-1.35,1.35);schedule();}
  if(['+','=','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home')reset();else setZoom(zoom*(e.key==='-'?.85:1.15));}
 });
 for(const button of dialog.querySelectorAll('[data-notebook-view]'))listen(button,'click',()=>{
  setZoom(zoom*(button.dataset.notebookView==='in'?1.25:1/1.25));
 });
 const observer=new ResizeObserver(fit);observer.observe(canvas);reset();
 return {
  start(){active=true;canvas.dataset.ready='true';reset();fit();},
  stop(){active=false;cancelAnimationFrame(frame);frame=0;for(const id of pointers.keys())if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);pointers.clear();canvas.classList.remove('is-held');},
  dispose(){this.stop();observer.disconnect();for(const remove of listeners)remove();for(const value of resources)value.dispose();for(const value of materials)value.dispose();renderer.dispose();}
 };
}
