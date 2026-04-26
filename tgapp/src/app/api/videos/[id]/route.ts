import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import { getAuthUser } from '@/lib/auth/middleware';
import { fetchTrendingVideos } from '@/lib/utils/youtube';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getAuthUser(req);
    await connectDB();

    // Check local database first
    let video = null;
    if (id.length === 24) {
      video = await Post.findOne({ _id: id, type: 'video' })
        .populate('userId', 'username profileImage')
        .lean();
    }

    // If not found locally, try YouTube
    if (!video) {
      try {
        const youtubeRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=${process.env.YOUTUBE_API_KEY}`);
        if (youtubeRes.ok) {
          const data = await youtubeRes.json();
          if (data.items?.length > 0) {
            const item = data.items[0];
            video = {
              _id: item.id,
              type: 'video',
              userId: {
                username: item.snippet.channelTitle,
                profileImage: null,
              },
              content: {
                title: item.snippet.title,
                text: item.snippet.description,
                videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
                thumbnailUrl: item.snippet.thumbnails.high.url,
              },
              stats: {
                likes: parseInt(item.statistics.likeCount || '0'),
                comments: parseInt(item.statistics.commentCount || '0'),
                views: parseInt(item.statistics.viewCount || '0'),
              },
              createdAt: item.snippet.publishedAt,
            };
          }
        }
      } catch (err) {
        console.error('[YouTube Fetch Error]', err);
      }
    }

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const formattedVideo = {
      ...video,
      isLiked: user && (video as any).likes ? (video as any).likes.includes(user.sub) : false,
      likes: undefined,
    };

    return NextResponse.json({ video: formattedVideo });
  } catch (error) {
    console.error('[GET /api/videos/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

