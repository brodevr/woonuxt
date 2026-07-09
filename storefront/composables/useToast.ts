/**
 * useToast — ergonomic facade over the notifications store.
 *
 * `const toast = useToast(); toast.error('Payment failed')`
 */
import { useNotificationsStore } from '~/modules/notifications/stores/notifications.store'

export function useToast() {
  const store = useNotificationsStore()

  return {
    success: (message: string, duration?: number) => store.notify(message, 'success', duration),
    error: (message: string, duration?: number) => store.notify(message, 'error', duration),
    info: (message: string, duration?: number) => store.notify(message, 'info', duration),
    dismiss: store.dismiss,
  }
}
