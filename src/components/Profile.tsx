import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, Mail, Shield, BadgeCheck, Trash2, Loader2 } from 'lucide-react';
import type { User } from '../types';
import { initialsDataUri } from '../utils/avatar';

interface ProfileProps {
  currentUser: User | null;
  onUpdateAvatar?: (file: File) => void;
  onRemoveAvatar?: () => void;
}

export default function Profile({ currentUser, onUpdateAvatar, onRemoveAvatar }: ProfileProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const src = previewUrl || currentUser?.avatarUrl || initialsDataUri(currentUser?.name || 'User');

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateAvatar) return;

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      await onUpdateAvatar(file);
    } finally {
      setUploading(false);
      setPreviewUrl(null);
      e.target.value = '';
    }
  };

  const handleRemove = async () => {
    if (!onRemoveAvatar) return;
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      setRemoving(true);
      try {
        await onRemoveAvatar();
      } finally {
        setRemoving(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300 px-2">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <div className="relative">
              <img
                alt="Profile photo"
                className="w-24 h-24 rounded-full border-2 border-blue-100 dark:border-slate-700 object-cover ring-4 ring-blue-50 dark:ring-blue-900/20"
                src={src}
                onError={(e) => { (e.target as HTMLImageElement).src = initialsDataUri(currentUser?.name || 'User'); }}
              />
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            {onUpdateAvatar && (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading}
                title="Upload profile photo"
                aria-label="Upload profile photo"
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentUser?.name || 'User'}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm text-slate-500 dark:text-slate-400">{currentUser?.email || ''}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">{currentUser?.title || ''}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {currentUser?.role === 'admin' ? 'Agency Team' : 'Client Partner'}
              </span>
            </div>
          </div>
        </div>

        <input
          ref={avatarInputRef}
          id="profile-avatar"
          name="avatarFile"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {currentUser?.avatarUrl && onRemoveAvatar && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleRemove}
                disabled={uploading || removing}
                className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Remove Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
