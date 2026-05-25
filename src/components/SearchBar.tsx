import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchBarProps {
  onOpen: () => void;
}

export default function SearchBar({ onOpen }: SearchBarProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <button
      onClick={onOpen}
      className="group relative w-full flex items-center gap-3 px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-left text-xs text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      aria-label="Open global search"
    >
      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-blue-500 transition-colors" />
      <span className="flex-1 truncate">Search projects, files, messages...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-200/70 dark:bg-slate-700/70 border border-slate-200/50 dark:border-slate-600/50 rounded-md shrink-0">
        {isMac ? <CmdSymbol /> : 'Ctrl'}
        <span className="text-[9px]">K</span>
      </kbd>
    </button>
  );
}

function CmdSymbol() {
  return (
    <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3.5 3.5C3.5 2.67 4.17 2 5 2C5.83 2 6.5 2.67 6.5 3.5V6.5H3.5C2.67 6.5 2 5.83 2 5C2 4.17 2.67 3.5 3.5 3.5Z" />
      <path d="M12.5 3.5C12.5 2.67 11.83 2 11 2C10.17 2 9.5 2.67 9.5 3.5V6.5H12.5C13.33 6.5 14 5.83 14 5C14 4.17 13.33 3.5 12.5 3.5Z" />
      <path d="M9.5 12.5C9.5 13.33 10.17 14 11 14C11.83 14 12.5 13.33 12.5 12.5V9.5H9.5V12.5Z" />
      <path d="M3.5 12.5C3.5 13.33 4.17 14 5 14C5.83 14 6.5 13.33 6.5 12.5V9.5H3.5C2.67 9.5 2 10.17 2 11C2 11.83 2.67 12.5 3.5 12.5Z" />
    </svg>
  );
}
