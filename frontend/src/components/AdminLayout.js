import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AdminLayout = ({ user, setUser, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.admin-sidebar') && !event.target.closest('.admin-hamburger')) {
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

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/admin/messages', {
        withCredentials: true
      });
      const unread = response.data.filter(msg => !msg.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Admin logging out...');
      await axios.post('/api/users/logout', {}, {
        withCredentials: true
      });

      console.log('✅ Admin logout successful');
      setUser(null);

      // Clear admin session from localStorage
      localStorage.removeItem('adminSession');
      localStorage.removeItem('userSession'); // Clear any user session too

      navigate('/admin-login');
      setIsSidebarOpen(false); // Close sidebar after logout
    } catch (err) {
      console.error('❌ Admin logout error:', err);

      // Clear localStorage even if logout request fails
      localStorage.removeItem('adminSession');
      localStorage.removeItem('userSession');
      setUser(null);
      navigate('/admin-login');
      setIsSidebarOpen(false); // Close sidebar after logout
    }
  };

  // Admin navigation links
  const adminNavigationLinks = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/create-celebrity', label: 'Create Celebrity', icon: '⭐' },
    { to: '/admin/messages', label: 'Messages', icon: '💬', badge: unreadCount },
  ];

  const adminActionLinks = [
    {
      label: 'View Website',
      icon: '🌐',
      action: () => window.open('http://localhost:3000', '_blank', 'noopener,noreferrer')
    }
  ];

  return (
    <>
      {/* Admin Header */}
      <header className="bg-red-600 text-white shadow-lg relative z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo/Title */}
            <Link to="/admin" className="flex items-center space-x-3">
              <span className="text-2xl">🔐</span>
              <div className="text-xl font-bold">
                <span className="hidden sm:inline">Celebrity Connect </span>Admin
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {adminNavigationLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center space-x-2 text-red-200 hover:text-white hover:bg-red-700 px-3 py-2 rounded transition duration-300 relative"
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                  {link.badge && link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </Link>
              ))}

              {adminActionLinks.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex items-center space-x-2 text-red-200 hover:text-white hover:bg-red-700 px-3 py-2 rounded transition duration-300"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}

              {/* Desktop Admin Info & Actions */}
              <div className="flex items-center space-x-3 border-l border-red-400 pl-6 ml-6">
                {/* Admin Info */}
                <div className="flex items-center space-x-2 text-red-200 font-medium">
                  {user?.profile_image ? (
                    <img
                      src={`http://localhost:5001${user.profile_image}`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-600 text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-right hidden md:block">
                    <div className="font-semibold text-sm">{user?.username}</div>
                    <div className="text-red-200 text-xs">Administrator</div>
                  </div>
                </div>

                {/* Profile & Logout */}
                <Link
                  to="/admin?tab=profile"
                  className="flex items-center space-x-1 bg-red-700 hover:bg-red-800 px-3 py-2 rounded transition duration-300 text-sm"
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-800 hover:bg-red-900 px-3 py-2 rounded transition duration-300 text-sm flex items-center space-x-1"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden admin-hamburger p-2 rounded-lg hover:bg-red-700 transition duration-300"
              aria-label="Toggle admin menu"
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
      </header>

      {/* Mobile Admin Sidebar Overlay */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden transition-opacity duration-300 ${
        isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Admin Sidebar */}
        <div className={`admin-sidebar fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔐</span>
                <span className="text-lg font-bold">Admin Panel</span>
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

            {/* Admin Info in Sidebar */}
            <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
              <div className="flex items-center space-x-3">
                {user?.profile_image ? (
                  <img
                    src={`http://localhost:5001${user.profile_image}`}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{user?.username}</p>
                  <p className="text-red-200 text-sm">Administrator</p>
                  {user?.full_name && (
                    <p className="text-red-100 text-xs">{user.full_name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Admin Navigation */}
            <div className="p-6">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">
                Admin Navigation
              </h3>
              <div className="space-y-2">
                {adminNavigationLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition duration-300 group relative"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span className="font-medium">{link.label}</span>
                    {link.badge && link.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {link.badge > 99 ? '99+' : link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">
                Actions
              </h3>
              <div className="space-y-2">
                {adminActionLinks.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition duration-300 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      {action.icon}
                    </span>
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}

                {/* Profile Link */}
                <Link
                  to="/admin?tab=profile"
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition duration-300 group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                    👤
                  </span>
                  <span className="font-medium">Admin Profile</span>
                </Link>
              </div>
            </div>

            {/* Logout Section for Mobile */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition duration-300 font-medium"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                © 2024 Celebrity Connect
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Admin Portal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div>
                <p className="text-sm">© 2024 Celebrity Connect Admin Portal</p>
                <p className="text-xs text-gray-400">Restricted Access - Authorized Personnel Only</p>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className="text-green-400">● System Online</span>
                <span>|</span>
                <button
                  onClick={() => window.open('http://localhost:3000', '_blank', 'noopener,noreferrer')}
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  View Public Site
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AdminLayout;
