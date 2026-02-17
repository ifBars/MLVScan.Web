import { useState } from "react"
import { ArrowRight, Globe, HardDrive, Key, FileCode, ChevronDown, ChevronRight, Lock } from "lucide-react"
import type { DataFlowChain, DataFlowNode } from "@/types/mlvscan"
import { cn } from "@/lib/utils"

interface DataFlowViewerProps {
    chain: DataFlowChain
    className?: string
}

const DataFlowViewer = ({ chain, className }: DataFlowViewerProps) => {
    return (
        <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
            <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                        Data Flow Analysis
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            {chain.pattern}
                        </span>
                    </h3>
                    <span className="text-xs text-muted-foreground">
                        Confidence: {(chain.confidence * 100).toFixed(0)}%
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">{chain.description}</p>
            </div>
            <div className="p-4 overflow-x-auto">
                <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 min-w-max">
                    {chain.nodes.map((node, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-center">
                            <DataFlowNodeItem node={node} />
                            {index < chain.nodes.length - 1 && (
                                <div className="flex flex-col items-center justify-center mx-2 my-2 md:my-0 text-muted-foreground">
                                    <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const DataFlowNodeItem = ({ node }: { node: DataFlowNode }) => {
    const [isOpen, setIsOpen] = useState(false)

    const getIcon = () => {
        if (node.operation.toLowerCase().includes("http") || node.operation.toLowerCase().includes("web")) return <Globe className="w-4 h-4" />
        if (node.operation.toLowerCase().includes("file") || node.operation.toLowerCase().includes("write")) return <HardDrive className="w-4 h-4" />
        if (node.operation.toLowerCase().includes("key") || node.operation.toLowerCase().includes("token")) return <Key className="w-4 h-4" />
        if (node.operation.toLowerCase().includes("decode") || node.operation.toLowerCase().includes("decrypt")) return <Lock className="w-4 h-4" />
        return <FileCode className="w-4 h-4" />
    }

    const getTypeStyle = () => {
        switch (node.nodeType) {
            case "Source":
                return "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
            case "Sink":
                return "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300"
            case "Transform":
                return "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300"
            default:
                return "border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-300"
        }
    }

    return (
        <div className={cn("w-64 rounded-lg border p-3 transition-all", getTypeStyle())}>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-background/50 border border-border/10 shadow-sm">
                    {getIcon()}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                    {node.nodeType}
                </span>
            </div>

            <div className="mb-2">
                <p className="font-mono text-xs font-medium break-all line-clamp-2" title={node.operation}>
                    {node.operation}
                </p>
                <p className="text-xs opacity-70 mt-1 line-clamp-2" title={node.dataDescription}>
                    {node.dataDescription}
                </p>
            </div>

            {node.codeSnippet && (
                <div className="mt-2 pt-2 border-t border-border/10">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center justify-between text-xs hover:bg-background/20 p-1 rounded transition-colors"
                    >
                        <span>View Code</span>
                        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>

                    {isOpen && (
                        <div className="mt-2 bg-background/50 rounded p-2 text-[10px] font-mono overflow-x-auto border border-border/10">
                            {node.codeSnippet}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DataFlowViewer
