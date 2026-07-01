import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getCurrentUser } from '@/lib/auth';
import { logInteraction } from '@/lib/track';

export const dynamic = 'force-dynamic';

// Stands in for Stripe's webhook in mock-payment mode: a real Stripe
// integration confirms payment via app/api/webhook/stripe/route.js instead.
export async function POST(req, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await connectDB();
  const order = await Order.findOne({ _id: params.orderId, user: user.id });
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  if (order.status !== 'paid') {
    order.status = 'paid';
    order.stripePaymentIntentId = `mock_pi_${order._id}`;
    await order.save();

    for (const item of order.items) {
      await logInteraction(order.user, item.product, 'purchase').catch((err) =>
        console.error('[mock checkout] failed to log purchase interaction', err)
      );
    }
  }

  return NextResponse.json({ ok: true, sessionId: order.stripeSessionId });
}
