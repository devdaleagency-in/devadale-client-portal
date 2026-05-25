import { useState } from 'react';
import { X, Link2, Clock, Copy, Check } from 'lucide-react';
import type { OnboardingLinkRequest, OnboardingLinkResponse } from '../types';

interface Props {
  onClose: () => void;
  onSubmit: (data: OnboardingLinkRequest) => Promise<OnboardingLinkResponse | null>;
}

const EXPIRATION_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '6 hours', value: 6 },
  { label: '12 hours', value: 12 },
  { label: '24 hours', value: 24 },
  { label: '2 days', value: 48 },
  { label: '7 days', value: 168 },
];

export default function CreateOnboardingLinkModal({ onClose, onSubmit }: Props) {
  const [clientName, setClientName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [expirationHours, setExpirationHours] = useState(24);
  const [generatedLink, setGeneratedLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!clientName.trim() || !organization.trim() || !phone.trim() || !email.trim()) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    const expiresAt = new Date(Date.now() + expirationHours * 3600000).toISOString();
    const result = await onSubmit({ clientName: clientName.trim(), organization: organization.trim(), phone: phone.trim(), email: email.trim(), expiresAt });
    setLoading(false);
    if (result) {
      const baseUrl = window.location.origin;
      setGeneratedLink({ url: `${baseUrl}/onboarding?token=${result.token}`, expiresAt: result.expiresAt });
    } else {
      setError('Failed to generate link. Try again.');
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-blue-600" />
            Generate Client Onboarding Link
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">×</button>
        </div>

        <div className="p-5 space-y-4">
          {generatedLink ? (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800/40 p-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Link generated successfully!</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Expires {new Date(generatedLink.expiresAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5">
                <input
                  type="text"
                  readOnly
                  value={generatedLink.url}
                  title="Generated onboarding link"
                  aria-label="Generated onboarding link"
                  className="flex-1 bg-transparent outline-none text-xs font-mono text-slate-700 dark:text-slate-200 truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-all"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Client Name</span>
                  <input
                    id="onboarding-client-name"
                    name="clientName"
                    type="text"
                    value={clientName}
                    onChange={(e) => { setClientName(e.target.value); setError(''); }}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                    placeholder="e.g. Acme Corp"
                  />
                </label>
                <label className="block col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Organization</span>
                  <input
                    id="onboarding-org"
                    name="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => { setOrganization(e.target.value); setError(''); }}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                    placeholder="e.g. Acme Inc."
                  />
                </label>
                <label className="block col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Phone</span>
                  <input
                    id="onboarding-phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(''); }}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                    placeholder="e.g. +1 555-0123"
                  />
                </label>
                <label className="block col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Email</span>
                  <input
                    id="onboarding-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                    placeholder="e.g. client@acme.com"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Link Expiration
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {EXPIRATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setExpirationHours(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        expirationHours === opt.value
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Link will expire {new Date(Date.now() + expirationHours * 3600000).toLocaleString()}
                </p>
              </label>

              {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {loading ? 'Generating...' : 'Generate Link'}
                  <Link2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
