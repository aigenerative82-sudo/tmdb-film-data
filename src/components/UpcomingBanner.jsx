// components/UpcomingBanner.jsx
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
              onClick={() => onItemClick(item.id, type)}
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
                  height: isMobile ? '200px' : '300px',
                  objectFit: 'cover' 
                }}
              />
              <div style={{ padding: '12px' }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: isMobile ? '12px' : '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.title || item.name}
                </div>
                {(item.release_date || item.first_air_date) && (
                  <div style={{ 
                    fontSize: isMobile ? '10px' : '12px', 
                    opacity: 0.8, 
                    marginTop: '4px' 
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