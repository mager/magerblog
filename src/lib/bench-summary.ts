export const BENCH_SUMMARY_URL = 'https://bench.mager.co/api/v1.3/results';

export interface BenchRun {
  id: string;
  model: string;
  generated_at: string;
  reasoning_effort: string;
  score: { passed: number; total: number } | null;
}

export interface BenchSummary {
  version: string;
  checked_at: string;
  task_count: number;
  total_checks: number;
  latest: BenchRun | null;
}

export function parseBenchSummary(data: unknown): BenchSummary | null {
  if (!data || typeof data !== 'object') return null;
  const value = data as { version?: unknown; tasks?: unknown; runs?: unknown };
  if (value.version !== '1.3' || !Array.isArray(value.tasks) || !value.tasks.length || !Array.isArray(value.runs)) return null;
  if (!value.tasks.every(task => task && Array.isArray(task.cases) && task.cases.length > 0)) return null;
  const total = value.tasks.reduce((count, task) => count + task.cases.length, 0);
  if (!value.runs.every(run => run && run.benchmark_version === value.version &&
    typeof run.id === 'string' && /^[\w-]+$/.test(run.id) &&
    typeof run.model === 'string' && run.model.trim() &&
    typeof run.reasoning_effort === 'string' && run.reasoning_effort.trim() &&
    typeof run.generated_at === 'string' && Number.isFinite(Date.parse(run.generated_at)) &&
    (run.score === null || (run.score && run.score.total === total &&
      Number.isInteger(run.score.passed) && run.score.passed >= 0 && run.score.passed <= total)))) return null;
  return {
    version: value.version,
    checked_at: new Date().toISOString(),
    task_count: value.tasks.length,
    total_checks: total,
    latest: [...value.runs].sort((a, b) => Date.parse(b.generated_at) - Date.parse(a.generated_at))[0] ?? null,
  };
}

export async function loadBenchSummary(): Promise<BenchSummary | null> {
  try {
    const response = await fetch(BENCH_SUMMARY_URL, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    return parseBenchSummary(await response.json());
  } catch {
    return null;
  }
}

export function benchResultsDate(summary: BenchSummary): string {
  return new Date(summary.checked_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago',
  });
}

export function benchResultLabel(summary: BenchSummary): string {
  if (!summary.latest) return `No v${summary.version} model results yet.`;
  const run = summary.latest;
  const model = run.model.replace(/^codex-cli\//, '').replace(/^gpt-/, 'GPT-').replace(/-sol$/, ' Sol').replace(/-astra$/, ' Astra');
  return `${model}: ${run.score ? `${run.score.passed}/${run.score.total} checks passed` : 'unscored attempt'} · ${run.reasoning_effort} effort.`;
}
