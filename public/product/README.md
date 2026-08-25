# Product photos

Two files, named exactly:

    back.png    the back print, landscape (~3:2)
    front.png   the front chest mark, square (1:1)

`lib/drop.ts` already points at `/product/back.png` and `/product/front.png`.
Drop the files in here and they appear — nothing else to change.

If your files have different pixel dimensions than the `width`/`height` in
`lib/drop.ts`, update those numbers to match. They're what reserve the space
while the image decodes; a mismatch means either layout shift or an
unintended crop, since the slots use `object-cover`.

Until the files exist, each slot draws the garment instead and carries a
visible `[ product photo — sample not shot ]` caption.
