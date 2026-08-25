import type { Metadata, Viewport } from 'next'
import { Archivo, Big_Shoulders } from 'next/font/google'
import { meta } from '@/lib/drop'
import './globals.css'

/**
 * Display face. Google merged the old "Big Shoulders Display" and
 * "Big Shoulders Text" into one family with an `opsz` axis, so we request that
 * axis and let `font-optical-sizing: auto` (the browser default) pick the
 * display cut at hero sizes and the text cut in the spec table. One file,
 * correct letterforms at both ends.
 */
const bigShoulders = Big_Shoulders({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-big-shoulders',
  // Metric-matched fallback so nothing shifts while the webfont loads.
  adjustFontFallback: true,
  fallback: ['Oswald', 'Arial Narrow', 'sans-serif'],
})

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
  adjustFontFallback: true,
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL(meta.url),
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: meta.url,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  // Standalone drop page: not in the catalog, not in the nav, but still indexable
  // so the link in a video description resolves properly when shared.
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${archivo.variable}`}>
      <body className="bg-void text-ink antialiased">{children}</body>
    </html>
  )
}
