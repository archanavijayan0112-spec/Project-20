'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

export default function RecommendationRail({ excludeId, title }) {
  const [state, setState] = useState({ loading: true, products: [], personalized: false });

  useEffect(() => {
    const qs = new URLSearchParams({ limit: '8' });
    if (excludeId) qs.set('exclude', excludeId);

    fetch(`/api/recommendations?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) =>
        setState({ loading: false, products: data.products || [], personalized: data.personalized })
      )
      .catch(() => setState({ loading: false, products: [], personalized: false }));
  }, [excludeId]);

  if (!state.loading && state.products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <span className="label-eyebrow">
            {state.personalized ? 'Picked for you · model v1' : 'Trending right now'}
          </span>
          <h2 className="mt-1 font-display text-2xl text-ink">
            {title || (state.personalized ? 'Recommended for you' : 'Popular with shoppers')}
          </h2>
        </div>
        {state.personalized && (
          <span className="hidden font-mono text-[11px] text-ink/40 md:block">
            ranked by embedding similarity
          </span>
        )}
      </div>

      {state.loading ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-sand" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {state.products.map((p) => (
            <ProductCard key={p._id} product={p} badge={state.personalized ? 'For you' : undefined} />
          ))}
        </div>
      )}
    </section>
  );
}
