import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user }) => {
  // If no user is logged in, redirect to login
  if (!user) {
    console.log('🔒 No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If user is an admin, redirect them to admin dashboard
  if (user.role === 'admin') {
    console.log('👑 Admin user detected, redirecting to admin dashboard');
    return <Navigate to="/admin" replace />;
  }

  console.log('✅ User authenticated, rendering protected content for:', user.username);
  return children;
};

export default ProtectedRoute;