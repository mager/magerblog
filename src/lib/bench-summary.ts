export const BENCH_SUMMARY_URL = 'https://bench.mager.co/api/v1.1/summary';

export interface BenchModel {
  id: string;
  name: string;
  effort: string;
  attempts: number;
  completed: number;
  failed: number;
  scores: number[];
}

export interface BenchSummary {
  benchmark_version: '1.1';
  status: 'preliminary_calibration';
  generated_at: string;
  total_faults: number;
  models: BenchModel[];
}

export function parseBenchSummary(data: unknown): BenchSummary | null {
  if (!data || typeof data !== 'object') return null;
  const summary = data as BenchSummary;
  if (
    summary.benchmark_version !== '1.1' || summary.status !== 'preliminary_calibration' ||
    typeof summary.generated_at !== 'string' || !Number.isFinite(Date.parse(summary.generated_at)) ||
    !Number.isInteger(summary.total_faults) || summary.total_faults < 1 ||
    !Array.isArray(summary.models) || summary.models.length < 1 ||
    !summary.models.every(model =>
      model && typeof model.id === 'string' && model.id.trim() &&
      typeof model.name === 'string' && model.name.trim() &&
      typeof model.effort === 'string' && model.effort.trim() &&
      Number.isInteger(model.attempts) && model.attempts >= 1 &&
      Number.isInteger(model.completed) && model.completed >= 1 &&
      Number.isInteger(model.failed) && model.failed >= 0 &&
      model.completed + model.failed === model.attempts &&
      Array.isArray(model.scores) && model.scores.length === model.completed &&
      model.scores.every(score => Number.isInteger(score) && score >= 0 && score <= summary.total_faults)
    )
  ) return null;
  return summary;
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
  return new Date(summary.generated_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago',
  });
}

export function benchScoreLabel(model: BenchModel, total: number): string {
  return `${model.scores.map(score => `${score}/${total}`).join(' · ')}${model.failed ? ` · ${model.failed} unscored` : ''}`;
}
