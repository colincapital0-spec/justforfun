# Product photos

Empty until the sample is shot. Until then the page draws the garment instead —
see `components/ProductSlot.tsx`.

Drop the files here, then set `src`, `width` and `height` on each slot in
`lib/drop.ts`:

    runback-back.jpg     back print, full width          portrait 4:5
    runback-front.jpg    front, embroidered chest        portrait 4:5
    runback-detail.jpg   close on the chest embroidery   landscape 4:3

`width`/`height` must match the file's real pixel dimensions — they're what hold
the space while the image decodes.
