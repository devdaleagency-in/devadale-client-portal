import { useEffect, useState } from 'react';
import { Save, RotateCcw, AlertTriangle, Palette, Globe, Mail, Image, Eye, CheckCircle2, Settings as SettingsIcon, MessageSquare, Power, Shield, Loader2, XCircle } from 'lucide-react';
import { useBrandingStore } from '../../store/brandingStore';
import LogoUploader from './LogoUploader';
import AccentColorPicker from './AccentColorPicker';
import DomainSettingsCard from './DomainSettingsCard';
import EmailBrandingCard from './EmailBrandingCard';
import BrandingPreview from './BrandingPreview';

type BrandingTab = 'general' | 'logos' | 'colors' | 'domain' | 'email' | 'preview';

const tabs: { id: BrandingTab; label: string; icon: typeof Palette }[] = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'logos', label: 'Logos', icon: Image },
  { id: 'colors', label: 'Colors', icon: Palette },
  { id: 'domain', label: 'Domain', icon: Globe },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'preview', label: 'Preview', icon: Eye },
];

export default function BrandingSettingsPage() {
  const {
    config,
    hasUnsavedChanges,
    clientPortalLoading,
    whiteLabelLoading,
    clientPortalError,
    whiteLabelError,
    settingsLoading,
    settingsError,
    setWorkspaceName,
    setWelcomeMessage,
    setClientPortalEnabled,
    setWhiteLabelEnabled,
    setLogo,
    setAccentColor,
    setDomain,
    setEmail,
    save,
    resetToDefault,
    load,
    loadFromServer,
    saveClientPortalToServer,
    saveWhiteLabelToServer,
  } = useBrandingStore();

  const [activeTab, setActiveTab] = useState<BrandingTab>('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toggleToast, setToggleToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    load('default');
    loadFromServer();
  }, [load, loadFromServer]);

  // Apply CSS variables when colors change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-accent', config.colors.accent);
    root.style.setProperty('--brand-accent-hover', config.colors.accentHover);
    root.style.setProperty('--brand-accent-light', config.colors.accentLight);
    root.style.setProperty('--brand-accent-dark', config.colors.accentDark);
    if (config.logo.url) {
      root.style.setProperty('--brand-logo-url', `url(${config.logo.url})`);
    }
  }, [config.colors, config.logo.url]);

  const handleSave = () => {
    save();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetToDefault();
    setShowResetConfirm(false);
  };

  // Beforeunload warning for unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Toggle Toast */}
      {toggleToast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300 max-w-sm w-full px-4`}>
          <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-2xl ${
            toggleToast.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-red-600 text-white border-red-500'
          }`}>
            {toggleToast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
            <span className="font-bold text-xs flex-1">{toggleToast.msg}</span>
            <button type="button" onClick={() => setToggleToast(null)} className="text-white hover:opacity-80 font-bold p-1 leading-none text-sm">×</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Portal Configuration &amp; Branding</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure the client-facing portal experience — agency identity, domain, logos, colors, and email branding
          </p>
        </div>
        <div className="flex items-center gap-2">
          {settingsLoading && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 animate-in fade-in">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading...
            </span>
          )}
          {settingsError && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
              <XCircle className="w-3.5 h-3.5" />
              {settingsError}
            </span>
          )}
          {saved && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Unsaved
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-semibold transition-colors disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Agency Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Agency Name
              </label>
              <p className="text-[10px] text-slate-400 mb-2">Displayed throughout the client portal and email communications</p>
              <input
                type="text"
                value={config.workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full max-w-md px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20"
                placeholder="My Agency"
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700" />

            {/* Welcome Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Client Welcome Message
              </label>
              <p className="text-[10px] text-slate-400 mb-2">Shown on the client dashboard when they log in</p>
              <textarea
                value={config.welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={3}
                className="w-full max-w-lg px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 resize-none"
                placeholder="Welcome to your dedicated client portal..."
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700" />

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between max-w-lg">
                <div className="flex items-start gap-3">
                  <Power className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Client Portal Enabled</span>
                    <p className="text-[10px] text-slate-400">Allow clients to access their dedicated workspace portal.</p>
                    {clientPortalError && (
                      <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {clientPortalError}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.clientPortalEnabled}
                  disabled={clientPortalLoading}
                  onClick={async () => {
                    const newVal = !config.clientPortalEnabled;
                    setClientPortalEnabled(newVal);
                    const ok = await saveClientPortalToServer(newVal);
                    if (ok) {
                      setToggleToast({ msg: `Client portal ${newVal ? 'enabled' : 'disabled'}`, type: 'success' });
                    } else {
                      setToggleToast({ msg: 'Failed to update client portal setting', type: 'error' });
                    }
                    setTimeout(() => setToggleToast(null), 3000);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 disabled:cursor-not-allowed ${
                    config.clientPortalEnabled ? 'bg-[var(--brand-accent)]' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  {clientPortalLoading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin mx-auto" />
                  ) : (
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${config.clientPortalEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between max-w-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">White-Label Mode</span>
                    <p className="text-[10px] text-slate-400">Replace agency branding with custom client branding experience.</p>
                    {whiteLabelError && (
                      <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {whiteLabelError}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.whiteLabelEnabled}
                  disabled={whiteLabelLoading}
                  onClick={async () => {
                    const newVal = !config.whiteLabelEnabled;
                    setWhiteLabelEnabled(newVal);
                    const ok = await saveWhiteLabelToServer(newVal);
                    if (ok) {
                      setToggleToast({ msg: `White-label mode ${newVal ? 'enabled' : 'disabled'}`, type: 'success' });
                    } else {
                      setToggleToast({ msg: 'Failed to update white-label mode', type: 'error' });
                    }
                    setTimeout(() => setToggleToast(null), 3000);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 disabled:cursor-not-allowed ${
                    config.whiteLabelEnabled ? 'bg-[var(--brand-accent)]' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  {whiteLabelLoading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin mx-auto" />
                  ) : (
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${config.whiteLabelEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logos' && (
          <div className="space-y-6">
            <LogoUploader
              label="Light Mode Logo"
              description="Displayed on light backgrounds (sidebar, navbar, emails)"
              currentUrl={config.logo.url}
              onUpload={(url) => setLogo({ url })}
              onRemove={() => setLogo({ url: '' })}
            />
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <LogoUploader
              label="Dark Mode Logo"
              description="Displayed on dark backgrounds"
              currentUrl={config.logo.darkUrl}
              onUpload={(url) => setLogo({ darkUrl: url })}
              onRemove={() => setLogo({ darkUrl: '' })}
              darkMode
            />
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <LogoUploader
              label="Favicon"
              description="Browser tab icon (square PNG recommended)"
              currentUrl={config.logo.faviconUrl}
              onUpload={(url) => setLogo({ faviconUrl: url })}
              onRemove={() => setLogo({ faviconUrl: '' })}
              accept="image/png,image/svg+xml,image/x-icon"
            />
          </div>
        )}

        {activeTab === 'colors' && (
          <AccentColorPicker
            currentColor={config.colors.accent}
            onChange={setAccentColor}
          />
        )}

        {activeTab === 'domain' && (
          <DomainSettingsCard
            domain={config.domain.domain}
            verified={config.domain.verified}
            sslActive={config.domain.sslActive}
            onChange={(domain) => setDomain({ domain })}
            onVerify={() => {
              // Simulate domain verification
              setDomain({ verified: true, sslActive: true });
            }}
          />
        )}

        {activeTab === 'email' && (
          <EmailBrandingCard
            email={config.email}
            onChange={setEmail}
            accentColor={config.colors.accent}
            logoUrl={config.logo.url}
          />
        )}

        {activeTab === 'preview' && (
          <BrandingPreview config={config} />
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Reset Branding?</h3>
                <p className="text-xs text-slate-500 mt-0.5">This will revert all branding to defaults.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
