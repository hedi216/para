import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import type { UserRole } from '../types/api';

export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <div className="section-shell py-24 text-center text-on-surface-variant">Chargement de votre espace...</div>;
  }
  if (!user) {
    return <Navigate to={`/compte?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
