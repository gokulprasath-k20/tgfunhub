import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFollowDocument extends Document {
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted';
  createdAt: Date;
  updatedAt: Date;
}

const FollowSchema = new Schema<IFollowDocument>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { 
      type: String, 
      enum: ['pending', 'accepted'], 
      default: 'accepted' // Default to accepted for public accounts
    },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate follows
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow: Model<IFollowDocument> =
  mongoose.models.Follow || mongoose.model<IFollowDocument>('Follow', FollowSchema);

export default Follow;
