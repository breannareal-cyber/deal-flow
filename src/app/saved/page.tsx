import Link from 'next/link';

export default function SavedPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f0f' }}>
      <nav className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#1e1e1e' }}>
        <Link href="/" className="text-sm font-black tracking-widest uppercase text-white hover:opacity-70 transition-opacity">
          DEALFLOW©
        </Link>
        <Link href="/" className="text-xs font-semibold tracking-widest uppercase transition-colors hover:text-white" style={{ color: '#555' }}>
          ← Feed
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <header className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#666' }}>Your List</p>
          <h1 className="text-3xl font-black tracking-tight text-white">Saved Deals</h1>
          <p className="text-sm mt-2" style={{ color: '#666' }}>
            Deals you&rsquo;re tracking. Save from the feed to add them here.
          </p>
        </header>

        <div className="text-center py-20 border rounded-sm" style={{ borderColor: '#252525', color: '#444' }}>
          <p className="text-sm">Nothing saved yet.</p>
          <p className="text-xs mt-2" style={{ color: '#333' }}>
            Hit &ldquo;Save ↗&rdquo; on any card in the feed.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 text-xs font-semibold tracking-widest uppercase transition-colors hover:opacity-70"
            style={{ color: '#e8715a' }}
          >
            Back to Feed →
          </Link>
        </div>
      </main>
    </div>
  );
}
