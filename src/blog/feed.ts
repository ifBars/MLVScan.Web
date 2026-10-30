import { allBlogPosts, type BlogPost } from './registry'
import { escapeHtml, SITE_URL } from '../seo/site'

export function buildBlogFeed(posts: BlogPost[] = allBlogPosts): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>MLVScan Blog</title><link>${SITE_URL}/blog</link>
<description>Library updates, engineering notes, and upcoming ideas from MLVScan.</description>
<language>en-us</language>
<atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
${posts.map((post) => `<item>
<title>${escapeHtml(post.title)}</title>
<link>${SITE_URL}/blog/${escapeHtml(post.slug)}</link>
<guid isPermaLink="true">${SITE_URL}/blog/${escapeHtml(post.slug)}</guid>
<description>${escapeHtml(post.description)}</description>
<pubDate>${new Date(`${post.publishedDate}T00:00:00Z`).toUTCString()}</pubDate>
<category>${escapeHtml(post.category)}</category>
</item>`).join('\n')}
</channel></rss>`
}
