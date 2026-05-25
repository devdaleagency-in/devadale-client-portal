import { useState } from 'react';
import { Globe, CheckCircle2, AlertCircle, Loader2, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';

interface DomainSettingsCardProps {
  domain: string;
  verified: boolean;
  sslActive: boolean;
  onChange: (domain: string) => void;
  onVerify: () => void;
}

export default function DomainSettingsCard({
  domain,
  verified,
  sslActive,
  onChange,
  onVerify,
}: DomainSettingsCardProps) {
  const [inputValue, setInputValue] = useState(domain);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    // Simulate connection test
    await new Promise((r) => setTimeout(r, 1500));
    setTestResult(inputValue.length > 0 ? 'success' : 'error');
    setIsTesting(false);
  };

  const dnsSteps = [
    { label: 'CNAME Record', value: 'portal', target: 'portal.devdale.app', done: verified },
    { label: 'SSL Certificate', value: 'Auto-provisioned', target: 'Let\'s Encrypt', done: sslActive },
    { label: 'Domain Verification', value: 'TXT record', target: 'dv=xxxxx...', done: verified },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Custom Domain
        </label>
        <p className="text-[10px] text-slate-400 mt-0.5">Connect your own domain for a white-label portal experience</p>
      </div>

      {/* Domain input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); onChange(e.target.value); }}
            placeholder="portal.yourclient.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
            aria-label="Custom domain"
          />
        </div>
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isTesting}
          className="px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
        >
          {isTesting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Test'
          )}
        </button>
      </div>

      {testResult && (
        <div className={`flex items-center gap-2 p-2.5 rounded-lg text-[11px] font-medium ${
          testResult === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50'
        }`}>
          {testResult === 'success' ? (
            <><CheckCircle2 className="w-4 h-4 shrink-0" /> Connection successful</>
          ) : (
            <><AlertCircle className="w-4 h-4 shrink-0" /> Connection failed — check DNS configuration</>
          )}
        </div>
      )}

      {/* Status badges */}
      {inputValue && (
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            verified
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
          }`}>
            {verified ? <CheckCircle2 className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
            {verified ? 'Verified' : 'Pending'}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            sslActive
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            <ShieldCheck className="w-3 h-3" />
            {sslActive ? 'SSL Active' : 'No SSL'}
          </span>
        </div>
      )}

      {/* DNS Setup Checklist */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DNS Setup Checklist</span>
        </div>
        <div className="space-y-2">
          {dnsSteps.map((step) => (
            <div key={step.label} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  step.done ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}>
                  {step.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300">{step.label}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-mono text-[10px]">{step.value}</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="text-slate-500 font-mono text-[10px]">{step.target}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onVerify}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
        >
          Verify Domain
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
