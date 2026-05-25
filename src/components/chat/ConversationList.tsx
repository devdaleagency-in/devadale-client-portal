import { Search, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import type { Conversation } from '../../types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  currentUserId: string;
  currentUserRole: 'admin' | 'client';
}

function formatTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  } catch { return ''; }
}

export default function ConversationList({ conversations, activeId, onSelect, currentUserId, currentUserRole }: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const projectName = c.projectId?.name?.toLowerCase() || '';
    const clientName = c.clientId?.name?.toLowerCase() || '';
    return projectName.includes(q) || clientName.includes(q);
  });

  return (
    <div className="flex flex-col h-full border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Messages</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            id="conversation-search"
            name="conversationSearch"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Search conversations..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-xs text-slate-400 gap-2">
            <MessageSquare className="w-8 h-8 opacity-40" />
            <span>{search ? 'No conversations match' : 'No conversations yet'}</span>
          </div>
        )}
        {filtered.map((conv) => {
          const isActive = conv._id === activeId;
          const otherName = currentUserRole === 'admin' ? conv.clientId?.name : 'Agency';
          const preview = conv.lastMessage?.content || 'No messages yet';
          const time = conv.lastMessage?.timestamp ? formatTime(conv.lastMessage.timestamp) : '';

          return (
            <button
              key={conv._id}
              onClick={() => onSelect(conv._id)}
              className={`w-full text-left px-3.5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-black shrink-0">
                  {otherName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{otherName}</span>
                    {time && <span className="text-[10px] text-slate-400 shrink-0">{time}</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{preview}</p>
                  {conv.projectId?.name && (
                    <span className="text-[10px] text-blue-500 font-medium">{conv.projectId.name}</span>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
