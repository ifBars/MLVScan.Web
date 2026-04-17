import { Check, RefreshCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  ATTESTATION_BADGE_STYLE_OPTIONS,
  buildAttestationBadgePreviewDataUri,
  normalizeAttestationBadgeStyle,
} from "@/lib/attestation-badge"
import { cn } from "@/lib/utils"
import type {
  PartnerAttestationSummary,
} from "@/types/partner-dashboard"
import type { AttestationBadgeStyle } from "@/types/attestation"

interface AttestationBadgeStylePickerProps {
  attestation: PartnerAttestationSummary
  busy: boolean
  onSelect: (badgeStyle: AttestationBadgeStyle) => void
}

export default function AttestationBadgeStylePicker({
  attestation,
  busy,
  onSelect,
}: AttestationBadgeStylePickerProps) {
  const selectedStyle = normalizeAttestationBadgeStyle(attestation.badgeStyle)

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="dashboard-kicker">Badge design</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Pick the badge layout mod authors will share. The published badge URL stays the
            same and starts serving the newly selected design.
          </p>
        </div>
        <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
          {ATTESTATION_BADGE_STYLE_OPTIONS.find((option) => option.value === selectedStyle)?.label
            ?? "Ledger Strip"}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {ATTESTATION_BADGE_STYLE_OPTIONS.map((option) => {
          const isSelected = option.value === selectedStyle

          return (
            <button
              key={option.value}
              type="button"
              disabled={busy}
              onClick={() => {
                if (option.value === selectedStyle) {
                  return
                }
                onSelect(option.value)
              }}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                "hover:border-slate-700 hover:bg-slate-900/70",
                isSelected
                  ? "border-primary/60 bg-primary/10"
                  : "border-slate-800 bg-slate-950/55",
                busy && "cursor-wait opacity-80",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{option.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{option.description}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full border text-slate-200",
                    isSelected
                      ? "border-primary/60 bg-primary/15"
                      : "border-slate-700 bg-slate-900",
                  )}
                >
                  {busy && isSelected ? (
                    <RefreshCcw className="size-3.5 animate-spin" />
                  ) : isSelected ? (
                    <Check className="size-3.5" />
                  ) : null}
                </span>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                <img
                  src={buildAttestationBadgePreviewDataUri(attestation, option.value)}
                  alt={`${option.label} badge preview`}
                  className="block h-10 w-auto max-w-full object-contain object-left"
                />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
