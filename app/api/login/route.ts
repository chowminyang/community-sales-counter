import { getDb } from '@/db';
import { secret, token, cookie, sameOrigin } from '@/lib/auth';
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return Response.json({ error: 'Request not allowed.' }, { status: 403 });
    const db = getDb();
    const id = req.headers.get('cf-connecting-ip') || 'shared';
    const now = Date.now();
    const a = await db
      .prepare('SELECT count,reset_at FROM login_attempts WHERE id=?')
      .bind(id)
      .first<{ count: number; reset_at: number }>();
    if (a && a.reset_at > now && a.count >= 10)
      return Response.json({ error: 'Too many tries. Try again in 15 minutes.' }, { status: 429 });
    const { password } = (await req.json()) as { password?: unknown };
    if (password !== secret()) {
      await db
        .prepare(
          'INSERT INTO login_attempts(id,count,reset_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN login_attempts.reset_at<? THEN 1 ELSE login_attempts.count+1 END,reset_at=CASE WHEN login_attempts.reset_at<? THEN excluded.reset_at ELSE login_attempts.reset_at END',
        )
        .bind(id, now + 900000, now, now)
        .run();
      return Response.json({ error: 'That password isn’t right. Try again.' }, { status: 401 });
    }
    await db.prepare('DELETE FROM login_attempts WHERE id=?').bind(id).run();
    return Response.json(
      { ok: true },
      { headers: { 'Set-Cookie': cookie(req, await token()), 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: 'Cannot open the shop right now. Please retry.' },
      { status: 503 },
    );
  }
}
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': cookie(req, '', 0) } });
}
