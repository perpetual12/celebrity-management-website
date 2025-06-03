import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CelebrityList = () => {
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('popular'); // 'popular', 'trending', 'local'

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all celebrities from our database
      console.log(`🔍 Fetching ${activeTab} celebrities...`);
      const response = await axios.get('/api/celebrities', {
        withCredentials: true
      });
      console.log('✅ Celebrities response:', response.data);

      let filteredCelebrities = response.data;

      if (activeTab === 'popular') {
        // Show celebrities sorted by name (alphabetical) for popular
        filteredCelebrities = [...response.data].sort((a, b) => a.name.localeCompare(b.name));
        console.log('📊 Popular celebrities (alphabetical):', filteredCelebrities.length);
      } else if (activeTab === 'trending') {
        // Show celebrities sorted by creation date (newest first) for trending
        filteredCelebrities = [...response.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        console.log('📈 Trending celebrities (newest first):', filteredCelebrities.length);
      } else if (activeTab === 'local') {
        // Show all celebrities as-is for local
        console.log('🏠 Local celebrities:', filteredCelebrities.length);
      }

      setCelebrities(filteredCelebrities);
    } catch (err) {
      console.error('❌ Error fetching celebrities:', err);
      setError('Failed to fetch celebrities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Searching celebrities for:', searchQuery);
      const response = await axios.get('/api/celebrities', {
        withCredentials: true
      });

      // Filter celebrities based on search query
      const filteredCelebrities = response.data.filter(celebrity =>
        celebrity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        celebrity.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        celebrity.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );

      console.log('✅ Search results:', filteredCelebrities);
      setCelebrities(filteredCelebrities);
      setActiveTab('search');
    } catch (err) {
      setError('Failed to search celebrities');
      console.error('Error searching celebrities:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayCelebrities = celebrities;

  // Debug logging
  console.log('🎭 Component state:', {
    activeTab,
    loading,
    error,
    celebritiesCount: celebrities.length,
    displayCelebritiesCount: displayCelebrities.length,
    displayCelebrities: displayCelebrities.slice(0, 2) // Show first 2 for debugging
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Browse Celebrities</h1>
        <p className="text-gray-600">Discover amazing celebrities from around the world</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search for celebrities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            🔍 Search
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'popular', label: 'Popular', icon: '🔥' },
              { id: 'trending', label: 'Trending', icon: '📈' },
              { id: 'local', label: 'Local Celebrities', icon: '🏠' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition duration-300 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">❌</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && searchQuery && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            <span className="font-semibold">Search results for:</span> "{searchQuery}"
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading celebrities...</p>
        </div>
      ) : (
        <>
          {displayCelebrities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No celebrities found</h3>
              <p className="text-gray-600">
                {activeTab === 'search'
                  ? `No results found for "${searchQuery}". Try a different search term.`
                  : 'No celebrities available in this category.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Celebrity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {displayCelebrities.map(celebrity => (
                  <div key={celebrity.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                    <div className="relative">
                      <img
                        src={celebrity.profileImage || celebrity.image || 'https://via.placeholder.com/400x400/4A90E2/ffffff?text=Celebrity'}
                        alt={celebrity.name}
                        className="w-full h-64 object-cover"
                        onLoad={() => {
                          console.log(`✅ Image loaded for ${celebrity.name}: ${celebrity.profileImage}`);
                        }}
                        onError={(e) => {
                          console.log(`❌ Image failed for ${celebrity.name}: ${celebrity.profileImage}`);
                          e.target.src = 'https://via.placeholder.com/400x400/4A90E2/ffffff?text=Celebrity';
                        }}
                      />
                      {celebrity.popularity && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          ⭐ {Math.round(celebrity.popularity)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-bold mb-2 line-clamp-1">{celebrity.name}</h2>
                      <p className="text-indigo-600 text-sm mb-2 font-medium">
                        {celebrity.knownFor || celebrity.category || 'Entertainment'}
                      </p>

                      {/* Known For Movies (TMDb only) */}
                      {celebrity.knownForMovies && celebrity.knownForMovies.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Known for:</p>
                          <div className="flex flex-wrap gap-1">
                            {celebrity.knownForMovies.slice(0, 2).map((movie, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {movie}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4">
                        {/* Status for celebrities */}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          celebrity.availableForBooking
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {celebrity.availableForBooking ? 'Available' : 'Unavailable'}
                        </span>

                        <Link
                          to={`/celebrities/${celebrity.id}`}
                          className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 transition duration-300"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


            </>
          )}
        </>
      )}
    </div>
  );
};

export default CelebrityList;
