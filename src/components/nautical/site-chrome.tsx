import Link from 'next/link';
import { Compass } from './illustrations';

/**
 * Top navigation — wordmark top-left, a solid-ink poster button top-right
 * (the Epicurrence "GET TICKETS" slot). `right` overrides the default link.
 */
export function SiteNav({ right }: { right?: React.ReactNode }) {
  return (
    <nav className="relative z-40 flex items-center justify-between px-6 sm:px-10 py-6">
      <Link href="/" className="display text-lg sm:text-xl" style={{ color: '#0e1011' }}>
        Dealflow<span className="align-super text-[0.6em]">©</span>
      </Link>
      {right ?? (
        <Link
          href="/saved"
          className="eyebrow text-[11px] px-5 py-2.5 transition-colors hover:bg-[#df7d62]"
          style={{ backgroundColor: '#0e1011', color: '#f0ebe1' }}
        >
          The Hold
        </Link>
      )}
    </nav>
  );
}

/** Ghost back-link styled for the nav's right slot. */
export function NavBack({ href = '/', label = '← Feed' }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="eyebrow text-[11px] transition-opacity hover:opacity-60" style={{ color: '#0e1011' }}>
      {label}
    </Link>
  );
}

/** Footer sits on the ink ground band. */
export function SiteFooter() {
  return (
    <footer style={{ backgroundColor: '#0e1011' }}>
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center gap-5 text-center">
        <Compass className="h-9 w-9" />
        <p className="eyebrow text-[10px]" style={{ color: '#8b949b' }}>
          Dealflow© — Charts plotted daily at 6am MT
        </p>
      </div>
    </footer>
  );
}
