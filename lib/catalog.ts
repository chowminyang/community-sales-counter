import { shop } from './shop';
export type Product = { id: string; name: string; price: number | null; image: string | null };
// price is an integer in minor units (cents for SGD). null means NOT configured.
// Use a different stable id for each colour/size. Do not recycle IDs after sales exist.
// image is a filename in public/products, or null for a text-only tile.
export const products: Product[] = [
  { id: 'item-1', name: 'Your item 1', price: null, image: null },
  { id: 'item-2', name: 'Your item 2', price: null, image: null },
  { id: 'item-3', name: 'Your item 3', price: null, image: null },
  { id: 'item-4', name: 'Your item 4', price: null, image: null },
  { id: 'item-5', name: 'Your item 5', price: null, image: null },
  { id: 'item-6', name: 'Your item 6', price: null, image: null },
];
export const money = (cents: number | null) =>
  cents === null
    ? 'Set price'
    : new Intl.NumberFormat(shop.locale, { style: 'currency', currency: shop.currency }).format(
        cents / 100,
      );
