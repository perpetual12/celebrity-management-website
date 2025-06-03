import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PublicHome = () => {
  const [featuredCelebrities, setFeaturedCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCelebrities();
  }, []);

  const fetchFeaturedCelebrities = async () => {
    try {
      const response = await axios.get('/celebrities');
      // Get first 3 celebrities as featured
      setFeaturedCelebrities(response.data.slice(0, 3));
    } catch (err) {
      console.error('Error fetching celebrities:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Connect with Your Favorite Celebrities</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join Celebrity Connect and get exclusive access to book appointments, send direct messages, 
            and create unforgettable experiences with the stars you admire most.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold transition duration-300 text-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/celebrities"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-indigo-600 font-semibold transition duration-300 text-lg"
            >
              Browse Celebrities
            </Link>
          </div>
          <div className="mt-6">
            <Link
              to="/login"
              className="text-indigo-200 hover:text-white underline"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Celebrity Connect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-indigo-600 text-5xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-3">Book Exclusive Appointments</h3>
              <p className="text-gray-600">Schedule one-on-one meetings, virtual calls, or in-person meet-and-greets with your favorite celebrities.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-indigo-600 text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-3">Direct Messaging</h3>
              <p className="text-gray-600">Send personal messages and receive authentic responses directly from celebrities.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-indigo-600 text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-3">Exclusive Access</h3>
              <p className="text-gray-600">Get behind-the-scenes content, early access to events, and exclusive celebrity updates.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Celebrities Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Celebrities</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⭐</div>
              <div className="text-xl text-gray-600">Loading amazing celebrities...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {featuredCelebrities.map(celebrity => (
                  <div key={celebrity.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                    {celebrity.profile_image && (
                      <img
                        src={celebrity.profile_image}
                        alt={celebrity.name}
                        className="w-full h-64 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{celebrity.name}</h3>
                      <p className="text-indigo-600 mb-3 font-medium">{celebrity.category}</p>
                      <p className="text-gray-600 mb-4 line-clamp-3">{celebrity.bio}</p>
                      <Link
                        to="/register"
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300 inline-block"
                      >
                        Connect Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link
                  to="/celebrities"
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 text-lg font-semibold"
                >
                  View All Celebrities
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect with Your Favorite Stars?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of fans who are already connecting with celebrities through Celebrity Connect.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold transition duration-300 text-lg"
            >
              Start Your Journey
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-indigo-600 font-semibold transition duration-300 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">500+</div>
              <div className="text-gray-600">Celebrities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Fans</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">25K+</div>
              <div className="text-gray-600">Connections Made</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">99%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicHome;
