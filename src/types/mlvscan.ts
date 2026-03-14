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
  ScanInput,
  ScanMetadata,
  ScanResult,
  ScanSummary,
  Severity,
  ThreatFamily,
  ThreatFamilyEvidence,
  ThreatMatchKind,
} from '@mlvscan/wasm-core'

export type ScanStatus = 'idle' | 'uploading' | 'scanning' | 'complete' | 'error'
