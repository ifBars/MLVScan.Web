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
    slug: 'halloween-update-scan-report-private-review',
    title: 'Happy Halloween: a clearer scan report, private review, and what comes next',
    description: 'A rebuilt browser scan report, private sample review, optional website diagnostics, and the plan for opt-in plugin diagnostics.',
    publishedDate: '2026-10-31',
    author: 'Bars',
    category: 'Updates',
    tags: ['Website', 'Scanner', 'Privacy', 'Telemetry', 'Core'],
  },
  {
    slug: 'welcome-to-the-mlvscan-blog',
    title: 'Why MLVScan has a blog',
    description: 'A home for library updates, engineering notes, and upcoming ideas, with room to explain the thinking behind them.',
    publishedDate: '2026-10-30',
    author: 'Bars',
    category: 'Updates',
    tags: ['MLVScan', 'Community'],
  },
  {
    slug: 'october-update-core-1-9-1-loader-2-1-7',
    title: 'The October update: better command recovery, fewer false alarms',
    description: 'What Core 1.9.1, loader 2.1.7, and DevCLI 1.3.1 change for players and mod authors.',
    publishedDate: '2026-10-30',
    author: 'Bars',
    category: 'Updates',
    tags: ['Releases', 'Core', 'MelonLoader', 'BepInEx', 'DevCLI'],
  },
  {
    slug: 'why-a-suspicious-api-is-not-a-verdict',
    title: 'Why a suspicious API call is not the whole verdict',
    description: 'Base64, process launches, and reflection can all have legitimate uses. The surrounding behavior matters.',
    publishedDate: '2026-10-30',
    author: 'Bars',
    category: 'Engineering',
    tags: ['Detection', 'False positives', 'Static analysis'],
  },
  {
    slug: 'scan-your-mod-before-the-release',
    title: 'Scan your mod before the release',
    description: 'Use the release guard to check a compiled DLL in CI, retain the report, and optionally publish an attestation.',
    publishedDate: '2026-10-30',
    author: 'Bars',
    category: 'Engineering',
    tags: ['CI', 'GitHub Actions', 'Attestations', 'Mod authors'],
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
