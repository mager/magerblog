import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEdition } from '../src/lib/edition-selection.ts';

const entry = (id, date, category = 'tech', collection = 'blog', extra = {}) => ({
  id, collection, body: 'A story.', data: { title: id, pubDate: new Date(date), category, ...extra },
});
const assigned = edition => [edition.lead, ...['supporting', 'dispatches', 'workbench', 'links', 'seen', 'kitchen', 'life', 'artifacts', 'notebook']
  .flatMap(key => edition[key])].filter(Boolean);

for (const category of ['food', 'life', 'tech']) {
  test(`the newest ${category} article can lead, including without an image`, () => {
    const edition = makeEdition([entry('older', '2026-10-09'), entry('newest', '2026-10-10', category)]);
    assert.equal(edition.lead.id, 'newest');
  });
}

test('recent cooking and life stories get supporting space during a burst of tech posts', () => {
  const edition = makeEdition([
    entry('tech-lead', '2026-10-10T12:00:00-05:00'),
    entry('tech-second', '2026-10-10T11:00:00-05:00'),
    entry('tech-third', '2026-10-10T10:00:00-05:00'),
    entry('albums', '2026-10-09', 'life'),
    entry('apple-bread', '2026-10-08', 'food'),
  ]);
  assert.deepEqual(edition.supporting.map(item => item.id), ['albums', 'apple-bread']);
  assert.deepEqual(edition.dispatches.map(item => item.id), ['tech-second', 'tech-third']);
});

test('a quiet category does not keep a supporting slot indefinitely', () => {
  const edition = makeEdition([
    entry('lead', '2026-10-10'), entry('next', '2026-10-09'), entry('third', '2026-10-08'),
    entry('old-recipe', '2026-09-01', 'food'),
  ]);
  assert.deepEqual(edition.supporting.map(item => item.id), ['next', 'third']);
});

test('new publications move an older recipe down to its category section', () => {
  const recipe = entry('apple-bread', '2026-10-03', 'food');
  assert(makeEdition([entry('lead', '2026-10-04'), recipe]).supporting.includes(recipe));
  const later = makeEdition([recipe, ...Array.from({ length: 8 }, (_, i) => entry(`new-${i}`, `2026-10-${20 - i}`))]);
  assert(!later.supporting.includes(recipe));
  assert(!later.dispatches.includes(recipe));
  assert(later.kitchen.includes(recipe));
  assert(later.sections.indexOf('workbench') < later.sections.indexOf('offscreen'));
});

test('the update column accepts every collection in publication order', () => {
  const edition = makeEdition([
    entry('article', '2026-10-09'),
    entry('photo', '2026-10-10T10:00:00-05:00', undefined, 'seen'),
    entry('link', '2026-10-10T11:00:00-05:00', undefined, 'links'),
    entry('note', '2026-10-10T12:00:00-05:00', undefined, 'notes'),
    entry('document', '2026-10-10T13:00:00-05:00', undefined, 'artifacts'),
  ]);
  assert.deepEqual(edition.dispatches.map(item => item.collection), ['artifacts', 'notes', 'links', 'seen']);
});

test('lower sections follow their newest remaining entries, not a fixed category order', () => {
  const edition = makeEdition([
    ...Array.from({ length: 8 }, (_, i) => entry(`feature-${i}`, `2026-10-${20 - i}`, 'life')),
    entry('older-tech', '2026-09-20'),
    entry('recent-recipe', '2026-10-10', 'food'),
    entry('photo', '2026-10-11', undefined, 'seen'),
    entry('document', '2026-09-01', undefined, 'artifacts'),
  ]);
  assert.deepEqual(edition.sections, ['offscreen', 'seen', 'workbench', 'reference']);
  assert.deepEqual(edition.offscreenOrder, ['life', 'kitchen']);
});

test('image changes and updatedDate cannot bump a story, and input order is preserved', () => {
  const old = entry('old', '2026-09-01', 'food', 'blog', { updatedDate: new Date('2026-10-11'), heroImage: 'https://example.test/new.jpg' });
  const newest = entry('new', '2026-10-10');
  const input = [old, newest];
  const edition = makeEdition(input);
  assert.equal(edition.lead, newest);
  assert.deepEqual(input, [old, newest]);
});

test('publication sorting preserves Chicago calendar days and deterministic ties', () => {
  const entries = [entry('b', '2026-10-04'), entry('late-chicago', '2026-10-03T23:30:00-05:00'), entry('a', '2026-10-04')];
  assert.equal(makeEdition(entries).lead.id, 'a');
  assert.equal(makeEdition([...entries].reverse()).lead.id, 'a');
});

test('drafts and translations stay out, and no entry repeats within an edition', () => {
  const article = entry('article', '2026-10-10');
  const edition = makeEdition([
    entry('draft', '2026-10-20', 'food', 'blog', { draft: true }),
    entry('translation', '2026-10-20', 'life', 'blog', { locale: 'ja' }),
    article, article, entry('note', '2026-10-09', undefined, 'notes'),
  ]);
  const ids = assigned(edition).map(item => `${item.collection}/${item.id}`);
  assert.deepEqual(ids, ['blog/article', 'notes/note']);
  assert.equal(edition.count, ids.length);
});

test('empty and non-blog editions have useful fallbacks', () => {
  const empty = makeEdition([]);
  assert.equal(empty.lead, undefined);
  assert.equal(empty.count, 0);
  const notes = makeEdition([entry('note', '2026-10-10', undefined, 'notes')]);
  assert.equal(notes.lead.id, 'note');
  assert.equal(notes.count, 1);
});
