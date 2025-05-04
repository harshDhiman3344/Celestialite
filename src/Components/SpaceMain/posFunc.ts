import * as THREE from 'three';
function positionf(lat: number, lon: number, radius: number) {
    const latRad = THREE.MathUtils.degToRad(lat);
    const lonRad = THREE.MathUtils.degToRad(-lon-180); // shift to align with texture
  
    const x = radius * Math.cos(latRad) * Math.cos(lonRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lonRad);
  
    return [x, y, z];
  }
  
export { positionf };