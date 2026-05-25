import { CheckCheck, Clock } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isSelf: boolean;
  senderName: string;
  senderAvatar?: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
  isRead?: boolean;
}

export default function MessageBubble({ content, timestamp, isSelf, senderName, senderAvatar, deliveryStatus, isRead }: MessageBubbleProps) {
  const time = (() => {
    try { return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  })();

  return (
    <div className={`flex gap-2.5 ${isSelf ? 'justify-end' : ''}`}>
      {!isSelf && (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black shrink-0 mt-1">
          {senderAvatar ? (
            <img src={senderAvatar} alt={senderName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            senderName[0]?.toUpperCase()
          )}
        </div>
      )}
      <div className={`max-w-[75%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isSelf
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
          }`}
        >
          <p className="text-xs whitespace-pre-wrap break-words">{content}</p>
        </div>
        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isSelf ? 'justify-end' : ''}`}>
          <span className="text-[10px] text-slate-400 font-medium">{time}</span>
          {isSelf && (
            deliveryStatus === 'read' || isRead ? (
              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
            ) : deliveryStatus === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Clock className="w-3 h-3 text-slate-400" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
