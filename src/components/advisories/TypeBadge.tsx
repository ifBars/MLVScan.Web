import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, Info, Lock } from 'lucide-react'
import { typeLabels } from '@/advisories/types'
import type { AdvisoryType } from '@/advisories/types'
import { cn } from '@/lib/utils'

const typeIcons: Record<AdvisoryType, typeof Shield> = {
  'malware-analysis': Shield,
  'bypass-incident': AlertTriangle,
  'false-positive': Info,
  'security-update': Lock,
}

const typeStyles: Record<AdvisoryType, string> = {
  'malware-analysis': 'bg-red-500/10 border-red-500/50 text-red-300',
  'bypass-incident': 'bg-orange-500/10 border-orange-500/50 text-orange-300',
  'false-positive': 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300',
  'security-update': 'bg-teal-500/10 border-teal-500/50 text-teal-300',
}

interface TypeBadgeProps {
  type: AdvisoryType
  showIcon?: boolean
  className?: string
}

export function TypeBadge({ type, showIcon = true, className }: TypeBadgeProps) {
  const Icon = typeIcons[type]
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium px-2 py-0.5 flex items-center gap-1.5',
        typeStyles[type],
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {typeLabels[type]}
    </Badge>
  )
}
