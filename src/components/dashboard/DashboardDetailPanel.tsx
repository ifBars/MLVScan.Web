import {
  ArrowUpRight,
  FileJson,
  FileText,
  Link2,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  TriangleAlert,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getAttestationTone,
  getAttestationVerdictLabel,
  getSourceBindingLabel,
  getVerificationTierLabel,
  shortenHash,
} from "@/lib/attestation-view"
import { cn, formatBytes, formatDate } from "@/lib/utils"
import type {
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
  onOpenLink: (url: string) => void
  onCopySnippet: (text: string, successMessage: string) => void
  publishBusy?: boolean
  className?: string
}

export default function DashboardDetailPanel({
  attestation,
  shareOutputs,
  onPublish,
  onRefresh,
  onRevoke,
  onOpenLink,
  onCopySnippet,
  publishBusy = false,
  className,
}: DashboardDetailPanelProps) {
  if (!attestation) {
    return (
      <Card className={cn("border-slate-800 bg-slate-900/80 shadow-none", className)}>
        <CardHeader className="pb-3">
          <Badge variant="outline" className="w-fit border-slate-700 bg-slate-800 text-slate-300">
            Attestation detail
          </Badge>
          <CardTitle className="font-display text-xl text-white">
            Select an attestation
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-slate-400">
            Pick an item from the ledger to publish, refresh, revoke, and copy share outputs.
          </CardDescription>
        </CardHeader>
      </Card>
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

  return (
    <Card className={cn("border-slate-800 bg-slate-900/80 shadow-none", className)}>
      <CardHeader className="pb-3">
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

        <div className="mt-2 space-y-2">
          <CardTitle className="font-display text-4xl leading-tight text-white">
            {attestation.publicDisplayName}
          </CardTitle>
          <CardDescription className="max-w-3xl text-sm leading-6 text-slate-400">
            {attestation.summary}
          </CardDescription>
        </div>

        <TooltipProvider>
          <div className="mt-2 flex flex-wrap gap-2">
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
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <section className="rounded-xl border border-slate-800 bg-slate-900/45 p-4">
              <p className="dashboard-kicker">Snapshot</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
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
            </section>
          </div>

          <aside className="space-y-3 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-xl border border-slate-800 bg-slate-950/45 p-4">
              <p className="dashboard-kicker">Operations</p>
              <div className="mt-3 flex flex-col gap-2">
                {isDraft ? (
                  <Button
                    disabled={publishBusy}
                    className="justify-between"
                    onClick={() => void onPublish()}
                  >
                    {publishBusy ? "Publishing..." : "Publish attestation"}
                    <ArrowUpRight data-icon="inline-end" />
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  className="justify-between border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  onClick={() => void onRefresh(attestation.id)}
                >
                  Refresh to newest report
                  <ArrowUpRight data-icon="inline-end" />
                </Button>

                {isPublished ? (
                  <Button
                    variant="outline"
                    className="justify-between border-rose-700/60 bg-rose-950/30 text-rose-200 hover:bg-rose-950/45"
                    onClick={() => void onRevoke(attestation.id)}
                  >
                    Revoke public attestation
                    <TriangleAlert data-icon="inline-end" />
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
                      onClick={() => onOpenLink(attestation.canonicalSourceUrl)}
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
          </aside>
        </div>
      </CardContent>
    </Card>
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
