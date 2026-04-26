import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IConversationDocument extends Document {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  isGroup: boolean;
  groupName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversationDocument>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index to quickly find a conversation between users
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });

const Conversation: Model<IConversationDocument> =
  mongoose.models.Conversation ||
  mongoose.model<IConversationDocument>('Conversation', ConversationSchema);

export default Conversation;
