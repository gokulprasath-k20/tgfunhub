export interface IComment {
  _id: string;
  userId: ICommentAuthor | string;
  postId: string;
  parentId: string | null;
  content: string;
  replies?: IComment[];
  createdAt: Date;
}

export interface ICommentAuthor {
  _id: string;
  username: string;
  profileImage: string | null;
}

export interface ICommentWithMeta extends IComment {
  userId: ICommentAuthor;
  replies: ICommentWithMeta[];
}

export interface CreateCommentInput {
  postId: string;
  parentId?: string;
  content: string;
}
