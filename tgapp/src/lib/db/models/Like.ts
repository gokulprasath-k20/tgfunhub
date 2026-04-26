import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILikeDocument extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILikeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Unique compound index prevents duplicate likes
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });
LikeSchema.index({ postId: 1 });

const Like: Model<ILikeDocument> =
  mongoose.models.Like || mongoose.model<ILikeDocument>('Like', LikeSchema);

export default Like;
