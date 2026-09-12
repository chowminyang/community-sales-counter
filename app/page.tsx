'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { products, money } from '@/lib/catalog';
import { shop } from '@/lib/shop';
import { paymentLabel, saleDiscount, roundedDiscount } from '@/lib/sales';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
const HISTORY_PAGE_SIZE = 10;
type Sale = {
  id: string;
  created_at: number;
  method: string;
  total: number;
  voided: number;
  lines: { productId: string; name: string; price: number; quantity: number }[];
};
export default function Page() {
  const [ready, setReady] = useState(false),
    [logged, setLogged] = useState(false),
    [password, setPassword] = useState(''),
    [cart, setCart] = useState<Record<string, number>>({}),
    [sales, setSales] = useState<Sale[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [resetOpen, setResetOpen] = useState(false),
    [resetText, setResetText] = useState(''),
    [resetError, setResetError] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [view, setView] = useState('counter'),
    [historyPage, setHistoryPage] = useState(0);
  const requestId = useRef<string | null>(null),
    lock = useRef(false);
  async function refresh() {
    const r = await fetch('/api/sales', { cache: 'no-store' });
    if (r.status === 401) {
      setLogged(false);
      return;
    }
    if (!r.ok) throw Error('Could not load sales. Please retry.');
    const d: any = await r.json();
    setSales(d.sales);
    setLogged(true);
  }
  useEffect(() => {
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!logged) return;
    const sync = () => {
      if (document.visibilityState === 'visible') refresh().catch(() => {});
    };
    const t = setInterval(sync, 3000);
    window.addEventListener('focus', sync);
    window.addEventListener('online', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(t);
      window.removeEventListener('focus', sync);
      window.removeEventListener('online', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [logged]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      setPassword('');
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function remaining(_id: string) {
    return 99;
  }
  function change(id: string, delta: number) {
    if (lock.current) return;
    requestId.current = null;
    setCart((c) => ({
      ...c,
      [id]:
        delta > 0
          ? Math.min(remaining(id), Math.max(0, (c[id] || 0) + delta))
          : Math.max(0, (c[id] || 0) + delta),
    }));
    setNotice('');
  }
  const lines = products.filter((p) => cart[p.id]),
    subtotal = lines.reduce((n, p) => n + (p.price ?? 0) * cart[p.id], 0),
    count = lines.reduce((n, p) => n + cart[p.id], 0);
  const discountDollars = roundedDiscount(Number(discountInput), subtotal),
    total = subtotal - discountDollars * 100;
  function discountChange(value: string) {
    if (lock.current) return;
    if (roundedDiscount(Number(value), subtotal) !== discountDollars) requestId.current = null;
    setDiscountInput(value);
    setNotice('');
  }
  const summaryProducts = [
    ...products,
    ...Array.from(
      new Map(
        sales
          .flatMap((s) => s.lines)
          .filter((l) => !products.some((p) => p.id === l.productId))
          .map((l) => [
            l.productId,
            { id: l.productId, name: l.name, price: l.price, image: null },
          ]),
      ).values(),
    ),
  ];
  const active = sales.filter((s) => !s.voided),
    collected = active.reduce((n, s) => n + s.total, 0),
    cash = active.filter((s) => s.method === 'cash').reduce((n, s) => n + s.total, 0),
    qty = active.reduce((n, s) => n + s.lines.reduce((a, l) => a + l.quantity, 0), 0);

  async function pay(method: string) {
    if (lock.current || !count) return;
    lock.current = true;
    setBusy(true);
    setError('');
    requestId.current ||= crypto.randomUUID();
    try {
      const r = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: requestId.current,
          method,
          discountDollars,
          lines: lines.map((p) => ({ productId: p.id, quantity: cart[p.id] })),
        }),
      });
      const d: any = await r.json();
      if (!r.ok) {
        if (r.status === 409) await refresh().catch(() => {});
        throw Error(d.error);
      }
      setCart({});
      setDiscountInput('');
      requestId.current = null;
      setNotice(`${money(total)} · ${paymentLabel(method)} — sale saved!`);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function resetSales() {
    if (lock.current || resetText !== 'RESET') return;
    lock.current = true;
    setBusy(true);
    setResetError('');
    try {
      const r = await fetch('/api/sales', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: resetText }),
      });
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      setSales([]);
      setCart({});
      setDiscountInput('');
      requestId.current = null;
      setHistoryPage(0);
      setResetOpen(false);
      setResetText('');
      setError('');
      setNotice('Sales reset. Ready for the event!');
    } catch (e) {
      setResetError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function undo(s: Sale) {
    if (!confirm('Undo this sale and remove its items and payment from the totals?')) return;
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/sales', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id }),
      });
      if (!r.ok) throw Error('Could not undo sale. Please retry.');
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const ctx = (document as any).modelContext;
    if (!ctx?.registerTool || !logged) return;
    const lifecycle = new AbortController();
    Promise.resolve(
      ctx.registerTool(
        {
          name: 'show_sales_totals',
          description: 'Show the Total sales tab and return saved quantities and revenue.',
          inputSchema: { type: 'object', properties: {}, additionalProperties: false },
          annotations: { readOnlyHint: true },
          execute: async () => {
            const r = await fetch('/api/sales', { cache: 'no-store' });
            if (!r.ok) throw Error('Cannot load sales');
            const d: any = await r.json();
            setSales(d.sales);
            setView('totals');
            const a = d.sales.filter((s: Sale) => !s.voided);
            return {
              sales: a.length,
              totalCents: a.reduce((n: number, s: Sale) => n + s.total, 0),
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, [logged]);
  function pager(current: number, pages: number, set: (n: number) => void) {
    return (
      <div className="pager">
        <Button
          variant="outline"
          disabled={current === 0}
          onClick={() => set(current - 1)}
          aria-label="Previous page"
        >
          ‹
        </Button>
        <span>
          {current + 1} / {Math.max(1, pages)}
        </span>
        <Button
          variant="outline"
          disabled={current + 1 >= pages}
          onClick={() => set(current + 1)}
          aria-label="Next page"
        >
          ›
        </Button>
      </div>
    );
  }
  if (!ready)
    return (
      <main className="login">
        <p>Opening the counter…</p>
      </main>
    );
  if (!logged)
    return (
      <main className="login">
        <form onSubmit={login} className="login-card">
          <div className="shop-mark" aria-hidden="true">
            ✦
          </div>
          <p className="eyebrow">{shop.tagline}</p>
          <h1>Let’s make a sale.</h1>
          <label htmlFor="password">Shop password</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" disabled={busy}>
            {busy ? 'Opening…' : 'Open the counter'}
          </Button>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </form>
      </main>
    );
  return (
    <main className="shell">
      <AlertDialog
        open={resetOpen}
        onOpenChange={(open) => {
          if (!busy) {
            setResetOpen(open);
            setResetText('');
            setResetError('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset before the event?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes all saved sales, including undone sales, and clears payment
              totals, discounts and this bill. It cannot be undone. Products and the shop password
              stay the same.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label htmlFor="reset-confirm">Type RESET to confirm</label>
          <Input
            id="reset-confirm"
            value={resetText}
            disabled={busy}
            onChange={(e) => setResetText(e.target.value)}
            autoComplete="off"
          />
          {resetError && (
            <p role="alert" className="error">
              {resetError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busy || resetText !== 'RESET'}
              onClick={resetSales}
            >
              {busy ? 'Resetting…' : 'Reset all sales'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <header>
        <div className="brand">
          <div className="shop-mark" aria-hidden="true">
            ✦
          </div>
          <div>
            <span className="eyebrow">{shop.tagline}</span>
            <h1>{shop.name}</h1>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            await fetch('/api/login', { method: 'DELETE' });
            setLogged(false);
            setCart({});
            setDiscountInput('');
          }}
        >
          Lock shop
        </Button>
      </header>
      <div className="navigation">
        <Tabs
          value={view}
          onValueChange={(v) => {
            setView(v);
            refresh().catch((e) => setError(e.message));
          }}
        >
          <TabsList>
            <TabsTrigger value="counter">New sale</TabsTrigger>
            <TabsTrigger value="totals">Total sales</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
        <span>
          {active.length} sales · {money(collected)}
        </span>
      </div>
      <div
        className={`message ${error ? 'error' : notice ? 'success' : ''}`}
        role={error ? 'alert' : 'status'}
      >
        {error ||
          notice ||
          (products.some((p) => p.price === null)
            ? 'Set your product names and prices in lib/catalog.ts before recording sales.'
            : 'Tap an item, check the bill, then record the payment.')}
      </div>
      {view === 'counter' ? (
        <div className="counter">
          <section className="catalog">
            <div className="section-title">
              <h2>Choose products</h2>
              <span>All {products.length} items</span>
            </div>
            <div className="products">
              {products.map((p) => (
                <button
                  className={`product ${cart[p.id] ? 'selected' : ''}`}
                  key={p.id}
                  disabled={busy || p.price === null}
                  onClick={() => change(p.id, 1)}
                  aria-label={`Add ${p.name}, ${money(p.price)}`}
                >
                  <div className="photo">
                    {p.image ? (
                      <img src={`/products/${p.image}`} alt={p.name} />
                    ) : (
                      <span className="no-photo">{p.name}</span>
                    )}
                    {!!cart[p.id] && <span className="badge">{cart[p.id]}</span>}
                  </div>
                  <div className="product-caption">
                    <strong>{p.name}</strong>
                    <span>
                      {money(p.price)}
                      <b>＋</b>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
          <aside className="bill">
            <div className="section-title">
              <h2>This sale</h2>
              <span>{count} items</span>
            </div>
            <div className="bill-items">
              {!count ? (
                <div className="empty">
                  Your bill is empty.<small>Tap a product to start.</small>
                </div>
              ) : (
                lines.map((p) => (
                  <div className="bill-line" key={p.id}>
                    <div>
                      <strong>{p.name}</strong>
                      <small>{money(p.price)} each</small>
                      <div className="quantity">
                        <Button
                          variant="outline"
                          disabled={busy}
                          aria-label={`Remove one ${p.name}`}
                          onClick={() => change(p.id, -1)}
                        >
                          −
                        </Button>
                        <span>{cart[p.id]}</span>
                        <Button
                          variant="outline"
                          disabled={busy || cart[p.id] >= remaining(p.id)}
                          aria-label={`Add one ${p.name}`}
                          onClick={() => change(p.id, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <strong>{money((p.price ?? 0) * cart[p.id])}</strong>
                  </div>
                ))
              )}
            </div>
            <div className="bill-pagination">
              <span>
                {lines.length} item types · {count} items
              </span>
              {count > 0 && (
                <Button
                  className="clear-bill"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setCart({});
                    setDiscountInput('');
                    requestId.current = null;
                  }}
                >
                  Clear bill
                </Button>
              )}
            </div>
            <div className="discount-control">
              <label htmlFor="discount">Discount · {shop.currency} off</label>
              <div className="discount-input">
                <Button
                  variant="outline"
                  aria-label="Reduce discount by one dollar"
                  disabled={busy || !discountDollars}
                  onClick={() => discountChange(String(discountDollars - 1))}
                >
                  −
                </Button>
                <Input
                  id="discount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={subtotal / 100}
                  step="1"
                  value={discountInput}
                  placeholder="0"
                  disabled={busy || !count}
                  onChange={(e) => discountChange(e.target.value)}
                  onBlur={() => discountChange(String(discountDollars))}
                  aria-describedby="discount-help"
                />
                <Button
                  variant="outline"
                  aria-label="Increase discount by one dollar"
                  disabled={busy || !count || discountDollars >= subtotal / 100}
                  onClick={() => discountChange(String(discountDollars + 1))}
                >
                  +
                </Button>
              </div>
              <small id="discount-help">
                Rounded to the nearest dollar · up to {money(subtotal)}
              </small>
            </div>
            {discountDollars > 0 && (
              <div className="discount-summary">
                <span>Subtotal {money(subtotal)}</span>
                <span>−{money(discountDollars * 100)}</span>
              </div>
            )}
            <div className="total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="payment-help">Payment received?</p>
            <div className="payments">
              <Button className="cash" disabled={!count || busy} onClick={() => pay('cash')}>
                {busy ? 'Saving…' : 'Paid · Cash'}
              </Button>
              <Button className="paynow" disabled={!count || busy} onClick={() => pay('paynow')}>
                {busy ? 'Saving…' : `Paid · ${shop.transferLabel}`}
              </Button>
              <Button className="coupons" disabled={!count || busy} onClick={() => pay('coupons')}>
                {busy ? 'Saving…' : 'Paid · Coupons'}
              </Button>
            </div>
            <small className="bill-note">Check the payment has arrived before saving.</small>
          </aside>
        </div>
      ) : view === 'totals' ? (
        <section className="totals-view">
          <div className="section-title">
            <h2>Event totals</h2>
            <Button variant="outline" disabled={busy} onClick={() => setResetOpen(true)}>
              Reset for event
            </Button>
          </div>
          <div className="stats">
            <div>
              <span>All earnings</span>
              <strong>{money(collected)}</strong>
            </div>
            <div>
              <span>Cash</span>
              <strong>{money(cash)}</strong>
            </div>
            <div>
              <span>{shop.transferLabel}</span>
              <strong>
                {money(
                  active.filter((s) => s.method === 'paynow').reduce((n, s) => n + s.total, 0),
                )}
              </strong>
            </div>
            <div>
              <span>Coupons</span>
              <strong>
                {money(
                  active.filter((s) => s.method === 'coupons').reduce((n, s) => n + s.total, 0),
                )}
              </strong>
            </div>
            <div>
              <span>Discounts given</span>
              <strong>{money(active.reduce((n, s) => n + saleDiscount(s), 0))}</strong>
            </div>
            <div>
              <span>Items sold</span>
              <strong>{qty}</strong>
            </div>
          </div>
          <div className="section-title">
            <h2>Products · all sales</h2>
            <span>Including all variants</span>
          </div>
          <div className="summary-columns">
            {Array.from(
              { length: Math.max(1, Math.ceil(summaryProducts.length / 9)) },
              (_, i) => i * 9,
            ).map((start) => (
              <div className="sales-table" key={start}>
                <div className="sales-row table-head">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Before discounts</span>
                </div>
                {summaryProducts.slice(start, start + 9).map((p) => {
                  const ls = active.flatMap((s) => s.lines.filter((l) => l.productId === p.id));
                  return (
                    <div className="sales-row" key={p.id}>
                      <span>{p.name}</span>
                      <strong>{ls.reduce((n, l) => n + l.quantity, 0)}</strong>
                      <strong>{money(ls.reduce((n, l) => n + l.price * l.quantity, 0))}</strong>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <small>
            Item amounts are before discounts. Grand total includes discounts and coupon payments.
          </small>
          <div className="sales-row grand-total">
            <span>All items · grand total</span>
            <strong>{qty}</strong>
            <strong>{money(collected)}</strong>
          </div>
        </section>
      ) : (
        <section className="history-view">
          <div className="section-title">
            <h2>Sales history</h2>
            {pager(historyPage, Math.ceil(sales.length / HISTORY_PAGE_SIZE), setHistoryPage)}
          </div>
          {!sales.length ? (
            <div className="empty">Your first sale will appear here.</div>
          ) : (
            sales
              .slice(historyPage * HISTORY_PAGE_SIZE, (historyPage + 1) * HISTORY_PAGE_SIZE)
              .map((s) => (
                <article key={s.id} className={s.voided ? 'voided' : ''}>
                  <div>
                    <strong>
                      {money(s.total)} · {paymentLabel(s.method)} {s.voided ? '· Undone' : ''}
                    </strong>
                    <small>
                      {new Date(s.created_at).toLocaleString(shop.locale, {
                        timeZone: shop.timeZone,
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </small>
                    <p>
                      {saleDiscount(s) > 0 && <span>Discount: {money(saleDiscount(s))} · </span>}
                      {s.lines.map((l) => `${l.quantity} × ${l.name}`).join(' · ')}
                    </p>
                  </div>
                  {!s.voided && (
                    <Button variant="outline" disabled={busy} onClick={() => undo(s)}>
                      Undo sale
                    </Button>
                  )}
                </article>
              ))
          )}
        </section>
      )}
    </main>
  );
}
