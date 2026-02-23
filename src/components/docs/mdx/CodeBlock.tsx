import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface CodeBlockProps {
  children: string
  className?: string
}

export const CodeBlock = ({ children, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-2 rounded bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className={cn('bg-gray-800 rounded-lg p-4 overflow-x-auto', className)}>
        <code className="text-sm text-gray-300 font-mono">{children}</code>
      </pre>
    </div>
  )
}
