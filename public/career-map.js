export function drawCareerScreen(e,t,n,{companies,colors: X,Q,kv,Ev,wv,Tv,Nv}){
 t.dominant=4;
 Q(e,`NÍVEL ${companies.length}`,48,104,{size:24,bold:true,color:X.violet});
 kv(e,{x:188,y:109,w:360,h:16},8.6,10,X.violet,X.deep);
 Q(e,`XP DESDE ${Math.min(...companies.filter(c=>!c.invitation).map(c=>c.start))}`,564,105,{size:20,color:X.muted});
 const selected=Math.max(0,Math.min(t.selected,companies.length-1)),company=companies[selected],panel={x:48,y:156,w:506,h:548};
 Ev(e,panel,X.slate,X.panel);
 Q(e,`${company.phase} · ${company.title}`.toUpperCase(),72,178,{size:20,color:X.sel,max:458});
 let y=wv(e,company.role,72,212,458,{size:28,bold:true,maxLines:2,lineH:34});
 Q(e,company.org,72,y+8,{size:24,color:X.sky,max:company.logo?340:458});
 const logo=t.assets.screenshots['company/'+company.id];
 if(logo){const scale=Math.min(106/logo.width,50/logo.height);e.save();e.imageSmoothingEnabled=true;e.drawImage(logo,530-logo.width*scale,y+8,logo.width*scale,logo.height*scale);e.restore();}
 Q(e,company.period.toUpperCase(),72,y+40,{size:18,color:X.muted});y+=80;Tv(e,{x:72,y,w:458,h:2},X.deep);y+=18;
 for(const text of company.bullets){if(y>panel.y+panel.h-40)break;Nv(e,'right',72,y+6,12,X.sel);y=wv(e,text,94,y,436,{size:22,color:X.text,maxLines:3,lineH:28})+10;}
 Q(e,'MAPA DA JORNADA',773,168,{size:20,bold:true,color:X.sel,align:'center'});
 t.careerMap??=t.createCareerMap();
 const bounds=t.careerMap.draw(e,{x:568,y:194,w:408,h:460},selected,n,t.reducedMotion);
 companies.forEach((company,index)=>{
  const rect=bounds[index];t.addItem({id:'experiencia/'+index,rect,kind:'select',label:`${company.phase}: ${company.role}, ${company.org}, ${company.period}`});
  const label=company.invitation?'SUA COMPANHIA':index===0?'MARQ HR':'PILGRIM’S';
  Q(e,label,rect.x+rect.w/2,rect.y+rect.h-10,{size:14,bold:true,color:index===selected?X.sel:X.text,align:'center',max:145});
 });
 Q(e,'■ EXPERIÊNCIAS ANTERIORES',580,662,{size:15,color:'#42d68a'});
 Q(e,'■ PRÓXIMA COMPANHIA',580,686,{size:15,color:'#57a8ff'});
}

// A real orthographic 3D diorama, composited into the TV's existing canvas.
export function createCareerMap(T,companies,assets){
 const {Scene,Group,Mesh,BoxGeometry,PlaneGeometry,BufferGeometry,BufferAttribute,BasicMaterial,CanvasTexture,OrthographicCamera,Renderer,Vector3,SRGB}=T;
 const renderer=new Renderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(480,640);renderer.setPixelRatio(1);renderer.outputColorSpace=SRGB;renderer.setClearColor(0x000000,0);
 const scene=new Scene(),camera=new OrthographicCamera(-2.6,2.6,3.45,-3.45,.1,40);
 camera.position.set(6,7,9);camera.lookAt(0,.2,0);
 const resources=[],materials=new Map(),logos=new Map();
 function mat(color){if(!materials.has(color))materials.set(color,new BasicMaterial({color}));return materials.get(color);}
 function box(parent,x,y,z,w,h,d,color){
  const geometry=new BoxGeometry(w,h,d);resources.push(geometry);
  const faces=Array.isArray(color)?color.map(mat):mat(color),mesh=new Mesh(geometry,faces);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 const earth=['#314a53','#233742','#5f8670','#253d44','#3a5960','#2b414e'];
 box(scene,0,-.23,0,3.85,.44,3.8,earth);
 box(scene,0,.005,0,3.95,.06,3.9,['#4a7165','#355748','#638a70','#355748','#4a7165','#355748']);
 const points=[[-1.1,-1.12],[1.02,-.12],[-.65,1.22]],buildings=[],flags=[];
 for(let j=0;j<points.length-1;j++){
  const a=points[j],b=points[j+1],distance=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(let k=0;k<=distance;k+=.19){const f=k/distance;box(scene,a[0]+(b[0]-a[0])*f,.055,a[1]+(b[1]-a[1])*f,.13,.045,.13,'#b6b5a5');}
 }
 // Quiet landscaping makes the terrain's depth readable without obscuring stops.
 for(const [x,z] of [[-1.6,.25],[1.52,1.35],[.4,-1.6]]){
  box(scene,x,.15,z,.045,.3,.045,'#a18e69');box(scene,x,.38,z,.26,.32,.26,['#387563','#275d50','#65a381','#234b43','#46846b','#387563']);
 }
 companies.forEach((company,index)=>{
  const [x,z]=points[index],building=new Group();building.position.set(x,.065,z);scene.add(building);
  box(building,0,.035,0,1,.07,.86,'#a6aa9e');
  box(building,0,.38,0,.84,.68,.64,['#9cacc0','#74869b','#e0e4e2','#74869b','#cbd4d8','#8595a9']);
  box(building,0,.77,0,.96,.13,.76,['#3c4b69','#283a55','#657b98','#283a55','#4b6283','#344862']);
  box(building,.22,.24,.326,.16,.4,.02,'#31435c');
  box(building,-.22,.25,.333,.22,.18,.018,'#73b4c6');
  box(building,-.22,.25,.346,.018,.19,.012,'#cbd4d8');
  box(building,-.22,.25,.346,.23,.014,.012,'#cbd4d8');
  const poleX=x+.61,poleZ=z-.14;
  box(scene,poleX,.035,poleZ,.18,.07,.18,'#c4c5b6');
  box(scene,poleX,.66,poleZ,.035,1.28,.035,'#d0d7de');
  const positions=[],uv=[],indices=[],columns=12;
  for(let row=0;row<2;row++)for(let col=0;col<=columns;col++){positions.push(col/columns*.46,1.25-row*.25,0);uv.push(col/columns,1-row);}
  for(let col=0;col<columns;col++){const a=col,b=col+columns+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(positions),3));geometry.setAttribute('uv',new BufferAttribute(new Float32Array(uv),2));geometry.setIndex(indices);geometry.computeVertexNormals();resources.push(geometry);
  const flag=new Mesh(geometry,new BasicMaterial({color:company.invitation?'#57a8ff':'#42d68a',side:2}));flag.position.set(poleX,0,poleZ);scene.add(flag);flags.push(flag);
  buildings.push(building);
 });
 const avatar=new Group();scene.add(avatar);avatar.rotation.y=Math.atan2(6,9);
 box(avatar,-.075,.09,0,.09,.18,.12,'#283b68');box(avatar,.075,.09,0,.09,.18,.12,'#283b68');
 box(avatar,0,.29,0,.25,.25,.16,['#a96327','#a96327','#ffc56d','#a96327','#ed9c37','#a96327']);
 box(avatar,-.17,.29,0,.075,.22,.09,'#e5a16b');box(avatar,.17,.29,0,.075,.22,.09,'#e5a16b');
 box(avatar,0,.58,0,.37,.37,.2,'#8c6348');
 const marker=box(scene,0,.075,0,1.08,.025,.94,'#ffb547');
 function picture(image,parent,x,y,z,w,h,key){
  if(!image||logos.has(key))return;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
  const c=canvas.getContext('2d');c.fillStyle=key==='portrait'?'#151c30':'#18253d';c.fillRect(0,0,512,256);
  const scale=Math.min(480/image.width,220/image.height);c.imageSmoothingEnabled=key!=='portrait';c.drawImage(image,(512-image.width*scale)/2,(256-image.height*scale)/2,image.width*scale,image.height*scale);
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGB;resources.push(texture);
  const geometry=new PlaneGeometry(w,h);resources.push(geometry);const material=new BasicMaterial({map:texture});
  const mesh=new Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);logos.set(key,mesh);
 }
 // The next company is an invitation, so its facade has a labeled placeholder.
 const nextCanvas=document.createElement('canvas');nextCanvas.width=400;nextCanvas.height=160;const next=nextCanvas.getContext('2d');
 next.fillStyle='#18253d';next.fillRect(0,0,400,160);next.fillStyle='#7abfff';next.font='bold 40px Arial';next.textAlign='center';next.fillText('SUA COMPANHIA',200,94);
 function syncArt(){
  companies.forEach((company,i)=>picture(company.invitation?nextCanvas:assets.screenshots['company/'+company.id],buildings[i],0,.58,.332,.72,.24,'company/'+company.id));
  if(assets.portrait&&!logos.has('portrait')){
   const texture=new CanvasTexture(assets.portrait);texture.colorSpace=SRGB;resources.push(texture);
   const geometry=new PlaneGeometry(.375,.375);resources.push(geometry);const mesh=new Mesh(geometry,new BasicMaterial({map:texture,transparent:true}));mesh.position.set(0,.58,.103);avatar.add(mesh);logos.set('portrait',mesh);
  }
 }
 return {
  draw(ctx,rect,selected,time,reduced){
   syncArt();selected=Math.max(0,Math.min(companies.length-1,selected));
   const [x,z]=points[selected];avatar.position.set(x-.6,reduced?0:Math.sin(time*3)*.015,z+.59);marker.position.set(x,.075,z);
   flags.forEach((flag,index)=>{const attr=flag.geometry.attributes.position;for(let row=0;row<2;row++)for(let col=0;col<=12;col++){const f=col/12;attr.setZ(row*13+col,reduced?0:Math.sin(time*5-f*7+index)*.075*f);}attr.needsUpdate=true;});
   renderer.render(scene,camera);ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(renderer.domElement,rect.x,rect.y,rect.w,rect.h);ctx.restore();
   return points.map(([x,z])=>{const p=new Vector3(x,.38,z).project(camera);return {x:rect.x+(p.x+1)/2*rect.w-48,y:rect.y+(1-p.y)/2*rect.h-52,w:104,h:115};});
  },
  dispose(){for(const resource of resources)resource.dispose();for(const material of materials.values())material.dispose();scene.traverse(object=>{if(object.isMesh)for(const material of Array.isArray(object.material)?object.material:[object.material])material.dispose();});renderer.dispose();}
 };
}
