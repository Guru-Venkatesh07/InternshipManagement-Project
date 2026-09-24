import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleGuard = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to respective home dashboard based on role
    const fallbackPath =
      user?.role === 'STUDENT'
        ? '/student/dashboard'
        : user?.role === 'EMPLOYER'
        ? '/employer/dashboard'
        : user?.role === 'FACULTY'
        ? '/faculty/dashboard'
        : '/admin/dashboard';

    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};
