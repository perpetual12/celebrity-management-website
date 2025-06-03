import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CelebrityList from './pages/CelebrityList';
import CelebrityProfile from './pages/CelebrityProfile';
import Dashboard from './pages/Dashboard';

import Appointments from './pages/Appointments';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminMessages from './pages/AdminMessages';
import AdminLogin from './pages/AdminLogin';
import AdminCreateCelebrity from './pages/AdminCreateCelebrity';
import TestAPI from './pages/TestAPI';
import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import TMDbSetup from './pages/TMDbSetup';
import TestCelebrities from './pages/TestCelebrities';


// Set up axios defaults
// Note: Using proxy configuration in package.json instead of baseURL
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor to handle authentication errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('Authentication error detected, clearing user session');
          setUser(null);
          localStorage.removeItem('adminSession');
          localStorage.removeItem('userSession');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Checking authentication status...');
        const res = await axios.get('/api/users/me', {
          withCredentials: true
        });
        const userData = res.data;
        console.log('✅ User authenticated via server session:', userData.username);
        setUser(userData);

        // Store user session in localStorage for persistence
        const sessionKey = userData.role === 'admin' ? 'adminSession' : 'userSession';
        localStorage.setItem(sessionKey, JSON.stringify({
          user: userData,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.log('❌ Not authenticated via server session:', err.response?.status);

        // Check for stored sessions (admin or regular user)
        const storedAdminSession = localStorage.getItem('adminSession');
        const storedUserSession = localStorage.getItem('userSession');
        const storedSession = storedAdminSession || storedUserSession;

        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            const isRecent = Date.now() - sessionData.timestamp < 30 * 24 * 60 * 60 * 1000; // 30 days

            if (isRecent && sessionData.user) {
              console.log(`🔄 Found valid stored ${sessionData.user.role} session for ${sessionData.user.username}, restoring...`);

              // Set user immediately from localStorage to prevent redirect
              setUser(sessionData.user);

              // Try to verify with server in background (but don't fail if it doesn't work)
              try {
                const verifyRes = await axios.get('/api/users/me', {
                  withCredentials: true
                });
                console.log('✅ Server session verified, updating user data');
                setUser(verifyRes.data);

                // Update localStorage with fresh data
                const sessionKey = verifyRes.data.role === 'admin' ? 'adminSession' : 'userSession';
                localStorage.setItem(sessionKey, JSON.stringify({
                  user: verifyRes.data,
                  timestamp: Date.now()
                }));
              } catch (verifyErr) {
                console.log('⚠️ Server session expired, but keeping localStorage session');
                // Keep the user logged in from localStorage even if server session expired
                // This ensures persistence across browser restarts
                console.log('🔄 User remains logged in from localStorage session');
              }
            } else {
              console.log('❌ Stored session is too old or invalid, clearing');
              localStorage.removeItem('adminSession');
              localStorage.removeItem('userSession');
              setUser(null);
            }
          } catch (parseErr) {
            console.log('❌ Invalid stored session data, clearing');
            localStorage.removeItem('adminSession');
            localStorage.removeItem('userSession');
            setUser(null);
          }
        } else {
          console.log('❌ No stored session found');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Check if current route is admin route
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-100">
        {/* Only show regular navbar for non-admin routes */}
        {!isAdminRoute && <Navbar user={user} setUser={setUser} />}
        <div className={`${!isAdminRoute ? 'container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8' : ''}`}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/dashboard" replace /> : <Register />
            } />
            <Route path="/celebrities" element={<CelebrityList />} />
            <Route path="/celebrities/:id" element={<CelebrityProfile user={user} />} />

            {/* Support Pages */}
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* TMDb Setup */}
            <Route path="/tmdb-setup" element={<TMDbSetup />} />

            {/* Test Page */}
            <Route path="/test-celebrities" element={<TestCelebrities />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            } />

            <Route path="/appointments" element={
              <ProtectedRoute user={user}>
                <Appointments user={user} />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute user={user}>
                <Messages user={user} />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute user={user}>
                <Notifications user={user} />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute user={user}>
                <UserProfile user={user} setUser={setUser} />
              </ProtectedRoute>
            } />
            <Route path="/test-api" element={
              <ProtectedRoute user={user}>
                <TestAPI user={user} />
              </ProtectedRoute>
            } />
            <Route path="/admin-login" element={<AdminLogin user={user} setUser={setUser} />} />
            <Route path="/admin" element={
              user && user.role === 'admin' ? (
                <AdminProtectedRoute user={user} loading={loading}>
                  <AdminDashboard user={user} setUser={setUser} />
                </AdminProtectedRoute>
              ) : (
                <Navigate to="/" replace />
              )
            } />
            <Route path="/admin/messages" element={
              user && user.role === 'admin' ? (
                <AdminProtectedRoute user={user} loading={loading}>
                  <AdminMessages user={user} setUser={setUser} />
                </AdminProtectedRoute>
              ) : (
                <Navigate to="/" replace />
              )
            } />
            <Route path="/admin/create-celebrity" element={
              user && user.role === 'admin' ? (
                <AdminProtectedRoute user={user} loading={loading}>
                  <AdminCreateCelebrity user={user} setUser={setUser} />
                </AdminProtectedRoute>
              ) : (
                <Navigate to="/" replace />
              )
            } />


          </Routes>
        </div>
        {/* Only show footer for non-admin routes */}
        {!isAdminRoute && <Footer />}
        {/* Back to top button for all routes */}
        <BackToTop />
      </div>
    </Router>
  );
}

export default App;
