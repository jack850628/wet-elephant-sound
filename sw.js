var APP_PREFIX = 'wet-elephant-sound_';
var VERSION = 'v1.11.1111';
var CACHE_NAME = APP_PREFIX + VERSION
var URLS = [                            
  './',
  './index.html',
  './audios.js',
]

self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(URLS);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    // console.log(event);
    if(event.request.url.match(/^http/)){
      event.respondWith(caches.match(event.request).then(function(response) {
        if (response !== undefined) {
          return response;
        } else {
          return fetch(event.request).then(function (response) {
            let responseClone = response.clone();
            
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseClone);
            }).catch((e) => {
              console.error(e);
            });
            return response;
          });
          // .catch(function () {
          //   return caches.match('/sw-test/gallery/myLittleVader.jpg');
          // });
        }
      }));
    }
  });

  self.addEventListener('activate', function (e) {
    e.waitUntil(
      caches.keys().then(function (keyList) {
        //刪除其他版本的 cache
        var cacheWhitelist = keyList.filter(function (key) {
          return !key.endsWith(VERSION)
        })

        console.debug('cache', cacheWhitelist, keyList)
  
        return Promise.all(cacheWhitelist.map(function (key, i) {
          console.debug('delete cache', key);
          return caches.delete(key);
        }));
      })
    )
  })