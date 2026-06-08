import type { Verdict } from '@/lib/types';

const VERDICT_CONFIG: Record<Verdict, { label: string; color: string }> = {
  PURSUE:     { label: 'PURSUE',     color: '#df7d62' },
  DIG_DEEPER: { label: 'DIG DEEPER', color: '#d4a24a' },
  EDGE_CASE:  { label: 'EDGE CASE',  color: '#6f9aa8' },
  PASS:       { label: 'PASS',       color: '#5a646b' },
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const { label, color } = VERDICT_CONFIG[verdict];
  return (
    <span className="inline-flex items-center gap-2 eyebrow text-[11px]" style={{ color }}>
      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
