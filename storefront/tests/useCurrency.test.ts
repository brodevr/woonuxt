import { describe, it, expect, beforeEach } from 'vitest'
import { useCurrency } from '../composables/useCurrency'
import { mockSettings } from '../data/mock'

describe('useCurrency', () => {
  it('should return correct currency symbol and code', () => {
    const { currencySymbol, currencyCode } = useCurrency()
    expect(currencySymbol).toBe(mockSettings.currencySymbol)
    expect(currencyCode).toBe(mockSettings.currencyCode)
  })

  it('should format numeric price correctly', () => {
    const { formatPrice } = useCurrency()
    expect(formatPrice(10)).toBe(`${mockSettings.currencySymbol}10.00`)
    expect(formatPrice(10.5)).toBe(`${mockSettings.currencySymbol}10.50`)
    expect(formatPrice(10.999)).toBe(`${mockSettings.currencySymbol}11.00`) // Tests rounding
  })

  it('should format string price correctly', () => {
    const { formatPrice } = useCurrency()
    expect(formatPrice('25')).toBe(`${mockSettings.currencySymbol}25.00`)
    expect(formatPrice('25.99')).toBe(`${mockSettings.currencySymbol}25.99`)
  })

  it('should handle invalid input', () => {
    const { formatPrice } = useCurrency()
    expect(formatPrice('abc')).toBe(`${mockSettings.currencySymbol}0.00`)
  })
})
