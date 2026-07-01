import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';
import { logInteraction } from '@/lib/track';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  await connectDB();
  const product = await Product.findOne({ slug: params.slug }).lean();
  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const user = getCurrentUser();
  if (user) {
    // Fire-and-forget: a slow write here shouldn't block the page render.
    logInteraction(user.id, product._id, 'view').catch((err) =>
      console.error('[track view]', err)
    );
  }

  return NextResponse.json({ product });
}
