import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const source = stripTypeScriptTypes(readFileSync(new URL('../src/lib/bench-summary.ts', import.meta.url), 'utf8'));
const { parseBenchSummary, benchResultLabel } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const suite = runs => ({version: '1.3', tasks: [{cases: [{}, {}]}, {cases: [{}]}], runs});
const run = (score, date = '2026-10-04T10:00:00Z') => ({benchmark_version:'1.3',id:'test-run',model:'test-model',reasoning_effort:'low',generated_at:date,score});
test('an empty current suite is valid and reports no results, not a fetch failure', () => {
  const summary = parseBenchSummary(suite([]));
  assert.equal(summary.task_count, 2);
  assert.equal(summary.total_checks, 3);
  assert.equal(benchResultLabel(summary), 'No v1.3 model results yet.');
});
test('latest unscored attempts are not turned into zero scores or hidden behind older success', () => {
  const summary = parseBenchSummary(suite([run(null), run({passed:3,total:3},'2026-10-03T10:00:00Z')]));
  assert.match(benchResultLabel(summary), /unscored attempt/);
  assert.match(benchResultLabel(parseBenchSummary(suite([run({passed:0,total:3})]))), /0\/3 checks passed/);
});
test('archived schemas, mixed versions and invalid scores cannot appear as current results', () => {
  for(const data of [{benchmark_version:'1.1',models:[]}, {...suite([]),version:'1.2'}, suite([run({passed:4,total:3})]), suite([run({passed:1,total:60})]), suite([{...run(null),benchmark_version:'1.2'}]), suite([run(null,'bad-date')])]) assert.equal(parseBenchSummary(data),null);
});
