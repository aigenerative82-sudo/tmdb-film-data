// components/ContentSection.jsx - Black & White Theme
import React from 'react';
import { Row, Col, Typography, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import ContentCard from './ContentCard';

const { Title } = Typography;

const ContentSection = ({ 
  title, 
  items, 
  onSeeMore, 
  type, 
  visibleCount, 
  onLoadMore, 
  hideViewAll,
  onItemClick 
}) => {
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
        <Title level={3} style={{ margin: 0, color: '#ffffff' }}>{title}</Title>
      </div>
      
      <Row gutter={[16, 16]}>
        {items.slice(0, visibleCount).map((item) => (
          <Col xs={12} sm={8} md={6} lg={6} xl={3} key={item.id}>
            <ContentCard
              item={item}
              contentType={type || item.media_type}
              onClick={() => onItemClick(item.id, type || item.media_type)}
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
            style={{
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              borderColor: '#666666'
            }}
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
            style={{
              backgroundColor: '#333333',
              color: '#ffffff',
              borderColor: '#666666'
            }}
          >
            See All
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContentSection;