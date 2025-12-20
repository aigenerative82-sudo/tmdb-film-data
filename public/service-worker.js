// public/service-worker.js
const CACHE_NAME = 'movie-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'New Content Available!';
  const options = {
    body: data.body || 'Check out the latest movies and TV shows',
    icon: data.icon || '/logo192.png',
    badge: '/logo192.png',
    image: data.image,
    data: {
      url: data.url || '/',
      id: data.id,
      type: data.type
    },
    actions: [
      {
        action: 'view',
        title: 'View Now',
        icon: '/icons/play.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ],
    tag: data.tag || 'new-content',
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = event.notification.data.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (let client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if not
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Background sync for checking new content
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-new-content') {
    event.waitUntil(checkForNewContent());
  }
});

async function checkForNewContent() {
  try {
    const API_KEY = 'ffc5385a41a65394115a1346134c47f8'; // Replace with your API key
    const BASE_URL = 'https://api.themoviedb.org/3';
    
    // Get last check timestamp
    const lastCheck = await getLastCheckTimestamp();
    const now = new Date().toISOString().split('T')[0];
    
    // Fetch new movies
    const moviesResponse = await fetch(
      `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
    );
    const moviesData = await moviesResponse.json();
    
    // Fetch new TV shows
    const tvResponse = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=${now}&page=1`
    );
    const tvData = await tvResponse.json();
    
    // Filter content released after last check
    const newMovies = moviesData.results?.filter(movie => 
      movie.release_date > lastCheck
    ).slice(0, 3) || [];
    
    const newTVShows = tvData.results?.filter(show => 
      show.first_air_date > lastCheck
    ).slice(0, 3) || [];
    
    // Send notifications for new content
    if (newMovies.length > 0) {
      await sendNotification(newMovies[0], 'movie');
    }
    
    if (newTVShows.length > 0) {
      await sendNotification(newTVShows[0], 'tv');
    }
    
    // Update last check timestamp
    await updateLastCheckTimestamp(now);
    
  } catch (error) {
    console.error('Error checking new content:', error);
  }
}

async function sendNotification(item, type) {
  const title = type === 'movie' 
    ? `New Movie: ${item.title}` 
    : `New TV Show: ${item.name}`;
  
  const body = item.overview 
    ? item.overview.substring(0, 100) + '...' 
    : 'Check it out now!';
  
  await self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
    data: {
      url: `/detail/${type}/${item.id}`,
      id: item.id,
      type: type
    },
    actions: [
      { action: 'view', title: 'View Now' },
      { action: 'close', title: 'Close' }
    ],
    tag: `${type}-${item.id}`,
    requireInteraction: false,
    vibrate: [200, 100, 200]
  });
}

async function getLastCheckTimestamp() {
  const cache = await caches.open('app-data');
  const response = await cache.match('/last-check-timestamp');
  if (response) {
    const data = await response.json();
    return data.timestamp;
  }
  return new Date().toISOString().split('T')[0];
}

async function updateLastCheckTimestamp(timestamp) {
  const cache = await caches.open('app-data');
  await cache.put(
    '/last-check-timestamp',
    new Response(JSON.stringify({ timestamp }))
  );
}