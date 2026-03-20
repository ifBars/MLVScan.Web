import type {
  Finding,
  FindingVisibility,
  ScanResult,
  ThreatDispositionClassification,
} from "@/types/mlvscan"

const hasVisibilityMetadata = (result: ScanResult): boolean => {
  return result.findings.some(finding => finding.visibility != null)
}

export const getResultClassification = (result: ScanResult): ThreatDispositionClassification => {
  if (result.disposition?.classification) {
    return result.disposition.classification
  }

  if ((result.threatFamilies?.length ?? 0) > 0) {
    return "KnownThreat"
  }

  return result.summary.totalFindings > 0 ? "Suspicious" : "Clean"
}

export const getDefaultFindings = (result: ScanResult): Finding[] => {
  if (!hasVisibilityMetadata(result)) {
    return result.findings
  }

  return result.findings.filter((finding) => finding.visibility !== "Advanced")
}

export const getAdvancedFindings = (result: ScanResult): Finding[] => {
  return result.findings.filter((finding) => finding.visibility === "Advanced")
}

export const getDisplayedFindings = (result: ScanResult, includeAdvanced: boolean): Finding[] => {
  return includeAdvanced ? result.findings : getDefaultFindings(result)
}

export const getActionItems = (result: ScanResult): string[] => {
  const classification = getResultClassification(result)

  switch (classification) {
    case "KnownThreat":
      return [
        "Do not install or run this mod.",
        "If it already ran, review the affected system for compromise.",
        "Share this report with moderators or trusted community maintainers.",
      ]
    case "Suspicious":
      return [
        "Treat this mod cautiously and review the retained findings before installing.",
        "This may be a false positive, so confirm the source and author before assuming infection.",
        "Rescan after updates or after obtaining a trusted copy.",
      ]
    case "Clean":
    default:
      return [
        "No action is recommended from this scan result alone.",
        "Rescan if the mod updates or you receive a different file from another source.",
      ]
  }
}

export const getFindingVisibility = (finding: Finding): FindingVisibility => {
  return finding.visibility === "Advanced" ? "Advanced" : "Default"
}
