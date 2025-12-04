// public/sw.js

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Por ahora no hacemos nada especial, dejamos pasar todo.
});
