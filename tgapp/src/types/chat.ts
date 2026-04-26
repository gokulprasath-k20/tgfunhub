export interface IChatUser {
  _id: string;
  username: string;
  profileImage: string | null;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string | IChatUser;
  text: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  _id: string;
  participants: (string | IChatUser)[];
  lastMessage?: string | IMessage;
  isGroup: boolean;
  groupName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationsResponse {
  conversations: IConversation[];
}

export interface MessagesResponse {
  messages: IMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}
