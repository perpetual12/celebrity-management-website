import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Messages = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log('🔍 Fetching user messages...');
        const res = await axios.get('/api/messages/my-messages', {
          withCredentials: true
        });
        console.log('✅ Messages response:', res.data);
        setMessages(res.data);
      } catch (err) {
        console.error('❌ Error fetching messages:', err);
        if (err.response?.status === 401) {
          setError('Please log in to view messages');
        } else {
          setError('Failed to load messages');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMessages();
    } else {
      setLoading(false);
      setError('Please log in to view messages');
    }
  }, [user]);

  // Removed reply functionality - only admins can respond to messages

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`/api/messages/${messageId}/read`, {}, {
        withCredentials: true
      });

      // Update local state
      setMessages(messages.map(message =>
        message.id === messageId ? { ...message, isRead: true } : message
      ));
    } catch (err) {
      console.error('Error marking message as read', err);
    }
  };

  const markConversationAsRead = async (celebrityId) => {
    try {
      await axios.put(`/api/messages/conversation/${celebrityId}/mark-read`, {}, {
        withCredentials: true
      });

      // Update local state - mark conversation as read
      setMessages(messages.map(message =>
        message.conversationId === celebrityId
          ? { ...message, hasUnreadReplies: false, isRead: true }
          : message
      ));
    } catch (err) {
      console.error('Error marking conversation as read', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      {/* Info message about admin-only responses */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
        <div className="flex items-center">
          <div className="text-blue-600 mr-2">ℹ️</div>
          <div>
            <strong>Note:</strong>
            {user?.role === 'celebrity'
              ? ' Message responses are handled by our admin team. You will receive notifications about responses.'
              : ' You can send messages to celebrities. Responses are handled by our admin team.'
            }
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No messages found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-indigo-600 text-white">
              <h2 className="font-bold">Conversations</h2>
            </div>
            
            <div className="divide-y">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedMessage?.id === message.id ? 'bg-indigo-50' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    // Mark conversation as read if user has unread replies
                    if (user.role !== 'celebrity' && message.hasUnreadReplies) {
                      markConversationAsRead(message.conversationId);
                    } else if (user.role === 'celebrity' && !message.isRead) {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {user.role === 'celebrity'
                          ? message.sender.username
                          : message.receiver.name
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {/* Show unread indicator for celebrities or users with unread replies */}
                    {((user.role === 'celebrity' && !message.isRead) ||
                      (user.role !== 'celebrity' && message.hasUnreadReplies)) && (
                      <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                        {user.role === 'celebrity' ? 'New' : 'Reply'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                    {message.content}
                  </p>
                  {/* Show message count for conversations */}
                  {message.messages && message.messages.length > 1 && (
                    <p className="text-xs text-indigo-600 mt-1">
                      {message.messages.length} messages in conversation
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
                <div className="p-4 bg-indigo-600 text-white">
                  <h2 className="font-bold">
                    {user.role === 'celebrity' 
                      ? `Conversation with ${selectedMessage.sender.username}`
                      : `Conversation with ${selectedMessage.receiver.name}`
                    }
                  </h2>
                </div>
                
                <div className="p-4 flex-grow overflow-y-auto">
                  {selectedMessage.messages ? (
                    // Show full conversation with multiple messages
                    <div className="space-y-4">
                      {selectedMessage.messages.map((msg, index) => (
                        <div key={msg.id} className={`flex ${msg.messageType === 'sent' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-3/4 rounded-lg p-3 ${
                            msg.messageType === 'sent'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              msg.messageType === 'sent' ? 'text-indigo-200' : 'text-gray-500'
                            }`}>
                              {msg.messageType === 'sent' ? 'You' : selectedMessage.receiver.name} • {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}

                      {selectedMessage.hasUnreadReplies && (
                        <div className="text-center">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            ✨ New replies available!
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Fallback for single message display
                    <div className="mb-4">
                      <div className="flex items-start mb-2">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-3/4">
                          <p className="text-sm">{selectedMessage.content}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t bg-gray-50">
                  <div className="text-center text-gray-600">
                    <p className="text-sm">💬 Responses are handled by our admin team</p>
                    <p className="text-xs mt-1">You will be notified when there are updates</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center h-full flex items-center justify-center">
                <p className="text-gray-600">Select a conversation to view messages.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
