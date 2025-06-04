import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    console.log('🔐 Login attempt:', {
      username: formData.username,
      apiUrl: process.env.REACT_APP_API_URL || 'relative URL',
      fullUrl: axios.defaults.baseURL ? `${axios.defaults.baseURL}/api/users/login` : '/api/users/login'
    });

    try {
      const res = await axios.post('/api/users/login', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Login successful:', res.data);
      const userData = res.data.user;

      // Set user in App state immediately
      setUser(userData);

      // Store user session in localStorage for persistence
      const sessionKey = userData.role === 'admin' ? 'adminSession' : 'userSession';
      localStorage.setItem(sessionKey, JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));

      console.log('✅ User session stored:', sessionKey);
      console.log('✅ User state set:', userData.username);

      // Verify the session was created by checking /me endpoint
      try {
        const verifyRes = await axios.get('/api/users/me', {
          withCredentials: true
        });
        console.log('✅ Session verified:', verifyRes.data.username);

        // Navigate to dashboard after verification
        console.log('🎯 Navigating to dashboard...');
        navigate('/dashboard');
      } catch (verifyErr) {
        console.error('❌ Session verification failed:', verifyErr);
        setError('Login succeeded but session verification failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);

      let errorMessage = 'Login failed';
      if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your Celebrity Connect account</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center">
          <span className="mr-2">❌</span>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
          </p>
        </div>

        {/* Test Credentials Helper */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">🧪 Test Credentials</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Test User:</strong> testuser / test123</p>
            <p><strong>Admin:</strong> admin / admin123</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;

