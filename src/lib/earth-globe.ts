const rad = Math.PI / 180;
const turn = Math.PI * 2;

// Solar coordinates and Greenwich sidereal time, U.S. Naval Observatory:
// https://aa.usno.navy.mil/faq/sun_approx and https://aa.usno.navy.mil/faq/GAST
export function subsolarPoint(date: Date) {
  const days = (date.valueOf() - Date.UTC(2000, 0, 1, 12)) / 86400000;
  const anomaly = (357.529 + .98560028 * days) * rad;
  const ecliptic = (280.459 + .98564736 * days + 1.915 * Math.sin(anomaly) + .020 * Math.sin(2 * anomaly)) * rad;
  const obliquity = (23.439 - .00000036 * days) * rad;
  const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(ecliptic), Math.cos(ecliptic)) / rad;
  const greenwich = (280.46061837 + 360.98564736629 * days) % 360;
  return {
    longitude: ((rightAscension - greenwich + 900) % 360) - 180,
    latitude: Math.asin(Math.sin(obliquity) * Math.sin(ecliptic)) / rad,
  };
}

interface Texture {
  width: number;
  height: number;
  pixels: Uint8ClampedArray | Uint8Array;
}

// This ordered pattern gives the globe a fine print texture at any device scale.
const dither = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export function drawEarth(date: Date, size: number, texture: Texture) {
  const result = new Uint8ClampedArray(size * size * 4);
  const sun = subsolarPoint(date);
  // Observe from 54° east of solar noon to keep both the lit face and dusk in view.
  const viewLongitude = (sun.longitude + 54) * rad;
  const viewLatitude = 19 * rad;
  const north = Math.sin(viewLatitude), forward = Math.cos(viewLatitude);
  const sunLatitude = sun.latitude * rad, sunRelativeLongitude = -54 * rad;
  const sunX = Math.cos(sunLatitude) * Math.sin(sunRelativeLongitude);
  const sunY = Math.sin(sunLatitude) * forward - Math.cos(sunLatitude) * Math.cos(sunRelativeLongitude) * north;
  const sunZ = Math.sin(sunLatitude) * north + Math.cos(sunLatitude) * Math.cos(sunRelativeLongitude) * forward;
  const radius = size * .474;

  for (let row = 0; row < size; row++) {
    const y = (size / 2 - row - .5) / radius;
    for (let col = 0; col < size; col++) {
      const x = (col + .5 - size / 2) / radius;
      const r2 = x * x + y * y;
      const index = (row * size + col) * 4;
      if (r2 > 1) {
        if (r2 >= 1.09) continue;
        const rimLight = Math.max(0, .5 + .5 * (x * sunX + y * sunY));
        const alpha = Math.exp(-(Math.sqrt(r2) - 1) * 115) * rimLight;
        result.set([107, 199, 253, Math.round(165 * alpha)], index);
        continue;
      }
      const z = Math.sqrt(1 - r2);
      const latitude = Math.asin(y * forward + z * north);
      const longitude = viewLongitude + Math.atan2(x, z * forward - y * north);
      const u = Math.floor(((longitude / turn + 1.5) % 1) * texture.width);
      const v = Math.min(texture.height - 1, Math.floor((.5 - latitude / Math.PI) * texture.height));
      const sample = (v * texture.width + u) * 4;
      const incidence = x * sunX + y * sunY + z * sunZ;
      const day = Math.max(0, incidence);
      const shade = .095 + Math.pow(day, .48) * .98;
      const air = Math.pow(1 - z, 3.6) * (.15 + .85 * Math.max(0, .38 + incidence));
      const dusk = Math.max(0, 1 - Math.abs(incidence + .005) / .09) * .55;
      const grain = dither[(row % 4) * 4 + col % 4] / 15 - .5;
      const stipple = day * .45 + .55;
      result[index] = texture.pixels[sample] * shade + 5 + air * 79 + dusk * 8 + grain * 6 * stipple;
      result[index + 1] = texture.pixels[sample + 1] * shade + 6 + air * 117 + dusk * 3 + grain * 8 * stipple;
      result[index + 2] = texture.pixels[sample + 2] * shade + 16 + air * 155 + grain * 11 * stipple;
      result[index + 3] = 255;
    }
  }
  return result;
}
