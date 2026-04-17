import type {
  AttestationBadgeDisplay,
  AttestationBadgeSlots,
  BadgeDensity,
  BadgeDetailSlot,
  PublicAttestationBadgeMetadata,
  PublicAttestationPayload,
} from "@/types/attestation"

export const ATTESTATION_BADGE_STYLE_OPTIONS = [
  {
    value: "split-pill" as const,
    label: "MLVScan badge",
    description: "Recognizable MLVScan badge with density presets.",
  },
]

export const BADGE_DENSITY_OPTIONS: Array<{
  value: BadgeDensity
  label: string
  description: string
}> = [
  {
    value: "compact",
    label: "Compact",
    description: "Brand, verdict, and optional runtime.",
  },
  {
    value: "detailed",
    label: "Detailed",
    description: "Brand, verdict, runtime, and up to two detail slots.",
  },
]

export const BADGE_DETAIL_SLOT_OPTIONS: Array<{
  value: BadgeDetailSlot
  label: string
}> = [
  { value: "none", label: "None" },
  { value: "verification", label: "Verification" },
  { value: "source-binding", label: "Source binding" },
  { value: "version", label: "Version" },
  { value: "scanned-date", label: "Scanned date" },
]

const LEGACY_STYLE_TO_DENSITY: Record<string, BadgeDensity> = {
  "split-pill": "compact",
  "gpt-5.4": "compact",
  "classic-shield": "compact",
  "codex-5.3": "compact",
  "ledger-strip": "detailed",
  "signature-bar": "detailed",
  "attestations": "detailed",
  "gpt-5.2": "detailed",
}

const MLVSCAN_BADGE_ICON_DATA_URI = "data:image/png;base64,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"
const BADGE_WIDTH_BUDGETS: Record<BadgeDensity, number> = {
  compact: 300,
  detailed: 340,
}
const BADGE_CANVAS_FONT_FAMILY = 'Inter, "Segoe UI", Arial, sans-serif'
const BADGE_SVG_FONT_FAMILY = "Inter,Segoe UI,Arial,sans-serif"
const BADGE_LAYOUT = {
  compact: {
    fontSize: 10,
    iconSize: 14,
    height: 22,
    leftMinWidth: 54,
    leftLabelPadding: 12,
    rightMinWidth: 78,
    rightLabelPadding: 14,
    iconInset: 4,
    iconGap: 4,
  },
  detailed: {
    fontSize: 11,
    iconSize: 16,
    height: 24,
    leftMinWidth: 72,
    leftLabelPadding: 14,
    rightMinWidth: 96,
    rightLabelPadding: 16,
    iconInset: 5,
    iconGap: 5,
  },
} as const

interface BadgeRenderToken {
  variants: Array<string | null>
  index: number
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function normalizeBadgeDensity(value: BadgeDensity | string | null | undefined): BadgeDensity {
  return value === "detailed" ? "detailed" : "compact"
}

export function normalizeAttestationBadgeStyle(_value?: string | null): "split-pill" {
  return "split-pill"
}

export function resolveBadgeDensityAlias(value: string | null | undefined): BadgeDensity | undefined {
  if (!value) return undefined
  return LEGACY_STYLE_TO_DENSITY[value]
}

function coerceDensity(value: BadgeDensity | string | null | undefined): BadgeDensity | undefined {
  if (value === "compact" || value === "detailed") {
    return normalizeBadgeDensity(value)
  }
  return resolveBadgeDensityAlias(value)
}

export function createDefaultBadgeSlots(density: BadgeDensity = "compact"): AttestationBadgeSlots {
  return normalizeBadgeDensity(density) === "compact"
    ? { runtime: true, leftDetail: "none", rightDetail: "none" }
    : { runtime: true, leftDetail: "none", rightDetail: "none" }
}

export function sanitizeAttestationBadgeSlots(
  density: BadgeDensity,
  value: AttestationBadgeSlots | null | undefined,
): AttestationBadgeSlots {
  const normalizedDensity = normalizeBadgeDensity(density)
  const draft = value ?? createDefaultBadgeSlots(normalizedDensity)

  if (normalizedDensity === "compact") {
    return { runtime: draft.runtime !== false, leftDetail: "none", rightDetail: "none" }
  }

  const leftDetail = draft.leftDetail ?? "none"
  const rightDetail = draft.rightDetail !== leftDetail ? draft.rightDetail ?? "none" : "none"

  return {
    runtime: draft.runtime !== false,
    leftDetail,
    rightDetail,
  }
}

export function createAttestationBadgeSlotsDraft(
  density: BadgeDensity,
  value?: AttestationBadgeSlots | null,
): AttestationBadgeSlots {
  return sanitizeAttestationBadgeSlots(density, value)
}

export function sanitizeAttestationBadgeDisplay(
  _style: string,
  value: AttestationBadgeDisplay | null | undefined,
): AttestationBadgeDisplay | null {
  if (!value) return null
  return slotsToLegacyDisplay("compact", legacyDisplayToSlots("compact", value))
}

export function createAttestationBadgeDisplayDraft(
  _style: string,
  value?: AttestationBadgeDisplay | null,
): AttestationBadgeDisplay {
  return sanitizeAttestationBadgeDisplay("split-pill", value)
    ?? slotsToLegacyDisplay("compact", createDefaultBadgeSlots("compact"))
}

export function legacyDisplayToSlots(
  density: BadgeDensity,
  display?: AttestationBadgeDisplay | null,
): AttestationBadgeSlots {
  if (!display) {
    return createDefaultBadgeSlots(density)
  }

  if (normalizeBadgeDensity(density) === "compact") {
    return { runtime: display.showRuntime, leftDetail: "none", rightDetail: "none" }
  }

  const details: BadgeDetailSlot[] = []
  if (display.showVerification) details.push("verification")
  if (display.showScannedDate) details.push("scanned-date")
  return sanitizeAttestationBadgeSlots(density, {
    runtime: display.showRuntime,
    leftDetail: details[0] ?? "none",
    rightDetail: details[1] ?? "none",
  })
}

function slotsToLegacyDisplay(
  _density: BadgeDensity,
  slots: AttestationBadgeSlots,
): AttestationBadgeDisplay {
  return {
    showRuntime: slots.runtime,
    showVerification: slots.leftDetail === "verification" || slots.rightDetail === "verification",
    showFile: false,
    showScannedDate: slots.leftDetail === "scanned-date" || slots.rightDetail === "scanned-date",
    showShortHash: false,
  }
}

function badgeDateLabel(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "unknown-date"
  return parsed.toISOString().slice(0, 10)
}

function badgeHashSuffix(contentHash: string): string {
  return contentHash.slice(-8).toLowerCase()
}

function badgeToneFromPayload(payload: PublicAttestationPayload) {
  if (payload.publicationStatus === "revoked") return "revoked" as const
  if (payload.classification === "KnownThreat") return "known-threat" as const
  if (payload.classification === "Suspicious") return "suspicious" as const
  return "clean" as const
}

function badgeStatusLabelFromPayload(payload: PublicAttestationPayload): string {
  if (payload.publicationStatus === "revoked") return "Revoked"
  if (payload.publicationStatus === "superseded") return "Superseded"
  if (payload.classification === "KnownThreat") return "Known threat"
  if (payload.classification === "Suspicious") return "Suspicious"
  return "Clean"
}

function badgeBrandLabelFromPayload(_payload: PublicAttestationPayload): string {
  return "Attested"
}

function badgeRuntimeLabel(payload: PublicAttestationPayload): string | null {
  const existing = payload.badge?.runtimeLabel
  if (existing) return existing
  return null
}

function detailLabel(slot: BadgeDetailSlot, payload: PublicAttestationBadgeMetadata): string | null {
  switch (slot) {
    case "verification":
      return payload.verificationLabel
    case "source-binding":
      return payload.sourceBindingLabel
    case "version":
      return payload.versionLabel
    case "scanned-date":
      return payload.scannedDateLabel
    case "none":
    default:
      return null
  }
}

function uniqueVariants(values: Array<string | null>): Array<string | null> {
  const seen = new Set<string>()
  const next: Array<string | null> = []

  for (const value of values) {
    if (value == null) {
      if (!next.includes(null)) {
        next.push(null)
      }
      continue
    }

    const normalized = value.trim()
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    next.push(normalized)
  }

  return next
}

function compactVersionLabel(value: string): string | null {
  const match = value.match(/^(\d+\.\d+)\.\d+(?:[.-].+)?$/)
  return match?.[1] ?? null
}

function compactDateLabel(value: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.slice(0, 7) : null
}

function detailVariants(slot: BadgeDetailSlot, value: string | null): Array<string | null> {
  if (!value) {
    return [null]
  }

  switch (slot) {
    case "verification":
      return uniqueVariants([
        value,
        value === "Self-submitted"
          ? "Self"
          : value === "Source verified"
            ? "Source"
            : null,
        null,
      ])
    case "source-binding":
      return uniqueVariants([
        value,
        value === "Source verified"
          ? "Source"
          : value === "Source declared"
            ? "Declared"
            : value === "Source stale"
              ? "Stale"
              : value === "Source check failed"
                ? "Check failed"
                : value === "No source"
                  ? "No src"
                  : null,
        null,
      ])
    case "version":
      return uniqueVariants([value, compactVersionLabel(value), null])
    case "scanned-date":
      return uniqueVariants([value, compactDateLabel(value), null])
    case "none":
    default:
      return [null]
  }
}

function createToken(variants: Array<string | null>): BadgeRenderToken | null {
  const nextVariants = uniqueVariants(variants)
  return nextVariants.length === 1 && nextVariants[0] == null
    ? null
    : { variants: nextVariants, index: 0 }
}

function tokenValue(token: BadgeRenderToken | null): string | null {
  return token ? token.variants[token.index] ?? null : null
}

function advanceToken(token: BadgeRenderToken | null): boolean {
  if (!token || token.index >= token.variants.length - 1) {
    return false
  }

  token.index += 1
  return true
}

function composeLeftLabel(statusLabel: string, detail: string | null): string {
  return detail ? `${statusLabel} | ${detail}` : statusLabel
}

function composeRightLabel(
  brand: string,
  runtime: string | null,
  detail: string | null,
): string {
  let value = brand
  if (runtime) {
    value += ` / ${runtime}`
  }
  if (detail) {
    value += ` | ${detail}`
  }
  return value
}

let measurementContext:
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D
  | null
  | undefined
const textWidthCache = new Map<string, number>()

function getMeasurementContext():
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D
  | null {
  if (measurementContext !== undefined) {
    return measurementContext
  }

  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
    measurementContext = null
    return measurementContext
  }

  try {
    if (typeof OffscreenCanvas !== "undefined") {
      measurementContext = new OffscreenCanvas(1, 1).getContext("2d")
      return measurementContext
    }
  } catch {
    measurementContext = null
    return measurementContext
  }

  try {
    if (typeof document !== "undefined") {
      measurementContext = document.createElement("canvas").getContext("2d")
      return measurementContext
    }
  } catch {
    measurementContext = null
    return measurementContext
  }

  measurementContext = null
  return measurementContext
}

export function resolveAttestationBadgeMetadata(
  payload: PublicAttestationPayload,
): PublicAttestationBadgeMetadata {
  if (payload.badge) {
    const density = normalizeBadgeDensity(payload.badge.density)
    return {
      ...payload.badge,
      style: "split-pill",
      brand: {
        ...payload.badge.brand,
        label: "Attested",
      },
      density,
      slots: sanitizeAttestationBadgeSlots(
        density,
        payload.badge.slots ?? legacyDisplayToSlots(density, payload.badge.display),
      ),
      display:
        payload.badge.display
        ?? slotsToLegacyDisplay(
          density,
          sanitizeAttestationBadgeSlots(
            density,
            payload.badge.slots ?? null,
          ),
        ),
    }
  }

  const density = resolveBadgeDensityAlias(payload.badgeStyle) ?? "compact"
  const slots = createDefaultBadgeSlots(density)
  return {
    schemaVersion: "badge.v2",
    style: "split-pill",
    density,
    slots,
    brand: {
      kind: "mlvscan-check",
      label: badgeBrandLabelFromPayload(payload),
    },
    tone: badgeToneFromPayload(payload),
    statusLabel: badgeStatusLabelFromPayload(payload),
    fileLabel: payload.fileName,
    verificationLabel: payload.verificationTier === "source_verified" ? "Source verified" : "Self-submitted",
    runtimeLabel: badgeRuntimeLabel(payload),
    sourceBindingLabel: payload.sourceBindingStatus === "verified"
      ? "Source verified"
      : payload.sourceBindingStatus === "declared"
        ? "Source declared"
        : payload.sourceBindingStatus === "stale"
          ? "Source stale"
          : payload.sourceBindingStatus === "failed"
            ? "Source check failed"
            : "No source",
    versionLabel: payload.artifactVersion,
    scannedDateLabel: badgeDateLabel(payload.scannedAt),
    shortHashLabel: badgeHashSuffix(payload.contentHash),
    display: slotsToLegacyDisplay(density, slots),
  }
}

function badgeColors(tone: PublicAttestationBadgeMetadata["tone"]) {
  switch (tone) {
    case "revoked":
      return { left: "#64748b", right: "#0f172a" }
    case "known-threat":
      return { left: "#dc2626", right: "#0f172a" }
    case "suspicious":
      return { left: "#d97706", right: "#0f172a" }
    default:
      return { left: "#0891b2", right: "#0f172a" }
  }
}

function renderBrandMark(x: number, y: number, size = 16): string {
  return `<image href="${MLVSCAN_BADGE_ICON_DATA_URI}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`
}

function estimateTextWidth(value: string, multiplier = 5.8): number {
  return Math.max(1, Math.round(value.length * multiplier))
}

function measureTextWidth(value: string, fontWeight: 600 | 700, fontSize: number): number {
  if (!value) return 0

  const cacheKey = `${fontWeight}:${fontSize}:${value}`
  const cached = textWidthCache.get(cacheKey)
  if (cached != null) {
    return cached
  }

  const context = getMeasurementContext()
  if (context) {
    context.font = `${fontWeight} ${fontSize}px ${BADGE_CANVAS_FONT_FAMILY}`
    const measured = Math.ceil(context.measureText(value).width)
    textWidthCache.set(cacheKey, measured)
    return measured
  }

  const fallback = estimateTextWidth(value, fontSize <= 10 ? 5.2 : 5.7)
  textWidthCache.set(cacheKey, fallback)
  return fallback
}

export function renderAttestationBadgeSvg(
  payload: PublicAttestationPayload,
  densityOverride?: BadgeDensity | string,
  slotsOverride?: AttestationBadgeSlots | AttestationBadgeDisplay | null,
): string {
  const metadata = resolveAttestationBadgeMetadata(payload)
  const density = coerceDensity(densityOverride) ?? metadata.density
  const providedSlots = slotsOverride && "runtime" in slotsOverride
    ? slotsOverride as AttestationBadgeSlots
    : slotsOverride
      ? legacyDisplayToSlots(density, slotsOverride as AttestationBadgeDisplay)
      : metadata.slots
  const slots = sanitizeAttestationBadgeSlots(density, providedSlots)
  const colors = badgeColors(metadata.tone)
  const layout = BADGE_LAYOUT[density]
  const { fontSize, iconSize } = layout
  const leftDetail = density === "detailed"
    ? createToken(detailVariants(slots.leftDetail, detailLabel(slots.leftDetail, metadata)))
    : null
  const rightDetail = density === "detailed"
    ? createToken(detailVariants(slots.rightDetail, detailLabel(slots.rightDetail, metadata)))
    : null
  const brand = createToken([metadata.brand.label]) ?? { variants: [metadata.brand.label], index: 0 }
  const runtime = slots.runtime && metadata.runtimeLabel
    ? createToken([metadata.runtimeLabel, null])
    : null
  const budget = BADGE_WIDTH_BUDGETS[density]

  let leftLabel = composeLeftLabel(metadata.statusLabel, tokenValue(leftDetail))
  let rightLabel = composeRightLabel(
    tokenValue(brand) ?? metadata.brand.label,
    tokenValue(runtime),
    tokenValue(rightDetail),
  )

  const compactionOrder = [
    rightDetail,
    leftDetail,
    rightDetail,
    leftDetail,
    brand,
    runtime,
  ]

  let leftWidth = Math.max(
    layout.leftMinWidth,
    measureTextWidth(leftLabel, 700, fontSize) + layout.leftLabelPadding,
  )
  let rightWidth = Math.max(
    layout.rightMinWidth,
    measureTextWidth(rightLabel, 600, fontSize) + iconSize + layout.rightLabelPadding,
  )

  for (const token of compactionOrder) {
    if (leftWidth + rightWidth <= budget) {
      break
    }

    if (!advanceToken(token)) {
      continue
    }

    leftLabel = composeLeftLabel(metadata.statusLabel, tokenValue(leftDetail))
    rightLabel = composeRightLabel(
      tokenValue(brand) ?? metadata.brand.label,
      tokenValue(runtime),
      tokenValue(rightDetail),
    )
    leftWidth = Math.max(
      layout.leftMinWidth,
      measureTextWidth(leftLabel, 700, fontSize) + layout.leftLabelPadding,
    )
    rightWidth = Math.max(
      layout.rightMinWidth,
      measureTextWidth(rightLabel, 600, fontSize) + iconSize + layout.rightLabelPadding,
    )
  }

  const height = layout.height
  const width = leftWidth + rightWidth
  const radius = Math.floor(height / 2)
  const centerY = Math.round(height / 2) + 4
  const iconX = leftWidth + layout.iconInset
  const iconY = Math.max(2, Math.floor((height - iconSize) / 2))
  const rightTextX = iconX + iconSize + layout.iconGap
  const safeLeftLabel = escapeSvgText(leftLabel)
  const safeRightLabel = escapeSvgText(rightLabel)
  const clipId = `badge-clip-${payload.shareId.replace(/[^a-zA-Z0-9_-]/g, "")}`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${safeLeftLabel}: ${safeRightLabel}"><clipPath id="${clipId}"><rect width="${width}" height="${height}" rx="${radius}" fill="#fff"/></clipPath><g clip-path="url(#${clipId})"><rect width="${leftWidth}" height="${height}" fill="${colors.left}"/><rect x="${leftWidth}" width="${rightWidth}" height="${height}" fill="${colors.right}"/></g>${renderBrandMark(iconX, iconY, iconSize)}<g fill="#fff" font-family="${BADGE_SVG_FONT_FAMILY}" font-size="${fontSize}"><text x="${Math.round(leftWidth / 2)}" y="${centerY}" text-anchor="middle" font-weight="700">${safeLeftLabel}</text><text x="${rightTextX}" y="${centerY}" font-weight="600">${safeRightLabel}</text></g></svg>`
}

export function buildAttestationBadgePreviewDataUri(
  payload: PublicAttestationPayload,
  densityOverride?: BadgeDensity | string,
  slotsOverride?: AttestationBadgeSlots | AttestationBadgeDisplay | null,
): string {
  const svg = renderAttestationBadgeSvg(payload, densityOverride, slotsOverride)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
