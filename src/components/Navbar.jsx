// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Space, Dropdown, Menu, Drawer, Button, Avatar, Modal } from 'antd';
import { 
  HomeOutlined, 
  DownOutlined, 
  MenuOutlined,
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  PlayCircleOutlined,
  GlobalOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;

export const Navbar = ({ 
  genres, 
  countries,
  onGenreSelect,
  onCountrySelect
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [genreModalVisible, setGenreModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Dropdown visibility states
  const [genreDropdownVisible, setGenreDropdownVisible] = useState(false);
  const [countryDropdownVisible, setCountryDropdownVisible] = useState(false);
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentPath = location.pathname || '/';

  const genreMenu = (
    <Menu 
      style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        padding: '16px',
        background: '#000000',
        border: '1px solid #333333',
        borderRadius: '12px',
        minWidth: '600px',
        maxWidth: '700px',
        maxHeight: '420px',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9)'
      }}
      items={genres?.map(genre => ({
        key: genre.id,
        label: (
          <div
            onClick={() => {
              onGenreSelect(parseInt(genre.id));
              setGenreDropdownVisible(false); // Close dropdown after click
            }}
            style={{
              color: '#ffffff',
              padding: '10px 12px',
              cursor: 'pointer',
              borderRadius: '8px',
              background: '#111111',
              border: '1px solid #222222',
              transition: 'all 0.25s ease',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = '#000000';
              e.currentTarget.style.borderColor = '#ffffff';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#111111';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = '#222222';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {genre.name}
          </div>
        ),
        style: { padding: 0, margin: 0 }
      }))}
    />
  );

  const priorityCountries = ['US', 'GB', 'KR', 'JP', 'IN', 'FR', 'CA', 'DE', 'ES', 'IT', 'CN', 'HK', 'TH', 'MX', 'BR', 'AU'];
  
  const sortedCountries = countries ? [...countries].sort((a, b) => {
    const aIndex = priorityCountries.indexOf(a.iso_3166_1);
    const bIndex = priorityCountries.indexOf(b.iso_3166_1);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.english_name.localeCompare(b.english_name);
  }) : [];

  const countryMenu = (
    <Menu
      style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        padding: '16px',
        background: '#000000',
        border: '1px solid #333333',
        borderRadius: '12px',
        minWidth: '600px',
        maxWidth: '700px',
        maxHeight: '420px',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9)'
      }}
      items={sortedCountries.map((country, index) => {
        const isPriority = priorityCountries.includes(country.iso_3166_1);
        return {
          key: country.iso_3166_1,
          label: (
            <div
              onClick={() => {
                onCountrySelect(country.iso_3166_1);
                setCountryDropdownVisible(false); // Close dropdown after click
              }}
              style={{
                color: '#ffffff',
                padding: '10px 12px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: isPriority ? '#1a1a1a' : '#111111',
                border: isPriority ? '1px solid #444444' : '1px solid #222222',
                transition: 'all 0.25s ease',
                fontSize: '13px',
                textAlign: 'center',
                fontWeight: '500',
                position: 'relative',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.borderColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isPriority ? '#1a1a1a' : '#111111';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = isPriority ? '#444444' : '#222222';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {country.english_name}
              {isPriority && index < 8 && (
                <StarOutlined style={{ fontSize: '9px', opacity: 0.5, marginLeft: '4px' }} />
              )}
            </div>
          ),
          style: { padding: 0, margin: 0 }
        };
      })}
    />
  );

  const profileMenu = (
    <Menu 
      style={{ 
        background: '#000000', 
        border: '1px solid #333333',
        borderRadius: '8px',
        minWidth: '160px'
      }}
      onClick={() => setProfileDropdownVisible(false)} // Close on any item click
      items={[
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'My Profile',
          style: { color: '#ffffff', padding: '10px 16px', fontSize: '14px' }
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Settings',
          style: { color: '#ffffff', padding: '10px 16px', fontSize: '14px' }
        },
        {
          type: 'divider',
          style: { background: '#333333', margin: '6px 0' }
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          style: { color: '#ffffff', padding: '10px 16px', fontSize: '14px' }
        }
      ]}
    />
  );

  const isActive = (path) => currentPath === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: <HomeOutlined /> },
    { path: '/movies', label: 'Movies', icon: <PlayCircleOutlined /> },
    { path: '/tv-shows', label: 'TV Shows', icon: <PlayCircleOutlined /> },
    { path: '/anime', label: 'Anime', icon: <StarOutlined /> }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const mobileMenuItems = (
    <Menu 
      mode="vertical" 
      style={{ border: 'none', background: '#000000' }}
      items={[
        ...navLinks.map(link => ({
          key: link.path,
          icon: link.icon,
          label: link.label,
          onClick: () => {
            handleNavigation(link.path);
            setDrawerVisible(false);
          },
          style: { 
            fontWeight: isActive(link.path) ? 'bold' : 'normal',
            color: '#ffffff',
            background: isActive(link.path) ? '#1a1a1a' : 'transparent',
            padding: '14px 20px',
            margin: '4px 8px',
            borderRadius: '8px',
            fontSize: '15px'
          }
        })),
        {
          type: 'divider',
          style: { background: '#333333', margin: '12px 8px' }
        },
        {
          key: 'genre',
          icon: <GlobalOutlined />,
          label: 'Browse by Genre',
          onClick: () => {
            setGenreModalVisible(true);
            setDrawerVisible(false);
          },
          style: { 
            color: '#ffffff',
            padding: '14px 20px',
            margin: '4px 8px',
            borderRadius: '8px',
            fontSize: '15px'
          }
        },
        {
          key: 'country',
          icon: <GlobalOutlined />,
          label: 'Browse by Country',
          onClick: () => {
            setCountryModalVisible(true);
            setDrawerVisible(false);
          },
          style: { 
            color: '#ffffff',
            padding: '14px 20px',
            margin: '4px 8px',
            borderRadius: '8px',
            fontSize: '15px'
          }
        },
        {
          type: 'divider',
          style: { background: '#333333', margin: '12px 8px' }
        },
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'My Profile',
          style: { 
            color: '#ffffff',
            padding: '14px 20px',
            margin: '4px 8px',
            borderRadius: '8px',
            fontSize: '15px'
          }
        }
      ]}
    />
  );

  return (
    <>
      <style>
        {`
          .ant-menu-item:hover {
            background: #1a1a1a !important;
          }
          
          .ant-dropdown-menu-item:hover {
            background: #1a1a1a !important;
          }

          /* Custom scrollbar */
          .ant-menu::-webkit-scrollbar,
          div[style*="overflowY"]::-webkit-scrollbar {
            width: 6px;
          }

          .ant-menu::-webkit-scrollbar-track,
          div[style*="overflowY"]::-webkit-scrollbar-track {
            background: #0a0a0a;
            border-radius: 3px;
          }

          .ant-menu::-webkit-scrollbar-thumb,
          div[style*="overflowY"]::-webkit-scrollbar-thumb {
            background: #333333;
            border-radius: 3px;
          }

          .ant-menu::-webkit-scrollbar-thumb:hover,
          div[style*="overflowY"]::-webkit-scrollbar-thumb:hover {
            background: #555555;
          }

          .ant-modal-content {
            background: #000000 !important;
            border: 1px solid #333333 !important;
          }

          .ant-modal-header {
            background: #000000 !important;
            border-bottom: 1px solid #333333 !important;
          }

          .ant-modal-title {
            color: #ffffff !important;
          }

          .ant-modal-close-x {
            color: #ffffff !important;
          }

          .ant-drawer-header {
            background: #000000 !important;
            border-bottom: 1px solid #333333 !important;
          }

          .ant-drawer-title {
            color: #ffffff !important;
          }

          .ant-drawer-close {
            color: #ffffff !important;
          }

          .ant-drawer-body {
            background: #000000 !important;
          }

          /* Grid layout for dropdowns */
          .ant-dropdown-menu.grid-menu {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
          }

          .ant-dropdown-menu.grid-menu .ant-dropdown-menu-item {
            padding: 0 !important;
            margin: 0 !important;
          }
        `}
      </style>
      <Header 
        style={{ 
          background: scrolled ? '#000000' : 'rgba(0, 0, 0, 0.95)',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          padding: '0 40px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: scrolled 
            ? '0 2px 16px rgba(0, 0, 0, 0.8), 0 1px 0 0 rgba(255, 255, 255, 0.8) inset, 0 -2px 8px rgba(255, 255, 255, 0.3)' 
            : '0 -2px 8px rgba(255, 255, 255, 0.3)',
          borderBottom: '2px solid #ffffff',
          transition: 'all 0.3s ease',
          height: '64px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {!isMobile && (
          <Row justify="space-between" align="middle" style={{ width: '100%' }}>
            {/* Logo */}
            <Col>
              <Space 
                align="center" 
                style={{ cursor: 'pointer' }} 
                onClick={() => handleNavigation('/')}
                size={12}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(255, 255, 255, 0.15)'
                }}>
                  <PlayCircleOutlined style={{ fontSize: 20, color: '#000000' }} />
                </div>
                <span style={{ 
                  fontSize: 24, 
                  fontWeight: '900',
                  color: '#ffffff',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }}>
                  VIKI
                </span>
              </Space>
            </Col>

            {/* Navigation Links */}
            <Col>
              <Space size={8}>
                {navLinks.map(link => (
                  <div
                    key={link.path}
                    style={{ 
                      color: isActive(link.path) ? '#ffffff' : '#999999',
                      cursor: 'pointer',
                      fontWeight: isActive(link.path) ? '600' : '500',
                      fontSize: '14px',
                      transition: 'all 0.25s ease',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: isActive(link.path) ? '#1a1a1a' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      height: '36px'
                    }} 
                    onClick={() => handleNavigation(link.path)}
                    onMouseEnter={(e) => {
                      if (!isActive(link.path)) {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.background = '#0f0f0f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(link.path)) {
                        e.currentTarget.style.color = '#999999';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{link.icon}</span>
                    {link.label}
                  </div>
                ))}
                
                <Dropdown 
                  overlay={genreMenu}
                  trigger={['click']}
                  placement="bottomCenter"
                  open={genreDropdownVisible}
                  onOpenChange={setGenreDropdownVisible}
                  overlayClassName="grid-menu"
                >
                  <div
                    style={{ 
                      color: '#999999', 
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.25s ease',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      height: '36px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.background = '#0f0f0f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999999';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <GlobalOutlined style={{ fontSize: '14px' }} />
                    Genre
                    <DownOutlined style={{ fontSize: '10px' }} />
                  </div>
                </Dropdown>
                
                <Dropdown 
                  overlay={countryMenu}
                  trigger={['click']}
                  placement="bottomCenter"
                  open={countryDropdownVisible}
                  onOpenChange={setCountryDropdownVisible}
                  overlayClassName="grid-menu"
                >
                  <div
                    style={{ 
                      color: '#999999', 
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.25s ease',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      height: '36px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.background = '#0f0f0f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999999';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <GlobalOutlined style={{ fontSize: '14px' }} />
                    Country
                    <DownOutlined style={{ fontSize: '10px' }} />
                  </div>
                </Dropdown>
              </Space>
            </Col>

            {/* Right Actions */}
            <Col>
              <Space size={8}>
                <Button
                  type="text"
                  icon={<SearchOutlined style={{ fontSize: 18, color: '#999999' }} />}
                  onClick={() => navigate('/search')}
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'all 0.25s ease',
                    padding: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0f0f0f';
                    e.currentTarget.querySelector('span').style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.querySelector('span').style.color = '#999999';
                  }}
                />
                <Dropdown 
                  overlay={profileMenu}
                  trigger={['click']}
                  placement="bottomRight"
                  open={profileDropdownVisible}
                  onOpenChange={setProfileDropdownVisible}
                >
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      size={36}
                      icon={<UserOutlined />}
                      style={{ 
                        background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                        color: '#000000',
                        border: '2px solid #2a2a2a',
                        boxShadow: '0 2px 8px rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 255, 255, 0.1)';
                      }}
                    />
                  </div>
                </Dropdown>
              </Space>
            </Col>
          </Row>
        )}

        {isMobile && (
          <Row justify="space-between" align="middle" style={{ width: '100%' }}>
            <Col>
              <Space 
                align="center" 
                onClick={() => handleNavigation('/')} 
                style={{ cursor: 'pointer' }}
                size={10}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PlayCircleOutlined style={{ fontSize: 18, color: '#000000' }} />
                </div>
                <span style={{ 
                  fontSize: 20, 
                  fontWeight: '900',
                  color: '#ffffff',
                  letterSpacing: '1.5px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }}>
                  VIKI
                </span>
              </Space>
            </Col>
            <Col>
              <Space size={4}>
                <Button
                  type="text"
                  icon={<SearchOutlined style={{ fontSize: 18, color: '#999999' }} />}
                  onClick={() => navigate('/search')}
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                />
                <Button
                  type="text"
                  icon={<MenuOutlined style={{ fontSize: 18, color: '#999999' }} />}
                  onClick={() => setDrawerVisible(true)}
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                />
              </Space>
            </Col>
          </Row>
        )}
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Space align="center">
            <div style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlayCircleOutlined style={{ fontSize: 18, color: '#000000' }} />
            </div>
            <span style={{ fontWeight: '900', letterSpacing: '2px' }}>VIKI</span>
          </Space>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ background: '#000000', padding: '12px' }}
        headerStyle={{ 
          background: '#000000', 
          color: '#fff', 
          borderBottom: '1px solid #333333',
          padding: '16px 20px'
        }}
        width="80%"
      >
        {mobileMenuItems}
      </Drawer>

      {/* Mobile Modals */}
      <Modal
        title={
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            <GlobalOutlined style={{ marginRight: '8px' }} />
            Select Genre
          </div>
        }
        open={genreModalVisible}
        onCancel={() => setGenreModalVisible(false)}
        footer={null}
        centered
        bodyStyle={{ 
          background: '#000000', 
          maxHeight: '65vh', 
          overflowY: 'auto',
          padding: '20px'
        }}
        width="90%"
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px'
        }}>
          {genres?.map(genre => (
            <div
              key={genre.id}
              onClick={() => {
                onGenreSelect(parseInt(genre.id));
                setGenreModalVisible(false);
              }}
              style={{
                color: '#ffffff',
                padding: '14px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: '#111111',
                border: '1px solid #222222',
                fontSize: '13px',
                textAlign: 'center',
                fontWeight: '500'
              }}
            >
              {genre.name}
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        title={
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            <GlobalOutlined style={{ marginRight: '8px' }} />
            Select Country
          </div>
        }
        open={countryModalVisible}
        onCancel={() => setCountryModalVisible(false)}
        footer={null}
        centered
        bodyStyle={{ 
          background: '#000000', 
          maxHeight: '65vh', 
          overflowY: 'auto',
          padding: '20px'
        }}
        width="90%"
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {sortedCountries.map((country, index) => {
            const isPriority = priorityCountries.includes(country.iso_3166_1);
            return (
              <div
                key={country.iso_3166_1}
                onClick={() => {
                  onCountrySelect(country.iso_3166_1);
                  setCountryModalVisible(false);
                }}
                style={{
                  color: '#ffffff',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  background: isPriority ? '#1a1a1a' : '#111111',
                  border: isPriority ? '1px solid #444444' : '1px solid #222222',
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{country.english_name}</span>
                {isPriority && index < 8 && (
                  <StarOutlined style={{ fontSize: '11px', opacity: 0.6 }} />
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
