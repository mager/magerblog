class RecipePhotoViewer extends HTMLElement {
  private cleanup?: () => void;

  connectedCallback() {
    if (this.cleanup) return;
    const dialog = this.querySelector<HTMLDialogElement>('dialog');
    const image = this.querySelector<HTMLImageElement>('.photo-viewer-image');
    const caption = this.querySelector<HTMLElement>('.photo-viewer-caption');
    const status = this.querySelector<HTMLElement>('.photo-viewer-status');
    const original = this.querySelector<HTMLAnchorElement>('.photo-viewer-original');
    const close = this.querySelector<HTMLButtonElement>('.photo-viewer-close');
    if (!dialog || !image || !caption || !status || !original || !close || !dialog.showModal) return;

    const controller = new AbortController();
    const { signal } = controller;
    const triggers: HTMLAnchorElement[] = [];
    let restore: (() => void) | undefined;
    const release = () => {
      restore?.();
      restore = undefined;
      image.removeAttribute('src');
      image.hidden = true;
    };
    const loaded = () => {
      image.hidden = false;
      status.hidden = true;
    };
    image.addEventListener('load', loaded, { signal });
    image.addEventListener('error', () => {
      if (!dialog.open) return;
      image.hidden = true;
      status.textContent = 'This photo couldn’t load.';
      status.hidden = false;
      original.hidden = false;
    }, { signal });

    document.querySelectorAll<HTMLImageElement>('.recipe-photo img, .cooking-content img').forEach(photo => {
      if (!photo.getAttribute('src') || photo.closest('a, button')) return;
      const trigger = document.createElement('a');
      trigger.className = 'photo-trigger';
      trigger.href = photo.dataset.fullSrc || photo.src;
      trigger.setAttribute('aria-label', `View photo full screen: ${photo.alt || 'Recipe photo'}`);
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', dialog.id);
      const hint = document.createElement('span');
      hint.className = 'photo-trigger-hint';
      hint.textContent = 'View full size';
      hint.setAttribute('aria-hidden', 'true');
      photo.before(trigger);
      trigger.append(photo, hint);
      triggers.push(trigger);
      trigger.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (dialog.open) return;
        image.hidden = true;
        image.alt = photo.alt || 'Recipe photo';
        caption.textContent = photo.alt;
        status.textContent = 'Loading photo…';
        status.hidden = false;
        original.href = trigger.href;
        original.hidden = true;
        image.src = trigger.href;
        dialog.showModal();

        // A fixed body also prevents background scrolling on mobile Safari.
        const { scrollX, scrollY } = window;
        const body = document.body;
        const properties = ['position', 'top', 'left', 'width', 'overflow'] as const;
        const previous = properties.map(property => body.style[property]);
        const overflow = document.documentElement.style.overflow;
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.left = `-${scrollX}px`;
        body.style.width = '100%';
        body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        restore = () => {
          properties.forEach((property, index) => { body.style[property] = previous[index]; });
          document.documentElement.style.overflow = overflow;
          window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
          if (trigger.isConnected) trigger.focus({ preventScroll: true });
        };
        close.focus({ preventScroll: true });
        if (image.complete && image.naturalWidth) loaded();
      }, { signal });
    });

    close.addEventListener('click', () => dialog.close(), { signal });
    // Native modal dialogs handle Escape and keep keyboard focus inside.
    dialog.addEventListener('close', release, { signal });
    let outsidePress = false;
    dialog.addEventListener('pointerdown', event => { outsidePress = event.target === dialog; }, { signal });
    dialog.addEventListener('click', event => {
      if (outsidePress && event.target === dialog) dialog.close();
      outsidePress = false;
    }, { signal });

    this.cleanup = () => {
      if (dialog.open) dialog.close();
      release();
      controller.abort();
      triggers.forEach(trigger => {
        const photo = trigger.querySelector('img');
        if (photo) trigger.replaceWith(photo);
      });
      this.cleanup = undefined;
    };
    document.addEventListener('astro:before-swap', () => this.cleanup?.(), { signal });
  }

  disconnectedCallback() { this.cleanup?.(); }
}

if (!customElements.get('recipe-photo-viewer')) customElements.define('recipe-photo-viewer', RecipePhotoViewer);
