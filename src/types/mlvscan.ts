// Re-export types from the package
export type {
  ScanResult,
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

// Local types
export type ScanStatus = "idle" | "uploading" | "scanning" | "complete" | "error"
