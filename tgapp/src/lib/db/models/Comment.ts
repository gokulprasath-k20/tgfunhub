import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICommentDocument extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  parentId: Types.ObjectId | null;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    content: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CommentSchema.index({ postId: 1, createdAt: 1 });
CommentSchema.index({ parentId: 1 });

const Comment: Model<ICommentDocument> =
  mongoose.models.Comment ||
  mongoose.model<ICommentDocument>('Comment', CommentSchema);

export default Comment;
