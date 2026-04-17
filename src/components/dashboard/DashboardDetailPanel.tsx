import { useState, type ReactNode } from "react"
import {
  ArrowUpRight,
  FileJson,
  FileText,
  Link2,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  TriangleAlert,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import AttestationBadgeDesigner from "@/components/dashboard/AttestationBadgeDesigner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  getAttestationTone,
  getAttestationVerdictLabel,
  getSourceBindingLabel,
  getVerificationTierDescription,
  getVerificationTierLabel,
  shortenHash,
} from "@/lib/attestation-view"
import { cn, formatBytes, formatDate } from "@/lib/utils"
import type {
  PartnerAttestationBadgeConfigInput,
  PartnerAttestationMetadataInput,
  PartnerAttestationSummary,
  ShareOutputs,
} from "@/types/partner-dashboard"

const toneStyles = {
  clean: {
    badge: "border-emerald-600/40 bg-emerald-950/50 text-emerald-300",
    icon: ShieldCheck,
  },
  suspicious: {
    badge: "border-amber-600/40 bg-amber-950/50 text-amber-300",
    icon: ShieldAlert,
  },
  threat: {
    badge: "border-rose-600/40 bg-rose-950/50 text-rose-300",
    icon: ShieldOff,
  },
  revoked: {
    badge: "border-slate-600/40 bg-slate-900/50 text-slate-400",
    icon: TriangleAlert,
  },
} as const

interface DashboardDetailPanelProps {
  attestation: PartnerAttestationSummary | null
  shareOutputs: ShareOutputs | null
  onPublish: () => Promise<void>
  onRefresh: (id: string) => Promise<void>
  onRevoke: (id: string) => Promise<void>
  onDeleteDraft: (id: string) => Promise<void>
  onMetadataChange: (id: string, input: PartnerAttestationMetadataInput) => Promise<void>
  onBadgeConfigChange: (id: string, input: PartnerAttestationBadgeConfigInput) => Promise<void>
  onOpenLink: (url: string) => void
  onCopySnippet: (text: string, successMessage: string) => void
  publishBusy?: boolean
  metadataBusy?: boolean
  deleteBusy?: boolean
  badgeConfigBusy?: boolean
  publishOutcomeLabel?: string | null
  className?: string
}

export default function DashboardDetailPanel({
  attestation,
  shareOutputs,
  onPublish,
  onRefresh,
  onRevoke,
  onDeleteDraft,
  onMetadataChange,
  onBadgeConfigChange,
  onOpenLink,
  onCopySnippet,
  publishBusy = false,
  metadataBusy = false,
  deleteBusy = false,
  badgeConfigBusy = false,
  publishOutcomeLabel = null,
  className,
}: DashboardDetailPanelProps) {
  const [revokeConfirmAttestationId, setRevokeConfirmAttestationId] = useState<string | null>(null)
  const [artifactKeyDraft, setArtifactKeyDraft] = useState(attestation?.artifactKey ?? "")
  const [artifactVersionDraft, setArtifactVersionDraft] = useState(attestation?.artifactVersion ?? "")
  const [displayNameDraft, setDisplayNameDraft] = useState(attestation?.publicDisplayName ?? "")
  const [sourceUrlDraft, setSourceUrlDraft] = useState(attestation?.canonicalSourceUrl ?? "")

  if (!attestation) {
    return (
      <div className={cn("rounded-xl border border-slate-800 bg-slate-900/50 p-6", className)}>
        <Badge variant="outline" className="w-fit border-slate-700 bg-slate-800 text-slate-300">
          Attestation detail
        </Badge>
        <h2 className="mt-3 font-display text-xl text-white">
          Select an attestation
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Pick an item from the ledger to publish, refresh, revoke, and copy share outputs.
        </p>
      </div>
    )
  }

  const tone = getAttestationTone(
    attestation.classification,
    attestation.publicationStatus,
  )
  const toneStyle = toneStyles[tone]
  const VerdictIcon = toneStyle.icon
  const isDraft = attestation.publicationStatus === "draft"
  const isPublished = attestation.publicationStatus === "published"
  const metadataDirty =
    artifactKeyDraft.trim() !== attestation.artifactKey
    || artifactVersionDraft.trim() !== (attestation.artifactVersion ?? "")
    || displayNameDraft.trim() !== attestation.publicDisplayName
    || sourceUrlDraft.trim() !== (attestation.canonicalSourceUrl ?? "")

  return (
    <>
      <div className={cn("space-y-4", className)}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
            Attestation detail
          </Badge>
          <Badge className={cn("border", toneStyle.badge)}>
            <VerdictIcon data-icon="inline-start" />
            {getAttestationVerdictLabel(
              attestation.classification,
              attestation.publicationStatus,
            )}
          </Badge>
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-4xl leading-tight text-white">
            {attestation.publicDisplayName}
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-400">
            {attestation.summary}
          </p>
        </div>

        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-default border-slate-700 bg-slate-800 text-slate-300">
                  {getVerificationTierLabel(attestation.verificationTier)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Evidence is tied to the verification tier returned by the API.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-default border-slate-700 bg-slate-800 text-slate-300">
                  <Link2 data-icon="inline-start" />
                  {getSourceBindingLabel(attestation.sourceBindingStatus)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Source binding is evaluated server-side before publish.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {attestation.publicationStatus === "superseded" ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900/55 px-4 py-3 text-sm leading-6 text-slate-300">
            This attestation is historical. A newer current attestation now exists for{" "}
            <span className="font-mono text-xs text-slate-200">{attestation.artifactKey}</span>.
            {attestation.supersededByShareId ? (
              <>
                {" "}
                <button
                  type="button"
                  className="text-primary transition hover:text-primary/80"
                  onClick={() => onOpenLink(`/attestations/${attestation.supersededByShareId}`)}
                >
                  Open current replacement
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
              <section className="rounded-xl border border-slate-800 bg-slate-900/45 p-4">
                <p className="dashboard-kicker">Snapshot</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
                  <Fact label="Artifact key" value={attestation.artifactKey} mono />
                  <Fact label="Artifact version" value={attestation.artifactVersion ?? "Not set"} />
                  <Fact label="Scanned at" value={formatDate(attestation.scannedAt)} />
                  <Fact
                    label="Published"
                    value={
                      attestation.publishedAt
                        ? formatDate(attestation.publishedAt)
                        : "Not yet published"
                    }
                  />
                  <Fact label="File" value={attestation.fileName} mono />
                  <Fact label="Short hash" value={shortenHash(attestation.contentHash)} mono />
                  <Fact label="Size" value={formatBytes(attestation.sizeBytes)} />
                  <Fact label="Findings retained" value={`${attestation.findingCount}`} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Keep one stable artifact key per mod or package lineage. Publishing a newer build
                  for the same key replaces the current attestation and keeps older public records
                  as superseded history.
                </p>
              </section>

              <section className="rounded-xl border border-slate-800 bg-slate-900/45 p-4">
                <p className="dashboard-kicker">Metadata</p>
                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                  <MetadataField
                    label="Artifact key"
                    description="Stable lineage key used when publish decides whether this replaces an existing current attestation."
                  >
                    <Input
                      value={artifactKeyDraft}
                      disabled={!isDraft || metadataBusy}
                      className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                      onChange={(event) => setArtifactKeyDraft(event.target.value)}
                    />
                  </MetadataField>

                  <MetadataField
                    label="Display name"
                    description="Name shown in the ledger and on the public attestation."
                  >
                    <Input
                      value={displayNameDraft}
                      disabled={!isDraft || metadataBusy}
                      className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                      onChange={(event) => setDisplayNameDraft(event.target.value)}
                    />
                  </MetadataField>

                  <MetadataField
                    label="Version"
                    description="Optional publisher version label used in badge metadata and the public payload."
                  >
                    <Input
                      value={artifactVersionDraft}
                      disabled={!isDraft || metadataBusy}
                      className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                      onChange={(event) => setArtifactVersionDraft(event.target.value)}
                    />
                  </MetadataField>

                  <MetadataField
                    label="Canonical source URL"
                    description="Optional package or download page MLVScan should bind to this attestation."
                  >
                    <Input
                      value={sourceUrlDraft}
                      disabled={!isDraft || metadataBusy}
                      className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                      onChange={(event) => setSourceUrlDraft(event.target.value)}
                    />
                  </MetadataField>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-3xl text-sm leading-6 text-slate-400">
                    {isDraft
                      ? "Draft metadata stays editable until publish. This is the place to correct the artifact key, display name, version, or source URL before the public record goes live."
                      : "Lineage and source metadata are locked here once the attestation is public or historical. Create a new draft if the next release needs different lineage values."}
                  </p>
                  {isDraft ? (
                    <Button
                      variant="outline"
                      className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                      disabled={!artifactKeyDraft.trim() || !metadataDirty || metadataBusy}
                      onClick={() =>
                        void onMetadataChange(attestation.id, {
                          artifactKey: artifactKeyDraft,
                          artifactVersion: artifactVersionDraft,
                          publicDisplayName: displayNameDraft,
                          canonicalSourceUrl: sourceUrlDraft,
                        })}
                    >
                      {metadataBusy ? "Saving..." : "Save metadata"}
                    </Button>
                  ) : null}
                </div>
              </section>

              <AttestationBadgeDesigner
                key={`${attestation.id}:${attestation.badge?.density ?? "compact"}:${JSON.stringify(attestation.badge?.slots ?? null)}`}
                title="Badge settings"
                description="Keep one recognizable MLVScan badge while choosing density and the small set of metadata slots supported here."
                payload={attestation}
                badgeDensity={attestation.badge?.density ?? "compact"}
                badgeSlots={attestation.badge?.slots ?? null}
                busy={badgeConfigBusy}
                saveLabel="Save badge settings"
                onSave={(value) => void onBadgeConfigChange(attestation.id, value)}
              />
            </div>

            <aside className="space-y-3 xl:sticky xl:top-6 xl:self-start">
              <section className="rounded-xl border border-slate-800 bg-slate-950/45 p-4">
                <p className="dashboard-kicker">Operations</p>
                <div className="mt-3 flex flex-col gap-2">
                  {isDraft ? (
                    <>
                      <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-3 text-sm leading-6 text-slate-300">
                        {publishOutcomeLabel
                          ? publishOutcomeLabel
                          : `Publish new current attestation for ${attestation.artifactKey}.`}
                      </div>
                      <Button
                        disabled={publishBusy}
                        className="justify-between"
                        onClick={() => void onPublish()}
                      >
                        {publishBusy ? "Publishing..." : "Publish attestation"}
                        <ArrowUpRight data-icon="inline-end" />
                      </Button>
                    </>
                  ) : null}

                  <Button
                    variant="outline"
                    className="justify-between border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    onClick={() => void onRefresh(attestation.id)}
                  >
                    Sync latest report for these bytes
                    <ArrowUpRight data-icon="inline-end" />
                  </Button>

                  {isPublished ? (
                    <Button
                      variant="outline"
                      className="justify-between border-rose-700/60 bg-rose-950/30 text-rose-200 hover:bg-rose-950/45"
                      onClick={() => setRevokeConfirmAttestationId(attestation.id)}
                    >
                      Revoke public attestation
                      <TriangleAlert data-icon="inline-end" />
                    </Button>
                  ) : null}

                  {isDraft ? (
                    <Button
                      variant="outline"
                      className="justify-between border-rose-700/60 bg-rose-950/30 text-rose-200 hover:bg-rose-950/45"
                      disabled={deleteBusy}
                      onClick={() => void onDeleteDraft(attestation.id)}
                    >
                      {deleteBusy ? "Deleting..." : "Delete draft"}
                      <Trash2 data-icon="inline-end" />
                    </Button>
                  ) : null}
                </div>
              </section>

              {isPublished || attestation.canonicalSourceUrl ? (
                <section className="rounded-xl border border-slate-800 bg-slate-950/45 p-4">
                  <p className="dashboard-kicker">Links</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {isPublished ? (
                      <>
                        <Button className="justify-between" onClick={() => onOpenLink(attestation.publicUrl)}>
                          Open public attestation
                          <ArrowUpRight data-icon="inline-end" />
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-between border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                          onClick={() => onOpenLink(attestation.badgeUrl)}
                        >
                          Open badge SVG
                          <FileText data-icon="inline-end" />
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-between border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                          onClick={() =>
                            onOpenLink(
                              attestation.badgeUrl.replace(/\/badge\.svg(?:\?.*)?$/, "/attestation.json"),
                            )
                          }
                        >
                          Open signed JSON
                          <FileJson data-icon="inline-end" />
                        </Button>
                      </>
                    ) : null}

                    {attestation.canonicalSourceUrl ? (
                      <Button
                        variant="outline"
                        className="justify-between border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                        onClick={() => {
                          if (!attestation.canonicalSourceUrl) {
                            return
                          }
                          onOpenLink(attestation.canonicalSourceUrl)
                        }}
                      >
                        Open declared source
                        <ArrowUpRight data-icon="inline-end" />
                      </Button>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {shareOutputs ? (
                <section className="rounded-xl border border-slate-800 bg-slate-950/45 p-4">
                  <p className="dashboard-kicker">Share snippets</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="justify-between border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                      onClick={() => onCopySnippet(shareOutputs.markdown, "Copied Markdown badge snippet")}
                    >
                      Copy Markdown
                      <FileText data-icon="inline-end" />
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-between border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                      onClick={() => onCopySnippet(shareOutputs.bbcode, "Copied BBCode badge snippet")}
                    >
                      Copy BBCode
                      <ArrowUpRight data-icon="inline-end" />
                    </Button>
                  </div>
                </section>
              ) : null}

              <section className="rounded-xl border border-slate-800 bg-slate-950/45 p-4">
                <p className="dashboard-kicker">Trust model</p>
                <div className="mt-3 space-y-3 text-sm leading-6 text-slate-400">
                  <p>{getVerificationTierDescription(attestation.verificationTier)}</p>
                  <p>
                    {attestation.sourceBindingStatus === "verified"
                      ? "Source binding confirms the declared download source matched these exact bytes when MLVScan checked it."
                      : attestation.sourceBindingStatus === "declared"
                        ? "A publisher-declared source URL exists, but MLVScan has not verified that current download against this attestation yet."
                        : attestation.sourceBindingStatus === "stale"
                          ? "A source was linked before, but the current download is no longer the same verified file for this attestation."
                          : attestation.sourceBindingStatus === "failed"
                            ? "MLVScan could not verify that the current source still matches this attestation."
                            : "No source is bound. Treat the SHA-256 on the public page as the deciding identity check for downloads."}
                  </p>
                </div>
              </section>
          </aside>
        </div>
      </div>

      <AlertDialog
        open={revokeConfirmAttestationId === attestation.id}
        onOpenChange={(open) => setRevokeConfirmAttestationId(open ? attestation.id : null)}
      >
        <AlertDialogContent className="border-slate-800 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke public attestation</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the public page and badge for {attestation.publicDisplayName} right away.
              The ledger entry remains so you can refresh or republish later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onRevoke(attestation.id)}>
              Revoke attestation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function MetadataField({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/55 px-3 py-3">
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function Fact({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2">
      <p className="text-[0.64rem] font-medium uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[1.02rem] leading-5 text-slate-100",
          mono && "break-all font-mono text-sm",
        )}
      >
        {value}
      </p>
    </div>
  )
}
