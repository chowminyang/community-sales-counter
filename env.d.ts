declare module 'cloudflare:workers' {
  export const env: { DB: D1Database; SHOP_PASSWORD?: string };
}
