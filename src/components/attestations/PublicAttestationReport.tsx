import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  ArrowUpRight,
  CircleHelp,
  FileJson,
  FileText,
  Link2,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  TriangleAlert,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { buildAttestationBadgeUrl, buildSignedAttestationUrl } from "@/lib/attestation-api"
import {
  getAttestationTone,
  getAttestationVerdictLabel,
  getSourceBindingLabel,
  getVerificationTierLabel,
  shortenHash,
} from "@/lib/attestation-view"
import { cn, formatBytes, formatDate } from "@/lib/utils"
import type { PublicAttestationPayload } from "@/types/attestation"

const toneClasses = {
  clean: {
    badge: "border-emerald-600/40 bg-emerald-950/50 text-emerald-300",
    banner: "border-emerald-600/30 bg-emerald-950/40 text-emerald-200",
    scoreRing: "border-emerald-500/40",
    icon: ShieldCheck,
  },
  suspicious: {
    badge: "border-amber-600/40 bg-amber-950/50 text-amber-300",
    banner: "border-amber-600/30 bg-amber-950/40 text-amber-200",
    scoreRing: "border-amber-500/40",
    icon: ShieldAlert,
  },
  threat: {
    badge: "border-rose-600/40 bg-rose-950/50 text-rose-300",
    banner: "border-rose-600/30 bg-rose-950/40 text-rose-200",
    scoreRing: "border-rose-500/40",
    icon: ShieldOff,
  },
  revoked: {
    badge: "border-slate-600/40 bg-slate-900/60 text-slate-300",
    banner: "border-slate-600/30 bg-slate-900/60 text-slate-200",
    scoreRing: "border-slate-500/40",
    icon: TriangleAlert,
  },
} as const

const severityWeights: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

interface PublicAttestationReportProps {
  payload: PublicAttestationPayload
}

export default function PublicAttestationReport({ payload }: PublicAttestationReportProps) {
  const tone = getAttestationTone(payload.classification, payload.publicationStatus)
  const tonePreset = toneClasses[tone]
  const VerdictIcon = tonePreset.icon
  const verdictLabel = getAttestationVerdictLabel(payload.classification, payload.publicationStatus)
  const verificationLabel = getVerificationTierLabel(payload.verificationTier)
  const sourceBindingLabel = getSourceBindingLabel(payload.sourceBindingStatus)
  const sourceDisplayLabel =
    sourceBindingLabel === "No bound source" ? "Source unverified" : sourceBindingLabel
  const sourceTooltip = getSourceTooltipText(payload.sourceBindingStatus, payload.canonicalSourceUrl)
  const badgeUrl = buildAttestationBadgeUrl(payload.shareId)
  const signedJsonUrl = buildSignedAttestationUrl(payload.shareId)
  const familyLabel = `${payload.threatFamilies.length} family match${payload.threatFamilies.length === 1 ? "" : "es"}`
  const detectionLabel = `${payload.findingCount} retained finding${payload.findingCount === 1 ? "" : "s"}`
  const publishedLabel = payload.revokedAt ? "Revoked at" : "Published at"
  const statusChipClass =
    "inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/65 px-3.5 text-sm font-medium text-slate-200"

  const sortedFindings = useMemo(
    () =>
      [...payload.findings].sort((left, right) => {
        const leftSeverity = severityWeights[left.severity.toLowerCase()] ?? 0
        const rightSeverity = severityWeights[right.severity.toLowerCase()] ?? 0
        if (rightSeverity !== leftSeverity) {
          return rightSeverity - leftSeverity
        }

        return left.description.localeCompare(right.description)
      }),
    [payload.findings],
  )
  const hasRetainedFindings = sortedFindings.length > 0
  const hasFamilyMatches = payload.threatFamilies.length > 0
  const hasDetectionSignals = hasRetainedFindings || hasFamilyMatches

  return (
    <div className="space-y-6 lg:space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6"
      >
        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
          <div className="rounded-lg border border-slate-800 bg-slate-800/45 p-4">
            <div
              className={cn(
                "mx-auto flex size-28 items-center justify-center rounded-full border-[10px] bg-slate-900/70",
                tonePreset.scoreRing,
              )}
            >
              <div className="text-center">
                <p className="text-3xl font-semibold text-white">{payload.findingCount}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                  Findings
                </p>
              </div>
            </div>
            <p className="mt-4 text-center text-xs uppercase tracking-[0.16em] text-slate-500">
              Public attestation
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-800/35">
            <div className={cn("flex items-center gap-2 border-b px-4 py-3 text-sm", tonePreset.banner)}>
              <VerdictIcon className="h-4 w-4" />
              <span className="font-medium">{verdictLabel}</span>
            </div>

            <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {payload.verificationTier === "self_submitted" ? (
                    <TooltipProvider delayDuration={0}>
                      <div className={cn(statusChipClass, "pr-2.5")}>
                        <span>{verificationLabel}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label="Explain self-submitted attestation limits"
                              className="inline-flex size-5 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                            >
                              <CircleHelp className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs bg-slate-950 text-slate-100">
                            This self-submitted attestation covers only the exact SHA-256 listed
                            here. Compare your file&apos;s SHA-256 before treating this badge as a
                            trust signal for the copy you downloaded.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  ) : (
                    <div className={statusChipClass}>
                      {verificationLabel}
                    </div>
                  )}
                  <TooltipProvider delayDuration={0}>
                    <div className={cn(statusChipClass, "pr-2.5")}>
                      <Link2 className="size-4 text-slate-300" />
                      <span>{sourceDisplayLabel}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="Explain source binding state"
                            className="inline-flex size-5 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          >
                            <CircleHelp className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-slate-950 text-slate-100">
                          {sourceTooltip}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>

                <div>
                  <h1 className="font-display text-3xl leading-tight text-white sm:text-4xl">
                    {payload.publicDisplayName}
                  </h1>
                  <p className="mt-2 break-all font-mono text-xs text-slate-400">{payload.fileName}</p>
                </div>

                <p className="max-w-3xl text-sm leading-6 text-slate-300">{payload.summary}</p>

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <a href={badgeUrl} target="_blank" rel="noreferrer">
                      Badge SVG
                      <FileText data-icon="inline-end" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    <a href={signedJsonUrl} target="_blank" rel="noreferrer">
                      Signed JSON
                      <FileJson data-icon="inline-end" />
                    </a>
                  </Button>
                  {payload.canonicalSourceUrl ? (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                      <a href={payload.canonicalSourceUrl} target="_blank" rel="noreferrer">
                        Declared source
                        <ArrowUpRight data-icon="inline-end" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Metric label="SHA-256" value={shortenHash(payload.contentHash)} mono />
                <Metric label="Size" value={formatBytes(payload.sizeBytes)} />
                <Metric label="Scanned" value={formatDate(payload.scannedAt)} />
                <Metric
                  label={publishedLabel}
                  value={formatDate(payload.revokedAt ?? payload.publishedAt ?? payload.scannedAt)}
                />
                <Metric label="Schema" value={payload.schemaVersion} />
                <Metric label="Scanner" value={payload.scannerVersion} />
                <Metric label="Detections" value={detectionLabel} />
                <Metric label="Families" value={familyLabel} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {payload.publicationStatus === "revoked" ? (
            <div className="rounded-md border border-slate-600/30 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
              This attestation has been revoked and should be treated as historical record.
            </div>
          ) : null}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
      >
        <Tabs defaultValue="detection" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-md border border-slate-800 bg-slate-900 p-1 sm:max-w-[360px]">
            <TabsTrigger value="detection" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Detection
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detection" className="mt-0 space-y-4">
            {!hasDetectionSignals ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900/85">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
                  <div>
                    <p className="font-display text-xl text-white">Retained findings analysis</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Findings and threat-family evidence retained in the published attestation.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                      {detectionLabel}
                    </Badge>
                    <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                      {familyLabel}
                    </Badge>
                  </div>
                </div>
                <div className="px-4 py-8 text-sm text-slate-400">
                  No retained findings or family matches were published for this attestation.
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-slate-800 bg-slate-900/85">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
                    <div>
                      <p className="font-display text-xl text-white">Retained findings analysis</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Findings and threat-family evidence retained in the published attestation.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                        {detectionLabel}
                      </Badge>
                      <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                        {familyLabel}
                      </Badge>
                    </div>
                  </div>

                  {hasRetainedFindings ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                          <TableHead>Indicator</TableHead>
                          <TableHead>Verdict</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedFindings.map((finding, index) => (
                          <TableRow
                            key={finding.id ?? `${finding.ruleId ?? "finding"}-${index}`}
                            className="border-slate-800 hover:bg-slate-800/40"
                          >
                            <TableCell className="min-w-[320px]">
                              <p className="text-sm text-white">{finding.description}</p>
                              {finding.location ? (
                                <p className="mt-1 break-all font-mono text-xs text-slate-500">{finding.location}</p>
                              ) : null}
                              {finding.ruleId ? (
                                <p className="mt-1 font-mono text-xs text-slate-500">{finding.ruleId}</p>
                              ) : null}
                            </TableCell>
                            <TableCell className="w-[220px]">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={cn("border", severityBadgeClass(finding.severity))}>
                                  {finding.severity}
                                </Badge>
                                <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-400">
                                  {finding.visibility}
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="px-4 py-6 text-sm text-slate-400">
                      No retained findings were published for this attestation.
                    </div>
                  )}
                </div>

                {hasFamilyMatches ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                      <div>
                        <p className="font-display text-xl text-white">Threat family matches</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Higher-level malware family classification derived from retained evidence.
                        </p>
                      </div>
                      <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                        {familyLabel}
                      </Badge>
                    </div>

                    {payload.threatFamilies.map((family) => (
                      <div
                        key={`${family.familyId}-${family.variantId ?? "base"}`}
                        className="rounded-lg border border-slate-800 bg-slate-900/85 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-2xl text-white">{family.displayName}</p>
                          {family.exactHashMatch ? (
                            <Badge className="border-rose-600/40 bg-rose-950/50 text-rose-300">
                              Exact hash match
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{family.summary}</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          <Metric label="Family id" value={family.familyId} mono />
                          <Metric label="Variant" value={family.variantId ?? "base"} />
                          <Metric label="Match kind" value={family.matchKind} />
                          <Metric
                            label="Confidence"
                            value={family.confidence === null ? "not provided" : `${Math.round(family.confidence * 100)}%`}
                          />
                        </div>
                        <div className="mt-3">
                          <p className="text-[0.66rem] uppercase tracking-[0.16em] text-slate-500">
                            Matched rules
                          </p>
                          {family.matchedRules.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {family.matchedRules.map((rule) => (
                                <Badge
                                  key={`${family.familyId}-${rule}`}
                                  variant="outline"
                                  className="border-slate-700 bg-slate-800 text-slate-300"
                                >
                                  {rule}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-slate-500">No matched rules were included.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-0 space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-slate-800 bg-slate-900/85 p-4">
                <p className="dashboard-kicker">Exact file identity</p>
                <div className="mt-3 space-y-3">
                  <DetailRow label="File name" value={payload.fileName} mono />
                  <DetailRow label="SHA-256" value={payload.contentHash} mono />
                  <DetailRow label="Share id" value={payload.shareId} mono />
                  <DetailRow label="Short hash" value={shortenHash(payload.contentHash)} mono />
                  <DetailRow label="Size" value={formatBytes(payload.sizeBytes)} />
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/85 p-4">
                <p className="dashboard-kicker">Scan facts</p>
                <div className="mt-3 space-y-3">
                  <DetailRow label="Classification" value={verdictLabel} />
                  <DetailRow label="Verification tier" value={verificationLabel} />
                  <DetailRow label="Source binding" value={sourceBindingLabel} />
                  <DetailRow label="Scanned at" value={formatDate(payload.scannedAt)} />
                  <DetailRow label={publishedLabel} value={formatDate(payload.revokedAt ?? payload.publishedAt ?? payload.scannedAt)} />
                  <DetailRow label="Scanner" value={payload.scannerVersion} />
                  <DetailRow label="Schema" value={payload.schemaVersion} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.section>
    </div>
  )
}

function severityBadgeClass(severity: string): string {
  const normalized = severity.toLowerCase()
  if (normalized === "critical" || normalized === "high") {
    return "border-rose-600/40 bg-rose-950/50 text-rose-300"
  }
  if (normalized === "medium") {
    return "border-amber-600/40 bg-amber-950/50 text-amber-300"
  }
  if (normalized === "low") {
    return "border-emerald-600/40 bg-emerald-950/50 text-emerald-300"
  }
  return "border-slate-600/40 bg-slate-900/60 text-slate-300"
}

function Metric({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-800/55 px-3 py-2">
      <p className="text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={cn("mt-1 text-sm text-slate-100", mono && "break-all font-mono text-xs")}>
        {value}
      </p>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
      <p className="text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={cn("mt-1 text-sm text-slate-200", mono && "break-all font-mono text-xs")}>
        {value}
      </p>
    </div>
  )
}

function getSourceTooltipText(
  status: PublicAttestationPayload["sourceBindingStatus"],
  canonicalSourceUrl: string | null,
): string {
  switch (status) {
    case "verified":
      return canonicalSourceUrl
        ? `MLVScan verified this attestation against the declared source: ${canonicalSourceUrl}`
        : "MLVScan verified this attestation against a declared source URL."
    case "declared":
      return canonicalSourceUrl
        ? `The publisher declared this source URL, but MLVScan has not verified it yet: ${canonicalSourceUrl}`
        : "The publisher declared a source URL for this attestation, but MLVScan has not verified it yet."
    case "stale":
      return canonicalSourceUrl
        ? `This attestation was linked to ${canonicalSourceUrl}, but that source is no longer current for verification.`
        : "This attestation was linked to a source URL, but that source is no longer current for verification."
    case "failed":
      return canonicalSourceUrl
        ? `MLVScan could not verify that the current file from ${canonicalSourceUrl} matches this attestation.`
        : "MLVScan could not verify that the current source matches this attestation."
    case "none":
    default:
      return "This attestation is not currently bound to a download source. Match the SHA-256 shown on this page against your file before assuming the badge applies to your copy."
  }
}
