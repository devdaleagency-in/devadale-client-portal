import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send } from 'lucide-react';
import { connectSocket, getSocket } from '../services/chat/socket';
import { api, getAuthToken } from '../utils/api';
import { initialsDataUri } from '../utils/avatar';
import { useSocket } from '../hooks/useSocket';
import { useChat } from '../hooks/useChat';
import type { Conversation } from '../types/chat';
import type { User } from '../types';

interface SupportChatDrawerProps {
  onClose: () => void;
  onTriggerNotification: (msg: string) => void;
  projectName: string;
  currentUser: User | null;
}

export default function SupportChatDrawer({
  onClose,
  onTriggerNotification,
  projectName,
  currentUser,
}: SupportChatDrawerProps) {
  const [typedMessage, setTypedMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { status: connectionStatus } = useSocket();
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages, typingUsers, sendMessage, emitTyping, loading,
  } = useChat({
    conversationId,
    currentUserId: currentUser?.id || '',
    currentUserRole: currentUser?.role === 'admin' ? 'admin' : 'client',
  });

  useEffect(() => {
    const initChat = async () => {
      try {
        const data: Conversation[] = await api.request('/conversations');
        if (data.length > 0) {
          setConversationId(data[0]._id);
        }
      } catch {
        // server unavailable
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSendMessage = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || !conversationId) return;
    setTypedMessage('');
    sendMessage(textToSend);
    onTriggerNotification('Message sent');
  }, [conversationId, sendMessage, onTriggerNotification]);

  const quickReplies = [
    "When is the next milestone draft?",
    "Can we speed up prototyping?",
    "Where is the signed MSA?"
  ];

  const messagesList = messages.map(m => ({
    id: m._id,
    sender: m.senderId._id === currentUser?.id ? 'user' as const : 'agent' as const,
    text: m.content,
    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-850 shadow-2xl flex flex-col z-50 text-xs transition-transform animate-in slide-in-from-right duration-300">

      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              alt="Sarah Chen Support Agent"
              className="w-9 h-9 rounded-full object-cover border border-blue-500/15"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTGfS3cEGwSdGHDpZygaZHGvsFDG9hJ_mxMdfuCR9-6-rHjngZY3OJTrZVbAe1naOlohIYGfK15ABf9PYuOClXXBjsA6Oir3ftkGivisjWfUXralh-xgdoaaybgiL3dvTZhkmNEze9bcCAZeVBfArYUPUZNplkkgrowcQFi3u-mMPOzCWyL7JoBCxT3eulu3aBJ1zk_H6Xa4Cu7zVJe4Zagkpr2h7BVhiIIiqr8U2iNAIHQ8KIvpKdsCCuyRWsyZ0EhhxoiGvgcqc"
              onError={(e) => { (e.target as HTMLImageElement).src = initialsDataUri('Sarah Chen'); }}
            />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-slate-900 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-slate-400'}`} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">Sarah Chen</h4>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider mt-0.5">Engineering & PM Director</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Close chat drawer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-400">
            Loading messages...
          </div>
        )}

        {messagesList.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full text-slate-400 text-center px-4">
            <div>
              <p className="font-semibold mb-1">Welcome to Support</p>
              <p className="text-[10px]">Send a message to start the conversation with the team.</p>
            </div>
          </div>
        )}

        {messagesList.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[82%] ${m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            <div className={`p-3 rounded-2xl shadow-sm leading-relaxed ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700/60'
            }`}>
              {m.text}
            </div>
            <span className="text-[9px] text-slate-400 font-semibold mt-1 px-1">{m.time}</span>
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className="flex flex-col items-start gap-1">
            <div className="p-3 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 space-y-3">

        <div className="flex flex-wrap gap-1.5">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => handleSendMessage(reply)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/50 dark:border-slate-700 text-[10px] font-semibold transition-all"
            >
              {reply}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(typedMessage); }}
          className="flex items-center gap-2"
        >
          <input
            id="support-chat-message"
            type="text"
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            onFocus={() => emitTyping(true)}
            onBlur={() => emitTyping(false)}
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            placeholder="Type your message..."
            aria-label="Type your message"
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl transition-colors shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>

    </div>
  );
}
