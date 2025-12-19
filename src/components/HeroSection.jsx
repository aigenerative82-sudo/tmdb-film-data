// components/HeroSection.jsx - Complete Custom Carousel with Thumbnails
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';
const THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w300';

const HeroSection = ({ items, onItemClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next');
  const autoPlayRef = useRef(null);
  const isMobile = window.innerWidth <= 768;

  // Auto-play carousel every 7 seconds
  useEffect(() => {
    if (!items || items.length === 0) return;

    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 7000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentIndex, items]);

  // Reset auto-play timer when user interacts
  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 7000);
  };

  // Handle next slide
  const handleNext = () => {
    if (isAnimating || !items || items.length === 0) return;
    
    const newIndex = (currentIndex + 1) % items.length;
    setNextIndex(newIndex);
    setIsAnimating(true);
    setDirection('next');
    
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setNextIndex(null);
      setIsAnimating(false);
    }, 3000);
    
    resetAutoPlay();
  };

  // Handle previous slide
  const handlePrev = () => {
    if (isAnimating || !items || items.length === 0) return;
    
    const newIndex = (currentIndex - 1 + items.length) % items.length;
    setNextIndex(newIndex);
    setIsAnimating(true);
    setDirection('prev');
    
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setNextIndex(null);
      setIsAnimating(false);
    }, 3000);
    
    resetAutoPlay();
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index) => {
    if (isAnimating || index === currentIndex) return;
    
    setNextIndex(index);
    setIsAnimating(true);
    setDirection(index > currentIndex ? 'next' : 'prev');
    
    setTimeout(() => {
      setCurrentIndex(index);
      setNextIndex(null);
      setIsAnimating(false);
    }, 3000);
    
    resetAutoPlay();
  };

  // Handle watch/info button clicks
  const handleButtonClick = (itemId, mediaType) => {
    if (onItemClick) {
      onItemClick(itemId, mediaType);
    }
  };

  // Return null if no items
  if (!items || items.length === 0) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  const currentItem = items[currentIndex];
  
  // Get next items for thumbnails (circular array)
  const nextItems = [];
  for (let i = 1; i <= (isMobile ? 3 : 4); i++) {
    const index = (currentIndex + i) % items.length;
    nextItems.push({ ...items[index], actualIndex: index });
  }

  return (
    <div 
      className={`hero-carousel ${isAnimating ? direction : ''}`} 
      style={{
        marginBottom: '48px',
        marginTop: '-88px',
        marginLeft: '-24px',
        marginRight: '-24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Main Slider */}
      <div className="hero-list" style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Current Item (sliding out) */}
        <div 
          className={`hero-item ${isAnimating ? 'animating' : ''}`} 
          key={`current-${currentIndex}`}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            inset: 0,
            zIndex: isAnimating ? 2 : 1
          }}
        >
          {/* Background Image */}
          <img 
            src={`${BACKDROP_BASE_URL}${items[currentIndex].backdrop_path || items[currentIndex].poster_path}`}
            alt={items[currentIndex].title || items[currentIndex].name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1920x1080?text=No+Image';
            }}
          />
          
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isMobile 
              ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%)'
              : 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.3) 70%, transparent 100%)',
          }}>
            {/* Content */}
            <div className="hero-content" style={{
              position: 'absolute',
              bottom: isMobile ? '140px' : '180px',
              left: isMobile ? '20px' : '60px',
              maxWidth: isMobile ? '90%' : '600px',
              color: 'white',
              zIndex: 2
            }}>
              {/* Media Type Badge */}
              <div style={{
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                marginBottom: '12px',
                opacity: 0.9,
                textTransform: 'uppercase',
                color: '#ffc107'
              }}>
                {items[currentIndex].media_type === 'movie' ? '🎬 Movie' : '📺 TV Show'}
              </div>
              
              {/* Title */}
              <h1 style={{
                fontSize: isMobile ? '32px' : '56px',
                fontWeight: 'bold',
                margin: '0 0 16px 0',
                lineHeight: 1.2,
                textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
              }}>
                {items[currentIndex].title || items[currentIndex].name}
              </h1>
              
              {/* Metadata */}
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                marginBottom: '20px',
                fontSize: isMobile ? '13px' : '15px',
                flexWrap: 'wrap'
              }}>
                {items[currentIndex].vote_average && (
                  <div style={{
                    backgroundColor: 'rgba(255,193,7,0.9)',
                    color: '#000',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    ⭐ {items[currentIndex].vote_average.toFixed(1)}
                  </div>
                )}
                {(items[currentIndex].release_date || items[currentIndex].first_air_date) && (
                  <div style={{ 
                    opacity: 0.9,
                    fontWeight: '600'
                  }}>
                    {new Date(items[currentIndex].release_date || items[currentIndex].first_air_date).getFullYear()}
                  </div>
                )}
                {items[currentIndex].adult !== undefined && (
                  <div style={{
                    border: '1px solid rgba(255,255,255,0.5)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {items[currentIndex].adult ? '18+' : 'PG'}
                  </div>
                )}
              </div>
              
              {/* Overview */}
              {!isMobile && items[currentIndex].overview && (
                <p style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  marginBottom: '28px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                  maxWidth: '550px',
                  opacity: 0.95
                }}>
                  {items[currentIndex].overview}
                </p>
              )}
              
              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                flexWrap: 'wrap' 
              }}>
                <Button
                  type="primary"
                  size={isMobile ? 'middle' : 'large'}
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleButtonClick(items[currentIndex].id, items[currentIndex].media_type || 'movie')}
                  style={{
                    height: isMobile ? '40px' : '48px',
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: 'bold',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff'
                  }}
                >
                  Watch Now
                </Button>
                <Button
                  size={isMobile ? 'middle' : 'large'}
                  icon={<InfoCircleOutlined />}
                  onClick={() => handleButtonClick(items[currentIndex].id, items[currentIndex].media_type || 'movie')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    height: isMobile ? '40px' : '48px',
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: 'bold',
                    paddingLeft: '24px',
                    paddingRight: '24px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                  }}
                >
                  More Info
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Next Item (sliding in from right/left) */}
        {nextIndex !== null && (
          <div 
            className="hero-item hero-item-next" 
            key={`next-${nextIndex}`}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              inset: 0,
              zIndex: 1
            }}
          >
            {/* Background Image */}
            <img 
              src={`${BACKDROP_BASE_URL}${items[nextIndex].backdrop_path || items[nextIndex].poster_path}`}
              alt={items[nextIndex].title || items[nextIndex].name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/1920x1080?text=No+Image';
              }}
            />
            
            {/* Gradient Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isMobile 
                ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%)'
                : 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.3) 70%, transparent 100%)',
            }} />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="hero-thumbnails" style={{
        position: 'absolute',
        bottom: isMobile ? '20px' : '40px',
        right: isMobile ? '20px' : '60px',
        display: 'flex',
        gap: isMobile ? '10px' : '16px',
        zIndex: 3,
        maxWidth: isMobile ? 'calc(100% - 40px)' : '600px',
        overflowX: 'auto',
        paddingBottom: '10px'
      }}>
        {nextItems.map((item, idx) => (
          <div
            key={`${item.actualIndex}-${idx}`}
            className="hero-thumbnail-item"
            onClick={() => handleThumbnailClick(item.actualIndex)}
            style={{
              cursor: 'pointer',
              borderRadius: '8px',
              overflow: 'hidden',
              minWidth: isMobile ? '120px' : '150px',
              width: isMobile ? '120px' : '150px',
              height: isMobile ? '70px' : '90px',
              position: 'relative',
              border: '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }
            }}
          >
            <img
              src={`${THUMBNAIL_BASE_URL}${item.backdrop_path || item.poster_path}`}
              alt={item.title || item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.8
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x169?text=No+Image';
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: isMobile ? '6px' : '8px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
              color: 'white'
            }}>
              <div style={{
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.title || item.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="hero-arrows" style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        display: 'flex',
        justifyContent: 'space-between',
        padding: isMobile ? '0 10px' : '0 30px',
        zIndex: 3,
        pointerEvents: 'none'
      }}>
        <Button
          id="hero-prev"
          onClick={handlePrev}
          disabled={isAnimating}
          icon={<LeftOutlined />}
          size="large"
          style={{
            width: isMobile ? '40px' : '56px',
            height: isMobile ? '40px' : '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: isMobile ? '18px' : '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'all',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            opacity: isAnimating ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!isAnimating && !isMobile) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        />
        <Button
          id="hero-next"
          onClick={handleNext}
          disabled={isAnimating}
          icon={<RightOutlined />}
          size="large"
          style={{
            width: isMobile ? '40px' : '56px',
            height: isMobile ? '40px' : '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: isMobile ? '18px' : '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'all',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            opacity: isAnimating ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!isAnimating && !isMobile) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        />
      </div>

      {/* Progress Bar */}
      <div className="hero-time" style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        zIndex: 3
      }}>
        <div 
          className="hero-time-progress"
          key={`progress-${currentIndex}`}
          style={{
            height: '100%',
            backgroundColor: '#1890ff',
            width: '0%',
            animation: isAnimating ? 'none' : 'heroProgress 7s linear',
            transformOrigin: 'left'
          }}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* Current item slides out */
        .hero-carousel.next .hero-item.animating {
          animation: slideOutLeft 3s cubic-bezier(0.79, 0.14, 0.15, 0.86) forwards;
        }

        .hero-carousel.prev .hero-item.animating {
          animation: slideOutRight 3s cubic-bezier(0.79, 0.14, 0.15, 0.86) forwards;
        }

        /* Next item slides in */
        .hero-carousel.next .hero-item-next {
          animation: slideInFromRight 3s cubic-bezier(0.79, 0.14, 0.15, 0.86) forwards;
        }

        .hero-carousel.prev .hero-item-next {
          animation: slideInFromLeft 3s cubic-bezier(0.79, 0.14, 0.15, 0.86) forwards;
        }

        /* Slide out animations */
        @keyframes slideOutLeft {
          0% {
            transform: translateX(0) scale(1);
            filter: blur(0px);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%) scale(0.9);
            filter: blur(15px);
            opacity: 0;
          }
        }

        @keyframes slideOutRight {
          0% {
            transform: translateX(0) scale(1);
            filter: blur(0px);
            opacity: 1;
          }
          100% {
            transform: translateX(100%) scale(0.9);
            filter: blur(15px);
            opacity: 0;
          }
        }

        /* Slide in animations */
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%) scale(1.1);
            filter: blur(15px);
            opacity: 0;
          }
          100% {
            transform: translateX(0) scale(1);
            filter: blur(0);
            opacity: 1;
          }
        }

        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100%) scale(1.1);
            filter: blur(15px);
            opacity: 0;
          }
          100% {
            transform: translateX(0) scale(1);
            filter: blur(0);
            opacity: 1;
          }
        }

        /* Content fade in animation */
        .hero-content {
          animation: fadeInUpContent 1s ease-out 0.5s both;
        }

        @keyframes fadeInUpContent {
          from {
            opacity: 0;
            transform: translateY(50px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        /* Thumbnail slide in from right */
        .hero-thumbnail-item {
          animation: slideInThumbnail 0.5s ease-out both;
        }

        .hero-thumbnail-item:nth-child(1) { animation-delay: 0.6s; }
        .hero-thumbnail-item:nth-child(2) { animation-delay: 0.7s; }
        .hero-thumbnail-item:nth-child(3) { animation-delay: 0.8s; }
        .hero-thumbnail-item:nth-child(4) { animation-delay: 0.9s; }

        @keyframes slideInThumbnail {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Scrollbar styling */
        .hero-thumbnails::-webkit-scrollbar {
          height: 6px;
        }

        .hero-thumbnails::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }

        .hero-thumbnails::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 10px;
        }

        .hero-thumbnails::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 28px !important;
          }
          
          .hero-arrows button {
            width: 36px !important;
            height: 36px !important;
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;