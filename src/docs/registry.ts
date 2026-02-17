export type DocSectionId = 'getting-started' | 'libraries' | 'resources'

export type DocStatus = 'stable' | 'legacy' | 'beta'

export type DocMeta = {
  id: string
  title: string
  description: string
  slug: string
  contentPath: string
  section: DocSectionId
  library?: 'core' | 'wasm' | 'devcli' | 'mlvscan'
  status: DocStatus
  keywords: string[]
  links?: {
    github?: string
    nuget?: string
    wiki?: string
    discord?: string
    download?: string
  }
}

export type DocSection = {
  id: DocSectionId
  title: string
  order: number
}

export type DocNavGroup = {
  id: string
  title: string
  docs: DocMeta[]
}

export type DocsBySection = DocSection & {
  groups: DocNavGroup[]
}

const docs: DocMeta[] = [
  {
    id: 'overview',
    title: 'Overview',
    description: 'Introduction to the MLVScan ecosystem and documentation map',
    slug: '',
    contentPath: 'overview.mdx',
    section: 'getting-started',
    status: 'stable',
    keywords: ['overview', 'getting started', 'ecosystem', 'mlvscan'],
    links: {
      github: 'https://github.com/ifBars/MLVScan',
      discord: 'https://discord.gg/UD4K4chKak',
    },
  },
  {
    id: 'core-overview',
    title: 'Core Overview',
    description: 'What MLVScan.Core provides and where it fits in the stack',
    slug: 'libraries/core',
    contentPath: 'libraries/core/overview.mdx',
    section: 'libraries',
    library: 'core',
    status: 'stable',
    keywords: ['mlvscan.core', 'mono.cecil', 'scanner', 'rules', 'library'],
    links: {
      github: 'https://github.com/ifBars/MLVScan.Core',
      nuget: 'https://www.nuget.org/packages/MLVScan.Core/',
      wiki: 'https://github.com/ifBars/MLVScan.Core/wiki',
    },
  },
  {
    id: 'core-getting-started',
    title: 'Getting Started',
    description: 'Install MLVScan.Core and run your first scans',
    slug: 'libraries/core/getting-started',
    contentPath: 'libraries/core/getting-started.mdx',
    section: 'libraries',
    library: 'core',
    status: 'stable',
    keywords: ['installation', 'dotnet add package', 'assemblyscanner', 'scanconfig'],
  },
  {
    id: 'core-advanced-analysis',
    title: 'Advanced Analysis',
    description: 'Call graph and data flow analysis patterns and outputs',
    slug: 'libraries/core/advanced-analysis',
    contentPath: 'libraries/core/advanced-analysis.mdx',
    section: 'libraries',
    library: 'core',
    status: 'stable',
    keywords: ['call graph', 'data flow', 'cross method', 'threat chains'],
  },
  {
    id: 'core-api-reference',
    title: 'API Reference',
    description: 'High-value APIs in MLVScan.Core with usage guidance',
    slug: 'libraries/core/api-reference',
    contentPath: 'libraries/core/api-reference.mdx',
    section: 'libraries',
    library: 'core',
    status: 'stable',
    keywords: ['api', 'assemblyscanner', 'rulefactory', 'scanfinding', 'dataflowanalyzer'],
  },
  {
    id: 'wasm-overview',
    title: 'WASM Overview',
    description: 'Browser scanning model and MLVScan.WASM architecture',
    slug: 'libraries/wasm',
    contentPath: 'libraries/wasm/overview.mdx',
    section: 'libraries',
    library: 'wasm',
    status: 'stable',
    keywords: ['mlvscan.wasm', 'webassembly', 'browser scanning', 'client-side'],
    links: {
      github: 'https://github.com/ifBars/MLVScan.WASM',
    },
  },
  {
    id: 'wasm-js-interop',
    title: 'JS Interop',
    description: 'Blazor interop patterns for invoking scanner APIs safely',
    slug: 'libraries/wasm/js-interop',
    contentPath: 'libraries/wasm/js-interop.mdx',
    section: 'libraries',
    library: 'wasm',
    status: 'stable',
    keywords: ['blazor', 'js interop', 'jsinvokable', 'dotnetobjectreference'],
  },
  {
    id: 'wasm-integration',
    title: 'Web Integration',
    description: 'Integration patterns for React and static hosting environments',
    slug: 'libraries/wasm/web-integration',
    contentPath: 'libraries/wasm/web-integration.mdx',
    section: 'libraries',
    library: 'wasm',
    status: 'stable',
    keywords: ['integration', 'react', 'upload', 'schema', 'hosting'],
  },
  {
    id: 'devcli-overview',
    title: 'DevCLI Overview',
    description: 'Security checks for mod builds with MLVScan.DevCLI',
    slug: 'libraries/devcli',
    contentPath: 'libraries/devcli/overview.mdx',
    section: 'libraries',
    library: 'devcli',
    status: 'stable',
    keywords: ['devcli', 'dotnet tool', 'build scanning', 'developer guidance'],
    links: {
      github: 'https://github.com/ifBars/MLVScan.DevCLI',
      nuget: 'https://www.nuget.org/packages/MLVScan.DevCLI/',
    },
  },
  {
    id: 'devcli-usage',
    title: 'Usage and CI',
    description: 'CLI options, exit behavior, MSBuild, and CI pipelines',
    slug: 'libraries/devcli/usage-and-ci',
    contentPath: 'libraries/devcli/usage-and-ci.mdx',
    section: 'libraries',
    library: 'devcli',
    status: 'stable',
    keywords: ['--json', '--fail-on', 'msbuild', 'github actions', 'gitlab'],
  },
  {
    id: 'devcli-commandline',
    title: 'System.CommandLine',
    description: 'Recommended command patterns from official System.CommandLine docs',
    slug: 'libraries/devcli/system-commandline',
    contentPath: 'libraries/devcli/system-commandline.mdx',
    section: 'libraries',
    library: 'devcli',
    status: 'stable',
    keywords: ['system.commandline', 'rootcommand', 'options', 'setaction', 'invokeasync'],
  },
  {
    id: 'mlvscan-overview',
    title: 'MLVScan Runtime',
    description: 'Runtime scanner for MelonLoader and BepInEx mod environments',
    slug: 'libraries/mlvscan',
    contentPath: 'libraries/mlvscan/overview.mdx',
    section: 'libraries',
    library: 'mlvscan',
    status: 'stable',
    keywords: ['melonloader', 'bepinex', 'runtime scanning', 'autodisable'],
    links: {
      github: 'https://github.com/ifBars/MLVScan',
      download: 'https://www.nexusmods.com/schedule1/mods/957?tab=files',
    },
  },
  {
    id: 'mlvscan-whitelisting',
    title: 'Whitelisting',
    description: 'SHA256 trust decisions, workflow, and risk controls',
    slug: 'libraries/mlvscan/whitelisting',
    contentPath: 'libraries/mlvscan/whitelisting.mdx',
    section: 'libraries',
    library: 'mlvscan',
    status: 'stable',
    keywords: ['sha256', 'whitelistedhashes', 'security', 'verification'],
  },
  {
    id: 'mlvscan-reports',
    title: 'Reports and Triage',
    description: 'How to read reports, severity, and triage suspicious mods',
    slug: 'libraries/mlvscan/reports-and-triage',
    contentPath: 'libraries/mlvscan/reports-and-triage.mdx',
    section: 'libraries',
    library: 'mlvscan',
    status: 'stable',
    keywords: ['report', 'severity', 'triage', 'il snippets', 'false positives'],
  },
  {
    id: 'legacy',
    title: 'Legacy Wiki Links',
    description: 'Direct links to historical wiki pages kept for reference',
    slug: 'resources/legacy',
    contentPath: 'resources/legacy.mdx',
    section: 'resources',
    status: 'legacy',
    keywords: ['legacy', 'wiki', 'historical'],
    links: {
      github: 'https://github.com/ifBars/MLVScan.Core/wiki',
      wiki: 'https://github.com/ifBars/MLVScan/wiki',
    },
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    description: 'MLVScan privacy policy - your files never leave your device',
    slug: 'privacy',
    contentPath: 'privacy.mdx',
    section: 'getting-started',
    status: 'stable',
    keywords: ['privacy', 'data', 'client-side', 'security', 'cookies'],
    links: {
      github: 'https://github.com/ifBars/MLVScan',
    },
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    description: 'MLVScan terms of service and usage conditions',
    slug: 'terms',
    contentPath: 'terms.mdx',
    section: 'getting-started',
    status: 'stable',
    keywords: ['terms', 'tos', 'license', 'gpl-3.0', 'conditions'],
    links: {
      github: 'https://github.com/ifBars/MLVScan',
    },
  },
]

const libraryTitles: Record<NonNullable<DocMeta['library']>, string> = {
  core: 'MLVScan.Core',
  wasm: 'MLVScan.WASM',
  devcli: 'MLVScan.DevCLI',
  mlvscan: 'MLVScan',
}

export const docSections: DocSection[] = [
  { id: 'getting-started', title: 'Getting Started', order: 0 },
  { id: 'libraries', title: 'Libraries', order: 1 },
  { id: 'resources', title: 'Resources', order: 2 },
]

export const allDocs = docs

export const docRegistry: Record<string, DocMeta> = docs.reduce((acc, doc) => {
  acc[doc.id] = doc
  return acc
}, {} as Record<string, DocMeta>)

export const docsBySection: DocsBySection[] = docSections.map((section) => {
  const sectionDocs = docs.filter((doc) => doc.section === section.id)

  if (section.id !== 'libraries') {
    return {
      ...section,
      groups: [{ id: section.id, title: section.title, docs: sectionDocs }],
    }
  }

  const libraryOrder: Array<NonNullable<DocMeta['library']>> = ['mlvscan', 'core', 'wasm', 'devcli']
  const groups: DocNavGroup[] = libraryOrder.map((libraryId) => ({
    id: libraryId,
    title: libraryTitles[libraryId],
    docs: sectionDocs.filter((doc) => doc.library === libraryId),
  }))

  return {
    ...section,
    groups,
  }
})

export const getDocBySlug = (slug: string): DocMeta | undefined => {
  return docs.find((doc) => doc.slug === slug)
}

export const getDocById = (id: string): DocMeta | undefined => {
  return docRegistry[id]
}

export const isValidDocId = (id: string): boolean => {
  return id in docRegistry
}
