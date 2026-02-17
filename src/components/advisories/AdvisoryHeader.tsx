import type { AdvisoryMeta } from '@/advisories/types'
import { TypeBadge } from './TypeBadge'
import { Badge } from '@/components/ui/badge'

interface AdvisoryHeaderProps {
  meta: AdvisoryMeta
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function AdvisoryHeader({ meta }: AdvisoryHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={meta.type} />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-white">
        {meta.title}
      </h1>
      
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
        <span>
          Published: <span className="text-gray-300">{formatDate(meta.publishedDate)}</span>
        </span>
        
        {meta.updatedDate && (
          <span>
            Updated: <span className="text-gray-300">{formatDate(meta.updatedDate)}</span>
          </span>
        )}
      </div>
      
      {meta.affectedVersions && meta.affectedVersions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400">Affected:</span>
          {meta.affectedVersions.map((version, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-gray-800/50 border-gray-600 text-gray-300"
            >
              {version}
            </Badge>
          ))}
        </div>
      )}
      
      <p className="text-lg text-gray-300 leading-relaxed">
        {meta.description}
      </p>
    </div>
  )
}
