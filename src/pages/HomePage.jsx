// HomePage.jsx - Updated with separated components
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Layout, Spin, Button, Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import UpcomingBanner from '../components/UpcomingBanner';
import ContentSection from '../components/ContentSection';
import RecentlyWatchedSection from '../components/RecentlyWatchedSection';
import TermsModal from '../components/TermsModal';
import SearchResults from '../components/SearchResults';
import { BASE_URL, API_KEY } from '../config';

const { Content } = Layout;

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [contentType, setContentType] = useState('movie');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [heroItems, setHeroItems] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [recentReleases, setRecentReleases] = useState([]);
  const [recentReleasesVisible, setRecentReleasesVisible] = useState(16);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularMoviesVisible, setPopularMoviesVisible] = useState(16);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [topRatedMoviesVisible, setTopRatedMoviesVisible] = useState(16);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [popularTVVisible, setPopularTVVisible] = useState(16);
  const [animeShows, setAnimeShows] = useState([]);
  const [animeVisible, setAnimeVisible] = useState(16);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [upcomingTV, setUpcomingTV] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Filter states
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [filteredResults, setFilteredResults] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Save and restore scroll position
  useEffect(() => {
    const termsAccepted = localStorage.getItem('termsAccepted');
    if (!termsAccepted) {
      setShowTermsModal(true);
    }
    
    const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
    if (savedScrollPosition && location.state?.fromDetail) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('homeScrollPosition');
      }, 100);
    }
  }, [location.state]);

  // Load recently watched from localStorage
  const loadRecentlyWatched = async () => {
    try {
      const stored = localStorage.getItem('recentlyWatched');
      if (stored) {
        const watchedIds = JSON.parse(stored);
        const watchedItems = await Promise.all(
          watchedIds.slice(0, 12).map(async ({ id, type }) => {
            try {
              const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`);
              if (response.ok) {
                const data = await response.json();
                return { ...data, media_type: type };
              }
            } catch (err) {
              console.error('Error fetching watched item:', err);
            }
            return null;
          })
        );
        setRecentlyWatched(watchedItems.filter(item => item !== null));
      }
    } catch (err) {
      console.error('Error loading recently watched:', err);
    }
  };

  const clearRecentlyWatched = () => {
    localStorage.removeItem('recentlyWatched');
    setRecentlyWatched([]);
  };

  // Restore state from URL params on mount
  useEffect(() => {
    const query = searchParams.get('query');
    const genre = searchParams.get('genre');
    const country = searchParams.get('country');
    const type = searchParams.get('type');
    
    if (type) {
      setContentType(type);
    }
    
    if (query) {
      setSearchTerm(query);
      handleGlobalSearch(query, type || contentType);
    } else if (genre) {
      const genreId = parseInt(genre);
      setSelectedGenre(genreId);
      fetchByGenre(genreId, type || contentType);
    } else if (country) {
      setSelectedCountry(country);
      fetchByCountry(country, type || contentType);
    }
  }, []);

  const fetchGenres = async (type = 'movie') => {
    try {
      const response = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${BASE_URL}/configuration/countries?api_key=${API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data || []);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  const fetchByGenre = async (genreId, type = 'movie') => {
    setIsSearching(true);
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const response = await fetch(
        `${BASE_URL}/discover/${endpoint}?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=1`
      );
      const data = await response.json();
      setFilteredResults({
        items: data.results || [],
        type: type,
        filterType: 'genre',
        filterValue: genreId
      });
    } catch (err) {
      console.error('Error fetching by genre:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchByCountry = async (countryCode, type = 'movie') => {
    setIsSearching(true);
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const response = await fetch(
        `${BASE_URL}/discover/${endpoint}?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_origin_country=${countryCode}&page=1`
      );
      const data = await response.json();
      setFilteredResults({
        items: data.results || [],
        type: type,
        filterType: 'country',
        filterValue: countryCode
      });
    } catch (err) {
      console.error('Error fetching by country:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchHeroItems = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      setHeroItems(data.results?.slice(0, 5) || []);
    } catch (err) {
      console.error('Error fetching hero items:', err);
    }
  };

  const fetchUpcomingMovies = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      setUpcomingMovies(data.results?.slice(0, 4) || []);
    } catch (err) {
      console.error('Error fetching upcoming movies:', err);
    }
  };

  const fetchUpcomingTV = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=${today}&page=1`
      );
      const data = await response.json();
      setUpcomingTV(data.results?.slice(0, 4) || []);
    } catch (err) {
      console.error('Error fetching upcoming TV:', err);
    }
  };

  const fetchUpcomingAnime = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&with_genres=16&with_original_language=ja&sort_by=popularity.desc&first_air_date.gte=${today}&page=1`
      );
      const data = await response.json();
      setUpcomingAnime(data.results?.slice(0, 4) || []);
    } catch (err) {
      console.error('Error fetching upcoming anime:', err);
    }
  };

  const fetchRecentReleases = async () => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const formatDate = (date) => date.toISOString().split('T')[0];
      
      const moviesResponse = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${formatDate(thirtyDaysAgo)}&primary_release_date.lte=${formatDate(today)}&page=1`
      );
      const moviesData = await moviesResponse.json();
      
      const tvResponse = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=${formatDate(thirtyDaysAgo)}&first_air_date.lte=${formatDate(today)}&page=1`
      );
      const tvData = await tvResponse.json();
      
      const animeResponse = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&with_genres=16&with_original_language=ja&sort_by=popularity.desc&first_air_date.gte=${formatDate(thirtyDaysAgo)}&first_air_date.lte=${formatDate(today)}&page=1`
      );
      const animeData = await animeResponse.json();
      
      const combined = [
        ...(moviesData.results?.slice(0, 10).map(item => ({ ...item, media_type: 'movie' })) || []),
        ...(tvData.results?.slice(0, 10).map(item => ({ ...item, media_type: 'tv' })) || []),
        ...(animeData.results?.slice(0, 10).map(item => ({ ...item, media_type: 'tv' })) || [])
      ].sort((a, b) => b.popularity - a.popularity);
      
      setRecentReleases(combined);
    } catch (err) {
      console.error('Error fetching recent releases:', err);
    }
  };

  const fetchPopularMovies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
      const data = await response.json();
      setPopularMovies(data.results || []);
    } catch (err) {
      console.error('Error fetching popular movies:', err);
    }
  };

  const fetchTopRatedMovies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`);
      const data = await response.json();
      setTopRatedMovies(data.results || []);
    } catch (err) {
      console.error('Error fetching top rated movies:', err);
    }
  };

  const fetchPopularTVShows = async () => {
    try {
      const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=1`);
      const data = await response.json();
      setPopularTVShows(data.results || []);
    } catch (err) {
      console.error('Error fetching popular TV shows:', err);
    }
  };

  const fetchAnimeShows = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=1`
      );
      const data = await response.json();
      setAnimeShows(data.results || []);
    } catch (err) {
      console.error('Error fetching anime shows:', err);
    }
  };

  useEffect(() => {
    fetchGenres(contentType);
    fetchCountries();
    loadRecentlyWatched();
    
    if (!searchParams.get('query') && !searchParams.get('genre') && !searchParams.get('country')) {
      const loadAllContent = async () => {
        setLoading(true);
        await Promise.all([
          fetchHeroItems(),
          fetchRecentReleases(),
          fetchPopularMovies(),
          fetchTopRatedMovies(),
          fetchPopularTVShows(),
          fetchAnimeShows(),
          fetchUpcomingMovies(),
          fetchUpcomingTV(),
          fetchUpcomingAnime()
        ]);
        setLoading(false);
      };
      
      loadAllContent();
    } else {
      setLoading(false);
    }
  }, []);

  const handleItemClick = (id, mediaType) => {
    const type = mediaType || 'movie';
    sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
    
    const params = new URLSearchParams();
    if (searchTerm) params.set('query', searchTerm);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (selectedCountry) params.set('country', selectedCountry);
    if (contentType) params.set('type', contentType);
    
    const stateUrl = params.toString() ? `/?${params.toString()}` : '/';
    
    navigate(`/detail/${type}/${id}`, { 
      state: { 
        from: stateUrl,
        searchTerm,
        selectedGenre,
        selectedCountry,
        contentType
      } 
    });
  };

  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
    setSelectedCountry(null);
    setSearchTerm('');
    setSearchResults(null);
    setSearchParams({ genre: genreId, type: contentType });
    fetchByGenre(genreId, contentType);
  };

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedGenre(null);
    setSearchTerm('');
    setSearchResults(null);
    setSearchParams({ country: countryCode, type: contentType });
    fetchByCountry(countryCode, contentType);
  };

  const handleHomeClick = () => {
    setSearchTerm('');
    setSearchResults(null);
    setFilteredResults(null);
    setSelectedGenre(null);
    setSelectedCountry(null);
    setSearchParams({});
    navigate('/');
    window.location.reload();
  };

  const handleAnimeClick = () => {
    navigate('/anime');
  };

  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    
    if (selectedGenre) {
      fetchByGenre(selectedGenre, newType);
      setSearchParams({ genre: selectedGenre, type: newType });
    } else if (selectedCountry) {
      fetchByCountry(selectedCountry, newType);
      setSearchParams({ country: selectedCountry, type: newType });
    } else if (searchTerm) {
      handleGlobalSearch(searchTerm, newType);
    } else if (newType === 'movie') {
      navigate('/movies');
    } else if (newType === 'tv') {
      navigate('/tv-shows');
    }
  };

  const handleGlobalSearch = async (query, searchType) => {
    if (!query.trim()) {
      setSearchResults(null);
      setFilteredResults(null);
      setSearchTerm('');
      setSelectedGenre(null);
      setSelectedCountry(null);
      setSearchParams({});
      return;
    }

    setSearchTerm(query);
    setSelectedGenre(null);
    setSelectedCountry(null);
    setFilteredResults(null);
    setSearchParams({ query, type: searchType || contentType });

    setIsSearching(true);
    setSearchResults({ movies: [], tvShows: [], people: [] });

    try {
      const moviesResponse = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
      );
      const moviesData = await moviesResponse.json();

      const tvResponse = await fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
      );
      const tvData = await tvResponse.json();

      const peopleResponse = await fetch(
        `${BASE_URL}/search/person?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
      );
      const peopleData = await peopleResponse.json();

      setSearchResults({
        movies: moviesData.results?.slice(0, 16) || [],
        tvShows: tvData.results?.slice(0, 16) || [],
        people: peopleData.results?.slice(0, 8) || []
      });
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchResults(null);
    setFilteredResults(null);
    setSelectedGenre(null);
    setSelectedCountry(null);
    setSearchParams({});
  };

  const handleAcceptTerms = () => {
    localStorage.setItem('termsAccepted', 'true');
    setShowTermsModal(false);
  };

  const handleDeclineTerms = () => {
    window.close();
    setTimeout(() => {
      window.location.href = 'about:blank';
    }, 100);
  };

  const getFilterLabel = () => {
    if (selectedGenre) {
      const genre = genres.find(g => g.id === selectedGenre);
      return genre ? `Genre: ${genre.name}` : 'Genre Filter';
    }
    if (selectedCountry) {
      const country = countries.find(c => c.iso_3166_1 === selectedCountry);
      return country ? `Country: ${country.english_name}` : 'Country Filter';
    }
    return '';
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar 
          contentType={contentType}
          setContentType={handleContentTypeChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          genres={genres}
          countries={countries}
          onHomeClick={handleHomeClick}
          onGenreSelect={handleGenreSelect}
          onCountrySelect={handleCountrySelect}
          onAnimeClick={handleAnimeClick}
          onSearch={handleGlobalSearch}
        />
        <Content style={{ 
          padding: '24px', 
          backgroundColor: '#f0f2f5',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}>
          <Spin size="large" tip="Loading content..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <TermsModal 
        visible={showTermsModal}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
      
      <Navbar 
        contentType={contentType}
        setContentType={handleContentTypeChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        genres={genres}
        countries={countries}
        onHomeClick={handleHomeClick}
        onGenreSelect={handleGenreSelect}
        onCountrySelect={handleCountrySelect}
        onAnimeClick={handleAnimeClick}
        onSearch={handleGlobalSearch}
      />

      <Content style={{ padding: '24px', backgroundColor: '#03092cff' }}>
        {!searchResults && !filteredResults && (
          <HeroSection items={heroItems} onItemClick={handleItemClick} />
        )}
        
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Active Filter Display */}
          {(searchTerm || selectedGenre || selectedCountry) && (
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {searchTerm && (
                <Tag 
                  closable 
                  onClose={clearFilters}
                  color="blue"
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  Search: "{searchTerm}"
                </Tag>
              )}
              {selectedGenre && (
                <Tag 
                  closable 
                  onClose={clearFilters}
                  color="purple"
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  {getFilterLabel()}
                </Tag>
              )}
              {selectedCountry && (
                <Tag 
                  closable 
                  onClose={clearFilters}
                  color="green"
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  {getFilterLabel()}
                </Tag>
              )}
              <Button 
                type="link" 
                icon={<CloseOutlined />}
                onClick={clearFilters}
              >
                Clear All
              </Button>
            </div>
          )}

          {isSearching ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" tip="Searching..." />
            </div>
          ) : filteredResults ? (
            <ContentSection
              title={`${getFilterLabel()} - ${filteredResults.items.length} Results`}
              items={filteredResults.items}
              onSeeMore={() => navigate(filteredResults.type === 'movie' ? '/movies' : '/tv-shows')}
              type={filteredResults.type}
              visibleCount={filteredResults.items.length}
              onLoadMore={() => {}}
              hideViewAll={true}
              onItemClick={handleItemClick}
            />
          ) : searchResults ? (
            <SearchResults
              searchResults={searchResults}
              searchTerm={searchTerm}
              onItemClick={handleItemClick}
              onNavigate={navigate}
              onClearSearch={clearFilters}
            />
          ) : (
            <>
              <RecentlyWatchedSection
                items={recentlyWatched}
                onItemClick={handleItemClick}
                onClearHistory={clearRecentlyWatched}
              />

              <ContentSection
                title="Recent Releases"
                items={recentReleases}
                onSeeMore={() => navigate('/movies')}
                type={null}
                visibleCount={recentReleasesVisible}
                onLoadMore={() => setRecentReleasesVisible(prev => prev + 10)}
                hideViewAll={true}
                onItemClick={handleItemClick}
              />

              <ContentSection
                title="Popular Movies"
                items={popularMovies}
                onSeeMore={() => navigate('/movies')}
                type="movie"
                visibleCount={popularMoviesVisible}
                onLoadMore={() => setPopularMoviesVisible(prev => prev + 10)}
                onItemClick={handleItemClick}
              />

              <UpcomingBanner 
                items={upcomingMovies} 
                type="movie" 
                title="Upcoming Movies - Coming Soon"
                onItemClick={handleItemClick}
              />

              <ContentSection
                title="Top Rated Movies"
                items={topRatedMovies}
                onSeeMore={() => navigate('/movies')}
                type="movie"
                visibleCount={topRatedMoviesVisible}
                onLoadMore={() => setTopRatedMoviesVisible(prev => prev + 10)}
                onItemClick={handleItemClick}
              />

              <ContentSection
                title="Popular TV Shows"
                items={popularTVShows}
                onSeeMore={() => navigate('/tv-shows')}
                type="tv"
                visibleCount={popularTVVisible}
                onLoadMore={() => setPopularTVVisible(prev => prev + 10)}
                onItemClick={handleItemClick}
              />

              <UpcomingBanner 
                items={upcomingTV} 
                type="tv" 
                title="Upcoming TV Shows - New Seasons"
                onItemClick={handleItemClick}
              />

              <ContentSection
                title="Anime"
                items={animeShows}
                onSeeMore={() => navigate('/anime')}
                type="tv"
                visibleCount={animeVisible}
                onLoadMore={() => setAnimeVisible(prev => prev + 10)}
                onItemClick={handleItemClick}
              />

              <UpcomingBanner 
                items={upcomingAnime} 
                type="tv" 
                title="Upcoming Anime - New Releases"
                onItemClick={handleItemClick}
              />
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;