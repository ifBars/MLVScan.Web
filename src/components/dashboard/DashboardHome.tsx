import {
  ArrowRight,
  CircleAlert,
  Clock3,
  FileCheck2,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAttestationStatusLabel } from "@/lib/attestation-lineage"
import {
  getAttestationTone,
  getAttestationVerdictLabel,
  getSourceBindingLabel,
  shortenHash,
} from "@/lib/attestation-view"
import { getDisplayArtifactVersion } from "@/lib/artifact-version-display"
import { cn, formatDate } from "@/lib/utils"
import type {
  PartnerAttestationSummary,
  PartnerProfile,
  PartnerWorkspaceView,
} from "@/types/partner-dashboard"

const toneClasses = {
  clean: "border-emerald-600/40 bg-emerald-950/50 text-emerald-300",
  suspicious: "border-amber-600/40 bg-amber-950/50 text-amber-300",
  threat: "border-rose-600/40 bg-rose-950/50 text-rose-300",
  revoked: "border-slate-600/40 bg-slate-900/50 text-slate-400",
} as const

interface DashboardHomeProps {
  partner: PartnerProfile
  attestations: PartnerAttestationSummary[]
  publishedCount: number
  draftCount: number
  supersededCount: number
  activeKeyCount: number
  onSelectWorkspace: (value: PartnerWorkspaceView) => void
  onReviewAttestation: (attestation: PartnerAttestationSummary) => void
}

export default function DashboardHome({
  partner,
  attestations,
  publishedCount,
  draftCount,
  supersededCount,
  activeKeyCount,
  onSelectWorkspace,
  onReviewAttestation,
}: DashboardHomeProps) {
  const latestAttestation = attestations[0] ?? null
  const recentAttestations = attestations.slice(0, 4)
  const attentionItems = buildAttentionItems({
    draftCount,
    activeKeyCount,
    maxKeys: partner.maxKeys,
    latestAttestation,
  })

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="dashboard-kicker">Home</p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
            {partner.name}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Watch release health, drafts, and access posture from one overview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => onSelectWorkspace("publish")}>
            <Sparkles data-icon="inline-start" />
            Create draft
          </Button>
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            onClick={() => onSelectWorkspace("attestations")}
          >
            Open ledger
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Current releases" value={`${publishedCount}`} tone="primary" />
        <KpiTile label="Drafts waiting" value={`${draftCount}`} tone={draftCount > 0 ? "attention" : "neutral"} />
        <KpiTile label="Superseded history" value={`${supersededCount}`} tone="neutral" />
        <KpiTile label="Active keys" value={`${activeKeyCount}/${partner.maxKeys}`} tone="neutral" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <RecentRecords
          attestations={recentAttestations}
          onSelectWorkspace={onSelectWorkspace}
          onReviewAttestation={onReviewAttestation}
        />
        <div className="space-y-5">
          <ReleaseHealthCard
            attestation={latestAttestation}
            onReviewAttestation={onReviewAttestation}
            onCreateDraft={() => onSelectWorkspace("publish")}
          />
          <AttentionCard items={attentionItems} onSelectWorkspace={onSelectWorkspace} />
        </div>
      </section>
    </div>
  )
}

function KpiTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "primary" | "attention" | "neutral"
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/45 px-4 py-4">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold text-white",
          tone === "primary" && "text-emerald-200",
          tone === "attention" && "text-primary",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function ReleaseHealthCard({
  attestation,
  onReviewAttestation,
  onCreateDraft,
}: {
  attestation: PartnerAttestationSummary | null
  onReviewAttestation: (attestation: PartnerAttestationSummary) => void
  onCreateDraft: () => void
}) {
  if (!attestation) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/35 p-5">
        <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300">
          No releases yet
        </Badge>
        <h3 className="mt-4 font-display text-2xl leading-tight text-white">
          Create your first attestation
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Upload a DLL or EXE, review the scan result, then publish from the ledger when it is ready.
        </p>
        <Button className="mt-5 w-full justify-between" onClick={onCreateDraft}>
          Create draft
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    )
  }

  const tone = getAttestationTone(attestation.classification, attestation.publicationStatus)
  const displayVersion = getDisplayArtifactVersion(attestation.artifactVersion)

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="dashboard-kicker">Latest release</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className={cn("border", toneClasses[tone])}>
              {getAttestationVerdictLabel(attestation.classification, attestation.publicationStatus)}
            </Badge>
            <Badge variant="outline" className="border-slate-700 bg-slate-900/70 text-slate-300">
              {getAttestationStatusLabel(attestation)}
            </Badge>
          </div>
          <h3 className="mt-4 truncate text-xl font-semibold text-white">
            {attestation.publicDisplayName}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
            {attestation.summary}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <HealthFact label="Version" value={displayVersion ? `v${displayVersion}` : "Not set"} />
        <HealthFact label="Updated" value={formatDate(attestation.refreshedAt ?? attestation.createdAt)} />
        <HealthFact label="Hash" value={shortenHash(attestation.contentHash)} mono />
      </div>

      <div className="mt-4 grid gap-2">
        <SignalPill
          icon={FileCheck2}
          label="Source binding"
          value={getSourceBindingLabel(attestation.sourceBindingStatus)}
        />
        <SignalPill
          icon={ShieldCheck}
          label="Verification"
          value={attestation.verificationTier === "self_submitted" ? "Self-submitted" : attestation.verificationTier}
        />
      </div>

      <Button
        variant="outline"
        className="mt-5 w-full justify-between border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800"
        onClick={() => onReviewAttestation(attestation)}
      >
        Review record
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}

function HealthFact({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/35 px-3 py-2.5">
      <p className="text-[0.64rem] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1 truncate text-sm font-semibold text-white",
          mono && "font-mono text-sm",
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function SignalPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileCheck2
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/35 px-3 py-2.5">
      <Icon className="size-5 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate text-sm font-medium text-slate-100">{value}</p>
      </div>
    </div>
  )
}

function AttentionCard({
  items,
  onSelectWorkspace,
}: {
  items: AttentionItem[]
  onSelectWorkspace: (value: PartnerWorkspaceView) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="dashboard-kicker">Needs attention</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{items.length} items</h3>
        </div>
        <CircleAlert className={cn("size-5", items.length > 0 ? "text-primary" : "text-slate-600")} />
      </div>

      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/45 px-3 py-3 text-left transition hover:border-slate-700 hover:bg-slate-900"
              onClick={() => onSelectWorkspace(item.workspace)}
            >
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
            </button>
          ))
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/35 px-3 py-4 text-sm text-slate-400">
            No drafts or access issues need attention.
          </div>
        )}
      </div>
    </div>
  )
}

function RecentRecords({
  attestations,
  onSelectWorkspace,
  onReviewAttestation,
}: {
  attestations: PartnerAttestationSummary[]
  onSelectWorkspace: (value: PartnerWorkspaceView) => void
  onReviewAttestation: (attestation: PartnerAttestationSummary) => void
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/45">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="dashboard-kicker">Recent records</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Attestation activity</h3>
        </div>
        <Button
          variant="outline"
          className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
          onClick={() => onSelectWorkspace("attestations")}
        >
          View all
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>

      <div className="divide-y divide-slate-800">
        {attestations.length > 0 ? (
          attestations.map((attestation) => {
            const tone = getAttestationTone(attestation.classification, attestation.publicationStatus)
            const displayVersion = getDisplayArtifactVersion(attestation.artifactVersion)

            return (
              <button
                key={attestation.id}
                type="button"
                className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-slate-900/45 lg:grid-cols-[minmax(0,1fr)_auto_auto]"
                onClick={() => onReviewAttestation(attestation)}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{attestation.publicDisplayName}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {displayVersion ? `v${displayVersion}` : attestation.artifactKey}
                  </p>
                </div>
                <Badge className={cn("w-fit border", toneClasses[tone])}>
                  {getAttestationVerdictLabel(attestation.classification, attestation.publicationStatus)}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-slate-400 lg:min-w-[190px] lg:justify-end">
                  <Clock3 className="size-4" />
                  {formatDate(attestation.refreshedAt ?? attestation.createdAt)}
                </div>
              </button>
            )
          })
        ) : (
          <div className="px-5 py-6 text-sm text-slate-400">
            No attestation records yet.
          </div>
        )}
      </div>
    </section>
  )
}

type AttentionItem = {
  label: string
  description: string
  workspace: PartnerWorkspaceView
}

function buildAttentionItems({
  draftCount,
  activeKeyCount,
  maxKeys,
  latestAttestation,
}: {
  draftCount: number
  activeKeyCount: number
  maxKeys: number
  latestAttestation: PartnerAttestationSummary | null
}): AttentionItem[] {
  const items: AttentionItem[] = []

  if (draftCount > 0) {
    items.push({
      label: `${draftCount} draft${draftCount === 1 ? "" : "s"} waiting`,
      description: "Review and publish the records you want to make public.",
      workspace: "attestations",
    })
  }

  if (activeKeyCount >= maxKeys) {
    items.push({
      label: "API key limit reached",
      description: "Rotate or revoke unused keys before creating more.",
      workspace: "access",
    })
  }

  if (latestAttestation?.sourceBindingStatus === "none") {
    items.push({
      label: "Latest release has no bound source",
      description: "Add a canonical source URL when the download page is stable.",
      workspace: "attestations",
    })
  }

  return items
}
