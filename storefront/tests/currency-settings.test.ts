import { describe, it, expect } from 'vitest'
import { useCurrency } from '../composables/useCurrency'
import { useSettingsStore } from '../modules/settings/stores/settings.store'
import { mockSettings } from '../data/mock'

/**
 * Verifies the 2A wiring: useCurrency reads the settings store reactively, so
 * updating the store (as app.vue does from real WooCommerce settings) changes
 * how prices format.
 */
describe('useCurrency + settings store', () => {
  it('formats with the store currency and reacts to updates', () => {
    const store = useSettingsStore()
    store.setSettings(mockSettings) // default: '$' / 'USD'

    const { formatPrice, currencySymbol } = useCurrency()
    expect(currencySymbol.value).toBe('$')
    expect(formatPrice(10)).toBe('$10.00')

    // Simulate real settings arriving with a different currency.
    store.setSettings({ ...mockSettings, currencySymbol: '€', currencyCode: 'EUR' })
    expect(currencySymbol.value).toBe('€')
    expect(formatPrice(10)).toBe('€10.00')

    // Restore for isolation from other specs in the run.
    store.setSettings(mockSettings)
  })
})
