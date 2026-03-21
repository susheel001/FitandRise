self.addEventListener('push', (e) => {
  const data = e.data?.json() || {};
  self.registration.showNotification(data.title || 'FitandRise', {
    body:  data.body  || 'Stay on track!',
    icon:  '/fitandrise.jpeg',
    badge: '/fitandrise.jpeg',
    tag:   data.tag   || 'fitandrise',
  });
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/dashboard'));
});