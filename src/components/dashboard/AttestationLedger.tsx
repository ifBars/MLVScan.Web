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
  getAttestationStatusDescription,
  getAttestationStatusLabel,
  isCurrentAttestation,
  isPublicAttestation,
} from "@/lib/attestation-lineage"
import {
  getAttestationTone,
  getAttestationVerdictLabel,
} from "@/lib/attestation-view"
import { cn, formatDate } from "@/lib/utils"
import type { PartnerAttestationSummary } from "@/types/partner-dashboard"

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
  const [revokeAttestationId, setRevokeAttestationId] = useState<string | null>(null)

  const pendingRevokeAttestation =
    attestations.find((item) => item.id === revokeAttestationId) ?? null

  const visibleAttestations = showRevoked
    ? attestations
    : attestations.filter((item) => item.publicationStatus !== "revoked")

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-[1.65rem] text-white">
              Review your publication history
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-400">
              Drafts, current records, superseded history, and revoked attestations all live
              here. Review an item, sync it to the latest completed report for the same bytes, or
              revoke a public page without touching the API key surface.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              onClick={onOpenBadgeDefaults}
            >
              <SlidersHorizontal data-icon="inline-start" className="size-4" />
              Badge defaults
            </Button>

            <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2">
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
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead>Name</TableHead>
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
                        "cursor-pointer border-slate-800 outline-none hover:bg-slate-800/50 focus-visible:bg-slate-800/60 focus-visible:ring-2 focus-visible:ring-primary/40",
                        isSelected && "bg-slate-800/70",
                      )}
                      onClick={() => onSelect(attestation)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") {
                          return
                        }

                        event.preventDefault()
                        onSelect(attestation)
                      }}
                    >
                      <TableCell className="min-w-[240px]">
                        <div className="flex flex-col gap-1">
                          <p className="font-medium text-white">{attestation.publicDisplayName}</p>
                          <p className="text-xs text-slate-500">
                            {attestation.artifactKey}
                            {attestation.artifactVersion ? ` · v${attestation.artifactVersion}` : ""}
                          </p>
                          <p className="text-xs text-slate-600">{attestation.fileName}</p>
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
                          <p className="max-w-[240px] text-xs leading-5 text-slate-500">
                            {getAttestationStatusDescription(attestation)}
                          </p>
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
                      <TableCell className="text-slate-400">
                        {formatDate(attestation.refreshedAt ?? attestation.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="xl:hidden text-slate-300 hover:bg-slate-800"
                            onClick={(event) => {
                              event.stopPropagation()
                              onSelect(attestation)
                              onOpenDetails()
                            }}
                          >
                            <Eye data-icon="inline-start" />
                            Details
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
                                Open management panel
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
          ) : (
            <div className="px-5 py-6 text-sm leading-6 text-slate-400 sm:px-6">
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/30 px-5 py-6">
                No attestations match the current filter yet. Submit an artifact from the draft
                workspace to create the first ledger entry.
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
