  const prose = document.querySelector<HTMLElement>('.reading-prose');
  const progress = document.querySelector<HTMLElement>('[data-reading-progress]');
  if (prose && progress) {
    const update = () => {
      const rect = prose.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / Math.max(1, rect.height)));
      progress.style.transform = `scaleX(${fraction})`;
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    new ResizeObserver(update).observe(prose);
    update();
  }
  document.querySelectorAll<HTMLElement>('.reading-prose pre').forEach((pre, index) => {
    const text = pre.querySelector('code')?.textContent || pre.textContent || '';
    const panel = document.createElement('div');
    panel.className = 'reading-code';
    const toolbar = document.createElement('div');
    toolbar.className = 'reading-code-toolbar';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', `Copy code snippet ${index + 1}`);
    const status = document.createElement('span');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    pre.parentNode?.insertBefore(panel, pre);
    toolbar.append(button);
    panel.append(toolbar, pre, status);
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied';
        status.textContent = 'Code copied to clipboard.';
      } catch {
        button.textContent = 'Select code';
        status.textContent = 'Copy unavailable. Select and copy the code manually.';
      }
      window.setTimeout(() => { button.textContent = 'Copy'; status.textContent = ''; }, 2200);
    });
  });
  const hero = document.querySelector<HTMLImageElement>('.reading-hero img');
  if (hero) {
    const recover = () => {
      hero.closest('figure')!.hidden = true;
      document.querySelector('.reading-layout')?.classList.remove('has-hero');
    };
    if (hero.complete && !hero.naturalWidth) recover();
    else hero.addEventListener('error', recover, { once: true });
  }
