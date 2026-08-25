import Image from 'next/image'
import { MEDIA_PENDING_NOTE, product, type MediaSlot } from '@/lib/drop'
import { HandLettered } from './HandLettered'

/**
 * An image slot that knows it might not have an image yet.
 *
 * The sample isn't made, so `src` is null in lib/drop.ts and this draws the
 * garment instead — the real silhouette, the real print at the real place on
 * the back, the real chest mark. It is a drawing of the product, not a grey
 * box, and it reserves exactly the aspect ratio the photo will occupy so
 * nothing on the page moves when the files land.
 *
 * To swap in reality: put the file in /public/product/ and set `src` in
 * lib/drop.ts. Nothing here changes.
 */

function TeeSilhouette({ view }: { view: MediaSlot['placeholder'] }) {
  return (
    <svg
      viewBox="0 0 400 500"
      className="h-full w-full"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Boxy body, dropped shoulder, wide neck rib. */}
      <path
        d="M152 46c0 0 8 32 48 32s48-32 48-32l48 16 48 86-44 28-8-12v288H108V164l-8 12-44-28 48-86z"
        fill="var(--color-char)"
        stroke="var(--color-line)"
        strokeWidth="1.5"
      />
      {/* Neck rib */}
      <path
        d="M152 46c0 0 8 32 48 32s48-32 48-32"
        fill="none"
        stroke="var(--color-line)"
        strokeWidth="1.5"
      />
      <path
        d="M158 54c0 0 10 30 42 30s42-30 42-30"
        fill="none"
        stroke="var(--color-line)"
        strokeWidth="1"
        opacity="0.7"
      />
      {/* Sleeve seams */}
      <path d="M108 164l-8 12M292 164l8 12" stroke="var(--color-line)" strokeWidth="1" opacity="0.7" />
      {/* Hem */}
      <path d="M108 436h184" stroke="var(--color-line)" strokeWidth="1" opacity="0.6" />

      {view === 'front' ? (
        <>
          {/* Embroidered chest mark sits on the wearer's left — camera right. */}
          <text
            x="248"
            y="150"
            textAnchor="middle"
            fill="var(--color-thread)"
            opacity="0.75"
            fontFamily="var(--font-sans)"
            fontSize="11"
            letterSpacing="2.4"
            fontWeight="700"
          >
            BKCHAPO
          </text>
          <path d="M214 158h68" stroke="var(--color-thread)" strokeWidth="0.75" opacity="0.35" strokeDasharray="2 3" />
        </>
      ) : null}
    </svg>
  )
}

function DetailPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-char">
      <div className="text-center">
        <div className="font-sans text-[clamp(1rem,4vw,1.6rem)] font-bold tracking-[0.42em] text-thread">
          BKCHAPO
        </div>
        {/* Stitch line — the mark is embroidered, not printed. */}
        <div
          className="mx-auto mt-3 h-px w-full max-w-[14rem]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--color-thread) 0 5px, transparent 5px 10px)',
            opacity: 0.45,
          }}
        />
      </div>
    </div>
  )
}

export function ProductSlot({
  slot,
  priority = false,
  sizes = '(min-width: 768px) 45vw, 92vw',
  className = '',
}: {
  slot: MediaSlot
  priority?: boolean
  sizes?: string
  className?: string
}) {
  const ratio = `${slot.width} / ${slot.height}`

  return (
    <figure className={className}>
      <div
        className="relative w-full overflow-hidden border border-line bg-char"
        style={{ aspectRatio: ratio }}
      >
        {slot.src ? (
          <Image
            src={slot.src}
            alt={slot.alt}
            width={slot.width}
            height={slot.height}
            sizes={sizes}
            priority={priority}
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <TeeSilhouette view={slot.placeholder} />

            {slot.placeholder === 'detail' ? (
              <div className="absolute inset-0">
                <DetailPlaceholder />
              </div>
            ) : null}

            {slot.placeholder === 'back' ? (
              // The print, where it actually sits on the garment.
              <div className="pointer-events-none absolute inset-x-[28%] top-[38%] flex items-start justify-center">
                <HandLettered
                  text={product.lyric}
                  // Too small for the filter — it would smudge into mush.
                  // The per-letter jitter alone carries it at this size.
                  rough="none"
                  className="font-display text-center text-[clamp(0.6rem,2.1vw,1.05rem)] leading-[0.92] tracking-[0.02em] text-ink/45"
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-sans text-[0.68rem] tracking-[0.18em] text-ink-dim uppercase">
        <span>{slot.caption}</span>
        {slot.src ? null : <span className="text-ink-dim/80 normal-case tracking-normal">{MEDIA_PENDING_NOTE}</span>}
      </figcaption>
    </figure>
  )
}
