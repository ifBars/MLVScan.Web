import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LoaderCircle, SearchX, ShieldQuestion } from "lucide-react"

import {
  fetchLatestSourceReportRedirect,
  parseSourceReportRedirectPath,
  SourceReportNotFoundError,
} from "@/lib/source-report-redirect"

type RedirectState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }

export default function SourceReportRedirectPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const target = useMemo(() => parseSourceReportRedirectPath(location.pathname), [location.pathname])
  const [state, setState] = useState<RedirectState>({ status: "loading" })
  const displayState = target ? state : { status: "unsupported" as const }

  useEffect(() => {
    if (!target) {
      return
    }

    const controller = new AbortController()
    void (async () => {
      try {
        const result = await fetchLatestSourceReportRedirect(target, controller.signal)
        navigate(result.reportPath, { replace: true })
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return
        }

        if (error instanceof SourceReportNotFoundError) {
          setState({ status: "not-found" })
          return
        }

        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to resolve source report",
        })
      }
    })()

    return () => controller.abort()
  }, [target, navigate])

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {displayState.status === "loading" && (
          <StatePanel
            icon={<LoaderCircle className="h-10 w-10 animate-spin text-primary" />}
            eyebrow="Looking up source"
            title="Finding the latest public scan"
            description="MLVScan is checking for a pre-existing source-linked report."
          />
        )}

        {displayState.status === "not-found" && (
          <StatePanel
            icon={<SearchX className="h-10 w-10 text-slate-300" />}
            eyebrow="No report"
            title="No public scan report is linked yet"
            description="This mod or package does not have a source-linked public report in MLVScan yet."
          />
        )}

        {displayState.status === "unsupported" && (
          <StatePanel
            icon={<ShieldQuestion className="h-10 w-10 text-slate-300" />}
            eyebrow="Unsupported source"
            title="This source URL is not supported"
            description="MLVScan can currently resolve Nexus Mods mod pages and Thunderstore package pages."
          />
        )}

        {displayState.status === "error" && (
          <StatePanel
            icon={<ShieldQuestion className="h-10 w-10 text-amber-300" />}
            eyebrow="Lookup error"
            title="The source report could not be resolved"
            description={displayState.message}
          />
        )}
      </div>
    </div>
  )
}

function StatePanel({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-slate-800 bg-slate-950/70 p-8 text-center shadow-2xl shadow-black/20">
      <div className="mx-auto flex size-16 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
        {icon}
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl text-white">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/scan"
          className="inline-flex min-h-9 items-center rounded-md border border-slate-700 bg-slate-900 px-4 text-sm font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
        >
          Scan a file
        </Link>
      </div>
    </section>
  )
}
