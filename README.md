# Community Sales Counter

A free, customisable sales counter for **parents and adult organisers** running community fairs, homeschool markets and small stalls. Adapt it with ChatGPT using your own product photos and price list.

**[Download the ZIP](https://github.com/chowminyang/community-sales-counter/archive/refs/heads/main.zip)** · **[Start with ChatGPT](docs/CHATGPT-QUICKSTART.md)** · **[Customise the code](docs/CUSTOMISATION.md)**

## What it does

- Product tiles, quantity controls and a full-height bill panel for tablets.
- Records cash, bank-transfer and coupon payments **after you receive them**.
- Whole-currency-unit discounts, itemised totals, history and undo.
- Database-backed sales shared between devices, refreshed every three seconds.
- Shop-password login and a confirmation step before resetting event sales.

This is a sales record book, not a payment processor, customer checkout, inventory system or tax/accounting package. There is no stock cap. It does not collect customer names or payment-card details. Use one currency per event; amounts use two decimal places and discounts round to whole units.

## Make it yours — no coding experience required

1. Download the ZIP above, or select **Code → Download ZIP** on GitHub.
2. Open ChatGPT **Work**, or **Codex/Work** in the desktop app, with Sites available.
3. Attach the ZIP, your product photos and a price list. If ZIP uploads cannot be read, unzip it and open the folder in Codex, or attach the relevant files.
4. Copy the prompt in [CHATGPT-QUICKSTART.md](docs/CHATGPT-QUICKSTART.md). Ask ChatGPT to customise this code, create **your own new Site and database**, configure a private shop password and show a preview.
5. Review every name, photo, price, variant and currency. Test a sale and undo with two devices. Publish only after reviewing it.

The download has **no original branding, product photos, prices, credentials, sales data or existing deployment IDs**. Six text placeholders have `price: null` and cannot be sold until configured. Each colour/size can have its own product entry. Photos are optional and served from `public/products/`.

Sites availability and hosting/storage limits depend on your account. This code is free under MIT; a compatible ChatGPT plan or hosting service may have costs. See [OpenAI’s current Sites guide](https://help.openai.com/en/articles/20001339). Creating a new database and configuring secrets are part of setup, not something downloading a ZIP does automatically.

## Set your own password

There is **no default or existing password** in this download. Choose a unique password for your shop. For a hosted Site, ask ChatGPT to set it as the private `SHOP_PASSWORD` secret through the secrets setup flow. For local use, put it in your ignored `.dev.vars` file. Never put your password in source code, GitHub, a public prompt or screenshots. The counter stays locked until a password is configured.

## Run locally (Node.js 24+)

```sh
npm ci
cp .dev.vars.example .dev.vars
# Set SHOP_PASSWORD in .dev.vars to a unique password. Never commit this file.
npm run build
npm run db:migrate:local
npm run start
```

Open the local address printed by Wrangler (usually `http://localhost:8787`). The local D1 database is stored under ignored `.wrangler/`. Use `npm run dev` for editing. Apply migrations with the provided command first. Restart after changing `.dev.vars`.

```sh
npm test
npx tsc --noEmit
npm run build
```

The API tests use an isolated, in-memory SQLite database and synthetic prices. They never connect to a live shop.

## Deploy

This release targets **ChatGPT Sites / Vinext / Cloudflare D1**. Ask ChatGPT to follow [the deployment guide](docs/DEPLOYMENT.md). It has intentionally been adapted from a Next.js/PostgreSQL counter: do not deploy it as an ordinary Next.js app on Vercel without adapting the runtime and database layer.

## Change files

| File | What to change |
| --- | --- |
| `lib/shop.ts` | Shop title, currency, locale, time zone and bank-transfer label |
| `lib/catalog.ts` | Product IDs, names, prices in cents and photo filenames |
| `public/products/` | Your own product images |
| `app/globals.css` | Colours, spacing and tablet layout |
| `db/schema.ts`, `drizzle/` | Database schema and versioned migrations |
| `docs/CHATGPT-QUICKSTART.md` | Ready-to-paste customisation prompt |

## Before a real event

Set a unique password; confirm all prices; check that an unauthenticated device cannot read sales; record and undo a clearly identified test sale; confirm totals synchronise to a second device. A failed save leaves the bill for retry. Current unsaved bills live in browser memory and are lost on a reload; only saved sales persist. Keep the app online while selling. **Reset permanently removes event sales**—export/back up records externally before using it if you need to retain them. No export button is included in this release.

This app is for adult organisers, with a shared shop login rather than individual staff accounts. Review AI-generated changes before using them. Keep your customised shop private or password-protected; publishing the source code does not make your database public.

## Licence and contributions

MIT — see [LICENSE](LICENSE). Third-party dependencies keep their respective licences; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Suggestions and improvements are welcome as issues or pull requests. Please never include passwords, database dumps or personal details in them.
