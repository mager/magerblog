import { chicagoNoon, earthCaption, earthDescription, publishSkyDate, type SkyTimeSource } from '../lib/sky-date';

const timeline = document.querySelector<HTMLElement>('[data-timeline]');

if (timeline) {
  const list = timeline.querySelector<HTMLOListElement>('#simple-list')!;
  const header = document.querySelector<HTMLElement>('.site-header')!;
  const clock = document.querySelector<HTMLTimeElement>('[data-earth-clock]');
  let rows: HTMLElement[] = [];
  let current: HTMLElement | undefined;
  let frame = 0;
  let liveMinute = -1;
  let clockTimer: number | undefined;

  function stopClockTimer() {
    window.clearTimeout(clockTimer);
    clockTimer = undefined;
  }

  function updateSky(date: Date, source: SkyTimeSource) {
    const iso = date.toISOString();
    if (clock) {
      clock.dateTime = iso;
      clock.textContent = earthCaption(date, source);
      clock.title = source === 'noon' ? earthDescription(date, source) : date.toUTCString();
    }
    publishSkyDate({ iso, source });
  }

  function updateLiveClock() {
    if (document.hidden) return;
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    if (minute !== liveMinute) {
      liveMinute = minute;
      updateSky(new Date(now), 'live');
    }
    if (clockTimer === undefined) {
      clockTimer = window.setTimeout(() => {
        clockTimer = undefined;
        selectDate();
      }, 60000 - now % 60000);
    }
  }

  function readingRow() {
    if (!rows.length) return;
    if (window.scrollY <= 1) return timeline!.hasAttribute('data-searching') ? rows[0] : undefined;
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
        if (next.dataset.dateOnly) updateSky(chicagoNoon(next.dataset.dateOnly), 'noon');
        else updateSky(new Date(next.dataset.iso!), 'published');
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
  refresh();
  selectDate();

  for (const image of list.querySelectorAll<HTMLImageElement>('.time-image')) {
    const recover = () => { image.hidden = true; };
    image.addEventListener('error', recover, { once: true });
    if (image.complete && !image.naturalWidth) recover();
  }
}
