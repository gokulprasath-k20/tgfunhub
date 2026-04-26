import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Conversation from '@/lib/db/models/Conversation';
import { getAuthUser } from '@/lib/auth/middleware';
import User from '@/lib/db/models/User';
import mongoose from 'mongoose';

// GET /api/conversations
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const conversations = await Conversation.find({
      participants: user.sub,
    })
      .populate('participants', 'username profileImage')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('[GET /api/conversations]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/conversations — Start a new conversation
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    if (targetUserId === user.sub) {
      return NextResponse.json({ error: 'Cannot start conversation with yourself' }, { status: 400 });
    }

    await connectDB();

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Check if 1-on-1 conversation already exists
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [user.sub, targetUserId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [user.sub, targetUserId],
        isGroup: false,
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'username profileImage')
      .lean();

    return NextResponse.json({ conversation: populated });
  } catch (error) {
    console.error('[POST /api/conversations]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
