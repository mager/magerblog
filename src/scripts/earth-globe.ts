import { drawEarth } from '../lib/earth-globe';
import { earthDescription, onSkyDate, type SkyTimeSource } from '../lib/sky-date';

export function initEarthGlobe(globe: HTMLElement) {
  const canvas = globe.querySelector('canvas')!;
  const still = globe.querySelector('img')!;
  const context = canvas.getContext('2d');
  if (!context) return;

  let date = new Date(globe.dataset.date!);
  let source: SkyTimeSource = 'live';
  let visible = true;
  let frame = 0;
  let lastInstant: number | undefined;
  let texture: ImageData | undefined;
  let lights: Uint8Array | undefined;

  function render() {
    frame = 0;
    if (!texture || !visible || document.hidden) return;
    const width = globe.clientWidth;
    if (!width) return;
    const size = Math.min(320, Math.ceil(width * Math.min(window.devicePixelRatio || 1, 2)));
    still.alt = earthDescription(date, source);
    if (canvas.width === size && lastInstant === date.valueOf()) return;
    lastInstant = date.valueOf();
    if (canvas.width !== size) {
      canvas.width = size;
      canvas.height = size;
    }
    const pixels = drawEarth(date, size, {
      width: texture.width, height: texture.height, pixels: texture.data, lights,
    });
    context!.putImageData(new ImageData(pixels, size, size), 0, 0);
    canvas.hidden = false;
    globe.setAttribute('data-painted', '');
  }
  function schedule() {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render);
  }
  onSkyDate(selection => {
    date = new Date(selection.iso);
    source = selection.source;
    schedule();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(globe);
  }
  new ResizeObserver(schedule).observe(globe);
  document.addEventListener('visibilitychange', schedule);

  async function loadMap(path: string) {
    const map = new Image();
    map.src = path;
    await map.decode();
    const surface = document.createElement('canvas');
    surface.width = map.naturalWidth;
    surface.height = map.naturalHeight;
    const sampler = surface.getContext('2d');
    if (!sampler) return;
    sampler.drawImage(map, 0, 0);
    return sampler.getImageData(0, 0, surface.width, surface.height);
  }
  Promise.all([loadMap(globe.dataset.texture!), loadMap(globe.dataset.lights!).catch(() => undefined)]).then(([surface, night]) => {
    texture = surface;
    if (night && surface && night.width === surface.width && night.height === surface.height) {
      lights = new Uint8Array(night.width * night.height);
      for (let i = 0; i < lights.length; i++) lights[i] = night.data[i * 4];
    }
    schedule();
  }).catch(() => { /* The UTC-stamped build image stays visible. */ });
}
