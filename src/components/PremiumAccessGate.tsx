import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Building2,
  Clock3,
  KeyRound,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  Smartphone,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { api } from '../utils/api';

interface PremiumAccessGateProps {
  onAccessGranted: (role: 'admin' | 'client') => void;
  onboardingToken?: string;
}

export default function PremiumAccessGate({ onAccessGranted, onboardingToken }: PremiumAccessGateProps) {
  const [method, setMethod] = useState<'magic' | 'otp'>('magic');
  const [otp, setOtp] = useState('248916');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@devdale.com');
  const [onboardingState, setOnboardingState] = useState<'verifying' | 'valid' | 'expired' | 'used' | 'not-found' | null>(null);
  const [onboardingInfo, setOnboardingInfo] = useState<{ clientName: string; organization: string; email: string } | null>(null);

  useEffect(() => {
    if (onboardingToken) {
      setOnboardingState('verifying');
      api.verifyOnboardingLink(onboardingToken).then((res) => {
        setOnboardingInfo({ clientName: res.clientName, organization: res.organization, email: res.email });
        setOnboardingState('valid');
      }).catch((err) => {
        const msg = err?.message || '';
        if (msg.includes('expired')) setOnboardingState('expired');
        else if (msg.includes('used') || msg.includes('410')) setOnboardingState('used');
        else setOnboardingState('not-found');
      });
    }
  }, [onboardingToken]);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');

  const handleAdminSubmit = () => {
    const email = adminEmail.trim();
    const password = adminPassword.trim();
    if (!email || !password) {
      setAdminError('Please enter both email and password.');
      return;
    }
    setAdminError('');
    onAccessGranted('admin');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white grid lg:grid-cols-[1.1fr_0.9fr] overflow-hidden">
      <section className="relative p-6 sm:p-10 lg:p-14 flex flex-col justify-between min-h-[48vh]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(37,99,235,0.42),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(14,165,233,0.2),transparent_22%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <BrandLogo dark />
          </div>

          <div className="max-w-2xl mt-16 sm:mt-24">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              {showAdminLogin ? 'Admin authentication' : 'Tokenized client access'}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mt-5 leading-[1.02]">
              Premium project clarity, from kickoff to approval.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-7 mt-5 max-w-xl">
              {showAdminLogin
                ? 'Authorized administrators authenticate with corporate credentials to access the full control panel.'
                : 'Clients enter through expiring links or email OTP, then track requirements, files, approvals, timelines, and communication in one branded portal.'}
            </p>
          </div>
        </div>

        <div className="relative z-10 grid sm:grid-cols-3 gap-3 mt-10">
          {[
            { icon: Clock3, label: 'Link expiry', value: '24 hour secure URLs' },
            { icon: Smartphone, label: 'Mobile ready', value: 'OTP friendly login' },
            { icon: LockKeyhole, label: 'Protected files', value: 'Role-aware access' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                <Icon className="w-4 h-4 text-blue-200" />
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-3">{item.label}</p>
                <p className="text-sm font-bold mt-1">{item.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-50 text-slate-950 p-6 sm:p-10 lg:p-14 flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 p-6 sm:p-7">
            {onboardingState === 'verifying' ? (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">Verifying your onboarding link...</p>
              </div>
            ) : onboardingState === 'valid' && onboardingInfo ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Welcome!</h2>
                    <p className="text-xs text-slate-500 mt-1">Your onboarding link is verified.</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-500">Client</span>
                    <span className="font-bold text-slate-800">{onboardingInfo.clientName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-500">Organization</span>
                    <span className="font-bold text-slate-800">{onboardingInfo.organization}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-500">Email</span>
                    <span className="font-bold text-slate-800">{onboardingInfo.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onAccessGranted('client')}
                  className="mt-6 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Enter Your Workspace
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : onboardingState === 'expired' ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Link Expired</h3>
                <p className="text-xs text-slate-500">This onboarding link has expired. Please contact your admin for a new one.</p>
              </div>
            ) : onboardingState === 'used' ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Link Already Used</h3>
                <p className="text-xs text-slate-500">This onboarding link has already been used. Please contact your admin for a new one.</p>
              </div>
            ) : onboardingState === 'not-found' ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Invalid Link</h3>
                <p className="text-xs text-slate-500">This onboarding link is not valid. Please check the URL or contact your admin.</p>
              </div>
            ) : showAdminLogin ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Admin Login</h2>
                    <p className="text-xs text-slate-500 mt-1">Enter your admin credentials to continue.</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Username or Email</span>
                    <input
                      type="text"
                      value={adminEmail}
                      onChange={(e) => { setAdminEmail(e.target.value); setAdminError(''); }}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder-slate-400"
                      placeholder="admin@devdale.com"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Password</span>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => { setAdminPassword(e.target.value); setAdminError(''); }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 pr-8 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder-slate-400"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </label>

                  {adminError && (
                    <p className="text-xs text-red-500 font-semibold">{adminError}</p>
                  )}


                  <button
                    type="button"
                    onClick={handleAdminSubmit}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    Access Admin Console
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowAdminLogin(false); setAdminError(''); }}
                    className="w-full rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-500 font-bold text-xs py-3 flex items-center justify-center gap-2 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Client Login
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Client Login</h2>
                    <p className="text-xs text-slate-500 mt-1">Choose secure URL or email OTP authentication.</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setMethod('magic')}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${method === 'magic' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Secure Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('otp')}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${method === 'otp' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Email OTP
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {method === 'magic' ? (
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Secure token URL</span>
                      <input
                        value="https://portal.devdale.com/access/client-24h-7KQ2"
                        readOnly
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 outline-none"
                      />
                    </label>
                  ) : (
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Email verification code</span>
                      <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        inputMode="numeric"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-lg tracking-[0.45em] font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </label>
                  )}

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 flex items-start gap-3 text-xs text-emerald-800">
                    <MailCheck className="w-4 h-4 mt-0.5 shrink-0" />
                    <p><span className="font-black">Session protected.</span> Device fingerprinting, rate limiting, and audit logging are active.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAccessGranted('client')}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    Enter Client Workspace
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(true)}
                    className="w-full rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-xs py-3 flex items-center justify-center gap-2 transition-all"
                  >
                    <Building2 className="w-4 h-4 text-slate-400" />
                    Open Private Admin Console
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
