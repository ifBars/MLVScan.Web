import { useState } from "react"
import {
  ArrowUpRight,
  Eye,
  MoreHorizontal,
  RefreshCcw,
  ShieldBan,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  onOpenLink: (url: string) => void
  onCopySnippet: (text: string, successMessage: string) => void
  onOpenDetails: () => void
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
  onOpenLink,
  onCopySnippet,
  onOpenDetails,
}: AttestationLedgerProps) {
  const [showRevoked, setShowRevoked] = useState(false)

  const visibleAttestations = showRevoked
    ? attestations
    : attestations.filter((item) => item.publicationStatus !== "revoked")

  return (
    <Card className="partner-pane overflow-hidden border border-slate-800/80 bg-slate-950/55 shadow-none">
      <CardHeader className="partner-pane-header flex flex-col gap-4 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit border-slate-700 bg-slate-800 text-slate-300">
              Attestation ledger
            </Badge>
            <CardTitle className="font-display text-[1.65rem] text-white">
              Review your publication history
            </CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-6 text-slate-400">
              Drafts, published records, and revoked attestations all live here. Review an item,
              refresh it to the newest completed report for the same hash, or revoke a public page
              without touching the API key surface.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2">
            <span className="text-sm text-slate-300">Show revoked</span>
            <Switch checked={showRevoked} onCheckedChange={setShowRevoked} />
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-rose-600/30 bg-rose-950/50 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-5 py-5 sm:px-6">
        {isLoading && attestations.length === 0 ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={`attestation-skeleton-${index}`}
                className="h-14 rounded-lg bg-slate-800"
              />
            ))}
          </div>
        ) : visibleAttestations.length > 0 ? (
          <Table>
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
                const isSelected = selectedAttestationId === attestation.id

                return (
                  <TableRow
                    key={attestation.id}
                    className={cn(
                      "cursor-pointer border-slate-800 hover:bg-slate-800/50",
                      isSelected && "bg-slate-800/70",
                    )}
                    onClick={() => onSelect(attestation)}
                  >
                    <TableCell className="min-w-[240px]">
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-white">{attestation.publicDisplayName}</p>
                        <p className="text-xs text-slate-500">{attestation.fileName}</p>
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
                      <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                        {attestation.publicationStatus}
                      </Badge>
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
                            {attestation.publicationStatus === "published" ? (
                              <>
                                <DropdownMenuItem onClick={() => onOpenLink(attestation.publicUrl)}>
                                  <ArrowUpRight data-icon="inline-start" />
                                  Open public page
                                </DropdownMenuItem>
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
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onRevoke(attestation.id)}>
                                  <ShieldBan data-icon="inline-start" />
                                  Revoke public attestation
                                </DropdownMenuItem>
                              </>
                            ) : null}
                            <DropdownMenuItem onClick={() => onRefresh(attestation.id)}>
                              <RefreshCcw data-icon="inline-start" />
                              Refresh to newest report
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
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/30 px-5 py-6 text-sm leading-6 text-slate-400">
            No attestations match the current filter yet. Submit an artifact from the draft
            workspace to create the first ledger entry.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
