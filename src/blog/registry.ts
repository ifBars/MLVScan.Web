export const blogCategories = ['Updates', 'Engineering', 'Looking ahead'] as const
export type BlogCategory = typeof blogCategories[number]

export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedDate: string
  updatedDate?: string
  author: string
  category: BlogCategory
  tags: string[]
}

// Only register posts that are ready to publish. Keep unfinished MDX in _drafts/.
const posts: BlogPost[] = [
  {
    slug: 'welcome-to-the-mlvscan-blog',
    title: 'A place for what comes next',
    description: 'Library updates, engineering notes, and a closer look at where MLVScan is headed.',
    publishedDate: '2026-10-30',
    author: 'Bars',
    category: 'Updates',
    tags: ['MLVScan', 'Community'],
  },
]

export const allBlogPosts = [...posts].sort((a, b) =>
  b.publishedDate.localeCompare(a.publishedDate) || a.slug.localeCompare(b.slug),
)

export function getBlogPost(slug: string): BlogPost | undefined {
  return allBlogPosts.find((post) => post.slug === slug)
}

export function filterBlogPosts(query: string, category: string = 'All'): BlogPost[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return allBlogPosts.filter((post) => {
    const text = [post.title, post.description, post.author, post.category, ...post.tags].join(' ').toLowerCase()
    return (category === 'All' || post.category === category) && terms.every((term) => text.includes(term))
  })
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
