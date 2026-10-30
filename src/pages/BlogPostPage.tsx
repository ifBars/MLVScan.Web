import { Component, lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getBlogPost, formatBlogDate } from '@/blog/registry'
import { getBlogPostSeoPage } from '@/blog/seo'
import Seo from '@/components/seo/Seo'
import '@/blog/blog.css'

const modules = import.meta.glob<{ default: ComponentType }>('../content/blog/*.mdx')
const contents = Object.fromEntries(Object.entries(modules).map(([path, load]) => [path, lazy(load)]))

class PostErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <p role="alert" className="text-gray-300">This post could not load. Please refresh to try again.</p> : this.props.children
  }
}

export default function BlogPostPage() {
  const { slug = '' } = useParams()
  const post = getBlogPost(slug)
  const Content = post ? contents[`../content/blog/${post.slug}.mdx`] : undefined

  if (!post || !Content) {
    return <div className="mx-auto max-w-3xl px-6 pb-24 pt-32">
      <Seo page={{ path: `/blog/${slug}`, title: 'Post not found | MLVScan', description: 'This blog post is unavailable.', robots: 'noindex,follow' }} />
      <h1 className="mb-6 text-3xl font-bold text-white">Post not found</h1>
      <Link to="/blog" onClick={() => window.scrollTo(0, 0)} className="text-teal-300 hover:underline">Back to the blog</Link>
    </div>
  }

  return (
    <article className="mx-auto max-w-3xl px-6 pb-24 pt-32">
      <Seo page={getBlogPostSeoPage(post)} />
      <Link to="/blog" onClick={() => window.scrollTo(0, 0)} className="mb-10 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-teal-300"><ArrowLeft className="size-4" />Back to the blog</Link>
      <header className="mb-10 border-b border-white/10 pb-8">
        <p className="mb-4 text-sm font-medium text-teal-300">{post.category}</p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-xl leading-relaxed text-gray-400">{post.description}</p>
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400"><span>By {post.author}</span><time dateTime={post.publishedDate}>{formatBlogDate(post.publishedDate)}</time>{post.updatedDate && <span>Updated {formatBlogDate(post.updatedDate)}</span>}</div>
        <ul aria-label="Tags" className="mt-5 flex flex-wrap gap-2">{post.tags.map((tag) => <li key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">{tag}</li>)}</ul>
      </header>
      <PostErrorBoundary key={post.slug}>
        <Suspense fallback={<p role="status" className="text-gray-400">Loading post…</p>}>
          <div className="docs-prose blog-prose min-w-0 break-words"><Content /></div>
        </Suspense>
      </PostErrorBoundary>
      <footer className="mt-12 border-t border-white/10 pt-6"><Link to="/blog" onClick={() => window.scrollTo(0, 0)} className="text-teal-300 hover:underline">All posts</Link></footer>
    </article>
  )
}
