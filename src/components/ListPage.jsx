// ListPage.jsx
import React from 'react';
import { Row, Col, Spin, Alert, Typography, Empty, Divider } from 'antd';
import FilterBar from './FilterBar';
import ContentCard from './ContentCard';

const { Text } = Typography;

export const ListPage = ({ 
  items, 
  loading, 
  loadingMore,
  error, 
  contentType,
  currentEndpoint,
  currentPage,
  totalPages,
  hasMore,
  searchTerm,
  selectedGenre,
  selectedCountry,
  onCategoryChange,
  onItemClick
}) => {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* <FilterBar 
        contentType={contentType}
        currentEndpoint={currentEndpoint}
        onCategoryChange={onCategoryChange}
      /> */}

      {error && (
        <Alert
          message="Error"
          description={
            <div>
              <p>{error}</p>
              <p>Please check your internet connection and try again.</p>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Spin spinning={loading} size="large">
        {!loading && !error && items.length > 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Showing {items.length} {contentType === 'movie' ? 'movies' : 'TV shows'}
                {selectedGenre && ` in ${selectedGenre.name}`}
                {selectedCountry && ` from ${selectedCountry.english_name}`}
                {searchTerm && ` for "${searchTerm}"`}
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </Text>
            </div>

            <Row gutter={[16, 16]}>
              {items.map((item) => (
                <Col 
                  key={`${item.id}-${items.indexOf(item)}`} 
                  xs={24} 
                  sm={12} 
                  md={8} 
                  lg={6} 
                  xl={4}
                  id={`movie-item-${item.id}`}
                >
                  <ContentCard 
                    item={item} 
                    contentType={contentType}
                    onClick={() => onItemClick(item.id)} 
                  />
                </Col>
              ))}
            </Row>

            {loadingMore && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Loading more {contentType === 'movie' ? 'movies' : 'TV shows'}...</Text>
                </div>
              </div>
            )}

            {!hasMore && items.length > 0 && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Divider>
                  <Text type="secondary">No more {contentType === 'movie' ? 'movies' : 'TV shows'} to load</Text>
                </Divider>
              </div>
            )}
          </>
        )}

        {!loading && !error && items.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchTerm 
                ? `No results for "${searchTerm}". Try a different search term.`
                : `Click on a category button to load ${contentType === 'movie' ? 'movies' : 'TV shows'}`
            }
          />
        )}
      </Spin>
    </div>
  );
};

export default ListPage;