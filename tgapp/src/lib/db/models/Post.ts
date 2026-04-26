import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPostDocument extends Document {
  userId: Types.ObjectId;
  type: 'text' | 'reel';
  content: {
    text: string;
    images: string[];
    videoUrl?: string;
  };
  stats: {
    likes: number;
    comments: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPostDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['text', 'reel', 'video'],
      default: 'text',
      index: true,
    },
    content: {
      text: { type: String, maxlength: 2000, default: '' },
      title: { type: String, maxlength: 100 },
      images: {
        type: [String],
        validate: {
          validator: (arr: string[]) => arr.length <= 4,
          message: 'Maximum 4 images per post',
        },
        default: [],
      },
      videoUrl: { type: String },
      thumbnailUrl: { type: String },
    },
    stats: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Optimized indexes
PostSchema.index({ createdAt: -1 });
PostSchema.index({ userId: 1, createdAt: -1 });

const Post: Model<IPostDocument> =
  mongoose.models.Post || mongoose.model<IPostDocument>('Post', PostSchema);

export default Post;
