import { env } from 'cloudflare:workers';
const encoder = new TextEncoder();
export function secret() {
  const s = (env as unknown as { SHOP_PASSWORD?: string }).SHOP_PASSWORD;
  if (!s) throw new Error('Shop login is not configured.');
  return s;
}
async function signature(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))))
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}
export async function token() {
  const value = `${Date.now() + 7 * 86400000}.${crypto.randomUUID()}`;
  return `${value}.${await signature(value)}`;
}
export async function authorized(req: Request) {
  const t = req.headers.get('cookie')?.match(/(?:^|;\s*)community_sales_session=([^;]+)/)?.[1];
  if (!t) return false;
  const [expires, nonce, sig] = t.split('.');
  return (
    Number(expires) > Date.now() &&
    Number(expires) < Date.now() + 8 * 86400000 &&
    sig === (await signature(`${expires}.${nonce}`))
  );
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  return !origin || origin === new URL(req.url).origin;
}
export function cookie(req: Request, value: string, age = 604800) {
  return `community_sales_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${new URL(req.url).protocol === 'https:' ? '; Secure' : ''}`;
}
