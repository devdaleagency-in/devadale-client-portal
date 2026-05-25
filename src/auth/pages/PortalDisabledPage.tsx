import { Lock } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';

export default function PortalDisabledPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <BrandLogo dark />
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Portal Disabled</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            The client portal has been temporarily disabled.
            Please contact your agency team for assistance.
          </p>
        </div>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          Return to Login
        </a>
      </div>
    </div>
  );
}
