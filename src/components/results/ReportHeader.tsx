import { useState, type ReactNode } from "react"
import type { ScanResult } from "@/types/mlvscan"
import type { ResultPresentationClassification } from "@/lib/scan-result-view"
import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/results/report-primitives"
import { cn, formatBytes, formatDate } from "@/lib/utils"

const verdictCopy: Record<ResultPresentationClassification, { headline: string; outcome: string; mark: string }> = {
  KnownThreat: { headline: "Likely malware", outcome: "Known threat", mark: "bg-red-400" },
  Suspicious: { headline: "Suspicious behavior", outcome: "Suspicious", mark: "bg-amber-400" },
  ManualReviewRequired: { headline: "Manual review required", outcome: "Incomplete analysis", mark: "bg-yellow-300" },
  Clean: { headline: "No known threats", outcome: "Clean", mark: "bg-emerald-400" },
}

interface ReportHeaderProps {
  result: ScanResult
  classification: ResultPresentationClassification
  summary: string
  defaultFindingCount: number
  advancedFindingCount: number
  onReset: () => void
}

const shortenHash = (hash: string) => (hash.length > 16 ? `${hash.slice(0, 8)}…${hash.slice(-5)}` : hash)

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-slate-800/80 py-[7px] first:border-t-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right text-slate-100">{children}</dd>
    </div>
  )
}

export function ReportHeader({
  result,
  classification,
  summary,
  defaultFindingCount,
  advancedFindingCount,
  onReset,
}: ReportHeaderProps) {
  const [copied, setCopied] = useState(false)
  const copy = verdictCopy[classification]
  const hash = result.input.sha256Hash

  const copyHash = async () => {
    if (!hash) return
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <header className="grid gap-7 border-b border-slate-800/80 pb-6 md:grid-cols-[minmax(0,1fr)_240px] md:items-end">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow className="min-w-0 truncate">
            Scan result ·{" "}
            <span className="font-mono normal-case tracking-normal" title={result.input.fileName}>
              {result.input.fileName}
            </span>
          </Eyebrow>
          <Button variant="outline" size="sm" className="h-7 shrink-0 rounded-[4px] px-2.5 text-xs md:hidden" onClick={onReset}>
            Scan another
          </Button>
        </div>
        <h1 className="mt-3 flex items-center gap-3 font-display text-4xl font-semibold leading-none tracking-tight text-white md:text-[44px]">
          <span aria-hidden className={cn("size-3 shrink-0", copy.mark)} />
          {copy.headline}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">{summary}</p>
      </div>

      <div className="min-w-0">
        <div className="mb-2 hidden justify-end md:flex">
          <Button variant="outline" size="sm" className="h-7 rounded-[4px] px-2.5 text-xs" onClick={onReset}>
            Scan another
          </Button>
        </div>
        <dl className="text-xs">
          <MetaRow label="Outcome">{copy.outcome}</MetaRow>
          <MetaRow label="Findings">
            <span className="font-mono">{defaultFindingCount}</span>
            {advancedFindingCount > 0 && (
              <span className="font-mono text-slate-500"> +{advancedFindingCount} adv.</span>
            )}
          </MetaRow>
          <MetaRow label="Size">
            <span className="font-mono">{formatBytes(result.input.sizeBytes)}</span>
          </MetaRow>
          {hash && (
            <MetaRow label="SHA256">
              <span className="font-mono" title={hash}>
                {shortenHash(hash)}
              </span>{" "}
              <button type="button" onClick={copyHash} className="text-teal-300 hover:text-teal-200">
                {copied ? "copied" : "copy"}
              </button>
            </MetaRow>
          )}
          <MetaRow label="Scanner">
            <span className="font-mono">{result.metadata.scannerVersion}</span>
          </MetaRow>
          <MetaRow label="Scanned">{formatDate(result.metadata.timestamp)}</MetaRow>
        </dl>
      </div>
    </header>
  )
}

export function ActionList({ items }: { items: string[] }) {
  if (items.length === 0) return null

  return (
    <ol
      aria-label="Recommended actions"
      className={cn(
        "grid border-b border-slate-800/80",
        items.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      )}
    >
      {items.map((item, index) => (
        <li
          key={item}
          className="border-slate-800/80 py-3.5 pr-4 text-[13px] leading-5 text-slate-300 max-sm:border-t max-sm:first:border-t-0 sm:[&+li]:border-l sm:[&+li]:pl-4"
        >
          <span className="mb-1 block font-mono text-[11px] text-slate-500">{String(index + 1).padStart(2, "0")}</span>
          {item}
        </li>
      ))}
    </ol>
  )
}
