import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Message interaction states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    secretKey: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Delete celebrity confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [celebrityToDelete, setCelebrityToDelete] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Fetching admin dashboard data...');
      const [statsRes, appointmentsRes, messagesRes, usersRes, celebritiesRes] = await Promise.all([
        axios.get('/api/admin/stats', { withCredentials: true }),
        axios.get('/api/admin/appointments', { withCredentials: true }),
        axios.get('/api/admin/messages', { withCredentials: true }),
        axios.get('/api/admin/users', { withCredentials: true }),
        axios.get('/api/admin/celebrities', { withCredentials: true })
      ]);

      setStats(statsRes.data);
      setAppointments(appointmentsRes.data);
      setMessages(messagesRes.data);
      setUsers(usersRes.data);
      setCelebrities(celebritiesRes.data);

      // Debug logging
      console.log('Admin Dashboard Data:');
      console.log('Stats:', statsRes.data);
      console.log('Appointments:', appointmentsRes.data);
      console.log('Messages:', messagesRes.data);
      console.log('Users:', usersRes.data);
      console.log('Celebrities:', celebritiesRes.data);
    } catch (err) {
      console.error('Admin dashboard error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });

      if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError('Cannot connect to server. Please ensure the backend is running on port 5001.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (err.response?.status === 401) {
        setError('Please log in to access the admin dashboard.');
      } else {
        setError(`Failed to fetch dashboard data: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`/api/admin/appointments/${appointmentId}/status`, { status }, {
        withCredentials: true
      });
      setSuccess(`Appointment ${status} successfully`);
      fetchDashboardData(); // Refresh data
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role }, {
        withCredentials: true
      });
      setSuccess(`User role updated to ${role}`);
      fetchDashboardData(); // Refresh data
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const toggleCelebrityAvailability = async (celebrityId, available) => {
    try {
      await axios.put(`/api/admin/celebrities/${celebrityId}/availability`, {
        available_for_booking: available
      }, {
        withCredentials: true
      });
      setSuccess(`Celebrity availability updated`);
      fetchDashboardData(); // Refresh data
    } catch (err) {
      setError('Failed to update celebrity availability');
    }
  };

  const handleDeleteCelebrity = (celebrity) => {
    setCelebrityToDelete(celebrity);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCelebrity = async () => {
    if (!celebrityToDelete) return;

    try {
      setLoading(true);
      setError('');

      console.log(`🗑️ Attempting to delete celebrity: ${celebrityToDelete.name} (ID: ${celebrityToDelete.id})`);

      const response = await axios.delete(`/api/admin/celebrities/${celebrityToDelete.id}`, {
        withCredentials: true
      });

      console.log('✅ Delete response:', response.data);

      setSuccess(`Celebrity "${celebrityToDelete.name}" deleted successfully. All related data has been removed.`);
      setShowDeleteConfirm(false);
      setCelebrityToDelete(null);

      // Refresh dashboard data to reflect changes
      fetchDashboardData();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('❌ Error deleting celebrity:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);

      let errorMessage = 'Failed to delete celebrity';

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 404) {
        errorMessage = 'Celebrity not found';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in as admin to delete celebrities';
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      }

      setError(errorMessage);
      setShowDeleteConfirm(false);
      setCelebrityToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteCelebrity = () => {
    setShowDeleteConfirm(false);
    setCelebrityToDelete(null);
  };

  const handlePasswordFormChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  // Message interaction functions
  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    setReplyContent('');
    setError('');
    setSuccess('');
    setMessageLoading(true);

    try {
      const response = await axios.get(`/api/admin/conversation/${message.sender_id}/${message.celebrity_id}`, {
        withCredentials: true
      });
      setConversationMessages(response.data);
    } catch (err) {
      setError('Failed to fetch conversation');
      setConversationMessages([]);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedMessage) return;

    try {
      await axios.post('/api/admin/reply-message', {
        originalMessageId: selectedMessage.id,
        content: replyContent,
        recipientId: selectedMessage.sender_id,
        celebrityId: selectedMessage.celebrity_id
      }, {
        withCredentials: true
      });

      setSuccess('Reply sent successfully!');
      setReplyContent('');

      // Refresh conversation
      const conversationResponse = await axios.get(`/api/admin/conversation/${selectedMessage.sender_id}/${selectedMessage.celebrity_id}`, {
        withCredentials: true
      });
      setConversationMessages(conversationResponse.data);

      // Refresh messages list
      fetchDashboardData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reply');
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`/api/admin/messages/${messageId}/mark-read`, {}, {
        withCredentials: true
      });
      setSuccess('Message marked as read');

      // Update selected message
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({
          ...selectedMessage,
          is_read: true
        });
      }

      // Refresh messages list
      fetchDashboardData();

      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to mark message as read');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      await axios.put('/api/admin/change-password', {
        secretKey: passwordForm.secretKey,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        withCredentials: true
      });

      setSuccess('Password changed successfully');
      setPasswordForm({
        secretKey: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
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
      <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-red-200">Manage users, celebrities, appointments, and messages</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'appointments', label: 'Appointments', icon: '📅' },
              { id: 'messages', label: 'Messages', icon: '💬' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'celebrities', label: 'Celebrities', icon: '⭐' },
              { id: 'profile', label: 'Profile', icon: '🔐' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
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

        {loading && (
          <div className="text-center py-8">Loading dashboard data...</div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && !loading && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="text-blue-600 text-3xl mr-4">👥</div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Total Users</h3>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="text-purple-600 text-3xl mr-4">⭐</div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">Total Celebrities</h3>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalCelebrities || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="text-green-600 text-3xl mr-4">📅</div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Total Appointments</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.totalAppointments || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="text-yellow-600 text-3xl mr-4">⏳</div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-900">Pending Appointments</h3>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="text-indigo-600 text-3xl mr-4">💬</div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900">Total Messages</h3>
                    <p className="text-2xl font-bold text-indigo-600">{stats.totalMessages || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-600 text-3xl mr-4">📬</div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Unread Messages</h3>
                    <p className="text-2xl font-bold text-red-600">{stats.unreadMessages || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && !loading && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manage Appointments ({appointments.length})</h2>
            {appointments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No appointments found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Celebrity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{appointment.user_name}</div>
                          <div className="text-sm text-gray-500">{appointment.user_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.celebrity_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(appointment.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {appointment.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {appointment.status === 'approved' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && !loading && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Message Management ({messages.length})</h2>
                <p className="text-gray-600 mt-1">Click any message to view the conversation and reply</p>
              </div>
              <Link
                to="/admin/messages"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-medium flex items-center space-x-2"
              >
                <span>💬</span>
                <span>Open Full Message Center</span>
                {messages.filter(m => !m.is_read).length > 0 && (
                  <span className="bg-yellow-400 text-blue-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {messages.filter(m => !m.is_read).length}
                  </span>
                )}
              </Link>
            </div>

            {/* Two-Panel Layout */}
            <div className="flex bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '800px' }}>
              {/* Messages List - Left Panel */}
              <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    📬 User Messages ({messages.length})
                  </h3>

                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📭</div>
                      <p className="text-gray-500">No messages found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map(message => (
                        <div
                          key={message.id}
                          onClick={() => handleMessageClick(message)}
                          className={`p-4 border rounded-lg cursor-pointer transition duration-300 hover:shadow-md ${
                            selectedMessage?.id === message.id
                              ? 'bg-blue-50 border-blue-300 shadow-md'
                              : message.is_read
                              ? 'bg-white border-gray-200 hover:bg-gray-50'
                              : 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {message.sender_name} → {message.celebrity_name}
                              </h4>
                              <p className="text-xs text-gray-600">{message.sender_email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!message.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                message.is_read
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {message.is_read ? 'Read' : 'Unread'}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {message.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message View - Right Panel */}
              <div className="w-1/2 flex flex-col">
                {selectedMessage ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            💬 {selectedMessage.sender_name} ↔ {selectedMessage.celebrity_name}
                          </h3>
                          <p className="text-sm text-gray-600">{selectedMessage.sender_email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!selectedMessage.is_read && (
                            <button
                              onClick={() => markAsRead(selectedMessage.id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition duration-300"
                            >
                              Mark Read
                            </button>
                          )}
                          <span className={`px-2 py-1 text-xs rounded ${
                            selectedMessage.is_read
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedMessage.is_read ? '✅ Read' : '📬 Unread'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Conversation Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                      <div className="space-y-4">
                        {messageLoading ? (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-4">💭</div>
                            <p className="text-gray-500">Loading conversation...</p>
                          </div>
                        ) : conversationMessages.length > 0 ? (
                          conversationMessages.map((msg, index) => (
                            <div key={index} className={`flex ${
                              msg.sender_role === 'admin' || msg.sender_role === 'celebrity'
                                ? 'justify-end'
                                : 'justify-start'
                            }`}>
                              <div className={`max-w-lg p-4 rounded-lg shadow-sm ${
                                msg.sender_role === 'admin'
                                  ? 'bg-red-500 text-white'
                                  : msg.sender_role === 'celebrity'
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-white text-gray-900 border'
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold">
                                    {msg.sender_role === 'admin'
                                      ? '👨‍💼 Admin (as Celebrity)'
                                      : msg.sender_role === 'celebrity'
                                      ? `⭐ ${msg.sender_name}`
                                      : `👤 ${msg.sender_name}`
                                    }
                                  </span>
                                  <span className={`text-xs ${
                                    msg.sender_role === 'admin' || msg.sender_role === 'celebrity'
                                      ? 'text-white opacity-75'
                                      : 'text-gray-500'
                                  }`}>
                                    {new Date(msg.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                                  msg.sender_role === 'admin' || msg.sender_role === 'celebrity'
                                    ? 'text-white'
                                    : 'text-gray-800'
                                }`}>
                                  {msg.content}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-4">💭</div>
                            <p className="text-gray-500">No conversation found</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reply Form */}
                    <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-semibold text-gray-900">
                          ✍️ Reply as {selectedMessage.celebrity_name}
                        </h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Admin Response
                        </span>
                      </div>

                      {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
                          <span className="mr-2">❌</span>{error}
                        </div>
                      )}

                      {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-sm">
                          <span className="mr-2">✅</span>{success}
                        </div>
                      )}

                      <form onSubmit={handleReplySubmit}>
                        <div className="flex space-x-3">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows="3"
                            placeholder={`Type your reply as ${selectedMessage.celebrity_name}...`}
                            required
                          />
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-medium shadow-sm flex-shrink-0"
                          >
                            📤 Send
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Reply will be sent to {selectedMessage.sender_name} from {selectedMessage.celebrity_name}
                        </p>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-6">💬</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Select a Message to View
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Click on any message from the left panel to view the conversation
                      </p>
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-md">
                        <h4 className="font-medium text-gray-700 mb-2">📋 Available Actions:</h4>
                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                          <li>• Click messages to view conversations</li>
                          <li>• Reply to users on behalf of celebrities</li>
                          <li>• Mark messages as read/unread</li>
                          <li>• View full message history</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-blue-600 text-2xl mr-3">📨</div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Total Messages</h4>
                    <p className="text-xl font-bold text-blue-600">{messages.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-yellow-600 text-2xl mr-3">📬</div>
                  <div>
                    <h4 className="font-semibold text-yellow-900">Unread Messages</h4>
                    <p className="text-xl font-bold text-yellow-600">
                      {messages.filter(m => !m.is_read).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-green-600 text-2xl mr-3">✅</div>
                  <div>
                    <h4 className="font-semibold text-green-900">Read Messages</h4>
                    <p className="text-xl font-bold text-green-600">
                      {messages.filter(m => m.is_read).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !loading && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="user">User</option>
                          <option value="celebrity">Celebrity</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Celebrities Tab */}
        {activeTab === 'celebrities' && !loading && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manage Celebrities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {celebrities.map(celebrity => (
                <div key={celebrity.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {celebrity.profile_image && (
                      <img
                        src={celebrity.profile_image}
                        alt={celebrity.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{celebrity.name}</h3>
                      <p className="text-gray-600">{celebrity.category}</p>
                      <p className="text-sm text-gray-500">{celebrity.username} ({celebrity.email})</p>

                      <div className="mt-3 flex items-center space-x-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={celebrity.available_for_booking}
                            onChange={(e) => toggleCelebrityAvailability(celebrity.id, e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm">Available for booking</span>
                        </label>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          Joined: {new Date(celebrity.created_at).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleDeleteCelebrity(celebrity)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition duration-200 flex items-center space-x-1"
                          title="Delete Celebrity"
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && !loading && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Admin Profile & Security</h2>

            {/* Admin Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Created</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">🔐 Change Admin Password</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="text-yellow-600 mr-2">⚠️</div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Changing your password requires the admin secret key for additional security.
                      This action will be logged for security purposes.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Secret Key *
                  </label>
                  <input
                    type="password"
                    name="secretKey"
                    value={passwordForm.secretKey}
                    onChange={handlePasswordFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter admin secret key"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter new password (min 6 chars)"
                      required
                      minLength="6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Confirm new password"
                      required
                      minLength="6"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Delete Celebrity Confirmation Modal */}
      {showDeleteConfirm && celebrityToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="text-red-600 text-3xl mr-3">⚠️</div>
              <h3 className="text-lg font-semibold text-red-600">Delete Celebrity</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong>{celebrityToDelete.name}</strong>?
                This action cannot be undone and will permanently remove:
              </p>

              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 bg-red-50 p-3 rounded">
                <li>The celebrity profile and account</li>
                <li>All appointments with this celebrity</li>
                <li>All messages to/from this celebrity</li>
                <li>All notifications related to this celebrity</li>
                <li>The associated user account ({celebrityToDelete.username})</li>
              </ul>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This will affect all users who have interacted with this celebrity.
                  Their appointment history and messages will be permanently lost.
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={cancelDeleteCelebrity}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCelebrity}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Delete Forever</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
