import { copy, sizes } from '@/lib/drop'

/**
 * A native radio group. Not divs with onClick.
 *
 * Everything that makes this accessible is browser behaviour we get for free
 * by using the right element: arrow keys move between sizes, focus roves
 * correctly, the legend names the group, and a disabled radio can't be
 * reached. The inputs are visually hidden but still focusable and still real —
 * `.size-input` clips them rather than using `display:none`, which would take
 * them out of the tab order and out of the form.
 *
 * There is exactly one of these on the page. The ids are load-bearing: the
 * :has() rules in globals.css key off #size-s … #size-2xl to drive both the
 * main buy button and the sticky bar with no JavaScript at all.
 */
export function SizePicker() {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-3 font-sans text-[0.68rem] font-medium tracking-[0.24em] text-ink-dim uppercase">
        {copy.buy.sizeLegend}
      </legend>

      <div className="flex max-w-[26rem] gap-2">
        {sizes.map((size) => (
          <div key={size.key} className="relative flex flex-1">
            <input
              type="radio"
              name="size"
              id={`size-${size.key}`}
              value={size.key}
              disabled={size.soldOut}
              className="size-input peer"
            />
            <label
              htmlFor={`size-${size.key}`}
              className="size-chip press"
              // Screen readers get the reason, not just a dead control.
              aria-label={size.soldOut ? `${size.label} — ${copy.buy.soldOut}` : size.label}
            >
              {size.label}
            </label>
          </div>
        ))}
      </div>

      <p className="mt-3 font-sans text-[0.8rem] leading-relaxed text-ink-dim">{copy.buy.fitHint}</p>
    </fieldset>
  )
}
