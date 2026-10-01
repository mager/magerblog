/** Only known YouTube hosts and valid video IDs can produce an embed URL. */
export function youtubeId(value: string): string | undefined {
  let url: URL;
  try { url = new URL(value); } catch { return; }
  if (!['https:', 'http:'].includes(url.protocol)) return;
  const host = url.hostname.toLowerCase();
  let id: string | null | undefined;
  if (host === 'youtu.be') id = url.pathname.split('/')[1];
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else if (/^\/(live|shorts|embed)\//.test(url.pathname)) id = url.pathname.split('/')[2];
  }
  return id && /^[\w-]{11}$/.test(id) ? id : undefined;
}

export function linkHost(value: string): string {
  return new URL(value).hostname.replace(/^www\./, '');
}
