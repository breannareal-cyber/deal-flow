// A scratchboard star for the "favorite" flag — solid woodcut mass with a few
// engraved scratch-lines, not a generic line icon. Filled = starred (coral, the
// per-card spot color); outline = not starred.
import type { SVGProps } from 'react';

const STAR_PATH = 'M12 1.6 L14.9 8.6 L22.4 9.2 L16.7 14.1 L18.5 21.4 L12 17.4 L5.5 21.4 L7.3 14.1 L1.6 9.2 L9.1 8.6 Z';

export function StarCompass({ filled = false, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  const coral = '#df7d62';
  const muted = '#8b949b';
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d={STAR_PATH}
        fill={filled ? coral : 'none'}
        stroke={filled ? coral : muted}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {filled && (
        // engraved scratch-highlights, only when the mass is inked in
        <g stroke="#0e1011" strokeWidth={0.7} opacity={0.45} strokeLinecap="round">
          <path d="M12 5 L12 9" />
          <path d="M10 11 L14 11" />
        </g>
      )}
    </svg>
  );
}
