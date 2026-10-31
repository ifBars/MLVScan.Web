import { useMemo, useRef, useState } from "react"
import type { ScanResult } from "@/types/mlvscan"
import { Button } from "@/components/ui/button"
import { ActionList, ReportHeader } from "@/components/results/ReportHeader"
import { FamilyTable, type FamilySelection } from "@/components/results/FamilyTable"
import { FindingsTable } from "@/components/results/FindingsTable"
import { Eyebrow } from "@/components/results/report-primitives"
import {
  getActionItems,
  getAdvancedFindings,
  getDefaultFindings,
  getIncompleteScanFinding,
  getResultClassification,
  getResultPresentationClassification,
} from "@/lib/scan-result-view"
import { getVerdictFindingIds } from "@/lib/finding-groups"

interface ScanReportProps {
  result: ScanResult
  onReset: () => void
  onCreateAttestation?: () => void
}

const fallbackSummaries = {
  Clean: "No known malware families or correlated suspicious behavior were retained.",
  Suspicious: "This file was flagged as suspicious. It may be malicious, but it may also be a false positive.",
  KnownThreat: "This file matched a known malicious sample or malware family pattern.",
  ManualReviewRequired:
    "MLVScan could not complete full analysis for this file. Review the warning below before treating it as clean.",
} as const

function AttestationPrompt({ onCreateAttestation }: { onCreateAttestation: () => void }) {
  return (
    <section
      aria-label="Publish attestation"
      className="flex flex-col gap-3 border-b border-slate-800/80 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="max-w-2xl">
        <h2 className="text-sm font-medium text-white">Publishing this mod?</h2>
        <p className="mt-0.5 text-xs leading-5 text-slate-400">
          A screenshot does not prove which file was scanned. An attestation ties this result to the file&apos;s
          SHA256 hash and scanner version, with a public URL, badge, and share text.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" className="h-8 rounded-[4px]" onClick={onCreateAttestation}>
          Create Attestation
        </Button>
        <Button size="sm" variant="ghost" className="h-8 rounded-[4px]" asChild>
          <a href="/docs/ci-attestations">Learn More</a>
        </Button>
      </div>
    </section>
  )
}

const ScanReport = ({ result, onReset, onCreateAttestation }: ScanReportProps) => {
  const baseClassification = getResultClassification(result)
  const classification = getResultPresentationClassification(result)
  const defaultFindings = useMemo(() => getDefaultFindings(result), [result])
  const advancedFindings = useMemo(() => getAdvancedFindings(result), [result])
  const incompleteScanFinding = useMemo(() => getIncompleteScanFinding(result), [result])
  const verdictFindingIds = useMemo(() => getVerdictFindingIds(result), [result])
  const [familySelection, setFamilySelection] = useState<FamilySelection | null>(null)
  const findingsRef = useRef<HTMLDivElement>(null)

  const isManualReview = classification === "ManualReviewRequired"
  const summary = isManualReview
    ? fallbackSummaries.ManualReviewRequired
    : result.disposition?.summary ?? fallbackSummaries[classification]
  const blockingRecommended = result.disposition?.blockingRecommended ?? baseClassification !== "Clean"
  const canCreateAttestation = Boolean(onCreateAttestation) && classification === "Clean" && !blockingRecommended

  const selectFamily = (selection: FamilySelection) => {
    setFamilySelection((current) => (current?.key === selection.key ? null : selection))
    findingsRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" })
  }

  return (
    <article className="text-[13px] text-slate-100">
      <ReportHeader
        result={result}
        classification={classification}
        summary={summary}
        defaultFindingCount={defaultFindings.length}
        advancedFindingCount={advancedFindings.length}
        onReset={onReset}
      />

      <ActionList items={getActionItems(result)} />

      {isManualReview && (
        <section aria-label="Incomplete analysis" className="border-b border-slate-800/80 py-4">
          <Eyebrow className="text-yellow-200/80">Analysis was incomplete</Eyebrow>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-300">
            {incompleteScanFinding?.description ??
              "The scanner could not complete full IL analysis for this file. Review it manually before treating it as clean."}
          </p>
        </section>
      )}

      {canCreateAttestation && onCreateAttestation && <AttestationPrompt onCreateAttestation={onCreateAttestation} />}

      <FamilyTable
        families={result.threatFamilies ?? []}
        findings={result.findings}
        primaryThreatFamilyId={result.disposition?.primaryThreatFamilyId}
        selectedFamilyKey={familySelection?.key}
        onSelectFamily={selectFamily}
      />

      <div ref={findingsRef} className="scroll-mt-24">
        <FindingsTable
          defaultFindings={defaultFindings}
          advancedFindings={advancedFindings}
          verdictFindingIds={verdictFindingIds}
          familySelection={familySelection}
          onClearFamily={() => setFamilySelection(null)}
        />
      </div>

      <footer className="mt-6 text-xs leading-5 text-slate-500">
        <p className="max-w-2xl">
          Static analysis can miss runtime behavior. Treat this report as guidance, not a guarantee. Screenshot only -
          for verifiable proof, create an MLVScan attestation tied to this file hash.
        </p>
      </footer>
    </article>
  )
}

export default ScanReport
