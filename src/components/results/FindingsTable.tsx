import { Fragment, useMemo, useState } from "react"
import { ChevronRight } from "lucide-react"
import type { Finding } from "@/types/mlvscan"
import { SectionHeading, SeverityMark, TableHead } from "@/components/results/report-primitives"
import { FindingDetail } from "@/components/results/FindingDetail"
import type { FamilySelection } from "@/components/results/FamilyTable"
import {
  findingMatchesSearch,
  getShortLocation,
  getTargetDisplay,
  groupFindings,
  type FindingGroup,
} from "@/lib/finding-groups"
import { cn } from "@/lib/utils"

type FindingsTab = "verdict" | "all" | "advanced"

interface FindingsTableProps {
  defaultFindings: Finding[]
  advancedFindings: Finding[]
  verdictFindingIds: ReadonlySet<string>
  familySelection: FamilySelection | null
  onClearFamily: () => void
}

const SITE_PREVIEW_LIMIT = 8

const getFindingId = (finding: Finding, index: number) => finding.id ?? `finding-${index}`

function TabButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean
  count: number
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 py-2 text-[13px] transition-colors",
        active ? "border-teal-400 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
      )}
    >
      {children}
      <span className="ml-1.5 font-mono text-[11px] text-slate-500">{count}</span>
    </button>
  )
}

function GroupSites({ group }: { group: FindingGroup }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? group.findings : group.findings.slice(0, SITE_PREVIEW_LIMIT)

  return (
    <div className="border-l border-slate-700/80 pl-3.5">
      <ul>
        {visible.map((finding, index) => {
          const id = getFindingId(finding, index)
          const isSelected = selectedId === id
          const target = getTargetDisplay(finding.attributes)

          return (
            <li key={id} className="border-b border-slate-800/60 last:border-b-0">
              <button
                type="button"
                aria-expanded={isSelected}
                onClick={() => setSelectedId(isSelected ? null : id)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 py-1.5 text-left text-xs hover:text-white"
              >
                <span className="min-w-0 truncate">
                  {target && <span className="mr-2 font-mono text-slate-200">{target}</span>}
                  <span className="font-mono text-slate-500">{getShortLocation(finding.location)}</span>
                </span>
                <SeverityMark severity={finding.severity} />
              </button>
              {isSelected && (
                <div className="pb-3 pt-1">
                  <FindingDetail finding={finding} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {group.findings.length > SITE_PREVIEW_LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-1.5 text-xs text-teal-300 hover:text-teal-200"
        >
          {showAll ? "Show fewer" : `Show all ${group.findings.length} call sites`}
        </button>
      )}
    </div>
  )
}

function GroupRow({ group, defaultOpen }: { group: FindingGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const detailId = `finding-group-${group.key.replace(/[^a-zA-Z0-9_-]/g, "-")}`

  return (
    <Fragment>
      <tr className={cn("align-top", !open && "border-b border-slate-800/80")}>
        <td className="px-2.5 py-3">
          <SeverityMark severity={group.severity} />
        </td>
        <td className="px-2.5 py-3">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={() => setOpen((value) => !value)}
            className="group flex w-full min-w-0 items-start gap-1.5 text-left"
          >
            <ChevronRight
              aria-hidden
              className={cn("mt-[3px] size-3.5 shrink-0 text-slate-500 transition-transform", open && "rotate-90")}
            />
            <span className="min-w-0">
              <span className="block font-medium text-white group-hover:text-teal-100">{group.title}</span>
              <span
                className={cn(
                  "mt-0.5 block truncate text-xs text-slate-500",
                  group.summaryIsCode && "font-mono"
                )}
                title={group.summary}
              >
                {group.summary}
              </span>
            </span>
          </button>
        </td>
        <td className="px-2.5 py-3 text-right font-mono text-[13px] text-slate-200">{group.findings.length}</td>
        <td className="px-2.5 py-3 text-right text-[11px]">
          {group.usedInVerdict ? (
            <span className="text-red-300">Used</span>
          ) : (
            <span className="text-slate-500">Context</span>
          )}
        </td>
      </tr>
      {open && (
        <tr id={detailId} className="border-b border-slate-800/80">
          <td />
          <td colSpan={3} className="px-2.5 pb-4 pt-0">
            {group.findings.length === 1 ? <FindingDetail finding={group.findings[0]} /> : <GroupSites group={group} />}
          </td>
        </tr>
      )}
    </Fragment>
  )
}

export function FindingsTable({
  defaultFindings,
  advancedFindings,
  verdictFindingIds,
  familySelection,
  onClearFamily,
}: FindingsTableProps) {
  const [tab, setTab] = useState<FindingsTab>("all")
  const [query, setQuery] = useState("")

  const verdictFindings = useMemo(
    () => defaultFindings.filter((finding, index) => verdictFindingIds.has(getFindingId(finding, index))),
    [defaultFindings, verdictFindingIds]
  )

  const activeTab: FindingsTab = familySelection ? "verdict" : tab

  const visibleFindings = useMemo(() => {
    let source: Finding[]
    if (familySelection) {
      const ids = new Set(familySelection.findingIds)
      source = [...defaultFindings, ...advancedFindings].filter((finding, index) => ids.has(getFindingId(finding, index)))
    } else if (activeTab === "verdict") {
      source = verdictFindings
    } else if (activeTab === "advanced") {
      source = advancedFindings
    } else {
      source = defaultFindings
    }
    return source.filter((finding) => findingMatchesSearch(finding, query))
  }, [activeTab, advancedFindings, defaultFindings, familySelection, query, verdictFindings])

  const groups = useMemo(() => groupFindings(visibleFindings, verdictFindingIds), [visibleFindings, verdictFindingIds])

  const selectTab = (next: FindingsTab) => {
    onClearFamily()
    setTab(next)
  }

  const totalDefault = defaultFindings.length

  return (
    <section aria-label="Findings" className="mt-8" id="report-findings">
      <SectionHeading
        eyebrow="Static analysis"
        title="Findings"
        description={totalDefault > 0 ? "Repeated calls are grouped by behavior and target." : undefined}
      />

      <div className="flex flex-wrap items-end gap-x-6 gap-y-2 border-b border-slate-800/80">
        <div role="tablist" aria-label="Finding filters" className="flex gap-6">
          {verdictFindings.length > 0 && (
            <TabButton active={activeTab === "verdict"} count={verdictFindings.length} onClick={() => selectTab("verdict")}>
              Used in verdict
            </TabButton>
          )}
          <TabButton active={activeTab === "all"} count={totalDefault} onClick={() => selectTab("all")}>
            All
          </TabButton>
          {advancedFindings.length > 0 && (
            <TabButton active={activeTab === "advanced"} count={advancedFindings.length} onClick={() => selectTab("advanced")}>
              Advanced
            </TabButton>
          )}
        </div>
        {totalDefault + advancedFindings.length > 0 && (
          <label className="mb-1.5 ml-auto w-full sm:w-56">
            <span className="sr-only">Filter findings</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter method or target"
              className="h-8 w-full rounded-[4px] border border-slate-700/80 bg-transparent px-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none"
            />
          </label>
        )}
      </div>

      {familySelection && (
        <p className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800/80 py-2 text-xs text-slate-400">
          <span>
            Showing findings behind <span className="text-white">{familySelection.name}</span>
          </span>
          <button type="button" onClick={onClearFamily} className="text-teal-300 hover:text-teal-200">
            Clear
          </button>
        </p>
      )}

      {activeTab === "advanced" && !familySelection && (
        <p className="border-b border-slate-800/80 py-2 text-xs text-slate-500">
          Advanced diagnostics are lower-confidence signals. They were not used for the verdict.
        </p>
      )}

      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          {query
            ? "No findings match this filter."
            : totalDefault === 0
              ? advancedFindings.length > 0
                ? "No findings were retained for the verdict. Advanced diagnostics are available."
                : "This file did not produce any findings."
              : "No findings in this view."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[13px]">
            <thead>
              <tr>
                <TableHead className="w-28">Severity</TableHead>
                <TableHead>Behavior</TableHead>
                <TableHead className="w-16 text-right">Sites</TableHead>
                <TableHead className="w-24 text-right">Verdict</TableHead>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, index) => (
                <GroupRow
                  key={`${activeTab}-${familySelection?.key ?? ""}-${group.key}`}
                  group={group}
                  defaultOpen={index === 0 && group.usedInVerdict}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
