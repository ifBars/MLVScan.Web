import { useState } from "react"
import {
  ArrowUpRight,
  Eye,
  MoreHorizontal,
  RefreshCcw,
  ShieldBan,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getAttestationStatusLabel,
  isCurrentAttestation,
  isPublicAttestation,
} from "@/lib/attestation-lineage"
import {
  getAttestationTone,
  getAttestationVerdictLabel,
} from "@/lib/attestation-view"
import {
  getDisplayArtifactVersion,
  shouldShowFullArtifactVersionTitle,
} from "@/lib/artifact-version-display"
import { cn, formatDate } from "@/lib/utils"
import type { PartnerAttestationSummary } from "@/types/partner-dashboard"

type PublicationFilter = "all" | "drafts" | "current" | "review"

const toneClasses = {
  clean: "border-emerald-600/40 bg-emerald-950/50 text-emerald-300",
  suspicious: "border-amber-600/40 bg-amber-950/50 text-amber-300",
  threat: "border-rose-600/40 bg-rose-950/50 text-rose-300",
  revoked: "border-slate-600/40 bg-slate-900/50 text-slate-400",
} as const

interface AttestationLedgerProps {
  attestations: PartnerAttestationSummary[]
  selectedAttestationId: string | null
  isLoading: boolean
  errorMessage: string
  onSelect: (attestation: PartnerAttestationSummary) => void
  onReview: (attestation: PartnerAttestationSummary) => void
  onRefresh: (id: string) => Promise<void>
  onRevoke: (id: string) => Promise<void>
  onDeleteDraft: (id: string) => Promise<void>
  onOpenLink: (url: string) => void
  onCopySnippet: (text: string, successMessage: string) => void
  onOpenDetails: () => void
  onOpenBadgeDefaults: () => void
}

export default function AttestationLedger({
  attestations,
  selectedAttestationId,
  isLoading,
  errorMessage,
  onSelect,
  onReview,
  onRefresh,
  onRevoke,
  onDeleteDraft,
  onOpenLink,
  onCopySnippet,
  onOpenDetails,
  onOpenBadgeDefaults,
}: AttestationLedgerProps) {
  const [showRevoked, setShowRevoked] = useState(false)
  const [publicationFilter, setPublicationFilter] = useState<PublicationFilter>("all")
  const [revokeAttestationId, setRevokeAttestationId] = useState<string | null>(null)

  const pendingRevokeAttestation =
    attestations.find((item) => item.id === revokeAttestationId) ?? null

  const baseAttestations = showRevoked
    ? attestations
    : attestations.filter((item) => item.publicationStatus !== "revoked")

  const draftCount = baseAttestations.filter((item) => item.publicationStatus === "draft").length
  const currentCount = baseAttestations.filter(isCurrentAttestation).length
  const reviewCount = baseAttestations.filter(needsReview).length

  const visibleAttestations = baseAttestations.filter((item) => {
    switch (publicationFilter) {
      case "drafts":
        return item.publicationStatus === "draft"
      case "current":
        return isCurrentAttestation(item)
      case "review":
        return needsReview(item)
      case "all":
      default:
        return true
    }
  })

  async function handleConfirmRevoke(): Promise<void> {
    if (!revokeAttestationId) {
      return
    }

    await onRevoke(revokeAttestationId)
    setRevokeAttestationId(null)
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="dashboard-kicker">Attestation ledger</p>
            <h2 className="font-display text-[1.7rem] leading-tight text-white">
              Review publication history without leaving the workbench
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-400">
              Drafts, current records, superseded history, and revoked attestations stay in one
              ledger. Select a row to keep its evidence and operations visible while you compare
              release history.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <FilterButton
                active={publicationFilter === "all"}
                label="All"
                count={baseAttestations.length}
                onClick={() => setPublicationFilter("all")}
              />
              <FilterButton
                active={publicationFilter === "drafts"}
                label="Drafts"
                count={draftCount}
                onClick={() => setPublicationFilter("drafts")}
              />
              <FilterButton
                active={publicationFilter === "current"}
                label="Current"
                count={currentCount}
                onClick={() => setPublicationFilter("current")}
              />
              <FilterButton
                active={publicationFilter === "review"}
                label="Needs review"
                count={reviewCount}
                onClick={() => setPublicationFilter("review")}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              onClick={onOpenBadgeDefaults}
            >
              <SlidersHorizontal data-icon="inline-start" className="size-4" />
              Badge defaults
            </Button>

            <div className="flex h-10 items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-4">
              <span className="text-sm text-slate-300">Show revoked</span>
              <Switch checked={showRevoked} onCheckedChange={setShowRevoked} />
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-rose-600/30 bg-rose-950/50 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/55">
          <div className="flex min-h-12 items-center justify-between border-b border-slate-800/80 px-4 sm:px-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="size-2 rounded-full bg-primary" />
              Artifact records
            </div>
            <p className="font-mono text-xs text-slate-500">
              {visibleAttestations.length} visible / {baseAttestations.length} total
            </p>
          </div>
          {isLoading && attestations.length === 0 ? (
            <div className="grid gap-3 px-5 py-5 sm:px-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={`attestation-skeleton-${index}`}
                  className="h-14 rounded-lg bg-slate-800"
                />
              ))}
            </div>
          ) : visibleAttestations.length > 0 ? (
            <>
              <div className="divide-y divide-slate-800 lg:hidden">
                {visibleAttestations.map((attestation) => {
                  const tone = getAttestationTone(
                    attestation.classification,
                    attestation.publicationStatus,
                  )
                  const rowMetadata = getLedgerRowMetadata(attestation)
                  const isSelected = selectedAttestationId === attestation.id

                  return (
                    <article
                      key={`${attestation.id}:mobile`}
                      className={cn(
                        "px-4 py-4 transition-colors",
                        isSelected && "bg-slate-800/55",
                      )}
                    >
                      <button
                        type="button"
                        className="block w-full text-left"
                        onClick={() => onSelect(attestation)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">
                              {attestation.publicDisplayName}
                            </p>
                            {rowMetadata.label ? (
                              <p className="mt-1 truncate text-xs text-slate-500" title={rowMetadata.title}>
                                {rowMetadata.label}
                              </p>
                            ) : null}
                          </div>
                          <Badge variant="outline" className="shrink-0 border-slate-700 bg-slate-800 text-slate-300">
                            {getAttestationStatusLabel(attestation)}
                          </Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge className={cn("border", toneClasses[tone])}>
                            {getAttestationVerdictLabel(
                              attestation.classification,
                              attestation.publicationStatus,
                            )}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            Updated {formatDate(attestation.refreshedAt ?? attestation.createdAt)}
                          </span>
                        </div>
                      </button>

                      {attestation.publicationStatus === "superseded" && attestation.supersededByShareId ? (
                        <button
                          type="button"
                          className="mt-3 text-left text-xs text-primary transition hover:text-primary/80"
                          onClick={() => onOpenLink(`/attestations/${attestation.supersededByShareId}`)}
                        >
                          Open current replacement
                        </button>
                      ) : null}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                          onClick={() => {
                            onSelect(attestation)
                            onOpenDetails()
                          }}
                        >
                          <Eye data-icon="inline-start" />
                          Quick view
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                          onClick={() => onReview(attestation)}
                        >
                          Manage
                          <ArrowUpRight data-icon="inline-end" />
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>

              <Table className="hidden w-full lg:table">
                <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[34%]">Name</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {visibleAttestations.map((attestation) => {
                  const tone = getAttestationTone(
                    attestation.classification,
                    attestation.publicationStatus,
                  )
                  const rowMetadata = getLedgerRowMetadata(attestation)
                  const isCurrent = isCurrentAttestation(attestation)
                  const isPublic = isPublicAttestation(attestation)
                  const canRevoke =
                    attestation.publicationStatus !== "draft"
                    && attestation.publicationStatus !== "revoked"
                  const isSelected = selectedAttestationId === attestation.id

                  return (
                    <TableRow
                      key={attestation.id}
                      tabIndex={0}
                      aria-selected={isSelected}
                      className={cn(
                        "cursor-pointer border-slate-800 outline-none transition-colors hover:bg-slate-800/50 focus-visible:bg-slate-800/60 focus-visible:ring-2 focus-visible:ring-primary/40",
                        isSelected && "bg-slate-800/70 hover:bg-slate-800/70",
                      )}
                      onClick={() => onSelect(attestation)}
                      onDoubleClick={() => onReview(attestation)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") {
                          return
                        }

                        event.preventDefault()
                        onSelect(attestation)
                      }}
                    >
                      <TableCell className={cn("min-w-[240px]", isSelected && "border-l-2 border-l-primary")}>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium text-white">{attestation.publicDisplayName}</p>
                          {rowMetadata.label ? (
                            <p className="text-xs text-slate-500" title={rowMetadata.title}>
                              {rowMetadata.label}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border", toneClasses[tone])}>
                          {getAttestationVerdictLabel(
                            attestation.classification,
                            attestation.publicationStatus,
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit border-slate-700 bg-slate-800 text-slate-300">
                            {getAttestationStatusLabel(attestation)}
                          </Badge>
                          {attestation.publicationStatus === "superseded" && attestation.supersededByShareId ? (
                            <button
                              type="button"
                              className="w-fit text-left text-xs text-primary transition hover:text-primary/80"
                              onClick={(event) => {
                                event.stopPropagation()
                                onOpenLink(`/attestations/${attestation.supersededByShareId}`)
                              }}
                            >
                              Open current replacement
                            </button>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-slate-400">
                        <span className="text-sm">{formatDate(attestation.refreshedAt ?? attestation.createdAt)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-300 hover:bg-slate-800 2xl:hidden"
                            onClick={(event) => {
                              event.stopPropagation()
                              onSelect(attestation)
                              onOpenDetails()
                            }}
                          >
                            <Eye data-icon="inline-start" />
                            Quick view
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <MoreHorizontal />
                                <span className="sr-only">Attestation actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <DropdownMenuItem onClick={() => onReview(attestation)}>
                                <Eye data-icon="inline-start" />
                                Manage record
                              </DropdownMenuItem>
                              {isPublic ? (
                                <>
                                  <DropdownMenuItem onClick={() => onOpenLink(attestation.publicUrl)}>
                                    <ArrowUpRight data-icon="inline-start" />
                                    Open public page
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onOpenLink(attestation.badgeUrl)}>
                                    <ArrowUpRight data-icon="inline-start" />
                                    Open badge SVG
                                  </DropdownMenuItem>
                                  {isCurrent ? (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        onCopySnippet(
                                          `[![MLVScan badge](${attestation.badgeUrl})](${attestation.publicUrl})`,
                                          "Copied Markdown badge snippet",
                                        )
                                      }
                                    >
                                      <ArrowUpRight data-icon="inline-start" />
                                      Copy Markdown snippet
                                    </DropdownMenuItem>
                                  ) : null}
                                  {canRevoke ? <DropdownMenuSeparator /> : null}
                                  {canRevoke ? (
                                    <DropdownMenuItem onClick={() => setRevokeAttestationId(attestation.id)}>
                                      <ShieldBan data-icon="inline-start" />
                                      Revoke public attestation
                                    </DropdownMenuItem>
                                  ) : null}
                                </>
                              ) : null}
                              {attestation.publicationStatus === "draft" ? (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onDeleteDraft(attestation.id)}
                                  >
                                    <Trash2 data-icon="inline-start" />
                                    Delete draft
                                  </DropdownMenuItem>
                                </>
                              ) : null}
                              <DropdownMenuItem onClick={() => onRefresh(attestation.id)}>
                                <RefreshCcw data-icon="inline-start" />
                                Sync latest report for these bytes
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="px-5 py-6 text-sm leading-6 text-slate-400 sm:px-6">
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/30 px-5 py-6">
                No attestations match this filter yet. Change the filter or submit an artifact from
                the draft workspace to create the first ledger entry.
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={revokeAttestationId !== null} onOpenChange={(open) => !open && setRevokeAttestationId(null)}>
        <AlertDialogContent className="border-slate-800 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke public attestation</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRevokeAttestation
                ? `The public page for ${pendingRevokeAttestation.publicDisplayName} will stop resolving immediately. Existing API keys and future drafts stay untouched.`
                : "This public attestation will stop resolving immediately. Existing API keys and future drafts stay untouched."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmRevoke()}>
              Revoke attestation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-9 border-slate-700 bg-slate-900 px-3 text-slate-300 hover:bg-slate-800 hover:text-white",
        active && "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
      )}
      onClick={onClick}
    >
      {label}
      <span className="font-mono text-xs opacity-80">{count}</span>
    </Button>
  )
}

function needsReview(attestation: PartnerAttestationSummary): boolean {
  return (
    attestation.classification !== "Clean"
    || attestation.sourceBindingStatus === "failed"
    || attestation.sourceBindingStatus === "stale"
  )
}

function getLedgerRowMetadata(attestation: PartnerAttestationSummary): {
  label: string | null
  title?: string
} {
  const parts: string[] = []
  const displayVersion = getDisplayArtifactVersion(attestation.artifactVersion)

  if (!isSameArtifactIdentity(attestation.publicDisplayName, attestation.artifactKey)) {
    parts.push(attestation.artifactKey)
  }

  if (displayVersion) {
    parts.push(`v${displayVersion}`)
  }

  return {
    label: parts.length > 0 ? parts.join(" · ") : null,
    title: shouldShowFullArtifactVersionTitle(attestation.artifactVersion)
      ? `Full version: ${attestation.artifactVersion}`
      : undefined,
  }
}

function isSameArtifactIdentity(left: string, right: string): boolean {
  return normalizeArtifactIdentity(left) === normalizeArtifactIdentity(right)
}

function normalizeArtifactIdentity(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}
