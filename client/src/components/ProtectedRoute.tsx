import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated, selectUserRole, selectAuthInitialized } from '../store/authSlice';
import { LoadingPage } from './ui/Spinner';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole | UserRole[];
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userRole = useAppSelector(selectUserRole);
  const initialized = useAppSelector(selectAuthInitialized);
  const location = useLocation();

  if (!initialized) return <LoadingPage />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!userRole || !allowed.includes(userRole)) {
      const redirectMap: Record<UserRole, string> = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        admin: '/admin/dashboard',
      };
      return <Navigate to={userRole ? redirectMap[userRole] : '/'} replace />;
    }
  }

  return <>{children}</>;
}
