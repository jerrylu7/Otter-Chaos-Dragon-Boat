/**
 * OtterChaos Service Worker
 * ──────────────────────────
 * Handles background push notifications.
 * Deploy this file to GitHub Pages at the ROOT of your repo
 * (same folder as index.html) as "sw.js"
 */

const APP_URL = 'https://jerrylu7.github.io/Otter-Chaos-Dragon-Boat/';

// ── Push event: show a notification when a push arrives ───────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'OtterChaos', body: event.data.text() };
  }

  const options = {
    body:    data.body  || '',
    icon:    data.icon  || APP_URL + 'favicon.ico',
    badge:   data.badge || APP_URL + 'favicon.ico',
    tag:     data.tag   || 'otterchaos',
    data:    { url: data.url || APP_URL },
    actions: [
      { action: 'open', title: 'Open app' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'OtterChaos', options)
  );
});

// ── Notification click: open the app when user taps notification ──────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || APP_URL;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // If app is already open, focus it
      for (const client of windowClients) {
        if (client.url.startsWith(APP_URL) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ── Install / activate: no caching — we want always-fresh app code ────────────
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(
    // Clear any old caches from previous versions
    caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});
