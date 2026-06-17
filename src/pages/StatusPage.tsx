import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Cloud,
  Database,
  HardDrive,
  Network,
  RefreshCw,
  Server,
} from "lucide-react"
import Seo from "@/components/seo/Seo"
import { Button } from "@/components/ui/button"
import { resolvePublicApiBaseUrl } from "@/lib/public-api-base-url"
import { cn } from "@/lib/utils"
import { getStatusSeoPage } from "@/seo/routes"

type ComponentState = "checking" | "operational" | "degraded" | "outage" | "unknown"
type ComponentCategory = "edge" | "storage" | "queue" | "scanner" | "observability"

type StatusComponent = {
  id: string
  name: string
  category: ComponentCategory
  status: ComponentState
  detail: string
  latencyMs: number | null
}

type StatusResponse = {
  status: Exclude<ComponentState, "checking">
  environment: string
  timestamp: string
  summary: Record<Exclude<ComponentState, "checking">, number>
  components: StatusComponent[]
}

type StatusSnapshot = {
  checkedAt: Date
  status: ComponentState
  environment: string
  components: StatusComponent[]
}

const REFRESH_INTERVAL_MS = 30_000
const CHECK_TIMEOUT_MS = 8_000

const statusLabels: Record<ComponentState, string> = {
  checking: "Checking",
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  unknown: "Unknown",
}

const categoryLabels: Record<ComponentCategory, string> = {
  edge: "Edge",
  storage: "Storage",
  queue: "Queues",
  scanner: "Scanner",
  observability: "Observability",
}

const pendingComponents: StatusComponent[] = [
  {
    id: "public-web",
    name: "Public website",
    category: "edge",
    status: "operational",
    detail: "This page rendered from MLVScan.Web.",
    latencyMs: null,
  },
  {
    id: "api-status",
    name: "API status endpoint",
    category: "edge",
    status: "checking",
    detail: "Checking /status.",
    latencyMs: null,
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isComponentState(value: unknown): value is Exclude<ComponentState, "checking"> {
  return value === "operational" || value === "degraded" || value === "outage" || value === "unknown"
}

function isComponentCategory(value: unknown): value is ComponentCategory {
  return value === "edge" || value === "storage" || value === "queue" || value === "scanner" || value === "observability"
}

function parseStatusResponse(value: unknown): StatusResponse | null {
  if (!isRecord(value) || !isComponentState(value.status) || typeof value.timestamp !== "string") {
    return null
  }

  if (!Array.isArray(value.components)) {
    return null
  }

  const components = value.components.flatMap((component): StatusComponent[] => {
    if (!isRecord(component)) {
      return []
    }

    if (
      typeof component.id !== "string" ||
      typeof component.name !== "string" ||
      !isComponentCategory(component.category) ||
      !isComponentState(component.status) ||
      typeof component.detail !== "string" ||
      !(component.latencyMs === null || typeof component.latencyMs === "number")
    ) {
      return []
    }

    return [{
      id: component.id,
      name: component.name,
      category: component.category,
      status: component.status,
      detail: component.detail,
      latencyMs: component.latencyMs,
    }]
  })

  return {
    status: value.status,
    environment: typeof value.environment === "string" ? value.environment : "unknown",
    timestamp: value.timestamp,
    summary: isRecord(value.summary)
      ? {
          operational: typeof value.summary.operational === "number" ? value.summary.operational : 0,
          degraded: typeof value.summary.degraded === "number" ? value.summary.degraded : 0,
          outage: typeof value.summary.outage === "number" ? value.summary.outage : 0,
          unknown: typeof value.summary.unknown === "number" ? value.summary.unknown : 0,
        }
      : { operational: 0, degraded: 0, outage: 0, unknown: 0 },
    components,
  }
}

async function fetchStatus(apiBaseUrl: string): Promise<StatusSnapshot> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)
  const start = performance.now()

  try {
    const response = await fetch(`${apiBaseUrl}/status`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    })
    const latencyMs = Math.round(performance.now() - start)
    const body = parseStatusResponse(await response.json())

    if (!response.ok || body === null) {
      return buildErrorSnapshot(response.ok ? "Status response was missing expected fields." : `Status endpoint returned HTTP ${response.status}.`, latencyMs)
    }

    return {
      checkedAt: new Date(body.timestamp),
      status: body.status,
      environment: body.environment,
      components: [
        pendingComponents[0],
        {
          id: "api-status",
          name: "API status endpoint",
          category: "edge",
          status: "operational",
          detail: "Status endpoint returned component-level telemetry.",
          latencyMs,
        },
        ...body.components,
      ],
    }
  } catch (error) {
    return buildErrorSnapshot(error instanceof Error ? error.message : "Status request failed.", null)
  } finally {
    window.clearTimeout(timeout)
  }
}

function buildErrorSnapshot(detail: string, latencyMs: number | null): StatusSnapshot {
  return {
    checkedAt: new Date(),
    status: "outage",
    environment: "unknown",
    components: [
      pendingComponents[0],
      {
        id: "api-status",
        name: "API status endpoint",
        category: "edge",
        status: "outage",
        detail,
        latencyMs,
      },
    ],
  }
}

function StatusIcon({ status, className }: { status: ComponentState; className?: string }) {
  switch (status) {
    case "operational":
      return <CheckCircle2 className={className} />
    case "degraded":
    case "outage":
      return <AlertTriangle className={className} />
    case "checking":
      return <RefreshCw className={className} />
    default:
      return <CircleHelp className={className} />
  }
}

function CategoryIcon({ category, className }: { category: ComponentCategory; className?: string }) {
  switch (category) {
    case "edge":
      return <Server className={className} />
    case "storage":
      return <Database className={className} />
    case "queue":
      return <Network className={className} />
    case "scanner":
      return <HardDrive className={className} />
    default:
      return <Cloud className={className} />
  }
}

function statusTone(status: ComponentState): string {
  switch (status) {
    case "operational":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
    case "degraded":
      return "border-amber-500/45 bg-amber-500/10 text-amber-200"
    case "outage":
      return "border-rose-500/45 bg-rose-500/10 text-rose-200"
    case "checking":
      return "border-sky-500/45 bg-sky-500/10 text-sky-200"
    default:
      return "border-slate-600 bg-slate-800/80 text-slate-300"
  }
}

function groupedComponents(components: StatusComponent[]): Array<[ComponentCategory, StatusComponent[]]> {
  const groups = new Map<ComponentCategory, StatusComponent[]>()

  for (const component of components) {
    groups.set(component.category, [...(groups.get(component.category) ?? []), component])
  }

  return (["edge", "storage", "queue", "scanner", "observability"] as ComponentCategory[])
    .map((category) => [category, groups.get(category) ?? []] as [ComponentCategory, StatusComponent[]])
    .filter(([, group]) => group.length > 0)
}

function countLiveComponents(components: StatusComponent[]): { operational: number; total: number } {
  const live = components.filter((component) => component.status !== "unknown")
  return {
    operational: live.filter((component) => component.status === "operational").length,
    total: live.length,
  }
}

export default function StatusPage() {
  const apiBaseUrl = useMemo(
    () => resolvePublicApiBaseUrl({ configuredBaseUrl: import.meta.env.VITE_PUBLIC_API_BASE_URL }),
    [],
  )
  const [snapshot, setSnapshot] = useState<StatusSnapshot>(() => ({
    checkedAt: new Date(),
    status: "checking",
    environment: "checking",
    components: pendingComponents,
  }))
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    setSnapshot((current) => ({
      ...current,
      status: "checking",
      components: current.components.map((component) =>
        component.id === "api-status"
          ? { ...component, status: "checking", detail: "Checking /status.", latencyMs: null }
          : component,
      ),
    }))
    setSnapshot(await fetchStatus(apiBaseUrl))
    setIsRefreshing(false)
  }, [apiBaseUrl])

  useEffect(() => {
    let cancelled = false

    void fetchStatus(apiBaseUrl).then((nextSnapshot) => {
      if (!cancelled) {
        setSnapshot(nextSnapshot)
      }
    })

    const intervalId = window.setInterval(() => {
      void refresh()
    }, REFRESH_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [apiBaseUrl, refresh])

  const liveCount = countLiveComponents(snapshot.components)
  const checkedAtLabel = snapshot.checkedAt.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  })
  return (
    <>
      <Seo page={getStatusSeoPage()} />
      <div className="relative z-10 pt-24">
        <section className="container mx-auto px-4 pb-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-7 border-b border-slate-800 pb-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    System status
                  </div>
                  <h1 className="font-display text-3xl font-semibold leading-tight text-white md:text-4xl">
                    MLVScan service status
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Component-level status for the public web app, API Worker, storage, queues,
                    and the Azure WASM scanner service used for hosted analysis.
                  </p>
                </div>

                <Button
                  className="h-10 w-full rounded-sm border border-slate-700 bg-slate-900 px-4 text-slate-100 hover:bg-slate-800 md:w-auto"
                  type="button"
                  onClick={() => void refresh()}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} data-icon="inline-start" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-4">
              <div className={cn("border p-4", statusTone(snapshot.status))}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <StatusIcon status={snapshot.status} className={cn("h-4 w-4", snapshot.status === "checking" && "animate-spin")} />
                  Overall
                </div>
                <div className="mt-2 text-xl font-semibold">{statusLabels[snapshot.status]}</div>
              </div>
              <div className="border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Live components</div>
                <div className="mt-2 text-xl font-semibold text-white">
                  {liveCount.operational}/{liveCount.total}
                </div>
              </div>
              <div className="border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Environment</div>
                <div className="mt-2 text-xl font-semibold text-white">{snapshot.environment}</div>
              </div>
              <div className="border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Last checked</div>
                <div className="mt-2 text-xl font-semibold text-white">{checkedAtLabel}</div>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-950/70">
              {groupedComponents(snapshot.components).map(([category, components]) => {
                return (
                  <section key={category} className="border-b border-slate-800 last:border-b-0">
                    <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
                      <CategoryIcon category={category} className="h-4 w-4 text-teal-300" />
                      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
                        {categoryLabels[category]}
                      </h2>
                    </div>

                    <div className="divide-y divide-slate-800">
                      {components.map((component) => {
                        return (
                          <div
                            key={component.id}
                            className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(14rem,1fr)_9rem_7rem_minmax(18rem,1.4fr)] md:items-start"
                          >
                            <div>
                              <div className="font-medium text-white">{component.name}</div>
                              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-600">
                                {component.id}
                              </div>
                            </div>

                            <div>
                              <span className={cn("inline-flex items-center gap-2 border px-2 py-1 text-xs font-medium", statusTone(component.status))}>
                                <StatusIcon status={component.status} className={cn("h-3.5 w-3.5", component.status === "checking" && "animate-spin")} />
                                {statusLabels[component.status]}
                              </span>
                            </div>

                            <div className="text-sm text-slate-300">
                              {component.latencyMs === null ? "n/a" : `${component.latencyMs} ms`}
                            </div>

                            <div className="text-sm leading-6 text-slate-300">{component.detail}</div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
