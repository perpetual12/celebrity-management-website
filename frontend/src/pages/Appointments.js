import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Appointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log('🔍 Fetching user appointments...');
        const res = await axios.get('/api/appointments/my-appointments', {
          withCredentials: true
        });
        console.log('✅ Appointments response:', res.data);
        setAppointments(res.data);
      } catch (err) {
        console.error('❌ Error fetching appointments:', err);
        if (err.response?.status === 401) {
          setError('Please log in to view appointments');
        } else {
          setError('Failed to load appointments');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    } else {
      setLoading(false);
      setError('Please log in to view appointments');
    }
  }, [user]);

  // Removed handleUpdateStatus - only admins can update appointment status

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

      {/* Info message about admin approval */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
        <div className="flex items-center">
          <div className="text-blue-600 mr-2">ℹ️</div>
          <div>
            <strong>Note:</strong> All appointment requests require admin approval.
            {user?.role === 'celebrity' ? ' You will be notified when appointments are approved.' : ' You will be notified when your appointments are approved or rejected.'}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      

      
      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No appointments found.</p>
          {user.role !== 'celebrity' && (
            <p className="mt-2">
              Browse our <a href="/celebrities" className="text-indigo-600 hover:underline">celebrities</a> to book an appointment.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table Layout (hidden on mobile) */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user.role === 'celebrity' ? 'Fan' : 'Celebrity'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map(appointment => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.role === 'celebrity' ? (
                          <div>
                            <div className="font-medium text-gray-900">{appointment.User.username}</div>
                            <div className="text-gray-500">{appointment.User.email}</div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            {appointment.Celebrity.profileImage && (
                              <img
                                src={appointment.Celebrity.profileImage}
                                alt={appointment.Celebrity.name}
                                className="h-10 w-10 rounded-full mr-3 object-cover"
                              />
                            )}
                            <div className="font-medium text-gray-900">{appointment.Celebrity.name}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(appointment.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="line-clamp-2">{appointment.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      {appointment.status === 'pending' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Waiting for admin approval
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (visible only on mobile/tablet) */}
          <div className="md:hidden space-y-4">
            {appointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-md p-4">
                {/* Mobile responsive layout */}
                <div className="flex flex-col space-y-3">
                  {/* Person Info */}
                  <div className="flex items-center">
                    {user.role === 'celebrity' ? (
                      <div>
                        <div className="font-medium text-gray-900">{appointment.User.username}</div>
                        <div className="text-sm text-gray-500">{appointment.User.email}</div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {appointment.Celebrity.profileImage && (
                          <img
                            src={appointment.Celebrity.profileImage}
                            alt={appointment.Celebrity.name}
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{appointment.Celebrity.name}</div>
                          <div className="text-sm text-gray-500">{appointment.Celebrity.category}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Date & Time:</span>
                    <div className="text-sm text-gray-900">
                      {new Date(appointment.date).toLocaleDateString()} at {new Date(appointment.date).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Purpose:</span>
                    <div className="text-sm text-gray-900 mt-1">
                      {appointment.purpose}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    {appointment.status === 'pending' && (
                      <div className="text-xs text-gray-500">
                        Waiting for admin approval
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Appointments;

