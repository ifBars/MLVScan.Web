import { Badge } from '@/components/ui/badge'
import type { DocMeta } from '@/docs/registry'

interface DocHeaderProps {
  meta: DocMeta
}

const statusLabels = {
  stable: 'Stable',
  beta: 'Beta',
  legacy: 'Legacy',
}

const statusVariants = {
  stable: 'default' as const,
  beta: 'secondary' as const,
  legacy: 'outline' as const,
}

export const DocHeader = ({ meta }: DocHeaderProps) => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-4xl font-bold gradient-text">{meta.title}</h1>
        {meta.status !== 'stable' && (
          <Badge variant={statusVariants[meta.status]} className="text-sm">
            {statusLabels[meta.status]}
          </Badge>
        )}
      </div>
      <p className="text-xl text-gray-300 italic">{meta.description}</p>
    </div>
  )
}
