import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppHeader from '../components/AppHeader.vue'

describe('AppHeader', () => {
  it('reveals a search box in the mobile menu when toggled', async () => {
    const wrapper = await mountSuspended(AppHeader)

    // Desktop search box is present; mobile menu is closed.
    expect(wrapper.findAll('.search-box')).toHaveLength(1)

    await wrapper.find('.header__menu-btn').trigger('click')

    // Opening the mobile menu adds a second (mobile) search box.
    expect(wrapper.findAll('.search-box').length).toBeGreaterThan(1)
    expect(wrapper.find('.header__mobile-search').exists()).toBe(true)
  })
})
