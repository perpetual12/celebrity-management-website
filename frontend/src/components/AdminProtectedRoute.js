import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children, user, loading }) => {
  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 text-white">🔐</div>
          <div className="text-white text-xl">Verifying Admin Access...</div>
        </div>
      </div>
    );
  }

  // Check for stored admin session if user is null
  if (!user) {
    const storedSession = localStorage.getItem('adminSession');
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        const isRecent = Date.now() - sessionData.timestamp < 7 * 24 * 60 * 60 * 1000; // 7 days

        if (isRecent && sessionData.user.role === 'admin') {
          // Show loading while session is being verified
          return (
            <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-purple-700 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 text-white">🔐</div>
                <div className="text-white text-xl">Restoring Admin Session...</div>
              </div>
            </div>
          );
        }
      } catch (err) {
        // Invalid stored data, clear and redirect
        localStorage.removeItem('adminSession');
      }
    }

    // No valid session, redirect to admin login
    return <Navigate to="/admin-login" />;
  }

  // If user is not an admin, redirect to admin login
  if (user.role !== 'admin') {
    return <Navigate to="/admin-login" />;
  }

  return children;
};

export default AdminProtectedRoute;
