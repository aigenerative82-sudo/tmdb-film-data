// ============================================
// COMPLETE PersonPage.jsx
// ============================================
// src/pages/PersonPage.jsx

import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Spin, Typography, Tag, Avatar, Tabs } from 'antd';
import { StarFilled, CalendarOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL, API_KEY } from '../config';
import Navbar from '../components/Navbar';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const PersonPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [personDetails, setPersonDetails] = useState(null);
  const [movieCredits, setMovieCredits] = useState([]);
  const [tvCredits, setTvCredits] = useState([]);
  const [images, setImages] = useState([]);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchGenresAndCountries();
  }, []);

  useEffect(() => {
    if (id) {
      fetchPersonData();
    }
  }, [id]);

  const fetchGenresAndCountries = async () => {
    try {
      const [genresRes, countriesRes] = await Promise.all([
        fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`),
        fetch(`${BASE_URL}/configuration/countries?api_key=${API_KEY}`)
      ]);

      const genresData = await genresRes.json();
      const countriesData = await countriesRes.json();

      setGenres(genresData.genres || []);
      setCountries(countriesData || []);
    } catch (err) {
      console.error('Error fetching genres/countries:', err);
    }
  };

  const handleGenreSelect = (genreId) => {
    navigate(`/movies?genre=${genreId}`);
  };

  const handleCountrySelect = (countryCode) => {
    navigate(`/movies?country=${countryCode}`);
  };

  const fetchPersonData = async () => {
    setLoading(true);
    try {
      const [detailsRes, creditsRes, imagesRes] = await Promise.all([
        fetch(`${BASE_URL}/person/${id}?api_key=${API_KEY}&language=en-US`),
        fetch(`${BASE_URL}/person/${id}/combined_credits?api_key=${API_KEY}&language=en-US`),
        fetch(`${BASE_URL}/person/${id}/images?api_key=${API_KEY}`)
      ]);

      const detailsData = await detailsRes.json();
      const creditsData = await creditsRes.json();
      const imagesData = await imagesRes.json();

      setPersonDetails(detailsData);
      setImages(imagesData.profiles?.slice(0, 12) || []);

      // Separate movies and TV shows
      const movies = creditsData.cast?.filter(item => item.media_type === 'movie') || [];
      const tvShows = creditsData.cast?.filter(item => item.media_type === 'tv') || [];

      // Sort by popularity and release date
      const sortedMovies = movies
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20);
      
      const sortedTvShows = tvShows
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20);

      setMovieCredits(sortedMovies);
      setTvCredits(sortedTvShows);
    } catch (err) {
      console.error('Error fetching person data:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderMediaCard = (item, type) => (
    <Col xs={12} sm={8} md={6} lg={4} key={`${type}-${item.id}`}>
      <Card
        hoverable
        onClick={() => navigate(`/detail/${type}/${item.id}`)}
        cover={
          item.poster_path ? (
            <img
              alt={item.title || item.name}
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
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
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
        bodyStyle={{ padding: '12px' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
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
          {item.title || item.name}
        </Text>
        <div style={{ marginBottom: '8px' }}>
          {item.character && (
            <Text style={{ color: '#999', fontSize: '12px', display: 'block' }}>
              as {item.character}
            </Text>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {(item.release_date || item.first_air_date) && (
            <Text style={{ color: '#999', fontSize: '12px' }}>
              {new Date(item.release_date || item.first_air_date).getFullYear()}
            </Text>
          )}
          {item.vote_average > 0 && (
            <Tag color="gold" style={{ margin: 0 }}>
              <StarFilled /> {item.vote_average.toFixed(1)}
            </Tag>
          )}
        </div>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#0f0f1e' }}>
        <Navbar 
          genres={genres}
          countries={countries}
          onGenreSelect={handleGenreSelect}
          onCountrySelect={handleCountrySelect}
          onHomeClick={() => navigate('/')}
        />
        <Content style={{ padding: '100px 24px', textAlign: 'center' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: '20px', color: '#e0e0e0' }}>
            Loading person details...
          </Text>
        </Content>
      </Layout>
    );
  }

  if (!personDetails) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#0f0f1e' }}>
        <Navbar 
          genres={genres}
          countries={countries}
          onGenreSelect={handleGenreSelect}
          onCountrySelect={handleCountrySelect}
          onHomeClick={() => navigate('/')}
        />
        <Content style={{ padding: '100px 24px', textAlign: 'center' }}>
          <Text style={{ color: '#e0e0e0', fontSize: '18px' }}>
            Person not found
          </Text>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#0f0f1e' }}>
      <Navbar 
        genres={genres}
        countries={countries}
        onGenreSelect={handleGenreSelect}
        onCountrySelect={handleCountrySelect}
        onHomeClick={() => navigate('/')}
      />
      <Content style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Person Profile Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 111, 0.05) 100%)',
            padding: '40px',
            borderRadius: '20px',
            marginBottom: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} sm={8} md={6} style={{ textAlign: 'center' }}>
                {personDetails.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${personDetails.profile_path}`}
                    alt={personDetails.name}
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid #ff6b6b',
                      boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)'
                    }}
                  />
                ) : (
                  <Avatar
                    size={200}
                    icon={<UserOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '80px',
                      border: '4px solid #ff6b6b'
                    }}
                  />
                )}
              </Col>
              <Col xs={24} sm={16} md={18}>
                <Title level={1} style={{ color: '#fff', marginBottom: '16px', fontSize: '36px' }}>
                  {personDetails.name}
                </Title>
                
                <div style={{ marginBottom: '20px' }}>
                  {personDetails.known_for_department && (
                    <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                      {personDetails.known_for_department}
                    </Tag>
                  )}
                  {personDetails.popularity && (
                    <Tag color="gold" style={{ fontSize: '14px', padding: '4px 12px', marginLeft: '8px' }}>
                      <StarFilled /> Popularity: {personDetails.popularity.toFixed(1)}
                    </Tag>
                  )}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  {personDetails.birthday && (
                    <Text style={{ color: '#e0e0e0', display: 'block', marginBottom: '8px' }}>
                      <CalendarOutlined style={{ marginRight: '8px', color: '#ff6b6b' }} />
                      Born: {new Date(personDetails.birthday).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {personDetails.deathday && ` - Died: ${new Date(personDetails.deathday).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}`}
                      {!personDetails.deathday && personDetails.birthday && (
                        <span style={{ marginLeft: '8px', color: '#999' }}>
                          (Age: {new Date().getFullYear() - new Date(personDetails.birthday).getFullYear()})
                        </span>
                      )}
                    </Text>
                  )}
                  {personDetails.place_of_birth && (
                    <Text style={{ color: '#e0e0e0', display: 'block' }}>
                      <EnvironmentOutlined style={{ marginRight: '8px', color: '#ff6b6b' }} />
                      {personDetails.place_of_birth}
                    </Text>
                  )}
                </div>

                {personDetails.biography && (
                  <Paragraph 
                    ellipsis={{ rows: 4, expandable: true, symbol: 'Read more' }}
                    style={{ color: '#b0b0b0', marginTop: '16px', fontSize: '15px', lineHeight: '1.6' }}
                  >
                    {personDetails.biography}
                  </Paragraph>
                )}
              </Col>
            </Row>
          </div>

          {/* Photo Gallery */}
          {images.length > 0 && (
            <div style={{
              background: '#1a1a2e',
              padding: '30px',
              borderRadius: '20px',
              marginBottom: '40px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              <Title level={3} style={{ color: '#ff6b6b', marginBottom: '24px' }}>
                Photos ({images.length})
              </Title>
              <Row gutter={[16, 16]}>
                {images.map((image, index) => (
                  <Col xs={12} sm={8} md={6} lg={4} key={index}>
                    <div
                      style={{
                        position: 'relative',
                        paddingBottom: '150%',
                        overflow: 'hidden',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                        alt={`${personDetails.name} ${index + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Movies and TV Shows Tabs */}
          <div style={{
            background: '#1a1a2e',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <Tabs
              defaultActiveKey="movies"
              centered
              size="large"
              items={[
                {
                  key: 'movies',
                  label: (
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      Movies ({movieCredits.length})
                    </span>
                  ),
                  children: (
                    <div style={{ marginTop: '30px' }}>
                      {movieCredits.length > 0 ? (
                        <Row gutter={[16, 16]}>
                          {movieCredits.map(movie => renderMediaCard(movie, 'movie'))}
                        </Row>
                      ) : (
                        <Text style={{ color: '#e0e0e0', display: 'block', textAlign: 'center', padding: '40px' }}>
                          No movies found
                        </Text>
                      )}
                    </div>
                  )
                },
                {
                  key: 'tv',
                  label: (
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      TV Shows ({tvCredits.length})
                    </span>
                  ),
                  children: (
                    <div style={{ marginTop: '30px' }}>
                      {tvCredits.length > 0 ? (
                        <Row gutter={[16, 16]}>
                          {tvCredits.map(show => renderMediaCard(show, 'tv'))}
                        </Row>
                      ) : (
                        <Text style={{ color: '#e0e0e0', display: 'block', textAlign: 'center', padding: '40px' }}>
                          No TV shows found
                        </Text>
                      )}
                    </div>
                  )
                }
              ]}
              tabBarStyle={{
                borderBottom: '2px solid #16213e'
              }}
            />
          </div>

          <style>
            {`
              .ant-tabs-tab {
                color: #fff !important;
              }
              
              .ant-tabs-tab:hover {
                color: #ff6b6b !important;
              }
              
              .ant-tabs-tab-active .ant-tabs-tab-btn {
                color: #ff6b6b !important;
              }
              
              .ant-tabs-ink-bar {
                background: #ff6b6b !important;
              }
            `}
          </style>
        </div>
      </Content>
    </Layout>
  );
};

export default PersonPage;