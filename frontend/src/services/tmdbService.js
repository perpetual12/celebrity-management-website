import axios from 'axios';

class WikipediaFrontendService {
  constructor() {
    this.baseURL = '/api/tmdb'; // Keep same endpoint for now
  }

  // Get popular celebrities
  async getPopularCelebrities(page = 1) {
    try {
      console.log('🔍 Frontend: Fetching popular celebrities, page:', page);
      console.log('🔍 Frontend: Making request to:', `${this.baseURL}/popular`);
      console.log('🔍 Frontend: Full URL:', `${window.location.origin}${this.baseURL}/popular`);

      const response = await axios.get(`${this.baseURL}/popular`, {
        params: { page },
        timeout: 10000 // 10 second timeout
      });

      console.log('✅ Frontend: API response received:', response.data);
      console.log('✅ Frontend: Response status:', response.status);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Frontend: Error fetching popular celebrities:', error);
      console.error('❌ Frontend: Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });

      // More specific error messages
      let errorMessage = 'Failed to fetch celebrities';
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 5001.';
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check the backend routes.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please check the backend logs.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Search celebrities
  async searchCelebrities(query, page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: { q: query, page }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error searching celebrities:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to search celebrities'
      };
    }
  }

  // Get trending celebrities
  async getTrendingCelebrities(timeWindow = 'week') {
    try {
      const response = await axios.get(`${this.baseURL}/trending`, {
        params: { time_window: timeWindow }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching trending celebrities:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch trending celebrities'
      };
    }
  }

  // Get celebrity details
  async getCelebrityDetails(tmdbId) {
    try {
      const response = await axios.get(`${this.baseURL}/celebrity/${tmdbId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching celebrity details:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch celebrity details'
      };
    }
  }

  // Get celebrity images
  async getCelebrityImages(tmdbId) {
    try {
      const response = await axios.get(`${this.baseURL}/celebrity/${tmdbId}/images`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching celebrity images:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch celebrity images'
      };
    }
  }

  // Get categories
  async getCategories() {
    try {
      const response = await axios.get(`${this.baseURL}/categories`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch categories'
      };
    }
  }

  // Check API status
  async getAPIStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/status`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error checking API status:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to check API status'
      };
    }
  }

  // Format celebrity for display
  formatCelebrityForDisplay(celebrity) {
    return {
      id: celebrity.tmdbId,
      name: celebrity.name,
      image: celebrity.profileImage || '/placeholder-celebrity.jpg',
      bio: celebrity.biography || `${celebrity.name} is known for ${celebrity.knownFor}.`,
      category: celebrity.knownFor || 'Entertainment',
      popularity: celebrity.popularity,
      knownForMovies: celebrity.knownForMovies || [],
      gender: celebrity.gender,
      birthday: celebrity.birthday,
      placeOfBirth: celebrity.placeOfBirth,
      homepage: celebrity.homepage,
      isTMDbCelebrity: true
    };
  }

  // Get placeholder image for failed loads
  getPlaceholderImage() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEyNy45MSAxMDAgMTEwIDExNy45MSAxMTAgMTQwQzExMCAxNjIuMDkgMTI3LjkxIDE4MCAxNTAgMTgwQzE3Mi4wOSAxODAgMTkwIDE2Mi4wOSAxOTAgMTQwQzE5MCAxMTcuOTEgMTcyLjA5IDEwMCAxNTAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjEwIDIyMEMxOTUgMjAwIDE3NSAxOTAgMTUwIDE5MEMxMjUgMTkwIDEwNSAyMDAgOTAgMjIwVjI0MEgyMTBWMjIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  }
}

export default new WikipediaFrontendService();
