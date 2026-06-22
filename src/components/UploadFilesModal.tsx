import { useState, useRef, useCallback, type FormEvent, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

interface UploadFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (files: any[]) => void;
}

export default function UploadFilesModal({ isOpen, onClose, onUploadComplete }: UploadFilesModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
    setError(null);
    setResult(null);
  }, []);

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleSelect = () => inputRef.current?.click();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      setError(null);
      setResult(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('tag', 'uploaded');
      const uploaded = await api.uploadFiles(formData);
      setResult(uploaded);
      onUploadComplete?.(uploaded);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Upload className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Upload Files</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {result ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {result.length} file{result.length > 1 ? 's' : ''} uploaded successfully
                </span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {result.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <File className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{f.size}</span>
                  </div>
                ))}
              </div>
              <button onClick={onClose} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors">
                Done
              </button>
            </div>
          ) : (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleSelect}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {dragOver ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">or click to browse (up to 50 MB each)</p>
                <input ref={inputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
              </div>

              {files.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                      <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="flex-1 truncate text-slate-700 dark:text-slate-300">{f.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button onClick={() => removeFile(i)} className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-800/40">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-xs font-semibold text-rose-600">{error}</span>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-3.5 h-3.5" /> Upload {files.length > 0 ? `(${files.length} files)` : ''}</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
