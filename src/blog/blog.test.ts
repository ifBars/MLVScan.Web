import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allBlogPosts, filterBlogPosts, formatBlogDate, getBlogPost } from './registry'
import { buildBlogFeed } from './feed'
import { getStaticSeoPages } from '../seo/routes'
import { getBlogPostSeoPage } from './seo'

describe('blog publishing', () => {
  it('requires unique valid slugs, real dates, and a body for every published post', () => {
    expect(new Set(allBlogPosts.map((post) => post.slug)).size).toBe(allBlogPosts.length)
    for (const post of allBlogPosts) {
      expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(new Date(`${post.publishedDate}T00:00:00Z`).toISOString().slice(0, 10)).toBe(post.publishedDate)
      expect(readFileSync(resolve('src/content/blog', `${post.slug}.mdx`), 'utf8').trim()).not.toBe('')
    }
    const files = readdirSync(resolve('src/content/blog')).filter((file) => file.endsWith('.mdx'))
    expect(files.sort()).toEqual(allBlogPosts.map((post) => `${post.slug}.mdx`).sort())
  })

  it('sorts newest first and searches words, tags, and categories together', () => {
    expect(allBlogPosts.map((post) => post.publishedDate)).toEqual(allBlogPosts.map((post) => post.publishedDate).sort().reverse())
    expect(filterBlogPosts('  COMMUNITY library ', 'Updates')).toHaveLength(1)
    expect(filterBlogPosts('', 'Looking ahead')).toHaveLength(0)
    expect(filterBlogPosts('no-such-post')).toHaveLength(0)
    expect(filterBlogPosts('')).toEqual(allBlogPosts)
  })

  it('keeps drafts and unknown slugs out of lookup, SEO, and RSS', () => {
    expect(getBlogPost('opt-in-telemetry')).toBeUndefined()
    expect(getBlogPost('unknown')).toBeUndefined()
    const paths = getStaticSeoPages().map((page) => page.path)
    expect(paths).toContain('/blog')
    for (const post of allBlogPosts) expect(paths).toContain(`/blog/${post.slug}`)
    expect(paths).not.toContain('/blog/opt-in-telemetry')
    expect(buildBlogFeed()).not.toContain('opt-in-telemetry')
  })

  it('emits parseable RSS with escaped text and stable article URLs', () => {
    const post = { ...allBlogPosts[0], title: 'News & <updates>', description: 'Quotes " & <tags>' }
    const xml = new DOMParser().parseFromString(buildBlogFeed([post]), 'application/xml')
    expect(xml.querySelector('parsererror')).toBeNull()
    expect(xml.querySelector('item title')?.textContent).toBe(post.title)
    expect(xml.querySelector('item description')?.textContent).toBe(post.description)
    expect(xml.querySelector('item guid')?.textContent).toBe(`https://mlvscan.com/blog/${post.slug}`)
  })

  it('uses article metadata and formats dates without local timezone shifts', () => {
    const post = allBlogPosts[0]
    const seo = getBlogPostSeoPage(post)
    expect(seo.type).toBe('article')
    expect(seo.schema?.[0]['@type']).toBe('BlogPosting')
    expect(seo.publishedTime).toBe(`${post.publishedDate}T00:00:00Z`)
    expect(formatBlogDate('2026-10-30')).toBe('October 30, 2026')
  })
})
