import { allBlogPosts, type BlogPost } from './registry'
import { SITE_URL, type SeoPage } from '../seo/site'

export function getBlogSeoPage(): SeoPage {
  return {
    path: '/blog',
    title: 'Blog | MLVScan',
    heading: 'The MLVScan blog',
    description: 'Library updates, engineering notes, and ideas for the future of MLVScan.',
    fallbackParagraphs: ['Follow development updates and upcoming ideas from MLVScan.'],
    fallbackLinks: allBlogPosts.map((post) => ({ href: `/blog/${post.slug}`, label: post.title })),
    lastModified: allBlogPosts[0]?.publishedDate,
  }
}

export function getBlogPostSeoPage(post: BlogPost): SeoPage {
  const path = `/blog/${post.slug}`
  return {
    path,
    title: `${post.title} | MLVScan Blog`,
    heading: post.title,
    description: post.description,
    type: 'article',
    keywords: post.tags,
    publishedTime: `${post.publishedDate}T00:00:00Z`,
    modifiedTime: `${post.updatedDate ?? post.publishedDate}T00:00:00Z`,
    lastModified: post.updatedDate ?? post.publishedDate,
    fallbackParagraphs: [post.description],
    fallbackLinks: [{ href: '/blog', label: 'Back to the blog' }],
    schema: [{
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.publishedDate,
      dateModified: post.updatedDate ?? post.publishedDate,
      author: { '@type': 'Person', name: post.author },
      publisher: { '@type': 'Organization', name: 'MLVScan' },
      mainEntityOfPage: `${SITE_URL}${path}`,
      url: `${SITE_URL}${path}`,
    }],
  }
}
