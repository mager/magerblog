import { parse, renderSync, h, ELEMENT_NODE, TEXT_NODE, type Node, type ElementNode, type DocumentNode } from 'ultrahtml';
import { querySelector as query, querySelectorAll as queryAll } from 'ultrahtml/selector';

const text = (node: Node): string => node.type === TEXT_NODE ? node.value : 'children' in node ? node.children.map(text).join('') : '';
const element = (node: Node, name?: string): node is ElementNode => node.type === ELEMENT_NODE && (!name || node.name === name);

const querySelector = (node: Node, selector: string): ElementNode | undefined => {
  const found = query(node, selector);
  return found && element(found) ? found : undefined;
};
const querySelectorAll = (node: Node, selector: string): ElementNode[] => queryAll(node, selector).filter(node => element(node));

/** Normalize the two authoring formats at build time, so the recipe works without JS. */
export function prepareRecipe(markup: string) {
  const root: DocumentNode = parse(markup);
  const wrapSection = (pattern: RegExp, className: string) => {
    const start = root.children.findIndex((node: Node) => element(node, 'h2') && pattern.test(text(node).trim()));
    if (start < 0) return;
    let end = start + 1;
    while (end < root.children.length && !element(root.children[end], 'h2')) end++;
    const children = root.children.splice(start, end - start);
    root.children.splice(start, 0, h('section', { class: className }, ...children.slice(1)));
  };
  if (!querySelector(root, '.recipe-ingredients')) wrapSection(/^(what you need|ingredients)$/i, 'recipe-ingredients');
  if (!querySelector(root, '.recipe-instructions')) wrapSection(/^(the method|method|instructions)$/i, 'recipe-instructions');

  const ingredients = querySelector(root, '.recipe-ingredients');
  const instructions = querySelector(root, '.recipe-instructions');
  for (const [section, id, title] of [[ingredients, 'ingredients', 'Ingredients'], [instructions, 'method', 'Let’s make it']] as const) {
    if (!section) continue;
    section.name = 'section';
    section.attributes.id = id;
    section.attributes['aria-labelledby'] = `${id}-heading`;
    // Avoid a repeated Ingredients label in legacy recipe wrappers.
    section.children = section.children.filter(node => !(element(node) && /^h[2-6]$/.test(node.name) && text(node).trim().toLowerCase() === 'ingredients'));
    section.children.unshift(h('h2', { id: `${id}-heading` }, title));
    for (const heading of querySelectorAll(section, 'h4')) heading.name = 'h3';
  }
  if (instructions) {
    const children: Node[] = [];
    let steps: ElementNode | undefined;
    let inMethod = true;
    for (const node of instructions.children) {
      if (element(node) && /^h[2-6]$/.test(node.name) && node.attributes.id !== 'method-heading') inMethod = false;
      if (inMethod && element(node, 'p') && text(node).trim()) {
        if (!steps) { steps = h('ol', { class: 'recipe-steps' }); children.push(steps); }
        // Older recipes carry their step numbers in bold text.
        const strong = node.children.find(child => element(child, 'strong'));
        if (strong && 'children' in strong && strong.children[0]?.type === TEXT_NODE) strong.children[0].value = strong.children[0].value.replace(/^\d+\.\s*/, '');
        steps.children.push(h('li', {}, node));
      } else if (inMethod && element(node, 'ol')) {
        node.attributes.class = 'recipe-steps';
        steps = node;
        children.push(node);
      } else if (inMethod && element(node, 'p') && querySelector(node, 'img') && steps?.children.length) {
        const last = steps.children.at(-1);
        if (last && 'children' in last) last.children.push(node);
      } else {
        children.push(node);
      }
    }
    instructions.children = children;
  }
  for (const img of querySelectorAll(root, 'img')) {
    img.attributes.loading = 'lazy';
    img.attributes.decoding = 'async';
  }
  return { html: renderSync(root), hasIngredients: !!ingredients, hasMethod: !!instructions };
}
