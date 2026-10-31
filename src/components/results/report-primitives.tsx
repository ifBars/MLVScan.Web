import type { ReactNode } from "react"
import type { Severity } from "@/types/mlvscan"
import { cn } from "@/lib/utils"

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[10.5px] font-medium uppercase tracking-[0.18em] text-slate-500", className)}>
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string
  title: string
  description?: ReactNode
  aside?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  )
}

export function TableHead({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-slate-700/70 bg-slate-900/50 px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500",
        className
      )}
    >
      {children}
    </th>
  )
}

const severitySwatch: Record<Severity, string> = {
  Critical: "bg-red-400",
  High: "bg-orange-400",
  Medium: "bg-amber-300/90",
  Low: "bg-sky-400/80",
}

export function SeverityMark({ severity }: { severity: Severity }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-slate-300">
      <span aria-hidden className={cn("size-[7px] shrink-0", severitySwatch[severity])} />
      {severity}
    </span>
  )
}
