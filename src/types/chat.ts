export interface ChatMessage {
  _id: string;
  senderId: { _id: string; name: string; email: string; avatarUrl?: string; role: string };
  senderRole: 'client' | 'admin';
  conversationId: string;
  projectId: string;
  content: string;
  isRead: boolean;
  deliveryStatus: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: { url: string; name: string; type: string; size: number }[];
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  projectId: { _id: string; name: string };
  clientId: { _id: string; name: string; email: string; avatarUrl?: string; role: string };
  lastMessage?: {
    content: string;
    senderId: string;
    senderRole: 'client' | 'admin';
    timestamp: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMessages {
  messages: ChatMessage[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TypingUser {
  userId: string;
  conversationId: string;
}
