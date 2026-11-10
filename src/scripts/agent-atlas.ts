const atlas = document.querySelector<HTMLElement>('[data-agent-atlas]');
if (atlas) {
  const map = atlas.querySelector<HTMLElement>('[data-atlas-map]')!;
  const nodes = [...atlas.querySelectorAll<HTMLAnchorElement>('[data-atlas-node]')];
  const edges = [...atlas.querySelectorAll<SVGElement>('[data-atlas-edge]')];
  const caption = atlas.querySelector<HTMLElement>('[data-atlas-caption]')!;
  const motion = atlas.querySelector<HTMLButtonElement>('[data-atlas-motion]')!;
  const defaultCaption = caption.textContent;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let inView = !('IntersectionObserver' in window);

  function select(node: HTMLAnchorElement | null) {
    const id = node?.dataset.atlasNode;
    atlas!.toggleAttribute('data-selected', !!id);
    nodes.forEach(item => item.setAttribute('data-active', String(item === node)));
    edges.forEach(edge => edge.setAttribute('data-active', String(!!id && edge.dataset.atlasEdge === id)));
    caption.textContent = node?.dataset.atlasTitle || defaultCaption;
  }
  const focusedNode = () => nodes.find(node => node === document.activeElement) || null;
  map.addEventListener('pointerover', event => {
    const node = (event.target as Element).closest<HTMLAnchorElement>('[data-atlas-node]');
    if (node) select(node);
  });
  map.addEventListener('pointerout', event => {
    const target = event.relatedTarget;
    if (!(target instanceof Element) || !target.closest('[data-atlas-node]')) select(focusedNode());
  });
  map.addEventListener('pointerleave', () => select(focusedNode()));
  map.addEventListener('focusin', () => select(focusedNode()));
  map.addEventListener('focusout', event => { select(nodes.find(node => node === event.relatedTarget) || null); });

  function updateMotion() {
    atlas!.dataset.motion = !paused && !reduced.matches && inView && !document.hidden ? 'running' : 'paused';
    motion.disabled = reduced.matches;
    motion.textContent = reduced.matches ? 'Motion reduced' : paused ? 'Resume motion' : 'Pause motion';
    motion.setAttribute('aria-pressed', String(paused || reduced.matches));
  }
  motion.hidden = false;
  motion.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduced.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateMotion(); }).observe(atlas);
  }
  updateMotion();
}
