import type { ReactNode } from "react"
import { motion } from "framer-motion"
import {
  ArrowUpRight,
  Fingerprint,
  FileText,
  FileJson,
  Link2,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  TriangleAlert,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buildAttestationBadgeUrl, buildSignedAttestationUrl } from "@/lib/attestation-api"
import {
  getAttestationTone,
  getAttestationVerdictLabel,
  getSourceBindingLabel,
  getVerificationTierLabel,
  shortenHash,
} from "@/lib/attestation-view"
import { cn, formatBytes, formatDate } from "@/lib/utils"
import type { PublicAttestationPayload } from "@/types/attestation"

const toneClasses = {
  clean: {
    halo: "from-emerald-400/18 via-emerald-300/6 to-transparent",
    panel: "border-emerald-400/30 bg-emerald-500/8",
    label: "text-emerald-200",
    icon: ShieldCheck,
  },
  suspicious: {
    halo: "from-amber-300/18 via-amber-200/6 to-transparent",
    panel: "border-amber-300/28 bg-amber-400/8",
    label: "text-amber-100",
    icon: ShieldAlert,
  },
  threat: {
    halo: "from-rose-400/18 via-rose-300/6 to-transparent",
    panel: "border-rose-400/28 bg-rose-500/8",
    label: "text-rose-100",
    icon: ShieldOff,
  },
  revoked: {
    halo: "from-slate-300/14 via-slate-200/6 to-transparent",
    panel: "border-slate-300/18 bg-slate-400/8",
    label: "text-slate-100",
    icon: TriangleAlert,
  },
} as const

interface PublicAttestationReportProps {
  payload: PublicAttestationPayload
}

export default function PublicAttestationReport({ payload }: PublicAttestationReportProps) {
  const tone = getAttestationTone(payload.classification, payload.publicationStatus)
  const verdictLabel = getAttestationVerdictLabel(payload.classification, payload.publicationStatus)
  const sourceBindingLabel = getSourceBindingLabel(payload.sourceBindingStatus)
  const verificationLabel = getVerificationTierLabel(payload.verificationTier)
  const tonePreset = toneClasses[tone]
  const VerdictIcon = tonePreset.icon
  const badgeUrl = buildAttestationBadgeUrl(payload.shareId)
  const signedJsonUrl = buildSignedAttestationUrl(payload.shareId)
  const publishedLabel = payload.revokedAt ? "Revoked" : payload.publishedAt ? "Published" : "Prepared"
  const findingsLabel = `${payload.findingCount} retained finding${payload.findingCount === 1 ? "" : "s"}`
  const familyLabel = `${payload.threatFamilies.length} family match${payload.threatFamilies.length === 1 ? "" : "es"}`

  return (
    <div className="space-y-8 lg:space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 px-6 py-8 shadow-2xl shadow-black/30 sm:px-8 lg:min-h-[70vh] lg:px-10 lg:py-10"
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br", tonePreset.halo)} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="border-white/15 bg-white/5 text-[0.72rem] uppercase tracking-[0.18em] text-slate-200">
                  {verificationLabel}
                </Badge>
                <Badge variant="outline" className="border-white/15 bg-white/5 text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">
                  Exact bytes only
                </Badge>
              </div>

              <div className="space-y-4">
                <p className="font-display text-xs uppercase tracking-[0.28em] text-slate-400">
                  Public attestation
                </p>
                <h1 className="max-w-4xl font-display text-4xl leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {payload.publicDisplayName}
                </h1>
                <div className={cn("inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm", tonePreset.panel, tonePreset.label)}>
                  <VerdictIcon className="h-4 w-4" />
                  <span>{verdictLabel}</span>
                </div>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  {payload.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href={badgeUrl} target="_blank" rel="noreferrer">
                    Badge SVG
                    <FileText className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <a href={signedJsonUrl} target="_blank" rel="noreferrer">
                    Signed JSON
                    <FileJson className="h-4 w-4" />
                  </a>
                </Button>
                {payload.canonicalSourceUrl && (
                  <Button asChild variant="outline" size="sm" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                    <a href={payload.canonicalSourceUrl} target="_blank" rel="noreferrer">
                      Publisher-declared source
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {payload.verificationTier === "self_submitted" && (
                <div className="rounded-[1.4rem] border border-amber-300/18 bg-amber-400/8 px-5 py-4 text-sm text-amber-50">
                  MLVScan has not verified the current download source for this self-submitted scan.
                </div>
              )}
              <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-4 text-sm text-slate-300">
                This attestation applies to the submitted file and SHA-256 below. If the distributed file changes, the badge no longer applies.
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-6 backdrop-blur-sm">
            <div className="grid gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Scan facts</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <Fact label="Share id" value={payload.shareId} mono />
                  <Fact label={publishedLabel} value={formatDate(payload.revokedAt ?? payload.publishedAt ?? payload.scannedAt)} />
                  <Fact label="Source binding" value={sourceBindingLabel} icon={<Link2 className="h-4 w-4" />} />
                  <Fact label="Scanner" value={payload.scannerVersion} />
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Exact file identity</p>
                <div className="mt-3 flex items-start gap-3">
                  <Fingerprint className="mt-1 h-4 w-4 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-400">Submitted file</p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-100">{payload.fileName}</p>
                    <p className="text-sm text-slate-400">SHA-256</p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-100">{payload.contentHash}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Fact label="Size" value={formatBytes(payload.sizeBytes)} />
                <Fact label="Schema" value={payload.schemaVersion} />
                <Fact label="Findings" value={findingsLabel} />
                <Fact label="Family matches" value={familyLabel} />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Summary</p>
          <div className="mt-5 grid gap-4">
            <SummaryRow label="Headline" value={payload.headline} />
            <SummaryRow label="Classification" value={verdictLabel} />
            <SummaryRow
              label="Blocking recommendation"
              value={payload.blockingRecommended ? "Yes. Review before distributing." : "No blocking recommendation from this scan."}
            />
            <SummaryRow label="Scanned at" value={formatDate(payload.scannedAt)} />
            <SummaryRow label="Short hash" value={shortenHash(payload.contentHash)} mono />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">What this proves</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p>
              MLVScan scanned the exact bytes identified by the SHA-256 above and published the current disposition for that file.
            </p>
            {payload.verificationTier === "self_submitted" && (
              <p>
                The current download page or file host has not been verified by MLVScan for this attestation.
              </p>
            )}
            <p>
              This is a {verificationLabel.toLowerCase()}. It does not prove that every file from the same mod page or archive is identical.
            </p>
            {payload.publicationStatus === "revoked" ? (
              <p className="rounded-2xl border border-slate-300/18 bg-slate-400/8 px-4 py-3 text-slate-200">
                This attestation has been revoked. Treat any previously embedded badge as historical only.
              </p>
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-slate-200">
                Static analysis can miss runtime behavior. Treat this report as evidence and context, not a blanket guarantee of safety.
              </p>
            )}
          </div>
        </div>
      </motion.section>

      <motion.details
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
        className="group rounded-[1.75rem] border border-white/10 bg-black/25"
      >
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 px-6 py-5 text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Evidence</p>
            <h2 className="mt-2 font-display text-2xl text-white">Retained findings and family matches</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span>{findingsLabel}</span>
            <span className="text-slate-600">/</span>
            <span>{familyLabel}</span>
          </div>
        </summary>

        <div className="grid gap-8 border-t border-white/10 px-6 py-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <SectionHeading
              title="Retained findings"
              subtitle="Default findings are shown here. Advanced diagnostics are intentionally excluded from public attestations."
            />
            {payload.findings.length > 0 ? (
              <div className="space-y-3">
                {payload.findings.map((finding, index) => (
                  <div key={finding.id ?? `${finding.ruleId ?? "finding"}-${index}`} className="rounded-2xl border border-white/10 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-white/10 bg-white/4 text-slate-200">
                        {finding.severity}
                      </Badge>
                      {finding.ruleId && (
                        <Badge variant="outline" className="border-white/10 bg-transparent font-mono text-slate-400">
                          {finding.ruleId}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-slate-100">{finding.description}</p>
                    {finding.location && (
                      <p className="mt-2 break-all font-mono text-xs text-slate-400">{finding.location}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyEvidence message="No retained findings were published for this attestation." />
            )}
          </div>

          <div className="space-y-4">
            <SectionHeading
              title="Threat-family matches"
              subtitle="Matches describe known malware families or behavior variants that influenced the current verdict."
            />
            {payload.threatFamilies.length > 0 ? (
              <div className="space-y-3">
                {payload.threatFamilies.map((family) => (
                  <div key={`${family.familyId}-${family.variantId ?? "base"}`} className="rounded-2xl border border-white/10 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-white">{family.displayName}</p>
                      {family.exactHashMatch && (
                        <Badge className="bg-rose-500/12 text-rose-100">Exact hash match</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{family.summary}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Fact label="Match kind" value={family.matchKind} compact />
                      <Fact label="Matched rules" value={family.matchedRules.length > 0 ? family.matchedRules.join(", ") : "None"} compact mono={family.matchedRules.length > 0} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyEvidence message="No malware family matches were retained for this attestation." />
            )}
          </div>
        </div>
      </motion.details>
    </div>
  )
}

interface FactProps {
  label: string
  value: string
  mono?: boolean
  compact?: boolean
  icon?: ReactNode
}

function Fact({ label, value, mono = false, compact = false, icon }: FactProps) {
  return (
    <div className={cn("rounded-[1.1rem] border border-white/8 bg-white/4 px-4 py-3", compact && "px-3 py-2.5")}>
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-2 flex items-start gap-2">
        {icon}
        <p className={cn("text-sm text-slate-100", mono && "break-all font-mono text-xs")}>{value}</p>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-b border-white/8 pb-4 last:border-b-0 last:pb-0">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={cn("mt-2 text-sm leading-7 text-slate-100", mono && "break-all font-mono text-xs")}>{value}</p>
    </div>
  )
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="font-display text-2xl text-white">{title}</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{subtitle}</p>
    </div>
  )
}

function EmptyEvidence({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-5 text-sm text-slate-400">
      {message}
    </div>
  )
}
