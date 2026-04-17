import { ChevronLeft } from "lucide-react"

import AttestationBadgeDesigner from "@/components/dashboard/AttestationBadgeDesigner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PartnerBadgePreferencesInput, PartnerProfile } from "@/types/partner-dashboard"
import type { PublicAttestationPayload } from "@/types/attestation"

interface DashboardBadgeDefaultsPanelProps {
  partner: PartnerProfile
  payload: PublicAttestationPayload
  busy: boolean
  onBack: () => void
  onSave: (input: PartnerBadgePreferencesInput) => void
}

export default function DashboardBadgeDefaultsPanel({
  partner,
  payload,
  busy,
  onBack,
  onSave,
}: DashboardBadgeDefaultsPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
        <div className="min-w-0 space-y-1">
          <Badge variant="outline" className="w-fit border-slate-700 bg-slate-800 text-slate-300">
            Badge defaults
          </Badge>
          <p className="text-sm font-medium text-white">Default badge settings</p>
          <p className="max-w-3xl text-sm leading-6 text-slate-400">
            Set the default badge density and metadata slots new drafts should start with.
            Existing attestations keep their own stored settings.
          </p>
        </div>

        <Button
          variant="outline"
          className="border-slate-700 border bg-slate-900 text-slate-200 hover:bg-slate-800"
          onClick={onBack}
        >
          <ChevronLeft data-icon="inline-start" className="size-4" />
          Back to ledger
        </Button>
      </div>

      <AttestationBadgeDesigner
        key={`partner-defaults:${partner.defaultBadgeDensity}:${JSON.stringify(partner.defaultBadgeSlots ?? null)}`}
        title="Default badge settings"
        description="Choose the default badge density and metadata slots for future drafts."
        payload={payload}
        badgeDensity={partner.defaultBadgeDensity}
        badgeSlots={partner.defaultBadgeSlots}
        busy={busy}
        saveLabel="Save defaults"
        showHeader={false}
        onSave={(value) =>
          onSave({
            defaultBadgeDensity: value.badgeDensity,
            defaultBadgeSlots: value.badgeSlots,
          })}
      />
    </div>
  )
}
