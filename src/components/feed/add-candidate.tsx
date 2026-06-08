'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type State = 'idle' | 'submitting' | 'success' | 'error';

// Add-by-URL: paste a company website → scored off-market candidate enters the feed.
export function AddCandidate() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setState('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/candidates/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; added?: boolean };
      if (!res.ok) {
        setState('error');
        setMessage(data.error ?? 'Could not add candidate.');
        return;
      }
      setState('success');
      setMessage(data.added ? 'Candidate added to the pipeline.' : 'Already in the pipeline.');
      setUrl('');
      router.refresh();
    } catch {
      setState('error');
      setMessage('Network error — try again.');
    }
  }

  return (
    <form onSubmit={submit} className="mb-10">
      <label className="eyebrow text-[11px] block mb-2" style={{ color: '#8b949b' }}>
        Add an off-market candidate by URL
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); if (state !== 'idle') setState('idle'); }}
          placeholder="truepump.com"
          aria-label="Company website URL"
          disabled={state === 'submitting'}
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50"
          style={{ color: '#ece7dd', border: '1px solid #2b3137' }}
        />
        <button
          type="submit"
          disabled={state === 'submitting' || !url.trim()}
          className="eyebrow text-[10px] px-4 py-2 transition-colors disabled:opacity-40"
          style={{ backgroundColor: '#df7d62', color: '#0e1011' }}
        >
          {state === 'submitting' ? 'Charting…' : 'Add'}
        </button>
      </div>
      {message && (
        <p
          className="mt-2 text-xs"
          role={state === 'error' ? 'alert' : 'status'}
          style={{ color: state === 'error' ? '#df7d62' : '#6f9aa8' }}
        >
          {message}
        </p>
      )}
    </form>
  );
}
