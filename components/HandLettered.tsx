/**
 * The lyric, set the way it's printed: hand-drawn irregular capitals.
 *
 * This is a treatment, not a font choice. Every character gets its own
 * rotation, scale, baseline offset and stroke weight, and the whole block is
 * pushed through one SVG turbulence filter so the edges bleed like ink into
 * cotton rather than sitting crisp on top of it.
 *
 * The jitter is derived from a 32-bit integer hash of the character index, not
 * Math.random and not Math.sin — integer math is bit-identical on the server
 * and in the browser, so the markup React renders on the server is the markup
 * it hydrates to. A floating-point PRNG here would produce a hydration
 * mismatch on every letter.
 *
 * Accessibility: the letter spans are decorative debris. The real line is
 * carried once, in order, by a visually hidden span.
 */

/** Knuth multiplicative hash + xorshift finalizer → deterministic 0..1. */
function noise(index: number, salt: number): number {
  let h = (Math.imul(index + 1, 2654435761) ^ Math.imul(salt + 1, 40503)) >>> 0
  h ^= h >>> 15
  h = Math.imul(h, 2246822519) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 3266489917) >>> 0
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

/** Map a 0..1 hash onto a symmetric range around zero. */
function spread(index: number, salt: number, amount: number): number {
  return (noise(index, salt) * 2 - 1) * amount
}

type Props = {
  text: string
  /** Extra classes for sizing/colour — the caller decides the scale. */
  className?: string
  /**
   * How hard to rough the edges. The SVG displacement is measured in user
   * units, not ems, so a filter tuned for a 2rem line does nothing visible at
   * 9rem — display-scale type needs its own, coarser filter. 'none' for
   * anywhere the type is small enough to smudge.
   */
  rough?: 'text' | 'display' | 'none'
  /** Override the text read out, e.g. to fold the product name into a heading. */
  label?: string
}

export function HandLettered({ text, className = '', rough = 'text', label }: Props) {
  const words = text.split(' ')
  let charIndex = 0

  return (
    <span className={className}>
      <span className="sr-only">{label ?? text}</span>
      <span aria-hidden="true" className={rough === 'none' ? undefined : `hand-rough-${rough}`}>
        {words.map((word, w) => {
          const letters = [...word].map((char) => {
            const i = charIndex++
            return (
              <span
                key={i}
                className="hand-letter"
                style={{
                  // ±2.4° of tilt, so no two letters stand the same way.
                  transform: `rotate(${spread(i, 1, 2.4).toFixed(2)}deg) translateY(${spread(i, 3, 0.055).toFixed(3)}em)`,
                  // Letters vary in size the way a hand varies pressure.
                  fontSize: `${(0.93 + noise(i, 2) * 0.15).toFixed(3)}em`,
                  // Uneven stroke weight — the tell that separates lettering from type.
                  fontWeight: 600 + Math.round(noise(i, 4) * 3) * 60,
                  marginRight: `${spread(i, 5, 0.012).toFixed(3)}em`,
                }}
              >
                {char.toUpperCase()}
              </span>
            )
          })

          return (
            <span key={w}>
              {/* Words stay whole; lines break between them, never inside one. */}
              <span className="inline-block whitespace-nowrap">{letters}</span>
              {w < words.length - 1 ? <span className="inline-block w-[0.28em]"> </span> : null}
            </span>
          )
        })}
      </span>
    </span>
  )
}

/**
 * The roughening filter. Rendered once per page, referenced by class.
 * Kept gentle — enough to break the vector edge, not enough to blur the line.
 */
export function HandRoughFilter() {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute h-0 w-0" width="0" height="0">
      <defs>
        <filter id="hand-rough-text" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.028 0.045" numOctaves={3} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={3.2} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="hand-rough-display" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.016" numOctaves={3} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
