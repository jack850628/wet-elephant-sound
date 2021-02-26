self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('v1').then(function(cache) {
        return cache.addAll([
        //   '/sw-test/',
        //   '/sw-test/index.html',
        //   '/sw-test/style.css',
        //   '/sw-test/app.js',
        //   '/sw-test/image-list.js',
        //   '/sw-test/star-wars-logo.jpg',
        //   '/sw-test/gallery/bountyHunters.jpg',
        //   '/sw-test/gallery/myLittleVader.jpg',
        //   '/sw-test/gallery/snowTroopers.jpg'
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