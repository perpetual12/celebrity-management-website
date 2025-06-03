import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = ({ user }) => {
  const [featuredCelebrities, setFeaturedCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCelebrities = async () => {
      try {
        const res = await axios.get('/api/celebrities', {
          withCredentials: true
        });
        // Get first 4 celebrities for featured section
        setFeaturedCelebrities(res.data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching featured celebrities', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCelebrities();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12 mb-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Welcome to Celebrity Connect</h1>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto">
            Connect with your favorite celebrities through appointments and direct messaging.
            Book exclusive meet-and-greets, get personalized messages, and create unforgettable experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/celebrities"
              className="bg-white text-indigo-600 px-6 sm:px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold transition duration-300"
            >
              Browse Celebrities
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-white hover:text-indigo-600 font-semibold transition duration-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-indigo-600 font-semibold transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-semibold transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-indigo-600 text-4xl mb-4">📅</div>
          <h3 className="text-xl font-semibold mb-2">Book Appointments</h3>
          <p className="text-gray-600">Schedule exclusive meet-and-greets with your favorite celebrities</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-indigo-600 text-4xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
          <p className="text-gray-600">Send personal messages and get responses from celebrities</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-indigo-600 text-4xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold mb-2">Exclusive Access</h3>
          <p className="text-gray-600">Get access to exclusive content and behind-the-scenes moments</p>
        </div>
      </div>

      {/* Featured Celebrities Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Celebrities</h2>
        {loading ? (
          <div className="text-center py-8">Loading featured celebrities...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCelebrities.map(celebrity => (
              <div key={celebrity.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                {(celebrity.profileImage || celebrity.profile_image) && (
                  <img
                    src={celebrity.profileImage || celebrity.profile_image}
                    alt={celebrity.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400/4A90E2/ffffff?text=Celebrity';
                    }}
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{celebrity.name}</h3>
                  <p className="text-indigo-600 mb-2">{celebrity.category}</p>
                  <p className="text-gray-600 mb-4 line-clamp-2">{celebrity.bio}</p>
                  <Link
                    to={`/celebrities/${celebrity.id}`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link
            to="/celebrities"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            View All Celebrities
          </Link>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Connect?</h2>
        <p className="text-lg sm:text-xl text-gray-600 mb-6">
          {user
            ? "Explore more celebrities and start connecting!"
            : "Join thousands of fans who are already connecting with their favorite celebrities"
          }
        </p>
        {user ? (
          <Link
            to="/celebrities"
            className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-indigo-700 font-semibold transition duration-300"
          >
            Explore Celebrities
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-indigo-700 font-semibold transition duration-300"
            >
              Get Started Today
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-indigo-600 text-indigo-600 px-6 sm:px-8 py-3 rounded-lg hover:bg-indigo-600 hover:text-white font-semibold transition duration-300"
            >
              Already have an account?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
