const CACHE_NAME = 'wisewallet-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/core-lib.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'
];

// Instalacja Service Workera i cache'owanie plików (działanie Offline)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache PWA zapisany pomyślnie');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Czyszczenie starego cache'a przy aktualizacjach aplikacji
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

// Nasłuchiwanie zapytań (Strategia: Network-First, potem Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// ----------------------------------------------------
// Odbieranie powiadomień Push (np. o rachunkach)
// ----------------------------------------------------
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'WiseWallet', body: 'Sprawdź swój budżet!' };
  
  const options = {
    body: data.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/3344/3344055.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3344/3344055.png',
    vibrate: [100, 50, 100], // Krótkie wibracje
    data: {
      url: '/' // Gdzie przenieść użytkownika po kliknięciu
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Akcja po kliknięciu w powiadomienie Push
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
