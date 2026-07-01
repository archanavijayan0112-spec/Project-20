'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/format';
import { useCurrentUser } from '@/lib/use-current-user';

const STATUS_LABEL = {
  pending: 'Pending payment',
  paid: 'Paid',
  failed: 'Failed',
  fulfilled: 'Fulfilled',
};

export default function ProfilePage() {
  const user = useCurrentUser();
  const router = useRouter();
  const [orders, setOrders] = useState(undefined);

  useEffect(() => {
    if (user === null) router.push('/login?next=/profile');
    if (user) {
      fetch('/api/orders')
        .then((r) => r.json())
        .then((data) => setOrders(data.orders || []));
    }
  }, [user, router]);

  if (!user) return <div className="mx-auto max-w-4xl px-6 py-20 text-ink/40">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <span className="label-eyebrow">Account</span>
      <h1 className="mt-1 font-display text-3xl text-ink">{user.name}</h1>
      <p className="text-sm text-ink/50">{user.email}</p>

      <h2 className="mt-10 font-display text-xl text-ink">Order history</h2>

      {orders === undefined ? (
        <p className="mt-4 text-ink/40">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-4 text-ink/50">No orders yet — your first purchase will show up here.</p>
      ) : (
        <div className="mt-4 divide-y divide-ink/10">
          {orders.map((order) => (
            <div key={order._id} className="py-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink/40">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span className="rounded-sm border border-ink/15 px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-ink/60">
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-ink/70">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.quantity}× {item.title}
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-mono text-sm text-ink">{formatPrice(order.subtotal)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
