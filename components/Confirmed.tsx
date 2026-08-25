import Link from 'next/link'
import { closeDateLong, copy, drop, priceFormatted, product, sizes, type SizeKey } from '@/lib/drop'
import { HandLettered } from './HandLettered'

/**
 * Where Stripe drops the customer back.
 *
 * This is a receipt echo, NOT proof of payment. There is no backend and no
 * secret key in this project, so the session id can't be verified against
 * Stripe — anyone can type this URL. That's fine for what it is: a decent
 * landing after checkout instead of the bare product page. Stripe's own
 * receipt email is the actual record of the order, and the copy says so.
 *
 * Server rendered, so it works with JavaScript off.
 */

function resolveSize(raw: string | undefined): { label: string } | null {
  if (!raw) return null
  const key = raw.toLowerCase() as SizeKey
  return sizes.find((size) => size.key === key) ?? null
}

/** Only echo a session reference that looks like a Stripe one, and only a stub of it. */
function resolveReference(raw: string | undefined): string | null {
  if (!raw || !/^cs_[A-Za-z0-9_]{8,}$/.test(raw)) return null
  return raw.slice(-8).toUpperCase()
}

export function Confirmed({ size, session }: { size?: string; session?: string }) {
  const chosen = resolveSize(size)
  const reference = resolveReference(session)

  return (
    <section className="relative z-10 mx-auto w-full max-w-[68rem] px-5 pt-16 pb-20 sm:px-8 md:pt-24">
      <p className="reveal font-sans text-[0.68rem] font-medium tracking-[0.28em] text-thread uppercase" style={{ ['--d' as string]: '0ms' }}>
        Order received
      </p>

      <h1
        className="reveal mt-5 font-display text-[clamp(2.75rem,11vw,6.5rem)] leading-[0.86] font-extrabold tracking-[-0.01em] text-ink uppercase"
        style={{ ['--d' as string]: '90ms' }}
      >
        {copy.confirmed.heading}
      </h1>

      <div
        className="reveal mt-10 grid gap-px border border-line bg-line sm:grid-cols-3"
        style={{ ['--d' as string]: '180ms' }}
      >
        <div className="bg-char p-5">
          <dl>
            <dt className="font-sans text-[0.64rem] tracking-[0.22em] text-ink-dim uppercase">Item</dt>
            <dd className="mt-2 font-display text-[1.5rem] leading-none font-bold text-ink uppercase">
              {product.name}
            </dd>
          </dl>
        </div>

        <div className="bg-char p-5">
          <dl>
            <dt className="font-sans text-[0.64rem] tracking-[0.22em] text-ink-dim uppercase">Size</dt>
            <dd className="mt-2 font-display text-[1.5rem] leading-none font-bold text-ink uppercase">
              {chosen ? chosen.label : 'On your receipt'}
            </dd>
          </dl>
        </div>

        <div className="bg-char p-5">
          <dl>
            <dt className="font-sans text-[0.64rem] tracking-[0.22em] text-ink-dim uppercase">Paid</dt>
            <dd className="mt-2 font-display text-[1.5rem] leading-none font-bold text-ink uppercase">
              {priceFormatted}
            </dd>
          </dl>
        </div>
      </div>

      <div className="reveal mt-12 grid gap-10 md:grid-cols-12" style={{ ['--d' as string]: '260ms' }}>
        <div className="md:col-span-4">
          <h2 className="font-sans text-[0.68rem] font-medium tracking-[0.24em] text-ink-dim uppercase">
            Shipping
          </h2>
        </div>
        <div className="md:col-span-8">
          <p className="max-w-[46ch] font-sans text-[1.05rem] leading-relaxed text-ink">
            The pre-order closes {closeDateLong()}. Yours ships {drop.shipWindow}, with tracking by
            email.
          </p>
          <p className="mt-4 max-w-[46ch] font-sans text-[0.95rem] leading-relaxed text-ink-dim">
            {copy.confirmed.receipt}
          </p>
          <p className="mt-3 max-w-[46ch] font-sans text-[0.95rem] leading-relaxed text-ink-dim">
            {copy.confirmed.changes}{' '}
            <a href={`mailto:${copy.footer.email}`} className="text-ink underline decoration-line underline-offset-4 hover:decoration-thread">
              {copy.footer.email}
            </a>
          </p>
          {reference ? (
            <p className="mt-6 font-sans text-[0.75rem] tracking-[0.16em] text-ink-dim uppercase">
              Reference {reference}
            </p>
          ) : null}
        </div>
      </div>

      <div className="reveal mt-16 border-t border-line pt-10" style={{ ['--d' as string]: '340ms' }}>
        <HandLettered
          text={product.lyric}
          className="block font-display text-[clamp(1.4rem,6vw,3rem)] leading-[0.94] font-bold text-ink/70"
        />
        <Link
          href="/"
          className="press mt-8 inline-flex min-h-[3rem] items-center border border-line px-6 font-display text-[1.1rem] font-bold tracking-[0.14em] text-ink uppercase hover:border-thread hover:text-thread"
        >
          {copy.confirmed.back}
        </Link>
      </div>
    </section>
  )
}
