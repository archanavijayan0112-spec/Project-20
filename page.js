'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-store';
import { useCurrentUser } from '@/lib/use-current-user';

export default function Navbar() {
  const router = useRouter();
  const count = useCart((s) => s.count());
  const user = useCurrentUser();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          Shelf<span className="text-clay">sense</span>
        </Link>

        <nav className="hidden items-center gap-7 font-body text-sm text-ink/70 md:flex">
          <Link href="/" className="hover:text-ink">Catalog</Link>
          {user && <Link href="/profile" className="hover:text-ink">Orders</Link>}
        </nav>

        <div className="flex items-center gap-4">
          {user === undefined ? null : user ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="label-eyebrow normal-case tracking-normal text-ink/60">
                {user.name?.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="text-sm text-ink/60 hover:text-clay">
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden text-sm text-ink/70 hover:text-ink md:block">
              Sign in
            </Link>
          )}

          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center rounded-sm border border-ink/15 px-4 py-2 text-sm hover:border-ink"
          >
            Cart
            {count > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 font-mono text-[11px] text-paper">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
