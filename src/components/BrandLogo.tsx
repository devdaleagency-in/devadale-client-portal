import { useBrandingStore } from '../store/brandingStore';
import devdaleLogo from '../public/devdale_logo.png';

interface BrandLogoProps {
  compact?: boolean;
  dark?: boolean;
}

export default function BrandLogo({ compact = false, dark = false }: BrandLogoProps) {
  const config = useBrandingStore((s) => s.config);
  const isWhiteLabel = config.whiteLabelEnabled;

  const displayName = isWhiteLabel && config.workspaceName ? config.workspaceName : 'DevDale Agency';
  const displayLogo = isWhiteLabel && config.logo.url ? config.logo.url : devdaleLogo;
  const subtitle = isWhiteLabel ? 'Client Portal' : 'Client Workspace';

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <img
        src={displayLogo}
        alt={`${displayName} logo`}
        className={`${compact ? 'w-7 h-7' : 'w-9 h-9'} rounded-lg object-contain bg-white shadow-sm ring-1 ring-slate-200/70`}
      />
      <div className="min-w-0">
        <p className={`${compact ? 'text-xs' : 'text-xl'} font-semibold tracking-tight leading-tight truncate ${dark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          {displayName}
        </p>
        {!compact && (
          <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
