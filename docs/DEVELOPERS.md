# For developers

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

This release targets **ChatGPT Sites / Vinext / Cloudflare D1**. Ask ChatGPT to follow [the deployment guide](DEPLOYMENT.md). It has intentionally been adapted from a Next.js/PostgreSQL counter: do not deploy it as an ordinary Next.js app on Vercel without adapting the runtime and database layer.

## Change files

| File | What to change |
| --- | --- |
| `lib/shop.ts` | Shop title, currency, locale, time zone and bank-transfer label |
| `lib/catalog.ts` | Product IDs, names, prices in cents and photo filenames |
| `public/products/` | Your own product images |
| `app/globals.css` | Colours, spacing and tablet layout |
| `db/schema.ts`, `drizzle/` | Database schema and versioned migrations |
| `docs/CHATGPT-QUICKSTART.md` | Ready-to-paste customisation prompt |


See also [customisation](CUSTOMISATION.md) and [deployment](DEPLOYMENT.md).
