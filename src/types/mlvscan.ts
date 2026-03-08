// Re-export types from the package
import type {
  ScanResult as BaseScanResult,
  ScanMetadata,
  ScanInput,
  ScanSummary,
  Severity,
  Finding,
  CallChain,
  CallChainNodeType,
  CallChainNode,
  DataFlowChain,
  DataFlowPattern,
  DataFlowNodeType,
  DataFlowNode,
  DeveloperGuidance
} from '@mlvscan/wasm-core'

export type {
  ScanMetadata,
  ScanInput,
  ScanSummary,
  Severity,
  Finding,
  CallChain,
  CallChainNodeType,
  CallChainNode,
  DataFlowChain,
  DataFlowPattern,
  DataFlowNodeType,
  DataFlowNode,
  DeveloperGuidance
}

export type ThreatMatchKind = 'ExactSampleHash' | 'BehaviorVariant'

export type ThreatFamilyEvidence = {
  kind: string
  value: string
}

export type ThreatFamily = {
  familyId: string
  variantId: string
  displayName: string
  summary: string
  matchKind: ThreatMatchKind
  confidence: number
  exactHashMatch: boolean
  matchedRules: string[]
  advisorySlugs: string[]
  evidence: ThreatFamilyEvidence[]
}

export type ScanResult = BaseScanResult & {
  threatFamilies?: ThreatFamily[]
}

// Local types
export type ScanStatus = "idle" | "uploading" | "scanning" | "complete" | "error"
