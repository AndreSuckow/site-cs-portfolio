// "porta retrato" by 3dwstudio, CC BY 4.0. Original files and license in models/portrait/.
// Preserve the author's geometry, UVs and complete texture, including the sample photo.
export function createFamilyFrame(T){
 const {Group,Box3,Vector3}=T,root=new Group(),source=T.familyFrameScene,resources=new Set();
 root.name='Imported family portrait · 3dwstudio';root.userData.familyFrameModel='3dwstudio';
 source.traverse(mesh=>{
  if(!mesh.isMesh)return;
  resources.add(mesh.geometry);
  for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
   resources.add(material);for(const value of Object.values(material))if(value?.isTexture)resources.add(value);
  }
  mesh.castShadow=true;mesh.receiveShadow=true;
 });
 source.updateMatrixWorld(true);
 const bounds=new Box3().setFromObject(source),center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3());
 const body=new Group();body.rotation.y=-Math.PI/2;body.scale.setScalar(.23/size.y);source.position.sub(center);body.add(source);root.add(body);
 return {root,dispose(){for(const resource of resources)resource.dispose();}};
}
