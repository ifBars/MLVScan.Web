import { Github, Package, ExternalLink, Download, BookOpen } from 'lucide-react'
import type { DocMeta } from '@/docs/registry'

interface DocResourcesProps {
  links: DocMeta['links']
}

const linkConfig = {
  github: { icon: Github, label: 'GitHub' },
  nuget: { icon: Package, label: 'NuGet' },
  wiki: { icon: BookOpen, label: 'Wiki' },
  discord: { icon: ExternalLink, label: 'Discord' },
  download: { icon: Download, label: 'Download' },
}

export const DocResources = ({ links }: DocResourcesProps) => {
  if (!links) return null

  const entries = Object.entries(links).filter(([, url]) => url) as [keyof typeof linkConfig, string][]

  if (entries.length === 0) return null

  return (
    <div className="flex flex-wrap gap-4">
      {entries.map(([key, url]) => {
        const config = linkConfig[key]
        if (!config) return null
        const Icon = config.icon

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
          >
            <Icon className="w-4 h-4" />
            {config.label}
          </a>
        )
      })}
    </div>
  )
}
