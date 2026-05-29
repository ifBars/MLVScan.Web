import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  AlertTriangle,
  ExternalLink,
  FileWarning,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion,
} from "lucide-react"

import { PublicReportSkeletonArticle } from "@/components/reports/PublicReportSkeleton"
import {
  PublicReportNotFoundError,
  fetchPublicReport,
} from "@/lib/public-report-api"
import type { PublicReportPayload } from "@/types/public-report"
import { cn, formatBytes, formatDate } from "@/lib/utils"

type PageState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ready"; payload: PublicReportPayload }

const tonePresets = {
  Clean: {
    label: "No known threats detected",
    icon: ShieldCheck,
    shell: "border-emerald-500/25 bg-emerald-500/10",
    text: "text-emerald-200",
    badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  },
  Suspicious: {
    label: "Suspicious behavior detected",
    icon: ShieldAlert,
    shell: "border-amber-400/25 bg-amber-500/10",
    text: "text-amber-200",
    badge: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  },
  KnownThreat: {
    label: "Likely malware detected",
    icon: ShieldOff,
    shell: "border-red-400/25 bg-red-500/10",
    text: "text-red-200",
    badge: "border-red-400/30 bg-red-500/10 text-red-200",
  },
} as const

export default function PublicReportPage() {
  const { submissionId } = useParams()
  const [state, setState] = useState<PageState>(
    submissionId ? { status: "loading" } : { status: "not-found" },
  )
  const displayState = submissionId ? state : { status: "not-found" as const }

  useEffect(() => {
    if (!submissionId) {
      return
    }

    const controller = new AbortController()
    void (async () => {
      setState({ status: "loading" })

      try {
        const payload = await fetchPublicReport(submissionId, controller.signal)
        setState({ status: "ready", payload })
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return
        }

        if (error instanceof PublicReportNotFoundError) {
          setState({ status: "not-found" })
          return
        }

        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to load public report",
        })
      }
    })()

    return () => controller.abort()
  }, [submissionId])

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {displayState.status === "loading" && (
          <PublicReportSkeletonArticle />
        )}

        {displayState.status === "not-found" && (
          <StatePanel
            icon={<ShieldQuestion className="h-10 w-10 text-slate-300" />}
            eyebrow="Not found"
            title="This public scan report does not exist"
            description="The scan may not be source-linked, the id may be wrong, or the report may no longer be public."
          />
        )}

        {displayState.status === "error" && (
          <StatePanel
            icon={<AlertTriangle className="h-10 w-10 text-amber-300" />}
            eyebrow="Load error"
            title="The report could not be loaded"
            description={displayState.message}
          />
        )}

        {displayState.status === "ready" && <PublicReport payload={displayState.payload} />}
      </div>
    </div>
  )
}

function PublicReport({ payload }: { payload: PublicReportPayload }) {
  const tone = tonePresets[payload.classification]
  const VerdictIcon = tone.icon
  const [showAdvanced, setShowAdvanced] = useState(false)
  const defaultFindings = useMemo(
    () => payload.findings.filter((finding) => finding.visibility !== "Advanced"),
    [payload.findings],
  )
  const advancedFindings = useMemo(
    () => payload.findings.filter((finding) => finding.visibility === "Advanced"),
    [payload.findings],
  )
  const displayedFindings = showAdvanced ? payload.findings : defaultFindings
  const sortedFindings = useMemo(
    () => [...displayedFindings].sort((left, right) => severityRank(right.severity) - severityRank(left.severity)),
    [displayedFindings],
  )
  const displayName = payload.source.displayName ?? payload.source.fileName ?? payload.fileName
  const packageName = payload.source.packageFileName ?? payload.source.fileName

  return (
    <article className="mx-auto max-w-6xl space-y-6">
      <section className={cn("rounded-lg border p-6 shadow-2xl shadow-black/20", tone.shell)}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-lg border", tone.badge)}>
              <VerdictIcon className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Public scan report</p>
              <h1 className="mt-2 break-words font-display text-3xl text-white md:text-4xl">{displayName}</h1>
              <p className={cn("mt-3 max-w-3xl text-base leading-7", tone.text)}>
                {payload.headline || tone.label}
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{payload.summary}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {payload.source.sourceUrl ? (
              <a
                href={payload.source.sourceUrl}
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-4 text-sm font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                Mod page
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
            <Link
              to="/scan"
              className="inline-flex min-h-9 items-center rounded-md border border-slate-700 bg-slate-900 px-4 text-sm font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
            >
              Scan a file
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Disposition" value={payload.classification} />
          <Fact label="Blocking recommended" value={payload.blockingRecommended ? "Yes" : "No"} />
          <Fact label="Findings" value={`${payload.findingCount} retained`} />
          <Fact label="Scanned" value={formatDate(payload.scannedAt)} />
        </div>
      </section>

      {payload.relatedReports.length > 1 ? (
        <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Package assemblies</h2>
              <p className="mt-1 text-sm text-slate-400">
                This source package produced {payload.relatedReports.length} public assembly reports.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
              {packageName}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {payload.relatedReports.map((report) => (
              <Link
                key={report.submissionId}
                to={`/reports/${encodeURIComponent(report.submissionId)}`}
                className={cn(
                  "rounded-md border p-4 transition hover:border-slate-500 hover:bg-slate-900",
                  report.current
                    ? "border-teal-400/40 bg-teal-500/10"
                    : "border-slate-800 bg-slate-900/50",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 break-words font-mono text-xs text-slate-100">{report.fileName}</p>
                  {report.current ? (
                    <span className="shrink-0 rounded-full border border-teal-400/40 bg-teal-500/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-teal-200">
                      Open
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs", classificationClass(report.classification))}>
                    {report.classification}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-0.5 text-xs text-slate-300">
                    {report.findingCount} {report.findingCount === 1 ? "finding" : "findings"}
                  </span>
                </div>
                {report.contentHash ? (
                  <p className="mt-3 truncate font-mono text-[0.68rem] text-slate-500">{report.contentHash}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-lg font-semibold text-white">Artifact</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Detail label="Package" value={packageName} />
            <Detail label="Assembly" value={payload.fileName} mono />
            <Detail label="Version" value={payload.source.version} />
            <Detail label="Author" value={payload.source.author} />
            <Detail label="Provider" value={providerLabel(payload.source.provider)} />
            {payload.sizeBytes !== null ? <Detail label="Size" value={formatBytes(payload.sizeBytes)} /> : null}
            <Detail label="SHA256" value={payload.contentHash} mono />
          </div>
          <div className="mt-4 rounded-md border border-slate-800 bg-slate-900/60 p-3 text-xs leading-5 text-slate-400">
            MLVScan can be incorrect. Treat this report as static-analysis guidance, not a guarantee.
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Rules and findings</h2>
              <p className="mt-1 text-sm text-slate-400">
                Retained findings are shown by default. Advanced diagnostics are optional.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                {payload.findingCount} retained
              </span>
              {advancedFindings.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowAdvanced((value) => !value)}
                  className={cn(
                    "inline-flex min-h-8 items-center rounded-md border px-3 text-xs font-medium transition",
                    showAdvanced
                      ? "border-amber-400/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15"
                      : "border-slate-700 bg-slate-900 text-white hover:border-slate-500 hover:bg-slate-800",
                  )}
                >
                  {showAdvanced ? "Hide Advanced" : `Show Advanced (${advancedFindings.length})`}
                </button>
              ) : null}
            </div>
          </div>
          {sortedFindings.length > 0 ? (
            <div className="mt-4 space-y-3">
              {sortedFindings.map((finding, index) => (
                <div key={finding.id ?? `${finding.ruleId ?? "finding"}-${index}`} className="rounded-md border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", severityClass(finding.severity))}>
                      {finding.severity}
                    </span>
                    {finding.ruleId ? (
                      <span className="font-mono text-xs text-teal-200">{finding.ruleId}</span>
                    ) : null}
                    {finding.visibility === "Advanced" ? (
                      <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-200">
                        Advanced
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 break-words text-sm leading-6 text-slate-200">{finding.description}</p>
                  {finding.location ? (
                    <p className="mt-2 break-all font-mono text-xs text-slate-500">{finding.location}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
              <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-emerald-300/70" />
              {advancedFindings.length > 0 && !showAdvanced
                ? "No retained rule findings were exposed for this scan. Advanced diagnostics are available."
                : "No retained rule findings were exposed for this scan."}
            </div>
          )}
        </div>
      </section>

      {payload.threatFamilies.length > 0 ? (
        <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-lg font-semibold text-white">Threat families</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {payload.threatFamilies.map((family) => (
              <div key={`${family.familyId}:${family.variantId ?? "base"}`} className="rounded-md border border-red-400/20 bg-red-500/5 p-4">
                <div className="flex items-start gap-3">
                  <FileWarning className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                  <div>
                    <p className="font-semibold text-red-100">{family.displayName}</p>
                    <p className="mt-1 font-mono text-xs text-red-100/70">{family.familyId}</p>
                    {family.summary ? <p className="mt-2 text-sm leading-6 text-slate-300">{family.summary}</p> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}

function StatePanel({
  icon,
  eyebrow,
  title,
  description,
  showScanLink = true,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  description: string
  showScanLink?: boolean
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-slate-800 bg-slate-900/80 px-6 py-10 text-center sm:px-10">
      <div className="mx-auto flex size-16 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
        {icon}
      </div>
      <p className="mt-5 text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
      <h1 className="mt-3 font-display text-2xl text-white sm:text-3xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
      {showScanLink ? (
        <div className="mt-6 flex justify-center">
          <Link
            to="/scan"
            className="inline-flex min-h-9 items-center rounded-md border border-slate-700 bg-slate-800 px-5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Open local browser scanner
          </Link>
        </div>
      ) : null}
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function Detail({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
  if (!value) {
    return null
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className={cn("min-w-0 break-words text-right text-slate-200", mono && "font-mono text-xs")}>{value}</span>
    </div>
  )
}

function providerLabel(provider: string): string {
  if (provider === "nexusmods") return "Nexus Mods"
  if (provider === "thunderstore") return "Thunderstore"
  return provider
}

function severityRank(severity: string): number {
  switch (severity.toLowerCase()) {
    case "critical":
      return 4
    case "high":
      return 3
    case "medium":
      return 2
    case "low":
      return 1
    default:
      return 0
  }
}

function severityClass(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical":
      return "border-red-400/30 bg-red-500/10 text-red-200"
    case "high":
      return "border-orange-400/30 bg-orange-500/10 text-orange-200"
    case "medium":
      return "border-amber-400/30 bg-amber-500/10 text-amber-200"
    case "low":
      return "border-sky-400/30 bg-sky-500/10 text-sky-200"
    default:
      return "border-slate-600 bg-slate-800 text-slate-200"
  }
}

function classificationClass(classification: PublicReportPayload["classification"]): string {
  switch (classification) {
    case "KnownThreat":
      return "border-red-400/30 bg-red-500/10 text-red-200"
    case "Suspicious":
      return "border-amber-400/30 bg-amber-500/10 text-amber-200"
    case "Clean":
    default:
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
  }
}
