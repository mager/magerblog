const simpleHome = document.querySelector<HTMLElement>('.simple-home');
if (simpleHome) {
  const rows = [...simpleHome.querySelectorAll<HTMLElement>('[data-simple-row]')];
  const filters = [...simpleHome.querySelectorAll<HTMLButtonElement>('[data-simple-filter]')];
  const query = simpleHome.querySelector<HTMLInputElement>('#simple-query')!;
  const clear = simpleHome.querySelector<HTMLButtonElement>('[data-simple-clear]')!;
  const more = simpleHome.querySelector<HTMLButtonElement>('[data-simple-more]')!;
  const count = simpleHome.querySelector<HTMLElement>('[data-simple-count]')!;
  const heading = simpleHome.querySelector<HTMLElement>('#simple-posts-heading')!;
  const empty = simpleHome.querySelector<HTMLElement>('[data-simple-empty]')!;
  let category = 'all';
  let limit = 24;
  function update() {
    const terms = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches = rows.filter(row => (category === 'all' || row.dataset.category === category)
      && terms.every(term => row.dataset.search?.includes(term)));
    const visible = new Set(matches.slice(0, limit));
    rows.forEach(row => { row.hidden = !visible.has(row); });
    count.textContent = `${matches.length} ${matches.length === 1 ? 'post' : 'posts'}`;
    heading.textContent = category === 'all' ? 'All posts' : filters.find(button => button.dataset.simpleFilter === category)!.textContent;
    empty.hidden = matches.length > 0;
    more.hidden = matches.length <= limit;
    clear.hidden = query.value.length === 0;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.simpleFilter === category)));
  }
  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.simpleFilter || 'all';
    limit = 24;
    update();
  }));
  query.addEventListener('input', () => { limit = 24; update(); });
  clear.addEventListener('click', () => { query.value = ''; limit = 24; update(); query.focus(); });
  more.addEventListener('click', () => {
    const previous = new Set(rows.filter(row => !row.hidden));
    limit += 24;
    update();
    rows.find(row => !row.hidden && !previous.has(row))?.querySelector<HTMLAnchorElement>('a')?.focus();
  });
  simpleHome.querySelector<HTMLElement>('.simple-controls')!.hidden = false;
  simpleHome.querySelectorAll<HTMLImageElement>('img').forEach(img => {
    const recover = () => { img.hidden = true; };
    if (img.complete && !img.naturalWidth) recover();
    else img.addEventListener('error', recover, { once: true });
  });
  update();
}
