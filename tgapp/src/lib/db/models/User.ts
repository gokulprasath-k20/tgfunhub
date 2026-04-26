import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  email: string;
  password: string;
  username: string;
  profileImage: string | null;
  bio: string;
  isPrivate: boolean;
  emailVerified: boolean;
  emailVerificationToken: string | undefined;
  emailVerificationExpires: Date | undefined;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  refreshToken: string | undefined;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
  };
  mfaSecret: string | null;
  loginAttempts: number;
  lockUntil: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-zA-Z0-9_]+$/,
      index: true,
    },
    profileImage: { type: String, default: null },
    bio: { type: String, maxlength: 160, default: '' },
    isPrivate: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    refreshToken: { type: String },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      emailNotifications: { type: Boolean, default: true },
    },
    mfaSecret: { type: String, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const data = ret as Record<string, unknown>;
        delete data.password;
        delete data.emailVerificationToken;
        delete data.passwordResetToken;
        delete data.refreshToken;
        delete data.mfaSecret;
        delete data.loginAttempts;
        delete data.lockUntil;
        return data;
      },
    },
  }
);

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
