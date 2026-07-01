'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/lib/cart-store';

export default function ProductCard({ product, badge }) {
  const addItem = useCart((s) => s.addItem);

  return (
    <div className="group flex flex-col">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-sand rounded-sm">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-2 top-2 rounded-sm bg-ink/85 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-paper">
            {badge}
          </span>
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <span className="label-eyebrow">{product.category}</span>
        <Link href={`/product/${product.slug}`} className="mt-1 font-display text-lg leading-snug text-ink hover:text-clay">
          {product.title}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-mono text-sm text-ink/80">{formatPrice(product.price)}</span>
          <button
            onClick={() => addItem(product, 1)}
            className="text-xs font-medium uppercase tracking-wide text-ink/60 hover:text-clay"
          >
            Add +
          </button>
        </div>
      </div>
    </div>
  );
}
