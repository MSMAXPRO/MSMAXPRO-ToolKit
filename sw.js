// Service Worker Code

// == UPDATE: Version badal diya hai taaki naya cache install ho ==
const CACHE_NAME = 'msmaxpro-toolkit-cache-v1.4';

// == UPDATE: Saare naye tool pages add kar diye hain ==
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/contact.html',
    '/404.html',
    
    // Original Tools
    '/json-formatter.html',
    '/readme-generator.html',
    '/color-palette-generator.html',
    '/css-gradient-generator.html',
    '/regex-tester.html',
    
    // Aapke Naye Tools
    '/url-encoder-decoder.html',
    '/base64-encoder-decoder.html',
    '/timestamp-converter.html',
    '/word-counter.html',
    '/markdown-previewer.html',
    '/uuid-generator.html',
    '/hash-generator.html',
    '/case-converter.html',
    '/px-rem-em-convertor.html', // (Aapki spelling use ki hai)
    '/box-shadow-generator.html',
    '/password_generator.html', // (Aapki spelling use ki hai)
    '/lorem-ipsum-generator.html',

    // Zaroori Assets
    '/manifest.json',
    '/images/icon-512.png',
    '/icons/icon-192.png',
    
    // External Libraries
    'https://unpkg.com/aos@2.3.1/dist/aos.css',
    'https://unpkg.com/aos@2.3.1/dist/aos.js',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js' // Markdown library
];

// 1. Install Event: Jab Service Worker install hota hai
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching App Shell');
        // Network errors ko ignore karo, taaki agar ek file fail ho toh poora cache na ruke
        return Promise.all(
          FILES_TO_CACHE.map(url => {
            return cache.add(url).catch(reason => {
              console.warn(`[ServiceWorker] Failed to cache ${url}: ${reason}`);
            });
          })
        );
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
  
  // External assets (like Tailwind, Google Fonts, etc.)
  // Network First strategy
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
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

  // Local assets (HTML, icons)
  // Cache First strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Agar cache mein hai, toh wahi se return karo
        // Agar nahi hai, toh network se fetch karo (jo offline fail hoga, lekin 404.html handle kar lega)
        return response || fetch(event.request);
      })
  );
});
