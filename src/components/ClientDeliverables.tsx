import { useState, useRef, type ChangeEvent } from 'react';
import {
  Download,
  Eye,
  FileText,
  Image,
  Video,
  FileArchive,
  Search,
  Tag,
  FolderOpen,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Star,
  CheckCircle,
  GitCompare,
  Globe,
  UploadCloud,
  ExternalLink,
  Layers,
  Palette,
} from 'lucide-react';
import EmptyState from './ui/EmptyState';
import ProgressMeter from './ProgressMeter';

interface ClientDeliverablesProps {
  onTriggerAction: (msg: string) => void;
}

const deliverables = [
  { name: 'Brand Guidelines.pdf', type: 'PDF', size: '2.4 MB', tag: 'brand', icon: Palette, progress: 100, version: 'v3', status: 'approved' as const, date: 'Updated yesterday' },
  { name: 'Desktop Wireframes', type: 'Link', size: 'Figma Prototype', tag: 'review', icon: ExternalLink, progress: 82, version: 'v4', status: 'review' as const, date: 'Updated today' },
  { name: 'Assets_Package.zip', type: 'ZIP', size: '45 MB', tag: 'handoff', icon: Layers, progress: 100, version: 'v2', status: 'approved' as const, date: '3 days ago' },
  { name: 'Homepage_Demo.mp4', type: 'Video', size: '48 MB', tag: 'review', icon: Video, progress: 82, version: 'v4', status: 'review' as const, date: 'Updated today' },
];

const roadmapMilestones = [
  { id: 'm1', label: 'Discovery & Research', date: 'Sept 15', status: 'completed' as const },
  { id: 'm2', label: 'Concept Development', date: 'Oct 02', status: 'completed' as const },
  { id: 'm3', label: 'UI/UX Design', date: 'In Progress', status: 'active' as const },
  { id: 'm4', label: 'Prototype', date: 'Oct 27', status: 'planned' as const },
  { id: 'm5', label: 'Development', date: 'Nov 05', status: 'planned' as const },
  { id: 'm6', label: 'Testing & QA', date: 'Nov 12', status: 'planned' as const },
];

export default function ClientDeliverables({ onTriggerAction }: ClientDeliverablesProps) {
  const [fileSearch, setFileSearch] = useState('');
  const [selectedFileTag, setSelectedFileTag] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<typeof deliverables[0] | null>(null);
  const [isWorkApproved, setIsWorkApproved] = useState(false);
  const [isRevisionRequested, setIsRevisionRequested] = useState(false);
  const [isTestimonialSubmitted, setIsTestimonialSubmitted] = useState(false);
  const [testimonialText, setTestimonialText] = useState('The portal gave us exactly the transparency and polish we wanted.');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFigmaPreview, setShowFigmaPreview] = useState(false);

  const fileQuery = fileSearch.trim().toLowerCase();
  const filteredFiles = deliverables.filter((f) => {
    if (fileQuery && !f.name.toLowerCase().includes(fileQuery) && !f.type.toLowerCase().includes(fileQuery) && !f.tag.toLowerCase().includes(fileQuery)) {
      return false;
    }
    if (selectedFileTag && f.tag !== selectedFileTag.toLowerCase()) {
      return false;
    }
    return true;
  });

  const handleDownload = (file: typeof deliverables[0]) => {
    const blob = new Blob([`Simulated download: ${file.name}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.[^.]+$/, '.txt');
    a.click();
    URL.revokeObjectURL(url);
    onTriggerAction(`${file.name} download started.`);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      onTriggerAction(`Uploading ${selected.length} file(s) for review...`);
    }
    e.target.value = '';
  };

  const handleApproveWork = () => {
    setIsWorkApproved(true);
    setIsRevisionRequested(false);
    onTriggerAction('Deliverable approved. Thank you for your feedback!');
  };

  const handleRequestRevision = () => {
    setIsRevisionRequested(true);
    setIsWorkApproved(false);
    onTriggerAction('Revision request submitted. The team will review your feedback.');
  };

  const Section = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-8 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-wide uppercase">{title}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 px-2 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Deliverables</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review, approve, and provide feedback on project deliverables.</p>
      </div>

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {deliverables.map((file) => {
          const Icon = file.icon;
          return (
            <div
              key={file.name}
              onClick={() => {
                if (file.type === 'Link') {
                  setShowFigmaPreview(true);
                } else {
                  setPreviewFile(file);
                }
              }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700/50 hover:-translate-y-0.5 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{file.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{file.size} • {file.date}</p>
                </div>
              </div>
              {file.type === 'Link' ? <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" /> : <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />}
            </div>
          );
        })}
      </div>

      {/* File Browser */}
      <Section icon={FolderOpen} title="All Files" />

      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-900/10 p-4 sm:p-6 text-center cursor-pointer hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-4">Upload Files</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Share reference files, feedback assets, or approved materials.</p>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
            <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black">Browse Files</button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input type="search" onChange={(e) => setFileSearch(e.target.value)} className="bg-transparent outline-none text-xs flex-1 text-slate-700 dark:text-slate-200 min-w-0" placeholder="Search files..." />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Brand assets', 'Design review', 'Videos', 'Contracts', 'Approved'].map(tag => {
                const isActive = selectedFileTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedFileTag(isActive ? null : tag)}
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

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Project Files</h3>
            <span className="text-[10px] font-bold text-slate-400">{filteredFiles.length} files</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredFiles.length === 0 ? (
              <div className="p-8">
                <EmptyState icon={FolderOpen} title="No files" description={fileQuery ? `No results for "${fileQuery}"` : 'Files shared by your agency team will appear here.'} />
              </div>
            ) : (
              filteredFiles.map((file) => {
                const Icon = file.icon;
                return (
                  <div key={file.name} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{file.name}</h4>
                        <span className="text-[9px] uppercase font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{file.tag}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{file.type} • {file.size} • {file.version}</p>
                      <ProgressMeter value={file.progress} label={`${file.name} progress`} variant="emerald" className="mt-2 progress-meter--tall" />
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

      {/* Review Section */}
      <Section icon={MessageSquare} title="Review & Feedback" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Version Comparison */}
        <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Version Comparison</h3>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-full">v4 ready for review</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Current — v3</p>
              <div className="h-36 mt-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 space-y-2">
                <div className="h-5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-20 rounded bg-blue-100 dark:bg-blue-900/30" />
                  <div className="h-20 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 p-4">
              <p className="text-[10px] uppercase tracking-wider text-blue-500 font-bold">Proposed — v4</p>
              <div className="h-36 mt-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 p-3 space-y-2">
                <div className="h-5 rounded bg-blue-500" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-20 rounded bg-blue-200 dark:bg-blue-800/50" />
                  <div className="h-20 rounded bg-emerald-100 dark:bg-emerald-900/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Client Review Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {!isWorkApproved && !isRevisionRequested && (
              <>
                <button onClick={handleApproveWork} className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-all">
                  <ThumbsUp className="w-4 h-4" /> Approve Work
                </button>
                <button onClick={handleRequestRevision} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  <ThumbsDown className="w-4 h-4" /> Request Changes
                </button>
              </>
            )}
            {isWorkApproved && (
              <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-black flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Approved ✓
              </div>
            )}
            {isRevisionRequested && (
              <div className="px-4 py-2 rounded-xl bg-amber-100 text-amber-700 text-xs font-black flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Changes Requested
              </div>
            )}
            <button onClick={() => onTriggerAction('Side-by-side comparison mode active.')} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <GitCompare className="w-4 h-4" /> Compare
            </button>
            <button onClick={() => onTriggerAction('Staging link opened in new tab.')} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Globe className="w-4 h-4" /> Live Preview
            </button>
          </div>
        </div>

        {/* Completion Feedback */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Completion Feedback</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rate your experience and leave a testimonial.</p>
          {isTestimonialSubmitted ? (
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Thank you! Your testimonial has been submitted.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <textarea
                className="mt-4 w-full h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-xs outline-none text-slate-700 dark:text-slate-200 resize-none"
                value={testimonialText}
                onChange={(e) => setTestimonialText(e.target.value)}
                placeholder="Share your experience..."
              />
              <button
                onClick={() => { setIsTestimonialSubmitted(true); onTriggerAction('Testimonial submitted successfully.'); }}
                className="mt-3 w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors"
              >
                Submit Testimonial
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress & Timeline */}
      <Section icon={Layers} title="Progress & Timeline" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-4">Milestone Progress</h3>
          <div className="space-y-3">
            {roadmapMilestones.map((m) => {
              const statusColor = m.status === 'completed' ? 'border-emerald-500 bg-emerald-500' : m.status === 'active' ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-600';
              const textColor = m.status === 'completed' ? 'text-emerald-600' : m.status === 'active' ? 'text-blue-600' : 'text-slate-400';
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full border-2 ${statusColor} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{m.label}</p>
                    <p className={`text-[10px] font-semibold ${textColor}`}>{m.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-4">Recent Deliverables</h3>
          <div className="space-y-3">
            {deliverables.slice(0, 3).map((file) => (
              <div key={file.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{file.size}</p>
                  </div>
                </div>
                <button onClick={() => handleDownload(file)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Figma Preview Modal */}
      {showFigmaPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Figma Prototype
              </span>
              <button onClick={() => setShowFigmaPreview(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">×</button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">F</div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Desktop Wireframes Mockup</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Interactive prototype for review and feedback.</p>
              </div>
              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2.5">
                <div className="h-6 bg-slate-100 dark:bg-slate-800/80 rounded" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded" />
                  <div className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded" />
                  <div className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded" />
                </div>
              </div>
              <button onClick={() => { setShowFigmaPreview(false); onTriggerAction('Opened external figma prototype.'); }} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow">
                Launch Live Prototype
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
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
                <p className="text-xs text-slate-500 dark:text-slate-400">{previewFile.type} • {previewFile.size}</p>
              </div>
              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs font-mono">
                  Preview simulation for {previewFile.name}
                </div>
              </div>
              <button onClick={() => { handleDownload(previewFile); setPreviewFile(null); }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
