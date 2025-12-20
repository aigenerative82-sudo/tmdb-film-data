// MoviesPage.jsx - With Active Filters at Bottom on Mobile
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from '../components/Navbar';
import ListPage from '../components/ListPage';
import FilterBar from '../components/FilterBar';
import ActiveFilters from '../components/ActiveFilters';
import { BASE_URL, API_KEY } from '../config';
import { useContentManager } from '../hooks/useContentManager';

const { Content } = Layout;

const STORAGE_KEY = 'moviesPageState';
const SCROLL_ITEM_KEY = 'moviesScrollItemId';

const MoviesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Try to restore previous state
  const getSavedState = () => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedState = getSavedState();
  const [searchTerm, setSearchTerm] = useState(savedState?.searchTerm || '');
  const [isRestoringState, setIsRestoringState] = useState(!!savedState);

  const {
    items,
    loading,
    loadingMore,
    error,
    currentPage,
    totalPages,
    hasMore,
    currentEndpoint,
    selectedGenre,
    selectedCountry,
    fetchContent,
    searchContent,
    handleScroll,
    setSelectedGenre,
    setSelectedCountry
  } = useContentManager('movies', 'movie');

  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);
  const [savedScrollItemId, setSavedScrollItemId] = useState(null);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if we need to restore scroll to item on mount
  useEffect(() => {
    const savedItemId = sessionStorage.getItem(SCROLL_ITEM_KEY);
    console.log('Checking for saved item ID:', savedItemId, 'fromDetail:', location.state?.fromDetail);
    if (savedItemId && location.state?.fromDetail) {
      console.log('Setting up scroll restoration for item:', savedItemId);
      setShouldRestoreScroll(true);
      setSavedScrollItemId(parseInt(savedItemId));
    }
  }, [location]);

  // Restore scroll position to specific item after content is loaded
  useEffect(() => {
    if (shouldRestoreScroll && savedScrollItemId && items.length > 0) {
      console.log('Attempting scroll restoration. Loading:', loading, 'Items:', items.length);
      
      const attemptScroll = () => {
        const itemElement = document.getElementById(`movie-item-${savedScrollItemId}`);
        console.log('Looking for element:', `movie-item-${savedScrollItemId}`, 'Found:', !!itemElement);
        
        if (itemElement) {
          console.log('✓ Scrolling to item:', savedScrollItemId);
          
          // Immediate scroll
          itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Highlight the item briefly
          itemElement.style.transition = 'background-color 0.3s ease';
          itemElement.style.backgroundColor = 'rgba(24, 144, 255, 0.2)';
          
          setTimeout(() => {
            itemElement.style.backgroundColor = '';
            itemElement.style.transition = '';
          }, 2000);
          
          // Cleanup
          sessionStorage.removeItem(SCROLL_ITEM_KEY);
          setShouldRestoreScroll(false);
          setSavedScrollItemId(null);
          window.history.replaceState({}, document.title);
          
          return true;
        }
        return false;
      };
      
      // Try immediately
      const found = attemptScroll();
      
      // If not found, try again after short delay
      if (!found) {
        const timer = setTimeout(attemptScroll, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [shouldRestoreScroll, savedScrollItemId, items]);

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      setGenres(data.genres || []);
      return data.genres || [];
    } catch (err) {
      console.error('Error fetching genres:', err);
      return [];
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${BASE_URL}/configuration/countries?api_key=${API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching countries:', err);
      return [];
    }
  };

  // Save state whenever it changes
  useEffect(() => {
    if (!isRestoringState) {
      const stateToSave = {
        searchTerm,
        selectedGenreId: selectedGenre?.id,
        selectedCountryCode: selectedCountry?.iso_3166_1,
        currentEndpoint
      };
      
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.error('Error saving state:', err);
      }
    }
  }, [searchTerm, selectedGenre, selectedCountry, currentEndpoint, isRestoringState]);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      const genresList = await fetchGenres();
      const countriesList = await fetchCountries();
      
      // Check if coming from detail page - load fresh content
      if (location.state?.fromDetail) {
        console.log('Initializing from detail page - loading popular');
        fetchContent('popular');
        setIsRestoringState(false);
        return;
      }
      
      if (savedState) {
        // Restore all filters
        if (savedState.selectedGenreId) {
          const genre = genresList.find(g => g.id === savedState.selectedGenreId);
          if (genre) setSelectedGenre(genre);
        }
        
        if (savedState.selectedCountryCode) {
          const country = countriesList.find(c => c.iso_3166_1 === savedState.selectedCountryCode);
          if (country) setSelectedCountry(country);
        }

        // Construct endpoint based on filters
        if (savedState.searchTerm) {
          searchContent(savedState.searchTerm);
        } else if (savedState.selectedGenreId && savedState.selectedCountryCode) {
          fetchContent(`genre-${savedState.selectedGenreId}-country-${savedState.selectedCountryCode}`);
        } else if (savedState.selectedGenreId) {
          fetchContent(`genre-${savedState.selectedGenreId}`);
        } else if (savedState.selectedCountryCode) {
          fetchContent(`country-${savedState.selectedCountryCode}`);
        } else if (savedState.currentEndpoint) {
          fetchContent(savedState.currentEndpoint);
        } else {
          fetchContent('popular');
        }

        setIsRestoringState(false);
      } else {
        fetchContent('popular');
        setIsRestoringState(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Combined filter logic with proper search handling
  useEffect(() => {
    if (!isRestoringState && searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        searchContent(searchTerm, selectedGenre, selectedCountry);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (!isRestoringState && !searchTerm.trim() && (selectedGenre || selectedCountry)) {
      handleClearSearch();
    }
  }, [searchTerm, isRestoringState]);

  const handleCategoryChange = (endpoint) => {
    setSearchTerm('');
    
    if (selectedCountry && selectedGenre) {
      fetchContent(`${endpoint}-country-${selectedCountry.iso_3166_1}-genre-${selectedGenre.id}`);
    } else if (selectedCountry) {
      fetchContent(`${endpoint}-country-${selectedCountry.iso_3166_1}`);
    } else if (selectedGenre) {
      fetchContent(`${endpoint}-genre-${selectedGenre.id}`);
    } else {
      fetchContent(endpoint);
    }
  };

  const handleGenreSelect = (genreId) => {
    const genre = genres.find(g => g.id === genreId);
    setSelectedGenre(genre);
    
    if (searchTerm.trim()) {
      searchContent(searchTerm, genre, selectedCountry);
    } else if (selectedCountry) {
      fetchContent(`country-${selectedCountry.iso_3166_1}-genre-${genreId}`);
    } else {
      fetchContent(`genre-${genreId}`);
    }
  };

  const handleCountrySelect = (countryCode) => {
    const country = countries.find(c => c.iso_3166_1 === countryCode);
    setSelectedCountry(country);
    
    if (searchTerm.trim()) {
      searchContent(searchTerm, selectedGenre, country);
    } else if (selectedGenre) {
      fetchContent(`country-${countryCode}-genre-${selectedGenre.id}`);
    } else {
      fetchContent(`country-${countryCode}`);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (selectedCountry && selectedGenre) {
      fetchContent(`country-${selectedCountry.iso_3166_1}-genre-${selectedGenre.id}`);
    } else if (selectedCountry) {
      fetchContent(`country-${selectedCountry.iso_3166_1}`);
    } else if (selectedGenre) {
      fetchContent(`genre-${selectedGenre.id}`);
    } else {
      fetchContent('popular');
    }
  };

  const handleClearGenre = () => {
    setSelectedGenre(null);
    if (searchTerm.trim()) {
      searchContent(searchTerm, null, selectedCountry);
    } else if (selectedCountry) {
      fetchContent(`country-${selectedCountry.iso_3166_1}`);
    } else {
      fetchContent('popular');
    }
  };

  const handleClearCountry = () => {
    setSelectedCountry(null);
    if (searchTerm.trim()) {
      searchContent(searchTerm, selectedGenre, null);
    } else if (selectedGenre) {
      fetchContent(`genre-${selectedGenre.id}`);
    } else {
      fetchContent('popular');
    }
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedGenre(null);
    setSelectedCountry(null);
    fetchContent('popular');
  };

  const handleHomeClick = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SCROLL_ITEM_KEY);
    navigate('/');
  };

  const handleAnimeClick = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SCROLL_ITEM_KEY);
    navigate('/anime');
  };

  const handleContentTypeChange = (newType) => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SCROLL_ITEM_KEY);
    if (newType === 'movie') {
      navigate('/movies');
    } else if (newType === 'tv') {
      navigate('/tv-shows');
    }
  };

  const handleMovieClick = (id) => {
    // Save the clicked item ID for auto-scroll on return
    sessionStorage.setItem(SCROLL_ITEM_KEY, id.toString());
    
    navigate(`/detail/movie/${id}`, {
      state: {
        from: '/movies',
        fromDetail: true,
        searchTerm,
        selectedGenre,
        selectedCountry,
        contentType: 'movie'
      }
    });
  };

  // Cleanup
  useEffect(() => {
    return () => {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/movies') && !currentPath.includes('/detail/movie')) {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(SCROLL_ITEM_KEY);
      }
    };
  }, []);

  // Check if we have active filters
  const hasActiveFilters = searchTerm || selectedGenre || selectedCountry;
  const showFilterBarOnTop = !searchTerm && !selectedGenre && !selectedCountry;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar 
        contentType="movie"
        setContentType={handleContentTypeChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        genres={genres}
        countries={countries}
        onHomeClick={handleHomeClick}
        onGenreSelect={handleGenreSelect}
        onCountrySelect={handleCountrySelect}
        onAnimeClick={handleAnimeClick}
      />

      <Content style={{ 
        padding: '24px', 
        backgroundColor: '#051c3fff', 
        paddingBottom: isMobile && hasActiveFilters ? '80px' : '80px' 
      }}>
        {/* Show FilterBar at top when no filters are active */}
        {showFilterBarOnTop && (
          <FilterBar 
            contentType="movie"
            currentEndpoint={currentEndpoint}
            onCategoryChange={handleCategoryChange}
          />
        )}
        
        {/* Show ActiveFilters at top on desktop, or at top on mobile when FilterBar is visible */}
        {(!isMobile || showFilterBarOnTop) && (
          <ActiveFilters
            searchTerm={searchTerm}
            selectedGenre={selectedGenre}
            selectedCountry={selectedCountry}
            onClearSearch={handleClearSearch}
            onClearGenre={handleClearGenre}
            onClearCountry={handleClearCountry}
            onClearAll={handleClearAllFilters}
          />
        )}
        
        <ListPage 
          items={items}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          contentType="movie"
          currentEndpoint={currentEndpoint}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          searchTerm={searchTerm}
          selectedGenre={selectedGenre}
          selectedCountry={selectedCountry}
          onCategoryChange={handleCategoryChange}
          onItemClick={handleMovieClick}
        />
      </Content>

      {/* Fixed ActiveFilters at bottom on mobile when FilterBar is hidden */}
      {isMobile && hasActiveFilters && !showFilterBarOnTop && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          padding: '8px 12px',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
          zIndex: 999,
          borderTop: '1px solid #e8e8e8',
          maxWidth: '100vw',
          overflowX: 'auto'
        }}>
          <ActiveFilters
            searchTerm={searchTerm}
            selectedGenre={selectedGenre}
            selectedCountry={selectedCountry}
            onClearSearch={handleClearSearch}
            onClearGenre={handleClearGenre}
            onClearCountry={handleClearCountry}
            onClearAll={handleClearAllFilters}
            hideTitle={true}
          />
        </div>
      )}
    </Layout>
  );
};

export default MoviesPage;