// public/sw.js

self.addEventListener("install", (event) => {
  // Instala sin bloquear
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Toma control de las pestañas abiertas
  clients.claim();
});

// Por ahora, solo proxy normal (sin cache)
self.addEventListener("fetch", (event) => {
  return; // dejar que el navegador maneje la request normalmente
});
