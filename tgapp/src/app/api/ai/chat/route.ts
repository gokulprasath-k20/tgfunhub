import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAuthUser } from '@/lib/auth/middleware';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const SYSTEM_PROMPT = `
You are the TG Fun Hub Assistant, a helpful and minimalist concierge for the TG Fun Hub social platform. 
The platform features:
- A Feed for sharing thoughts and images.
- Reels for short-form portrait videos.
- A Video section for long-form landscape videos.
- Real-time Chat with friends.
- A Shop for premium gear like Hoodies and Keyboards.
- WebRTC Voice and Video calling.

Your personality:
- Minimalist and professional (Notion/Apple style).
- Helpful but concise.
- Knowledgeable about the platform features.
- Friendly and tech-forward.

If a user asks about features, explain how to find them in the sidebar. 
If a user asks about buying things, point them to the Shop.
Avoid using markdown headers or bold text excessively. Keep it clean.
`;

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Format history for Gemini
    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const userMessage = messages[messages.length - 1].content;
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`;
    
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error('[POST /api/ai/chat]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
