import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEdition } from '../src/lib/edition-selection.ts';

const entry = (id, date, category = 'tech', collection = 'blog', extra = {}) => ({
  id, collection, body: 'A story.', data: { title: id, pubDate: new Date(date), category, ...extra },
});
const assigned = edition => [edition.lead, ...['supporting', 'dispatches', 'workbench', 'links', 'seen', 'kitchen', 'life', 'artifacts', 'notebook']
  .flatMap(key => edition[key])].filter(Boolean);

test('the newest tech story leads even when life and cooking publish later', () => {
  const edition = makeEdition([
    entry('older-tech', '2026-09-01'), entry('tech-lead', '2026-09-02'),
    entry('albums', '2026-10-09', 'life'), entry('apple-bread', '2026-10-10', 'food'),
  ]);
  assert.equal(edition.lead.id, 'tech-lead');
  assert.deepEqual(edition.supporting.map(item => item.id), ['albums', 'apple-bread']);
});

test('life then cooking keep supporting space regardless of age or publication order', () => {
  const edition = makeEdition([
    entry('tech-lead', '2026-10-10'), entry('tech-second', '2026-10-09'),
    entry('albums', '2026-08-01', 'life'), entry('apple-bread', '2026-09-01', 'food'),
    entry('old-albums', '2026-07-01', 'life'), entry('old-recipe', '2026-07-02', 'food'),
  ]);
  assert.deepEqual(edition.supporting.map(item => item.id), ['albums', 'apple-bread']);
  assert.equal(edition.dispatches[0].id, 'tech-second');
});

test('a new recipe replaces the previous recipe in its supporting slot', () => {
  const recipe = entry('apple-bread', '2026-10-03', 'food');
  const entries = [entry('lead', '2026-10-04'), recipe];
  assert(makeEdition(entries).supporting.includes(recipe));
  const later = makeEdition([...entries, entry('new-recipe', '2026-10-10', 'food')]);
  assert.deepEqual(later.supporting.map(item => item.id), ['new-recipe']);
  assert(later.dispatches.includes(recipe));
});

test('missing categories do not borrow other category slots or duplicate the fallback lead', () => {
  const techOnly = makeEdition([entry('tech', '2026-10-10'), entry('other-tech', '2026-10-09')]);
  assert.deepEqual(techOnly.supporting, []);
  assert.equal(techOnly.dispatches[0].id, 'other-tech');
  const noTech = makeEdition([entry('recipe', '2026-10-10', 'food'), entry('life', '2026-10-09', 'life')]);
  assert.equal(noTech.lead.id, 'recipe');
  assert.deepEqual(noTech.supporting.map(item => item.id), ['life']);
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
    entry('tech-lead', '2026-10-21'), entry('older-tech', '2026-09-20'),
    entry('featured-recipe', '2026-10-12', 'food'), entry('recent-recipe', '2026-10-10', 'food'),
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
