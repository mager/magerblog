export interface SkyDate { iso: string; live: boolean }

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
