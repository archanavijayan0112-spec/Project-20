import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { getRecommendationsForUser, getPopularProducts } from '@/lib/recommend';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || 8);
  const exclude = searchParams.get('exclude'); // comma-separated product ids, e.g. current PDP

  const excludeIds = exclude ? exclude.split(',').filter(Boolean) : [];
  const user = getCurrentUser();

  const products = user
    ? await getRecommendationsForUser(user.id, { limit, excludeIds })
    : await getPopularProducts(limit, excludeIds);

  return NextResponse.json({
    products,
    personalized: Boolean(user),
  });
}
