// ContentCard.jsx - Black background with white text
import React, { useState, useEffect } from 'react';
import { Card, Image, Typography, Tag } from 'antd';
import { StarFilled, VideoCameraOutlined, CalendarOutlined, PlaySquareOutlined } from '@ant-design/icons';
import { IMAGE_BASE_URL } from '../config';

const { Meta } = Card;
const { Text } = Typography;

export const ContentCard = ({ item, contentType, onClick }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if it's a movie or TV show
  const isMovie = contentType === 'movie' || item.media_type === 'movie' || item.title;
  const isTv = contentType === 'tv' || item.media_type === 'tv' || item.name;
  
  const getContentTypeTag = () => {
    if (isMovie) {
      return (
        <Tag 
          color="blue" 
          icon={<VideoCameraOutlined />}
          style={{ 
            fontSize: isMobile ? '9px' : '10px', 
            fontWeight: 'bold', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 6px'
          }}
        >
          MOVIE
        </Tag>
      );
    } else if (isTv) {
      return (
        <Tag 
          color="purple" 
          icon={<PlaySquareOutlined />}
          style={{ 
            fontSize: isMobile ? '9px' : '10px', 
            fontWeight: 'bold', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 6px'
          }}
        >
          TV SHOW
        </Tag>
      );
    }
    return null;
  };

  return (
    <Card
      hoverable
      style={{ 
        marginBottom: 16, 
        height: '100%',
        backgroundColor: '#000000',
        border: '1px solid #333333'
      }}
      bodyStyle={{ 
        padding: isMobile ? '10px 12px' : '8px 12px',
        backgroundColor: '#000000'
      }}
      cover={
        <div style={{ position: 'relative', width: '100%', paddingBottom: '150%', overflow: 'hidden' }}>
          {item.poster_path ? (
            <img
              alt={item.title || item.name}
              src={`${IMAGE_BASE_URL}${item.poster_path}`}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #1a1a1a;">
                    <svg width="48" height="48" fill="#666666" viewBox="64 64 896 896">
                      <path d="M912 302.3L784 376V224c0-35.3-28.7-64-64-64H128c-35.3 0-64 28.7-64 64v352c0 35.3 28.7 64 64 64h592c35.3 0 64-28.7 64-64V424l128 73.7c21.3 12.3 48-3.1 48-27.6V330c0-24.6-26.7-40-48-27.7zM712 576H128V224h584v352z"/>
                    </svg>
                  </div>
                `;
              }}
            />
          ) : (
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#1a1a1a'
            }}>
              <VideoCameraOutlined style={{ fontSize: 48, color: '#666666' }} />
            </div>
          )}
          
          {/* Content Type Tag - Top Right */}
          <div style={{ 
            position: 'absolute', 
            top: 6, 
            right: 6,
            zIndex: 2
          }}>
            {getContentTypeTag()}
          </div>

          {/* Rating Badge - Top Left */}
          {item.vote_average > 0 && (
            <div style={{ 
              position: 'absolute', 
              top: 6, 
              left: 6, 
              background: 'rgba(0, 0, 0, 0.75)',
              padding: isMobile ? '4px 7px' : '3px 6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              zIndex: 2
            }}>
              <StarFilled style={{ color: '#fadb14', fontSize: isMobile ? '13px' : '12px' }} />
              <span style={{ 
                color: 'white', 
                fontSize: isMobile ? '12px' : '11px', 
                fontWeight: 'bold' 
              }}>
                {item.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      }
      onClick={onClick}
    >
      <Meta
        title={
          <div style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            fontSize: isMobile ? '15px' : '13px',
            fontWeight: 600,
            marginBottom: isMobile ? 6 : 4,
            lineHeight: '1.3',
            color: '#ffffff'
          }}>
            {item.title || item.name}
          </div>
        }
        description={
          <Text style={{ 
            fontSize: isMobile ? '12px' : '11px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 3,
            color: '#cccccc'
          }}>
            <CalendarOutlined style={{ fontSize: isMobile ? '12px' : '11px', color: '#cccccc' }} /> 
            {item.release_date || item.first_air_date || 'N/A'}
          </Text>
        }
      />
    </Card>
  );
};

export default ContentCard;