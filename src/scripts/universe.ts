import { skyBodiesAt } from '../lib/solar-system';
import { onSkyDate } from '../lib/sky-date';

// Project the ecliptic onto an oval around the reading column. Angular order
// follows the sky from Earth; display sizes and radii are illustrative.
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

export function initUniverse() {
  const sky = document.querySelector<HTMLElement>('[data-space-sky]');
  if (!sky) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const markers = new Map([...sky.querySelectorAll<HTMLElement>('[data-sky-body]')]
    .map(marker => [marker.dataset.skyBody, marker]));
  let frame = 0;
  const paused = () => motion.matches || document.documentElement.dataset.spaceMotion === 'paused';

  // Render only on input. A long archive never needs an idle animation loop.
  const update = () => {
    frame = 0;
    if (paused() || document.hidden) return;
    const distance = Math.max(0, window.scrollY);
    const depth = Math.log1p(distance / 700);
    sky.style.setProperty('--space-far', `${-depth * 2.5}px`);
    sky.style.setProperty('--space-near', `${-depth * 11}px`);
  };
  const schedule = () => {
    if (!frame && !paused() && !document.hidden) frame = requestAnimationFrame(update);
  };
  onSkyDate(({ iso }) => {
    const time = Date.parse(iso);
    if (!Number.isFinite(time)) return;
    for (const { name, x, y } of backdropBodiesAt(new Date(time))) {
      const marker = markers.get(name);
      marker?.style.setProperty('--body-x', x);
      marker?.style.setProperty('--body-y', y);
    }
    schedule();
  });
  window.addEventListener('scroll', schedule, { passive: true });
  document.addEventListener('timeline:motion', schedule);
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', schedule);
  schedule();
}
