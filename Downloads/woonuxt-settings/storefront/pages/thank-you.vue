<template>
  <div class="thank-you-page">
    <div class="success-wrapper">
      <div class="success-container animate-fade-in-up">
        
        <div class="icon-wrapper animate-pop-in">
          <div class="pulse-ring"></div>
          <div class="success-icon">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path class="checkmark__circle" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path class="checkmark__check" d="m9 11 3 3L22 4"/>
            </svg>
          </div>
        </div>
        
        <h1 class="success-title">Order Confirmed!</h1>
        <p class="success-message">
          Thank you for your purchase. Your payment was successful and we're already preparing your order.
        </p>
        
        <div v-if="orderId" class="order-card">
          <div class="order-card-content">
            <span class="order-label">Order Number</span>
            <span class="order-number">#{{ orderId }}</span>
            <div class="divider"></div>
            <p class="email-notice">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              You'll receive a confirmation email shortly.
            </p>
          </div>
        </div>

        <div class="success-actions">
          <NuxtLink to="/shop" class="btn btn--primary btn--large action-btn">
            Continue Shopping
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const orderId = computed(() => route.query.order as string)

useHead({
  title: 'Thank You — Store'
})
</script>

<style scoped>
.thank-you-page {
  background-color: var(--color-bg);
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  position: relative;
  overflow: hidden;
}

/* Subtle background gradient */
.thank-you-page::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 1000px;
  height: 1000px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(255,255,255,0) 70%);
  z-index: 0;
}

.success-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
}

.success-container {
  text-align: center;
  background-color: #ffffff;
  padding: var(--space-12) var(--space-10);
  border-radius: 24px;
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02);
}

/* Animations */
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Icon Styles */
.icon-wrapper {
  position: relative;
  display: inline-flex;
  margin-bottom: var(--space-8);
}

.animate-pop-in {
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: 0.2s;
  opacity: 0;
  transform: scale(0.8);
}

@keyframes popIn {
  to { opacity: 1; transform: scale(1); }
}

.success-icon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
}

.pulse-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  border: 2px solid rgba(16, 185, 129, 0.5);
  animation: pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  z-index: 1;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}

/* SVG Drawing Animation */
.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  animation-delay: 0.6s;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  animation-delay: 0.9s;
}

@keyframes stroke {
  100% { stroke-dashoffset: 0; }
}

/* Text */
.success-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: var(--space-3);
  letter-spacing: -0.02em;
}

.success-message {
  font-size: 16px;
  color: var(--color-text-soft);
  margin-bottom: var(--space-8);
  line-height: 1.6;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Order Card */
.order-card {
  background-color: var(--color-bg);
  border-radius: 16px;
  padding: 2px;
  margin-bottom: var(--space-10);
  background: linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.06) 100%);
}

.order-card-content {
  background-color: #ffffff;
  border-radius: 14px;
  padding: var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.order-number {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-text);
  font-family: monospace;
  letter-spacing: -0.05em;
}

.divider {
  width: 100%;
  height: 1px;
  background-color: var(--color-border);
  margin: var(--space-5) 0;
}

.email-notice {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 14px;
  color: var(--color-text-soft);
  font-weight: 500;
}

.email-notice svg {
  color: var(--color-text-soft);
}

/* Button */
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.15);
}
</style>
