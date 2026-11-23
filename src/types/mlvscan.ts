export type {
  CallChain,
  CallChainNode,
  CallChainNodeType,
  DataFlowChain,
  DataFlowNode,
  DataFlowNodeType,
  DataFlowPattern,
  DeveloperGuidance,
  Finding,
  FindingAttributes,
  FindingTargetKind,
  FindingVisibility,
  ScanInput,
  ScanMetadata,
  ScanSummary,
  Severity,
  ThreatDisposition,
  ThreatDispositionClassification,
  ThreatFamily,
  ThreatFamilyEvidence,
  ThreatMatchKind,
} from '@mlvscan/wasm-core'

import type { ScanResult as PublishedResult } from '@mlvscan/wasm-core'

export type ScanStatus = 'idle' | 'uploading' | 'scanning' | 'complete' | 'error'
export type ScanResult = Omit<PublishedResult, 'schemaVersion'> & {
  schemaVersion: '1.4.0' | PublishedResult['schemaVersion']
}
