import { describe, expect, it } from "vitest"

import { buildHeadMarkup, type SeoPage } from "./site"

describe("buildHeadMarkup", () => {
  it("marks prerendered JSON-LD scripts so the client SEO layer can replace them without duplicates", () => {
    const page: SeoPage = {
      path: "/docs/unity-mod-antivirus",
      title: "Unity Mod Antivirus Guide | MLVScan",
      description: "How MLVScan detects common MelonLoader and BepInEx mod malware patterns before load",
      schema: [
        {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "Unity Mod Antivirus Guide",
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [],
        },
      ],
    }

    const markup = buildHeadMarkup(page)
    const taggedScripts = markup.match(/data-mlvscan-seo-schema="true"/g) ?? []

    expect(taggedScripts).toHaveLength(2)
    expect(markup).toContain('<script type="application/ld+json" data-mlvscan-seo-schema="true">')
  })
})
