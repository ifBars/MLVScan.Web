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
  ThreatFamily,
  ThreatFamilyEvidence,
  ThreatMatchKind,
} from '@mlvscan/wasm-core'

export type ScanStatus = 'idle' | 'uploading' | 'scanning' | 'complete' | 'error'


import type { ScanResult as PublishedResult, ThreatDisposition as PublishedDisposition } from '@mlvscan/wasm-core'

export type ThreatDispositionClassification = PublishedDisposition['classification'] | 'ManualReviewRequired' | 'NotApplicable'
export type ThreatDisposition = Omit<PublishedDisposition, 'classification'> & { classification: ThreatDispositionClassification }
export type ScanResult = Omit<PublishedResult, 'analysisCompleteness' | 'disposition' | 'schemaVersion'> & {
  schemaVersion: '1.4.0' | '1.5.0'
  disposition?: ThreatDisposition | null
  analysisCompleteness: Omit<PublishedResult['analysisCompleteness'], 'status'> & {
    status: PublishedResult['analysisCompleteness']['status'] | 'NotApplicable'
  }
}
