/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'Morning Light'
  const options = {
    body: data.body || '記得記錄今天的體重喔！',
    icon: '/pwa-192x192.png',
    badge: '/favicon.ico',
    tag: 'weight-reminder',
    renotify: true,
    data: {
      url: '/'
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url)
  )
})
