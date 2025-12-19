// components/ContentSection.jsx
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
};

export default ContentSection;