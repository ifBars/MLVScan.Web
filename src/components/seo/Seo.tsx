import { useEffect } from "react"

import { buildMetaDefinition, type SeoPage } from "../../seo/site"

function upsertMeta(selector: string, attributes: Record<string, string>): void {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement("meta")
    document.head.appendChild(element)
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
  }
}

function upsertLink(selector: string, attributes: Record<string, string>): void {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null

  if (!element) {
    element = document.createElement("link")
    document.head.appendChild(element)
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
  }
}

function removeNode(selector: string): void {
  document.head.querySelector(selector)?.remove()
}

export default function Seo({ page }: { page: SeoPage }) {
  useEffect(() => {
    const meta = buildMetaDefinition(page)

    document.title = meta.title

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: meta.description,
    })
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: meta.robots,
    })

    if (meta.keywords.length > 0) {
      upsertMeta('meta[name="keywords"]', {
        name: "keywords",
        content: meta.keywords.join(", "),
      })
    } else {
      removeNode('meta[name="keywords"]')
    }

    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: meta.canonicalUrl,
    })

    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: "MLVScan",
    })
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: meta.type,
    })
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: meta.title,
    })
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: meta.description,
    })
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: meta.canonicalUrl,
    })
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: meta.imageUrl,
    })

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    })
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: meta.title,
    })
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: meta.description,
    })
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: meta.imageUrl,
    })

    if (meta.publishedTime) {
      upsertMeta('meta[property="article:published_time"]', {
        property: "article:published_time",
        content: meta.publishedTime,
      })
    } else {
      removeNode('meta[property="article:published_time"]')
    }

    if (meta.modifiedTime) {
      upsertMeta('meta[property="article:modified_time"]', {
        property: "article:modified_time",
        content: meta.modifiedTime,
      })
    } else {
      removeNode('meta[property="article:modified_time"]')
    }

    document.head
      .querySelectorAll('script[data-mlvscan-seo-schema="true"]')
      .forEach((element) => element.remove())

    for (const schemaEntry of meta.schema ?? []) {
      const script = document.createElement("script")
      script.type = "application/ld+json"
      script.dataset.mlvscanSeoSchema = "true"
      script.text = JSON.stringify(schemaEntry)
      document.head.appendChild(script)
    }
  }, [page])

  return null
}
