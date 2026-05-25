import { Link } from 'react-router-dom';
import BrandLogo from '../../components/BrandLogo';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <BrandLogo dark />
        <div className="mt-8 bg-white/5 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Access Denied</h1>
          <p className="text-slate-400 text-sm">
            You don't have permission to access this page. If you believe this is an error, please reach out to your agency team.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
