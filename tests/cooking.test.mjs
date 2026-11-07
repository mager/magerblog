import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { load as parse } from 'js-yaml';

const posts = readdirSync('src/content/blog').filter(name => /\.mdx?$/.test(name)).map(name => ({ name, ...parse(readFileSync(`src/content/blog/${name}`, 'utf8').split('---')[1]) })).filter(post => post.category === 'food');
const find = slug => posts.find(post => post.name.includes(slug));
test('every cooking post, including drafts, has explicit browsing categories', () => {
  for (const post of posts) assert(post.recipeCategories?.length > 0, post.name);
});
test('recipes appear in all relevant groups without misleading ingredient matches', () => {
  const cases = [
    ['chocolate-chip-cookies', ['baking']], ['banana-bread', ['baking', 'breakfast']],
    ['euglena-yogo-parfait', ['breakfast']], ['greek-chicken-casserole', ['casserole', 'pasta', 'chicken']],
    ['chicken-lemon-rice-soup', ['soup', 'chicken', 'rice']], ['longman-eagle', ['seasoning', 'side']],
    ['cottage-pie', ['casserole', 'beef']], ['green-curry-broccoli', ['curry', 'chicken']],
  ];
  for (const [slug, categories] of cases) for (const category of categories) assert(find(slug).recipeCategories?.includes(category), `${slug}: ${category}`);
  assert(!find('grilled-zucchini-lasagna').recipeCategories?.includes('pasta'), 'zucchini replaces the pasta');
  assert(!find('detox-chicken-soup').tags.some(tag => /dairy.free/i.test(tag)), 'recipe contains butter');
  assert(!find('pulled-pork').tags.some(tag => /slow.cooker/i.test(tag)), 'recipe uses an oven');
});
