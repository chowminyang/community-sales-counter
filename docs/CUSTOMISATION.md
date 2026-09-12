# Customisation

## Products

Edit `lib/catalog.ts`. Each entry has:

- `id`: a unique, stable identifier, e.g. `item-red`. Keep it unchanged once sales exist.
- `name`: the label shown in the catalogue and saved with a sale.
- `price`: integer cents. `null` means unconfigured and disables the product. `0` explicitly means free.
- `image`: a filename such as `item-red.jpg` in `public/products/`, or `null` for a text-only tile.

Use your own prices; none are supplied in the released catalogue. To convert a two-decimal price to cents, multiply it by 100 and round to an integer. Do not enter a decimal currency amount directly into `price`.

Give each colour or size its own entry. This general starter deliberately has no shop-specific colour picker. More products can scroll within the catalogue on tablets. Ask ChatGPT to add grouped pickers if needed.

Product names, unit prices and quantities are snapshotted in each saved sale. Changes to a current product price do not rewrite old sales. Removed products with historical sales remain represented in the totals view. Do not change currency after sales have been recorded; use a new event/database instead.

## Branding and payments

Edit `lib/shop.ts`. The default currency is SGD, locale `en-SG`, and time zone `Asia/Singapore`; these are generic settings, not account connections. The app assumes 100 minor units per major unit. For a zero-decimal currency or fractional discounts, ask ChatGPT to adapt and test the calculations first.

`transferLabel` changes the displayed bank-transfer name. The internal `paynow` key is retained for compatibility with the existing payment logic and is not a connection to any payment account. Cash, bank-transfer and coupon buttons only record money already received. They do not transfer money, verify a payment or call a payment service.

## Photos and data

Use JPG/PNG/WebP files, preferably resized for quick loading. Keep filenames simple and match their spelling exactly. Uploaded product photos are public static assets once deployed; use product-only photos with no addresses or personal details in the background.

The public source must not contain `.dev.vars`, `.env` files with secrets, `.wrangler` databases, deployment credentials or real sales. `.gitignore` excludes these. If you publish your modified source, review staged files and the ZIP again.

## UI

The principal layout is `app/page.tsx` and `app/globals.css`. The bill spans the right side at widths of 700px and above; phones stack the bill below the catalogue. The item list can scroll while totals/payment controls remain visible on tablets.
