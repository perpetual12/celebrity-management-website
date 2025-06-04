import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user, loading }) => {
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    console.log('🔒 No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If user is an admin, redirect them to admin dashboard
  // Admins should not have access to regular user features
  if (user.role === 'admin') {
    console.log('👑 Admin user detected, redirecting to admin dashboard');
    return <Navigate to="/admin" replace />;
  }

  console.log('✅ User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;