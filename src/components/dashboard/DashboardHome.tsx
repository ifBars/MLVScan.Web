import {
  ArrowRight,
  BadgeCheck,
  FileCode2,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getAttestationTone,
  getAttestationVerdictLabel,
  getSourceBindingLabel,
  getVerificationTierLabel,
  shortenHash,
} from "@/lib/attestation-view"
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
  activeKeyCount: number
  onSelectWorkspace: (value: PartnerWorkspaceView) => void
  onReviewAttestation: (attestation: PartnerAttestationSummary) => void
}

export default function DashboardHome({
  partner,
  attestations,
  publishedCount,
  draftCount,
  activeKeyCount,
  onSelectWorkspace,
  onReviewAttestation,
}: DashboardHomeProps) {
  const latestAttestation = attestations[0] ?? null
  const greetingName = firstName(partner.name)
  const latestTone = latestAttestation
    ? getAttestationTone(
        latestAttestation.classification,
        latestAttestation.publicationStatus,
      )
    : null

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-800/80 bg-slate-950/55">
      <section className="border-b border-slate-800 px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="dashboard-kicker">Home</p>
            <h2 className="mt-3 font-display text-5xl leading-none text-white sm:text-6xl">
              Hello, {greetingName}
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/70 sm:grid-cols-3">
            <OverviewCell label="Published" value={`${publishedCount}`} />
            <OverviewCell label="Drafts" value={`${draftCount}`} />
            <OverviewCell label="Active keys" value={`${activeKeyCount}/${partner.maxKeys}`} />
          </div>
        </div>
      </section>

      <section className="px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-3xl leading-tight text-white">
              Recent attestation activity
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              Keep the current release visible here, then jump into the workflow surface that needs
              attention next.
            </p>
          </div>

          {latestAttestation ? (
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              onClick={() => onReviewAttestation(latestAttestation)}
            >
              Open in ledger
              <ArrowRight data-icon="inline-end" />
            </Button>
          ) : null}
        </div>

        {latestAttestation ? (
          <div className="grid gap-8 py-6 xl:grid-cols-[240px_minmax(0,1fr)] xl:items-start">
            <div className="rounded-[24px] border border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.64),rgba(2,6,23,0.92))] p-5">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80">
                <FileCode2 className="size-7 text-primary" />
              </div>
              <p className="mt-6 text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                Latest artifact
              </p>
              <p className="mt-3 break-all font-mono text-xs text-slate-400">
                {latestAttestation.fileName}
              </p>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-slate-700 bg-slate-900/70 text-slate-300">
                  Recent record
                </Badge>
                {latestTone ? (
                  <Badge className={cn("border", toneClasses[latestTone])}>
                    {getAttestationVerdictLabel(
                      latestAttestation.classification,
                      latestAttestation.publicationStatus,
                    )}
                  </Badge>
                ) : null}
                <Badge variant="outline" className="border-slate-700 bg-slate-900/70 text-slate-300">
                  {latestAttestation.publicationStatus}
                </Badge>
              </div>

              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                {latestAttestation.summary}
              </p>

              <div className="mt-6 grid gap-x-12 gap-y-1 lg:grid-cols-2">
                <MetricRow label="Updated" value={formatDate(latestAttestation.refreshedAt ?? latestAttestation.createdAt)} />
                <MetricRow label="Scanned at" value={formatDate(latestAttestation.scannedAt)} />
                <MetricRow
                  label="Published"
                  value={
                    latestAttestation.publishedAt
                      ? formatDate(latestAttestation.publishedAt)
                      : "Not yet published"
                  }
                />
                <MetricRow label="Short hash" value={shortenHash(latestAttestation.contentHash)} mono />
                <MetricRow
                  label="Verification"
                  value={getVerificationTierLabel(latestAttestation.verificationTier)}
                />
                <MetricRow
                  label="Source binding"
                  value={getSourceBindingLabel(latestAttestation.sourceBindingStatus)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300">
                No records yet
              </Badge>
              <h3 className="mt-5 font-display text-3xl leading-tight text-white">
                Start the first attestation draft
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                The home surface starts populating once you upload the first DLL or EXE into the
                attestation flow.
              </p>
            </div>

            <Button className="justify-between lg:min-w-[240px]" onClick={() => onSelectWorkspace("publish")}>
              Open submit workspace
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        )}
      </section>

      <section className="border-t border-slate-800">
        <div className="border-b border-slate-800 px-5 py-4 sm:px-6 lg:px-8">
          <p className="dashboard-kicker">Workspace lanes</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
            Each surface has one job. Start in Submit, operate from Ledger, and use Access only
            when you need to rotate or issue partner keys.
          </p>
        </div>

        <div className="divide-y divide-slate-800">
          <WorkspaceRow
            icon={Sparkles}
            title="Submit"
            description="Upload a DLL or EXE, run the scan flow, and create a fresh draft attestation."
            actionLabel="Create draft"
            onClick={() => onSelectWorkspace("publish")}
          />
          <WorkspaceRow
            icon={BadgeCheck}
            title="Ledger"
            description="Review draft and published records, then publish, refresh, revoke, or inspect the current release."
            actionLabel={latestAttestation ? "Review latest record" : "Open ledger"}
            onClick={() =>
              latestAttestation
                ? onReviewAttestation(latestAttestation)
                : onSelectWorkspace("attestations")
            }
          />
          <WorkspaceRow
            icon={KeyRound}
            title="Access"
            description="Create, rotate, and revoke API keys without mixing access management into the release workflow."
            actionLabel="Manage keys"
            onClick={() => onSelectWorkspace("access")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm text-slate-400 sm:px-6 lg:px-8">
          <Badge
            variant="outline"
            className="border-emerald-600/30 bg-emerald-950/30 text-emerald-300"
          >
            <ShieldCheck data-icon="inline-start" />
            {partner.tierRestriction === "partner" ? "Partner tier active" : "Free tier active"}
          </Badge>
          <span className="text-slate-500">
            Signed in as {partner.email}
          </span>
        </div>
      </section>
    </div>
  )
}

function OverviewCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[150px] bg-slate-950/70 px-4 py-4">
      <p className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function MetricRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-800/80 py-3 text-sm">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="min-w-0 flex-1 border-b border-dotted border-slate-700/80" />
      <span
        className={cn(
          "text-right text-slate-100",
          mono && "max-w-[16rem] truncate font-mono text-xs sm:max-w-none",
        )}
      >
        {value}
      </span>
    </div>
  )
}

function WorkspaceRow({
  icon: Icon,
  title,
  description,
  actionLabel,
  onClick,
}: {
  icon: typeof Sparkles
  title: string
  description: string
  actionLabel: string
  onClick: () => void
}) {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-white">{title}</p>
          <p className="mt-1 max-w-3xl text-sm leading-7 text-slate-400">{description}</p>
        </div>
      </div>

      <Button
        variant="ghost"
        className="justify-between border border-slate-800 bg-slate-900 px-4 text-slate-200 hover:bg-slate-800 lg:min-w-[220px]"
        onClick={onClick}
      >
        {actionLabel}
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}

function firstName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) {
    return "partner"
  }

  return trimmed.split(/\s+/)[0] ?? "partner"
}
