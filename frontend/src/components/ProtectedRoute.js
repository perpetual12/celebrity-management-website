import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user }) => {
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user is an admin, redirect them to admin dashboard
  // Admins should not have access to regular user features
  if (user.role === 'admin') {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default ProtectedRoute;