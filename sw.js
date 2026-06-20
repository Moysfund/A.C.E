// sw.js - Service Worker

const CACHE_NAME = 'lasbca-ace-v1';
const urlsToCache = [
    '/lasbca-ace/',
    '/lasbca-ace/index.html',
    '/lasbca-ace/styles.css',
    '/lasbca-ace/script.js',
    '/lasbca-ace/storage.js',
    '/lasbca-ace/pdf-generator.js',
    '/lasbca-ace/pages/dashboard.html',
    '/lasbca-ace/pages/stage-report.html',
    '/lasbca-ace/pages/contravention.html',
    '/lasbca-ace/pages/pca-audit.html',
    '/lasbca-ace/pages/reports.html',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('📦 Caching assets...');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                return response || fetch(event.request).catch(function() {
                    return caches.match('/lasbca-ace/index.html');
                });
            })
    );
});

self.addEventListener('activate', function(event) {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
