// @vitest-environment jsdom

import { act, type ComponentProps } from "react"
import { fireEvent, screen } from "@testing-library/dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"

import AttestationLedger from "@/components/dashboard/AttestationLedger"
import type { PartnerAttestationSummary } from "@/types/partner-dashboard"

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const baseAttestation: PartnerAttestationSummary = {
  id: "attestation-1",
  shareId: "att_test",
  verificationTier: "self_submitted",
  publicationStatus: "published",
  sourceBindingStatus: "none",
  badgeStyle: "split-pill",
  badge: {
    schemaVersion: "badge.v2",
    style: "split-pill",
    density: "compact",
    slots: { runtime: true, leftDetail: "none", rightDetail: "none" },
    brand: { kind: "mlvscan-check", label: "MLVScan attested" },
    tone: "clean",
    statusLabel: "Clean",
    fileLabel: "SampleMod.dll",
    verificationLabel: "Self-submitted",
    runtimeLabel: "IL2CPP",
    sourceBindingLabel: "No source",
    versionLabel: "1.0.0",
    scannedDateLabel: "2026-04-06",
    shortHashLabel: "89abcdef",
  },
  publicDisplayName: "Sample Mod",
  artifactKey: "sample-mod",
  artifactVersion: "1.0.0",
  isCurrent: true,
  supersededAt: null,
  supersededByAttestationId: null,
  supersededByShareId: null,
  fileName: "SampleMod.dll",
  canonicalSourceUrl: null,
  activeReportId: "report-1",
  contentHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  sizeBytes: 12345,
  scannerVersion: "1.2.3",
  schemaVersion: "1.2.0",
  scannedAt: "2026-04-06T12:00:00.000Z",
  classification: "Clean",
  headline: "No known threats detected",
  summary: "No known malware evidence was retained for these bytes.",
  blockingRecommended: false,
  primaryThreatFamilyId: null,
  threatFamilies: [],
  findings: [],
  findingCount: 0,
  publishedAt: "2026-04-06T12:05:00.000Z",
  revokedAt: null,
  createdAt: "2026-04-06T12:05:00.000Z",
  refreshedAt: null,
  publicUrl: "https://mlvscan.test/attestations/att_test",
  badgeUrl: "https://mlvscan.test/attestations/att_test/badge.svg",
}

function renderLedger(props?: Partial<ComponentProps<typeof AttestationLedger>>) {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  const onOpenBadgeDefaults = vi.fn()
  const onDeleteDraft = vi.fn(async () => {})

  act(() => {
    root.render(
      <AttestationLedger
        attestations={[baseAttestation]}
        selectedAttestationId={baseAttestation.id}
        isLoading={false}
        errorMessage=""
        onSelect={vi.fn()}
        onReview={vi.fn()}
        onRefresh={vi.fn(async () => {})}
        onRevoke={vi.fn(async () => {})}
        onDeleteDraft={onDeleteDraft}
        onOpenLink={vi.fn()}
        onCopySnippet={vi.fn()}
        onOpenDetails={vi.fn()}
        onOpenBadgeDefaults={onOpenBadgeDefaults}
        {...props}
      />,
    )
  })

  return { onOpenBadgeDefaults, onDeleteDraft }
}

afterEach(() => {
  for (const { container, root } of mountedRoots.splice(0)) {
    act(() => {
      root.unmount()
    })
    container.remove()
  }

  document.body.innerHTML = ""
})

describe("AttestationLedger", () => {
  it("opens badge defaults from the ledger header instead of rendering defaults inline", () => {
    const { onOpenBadgeDefaults } = renderLedger()

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /badge defaults/i }))
    })

    expect(onOpenBadgeDefaults).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Default badge settings")).toBeNull()
    expect(screen.getByText("Review your publication history")).toBeTruthy()
  })

  it("surfaces superseded history and links to the current replacement", () => {
    const onOpenLink = vi.fn()

    renderLedger({
      attestations: [{
        ...baseAttestation,
        id: "attestation-2",
        publicationStatus: "superseded",
        isCurrent: false,
        supersededAt: "2026-04-07T12:05:00.000Z",
        supersededByAttestationId: "attestation-3",
        supersededByShareId: "att_current",
      }],
      onOpenLink,
    })

    expect(screen.getByText("sample-mod · v1.0.0")).toBeTruthy()
    expect(screen.getByText("Replaced by a newer current attestation for sample-mod.")).toBeTruthy()

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /open current replacement/i }))
    })

    expect(onOpenLink).toHaveBeenCalledWith("/attestations/att_current")
  })

  it("keeps superseded rows actionable in the ledger", () => {
    renderLedger({
      attestations: [{
        ...baseAttestation,
        id: "attestation-2",
        publicationStatus: "superseded",
        isCurrent: false,
        supersededAt: "2026-04-07T12:05:00.000Z",
        supersededByAttestationId: "attestation-3",
        supersededByShareId: "att_current",
      }],
    })

    expect(screen.getByRole("button", { name: /open current replacement/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /details/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /attestation actions/i })).toBeTruthy()
  })

})
