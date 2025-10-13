// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Layout, Row, Col, Spin, Typography, Button, Carousel, Tag, Modal } from 'antd';
import { ArrowRightOutlined, PlayCircleOutlined, InfoCircleOutlined, CloseOutlined, HistoryOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import ContentCard from '../components/ContentCard';
import { BASE_URL, API_KEY, BACKDROP_BASE_URL } from '../config';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

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
    // Check if user has accepted terms
    const termsAccepted = localStorage.getItem('termsAccepted');
    if (!termsAccepted) {
      setShowTermsModal(true);
    }
    
    // Restore scroll position when coming back from detail page
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
        // Fetch details for each watched item
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

  // Clear recently watched
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
    
    // Only load all content if there's no query/filter in URL
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
    
    // Save current scroll position
    sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
    
    // Build URL with current state
    const params = new URLSearchParams();
    if (searchTerm) params.set('query', searchTerm);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (selectedCountry) params.set('country', selectedCountry);
    if (contentType) params.set('type', contentType);
    
    const stateUrl = params.toString() ? `/?${params.toString()}` : '/';
    
    // Navigate to detail with state
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
    
    // Update URL
    setSearchParams({ genre: genreId, type: contentType });
    
    fetchByGenre(genreId, contentType);
  };

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedGenre(null);
    setSearchTerm('');
    setSearchResults(null);
    
    // Update URL
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
    
    // If there's an active filter, re-fetch with new type
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
    
    // Update URL
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
    // Try multiple methods to close the tab/window
    window.close();
    
    // Fallback: Try to navigate away
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

  const TermsModal = () => {
    const isMobile = window.innerWidth <= 768;
    
    return (
      <Modal
        open={showTermsModal}
        closable={false}
        footer={null}
        maskClosable={false}
        width={isMobile ? '95%' : 600}
        centered
        bodyStyle={{ 
          padding: 0,
          overflow: 'hidden'
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: isMobile ? '16px' : '20px',
          color: 'white',
          textAlign: 'center'
        }}>
          <Title level={isMobile ? 4 : 3} style={{ color: 'white', margin: 0 }}>
            Terms & Conditions
          </Title>
        </div>

        <div style={{
          padding: isMobile ? '16px' : '24px',
          maxHeight: isMobile ? '50vh' : '55vh',
          overflowY: 'auto',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ 
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '6px',
            padding: isMobile ? '12px' : '16px',
            marginBottom: isMobile ? '12px' : '16px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              color: '#856404', 
              marginBottom: '8px',
              fontSize: isMobile ? '13px' : '15px'
            }}>
              ⚠️ Use at Your Own Risk
            </div>
            <div style={{ color: '#856404', fontSize: isMobile ? '12px' : '13px', lineHeight: '1.5' }}>
              We are not responsible for any content, issues, or consequences from using this service.
            </div>
          </div>

          <div style={{ 
            fontSize: isMobile ? '12px' : '13px',
            color: '#666',
            lineHeight: '1.6'
          }}>
            <div style={{ marginBottom: isMobile ? '12px' : '14px' }}>
              <strong style={{ color: '#667eea' }}>• Content:</strong> Links to third-party sources. 
              We don't host or control content.
            </div>

            <div style={{ marginBottom: isMobile ? '12px' : '14px' }}>
              <strong style={{ color: '#667eea' }}>• Ads:</strong> Stream links may have ads. 
              <strong style={{ color: '#e74c3c' }}> Use an ad-blocker</strong> (uBlock Origin, AdBlock Plus, Brave Browser) for better experience.
            </div>

            <div style={{ marginBottom: isMobile ? '12px' : '14px' }}>
              <strong style={{ color: '#667eea' }}>• Liability:</strong> Not liable for damages, malware, 
              or legal issues.
            </div>

            <div style={{ marginBottom: isMobile ? '12px' : '14px' }}>
              <strong style={{ color: '#667eea' }}>• Your Responsibility:</strong> Follow local laws. 
              Use VPN and ad-blocker.
            </div>

            <div>
              <strong style={{ color: '#667eea' }}>• Age:</strong> Must be 18+ to use this site.
            </div>
          </div>

          <div style={{
            backgroundColor: '#d1ecf1',
            border: '1px solid #17a2b8',
            borderRadius: '6px',
            padding: isMobile ? '10px' : '12px',
            marginTop: isMobile ? '12px' : '16px'
          }}>
            <div style={{ 
              color: '#0c5460', 
              fontSize: isMobile ? '11px' : '12px',
              lineHeight: '1.5'
            }}>
              💡 <strong>Tip:</strong> Install <strong>uBlock Origin</strong> or use <strong>Brave Browser</strong> to block ads!
            </div>
          </div>
        </div>

        <div style={{
          padding: isMobile ? '12px 16px' : '16px 24px',
          backgroundColor: 'white',
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          gap: isMobile ? '8px' : '12px',
          justifyContent: 'center'
        }}>
          <Button
            size={isMobile ? 'middle' : 'large'}
            onClick={handleDeclineTerms}
            style={{
              flex: 1,
              maxWidth: isMobile ? '120px' : '150px',
              height: isMobile ? '40px' : '44px',
              fontSize: isMobile ? '13px' : '15px'
            }}
          >
            Exit
          </Button>
          <Button
            type="primary"
            size={isMobile ? 'middle' : 'large'}
            onClick={handleAcceptTerms}
            style={{
              flex: 1,
              maxWidth: isMobile ? '120px' : '150px',
              height: isMobile ? '40px' : '44px',
              fontSize: isMobile ? '13px' : '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            Accept
          </Button>
        </div>
      </Modal>
    );
  };

  const HeroSection = () => (
    <div style={{ marginBottom: '48px', marginTop: '-88px', marginLeft: '-24px', marginRight: '-24px' }}>
      <Carousel autoplay autoplaySpeed={5000} arrows={false} dots={false}>
        {heroItems.map((item) => (
          <div key={item.id}>
            <div style={{
              position: 'relative',
              height: '100vh',
              backgroundImage: `url(${BACKDROP_BASE_URL}${item.backdrop_path || item.poster_path})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              paddingTop: window.innerWidth <= 768 ? '64px' : '80px'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)',
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: window.innerWidth <= 768 ? '40px' : '80px',
                  left: window.innerWidth <= 768 ? '20px' : '60px',
                  maxWidth: window.innerWidth <= 768 ? '90%' : '600px',
                  color: 'white'
                }}>
                  <Title level={window.innerWidth <= 768 ? 3 : 1} style={{ color: 'white', marginBottom: '16px' }}>
                    {item.title || item.name}
                  </Title>
                  {window.innerWidth > 768 && (
                    <Paragraph style={{ 
                      color: 'white', 
                      fontSize: '16px', 
                      marginBottom: '24px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.overview}
                    </Paragraph>
                  )}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button 
                      type="primary" 
                      size={window.innerWidth <= 768 ? 'middle' : 'large'}
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleItemClick(item.id, 'movie')}
                    >
                      Watch Now
                    </Button>
                    <Button 
                      size={window.innerWidth <= 768 ? 'middle' : 'large'}
                      icon={<InfoCircleOutlined />}
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }}
                      onClick={() => handleItemClick(item.id, 'movie')}
                    >
                      More Info
                    </Button>
                  </div>
                  {item.release_date && (
                    <div style={{ 
                      marginTop: '16px', 
                      fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                      opacity: 0.8 
                    }}>
                      Coming: {new Date(item.release_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );

  const UpcomingBanner = ({ items, type, title }) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div style={{ 
        marginBottom: '48px',
        padding: window.innerWidth <= 768 ? '20px' : '32px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <Title level={4} style={{ color: 'white', marginBottom: '20px' }}>
          🎬 {title}
        </Title>
        <Row gutter={[16, 16]}>
          {items.map((item) => (
            <Col xs={12} sm={12} md={6} lg={6} key={item.id}>
              <div 
                onClick={() => handleItemClick(item.id, type)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transition: 'transform 0.3s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img 
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  style={{ 
                    width: '100%', 
                    height: window.innerWidth <= 768 ? '200px' : '300px',
                    objectFit: 'cover' 
                  }}
                />
                <div style={{ padding: '12px' }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.title || item.name}
                  </div>
                  {(item.release_date || item.first_air_date) && (
                    <div style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px', opacity: 0.8, marginTop: '4px' }}>
                      {new Date(item.release_date || item.first_air_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const ContentSection = ({ title, items, onSeeMore, type, visibleCount, onLoadMore, hideViewAll }) => (
    <div style={{ marginBottom: '48px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <Title level={3} style={{ margin: 0 }}>{title}</Title>
      </div>
      
      <Row gutter={[16, 16]}>
        {items.slice(0, visibleCount).map((item) => (
          <Col xs={12} sm={8} md={6} lg={6} xl={3} key={item.id}>
            <ContentCard
              item={item}
              contentType={type || item.media_type}
              onClick={() => handleItemClick(item.id, type || item.media_type)}
            />
          </Col>
        ))}
      </Row>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '24px',
        gap: '12px'
      }}>
        {visibleCount < items.length && (
          <Button 
            type="default"
            size="large"
            onClick={onLoadMore}
          >
            Load 10 More
          </Button>
        )}
        {!hideViewAll && (
          <Button 
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={onSeeMore}
          >
            See All
          </Button>
        )}
      </div>
    </div>
  );

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
      <TermsModal />
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

      <Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
        {!searchResults && !filteredResults && <HeroSection />}
        
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
            />
          ) : searchResults ? (
            <>
              {searchResults.movies.length > 0 && (
                <ContentSection
                  title={`Movie Results (${searchResults.movies.length})`}
                  items={searchResults.movies}
                  onSeeMore={() => navigate('/movies')}
                  type="movie"
                  visibleCount={searchResults.movies.length}
                  onLoadMore={() => {}}
                  hideViewAll={true}
                />
              )}
              
              {searchResults.tvShows.length > 0 && (
                <ContentSection
                  title={`TV Show Results (${searchResults.tvShows.length})`}
                  items={searchResults.tvShows}
                  onSeeMore={() => navigate('/tv-shows')}
                  type="tv"
                  visibleCount={searchResults.tvShows.length}
                  onLoadMore={() => {}}
                  hideViewAll={true}
                />
              )}

              {searchResults.people.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                  <Title level={3}>People Results ({searchResults.people.length})</Title>
                  <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                    {searchResults.people.map((person) => (
                      <Col xs={12} sm={8} md={6} lg={4} xl={3} key={person.id}>
                        <div
                          style={{
                            textAlign: 'center',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <img
                            src={
                              person.profile_path
                                ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                                : 'https://via.placeholder.com/185x278?text=No+Image'
                            }
                            alt={person.name}
                            style={{
                              width: '100%',
                              borderRadius: '8px',
                              marginBottom: '8px'
                            }}
                          />
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            {person.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            {person.known_for_department}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {searchResults.movies.length === 0 && 
               searchResults.tvShows.length === 0 && 
               searchResults.people.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <Title level={4}>No results found for "{searchTerm}"</Title>
                  <Button type="primary" onClick={clearFilters}>
                    Clear Search
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Recently Watched Section */}
              {recentlyWatched.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '24px'
                  }}>
                    <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HistoryOutlined style={{ color: '#1890ff' }} />
                      Continue Watching
                    </Title>
                    <Button 
                      type="link" 
                      danger
                      onClick={clearRecentlyWatched}
                    >
                      Clear History
                    </Button>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    <Row gutter={[16, 16]}>
                      {recentlyWatched.map((item) => (
                        <Col xs={12} sm={8} md={6} lg={6} xl={4} key={item.id}>
                          <div
                            onClick={() => handleItemClick(item.id, item.media_type)}
                            style={{
                              cursor: 'pointer',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              transition: 'all 0.3s',
                              border: '2px solid rgba(255,255,255,0.2)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-8px)';
                              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div style={{ position: 'relative' }}>
                              <img 
                                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                alt={item.title || item.name}
                                style={{ 
                                  width: '100%', 
                                  height: window.innerWidth <= 768 ? '200px' : '300px',
                                  objectFit: 'cover' 
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                backgroundColor: 'rgba(24, 144, 255, 0.9)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}>
                                <HistoryOutlined style={{ marginRight: '4px' }} />
                                RECENT
                              </div>
                            </div>
                            <div style={{ padding: '12px' }}>
                              <div style={{ 
                                fontWeight: 'bold', 
                                fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: 'white'
                              }}>
                                {item.title || item.name}
                              </div>
                              <div style={{ 
                                fontSize: window.innerWidth <= 768 ? '10px' : '12px', 
                                opacity: 0.8, 
                                marginTop: '4px',
                                color: 'white'
                              }}>
                                {item.media_type === 'movie' ? '🎬 Movie' : '📺 TV Show'}
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </div>
              )}

              <ContentSection
                title="Recent Releases"
                items={recentReleases}
                onSeeMore={() => navigate('/movies')}
                type={null}
                visibleCount={recentReleasesVisible}
                onLoadMore={() => setRecentReleasesVisible(prev => prev + 10)}
                hideViewAll={true}
              />

              <ContentSection
                title="Popular Movies"
                items={popularMovies}
                onSeeMore={() => navigate('/movies')}
                type="movie"
                visibleCount={popularMoviesVisible}
                onLoadMore={() => setPopularMoviesVisible(prev => prev + 10)}
              />

              <UpcomingBanner 
                items={upcomingMovies} 
                type="movie" 
                title="Upcoming Movies - Coming Soon"
              />

              <ContentSection
                title="Top Rated Movies"
                items={topRatedMovies}
                onSeeMore={() => navigate('/movies')}
                type="movie"
                visibleCount={topRatedMoviesVisible}
                onLoadMore={() => setTopRatedMoviesVisible(prev => prev + 10)}
              />

              <ContentSection
                title="Popular TV Shows"
                items={popularTVShows}
                onSeeMore={() => navigate('/tv-shows')}
                type="tv"
                visibleCount={popularTVVisible}
                onLoadMore={() => setPopularTVVisible(prev => prev + 10)}
              />

              <UpcomingBanner 
                items={upcomingTV} 
                type="tv" 
                title="Upcoming TV Shows - New Seasons"
              />

              <ContentSection
                title="Anime"
                items={animeShows}
                onSeeMore={() => navigate('/anime')}
                type="tv"
                visibleCount={animeVisible}
                onLoadMore={() => setAnimeVisible(prev => prev + 10)}
              />

              <UpcomingBanner 
                items={upcomingAnime} 
                type="tv" 
                title="Upcoming Anime - New Releases"
              />
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;