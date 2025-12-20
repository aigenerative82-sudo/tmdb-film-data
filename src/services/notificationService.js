// src/services/notificationService.js
import { BASE_URL, API_KEY } from '../config';

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.registration = null;
  }

  // Initialize service worker and request notification permission
  async initialize() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered');

      // Request notification permission
      this.permission = await Notification.requestPermission();
      
      if (this.permission === 'granted') {
        console.log('Notification permission granted');
        
        // Set up periodic background sync (if supported)
        if ('periodicSync' in this.registration) {
          await this.registration.periodicSync.register('check-new-content', {
            minInterval: 24 * 60 * 60 * 1000 // Check once per day
          });
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Check for new content manually
  async checkForNewContent() {
    try {
      const lastCheck = localStorage.getItem('lastContentCheck') || new Date().toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      // Fetch upcoming movies
      const moviesResponse = await fetch(
        `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
      );
      const moviesData = await moviesResponse.json();

      // Fetch upcoming TV shows
      const tvResponse = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=${today}&page=1`
      );
      const tvData = await tvResponse.json();

      // Filter new content
      const newMovies = moviesData.results?.filter(movie => 
        movie.release_date >= lastCheck && movie.release_date <= today
      ) || [];

      const newTVShows = tvData.results?.filter(show => 
        show.first_air_date >= lastCheck && show.first_air_date <= today
      ) || [];

      // Send notifications
      if (newMovies.length > 0) {
        this.sendLocalNotification(newMovies[0], 'movie');
      }

      if (newTVShows.length > 0) {
        this.sendLocalNotification(newTVShows[0], 'tv');
      }

      // Update last check
      localStorage.setItem('lastContentCheck', today);

      return {
        newMovies: newMovies.length,
        newTVShows: newTVShows.length
      };
    } catch (error) {
      console.error('Error checking for new content:', error);
      return null;
    }
  }

  // Send local notification
  sendLocalNotification(item, type) {
    if (this.permission !== 'granted') return;

    const title = type === 'movie' 
      ? `🎬 New Movie: ${item.title}` 
      : `📺 New Show: ${item.name}`;
    
    const body = item.overview 
      ? item.overview.substring(0, 120) + '...' 
      : 'Check it out now!';

    if (this.registration && this.registration.showNotification) {
      this.registration.showNotification(title, {
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
          { action: 'view', title: '👀 View Now' },
          { action: 'close', title: '✖ Close' }
        ],
        tag: `${type}-${item.id}`,
        requireInteraction: false,
        vibrate: [200, 100, 200],
        timestamp: Date.now()
      });
    } else {
      // Fallback to basic notification
      new Notification(title, {
        body,
        icon: '/logo192.png',
        tag: `${type}-${item.id}`
      });
    }
  }

  // Schedule periodic checks
  schedulePeriodicCheck() {
    // Check every 6 hours
    setInterval(() => {
      this.checkForNewContent();
    }, 6 * 60 * 60 * 1000);
  }

  // Get notification permission status
  getPermissionStatus() {
    return this.permission;
  }
}

export default new NotificationService();