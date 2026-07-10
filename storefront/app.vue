<template>
  <div id="app">
    <AppHeader />
    <main>
      <NuxtPage />
    </main>
    <AppFooter />
    <CartDrawer />
    <ToastHost />
  </div>
</template>

<script setup lang="ts">
/**
 * Hydrate the settings store once from WooCommerce so currency/branding come
 * from the real store. Runs during SSR and is serialized to the client via the
 * Pinia + useAsyncData payloads (no client refetch). Falls back to mockSettings.
 */
import { onMounted } from 'vue'
import { useSettingsStore } from '~/modules/settings/stores/settings.store'

const settingsStore = useSettingsStore()
const { getSettings } = useWooNuxt()

const { data: settings } = await useAsyncData('store-settings', () => getSettings())

if (settings.value) {
  settingsStore.setSettings(settings.value)
}

// Load the WooCommerce cart (Store API) once on the client.
const { ensureLoaded } = useCart()
onMounted(() => {
  ensureLoaded()
})
</script>
