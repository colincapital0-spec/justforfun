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
  // Absolute URLs for OG tags once the domain is set in lib/drop.ts; until
  // then Next falls back to relative, which is correct-but-unpreviewable
  // rather than confidently wrong.
  metadataBase: meta.url ? new URL(meta.url) : undefined,
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    ...(meta.url ? { url: meta.url } : {}),
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  // Its own site, one page. Indexable so a shared link previews and resolves.
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
