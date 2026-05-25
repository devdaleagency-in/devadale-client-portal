import { useState, useRef, type ChangeEvent } from 'react';
import {
  UploadCloud,
  Search,
  Tag,
  Eye,
  Download,
  Image,
  Video,
  FileText,
  FileArchive,
  FolderOpen,
  Send,
  Archive,
  Lock,
  RotateCcw,
  FileUp,
  CheckCircle2,
  Clock,
  Activity,
  AlertCircle,
  MessageSquare,
  Bell,
  Globe,
  GitCompare,
} from 'lucide-react';
import EmptyState from './ui/EmptyState';
import ProgressMeter from './ProgressMeter';

interface AdminDeliverablesProps {
  onTriggerAction: (msg: string) => void;
}

const initialFiles = [
  { name: 'Logo_Primary.svg', type: 'Logo', size: '2.4 MB', tag: 'brand', icon: Image, progress: 100, version: 'v3', status: 'approved' as const },
  { name: 'Homepage_Demo.mp4', type: 'Video', size: '48 MB', tag: 'review', icon: Video, progress: 82, version: 'v4', status: 'review' as const },
  { name: 'Requirements_v3.pdf', type: 'PDF', size: '1.8 MB', tag: 'scope', icon: FileText, progress: 100, version: 'v3', status: 'approved' as const },
  { name: 'Brand_Assets.zip', type: 'ZIP', size: '96 MB', tag: 'handoff', icon: FileArchive, progress: 100, version: 'v2', status: 'archived' as const },
];

const versionHistory = [
  { version: 'v4', date: 'Today, 2:30 PM', status: 'In Review', author: 'Sarah Chen', changes: 'Homepage hero animation updated' },
  { version: 'v3', date: 'Yesterday, 4:15 PM', status: 'Approved', author: 'Admin User', changes: 'Final branding applied' },
  { version: 'v2', date: '3 days ago', status: 'Archived', author: 'Sarah Chen', changes: 'Color palette revision' },
  { version: 'v1', date: '1 week ago', status: 'Archived', author: 'Sarah Chen', changes: 'Initial upload' },
];

export default function AdminDeliverables({ onTriggerAction }: AdminDeliverablesProps) {
  const [fileSearch, setFileSearch] = useState('');
  const [selectedFileTag, setSelectedFileTag] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<typeof initialFiles[0] | null>(null);
  const [selectedVersion, setSelectedVersion] = useState('v4');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [publishState, setPublishState] = useState<'idle' | 'published' | 'review'>('review');

  const fileQuery = fileSearch.trim().toLowerCase();
  const filteredFiles = initialFiles.filter((f) => {
    if (fileQuery && !f.name.toLowerCase().includes(fileQuery) && !f.type.toLowerCase().includes(fileQuery) && !f.tag.toLowerCase().includes(fileQuery)) {
      return false;
    }
    if (selectedFileTag && f.tag !== selectedFileTag.toLowerCase()) {
      return false;
    }
    return true;
  });

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      onTriggerAction(`Uploading ${selected.length} file(s) as new version...`);
    }
    e.target.value = '';
  };

  const handleDownload = (file: typeof initialFiles[0]) => {
    const blob = new Blob([`Simulated download: ${file.name}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.[^.]+$/, '.txt');
    a.click();
    URL.revokeObjectURL(url);
    onTriggerAction(`${file.name} downloaded.`);
  };

  const currentVersion = versionHistory.find(v => v.version === selectedVersion) || versionHistory[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 px-2 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Deliverables Manager</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload, version, publish, and track delivery lifecycle.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <FileUp className="w-4 h-4" />
            Upload New Version
          </button>
          {publishState === 'review' && (
            <button
              onClick={() => { setPublishState('published'); onTriggerAction('Deliverable published and client notified.'); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
              Publish Deliverable
            </button>
          )}
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'In Review', value: '2', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Approved', value: '5', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Pending Client', value: '1', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Archived', value: '3', icon: Archive, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-950/20' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">{stat.label}</p>
              <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Upload + File Library */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
        {/* Upload Zone */}
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-900/10 p-4 sm:p-6 text-center cursor-pointer hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-4">Upload Deliverable</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Files are uploaded as a new version. Previous versions are preserved.</p>
            <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black">Browse Files</button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="search"
                onChange={(e) => setFileSearch(e.target.value)}
                className="bg-transparent outline-none text-xs flex-1 text-slate-700 dark:text-slate-200 min-w-0"
                placeholder="Search files by name, type, tag..."
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Brand', 'Review', 'Scope', 'Handoff'].map(tag => {
                const isActive = selectedFileTag === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedFileTag(isActive ? null : tag.toLowerCase())}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all ${
                      isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Tag className="w-3 h-3" /> {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* File Library */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Delivery Library</h3>
            <span className="text-[10px] font-bold text-slate-400">Version tracking active</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredFiles.length === 0 ? (
              <div className="p-8">
                <EmptyState icon={FolderOpen} title="No files" description={fileQuery ? `No results for "${fileQuery}"` : 'Uploaded deliverables will appear here.'} />
              </div>
            ) : (
              filteredFiles.map((file) => {
                const Icon = file.icon;
                const statusColor = file.status === 'approved' ? 'text-emerald-600 bg-emerald-50' : file.status === 'review' ? 'text-amber-600 bg-amber-50' : 'text-slate-500 bg-slate-100';
                return (
                  <div key={file.name} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{file.name}</h4>
                        <span className="text-[9px] uppercase font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{file.tag}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusColor}`}>{file.version}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{file.type} • {file.size} • {file.status}</p>
                      <ProgressMeter value={file.progress} label={`Upload progress for ${file.name}`} variant="emerald" className="mt-2 progress-meter--tall" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setPreviewFile(file)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </button>
                      <button type="button" onClick={() => handleDownload(file)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Download className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Version Timeline + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Version Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Version Timeline</h3>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              {versionHistory.map(v => (
                <button
                  key={v.version}
                  onClick={() => setSelectedVersion(v.version)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                    selectedVersion === v.version ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {v.version}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {versionHistory.map((v, i) => (
              <div key={v.version} className={`flex gap-4 p-3 rounded-xl transition-colors ${selectedVersion === v.version ? 'bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-950/30'}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${v.status === 'Approved' ? 'border-emerald-500 bg-emerald-500' : v.status === 'In Review' ? 'border-amber-500 bg-amber-500' : 'border-slate-400 bg-slate-400'}`} />
                  {i < versionHistory.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{v.version} — {v.changes}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      v.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : v.status === 'In Review' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
                    }`}>{v.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{v.author} • {v.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Actions */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-3">Actions</h3>
            <div className="space-y-2">
              <button onClick={() => { onTriggerAction('Marked as ready for client review.'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors">
                <CheckCircle2 className="w-4 h-4" /> Mark Ready For Review
              </button>
              <button onClick={() => { onTriggerAction('Client notified with download link.'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Bell className="w-4 h-4" /> Notify Client
              </button>
              <button onClick={() => { onTriggerAction('Version locked. No further changes allowed.'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Lock className="w-4 h-4" /> Lock Approved Version
              </button>
              <button onClick={() => { onTriggerAction('Rolled back to previous version.'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <RotateCcw className="w-4 h-4" /> Rollback Version
              </button>
              <button onClick={() => { onTriggerAction('Version archived.'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Archive className="w-4 h-4" /> Archive Version
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-3">Internal Notes</h3>
            <textarea
              className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-xs outline-none text-slate-700 dark:text-slate-200 resize-none"
              placeholder="Add internal notes about this deliverable..."
            />
            <button onClick={() => onTriggerAction('Internal note saved.')} className="mt-2 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors">
              Save Note
            </button>
          </div>

          {/* Review Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-3">Client Review Status</h3>
            <div className="space-y-2">
              {[
                { label: 'Awaiting Review', value: '1', color: 'text-amber-600' },
                { label: 'Changes Requested', value: '0', color: 'text-rose-600' },
                { label: 'Approved by Client', value: '2', color: 'text-emerald-600' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-1">
                  <span className="text-[11px] text-slate-500">{item.label}</span>
                  <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Delivery Activity Log</h3>
        </div>
        <div className="space-y-2">
          {[
            { action: 'Version v4 uploaded by Sarah Chen', time: '2:30 PM today' },
            { action: 'Client Alex requested changes on Homepage Demo', time: '1:15 PM today' },
            { action: 'Version v3 approved and locked', time: 'Yesterday, 4:20 PM' },
            { action: 'Client notified about v3', time: 'Yesterday, 4:25 PM' },
            { action: 'Version v2 archived', time: '3 days ago' },
          ].map((entry, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{entry.action}</p>
                <p className="text-[10px] text-slate-400">{entry.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                {previewFile.name}
              </span>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">×</button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{previewFile.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{previewFile.type} • {previewFile.size} • {previewFile.version}</p>
              </div>
              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs font-mono">
                  Preview simulation for {previewFile.name}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { handleDownload(previewFile); setPreviewFile(null); }} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download
                </button>
                <button onClick={() => { onTriggerAction(`Sent ${previewFile.name} for review.`); setPreviewFile(null); }} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send for Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
