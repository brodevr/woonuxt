import { mockSettings } from '~/data/mock'

export function useCurrency() {
  const settings = mockSettings

  function formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(num)) return `${settings.currencySymbol}0.00`

    return `${settings.currencySymbol}${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return {
    formatPrice,
    currencyCode: settings.currencyCode,
    currencySymbol: settings.currencySymbol,
  }
}
