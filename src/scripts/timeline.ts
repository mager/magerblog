import { entryDate } from '../lib/publication-date';
import { publishSkyDate } from '../lib/sky-date';

const timeline = document.querySelector<HTMLElement>('[data-timeline]');

if (timeline) {
  const list = timeline.querySelector<HTMLOListElement>('#simple-list')!;
  const header = document.querySelector<HTMLElement>('.site-header')!;
  const clock = document.querySelector<HTMLTimeElement>('[data-earth-clock]');
  const controls = timeline.querySelector<HTMLButtonElement>('[data-space-motion-toggle]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused = false;
  let rows: HTMLElement[] = [];
  let current: HTMLElement | undefined;
  let frame = 0;
  let liveMinute = -1;
  let clockTimer: number | undefined;

  function syncMotion() {
    document.documentElement.dataset.spaceMotion = reduceMotion.matches || manuallyPaused ? 'paused' : 'playing';
    if (controls) {
      controls.hidden = reduceMotion.matches;
      const action = manuallyPaused ? 'Resume motion' : 'Pause motion';
      controls.setAttribute('aria-label', action);
      controls.title = action;
    }
    document.dispatchEvent(new Event('timeline:motion'));
  }

  function stopClockTimer() {
    window.clearTimeout(clockTimer);
    clockTimer = undefined;
  }

  function updateSky(date: Date, live: boolean) {
    const iso = date.toISOString();
    if (clock) {
      clock.dateTime = iso;
      clock.textContent = live ? iso.slice(11, 16) + ' UTC' : entryDate(date);
      clock.title = date.toUTCString();
    }
    publishSkyDate({ iso, live });
  }

  function updateLiveClock() {
    if (document.hidden) return;
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    if (minute !== liveMinute) {
      liveMinute = minute;
      updateSky(new Date(now), true);
    }
    if (clockTimer === undefined) {
      clockTimer = window.setTimeout(() => {
        clockTimer = undefined;
        selectDate();
      }, 60000 - now % 60000);
    }
  }

  function readingRow() {
    if (!rows.length || window.scrollY <= 1) return;
    const firstTop = rows[0].getBoundingClientRect().top;
    // The feed opens near the header. Even on a tall screen, enter history at
    // the newest post when the reader first scrolls.
    const horizon = Math.max(header.offsetHeight + 36, Math.min(innerHeight * 0.42, firstTop + window.scrollY));
    if (firstTop > horizon) return;
    if (window.scrollY + innerHeight >= document.documentElement.scrollHeight - 3) return rows.at(-1);
    let low = 0;
    let high = rows.length - 1;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (rows[mid].getBoundingClientRect().top <= horizon) low = mid;
      else high = mid - 1;
    }
    return rows[low];
  }

  function selectDate() {
    if (document.hidden) return;
    const next = readingRow();
    if (next !== current) {
      current?.removeAttribute('data-current');
      current = next;
      if (next) {
        next.setAttribute('data-current', '');
        liveMinute = -1;
        stopClockTimer();
        updateSky(new Date(next.dataset.iso!), false);
      }
    }
    if (!next) updateLiveClock();
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; selectDate(); });
  }

  function refresh() {
    rows = [...list.querySelectorAll<HTMLElement>('[data-simple-row]:not([hidden])')];
    schedule();
  }

  timeline.addEventListener('timeline:results', refresh);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', () => {
    stopClockTimer();
    if (!document.hidden) selectDate();
  });
  new ResizeObserver(schedule).observe(list);
  controls?.addEventListener('click', () => { manuallyPaused = !manuallyPaused; syncMotion(); });
  reduceMotion.addEventListener('change', syncMotion);
  syncMotion();
  refresh();
  selectDate();

  for (const image of list.querySelectorAll<HTMLImageElement>('.time-image')) {
    const recover = () => { image.hidden = true; };
    image.addEventListener('error', recover, { once: true });
    if (image.complete && !image.naturalWidth) recover();
  }
}
