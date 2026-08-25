import {
  allSoldOut,
  closeDateLong,
  closeDateShort,
  copy,
  daysRemaining,
  drop,
  dropState,
  media,
  priceFormatted,
  product,
} from '@/lib/drop'
import { BackgroundMarquee } from '@/components/BackgroundMarquee'
import { BuyLinks } from '@/components/BuyLinks'
import { Confirmed } from '@/components/Confirmed'
import { Grain } from '@/components/Grain'
import { HandLettered, HandRoughFilter } from '@/components/HandLettered'
import { ProductSlot } from '@/components/ProductSlot'
import { SizePicker } from '@/components/SizePicker'
import { StickyBuyBar } from '@/components/StickyBuyBar'

/**
 * The drop page itself.
 *
 * This is its own site, not a section of anything else, so the page is mounted
 * at BOTH `/` and `/runback` (see app/page.tsx and app/runback/page.tsx) —
 * whichever URL the link in a video description or a bio ends up using, it
 * resolves. The implementation lives here so neither route is the "real" one.
 *
 * Reading searchParams makes it dynamic, which is what we want: the
 * days-remaining figure and the open/closed state should never be served from
 * a stale cache while a deadline is running.
 */

const SENTINEL = 'buy-block-end'

/** Small caps label for the narrow left rail. */
function Rail({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 md:col-span-3 md:flex-col md:gap-2">
      <span className="font-display text-[0.95rem] leading-none font-bold text-thread">{n}</span>
      <h2 className="font-sans text-[0.68rem] font-medium tracking-[0.24em] text-ink-dim uppercase">
        {children}
      </h2>
    </div>
  )
}

function Deadline({ className = '', closed = false }: { className?: string; closed?: boolean }) {
  const days = daysRemaining()
  return (
    <p className={`font-sans text-[0.72rem] tracking-[0.2em] uppercase ${className}`}>
      <span className="text-ink-dim">{closed ? 'Pre-order closed ' : 'Pre-order closes '}</span>
      <span className="text-thread">{closeDateLong()}</span>
      {!closed && days !== null ? <span className="text-ink-dim"> — {days} days left</span> : null}
    </p>
  )
}

export default async function DropPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

  const ordered = first(params.ordered) === '1'
  const state = dropState()
  const open = state === 'open' && !allSoldOut

  if (ordered) {
    return (
      <>
        <Grain />
        <HandRoughFilter />
        <BackgroundMarquee />
        <main className="relative z-10">
          <Confirmed size={first(params.size)} session={first(params.session)} />
          <SiteFooter />
        </main>
      </>
    )
  }

  return (
    <>
      <Grain />
      <HandRoughFilter />
      <BackgroundMarquee />

      {/* Everything that reads the selected size lives inside .drop-root, so
          one set of :has() rules in globals.css drives both the buy block and
          the sticky bar. No JavaScript, one source of truth. */}
      <div className="drop-root relative z-10">
        <main>
          {/* ── 01 · Hero ───────────────────────────────────────────────── */}
          <section className="mx-auto w-full max-w-[80rem] px-5 pt-10 pb-20 sm:px-8 md:pt-16 md:pb-32">
            <div className="reveal flex items-baseline justify-between gap-4" style={{ ['--d' as string]: '0ms' }}>
              <span className="font-display text-[1.05rem] leading-none font-bold tracking-[0.22em] text-ink uppercase">
                {copy.hero.kicker}
              </span>
              <span className="font-sans text-[0.66rem] tracking-[0.24em] text-ink-dim uppercase">
                {copy.hero.releaseTag}
              </span>
            </div>

            <div className="mt-10 md:mt-16 md:grid md:grid-cols-12">
              {/* The lyric is the dominant element. It hangs off the left edge
                  on wide screens so the composition never sits centred. */}
              <div className="relative z-10 md:col-start-1 md:col-end-9 md:row-start-1 md:-ml-[1vw]">
                <h1
                  className="reveal"
                  style={{ ['--d' as string]: '120ms' }}
                >
                  <HandLettered
                    text={product.lyric}
                    label={`${product.name} — ${product.lyric}`}
                    rough="display"
                    className="block font-display text-[clamp(2.9rem,13.5vw,9.5rem)] leading-[0.82] font-extrabold tracking-[-0.015em] text-ink"
                  />
                </h1>

                <div className="reveal mt-8 max-w-[38ch] md:mt-12" style={{ ['--d' as string]: '260ms' }}>
                  <p className="font-sans text-[1.05rem] leading-relaxed text-ink">{copy.hero.lead}</p>
                  <p className="mt-3 font-sans text-[1.05rem] leading-relaxed text-ink-dim">
                    {copy.hero.sub}
                  </p>
                </div>

                <div className="reveal mt-10" style={{ ['--d' as string]: '380ms' }}>
                  {open ? (
                    <a
                      href="#buy"
                      className="press inline-flex min-h-[3.5rem] items-center gap-3 border border-ink bg-ink px-7 font-display text-[1.3rem] font-bold tracking-[0.14em] text-void uppercase hover:shadow-[inset_0_-5px_0_0_var(--color-thread)]"
                    >
                      {copy.hero.cta}
                      <span aria-hidden="true" className="text-void/45">
                        /
                      </span>
                      {priceFormatted}
                    </a>
                  ) : (
                    <p className="font-display text-[1.3rem] font-bold tracking-[0.14em] text-ink-dim uppercase">
                      {allSoldOut && state === 'open' ? copy.buy.soldOut : copy.closed.heading}
                    </p>
                  )}
                  <Deadline className="mt-5" closed={!open} />
                </div>
              </div>

              {/* The shot is landscape, so it needs width to read as the hero
                  rather than a thumbnail — seven columns, hanging off the right
                  edge. It sits in the grid's second row rather than behind the
                  type: the photo's ground is pale concrete, and the headline
                  set in --ink over that is barely legible. Row 2 starts
                  wherever the type stops, so this holds at every width instead
                  of needing a hand-tuned top margin per breakpoint. The
                  negative pull raises it beside the lead copy, which is narrow
                  enough (38ch) to stay clear of this column. */}
              <div
                className="reveal mt-14 md:col-start-6 md:col-end-13 md:row-start-2 md:-mt-[14rem] md:-mr-[3vw]"
                style={{ ['--d' as string]: '320ms' }}
              >
                <ProductSlot slot={media.hero} priority sizes="(min-width: 768px) 58vw, 92vw" />
              </div>
            </div>
          </section>

          {/* ── 02 · Buy ────────────────────────────────────────────────── */}
          <section id="buy" className="mx-auto w-full max-w-[80rem] px-5 sm:px-8">
            {/* Opaque panel: the background marquee never runs under a CTA. */}
            <div className="border border-line bg-char px-5 py-10 sm:px-10 md:py-14">
              <div className="md:grid md:grid-cols-12 md:gap-10">
                <div className="md:col-span-5">
                  <h2 className="font-display text-[clamp(2.25rem,7vw,3.75rem)] leading-[0.9] font-extrabold tracking-[-0.01em] text-ink uppercase">
                    {copy.buy.heading}
                  </h2>
                  <p className="mt-4 font-display text-[2rem] leading-none font-bold text-ink">
                    {priceFormatted}
                  </p>
                  <Deadline className="mt-6" closed={!open} />
                  {open ? (
                    <p className="mt-2 font-sans text-[0.8rem] leading-relaxed text-ink-dim">
                      Ships {drop.shipWindow}.
                    </p>
                  ) : null}
                </div>

                <div className="mt-10 md:col-span-7 md:mt-0">
                  {open ? (
                    <>
                      <SizePicker />
                      <div className="mt-8">
                        <BuyLinks />
                      </div>
                      <p className="mt-4 font-sans text-[0.8rem] leading-relaxed text-ink-dim">
                        {copy.buy.stripeNote}
                      </p>
                    </>
                  ) : (
                    <div className="border border-line p-6">
                      <h3 className="font-display text-[1.75rem] leading-none font-bold text-ink uppercase">
                        {allSoldOut && state === 'open' ? copy.buy.soldOut : copy.closed.heading}
                      </h3>
                      <p className="mt-4 max-w-[44ch] font-sans text-[0.95rem] leading-relaxed text-ink-dim">
                        {copy.closed.body}
                      </p>
                      <p className="mt-3 max-w-[44ch] font-sans text-[0.95rem] leading-relaxed text-ink-dim">
                        {copy.closed.followOn}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Watched by the sticky bar. */}
            <div id={SENTINEL} aria-hidden="true" className="h-px w-full" />
          </section>

          {/* ── 03 · Product ────────────────────────────────────────────── */}
          <section className="mx-auto w-full max-w-[80rem] px-5 pt-24 sm:px-8 md:pt-36">
            <div className="md:grid md:grid-cols-12 md:gap-10">
              <Rail n="01">The garment</Rail>
              <div className="mt-8 md:col-span-9 md:mt-0">
                {/* Two shots exist: the back carries the hero, the front sits here. */}
                <div className="max-w-[34rem]">
                  <ProductSlot slot={media.front} sizes="(min-width: 768px) 40vw, 92vw" />
                </div>

                <dl className="mt-16 border-t border-line">
                  {copy.detail.map((item) => (
                    <div key={item.label} className="border-b border-line py-6 md:grid md:grid-cols-12 md:gap-8">
                      <dt className="font-sans text-[0.68rem] font-medium tracking-[0.24em] text-ink-dim uppercase md:col-span-3">
                        {item.label}
                      </dt>
                      <dd className="mt-3 max-w-[62ch] font-sans text-[1rem] leading-relaxed text-ink md:col-span-9 md:mt-0">
                        {item.body}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* Size guide */}
                <div className="mt-16">
                  <h3 className="font-sans text-[0.68rem] font-medium tracking-[0.24em] text-ink-dim uppercase">
                    Size guide
                  </h3>
                  <div className="mt-5 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                    <table className="w-full min-w-[30rem] border-collapse text-left">
                      <caption className="sr-only">
                        {product.name} measurements, garment laid flat, in inches
                      </caption>
                      <thead>
                        <tr className="border-b border-line">
                          <th scope="col" className="py-3 pr-4 font-sans text-[0.66rem] font-medium tracking-[0.2em] text-ink-dim uppercase">
                            Size
                          </th>
                          {copy.sizeGuide.columns.map((column) => (
                            <th
                              key={column}
                              scope="col"
                              className="py-3 pr-4 font-sans text-[0.66rem] font-medium tracking-[0.2em] text-ink-dim uppercase"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {copy.sizeGuide.rows.map((row) => (
                          <tr key={row.size} className="border-b border-line">
                            <th scope="row" className="py-3 pr-4 font-display text-[1.15rem] font-bold text-ink">
                              {row.size}
                            </th>
                            {row.values.map((value, i) => (
                              <td key={i} className="py-3 pr-4 font-sans text-[0.9rem] text-ink-dim">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 font-sans text-[0.8rem] text-ink-dim">{copy.sizeGuide.note}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 04 · How the pre-order runs ─────────────────────────────── */}
          <section className="mx-auto w-full max-w-[80rem] px-5 pt-24 sm:px-8 md:pt-36">
            <div className="md:grid md:grid-cols-12 md:gap-10">
              <Rail n="02">Pre-order</Rail>
              <div className="mt-8 md:col-span-9 md:mt-0">
                <h3 className="font-display text-[clamp(2rem,6vw,3.25rem)] leading-[0.92] font-extrabold tracking-[-0.01em] text-ink uppercase">
                  {copy.preorder.heading}
                </h3>
                <ol className="mt-10 border-t border-line">
                  {copy.preorder.steps.map((step) => (
                    <li key={step.n} className="border-b border-line py-7 md:grid md:grid-cols-12 md:gap-8">
                      <div className="flex items-baseline gap-4 md:col-span-3">
                        <span className="font-display text-[1.4rem] leading-none font-bold text-ink-dim">
                          {step.n}
                        </span>
                        <span className="font-display text-[1.4rem] leading-none font-bold text-ink uppercase">
                          {step.title}
                        </span>
                      </div>
                      <p className="mt-3 max-w-[58ch] font-sans text-[1rem] leading-relaxed text-ink md:col-span-9 md:mt-0">
                        {step.body.split('{DATE}').map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 ? (
                              <span className="text-thread">{closeDateLong()}</span>
                            ) : null}
                          </span>
                        ))}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* ── 05 · The song ───────────────────────────────────────────── */}
          <section className="mx-auto w-full max-w-[80rem] px-5 pt-24 sm:px-8 md:pt-36">
            <div className="md:grid md:grid-cols-12 md:gap-10">
              <Rail n="03">The song</Rail>
              <div className="mt-8 md:col-span-9 md:mt-0">
                <p className="font-display text-[clamp(2rem,6vw,3.25rem)] leading-[0.92] font-extrabold tracking-[-0.01em] text-ink uppercase">
                  {product.credit.song}
                  <span className="text-ink-dim"> — {product.credit.artist}</span>
                </p>
                <p className="mt-6 max-w-[52ch] font-sans text-[1.05rem] leading-relaxed text-ink">
                  {copy.song.body}
                </p>
                <p className="mt-6 font-sans text-[0.8rem] tracking-[0.16em] text-ink-dim uppercase">
                  {product.credit.line}
                </p>

                {/* Room for the embed. Sized now so nothing moves when it lands. */}
                <div className="mt-10 max-w-[38rem]">
                  {copy.song.listenHref ? (
                    <a
                      href={copy.song.listenHref}
                      className="press inline-flex min-h-[3rem] items-center border border-line px-6 font-display text-[1.1rem] font-bold tracking-[0.14em] text-ink uppercase hover:border-thread hover:text-thread"
                    >
                      {copy.song.listenLabel}
                    </a>
                  ) : (
                    <div className="flex min-h-[9.5rem] items-center justify-center border border-dashed border-line px-6 text-center font-sans text-[0.8rem] tracking-[0.16em] text-ink-dim uppercase">
                      {copy.song.embedPlaceholder}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <SiteFooter />
        </main>

        {/* Reachable buy control once the buy block is behind you. Its link is
            driven by the same checked radio as the block above. */}
        {open ? (
          <StickyBuyBar sentinelId={SENTINEL}>
            <div className="mx-auto flex w-full max-w-[80rem] items-center gap-4">
              <div className="hidden shrink-0 sm:block">
                <p className="font-display text-[1.15rem] leading-none font-bold text-ink uppercase">
                  {product.name}
                </p>
                <p className="mt-1 font-sans text-[0.66rem] tracking-[0.2em] text-ink-dim uppercase">
                  Closes {closeDateShort()}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <BuyLinks variant="bar" />
              </div>
            </div>
          </StickyBuyBar>
        ) : null}
      </div>
    </>
  )
}

function SiteFooter() {
  return (
    <footer className="mx-auto mt-28 w-full max-w-[80rem] border-t border-line px-5 py-12 sm:px-8 md:mt-40">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-baseline sm:justify-between">
        <a
          href={`mailto:${copy.footer.email}`}
          className="inline-flex min-h-11 items-center font-sans text-[0.9rem] text-ink underline decoration-line underline-offset-4 hover:decoration-thread"
        >
          {copy.footer.email}
        </a>
        <a
          href={copy.footer.siteHref}
          className="inline-flex min-h-11 items-center font-display text-[1.05rem] font-bold tracking-[0.22em] text-ink uppercase hover:text-thread"
        >
          {copy.footer.site}
        </a>
      </div>
      {/* Padding so the sticky bar never covers the last line. */}
      <div aria-hidden="true" className="h-16" />
    </footer>
  )
}
