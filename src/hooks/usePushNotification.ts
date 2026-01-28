import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export function usePushNotification(userId: string | undefined) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    async function checkSubscription() {
      if (!('serviceWorker' in navigator) || !userId) {
        setLoading(false)
        return
      }

      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [userId])

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !userId) return

    try {
      setLoading(true)
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission !== 'granted') {
        throw new Error('Notification permission not granted')
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
      })

      // Store in Supabase
      const { endpoint, keys } = subscription.toJSON()
      if (endpoint && keys?.p256dh && keys?.auth) {
        await supabase.from('push_subscriptions').upsert({
          user_id: userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth
        })
      }

      setIsSubscribed(true)
      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    if (!('serviceWorker' in navigator) || !userId) return

    try {
      setLoading(true)
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        // Remove from Supabase
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('endpoint', subscription.endpoint)
      }

      setIsSubscribed(false)
      return true
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  async function sendTestNotification() {
    if (!userId) return

    try {
      setLoading(true)
      const { error } = await supabase.functions.invoke('send-weight-reminder', {
        body: { test: true, userId }
      })
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error sending test notification:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
    sendTestNotification
  }
}
