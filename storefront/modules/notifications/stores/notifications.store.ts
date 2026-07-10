/**
 * Notifications store (Pinia).
 *
 * App-wide transient toasts (success/error/info). Replaces ad-hoc alert()
 * calls with a consistent, dismissible UI surface (rendered by ToastHost).
 * Auto-dismiss timers run only on the client.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<Toast[]>([])
  let seq = 0

  function notify(message: string, type: ToastType = 'info', duration = 4000): number {
    const id = ++seq
    items.value.push({ id, type, message })
    if (import.meta.client && duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  function dismiss(id: number) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  function clear() {
    items.value = []
  }

  return { items, notify, dismiss, clear }
})
