const layoutButton = document.querySelector<HTMLButtonElement>('[data-layout-toggle]');
if (layoutButton) {
  const syncLayout = () => {
    const simple = document.documentElement.dataset.layout === 'simple';
    layoutButton.setAttribute('aria-pressed', String(simple));
    layoutButton.title = simple ? 'Switch to the Chicago edition' : 'Switch to the simple homepage';
    layoutButton.hidden = false;
    window.dispatchEvent(new Event('mager:layout'));
  };
  layoutButton.addEventListener('click', () => {
    const layout = document.documentElement.dataset.layout === 'simple' ? 'edition' : 'simple';
    document.documentElement.dataset.layout = layout;
    try { localStorage.setItem('mager-layout', layout); } catch { /* The layout still works without storage. */ }
    syncLayout();
  });
  window.addEventListener('storage', event => {
    if (event.key === 'mager-layout' || event.key === null) {
      document.documentElement.dataset.layout = event.newValue === 'simple' ? 'simple' : 'edition';
      syncLayout();
    }
  });
  window.addEventListener('pageshow', syncLayout);
  syncLayout();
}
