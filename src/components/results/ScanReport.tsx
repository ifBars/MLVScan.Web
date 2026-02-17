import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle,
  FileCode,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
} from "lucide-react"
import type { Finding, ScanResult, Severity } from "@/types/mlvscan"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatBytes, formatDate, getSeverityBadgeColor, cn } from "@/lib/utils"
import CallChainViewer from "@/components/scan/CallChainViewer"
import DataFlowViewer from "@/components/scan/DataFlowViewer"

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
}

const verdictPresets = {
  safe: {
    label: "No Threats Detected",
    message: "No suspicious patterns were found in this file.",
    icon: ShieldCheck,
    tone: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  low: {
    label: "Low Risk Indicators",
    message: "Minor signals were found. Review the findings before installing.",
    icon: ShieldAlert,
    tone: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  },
  medium: {
    label: "Potential Risk",
    message: "This mod shows behavior that may be unsafe. Review details carefully.",
    icon: AlertTriangle,
    tone: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  },
  high: {
    label: "Suspicious Behavior Detected",
    message: "High risk indicators were found. Avoid installing until verified.",
    icon: ShieldOff,
    tone: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  },
  critical: {
    label: "High Risk Detected",
    message: "Critical indicators were found. Do not install this mod.",
    icon: ShieldOff,
    tone: "bg-red-500/10 text-red-300 border-red-500/30",
  },
}

interface ScanReportProps {
  result: ScanResult
  onReset: () => void
}

const getVerdictKey = (summary: ScanResult["summary"]) => {
  const critical = summary.countBySeverity["Critical"] || 0
  const high = summary.countBySeverity["High"] || 0
  const medium = summary.countBySeverity["Medium"] || 0
  const low = summary.countBySeverity["Low"] || 0

  if (critical > 0) return "critical"
  if (high > 0) return "high"
  if (medium > 0) return "medium"
  if (low > 0) return "low"
  return "safe"
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

const getActionItems = (summary: ScanResult["summary"]) => {
  const verdictKey = getVerdictKey(summary)
  switch (verdictKey) {
    case "critical":
    case "high":
      return [
        "Do not install until verified by a trusted source.",
        "Verify the mod author and download location.",
        "Share this report with the community or moderators.",
      ]
    case "medium":
      return [
        "Review the findings and evidence before installing.",
        "Check for updates or explanations from the author.",
        "Consider running a second scan after updates.",
      ]
    case "low":
      return [
        "Review the findings; they may be benign.",
        "Keep the mod updated and scan again after changes.",
      ]
    default:
      return [
        "No action needed. Keep your scanner up to date.",
        "Scan again if the mod updates.",
      ]
  }
}

const ScanReport = ({ result, onReset }: ScanReportProps) => {
  const verdictKey = getVerdictKey(result.summary)
  const verdict = verdictPresets[verdictKey]
  const VerdictIcon = verdict.icon

  const sortedFindings = useMemo(
    () =>
      [...result.findings].sort((a, b) => {
        const order = severityOrder[b.severity] - severityOrder[a.severity]
        return order !== 0 ? order : a.description.localeCompare(b.description)
      }),
    [result.findings]
  )

  const [activeSeverity, setActiveSeverity] = useState<Severity | "All">("All")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const filteredFindings = useMemo(() => {
    if (activeSeverity === "All") return sortedFindings
    return sortedFindings.filter((finding) => finding.severity === activeSeverity)
  }, [activeSeverity, sortedFindings])

  const effectiveSelectedKey = useMemo(() => {
    if (filteredFindings.length === 0) return null

    const keys = filteredFindings.map((finding, idx) => getFindingKey(finding, idx))
    if (selectedKey && keys.includes(selectedKey)) return selectedKey
    return keys[0]
  }, [filteredFindings, selectedKey])

  const selectedFinding = useMemo(() => {
    if (!effectiveSelectedKey) return null
    return filteredFindings.find((finding, idx) => getFindingKey(finding, idx) === effectiveSelectedKey) ?? null
  }, [filteredFindings, effectiveSelectedKey])

  const topFindings = sortedFindings.slice(0, 3)

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className={cn("h-12 w-12 rounded-lg border flex items-center justify-center shrink-0", verdict.tone)}>
              <VerdictIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-2xl truncate">{verdict.label}</CardTitle>
              <CardDescription className="mt-1 max-w-xl line-clamp-2">{verdict.message}</CardDescription>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono truncate max-w-[200px]">{result.input.fileName}</span>
                <span>|</span>
                <span>{formatBytes(result.input.sizeBytes)}</span>
                <span>|</span>
                <span>Scanned {formatDate(result.metadata.timestamp)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onReset}>
              Scan Another
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Findings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.summary.totalFindings}</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
              <p className="text-sm text-red-600 dark:text-red-400">Critical</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {result.summary.countBySeverity["Critical"] || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <p className="text-sm text-orange-600 dark:text-orange-400">High</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {result.summary.countBySeverity["High"] || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Medium</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {result.summary.countBySeverity["Medium"] || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="min-w-0">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <CardTitle>What it means</CardTitle>
                <CardDescription>Key behaviors detected in this mod.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.findings.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground border border-dashed rounded-lg bg-emerald-500/5 border-emerald-500/20">
                <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-3" />
                <p className="font-medium text-foreground">No threats detected.</p>
                <p className="text-sm">This file did not match any suspicious rules.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {topFindings.map((finding, index) => (
                  <li key={getFindingKey(finding, index)} className="flex items-start gap-3 min-w-0">
                    <div className={cn("mt-1 h-2.5 w-2.5 rounded-full shrink-0", getSeverityBadgeColor(finding.severity))} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground break-words">{getFindingSummary(finding)}</p>
                      <p className="text-xs text-muted-foreground truncate" title={finding.location}>{finding.location}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
              <h4 className="text-sm font-semibold text-foreground">Recommended actions</h4>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {getActionItems(result.summary).map((item) => (
                  <li key={item} className="break-words">{item}</li>
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
              <span className="text-muted-foreground shrink-0">File name</span>
              <span className="font-mono text-xs truncate max-w-[70%]">{result.input.fileName}</span>
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
            {result.input.sha256Hash && (
              <div className="rounded-md border border-border/50 bg-muted/20 p-3 min-w-0">
                <p className="text-xs text-muted-foreground">SHA256</p>
                <p className="font-mono text-xs break-all text-foreground mt-1">{result.input.sha256Hash}</p>
              </div>
            )}
            <div className="rounded-md border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
              Static analysis can miss runtime behavior. Treat this report as guidance, not a guarantee.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] min-w-0">
        <Card className="min-h-[520px] min-w-0 overflow-hidden flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <CardTitle>Findings</CardTitle>
                <CardDescription>Browse and filter the detected behaviors.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
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
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {filteredFindings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-center text-muted-foreground">
                No findings match this filter.
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
                          "w-full text-left rounded-lg border p-3 transition-colors min-w-0 overflow-hidden",
                          isSelected
                            ? "border-teal-400/60 bg-emerald-950/30"
                            : "border-border/60 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <Badge
                            className={cn(
                              "border border-border/40 shrink-0 mt-0.5",
                              getSeverityBadgeColor(finding.severity)
                            )}
                          >
                            {finding.severity}
                          </Badge>
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm font-semibold text-foreground break-all leading-snug whitespace-normal"
                              title={finding.description}
                            >
                              {finding.description}
                            </p>
                            <p
                              className="mt-1 text-xs text-muted-foreground font-mono break-all whitespace-normal"
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

        <Card className="min-h-[520px] min-w-0 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Evidence</CardTitle>
            <CardDescription>Review the call path and data flow for the selected finding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-w-0 flex-1 overflow-y-auto">
            {!selectedFinding ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-center text-muted-foreground">
                Select a finding to view evidence.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg border border-border/50 bg-muted/20 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-4 min-w-0">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-start gap-2 min-w-0">
                        <Badge className={cn("border border-border/40 shrink-0 mt-0.5", getSeverityBadgeColor(selectedFinding.severity))}>
                          {selectedFinding.severity}
                        </Badge>
                        <p
                          className="text-sm font-semibold text-foreground break-all leading-snug whitespace-normal min-w-0"
                          title={selectedFinding.description}
                        >
                          {selectedFinding.description}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono break-all whitespace-normal opacity-80" title={selectedFinding.location}>
                        {selectedFinding.location}
                      </p>
                    </div>
                    <FileCode className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </div>

                {selectedFinding.codeSnippet && !selectedFinding.callChain && !selectedFinding.dataFlowChain && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detected pattern</h5>
                    <pre className="p-3 rounded-md bg-muted/50 border border-border/50 text-xs font-mono overflow-x-auto text-foreground">
                      <code>{selectedFinding.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {selectedFinding.callChain && (
                  <div className="space-y-2 min-w-0">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-teal-300">Deep IL: Execution path</h5>
                    <div className="overflow-hidden rounded-md border border-border/40">
                      <CallChainViewer chain={selectedFinding.callChain} className="bg-background/50" />
                    </div>
                  </div>
                )}

                {selectedFinding.dataFlowChain && (
                  <div className="space-y-2 min-w-0">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Deep IL: Data flow</h5>
                    <div className="overflow-hidden rounded-md border border-border/40">
                      <DataFlowViewer chain={selectedFinding.dataFlowChain} className="bg-background/50" />
                    </div>
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
