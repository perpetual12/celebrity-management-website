import { Router } from 'express';
import wikipediaService from '../services/wikipediaService.js';

const router = Router();

// Get popular celebrities
router.get('/popular', async (req, res) => {
  try {
    console.log('📡 Fetching popular celebrities...');
    console.log('API Key available:', !!process.env.TMDB_API_KEY);

    const page = parseInt(req.query.page) || 1;
    const result = await wikipediaService.getPopularCelebrities(page);

    console.log('Wikipedia Result:', { success: result.success, dataLength: result.data?.length, error: result.error });

    if (result.success) {
      res.json({
        celebrities: result.data,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          hasNextPage: result.currentPage < result.totalPages,
          hasPrevPage: result.currentPage > 1
        }
      });
    } else {
      console.error('Wikipedia API Error:', result.error);
      res.status(500).json({ error: result.error || 'Failed to fetch celebrities from Wikipedia' });
    }
  } catch (error) {
    console.error('Error in /popular route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search celebrities
router.get('/search', async (req, res) => {
  try {
    const { q: query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await wikipediaService.searchCelebrities(query, parseInt(page));
    
    if (result.success) {
      res.json({
        celebrities: result.data,
        query: query,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          hasNextPage: result.currentPage < result.totalPages,
          hasPrevPage: result.currentPage > 1
        }
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in /search route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get trending celebrities
router.get('/trending', async (req, res) => {
  try {
    const timeWindow = req.query.time_window || 'week'; // 'day' or 'week'
    const result = await wikipediaService.getTrendingCelebrities(timeWindow);
    
    if (result.success) {
      res.json({
        celebrities: result.data,
        timeWindow: timeWindow
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in /trending route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get celebrity details
router.get('/celebrity/:tmdbId', async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const result = await wikipediaService.getCelebrityDetails(tmdbId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in /celebrity/:tmdbId route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get celebrity images
router.get('/celebrity/:tmdbId/images', async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const result = await wikipediaService.getCelebrityImages(tmdbId);
    
    if (result.success) {
      res.json({ images: result.data });
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in /celebrity/:tmdbId/images route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get API status (for debugging)
router.get('/status', async (req, res) => {
  try {
    console.log('🔍 Checking Wikipedia API status...');
    console.log('No API Key needed for Wikipedia! ✅');

    const status = await wikipediaService.getAPIStatus();
    console.log('Wikipedia API Status:', status);

    res.json(status);
  } catch (error) {
    console.error('Error in /status route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories/departments
router.get('/categories', (req, res) => {
  res.json({
    categories: [
      { id: 'acting', name: 'Acting', icon: '🎭' },
      { id: 'directing', name: 'Directing', icon: '🎬' },
      { id: 'writing', name: 'Writing', icon: '✍️' },
      { id: 'production', name: 'Production', icon: '🎪' },
      { id: 'sound', name: 'Sound', icon: '🎵' },
      { id: 'camera', name: 'Camera', icon: '📷' },
      { id: 'editing', name: 'Editing', icon: '✂️' },
      { id: 'art', name: 'Art', icon: '🎨' }
    ]
  });
});

export default router;
