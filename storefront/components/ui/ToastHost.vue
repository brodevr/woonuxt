<template>
  <div class="toast-host" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="toast in items"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        role="status"
      >
        <span class="toast__message">{{ toast.message }}</span>
        <button class="toast__close" aria-label="Dismiss" @click="dismiss(toast.id)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '~/modules/notifications/stores/notifications.store'

const store = useNotificationsStore()
const { items } = storeToRefs(store)
const dismiss = store.dismiss
</script>

<style scoped>
.toast-host {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: min(360px, calc(100vw - 2 * var(--space-6)));
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-text);
  color: var(--color-bg);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  font-size: var(--text-sm);
}

.toast--success {
  background-color: var(--color-success);
  color: #fff;
}

.toast--error {
  background-color: var(--color-error);
  color: #fff;
}

.toast__message {
  flex: 1;
}

.toast__close {
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.8;
  flex-shrink: 0;
}

.toast__close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity var(--duration-normal) ease, transform var(--duration-normal) ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
