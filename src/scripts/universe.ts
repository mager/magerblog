import { skyBodiesAt } from '../lib/solar-system';
import { onSkyDate } from '../lib/sky-date';

export function backdropBodiesAt(date: Date) {
  return skyBodiesAt(date).map(({ name, longitude, latitude }) => {
    const bearing = (longitude - 30) * Math.PI / 180;
    return {
      name,
      x: (50 + 47 * Math.cos(bearing)).toFixed(2) + 'vw',
      y: (52 - 34 * Math.sin(bearing) - 0.8 * latitude).toFixed(2) + 'dvh',
    };
  });
}

// A repeatable volume lets the reader fly through the same stars in both directions.
const range = 3.4;
const darkInks = ['#adb9ff', '#9989e5', '#dbe5fe', '#8cc9e6', '#e3ae93'];
const lightInks = ['#535d9c', '#796597', '#434d71', '#477d90', '#9a735e'];

function makeVolume() {
  let seed = 69471;
  const random = () => (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  return Array.from({ length: 1380 }, () => ({
    x: (random() - .5) * 4.6, y: (random() - .5) * 3.4, z: random() * range,
    light: .35 + random() * .65, ink: Math.floor(random() ** 1.7 * darkInks.length),
  }));
}
const volume = makeVolume();
const wrap = (n: number) => (n % range + range) % range;

function cameraAt(travel: number, width: number, height: number) {
  return {
    x: .14 * Math.sin(travel * .43), y: .095 * Math.sin(travel * .69), z: travel,
    cx: width * .62, cy: height * .40,
    fx: width * .85, fy: height * .96,
  };
}

interface Point { x: number; y: number; z: number; }
function project(point: Point, cam: ReturnType<typeof cameraAt>) {
  const z = .10 + wrap(point.z - cam.z);
  return { x: cam.cx + (point.x - cam.x) * cam.fx / z, y: cam.cy + (point.y - cam.y) * cam.fy / z, z };
}

export function staticFlightPaths() {
  const width = 1440, height = 900;
  const cam = cameraAt(0, width, height);
  const paths = darkInks.map(() => '');
  for (const star of volume) {
    const { x, y, z } = project(star, cam);
    if (x < 0 || x > width || y < 0 || y > height) continue;
    const tail = .009 / z;
    paths[star.ink] += `M${x.toFixed(1)} ${y.toFixed(1)}l${((cam.cx - x) * tail + .35).toFixed(1)} ${((cam.cy - y) * tail + .25).toFixed(1)}`;
  }
  return paths;
}

// Paint a small translucent dust cloud once. The camera projects copies of it
// at their own depths, so they pass at a different speed from the pinprick stars.
function dustTexture(light: boolean) {
  const tile = document.createElement('canvas');
  tile.width = 192; tile.height = 96;
  const ctx = tile.getContext('2d')!;
  let seed = 9163;
  const random = () => (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 380; i++) {
    const x = 18 + random() * 155;
    const t = (x - 18) / 155;
    const envelope = Math.sin(t * Math.PI);
    const y = 66 - 35 * t + 8 * Math.sin(7 * t) + (random() - .5) * 34 * envelope;
    const radius = (2 + random() * 15) * (.4 + .6 * envelope);
    const color = light ? '102,89,146' : i % 5 ? '115,103,187' : '179,128,164';
    const puff = ctx.createRadialGradient(x, y, 0, x, y, radius);
    puff.addColorStop(0, `rgba(${color},${.04 + random() * .08})`);
    puff.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = puff; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  return tile;
}

export function initUniverse() {
  const sky = document.querySelector<HTMLElement>('[data-space-sky]');
  const canvas = sky?.querySelector<HTMLCanvasElement>('[data-flight-canvas]');
  if (!sky || !canvas) return;
  const markers = new Map([...sky.querySelectorAll<HTMLElement>('[data-sky-body]')]
    .map(marker => [marker.dataset.skyBody, marker]));
  onSkyDate(({ iso }) => {
    const date = new Date(iso);
    if (!Number.isFinite(date.valueOf())) return;
    for (const { name, x, y } of backdropBodiesAt(date)) {
      const marker = markers.get(name);
      marker?.style.setProperty('--body-x', x);
      marker?.style.setProperty('--body-y', y);
    }
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const position = () => Math.max(0, window.scrollY) * .00135;
  const clouds = volume.slice(14, 30);
  const debris = volume.slice(40, 58);
  const silhouette = new Path2D('M-1-.22-.57-.72.16-.93.73-.56.98.05.55.66-.18.85-.84.46Z');
  const litFace = new Path2D('M-1-.22-.57-.72.16-.93.36-.51-.12-.08-.55.03Z');
  const ridge = new Path2D('M-.55.03-.12-.08.36-.51.73-.56.53-.06.19.29Z');
  let travel = position();
  let frame = 0;
  let previous = 0;
  let ratio = 1;
  let light = document.documentElement.dataset.theme === 'light';
  let dust = dustTexture(light);

  function paint(speed: number) {
    const surface = canvas!, pen = ctx!;
    const width = surface.width / ratio, height = surface.height / ratio;
    const cam = cameraAt(travel, width, height);
    pen.setTransform(ratio, 0, 0, ratio, 0, 0);
    pen.clearRect(0, 0, width, height);
    for (const cloud of clouds) {
      const { x, y, z } = project(cloud, cam);
      const span = Math.min(width * 1.8, width * 1.12 / z);
      if (x + span < 0 || x - span > width || y + span < 0 || y - span > height) continue;
      pen.globalAlpha = Math.min(.34, z * .21, (range + .1 - z) * .8);
      pen.drawImage(dust, x - span / 2, y - span / 4, span, span / 2);
    }
    const exposure = .012 + Math.min(.30, Math.abs(speed) * 65);
    const colors = light ? lightInks : darkInks;
    pen.lineCap = 'round';
    for (const star of volume) {
      const { x, y, z } = project(star, cam);
      if (x < -8 || y < -8 || x > width + 8 || y > height + 8) continue;
      const fade = Math.min(1, (range + .10 - z) * 2.4, (z - .10) * 8);
      const near = Math.min(1, .60 / z);
      pen.globalAlpha = fade * star.light * (.53 + near * .45);
      pen.strokeStyle = colors[star.ink];
      pen.lineWidth = .6 + near * 1.15;
      const direction = speed < -.00001 ? -1 : 1;
      const tail = direction * Math.min(.28, exposure / (z + exposure));
      // Trace back along the direction of travel. Stars streak inward when
      // approaching, and outward when the reader reverses the flight.
      pen.beginPath(); pen.moveTo(x, y);
      pen.lineTo(x + (cam.cx - x) * tail + .35, y + (cam.cy - y) * tail + .25);
      pen.stroke();
      if (star.light > .952 && z < 1.9) {
        const radius = 1.6 + near * 3.8;
        pen.lineWidth = .65; pen.beginPath();
        pen.moveTo(x - radius, y); pen.lineTo(x + radius, y);
        pen.moveTo(x, y - radius * 1.35); pen.lineTo(x, y + radius * 1.35); pen.stroke();
      }
    }
    for (const rock of debris) {
      const { x, y, z } = project(rock, cam);
      if (x < -24 || x > width + 24 || y < -24 || y > height + 24) continue;
      const edge = Math.max(Math.abs(x / width - .5) * 2, Math.abs(y / height - .5) * 1.6);
      const visibility = Math.min(1, Math.max(0, (edge - .65) * 4), (range + .1 - z) * 2);
      if (!visibility) continue;
      const radius = Math.min(19, (3 + 4 * rock.light) / z);
      pen.save(); pen.translate(x, y); pen.rotate(rock.x + travel * .15); pen.scale(radius, radius);
      pen.globalAlpha = visibility * .8;
      pen.fillStyle = light ? '#797589' : '#3b3b52'; pen.fill(silhouette);
      pen.fillStyle = rock.ink % 2 ? '#bab0bb' : '#baaa99'; pen.fill(litFace);
      pen.fillStyle = '#77758a'; pen.fill(ridge);
      pen.restore();
    }
    pen.globalAlpha = 1;
    sky!.dataset.flightReady = '';
  }
  function step(now: number) {
    frame = 0;
    if (motion.matches || document.hidden) return;
    const dt = Math.min(64, Math.max(1, now - previous)); previous = now;
    const gap = position() - travel;
    // History restoration and deep links select their position in one frame.
    if (Math.abs(gap) > 2 || Math.abs(gap) < .0004) { travel = position(); paint(0); return; }
    const move = gap * (1 - Math.exp(-dt / 68));
    travel += move; paint(move / dt);
    frame = requestAnimationFrame(step);
  }
  function schedule() {
    if (frame || motion.matches || document.hidden) return;
    previous = performance.now() - 16;
    frame = requestAnimationFrame(step);
  }
  function resize() {
    const width = canvas!.clientWidth, height = canvas!.clientHeight;
    ratio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2600000 / Math.max(1, width * height)));
    canvas!.width = Math.max(1, Math.round(width * ratio));
    canvas!.height = Math.max(1, Math.round(height * ratio));
    paint(0);
  }
  function syncMotion() {
    if (motion.matches || document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  }
  new ResizeObserver(resize).observe(canvas);
  new MutationObserver(() => {
    const next = document.documentElement.dataset.theme === 'light';
    if (next !== light) { light = next; dust = dustTexture(light); paint(0); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('scroll', schedule, { passive: true });
  document.addEventListener('visibilitychange', syncMotion);
  motion.addEventListener('change', syncMotion);
  resize();
}
