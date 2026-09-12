import { products } from './catalog';
import { shop } from './shop';
export function calculateSale(input: unknown, discountDollars: unknown = 0) {
  if (!Array.isArray(input) || !input.length || input.length > products.length)
    throw new Error('Choose at least one item.');
  const seen = new Set<string>();
  const lines = input.map((l) => {
    const p = products.find((p) => p.id === l?.productId);
    if (
      !p ||
      p.price === null ||
      !Number.isSafeInteger(p.price) ||
      p.price < 0 ||
      seen.has(p.id) ||
      !Number.isInteger(l.quantity) ||
      l.quantity < 1 ||
      l.quantity > 99
    )
      throw new Error('Check item quantities (1–99).');
    seen.add(p.id);
    return { productId: p.id, name: p.name, price: p.price, quantity: l.quantity };
  });
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  if (
    typeof discountDollars !== 'number' ||
    !Number.isFinite(discountDollars) ||
    discountDollars < 0
  )
    throw new Error('Check your discount.');
  const discount = Math.round(discountDollars) * 100;
  if (discount > subtotal) throw new Error('Discount cannot exceed the bill.');
  return { lines, total: subtotal - discount };
}
export const paymentLabel = (method: string) =>
  (({ cash: 'Cash', paynow: shop.transferLabel, coupons: 'Coupons' }) as Record<string, string>)[
    method
  ] || method;
export const saleDiscount = (sale: {
  total: number;
  lines: { price: number; quantity: number }[];
}) => sale.lines.reduce((n, l) => n + l.price * l.quantity, 0) - sale.total;
export function roundedDiscount(value: number, subtotal: number) {
  return Math.min(
    Math.floor(subtotal / 100),
    Math.max(0, Math.round(Number.isFinite(value) ? value : 0)),
  );
}
