import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications/my-notifications', {
        withCredentials: true
      });
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        withCredentials: true
      });
      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read', {}, {
        withCredentials: true
      });
      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true
      })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'welcome':
        return '🎉';
      case 'appointment_status':
        return '📅';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type, isRead) => {
    const baseColor = isRead ? 'bg-gray-50' : 'bg-blue-50';
    const borderColor = isRead ? 'border-gray-200' : 'border-blue-200';
    return `${baseColor} ${borderColor}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔔</div>
            <div className="text-xl text-gray-600">Loading notifications...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your Celebrity Connect activity</p>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {notifications.filter(n => !n.isRead).length} unread notifications
            </div>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600">
              You'll receive notifications here when there are updates about your appointments or new messages.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${getNotificationColor(notification.type, notification.isRead)}`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <h3 className={`font-medium ${notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full ml-2">
                          New
                        </span>
                      )}
                    </div>
                    
                    <p className={`mt-1 ${notification.isRead ? 'text-gray-600' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Notifications are updated in real-time when appointments are approved or rejected.</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
