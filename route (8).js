import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getStripe } from '@/lib/stripe';
import { logInteraction } from '@/lib/track';

export const dynamic = 'force-dynamic';

// Stripe requires the raw request body to verify the webhook signature,
// so this route must NOT run through Next's default JSON body parsing.
export const runtime = 'nodejs';

export async function POST(req) {
  const stripe = getStripe();
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] signature verification failed', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await connectDB();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.status !== 'paid') {
        order.status = 'paid';
        order.stripePaymentIntentId = session.payment_intent;
        await order.save();

        // Every purchased line item becomes a strong positive signal for
        // the next training run (ml/train.js blends these in automatically).
        for (const item of order.items) {
          await logInteraction(order.user, item.product, 'purchase').catch((err) =>
            console.error('[webhook] failed to log purchase interaction', err)
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
