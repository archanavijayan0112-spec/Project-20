import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await connectDB();
  const order = await Order.findOne({ _id: params.orderId, user: user.id }).lean();
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  return NextResponse.json({ order });
}
