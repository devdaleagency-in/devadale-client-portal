import { FileText, Image, FileArchive, File, Download, ExternalLink, Search, Figma, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { UploadedFile } from '../../types';

interface RecentUploadsProps {
  uploads: UploadedFile[];
  loading?: boolean;
  onDownload?: (file: UploadedFile) => void;
  onPreview?: (file: UploadedFile) => void;
}

const fileIcons: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  pdf: { icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20' },
  image: { icon: Image, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  zip: { icon: FileArchive, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  doc: { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
  figma: { icon: Figma, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  other: { icon: File, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
};

function SkeletonRows() {
  return (
    <div className="space-y-1.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RecentUploads({ uploads, loading, onDownload, onPreview }: RecentUploadsProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? uploads.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : uploads;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Recent Uploads
          </h3>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input
            id="uploads-search"
            name="uploadsSearch"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-28 lg:w-36 pl-6 pr-2 py-1 text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonRows />
      ) : uploads.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No files yet</p>
          <p className="text-[10px] text-slate-400 mt-1">Upload your first file to get started.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((file) => {
            const fc = fileIcons[file.type] || fileIcons.other;
            const Icon = fc.icon;

            return (
              <div
                key={file.id}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
              >
                <div className={`w-8 h-8 rounded-lg ${fc.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${fc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 transition-colors">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-400">{file.size}</span>
                    <span className="text-[9px] text-slate-300">•</span>
                    <span className="text-[9px] text-slate-400">{file.uploadedBy}</span>
                    <span className="text-[9px] text-slate-300">•</span>
                    <span className="text-[9px] text-slate-400">{file.uploadedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onPreview && (
                    <button
                      onClick={() => onPreview(file)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all"
                      title="Preview"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  {onDownload && (
                    <button
                      onClick={() => onDownload(file)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs">No files found.</div>
          )}
        </div>
      )}
    </div>
  );
}
