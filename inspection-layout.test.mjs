import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectionLayout,inspectionPointFrame,inspectionZoom,clampInspectionZoom} from './public/inspection-layout.js';

test('rotatable inspection volumes stay inside landscape and portrait safe areas, away from side actions',()=>{
 for(const [width,height] of [[844,390],[667,375],[568,320],[390,844],[1440,1000]]){
  const actionsWidth=Math.max(96,Math.min(144,width*.18)),padding=24,tangent=Math.tan(38*Math.PI/360);
  for(const radius of [1.7,2.05,2.3]){
   const {distance,offsetX}=inspectionLayout({width,height,actionsWidth,radius,padding});
   // Sample the complete rotation envelope, including points toward the camera.
   for(const zoom of [inspectionZoom.min,inspectionZoom.initial,inspectionZoom.max])for(let latitude=-90;latitude<=90;latitude+=10)for(let longitude=0;longitude<360;longitude+=10){
    const a=latitude*Math.PI/180,b=longitude*Math.PI/180,x=radius*Math.cos(a)*Math.cos(b),y=radius*Math.sin(a),z=radius*Math.cos(a)*Math.sin(b);
    const px=width/2+(x-offsetX/zoom)/(distance-z)*height*zoom/(2*tangent),py=height/2-y/(distance-z)*height*zoom/(2*tangent);
    assert(px>=padding-.01&&px<=width-actionsWidth-32-padding+.01,`Horizontal clipping at ${width}x${height}`);
    assert(py>=padding-.01&&py<=height-padding+.01,`Vertical clipping at ${width}x${height}`);
   }
  }
 }
});

test('all zoom inputs share bounded limits with room to enlarge from the opening size',()=>{
 assert(inspectionZoom.min<inspectionZoom.initial&&inspectionZoom.initial<inspectionZoom.max);
 assert.equal(clampInspectionZoom(100),inspectionZoom.max);
 assert.equal(clampInspectionZoom(.001),inspectionZoom.min);
 assert.equal(clampInspectionZoom(inspectionZoom.initial),inspectionZoom.initial);
});

test('close Discman framing keeps rotated bounding boxes inside its canvas at maximum zoom',()=>{
 for(const [width,height] of [[1200,708],[1612,505],[388,116],[210,640]])for(const size of [[1.65,1.4,.7],[1.2,1.8,1.1],[1.8,1.1,1.6]]){
  const points=[];for(const x of [-size[0],size[0]])for(const y of [-size[1],size[1]])for(const z of [-size[2],size[2]])points.push({x:x+.3,y:y+.5,z});
  const {distance,viewOffsetX,viewOffsetY}=inspectionPointFrame({width,height,points}),tangent=Math.tan(38*Math.PI/360);
  for(const zoom of [.55,.95,1])for(const {x,y,z} of points){
   const px=width/2+x/(distance-z)*height*zoom/(2*tangent)-viewOffsetX*zoom,py=height/2-y/(distance-z)*height*zoom/(2*tangent)-viewOffsetY*zoom;
   assert(px>=23.99&&px<=width-23.99);assert(py>=23.99&&py<=height-23.99);
  }
 }
});
