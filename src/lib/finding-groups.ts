import type {
  Finding,
  FindingAttributes,
  FindingTargetKind,
  ScanResult,
  Severity,
  ThreatFamily,
} from "@/types/mlvscan"
import { patternLabelMap } from "@/components/results/threat-family-match-utils"

export const severityRank: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

const hiddenLaunchIndicators = new Set(["WindowStyle=Hidden", "CreateNoWindow=true"])

const indicatorLabels: Record<string, string> = {
  "WindowStyle=Hidden": "Hidden window",
  "CreateNoWindow=true": "No console window",
  "UseShellExecute=true": "Shell execute",
  "WorkingDirectory=Temp": "Runs from a temp folder",
}

const processTitles: Record<FindingTargetKind, string> = {
  Executable: "Launches a program",
  Script: "Runs a script or shell",
  Url: "Opens web links",
  Path: "Opens local files or folders",
  Unresolved: "Launches a target built at runtime",
}

const hiddenProcessTitles: Partial<Record<FindingTargetKind, string>> = {
  Executable: "Launches a hidden program",
  Script: "Runs a hidden script or shell",
  Unresolved: "Launches a hidden runtime-built target",
}

const ruleTitles: Record<string, string> = {
  AssemblyDynamicLoadRule: "Loads assemblies at runtime",
  Base64Rule: "Decodes Base64 data",
  ByteArrayManipulationRule: "Rebuilds data from byte arrays",
  COMReflectionAttackRule: "Invokes COM objects through reflection",
  CoordinatedPayloadDeliveryRule: "Coordinates payload delivery",
  DataExfiltrationRule: "Sends data over the network",
  DataInfiltrationRule: "Downloads data from the network",
  DllImportRule: "Calls native Windows APIs",
  EmbeddedArchivePayloadRule: "Carries an embedded archive payload",
  EmbeddedResourceScriptRule: "Carries an embedded script",
  EncodedBlobSplittingRule: "Splits and reassembles encoded data",
  EncodedStringLiteralRule: "Builds strings from numeric codes",
  EncodedStringPipelineRule: "Decodes strings at runtime",
  HexStringRule: "Contains hex-encoded strings",
  ObfuscatedReflectiveExecutionRule: "Executes code through obfuscated reflection",
  PersistenceRule: "Writes programs to a startup location",
  ProcessStartRule: "Launches external processes",
  ReflectionRule: "Invokes methods through reflection",
  RegistryRule: "Changes the Windows registry",
  SuspiciousAssemblyNameRule: "Uses a suspicious assembly name",
  SuspiciousLocalVariableRule: "Uses types common in malicious code",
  ValueResolutionBudget: "Analysis limit reached",
}

export interface FindingGroup {
  key: string
  title: string
  summary: string
  summaryIsCode: boolean
  severity: Severity
  findings: Finding[]
  usedInVerdict: boolean
}

const getFindingKey = (finding: Finding, index: number) => finding.id ?? `finding-${index}`

const humanizeRuleId = (ruleId: string) =>
  ruleId
    .replace(/Rule$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase())

const firstSentence = (text: string) => {
  const trimmed = text.trim()
  const end = trimmed.search(/\.(\s|$)/)
  return end > 0 ? trimmed.slice(0, end) : trimmed
}

export const isHiddenLaunch = (attributes?: FindingAttributes | null) =>
  Boolean(attributes?.indicators?.some((indicator) => hiddenLaunchIndicators.has(indicator)))

export const formatIndicator = (indicator: string) => indicatorLabels[indicator] ?? indicator

const stripPlaceholders = (value: string) => value.replace(/<[^>]*>/g, "…").replace(/…+/g, "…")

/**
 * Returns a short, human-readable version of a finding target.
 */
export const getTargetDisplay = (attributes?: FindingAttributes | null): string | null => {
  if (!attributes?.target) {
    return null
  }

  const candidates = attributes.targetCandidates ?? []
  if (candidates.length > 0) {
    return candidates.map((candidate) => stripPlaceholders(candidate)).join(" or ")
  }

  if (attributes.targetKind === "Unresolved") {
    return null
  }

  return stripPlaceholders(attributes.target)
}

/**
 * Finding IDs that directly back a threat family match.
 *
 * Results from Core 1.9.2 and later carry `relatedFindingIds` on each family. Older payloads fall
 * back to matching family evidence by rule and location, or by attached call-chain and data-flow IDs.
 */
export const getFamilyFindingIds = (family: ThreatFamily, findings: Finding[]): string[] => {
  if (family.relatedFindingIds && family.relatedFindingIds.length > 0) {
    return family.relatedFindingIds
  }

  const ruleLocations = new Set(
    family.evidence
      .filter((evidence) => evidence.ruleId && evidence.location)
      .map((evidence) => `${evidence.ruleId}@${evidence.location}`)
  )
  const dataFlowIds = new Set(family.evidence.map((evidence) => evidence.dataFlowChainId).filter(Boolean))
  const callChainIds = new Set(family.evidence.map((evidence) => evidence.callChainId).filter(Boolean))

  return findings
    .filter(
      (finding) =>
        ruleLocations.has(`${finding.ruleId}@${finding.location}`) ||
        (finding.dataFlowChainId != null && dataFlowIds.has(finding.dataFlowChainId)) ||
        (finding.callChainId != null && callChainIds.has(finding.callChainId))
    )
    .map((finding) => finding.id)
    .filter((id): id is string => Boolean(id))
}

/**
 * Findings that directly drive the verdict.
 *
 * Family matches name their backing findings. Suspicious results have no family, so the
 * disposition's related findings are the verdict evidence. Clean results have none.
 */
export const getVerdictFindingIds = (result: ScanResult): Set<string> => {
  const ids = new Set<string>()
  for (const family of result.threatFamilies ?? []) {
    for (const id of getFamilyFindingIds(family, result.findings)) {
      ids.add(id)
    }
  }

  if (ids.size === 0 && (result.threatFamilies?.length ?? 0) === 0 && result.disposition?.classification === "Suspicious") {
    for (const id of result.disposition.relatedFindingIds) {
      ids.add(id)
    }
  }

  return ids
}

interface GroupIdentity {
  key: string
  title: string
}

const getGroupIdentity = (finding: Finding): GroupIdentity => {
  const ruleId = finding.ruleId ?? "unknown"
  const attributes = finding.attributes

  if (ruleId === "ProcessStartRule" && attributes?.targetKind) {
    const hidden = isHiddenLaunch(attributes)
    const title = (hidden ? hiddenProcessTitles[attributes.targetKind] : undefined) ?? processTitles[attributes.targetKind]
    return { key: `process:${attributes.targetKind}:${hidden ? "hidden" : "visible"}`, title }
  }

  const pattern = finding.dataFlowChain?.pattern
  if (ruleId === "DataFlowAnalysis" && pattern) {
    return { key: `dataflow:${pattern}`, title: patternLabelMap[pattern] ?? humanizeRuleId(pattern) }
  }

  const title = ruleTitles[ruleId] ?? (finding.ruleId ? humanizeRuleId(ruleId) : firstSentence(finding.description))
  return { key: `rule:${ruleId}`, title }
}

const summarizeTargets = (findings: Finding[]): string | null => {
  const counts = new Map<string, number>()
  for (const finding of findings) {
    const target = getTargetDisplay(finding.attributes)
    if (target) {
      counts.set(target, (counts.get(target) ?? 0) + 1)
    }
  }

  if (counts.size === 0) {
    return null
  }

  const ordered = [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
  const visible = ordered.slice(0, 3).map(([target, count]) => (count > 1 ? `${target} ×${count}` : target))
  const remaining = ordered.length - visible.length
  return remaining > 0 ? `${visible.join(", ")}, +${remaining}` : visible.join(", ")
}

/**
 * Short method name for display, for example `PluginManager.GetAssembly:38`.
 */
export const getShortLocation = (location: string) => {
  const segments = location.split(".")
  if (segments.length <= 2) {
    return location
  }
  return segments.slice(-2).join(".")
}

const summarizeGroup = (identity: GroupIdentity, findings: Finding[]): Pick<FindingGroup, "summary" | "summaryIsCode"> => {
  const targets = summarizeTargets(findings)
  if (targets) {
    return { summary: targets, summaryIsCode: true }
  }

  if (identity.key.startsWith("process:Unresolved")) {
    return { summary: "Target is built at runtime", summaryIsCode: false }
  }

  const dataFlow = findings.find((finding) => finding.dataFlowChain)?.dataFlowChain
  if (dataFlow && dataFlow.nodes.length > 0) {
    return { summary: dataFlow.nodes.map((node) => node.operation).join(" → "), summaryIsCode: true }
  }

  if (findings.length === 1) {
    return { summary: getShortLocation(findings[0].location), summaryIsCode: true }
  }

  const methods = new Set(findings.map((finding) => getShortLocation(finding.location).split(":")[0]))
  return { summary: `${methods.size} method${methods.size === 1 ? "" : "s"}`, summaryIsCode: false }
}

/**
 * Collapses findings into behavior groups so repeated calls appear once with a count.
 * Findings that back a threat family stay in their own groups and sort first.
 */
export const groupFindings = (findings: Finding[], verdictFindingIds: ReadonlySet<string>): FindingGroup[] => {
  const groups = new Map<string, { identity: GroupIdentity; usedInVerdict: boolean; findings: Finding[] }>()

  findings.forEach((finding, index) => {
    const identity = getGroupIdentity(finding)
    const usedInVerdict = verdictFindingIds.has(getFindingKey(finding, index))
    const key = `${usedInVerdict ? "verdict" : "context"}|${identity.key}`
    const existing = groups.get(key)
    if (existing) {
      existing.findings.push(finding)
    } else {
      groups.set(key, { identity, usedInVerdict, findings: [finding] })
    }
  })

  return [...groups.entries()]
    .map(([key, group]) => {
      const sortedFindings = [...group.findings].sort(
        (left, right) => severityRank[right.severity] - severityRank[left.severity]
      )
      return {
        key,
        title: group.identity.title,
        ...summarizeGroup(group.identity, sortedFindings),
        severity: sortedFindings[0].severity,
        findings: sortedFindings,
        usedInVerdict: group.usedInVerdict,
      }
    })
    .sort(
      (left, right) =>
        Number(right.usedInVerdict) - Number(left.usedInVerdict) ||
        severityRank[right.severity] - severityRank[left.severity] ||
        right.findings.length - left.findings.length ||
        left.title.localeCompare(right.title)
    )
}

const normalizeSearch = (value: string) => value.trim().toLowerCase()

export const findingMatchesSearch = (finding: Finding, query: string) => {
  const needle = normalizeSearch(query)
  if (!needle) {
    return true
  }

  const haystack = [
    finding.description,
    finding.location,
    finding.ruleId,
    finding.attributes?.target,
    ...(finding.attributes?.targetCandidates ?? []),
  ]
  return haystack.some((value) => value?.toLowerCase().includes(needle))
}
