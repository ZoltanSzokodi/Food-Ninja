// app shell cache
const staticCacheName = 'site-static-v5';
let dynamicCacheName = 'site-dynamic-v5';
const assets = [
  '/',
  '/index.html',
  '/pages/fallback.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2'
];

// dynamic cache

// cache size limit function - delete oldest item
const limitCacheSize = (name, size) => {
  caches.open(name)
    .then(cache => {
      cache.keys()
        .then(keys => {
          // awesome recursion - until the condition is true re-run the function
          if (keys.length > size) {
            cache.delete(keys[0])
              .then(limitCacheSize(name, size))
          }
        })
    })
}

// install service worker
self.addEventListener('install', evt => {
  // console.log('service worker installed')
  evt.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        console.log('caching shell assets')
        cache.addAll(assets)
      })
  )
})

// activate service worker
self.addEventListener('activate', evt => {
  // console.log('service worker activated')
  evt.waitUntil(
    caches.keys()
      .then(keys => {
        // console.log(keys)
        return Promise.all(keys
          .filter(key => key !== staticCacheName && key !== dynamicCacheName)
          .map(key => caches.delete(key))
        )
      })
  )
})

// tap into fetch events
self.addEventListener('fetch', evt => {
  // console.log('fetch event')
  if (evt.request.url.indexOf('firestore.googleapis.com') === -1) {
    evt.respondWith(
      caches.match(evt.request)
        .then(cacheRes => {
          return cacheRes || fetch(evt.request)
            .then(fetchRes => {
              return caches.open(dynamicCacheName)
                .then(cache => {
                  cache.put(evt.request.url, fetchRes.clone())
                  limitCacheSize(dynamicCacheName, 15)
                  return fetchRes;
                })
            })
        }).catch(() => {
          if (evt.request.url.indexOf('.html') > -1) {
            return caches.match('/pages/fallback.html');
          }
          // we could/should add a fallback for images too
        })
    )
  }

})