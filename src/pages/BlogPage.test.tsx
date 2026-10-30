import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, within } from '@testing-library/dom'
import { describe, expect, it } from 'vitest'
import { allBlogPosts } from '@/blog/registry'
import BlogPage from './BlogPage'

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('BlogPage announcements', () => {
  it('announces the result count without putting articles in a live region', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    try {
      act(() => root.render(<MemoryRouter><BlogPage /></MemoryRouter>))
      const page = within(container)
      const status = page.getByRole('status')
      expect(status.textContent).toBe(`${allBlogPosts.length} posts found`)
      for (const article of page.getAllByRole('article')) {
        expect(article.closest('[aria-live], [role="status"]')).toBeNull()
      }
      expect(status.querySelector('article')).toBeNull()

      const search = page.getByRole('searchbox', { name: 'Search blog posts' })
      act(() => fireEvent.change(search, { target: { value: 'October' } }))
      expect(status.textContent).toBe('1 post found')
      expect(page.getAllByRole('article')).toHaveLength(1)

      act(() => fireEvent.click(page.getByRole('button', { name: 'Engineering' })))
      expect(status.textContent).toBe('0 posts found')
      expect(page.queryAllByRole('article')).toHaveLength(0)

      act(() => fireEvent.click(page.getByRole('button', { name: 'Clear filters' })))
      expect(status.textContent).toBe(`${allBlogPosts.length} posts found`)
      expect(page.getAllByRole('article')).toHaveLength(allBlogPosts.length)
    } finally {
      act(() => root.unmount())
      container.remove()
    }
  })
})
