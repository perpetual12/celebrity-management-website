import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const CelebrityProfile = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [celebrity, setCelebrity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [messageForm, setMessageForm] = useState({
    content: ''
  });
  
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    purpose: ''
  });

  useEffect(() => {
    const fetchCelebrity = async () => {
      try {
        console.log('🔍 Fetching celebrity with ID:', id);

        // First try to fetch from local database
        try {
          const res = await axios.get(`/api/celebrities/${id}`, {
            withCredentials: true
          });
          console.log('✅ Found local celebrity:', res.data);
          setCelebrity(res.data);
          return;
        } catch (localErr) {
          console.log('❌ Celebrity not found');
          throw new Error('Celebrity not found');
        }
      } catch (err) {
        console.error('Error fetching celebrity:', err);
        setError('Failed to load celebrity profile');
      } finally {
        setLoading(false);
      }
    };

    fetchCelebrity();
  }, [id]);

  const handleMessageChange = (e) => {
    setMessageForm({
      ...messageForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAppointmentChange = (e) => {
    setAppointmentForm({
      ...appointmentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      console.log('💬 Sending message to celebrity:', celebrity.name);
      console.log('💬 User:', user.username);
      console.log('💬 Message data:', { content: messageForm.content, celebrityId: celebrity.id });

      const messageData = {
        content: messageForm.content,
        celebrityId: celebrity.id
      };

      const response = await axios.post('/api/messages', messageData, {
        withCredentials: true
      });

      console.log('✅ Message sent successfully:', response.data);
      setSuccess('Message sent successfully!');
      setMessageForm({ content: '' });
      setError('');
    } catch (err) {
      console.error('❌ Message sending failed:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to send message');
      setSuccess('');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      console.log('📅 Booking appointment with celebrity:', celebrity.name);
      console.log('📅 User:', user.username);
      console.log('📅 Appointment data:', { date: appointmentForm.date, purpose: appointmentForm.purpose, celebrityId: celebrity.id });

      const appointmentData = {
        date: appointmentForm.date,
        purpose: appointmentForm.purpose,
        celebrityId: celebrity.id
      };

      const response = await axios.post('/api/appointments', appointmentData, {
        withCredentials: true
      });

      console.log('✅ Appointment booked successfully:', response.data);
      setSuccess('Appointment request sent successfully!');
      setAppointmentForm({ date: '', purpose: '' });
      setError('');
    } catch (err) {
      console.error('❌ Appointment booking failed:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to book appointment');
      setSuccess('');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!celebrity) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">Celebrity not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/celebrities')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition duration-300"
        >
          <span className="mr-2">←</span>
          <span>Back to Celebrities</span>
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6 flex items-center">
          <span className="mr-2">❌</span>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6 flex items-center">
          <span className="mr-2">✅</span>
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Celebrity Image */}
            <div className="relative">
              {(celebrity.profileImage || celebrity.profile_image) && (
                <div className="h-80 bg-gray-100 flex items-center justify-center">
                  <img
                    src={celebrity.profileImage || celebrity.profile_image}
                    alt={celebrity.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400/4A90E2/ffffff?text=Celebrity';
                    }}
                  />
                </div>
              )}

              {/* Celebrity Type Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  🏠 Local Celebrity
                </span>
              </div>
            </div>

            <div className="p-8">
              {/* Celebrity Name and Category */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{celebrity.name}</h1>
                <p className="text-xl text-indigo-600 font-medium">
                  {celebrity.category || celebrity.knownFor || 'Celebrity'}
                </p>


              </div>

              {/* Biography */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Biography</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {celebrity.biography || celebrity.bio || 'Biography not available.'}
                  </p>
                </div>
              </div>



              {/* Availability Status */}
              <div className="flex items-center">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  celebrity.available_for_booking || celebrity.availableForBooking
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {(celebrity.available_for_booking || celebrity.availableForBooking) ? '✅ Available for Booking' : '❌ Not Available for Booking'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Booking Form - Available for all celebrities when logged in */}
          {user && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">📅</span>
                <h2 className="text-xl font-bold text-gray-900">Book an Appointment</h2>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                    Preferred Date and Time
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    id="date"
                    type="datetime-local"
                    name="date"
                    value={appointmentForm.date}
                    onChange={handleAppointmentChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="purpose">
                    Purpose of Meeting
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    id="purpose"
                    name="purpose"
                    rows="4"
                    placeholder="Please describe the purpose of your appointment (e.g., interview, collaboration, event appearance)..."
                    value={appointmentForm.purpose}
                    onChange={handleAppointmentChange}
                    required
                  ></textarea>
                </div>

                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  type="submit"
                >
                  📅 Request Appointment
                </button>
              </form>
            </div>
          )}

          {/* Message Form - Available for all celebrities when logged in */}
          {user && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">💬</span>
                <h2 className="text-xl font-bold text-gray-900">Send a Message</h2>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                    Your Message
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    id="content"
                    name="content"
                    rows="5"
                    placeholder="Write your message here..."
                    value={messageForm.content}
                    onChange={handleMessageChange}
                    required
                  ></textarea>
                </div>

                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  type="submit"
                >
                  💬 Send Message
                </button>
              </form>
            </div>
          )}



          {/* Login Prompt */}
          {!user && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 text-center border border-gray-200">
              <div className="mb-4">
                <span className="text-4xl">🔐</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-600 mb-6">
                Please log in to book appointments and send messages
              </p>
              <Link
                to="/login"
                className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 font-medium"
              >
                <span className="mr-2">🚪</span>
                Login to Continue
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CelebrityProfile;

