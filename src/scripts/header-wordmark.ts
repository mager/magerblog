/** Reveal the home link once the masthead is fully hidden behind the sticky header. */
export function observeHeaderWordmark(header: HTMLElement) {
  const masthead = document.querySelector<HTMLElement>('[data-main-wordmark]');
  const wordmark = header.querySelector<HTMLAnchorElement>('.wordmark');
  if (!header.hasAttribute('data-reveal-wordmark') || !masthead || !wordmark) return () => {};

  const update = () => {
    const visible = masthead.getBoundingClientRect().bottom <= header.getBoundingClientRect().bottom;
    header.dataset.wordmarkVisible = String(visible);
    wordmark.inert = !visible;
  };
  let observer: IntersectionObserver | undefined;
  const refresh = () => {
    observer?.disconnect();
    observer = new IntersectionObserver(update, {
      rootMargin: `-${header.getBoundingClientRect().height}px 0px 0px 0px`, threshold: 0,
    });
    observer.observe(masthead);
    update();
  };
  refresh();
  window.addEventListener('pageshow', refresh);
  return refresh;
}
