import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.full_name || '',
    bio: user?.bio || ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profile_image ? `http://localhost:5001${user.profile_image}` : null);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch appointments
      const appointmentsRes = await axios.get('/api/appointments/my-appointments', {
        withCredentials: true
      });
      setAppointments(appointmentsRes.data);

      // Fetch messages
      const messagesRes = await axios.get('/api/messages/my-messages', {
        withCredentials: true
      });
      setMessages(messagesRes.data);

      // Fetch notifications
      const notificationsRes = await axios.get('/api/notifications/my-notifications', {
        withCredentials: true
      });
      setNotifications(notificationsRes.data);
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('username', profileData.username);
      formData.append('email', profileData.email);
      formData.append('fullName', profileData.fullName);
      formData.append('bio', profileData.bio);

      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const response = await axios.put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      // Update user state with new data
      setUser(response.data.user);
      setSuccess('Profile updated successfully!');

      // Update preview URL if new image was uploaded
      if (selectedFile) {
        setPreviewUrl(`http://localhost:5001${response.data.user.profile_image}`);
        setSelectedFile(null);
      }

    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/users/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.delete('/api/users/delete-account', {
        withCredentials: true
      });

      // Clear user session
      setUser(null);
      localStorage.removeItem('adminSession');
      localStorage.removeItem('userSession');

      // Show success message and redirect
      alert(`Account deleted successfully! Goodbye ${response.data.deletedUser}!`);
      navigate('/');

    } catch (err) {
      console.error('Delete account failed:', err);
      setError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {user.profile_image ? (
              <img
                src={`http://localhost:5001${user.profile_image}`}
                alt={user.username}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white mx-auto sm:mx-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-indigo-600 text-xl sm:text-2xl font-bold mx-auto sm:mx-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">{user.username}</h1>
              <p className="text-indigo-200 text-sm sm:text-base">{user.email}</p>
              <p className="text-indigo-200 capitalize text-sm sm:text-base">{user.role} Account</p>
              {user.full_name && (
                <p className="text-indigo-200 text-sm sm:text-base">{user.full_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-4 sm:px-6 scrollbar-hide">
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'appointments', label: 'Appointments', icon: '📅' },
              { id: 'messages', label: 'Messages', icon: '💬' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows="4"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="space-y-4">
                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="flex items-center space-x-4">
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                      <div className="text-sm text-gray-600">
                        {selectedFile ? 'New image selected' : 'Current profile image'}
                      </div>
                    </div>
                  )}

                  {/* File Input */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Choose an image file (JPEG, PNG, GIF, WebP). Maximum size: 5MB.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Appointments</h2>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No appointments yet</p>
                <Link 
                  to="/celebrities" 
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                  Browse Celebrities
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm sm:text-base">{appointment.Celebrity?.name}</h3>
                        <p className="text-gray-600 text-sm">{appointment.purpose}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium self-start ${
                        appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Messages</h2>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No messages yet</p>
                <Link 
                  to="/celebrities" 
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                  Start Messaging
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(message => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
                      <h3 className="font-semibold text-sm sm:text-base">
                        {message.receiver?.name || 'Celebrity'}
                      </h3>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>
            <div className="space-y-4">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-4 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-1 sm:space-y-0">
                    <p className={`text-sm sm:text-base ${!notification.read ? 'font-semibold' : ''}`}>
                      {notification.message}
                    </p>
                    <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">{notification.time}</span>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                <p className="text-gray-600 mb-4">Manage your account settings and preferences</p>
                <div className="space-y-2">
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Member since:</strong> {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
                <p className="text-gray-600 mb-4">Irreversible and destructive actions</p>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 mr-4"
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border border-red-600 text-red-600 px-6 py-2 rounded-md hover:bg-red-50"
                  disabled={loading}
                >
                  Delete Account
                </button>

                {/* Delete Account Confirmation Modal */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <h3 className="text-lg font-semibold text-red-600 mb-4">⚠️ Delete Account</h3>
                      <p className="text-gray-600 mb-6">
                        Are you sure you want to delete your account? This action cannot be undone and will permanently remove:
                      </p>
                      <ul className="text-sm text-gray-600 mb-6 list-disc list-inside">
                        <li>Your profile and account information</li>
                        <li>All your messages and conversations</li>
                        <li>All your appointments and bookings</li>
                        <li>All your notifications</li>
                        {user.role === 'celebrity' && <li>Your celebrity profile</li>}
                      </ul>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                          disabled={loading}
                        >
                          {loading ? 'Deleting...' : 'Delete Forever'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
