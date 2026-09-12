# Contributing

Open an issue or pull request with the problem, proposed change and relevant test results. Keep the default catalogue blank and the project usable by different shops. Use synthetic records in tests, never real customer/sales data. Do not include secrets or generated local databases.

Run `npm ci`, `npm test`, `npx tsc --noEmit` and `npm run build`. For UI changes, check a populated bill on a tablet in both orientations and on a phone. For database changes, add a new schema migration; do not modify a migration that may already have been applied by users.
