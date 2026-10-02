const portraitButton = document.querySelector<HTMLButtonElement>('.portrait-toggle');
const human = portraitButton?.querySelector<HTMLImageElement>('.portrait-human');
const avatar = portraitButton?.querySelector<HTMLImageElement>('.portrait-avatar');
const hint = document.querySelector<HTMLElement>('#portrait-hint');
if (portraitButton && human && avatar) {
  const show = (revealed: boolean) => {
    portraitButton.setAttribute('aria-pressed', String(revealed));
    portraitButton.setAttribute('aria-label', revealed ? 'Show avatar' : 'Show human photo');
    human.setAttribute('aria-hidden', String(!revealed));
    avatar.setAttribute('aria-hidden', String(revealed));
  };
  const ready = () => {
    portraitButton.disabled = false;
    if (hint) hint.hidden = false;
  };
  const unavailable = () => {
    show(false);
    portraitButton.disabled = true;
    if (hint) { hint.hidden = false; hint.textContent = 'Photo unavailable right now.'; }
  };
  if (human.complete) human.naturalWidth ? ready() : unavailable();
  human.addEventListener('load', ready, { once: true });
  human.addEventListener('error', unavailable, { once: true });
  portraitButton.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && !portraitButton.disabled) show(true);
  });
  portraitButton.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') show(false);
  });
  portraitButton.addEventListener('click', event => {
    // Mouse hover already reveals the photo; touch and keyboard toggle it.
    if (event instanceof PointerEvent && event.pointerType === 'mouse') return;
    show(portraitButton.getAttribute('aria-pressed') !== 'true');
  });
}
