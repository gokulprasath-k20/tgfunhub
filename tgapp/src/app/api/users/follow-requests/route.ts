import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import Follow from '@/lib/db/models/Follow';
import { getAuthUser } from '@/lib/auth/middleware';

// GET /api/users/follow-requests — list pending requests
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    await connectDB();
    const requests = await Follow.find({
      followingId: user.sub,
      status: 'pending',
    })
      .populate('followerId', 'username profileImage')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PUT /api/users/follow-requests — accept/decline
export async function PUT(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const { requestId, action } = await req.json(); // action: 'accept' | 'decline'

    await connectDB();
    const follow = await Follow.findOne({
      _id: requestId,
      followingId: user.sub,
    });

    if (!follow) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    if (action === 'accept') {
      follow.status = 'accepted';
      await follow.save();
    } else {
      await Follow.deleteOne({ _id: requestId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
