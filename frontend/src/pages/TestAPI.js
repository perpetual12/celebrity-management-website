import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestAPI = ({ user }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuth = async () => {
    setLoading(true);
    addResult('Testing authentication...');
    
    try {
      const response = await axios.get('/users/me');
      addResult(`✅ Auth successful: ${response.data.username} (${response.data.role})`);
    } catch (err) {
      addResult(`❌ Auth failed: ${err.response?.data?.error || err.message}`);
    }
    
    setLoading(false);
  };

  const testMessages = async () => {
    setLoading(true);
    addResult('Testing messages API...');
    
    try {
      const response = await axios.get('/messages/my-messages');
      addResult(`✅ Messages successful: ${response.data.length} conversations`);
      addResult(`Data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err) {
      addResult(`❌ Messages failed: ${err.response?.data?.error || err.message}`);
    }
    
    setLoading(false);
  };

  const testAppointments = async () => {
    setLoading(true);
    addResult('Testing appointments API...');
    
    try {
      const response = await axios.get('/appointments/my-appointments');
      addResult(`✅ Appointments successful: ${response.data.length} appointments`);
      addResult(`Data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err) {
      addResult(`❌ Appointments failed: ${err.response?.data?.error || err.message}`);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    addResult(`Component loaded with user: ${user ? user.username : 'null'}`);
    if (user) {
      testAuth();
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">User Info:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {user ? JSON.stringify(user, null, 2) : 'No user'}
        </pre>
      </div>

      <div className="mb-6 space-x-4">
        <button 
          onClick={testAuth}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Auth
        </button>
        <button 
          onClick={testMessages}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Messages
        </button>
        <button 
          onClick={testAppointments}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Appointments
        </button>
        <button 
          onClick={() => setResults([])}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
        <h3 className="text-white mb-2">Console Output:</h3>
        {results.map((result, index) => (
          <div key={index} className="mb-1">
            {result}
          </div>
        ))}
        {loading && <div className="text-yellow-400">Loading...</div>}
      </div>
    </div>
  );
};

export default TestAPI;
