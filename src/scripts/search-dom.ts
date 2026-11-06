import { searchTextParts } from '../lib/search';

export function setSearchText(target: HTMLElement, text: string, query: string) {
  target.replaceChildren();
  for (const part of searchTextParts(text, query)) {
    if (part.match) { const mark = document.createElement('mark'); mark.textContent = part.text; target.append(mark); }
    else target.append(document.createTextNode(part.text));
  }
}
