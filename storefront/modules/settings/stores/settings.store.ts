/**
 * Settings store (Pinia).
 *
 * Holds the WooCommerce/WooNuxt store settings (currency, branding, etc.).
 * Initialized with mockSettings so synchronous consumers (e.g. useCurrency)
 * always have a valid value; hydrated once from GraphQL in app.vue. State is
 * SSR-serialized by @pinia/nuxt, so the client reuses the server value.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockSettings } from '~/data/mock'
import type { StoreSettings } from '~/data/mock'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<StoreSettings>(mockSettings)

  function setSettings(next: StoreSettings | null | undefined) {
    if (next) {
      settings.value = next
    }
  }

  return { settings, setSettings }
})
