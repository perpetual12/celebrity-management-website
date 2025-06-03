import axios from 'axios';

class WikipediaService {
  constructor() {
    this.baseURL = 'https://en.wikipedia.org/api/rest_v1';
    this.searchURL = 'https://en.wikipedia.org/w/api.php';
    this.imageBaseURL = 'https://commons.wikimedia.org/w/api.php';

    // No API key needed for Wikipedia!
    console.log('✅ Wikipedia API service initialized - no API key required!');
  }

  // Get popular celebrities (using predefined data for instant loading)
  async getPopularCelebrities(page = 1) {
    try {
      // Predefined celebrity data for instant loading
      const popularCelebrities = [
        {
          tmdbId: 1,
          name: 'Brad Pitt',
          biography: 'William Bradley Pitt is an American actor and film producer. He has received multiple awards, including two Golden Globe Awards and an Academy Award for his acting, in addition to another Academy Award, another Golden Globe Award and a Primetime Emmy Award as producer.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Brad_Pitt_2019_by_Glenn_Francis.jpg/500px-Brad_Pitt_2019_by_Glenn_Francis.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 95,
          birthDate: 'December 18, 1963',
          nationality: 'American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 2,
          name: 'Leonardo DiCaprio',
          biography: 'Leonardo Wilhelm DiCaprio is an American actor and film producer. Known for his work in biographical and period films, he has received numerous accolades, including an Academy Award, a British Academy Film Award, and three Golden Globe Awards.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Leonardo_DiCaprio_2014.jpg/500px-Leonardo_DiCaprio_2014.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 94,
          birthDate: 'November 11, 1974',
          nationality: 'American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 3,
          name: 'Taylor Swift',
          biography: 'Taylor Alison Swift is an American singer-songwriter. Her narrative songwriting, which often centers around her personal life, has received widespread media coverage and critical praise.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_4.png/500px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_4.png',
          category: 'Music',
          knownFor: 'Music',
          popularity: 98,
          birthDate: 'December 13, 1989',
          nationality: 'American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 4,
          name: 'Elon Musk',
          biography: 'Elon Reeve Musk is a business magnate and investor. He is the founder, CEO and chief engineer of SpaceX; angel investor, CEO and product architect of Tesla, Inc.; and owner and CTO of Twitter.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/500px-Elon_Musk_Royal_Society_%28crop2%29.jpg',
          category: 'Business',
          knownFor: 'Business',
          popularity: 96,
          birthDate: 'June 28, 1971',
          nationality: 'South African-American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 5,
          name: 'Scarlett Johansson',
          biography: 'Scarlett Ingrid Johansson is an American actress. The world\'s highest-paid actress in 2018 and 2019, she has featured multiple times on the Forbes Celebrity 100 list.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg/500px-Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 92,
          birthDate: 'November 22, 1984',
          nationality: 'American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 6,
          name: 'Cristiano Ronaldo',
          biography: 'Cristiano Ronaldo dos Santos Aveiro is a Portuguese professional footballer who plays as a forward for and captains both Saudi Professional League club Al Nassr and the Portugal national team.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/500px-Cristiano_Ronaldo_2018.jpg',
          category: 'Sports',
          knownFor: 'Sports',
          popularity: 97,
          birthDate: 'February 5, 1985',
          nationality: 'Portuguese',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 7,
          name: 'Emma Watson',
          biography: 'Emma Charlotte Duerre Watson is an English actress and activist. Known for her roles in both blockbusters and independent films, as well as for her women\'s rights work.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Emma_Watson_2013.jpg/500px-Emma_Watson_2013.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 89,
          birthDate: 'April 15, 1990',
          nationality: 'British',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 8,
          name: 'Dwayne Johnson',
          biography: 'Dwayne Douglas Johnson, also known by his ring name The Rock, is an American actor and former professional wrestler. Widely regarded as one of the greatest professional wrestlers of all time.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Dwayne_Johnson_2014_%28cropped%29.jpg/500px-Dwayne_Johnson_2014_%28cropped%29.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 93,
          birthDate: 'May 2, 1972',
          nationality: 'American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 9,
          name: 'Beyoncé',
          biography: 'Beyoncé Giselle Knowles-Carter is an American singer, songwriter, and businesswoman. Known as "Queen B", she has been widely recognized for her boundary-pushing artistry and vocal ability.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Beyonce_-_The_Formation_World_Tour%2C_at_Wembley_Stadium_in_London%2C_England.jpg/500px-Beyonce_-_The_Formation_World_Tour%2C_at_Wembley_Stadium_in_London%2C_England.jpg',
          category: 'Music',
          knownFor: 'Music',
          popularity: 95,
          birthDate: 'September 4, 1981',
          nationality: 'American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 10,
          name: 'Tom Cruise',
          biography: 'Thomas Cruise Mapother IV is an American actor and producer. One of the world\'s highest-paid actors, he has received various accolades, including an Honorary Palme d\'Or and three Golden Globe Awards.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Tom_Cruise_by_Gage_Skidmore_2.jpg/500px-Tom_Cruise_by_Gage_Skidmore_2.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 91,
          birthDate: 'July 3, 1962',
          nationality: 'American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 11,
          name: 'Zendaya',
          biography: 'Zendaya Maree Stoermer Coleman is an American actress and singer. She has received various accolades, including two Primetime Emmy Awards. Time magazine named her one of the 100 most influential people in the world in 2022.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Zendaya_-_2019_by_Glenn_Francis.jpg/500px-Zendaya_-_2019_by_Glenn_Francis.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 88,
          birthDate: 'September 1, 1996',
          nationality: 'American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 12,
          name: 'Ryan Reynolds',
          biography: 'Ryan Rodney Reynolds is a Canadian-American actor. He has starred in numerous films, including comedies, action films, and superhero films. He is known for playing the Marvel Comics character Deadpool.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Ryan_Reynolds_2016.jpg/500px-Ryan_Reynolds_2016.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 87,
          birthDate: 'October 23, 1976',
          nationality: 'Canadian-American',
          isWikipediaCelebrity: true
        }
      ];

      const itemsPerPage = 20;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const celebritiesForPage = popularCelebrities.slice(startIndex, endIndex);

      return {
        success: true,
        data: celebritiesForPage,
        totalPages: Math.ceil(popularCelebrities.length / itemsPerPage),
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching popular celebrities:', error);
      return {
        success: false,
        error: 'Failed to fetch celebrities'
      };
    }
  }

  // Search celebrities by name (using local search in predefined data)
  async searchCelebrities(query, page = 1) {
    try {
      // Get all celebrities from popular and trending
      const popularResult = await this.getPopularCelebrities(1);
      const trendingResult = await this.getTrendingCelebrities();

      const allCelebrities = [
        ...(popularResult.data || []),
        ...(trendingResult.data || [])
      ];

      // Filter celebrities based on search query
      const filteredCelebrities = allCelebrities.filter(celebrity =>
        celebrity.name.toLowerCase().includes(query.toLowerCase()) ||
        celebrity.category.toLowerCase().includes(query.toLowerCase()) ||
        celebrity.biography.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        data: filteredCelebrities,
        totalPages: 1,
        currentPage: page
      };
    } catch (error) {
      console.error('Error searching celebrities:', error);
      return {
        success: false,
        error: 'Failed to search celebrities'
      };
    }
  }

  // Search for a specific celebrity by name
  async searchCelebrityByName(name) {
    try {
      // First, search for the person
      const searchResponse = await axios.get(this.searchURL, {
        params: {
          action: 'opensearch',
          search: name,
          limit: 1,
          namespace: 0,
          format: 'json'
        }
      });

      const [searchTerm, titles] = searchResponse.data;
      if (titles.length === 0) return null;

      return await this.getCelebrityByTitle(titles[0]);
    } catch (error) {
      console.error(`Error searching for ${name}:`, error);
      return null;
    }
  }

  // Get celebrity data by Wikipedia title
  async getCelebrityByTitle(title) {
    try {
      // Get page summary
      const summaryResponse = await axios.get(`${this.baseURL}/page/summary/${encodeURIComponent(title)}`);
      const summary = summaryResponse.data;

      // Get additional page info
      const pageResponse = await axios.get(this.searchURL, {
        params: {
          action: 'query',
          format: 'json',
          titles: title,
          prop: 'extracts|pageimages|categories',
          exintro: true,
          explaintext: true,
          piprop: 'original',
          cllimit: 50
        }
      });

      const pages = pageResponse.data.query.pages;
      const pageId = Object.keys(pages)[0];
      const pageData = pages[pageId];

      return this.formatWikipediaCelebrity(summary, pageData);
    } catch (error) {
      console.error(`Error fetching data for ${title}:`, error);
      return null;
    }
  }

  // Get detailed celebrity information by our internal ID
  async getCelebrityDetails(tmdbId) {
    try {
      console.log('🔍 Looking up celebrity by ID:', tmdbId);

      // First check if it's in our popular celebrities list
      const popularResult = await this.getPopularCelebrities(1);
      if (popularResult.success) {
        const celebrity = popularResult.data.find(c => c.tmdbId == tmdbId);
        if (celebrity) {
          console.log('✅ Found celebrity in popular list:', celebrity.name);
          return {
            success: true,
            data: celebrity
          };
        }
      }

      // Check trending celebrities
      const trendingResult = await this.getTrendingCelebrities();
      if (trendingResult.success) {
        const celebrity = trendingResult.data.find(c => c.tmdbId == tmdbId);
        if (celebrity) {
          console.log('✅ Found celebrity in trending list:', celebrity.name);
          return {
            success: true,
            data: celebrity
          };
        }
      }

      console.log('❌ Celebrity not found with ID:', tmdbId);
      return {
        success: false,
        error: 'Celebrity not found'
      };
    } catch (error) {
      console.error('Error fetching celebrity details:', error);
      return {
        success: false,
        error: 'Failed to fetch celebrity details'
      };
    }
  }

  // Get detailed celebrity information by Wikipedia title
  async getCelebrityDetailsByTitle(titleOrId) {
    try {
      const celebrityData = await this.getCelebrityByTitle(titleOrId);

      if (celebrityData) {
        return {
          success: true,
          data: celebrityData
        };
      } else {
        return {
          success: false,
          error: 'Celebrity not found on Wikipedia'
        };
      }
    } catch (error) {
      console.error('Error fetching celebrity details:', error);
      return {
        success: false,
        error: 'Failed to fetch celebrity details from Wikipedia'
      };
    }
  }

  // Format Wikipedia celebrity data for our app
  formatWikipediaCelebrity(summary, pageData) {
    const categories = pageData?.categories || [];
    const profession = this.extractProfession(categories, summary.extract || summary.description);

    return {
      tmdbId: summary.pageid, // Use Wikipedia page ID as identifier
      name: summary.title,
      biography: summary.extract || summary.description || 'Biography not available.',
      profileImage: summary.thumbnail?.source || summary.originalimage?.source || null,
      category: profession,
      knownFor: profession,
      popularity: this.calculatePopularity(summary),
      wikipediaUrl: summary.content_urls?.desktop?.page,
      birthDate: this.extractBirthDate(summary.extract),
      nationality: this.extractNationality(summary.extract),
      isWikipediaCelebrity: true
    };
  }

  // Check if the Wikipedia page is likely about a celebrity
  isLikelyCelebrity(celebrityData) {
    if (!celebrityData) return false;

    const biography = (celebrityData.biography || '').toLowerCase();
    const name = (celebrityData.name || '').toLowerCase();

    // Check for celebrity-related keywords
    const celebrityKeywords = [
      'actor', 'actress', 'singer', 'musician', 'artist', 'performer',
      'director', 'producer', 'writer', 'author', 'athlete', 'player',
      'politician', 'president', 'minister', 'celebrity', 'star',
      'comedian', 'host', 'presenter', 'model', 'influencer',
      'born', 'career', 'film', 'movie', 'album', 'song', 'award'
    ];

    return celebrityKeywords.some(keyword =>
      biography.includes(keyword) || name.includes(keyword)
    );
  }

  // Extract profession from categories and biography
  extractProfession(categories, biography) {
    const categoryText = categories.map(cat => cat.title || '').join(' ').toLowerCase();
    const bioText = (biography || '').toLowerCase();
    const combinedText = categoryText + ' ' + bioText;

    if (combinedText.includes('actor') || combinedText.includes('actress')) return 'Acting';
    if (combinedText.includes('singer') || combinedText.includes('musician')) return 'Music';
    if (combinedText.includes('athlete') || combinedText.includes('player')) return 'Sports';
    if (combinedText.includes('director') || combinedText.includes('filmmaker')) return 'Directing';
    if (combinedText.includes('writer') || combinedText.includes('author')) return 'Writing';
    if (combinedText.includes('politician') || combinedText.includes('president')) return 'Politics';
    if (combinedText.includes('comedian')) return 'Comedy';
    if (combinedText.includes('model')) return 'Modeling';
    if (combinedText.includes('business') || combinedText.includes('entrepreneur')) return 'Business';

    return 'Entertainment';
  }

  // Calculate popularity score based on Wikipedia data
  calculatePopularity(summary) {
    let score = 50; // Base score

    // Boost score based on page views (if available)
    if (summary.pageviews) {
      score += Math.min(summary.pageviews / 1000, 30);
    }

    // Boost score if has image
    if (summary.thumbnail || summary.originalimage) {
      score += 10;
    }

    // Boost score based on extract length (more content = more notable)
    if (summary.extract) {
      score += Math.min(summary.extract.length / 100, 20);
    }

    return Math.round(Math.min(score, 100));
  }

  // Extract birth date from biography text
  extractBirthDate(biography) {
    if (!biography) return null;

    // Look for birth date patterns
    const birthPatterns = [
      /born[:\s]+(\w+\s+\d{1,2},?\s+\d{4})/i,
      /\(born[:\s]+(\w+\s+\d{1,2},?\s+\d{4})\)/i,
      /\((\w+\s+\d{1,2},?\s+\d{4})\s*–/i,
      /born[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i
    ];

    for (const pattern of birthPatterns) {
      const match = biography.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  // Extract nationality from biography text
  extractNationality(biography) {
    if (!biography) return null;

    // Look for nationality patterns
    const nationalityPatterns = [
      /is an? (\w+) /i,
      /was an? (\w+) /i,
      /(\w+) actor/i,
      /(\w+) actress/i,
      /(\w+) singer/i,
      /(\w+) musician/i
    ];

    for (const pattern of nationalityPatterns) {
      const match = biography.match(pattern);
      if (match) {
        const nationality = match[1];
        // Filter out common words that aren't nationalities
        if (!['the', 'a', 'an', 'former', 'retired', 'professional'].includes(nationality.toLowerCase())) {
          return nationality;
        }
      }
    }

    return null;
  }

  // Get trending celebrities (using predefined trending data)
  async getTrendingCelebrities(timeWindow = 'week') {
    try {
      // Predefined trending celebrity data
      const trendingCelebrities = [
        {
          tmdbId: 101,
          name: 'Pedro Pascal',
          biography: 'José Pedro Balmaceda Pascal is a Chilean-American actor. He began his career guest starring on various television shows before rising to prominence for portraying Oberyn Martell on the fourth season of the HBO fantasy series Game of Thrones.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Pedro_Pascal_by_Gage_Skidmore_3.jpg/500px-Pedro_Pascal_by_Gage_Skidmore_3.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 89,
          birthDate: 'April 2, 1975',
          nationality: 'Chilean-American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 102,
          name: 'Jenna Ortega',
          biography: 'Jenna Marie Ortega is an American actress. She began her career as a child actress, receiving recognition for her role as young Jane on The CW comedy-drama series Jane the Virgin.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Jenna_Ortega_2022.jpg/500px-Jenna_Ortega_2022.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 92,
          birthDate: 'September 27, 2002',
          nationality: 'American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 103,
          name: 'Margot Robbie',
          biography: 'Margot Elise Robbie is an Australian actress and producer. Known for her work in both blockbuster and independent films, she has received various accolades, including nominations for three Academy Awards.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Margot_Robbie_%2828601016735%29_%28cropped%29.jpg/500px-Margot_Robbie_%2828601016735%29_%28cropped%29.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 90,
          birthDate: 'July 2, 1990',
          nationality: 'Australian',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 104,
          name: 'Timothée Chalamet',
          biography: 'Timothée Hal Chalamet is an American and French actor. He has received various accolades, including nominations for an Academy Award, three Golden Globe Awards, and three BAFTA Film Awards.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Timoth%C3%A9e_Chalamet_Berlinale_2018.jpg/500px-Timoth%C3%A9e_Chalamet_Berlinale_2018.jpg',
          category: 'Acting',
          knownFor: 'Acting',
          popularity: 86,
          birthDate: 'December 27, 1995',
          nationality: 'American-French',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 105,
          name: 'Billie Eilish',
          biography: 'Billie Eilish Pirate Baird O\'Connell is an American singer and songwriter. She first gained public attention in 2015 with her debut single "Ocean Eyes", written and produced by her brother Finneas O\'Connell.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Billie_Eilish_2019_by_Glenn_Francis.jpg/500px-Billie_Eilish_2019_by_Glenn_Francis.jpg',
          category: 'Music',
          knownFor: 'Music',
          popularity: 94,
          birthDate: 'December 18, 2001',
          nationality: 'American',
          isWikipediaCelebrity: true
        },
        {
          tmdbId: 106,
          name: 'Harry Styles',
          biography: 'Harry Edward Styles is an English singer, songwriter, and actor. His musical career began in 2010 as a solo contestant on the British music competition series The X Factor.',
          profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Harry_Styles_November_2017.jpg/500px-Harry_Styles_November_2017.jpg',
          category: 'Music',
          knownFor: 'Music',
          popularity: 91,
          birthDate: 'February 1, 1994',
          nationality: 'British',
          isWikipediaCelebrity: true
        }
      ];

      return {
        success: true,
        data: trendingCelebrities
      };
    } catch (error) {
      console.error('Error fetching trending celebrities:', error);
      return {
        success: false,
        error: 'Failed to fetch trending celebrities'
      };
    }
  }

  // Get celebrity images (Wikipedia version)
  async getCelebrityImages(titleOrId) {
    try {
      const celebrityData = await this.getCelebrityByTitle(titleOrId);

      if (celebrityData && celebrityData.profileImage) {
        return {
          success: true,
          data: [{
            url: celebrityData.profileImage,
            fullUrl: celebrityData.profileImage,
            source: 'Wikipedia'
          }]
        };
      } else {
        return {
          success: false,
          error: 'No images found for this celebrity'
        };
      }
    } catch (error) {
      console.error('Error fetching celebrity images:', error);
      return {
        success: false,
        error: 'Failed to fetch celebrity images'
      };
    }
  }

  // Check if API is configured (always true for Wikipedia)
  isConfigured() {
    return true;
  }

  // Get API status
  async getAPIStatus() {
    try {
      // Test Wikipedia API with a simple request
      await axios.get(`${this.baseURL}/page/summary/Wikipedia`);

      return {
        configured: true,
        working: true,
        message: 'Wikipedia API is working correctly - no API key required!'
      };
    } catch (error) {
      return {
        configured: true,
        working: false,
        message: 'Wikipedia API is currently unavailable'
      };
    }
  }

  // Get placeholder image for failed loads
  getPlaceholderImage() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEyNy45MSAxMDAgMTEwIDExNy45MSAxMTAgMTQwQzExMCAxNjIuMDkgMTI3LjkxIDE4MCAxNTAgMTgwQzE3Mi4wOSAxODAgMTkwIDE2Mi4wOSAxOTAgMTQwQzE5MCAxMTcuOTEgMTcyLjA5IDEwMCAxNTAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjEwIDIyMEMxOTUgMjAwIDE3NSAxOTAgMTUwIDE5MEMxMjUgMTkwIDEwNSAyMDAgOTAgMjIwVjI0MEgyMTBWMjIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  }
}

export default new WikipediaService();
