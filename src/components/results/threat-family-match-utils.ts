import { getThreatFamilyById } from "@/families/registry"
import type { ThreatFamily, ThreatFamilyEvidence, ThreatMatchKind } from "@/types/mlvscan"

const preferredEvidenceKinds = ["pattern", "source", "rule", "download", "execution"] as const

const matchKindRank: Record<ThreatMatchKind, number> = {
  ExactSampleHash: 0,
  BehaviorVariant: 1,
}

export const patternLabelMap: Record<string, string> = {
  DownloadAndExecute: "Downloads and executes code",
  DataExfiltration: "Sends data outside the game",
  DynamicCodeLoading: "Loads code dynamically",
  CredentialTheft: "Attempts to access credentials",
  RemoteConfigLoad: "Loads remote configuration",
  ObfuscatedPersistence: "Attempts persistent behavior",
  EmbeddedResourceDropAndExecute: "Drops an embedded payload and executes it",
}

export const getThreatMatchKindLabel = (matchKind: ThreatMatchKind) =>
  matchKind === "ExactSampleHash" ? "Exact sample hash" : "Behavior match"

export const getThreatFamilyLink = (familyId?: string | null) => {
  const familyMeta = getThreatFamilyById(familyId ?? undefined)

  if (!familyMeta) {
    return null
  }

  return {
    href: `/advisories/families/${familyMeta.slug}`,
    title: familyMeta.title,
    behaviorTags: familyMeta.behaviorTags.slice(0, 3),
  }
}

export const formatThreatFamilyEvidenceKind = (kind: string) =>
  kind
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (character) => character.toUpperCase())

export const getThreatFamilyEvidenceValue = (evidence: ThreatFamilyEvidence) => {
  const normalizedKind = evidence.kind.trim().toLowerCase()

  if (normalizedKind === "pattern") {
    const patternKey = evidence.pattern ?? evidence.value
    return patternLabelMap[patternKey] ?? evidence.value
  }

  return evidence.value
}

export const getThreatFamilyEvidenceMeta = (evidence: ThreatFamilyEvidence): string[] => {
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

export const getThreatFamilyEvidenceDetail = (evidence: ThreatFamilyEvidence): string | null => {
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

export const getMatchedRulePreview = (matchedRules: string[], limit = 3) => ({
  visibleRules: matchedRules.slice(0, limit),
  remainingCount: Math.max(matchedRules.length - limit, 0),
})

const getEvidenceKindPriority = (kind: string) => {
  const normalizedKind = kind.trim().toLowerCase()
  const priority = preferredEvidenceKinds.indexOf(normalizedKind as (typeof preferredEvidenceKinds)[number])

  return priority === -1 ? preferredEvidenceKinds.length : priority
}

export const getThreatFamilyEvidencePreview = (
  evidence: ThreatFamilyEvidence[],
  limit = 2,
): ThreatFamilyEvidence[] => {
  if (limit <= 0 || evidence.length === 0) {
    return []
  }

  return [...evidence]
    .map((item, index) => ({
      item,
      index,
      priority: getEvidenceKindPriority(item.kind),
    }))
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority
      }

      return left.index - right.index
    })
    .slice(0, limit)
    .map(({ item }) => item)
}

export const sortThreatFamilyMatches = (
  matches: ThreatFamily[],
  primaryThreatFamilyId?: string | null,
): ThreatFamily[] =>
  [...matches].sort((left, right) => {
    const leftIsPrimary = left.familyId === primaryThreatFamilyId
    const rightIsPrimary = right.familyId === primaryThreatFamilyId

    if (leftIsPrimary !== rightIsPrimary) {
      return leftIsPrimary ? -1 : 1
    }

    if (left.confidence !== right.confidence) {
      return right.confidence - left.confidence
    }

    if (left.matchKind !== right.matchKind) {
      return matchKindRank[left.matchKind] - matchKindRank[right.matchKind]
    }

    if (left.exactHashMatch !== right.exactHashMatch) {
      return left.exactHashMatch ? -1 : 1
    }

    return left.displayName.localeCompare(right.displayName)
  })
