import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [celebrityProfile, setCelebrityProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📊 Fetching dashboard data for user:', user.username, 'Role:', user.role);

        // If user is a celebrity, fetch their profile
        if (user.role === 'celebrity') {
          try {
            console.log('🎭 Fetching celebrity profile...');
            const profileRes = await axios.get('/api/celebrities', {
              withCredentials: true
            });
            console.log('🎭 Celebrity profiles response:', profileRes.data);
            const profile = profileRes.data.find(c => c.username === user.username);
            console.log('🎭 Found celebrity profile:', profile);
            setCelebrityProfile(profile);
          } catch (profileErr) {
            console.error('❌ Error fetching celebrity profile:', profileErr);
          }
        }

        // Fetch appointments
        try {
          console.log('📅 Fetching appointments...');
          const appointmentsRes = await axios.get('/api/appointments/my-appointments', {
            withCredentials: true
          });
          console.log('📅 Appointments response:', appointmentsRes.data);
          setAppointments(appointmentsRes.data);
        } catch (appointmentsErr) {
          console.error('❌ Error fetching appointments:', appointmentsErr);
          setAppointments([]); // Set empty array instead of failing
        }

        // Fetch messages
        try {
          console.log('💬 Fetching messages...');
          const messagesRes = await axios.get('/api/messages/my-messages', {
            withCredentials: true
          });
          console.log('💬 Messages response:', messagesRes.data);
          setMessages(messagesRes.data);
        } catch (messagesErr) {
          console.error('❌ Error fetching messages:', messagesErr);
          setMessages([]); // Set empty array instead of failing
        }

        console.log('✅ Dashboard data fetch completed');
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setError(`Failed to load dashboard data: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}`, { status }, {
        withCredentials: true
      });
      
      // Update local state
      setAppointments(appointments.map(appointment => 
        appointment.id === id ? { ...appointment, status } : appointment
      ));
      
      setSuccess(`Appointment ${status} successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update appointment');
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleAvailability = async () => {
    try {
      await axios.put(`/api/celebrities/${celebrityProfile.id}`, {
        availableForBooking: !celebrityProfile.availableForBooking
      }, {
        withCredentials: true
      });
      
      // Update local state
      setCelebrityProfile({
        ...celebrityProfile,
        availableForBooking: !celebrityProfile.availableForBooking
      });
      
      setSuccess('Availability updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update availability');
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
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
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Welcome, {user.username}!</h2>
        <p className="mb-4">Role: {user.role}</p>
        
        {user.role === 'user' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Interested in becoming a celebrity?</h3>
            <p className="text-blue-700 text-sm">
              Celebrity accounts are created by our administrators. If you're a public figure or celebrity
              interested in joining our platform, please contact our support team for verification and approval.
            </p>
          </div>
        )}
        
        {celebrityProfile && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Your Celebrity Profile</h3>
            <div className="flex items-center mb-4">
              {celebrityProfile.profileImage && (
                <img 
                  src={celebrityProfile.profileImage} 
                  alt={celebrityProfile.name}
                  className="h-16 w-16 rounded-full mr-4 object-cover"
                />
              )}
              <div>
                <p className="font-medium">{celebrityProfile.name}</p>
                <p className="text-gray-600">{celebrityProfile.category}</p>
              </div>
            </div>
            
            <div className="flex items-center mb-4">
              <span className={`px-3 py-1 rounded-full text-sm mr-4 ${
                celebrityProfile.availableForBooking 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {celebrityProfile.availableForBooking ? 'Available for Booking' : 'Not Available for Booking'}
              </span>
              
              <button
                onClick={toggleAvailability}
                className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
              >
                Toggle Availability
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Appointments</h2>
          
          {appointments.length === 0 ? (
            <p className="text-gray-600">No appointments found.</p>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 3).map(appointment => (
                <div key={appointment.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">
                        {user.role === 'celebrity' 
                          ? `With ${appointment.User.username}`
                          : `With ${appointment.Celebrity.name}`
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  
                  {user.role === 'celebrity' && appointment.status === 'pending' && (
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, 'approved')}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, 'rejected')}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              <Link 
                to="/appointments" 
                className="text-indigo-600 hover:underline block mt-2"
              >
                View All Appointments
              </Link>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Messages</h2>
          
          {messages.length === 0 ? (
            <p className="text-gray-600">No messages found.</p>
          ) : (
            <div className="space-y-4">
              {messages.slice(0, 3).map(message => (
                <div key={message.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {user.role === 'celebrity' 
                        ? `From ${message.sender.username}`
                        : `To ${message.receiver.name}`
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {message.content}
                  </p>
                </div>
              ))}
              
              <Link 
                to="/messages" 
                className="text-indigo-600 hover:underline block mt-2"
              >
                View All Messages
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
