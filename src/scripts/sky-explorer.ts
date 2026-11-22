import { skyBodiesAt } from '../lib/solar-system';
import { onSkyDate, skyDateLabel } from '../lib/sky-date';

type Vector = [number, number, number];
type Landmark = { name: string; direction: Vector; color: string; size: number };

const radians = Math.PI / 180;
const turn = 2 * Math.PI;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function direction(longitude: number, latitude: number): Vector {
  return [Math.cos(longitude) * Math.cos(latitude), Math.sin(longitude) * Math.cos(latitude), Math.sin(latitude)];
}

// J2000 equatorial to galactic rotation, ESA Gaia DR3 documentation, Eq. 4.62.
// https://gea.esac.esa.int/archive/documentation/GDR3/Data_processing/chap_cu3ast/sec_cu3ast_intro/ssec_cu3ast_intro_tansforms.html
const galacticAxes: [Vector, Vector, Vector] = [
  [-0.05487556, -0.87343709, -0.48383502],
  [0.49410943, -0.44482963, 0.74698224],
  [-0.86766615, -0.19807637, 0.45598378],
];
function toGalactic(v: Vector): Vector {
  return [dot(galacticAxes[0], v), dot(galacticAxes[1], v), dot(galacticAxes[2], v)];
}

// Rounded J2000 equatorial coordinates (degrees), from the CDS SIMBAD entries
// for Sirius, Capella, Vega, Altair and Antares: https://simbad.cds.unistra.fr/
const starCatalog: [string, number, number, string][] = [
  ['Sirius', 101.2872, -16.7161, '#e3ebff'],
  ['Capella', 79.1723, 45.998, '#f6d6a6'],
  ['Vega', 279.2347, 38.7837, '#b3ccff'],
  ['Altair', 297.6958, 8.8683, '#dae6ff'],
  ['Antares', 247.3519, -26.432, '#ffba8d'],
];
const brightStars: Landmark[] = starCatalog.map(([name, ra, dec, color]) => ({
  name, direction: direction(ra * radians, dec * radians), color, size: 2.1,
}));
const galacticCenter: Landmark = { name: 'Galactic center', direction: galacticAxes[0], color: '#f1d3a0', size: 0 };
const bodyStyles: Record<string, [string, number]> = {
  Sun: ['#ffca74', 10], Mercury: ['#c7bfb6', 3], Venus: ['#f5d19f', 5],
  Mars: ['#ec9e83', 4], Jupiter: ['#e2bd9c', 7], Saturn: ['#ebd298', 6],
  Uranus: ['#94d0d9', 4], Neptune: ['#8eaaf2', 4],
};

function bodiesAt(date: Date): Landmark[] {
  const tilt = 23.43928 * radians;
  return skyBodiesAt(date).map(({ name, longitude, latitude }) => {
    const [x, y, z] = direction(longitude * radians, latitude * radians);
    const [color, size] = bodyStyles[name];
    return { name, direction: [x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)], color, size };
  });
}

function makeSkyField() {
  // Decorative stars and dust use a fixed seed so they stay in place when the date changes.
  let seed = 0x24681fa;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const stars = Array.from({ length: 17000 }, (_, i) => {
    const lon = turn * random();
    const lat = i < 7300 ? Math.asin(2 * random() - 1) : (random() + random() + random() - 1.5) * 0.29;
    const light = random() ** 2.8;
    const tone = random();
    const r = Math.round(67 + light * 177);
    const g = Math.round(75 + light * (tone < 0.15 ? 116 : 164));
    const b = Math.round(94 + light * (tone < 0.15 ? 65 : 157));
    return { position: direction(lon, lat), size: 0.5 + light * (i < 7300 ? 1.35 : 0.7), color: `rgb(${r} ${g} ${b})` };
  });

  // Bake a seamless galactic panorama once. The cloud layers and the central
  // dust lane share the same galactic latitude as the dense field of stars.
  const lattice = Float32Array.from({ length: 256 * 256 }, random);
  const noise = (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const row = (row: number) => {
      const a = lattice[(row & 255) * 256 + (ix & 255)];
      const b = lattice[(row & 255) * 256 + ((ix + 1) & 255)];
      return a + (b - a) * u;
    };
    const a = row(iy);
    return a + (row(iy + 1) - a) * v;
  };
  const width = 1024, height = 384;
  const dust = new Uint8Array(width * height * 3);
  for (let x = 0; x < width; x++) {
    const longitude = x / width * turn;
    // Sampling on a circle avoids a seam at longitude zero in every octave.
    const nx = 28 + 5 * Math.cos(longitude), ny = 24 + 5 * Math.sin(longitude);
    const bulge = Math.exp(-6.5 * (1 - Math.cos(longitude)));
    for (let y = 0; y < height; y++) {
      const b = (y / (height - 1) - 0.5) * Math.PI;
      const grain = noise(nx * 38 + b * 125, ny * 38 - b * 45);
      const broad = noise(nx + b * 3, ny - b * 7);
      const cloud = 0.47 * broad + 0.29 * noise(nx * 3 + b * 16, ny * 3 - b * 7)
        + 0.16 * noise(nx * 11 - b * 42, ny * 11 + b * 18) + 0.08 * grain;
      const latitude = b + (broad - 0.5) * 0.12;
      const band = Math.exp(-((latitude / (0.17 + bulge * 0.11)) ** 2));
      const glow = Math.exp(-((latitude / 0.37) ** 2));
      const lane = Math.exp(-(((latitude + 0.03 + (cloud - 0.5) * 0.14) / 0.036) ** 2));
      const light = band * clamp((cloud - 0.28) * 2.7, 0, 1.5) * (1 - lane * 0.83);
      const offset = (y * width + x) * 3;
      dust[offset] = 5 + glow * 12 + light * (42 + 76 * bulge);
      dust[offset + 1] = 8 + glow * 11 + light * (42 + 51 * bulge);
      dust[offset + 2] = 16 + glow * 21 + light * (59 + 30 * bulge);
    }
  }
  return { stars, dust, width, height };
}

export function initSkyExplorer(dialog: HTMLDialogElement) {
  const canvas = dialog.querySelector<HTMLCanvasElement>('[data-sky-canvas]')!;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx || typeof dialog.showModal !== 'function') return;
  const background = document.createElement('canvas');
  const bg = background.getContext('2d', { alpha: false })!;
  const time = dialog.querySelector<HTMLTimeElement>('[data-sky-date]')!;
  const visible = dialog.querySelector<HTMLElement>('#sky-visible')!;
  const find = dialog.querySelector<HTMLSelectElement>('[data-sky-find]')!;
  let field: ReturnType<typeof makeSkyField> | undefined;
  let bgPixels: ImageData;
  let date = new Date(dialog.dataset.date!);
  let bodies = bodiesAt(date);
  let ra = 269 * radians, dec = -22 * radians;
  let width = 1, height = 1, focal = 1, ratio = 1;
  let frame = 0, opener: HTMLElement | null = null;

  function render() {
    frame = 0;
    if (!dialog.open || !field || !ctx) return;
    // Observer at the sphere's center: increasing RA is left with north up.
    const forward = toGalactic(direction(ra, dec));
    const right = toGalactic([Math.sin(ra), -Math.cos(ra), 0]);
    const up = toGalactic(direction(ra, dec + Math.PI / 2));
    const { width: tw, height: th, dust } = field;
    const bw = background.width, bh = background.height;
    const pixels = bgPixels.data;
    const dx = width / (focal * bw);
    let offset = 0;
    for (let y = 0; y < bh; y++) {
      const dy = (0.5 - (y + 0.5) / bh) * height / focal;
      const left = (0.5 - bw / 2) * dx;
      let vx = forward[0] + right[0] * left + up[0] * dy;
      let vy = forward[1] + right[1] * left + up[1] * dy;
      let vz = forward[2] + right[2] * left + up[2] * dy;
      for (let x = 0; x < bw; x++) {
        const lon = Math.atan2(vy, vx);
        const lat = Math.asin(clamp(vz / Math.sqrt(vx * vx + vy * vy + vz * vz), -1, 1));
        const u = Math.floor((lon / turn + 1) * tw) % tw;
        const v = Math.round((lat / Math.PI + 0.5) * (th - 1));
        const source = (v * tw + u) * 3;
        pixels[offset++] = dust[source]; pixels[offset++] = dust[source + 1];
        pixels[offset++] = dust[source + 2]; pixels[offset++] = 255;
        vx += right[0] * dx; vy += right[1] * dx; vz += right[2] * dx;
      }
    }
    bg.putImageData(bgPixels, 0, 0);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.drawImage(background, 0, 0, width, height);
    function project(v: Vector) {
      const z = dot(v, forward);
      if (z <= 0.06) return;
      const x = width / 2 + focal * dot(v, right) / z;
      const y = height / 2 - focal * dot(v, up) / z;
      return x >= -4 && x <= width + 4 && y >= -4 && y <= height + 4 ? { x, y } : undefined;
    }
    for (const star of field.stars) {
      const point = project(star.position);
      if (!point) continue;
      ctx.fillStyle = star.color;
      ctx.fillRect(point.x, point.y, star.size, star.size);
    }
    const names: string[] = [];
    const boxes: {x: number; y: number; w: number}[] = [];
    ctx.font = '13px system-ui, sans-serif';
    for (const mark of [...bodies, galacticCenter, ...brightStars]) {
      const pt = project(toGalactic(mark.direction));
      if (!pt) continue;
      names.push(mark.name);
      const { x, y } = pt;
      ctx.fillStyle = mark.color;
      ctx.strokeStyle = mark.color;
      ctx.lineWidth = 1;
      if (mark.size) {
        ctx.beginPath(); ctx.arc(x, y, mark.size, 0, turn); ctx.fill();
        if (mark.name === 'Saturn') {
          ctx.beginPath(); ctx.ellipse(x, y, mark.size * 1.8, mark.size * 0.45, -0.4, 0, turn); ctx.stroke();
        }
        if (mark.name === 'Sun') {
          const glow = ctx.createRadialGradient(x, y, 7, x, y, 46);
          glow.addColorStop(0, '#ffc77988'); glow.addColorStop(1, '#ffad4e00'); ctx.fillStyle = glow;
          ctx.fillRect(x - 46, y - 46, 92, 92);
        }
      } else {
        ctx.beginPath(); ctx.arc(x, y, 5, 0, turn); ctx.stroke();
      }
      const w = ctx.measureText(mark.name).width;
      const labelX = clamp(x + Math.max(10, mark.size + 5), 5, width - w - 5);
      let labelY = y - 3;
      while (boxes.some(box => Math.abs(box.y - labelY) < 16 && labelX < box.x + box.w + 4 && labelX + w + 4 > box.x)) labelY += 17;
      boxes.push({ x: labelX, y: labelY, w });
      if (labelY > y + 10) {
        ctx.strokeStyle = '#b8ad98';
        ctx.beginPath(); ctx.moveTo(x, y + mark.size + 2); ctx.lineTo(labelX - 3, labelY - 3); ctx.stroke();
      }
      ctx.lineWidth = 3; ctx.strokeStyle = '#080c15'; ctx.strokeText(mark.name, labelX, labelY);
      ctx.fillStyle = '#f3e9d8'; ctx.fillText(mark.name, labelX, labelY);
    }
    visible.textContent = names.length ? `In view: ${names.join(', ')}.` : 'Illustrated star field.';
  }
  function requestRender() {
    if (dialog.open && !frame) frame = requestAnimationFrame(render);
  }
  function resize() {
    if (!dialog.open) return;
    width = Math.max(1, canvas.clientWidth); height = Math.max(1, canvas.clientHeight);
    ratio = Math.min(devicePixelRatio || 1, 1.75, 2400 / Math.max(width, height));
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    focal = Math.min(width, height) * 0.83;
    const scale = Math.min(0.5, 540 / Math.max(width, height));
    background.width = Math.max(1, Math.round(width * scale));
    background.height = Math.max(1, Math.round(height * scale));
    bgPixels = bg.createImageData(background.width, background.height);
    requestRender();
  }
  function pan(horizontal: number, vertical: number) {
    ra = (ra + horizontal + turn) % turn;
    dec = clamp(dec + vertical, -Math.PI / 2, Math.PI / 2);
    find.selectedIndex = 0;
    requestRender();
  }
  dialog.querySelectorAll<HTMLButtonElement>('[data-sky-pan]').forEach(button =>
    button.addEventListener('click', () => pan(-Number(button.dataset.skyPan) * 22 * radians, 0)));
  dialog.addEventListener('keydown', event => {
    if (event.target === find) return;
    const steps: Record<string, [number, number]> = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if (!Object.hasOwn(steps, event.key)) return;
    event.preventDefault();
    const [x, y] = steps[event.key]; pan(x * 10 * radians, y * 10 * radians);
  });
  find.addEventListener('change', () => {
    const target = [...bodies, galacticCenter].find(body => body.name === find.value);
    if (!target) return;
    const [x, y, z] = target.direction; ra = Math.atan2(y, x); dec = Math.asin(z);
    requestRender();
  });
  let drag: { id: number; x: number; y: number } | undefined;
  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    pan((event.clientX - drag.x) / focal, (event.clientY - drag.y) / focal);
    drag.x = event.clientX; drag.y = event.clientY;
  });
  canvas.addEventListener('lostpointercapture', () => { drag = undefined; });
  onSkyDate(({ iso, live }) => {
    date = new Date(iso);
    time.dateTime = iso;
    time.textContent = skyDateLabel(date, live);
    bodies = bodiesAt(date);
    if (find.value) find.dispatchEvent(new Event('change'));
    requestRender();
  });
  new ResizeObserver(resize).observe(dialog);
  document.querySelectorAll<HTMLButtonElement>('[data-explore-sky]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      opener = button; dialog.showModal();
      field ??= makeSkyField();
      resize();
    });
  });
  dialog.addEventListener('close', () => {
    cancelAnimationFrame(frame); frame = 0; drag = undefined;
    opener?.focus({ preventScroll: true });
  });
}
