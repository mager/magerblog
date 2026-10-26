import { createSearchIndex, searchEntries, type SearchEntry } from '../lib/search';

export function initSearch() {
  const dialog = document.querySelector<HTMLDialogElement>('#site-search');
  const input = document.querySelector<HTMLInputElement>('#site-search-input');
  const results = document.querySelector<HTMLElement>('#search-results');
  const status = document.querySelector<HTMLElement>('#search-status');
  const clear = dialog?.querySelector<HTMLButtonElement>('[data-clear-search]');
  const retry = dialog?.querySelector<HTMLButtonElement>('[data-retry-search]');
  if (!dialog || !input || !results || !status || !clear || !retry || typeof dialog.showModal !== 'function') return;

  let index: ReturnType<typeof createSearchIndex> | undefined;
  let loading = false;
  let failed = false;
  let returnFocus: HTMLElement | null = null;
  let previousOverflow = '';
  const render = () => {
    const query = input.value.trim();
    clear.hidden = !input.value;
    retry.hidden = !failed;
    results.replaceChildren();
    if (failed) { status.textContent = 'Search could not load. Check your connection and try again.'; return; }
    if (!index) { status.textContent = 'Loading search…'; return; }
    const matches = query ? searchEntries(index, query) : index.slice(0, 6).map(item => item.entry);
    status.textContent = !query ? 'Recent posts — or search by topic or ingredient.'
      : matches.length ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'} for “${query}”`
      : `No results for “${query}”. Try a broader topic or check the spelling.`;
    const fragment = document.createDocumentFragment();
    for (const entry of matches) {
      const link = document.createElement('a');
      link.href = entry.href;
      for (const [className, text] of [
        ['search-result-title', entry.title], ['search-result-kind', entry.kind], ['search-result-description', entry.description],
      ]) {
        if (!text) continue;
        const span = document.createElement('span');
        span.className = className;
        span.textContent = text;
        link.append(span);
      }
      fragment.append(link);
    }
    results.append(fragment);
    results.scrollTop = 0;
  };
  const load = async () => {
    if (index || loading) return;
    loading = true;
    failed = false;
    render();
    try {
      const response = await fetch('/search-index.json');
      if (!response.ok) throw new Error('Search index unavailable');
      const data: SearchEntry[] = await response.json();
      index = createSearchIndex(data);
    } catch {
      failed = true;
    } finally {
      loading = false;
      render();
    }
  };
  const updateViewport = () => {
    const viewport = window.visualViewport;
    dialog.style.setProperty('--search-height', `${viewport?.height ?? window.innerHeight}px`);
    dialog.style.setProperty('--search-top', `${viewport?.offsetTop ?? 0}px`);
  };
  const open = () => {
    if (dialog.open || document.querySelector('dialog[open]')) return;
    document.querySelectorAll<HTMLDetailsElement>('.header-browse[open]').forEach(menu => { menu.open = false; });
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    previousOverflow = document.body.style.overflow;
    updateViewport();
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    // Keep focus synchronous with the tap so iOS can open its keyboard.
    input.focus({ preventScroll: true });
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    render();
    void load();
  };
  document.querySelectorAll<HTMLButtonElement>('[data-open-search]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', open);
  });
  dialog.querySelector('[data-close-search]')?.addEventListener('click', () => dialog.close());
  retry.addEventListener('click', () => { void load(); });
  clear.addEventListener('click', () => { input.value = ''; render(); input.focus(); });
  input.addEventListener('input', render);
  dialog.querySelector('form')?.addEventListener('submit', event => {
    event.preventDefault();
    render();
    input.blur();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    window.visualViewport?.removeEventListener('resize', updateViewport);
    window.visualViewport?.removeEventListener('scroll', updateViewport);
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dialog.close(); }
    if (event.key !== 'Tab') return;
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([hidden]), input, a[href]'));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  document.addEventListener('keydown', event => {
    const target = event.target;
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return;
    if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))) return;
    if (event.key !== '/') return;
    event.preventDefault();
    open();
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && !event.isComposing) { event.preventDefault(); results.querySelector<HTMLAnchorElement>('a')?.focus(); }
  });
  results.addEventListener('keydown', event => {
    const items = Array.from(results.querySelectorAll<HTMLAnchorElement>('a'));
    const current = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); items[Math.min(current + 1, items.length - 1)]?.focus(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); (items[current - 1] || input).focus(); }
  });
}
