var WES;(()=>{var e={4147:e=>{"use strict";e.exports=JSON.parse('{"name":"wet-elephant-sound","version":"1.12.0602","description":"Wet Elephant Sound","main":"index.js","repository":{"type":"github","url":"https://github.com/jack850628/wet-elephant-sound.git"},"directories":{"test":"test"},"scripts":{"test":"echo \\"Error: no test specified\\" && exit 1","build":"webpack"},"author":"jack850628","license":"ISC","devDependencies":{"@babel/plugin-proposal-class-properties":"^7.12.1","css-loader":"^5.0.1","deepmerge":"^4.2.2","mini-server":"^1.0.2","sass":"^1.43.4","sass-loader":"^12.3.0","stream":"0.0.2","style-loader":"^2.0.0","vue-loader":"^15.9.8","vue-template-compiler":"^2.6.14","webpack":"^5.61.0","webpack-cli":"^4.2.0"},"dependencies":{"@babel/core":"^7.12.10","babel":"^6.23.0","babel-core":"^6.26.3","babel-loader":"^8.2.2","concat-audio-buffers":"^1.0.0","firebase":"^9.8.2","lamejs":"^1.2.1","vue":"^2.6.14","vuedraggable":"^2.24.3","vuetify":"^2.6.0"}}')}},t={};function n(r){var s=t[r];if(void 0!==s)return s.exports;var a=t[r]={exports:{}};return e[r](a,a.exports,n),a.exports}(()=>{const e="v"+n(4147).version,t="wet-elephant-sound_"+e,r=["./","./index.html"];self.addEventListener("install",(function(e){e.waitUntil(caches.open(t).then((function(e){return e.addAll(r)})))})),self.addEventListener("fetch",(function(e){e.request.url.match(/^http/)&&e.respondWith(caches.match(e.request).then((function(n){return void 0!==n?n:fetch(e.request).then((function(n){let r=n.clone();return caches.open(t).then((function(t){t.put(e.request,r)})).catch((e=>{console.error(e)})),n}))})))})),self.addEventListener("activate",(function(t){t.waitUntil(caches.keys().then((function(t){var n=t.filter((function(t){return!t.endsWith(e)}));return console.debug("cache",n,t),Promise.all(n.map((function(e,t){return console.debug("delete cache",e),caches.delete(e)})))})))}))})(),WES={}})();