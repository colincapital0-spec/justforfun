'use client'

import { useEffect, useState } from 'react'

/**
 * The only client component in the project.
 *
 * All it decides is whether the bar is on screen. The bar's contents are
 * server rendered and passed through as children, and the size it buys is
 * still driven by the CSS :has() rules in globals.css, not by state up here.
 * With JavaScript off the bar simply never appears and the main buy block is
 * untouched — nothing about buying the shirt depends on this file.
 *
 * This measures on scroll rather than with an IntersectionObserver, which was
 * the first thing tried and is wrong here. An observer only fires when an
 * element crosses a threshold, and a scroll that jumps clean over the
 * sentinel — an in-page anchor, a restored scroll position, a fast fling past
 * a one-pixel target — never crosses it: the sentinel goes from "below the
 * viewport, not intersecting" to "above the viewport, not intersecting" with
 * no callback in between, and the bar stays hidden for the rest of the
 * session. Reading the rect on scroll is always right regardless of how the
 * scroll happened, and rAF-coalesced behind a passive listener it costs one
 * layout read per frame while scrolling and nothing at rest.
 */
export function StickyBuyBar({
  sentinelId,
  children,
}: {
  sentinelId: string
  children: React.ReactNode
}) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId)
    if (!sentinel) return

    let frame = 0
    const measure = () => {
      frame = 0
      // Show only once the buy block has passed above the viewport.
      setShown(sentinel.getBoundingClientRect().bottom < 0)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [sentinelId])

  return (
    <div
      className="sticky-bar fixed inset-x-0 bottom-0 z-50 border-t border-line bg-char px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      data-shown={shown}
      // Hidden means unreachable: no stray tab stops behind an off-screen bar.
      inert={!shown}
    >
      {children}
    </div>
  )
}
