export type SkyTimeSource = 'live' | 'published' | 'noon';
export interface SkyDate { iso: string; source: SkyTimeSource }

const chicago = 'America/Chicago';
const chicagoHour = new Intl.DateTimeFormat('en-US', { timeZone: chicago, hour: '2-digit', hourCycle: 'h23' });
const chicagoClock = new Intl.DateTimeFormat('en-US', {
  timeZone: chicago, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short',
});
const chicagoDay = new Intl.DateTimeFormat('en-US', {
  timeZone: chicago, month: 'short', day: 'numeric', year: 'numeric',
});

export function earthTimeInChicago(date: Date) {
  return chicagoClock.format(date);
}

// Chicago's DST change occurs before both UTC noon and local noon. Use the
// offset on the archived day, independent of the reader's clock and time zone.
export function chicagoNoon(day: string) {
  const utcNoon = new Date(day + 'T12:00:00Z');
  return new Date(utcNoon.valueOf() + (12 - Number(chicagoHour.format(utcNoon))) * 3_600_000);
}

export function earthCaption(date: Date, source: SkyTimeSource) {
  if (source === 'live') return date.toISOString().slice(11, 16) + ' UTC';
  const time = source === 'noon' ? 'Noon view (Chicago)' : earthTimeInChicago(date);
  return chicagoDay.format(date) + ' · ' + time;
}

export function earthDescription(date: Date, source: SkyTimeSource) {
  if (source === 'noon') return 'Daylight over North America at noon in Chicago on ' + chicagoDay.format(date) + '. This post records only a date.';
  return 'Daylight over North America at ' + date.toISOString().slice(0, 16).replace('T', ' ') + ' UTC.';
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
