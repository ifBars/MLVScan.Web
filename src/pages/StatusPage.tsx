import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  CalendarDays,
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

type StatusIncident = {
  id: string
  title: string
  status: "investigating" | "identified" | "monitoring" | "resolved" | "scheduled"
  impact: "none" | "minor" | "major" | "critical" | "maintenance"
  affectedComponents: string[]
  summary: string
  updates: Array<{
    id: string
    status: StatusIncident["status"]
    message: string
    createdAt: string
    createdBy: string
  }>
  startedAt: string
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

type StatusResponse = {
  status: Exclude<ComponentState, "checking">
  environment: string
  timestamp: string
  summary: Record<Exclude<ComponentState, "checking">, number>
  components: StatusComponent[]
  incidents: {
    active: StatusIncident[]
    recent: StatusIncident[]
    updatedAt: string | null
  }
}

type StatusSnapshot = {
  checkedAt: Date
  status: ComponentState
  environment: string
  components: StatusComponent[]
  incidents: {
    active: StatusIncident[]
    recent: StatusIncident[]
  }
}

const REFRESH_INTERVAL_MS = 30_000
const CHECK_TIMEOUT_MS = 8_000
const UPTIME_WINDOW_DAYS = 90

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

function parseIncident(value: unknown): StatusIncident | null {
  if (!isRecord(value)) return null
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.status !== "string" ||
    typeof value.impact !== "string" ||
    typeof value.summary !== "string" ||
    typeof value.startedAt !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    !(value.resolvedAt === null || typeof value.resolvedAt === "string") ||
    !Array.isArray(value.affectedComponents)
  ) {
    return null
  }

  const status = value.status
  const impact = value.impact
  if (!["investigating", "identified", "monitoring", "resolved", "scheduled"].includes(status)) return null
  if (!["none", "minor", "major", "critical", "maintenance"].includes(impact)) return null

  return {
    id: value.id,
    title: value.title,
    status: status as StatusIncident["status"],
    impact: impact as StatusIncident["impact"],
    affectedComponents: value.affectedComponents.filter((component): component is string => typeof component === "string"),
    summary: value.summary,
    updates: Array.isArray(value.updates)
      ? value.updates.flatMap((update): StatusIncident["updates"] => {
          if (!isRecord(update) || typeof update.id !== "string" || typeof update.status !== "string" || typeof update.message !== "string" || typeof update.createdAt !== "string" || typeof update.createdBy !== "string") {
            return []
          }
          if (!["investigating", "identified", "monitoring", "resolved", "scheduled"].includes(update.status)) return []
          return [{
            id: update.id,
            status: update.status as StatusIncident["status"],
            message: update.message,
            createdAt: update.createdAt,
            createdBy: update.createdBy,
          }]
        })
      : [],
    startedAt: value.startedAt,
    resolvedAt: value.resolvedAt,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
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
    incidents: isRecord(value.incidents)
      ? {
          active: Array.isArray(value.incidents.active) ? value.incidents.active.flatMap((incident) => parseIncident(incident) ?? []) : [],
          recent: Array.isArray(value.incidents.recent) ? value.incidents.recent.flatMap((incident) => parseIncident(incident) ?? []) : [],
          updatedAt: typeof value.incidents.updatedAt === "string" ? value.incidents.updatedAt : null,
        }
      : { active: [], recent: [], updatedAt: null },
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
      incidents: body.incidents,
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
    incidents: { active: [], recent: [] },
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

function componentSignal(component: StatusComponent): string {
  if (component.latencyMs !== null) {
    return `${component.latencyMs} ms`
  }

  if (component.status === "checking") {
    return "Checking"
  }

  if (component.status === "outage") {
    return "Action needed"
  }

  switch (component.id) {
    case "public-web":
      return "Rendered"
    case "cloudflare-worker":
      return "Request served"
    case "scan-queue":
    case "r2-events-queue":
      return "Binding OK"
    case "azure-wasm-scanner":
      return component.status === "degraded" ? "Mock route" : "Configured"
    default:
      return component.status === "unknown" ? "No signal" : "Healthy"
  }
}

function historyLabel(status: ComponentState): string {
  switch (status) {
    case "operational":
      return "No active incidents"
    case "degraded":
      return "Degraded service"
    case "outage":
      return "Active outage"
    case "checking":
      return "Checking status"
    default:
      return "Status unavailable"
  }
}

function incidentTone(incident: StatusIncident): ComponentState {
  if (incident.status === "resolved" || incident.impact === "none") return "operational"
  if (incident.impact === "major" || incident.impact === "critical") return "outage"
  return "degraded"
}

function incidentTimeLabel(incident: StatusIncident): string {
  const date = new Date(incident.resolvedAt ?? incident.startedAt)
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
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
    incidents: { active: [], recent: [] },
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
                            className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(14rem,1fr)_9rem_8rem_minmax(18rem,1.4fr)] md:items-start"
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

                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 md:hidden">
                                Signal
                              </div>
                              <div className="text-sm text-slate-300">
                                {componentSignal(component)}
                              </div>
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

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="border border-slate-800 bg-slate-950/70">
                <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
                  <Activity className="h-4 w-4 text-teal-300" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Uptime over the past {UPTIME_WINDOW_DAYS} days
                  </h2>
                </div>
                <div className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="text-2xl font-semibold text-white">{historyLabel(snapshot.status)}</div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                        The live status endpoint reports current component health and active incident impact.
                        Per-day availability percentages will appear here after retained daily samples are available.
                      </p>
                    </div>
                    <div className={cn("inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium", statusTone(snapshot.status))}>
                      <StatusIcon status={snapshot.status} className={cn("h-4 w-4", snapshot.status === "checking" && "animate-spin")} />
                      {statusLabels[snapshot.status]}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1" aria-label={`${UPTIME_WINDOW_DAYS}-day availability window`}>
                    {Array.from({ length: UPTIME_WINDOW_DAYS }, (_, index) => {
                      const isCurrent = index === UPTIME_WINDOW_DAYS - 1
                      return (
                        <div
                          key={index}
                          className={cn(
                            "h-6 border border-slate-800 bg-slate-900",
                            isCurrent && snapshot.status === "operational" && "border-emerald-500/50 bg-emerald-500/30",
                            isCurrent && snapshot.status === "degraded" && "border-amber-500/50 bg-amber-500/30",
                            isCurrent && snapshot.status === "outage" && "border-rose-500/50 bg-rose-500/30",
                            isCurrent && snapshot.status === "checking" && "border-sky-500/50 bg-sky-500/30",
                          )}
                          title={isCurrent ? `Today: ${statusLabels[snapshot.status]}` : "Historical sample pending"}
                        />
                      )
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{UPTIME_WINDOW_DAYS} days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </section>

              <section className="border border-slate-800 bg-slate-950/70">
                <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
                  <CalendarDays className="h-4 w-4 text-teal-300" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Recent incidents
                  </h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {[...snapshot.incidents.active, ...snapshot.incidents.recent].slice(0, 6).map((incident) => {
                      const tone = incidentTone(incident)
                      return (
                        <article key={incident.id} className="border border-slate-800 bg-slate-950 p-4">
                          <div className="flex items-start gap-3">
                            <StatusIcon status={tone} className={cn("mt-0.5 h-4 w-4", tone === "operational" ? "text-emerald-300" : tone === "outage" ? "text-rose-300" : "text-amber-300")} />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="font-medium text-white">{incident.title}</div>
                                <span className={cn("border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]", statusTone(tone))}>
                                  {incident.impact}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-slate-300">{incident.summary}</p>
                              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span>{incident.status}</span>
                                <span>{incident.status === "resolved" ? "Resolved" : "Started"} {incidentTimeLabel(incident)}</span>
                                {incident.affectedComponents.length > 0 ? <span>{incident.affectedComponents.join(", ")}</span> : null}
                              </div>
                              {incident.updates[0] ? (
                                <div className="mt-3 border-l border-slate-700 pl-3 text-sm leading-6 text-slate-300">
                                  {incident.updates[0].message}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      )
                    })}
                    {snapshot.incidents.active.length === 0 && snapshot.incidents.recent.length === 0 ? (
                      <div className="border border-slate-800 bg-slate-950 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                          <div>
                            <div className="font-medium text-white">No incidents reported</div>
                            <p className="mt-1 text-sm leading-6 text-slate-300">
                              Current component feed last refreshed {checkedAtLabel}. Future incident and maintenance posts will appear here.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
