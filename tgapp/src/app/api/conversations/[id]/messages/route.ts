import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Message from '@/lib/db/models/Message';
import Conversation from '@/lib/db/models/Conversation';
import { getAuthUser } from '@/lib/auth/middleware';

const PAGE_SIZE = 20;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversationId = params.id;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');

    await connectDB();

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!conversation.participants.includes(user.sub as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const query: Record<string, unknown> = { conversationId };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(PAGE_SIZE + 1)
      .populate('senderId', 'username profileImage')
      .lean();

    const hasMore = messages.length > PAGE_SIZE;
    const result = hasMore ? messages.slice(0, PAGE_SIZE) : messages;
    const nextCursor = hasMore ? String(result[result.length - 1]._id) : null;

    // Messages are fetched newest first, usually chat UIs reverse this or use column-reverse
    return NextResponse.json({ messages: result, nextCursor, hasMore });
  } catch (error) {
    console.error('[GET /api/conversations/[id]/messages]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/conversations/[id]/messages
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    await connectDB();
    const conversationId = params.id;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(user.sub as any)) {
      return NextResponse.json({ error: 'Conversation not found or forbidden' }, { status: 403 });
    }

    const message = await Message.create({
      conversationId,
      senderId: user.sub,
      text,
      readBy: [user.sub],
    });

    // Update the conversation's lastMessage
    conversation.lastMessage = message._id as any;
    await conversation.save();

    return NextResponse.json({ message });
  } catch (error) {
    console.error('[POST /api/conversations/[id]/messages]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
