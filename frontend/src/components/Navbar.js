import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out user...');
      await axios.post('/api/users/logout', {}, {
        withCredentials: true
      });

      console.log('✅ Logout successful');
      setUser(null);

      // Clear all sessions from localStorage
      localStorage.removeItem('adminSession');
      localStorage.removeItem('userSession');

      console.log('🧹 Cleared localStorage sessions');

      navigate('/');
      setIsSidebarOpen(false); // Close sidebar after logout
    } catch (err) {
      console.error('❌ Logout failed:', err);

      // Even if logout fails on server, clear local session
      setUser(null);
      localStorage.removeItem('adminSession');
      localStorage.removeItem('userSession');
      navigate('/');
      setIsSidebarOpen(false);
    }
  };

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.hamburger')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Don't show navbar for admin users
  if (user && user.role === 'admin') {
    return null;
  }

  const navigationLinks = [
    { to: '/celebrities', label: 'Celebrities', icon: '⭐' },
    ...(user ? [
      { to: '/dashboard', label: 'Dashboard', icon: '📊' },
      { to: '/appointments', label: 'Appointments', icon: '📅' },
      { to: '/messages', label: 'Messages', icon: '💬' },
      { to: '/notifications', label: 'Notifications', icon: '🔔' },
      { to: '/profile', label: 'Profile', icon: '👤' }
    ] : [
      { to: '/login', label: 'Login', icon: '🔑' },
      { to: '/register', label: 'Register', icon: '📝' }
    ])
  ];

  const supportLinks = [
    { to: '/help', label: 'Help Center', icon: '❓' },
    { to: '/contact', label: 'Contact Us', icon: '📞' },
    { to: '/privacy', label: 'Privacy Policy', icon: '🔒' },
    { to: '/terms', label: 'Terms of Service', icon: '📋' }
  ];

  return (
    <>
      {/* Desktop & Mobile Header */}
      <nav className="bg-indigo-600 text-white shadow-md relative z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold flex items-center space-x-2">
              <span className="text-2xl">🌟</span>
              <span>Celebrity Connect</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-6 items-center">
              {navigationLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-indigo-200 transition duration-300 flex items-center space-x-1"
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

              {user && (
                <>
                  {/* Username Display */}
                  <div className="flex items-center space-x-2 text-indigo-200 font-medium border-l border-indigo-400 pl-6">
                    {user.profile_image ? (
                      <img
                        src={`http://localhost:5001${user.profile_image}`}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{user.username}</span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center space-x-2 font-medium shadow-md"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden hamburger p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                  isSidebarOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                }`}></span>
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                  isSidebarOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                  isSidebarOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                }`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden transition-opacity duration-300 ${
        isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Sidebar */}
        <div className={`sidebar fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌟</span>
                <span className="text-lg font-bold">Celebrity Connect</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info in Sidebar */}
            {user && (
              <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
                <div className="flex items-center space-x-3">
                  {user.profile_image ? (
                    <img
                      src={`http://localhost:5001${user.profile_image}`}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-indigo-200 text-sm capitalize">{user.role} Account</p>
                    {user.full_name && (
                      <p className="text-indigo-100 text-xs">{user.full_name}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Main Navigation */}
            <div className="p-6">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">
                Navigation
              </h3>
              <div className="space-y-2">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition duration-300 group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Support Section */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">
                Support
              </h3>
              <div className="space-y-2">
                {supportLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition duration-300 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Logout Section for Mobile */}
            {user && (
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition duration-300 font-medium"
                >
                  <span className="text-xl">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                © 2024 Celebrity Connect
              </p>
              <p className="text-gray-400 text-xs mt-1">
                All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;


