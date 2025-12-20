// components/RecentlyWatchedSection.jsx - Black & White Theme
import React from 'react';
import { Row, Col, Typography, Button } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';

const { Title } = Typography;

const RecentlyWatchedSection = ({ items, onItemClick, onClearHistory }) => {
  const isMobile = window.innerWidth <= 768;

  if (!items || items.length === 0) return null;

  return (
    <div style={{ 
      marginBottom: '48px',
      backgroundColor: '#000000',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #333333'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
          <HistoryOutlined style={{ color: '#ffffff' }} />
          Continue Watching
        </Title>
        <Button 
          type="link" 
          danger
          onClick={onClearHistory}
          style={{
            color: '#ff4d4f'
          }}
        >
          Clear History
        </Button>
      </div>
      
      <div style={{
        padding: '20px',
        background: '#1a1a1a',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '1px solid #333333'
      }}>
        <Row gutter={[16, 16]}>
          {items.map((item) => (
            <Col xs={12} sm={8} md={6} lg={6} xl={4} key={item.id}>
              <div
                onClick={() => onItemClick(item.id, item.media_type)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#000000',
                  transition: 'all 0.3s',
                  border: '2px solid #333333',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = '#666666';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#333333';
                }}
              >
                <div style={{ position: 'relative' }}>
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
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: '1px solid #666666'
                  }}>
                    <HistoryOutlined style={{ marginRight: '4px' }} />
                    RECENT
                  </div>
                </div>
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
                  <div style={{ 
                    fontSize: isMobile ? '10px' : '12px', 
                    opacity: 0.8, 
                    marginTop: '4px',
                    color: '#cccccc'
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
  );
};

export default RecentlyWatchedSection;