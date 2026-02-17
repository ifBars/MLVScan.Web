import { useState } from "react"
import { ChevronDown, ChevronRight, AlertTriangle, Play, CornerDownRight } from "lucide-react"
import type { CallChain, CallChainNode } from "@/types/mlvscan"
import { cn } from "@/lib/utils"

interface CallChainViewerProps {
    chain: CallChain
    className?: string
}

const CallChainViewer = ({ chain, className }: CallChainViewerProps) => {
    return (
        <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
            <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2">
                    Call Chain Analysis
                    {chain.severity === "Critical" || chain.severity === "High" ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            {chain.severity}
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {chain.severity}
                        </span>
                    )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{chain.description}</p>
            </div>
            <div className="p-4 space-y-0">
                {chain.nodes.map((node, index) => (
                    <CallChainNodeItem
                        key={index}
                        node={node}
                        isLast={index === chain.nodes.length - 1}
                    />
                ))}
            </div>
        </div>
    )
}

const CallChainNodeItem = ({ node, isLast }: { node: CallChainNode; isLast: boolean }) => {
    const [isOpen, setIsOpen] = useState(false)

    const getNodeIcon = () => {
        switch (node.nodeType) {
            case "EntryPoint":
                return <Play className="w-4 h-4 text-emerald-500" />
            case "SuspiciousDeclaration":
                return <AlertTriangle className="w-4 h-4 text-red-500" />
            default:
                return <CornerDownRight className="w-4 h-4 text-blue-400" />
        }
    }

    const getNodeColor = () => {
        switch (node.nodeType) {
            case "EntryPoint":
                return "border-emerald-500/50 bg-emerald-500/5"
            case "SuspiciousDeclaration":
                return "border-red-500/50 bg-red-500/5"
            default:
                return "border-border bg-card"
        }
    }

    return (
        <div className="relative pl-6 pb-2">
            {/* Connector Line */}
            {!isLast && (
                <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border" />
            )}

            {/* Node Dot */}
            <div className={cn(
                "absolute left-0 top-3 w-[22px] h-[22px] rounded-full border bg-background flex items-center justify-center z-10",
                node.nodeType === "SuspiciousDeclaration" ? "border-red-500 text-red-500" :
                    node.nodeType === "EntryPoint" ? "border-emerald-500 text-emerald-500" : "border-blue-400 text-blue-400"
            )}>
                {getNodeIcon()}
            </div>

            <div className={cn("rounded-md border p-3 transition-colors", getNodeColor())}>
                <div
                    className="flex items-start justify-between gap-4 cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                                "text-xs font-mono px-1.5 py-0.5 rounded border",
                                node.nodeType === "SuspiciousDeclaration" ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" :
                                    node.nodeType === "EntryPoint" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                                        "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                            )}>
                                {node.nodeType}
                            </span>
                            <span className="font-mono text-sm text-foreground break-all">
                                {node.location.split(':').slice(0, 2).join(':')}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{node.description}</p>
                    </div>
                    {node.codeSnippet && (
                        <button className="text-muted-foreground hover:text-foreground">
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {isOpen && node.codeSnippet && (
                    <div className="mt-3 bg-muted/50 rounded-md p-3 overflow-x-auto border border-border/50">
                        <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                            <code>{node.codeSnippet}</code>
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CallChainViewer
