import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Go to Homepage
          </Link>
          <Link
            to="/celebrities"
            className="block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Browse Celebrities
          </Link>
          <button
            onClick={() => window.history.back()}
            className="block w-full text-indigo-600 hover:text-indigo-800 text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
