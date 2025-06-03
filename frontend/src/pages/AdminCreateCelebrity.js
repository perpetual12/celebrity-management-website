import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminCreateCelebrity = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    bio: '',
    category: '',
    profileImage: '',
    availableForBooking: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Actor', 'Musician', 'Athlete', 'Influencer', 'Author', 
    'Comedian', 'Chef', 'Business Leader', 'Director', 'Model', 'Other'
  ];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('🌟 Creating celebrity:', {
      username: formData.username,
      name: formData.name,
      category: formData.category
    });

    try {
      // Use admin endpoint to create celebrity (creates both user and celebrity profile)
      const response = await axios.post('/api/admin/create-celebrity', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        bio: formData.bio,
        category: formData.category,
        profileImage: formData.profileImage,
        availableForBooking: formData.availableForBooking
      }, {
        withCredentials: true
      });

      console.log('✅ Celebrity created successfully:', response.data);
      setSuccess(`Celebrity "${formData.name}" created successfully!`);

      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        name: '',
        bio: '',
        category: '',
        profileImage: '',
        availableForBooking: true
      });

    } catch (err) {
      console.error('❌ Error creating celebrity:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to create celebrity');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin privileges required to access this area.</p>
          <a href="/admin-login" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout user={user} setUser={setUser}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
            <h1 className="text-3xl font-bold">⭐ Create New Celebrity</h1>
            <p className="text-purple-200">Add a new celebrity to the platform</p>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter unique username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter password (min 6 characters)"
                      required
                      minLength="6"
                    />
                  </div>
                </div>
              </div>

              {/* Celebrity Profile */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Celebrity Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Celebrity Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter celebrity's full name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Image URL
                      </label>
                      <input
                        type="url"
                        name="profileImage"
                        value={formData.profileImage}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biography *
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter celebrity biography and achievements..."
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="availableForBooking"
                      checked={formData.availableForBooking}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Available for booking
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition duration-300"
                >
                  {loading ? 'Creating...' : 'Create Celebrity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCreateCelebrity;
