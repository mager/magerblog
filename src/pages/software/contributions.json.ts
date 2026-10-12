import contributions from '../../data/contributions.json';

export function GET() {
  return new Response(JSON.stringify(contributions, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
