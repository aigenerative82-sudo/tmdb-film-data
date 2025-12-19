// src/pages/SearchPage.jsx

import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Spin, Empty, Typography, Tag, Avatar, Input, Tabs } from 'antd';
import { SearchOutlined, StarFilled, FireOutlined, TrophyOutlined, RiseOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BASE_URL, API_KEY } from '../config';
import { Navbar } from '../components/Navbar';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

export const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q');

  const [searchQuery, setSearchQuery] = useState(queryParam || '');
  const [searchResults, setSearchResults] = useState({
    movies: [],
    tvShows: [],
    people: []
  });
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch popular movies on component mount
  useEffect(() => {
    fetchPopularContent();
  }, []);

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      performSearch(queryParam);
    }
  }, [queryParam]);

  // Real-time search as user types
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults({
          movies: [],
          tvShows: [],
          people: []
        });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchPopularContent = async () => {
    setInitialLoading(true);
    try {
      const [popularRes, trendingRes, topRatedRes] = await Promise.all([
        fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`),
        fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`),
        fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`)
      ]);

      const popularData = await popularRes.json();
      const trendingData = await trendingRes.json();
      const topRatedData = await topRatedRes.json();

      setPopularMovies(popularData.results?.slice(0, 12) || []);
      setTrendingMovies(trendingData.results?.slice(0, 12) || []);
      setTopRatedMovies(topRatedData.results?.slice(0, 12) || []);
    } catch (err) {
      console.error('Error fetching popular content:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const [moviesRes, tvRes, peopleRes] = await Promise.all([
        fetch(
          `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
        ),
        fetch(
          `${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
        ),
        fetch(
          `${BASE_URL}/search/person?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
        )
      ]);

      const moviesData = await moviesRes.json();
      const tvData = await tvRes.json();
      const peopleData = await peopleRes.json();

      setSearchResults({
        movies: moviesData.results || [],
        tvShows: tvData.results || [],
        people: peopleData.results || []
      });
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults({
        movies: [],
        tvShows: [],
        people: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/search', { replace: true });
    }
  };

  const renderMovieCard = (movie) => (
    <Col xs={12} sm={8} md={6} lg={4} key={movie.id}>
      <Card
        hoverable
        onClick={() => navigate(`/detail/movie/${movie.id}`)}
        cover={
          movie.poster_path ? (
            <img
              alt={movie.title}
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              style={{ height: '300px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                height: '300px',
                background: '#16213e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
              }}
            >
              No Image
            </div>
          )
        }
        style={{
          background: '#1a1a2e',
          border: '1px solid #16213e',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <Text
          strong
          style={{
            color: '#fff',
            fontSize: '14px',
            display: 'block',
            marginBottom: '8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {movie.title}
        </Text>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {movie.release_date && (
            <Text style={{ color: '#999', fontSize: '12px' }}>
              {new Date(movie.release_date).getFullYear()}
            </Text>
          )}
          {movie.vote_average > 0 && (
            <Tag color="gold" style={{ margin: 0 }}>
              <StarFilled /> {movie.vote_average.toFixed(1)}
            </Tag>
          )}
        </div>
      </Card>
    </Col>
  );

  const totalResults = searchResults.movies.length + searchResults.tvShows.length + searchResults.people.length;
  const showSearchResults = searchQuery.trim() !== '';

  return (
    <Layout style={{ minHeight: '100vh', background: '#0f0f1e' }}>
      <Content style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '50px' }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '40px',
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 111, 0.05) 100%)',
              padding: '60px 20px',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative background elements */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255, 107, 107, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '150px',
                height: '150px',
                background: 'radial-gradient(circle, rgba(238, 90, 111, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
              
              <Title 
                level={1} 
                style={{ 
                  color: '#fff', 
                  marginBottom: '12px',
                  fontSize: '42px',
                  fontWeight: '700',
                  letterSpacing: '-1px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                Discover Your Next Favorite
              </Title>
              <Text style={{ 
                color: '#b0b0b0', 
                fontSize: '16px',
                display: 'block',
                marginBottom: '30px',
                position: 'relative',
                zIndex: 1
              }}>
                Search millions of movies, TV shows, and actors
              </Text>
              
              {/* Enhanced Search Input */}
              <div style={{ 
                maxWidth: '700px', 
                margin: '0 auto',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  position: 'relative',
                  boxShadow: '0 10px 40px rgba(255, 107, 107, 0.2), 0 0 0 1px rgba(255, 107, 107, 0.1)',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  padding: '4px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    paddingLeft: '20px'
                  }}>
                    <SearchOutlined style={{ 
                      color: '#ff6b6b', 
                      fontSize: '22px',
                      marginRight: '12px',
                      flexShrink: 0
                    }} />
                    <Input
                      value={searchQuery}
                      onChange={handleSearchChange}
                      size="large"
                      placeholder="Search for movies, TV shows, anime, actors..."
                      allowClear
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: '#fff',
                        fontSize: '17px',
                        fontWeight: '500',
                        height: '52px',
                        padding: '0 20px 0 0'
                      }}
                      className="custom-search-input"
                    />
                  </div>
                </div>
                
                {/* Search suggestions hint */}
                {!searchQuery && (
                  <div style={{ 
                    marginTop: '16px',
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <Text style={{ color: '#666', fontSize: '13px' }}>
                      Try searching:
                    </Text>
                    {['Inception', 'Breaking Bad', 'Tom Hanks'].map((suggestion) => (
                      <Tag
                        key={suggestion}
                        style={{
                          background: 'rgba(255, 107, 107, 0.1)',
                          border: '1px solid rgba(255, 107, 107, 0.3)',
                          color: '#ff6b6b',
                          cursor: 'pointer',
                          borderRadius: '20px',
                          padding: '4px 12px',
                          fontSize: '13px',
                          transition: 'all 0.3s ease',
                          margin: 0
                        }}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          navigate(`/search?q=${encodeURIComponent(suggestion)}`, { replace: true });
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {suggestion}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <style>
            {`
              .custom-search-input {
                border: none !important;
                box-shadow: none !important;
              }
              
              .custom-search-input:hover,
              .custom-search-input:focus,
              .custom-search-input:focus-visible {
                border: none !important;
                box-shadow: none !important;
                outline: none !important;
              }
              
              .custom-search-input .ant-input {
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
              }
              
              .custom-search-input .ant-input:focus {
                border: none !important;
                box-shadow: none !important;
                outline: none !important;
              }
              
              .custom-search-input::placeholder,
              .custom-search-input::-webkit-input-placeholder,
              .custom-search-input::-moz-placeholder,
              .custom-search-input:-ms-input-placeholder {
                color: #888 !important;
                font-weight: 400 !important;
                opacity: 1 !important;
              }
              
              .custom-search-input .ant-input-clear-icon {
                color: #999 !important;
                font-size: 16px !important;
              }
              
              .custom-search-input .ant-input-clear-icon:hover {
                color: #ff6b6b !important;
              }
            `}
          </style>

          {/* Search Results */}
          {showSearchResults ? (
            loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
                <Text style={{ display: 'block', marginTop: '20px', color: '#e0e0e0' }}>
                  Searching...
                </Text>
              </div>
            ) : (
              <>
                {totalResults > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <Text style={{ color: '#e0e0e0', fontSize: '16px' }}>
                      Found <strong style={{ color: '#ff6b6b' }}>{totalResults}</strong> results for "{searchQuery}"
                    </Text>
                  </div>
                )}

                {totalResults === 0 && (
                  <Empty
                    description={
                      <Text style={{ color: '#e0e0e0' }}>
                        No results found for "{searchQuery}"
                      </Text>
                    }
                    style={{ marginTop: '100px' }}
                  />
                )}

                {/* Movies Section */}
                {searchResults.movies.length > 0 && (
                  <div style={{ marginBottom: '50px' }}>
                    <Title level={3} style={{ color: '#ff6b6b', marginBottom: '20px' }}>
                      Movies ({searchResults.movies.length})
                    </Title>
                    <Row gutter={[16, 16]}>
                      {searchResults.movies.map(renderMovieCard)}
                    </Row>
                  </div>
                )}

                {/* TV Shows Section */}
                {searchResults.tvShows.length > 0 && (
                  <div style={{ marginBottom: '50px' }}>
                    <Title level={3} style={{ color: '#ff6b6b', marginBottom: '20px' }}>
                      TV Shows ({searchResults.tvShows.length})
                    </Title>
                    <Row gutter={[16, 16]}>
                      {searchResults.tvShows.map((show) => (
                        <Col xs={12} sm={8} md={6} lg={4} key={show.id}>
                          <Card
                            hoverable
                            onClick={() => navigate(`/detail/tv/${show.id}`)}
                            cover={
                              show.poster_path ? (
                                <img
                                  alt={show.name}
                                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                                  style={{ height: '300px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div
                                  style={{
                                    height: '300px',
                                    background: '#16213e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#666'
                                  }}
                                >
                                  No Image
                                </div>
                              )
                            }
                            style={{
                              background: '#1a1a2e',
                              border: '1px solid #16213e',
                              borderRadius: '8px',
                              overflow: 'hidden'
                            }}
                            bodyStyle={{ padding: '12px' }}
                          >
                            <Text
                              strong
                              style={{
                                color: '#fff',
                                fontSize: '14px',
                                display: 'block',
                                marginBottom: '8px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {show.name}
                            </Text>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {show.first_air_date && (
                                <Text style={{ color: '#999', fontSize: '12px' }}>
                                  {new Date(show.first_air_date).getFullYear()}
                                </Text>
                              )}
                              {show.vote_average > 0 && (
                                <Tag color="gold" style={{ margin: 0 }}>
                                  <StarFilled /> {show.vote_average.toFixed(1)}
                                </Tag>
                              )}
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {/* People Section */}
                {searchResults.people.length > 0 && (
                  <div style={{ marginBottom: '50px' }}>
                    <Title level={3} style={{ color: '#ff6b6b', marginBottom: '20px' }}>
                      People ({searchResults.people.length})
                    </Title>
                    <Row gutter={[16, 16]}>
                      {searchResults.people.map((person) => (
                        <Col xs={12} sm={8} md={6} lg={4} key={person.id}>
                          <Card
                            hoverable
                            onClick={() => navigate(`/person/${person.id}`)}
                            style={{
                              background: '#1a1a2e',
                              border: '1px solid #16213e',
                              borderRadius: '8px',
                              textAlign: 'center',
                              cursor: 'pointer'
                            }}
                            bodyStyle={{ padding: '20px' }}
                          >
                            {person.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                alt={person.name}
                                style={{
                                  width: '120px',
                                  height: '120px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  margin: '0 auto 16px'
                                }}
                              />
                            ) : (
                              <Avatar
                                size={120}
                                style={{
                                  background: '#ff6b6b',
                                  fontSize: '48px',
                                  margin: '0 auto 16px'
                                }}
                              >
                                {person.name.charAt(0)}
                              </Avatar>
                            )}
                            <Text
                              strong
                              style={{
                                color: '#fff',
                                fontSize: '16px',
                                display: 'block',
                                marginBottom: '8px'
                              }}
                            >
                              {person.name}
                            </Text>
                            {person.known_for_department && (
                              <Tag color="blue">{person.known_for_department}</Tag>
                            )}
                            {person.known_for && person.known_for.length > 0 && (
                              <Text
                                style={{
                                  color: '#999',
                                  fontSize: '12px',
                                  display: 'block',
                                  marginTop: '8px'
                                }}
                              >
                                Known for: {person.known_for[0].title || person.known_for[0].name}
                              </Text>
                            )}
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </>
            )
          ) : (
            /* Popular Movies when no search */
            initialLoading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
                <Text style={{ display: 'block', marginTop: '20px', color: '#e0e0e0' }}>
                  Loading popular movies...
                </Text>
              </div>
            ) : (
              <Tabs
                defaultActiveKey="popular"
                centered
                size="large"
                style={{ marginTop: '20px' }}
                items={[
                  {
                    key: 'popular',
                    label: (
                      <span style={{ fontSize: '16px' }}>
                        <FireOutlined /> Popular
                      </span>
                    ),
                    children: (
                      <div style={{ marginTop: '30px' }}>
                        <Row gutter={[16, 16]}>
                          {popularMovies.map(renderMovieCard)}
                        </Row>
                      </div>
                    )
                  },
                  {
                    key: 'trending',
                    label: (
                      <span style={{ fontSize: '16px' }}>
                        <RiseOutlined /> Trending
                      </span>
                    ),
                    children: (
                      <div style={{ marginTop: '30px' }}>
                        <Row gutter={[16, 16]}>
                          {trendingMovies.map(renderMovieCard)}
                        </Row>
                      </div>
                    )
                  },
                  {
                    key: 'toprated',
                    label: (
                      <span style={{ fontSize: '16px' }}>
                        <TrophyOutlined /> Top Rated
                      </span>
                    ),
                    children: (
                      <div style={{ marginTop: '30px' }}>
                        <Row gutter={[16, 16]}>
                          {topRatedMovies.map(renderMovieCard)}
                        </Row>
                      </div>
                    )
                  }
                ]}
                tabBarStyle={{
                  borderBottom: '2px solid #16213e'
                }}
              />
            )
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default SearchPage;