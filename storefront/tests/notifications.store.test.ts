import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationsStore } from '../modules/notifications/stores/notifications.store'

describe('notifications store', () => {
  beforeEach(() => {
    useNotificationsStore().clear()
  })

  it('adds a notification with type and message', () => {
    const store = useNotificationsStore()
    const id = store.notify('Saved', 'success', 0)
    expect(store.items).toHaveLength(1)
    expect(store.items[0]).toMatchObject({ id, type: 'success', message: 'Saved' })
  })

  it('defaults to info type', () => {
    const store = useNotificationsStore()
    store.notify('Heads up', undefined, 0)
    expect(store.items[0].type).toBe('info')
  })

  it('dismiss removes only the target notification', () => {
    const store = useNotificationsStore()
    const a = store.notify('a', 'info', 0)
    store.notify('b', 'error', 0)
    store.dismiss(a)
    expect(store.items).toHaveLength(1)
    expect(store.items[0].message).toBe('b')
  })

  it('assigns unique ids', () => {
    const store = useNotificationsStore()
    const a = store.notify('a', 'info', 0)
    const b = store.notify('b', 'info', 0)
    expect(a).not.toBe(b)
  })
})
