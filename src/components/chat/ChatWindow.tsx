import { useRef, useEffect, useState, useMemo } from 'react';
import { MessageSquare, Search, X } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
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
  onSend: (text: string, files?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  connectionStatus: ConnectionStatus;
  conversationName?: string;
  emptyPlaceholder?: string;
  presence?: { isOnline: boolean; lastSeen: Date | null } | null;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export default function ChatWindow({
  messages, typingUsers, currentUserId, currentUserRole,
  onSend, onTyping, onLoadMore, hasMore, loading, connectionStatus,
  conversationName, emptyPlaceholder, presence, searchQuery, setSearchQuery,
}: ChatWindowProps) {
  const [isSearching, setIsSearching] = useState(false);
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

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    return messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [messages, searchQuery]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; msgs: ChatMessage[] }[] = [];
    let currentDate = '';
    
    filteredMessages.forEach(msg => {
      const dateObj = new Date(msg.createdAt);
      let dateLabel = format(dateObj, 'MMM d, yyyy');
      if (isToday(dateObj)) dateLabel = 'Today';
      else if (isYesterday(dateObj)) dateLabel = 'Yesterday';

      if (currentDate !== dateLabel) {
        currentDate = dateLabel;
        groups.push({ date: dateLabel, msgs: [] });
      }
      groups[groups.length - 1].msgs.push(msg);
    });
    return groups;
  }, [filteredMessages]);

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20">
      <ConnectionStatusIndicator status={connectionStatus} />

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {conversationName || 'Project Chat'}
            {presence?.isOnline && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
          </h3>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {presence?.isOnline ? 'Online' : presence?.lastSeen ? `Last seen ${format(new Date(presence.lastSeen), 'h:mm a')}` : 'Offline'}
          </div>
        </div>
        
        {isSearching ? (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              autoFocus
              type="text" 
              value={searchQuery || ''} 
              onChange={e => setSearchQuery?.(e.target.value)}
              placeholder="Search messages..."
              className="bg-transparent border-none outline-none text-sm w-32 md:w-48"
            />
            <button onClick={() => { setIsSearching(false); setSearchQuery?.(''); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsSearching(true)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Search className="w-4 h-4" />
          </button>
        )}
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

        {messages.length === 0 && !loading && !searchQuery && (
          <div className="flex flex-col items-center justify-center h-full text-xs text-slate-400 gap-3">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <span>{emptyPlaceholder || 'No messages yet. Start the conversation!'}</span>
          </div>
        )}

        {filteredMessages.length === 0 && searchQuery && (
          <div className="flex items-center justify-center py-10 text-sm text-slate-500">
            No matching messages found.
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center my-4">
              <span className="px-3 py-1 bg-slate-200/50 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm">
                {group.date}
              </span>
            </div>
            <div className="space-y-3">
              {group.msgs.map((msg) => {
                const isSelf = msg.senderId._id === currentUserId;
                return <div key={msg._id}><MessageBubble
                  content={msg.content}
                  timestamp={msg.createdAt}
                  isSelf={isSelf}
                  senderName={msg.senderId.name}
                  senderAvatar={msg.senderId.avatarUrl}
                  deliveryStatus={msg.deliveryStatus}
                  isRead={msg.isRead}
                  currentUserRole={currentUserRole}
                  attachments={msg.attachments}
                /></div>;
              })}
            </div>
          </div>
        ))}

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
