import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Smile } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string, files?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ onSend, onTyping, disabled, placeholder }: MessageInputProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (value: string) => {
    setText(value);
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && files.length === 0) || disabled) return;
    onSend(trimmed, files);
    setText('');
    setFiles([]);
    if (onTyping) onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toolbar = [
    { Icon: Mic, label: 'Voice note' },
    { Icon: Smile, label: 'Emoji' },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
      {files.length > 0 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 dark:bg-slate-800">
          {files.map((f, i) => (
            <div key={i} className="relative flex items-center justify-center w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0">
              {f.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(f)} alt="preview" className="object-cover w-full h-full" />
              ) : (
                <span className="text-xs text-slate-500 font-medium truncate px-1">{f.name.split('.').pop()?.toUpperCase()}</span>
              )}
              <button 
                type="button" 
                onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors shrink-0" 
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <input
            ref={inputRef}
            id="message-input"
            name="messageText"
            type="text"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none py-1.5 min-w-0"
            placeholder={placeholder || 'Type a message...'}
            disabled={disabled}
            aria-label="Message input"
            autoComplete="off"
          />
          
          <div className="flex items-center gap-0.5 shrink-0">
            {toolbar.map(({ Icon, label }) => (
              <button key={label} type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors hidden sm:block" aria-label={label}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
            <button
              type="submit"
              disabled={(!text.trim() && files.length === 0) || disabled}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors ml-1"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
