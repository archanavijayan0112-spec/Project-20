'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import RecommendationRail from '@/components/RecommendationRail';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [active, setActive] = useState('All');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (active !== 'All') qs.set('category', active);
    if (q) qs.set('q', q);

    fetch(`/api/products?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        if (data.categories) setCategories(data.categories);
        setLoading(false);
      });
  }, [active, q]);

  return (
    <>
      <section className="border-b border-ink/10 bg-sand/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <span className="label-eyebrow">A storefront that learns</span>
            <h1 className="mt-3 font-display text-4xl italic leading-[1.05] text-ink md:text-6xl">
              Every shelf, <br /> rearranged for you.
            </h1>
            <p className="mt-5 max-w-md text-ink/65">
              Shelfsense watches what you browse, cart, and buy, then trains a
              small recommendation model overnight to quietly reorder the
              catalog around your taste. No quizzes, no forms — just better
              shelves the more you shop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#catalog" className="btn-primary">Browse the catalog</a>
              <a href="/login" className="btn-secondary">Sign in for picks</a>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <TasteSignature />
          </div>
        </div>
      </section>

      <RecommendationRail />

      <section id="catalog" className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">Full catalog</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="w-full max-w-xs rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-clay md:w-64"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
                active === c
                  ? 'border-ink bg-ink text-paper'
                  : 'border-ink/15 text-ink/60 hover:border-ink/40'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-sand" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-ink/50">No products match that search yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// Signature visual: an abstract "embedding space" of dots that drift slowly,
// standing in for the latent vectors the recommender actually computes.
function TasteSignature() {
  const dots = Array.from({ length: 18 }).map((_, i) => ({
    cx: 30 + ((i * 53) % 240),
    cy: 30 + ((i * 97) % 240),
    r: 4 + (i % 4) * 2,
    delay: (i % 6) * 0.4,
    fill: i % 5 === 0 ? '#C2582E' : i % 3 === 0 ? '#E0A23B' : '#161312',
  }));

  return (
    <svg viewBox="0 0 300 300" className="h-72 w-72" role="img" aria-label="Abstract recommendation embedding space">
      <circle cx="150" cy="150" r="140" fill="none" stroke="#16131220" strokeDasharray="2 6" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} opacity="0.85">
          <animate
            attributeName="cy"
            values={`${d.cy};${d.cy - 10};${d.cy}`}
            dur="6s"
            begin={`${d.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      <line x1="60" y1="200" x2="130" y2="120" stroke="#C2582E" strokeWidth="1" opacity="0.4" />
      <line x1="130" y1="120" x2="210" y2="160" stroke="#C2582E" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
