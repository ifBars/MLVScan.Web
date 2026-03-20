import { useMemo, useState } from "react"
import {
  CheckCircle,
  FileCode,
  Link2,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
} from "lucide-react"
import { Link } from "react-router-dom"
import type { Finding, ScanResult, Severity, ThreatFamily, ThreatFamilyEvidence } from "@/types/mlvscan"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import CallChainViewer from "@/components/scan/CallChainViewer"
import DataFlowViewer from "@/components/scan/DataFlowViewer"
import { getThreatFamilyById } from "@/families/registry"
import {
  getActionItems,
  getAdvancedFindings,
  getDefaultFindings,
  getDisplayedFindings,
  getResultClassification,
} from "@/lib/scan-result-view"
import { cn, formatBytes, formatDate, getSeverityBadgeColor } from "@/lib/utils"

const severityOrder: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

const severityList: Array<Severity | "All"> = ["All", "Critical", "High", "Medium", "Low"]

const patternLabelMap: Record<string, string> = {
  DownloadAndExecute: "Downloads and executes code",
  DataExfiltration: "Sends data outside the game",
  DynamicCodeLoading: "Loads code dynamically",
  CredentialTheft: "Attempts to access credentials",
  RemoteConfigLoad: "Loads remote configuration",
  ObfuscatedPersistence: "Attempts persistent behavior",
  EmbeddedResourceDropAndExecute: "Drops an embedded payload and executes it",
}

const verdictPresets = {
  Clean: {
    label: "No Known Threats Detected",
    message: "No known malware families or correlated suspicious behavior were retained.",
    icon: ShieldCheck,
    tone: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  Suspicious: {
    label: "Suspicious Behavior Detected",
    message: "This file was flagged as suspicious. It may be malicious, but it may also be a false positive.",
    icon: ShieldAlert,
    tone: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  KnownThreat: {
    label: "Likely Malware Detected",
    message: "This file matched a known malicious sample or malware family pattern.",
    icon: ShieldOff,
    tone: "bg-red-500/10 text-red-300 border-red-500/30",
  },
} as const

interface ScanReportProps {
  result: ScanResult
  onReset: () => void
}

const getFindingKey = (finding: Finding, index: number) => finding.id ?? `${index}`

const getFindingSummary = (finding: Finding) => {
  if (finding.dataFlowChain?.pattern && patternLabelMap[finding.dataFlowChain.pattern]) {
    return patternLabelMap[finding.dataFlowChain.pattern]
  }

  if (finding.description) {
    return finding.description
  }

  return "Suspicious behavior detected"
}

const getThreatFamilyEvidenceMeta = (evidence: ThreatFamilyEvidence): string[] => {
  const items: string[] = []

  if (evidence.ruleId) {
    items.push(evidence.ruleId)
  }

  if (evidence.pattern) {
    items.push(patternLabelMap[evidence.pattern] ?? evidence.pattern)
  }

  if (typeof evidence.confidence === "number") {
    items.push(`${Math.round(evidence.confidence * 100)}% confidence`)
  }

  return items
}

const getThreatFamilyEvidenceDetail = (evidence: ThreatFamilyEvidence): string | null => {
  const parts = [
    evidence.methodLocation,
    evidence.location,
    evidence.callChainId ? `Call chain: ${evidence.callChainId}` : null,
    evidence.dataFlowChainId ? `Data flow: ${evidence.dataFlowChainId}` : null,
  ].filter((value): value is string => Boolean(value))

  if (parts.length === 0) {
    return null
  }

  return Array.from(new Set(parts)).join(" | ")
}

function ThreatFamilyEvidenceSection({ match }: { match: ThreatFamily }) {
  if (match.evidence.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Why this matched</p>
        <Badge variant="outline" className="text-[11px]">
          {match.evidence.length} evidence item{match.evidence.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="space-y-3">
        {match.evidence.map((evidence, index) => {
          const meta = getThreatFamilyEvidenceMeta(evidence)
          const detail = getThreatFamilyEvidenceDetail(evidence)

          return (
            <div
              key={`${match.familyId}-${match.variantId}-${evidence.kind}-${index}`}
              className="rounded-md border border-border/50 bg-background/70 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-border/50 bg-muted/40 text-foreground">{evidence.kind}</Badge>
                {meta.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border/50 bg-muted/20 px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <p className="mt-2 break-words text-sm text-foreground">{evidence.value}</p>

              {detail && (
                <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">{detail}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ScanReport = ({ result, onReset }: ScanReportProps) => {
  const classification = getResultClassification(result)
  const verdict = verdictPresets[classification]
  const VerdictIcon = verdict.icon
  const familyMatches = result.threatFamilies ?? []
  const defaultFindings = useMemo(() => getDefaultFindings(result), [result])
  const advancedFindings = useMemo(() => getAdvancedFindings(result), [result])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeSeverity, setActiveSeverity] = useState<Severity | "All">("All")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const displayedFindings = useMemo(
    () => getDisplayedFindings(result, showAdvanced),
    [result, showAdvanced]
  )

  const sortedDisplayedFindings = useMemo(
    () =>
      [...displayedFindings].sort((a, b) => {
        const order = severityOrder[b.severity] - severityOrder[a.severity]
        return order !== 0 ? order : a.description.localeCompare(b.description)
      }),
    [displayedFindings]
  )

  const filteredFindings = useMemo(() => {
    if (activeSeverity === "All") return sortedDisplayedFindings
    return sortedDisplayedFindings.filter((finding) => finding.severity === activeSeverity)
  }, [activeSeverity, sortedDisplayedFindings])

  const effectiveSelectedKey = useMemo(() => {
    if (filteredFindings.length === 0) return null

    const keys = filteredFindings.map((finding, index) => getFindingKey(finding, index))
    if (selectedKey && keys.includes(selectedKey)) return selectedKey
    return keys[0]
  }, [filteredFindings, selectedKey])

  const selectedFinding = useMemo(() => {
    if (!effectiveSelectedKey) return null
    return filteredFindings.find((finding, index) => getFindingKey(finding, index) === effectiveSelectedKey) ?? null
  }, [effectiveSelectedKey, filteredFindings])

  const highlightedFindings = useMemo(() => {
    if (defaultFindings.length > 0) {
      return [...defaultFindings]
        .sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])
        .slice(0, 3)
    }

    if (showAdvanced) {
      return sortedDisplayedFindings.slice(0, 3)
    }

    return []
  }, [defaultFindings, showAdvanced, sortedDisplayedFindings])

  const dispositionHeadline = result.disposition?.headline ?? verdict.label
  const dispositionSummary = result.disposition?.summary ?? verdict.message
  const blockingRecommended = result.disposition?.blockingRecommended ?? classification !== "Clean"

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border", verdict.tone)}>
              <VerdictIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-2xl">{dispositionHeadline}</CardTitle>
              <CardDescription className="mt-1 max-w-xl line-clamp-3">{dispositionSummary}</CardDescription>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="max-w-[220px] truncate font-mono">{result.input.fileName}</span>
                <span>|</span>
                <span>{formatBytes(result.input.sizeBytes)}</span>
                <span>|</span>
                <span>Scanned {formatDate(result.metadata.timestamp)}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={onReset}>
              Scan Another
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Disposition</p>
              <p className="text-2xl font-bold text-foreground">{classification}</p>
            </div>
            <div className="rounded-lg bg-emerald-500/5 p-4">
              <p className="text-sm text-emerald-300/80">Retained Findings</p>
              <p className="text-2xl font-bold text-emerald-200">{defaultFindings.length}</p>
            </div>
            <div className="rounded-lg bg-amber-500/5 p-4">
              <p className="text-sm text-amber-300/80">Advanced Diagnostics</p>
              <p className="text-2xl font-bold text-amber-200">{advancedFindings.length}</p>
            </div>
            <div className="rounded-lg bg-red-500/5 p-4">
              <p className="text-sm text-red-300/80">Blocking Recommended</p>
              <p className="text-2xl font-bold text-red-200">{blockingRecommended ? "Yes" : "No"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {familyMatches.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle>Known malware family match</CardTitle>
            <CardDescription>
              This scan matches a previously observed malware family cluster.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {familyMatches.map((match) => {
              const familyMeta = getThreatFamilyById(match.familyId)

              return (
                <div
                  key={`${match.familyId}-${match.variantId}`}
                  className="rounded-lg border border-red-500/20 bg-background/60 p-4"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border-red-500/30 bg-red-500/10 text-red-200">
                            {match.matchKind === "ExactSampleHash" ? "Exact sample hash" : "Behavior match"}
                          </Badge>
                          <Badge variant="outline">{Math.round(match.confidence * 100)}% confidence</Badge>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-foreground">{match.displayName}</p>
                          <p className="text-sm text-muted-foreground">{match.summary}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {match.matchedRules.map((rule) => (
                            <span
                              key={rule}
                              className="rounded-full border border-border/50 bg-muted/20 px-2.5 py-1 font-mono"
                            >
                              {rule}
                            </span>
                          ))}
                        </div>
                      </div>

                      {familyMeta && (
                        <Link
                          to={`/advisories/families/${familyMeta.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-teal-300 hover:text-teal-200"
                        >
                          <Link2 className="h-4 w-4" />
                          Open family page
                        </Link>
                      )}
                    </div>

                    <ThreatFamilyEvidenceSection match={match} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>What it means</CardTitle>
            <CardDescription>
              Retained findings support the primary verdict. Advanced diagnostics stay hidden unless you opt in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {highlightedFindings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-emerald-500/20 bg-emerald-500/5 p-6 text-center text-muted-foreground">
                <CheckCircle className="mx-auto mb-3 h-8 w-8 text-emerald-500/50" />
                <p className="font-medium text-foreground">No retained findings support the verdict.</p>
                <p className="text-sm">
                  {advancedFindings.length > 0
                    ? "Advanced diagnostics exist, but they were not used for the default verdict."
                    : "This file did not retain any suspicious findings."}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {highlightedFindings.map((finding, index) => (
                  <li key={getFindingKey(finding, index)} className="flex min-w-0 items-start gap-3">
                    <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", getSeverityBadgeColor(finding.severity))} />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium text-foreground">{getFindingSummary(finding)}</p>
                      <p className="truncate text-xs text-muted-foreground" title={finding.location}>
                        {finding.location}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
              <h4 className="text-sm font-semibold text-foreground">Recommended actions</h4>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {getActionItems(result).map((item) => (
                  <li key={item} className="break-words">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>File details</CardTitle>
            <CardDescription>Verify trust and identify the exact file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2 overflow-hidden">
              <span className="shrink-0 text-muted-foreground">File name</span>
              <span className="max-w-[70%] truncate font-mono text-xs">{result.input.fileName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Size</span>
              <span>{formatBytes(result.input.sizeBytes)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Scan mode</span>
              <span className="capitalize">{result.metadata.scanMode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Scanner</span>
              <span className="font-mono text-xs">{result.metadata.scannerVersion}</span>
            </div>
            {result.disposition?.primaryThreatFamilyId && (
              <div className="flex items-center justify-between gap-2 overflow-hidden">
                <span className="shrink-0 text-muted-foreground">Primary family</span>
                <span className="max-w-[70%] truncate font-mono text-xs">{result.disposition.primaryThreatFamilyId}</span>
              </div>
            )}
            {result.input.sha256Hash && (
              <div className="min-w-0 rounded-md border border-border/50 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">SHA256</p>
                <p className="mt-1 break-all font-mono text-xs text-foreground">{result.input.sha256Hash}</p>
              </div>
            )}
            <div className="rounded-md border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
              Static analysis can miss runtime behavior. Treat this report as guidance, not a guarantee.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="flex min-h-[520px] min-w-0 flex-col overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <CardTitle>Findings</CardTitle>
                <CardDescription>
                  Retained findings are shown by default. Advanced diagnostics are optional.
                </CardDescription>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {advancedFindings.length > 0 && (
                  <Button
                    size="sm"
                    variant={showAdvanced ? "secondary" : "outline"}
                    onClick={() => setShowAdvanced((value) => !value)}
                  >
                    {showAdvanced ? "Hide Advanced" : `Show Advanced (${advancedFindings.length})`}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {severityList.map((severity) => (
                <Button
                  key={severity}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  variant={activeSeverity === severity ? "secondary" : "outline"}
                  onClick={() => setActiveSeverity(severity)}
                >
                  {severity}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {filteredFindings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-center text-muted-foreground">
                {advancedFindings.length > 0 && !showAdvanced
                  ? "No retained findings match this filter. Advanced diagnostics are available."
                  : "No findings match this filter."}
              </div>
            ) : (
              <ScrollArea className="h-[420px] pr-3">
                <div className="space-y-3">
                  {filteredFindings.map((finding, index) => {
                    const key = getFindingKey(finding, index)
                    const isSelected = key === effectiveSelectedKey

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedKey(key)}
                        className={cn(
                          "w-full min-w-0 overflow-hidden rounded-lg border p-3 text-left transition-colors",
                          isSelected ? "border-teal-400/60 bg-emerald-950/30" : "border-border/60 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <Badge className={cn("mt-0.5 shrink-0 border border-border/40", getSeverityBadgeColor(finding.severity))}>
                            {finding.severity}
                          </Badge>
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              {finding.visibility === "Advanced" && (
                                <Badge variant="outline" className="text-[11px] text-amber-300">
                                  Advanced
                                </Badge>
                              )}
                            </div>
                            <p
                              className="break-all text-sm font-semibold leading-snug text-foreground whitespace-normal"
                              title={finding.description}
                            >
                              {finding.description}
                            </p>
                            <p
                              className="mt-1 break-all font-mono text-xs text-muted-foreground whitespace-normal"
                              title={finding.location}
                            >
                              {finding.location}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-[520px] min-w-0 flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Evidence</CardTitle>
            <CardDescription>Review the call path and data flow for the selected finding.</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 flex-1 space-y-4 overflow-y-auto">
            {!selectedFinding ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-center text-muted-foreground">
                Select a finding to view evidence.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="min-w-0 rounded-lg border border-border/50 bg-muted/20 p-4">
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex min-w-0 items-start gap-2">
                        <Badge className={cn("mt-0.5 shrink-0 border border-border/40", getSeverityBadgeColor(selectedFinding.severity))}>
                          {selectedFinding.severity}
                        </Badge>
                        <p
                          className="min-w-0 break-all text-sm font-semibold leading-snug text-foreground whitespace-normal"
                          title={selectedFinding.description}
                        >
                          {selectedFinding.description}
                        </p>
                      </div>
                      <p
                        className="break-all font-mono text-xs text-muted-foreground whitespace-normal opacity-80"
                        title={selectedFinding.location}
                      >
                        {selectedFinding.location}
                      </p>
                    </div>
                    <FileCode className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                </div>

                {selectedFinding.codeSnippet && !selectedFinding.callChain && !selectedFinding.dataFlowChain && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Detected pattern
                    </h5>
                    <pre className="overflow-x-auto rounded-md border border-border/50 bg-muted/50 p-3 font-mono text-xs text-foreground">
                      <code>{selectedFinding.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {selectedFinding.callChain && (
                  <div className="min-w-0 space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                      Deep IL: Execution path
                    </h5>
                    <div className="overflow-hidden rounded-md border border-border/40">
                      <CallChainViewer chain={selectedFinding.callChain} className="bg-background/50" />
                    </div>
                  </div>
                )}

                {selectedFinding.dataFlowChain && (
                  <div className="min-w-0 space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                      Deep IL: Data flow
                    </h5>
                    <div className="overflow-hidden rounded-md border border-border/40">
                      <DataFlowViewer chain={selectedFinding.dataFlowChain} className="bg-background/50" />
                    </div>
                  </div>
                )}

                {selectedFinding.visibility === "Advanced" && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100/80">
                    This is an advanced diagnostic finding. It was not used as the primary verdict source.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ScanReport
