import type { Metadata, Viewport } from 'next';
import { Archivo, Inter, Geist_Mono } from 'next/font/google';
import './globals.css';

const archivo = Archivo({ variable: '--font-archivo', subsets: ['latin'], weight: ['600', '700', '800', '900'] });
const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const DESCRIPTION = 'Charting the waters for businesses worth acquiring.';

export const metadata: Metadata = {
  title: 'DealFlow©',
  description: DESCRIPTION,
  applicationName: 'DealFlow',
  openGraph: { title: 'DealFlow©', description: DESCRIPTION, type: 'website' },
  twitter: { card: 'summary_large_image', title: 'DealFlow©', description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: '#8a9ba3' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
