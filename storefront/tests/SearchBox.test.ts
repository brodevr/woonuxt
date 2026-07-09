import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import SearchBox from '../components/SearchBox.vue'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

describe('SearchBox', () => {
  beforeEach(() => navigateToMock.mockClear())

  it('navigates to /search with the query on submit', async () => {
    const wrapper = await mountSuspended(SearchBox)
    await wrapper.find('input').setValue('lamp')
    await wrapper.find('form').trigger('submit')

    expect(navigateToMock).toHaveBeenCalledWith({ path: '/search', query: { q: 'lamp' } })
  })

  it('trims the query and omits it when empty', async () => {
    const wrapper = await mountSuspended(SearchBox)
    await wrapper.find('input').setValue('   ')
    await wrapper.find('form').trigger('submit')

    expect(navigateToMock).toHaveBeenCalledWith({ path: '/search', query: {} })
  })

  it('seeds the input from the initial prop', async () => {
    const wrapper = await mountSuspended(SearchBox, { props: { initial: 'chair' } })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('chair')
  })
})
