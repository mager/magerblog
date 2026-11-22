import { publicationTimeZone } from './publication-date';

export interface SkyDate { iso: string; live: boolean }

export function skyDateLabel(date: Date, live: boolean) {
  return date.toLocaleDateString('en-US', {
    timeZone: live ? 'UTC' : publicationTimeZone(date), month: 'short', day: 'numeric', year: 'numeric',
  });
}

// Components can start in any order. Replay the last date to a late subscriber.
let selected: SkyDate | undefined;

export function publishSkyDate(detail: SkyDate) {
  selected = detail;
  document.dispatchEvent(new CustomEvent('timeline:date', { detail }));
}

export function onSkyDate(update: (date: SkyDate) => void) {
  document.addEventListener('timeline:date', event => update((event as CustomEvent<SkyDate>).detail));
  if (selected) update(selected);
}
