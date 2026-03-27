import type {
  AttestationBadgeStyle,
  PublicAttestationPayload,
} from "@/types/attestation"

export const ATTESTATION_BADGE_STYLE_OPTIONS: Array<{
  value: AttestationBadgeStyle
  label: string
  description: string
}> = [
  {
    value: "ledger-strip",
    label: "Ledger Strip",
    description: "Wide metadata-first badge with file, scan date, and short hash.",
  },
  {
    value: "split-pill",
    label: "Split Pill",
    description: "Compact two-segment badge focused on the attested verdict.",
  },
  {
    value: "classic-shield",
    label: "Classic Shield",
    description: "Classic shields-style badge with a dense metadata strip.",
  },
  {
    value: "signature-bar",
    label: "Signature Bar",
    description: "Expanded premium badge with brand, verdict, and metadata rail.",
  },
]

const DEFAULT_BADGE_STYLE: AttestationBadgeStyle = "ledger-strip"
const LEGACY_BADGE_STYLE_ALIASES: Record<string, AttestationBadgeStyle> = {
  attestations: "ledger-strip",
  "gpt-5.4": "split-pill",
  "codex-5.3": "classic-shield",
  "gpt-5.2": "signature-bar",
}

export function normalizeAttestationBadgeStyle(
  value: string | null | undefined,
): AttestationBadgeStyle {
  const normalized =
    ATTESTATION_BADGE_STYLE_OPTIONS.find((option) => option.value === value)?.value
    ?? (typeof value === "string" ? LEGACY_BADGE_STYLE_ALIASES[value] : undefined)

  return normalized ?? DEFAULT_BADGE_STYLE
}

function badgeDateLabel(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return "unknown-date"
  }
  return parsed.toISOString().slice(0, 10)
}

function badgeHashSuffix(contentHash: string): string {
  return contentHash.slice(-8).toLowerCase()
}

function badgeFileLabel(fileName: string): string {
  const trimmed = fileName.trim()
  if (!trimmed) return "unknown-file"
  if (trimmed.length <= 18) return trimmed

  const lastDot = trimmed.lastIndexOf(".")
  if (lastDot > 0 && lastDot < trimmed.length - 1) {
    const ext = trimmed.slice(lastDot)
    const stem = trimmed.slice(0, lastDot)
    const stemBudget = Math.max(6, 18 - ext.length - 1)
    if (stem.length > stemBudget) {
      return `${stem.slice(0, stemBudget)}...${ext}`
    }
  }

  return `${trimmed.slice(0, 15)}...`
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function badgeStatusLabel(payload: PublicAttestationPayload): string {
  if (payload.publicationStatus === "revoked") {
    return "Revoked"
  }
  if (payload.classification === "KnownThreat") {
    return "Known threat"
  }
  if (payload.classification === "Suspicious") {
    return "Suspicious"
  }
  return "Clean"
}

function badgeVerdictLabel(payload: PublicAttestationPayload): string {
  if (payload.publicationStatus === "revoked") {
    return "Attestation revoked"
  }
  if (payload.classification === "KnownThreat") {
    return "Known threat"
  }
  if (payload.classification === "Suspicious") {
    return "Suspicious"
  }
  return "No known threats detected"
}

function badgeClassicColor(payload: PublicAttestationPayload): string {
  if (payload.publicationStatus === "revoked") return "#52606d"
  if (payload.classification === "KnownThreat") return "#d14f5f"
  if (payload.classification === "Suspicious") return "#d8b24a"
  return "#2c7fb8"
}

function badgeShieldsColor(payload: PublicAttestationPayload): string {
  if (payload.publicationStatus === "revoked") return "#9f9f9f"
  if (payload.classification === "KnownThreat") return "#e05d44"
  if (payload.classification === "Suspicious") return "#dfb317"
  return "#4c1"
}

function badgeFlatColor(payload: PublicAttestationPayload): string {
  if (payload.publicationStatus === "revoked") return "#6e7781"
  if (payload.classification === "KnownThreat") return "#cf222e"
  if (payload.classification === "Suspicious") return "#bf8700"
  return "#2da44e"
}

function estimateBadgeTextWidth(value: string, multiplier = 6.4): number {
  return Math.max(1, Math.round(value.length * multiplier))
}

function badgeSegmentIds(payload: PublicAttestationPayload): {
  gradientId: string
  clipId: string
} {
  const safeShareId = payload.shareId.replace(/[^a-zA-Z0-9_-]/g, "")
  return {
    gradientId: `badge-gradient-${safeShareId}`,
    clipId: `badge-clip-${safeShareId}`,
  }
}

function renderAttestationsBadgeSvg(payload: PublicAttestationPayload): string {
  const descriptor = [
    payload.publicationStatus === "revoked" ? "Revoked" : "Self-submitted",
    badgeFileLabel(payload.fileName),
    badgeDateLabel(payload.scannedAt),
    badgeHashSuffix(payload.contentHash),
  ].join(" • ")
  const color = badgeClassicColor(payload)
  const verdictLabel = badgeVerdictLabel(payload)
  const label = "MLVScan"
  const leftWidth = Math.max(68, label.length * 7 + 18)
  const rightWidth = Math.max(152, descriptor.length * 7 + 18)
  const width = leftWidth + rightWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" role="img" aria-label="${escapeSvgText(`${label}: ${verdictLabel}; ${descriptor}`)}"><linearGradient id="g" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-opacity=".08"/></linearGradient><clipPath id="r"><rect width="${width}" height="28" rx="6" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="${leftWidth}" height="28" fill="#0f1f29"/><rect x="${leftWidth}" width="${rightWidth}" height="28" fill="${color}"/><rect width="${width}" height="28" fill="url(#g)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11"><text x="${leftWidth / 2}" y="19">${escapeSvgText(label)}</text><text x="${leftWidth + (rightWidth / 2)}" y="19">${escapeSvgText(descriptor)}</text></g></svg>`
}

function renderGpt54BadgeSvg(payload: PublicAttestationPayload): string {
  const brandLabel =
    payload.verificationTier === "source_verified"
      ? "MLVScan verified"
      : "MLVScan attested"
  const statusLabel =
    payload.publicationStatus === "revoked"
      ? "revoked"
      : payload.classification === "KnownThreat"
        ? "known threat"
        : payload.classification === "Suspicious"
          ? "suspicious"
          : "clean"
  const title = `${payload.fileName.trim() || payload.publicDisplayName.trim() || "Unnamed file"} - ${brandLabel} - ${statusLabel} - scanned ${badgeDateLabel(payload.scannedAt)} - sha256 ${badgeHashSuffix(payload.contentHash)}`
  const segmentIds = badgeSegmentIds(payload)
  const labelWidth = Math.max(82, Math.ceil(brandLabel.length * 6.7 + 20))
  const messageWidth = Math.max(58, Math.ceil(statusLabel.length * 6.7 + 20))
  const width = labelWidth + messageWidth
  const color = badgeFlatColor(payload)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${escapeSvgText(`${brandLabel}: ${statusLabel}`)}"><title>${escapeSvgText(title)}</title><linearGradient id="${segmentIds.gradientId}" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="${segmentIds.clipId}"><rect width="${width}" height="20" rx="4" fill="#fff"/></clipPath><g clip-path="url(#${segmentIds.clipId})"><rect width="${labelWidth}" height="20" fill="#555"/><rect x="${labelWidth}" width="${messageWidth}" height="20" fill="${color}"/><rect width="${width}" height="20" fill="url(#${segmentIds.gradientId})"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11"><text x="${labelWidth / 2}" y="15">${escapeSvgText(brandLabel)}</text><text x="${labelWidth + (messageWidth / 2)}" y="15">${escapeSvgText(statusLabel)}</text></g></svg>`
}

function renderCodex53BadgeSvg(payload: PublicAttestationPayload): string {
  const descriptor = [
    payload.publicationStatus === "revoked" ? "Revoked" : "Self-submitted",
    badgeFileLabel(payload.fileName),
    badgeDateLabel(payload.scannedAt),
    badgeHashSuffix(payload.contentHash),
  ].join(" | ")
  const color = badgeShieldsColor(payload)
  const verdictLabel = badgeVerdictLabel(payload)
  const label = "MLVScan"
  const leftWidth = Math.max(58, estimateBadgeTextWidth(label) + 10)
  const rightWidth = Math.max(128, estimateBadgeTextWidth(descriptor) + 12)
  const width = leftWidth + rightWidth
  const leftTextX = Math.round(leftWidth / 2)
  const rightTextX = leftWidth + Math.round(rightWidth / 2)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${escapeSvgText(`${label}: ${verdictLabel}; ${descriptor}`)}"><title>${escapeSvgText(`${label} attestation`)}</title><desc>${escapeSvgText(`${verdictLabel}. ${descriptor}`)}</desc><linearGradient id="g" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="${width}" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="${leftWidth}" height="20" fill="#2d333b"/><rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${color}"/><rect width="${width}" height="20" fill="url(#g)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" text-rendering="geometricPrecision"><text x="${leftTextX}" y="15" fill="#010101" fill-opacity=".3">${escapeSvgText(label)}</text><text x="${leftTextX}" y="14">${escapeSvgText(label)}</text><text x="${rightTextX}" y="15" fill="#010101" fill-opacity=".3">${escapeSvgText(descriptor)}</text><text x="${rightTextX}" y="14">${escapeSvgText(descriptor)}</text></g></svg>`
}

function renderGpt52BadgeSvg(payload: PublicAttestationPayload): string {
  const tierLabel =
    payload.verificationTier === "source_verified"
      ? "Source verified"
      : "Self-submitted"
  const fileLabel = badgeFileLabel(payload.fileName)
  const dateLabel = badgeDateLabel(payload.scannedAt)
  const hashLabel = badgeHashSuffix(payload.contentHash)
  const statusLabel = badgeStatusLabel(payload)
  const statusColor =
    payload.publicationStatus === "revoked"
      ? { stopA: "#52606d", stopB: "#3f4a54", text: "#ffffff" }
      : payload.classification === "KnownThreat"
        ? { stopA: "#d14f5f", stopB: "#b84252", text: "#ffffff" }
        : payload.classification === "Suspicious"
          ? { stopA: "#ffd857", stopB: "#f1c24f", text: "#0b1117" }
          : { stopA: "#16e0bd", stopB: "#2fd9cf", text: "#0b1117" }
  const label = "MLVScan"
  const height = 28
  const brandWidth = 92
  const statusWidth = Math.max(78, statusLabel.length * 7 + 28)
  const metaWidth = Math.max(
    200,
    `${fileLabel} • ${tierLabel} • ${dateLabel} • ${hashLabel}`.length * 6 + 26,
  )
  const width = brandWidth + statusWidth + metaWidth
  const ariaLabel = `${label} attestation: ${statusLabel}. ${fileLabel} • ${tierLabel} • ${dateLabel} • ${hashLabel}.`

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeSvgText(ariaLabel)}">`,
    `  <title>${escapeSvgText(ariaLabel)}</title>`,
    `  <defs>`,
    `    <linearGradient id="mlv-brand" x1="0" x2="1">`,
    `      <stop offset="0" stop-color="#16e0bd"/>`,
    `      <stop offset="1" stop-color="#2fd9cf"/>`,
    `    </linearGradient>`,
    `    <linearGradient id="mlv-status" x1="0" x2="1">`,
    `      <stop offset="0" stop-color="${statusColor.stopA}"/>`,
    `      <stop offset="1" stop-color="${statusColor.stopB}"/>`,
    `    </linearGradient>`,
    `    <linearGradient id="mlv-shine" x2="0" y2="100%">`,
    `      <stop offset="0" stop-color="#ffffff" stop-opacity=".10"/>`,
    `      <stop offset="1" stop-color="#ffffff" stop-opacity=".02"/>`,
    `    </linearGradient>`,
    `    <clipPath id="mlv-clip">`,
    `      <rect width="${width}" height="${height}" rx="8" fill="#fff"/>`,
    `    </clipPath>`,
    `  </defs>`,
    `  <g clip-path="url(#mlv-clip)">`,
    `    <rect width="${width}" height="${height}" fill="#121d25"/>`,
    `    <rect width="${brandWidth}" height="${height}" fill="#0f1f29"/>`,
    `    <rect x="${brandWidth}" width="${statusWidth}" height="${height}" fill="url(#mlv-status)"/>`,
    `    <rect width="${width}" height="${height}" fill="url(#mlv-shine)"/>`,
    `    <rect x="${brandWidth}" width="1" height="${height}" fill="#ffffff" opacity=".10"/>`,
    `    <rect x="${brandWidth + statusWidth}" width="1" height="${height}" fill="#ffffff" opacity=".10"/>`,
    `  </g>`,
    `  <rect width="${width}" height="${height}" rx="8" fill="none" stroke="#ffffff" stroke-opacity=".12"/>`,
    `  <g font-family="Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" fill="#e8f3f7">`,
    `    <g transform="translate(10,7)">`,
    `      <circle cx="7" cy="7" r="7" fill="url(#mlv-brand)"/>`,
    `      <path d="M4.2 7.3 6.3 9.5 10.7 5.1" fill="none" stroke="#0b1117" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,
    `    </g>`,
    `    <text x="30" y="19">${escapeSvgText(label)}</text>`,
    `  </g>`,
    `  <text x="${brandWidth + statusWidth / 2}" y="19" text-anchor="middle" font-family="Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="${statusColor.text}">${escapeSvgText(statusLabel)}</text>`,
    `  <text x="${brandWidth + statusWidth + 10}" y="19" font-family="Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" fill="#9cb0ba">`,
    `    <tspan font-weight="600" fill="#e8f3f7">${escapeSvgText(fileLabel)}</tspan>`,
    `    <tspan> • ${escapeSvgText(tierLabel)} • ${escapeSvgText(dateLabel)} • </tspan>`,
    `    <tspan font-family="ui-monospace, SFMono-Regular, Menlo, 'Cascadia Code', monospace">${escapeSvgText(hashLabel)}</tspan>`,
    `  </text>`,
    `</svg>`,
  ].join("\n")
}

export function renderAttestationBadgeSvg(
  payload: PublicAttestationPayload,
  badgeStyleOverride?: AttestationBadgeStyle,
): string {
  const badgeStyle = badgeStyleOverride ?? normalizeAttestationBadgeStyle(payload.badgeStyle)
  switch (badgeStyle) {
    case "split-pill":
      return renderGpt54BadgeSvg(payload)
    case "classic-shield":
      return renderCodex53BadgeSvg(payload)
    case "signature-bar":
      return renderGpt52BadgeSvg(payload)
    case "ledger-strip":
    default:
      return renderAttestationsBadgeSvg(payload)
  }
}

export function buildAttestationBadgePreviewDataUri(
  payload: PublicAttestationPayload,
  badgeStyleOverride?: AttestationBadgeStyle,
): string {
  const svg = renderAttestationBadgeSvg(payload, badgeStyleOverride)
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
