// A tangible notebook: printed pages, page block, back cover and metal spiral.
// Uses the room engine's Three.js runtime instead of loading a second copy.
export function createNotebookViewer(T,canvas,dialog,inspection=null){
 const {Scene,Group,Mesh,BoxGeometry,PlaneGeometry,BufferGeometry,BufferAttribute,BasicMaterial,CanvasTexture,OrthographicCamera,Renderer,Raycaster,Vector2,Box3,Vector3,SRGB}=T;
 const renderer=new Renderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.outputColorSpace=SRGB;renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0,0);
 const scene=new Scene(),book=new Group(),camera=new OrthographicCamera(-3,3,2.3,-2.3,.1,30);scene.add(book);camera.position.set(0,0,8);
 const resources=[],materials=[],listeners=[];let active=false,frame=0,mode='rotate',zoom=1,panX=0,panY=0;
 const pointers=new Map(),ray=new Raycaster(),ndc=new Vector2();
 const material=options=>{const m=new BasicMaterial(options);materials.push(m);return m;};
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
   const convert=m=>{
    let map=null;
    if(m.map){if(!clonedMaps.has(m.map)){const copy=m.map.clone();copy.needsUpdate=true;clonedMaps.set(m.map,copy);resources.push(copy);}map=clonedMaps.get(m.map);}
    return material({color:m.color,map,transparent:m.transparent,opacity:m.opacity,side:m.side});
   };
   mesh.material=Array.isArray(mesh.material)?mesh.material.map(convert):convert(mesh.material);
  });
  book.add(object);object.updateMatrixWorld(true);
  const bounds=new Box3().setFromObject(object),center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3());
  object.position.sub(center);const scale=3.3/Math.max(size.x,size.y,size.z);book.scale.setScalar(scale);
 }
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function render(){frame=0;if(!active)return;camera.zoom=zoom;camera.position.set(panX,panY,8);camera.updateProjectionMatrix();renderer.render(scene,camera);}
 function schedule(){if(active&&!frame)frame=requestAnimationFrame(render);}
 function fit(){if(!active)return;const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);const aspect=r.width/r.height;camera.left=-2.12*aspect;camera.right=2.12*aspect;camera.top=2.12;camera.bottom=-2.12;schedule();}
 function reset(){book.rotation.set(-.08,-.12,-.012);zoom=1;panX=panY=0;schedule();}
 function setMode(next){mode=next;canvas.dataset.tool=mode;for(const button of dialog.querySelectorAll('[data-notebook-tool]'))button.setAttribute('aria-pressed',String(button.dataset.notebookTool===mode));}
 function listen(target,event,handler,options){target.addEventListener(event,handler,options);listeners.push(()=>target.removeEventListener(event,handler,options));}
 function hit(e){const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);return ray.intersectObject(book,true).length>0;}
 listen(canvas,'pointerdown',e=>{
  if(!active||e.button>0||(!pointers.size&&!hit(e)))return;
  e.preventDefault();canvas.focus({preventScroll:true});pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-held');
 });
 listen(canvas,'pointermove',e=>{
  const before=pointers.get(e.pointerId);if(!before)return;e.preventDefault();
  const dx=e.clientX-before.x,dy=e.clientY-before.y;
  if(pointers.size===2){const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)[1],oldDistance=Math.hypot(before.x-other.x,before.y-other.y),distance=Math.hypot(e.clientX-other.x,e.clientY-other.y);zoom=clamp(zoom*distance/Math.max(1,oldDistance),.65,3.5);}
  else if(mode==='move'||e.shiftKey){panX-=dx/canvas.clientHeight*4.24/zoom;panY+=dy/canvas.clientHeight*4.24/zoom;}
  else{book.rotation.y+=dx*.009;book.rotation.x=clamp(book.rotation.x+dy*.007,-1.35,1.35);}
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});schedule();
 });
 function release(e){pointers.delete(e.pointerId);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(!pointers.size)canvas.classList.remove('is-held');}
 for(const event of ['pointerup','pointercancel','lostpointercapture'])listen(canvas,event,release);
 listen(canvas,'wheel',e=>{if(!active)return;e.preventDefault();zoom=clamp(zoom*Math.exp(-e.deltaY*.001),.65,3.5);schedule();},{passive:false});
 listen(canvas,'keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey)return;const arrows={ArrowLeft:[-.18,0],ArrowRight:[.18,0],ArrowUp:[0,-.14],ArrowDown:[0,.14]};
  if(arrows[e.key]){e.preventDefault();const [x,y]=arrows[e.key];if(mode==='move'){panX+=x;panY-=y;}else{book.rotation.y+=x;book.rotation.x=clamp(book.rotation.x+y,-1.35,1.35);}schedule();}
  if(['+','=','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home')reset();else{zoom=clamp(zoom*(e.key==='-'?.85:1.15),.65,3.5);schedule();}}
 });
 for(const button of dialog.querySelectorAll('[data-notebook-tool]'))listen(button,'click',()=>setMode(button.dataset.notebookTool));
 for(const button of dialog.querySelectorAll('[data-notebook-view]'))listen(button,'click',()=>{
  switch(button.dataset.notebookView){case'reset':reset();break;case'in':zoom=clamp(zoom*1.25,.65,3.5);break;case'out':zoom=clamp(zoom/1.25,.65,3.5);break;case'left':book.rotation.y-=.28;break;case'right':book.rotation.y+=.28;break;}schedule();
 });
 const observer=new ResizeObserver(fit);observer.observe(canvas);reset();setMode('rotate');
 return {
  start(){active=true;canvas.dataset.ready='true';reset();setMode('rotate');fit();},
  stop(){active=false;cancelAnimationFrame(frame);frame=0;for(const id of pointers.keys())if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);pointers.clear();canvas.classList.remove('is-held');},
  dispose(){this.stop();observer.disconnect();for(const remove of listeners)remove();for(const value of resources)value.dispose();for(const value of materials)value.dispose();renderer.dispose();}
 };
}
