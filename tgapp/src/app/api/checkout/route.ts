import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Order from '@/lib/db/models/Order';
import Product from '@/lib/db/models/Product';
import { getAuthUser } from '@/lib/auth/middleware';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { productId, quantity = 1, shippingAddress } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Out of stock' }, { status: 400 });
    }

    const totalAmount = product.price * quantity; // In paise

    // Create Razorpay order
    const options = {
      amount: totalAmount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save pending order in DB
    const newOrder = await Order.create({
      userId: user.sub,
      products: [{ productId: product._id, quantity, price: product.price }],
      totalAmount,
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
      shippingAddress: shippingAddress || '',
    });

    return NextResponse.json({
      orderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
    });
  } catch (error: any) {
    console.error('[POST /api/checkout]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
