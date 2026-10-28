// "porta retrato" by 3dwstudio, CC BY 4.0. Original files and license in models/.
// Retain the supplied geometry and replace its sample photograph with our illustration.
export function createFamilyFrame(T,familyMap){
 const {Group,Material,Box3,Vector3}=T,root=new Group(),source=T.familyFrameScene,resources=new Set();
 root.name='Imported family portrait · 3dwstudio';root.userData.familyFrameModel='3dwstudio';
 source.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const original=mesh.geometry,geometry=original.index?original.toNonIndexed():original.clone();
  resources.add(original);resources.add(geometry);
  const uv=geometry.attributes.uv,position=geometry.attributes.position,frame=[],photo=[];
  // The supplied atlas reserves its upper-right island for the photograph.
  const isPhoto=i=>uv.getX(i)>.50&&uv.getX(i)<.87&&uv.getY(i)<.29;
  for(let i=0;i<position.count;i+=3)([i,i+1,i+2].every(isPhoto)?photo:frame).push(i,i+1,i+2);
  if(!photo.length)throw Error('Family frame photograph surface not found');
  let minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
  for(const i of photo){minY=Math.min(minY,position.getY(i));maxY=Math.max(maxY,position.getY(i));minZ=Math.min(minZ,position.getZ(i));maxZ=Math.max(maxZ,position.getZ(i));}
  // The original front faces +X; after the scene's up-axis transform, Y is width, Z height.
  for(const i of photo)uv.setXY(i,(position.getY(i)-minY)/(maxY-minY),(position.getZ(i)-minZ)/(maxZ-minZ));
  uv.needsUpdate=true;geometry.setIndex([...frame,...photo]);geometry.clearGroups();geometry.addGroup(0,frame.length,0);geometry.addGroup(frame.length,photo.length,1);
  const originalMaterial=mesh.material,portrait=new Material({map:familyMap,roughness:.9,metalness:0});
  resources.add(originalMaterial);resources.add(portrait);
  for(const value of Object.values(originalMaterial))if(value?.isTexture)resources.add(value);
  mesh.geometry=geometry;mesh.material=[originalMaterial,portrait];mesh.castShadow=true;mesh.receiveShadow=true;
 });
 source.updateMatrixWorld(true);
 const bounds=new Box3().setFromObject(source),center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3());
 const body=new Group();body.rotation.y=-Math.PI/2;body.scale.setScalar(.23/size.y);source.position.sub(center);body.add(source);root.add(body);
 return {root,dispose(){for(const resource of resources)resource.dispose();}};
}
