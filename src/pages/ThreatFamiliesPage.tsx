import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { AlertTriangle, ArrowRight, FileStack, Search, Shield, Sparkles, Tags } from "lucide-react"

import { getAdvisoryBySlug } from "@/advisories/registry"
import { AdvisoryCard } from "@/components/advisories/AdvisoryCard"
import Seo from "@/components/seo/Seo"
import { allThreatFamilies, getThreatFamilyBySlug } from "@/families/registry"
import type { ThreatFamilyMeta } from "@/families/types"
import { getThreatFamiliesSeoPage, getThreatFamilySeoPage } from "@/seo/routes"

const familyModules = import.meta.glob<{ default: React.ComponentType }>("../content/families/*.mdx")

const getFamilySearchText = (family: ThreatFamilyMeta) =>
  [
    family.title,
    family.summary,
    family.id,
    family.slug,
    ...family.aliases,
    ...family.sampleNames,
    ...family.behaviorTags,
  ]
    .join(" ")
    .toLowerCase()

function FamilyListCard({ family }: { family: ThreatFamilyMeta }) {
  const previewSamples = family.sampleNames.slice(0, 3)
  const remainingSamples = family.sampleNames.length - previewSamples.length

  return (
    <Link
      to={`/advisories/families/${family.slug}`}
      className="group block rounded-lg border border-gray-800 bg-gray-950/55 transition-colors hover:border-teal-500/50 hover:bg-gray-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
    >
      <article className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
              <Shield className="h-3.5 w-3.5" />
              Threat Family
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800/60 px-3 py-1 text-xs text-gray-300">
              <FileStack className="h-3.5 w-3.5" />
              {family.sampleNames.length} sample{family.sampleNames.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold leading-snug text-white transition-colors group-hover:text-teal-300">
              {family.title}
            </h3>
            <p className="max-w-3xl text-sm leading-6 text-gray-400">{family.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
            {family.behaviorTags.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-full border border-gray-700 bg-gray-800/50 px-2.5 py-1">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-4 rounded-md border border-gray-800 bg-black/20 px-4 py-3 md:self-stretch">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Observed identities</p>
            <div className="space-y-1">
              {previewSamples.map((sample) => (
                <p key={sample} className="truncate font-mono text-xs text-gray-300">
                  {sample}
                </p>
              ))}
              {remainingSamples > 0 && (
                <p className="text-xs text-gray-500">+{remainingSamples} more</p>
              )}
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-gray-600 transition-colors group-hover:text-teal-300" />
        </div>
      </article>
    </Link>
  )
}

function ThreatFamiliesList() {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const topTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const family of allThreatFamilies) {
      for (const tag of family.behaviorTags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 8)
      .map(([tag]) => tag)
  }, [])

  const filteredFamilies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return allThreatFamilies.filter((family) => {
      const matchesQuery = normalizedQuery.length === 0 || getFamilySearchText(family).includes(normalizedQuery)
      const matchesTag = activeTag === null || family.behaviorTags.includes(activeTag)
      return matchesQuery && matchesTag
    })
  }, [activeTag, query])

  const sampleCount = allThreatFamilies.reduce((total, family) => total + family.sampleNames.length, 0)

  return (
    <div className="space-y-10">
      <Seo page={getThreatFamiliesSeoPage()} />

      <div className="space-y-6 border-b border-gray-800 pb-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <h1 className="mb-4 flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
              <Sparkles className="h-10 w-10 text-teal-400" />
              Threat Family Clusters
            </h1>
            <p className="max-w-3xl text-lg text-gray-400">
              These pages group malicious reuploads by their shared injected loader behavior, not by the legitimate mod names the attacker reused as cover.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-4">
              <p className="text-2xl font-semibold text-white">{allThreatFamilies.length}</p>
              <p className="text-sm text-gray-500">families</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-4">
              <p className="text-2xl font-semibold text-white">{sampleCount}</p>
              <p className="text-sm text-gray-500">observed samples</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto] lg:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search families, samples, tags"
                className="h-11 w-full rounded-md border border-gray-700 bg-black/30 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-teal-500"
              />
            </label>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Tags className="h-4 w-4 text-gray-500" />
              <span>{filteredFamilies.length} shown</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                activeTag === null
                  ? "border-teal-500/70 bg-teal-500/10 text-teal-200"
                  : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-200"
              }`}
            >
              All
            </button>
            {topTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  tag === activeTag
                    ? "border-teal-500/70 bg-teal-500/10 text-teal-200"
                    : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredFamilies.map((family) => (
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
          setError("Family content not found.")
        }
      } catch (err) {
        console.error("Failed to load family content:", err)
        setError("Failed to load family content.")
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
    .map((slug) => getAdvisoryBySlug(slug))
    .filter((advisory): advisory is NonNullable<typeof advisory> => Boolean(advisory))

  return (
    <div className="space-y-8">
      <Seo page={getThreatFamilySeoPage(meta)} />

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
            <Shield className="h-3.5 w-3.5" />
            Threat Family
          </span>
          {meta.aliases.map((alias) => (
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
            {meta.behaviorTags.map((tag) => (
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
            {relatedAdvisories.map((advisory) => (
              <AdvisoryCard key={advisory.id} advisory={advisory} />
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-800 pt-6">
        <Link to="/advisories/families" className="inline-flex items-center text-sm text-gray-400 hover:text-teal-400 transition-colors">
          <span className="mr-2" aria-hidden="true">&lt;-</span>
          Back to all family clusters
        </Link>
      </div>
    </div>
  )
}

export default function ThreatFamiliesPage() {
  const params = useParams()
  const slug = params["slug"]

  if (!slug) {
    return <ThreatFamiliesList />
  }

  const family = getThreatFamilyBySlug(slug)
  if (!family) {
    return <Navigate to="/advisories/families" replace />
  }

  return <ThreatFamilyDetail meta={family} />
}
