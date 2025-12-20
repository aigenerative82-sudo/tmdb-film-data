// components/UpcomingBanner.jsx - Black & White Theme
import React from 'react';
import { Row, Col, Typography } from 'antd';

const { Title } = Typography;

const UpcomingBanner = ({ items, type, title, onItemClick }) => {
  const isMobile = window.innerWidth <= 768;

  if (!items || items.length === 0) return null;
  
  return (
    <div style={{ 
      marginBottom: '48px',
      padding: isMobile ? '20px' : '32px',
      background: '#000000',
      borderRadius: '12px',
      color: 'white',
      border: '1px solid #333333'
    }}>
      <Title level={4} style={{ color: '#ffffff', marginBottom: '20px' }}>
        🎬 {title}
      </Title>
      
      <Row gutter={[16, 16]}>
        {items.map((item) => (
          <Col xs={12} sm={12} md={6} lg={6} key={item.id}>
            <div 
              onClick={() => onItemClick(item.id, type)}
              style={{
                cursor: 'pointer',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#1a1a1a',
                transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                border: '2px solid #333333'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = '#666666';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#333333';
              }}
            >
              <img 
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                style={{ 
                  width: '100%', 
                  height: isMobile ? '200px' : '300px',
                  objectFit: 'cover' 
                }}
              />
              <div style={{ 
                padding: '12px',
                backgroundColor: '#000000'
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: isMobile ? '12px' : '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#ffffff'
                }}>
                  {item.title || item.name}
                </div>
                {(item.release_date || item.first_air_date) && (
                  <div style={{ 
                    fontSize: isMobile ? '10px' : '12px', 
                    opacity: 0.8, 
                    marginTop: '4px',
                    color: '#cccccc'
                  }}>
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

export default UpcomingBanner;