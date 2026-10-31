import { useState, type ReactNode } from "react"
import type { Finding } from "@/types/mlvscan"
import { formatIndicator, getTargetDisplay } from "@/lib/finding-groups"

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-slate-200">{children}</dd>
    </>
  )
}

export function FindingDetail({ finding }: { finding: Finding }) {
  const [showRaw, setShowRaw] = useState(false)
  const attributes = finding.attributes
  const target = getTargetDisplay(attributes)
  const indicators = attributes?.indicators ?? []
  const dataFlow = finding.dataFlowChain
  const callChain = finding.callChain

  return (
    <div className="border-l border-slate-700/80 py-0.5 pl-3.5">
      <dl className="grid grid-cols-[84px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs leading-5">
        {target && (
          <DetailRow label="Target">
            <span className="font-mono">{target}</span>
          </DetailRow>
        )}
        {attributes?.arguments && (
          <DetailRow label="Arguments">
            <span className="font-mono">{attributes.arguments}</span>
          </DetailRow>
        )}
        {indicators.length > 0 && <DetailRow label="Flags">{indicators.map(formatIndicator).join(", ")}</DetailRow>}
        {dataFlow && dataFlow.nodes.length > 0 && (
          <DetailRow label="Data flow">
            <span className="font-mono">
              {dataFlow.nodes.map((node, index) => (
                <span key={`${node.location}-${index}`}>
                  {index > 0 && <span className="px-1.5 text-slate-500">→</span>}
                  {node.operation}
                </span>
              ))}
            </span>
          </DetailRow>
        )}
        {callChain && callChain.nodes.length > 0 && (
          <DetailRow label="Call path">
            <span className="font-mono">
              {callChain.nodes.map((node, index) => (
                <span key={`${node.location}-${index}`}>
                  {index > 0 && <span className="px-1.5 text-slate-500">→</span>}
                  {node.location}
                </span>
              ))}
            </span>
          </DetailRow>
        )}
        <DetailRow label="Location">
          <span className="font-mono text-slate-300">{finding.location}</span>
        </DetailRow>
        {finding.ruleId && (
          <DetailRow label="Rule">
            <span className="font-mono text-slate-400">{finding.ruleId}</span>
          </DetailRow>
        )}
      </dl>

      {finding.visibility === "Advanced" && (
        <p className="mt-2 text-xs text-amber-200/80">Advanced diagnostic. It was not used for the verdict.</p>
      )}

      <button
        type="button"
        aria-expanded={showRaw}
        onClick={() => setShowRaw((value) => !value)}
        className="mt-2.5 text-xs text-teal-300 hover:text-teal-200"
      >
        {showRaw ? "Hide full message" : "Show full message and IL"}
      </button>

      {showRaw && (
        <div className="mt-2 space-y-2">
          <p className="max-w-3xl break-words text-xs leading-5 text-slate-400">{finding.description}</p>
          {finding.codeSnippet && (
            <pre className="overflow-x-auto border border-slate-800/80 bg-slate-950/60 p-3 font-mono text-[11px] leading-5 text-slate-300">
              <code>{finding.codeSnippet}</code>
            </pre>
          )}
          {dataFlow && dataFlow.nodes.length > 0 && (
            <ol className="border-t border-slate-800/80 text-[11px]">
              {dataFlow.nodes.map((node, index) => (
                <li
                  key={`${node.location}-${index}`}
                  className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b border-slate-800/80 py-1.5"
                >
                  <span className="uppercase tracking-[0.12em] text-slate-500">{node.nodeType}</span>
                  <span className="min-w-0 break-words">
                    <span className="font-mono text-slate-200">{node.operation}</span>
                    <span className="text-slate-500"> · {node.dataDescription} · </span>
                    <span className="font-mono text-slate-500">{node.location}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
