import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectionLayout} from './public/inspection-layout.js';

test('rotatable inspection volumes stay inside landscape and portrait safe areas, away from side actions',()=>{
 for(const [width,height] of [[844,390],[667,375],[568,320],[390,844],[1440,1000]]){
  const actionsWidth=Math.max(96,Math.min(144,width*.18)),padding=24,tangent=Math.tan(38*Math.PI/360);
  for(const radius of [1.7,2.05,2.3]){
   const {distance,offsetX}=inspectionLayout({width,height,actionsWidth,radius,padding});
   // Sample the complete rotation envelope, including points toward the camera.
   for(let latitude=-90;latitude<=90;latitude+=10)for(let longitude=0;longitude<360;longitude+=10){
    const a=latitude*Math.PI/180,b=longitude*Math.PI/180,x=radius*Math.cos(a)*Math.cos(b),y=radius*Math.sin(a),z=radius*Math.cos(a)*Math.sin(b);
    const px=width/2+(x-offsetX)/(distance-z)*height/(2*tangent),py=height/2-y/(distance-z)*height/(2*tangent);
    assert(px>=padding-.01&&px<=width-actionsWidth-32-padding+.01,`Horizontal clipping at ${width}x${height}`);
    assert(py>=padding-.01&&py<=height-padding+.01,`Vertical clipping at ${width}x${height}`);
   }
  }
 }
});
