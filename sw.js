const CACHE_NAME = "v0.001";

const FILES_TO_CACHE = [  "./",
  "./index.html",
  "./app.js",
  "./Hiuna_Khomlui.js",
  "./Luisan.js",
  "./Khristen_Madui_Lui.js"];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
   caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ) .then(() => caches.open(CACHE_NAME)) .then(cache => cache.addAll(FILES_TO_CACHE))  ); } );

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))  );});
