import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  FolderKanban,
  FileText,
  DollarSign,
  FileSignature,
  CalendarCheck,
  CheckSquare,
  Bell,
  Activity,
  Clock,
  TrendingUp,
  ArrowRight,
  Star,
  History,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import type { SearchResultItem } from '../utils/search';
import { searchAll, getFilterOptions, getRecentSearches, addRecentSearch } from '../utils/search';
import type { Project, Agreement, ActivityFeed, Invoice, UploadedFile, ApprovalItem, TeamActivity, Deadline } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  agreements: Agreement[];
  activity: ActivityFeed[];
  invoices: Invoice[];
  uploads: UploadedFile[];
  approvals: ApprovalItem[];
  teamActivity: TeamActivity[];
  deadlines?: Deadline[];
  onNavigate: (tab: string) => void;
  onTriggerAction: (msg: string) => void;
}

const categoryIcons: Record<string, typeof FolderKanban> = {
  Projects: FolderKanban,
  Files: FileText,
  Invoices: DollarSign,
  Agreements: FileSignature,
  Tasks: CalendarCheck,
  Deliverables: CheckSquare,
  Activity: Activity,
};

const statusColors: Record<string, string> = {
  healthy: 'text-emerald-500',
  warning: 'text-amber-500',
  critical: 'text-rose-500',
  paid: 'text-emerald-500',
  pending: 'text-amber-500',
  overdue: 'text-rose-500',
  signed: 'text-emerald-500',
  draft: 'text-slate-400',
  approved: 'text-emerald-500',
  rejected: 'text-rose-500',
};

const categoryOrder = ['Projects', 'Files', 'Invoices', 'Agreements', 'Tasks', 'Deliverables', 'Activity'] as const;

function HighlightedText({ text, highlights, className }: { text: string; highlights: number[]; className?: string }) {
  if (!highlights.length) return <span className={className}>{text}</span>;

  const q = text.slice(highlights[0], highlights[0] + 1).toLowerCase();
  const hlLen = 1;

  const parts: { str: string; hl: boolean }[] = [];
  let lastIdx = 0;

  for (const idx of highlights) {
    if (idx > lastIdx) parts.push({ str: text.slice(lastIdx, idx), hl: false });
    parts.push({ str: text.slice(idx, idx + hlLen + 3), hl: true });
    lastIdx = idx + hlLen + 3;
  }
  if (lastIdx < text.length) parts.push({ str: text.slice(lastIdx), hl: false });

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.hl ? (
          <mark key={i} className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-sm px-0.5">
            {part.str}
          </mark>
        ) : (
          <span key={i}>{part.str}</span>
        ),
      )}
    </span>
  );
}

function RecentSearches({ onSelect }: { onSelect: (q: string) => void }) {
  const recent = getRecentSearches();

  if (!recent.length) return null;

  return (
    <div className="px-4 pt-3 pb-1">
      <div className="flex items-center gap-1.5 mb-2">
        <History className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent searches</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {recent.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1"
          >
            <Clock className="w-2.5 h-2.5" />
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Search className="w-6 h-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No results for &ldquo;{query}&rdquo;</p>
      <p className="text-[11px] text-slate-400 mt-1 text-center max-w-xs">
        Try adjusting your search or filters. Search across projects, files, invoices, agreements, tasks, and more.
      </p>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="px-4 py-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          {[1, 2].map((j) => (
            <div key={j} className="flex items-center gap-3 p-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SearchFiltersRow({
  activeCategory,
  onCategoryChange,
  allCategories,
}: {
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  allCategories: string[];
}) {
  return (
    <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none border-b border-slate-100 dark:border-slate-800/50">
      <SlidersHorizontal className="w-3 h-3 text-slate-400 shrink-0 mr-0.5" />
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
          !activeCategory
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        All
      </button>
      {allCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(activeCategory === cat ? null : cat)}
          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
            activeCategory === cat
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function ResultIcon({ category, item }: { category: string; item: SearchResultItem }) {
  const Icon = categoryIcons[category] || FolderKanban;

  const variantStyles: Record<string, string> = {
    Projects: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    Files: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
    Invoices: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    Agreements: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    Tasks: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
    Deliverables: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
    Activity: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  };

  return (
    <div className={`w-8 h-8 rounded-lg ${variantStyles[category] || variantStyles.Activity} flex items-center justify-center shrink-0`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

function CategoryGroup({
  category,
  items,
  selectedIndex,
  onSelect,
}: {
  category: string;
  items: SearchResultItem[];
  selectedIndex: number | null;
  onSelect: (item: SearchResultItem) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{category}</span>
        <span className="text-[9px] font-mono text-slate-300 dark:text-slate-600">({items.length})</span>
      </div>
      {items.map((item, idx) => (
        <button
          key={`${item.category}-${item.id}`}
          onClick={() => onSelect(item)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
            selectedIndex === idx
              ? 'bg-blue-50 dark:bg-blue-950/20'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <ResultIcon category={category} item={item} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <HighlightedText
                text={item.title}
                highlights={item.highlights?.title || []}
                className={`text-xs font-bold truncate ${
                  selectedIndex === idx
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              />
              <div className="flex items-center gap-1.5 shrink-0">
                {item.status && (
                  <span className={`text-[9px] font-bold capitalize ${statusColors[item.status] || 'text-slate-400'}`}>
                    {item.status}
                  </span>
                )}
                <ChevronRight className={`w-3 h-3 transition-all ${
                  selectedIndex === idx
                    ? 'text-blue-500 opacity-100 translate-x-0'
                    : 'text-slate-300 opacity-0 -translate-x-1'
                }`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <HighlightedText
                text={item.subtitle}
                highlights={item.highlights?.subtitle || []}
                className="text-[10px] text-slate-400 truncate"
              />
              {item.owner && (
                <>
                  <span className="text-[9px] text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400 truncate">{item.owner}</span>
                </>
              )}
              {item.timestamp && (
                <>
                  <span className="text-[9px] text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400 truncate shrink-0">{item.timestamp}</span>
                </>
              )}
              {item.priority && (
                <span className={`text-[9px] font-bold ${
                  item.priority === 'high' || item.priority === 'critical'
                    ? 'text-rose-500'
                    : item.priority === 'medium'
                    ? 'text-amber-500'
                    : 'text-slate-400'
                }`}>
                  {item.priority}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function PopularSuggestions({ projects, onNavigate }: { projects: Project[]; onNavigate: (tab: string) => void }) {
  const popular = projects.slice(0, 3);

  return (
    <div className="px-4 pt-3 pb-1">
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Popular projects</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {popular.map((p) => (
          <button
            key={p.id}
            onClick={() => onNavigate('dashboard')}
            className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1"
          >
            <FolderKanban className="w-2.5 h-2.5 text-blue-500" />
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SearchModal({
  isOpen,
  onClose,
  projects,
  agreements,
  activity,
  invoices,
  uploads,
  approvals,
  teamActivity,
  deadlines = [],
  onNavigate,
  onTriggerAction,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showRecent, setShowRecent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const allCategories = useMemo(
    () => getFilterOptions(projects, uploads, invoices, approvals).categories,
    [projects, uploads, invoices, approvals],
  );

  const [resolvedResults, setResolvedResults] = useState<Record<string, SearchResultItem[]> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResolvedResults(null);
      setShowRecent(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const results = searchAll(
        query, projects, agreements, activity, invoices, uploads, approvals, teamActivity, deadlines,
        { category: activeCategory },
      );
      const grouped: Record<string, SearchResultItem[]> = {};
      for (const cat of categoryOrder) {
        const catItems = results.filter((r) => r.category === cat);
        if (catItems.length) grouped[cat] = catItems;
      }
      setResolvedResults(grouped);
      setShowRecent(false);
      setIsLoading(false);
      setSelectedIdx(null);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, activeCategory, projects, agreements, activity, invoices, uploads, approvals, teamActivity]);

  const flatResults = useMemo(() => {
    if (!resolvedResults) return [];
    return Object.values(resolvedResults).flat();
  }, [resolvedResults]);

  const totalResults = flatResults.length;

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      addRecentSearch(item.title);
      onClose();
      onNavigate(item.tab);
      onTriggerAction(`Navigating to ${item.title}`);
    },
    [onClose, onNavigate, onTriggerAction],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (query) {
          setQuery('');
          return;
        }
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => {
          if (prev === null || prev >= totalResults - 1) return 0;
          return prev + 1;
        });
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => {
          if (prev === null || prev <= 0) return totalResults - 1;
          return prev - 1;
        });
      }

      if (e.key === 'Enter' && selectedIdx !== null && flatResults[selectedIdx]) {
        handleSelect(flatResults[selectedIdx]);
      }
    },
    [query, totalResults, flatResults, selectedIdx, handleSelect, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveCategory(null);
      setSelectedIdx(null);
      setShowRecent(true);
      setIsLoading(false);
      setResolvedResults(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedIdx !== null && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll<'button'>('[data-result-item]');
      if (items[selectedIdx]) {
        items[selectedIdx].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIdx]);

  const handleRecentSearchSelect = (q: string) => {
    setQuery(q);
    setShowRecent(false);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-[60] flex items-center sm:items-start justify-center sm:pt-[12vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className="relative w-full sm:w-[580px] lg:w-[640px] h-full sm:h-auto max-h-full sm:max-h-[60vh] bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-700/80 rounded-none sm:rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, files, messages..."
            className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-transparent outline-none"
            aria-label="Search input"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shrink-0">
            Esc
          </kbd>
        </div>

        {/* Filters */}
        <SearchFiltersRow
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          allCategories={allCategories}
        />

        {/* Results / Content */}
        <div ref={resultsRef} className="flex-1 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <SearchSkeleton />
          ) : resolvedResults && totalResults > 0 ? (
            Object.entries(resolvedResults).map(([category, items]) => {
              const itemsArr = items as SearchResultItem[];
              const startIdx = flatResults.indexOf(itemsArr[0]);
              return (
                <div key={category}>
                  <CategoryGroup
                    category={category}
                    items={itemsArr}
                    selectedIndex={startIdx <= selectedIdx! && selectedIdx! < startIdx + itemsArr.length ? (selectedIdx! - startIdx) : null}
                    onSelect={handleSelect}
                  />
                </div>
              );
            })
          ) : resolvedResults && totalResults === 0 ? (
            <NoResults query={query} />
          ) : showRecent && !query ? (
            <div>
              <RecentSearches onSelect={handleRecentSearchSelect} />
              <PopularSuggestions projects={projects} onNavigate={(tab) => { onClose(); onNavigate(tab); }} />
              {/* Quick access shortcuts */}
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick access</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { icon: FolderKanban, label: 'All Projects', tab: 'dashboard', desc: 'Browse all active projects' },
                    { icon: FileText, label: 'Deliverables', tab: 'deliverables', desc: 'View files and assets' },
                    { icon: FileSignature, label: 'Agreements', tab: 'agreements', desc: 'MSAs, NDAs, SOWs' },
                    { icon: Bell, label: 'Activity Log', tab: 'dashboard', desc: 'Recent team activity' },
                  ].map((shortcut) => (
                    <button
                      key={shortcut.tab}
                      onClick={() => { onClose(); onNavigate(shortcut.tab); }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20 transition-colors">
                        <shortcut.icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{shortcut.label}</p>
                        <p className="text-[9px] text-slate-400">{shortcut.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Tips */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
            <ArrowRight className="w-2.5 h-2.5" />
            <span>Navigate</span>
            <kbd className="px-1 py-0.5 text-[8px] font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">↑↓</kbd>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
            <kbd className="px-1 py-0.5 text-[8px] font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">⏎</kbd>
            <span>Open</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
            <kbd className="px-1 py-0.5 text-[8px] font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">Esc</kbd>
            <span>Close</span>
          </div>
          <div className="flex-1 text-right">
            <span className="text-[9px] text-slate-300 dark:text-slate-600">
              {totalResults > 0 && `${totalResults} result${totalResults === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
