import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Product from '@/lib/db/models/Product';
import { seedAll } from '@/lib/db/seedData';
import { getAuthUser } from '@/lib/auth/middleware';

export async function GET() {
  try {
    await connectDB();
    
    let products = await Product.find({}).sort({ createdAt: -1 }).lean();
    
    if (products.length === 0) {
      await seedAll();
      products = await Product.find({}).sort({ createdAt: -1 }).lean();
    }
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper to quickly seed products if admin
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await connectDB();

    const product = await Product.create({
      name: body.name,
      description: body.description,
      price: body.price,
      imageUrl: body.imageUrl,
      category: body.category,
      stock: body.stock || 100,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
