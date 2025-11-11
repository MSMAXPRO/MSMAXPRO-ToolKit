// Service Worker Code

const CACHE_NAME = 'msmaxpro-toolkit-cache-v1.3'; // Version badalna zaroori hai

// Yeh woh saari files hain jo hum offline save karna chahte hain
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/contact.html',
    '/404.html',
    '/json-formatter.html',
    '/readme-generator.html',
    '/color-palette-generator.html',
    '/css-gradient-generator.html',
    '/regex-tester.html',
    '/manifest.json',
    '/images/icon-512.png',
    '/icons/icon-192.png',
    'https://unpkg.com/aos@2.3.1/dist/aos.css',
    'https://unpkg.com/aos@2.3.1/dist/aos.js'
];

// 1. Install Event: Jab Service Worker install hota hai
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching App Shell');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
});

// 2. Activate Event: Puraane cache ko saaf karne ke liye
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 3. Fetch Event: Jab bhi site koi file maangti hai
self.addEventListener('fetch', (event) => {
  
  // External assets (like Tailwind, Google Fonts) ke liye
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        // Network se try karo (Network first)
        return fetch(event.request)
          .then((response) => {
            // Agar network se mil gaya, toh usse cache mein save karo aur return karo
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Agar network fail ho gaya, toh cache se dhoondo
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Local assets (HTML, icons) ke liye (Cache first)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Agar cache mein hai, toh wahi se return karo
        // Agar nahi hai, toh network se fetch karo
        return response || fetch(event.request);
      })
  );
});
