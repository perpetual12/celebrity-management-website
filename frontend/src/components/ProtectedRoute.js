import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    // Check for user in props first
    if (user) {
      setLocalUser(user);
      setIsChecking(false);
      return;
    }

    // Check localStorage for recent session
    const storedAdminSession = localStorage.getItem('adminSession');
    const storedUserSession = localStorage.getItem('userSession');
    const storedSession = storedAdminSession || storedUserSession;

    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        const isRecent = Date.now() - sessionData.timestamp < 5 * 60 * 1000; // 5 minutes

        if (isRecent && sessionData.user) {
          console.log('🔄 Found recent localStorage session, allowing access');
          setLocalUser(sessionData.user);
        }
      } catch (err) {
        console.log('❌ Invalid localStorage session');
      }
    }

    // Give a moment for authentication to settle
    setTimeout(() => {
      setIsChecking(false);
    }, 1000);
  }, [user]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Checking authentication...</div>
      </div>
    );
  }

  const currentUser = user || localUser;

  // If no user is logged in, redirect to login
  if (!currentUser) {
    console.log('🔒 No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If user is an admin, redirect them to admin dashboard
  if (currentUser.role === 'admin') {
    console.log('👑 Admin user detected, redirecting to admin dashboard');
    return <Navigate to="/admin" replace />;
  }

  console.log('✅ User authenticated, rendering protected content for:', currentUser.username);
  return children;
};

export default ProtectedRoute;