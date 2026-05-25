import { useState } from 'react';
import { Check, Pipette } from 'lucide-react';
import { ACCENT_COLOR_PRESETS, generateBrandingColors } from '../../types/branding';

interface AccentColorPickerProps {
  currentColor: string;
  onChange: (hex: string) => void;
}

export default function AccentColorPicker({ currentColor, onChange }: AccentColorPickerProps) {
  const [customHex, setCustomHex] = useState(currentColor);
  const [showCustom, setShowCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresetSelect = (hex: string) => {
    setCustomHex(hex);
    setError(null);
    onChange(hex);
  };

  const handleCustomSubmit = () => {
    const hex = customHex.startsWith('#') ? customHex : `#${customHex}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setError(null);
      onChange(hex);
    } else {
      setError('Invalid hex color. Use format #RRGGBB.');
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Accent Color
        </label>
        <p className="text-[10px] text-slate-400 mt-0.5">Choose a color for buttons, links, and active elements</p>
      </div>

      {/* Current color preview */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div
          className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-600 shadow-sm shrink-0"
          style={{ backgroundColor: currentColor }}
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{currentColor}</span>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] text-slate-400">Hover: {generateBrandingColors(currentColor).accentHover}</span>
          </div>
        </div>
      </div>

      {/* Preset colors */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Presets</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {ACCENT_COLOR_PRESETS.map((preset) => {
            const isActive = currentColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => handlePresetSelect(preset.hex)}
                className={`relative w-full aspect-square rounded-xl border-2 transition-all active:scale-95 touch-manipulation ${
                  isActive ? 'border-slate-900 dark:border-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: preset.hex }}
                aria-label={`Set color to ${preset.name} (${preset.hex})`}
                aria-pressed={isActive}
              >
                {isActive && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check className={`w-3.5 h-3.5 ${preset.hex === '#F59E0B' ? 'text-slate-900' : 'text-white'}`} />
                  </span>
                )}
                <span className="sr-only">{preset.name}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
          {ACCENT_COLOR_PRESETS.map((preset) => (
            <span key={preset.name} className="text-[9px] text-slate-400 font-medium">{preset.name}</span>
          ))}
        </div>
      </div>

      {/* Custom color */}
      <div>
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Pipette className="w-3.5 h-3.5" />
          {showCustom ? 'Hide custom input' : 'Custom color'}
        </button>

        {showCustom && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSubmit(); }}
              placeholder="#3B82F6"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Custom hex color"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-medium text-red-500">{error}</p>
      )}

      {/* Preview buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Preview</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors"
            style={{ backgroundColor: currentColor }}
          >
            Primary Button
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-xs font-bold border-2 transition-colors"
            style={{ borderColor: currentColor, color: currentColor }}
          >
            Outline Button
          </button>
          <span
            className="px-3 py-1.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: generateBrandingColors(currentColor).accentLight, color: currentColor }}
          >
            Badge
          </span>
        </div>
      </div>
    </div>
  );
}
