import { useCallback } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { useSocket } from '../../hooks/useSocket';
import { useChat } from '../../hooks/useChat';
import { useChatStore } from '../../store/chatStore';

interface RealtimeChatProps {
  currentUserId: string;
  currentUserRole: 'admin' | 'client';
  emptyPlaceholder?: string;
}

export default function RealtimeChat({ currentUserId, currentUserRole, emptyPlaceholder }: RealtimeChatProps) {
  const { status: connectionStatus } = useSocket();
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  const {
    messages, conversations, typingUsers, loading, sendMessage, emitTyping, loadMore, hasMore,
    searchQuery, setSearchQuery, onlineUsers
  } = useChat({
    conversationId: activeConversationId,
    currentUserId,
    currentUserRole,
  });

  const activeConv = conversations.find(c => c._id === activeConversationId);
  const conversationName = activeConv?.projectId?.name || activeConv?.clientId?.name;
  
  // Find the other user's presence
  const otherUserId = currentUserRole === 'admin' ? activeConv?.clientId?._id : activeConv?.adminIds?.[0];
  const presence = otherUserId ? onlineUsers[otherUserId] : null;

  const handleTyping = useCallback((isTyping: boolean) => {
    emitTyping(isTyping);
  }, [emitTyping]);

  return (
    <div className="flex h-full border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      {/* Conversation sidebar */}
      <div className="w-72 lg:w-80 shrink-0 hidden sm:block">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={setActiveConversation}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConversationId ? (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
            <div className="text-center space-y-2">
              <div className="text-4xl">💬</div>
              <p className="font-medium">Select a conversation to start chatting</p>
              <p className="text-xs text-slate-400">Choose from the sidebar or start a new conversation</p>
            </div>
          </div>
        ) : (
          <ChatWindow
            messages={messages}
            typingUsers={typingUsers}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onSend={sendMessage}
            onTyping={handleTyping}
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={loading}
            connectionStatus={connectionStatus}
            conversationName={conversationName}
            emptyPlaceholder={emptyPlaceholder}
            presence={presence}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
      </div>
    </div>
  );
}
