import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  usernames: string[];
}

export default function TypingIndicator({ usernames }: TypingIndicatorProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (usernames.length === 0) return;
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, [usernames.length]);

  if (usernames.length === 0) return null;

  const label = usernames.length === 1
    ? `${usernames[0]} is typing`
    : `${usernames.join(', ')} are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-400 font-medium animate-in fade-in duration-200">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      {label}
      <span className="w-4 text-left">{dots}</span>
    </div>
  );
}
