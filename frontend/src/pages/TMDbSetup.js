import React, { useState, useEffect } from 'react';
import tmdbService from '../services/tmdbService';

const TMDbSetup = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    setLoading(true);
    const result = await tmdbService.getAPIStatus();
    setApiStatus(result.data || result);
    setLoading(false);
  };

  const testPopularCelebrities = async () => {
    console.log('🧪 Testing popular celebrities API...');
    setTestResult({ loading: true });

    try {
      const result = await tmdbService.getPopularCelebrities(1);
      console.log('🧪 Test result:', result);
      setTestResult(result);
    } catch (error) {
      console.error('🧪 Test error:', error);
      setTestResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">TMDb API Setup</h1>
          <p className="text-lg text-gray-600">
            Get access to thousands of real celebrities with photos and biographies
          </p>
        </div>

        {/* API Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span>Checking API status...</span>
            </div>
          ) : (
            <div className={`p-4 rounded-lg ${
              apiStatus?.working 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                <span className={`mr-2 ${apiStatus?.working ? 'text-green-600' : 'text-red-600'}`}>
                  {apiStatus?.working ? '✅' : '❌'}
                </span>
                <span className={apiStatus?.working ? 'text-green-800' : 'text-red-800'}>
                  {apiStatus?.message || 'Unknown status'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
          <div className="space-y-6">
            
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Create TMDb Account</h3>
                <p className="text-gray-600 mb-3">
                  Go to <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">themoviedb.org</a> and create a free account.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Request API Key</h3>
                <p className="text-gray-600 mb-3">
                  After logging in, go to Settings → API → Request API Key → Choose "Developer"
                </p>
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="text-sm text-gray-700">
                    <strong>Application Name:</strong> Celebrity Connect<br/>
                    <strong>Application URL:</strong> http://localhost:3000<br/>
                    <strong>Application Summary:</strong> A platform for connecting with celebrities
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Add API Key to Backend</h3>
                <p className="text-gray-600 mb-3">
                  Copy your API key and add it to your backend environment file:
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <p># In backend/.env file</p>
                  <p>TMDB_API_KEY=your_api_key_here</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Replace "your_api_key_here" with your actual API key from TMDb
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Restart Backend Server</h3>
                <p className="text-gray-600 mb-3">
                  Restart your backend server to load the new environment variable:
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <p>cd backend</p>
                  <p>node server.js</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">What You'll Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎬</span>
              <div>
                <h3 className="font-semibold">Thousands of Celebrities</h3>
                <p className="text-gray-600 text-sm">Access to popular actors, directors, and entertainment figures</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📸</span>
              <div>
                <h3 className="font-semibold">High-Quality Photos</h3>
                <p className="text-gray-600 text-sm">Professional celebrity photos in multiple resolutions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📖</span>
              <div>
                <h3 className="font-semibold">Detailed Biographies</h3>
                <p className="text-gray-600 text-sm">Comprehensive information about each celebrity</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔍</span>
              <div>
                <h3 className="font-semibold">Search & Discovery</h3>
                <p className="text-gray-600 text-sm">Search celebrities and discover trending personalities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={checkAPIStatus}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              🔄 Test API Connection
            </button>
            <button
              onClick={testPopularCelebrities}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300"
            >
              🧪 Test Popular Celebrities
            </button>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              testResult.loading
                ? 'bg-blue-50 border border-blue-200'
                : testResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
            }`}>
              {testResult.loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span>Testing popular celebrities API...</span>
                </div>
              ) : testResult.success ? (
                <div>
                  <div className="flex items-center text-green-800 mb-2">
                    <span className="mr-2">✅</span>
                    <span className="font-semibold">Popular Celebrities API Working!</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Successfully fetched {testResult.data?.celebrities?.length || 0} celebrities
                  </p>
                  {testResult.data?.celebrities?.slice(0, 3).map((celebrity, index) => (
                    <div key={index} className="text-green-600 text-xs mt-1">
                      • {celebrity.name} ({celebrity.knownFor})
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center text-red-800">
                  <span className="mr-2">❌</span>
                  <span>Error: {testResult.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> TMDb API is completely free for non-commercial use with 1,000 requests per day. 
            Perfect for development and small applications!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TMDbSetup;
