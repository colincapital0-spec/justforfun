import { copy, priceFormatted, sizes } from '@/lib/drop'

/**
 * The buy control.
 *
 * Not one anchor whose href gets rewritten by JavaScript — a stack of one
 * inert <span> plus one real <a> per purchasable size, with CSS revealing
 * exactly one of them based on which radio is checked. Consequences worth
 * keeping:
 *
 *   · No size selected renders a <span>, so there is nothing to click, nothing
 *     to focus and nothing to tab into by accident. A disabled-looking anchor
 *     that still navigates is the failure mode this avoids.
 *   · A size with no Stripe link never renders an anchor at all. Missing env
 *     var means sold out, never a dead link.
 *   · It works with JavaScript switched off, and it works before hydration.
 *
 * Rendered twice — once in the buy block, once in the sticky bar. Both live
 * inside the same <form>, so both read the same checked radio. One source of
 * truth, no mirrored state.
 */

type Variant = 'primary' | 'bar'

export function BuyLinks({ variant = 'primary' }: { variant?: Variant }) {
  const available = sizes.filter((size) => !size.soldOut)

  const shared =
    'press w-full items-center justify-center gap-3 border font-display font-bold uppercase tracking-[0.14em] text-center'

  const live =
    variant === 'primary'
      ? `${shared} min-h-[3.75rem] border-ink bg-ink px-6 text-[1.35rem] text-void hover:shadow-[inset_0_-5px_0_0_var(--color-thread)]`
      : `${shared} min-h-[3.25rem] border-ink bg-ink px-5 text-[1.1rem] text-void hover:shadow-[inset_0_-4px_0_0_var(--color-thread)]`

  const inert =
    variant === 'primary'
      ? `${shared} min-h-[3.75rem] cursor-not-allowed border-line bg-transparent px-6 text-[1.35rem] text-ink-dim`
      : `${shared} min-h-[3.25rem] cursor-not-allowed border-line bg-transparent px-5 text-[1.1rem] text-ink-dim`

  if (available.length === 0) {
    return (
      <div className={inert} role="status">
        {copy.buy.soldOut}
      </div>
    )
  }

  return (
    <div className="buy-slot w-full">
      {/* Nothing chosen yet. A span: genuinely not actionable. */}
      <span data-buy="none" className={inert}>
        {copy.buy.noSizeSelected}
      </span>

      {available.map((size) => (
        <a
          key={size.key}
          data-buy={size.key}
          href={size.href as string}
          className={live}
          // Same tab: Stripe's redirect back to ?ordered=1 then lands the
          // customer on the confirmation state instead of stranding a stale
          // page behind a new one.
          rel="noopener"
        >
          <span>
            {copy.buy.buyPrefix} — {size.label}
          </span>
          <span aria-hidden="true" className="text-void/45">
            /
          </span>
          <span>{priceFormatted}</span>
        </a>
      ))}
    </div>
  )
}
