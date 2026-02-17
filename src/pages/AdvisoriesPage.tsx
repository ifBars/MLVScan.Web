import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { getAdvisoryBySlug, sortAdvisoriesByDate } from '@/advisories/registry'
import type { AdvisoryMeta } from '@/advisories/types'
import { AdvisoryHeader } from '@/components/advisories/AdvisoryHeader'
import { AdvisoryCard } from '@/components/advisories/AdvisoryCard'
import { AdvisorySearch } from '@/components/advisories/AdvisorySearch'
import { Shield, AlertTriangle, FileText, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

const advisoryModules = import.meta.glob<{ default: React.ComponentType }>('../content/advisories/*.mdx')

function FeaturedAdvisory({ advisory }: { advisory: AdvisoryMeta }) {
  const [Content, setContent] = useState<React.ComponentType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAdvisory = async () => {
      setLoading(true)
      try {
        const importPath = `../content/advisories/${advisory.contentPath}`
        const loadComponent = advisoryModules[importPath]
        if (loadComponent) {
          const module = await loadComponent()
          setContent(() => module.default)
        }
      } catch (err) {
        console.error('Failed to load featured advisory:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAdvisory()
  }, [advisory.contentPath])

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-900/40 rounded-xl border border-gray-800 p-8">
        <div className="h-8 bg-gray-800 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  const ContentComponent = Content

  return (
    <article className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden p-8">
      <AdvisoryHeader meta={advisory} />
      
      <div className="mt-6 prose prose-invert prose-teal max-w-none line-clamp-6 [&_p]:mb-4 [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:mb-4 [&_li]:mb-1">
        {ContentComponent ? (
          <ContentComponent />
        ) : (
          <p className="text-gray-400">{advisory.description}</p>
        )}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-800">
        <Link
          to={`/advisories/${advisory.slug}`}
          className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium transition-colors"
        >
          Read full analysis
          <span>→</span>
        </Link>
      </div>
    </article>
  )
}

function AdvisoryList() {
  const [searchQuery, setSearchQuery] = useState('')
  const advisories = sortAdvisoriesByDate()
  
  if (advisories.length === 0) {
    return (
      <div className="text-center py-16">
        <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h2 className="text-2xl font-bold text-white mb-2">No Advisories Yet</h2>
        <p className="text-gray-400">
          Security advisories will be posted here as they are published.
        </p>
      </div>
    )
  }

  const [latestAdvisory, ...olderAdvisories] = advisories

  const filteredAdvisories = searchQuery
    ? olderAdvisories.filter(advisory => {
        const query = searchQuery.toLowerCase()
        return (
          advisory.title.toLowerCase().includes(query) ||
          advisory.description.toLowerCase().includes(query) ||
          advisory.keywords.some(k => k.toLowerCase().includes(query)) ||
          advisory.type.toLowerCase().includes(query)
        )
      })
    : olderAdvisories

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
          <Shield className="w-10 h-10 text-teal-400" />
          Security Advisories
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mb-6">
          Security analysis of malicious mods, scanner bypass incidents, false positives, and updates to MLVScan security features.
        </p>
        
        {/* Search */}
        <div className="max-w-md">
          <AdvisorySearch onSearch={setSearchQuery} />
        </div>
      </div>

      {/* Featured Latest Advisory */}
      {!searchQuery && <FeaturedAdvisory advisory={latestAdvisory} />}

      {/* Older Advisories */}
      {filteredAdvisories.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-5 h-5" />
            <h2 className="text-xl font-semibold text-white">
              {searchQuery ? 'Search Results' : 'Previous Advisories'}
            </h2>
            <span className="text-sm text-gray-500">({filteredAdvisories.length})</span>
          </div>
          
          <div className="space-y-4">
            {filteredAdvisories.map(advisory => (
              <AdvisoryCard key={advisory.id} advisory={advisory} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && filteredAdvisories.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold text-white mb-2">No advisories found</h3>
          <p className="text-gray-400">
            Try adjusting your search query or{' '}
            <button
              onClick={() => setSearchQuery('')}
              className="text-teal-400 hover:text-teal-300 underline"
            >
              clear the search
            </button>
          </p>
        </div>
      )}
    </div>
  )
}

function AdvisoryDetail({ meta }: { meta: AdvisoryMeta }) {
  const [Content, setContent] = useState<React.ComponentType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const loadAdvisory = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const importPath = `../content/advisories/${meta.contentPath}`
        const loadComponent = advisoryModules[importPath]
        
        if (loadComponent) {
          const module = await loadComponent()
          setContent(() => module.default)
        } else {
          setError('Advisory content not found.')
        }
      } catch (err) {
        console.error('Failed to load advisory:', err)
        setError('Failed to load advisory content.')
      } finally {
        setLoading(false)
      }
    }
    
    loadAdvisory()
  }, [meta.contentPath])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Advisory</h2>
        <p className="text-gray-400 mb-4">{error}</p>
        <Link
          to="/advisories"
          className="text-teal-400 hover:text-teal-300 underline"
        >
          Back to all advisories
        </Link>
      </div>
    )
  }
  
  const ContentComponent = Content
  
  return (
    <div className="space-y-8">
      <AdvisoryHeader meta={meta} />
      
      <div className="prose prose-invert prose-teal max-w-none [&_p]:mb-4 [&_h2]:mt-10 [&_h2]:mb-6 [&_h3]:mt-8 [&_h3]:mb-4 [&_ul]:mb-6 [&_li]:mb-2">
        {ContentComponent ? (
          <ContentComponent />
        ) : (
          <div className="border-l-4 border-orange-500 pl-6 py-4 bg-orange-500/10 rounded-r-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="text-orange-200 font-medium">Content Unavailable</p>
                <p className="text-orange-200/70 text-sm mt-1">
                  This advisory exists in the registry but the content file could not be loaded.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-800 pt-6 mt-8">
        <Link
          to="/advisories"
          className="inline-flex items-center text-sm text-gray-400 hover:text-teal-400 transition-colors"
        >
          <span className="mr-2">←</span>
          Back to all advisories
        </Link>
      </div>
    </div>
  )
}

export default function AdvisoriesPage() {
  const params = useParams()
  const slug = params['slug']
  
  // If no slug provided, show blog-style list view
  if (!slug) {
    return <AdvisoryList />
  }
  
  // Look up advisory by slug
  const advisory = getAdvisoryBySlug(slug)
  
  // If not found, redirect to list
  if (!advisory) {
    return <Navigate to="/advisories" replace />
  }
  
  return <AdvisoryDetail meta={advisory} />
}
