self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('v1.6.0330').then(function(cache) {
        return cache.addAll([
          './',
          './index.html',
          './audios.js',
        ]);
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
            
            caches.open('v1').then(function (cache) {
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