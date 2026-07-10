/**
 * useCurrency — money formatting bound to the store's real currency settings.
 *
 * Reads currency from the settings store (hydrated from WooCommerce in
 * app.vue) instead of hardcoded mock data. Falls back to mockSettings values
 * until real settings are loaded, so behavior is unchanged without a backend.
 */
import { computed } from 'vue'
import { useSettingsStore } from '~/modules/settings/stores/settings.store'

export function useCurrency() {
  const store = useSettingsStore()

  function formatPrice(price: string | number): string {
    const symbol = store.settings.currencySymbol
    const num = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(num)) return `${symbol}0.00`

    return `${symbol}${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const currencySymbol = computed(() => store.settings.currencySymbol)
  const currencyCode = computed(() => store.settings.currencyCode)

  return {
    formatPrice,
    currencyCode,
    currencySymbol,
  }
}
