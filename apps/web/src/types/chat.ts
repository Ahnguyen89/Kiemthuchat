export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ChatMember {
  id: string;
  userId: string;
  chatRoomId: string;
  role: 'ADMIN' | 'MEMBER';
  isOnline: boolean;
  lastSeenAt: Date;
  joinedAt: Date;
  user: User;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: 'DIRECT' | 'GROUP';
  createdAt: Date;
  updatedAt: Date;
  members: ChatMember[];
  messages?: Message[];
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  isDeleted: boolean;
  sender: User;
  statuses: MessageStatus[];
}

export interface MessageStatus {
  id: string;
  messageId: string;
  userId: string;
  status: 'SENT' | 'DELIVERED' | 'SEEN';
  timestamp: Date;
}

export interface TypingUser {
  userId: string;
  userName: string;
  chatRoomId: string;
}