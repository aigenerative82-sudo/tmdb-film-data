// components/RecentlyWatchedSection.jsx
import React from 'react';
import { Row, Col, Typography, Button } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';

const { Title } = Typography;

const RecentlyWatchedSection = ({ items, onItemClick, onClearHistory }) => {
  const isMobile = window.innerWidth <= 768;

  if (!items || items.length === 0) return null;

  return (
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
          onClick={onClearHistory}
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
          {items.map((item) => (
            <Col xs={12} sm={8} md={6} lg={6} xl={4} key={item.id}>
              <div
                onClick={() => onItemClick(item.id, item.media_type)}
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
                      height: isMobile ? '200px' : '300px',
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
                    fontSize: isMobile ? '12px' : '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'white'
                  }}>
                    {item.title || item.name}
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? '10px' : '12px', 
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
  );
};

export default RecentlyWatchedSection;