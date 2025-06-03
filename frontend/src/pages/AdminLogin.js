import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    secretKey: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    // Wait a moment for user state to be determined
    const timer = setTimeout(() => {
      if (user && user.role === 'admin') {
        navigate('/admin');
      } else if (user && user.role !== 'admin') {
        navigate('/');
      } else {
        setPageLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  // Show loading while determining user state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <div className="text-white text-xl">Loading Admin Portal...</div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Admin login attempt:', { username: formData.username, secretKey: formData.secretKey ? 'PROVIDED' : 'MISSING' });

    try {
      const res = await axios.post('/api/admin/login', formData, {
        withCredentials: true
      });
      const userData = res.data.user;

      console.log('✅ Admin login successful:', userData.username);
      setUser(userData);

      // Store admin session for persistence
      localStorage.setItem('adminSession', JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));

      navigate('/admin');
    } catch (err) {
      console.error('❌ Admin login error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);

      if (err.response?.status === 403) {
        setError('Invalid admin secret key. Please use: CELEBRITY_ADMIN_2024_SECURE');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password. Please check your credentials.');
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-purple-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Admin Portal
          </h2>
          <p className="text-red-200">
            Celebrity Connect Administration
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Secret Key
              </label>
              <input
                id="secretKey"
                name="secretKey"
                type="password"
                required
                value={formData.secretKey}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter admin secret key"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? 'Signing in...' : 'Sign in to Admin Portal'}
            </button>
          </form>

          {/* Admin Account Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="text-blue-600 mr-2">ℹ️</div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Admin Account Information</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Admin accounts are completely separate from regular user accounts.
                  Administrators cannot access user features and have their own dedicated dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="text-yellow-600 mr-2">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a restricted area. Only authorized administrators can access this portal.
                  All activities are logged and monitored.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Main Site */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-gray-600 hover:text-gray-800 transition duration-300"
            >
              ← Back to Celebrity Connect
            </Link>
          </div>
        </div>

        {/* Admin Credentials for Testing */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
          <h3 className="font-semibold mb-2">🧪 Test Admin Credentials:</h3>
          <p><strong>Secret Key:</strong> CELEBRITY_ADMIN_2024_SECURE</p>
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
