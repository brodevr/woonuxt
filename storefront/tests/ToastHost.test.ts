import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ToastHost from '../components/ui/ToastHost.vue'
import { useNotificationsStore } from '../modules/notifications/stores/notifications.store'

describe('ToastHost', () => {
  beforeEach(() => useNotificationsStore().clear())

  it('renders a toast from the store with its type class', async () => {
    const store = useNotificationsStore()
    store.notify('Payment failed', 'error', 0)

    const wrapper = await mountSuspended(ToastHost)
    const toast = wrapper.find('.toast')
    expect(toast.exists()).toBe(true)
    expect(toast.classes()).toContain('toast--error')
    expect(wrapper.text()).toContain('Payment failed')
  })

  it('dismisses a toast when its close button is clicked', async () => {
    const store = useNotificationsStore()
    store.notify('Dismiss me', 'info', 0)

    const wrapper = await mountSuspended(ToastHost)
    expect(wrapper.find('.toast').exists()).toBe(true)

    await wrapper.find('.toast__close').trigger('click')
    expect(store.items).toHaveLength(0)
  })
})
