<template>
  <div class="checkout-page-kylie">
    <div class="checkout-k-container">
      <div class="checkout-k-main">
        <h1 class="checkout-k-title">CHECKOUT</h1>
        
        <div v-if="items.length === 0" class="empty-cart-k">
          <p>Your bag is empty.</p>
          <NuxtLink to="/shop" class="btn-kylie btn-kylie--solid">CONTINUE SHOPPING</NuxtLink>
        </div>
        
        <div v-else>
          <!-- Stepper -->
          <div class="k-stepper">
            <div class="k-step" :class="{ 'is-active': currentStep >= 1 }">
              <span class="step-num">1</span> <span class="step-label">Information</span>
            </div>
            <div class="k-step-line"></div>
            <div class="k-step" :class="{ 'is-active': currentStep >= 2 }">
              <span class="step-num">2</span> <span class="step-label">Shipping</span>
            </div>
            <div class="k-step-line"></div>
            <div class="k-step" :class="{ 'is-active': currentStep === 3 }">
              <span class="step-num">3</span> <span class="step-label">Payment</span>
            </div>
          </div>

          <form @submit.prevent="submitCheckout" class="checkout-k-form">
            <!-- Step 1: Info -->
            <section v-show="currentStep === 1" class="checkout-k-section">
              <h2 class="k-section-title">CONTACT & SHIPPING INFO</h2>
              <div class="k-form-grid">
                <div class="k-form-group k-col-2">
                  <input type="email" id="email" v-model="form.email" required placeholder="Email Address" class="k-input" />
                </div>
                
                <div class="k-form-group">
                  <input type="text" id="firstName" v-model="form.firstName" required placeholder="First Name" class="k-input" />
                </div>
                
                <div class="k-form-group">
                  <input type="text" id="lastName" v-model="form.lastName" required placeholder="Last Name" class="k-input" />
                </div>
                
                <div class="k-form-group k-col-2">
                  <input type="text" id="address" v-model="form.address" required placeholder="Street Address" class="k-input" />
                </div>
                
                <div class="k-form-group">
                  <input type="text" id="city" v-model="form.city" required placeholder="City" class="k-input" />
                </div>
                
                <div class="k-form-group">
                  <input type="text" id="zip" v-model="form.zip" required placeholder="Postal Code" class="k-input" />
                </div>
              </div>
              <div class="k-step-actions">
                <button type="button" @click="currentStep = 2" class="btn-kylie btn-kylie--solid">CONTINUE TO SHIPPING</button>
              </div>
            </section>

            <!-- Step 2: Shipping Options -->
            <section v-show="currentStep === 2" class="checkout-k-section">
              <h2 class="k-section-title">SHIPPING METHOD</h2>
              <div class="k-shipping-options">
                <label class="k-shipping-option" :class="{ 'is-selected': shippingMethod === 'flat_rate' }">
                  <input type="radio" v-model="shippingMethod" value="flat_rate" />
                  <div class="k-shipping-details">
                    <span class="k-ship-title">Standard Shipping</span>
                    <span class="k-ship-price">$5,000.00</span>
                  </div>
                </label>
                <label class="k-shipping-option" :class="{ 'is-selected': shippingMethod === 'local_pickup' }">
                  <input type="radio" v-model="shippingMethod" value="local_pickup" />
                  <div class="k-shipping-details">
                    <span class="k-ship-title">Store Pickup</span>
                    <span class="k-ship-price">Free</span>
                  </div>
                </label>
              </div>
              <div class="k-step-actions k-step-actions--split">
                <button type="button" @click="currentStep = 1" class="btn-kylie btn-kylie--outline">BACK</button>
                <button type="button" @click="currentStep = 3" class="btn-kylie btn-kylie--solid">CONTINUE TO PAYMENT</button>
              </div>
            </section>

            <!-- Step 3: Payment -->
            <section v-show="currentStep === 3" class="checkout-k-section">
              <h2 class="k-section-title">PAYMENT</h2>
              <div class="payment-container">
                <div v-if="isDemoMode" class="demo-payment-box">
                  <div class="demo-notice">
                    <strong>Demo Mode Active:</strong> No Mercado Pago credentials provided. You can test the checkout flow without actual payment.
                  </div>
                  <button type="button" @click="processDemoPayment" class="btn-kylie btn-kylie--solid" style="width: 100%;">COMPLETE ORDER</button>
                </div>
                <div v-else id="paymentBrick_container">
                  <!-- Mercado Pago Brick will render here -->
                </div>
              </div>
              <div class="k-step-actions k-step-actions--split" style="margin-top: 20px;">
                <button type="button" @click="currentStep = 2" class="btn-kylie btn-kylie--outline">BACK TO SHIPPING</button>
              </div>
            </section>

            <!-- Loading overlay during payment -->
            <div v-if="processing" class="payment-overlay">
              <div class="spinner"></div>
              <p>Processing payment securely...</p>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="checkout-k-sidebar" v-if="items.length > 0">
        <div class="k-summary-box">
          <h2 class="k-summary-title">IN YOUR BAG</h2>
          <div class="k-summary-items">
            <div v-for="item in items" :key="item.product.id" class="k-summary-item">
              <div class="k-summary-item-image">
                <NuxtImg :src="item.product.image" :alt="item.product.name" loading="lazy" />
                <span class="k-summary-item-qty">{{ item.quantity }}</span>
              </div>
              <div class="k-summary-item-info">
                <h3>{{ item.product.name }}</h3>
              </div>
              <Price class="k-summary-item-price" :amount="item.product.price * item.quantity" />
            </div>
          </div>
          
          <div class="k-summary-totals">
            <div class="k-summary-row">
              <span>SUBTOTAL</span>
              <Price :amount="subtotal" />
            </div>
            <div class="k-summary-row">
              <span>SHIPPING</span>
              <span v-if="shippingCost === 0">FREE</span>
              <Price v-else :amount="shippingCost" />
            </div>
            <div class="k-summary-row k-summary-total">
              <span>TOTAL</span>
              <Price :amount="total" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, subtotal, shippingMethod, shippingCost, total, clearCart } = useCart()
const config = useRuntimeConfig()

useHead({
  title: 'Checkout — Cosmetics',
  // Load the Mercado Pago SDK only on checkout (not on catalog pages).
  script: [
    { src: 'https://sdk.mercadopago.com/js/v2', async: true, defer: true },
  ],
})

const currentStep = ref(1)
const processing = ref(false)
const mp = ref<any>(null)
const isDemoMode = ref(false)

const form = reactive({
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  address: '123 Fake Street',
  city: 'Testville',
  zip: '1000'
})

onMounted(() => {
  if (items.value.length === 0) return

  const mpPublicKey = config.public.mercadopagoPublicKey
  
  if (!mpPublicKey || mpPublicKey === 'TEST-00000000-0000-0000-0000-000000000000') {
    isDemoMode.value = true
    return
  }
  
  const checkMP = setInterval(() => {
    if (window.MercadoPago) {
      clearInterval(checkMP)
      mp.value = new window.MercadoPago(mpPublicKey, { locale: 'es-AR' })
      renderPaymentBrick()
    }
  }, 200)
})

watch(currentStep, (newStep) => {
  if (newStep === 3 && !isDemoMode.value && mp.value) {
    // Re-render if they go back and forth
    setTimeout(() => {
      renderPaymentBrick()
    }, 100)
  }
})

async function processDemoPayment() {
  await processPayment({ token: 'demo_token', payment_method_id: 'demo' })
}

async function renderPaymentBrick() {
  const container = document.getElementById('paymentBrick_container')
  if (container) container.innerHTML = '' // clear previous

  const bricksBuilder = mp.value.bricks()
  
  await bricksBuilder.create('payment', 'paymentBrick_container', {
    initialization: {
      amount: total.value,
      preferenceId: '<PREFERENCE_ID>'
    },
    customization: {
      paymentMethods: {
        ticket: "all",
        creditCard: "all",
        debitCard: "all",
        mercadoPago: "all",
      },
      visual: {
        style: {
          theme: 'default',
          customVariables: {
            textPrimaryColor: '#000000',
            textSecondaryColor: '#666666',
            inputBackgroundColor: '#ffffff',
            formBackgroundColor: '#ffffff',
            baseColor: '#000000',
            successColor: '#000000',
            warningColor: '#000000',
            dangerColor: '#000000',
          }
        }
      }
    },
    callbacks: {
      onReady: () => {
        // Brick is ready
      },
      onSubmit: async (cardFormData: any) => {
        return await processPayment(cardFormData)
      },
      onError: (error: any) => {
        console.error('MP Error:', error)
      }
    }
  })
}

async function processPayment(cardFormData: any) {
  processing.value = true
  
  try {
    const payload = {
      ...cardFormData,
      shipping_method: shippingMethod.value,
      customer: toRaw(form),
      cartItems: items.value.map(item => ({
        id: item.product.databaseId || item.product.id,
        quantity: item.quantity
      }))
    }

    const graphqlUrl = config.public.graphqlUrl as string
    const baseUrl = graphqlUrl.replace('/graphql', '')
    
    const response = await $fetch(`${baseUrl}/wp-json/woonuxt/v1/process-payment`, {
      method: 'POST',
      body: payload
    })

    if ((response as any).success) {
      clearCart()
      navigateTo('/thank-you?order=' + (response as any).order_id)
    } else {
      alert('Payment failed: ' + ((response as any).message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Payment processing error:', error)
    alert('There was an error processing your payment. Please check console for details.')
  } finally {
    processing.value = false
  }
}

function submitCheckout() {
  // Handled inside Mercado Pago
}
</script>

<style scoped>
.checkout-page-kylie {
  background-color: #fff;
  min-height: calc(100vh - 80px);
  padding: 40px 0;
}

.checkout-k-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 60px;
  align-items: start;
}

@media (max-width: 992px) {
  .checkout-k-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .checkout-k-sidebar {
    grid-row: 1;
  }
}

.checkout-k-title {
  font-size: 24px;
  font-weight: 300;
  margin-bottom: 32px;
  letter-spacing: 0.1em;
  text-align: center;
}

/* Stepper */
.k-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}
.k-step {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
}
.k-step.is-active {
  color: #000;
}
.step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 11px;
}
.step-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: none;
}
@media (min-width: 640px) {
  .step-label { display: block; }
}
.k-step-line {
  flex: 1;
  height: 1px;
  background-color: #eee;
  margin: 0 16px;
  max-width: 40px;
}

/* Forms */
.k-section-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #000;
}

.k-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.k-col-2 {
  grid-column: span 2;
}

.k-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  background-color: #fff;
  font-family: inherit;
  font-size: 13px;
  transition: border-color 0.2s ease;
}
.k-input:focus {
  outline: none;
  border-color: #000;
}
.k-input::placeholder {
  color: #999;
}

/* Step Actions */
.k-step-actions {
  display: flex;
  justify-content: flex-end;
}
.k-step-actions--split {
  justify-content: space-between;
}

/* Shipping Methods */
.k-shipping-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.k-shipping-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;
}
.k-shipping-option.is-selected {
  border-color: #000;
  background-color: #fafafa;
}
.k-shipping-details {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 13px;
}
.k-ship-title {
  color: #000;
}
.k-ship-price {
  font-weight: 600;
}

/* Sidebar */
.k-summary-box {
  background-color: #fafafa;
  padding: 32px;
  border: 1px solid #eee;
}

.k-summary-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 12px;
}

.k-summary-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.k-summary-item {
  display: flex;
  gap: 16px;
  align-items: center;
}

.k-summary-item-image {
  position: relative;
  width: 60px;
  height: 75px;
  background-color: #fff;
  border: 1px solid #eee;
}
.k-summary-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.k-summary-item-qty {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #000;
  color: #fff;
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.k-summary-item-info {
  flex: 1;
}
.k-summary-item-info h3 {
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
}

.k-summary-item-price {
  font-size: 12px;
  font-weight: 600;
}

.k-summary-totals {
  border-top: 1px solid #ddd;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.k-summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  letter-spacing: 0.05em;
}

.k-summary-total {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ddd;
}

/* Buttons */
.btn-kylie {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 24px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}
.btn-kylie--solid {
  background-color: #000;
  color: #fff;
  border: 1px solid #000;
}
.btn-kylie--solid:hover {
  background-color: transparent;
  color: #000;
}
.btn-kylie--outline {
  background-color: transparent;
  color: #000;
  border: 1px solid #000;
}
.btn-kylie--outline:hover {
  background-color: #000;
  color: #fff;
}

/* Overlays */
.payment-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.demo-payment-box {
  background-color: #fafafa;
  border: 1px dashed #ccc;
  padding: 24px;
  text-align: center;
}
.demo-notice {
  margin-bottom: 16px;
  font-size: 12px;
  background-color: #fdf6f5;
  color: #000;
  padding: 12px;
  border: 1px solid #dca4a1;
}
</style>
