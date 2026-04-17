import { useMemo, useState } from "react"
import { RefreshCcw, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  BADGE_DENSITY_OPTIONS,
  BADGE_DETAIL_SLOT_OPTIONS,
  buildAttestationBadgePreviewDataUri,
  createAttestationBadgeSlotsDraft,
  resolveAttestationBadgeMetadata,
  sanitizeAttestationBadgeSlots,
} from "@/lib/attestation-badge"
import { cn } from "@/lib/utils"
import type {
  AttestationBadgeSlots,
  BadgeDensity,
  BadgeDetailSlot,
  PublicAttestationPayload,
} from "@/types/attestation"

interface BadgeConfigValue {
  badgeDensity: BadgeDensity
  badgeSlots: AttestationBadgeSlots
}

interface AttestationBadgeDesignerProps {
  title: string
  description: string
  payload: PublicAttestationPayload
  badgeDensity: BadgeDensity
  badgeSlots: AttestationBadgeSlots | null
  busy: boolean
  saveLabel: string
  showHeader?: boolean
  onSave: (value: BadgeConfigValue) => void
}

function sameSlots(left: AttestationBadgeSlots, right: AttestationBadgeSlots): boolean {
  return left.runtime === right.runtime
    && left.leftDetail === right.leftDetail
    && left.rightDetail === right.rightDetail
}

export default function AttestationBadgeDesigner({
  title,
  description,
  payload,
  badgeDensity,
  badgeSlots,
  busy,
  saveLabel,
  showHeader = true,
  onSave,
}: AttestationBadgeDesignerProps) {
  const savedSlots = useMemo(
    () => createAttestationBadgeSlotsDraft(badgeDensity, badgeSlots),
    [badgeDensity, badgeSlots],
  )
  const [draftDensity, setDraftDensity] = useState<BadgeDensity>(badgeDensity)
  const [draftSlots, setDraftSlots] = useState<AttestationBadgeSlots>(
    createAttestationBadgeSlotsDraft(badgeDensity, badgeSlots),
  )

  const effectiveDraftSlots = useMemo(
    () => sanitizeAttestationBadgeSlots(draftDensity, draftSlots),
    [draftDensity, draftSlots],
  )
  const metadata = useMemo(() => resolveAttestationBadgeMetadata(payload), [payload])
  const runtimeAvailable = Boolean(metadata.runtimeLabel?.trim())
  const versionAvailable = Boolean(metadata.versionLabel?.trim())
  const detailOptions = useMemo(
    () => BADGE_DETAIL_SLOT_OPTIONS.filter((option) => versionAvailable || option.value !== "version"),
    [versionAvailable],
  )

  const hasChanges = draftDensity !== badgeDensity || !sameSlots(effectiveDraftSlots, savedSlots)

  function handleDensityChange(nextDensity: BadgeDensity): void {
    setDraftDensity(nextDensity)
    setDraftSlots(createAttestationBadgeSlotsDraft(nextDensity, draftSlots))
  }

  function handleRuntimeToggle(checked: boolean): void {
    setDraftSlots((current) => createAttestationBadgeSlotsDraft(draftDensity, {
      ...current,
      runtime: checked,
    }))
  }

  function handleDetailChange(side: "leftDetail" | "rightDetail", value: BadgeDetailSlot): void {
    setDraftSlots((current) => createAttestationBadgeSlotsDraft(draftDensity, {
      ...current,
      [side]: value,
    }))
  }

  function handleReset(): void {
    setDraftDensity(badgeDensity)
    setDraftSlots(savedSlots)
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/45 p-4">
      {showHeader ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="dashboard-kicker">{title}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>
          <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
            MLVScan badge
          </Badge>
        </div>
      ) : null}

      <div className={cn("grid gap-3 xl:grid-cols-3", showHeader ? "mt-4" : "")}>
        {BADGE_DENSITY_OPTIONS.map((option) => {
          const isSelected = option.value === draftDensity

          return (
            <button
              key={option.value}
              type="button"
              disabled={busy}
              onClick={() => handleDensityChange(option.value)}
              className={cn(
                "rounded-lg border p-3 text-left transition",
                "hover:border-slate-700 hover:bg-slate-900/70",
                isSelected
                  ? "border-primary/60 bg-primary/10"
                  : "border-slate-800 bg-slate-950/55",
                busy && "cursor-wait opacity-80",
              )}
            >
              <p className="text-sm font-semibold text-white">{option.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{option.description}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/55 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Metadata slots</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Expose only the fields supported by the selected density.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            onClick={handleReset}
            disabled={busy}
          >
            <RotateCcw data-icon="inline-start" className="size-3.5" />
            Reset
          </Button>
        </div>

        {runtimeAvailable ? (
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/65 px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Runtime</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Show Mono or IL2CPP when runtime metadata is available.
                </p>
              </div>
              <Switch
                checked={effectiveDraftSlots.runtime}
                disabled={busy}
                onCheckedChange={handleRuntimeToggle}
              />
            </div>
          </div>
        ) : null}

        {!runtimeAvailable ? (
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/65 px-3 py-3">
            <p className="text-sm font-medium text-white">Runtime</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Runtime isn&apos;t available for this attestation yet.
            </p>
          </div>
        ) : null}

        {draftDensity === "detailed" ? (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <DetailSlotField
                label="Left detail"
                value={effectiveDraftSlots.leftDetail}
                busy={busy}
                options={detailOptions.map((option) => ({
                  ...option,
                  disabled: option.value !== "none" && option.value === effectiveDraftSlots.rightDetail,
                }))}
                onValueChange={(value) => handleDetailChange("leftDetail", value)}
              />
              <DetailSlotField
                label="Right detail"
                value={effectiveDraftSlots.rightDetail}
                busy={busy}
                options={detailOptions.map((option) => ({
                  ...option,
                  disabled: option.value !== "none" && option.value === effectiveDraftSlots.leftDetail,
                }))}
                onValueChange={(value) => handleDetailChange("rightDetail", value)}
              />
            </div>
            {!versionAvailable ? (
              <p className="mt-3 text-xs leading-5 text-slate-400">
                Version isn&apos;t available for this attestation yet.
              </p>
            ) : null}
          </>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80 p-3">
          <img
            src={buildAttestationBadgePreviewDataUri(payload, draftDensity, effectiveDraftSlots)}
            alt="Selected badge preview"
            className="block h-10 w-auto max-w-full object-contain object-left"
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <Badge
            variant="outline"
            className={cn(
              "border-slate-700 bg-slate-900 text-slate-300",
              hasChanges && "border-primary/40 bg-primary/10 text-primary",
            )}
          >
            {hasChanges ? "Unsaved changes" : "Saved"}
          </Badge>
          <Button
            type="button"
            disabled={busy || !hasChanges}
            onClick={() => onSave({ badgeDensity: draftDensity, badgeSlots: effectiveDraftSlots })}
          >
            {busy ? <RefreshCcw className="size-3.5 animate-spin" /> : null}
            {busy ? "Saving..." : saveLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}

function DetailSlotField({
  label,
  value,
  busy,
  options,
  onValueChange,
}: {
  label: string
  value: BadgeDetailSlot
  busy: boolean
  options: Array<{ value: BadgeDetailSlot; label: string; disabled?: boolean }>
  onValueChange: (value: BadgeDetailSlot) => void
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/65 px-3 py-3">
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">
        Choose which attestation metadata appears in this slot.
      </p>
      <Select value={value} onValueChange={(next) => onValueChange(next as BadgeDetailSlot)} disabled={busy}>
        <SelectTrigger className="mt-3 border-slate-700 bg-slate-950 text-slate-100">
          <SelectValue placeholder="Select detail" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
