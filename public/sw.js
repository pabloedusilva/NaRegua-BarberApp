self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Lembrete de agendamento';
    const options = {
        body: data.body || 'Você tem um agendamento em breve!',
        icon: '/img/logo.png',
        badge: '/img/logo.png',
        data: data
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    const url = event.notification.data && event.notification.data.url;
    if (url) {
        event.notification.close();
        event.waitUntil(clients.openWindow(url));
    }
});