export const SITE_NAME = "MLVScan"
export const SITE_URL = "https://mlvscan.com"
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon.png`
export const DEFAULT_ROBOTS = "index,follow,max-image-preview:large"

export type SchemaObject = Record<string, unknown>

export type SeoFaq = {
  question: string
  answer: string
}

export type SeoFallbackLink = {
  href: string
  label: string
}

export type SeoPage = {
  path: string
  title: string
  description: string
  keywords?: string[]
  heading?: string
  type?: "website" | "article"
  image?: string
  robots?: string
  publishedTime?: string
  modifiedTime?: string
  schema?: SchemaObject[]
  faqs?: SeoFaq[]
  fallbackParagraphs?: string[]
  fallbackLinks?: SeoFallbackLink[]
  lastModified?: string
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalizedPath}`
}

export function dedupeKeywords(keywords: string[] = []): string[] {
  const seen = new Set<string>()
  const deduped: string[] = []

  for (const keyword of keywords) {
    const normalized = keyword.trim()
    const key = normalized.toLowerCase()
    if (!normalized || seen.has(key)) {
      continue
    }

    seen.add(key)
    deduped.push(normalized)
  }

  return deduped
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function buildMetaDefinition(page: SeoPage) {
  const canonicalUrl = absoluteUrl(page.path)
  const imageUrl = absoluteUrl(page.image ?? DEFAULT_OG_IMAGE)
  const robots = page.robots ?? DEFAULT_ROBOTS
  const keywords = dedupeKeywords(page.keywords)

  return {
    ...page,
    canonicalUrl,
    imageUrl,
    robots,
    keywords,
    type: page.type ?? "website",
  }
}

export function buildHeadMarkup(page: SeoPage): string {
  const meta = buildMetaDefinition(page)
  const lines = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.imageUrl)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.imageUrl)}" />`,
  ]

  if (meta.keywords.length > 0) {
    lines.splice(2, 0, `<meta name="keywords" content="${escapeHtml(meta.keywords.join(", "))}" />`)
  }

  if (meta.publishedTime) {
    lines.push(
      `<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />`,
    )
  }

  if (meta.modifiedTime) {
    lines.push(
      `<meta property="article:modified_time" content="${escapeHtml(meta.modifiedTime)}" />`,
    )
  }

  for (const schemaEntry of meta.schema ?? []) {
    const serializedSchema = JSON.stringify(schemaEntry).replaceAll("<", "\\u003c")
    lines.push(
      `<script type="application/ld+json">${serializedSchema}</script>`,
    )
  }

  return lines.join("\n    ")
}

export function buildFallbackMarkup(page: SeoPage): string {
  const heading = page.heading ?? page.title
  const paragraphs = page.fallbackParagraphs ?? [page.description]
  const links = page.fallbackLinks ?? []
  const intro = paragraphs
    .map((paragraph) => `      <p>${escapeHtml(paragraph)}</p>`)
    .join("\n")
  const linkList =
    links.length > 0
      ? `\n      <ul>\n${links
          .map(
            (link) =>
              `        <li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`,
          )
          .join("\n")}\n      </ul>`
      : ""

  return [
    "<noscript>",
    '  <main style="margin:0 auto;max-width:72rem;padding:3rem 1.5rem;font-family:Inter,Arial,sans-serif;line-height:1.65;color:#e5e7eb;background:#020617;">',
    `    <h1 style="margin:0 0 1rem;font-size:2rem;line-height:1.15;color:#f8fafc;">${escapeHtml(heading)}</h1>`,
    intro,
    linkList,
    "  </main>",
    "</noscript>",
  ].join("\n")
}

export function injectSeoIntoHtml(template: string, page: SeoPage): string {
  const headMarkup = buildHeadMarkup(page)
  const fallbackMarkup = buildFallbackMarkup(page)
  const nextHead = `<!--app-seo-start-->\n    ${headMarkup}\n    <!--app-seo-end-->`
  const nextFallback = `<!--app-seo-body-start-->\n    ${fallbackMarkup}\n    <!--app-seo-body-end-->`

  return template
    .replace(/<!--app-seo-start-->[\s\S]*?<!--app-seo-end-->/, nextHead)
    .replace(/<!--app-seo-body-start-->[\s\S]*?<!--app-seo-body-end-->/, nextFallback)
}

export function buildSitemapXml(pages: SeoPage[]): string {
  const urls = pages
    .map((page) => {
      const lastmod = page.lastModified
        ? `\n    <lastmod>${page.lastModified}</lastmod>`
        : ""

      return `  <url>\n    <loc>${absoluteUrl(page.path)}</loc>${lastmod}\n  </url>`
    })
    .join("\n")

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n")
}

export function buildRobotsTxt(): string {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: ChatGPT-User",
    "Allow: /",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "",
    "User-agent: anthropic-ai",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n")
}
