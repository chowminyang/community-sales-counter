# Deploying your own instance

This repository is source code, not an already-provisioned shop. The default build is Vinext on the supported Sites runtime with D1 persistence. No existing project ID or physical database identifier is included.

## ChatGPT Sites

1. Open the ZIP/folder with ChatGPT Work or Codex and ask it to use Sites. Use the prompt in `CHATGPT-QUICKSTART.md`.
2. Let it register a **new Site** for your account. It must place the returned project ID in `.openai/hosting.json`, retaining `"d1": "DB"` and `"r2": null`. Never guess or borrow a project ID.
3. The platform provisions the hosted database and binding. `db/index.ts` reads `env.DB`; `db/schema.ts` describes the schema; `drizzle/` contains the initial migrations. Sites should apply these migrations before uploading the Worker.
4. Choose your own unique shop password—there is no default password. Configure `SHOP_PASSWORD` as a hosted Site secret. Local `.dev.vars` is ignored and is **not** uploaded automatically.
5. Install dependencies, build, check the Worker output and migrations, and review a private preview. Ask the agent to follow the installed Sites hosting workflow for packaging and deployment.
6. Test login, saved sale persistence, retry, undo, totals and two-device synchronisation. Local in-memory tests do not replace checking your deployed database.
7. Choose the intended audience and publish. A public URL with this app still requires the shop password; keep that password among the adult organisers.

Static product photos do not require R2. If you add in-app photo uploads later, ask ChatGPT to provision object storage and access rules explicitly.

Current platform references: [Creating and managing Sites](https://help.openai.com/en/articles/20001339) and [Sites overview](https://openai.com/academy/chatgpt-sites/). Availability, account limits and supported runtimes can change. The template does not guarantee that every ChatGPT account can deploy Sites.

## Local D1

`npm run build` creates `dist/server/wrangler.json`. `npm run db:migrate:local` applies migrations with Wrangler's `--local` flag. `npm run start` uses the same local config and default persistence directory. These commands never intentionally target a remote database. The all-zero database identifier in `vite.config.ts` is a local placeholder; Sites owns real resource identifiers at deployment.

## Other hosts

Do not upload this project directly to GitHub Pages or deploy it as stock Next.js. `cloudflare:workers`, D1 and Vinext need the corresponding runtime. For Vercel/Node hosting, ask ChatGPT to replace `db/index.ts` with a persistent SQL adapter, adapt environment access in `lib/auth.ts`, adapt trusted login IP detection, replace build tooling and test migrations, authentication and idempotent saves. Never replace durable sales with localStorage to make a static host appear to work.
