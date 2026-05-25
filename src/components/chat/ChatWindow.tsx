import { useRef, useEffect } from 'react';
import { MessageSquare, ArrowDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ConnectionStatusIndicator from './ConnectionStatus';
import type { ChatMessage, TypingUser } from '../../types/chat';
import type { ConnectionStatus } from '../../hooks/useSocket';

interface ChatWindowProps {
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  currentUserId: string;
  currentUserRole: 'admin' | 'client';
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  connectionStatus: ConnectionStatus;
  conversationName?: string;
  emptyPlaceholder?: string;
}

export default function ChatWindow({
  messages, typingUsers, currentUserId, currentUserRole,
  onSend, onTyping, onLoadMore, hasMore, loading, connectionStatus,
  conversationName, emptyPlaceholder,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(messages.length);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCount.current = messages.length;
  }, [messages.length]);

  // Scroll on first load
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  // Load more when scrolling to top
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onLoadMore || !hasMore) return;

    const handleScroll = () => {
      if (el.scrollTop < 50 && !loading) {
        onLoadMore();
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [onLoadMore, hasMore, loading]);

  const typingNames = typingUsers
    .filter(t => t.userId !== currentUserId)
    .map(t => {
      const msg = messages.find(m => m.senderId._id === t.userId);
      return msg?.senderId?.name || 'Someone';
    });

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20">
      <ConnectionStatusIndicator status={connectionStatus} />

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {conversationName || 'Project Chat'}
        </h3>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {hasMore && (
          <div ref={topRef} className="flex justify-center">
            <button
              onClick={onLoadMore}
              className="text-[10px] text-blue-600 font-semibold hover:underline"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-xs text-slate-400 gap-3">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <span>{emptyPlaceholder || 'No messages yet. Start the conversation!'}</span>
          </div>
        )}

        {messages.map((msg) => {
          const isSelf = msg.senderId._id === currentUserId;
          return <div key={msg._id}><MessageBubble
            content={msg.content}
            timestamp={msg.createdAt}
            isSelf={isSelf}
            senderName={msg.senderId.name}
            senderAvatar={msg.senderId.avatarUrl}
            deliveryStatus={msg.deliveryStatus}
            isRead={msg.isRead}
          /></div>;
        })}

        <TypingIndicator usernames={typingNames} />
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={onSend}
        onTyping={onTyping}
        placeholder="Type a message..."
      />
    </div>
  );
}
