import { marqueeWords } from '@/lib/drop'

/**
 * MADEBYBK / JUSTFORFUN as two slow opposing bands of very low contrast type.
 *
 * Deliberately the boring version of this convention: constant speed, one
 * axis, seamless loop, no drift and no bounce. The track holds two copies of
 * the same run and translates exactly -50%, which is what makes the wrap
 * invisible.
 *
 * It is decorative and aria-hidden. It never sits under a CTA — the buy block
 * and the sticky bar both paint an opaque --char panel over it.
 */

function Band({ word, dir, duration }: { word: string; dir: 'left' | 'right'; duration: string }) {
  // Two identical halves. The animation moves exactly one half-width.
  const run = Array.from({ length: 6 }, (_, i) => (
    <span key={i} className="px-[0.18em]">
      {word}
    </span>
  ))

  return (
    <div className="marquee-band">
      <div
        className="marquee-track font-display text-ghost text-[24vw] leading-[0.78] font-extrabold tracking-[-0.02em] sm:text-[18vw]"
        data-dir={dir}
        style={{ ['--marquee-duration' as string]: duration }}
      >
        <span className="flex shrink-0">{run}</span>
        <span className="flex shrink-0">{run}</span>
      </div>
    </div>
  )
}

export function BackgroundMarquee() {
  const [first, second] = marqueeWords

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 flex flex-col justify-between overflow-hidden py-[12vh] select-none">
      <Band word={first} dir="left" duration="96s" />
      <Band word={second} dir="right" duration="124s" />
    </div>
  )
}
