import { drawEarth } from '../lib/earth-globe';
import { onSkyDate } from '../lib/sky-date';

export function initEarthGlobe(globe: HTMLElement) {
  const canvas = globe.querySelector('canvas')!;
  const still = globe.querySelector('img')!;
  const context = canvas.getContext('2d');
  if (!context) return;

  let date = new Date(globe.dataset.date!);
  let visible = true;
  let frame = 0;
  let lastMinute: number | undefined;
  let texture: ImageData | undefined;

  function render() {
    frame = 0;
    const minute = Math.floor(date.valueOf() / 60000);
    if (!texture || !visible || document.hidden || lastMinute === minute) return;
    lastMinute = minute;
    const size = canvas.width;
    const pixels = drawEarth(date, size, { width: texture.width, height: texture.height, pixels: texture.data });
    context!.putImageData(new ImageData(pixels, size, size), 0, 0);
    still.alt = `Earth's sunlit hemisphere at ${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
    canvas.hidden = false;
    globe.setAttribute('data-painted', '');
  }
  function schedule() {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render);
  }
  onSkyDate(({ iso }) => {
    date = new Date(iso);
    schedule();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(globe);
  }
  document.addEventListener('visibilitychange', schedule);

  const map = new Image();
  map.onload = () => {
    const surface = document.createElement('canvas');
    surface.width = map.naturalWidth;
    surface.height = map.naturalHeight;
    const sampler = surface.getContext('2d');
    if (!sampler) return;
    sampler.drawImage(map, 0, 0);
    texture = sampler.getImageData(0, 0, surface.width, surface.height);
    schedule();
  };
  map.src = globe.dataset.texture!;
}
