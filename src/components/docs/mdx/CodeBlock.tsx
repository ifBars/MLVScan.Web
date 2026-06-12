import { Check, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type CodeLanguage = 'bash' | 'csharp' | 'ini' | 'json' | 'powershell' | 'text' | 'typescript' | 'xml' | 'yaml'

interface CodeBlockAction {
  href: string
  label: string
}

interface CodeBlockProps {
  children: string
  className?: string
  preClassName?: string
  language?: CodeLanguage
  title?: string
  actions?: CodeBlockAction[]
}

const languageLabels: Record<CodeLanguage, string> = {
  bash: 'Bash',
  csharp: 'C#',
  ini: 'INI',
  json: 'JSON',
  powershell: 'PowerShell',
  text: 'Text',
  typescript: 'TypeScript',
  xml: 'XML',
  yaml: 'YAML',
}

const shellKeywords = new Set([
  'awk',
  'break',
  'cat',
  'continue',
  'curl',
  'do',
  'done',
  'echo',
  'else',
  'exit',
  'fi',
  'for',
  'grep',
  'head',
  'if',
  'in',
  'jq',
  'mv',
  'next',
  'print',
  'run',
  'set',
  'sleep',
  'then',
])

const codeTokenClass = {
  comment: 'text-slate-500',
  expression: 'text-teal-300',
  key: 'text-sky-300',
  keyword: 'text-fuchsia-300',
  number: 'text-amber-300',
  property: 'text-cyan-300',
  punctuation: 'text-slate-500',
  string: 'text-emerald-300',
  variable: 'text-amber-200',
}

const tokenizeInline = (text: string, language: CodeLanguage, keyPrefix: string) => {
  if (!text) return null

  const tokenPattern =
    language === 'bash' || language === 'powershell'
      ? /(\$\{\{[^}]+}}|\$[A-Za-z_][A-Za-z0-9_]*|"[^"]*"|'[^']*'|#[^\n]*|\b[A-Za-z_][A-Za-z0-9_-]*\b|\b\d+\b)/g
      : /(\$\{\{[^}]+}}|"[^"]*"|'[^']*'|#[^\n]*|\btrue\b|\bfalse\b|\bnull\b|\b\d+\b)/g

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let tokenIndex = 0

  for (const match of text.matchAll(tokenPattern)) {
    const token = match[0]
    const index = match.index ?? 0

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index))
    }

    let className = ''
    if (token.startsWith('#')) {
      className = codeTokenClass.comment
    } else if (token.startsWith('${{')) {
      className = codeTokenClass.expression
    } else if (token.startsWith('$')) {
      className = codeTokenClass.variable
    } else if (token.startsWith('"') || token.startsWith("'")) {
      className = codeTokenClass.string
    } else if (/^\d+$/.test(token) || token === 'true' || token === 'false' || token === 'null') {
      className = codeTokenClass.number
    } else if (shellKeywords.has(token)) {
      className = codeTokenClass.keyword
    }

    parts.push(className ? <span key={`${keyPrefix}-${tokenIndex++}`} className={className}>{token}</span> : token)
    lastIndex = index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

const renderHighlightedLine = (line: string, language: CodeLanguage, lineIndex: number) => {
  if (language === 'text') {
    return line
  }

  if (language === 'yaml') {
    const keyMatch = line.match(/^(\s*)([A-Za-z0-9_-]+)(:)(.*)$/)
    if (keyMatch) {
      return (
        <>
          {keyMatch[1]}
          <span className={codeTokenClass.key}>{keyMatch[2]}</span>
          <span className={codeTokenClass.punctuation}>{keyMatch[3]}</span>
          {tokenizeInline(keyMatch[4], language, `line-${lineIndex}`)}
        </>
      )
    }
  }

  if (language === 'ini') {
    const sectionMatch = line.match(/^(\s*)(\[[^\]]+])(\s*)$/)
    if (sectionMatch) {
      return (
        <>
          {sectionMatch[1]}
          <span className={codeTokenClass.keyword}>{sectionMatch[2]}</span>
          {sectionMatch[3]}
        </>
      )
    }

    const keyMatch = line.match(/^(\s*)([A-Za-z0-9_.-]+)(\s*=\s*)(.*)$/)
    if (keyMatch) {
      return (
        <>
          {keyMatch[1]}
          <span className={codeTokenClass.key}>{keyMatch[2]}</span>
          <span className={codeTokenClass.punctuation}>{keyMatch[3]}</span>
          {tokenizeInline(keyMatch[4], language, `line-${lineIndex}`)}
        </>
      )
    }
  }

  if (language === 'xml') {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let tokenIndex = 0

    for (const match of line.matchAll(/(<\/?)([A-Za-z0-9_.:-]+)([^>]*)(\/?>)/g)) {
      const index = match.index ?? 0
      if (index > lastIndex) {
        parts.push(line.slice(lastIndex, index))
      }

      parts.push(
        <span key={`xml-${lineIndex}-${tokenIndex++}`}>
          <span className={codeTokenClass.punctuation}>{match[1]}</span>
          <span className={codeTokenClass.keyword}>{match[2]}</span>
          {tokenizeInline(match[3], language, `line-${lineIndex}-${tokenIndex}`)}
          <span className={codeTokenClass.punctuation}>{match[4]}</span>
        </span>,
      )
      lastIndex = index + match[0].length
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }

    return parts.length > 0 ? parts : line
  }

  if (language === 'json' || language === 'typescript' || language === 'csharp') {
    const propertyMatch = line.match(/^(\s*)("[^"]+"|\w+)(\s*:)(.*)$/)
    if (propertyMatch) {
      return (
        <>
          {propertyMatch[1]}
          <span className={codeTokenClass.property}>{propertyMatch[2]}</span>
          <span className={codeTokenClass.punctuation}>{propertyMatch[3]}</span>
          {tokenizeInline(propertyMatch[4], language, `line-${lineIndex}`)}
        </>
      )
    }
  }

  return tokenizeInline(line, language, `line-${lineIndex}`)
}

export const CodeBlock = ({
  children,
  className,
  preClassName,
  language = 'text',
  title,
  actions = [],
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = children.replace(/\n$/, '').split('\n')

  return (
    <div className={cn(
      'group overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/80 shadow-lg shadow-black/10',
      className,
    )}>
      {(title || language !== 'text' || actions.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            {title && <div className="truncate text-sm font-semibold text-slate-100">{title}</div>}
            {language !== 'text' && (
              <span className="rounded border border-teal-400/20 bg-teal-400/10 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-teal-200">
                {languageLabels[language]}
              </span>
            )}
          </div>
          {actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {actions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-teal-400/60 hover:text-teal-200"
                >
                  {action.label}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="relative">
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={handleCopy}
            className="rounded bg-slate-800/80 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
        <pre className={cn('overflow-x-auto bg-transparent p-4 pr-14', preClassName)}>
        <code className="grid min-w-max font-mono text-sm leading-6 text-slate-300">
          {lines.map((line, lineIndex) => (
            <span key={`${lineIndex}-${line}`} className="block">
              {line === '' ? '\u00A0' : renderHighlightedLine(line, language, lineIndex)}
            </span>
          ))}
        </code>
      </pre>
      </div>
    </div>
  )
}
