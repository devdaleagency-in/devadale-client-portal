import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import type { ChatMessage, Conversation, TypingUser, PaginatedMessages } from '../types/chat';
import { api } from '../utils/api';
import { getSocket } from '../services/chat/socket';

interface UseChatOptions {
  conversationId: string | null;
  currentUserId: string;
  currentUserRole: 'admin' | 'client';
}

interface ChatState {
  messages: ChatMessage[];
  conversations: Conversation[];
  activeConversation: Conversation | null;
  typingUsers: TypingUser[];
  loading: boolean;
  sending: boolean;
  hasMore: boolean;
}

export function useChat({ conversationId, currentUserId, currentUserRole }: UseChatOptions) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    conversations: [],
    activeConversation: null,
    typingUsers: [],
    loading: false,
    sending: false,
    hasMore: true,
  });
  const [page, setPage] = useState(1);
  const listenersAttached = useRef(false);

  const update = useCallback((partial: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data: Conversation[] = await api.request('/conversations');
      update({ conversations: data });
    } catch {
      // ignore
    }
  }, [update]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string, pageNum: number = 1) => {
    try {
      update({ loading: true });
      const data = await api.request<PaginatedMessages>(`/conversations/${convId}/messages?page=${pageNum}&limit=50`);
      if (pageNum === 1) {
        update({ messages: data.messages, hasMore: data.page < data.totalPages, loading: false });
      } else {
        update(prev => ({
          messages: [...data.messages, ...prev.messages],
          hasMore: data.page < data.totalPages,
          loading: false,
        }));
      }
    } catch {
      update({ loading: false });
    }
  }, [update]);

  // Load more (pagination)
  const loadMore = useCallback(() => {
    if (!conversationId || !state.hasMore || state.loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(conversationId, nextPage);
  }, [conversationId, state.hasMore, state.loading, page, fetchMessages]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return;
    update({ sending: true });

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('sendMessage', { conversationId, projectId: state.activeConversation?.projectId?._id, content: content.trim() });
    } else {
      try {
        await api.sendMessage(content);
        await fetchMessages(conversationId, 1);
      } catch {
        // fallback
      }
    }
    update({ sending: false });
  }, [conversationId, state.activeConversation, update, fetchMessages]);

  // Emit typing
  const emitTyping = useCallback((isTyping: boolean) => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket?.connected) return;
    socket.emit(isTyping ? 'typing' : 'stopTyping', { conversationId });
  }, [conversationId]);

  // Mark as read
  const markAsRead = useCallback((messageIds: string[]) => {
    if (!conversationId || messageIds.length === 0) return;
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('markAsRead', { conversationId, messageIds });
    }
  }, [conversationId]);

  // Set up socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || listenersAttached.current) return;

    listenersAttached.current = true;

    const handleReceiveMessage = (msg: ChatMessage) => {
      setState(prev => {
        const exists = prev.messages.some(m => m._id === msg._id);
        if (exists) return prev;
        return { ...prev, messages: [...prev.messages, msg] };
      });
      if (msg.conversationId === conversationId && msg.senderId._id !== currentUserId) {
        markAsRead([msg._id]);
      }
      fetchConversations();
    };

    const handleMessagesRead = (data: { conversationId: string; userId: string }) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m =>
          m.conversationId === data.conversationId && m.senderId._id !== currentUserId
            ? { ...m, isRead: true, deliveryStatus: 'read' as const }
            : m
        ),
      }));
    };

    const handleUserTyping = (data: TypingUser) => {
      if (data.conversationId !== conversationId) return;
      setState(prev => {
        if (prev.typingUsers.some(t => t.userId === data.userId)) return prev;
        return { ...prev, typingUsers: [...prev.typingUsers, data] };
      });
    };

    const handleUserStopTyping = (data: TypingUser) => {
      setState(prev => ({
        ...prev,
        typingUsers: prev.typingUsers.filter(t => t.userId !== data.userId),
      }));
    };

    const handleConversationUpdated = () => {
      fetchConversations();
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStopTyping', handleUserStopTyping);
    socket.on('conversationUpdated', handleConversationUpdated);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStopTyping', handleUserStopTyping);
      socket.off('conversationUpdated', handleConversationUpdated);
      listenersAttached.current = false;
    };
  }, [conversationId, currentUserId, markAsRead, fetchConversations]);

  // Join/leave room when conversation changes
  useEffect(() => {
    const socket = getSocket();
    if (!socket?.connected) return;

    // Leave all conversation rooms first
    state.conversations.forEach(c => {
      socket.emit('leaveConversation', c._id);
    });

    if (conversationId) {
      socket.emit('joinConversation', conversationId);
      fetchMessages(conversationId, 1);
      setPage(1);
      update({ typingUsers: [] });
    }

    return () => {
      if (conversationId) {
        socket.emit('leaveConversation', conversationId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Set active conversation
  useEffect(() => {
    if (!conversationId) {
      update({ activeConversation: null });
      return;
    }
    const conv = state.conversations.find(c => c._id === conversationId);
    if (conv) update({ activeConversation: conv });
  }, [conversationId, state.conversations, update]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    ...state,
    sendMessage,
    loadMore,
    emitTyping,
    fetchConversations,
    fetchMessages,
  };
}
