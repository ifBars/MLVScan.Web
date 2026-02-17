import { allDocs } from './registry'

export interface SearchResult {
  docId: string
  title: string
  slug: string
  excerpt: string
  matches: string[]
}

export function searchDocs(query: string): SearchResult[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const results: SearchResult[] = []

  for (const doc of allDocs) {
    const haystack = [doc.title, doc.description, ...doc.keywords]
    const matched = haystack.filter((value) => value.toLowerCase().includes(normalized))

    if (matched.length === 0) continue

    results.push({
      docId: doc.id,
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.description,
      matches: matched.slice(0, 3),
    })
  }

  return results
}
