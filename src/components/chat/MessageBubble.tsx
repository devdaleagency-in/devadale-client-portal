import { CheckCheck, Clock, Check, FileText, Download } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isSelf: boolean;
  senderName: string;
  senderAvatar?: string;
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'read';
  isRead?: boolean;
  currentUserRole?: 'admin' | 'client' | string;
  attachments?: { url: string; name: string; type: string; size: number }[];
}

export default function MessageBubble({ content, timestamp, isSelf, senderName, senderAvatar, deliveryStatus, isRead, currentUserRole, attachments }: MessageBubbleProps) {
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
          className={`rounded-2xl p-1 text-sm leading-relaxed ${
            isSelf
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
          }`}
        >
          {attachments && attachments.length > 0 && (
            <div className="flex flex-col gap-1 mb-1">
              {attachments.map((file, idx) => (
                <div key={idx} className="relative group">
                  {file.type.startsWith('image/') ? (
                    <a href={file.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700 max-w-sm">
                      <img src={file.url} alt={file.name} className="w-full h-auto object-cover max-h-64 transition-transform hover:scale-105" loading="lazy" />
                    </a>
                  ) : (
                    <a href={file.url} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-3 rounded-xl border ${isSelf ? 'border-blue-500/30 bg-blue-700/50 hover:bg-blue-700/70' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'} transition-colors w-64`}>
                      <div className={`p-2 rounded-lg ${isSelf ? 'bg-blue-500/20 text-blue-200' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className={`text-xs ${isSelf ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'}`}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Download className={`w-4 h-4 ${isSelf ? 'text-blue-200' : 'text-slate-400'}`} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          {content && (
            <div className="px-2.5 py-1.5">
              <p className="text-[13px] whitespace-pre-wrap break-words">{content}</p>
            </div>
          )}
        </div>
        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isSelf ? 'justify-end' : ''}`}>
          <span className="text-[10px] text-slate-400 font-medium">{time}</span>
          {isSelf && (
            deliveryStatus === 'read' || isRead ? (
              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
            ) : (deliveryStatus || 'delivered') === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
            ) : deliveryStatus === 'sent' ? (
              <Check className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Clock className="w-3 h-3 text-slate-400" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
