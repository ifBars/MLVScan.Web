import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import type { ThreatFamily, ThreatFamilyEvidence } from "@/types/mlvscan"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  formatThreatFamilyEvidenceKind,
  getMatchedRulePreview,
  getThreatFamilyEvidenceDetail,
  getThreatFamilyEvidenceMeta,
  getThreatFamilyEvidencePreview,
  getThreatFamilyEvidenceValue,
  getThreatFamilyLink,
  getThreatMatchKindLabel,
  sortThreatFamilyMatches,
} from "./threat-family-match-utils"

interface ThreatFamilyMatchesProps {
  matches: ThreatFamily[]
  primaryThreatFamilyId?: string | null
}

interface ThreatFamilyMatchCardProps {
  emphasis: "primary" | "secondary"
  match: ThreatFamily
}

function ThreatFamilyEvidencePreviewItem({ evidence }: { evidence: ThreatFamilyEvidence }) {
  const value = getThreatFamilyEvidenceValue(evidence)

  return (
    <div className="flex min-w-0 items-start gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
      <span className="mt-0.5 shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] font-medium text-gray-300">
        {formatThreatFamilyEvidenceKind(evidence.kind)}
      </span>
      <span className="min-w-0 truncate text-sm text-gray-200" title={value}>
        {value}
      </span>
    </div>
  )
}

function ThreatFamilyEvidenceRow({ evidence }: { evidence: ThreatFamilyEvidence }) {
  const meta = getThreatFamilyEvidenceMeta(evidence)
  const detail = getThreatFamilyEvidenceDetail(evidence)
  const value = getThreatFamilyEvidenceValue(evidence)

  return (
    <div className="border-t border-white/8 pt-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-white/10 bg-white/[0.05] text-gray-100">
          {formatThreatFamilyEvidenceKind(evidence.kind)}
        </Badge>
      </div>

      <p className="mt-2 break-words text-sm text-gray-100">{value}</p>

      {meta.length > 0 && <p className="mt-1 text-xs text-gray-500">{meta.join(" | ")}</p>}

      {detail && <p className="mt-2 break-all font-mono text-[11px] text-gray-500">{detail}</p>}
    </div>
  )
}

function ThreatFamilyMatchCard({ emphasis, match }: ThreatFamilyMatchCardProps) {
  const previewEvidence = getThreatFamilyEvidencePreview(match.evidence, 2)
  const matchLink = getThreatFamilyLink(match.familyId)
  const matchKindLabel = getThreatMatchKindLabel(match.matchKind)
  const { visibleRules, remainingCount } = getMatchedRulePreview(match.matchedRules, 3)

  return (
    <article
      data-emphasis={emphasis}
      className={cn(
        "group rounded-xl border border-white/10 bg-black/20 transition-colors hover:border-red-400/25",
        emphasis === "primary" ? "p-5" : "p-4",
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-red-500/30 bg-red-500/10 text-red-200">{matchKindLabel}</Badge>
              <Badge variant="outline" className="border-white/10 bg-white/[0.02] text-gray-200">
                {Math.round(match.confidence * 100)}% confidence
              </Badge>
            </div>

            <div className="min-w-0">
              <h3 className={cn("font-semibold text-white", emphasis === "primary" ? "text-xl" : "text-base")}>
                {match.displayName}
              </h3>
              <p
                className={cn(
                  "mt-1 max-w-3xl text-sm leading-relaxed text-gray-400",
                  emphasis === "secondary" && "line-clamp-2",
                )}
              >
                {match.summary}
              </p>
            </div>

            {visibleRules.length > 0 && (
              <p className="text-xs text-gray-500">
                <span className="mr-2 font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Matched rules
                </span>
                <span className="font-mono text-gray-400">{visibleRules.join(" | ")}</span>
                {remainingCount > 0 && <span className="ml-2 text-gray-500">+{remainingCount} more</span>}
              </p>
            )}
          </div>

          {matchLink && (
            <Link
              to={matchLink.href}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-teal-300 transition-colors hover:text-teal-200"
            >
              Open family page
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="space-y-3 border-t border-white/8 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Why this matched</p>
            {match.evidence.length > 0 && (
              <p className="text-xs text-gray-500">
                {match.evidence.length} evidence item{match.evidence.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          {previewEvidence.length > 0 ? (
            <div className={cn("grid gap-2", previewEvidence.length > 1 && "sm:grid-cols-2")}>
              {previewEvidence.map((evidence, index) => (
                <ThreatFamilyEvidencePreviewItem
                  key={`${match.familyId}-${match.variantId}-${evidence.kind}-${index}`}
                  evidence={evidence}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No evidence details were included with this family match.</p>
          )}

          {match.evidence.length > 0 && (
            <Accordion type="single" collapsible className="rounded-lg border border-white/8 bg-white/[0.02] px-4">
              <AccordionItem value={`${match.familyId}-${match.variantId}`} className="border-none">
                <AccordionTrigger className="py-3 text-sm font-medium text-gray-200 hover:no-underline hover:text-white">
                  Why this matched ({match.evidence.length})
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  {matchLink && matchLink.behaviorTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {matchLink.behaviorTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    {match.evidence.map((evidence, index) => (
                      <ThreatFamilyEvidenceRow
                        key={`${match.familyId}-${match.variantId}-${evidence.kind}-detail-${index}`}
                        evidence={evidence}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </div>
    </article>
  )
}

export function ThreatFamilyMatches({ matches, primaryThreatFamilyId }: ThreatFamilyMatchesProps) {
  if (matches.length === 0) {
    return null
  }

  const orderedMatches = sortThreatFamilyMatches(matches, primaryThreatFamilyId)
  const [primaryMatch, ...secondaryMatches] = orderedMatches

  if (!primaryMatch) {
    return null
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gray-950/55">
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-red-400/80 via-red-400/50 to-transparent" />

      <div className="space-y-5 p-5 sm:p-6">
        <div className="space-y-2 border-b border-white/8 pb-4 pl-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-red-500/30 bg-red-500/10 text-red-200">Known threat</Badge>
            <p className="text-base font-semibold text-white">Known malware family match</p>
          </div>
          <p className="max-w-3xl text-sm text-gray-400">
            This scan matches a previously observed malware family cluster. Review the family summary before lower-level findings.
          </p>
        </div>

        <ThreatFamilyMatchCard emphasis="primary" match={primaryMatch} />

        {secondaryMatches.length > 0 && (
          <div className="space-y-3 border-t border-white/8 pt-4" aria-label="Additional threat family matches">
            <p className="pl-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Additional matches
            </p>
            {secondaryMatches.map((match) => (
              <ThreatFamilyMatchCard key={`${match.familyId}-${match.variantId}`} emphasis="secondary" match={match} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ThreatFamilyMatches
