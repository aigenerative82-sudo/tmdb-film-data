// components/SearchResults.jsx
import React from 'react';
import { Row, Col, Typography, Button } from 'antd';
import ContentSection from './ContentSection';

const { Title } = Typography;

const SearchResults = ({ 
  searchResults, 
  searchTerm, 
  onItemClick, 
  onNavigate,
  onClearSearch 
}) => {
  if (!searchResults) return null;

  const hasResults = searchResults.movies.length > 0 || 
                    searchResults.tvShows.length > 0 || 
                    searchResults.people.length > 0;

  if (!hasResults) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Title level={4}>No results found for "{searchTerm}"</Title>
        <Button type="primary" onClick={onClearSearch}>
          Clear Search
        </Button>
      </div>
    );
  }

  return (
    <>
      {searchResults.movies.length > 0 && (
        <ContentSection
          title={`Movie Results (${searchResults.movies.length})`}
          items={searchResults.movies}
          onSeeMore={() => onNavigate('/movies')}
          type="movie"
          visibleCount={searchResults.movies.length}
          onLoadMore={() => {}}
          hideViewAll={true}
          onItemClick={onItemClick}
        />
      )}
      
      {searchResults.tvShows.length > 0 && (
        <ContentSection
          title={`TV Show Results (${searchResults.tvShows.length})`}
          items={searchResults.tvShows}
          onSeeMore={() => onNavigate('/tv-shows')}
          type="tv"
          visibleCount={searchResults.tvShows.length}
          onLoadMore={() => {}}
          hideViewAll={true}
          onItemClick={onItemClick}
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
    </>
  );
};

export default SearchResults;