import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminMessages = ({ user, setUser }) => {
  const [userMessages, setUserMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserMessages();
  }, []);

  const fetchUserMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/admin/messages', {
        withCredentials: true
      });
      const messages = response.data;

      // Group messages by user
      const userGroups = {};
      messages.forEach(message => {
        const userId = message.sender_id;
        if (!userGroups[userId]) {
          userGroups[userId] = {
            userId: userId,
            userName: message.sender_name,
            userEmail: message.sender_email,
            messages: [],
            unreadCount: 0,
            lastMessageDate: null
          };
        }
        userGroups[userId].messages.push(message);
        if (!message.is_read) {
          userGroups[userId].unreadCount++;
        }

        // Update last message date
        const messageDate = new Date(message.created_at);
        if (!userGroups[userId].lastMessageDate || messageDate > userGroups[userId].lastMessageDate) {
          userGroups[userId].lastMessageDate = messageDate;
        }
      });

      // Convert to array and sort by last message date
      const userArray = Object.values(userGroups).sort((a, b) =>
        new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
      );

      setUserMessages(userArray);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Messages fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalUnreadCount = () => {
    return userMessages.reduce((total, user) => total + user.unreadCount, 0);
  };

  return (
    <AdminLayout user={user} setUser={setUser}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">📨 User Messages Overview</h1>
                <p className="text-purple-200 text-lg">View all users who have sent messages</p>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{userMessages.length}</div>
                  <div className="text-purple-200 text-sm">Total Users</div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">👥</div>
                  <div>
                    <div className="text-xl font-bold">{userMessages.length}</div>
                    <div className="text-purple-200 text-sm">Active Users</div>
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">📬</div>
                  <div>
                    <div className="text-xl font-bold">{getTotalUnreadCount()}</div>
                    <div className="text-purple-200 text-sm">Unread Messages</div>
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">💬</div>
                  <div>
                    <div className="text-xl font-bold">
                      {userMessages.reduce((total, user) => total + user.messages.length, 0)}
                    </div>
                    <div className="text-purple-200 text-sm">Total Messages</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-600 text-lg">Loading user messages...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xl mr-2">❌</span>
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* User List */}
          {!loading && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Users with Messages</h2>
                <p className="text-gray-600">Click "Reply Chats" to manage conversations with each user</p>
              </div>

              {userMessages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6">📭</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No Messages Yet</h3>
                  <p className="text-gray-500 text-lg">No users have sent messages to celebrities</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userMessages.map(userGroup => (
                    <div
                      key={userGroup.userId}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition duration-300"
                    >
                      {/* User Info */}
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                          {userGroup.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{userGroup.userName}</h3>
                          <p className="text-sm text-gray-600">{userGroup.userEmail}</p>
                        </div>
                        {userGroup.unreadCount > 0 && (
                          <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                            {userGroup.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* Message Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-blue-600">{userGroup.messages.length}</div>
                          <div className="text-xs text-blue-500">Total Messages</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-yellow-600">{userGroup.unreadCount}</div>
                          <div className="text-xs text-yellow-500">Unread</div>
                        </div>
                      </div>

                      {/* Last Message Info */}
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-1">Last Message:</div>
                        <div className="text-sm text-gray-700">
                          {userGroup.lastMessageDate.toLocaleDateString()} at {userGroup.lastMessageDate.toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        to="/admin?tab=messages"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-300 font-medium text-center block"
                      >
                        💬 Reply Chats
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
