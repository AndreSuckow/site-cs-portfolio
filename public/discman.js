// Silver portable CD player and orange foam headphones, modeled locally.
export function drawDiscmanDisplay(canvas,state={},time=0){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 c.fillStyle='#a7b596';c.fillRect(0,0,w,h);c.fillStyle='#26382c';
 c.font='bold 25px monospace';c.fillText(`${String((state.index||0)+1).padStart(2,'0')} / 05   ${state.playing?'PLAY':'PAUSE'}`,14,29);
 c.save();c.beginPath();c.rect(12,40,w-24,h-44);c.clip();c.font='bold 34px monospace';
 const title=(state.title||'CPM 22 - Dias Atrás')+'     •     ',width=c.measureText(title).width;
 const offset=state.reduced?0:(time*.055)%width;
 for(let x=14-offset;x<w;x+=width)c.fillText(title,x,81);c.restore();
}
export function createDiscman(T){
 const {Group,Mesh,BoxGeometry,PlaneGeometry,BufferGeometry,BufferAttribute,Material,CanvasTexture,SRGB}=T;
 const root=new Group();root.name='Discman with orange headphones';
 const materials=[],resources=[];
 const mat=color=>{const m=new Material({color,roughness:.5,metalness:.25});materials.push(m);return m;};
 const silver=mat('#bcc2c8'),lid=mat('#d4d7d9'),dark=mat('#30343d'),orange=mat('#eea31e');
 function box(x,y,z,w,h,d,m,parent=root){const g=new BoxGeometry(w,h,d);resources.push(g);const mesh=new Mesh(g,m);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function cylinder(x,y,z,r,h,m,parent=root){
  const p=[],uv=[],idx=[],n=64;
  for(let j=0;j<2;j++)for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;p.push(Math.cos(a)*r,(j-.5)*h,Math.sin(a)*r);uv.push(.5+Math.cos(a)*.5,.5+Math.sin(a)*.5);}
  for(let i=0;i<n;i++){const a=i,b=i+n+1;idx.push(a,b,a+1,a+1,b,b+1);}
  for(const top of [false,true]){const center=p.length/3;p.push(0,(top?.5:-.5)*h,0);uv.push(.5,.5);const start=top?n+1:0;for(let i=0;i<n;i++)idx.push(center,start+(top?i+1:i),start+(top?i:i+1));}
  const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(new Float32Array(p),3));g.setAttribute('uv',new BufferAttribute(new Float32Array(uv),2));g.setIndex(idx);g.computeVertexNormals();resources.push(g);const mesh=new Mesh(g,m);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 cylinder(0,0,0,.14,.034,silver);cylinder(0,.019,-.008,.127,.012,lid);
 box(0,.02,.085,.15,.019,.065,silver);
 const screen=document.createElement('canvas');screen.width=512;screen.height=96;drawDiscmanDisplay(screen);
 const map=new CanvasTexture(screen);map.colorSpace=SRGB;resources.push(map);const screenMat=new Material({map,roughness:.6});materials.push(screenMat);
 const display=new Mesh(new PlaneGeometry(.13,.035),screenMat);resources.push(display.geometry);display.position.set(0,.031,.088);display.rotation.x=-Math.PI/2;display.userData.discmanScreen=true;root.add(display);
 const label=document.createElement('canvas');label.width=512;label.height=256;const c=label.getContext('2d');c.fillStyle='#d4d7d9';c.fillRect(0,0,512,256);c.textAlign='center';c.fillStyle='#68727c';c.font='bold 34px sans-serif';c.fillText('SONY',256,65);c.fillStyle='#b39660';c.font='italic bold 60px sans-serif';c.fillText('Discman',256,155);c.font='19px sans-serif';c.fillText('CD COMPACT PLAYER · ESP',256,196);
 const lm=new CanvasTexture(label);lm.colorSpace=SRGB;resources.push(lm);const labelMat=new Material({map:lm});materials.push(labelMat);const face=new Mesh(new PlaneGeometry(.16,.085),labelMat);resources.push(face.geometry);face.rotation.x=-Math.PI/2;face.position.set(0,.026,-.035);root.add(face);
 for(const [x,action] of [[-.085,'previous'],[.085,'next'],[.113,'toggle']]){
  const z=action==='toggle'?.065:.03,button=cylinder(x,.033,z,.014,.009,dark);button.userData.discmanAction=action;
  const icon=document.createElement('canvas');icon.width=128;icon.height=128;const c=icon.getContext('2d');c.fillStyle='#30343d';c.fillRect(0,0,128,128);c.fillStyle='#f4f1e8';c.font='bold 65px sans-serif';c.textAlign='center';c.fillText(action==='toggle'?'▶':action==='next'?'»':'«',64,86);const map=new CanvasTexture(icon);map.colorSpace=SRGB;resources.push(map);const m=new Material({map});materials.push(m);const surface=new Mesh(new PlaneGeometry(.021,.021),m);resources.push(surface.geometry);surface.rotation.x=-Math.PI/2;surface.position.set(x,.038,z);surface.userData.discmanAction=action;root.add(surface);
 }
 // Headband curves behind the player; orange earpads sit at either side.
 for(let i=0;i<32;i++){const a=Math.PI+i/31*Math.PI;const x=Math.cos(a)*.18,z=Math.sin(a)*.17;const band=box(x,.034,z,.022,.012,.012,dark);band.rotation.y=-a-Math.PI/2;}
 for(const sign of [-1,1]){cylinder(sign*.166,.025,.018,.035,.042,orange);box(sign*.166,.05,.018,.023,.014,.035,dark);}
 return {root,dispose(){for(const r of resources)r.dispose();for(const m of materials)m.dispose();}};
}
