// config.js
export const API_KEY = 'ffc5385a41a65394115a1346134c47f8';
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

export const STREAMING_SERVERS = [
  // ========== GLOBAL SERVERS (Top Priority) ==========
  { 
    name: 'VidSrc.to', 
    url: 'https://vidsrc.to/embed',
    priority: 1,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'VidSrc.pro', 
    url: 'https://vidsrc.pro/embed',
    priority: 2,
    supports: ['movie', 'tv'],
    region: 'global'
  },
  { 
    name: 'SuperEmbed', 
    url: 'https://multiembed.mov/directstream.php',
    priority: 3,
    supports: ['movie', 'tv'],
    region: 'global',
    urlBuilder: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://multiembed.mov/directstream.php?video_id=${id}&s=${season.season_number}&e=${episode.episode_number}`;
      }
      return `https://multiembed.mov/directstream.php?video_id=${id}`;
    }
  },
  { 
    name: 'Embed.su', 
    url: 'https://embed.su/embed',
    priority: 4,
    supports: ['movie', 'tv'],
    region: 'global',
    urlBuilder: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://embed.su/embed/tv/${id}/${season.season_number}/${episode.episode_number}`;
      }
      return `https://embed.su/embed/movie/${id}`;
    }
  },
  { 
    name: '2Embed', 
    url: 'https://www.2embed.cc/embed',
    priority: 5,
    supports: ['movie', 'tv'],
    region: 'global'
  },

  // ========== INDIAN CONTENT SERVERS ==========
  { 
    name: 'BollyFlix', 
    url: 'https://bollyflix.video/embed',
    priority: 10,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'VegaMovies', 
    url: 'https://vegamovies.st/embed',
    priority: 11,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'HDHub4u', 
    url: 'https://hdhub4u.mov/embed',
    priority: 12,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'MoviesVerse', 
    url: 'https://moviesverse.mov/embed',
    priority: 13,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'MkvCinemas', 
    url: 'https://mkvcinemas.com/embed',
    priority: 14,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'FilmyZilla', 
    url: 'https://filmyzilla.digital/embed',
    priority: 15,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'DesiCinemas', 
    url: 'https://desicinemas.tv/embed',
    priority: 16,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'HindiLinks4u', 
    url: 'https://hindilinks4u.to/embed',
    priority: 17,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'Hotstar Mirror', 
    url: 'https://hotstar-mirror.vercel.app/embed',
    priority: 18,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'Zee5 Stream', 
    url: 'https://zee5stream.com/embed',
    priority: 19,
    supports: ['movie', 'tv'],
    region: 'indian'
  },
  { 
    name: 'SonyLiv Mirror', 
    url: 'https://sonyliv.uno/embed',
    priority: 20,
    supports: ['movie', 'tv'],
    region: 'indian'
  },

  // ========== MALAYALAM CONTENT SERVERS ==========
  { 
    name: 'MalayalamMovies', 
    url: 'https://malayalammovies.net/embed',
    priority: 25,
    supports: ['movie', 'tv'],
    region: 'malayalam'
  },
  { 
    name: 'MalluWatch', 
    url: 'https://malluwatch.com/embed',
    priority: 26,
    supports: ['movie', 'tv'],
    region: 'malayalam'
  },
  { 
    name: 'MalayalamHD', 
    url: 'https://malayalamhd.com/embed',
    priority: 27,
    supports: ['movie', 'tv'],
    region: 'malayalam'
  },
  { 
    name: 'MalayalamRockers', 
    url: 'https://malayalamrockers.net/embed',
    priority: 28,
    supports: ['movie', 'tv'],
    region: 'malayalam'
  },
  { 
    name: 'TamilRockers Malayalam', 
    url: 'https://tamilrockers.ws/embed',
    priority: 29,
    supports: ['movie', 'tv'],
    region: 'malayalam'
  },

  // ========== KOREAN DRAMA SERVERS ==========
  { 
    name: 'DramaCool', 
    url: 'https://dramacool.so/embed',
    priority: 30,
    supports: ['movie', 'tv'],
    region: 'korean'
  },
  { 
    name: 'KissKh', 
    url: 'https://kisskh.co/embed',
    priority: 31,
    supports: ['movie', 'tv'],
    region: 'korean'
  },
  { 
    name: 'AsianCrush', 
    url: 'https://asiancrush.com/embed',
    priority: 32,
    supports: ['movie', 'tv'],
    region: 'korean'
  },
  { 
    name: 'Kocowa', 
    url: 'https://kocowa.com/embed',
    priority: 33,
    supports: ['movie', 'tv'],
    region: 'korean'
  },
  { 
    name: 'Viki', 
    url: 'https://viki.com/embed',
    priority: 34,
    supports: ['movie', 'tv'],
    region: 'korean'
  },
  { 
    name: 'KDramaHood', 
    url: 'https://kdramahood.com/embed',
    priority: 35,
    supports: ['movie', 'tv'],
    region: 'korean'
  },

  // ========== GENERAL ASIAN CONTENT SERVERS ==========
  { 
    name: 'AsianLoad', 
    url: 'https://asianload.io/embed',
    priority: 40,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'ViewAsian', 
    url: 'https://viewasian.co/embed',
    priority: 41,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'DramaDay', 
    url: 'https://dramaday.me/embed',
    priority: 42,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'KissAsian', 
    url: 'https://kissasian.video/embed',
    priority: 43,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'MyAsianTV', 
    url: 'https://myasiantv.ac/embed',
    priority: 44,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'FastDrama', 
    url: 'https://fastdrama.me/embed',
    priority: 45,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'AsianEmbed', 
    url: 'https://asianembed.io/embed',
    priority: 46,
    supports: ['movie', 'tv'],
    region: 'asian'
  },
  { 
    name: 'VidCloud Asian', 
    url: 'https://vidcloud.icu/embed',
    priority: 47,
    supports: ['movie', 'tv'],
    region: 'asian'
  },

  // ========== JAPANESE CONTENT / ANIME SERVERS ==========
  { 
    name: 'GogoAnime', 
    url: 'https://gogoanime.lu/embed',
    priority: 50,
    supports: ['tv', 'movie'],
    region: 'japanese'
  },
  { 
    name: 'Zoro.to', 
    url: 'https://zoro.to/embed',
    priority: 51,
    supports: ['tv', 'movie'],
    region: 'japanese'
  },
  { 
    name: 'HiAnime', 
    url: 'https://hianime.to/embed',
    priority: 52,
    supports: ['tv', 'movie'],
    region: 'japanese'
  },
  { 
    name: 'AnimeSuge', 
    url: 'https://animesuge.to/embed',
    priority: 53,
    supports: ['tv', 'movie'],
    region: 'japanese'
  },
  { 
    name: '9Anime', 
    url: 'https://9anime.to/embed',
    priority: 54,
    supports: ['tv', 'movie'],
    region: 'japanese'
  },
  { 
    name: 'Crunchyroll Mirror', 
    url: 'https://crunchyroll-mirror.to/embed',
    priority: 55,
    supports: ['tv', 'movie'],
    region: 'japanese'
  },
  { 
    name: 'Anilist', 
    url: 'https://anilist.to/embed',
    priority: 56,
    supports: ['tv', 'movie'],
    region: 'japanese'
  },
  { 
    name: 'AllAnime', 
    url: 'https://allanime.to/embed',
    priority: 57,
    supports: ['tv', 'movie'],
    region: 'japanese'
  },
  { 
    name: 'AnimeKisa', 
    url: 'https://animekisa.tv/embed',
    priority: 58,
    supports: ['tv', 'movie'],
    region: 'japanese'
  },
  { 
    name: 'Aniflix', 
    url: 'https://aniflix.to/embed',
    priority: 59,
    supports: ['tv', 'movie'],
    region: 'japanese'
  },

  // ========== PHILIPPINE CONTENT SERVERS ==========
  { 
    name: 'PinoyFlix', 
    url: 'https://pinoyflix.su/embed',
    priority: 60,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'PinoyMovies', 
    url: 'https://pinoymovies.es/embed',
    priority: 61,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'Tambayan', 
    url: 'https://tambayan.live/embed',
    priority: 62,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'PinoyMoviePedia', 
    url: 'https://pinoymoviepedia.ru/embed',
    priority: 63,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'PinoyHD', 
    url: 'https://pinoyhd.xyz/embed',
    priority: 64,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'LambinganHD', 
    url: 'https://lambinganhd.com/embed',
    priority: 65,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'PinoyChannel', 
    url: 'https://pinoychannel.ph/embed',
    priority: 66,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'TFC Stream', 
    url: 'https://tfcstream.net/embed',
    priority: 67,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'IWantTFC Mirror', 
    url: 'https://iwanttfc-mirror.com/embed',
    priority: 68,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'GMA Stream', 
    url: 'https://gmastream.com/embed',
    priority: 69,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
  { 
    name: 'PinoyTV', 
    url: 'https://pinoytv.net/embed',
    priority: 70,
    supports: ['movie', 'tv'],
    region: 'philippine'
  },
];

// Get the best available server for content type
export const getBestServer = (contentType = 'movie') => {
  const availableServers = STREAMING_SERVERS.filter(server => 
    server.supports.includes(contentType)
  );
  
  // Return server with lowest priority (highest preference)
  return availableServers.sort((a, b) => a.priority - b.priority)[0] || STREAMING_SERVERS[0];
};

// Get servers by content type
export const getServersByType = (contentType = 'movie') => {
  return STREAMING_SERVERS.filter(server => 
    server.supports.includes(contentType)
  ).sort((a, b) => a.priority - b.priority);
};

// Get servers by region
export const getServersByRegion = (region) => {
  return STREAMING_SERVERS.filter(server => 
    server.region === region || server.region === 'global'
  ).sort((a, b) => a.priority - b.priority);
};

// Get best server based on content type and region hint
export const getSmartServer = (contentType = 'movie', genres = [], originCountry = '', spokenLanguages = []) => {
  // Check if it's anime (Japanese animation)
  const isAnime = genres.some(g => g.id === 16 || g.name === 'Animation') && 
                  (originCountry === 'JP' || spokenLanguages.some(lang => lang.iso_639_1 === 'ja'));
  if (isAnime) {
    const animeServers = STREAMING_SERVERS.filter(s => 
      s.region === 'japanese' && s.supports.includes(contentType)
    );
    if (animeServers.length > 0) return animeServers[0];
  }
  
  // Check if it's Malayalam content
  const isMalayalam = spokenLanguages.some(lang => lang.iso_639_1 === 'ml') || 
                      originCountry === 'IN'; // Malayalam is Indian
  if (isMalayalam) {
    const malayalamServers = STREAMING_SERVERS.filter(s => 
      s.region === 'malayalam' && s.supports.includes(contentType)
    );
    if (malayalamServers.length > 0) return malayalamServers[0];
  }
  
  // Check if it's Korean content
  const isKorean = originCountry === 'KR' || spokenLanguages.some(lang => lang.iso_639_1 === 'ko');
  if (isKorean) {
    const koreanServers = STREAMING_SERVERS.filter(s => 
      s.region === 'korean' && s.supports.includes(contentType)
    );
    if (koreanServers.length > 0) return koreanServers[0];
  }
  
  // Check if it's Philippine content
  const isPhilippine = originCountry === 'PH' || spokenLanguages.some(lang => lang.iso_639_1 === 'tl' || lang.iso_639_1 === 'fil');
  if (isPhilippine) {
    const philippineServers = STREAMING_SERVERS.filter(s => 
      s.region === 'philippine' && s.supports.includes(contentType)
    );
    if (philippineServers.length > 0) return philippineServers[0];
  }
  
  // Check if it's Japanese content (non-anime)
  const isJapanese = originCountry === 'JP' || spokenLanguages.some(lang => lang.iso_639_1 === 'ja');
  if (isJapanese) {
    const japaneseServers = STREAMING_SERVERS.filter(s => 
      s.region === 'japanese' && s.supports.includes(contentType)
    );
    if (japaneseServers.length > 0) return japaneseServers[0];
  }
  
  // Check if it's general Asian content (Chinese, Thai, etc.)
  const asianCountries = ['CN', 'TW', 'TH', 'HK', 'SG', 'VN', 'MY', 'ID'];
  const isAsian = originCountry && asianCountries.includes(originCountry);
  if (isAsian) {
    const asianServers = STREAMING_SERVERS.filter(s => 
      s.region === 'asian' && s.supports.includes(contentType)
    );
    if (asianServers.length > 0) return asianServers[0];
  }
  
  // Check if it's Indian content (Hindi, Tamil, Telugu, etc.)
  const isIndian = originCountry === 'IN' || 
                   spokenLanguages.some(lang => ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn'].includes(lang.iso_639_1));
  if (isIndian) {
    const indianServers = STREAMING_SERVERS.filter(s => 
      s.region === 'indian' && s.supports.includes(contentType)
    );
    if (indianServers.length > 0) return indianServers[0];
  }
  
  // Default to best global server
  return getBestServer(contentType);
};

// Check if a server URL is accessible
export const checkServerAvailability = async (server, type, id, season = null, episode = null) => {
  try {
    // Build the URL
    let url;
    if (server.urlBuilder) {
      url = server.urlBuilder(type, id, season, episode);
    } else {
      const serverUrl = server.url;
      if (type === 'tv' && season && episode) {
        url = `${serverUrl}/tv/${id}/${season.season_number}/${episode.episode_number}`;
      } else if (type === 'movie') {
        url = `${serverUrl}/movie/${id}`;
      }
    }

    // Try to check if the URL is accessible (simple check)
    const response = await fetch(url, { 
      method: 'HEAD', 
      mode: 'no-cors',
      cache: 'no-cache'
    });
    
    return true; // If no error, assume it's available
  } catch (error) {
    return false; // If error, mark as unavailable
  }
};

// Check multiple servers and return working ones
export const getWorkingServers = async (contentType, id, season = null, episode = null) => {
  const servers = getServersByType(contentType);
  const workingServers = [];
  
  // Check first 5 servers for speed
  const serversToCheck = servers.slice(0, 5);
  
  const checks = serversToCheck.map(async (server) => {
    const isWorking = await checkServerAvailability(server, contentType, id, season, episode);
    if (isWorking) {
      return server;
    }
    return null;
  });
  
  const results = await Promise.all(checks);
  
  // Filter out null values and return working servers
  return results.filter(server => server !== null);
};

// Get region label for display
export const getRegionLabel = (region) => {
  const labels = {
    global: 'Global',
    indian: 'Indian',
    malayalam: 'Malayalam',
    korean: 'Korean',
    japanese: 'Japanese/Anime',
    asian: 'Asian',
    philippine: 'Philippine'
  };
  return labels[region] || region;
};

// Group servers by region for better UI
export const getGroupedServers = (contentType = 'movie') => {
  const servers = getServersByType(contentType);
  const grouped = {};
  
  servers.forEach(server => {
    const region = server.region;
    if (!grouped[region]) {
      grouped[region] = [];
    }
    grouped[region].push(server);
  });
  
  return grouped;
};