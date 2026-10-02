const front = document.querySelector<HTMLElement>('#front-page');
const stream = document.querySelector<HTMLElement>('#chronological-feed');
const switcher = document.querySelector<HTMLElement>('.edition-switch');
const details = stream?.querySelector<HTMLDetailsElement>('details');
if (front && stream && switcher && details) {
  const buttons = Array.from(switcher.querySelectorAll<HTMLButtonElement>('[data-edition-view]'));
  const update = (view: string) => {
    const showFront = view === 'front';
    front.hidden = !showFront;
    stream.hidden = showFront;
    details.open = !showFront;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.editionView === view)));
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    const apply = () => update(button.dataset.editionView || 'front');
    if ('startViewTransition' in document && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(apply);
    } else apply();
  }));
  document.body.classList.add('edition-enhanced');
  update('front');
  switcher.hidden = false;
}

document.querySelectorAll<HTMLImageElement>('.story-image img').forEach(img => {
  const recover = () => img.closest<HTMLElement>('.story-image')?.setAttribute('hidden', '');
  if (img.complete && !img.naturalWidth) recover();
  else img.addEventListener('error', recover, { once: true });
});
