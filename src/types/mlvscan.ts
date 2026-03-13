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
  ScanMode,
  ScanPlatform,
  ScanResult,
  ScanSummary,
  SchemaVersion,
  Severity,
  ThreatFamily,
  ThreatFamilyEvidence,
  ThreatMatchKind,
} from '@mlvscan/schema'

export type ScanStatus = 'idle' | 'uploading' | 'scanning' | 'complete' | 'error'
