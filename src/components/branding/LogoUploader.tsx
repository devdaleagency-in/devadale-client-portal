import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle, Image, FileWarning } from 'lucide-react';

interface LogoUploaderProps {
  label: string;
  description: string;
  currentUrl?: string;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
  accept?: string;
  darkMode?: boolean;
}

export default function LogoUploader({
  label,
  description,
  currentUrl,
  onUpload,
  onRemove,
  accept = 'image/png,image/svg+xml,image/jpeg,image/webp',
  darkMode,
}: LogoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndProcess = (file: File) => {
    setError(null);

    const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported format. Use PNG, SVG, JPG, or WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum 5MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setIsUploading(false);
      onUpload(dataUrl);
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcess(file);
    e.target.value = '';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndProcess(file);
  };

  const displayUrl = preview || currentUrl;
  const hasLogo = !!displayUrl;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {label}
      </label>
      <p className="text-[10px] text-slate-400 -mt-1">{description}</p>

      {hasLogo ? (
        <div className={`relative rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-4 p-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
              <img
                src={displayUrl}
                alt={`${label} preview`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Logo uploaded</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Click replace to upload a new version</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => { setPreview(null); onRemove(); }}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                aria-label="Remove logo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900/50'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          aria-label={`Upload ${label}`}
        >
          {isUploading ? (
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-colors ${
                isDragging ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                {isDragging ? (
                  <Image className="w-5 h-5 text-blue-600" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, SVG, JPG, or WEBP (max 5MB)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-[11px] font-medium text-red-600 dark:text-red-400">{error}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />
    </div>
  );
}
