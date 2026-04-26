export interface IPost {
  _id: string;
  type: 'text' | 'reel' | 'video';
  userId: string | IPostAuthor;
  content: {
    text?: string;
    title?: string;
    images?: string[];
    videoUrl?: string;
    thumbnailUrl?: string;
  };
  stats: {
    likes: number;
    comments: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostAuthor {
  _id: string;
  username: string;
  profileImage: string | null;
}

export interface IPostWithMeta extends IPost {
  userId: IPostAuthor;
  isLiked?: boolean;
}

export interface CreatePostInput {
  text: string;
  images?: string[];
}

export interface CreateReelInput {
  text?: string;
  videoUrl: string;
}

export interface PostsResponse {
  posts: IPostWithMeta[];
  nextCursor: string | null;
  hasMore: boolean;
}
