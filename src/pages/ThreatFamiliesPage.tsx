import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AlertTriangle, FileStack, Shield, Sparkles } from 'lucide-react'
import { allThreatFamilies, getThreatFamilyBySlug } from '@/families/registry'
import type { ThreatFamilyMeta } from '@/families/types'
import { AdvisoryCard } from '@/components/advisories/AdvisoryCard'
import { getAdvisoryBySlug } from '@/advisories/registry'

const familyModules = import.meta.glob<{ default: React.ComponentType }>('../content/families/*.mdx')

function FamilyListCard({ family }: { family: ThreatFamilyMeta }) {
  return (
    <Link to={`/advisories/families/${family.slug}`} className="block group">
      <article className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 transition-all duration-200 hover:border-teal-500/50 hover:bg-gray-900/60">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
            <Shield className="h-3.5 w-3.5" />
            Threat Family
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800/60 px-3 py-1 text-xs text-gray-300">
            <FileStack className="h-3.5 w-3.5" />
            {family.sampleNames.length} sample{family.sampleNames.length === 1 ? '' : 's'}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
          {family.title}
        </h3>

        <p className="text-sm text-gray-400 mb-4">{family.summary}</p>

        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
          {family.behaviorTags.slice(0, 4).map(tag => (
            <span key={tag} className="rounded-full border border-gray-700 bg-gray-800/50 px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  )
}

function ThreatFamiliesList() {
  return (
    <div className="space-y-10">
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-teal-400" />
          Threat Family Clusters
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          These pages group malicious reuploads by their shared injected loader behavior, not by the legitimate mod names the attacker reused as cover.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {allThreatFamilies.map(family => (
          <FamilyListCard key={family.id} family={family} />
        ))}
      </div>
    </div>
  )
}

function ThreatFamilyDetail({ meta }: { meta: ThreatFamilyMeta }) {
  const [Content, setContent] = useState<React.ComponentType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFamily = async () => {
      setLoading(true)
      setError(null)

      try {
        const importPath = `../content/families/${meta.contentPath}`
        const loadComponent = familyModules[importPath]

        if (loadComponent) {
          const module = await loadComponent()
          setContent(() => module.default)
        } else {
          setError('Family content not found.')
        }
      } catch (err) {
        console.error('Failed to load family content:', err)
        setError('Failed to load family content.')
      } finally {
        setLoading(false)
      }
    }

    loadFamily()
  }, [meta.contentPath])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Family</h2>
        <p className="text-gray-400 mb-4">{error}</p>
        <Link to="/advisories/families" className="text-teal-400 hover:text-teal-300 underline">
          Back to all families
        </Link>
      </div>
    )
  }

  const ContentComponent = Content
  const relatedAdvisories = meta.advisorySlugs
    .map(slug => getAdvisoryBySlug(slug))
    .filter((advisory): advisory is NonNullable<typeof advisory> => Boolean(advisory))

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
            <Shield className="h-3.5 w-3.5" />
            Threat Family
          </span>
          {meta.aliases.map(alias => (
            <span key={alias} className="rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1 text-xs text-gray-300">
              {alias}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white">{meta.title}</h1>
        <p className="text-lg text-gray-300 leading-relaxed">{meta.summary}</p>
        <p className="text-sm text-gray-500 max-w-3xl">
          Sample names referenced on this page are observed reupload identities used by the attacker, not the canonical name of the threat family.
        </p>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Behavior Tags</h2>
          <div className="flex flex-wrap gap-2">
            {meta.behaviorTags.map(tag => (
              <span key={tag} className="rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1 text-xs text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="prose prose-invert prose-teal max-w-none [&_p]:mb-4 [&_h2]:mt-10 [&_h2]:mb-6 [&_h3]:mt-8 [&_h3]:mb-4 [&_ul]:mb-6 [&_li]:mb-2">
        {ContentComponent ? <ContentComponent /> : null}
      </div>

      {relatedAdvisories.length > 0 && (
        <div className="space-y-4 border-t border-gray-800 pt-8">
          <h2 className="text-2xl font-semibold text-white">Linked Advisories</h2>
          <div className="space-y-4">
            {relatedAdvisories.map(advisory => (
              <AdvisoryCard key={advisory.id} advisory={advisory} />
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-800 pt-6">
        <Link to="/advisories/families" className="inline-flex items-center text-sm text-gray-400 hover:text-teal-400 transition-colors">
          <span className="mr-2">←</span>
          Back to all family clusters
        </Link>
      </div>
    </div>
  )
}

export default function ThreatFamiliesPage() {
  const params = useParams()
  const slug = params['slug']

  if (!slug) {
    return <ThreatFamiliesList />
  }

  const family = getThreatFamilyBySlug(slug)
  if (!family) {
    return <Navigate to="/advisories/families" replace />
  }

  return <ThreatFamilyDetail meta={family} />
}
