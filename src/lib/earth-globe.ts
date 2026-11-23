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
  // One observed night-light intensity byte per surface texel.
  lights?: Uint8ClampedArray | Uint8Array;
}

// North-up orthographic view of North America, close to Chicago. The map and
// surface normals stay fixed; only the direction of the sunlight changes.
const viewLatitude = 35 * rad;
const viewLongitude = -90 * rad;
const north = Math.sin(viewLatitude);
const forward = Math.cos(viewLatitude);

interface Projection {
  size: number;
  width: number;
  height: number;
  offsets: Uint32Array;
  depth: Float32Array;
  limb: Float32Array;
}

let previousProjection: Projection | undefined;
function sphereProjection(size: number, width: number, height: number) {
  if (previousProjection?.size === size && previousProjection.width === width && previousProjection.height === height) {
    return previousProjection;
  }
  const count = size * size;
  const offsets = new Uint32Array(count);
  const depth = new Float32Array(count);
  const limb = new Float32Array(count);
  const radius = size * .474;
  for (let row = 0; row < size; row++) {
    const y = (size / 2 - row - .5) / radius;
    for (let col = 0; col < size; col++) {
      const x = (col + .5 - size / 2) / radius;
      const r2 = x * x + y * y;
      if (r2 > 1) continue;
      const z = Math.sqrt(1 - r2);
      const longitude = viewLongitude + Math.atan2(x, z * forward - y * north);
      const latitude = Math.asin(y * forward + z * north);
      const u = Math.floor(((longitude / turn + 1.5) % 1) * width);
      const v = Math.min(height - 1, Math.floor((.5 - latitude / Math.PI) * height));
      const pixel = row * size + col;
      offsets[pixel] = (v * width + u) * 4;
      depth[pixel] = z;
      limb[pixel] = Math.pow(1 - z, 3.6);
    }
  }
  previousProjection = { size, width, height, offsets, depth, limb };
  return previousProjection;
}

function smoothstep(low: number, high: number, value: number) {
  const weight = Math.min(1, Math.max(0, (value - low) / (high - low)));
  return weight * weight * (3 - 2 * weight);
}

export function drawEarth(date: Date, size: number, texture: Texture) {
  const result = new Uint8ClampedArray(size * size * 4);
  const { offsets, depth, limb } = sphereProjection(size, texture.width, texture.height);
  const sun = subsolarPoint(date);
  const latitude = sun.latitude * rad;
  const delta = sun.longitude * rad - viewLongitude;
  const sunX = Math.cos(latitude) * Math.sin(delta);
  const sunY = Math.sin(latitude) * forward - Math.cos(latitude) * Math.cos(delta) * north;
  const sunZ = Math.sin(latitude) * north + Math.cos(latitude) * Math.cos(delta) * forward;
  const radius = size * .474;
  const nauticalTwilight = Math.sin(-12 * rad);
  const civilTwilight = Math.sin(-6 * rad);

  for (let row = 0; row < size; row++) {
    const y = (size / 2 - row - .5) / radius;
    for (let col = 0; col < size; col++) {
      const x = (col + .5 - size / 2) / radius;
      const r2 = x * x + y * y;
      const pixel = row * size + col;
      const index = pixel * 4;
      const radialSun = x * sunX + y * sunY;
      if (r2 > 1) {
        if (r2 >= 1.065) continue;
        const rimLight = .055 + .945 * smoothstep(nauticalTwilight, .6, radialSun);
        const alpha = Math.exp(-(Math.sqrt(r2) - 1) * 145) * rimLight;
        result.set([119, 192, 238, Math.round(120 * alpha)], index);
        continue;
      }
      // The dot product is the sine of solar elevation at this surface point.
      const elevation = radialSun + depth[pixel] * sunZ;
      const sunlit = Math.sqrt(Math.max(0, elevation));
      const twilight = smoothstep(nauticalTwilight, 0, elevation);
      const shade = .07 + .14 * twilight + .83 * sunlit;
      const air = limb[pixel] * (.055 + .33 * twilight + .56 * sunlit);
      const sample = offsets[pixel];
      const afterDark = 1 - smoothstep(civilTwilight, 0, elevation);
      const lights = (texture.lights?.[sample / 4] ?? 0) * afterDark;
      result[index] = texture.pixels[sample] * shade + 2 + air * 82 + lights;
      result[index + 1] = texture.pixels[sample + 1] * shade + 4 + air * 123 + lights * .82;
      result[index + 2] = texture.pixels[sample + 2] * shade + 9 + air * 159 + lights * .58;
      result[index + 3] = 255;
    }
  }
  return result;
}
