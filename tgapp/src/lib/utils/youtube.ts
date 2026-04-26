const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export async function fetchTrendingVideos(maxResults = 24) {
  if (!YOUTUBE_API_KEY) throw new Error('YouTube API Key not configured');

  const res = await fetch(
    `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message || 'Failed to fetch trending videos');
  }

  const data = await res.json();
  return data.items.map((item: any) => ({
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
  }));
}

export async function searchVideos(query: string, maxResults = 12) {
  if (!YOUTUBE_API_KEY) throw new Error('YouTube API Key not configured');

  const res = await fetch(
    `${YOUTUBE_API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message || 'Failed to search videos');
  }

  const data = await res.json();
  const videoIds = data.items.map((item: any) => item.id.videoId).join(',');

  // Get details for these videos
  const detailRes = await fetch(
    `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
  );
  
  if (!detailRes.ok) throw new Error('Failed to fetch video details');
  const detailData = await detailRes.json();

  return detailData.items.map((item: any) => ({
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
  }));
}
