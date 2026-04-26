const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export async function fetchMusicVideos(category: 'tamil' | 'english' | 'all' = 'all', targetCount = 300) {
  if (!YOUTUBE_API_KEY) throw new Error('YouTube API Key not configured');

  const queries = {
    tamil: ['latest tamil songs', 'tamil hit songs 2024'],
    english: ['english pop songs 2024', 'english trending songs'],
    all: ['latest tamil songs', 'english pop songs']
  };

  const selectedQueries = category === 'all' ? queries.all : queries[category];
  const resultsPerQuery = Math.ceil(targetCount / selectedQueries.length);
  
  let allItems: any[] = [];

  for (const query of selectedQueries) {
    let queryResults: any[] = [];
    let nextPageToken = '';
    
    // Fetch multiple pages if needed to reach resultsPerQuery
    while (queryResults.length < resultsPerQuery) {
      const maxResults = Math.min(50, resultsPerQuery - queryResults.length);
      const url = `${YOUTUBE_API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&videoCategoryId=10&pageToken=${nextPageToken}&key=${YOUTUBE_API_KEY}`;
      
      const res = await fetch(url);
      if (!res.ok) break;
      
      const data = await res.json();
      if (!data.items || data.items.length === 0) break;
      
      queryResults = [...queryResults, ...data.items];
      nextPageToken = data.nextPageToken;
      
      if (!nextPageToken) break;
    }
    allItems = [...allItems, ...queryResults];
  }

  // Flatten and remove duplicates
  const seenIds = new Set();
  const uniqueVideos = allItems.filter((item: any) => {
    const id = item.id.videoId;
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });

  // Batch process video details (YouTube allows up to 50 IDs per request)
  const finalVideos: any[] = [];
  const videoIds = uniqueVideos.map((v: any) => v.id.videoId);
  
  for (let i = 0; i < videoIds.length; i += 50) {
    const batchIds = videoIds.slice(i, i + 50).join(',');
    const detailRes = await fetch(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&id=${batchIds}&key=${YOUTUBE_API_KEY}`
    );
    
    if (detailRes.ok) {
      const detailData = await detailRes.json();
      const batchVideos = detailData.items.map((item: any) => ({
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
      finalVideos.push(...batchVideos);
    }
  }

  return finalVideos.slice(0, targetCount);
}
