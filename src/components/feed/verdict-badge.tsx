import type { Verdict } from '@/lib/types';

const VERDICT_CONFIG: Record<Verdict, { label: string; color: string }> = {
  PURSUE:     { label: 'PURSUE',     color: '#e8715a' },
  DIG_DEEPER: { label: 'DIG DEEPER', color: '#d4a847' },
  EDGE_CASE:  { label: 'EDGE CASE',  color: '#6b9fb8' },
  PASS:       { label: 'PASS',       color: '#444444' },
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const { label, color } = VERDICT_CONFIG[verdict];
  return (
    <span className="text-xs font-bold tracking-widest uppercase" style={{ color }}>
      {label}
    </span>
  );
}
