import type { Metadata } from 'next';
import { shop } from '@/lib/shop';
import './globals.css';
export const metadata: Metadata = {
  title: shop.name,
  description: 'A configurable community event sales counter.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
