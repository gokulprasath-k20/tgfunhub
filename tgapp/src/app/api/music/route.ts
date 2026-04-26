import { NextRequest, NextResponse } from 'next/server';
import { fetchMusicVideos } from '@/lib/utils/music';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = (searchParams.get('category') as 'tamil' | 'english' | 'all') || 'all';
    
    const videos = await fetchMusicVideos(category);

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('[GET /api/music]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
