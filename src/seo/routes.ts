import { allAdvisories } from "../advisories/registry"
import type { AdvisoryMeta } from "../advisories/types"
import { homeFaqs } from "../content/homeFaq"
import { allDocs, type DocMeta } from "../docs/registry"
import { allThreatFamilies } from "../families/registry"
import type { ThreatFamilyMeta } from "../families/types"
import { SITE_NAME, SITE_URL, type SchemaObject, type SeoPage } from "./site"

const SOFTWARE_CATEGORY = "SecurityApplication"

function isoDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toISOString()
}

function websiteSchema(): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "MLV Scan",
    url: SITE_URL,
    description:
      "Unity mod antivirus and malware scanner for MelonLoader and BepInEx .NET assemblies.",
  }
}

function organizationSchema(): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "MLV Scan",
    url: SITE_URL,
    sameAs: [
      "https://github.com/ifBars/MLVScan",
      "https://www.nexusmods.com/site/mods/1689?tab=files",
    ],
  }
}

function softwareSchema(name: string, description: string, urlPath: string): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    alternateName: "MLV Scan",
    applicationCategory: SOFTWARE_CATEGORY,
    operatingSystem: "Windows, Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description,
    url: `${SITE_URL}${urlPath}`,
  }
}

function faqSchema(): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

function breadcrumbSchema(items: Array<{ name: string; path: string }>): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function getHomeSeoPage(): SeoPage {
  const description =
    "MLVScan is a Unity mod antivirus and malware scanner for MelonLoader and BepInEx mods. Scan .NET assemblies locally before you install them."

  return {
    path: "/",
    title: "MLVScan | Unity Mod Antivirus for MelonLoader and BepInEx",
    heading: "MLVScan Unity Mod Antivirus",
    description,
    keywords: [
      "MLVScan",
      "MLV Scan",
      "unity mod antivirus",
      "mod malware scanner",
      "MelonLoader antivirus",
      "BepInEx antivirus",
      "mod security scanner",
    ],
    schema: [
      websiteSchema(),
      organizationSchema(),
      softwareSchema("MLVScan", description, "/"),
      faqSchema(),
    ],
    faqs: homeFaqs,
    fallbackParagraphs: [
      description,
      "MLVScan inspects .NET mod assemblies locally, documents malware families and false positives, and publishes security advisories for the modding community.",
    ],
    fallbackLinks: [
      { href: "/scan", label: "Use the browser scanner" },
      { href: "/docs/unity-mod-antivirus", label: "Read the Unity mod antivirus guide" },
      { href: "/advisories", label: "Browse security advisories" },
    ],
    lastModified: new Date().toISOString(),
  }
}

export function getScanSeoPage(): SeoPage {
  const description =
    "Use the MLVScan browser scanner to check suspicious MelonLoader and BepInEx assemblies locally. Files stay on your device while MLVScan analyzes .NET behavior."

  return {
    path: "/scan",
    title: "Browser Scanner | MLVScan Unity Mod Antivirus",
    heading: "Browser scanner for Unity mods",
    description,
    keywords: [
      "browser scanner",
      "MLV Scan",
      "unity mod scanner",
      "MelonLoader malware scanner",
      "BepInEx malware scanner",
      "scan .NET assembly",
    ],
    schema: [
      softwareSchema("MLVScan Browser Scanner", description, "/scan"),
      breadcrumbSchema([
        { name: "MLVScan", path: "/" },
        { name: "Browser Scanner", path: "/scan" },
      ]),
    ],
    fallbackParagraphs: [
      description,
      "The browser scanner is designed for local-first triage so you can inspect mod DLLs before they ever run inside a Unity game.",
    ],
    fallbackLinks: [
      { href: "/", label: "Back to the homepage" },
      { href: "/docs/unity-mod-antivirus", label: "Read the Unity mod antivirus guide" },
    ],
    lastModified: new Date().toISOString(),
  }
}

export function getInspectorSeoPage(): SeoPage {
  const description =
    "MLVInspector is the local desktop inspection workspace for suspicious .NET mods, with explorer views, IL analysis, and findings anchored to real code."

  return {
    path: "/inspector",
    title: "MLVInspector | Local Assembly Triage for Suspicious Mods",
    heading: "MLVInspector desktop analysis workspace",
    description,
    keywords: [
      "MLVInspector",
      "assembly inspector",
      "IL viewer",
      "mod triage",
      ".NET malware analysis",
    ],
    schema: [
      softwareSchema("MLVInspector", description, "/inspector"),
      breadcrumbSchema([
        { name: "MLVScan", path: "/" },
        { name: "MLVInspector", path: "/inspector" },
      ]),
    ],
    fallbackParagraphs: [description],
    fallbackLinks: [
      { href: "/", label: "Back to MLVScan" },
      { href: "https://github.com/ifBars/MLVInspector/releases", label: "Download MLVInspector" },
    ],
    lastModified: new Date().toISOString(),
  }
}

export function getDocsSeoPage(): SeoPage {
  const description =
    "Read MLVScan documentation for the runtime plugin, browser scanner, DevCLI, WASM package, and security workflows for MelonLoader and BepInEx."

  return {
    path: "/docs",
    title: "Docs | MLVScan Mod Security Guides and API References",
    heading: "MLVScan documentation",
    description,
    keywords: [
      "MLVScan docs",
      "mod security guide",
      "MelonLoader docs",
      "BepInEx docs",
      "mod malware scanning",
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "MLVScan Documentation",
        description,
        url: `${SITE_URL}/docs`,
      },
      breadcrumbSchema([
        { name: "MLVScan", path: "/" },
        { name: "Docs", path: "/docs" },
      ]),
    ],
    fallbackParagraphs: [description],
    fallbackLinks: [
      { href: "/docs/unity-mod-antivirus", label: "Unity mod antivirus guide" },
      { href: "/docs/libraries/mlvscan", label: "MLVScan runtime docs" },
      { href: "/docs/libraries/core", label: "MLVScan.Core docs" },
    ],
    lastModified: new Date().toISOString(),
  }
}

export function getDocSeoPage(doc: DocMeta): SeoPage {
  const path = doc.slug === "" ? "/docs" : `/docs/${doc.slug}`
  const description = doc.description
  const keywords = ["MLVScan", ...doc.keywords]

  const schema: SchemaObject[] = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: doc.title,
      description,
      url: `${SITE_URL}${path}`,
      author: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
    breadcrumbSchema([
      { name: "MLVScan", path: "/" },
      { name: "Docs", path: "/docs" },
      { name: doc.title, path },
    ]),
  ]

  if (doc.id === "unity-mod-antivirus") {
    schema.push(faqSchema())
  }

  return {
    path,
    title:
      doc.id === "unity-mod-antivirus"
        ? "Unity Mod Antivirus Guide | MLVScan"
        : `${doc.title} | MLVScan Docs`,
    heading: doc.id === "unity-mod-antivirus" ? "Unity mod antivirus guide" : doc.title,
    description,
    keywords,
    schema,
    faqs: doc.id === "unity-mod-antivirus" ? homeFaqs : undefined,
    fallbackParagraphs: [
      description,
      doc.id === "unity-mod-antivirus"
        ? "This guide explains how to scan MelonLoader and BepInEx DLL mods, what MLVScan detects, and how to distinguish common false positives from real malware behavior."
        : "Open the full MLVScan documentation page in a JavaScript-enabled browser to read the complete guide and linked resources.",
    ],
    fallbackLinks: [
      { href: "/docs", label: "Browse all documentation" },
      { href: "/scan", label: "Open the browser scanner" },
    ],
    lastModified: new Date().toISOString(),
  }
}

export function getAdvisoriesSeoPage(): SeoPage {
  const description =
    "Read MLVScan security advisories covering malicious mod reuploads, false positives, threat families, and mod malware analysis for the Unity modding community."

  return {
    path: "/advisories",
    title: "Security Advisories | MLVScan Mod Malware Research",
    heading: "MLVScan security advisories",
    description,
    keywords: [
      "mod security advisories",
      "unity mod malware",
      "mod malware analysis",
      "MelonLoader malware",
      "BepInEx malware",
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "MLVScan Security Advisories",
        description,
        url: `${SITE_URL}/advisories`,
      },
      breadcrumbSchema([
        { name: "MLVScan", path: "/" },
        { name: "Advisories", path: "/advisories" },
      ]),
    ],
    fallbackParagraphs: [description],
    fallbackLinks: [
      { href: "/advisories/families", label: "Browse threat families" },
      { href: "/scan", label: "Use the browser scanner" },
    ],
    lastModified: new Date().toISOString(),
  }
}

export function getAdvisorySeoPage(advisory: AdvisoryMeta): SeoPage {
  const path = `/advisories/${advisory.slug}`

  return {
    path,
    title: `${advisory.title} | MLVScan Advisory`,
    heading: advisory.title,
    description: advisory.description,
    keywords: ["MLVScan", "security advisory", ...advisory.keywords],
    type: "article",
    publishedTime: isoDate(advisory.publishedDate),
    modifiedTime: advisory.updatedDate ? isoDate(advisory.updatedDate) : undefined,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: advisory.title,
        description: advisory.description,
        datePublished: isoDate(advisory.publishedDate),
        dateModified: advisory.updatedDate ? isoDate(advisory.updatedDate) : isoDate(advisory.publishedDate),
        author: {
          "@type": "Organization",
          name: SITE_NAME,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
        },
        mainEntityOfPage: `${SITE_URL}${path}`,
      },
      breadcrumbSchema([
        { name: "MLVScan", path: "/" },
        { name: "Advisories", path: "/advisories" },
        { name: advisory.title, path },
      ]),
    ],
    fallbackParagraphs: [
      advisory.description,
      "Open the advisory in a JavaScript-enabled browser to read the full malware analysis, affected samples, and linked threat-family context.",
    ],
    fallbackLinks: [
      { href: "/advisories", label: "Back to all advisories" },
      { href: "/advisories/families", label: "Threat family pages" },
    ],
    lastModified: advisory.updatedDate ? isoDate(advisory.updatedDate) : isoDate(advisory.publishedDate),
  }
}

export function getThreatFamiliesSeoPage(): SeoPage {
  const description =
    "Browse MLVScan threat family pages that group malicious Unity mod reuploads by shared loader behavior, execution chain, and malware pattern."

  return {
    path: "/advisories/families",
    title: "Threat Families | MLVScan Mod Malware Patterns",
    heading: "Threat family clusters",
    description,
    keywords: [
      "threat families",
      "unity mod malware patterns",
      "mod reupload detection",
      "download and execute",
      "powershell loader",
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "MLVScan Threat Families",
        description,
        url: `${SITE_URL}/advisories/families`,
      },
      breadcrumbSchema([
        { name: "MLVScan", path: "/" },
        { name: "Threat Families", path: "/advisories/families" },
      ]),
    ],
    fallbackParagraphs: [description],
    fallbackLinks: [
      { href: "/advisories", label: "Read security advisories" },
      { href: "/scan", label: "Use the browser scanner" },
    ],
    lastModified: new Date().toISOString(),
  }
}

export function getThreatFamilySeoPage(family: ThreatFamilyMeta): SeoPage {
  const path = `/advisories/families/${family.slug}`
  const description = `${family.summary} Related MLVScan advisories and sample identities are grouped on this page.`

  return {
    path,
    title: `${family.title} | MLVScan Threat Family`,
    heading: family.title,
    description,
    keywords: [
      "MLVScan",
      "threat family",
      "unity mod malware",
      ...family.behaviorTags,
      ...family.aliases,
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: family.title,
        description,
        url: `${SITE_URL}${path}`,
        about: family.behaviorTags,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
        },
      },
      breadcrumbSchema([
        { name: "MLVScan", path: "/" },
        { name: "Threat Families", path: "/advisories/families" },
        { name: family.title, path },
      ]),
    ],
    fallbackParagraphs: [
      description,
      `Aliases: ${family.aliases.join(", ")}.`,
    ],
    fallbackLinks: [
      { href: "/advisories/families", label: "Back to threat families" },
      { href: "/advisories", label: "Browse advisories" },
    ],
    lastModified: new Date().toISOString(),
  }
}

export function getStaticSeoPages(): SeoPage[] {
  const pages = new Map<string, SeoPage>()

  const staticPages = [
    getHomeSeoPage(),
    getScanSeoPage(),
    getInspectorSeoPage(),
    getDocsSeoPage(),
    getAdvisoriesSeoPage(),
    getThreatFamiliesSeoPage(),
    ...allDocs.map((doc) => getDocSeoPage(doc)),
    ...allAdvisories.map((advisory) => getAdvisorySeoPage(advisory)),
    ...allThreatFamilies.map((family) => getThreatFamilySeoPage(family)),
  ]

  for (const page of staticPages) {
    pages.set(page.path, page)
  }

  return [...pages.values()]
}
