export type SkyTimeSource = 'live' | 'published' | 'day';
export interface SkyDate { iso: string; source: SkyTimeSource }

const chicago = 'America/Chicago';
const chicagoOffset = new Intl.DateTimeFormat('en-US', { timeZone: chicago, timeZoneName: 'longOffset' });
const chicagoClock = new Intl.DateTimeFormat('en-US', {
  timeZone: chicago, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short',
});
const chicagoDay = new Intl.DateTimeFormat('en-US', {
  timeZone: chicago, month: 'short', day: 'numeric', year: 'numeric',
});

export function earthTimeInChicago(date: Date) {
  return chicagoClock.format(date);
}

function offsetAt(instant: number) {
  // Chicago is west of GMT. The IANA offset can include seconds for historical dates.
  const zone = chicagoOffset.formatToParts(instant).find(part => part.type === 'timeZoneName')!.value;
  const [hours, minutes, seconds = 0] = zone.slice(4).split(':').map(Number);
  return -(hours * 3600 + minutes * 60 + seconds) * 1000;
}

export function chicagoTimeOnDay(day: string, now: Date): Date {
  const currentOffset = offsetAt(now.getTime());
  const localClock = new Date(now.getTime() + currentOffset).toISOString().slice(11);
  // First express the desired wall-clock fields on a UTC scale, then apply
  // the offsets in effect on either side of the archived Chicago day.
  const wall = Date.parse(day + 'T' + localClock);
  const oneDay = 86400000;
  const before = offsetAt(wall - oneDay);
  const after = offsetAt(wall + oneDay);
  const first = wall - before;
  if (before === after) return new Date(first);
  const second = wall - after;
  // In a repeated hour, use today's offset if possible, otherwise the first
  // occurrence. In a skipped hour neither matches: the old offset advances
  // the clock by the size of the gap.
  if (offsetAt(second) === after && (offsetAt(first) !== before || currentOffset === after)) {
    return new Date(second);
  }
  return new Date(first);
}

export function earthCaption(date: Date, source: SkyTimeSource) {
  if (source === 'live') return date.toISOString().slice(11, 16) + ' UTC';
  return chicagoDay.format(date) + ' · ' + earthTimeInChicago(date);
}

export function earthDescription(date: Date, source: SkyTimeSource) {
  if (source === 'day') return 'Earth viewed from above North America on ' + chicagoDay.format(date) + ', using the current Chicago time of day. This post records only a date.';
  return 'Earth viewed from above North America at ' + date.toISOString().slice(0, 16).replace('T', ' ') + ' UTC.';
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
