import React, { useState, useEffect } from 'react';
import tmdbService from '../services/tmdbService';

const TestCelebrities = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    console.log('🧪 Testing API...');
    setLoading(true);
    setError('');

    try {
      // Test direct API call
      const result = await tmdbService.getPopularCelebrities(1);
      console.log('🧪 API Result:', result);
      
      setData(result);
    } catch (err) {
      console.error('🧪 API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Celebrity API Test</h1>
      
      <button 
        onClick={testAPI}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test API
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-2">API Response:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
          
          {data.success && data.data && data.data.celebrities && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Celebrities Found: {data.data.celebrities.length}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.data.celebrities.slice(0, 6).map((celebrity, index) => (
                  <div key={index} className="border p-4 rounded">
                    <h4 className="font-bold">{celebrity.name}</h4>
                    <p className="text-sm text-gray-600">{celebrity.category}</p>
                    {celebrity.profileImage && (
                      <img 
                        src={celebrity.profileImage} 
                        alt={celebrity.name}
                        className="w-full h-32 object-cover mt-2 rounded"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEyNy45MSAxMDAgMTEwIDExNy45MSAxMTAgMTQwQzExMCAxNjIuMDkgMTI3LjkxIDE4MCAxNTAgMTgwQzE3Mi4wOSAxODAgMTkwIDE2Mi4wOSAxOTAgMTQwQzE5MCAxMTcuOTEgMTcyLjA5IDEwMCAxNTAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjEwIDIyMEMxOTUgMjAwIDE3NSAxOTAgMTUwIDE5MEMxMjUgMTkwIDEwNSAyMDAgOTAgMjIwVjI0MEgyMTBWMjIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCelebrities;
