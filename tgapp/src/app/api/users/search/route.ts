import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    await connectDB();

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username profileImage bio isPrivate')
      .limit(20)
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('[GET /api/users/search]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
