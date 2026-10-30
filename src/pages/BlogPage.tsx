import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Rss, Search } from 'lucide-react'
import { blogCategories, filterBlogPosts, formatBlogDate } from '@/blog/registry'
import { getBlogSeoPage } from '@/blog/seo'
import Seo from '@/components/seo/Seo'

export default function BlogPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const posts = filterBlogPosts(query, category)

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <Seo page={getBlogSeoPage()} />
      <link rel="alternate" type="application/rss+xml" title="MLVScan Blog" href="/blog/feed.xml" />
      <header className="mb-12 border-b border-white/10 pb-10">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-teal-400">From the developer</p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">The MLVScan blog</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-400">Library updates, notes from development, and a look at what comes next.</p>
        <a href="/blog/feed.xml" className="mt-6 inline-flex items-center gap-2 text-sm text-teal-300 hover:text-teal-200"><Rss className="size-4" />Subscribe via RSS</a>
      </header>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {['All', ...blogCategories].map((name) => (
            <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(name)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${category === name ? 'border-teal-400/40 bg-teal-400/10 text-teal-200' : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}>{name}</button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-gray-500" />
          <input aria-label="Search blog posts" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts…" className="w-full rounded-lg border border-white/10 bg-gray-950/50 py-2 pl-10 pr-3 text-sm text-white placeholder:text-gray-500 focus-visible:outline-2 focus-visible:outline-teal-400" />
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {posts.length === 0 ? (
          <div className="border-y border-white/10 py-16 text-center">
            <h2 className="text-xl font-semibold text-white">No posts found</h2>
            <p className="mt-2 text-gray-400">Try another search or category.</p>
            <button type="button" onClick={() => { setQuery(''); setCategory('All') }} className="mt-5 text-teal-300 hover:underline">Clear filters</button>
          </div>
        ) : posts.map((post) => (
          <article key={post.slug} className="border-b border-white/10 py-8 first:pt-2">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span className="text-teal-300">{post.category}</span><span aria-hidden="true">/</span><time dateTime={post.publishedDate}>{formatBlogDate(post.publishedDate)}</time>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl"><Link to={`/blog/${post.slug}`} onClick={() => window.scrollTo(0, 0)} className="group inline-flex items-center gap-3 text-white transition-colors hover:text-teal-300">{post.title}<ArrowUpRight className="size-5 shrink-0 text-teal-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link></h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-gray-400">{post.description}</p>
            <p className="mt-5 text-sm text-gray-500">By {post.author}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
