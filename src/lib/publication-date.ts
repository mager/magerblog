// Astro coerces date-only frontmatter to UTC midnight. Keep its written date;
// explicit timestamps use the publication's Chicago timezone.
export function publicationTimeZone(date: Date): string {
  return date.toISOString().endsWith('T00:00:00.000Z') ? 'UTC' : 'America/Chicago';
}

function calendarDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: publicationTimeZone(date),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return ['year', 'month', 'day']
    .map(type => parts.find(part => part.type === type)!.value)
    .join('-');
}

// Sort newest displayed date first, retaining timestamp order within a day.
export function comparePublicationDates(a: Date, b: Date): number {
  return calendarDate(b).localeCompare(calendarDate(a)) || b.valueOf() - a.valueOf();
}
