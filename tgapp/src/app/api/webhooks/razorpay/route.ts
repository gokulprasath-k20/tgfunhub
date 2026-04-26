import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db/mongoose';
import Order from '@/lib/db/models/Order';
import Product from '@/lib/db/models/Product';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      await connectDB();

      const order = await Order.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: 'paid',
          razorpayPaymentId,
          razorpaySignature: signature,
        },
        { new: true }
      );

      if (order) {
        // Decrease stock for products
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('[POST /api/webhooks/razorpay]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
