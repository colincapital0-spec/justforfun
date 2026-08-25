# RUN BACK — drop site

A standalone pre-order page for the RUN BACK TEE. Ships to `madebybk.com/runback`.
Not a catalog product, not linked from the nav.

Next.js (App Router) + TypeScript + Tailwind. No database, no backend, no payment
code. Stripe Payment Links do checkout; the Stripe dashboard is the admin.

```bash
npm install
cp .env.example .env.local     # then paste your five Payment Links in
npm run dev                    # http://localhost:3000/runback
```

---

## The one file you edit

**`lib/drop.ts`** holds every product fact, every date and every sentence on the
page. Price, sizes, close date, ship window, spec copy, size guide, the credit
line, the contact email, the image slots. Nothing is hard-coded in the JSX — if
you're editing a component to change a fact, something has gone wrong.

Anything written in `[BRACKETS]` is a placeholder that renders **visibly on the
live page** as brackets. That's deliberate. Search the file for `[` before you
launch and fill in what's missing:

| Placeholder | Where it shows | What it needs |
|---|---|---|
| `[DATE]` | hero, buy block, step 02, sticky bar | set `closeDate` (below) |
| `[EMAIL]` | footer, confirmation page | the inbox you want customers writing to |
| `[BLANK — brand and style]`, `[WEIGHT]` | garment spec | the blank you're printing on |
| `[THREAD COLOR]` | chest spec | the embroidery thread |
| `[HEIGHT]`, `[SIZE]` | fit note | model height and the size worn |
| `[ — ]` × 20 | size guide table | measurements off the sample, flat, in inches |
| `[EMBED — …]` | song section | set `copy.song.listenHref`, or drop an embed in |

The price is set from the brief at **$45** (`drop.priceCents = 4500`). Confirm it
matches the Payment Links before you share the link — the page and Stripe don't
talk to each other, so a mismatch here is a mismatch the customer sees at checkout.

---

## Stripe — five Payment Links

Create one Payment Link per size in the Stripe dashboard, all pointing at the same
product at the same price. Stripe collects the address, applies shipping and tax,
sends the receipt and handles refunds. None of that lives in this codebase.

**1. Set the env vars.** In `.env.local` for development, and in Vercel →
Project → Settings → Environment Variables for production:

```
NEXT_PUBLIC_STRIPE_LINK_S=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_M=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_L=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_XL=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_2XL=https://buy.stripe.com/...
```

They must be `NEXT_PUBLIC_` — the browser needs them, and they're public URLs
anyway, not secrets.

**A missing or empty var means that size is sold out.** The chip renders disabled
and struck through, and no link is rendered for it at all. That's the intended way
to kill a size mid-drop: blank the var and redeploy. Never a dead button.

These are read as literal `process.env.NEXT_PUBLIC_STRIPE_LINK_S` accesses in
`lib/drop.ts`. Next only inlines env vars it can see spelled out at build time, so
don't refactor them into a loop or a computed lookup — it compiles to `undefined`
in the browser and every size silently goes "sold out".

**2. Point each link back here.** On each Payment Link: **After payment** →
*Don't show a confirmation page* → redirect to your page, with the size baked in:

```
https://madebybk.com/runback?ordered=1&size=m&session={CHECKOUT_SESSION_ID}
```

Change `size=` per link (`s`, `m`, `l`, `xl`, `2xl`). Stripe substitutes
`{CHECKOUT_SESSION_ID}` itself. That's what makes the page show a real "you're in
the run" state — item, size, price, ship window, receipt note — instead of dumping
the buyer back on the product page.

If you skip this step, the buyer just sees Stripe's own confirmation. Nothing
breaks; you only lose the landing.

One honest caveat, also noted in `components/Confirmed.tsx`: with no backend, the
page can't verify that session against Stripe. The confirmation state is a receipt
**echo**, not proof of payment — anyone can type that URL. Stripe's receipt email
is the actual record, and the copy on the page says so.

---

## Changing the close date

In `lib/drop.ts`:

```ts
closeDate: '2026-09-12T23:59:00-05:00',   // ISO, with an explicit offset
```

Set it and the date appears everywhere `[DATE]` was, plus a live "N days left"
count next to it. Leave it `null` and the page renders `[DATE]` rather than
inventing a deadline.

When the date passes, the page closes itself: no size selector, no buy links, no
sticky bar, and a plain "this one is closed" block instead. To preview that before
it happens:

```ts
forceState: 'closed',   // null = derive from closeDate
```

Set it back to `null` when you're done. The page is server-rendered per request,
so the countdown and the open/closed flip are never served stale from a cache.

---

## Swapping in the real photos

The sample isn't shot, so the three image slots draw the garment instead — the
silhouette, the print where it actually sits on the back, the chest mark — at the
exact aspect ratio the photos will occupy, so nothing on the page moves when they
land. Each carries a visible `[ product photo — sample not shot ]` caption until
it's replaced.

1. Put the files in `public/product/`.
2. In `lib/drop.ts`, set `src` on each slot and match `width`/`height` to the
   file's real pixel dimensions:

```ts
hero:   { src: '/product/runback-back.jpg',   width: 1600, height: 2000, … }
front:  { src: '/product/runback-front.jpg',  width: 1600, height: 2000, … }
detail: { src: '/product/runback-detail.jpg', width: 1600, height: 1200, … }
```

That's it — `next/image` takes over. The `width`/`height` are what hold the space
while the image decodes, so get them right or you reintroduce layout shift. Update
`alt` too if the shot differs from what's described.

---

## How it's put together

```
lib/drop.ts              every fact, every string, every link
app/runback/page.tsx     the page — hero, buy, spec, pre-order, song, footer
app/globals.css          palette tokens, the no-JS buy switching, reduced motion
components/              HandLettered, BackgroundMarquee, Grain, SizePicker,
                         BuyLinks, StickyBuyBar, ProductSlot, Confirmed
app/page.tsx             / redirects to /runback
```

Three things worth knowing before you change them:

**The size selector runs on no JavaScript.** It's a native radio group, and the
buy control is a stack of one inert `<span>` plus one real `<a>` per available
size — CSS `:has()` in `globals.css` reveals exactly one. Arrow keys, focus and
sold-out handling are browser behaviour, not code. It works with JS off and before
hydration. The sticky bar reads the same radios, so there's one source of truth for
the selected size. If you add a size, it needs an entry in `SIZE_ORDER`, an env var,
and a pair of `:has()` rules in `globals.css`.

**One client component**, `StickyBuyBar`, and all it decides is whether the bar is
on screen. Everything else is server-rendered.

**`prefers-reduced-motion: reduce` kills the marquee, the reveal and the press
states**, and the page stays fully usable and fully visible — the reveal only ever
arms itself inside a `no-preference` query, so nothing can get stranded invisible.
Don't "fix" that by moving the animation out of the media query.

The palette and the accent choice are explained in a comment at the top of
`app/globals.css`. Colours are painted explicitly; nothing inherits.

---

## Deploying

Vercel, framework preset Next.js, no special build settings. Set the five env vars
for Production (and Preview if you want to test there). To serve it under
`madebybk.com/runback`, either deploy this as its own project and rewrite that path
to it from the main site, or copy `app/runback/`, `components/`, `lib/drop.ts` and
the `@theme` block into the main app.

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run start       # serve the build
npm run typecheck   # tsc --noEmit
```
