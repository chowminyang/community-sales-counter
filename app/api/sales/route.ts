import { getDb } from '@/db';
import { authorized, sameOrigin } from '@/lib/auth';
import { calculateSale } from '@/lib/sales';
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function GET(req: Request) {
  try {
    if (!(await authorized(req))) return reply({ error: 'Please unlock the shop.' }, 401);
    const result = await getDb().prepare('SELECT * FROM sales ORDER BY created_at DESC').all();
    return reply({
      sales: result.results.map((s) => ({ ...s, lines: JSON.parse(s.lines as string) })),
    });
  } catch (e) {
    console.error(e);
    return reply({ error: 'Could not load sales. Please retry.' }, 503);
  }
}
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req) || !(await authorized(req)))
      return reply({ error: 'Please unlock the shop.' }, 401);
    let d: any;
    try {
      d = await req.json();
      if (!/^[0-9a-f-]{36}$/.test(d.id) || !['cash', 'paynow', 'coupons'].includes(d.method))
        throw Error();
      d = { ...d, ...calculateSale(d.lines, d.discountDollars) };
    } catch {
      return reply({ error: 'Check your items, discount and payment method.' }, 400);
    }
    const db = getDb();
    await db
      .prepare(
        'INSERT INTO sales(id,created_at,method,total,lines) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING',
      )
      .bind(d.id, Date.now(), d.method, d.total, JSON.stringify(d.lines))
      .run();
    const saved = await db.prepare('SELECT * FROM sales WHERE id=?').bind(d.id).first();
    if (
      saved?.total !== d.total ||
      saved?.method !== d.method ||
      saved?.lines !== JSON.stringify(d.lines)
    )
      return reply(
        {
          error:
            'This bill was already saved with a different payment. Check History before starting another sale.',
        },
        409,
      );
    return reply({ ok: true, sale: saved });
  } catch (e) {
    console.error(e);
    return reply(
      { error: 'Sale not confirmed. Keep this bill and retry to avoid losing it.' },
      503,
    );
  }
}
export async function PATCH(req: Request) {
  try {
    if (!sameOrigin(req) || !(await authorized(req)))
      return reply({ error: 'Please unlock the shop.' }, 401);
    const { id } = (await req.json()) as { id?: unknown };
    if (typeof id !== 'string') return reply({ error: 'Invalid sale.' }, 400);
    await getDb().prepare('UPDATE sales SET voided=1 WHERE id=?').bind(id).run();
    return reply({ ok: true });
  } catch {
    return reply({ error: 'Could not undo this sale.' }, 503);
  }
}

export async function DELETE(req: Request) {
  try {
    if (!sameOrigin(req) || !(await authorized(req)))
      return reply({ error: 'Please unlock the shop.' }, 401);
    const body = (await req.json()) as { confirmation?: unknown };
    if (body.confirmation !== 'RESET') return reply({ error: 'Type RESET to confirm.' }, 400);
    await getDb().prepare('DELETE FROM sales').run();
    return reply({ ok: true });
  } catch {
    return reply({ error: 'Could not reset sales. Please retry.' }, 503);
  }
}
