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
  FindingVisibility,
  ScanInput,
  ScanMetadata,
  ScanResult,
  ScanSummary,
  Severity,
  ThreatDisposition,
  ThreatDispositionClassification,
  ThreatFamily,
  ThreatFamilyEvidence,
  ThreatMatchKind,
} from '@mlvscan/wasm-core'

export type ScanStatus = 'idle' | 'uploading' | 'scanning' | 'complete' | 'error'
