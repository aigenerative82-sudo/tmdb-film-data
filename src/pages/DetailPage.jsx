

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Spin, Modal, Button, Typography, Empty, Select, Card, Row, Col, Badge, Progress } from 'antd';
import { GlobalOutlined, FullscreenOutlined, PlayCircleOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import DetailsPage from '../components/DetailsPage';
import RelatedContent from '../components/RelatedContent';
import { BASE_URL, API_KEY, STREAMING_SERVERS, getBestServer, getServersByType } from '../config';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const DOWNLOAD_STEPS = [
  'Connecting to streaming server...',
  'Locating the video source...',
  'Extracting the download link...',
  'Preparing your file...'
];

// Append an autoplay hint that most embed providers understand.
const withAutoplay = (url) => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}autoplay=1&autostart=true`;
};

const DetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef(null);
  const downloadTimerRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState(type || 'movie');
  const [showPlayer, setShowPlayer] = useState(false);
  const [trailerModalVisible, setTrailerModalVisible] = useState(false);
  const [trailers, setTrailers] = useState([]);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [expandedSeasons, setExpandedSeasons] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const [autoPlayTrailer, setAutoPlayTrailer] = useState(false);
  const [activeServer, setActiveServer] = useState(null);
  const [relatedContent, setRelatedContent] = useState([]);
  const [playerReloadKey, setPlayerReloadKey] = useState(0);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [downloadStep, setDownloadStep] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  // Save to recently watched in localStorage
  const saveToRecentlyWatched = (itemId, itemType) => {
    try {
      const stored = localStorage.getItem('recentlyWatched');
      let watchedItems = stored ? JSON.parse(stored) : [];
      watchedItems = watchedItems.filter(item => !(item.id === itemId && item.type === itemType));
      watchedItems.unshift({ id: itemId, type: itemType, timestamp: Date.now() });
      watchedItems = watchedItems.slice(0, 12);
      localStorage.setItem('recentlyWatched', JSON.stringify(watchedItems));
    } catch (err) {
      console.error('Error saving to recently watched:', err);
    }
  };

  const fetchGenres = async (contentTypeParam = 'movie') => {
    try {
      const response = await fetch(`${BASE_URL}/genre/${contentTypeParam}/list?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${BASE_URL}/configuration/countries?api_key=${API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data || []);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  const fetchRelatedContent = async (itemId, itemType) => {
    try {
      let response = await fetch(
        `${BASE_URL}/${itemType}/${itemId}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
      );
      
      let data = { results: [] };
      if (response.ok) {
        data = await response.json();
      }

      if (!data.results || data.results.length === 0) {
        response = await fetch(
          `${BASE_URL}/${itemType}/${itemId}/similar?api_key=${API_KEY}&language=en-US&page=1`
        );
        if (response.ok) {
          data = await response.json();
        }
      }

      const related = data.results?.slice(0, 12) || [];
      setRelatedContent(related);
    } catch (err) {
      console.error('Error fetching related content:', err);
      setRelatedContent([]);
    }
  };

  const fetchTrailers = async (itemId, itemType) => {
    try {
      const response = await fetch(`${BASE_URL}/${itemType}/${itemId}/videos?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) throw new Error('Failed to fetch trailers');
      const data = await response.json();
      const youtubeTrailers = data.results?.filter(
        video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
      ) || [];
      setTrailers(youtubeTrailers);
    } catch (err) {
      console.error('Error fetching trailers:', err);
      setTrailers([]);
    }
  };

  const fetchSeasonDetails = async (tvId, seasonNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`);
      if (!response.ok) throw new Error('Failed to fetch season details');
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching season details:', err);
      return null;
    }
  };

  const fetchAllSeasons = async (tvId, seasonsList) => {
    try {
      const seasonPromises = seasonsList.map(season => fetchSeasonDetails(tvId, season.season_number));
      const seasonsData = await Promise.all(seasonPromises);
      setSeasons(seasonsData.filter(s => s !== null));
    } catch (err) {
      console.error('Error fetching all seasons:', err);
    }
  };

  const fetchItemDetails = async (itemId, itemType) => {
    setLoading(true);
    setError('');
    try {
      const [itemResponse, creditsResponse] = await Promise.all([
        fetch(`${BASE_URL}/${itemType}/${itemId}?api_key=${API_KEY}&language=en-US`),
        fetch(`${BASE_URL}/${itemType}/${itemId}/credits?api_key=${API_KEY}`)
      ]);

      if (!itemResponse.ok || !creditsResponse.ok) throw new Error('Failed to fetch details');

      const itemData = await itemResponse.json();
      const creditsData = await creditsResponse.json();

      setSelectedItem({
        ...itemData,
        cast: creditsData.cast?.slice(0, 10) || []
      });

      await fetchTrailers(itemId, itemType);
      await fetchRelatedContent(itemId, itemType);

      if (itemType === 'tv' && itemData.seasons) {
        await fetchAllSeasons(itemId, itemData.seasons);
      }
    } catch (err) {
      setError(`Failed to load details: ${err.message}`);
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && type) {
      setContentType(type);
      fetchItemDetails(id, type);
      fetchGenres(type);
      fetchCountries();
      setActiveServer(getBestServer(type));
      setAutoPlayTrailer(false);
      const timer = setTimeout(() => setAutoPlayTrailer(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [id, type]);

  useEffect(() => {
    if (id && type && selectedItem) {
      saveToRecentlyWatched(id, type);
    }
  }, [id, type, selectedItem]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const landscape = window.innerHeight < window.innerWidth;
      setIsMobile(prev => prev !== mobile ? mobile : prev);
      setIsLandscape(prev => prev !== landscape ? landscape : prev);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from, { 
        state: { 
          fromDetail: true,
          searchTerm: location.state.searchTerm,
          selectedGenre: location.state.selectedGenre,
          selectedCountry: location.state.selectedCountry,
          contentType: location.state.contentType
        },
        replace: false
      });
    } else {
      const isAnime = selectedItem?.genres?.some(g => g.id === 16);
      if (type === 'movie') {
        navigate('/movies', { state: { fromDetail: true } });
      } else if (type === 'tv') {
        if (isAnime) {
          navigate('/anime', { state: { fromDetail: true } });
        } else {
          navigate('/tv-shows', { state: { fromDetail: true } });
        }
      } else {
        navigate('/', { state: { fromDetail: true } });
      }
    }
  };

  const handleHomeClick = () => navigate('/');
  
  const handleGenreSelect = (genreId) => {
    if (type === 'movie') {
      navigate(`/movies?genre=${genreId}`);
    } else if (type === 'tv') {
      navigate(`/tv-shows?genre=${genreId}`);
    } else {
      navigate('/');
    }
  };
  
  const handleCountrySelect = (countryCode) => {
    if (type === 'movie') {
      navigate(`/movies?country=${countryCode}`);
    } else if (type === 'tv') {
      navigate(`/tv-shows?country=${countryCode}`);
    } else {
      navigate('/');
    }
  };
  
  const handleAnimeClick = () => navigate('/anime');
  
  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    if (newType === 'movie') {
      navigate('/movies');
    } else if (newType === 'tv') {
      navigate('/tv-shows');
    } else {
      navigate('/');
    }
  };

  const handleRelatedItemClick = (itemId) => {
    navigate(`/detail/${contentType}/${itemId}`);
    window.scrollTo(0, 0);
  };

  // NEW: Handle cast member click
  const handleCastClick = (personId) => {
    navigate(`/person/${personId}`);
    window.scrollTo(0, 0);
  };

  const handleWatchClick = () => {
    if (contentType === 'tv') {
      if (seasons.length > 0 && seasons[0].episodes && seasons[0].episodes.length > 0) {
        setSelectedSeason(seasons[0]);
        setSelectedEpisode(seasons[0].episodes[0]);
      }
    }
    setShowPlayer(true);
    setTimeout(() => {
      document.getElementById('video-player-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleEpisodeSelect = (season, episode) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    if (!showPlayer) {
      setShowPlayer(true);
      setTimeout(() => {
        document.getElementById('video-player-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const toggleSeason = (seasonNumber) => {
    setExpandedSeasons(prev =>
      prev.includes(seasonNumber)
        ? prev.filter(s => s !== seasonNumber)
        : [...prev, seasonNumber]
    );
  };

  const buildStreamUrl = (server, type, id, season, episode) => {
    if (server.urlBuilder) {
      return server.urlBuilder(type, id, season, episode);
    }
    const serverUrl = server.url;
    if (type === 'tv' && season && episode) {
      if (serverUrl.includes('vidsrc.to')) {
        return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
      } else if (serverUrl.includes('vidsrc.me') || serverUrl.includes('vidsrc.xyz') || serverUrl.includes('vidsrc.pro')) {
        return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
      } else if (serverUrl.includes('moviesapi.club')) {
        return `${serverUrl}/tv/${id}-${season.season_number}-${episode.episode_number}`;
      } else if (serverUrl.includes('2embed.cc')) {
        return `${serverUrl}/tv/${id}?s=${season.season_number}&e=${episode.episode_number}`;
      } else if (serverUrl.includes('smashystream')) {
        return `${serverUrl}/tv/${id}?s=${season.season_number}&e=${episode.episode_number}`;
      } else if (serverUrl.includes('vidlink.pro')) {
        return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
      }
      return `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
    } else if (type === 'movie') {
      if (serverUrl.includes('2embed.cc')) {
        return `${serverUrl}/${id}`;
      }
      return `${serverUrl}/movie/${id}`;
    }
    return '';
  };

  const handleReloadPlayer = () => {
    setPlayerReloadKey(prev => prev + 1);
  };

  const startDownloadProcess = (url) => {
    if (!url) return;
    if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
    setDownloadUrl(url);
    setDownloadStep(0);
    setDownloadReady(false);
    setDownloadModalVisible(true);
    let step = 0;
    downloadTimerRef.current = setInterval(() => {
      step += 1;
      if (step >= DOWNLOAD_STEPS.length) {
        clearInterval(downloadTimerRef.current);
        downloadTimerRef.current = null;
        setDownloadStep(DOWNLOAD_STEPS.length);
        setDownloadReady(true);
      } else {
        setDownloadStep(step);
      }
    }, 1200);
  };

  const closeDownloadModal = () => {
    if (downloadTimerRef.current) {
      clearInterval(downloadTimerRef.current);
      downloadTimerRef.current = null;
    }
    setDownloadModalVisible(false);
  };

  const triggerFileDownload = () => {
    if (!downloadUrl) return;
    const fileName = selectedItem?.title || selectedItem?.name || 'video';
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    closeDownloadModal();
  };

  useEffect(() => {
    return () => {
      if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
    };
  }, []);

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen();
      } else if (iframeRef.current.mozRequestFullScreen) {
        iframeRef.current.mozRequestFullScreen();
      } else if (iframeRef.current.msRequestFullscreen) {
        iframeRef.current.msRequestFullscreen();
      }
    }
  };

  const InlinePlayer = () => {
    const tmdbId = selectedItem?.id;
    const streamingUrl = activeServer ? buildStreamUrl(activeServer, contentType, tmdbId, selectedSeason, selectedEpisode) : '';
    const availableServers = getServersByType(contentType);

    const handleServerChange = (serverName) => {
      const server = availableServers.find(s => s.name === serverName);
      if (server) {
        setActiveServer(server);
      }
    };

    const handleSeasonChange = (seasonNumber) => {
      const season = seasons.find(s => s.season_number === seasonNumber);
      if (season && season.episodes && season.episodes.length > 0) {
        setSelectedSeason(season);
        setSelectedEpisode(season.episodes[0]);
      }
    };

    return (
      <div id="video-player-section" style={{ 
        maxWidth: 1400, 
        margin: '24px auto', 
        padding: '0 16px' 
      }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ 
            padding: isMobile ? '12px 16px' : '16px 24px', 
            backgroundColor: '#0b063bff', 
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '16px',
            flexWrap: 'wrap'
          }}>
            <Title level={5} style={{ margin: 0, flex: isMobile ? '1 1 100%' : 'none' }}>
              {selectedItem?.title || selectedItem?.name}
              {selectedSeason && selectedEpisode &&
                ` - S${selectedSeason.season_number}E${selectedEpisode.episode_number}`}
            </Title>
            
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? '8px' : '12px', 
              alignItems: 'center',
              flex: 1,
              flexWrap: 'wrap'
            }}>
              <strong style={{ whiteSpace: 'nowrap' }}>Server:</strong>
              <Select
                value={activeServer?.name}
                onChange={handleServerChange}
                style={{ minWidth: isMobile ? 150 : 200 }}
                size={isMobile ? 'small' : 'middle'}
              >
                {STREAMING_SERVERS.map((server) => (
                  <Option key={server.name} value={server.name}>
                    {server.name}
                  </Option>
                ))}
              </Select>
              
              {contentType === 'tv' && seasons.length > 0 && (
                <>
                  <strong style={{ whiteSpace: 'nowrap' }}>Season:</strong>
                  <Select
                    value={selectedSeason?.season_number}
                    onChange={handleSeasonChange}
                    style={{ minWidth: isMobile ? 100 : 120 }}
                    size={isMobile ? 'small' : 'middle'}
                  >
                    {seasons.map((season) => (
                      <Option key={season.season_number} value={season.season_number}>
                        Season {season.season_number}
                      </Option>
                    ))}
                  </Select>
                </>
              )}
              
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReloadPlayer}
                disabled={!streamingUrl}
                style={{ marginLeft: 'auto' }}
              >
                {isMobile ? 'Retry' : 'Reload player'}
              </Button>

              <Button
                type="link"
                icon={<GlobalOutlined />}
                onClick={() => window.open(streamingUrl, '_blank')}
              >
                {isMobile ? 'Tab' : 'Open in new tab'}
              </Button>

              <Button
                icon={<DownloadOutlined />}
                onClick={() => startDownloadProcess(streamingUrl)}
                disabled={!streamingUrl}
              >
                {isMobile ? 'Save' : 'Download'}
              </Button>
              
              <Button
                type="primary"
                icon={<FullscreenOutlined />}
                onClick={handleFullscreen}
              >
                {isMobile ? 'Full' : 'Fullscreen'}
              </Button>
            </div>
          </div>

          <div style={{ 
            display: 'flex',
            minHeight: isMobile ? '300px' : '600px'
          }}>
            <div style={{ 
              flex: contentType === 'tv' && selectedSeason ? (isMobile ? '1' : '2') : '1',
              position: 'relative'
            }}>
              {streamingUrl ? (
                <iframe
                  ref={iframeRef}
                  key={`${streamingUrl}-${playerReloadKey}`}
                  src={withAutoplay(streamingUrl)}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="External Stream"
                  referrerPolicy="origin"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                  style={{
                    width: '100%',
                    height: isMobile ? '300px' : '600px',
                    border: 'none'
                  }}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: isMobile ? '300px' : '600px',
                  color: '#999',
                  flexDirection: 'column',
                  padding: 20,
                  textAlign: 'center'
                }}>
                  <Empty description="Please select an episode to watch" />
                  <p style={{ marginTop: 10 }}>
                    If the video doesn't load, try switching to another server
                  </p>
                </div>
              )}
            </div>

            {contentType === 'tv' && selectedSeason && !isMobile && (
              <div style={{
                flex: '1',
                overflowY: 'auto',
                borderLeft: '1px solid #e8e8e8',
                backgroundColor: '#fafafa',
                padding: '16px',
                maxHeight: '600px'
              }}>
                <Title level={5} style={{ marginBottom: '16px' }}>
                  Season {selectedSeason.season_number} Episodes
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedSeason.episodes?.map((episode) => (
                    <Card
                      key={episode.episode_number}
                      size="small"
                      hoverable
                      onClick={() => handleEpisodeSelect(selectedSeason, episode)}
                      style={{
                        cursor: 'pointer',
                        border: selectedEpisode?.episode_number === episode.episode_number 
                          ? '2px solid #1890ff' 
                          : '1px solid #d9d9d9',
                        backgroundColor: selectedEpisode?.episode_number === episode.episode_number 
                          ? '#e6f7ff' 
                          : 'white'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {episode.still_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${episode.still_path}`}
                            alt={episode.name}
                            style={{
                              width: '80px',
                              height: '45px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            <Badge 
                              count={episode.episode_number} 
                              style={{ backgroundColor: '#1890ff', marginRight: '8px' }}
                            />
                            {episode.name}
                          </div>
                          {episode.runtime && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {episode.runtime} min
                            </div>
                          )}
                        </div>
                        {selectedEpisode?.episode_number === episode.episode_number && (
                          <PlayCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {contentType === 'tv' && selectedSeason && isMobile && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fafafa',
              borderTop: '1px solid #e8e8e8'
            }}>
              <Title level={5} style={{ marginBottom: '12px' }}>
                Season {selectedSeason.season_number} Episodes
              </Title>
              <Row gutter={[8, 8]}>
                {selectedSeason.episodes?.map((episode) => (
                  <Col span={12} key={episode.episode_number}>
                    <Card
                      size="small"
                      hoverable
                      onClick={() => handleEpisodeSelect(selectedSeason, episode)}
                      style={{
                        cursor: 'pointer',
                        border: selectedEpisode?.episode_number === episode.episode_number 
                          ? '2px solid #1890ff' 
                          : '1px solid #d9d9d9',
                        backgroundColor: selectedEpisode?.episode_number === episode.episode_number 
                          ? '#e6f7ff' 
                          : 'white'
                      }}
                      bodyStyle={{ padding: '8px' }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                        Ep {episode.episode_number}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {episode.name}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const TrailerModal = () => {
    const mainTrailer = trailers.length > 0 ? trailers[0] : null;
    return (
      <Modal
        title={`Trailer: ${selectedItem?.title || selectedItem?.name}`}
        open={trailerModalVisible}
        onCancel={() => setTrailerModalVisible(false)}
        width={isMobile ? '95vw' : '90vw'}
        style={{ top: isMobile ? 20 : 20 }}
        bodyStyle={{ padding: isMobile ? 8 : 16 }}
        footer={null}
      >
        {mainTrailer ? (
          <div>
            {!isMobile && <Title level={5}>{mainTrailer.name}</Title>}
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={`https://www.youtube.com/embed/${mainTrailer.key}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={mainTrailer.name}
              />
            </div>
          </div>
        ) : (
          <Empty description="No trailers available" />
        )}
      </Modal>
    );
  };

  if (loading)
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#0f0f1e' }}>
        <Navbar
          contentType={contentType}
          setContentType={handleContentTypeChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          genres={genres}
          countries={countries}
          onHomeClick={handleHomeClick}
          onGenreSelect={handleGenreSelect}
          onCountrySelect={handleCountrySelect}
          onAnimeClick={handleAnimeClick}
        />
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );

  if (error)
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#0f0f1e' }}>
        <Navbar
          contentType={contentType}
          setContentType={handleContentTypeChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          genres={genres}
          countries={countries}
          onHomeClick={handleHomeClick}
          onGenreSelect={handleGenreSelect}
          onCountrySelect={handleCountrySelect}
          onAnimeClick={handleAnimeClick}
        />
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Empty description={error} />
        </Content>
      </Layout>
    );

  if (!selectedItem) return null;

  return (
    <Layout style={{ minHeight: '100vh', width: '100%', backgroundColor: '#0f0f1e' }}>
      <Navbar
        contentType={contentType}
        setContentType={handleContentTypeChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        genres={genres}
        countries={countries}
        onHomeClick={handleHomeClick}
        onGenreSelect={handleGenreSelect}
        onCountrySelect={handleCountrySelect}
        onAnimeClick={handleAnimeClick}
      />
      <Content style={{ width: '100%', padding: 0 }}>
        <DetailsPage
          item={selectedItem}
          loading={loading}
          contentType={contentType}
          trailers={trailers}
          seasons={seasons}
          onBack={handleBack}
          onWatchClick={handleWatchClick}
          onTrailerClick={() => setTrailerModalVisible(true)}
          onEpisodeSelect={handleEpisodeSelect}
          autoPlayTrailer={autoPlayTrailer}
          onCastClick={handleCastClick}
        />
        
        {showPlayer && <InlinePlayer />}
        
        {relatedContent && relatedContent.length > 0 && (
          <RelatedContent
            items={relatedContent}
            contentType={contentType}
            onItemClick={handleRelatedItemClick}
          />
        )}
        
        <TrailerModal />

        <Modal
          title="Preparing Download"
          open={downloadModalVisible}
          onCancel={closeDownloadModal}
          footer={null}
          maskClosable={false}
          width={isMobile ? '92vw' : 460}
        >
          <div style={{ textAlign: 'center', padding: '8px 4px' }}>
            <Title level={5} style={{ marginTop: 0 }}>
              {selectedItem?.title || selectedItem?.name}
            </Title>
            <Progress
              percent={Math.round((downloadStep / DOWNLOAD_STEPS.length) * 100)}
              status={downloadReady ? 'success' : 'active'}
            />
            {!downloadReady ? (
              <div style={{ marginTop: 16 }}>
                <Spin />
                <p style={{ marginTop: 12, color: '#555' }}>
                  {DOWNLOAD_STEPS[Math.min(downloadStep, DOWNLOAD_STEPS.length - 1)]}
                </p>
                <p style={{ fontSize: 12, color: '#999' }}>
                  This can take a moment depending on the server. Please keep this window open.
                </p>
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <p style={{ color: '#389e0d', fontWeight: 600 }}>Your file is ready.</p>
                <Button type="primary" icon={<DownloadOutlined />} block onClick={triggerFileDownload}>
                  Download
                </Button>
                <p style={{ fontSize: 12, color: '#999', marginTop: 12 }}>
                  If the download doesn&apos;t start, the file opens in a new tab where you can save it.
                  Availability depends on the selected server &mdash; try another server if it fails.
                </p>
              </div>
            )}
          </div>
        </Modal>
      </Content>
    </Layout>
  );
};

export default DetailPage;
