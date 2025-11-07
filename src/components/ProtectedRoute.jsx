import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Protect routes by authentication and role
// Usage: <ProtectedRoute roles={["admin"]}><AdminDashboard/></ProtectedRoute>
export default function ProtectedRoute({ roles = [], children }) {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to the appropriate login page with return path
    let loginPath = '/';
    if (roles.includes('admin')) loginPath = '/admin/login';
    else if (roles.includes('faculty')) loginPath = '/faculty/login';
    else if (roles.includes('student')) loginPath = '/student/login';

    return (
      <Navigate
        to={loginPath}
        state={{ from: location }}
        replace
      />
    );
  }

  if (roles.length > 0 && !roles.includes(userRole)) {
    // Role mismatch: redirect home
    return <Navigate to="/" replace />;
  }

  return children;
}