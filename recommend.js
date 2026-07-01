import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { logInteraction } from '@/lib/track';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  await connectDB();
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ ok: true, skipped: 'not logged in' });

  const { productId, type } = await req.json();
  if (!productId || !['view', 'add_to_cart'].includes(type)) {
    return NextResponse.json({ error: 'Invalid track event.' }, { status: 400 });
  }

  await logInteraction(user.id, productId, type);
  return NextResponse.json({ ok: true });
}
