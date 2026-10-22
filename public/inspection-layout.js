// Fit the object's rotation envelope inside the viewport, reserving its side actions.
export function inspectionLayout({width,height,actionsWidth,radius,fov=38,padding=24}){
 const reserved=actionsWidth+32,tangent=Math.tan(fov*Math.PI/360);
 const vertical=tangent*Math.max(.1,(height-2*padding)/height);
 const horizontal=tangent*Math.max(.1,(width-reserved-2*padding)/height);
 const shift=tangent*reserved/height;
 // The horizontal bound also accounts for the off-center camera's perspective.
 const distance=Math.max(6.2,radius*Math.hypot(1,vertical)/vertical,radius*Math.hypot(1,horizontal+shift)/horizontal);
 return {distance,offsetX:distance*shift};
}
