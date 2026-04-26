export interface IUser {
  _id: string;
  email: string;
  username: string;
  profileImage: string | null;
  bio: string;
  isPrivate: boolean;
  emailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
  };
  mfaSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  _id: string;
  username: string;
  profileImage: string | null;
  bio: string;
  isPrivate: boolean;
  createdAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  profileImage: string | null;
  emailVerified: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
