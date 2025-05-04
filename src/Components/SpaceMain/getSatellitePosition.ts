import * as satellite from "satellite.js";

export function getSatPos(tle1: string, tle2: string) {
  const satrec = satellite.twoline2satrec(tle1, tle2);
  const now = new Date();
  const positionAndVelocity = satellite.propagate(satrec, now);

  // Check if the propagation was successful
  if (!positionAndVelocity || !positionAndVelocity.position) {
    console.error("Failed to get position from satellite propagation.");
    return { lat: 0, lon: 0 }; // Return default values or handle the error accordingly
  }

  const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, satellite.gstime(now));
  const lat = satellite.degreesLat(positionGd.latitude);
  const lon = satellite.degreesLong(positionGd.longitude);

  return { lat, lon };
}
