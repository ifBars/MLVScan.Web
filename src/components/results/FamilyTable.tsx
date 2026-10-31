import { Link } from "react-router-dom"
import type { Finding, ThreatFamily } from "@/types/mlvscan"
import { SectionHeading, TableHead } from "@/components/results/report-primitives"
import {
  getThreatFamilyLink,
  getThreatMatchKindLabel,
  sortThreatFamilyMatches,
} from "@/components/results/threat-family-match-utils"
import { getFamilyFindingIds } from "@/lib/finding-groups"

export interface FamilySelection {
  key: string
  name: string
  findingIds: string[]
}

interface FamilyTableProps {
  families: ThreatFamily[]
  findings: Finding[]
  primaryThreatFamilyId?: string | null
  selectedFamilyKey?: string | null
  onSelectFamily: (selection: FamilySelection) => void
}

const getFamilyKey = (family: ThreatFamily) => `${family.familyId}:${family.variantId}`

export function FamilyTable({
  families,
  findings,
  primaryThreatFamilyId,
  selectedFamilyKey,
  onSelectFamily,
}: FamilyTableProps) {
  if (families.length === 0) {
    return null
  }

  const ordered = sortThreatFamilyMatches(families, primaryThreatFamilyId)

  return (
    <section aria-label="Threat families" className="mt-8">
      <SectionHeading
        eyebrow="Threat families"
        title="Why it was flagged"
        aside={
          <Link to="/advisories/families" className="text-xs text-teal-300 hover:text-teal-200">
            All families ↗
          </Link>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-[13px]">
          <thead>
            <tr>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Family</TableHead>
              <TableHead className="w-44">Confidence</TableHead>
              <TableHead className="w-24 text-right">Findings</TableHead>
            </tr>
          </thead>
          <tbody>
            {ordered.map((family, index) => {
              const key = getFamilyKey(family)
              const link = getThreatFamilyLink(family.familyId)
              const findingIds = getFamilyFindingIds(family, findings)
              const confidence = Math.round(family.confidence * 100)
              const isSelected = selectedFamilyKey === key

              return (
                <tr key={key} className="border-b border-slate-800/80 align-top">
                  <td className="px-2.5 py-3 font-mono text-slate-500">{String(index + 1).padStart(2, "0")}</td>
                  <td className="px-2.5 py-3">
                    {link ? (
                      <Link to={link.href} className="font-medium text-white hover:text-teal-200">
                        {family.displayName}
                      </Link>
                    ) : (
                      <span className="font-medium text-white">{family.displayName}</span>
                    )}
                    <p className="mt-0.5 line-clamp-2 max-w-2xl text-xs leading-5 text-slate-500">
                      {getThreatMatchKindLabel(family.matchKind)} · {family.summary}
                    </p>
                  </td>
                  <td className="px-2.5 py-3">
                    <div className="flex items-center gap-2.5 pt-1.5">
                      <div className="h-[3px] flex-1 bg-slate-700/70" aria-hidden>
                        <div className="h-full bg-teal-400" style={{ width: `${confidence}%` }} />
                      </div>
                      <span className="w-7 text-right font-mono text-xs text-slate-100" aria-label={`${confidence}% confidence`}>
                        {confidence}
                      </span>
                    </div>
                  </td>
                  <td className="px-2.5 py-3 text-right">
                    {findingIds.length > 0 ? (
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onSelectFamily({ key, name: family.displayName, findingIds })}
                        className={isSelected ? "text-white underline underline-offset-4" : "text-teal-300 hover:text-teal-200"}
                      >
                        <span className="font-mono">{findingIds.length}</span> →
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">{family.exactHashMatch ? "Hash match" : "None"}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
