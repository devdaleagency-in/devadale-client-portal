import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import BrandLogo from '../../components/BrandLogo';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useState(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    authService.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Verification failed');
      });
  });

  const icon = status === 'verifying' ? (
    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
  ) : status === 'success' ? (
    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ) : (
    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
      <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo dark />
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          {icon}
          <p className={`text-sm font-semibold ${status === 'success' ? 'text-emerald-400' : status === 'error' ? 'text-red-400' : 'text-slate-200'}`}>
            {message || 'Verifying your email...'}
          </p>
          {status !== 'verifying' && (
            <Link to="/login" className="inline-block text-blue-400 hover:text-blue-300 text-sm font-semibold">
              Go to sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
