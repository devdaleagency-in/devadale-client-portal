import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/store/authStore';
import BrandLogo from './BrandLogo';

interface RoleProtectedRouteProps {
  allowedRoles: ('super_admin' | 'admin' | 'client' | 'team_member' | 'onboarding')[];
  redirectTo?: string;
}

export default function RoleProtectedRoute({
  allowedRoles,
  redirectTo = '/unauthorized'
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <BrandLogo dark />
          <p className="text-slate-400 text-sm animate-pulse">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
