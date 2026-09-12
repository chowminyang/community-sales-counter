import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { DatabaseSync } from 'node:sqlite';
const moduleUrl = (s) => 'data:text/javascript;base64,' + Buffer.from(s).toString('base64');
const compile = (p) =>
  ts.transpile(fs.readFileSync(p, 'utf8'), {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  });
const shop = moduleUrl(compile('lib/shop.ts'));
const rawCatalog = compile('lib/catalog.ts').replace("'./shop'", JSON.stringify(shop));
const defaults = await import(moduleUrl(rawCatalog));
assert.ok(defaults.products.every((p) => p.price === null && p.image === null));
const catalog = moduleUrl(
  rawCatalog
    .replace('export const products = [', 'export const products = [')
    .replace(/price: null/g, 'price: 1250'),
);
const salesUrl = moduleUrl(
  compile('lib/sales.ts')
    .replace("'./catalog'", JSON.stringify(catalog))
    .replace("'./shop'", JSON.stringify(shop)),
);
const defaultSales = await import(
  moduleUrl(
    compile('lib/sales.ts')
      .replace("'./catalog'", JSON.stringify(moduleUrl(rawCatalog)))
      .replace("'./shop'", JSON.stringify(shop)),
  )
);
assert.throws(() => defaultSales.calculateSale([{ productId: 'item-1', quantity: 1 }]));
const sqlite = new DatabaseSync(':memory:');
sqlite.exec(fs.readFileSync('drizzle/0000_daffy_warstar.sql', 'utf8'));
globalThis.__testDb = {
  prepare(sql) {
    const s = sqlite.prepare(sql);
    let args = [];
    return {
      bind(...a) {
        args = a;
        return this;
      },
      async run() {
        return s.run(...args);
      },
      async first() {
        return s.get(...args) || null;
      },
      async all() {
        return { results: s.all(...args) };
      },
    };
  },
};
const dbUrl = moduleUrl('export function getDb(){return globalThis.__testDb}');
const authUrl = moduleUrl(
  compile('lib/auth.ts').replace(
    "import { env } from 'cloudflare:workers';",
    "const env={SHOP_PASSWORD:'unit-test-only'};",
  ),
);
const route = async (p) =>
  import(
    moduleUrl(
      compile(p)
        .replaceAll("'@/db'", JSON.stringify(dbUrl))
        .replaceAll("'@/lib/auth'", JSON.stringify(authUrl))
        .replaceAll("'@/lib/sales'", JSON.stringify(salesUrl)),
    )
  );
const api = await route('app/api/sales/route.ts'),
  login = await route('app/api/login/route.ts');
let cookie = '',
  checks = 0;
const eq = (a, b) => {
  assert.deepEqual(a, b);
  checks++;
};
const req = (method, body, origin = 'https://example.test') =>
  new Request('https://example.test/api/sales', {
    method,
    headers: { origin, cookie, 'content-type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
eq((await api.GET(req('GET'))).status, 401);
eq((await login.POST(req('POST', { password: 'wrong' }))).status, 401);
let r = await login.POST(req('POST', { password: 'unit-test-only' }));
eq(r.status, 200);
cookie = r.headers.get('set-cookie').split(';')[0];
eq((await api.GET(req('GET'))).status, 200);
const lines = [
  { productId: 'item-1', quantity: 2 },
  { productId: 'item-2', quantity: 1 },
];
for (const method of ['cash', 'paynow', 'coupons']) {
  const body = { id: crypto.randomUUID(), method, lines, discountDollars: 2 };
  r = await api.POST(req('POST', body));
  eq(r.status, 200);
  eq((await r.json()).sale.total, 3550);
  eq((await api.POST(req('POST', body))).status, 200);
  eq((await api.POST(req('POST', { ...body, discountDollars: 1 }))).status, 409);
  eq(
    (await api.POST(req('POST', { ...body, id: crypto.randomUUID() }, 'https://evil.test'))).status,
    401,
  );
}
let records = (await (await api.GET(req('GET'))).json()).sales;
eq(records.length, 3);
for (const bad of [
  { lines: [] },
  { lines: [{ productId: 'missing', quantity: 1 }] },
  { lines: [{ productId: 'item-1', quantity: 0 }] },
  { lines: [{ productId: 'item-1', quantity: 100 }] },
  {
    lines: [
      { productId: 'item-1', quantity: 1 },
      { productId: 'item-1', quantity: 1 },
    ],
  },
  { discountDollars: -1 },
  { discountDollars: 999 },
  { method: 'invalid' },
])
  eq(
    (await api.POST(req('POST', { id: crypto.randomUUID(), method: 'cash', lines, ...bad })))
      .status,
    400,
  );
eq((await api.PATCH(req('PATCH', { id: records[0].id }))).status, 200);
records = (await (await api.GET(req('GET'))).json()).sales;
eq(records.filter((s) => !s.voided).length, 2);
eq((await api.DELETE(req('DELETE', { confirmation: 'wrong' }))).status, 400);
eq((await api.DELETE(req('DELETE', { confirmation: 'RESET' }))).status, 200);
eq((await (await api.GET(req('GET'))).json()).sales.length, 0);
for (let i = 0; i < 10; i++) eq((await login.POST(req('POST', { password: 'wrong' }))).status, 401);
eq((await login.POST(req('POST', { password: 'unit-test-only' }))).status, 429);
const { calculateSale } = await import(salesUrl);
eq(calculateSale(lines, 2.5).total, 3450);
console.log(`${checks} API checks passed; blank prices rejected; isolated SQLite only.`);
