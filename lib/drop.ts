/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  RUN BACK — every product fact, every piece of copy, every link.
 *
 *  This is the only file you need to touch to change the drop. Nothing in the
 *  JSX hard-codes a price, a date, a size or a sentence. If you find yourself
 *  editing a component to change a fact, that's a bug — the fact belongs here.
 *
 *  Anything written in [BRACKETS] is a real placeholder that will render
 *  visibly on the page as brackets. That's on purpose: it should be obvious
 *  what still needs filling in, both here and on the live page.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type SizeKey = 's' | 'm' | 'l' | 'xl' | '2xl'

/* ── Stripe ────────────────────────────────────────────────────────────────
 *
 *  One Payment Link per size, created in the Stripe dashboard. Stripe owns
 *  address collection, shipping, tax, receipts and refunds — there is no
 *  payment code in this project and there shouldn't be.
 *
 *  These are read as LITERAL static member accesses on purpose. Next.js only
 *  inlines NEXT_PUBLIC_* vars into the client bundle when it can see the full
 *  property path at build time; a computed lookup like
 *  process.env[`NEXT_PUBLIC_STRIPE_LINK_${k}`] compiles to undefined in the
 *  browser and every buy button silently dies. Keep them spelled out.
 *
 *  An unset or empty var is treated as SOLD OUT — the size is disabled and no
 *  anchor is rendered for it. A dead link is worse than an honest sold-out.
 */
const STRIPE_LINKS: Record<SizeKey, string | undefined> = {
  s: process.env.NEXT_PUBLIC_STRIPE_LINK_S,
  m: process.env.NEXT_PUBLIC_STRIPE_LINK_M,
  l: process.env.NEXT_PUBLIC_STRIPE_LINK_L,
  xl: process.env.NEXT_PUBLIC_STRIPE_LINK_XL,
  '2xl': process.env.NEXT_PUBLIC_STRIPE_LINK_2XL,
}

export type Size = {
  key: SizeKey
  /** What the customer sees on the chip. */
  label: string
  /** Stripe Payment Link, or null when the size isn't purchasable. */
  href: string | null
  soldOut: boolean
}

const SIZE_ORDER: { key: SizeKey; label: string }[] = [
  { key: 's', label: 'S' },
  { key: 'm', label: 'M' },
  { key: 'l', label: 'L' },
  { key: 'xl', label: 'XL' },
  { key: '2xl', label: '2XL' },
]

export const sizes: Size[] = SIZE_ORDER.map(({ key, label }) => {
  const href = STRIPE_LINKS[key]?.trim() || null
  return { key, label, href, soldOut: href === null }
})

export const allSoldOut = sizes.every((s) => s.soldOut)

/* ── The drop ───────────────────────────────────────────────────────────── */

export const drop = {
  /**
   * Pre-order close, as an ISO date-time with an explicit offset.
   * Leave as null until it's decided — the page will render "[DATE]"
   * everywhere the date appears rather than inventing one.
   *
   * e.g. '2026-09-12T23:59:00-05:00'
   */
  closeDate: null as string | null,

  /**
   * Force the page into a state regardless of the date. Useful for previewing
   * the closed page before the window actually ends. null = derive from closeDate.
   */
  forceState: null as 'open' | 'closed' | null,

  /** How long after close it ships. Shown as-is. */
  shipWindow: 'within 3 weeks of close',

  /** Price in cents. Bracketed in the brief — confirm before the link goes live. */
  priceCents: 4500,
  currency: 'USD',
} as const

export const priceFormatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: drop.currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(drop.priceCents / 100)

/** The literal string rendered anywhere a real date isn't known yet. */
export const DATE_PLACEHOLDER = '[DATE]'

export function closeDateLong(): string {
  if (!drop.closeDate) return DATE_PLACEHOLDER
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(drop.closeDate))
}

export function closeDateShort(): string {
  if (!drop.closeDate) return DATE_PLACEHOLDER
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(drop.closeDate))
}

/** Whole days left, or null when there's no date set or the window has passed. */
export function daysRemaining(now: Date = new Date()): number | null {
  if (!drop.closeDate) return null
  const ms = new Date(drop.closeDate).getTime() - now.getTime()
  if (ms <= 0) return null
  return Math.ceil(ms / 86_400_000)
}

export function dropState(now: Date = new Date()): 'open' | 'closed' {
  if (drop.forceState) return drop.forceState
  if (!drop.closeDate) return 'open'
  return new Date(drop.closeDate).getTime() > now.getTime() ? 'open' : 'closed'
}

/* ── Product ────────────────────────────────────────────────────────────── */

export const product = {
  name: 'RUN BACK TEE',
  /** The back print. Rendered as hand-lettered irregular capitals, never as body copy. */
  lyric: 'when you getting money this is how it goes',
  credit: {
    song: 'Run Back',
    artist: 'Cabbage',
    producer: 'Bkchapo',
    line: 'Lyric by Cabbage, from "Run Back", produced by Bkchapo.',
  },
} as const

/* ── Image slots ────────────────────────────────────────────────────────────
 *
 *  THIS IS THE ONE PLACE PHOTOS GET SWAPPED IN.
 *
 *  Drop the files into /public/product/ and set `src` to the path. While `src`
 *  is null the slot renders a drawn stand-in at the correct aspect ratio, so
 *  the layout doesn't move when the real photos land.
 *
 *  Keep `width`/`height` matched to the real file's pixel dimensions — they're
 *  what stops the page shifting while the image decodes.
 */
export type MediaSlot = {
  id: string
  src: string | null
  alt: string
  width: number
  height: number
  /** Which stand-in to draw while src is null. */
  placeholder: 'back' | 'front' | 'detail'
  /** Small caption under the slot. */
  caption: string
}

export const media: Record<'hero' | 'front' | 'detail', MediaSlot> = {
  hero: {
    id: 'back',
    src: null, // e.g. '/product/runback-back.jpg'
    alt: `Back of the ${product.name}, hand-lettered discharge print reading "${product.lyric}"`,
    width: 1200,
    height: 1500,
    placeholder: 'back',
    caption: 'Back print — discharge, natural white',
  },
  front: {
    id: 'front',
    src: null, // e.g. '/product/runback-front.jpg'
    alt: `Front of the ${product.name}, embroidered BKCHAPO wordmark on the left chest`,
    width: 1200,
    height: 1500,
    placeholder: 'front',
    caption: 'Front — embroidered chest',
  },
  detail: {
    id: 'detail',
    src: null, // e.g. '/product/runback-detail.jpg'
    alt: 'Close detail of the embroidered BKCHAPO wordmark',
    width: 1200,
    height: 900,
    placeholder: 'detail',
    caption: 'Chest detail',
  },
}

/** Placeholder caption shown on any slot still waiting on a real file. */
export const MEDIA_PENDING_NOTE = '[ product photo — sample not shot ]'

/* ── Copy ───────────────────────────────────────────────────────────────── */

export const copy = {
  hero: {
    kicker: 'MADEBYBK',
    releaseTag: 'PRE-ORDER',
    lead: 'A line from Bkchapo & Cabbage on "Run Back", printed across the back of a heavyweight black tee.',
    sub: 'Two weeks to order. I print what sells and nothing past that.',
    cta: 'Pre-order',
  },

  buy: {
    heading: 'Take one',
    sizeLegend: 'Size',
    fitHint: 'Cut boxy. Size down for a closer fit.',
    noSizeSelected: 'Select a size',
    buyPrefix: 'Pre-order',
    soldOut: 'Sold out',
    stripeNote: 'Checkout runs on Stripe. Address, shipping and receipt are handled there.',
  },

  closed: {
    heading: 'This one is closed',
    body: 'The window ended and the count went to the printer. Nothing else gets made in this run.',
    followOn: 'Next drop goes out the same way — through the link in the video description.',
  },

  confirmed: {
    heading: 'You are in the run',
    receipt: 'Stripe has your receipt on the way. That email is the record — keep it.',
    changes: 'Wrong size, wrong address, or you need out: reply to the Stripe receipt or write to me.',
    back: 'Back to the drop',
  },

  /**
   * Product spec. `label` runs in the narrow left rail, `body` in the wide column.
   * Facts I wasn't given are bracketed — fill them in, don't leave them live.
   */
  detail: [
    {
      label: 'Garment',
      body: 'Heavyweight black cotton, boxy fit. Dropped shoulder, wide rib at the neck, pre-shrunk. [BLANK — brand and style], [WEIGHT] oz ring-spun.',
    },
    {
      label: 'Print',
      body: 'Discharge ink, back print, full width. The process pulls the dye out of the cotton and the natural fibre colour comes back through, so the print sits in the shirt rather than on top of it. Soft from the first wear, and it ages with the garment instead of cracking off it.',
    },
    {
      label: 'Lettering',
      body: 'Hand-drawn irregular capitals, drawn once for this run. Uneven baselines and rough edges are the artwork, not a printing fault.',
    },
    {
      label: 'Chest',
      body: 'BKCHAPO embroidered small on the wearer’s left chest. [THREAD COLOR] on black.',
    },
    {
      label: 'Fit',
      body: 'Boxy through the body, short enough to sit at the hip. Model is [HEIGHT] wearing [SIZE]. Measurements below are the garment laid flat, in inches.',
    },
    {
      label: 'Care',
      body: 'Cold wash inside out, hang dry. No iron on the print.',
    },
  ],

  /** Size guide. Values stubbed — fill from the sample once it exists. */
  sizeGuide: {
    columns: ['Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: [
      { size: 'S', values: ['[ — ]', '[ — ]', '[ — ]', '[ — ]'] },
      { size: 'M', values: ['[ — ]', '[ — ]', '[ — ]', '[ — ]'] },
      { size: 'L', values: ['[ — ]', '[ — ]', '[ — ]', '[ — ]'] },
      { size: 'XL', values: ['[ — ]', '[ — ]', '[ — ]', '[ — ]'] },
      { size: '2XL', values: ['[ — ]', '[ — ]', '[ — ]', '[ — ]'] },
    ],
    note: 'Measured flat, in inches. Allow an inch either way.',
  },

  preorder: {
    heading: 'How the pre-order runs',
    steps: [
      {
        n: '01',
        title: 'Order',
        body: 'Pick a size and pay through Stripe. Card, Apple Pay or Google Pay. Nothing is made yet.',
      },
      {
        n: '02',
        title: 'The window closes',
        body: 'On {DATE}. The count goes straight to the printer that day and the order stops there.',
      },
      {
        n: '03',
        title: 'It ships',
        body: 'Within three weeks of close, with tracking by email. One shipment, no back-orders.',
      },
    ],
  },

  song: {
    heading: 'The song',
    body: 'The line on the back of this shirt is Cabbage’s, off "Run Back". The record it comes from is a producer album — seven artists, seven rooms, one desk.',
    /** Paste a Spotify / Apple / YouTube embed or link when it's live. */
    embedPlaceholder: '[EMBED — Spotify / Apple Music / YouTube]',
    listenLabel: 'Listen',
    listenHref: null as string | null,
  },

  footer: {
    /** Bracketed until you tell me which inbox to use. */
    email: '[EMAIL]',
    site: 'madebybk.xyz',
    siteHref: 'https://madebybk.xyz',
  },
} as const

/** The two words that run as the low-contrast background marquee. Decorative only. */
export const marqueeWords = ['MADEBYBK', 'JUSTFORFUN'] as const

export const meta = {
  title: `${product.name} — Bkchapo`,
  description: `Limited pre-order. "${product.lyric}" — a line from Cabbage on "Run Back", discharge printed on heavyweight black cotton. Closes ${DATE_PLACEHOLDER === closeDateLong() ? 'soon' : closeDateLong()}.`,
  /**
   * The domain this site lands on. Set it before launch — Open Graph tags need
   * an absolute URL, so link previews in Instagram, iMessage and Discord stay
   * broken until this is real. Left null rather than filled with a guess.
   */
  url: null as string | null,
} as const
