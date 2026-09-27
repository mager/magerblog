export const BENCH_SUMMARY_URL = 'https://bench.mager.co/api/summary';

export interface BenchSummary {
  generated_at: string;
  judge: string;
  model_count: number;
  challenge_count: number;
  leader: {
    id: string;
    name: string;
    average: number;
    challenge_count: number;
  };
}

export async function loadBenchSummary(): Promise<BenchSummary | null> {
  try {
    const response = await fetch(BENCH_SUMMARY_URL, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (
      typeof data?.generated_at !== 'string' || !Number.isFinite(Date.parse(data.generated_at)) ||
      typeof data.judge !== 'string' ||
      !Number.isInteger(data.model_count) || data.model_count < 1 ||
      !Number.isInteger(data.challenge_count) || data.challenge_count < 1 ||
      typeof data.leader?.id !== 'string' || !data.leader.id.trim() ||
      typeof data.leader.name !== 'string' || !data.leader.name.trim() ||
      !Number.isFinite(data.leader.average) || data.leader.average < 0 || data.leader.average > 10 ||
      !Number.isInteger(data.leader.challenge_count) || data.leader.challenge_count < 1 ||
      data.leader.challenge_count > data.challenge_count
    ) return null;
    return data;
  } catch {
    return null;
  }
}

export function benchResultsDate(summary: BenchSummary): string {
  return new Date(summary.generated_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}
