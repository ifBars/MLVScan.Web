import type { AdvisoryMeta } from '@/advisories/types'
import { TypeBadge } from './TypeBadge'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface AdvisoryCardProps {
  advisory: AdvisoryMeta
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AdvisoryCard({ advisory }: AdvisoryCardProps) {
  return (
    <Link
      to={`/advisories/${advisory.slug}`}
      className="block group"
    >
      <article className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 transition-all duration-200 hover:border-teal-500/50 hover:bg-gray-900/60 flex gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <TypeBadge type={advisory.type} />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
            {advisory.title}
          </h3>
          
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {advisory.description}
          </p>
          
          <div className="flex items-center justify-between">
            <time className="text-xs text-gray-500">
              {formatDate(advisory.publishedDate)}
            </time>
            
            <span className="flex items-center text-sm text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Read more
              <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
