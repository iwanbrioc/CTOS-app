const CACHE_NAME = 'coming-to-our-senses-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  // Add other static assets
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your mindfulness practice',
    icon: '/apple-touch-icon.png',
    badge: '/favicon-32x32.png',
    tag: 'mindfulness-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'start-practice',
        title: 'Start Practice',
        icon: '/favicon-32x32.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon-32x32.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Coming to Our Senses', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'start-practice') {
    event.waitUntil(
      clients.openWindow('/?action=practice')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'journal-sync') {
    event.waitUntil(syncJournalEntries());
  }
});

async function syncJournalEntries() {
  // Sync journal entries when back online
  const cache = await caches.open(CACHE_NAME);
  const offlineEntries = await cache.match('/offline-journal-entries');
  
  if (offlineEntries) {
    const entries = await offlineEntries.json();
    // Send entries to server
    // Clear offline cache after successful sync
  }
}
