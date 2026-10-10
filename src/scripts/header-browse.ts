/** Native disclosure navigation; links remain available without JavaScript. */
export function enhanceHeaderBrowse(header: HTMLElement) {
  const browse = header.querySelector<HTMLDetailsElement>('.header-browse');
  const summary = browse?.querySelector('summary');
  if (!browse || !summary) return;

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !browse.open) return;
    event.preventDefault();
    const restoreFocus = browse.contains(document.activeElement);
    browse.open = false;
    if (restoreFocus) summary.focus();
  });
  document.addEventListener('click', event => {
    if (event.target instanceof Node && !browse.contains(event.target)) browse.open = false;
  });
  browse.addEventListener('focusout', event => {
    if (event.relatedTarget instanceof Node && !browse.contains(event.relatedTarget)) browse.open = false;
  });
}
