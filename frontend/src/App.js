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
import NotFound from './pages/NotFound';


// Set up axios defaults for production
const API_BASE_URL = process.env.REACT_APP_API_URL || '';
console.log('🌐 API Base URL:', API_BASE_URL || 'Using relative URLs (development)');

if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000; // 10 second timeout

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor to handle authentication errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only clear session on 401 if it's not a login attempt
        if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
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

        // First check localStorage for existing session
        const storedAdminSession = localStorage.getItem('adminSession');
        const storedUserSession = localStorage.getItem('userSession');
        const storedSession = storedAdminSession || storedUserSession;

        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            const isRecent = Date.now() - sessionData.timestamp < 30 * 24 * 60 * 60 * 1000; // 30 days

            if (isRecent && sessionData.user) {
              console.log(`🔄 Found valid stored ${sessionData.user.role} session for ${sessionData.user.username}`);
              // Set user immediately from localStorage to prevent redirect
              setUser(sessionData.user);
            }
          } catch (parseErr) {
            console.log('❌ Invalid stored session data, clearing');
            localStorage.removeItem('adminSession');
            localStorage.removeItem('userSession');
          }
        }

        // Then try to verify with server
        const res = await axios.get('/api/users/me', {
          withCredentials: true
        });
        const userData = res.data;
        console.log('✅ User authenticated via server session:', userData.username);
        setUser(userData);

        // Update localStorage with fresh data
        const sessionKey = userData.role === 'admin' ? 'adminSession' : 'userSession';
        localStorage.setItem(sessionKey, JSON.stringify({
          user: userData,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.log('❌ Server session check failed:', err.response?.status);

        // If we have a valid localStorage session but server check fails,
        // keep the user logged in (they might have just logged in)
        const storedAdminSession = localStorage.getItem('adminSession');
        const storedUserSession = localStorage.getItem('userSession');
        const storedSession = storedAdminSession || storedUserSession;

        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            const isRecent = Date.now() - sessionData.timestamp < 5 * 60 * 1000; // 5 minutes

            if (isRecent && sessionData.user) {
              console.log('🔄 Using recent localStorage session while server session establishes');
              setUser(sessionData.user);
              return; // Don't clear the session yet
            }
          } catch (parseErr) {
            console.log('❌ Invalid stored session data');
          }
        }

        // If no recent localStorage session found, clear everything
        console.log('❌ No valid session found, clearing user state');
        localStorage.removeItem('adminSession');
        localStorage.removeItem('userSession');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Always check auth status, but don't fail on public pages
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

            {/* 404 Not Found - Must be last route */}
            <Route path="*" element={<NotFound />} />

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
