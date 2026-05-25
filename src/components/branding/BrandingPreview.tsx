import { Monitor, Tablet, Smartphone, Sun, Moon } from 'lucide-react';
import type { BrandingConfig } from '../../types/branding';

interface BrandingPreviewProps {
  config: BrandingConfig;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type ThemeMode = 'light' | 'dark';

export default function BrandingPreview({ config }: BrandingPreviewProps) {
  const { colors, logo, workspaceName } = config;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Live Preview
        </label>
        <p className="text-[10px] text-slate-400 mt-0.5">See your branding changes in real time</p>
      </div>

      {/* Preview frame */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
        {/* Preview navbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800" style={{ backgroundColor: colors.accentLight }}>
          <div className="flex items-center gap-2">
            {logo.url ? (
              <img src={logo.url} alt="Logo" className="h-6 w-auto max-w-[100px] object-contain" />
            ) : (
              <span className="text-xs font-bold" style={{ color: colors.accent }}>{workspaceName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.accent }} />
            <span className="text-[10px] font-medium text-slate-500">Online</span>
          </div>
        </div>

        {/* Preview body */}
        <div className="p-4 space-y-3">
          {/* Active nav item */}
          <div className="flex gap-1">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold" style={{ backgroundColor: colors.accentLight, color: colors.accent }}>
              Dashboard
            </span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold text-slate-400">Projects</span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold text-slate-400">Settings</span>
          </div>

          {/* Card with accent border */}
          <div className="rounded-xl border p-3" style={{ borderColor: colors.accentLight }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.accentLight }}>
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: colors.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-2.5 rounded w-1/2 mb-1.5" style={{ backgroundColor: colors.accentLight }} />
                <div className="h-2 rounded w-3/4" style={{ backgroundColor: colors.accentLight }} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors"
              style={{ backgroundColor: colors.accent }}
            >
              Primary
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-xs font-bold border-2 transition-colors"
              style={{ borderColor: colors.accent, color: colors.accent }}
            >
              Secondary
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.accentLight }}>
            <div className="h-full w-3/5 rounded-full" style={{ backgroundColor: colors.accent }} />
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: colors.accentLight, color: colors.accent }}>
              Active
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
