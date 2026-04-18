// @vitest-environment jsdom

import { act, type ComponentProps } from "react"
import { fireEvent, screen } from "@testing-library/dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"

import DashboardDetailPanel from "@/components/dashboard/DashboardDetailPanel"
import type { PartnerAttestationSummary } from "@/types/partner-dashboard"

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const baseAttestation: PartnerAttestationSummary = {
  id: "attestation-1",
  shareId: "att_test",
  verificationTier: "self_submitted",
  publicationStatus: "draft",
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
  isCurrent: false,
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
  publishedAt: null,
  revokedAt: null,
  createdAt: "2026-04-06T12:05:00.000Z",
  refreshedAt: null,
  publicUrl: "https://mlvscan.test/attestations/att_test",
  badgeUrl: "https://mlvscan.test/attestations/att_test/badge.svg",
}

function renderDetailPanel(props?: Partial<ComponentProps<typeof DashboardDetailPanel>>) {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  const onMetadataChange = vi.fn(async () => {})
  const onDeleteDraft = vi.fn(async () => {})

  act(() => {
    root.render(
      <DashboardDetailPanel
        attestation={baseAttestation}
        shareOutputs={null}
        onPublish={vi.fn(async () => {})}
        onRefresh={vi.fn(async () => {})}
        onRevoke={vi.fn(async () => {})}
        onDeleteDraft={onDeleteDraft}
        onMetadataChange={onMetadataChange}
        onBadgeConfigChange={vi.fn(async () => {})}
        onOpenLink={vi.fn()}
        onCopySnippet={vi.fn()}
        publishOutcomeLabel="Replace current attestation for sample-mod."
        {...props}
      />,
    )
  })

  return { onMetadataChange, onDeleteDraft }
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

describe("DashboardDetailPanel", () => {
  it("saves edited draft metadata", () => {
    const { onMetadataChange, onDeleteDraft } = renderDetailPanel()

    const textboxes = screen.getAllByRole("textbox")
    expect(textboxes).toHaveLength(4)

    act(() => {
      fireEvent.change(textboxes[0], { target: { value: "custom-mod" } })
      fireEvent.change(textboxes[1], { target: { value: "Custom Mod" } })
      fireEvent.change(textboxes[2], { target: { value: "2.0.0" } })
      fireEvent.change(textboxes[3], { target: { value: "https://example.com/custom-mod" } })
    })

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /save metadata/i }))
    })

    expect(onMetadataChange).toHaveBeenCalledWith("attestation-1", {
      artifactKey: "custom-mod",
      artifactVersion: "2.0.0",
      publicDisplayName: "Custom Mod",
      canonicalSourceUrl: "https://example.com/custom-mod",
    })
    expect(screen.getByText("Replace current attestation for sample-mod.")).toBeTruthy()

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /delete draft/i }))
    })

    expect(onDeleteDraft).toHaveBeenCalledWith("attestation-1")
  })

  it("keeps public-history links visible for superseded attestations", () => {
    renderDetailPanel({
      attestation: {
        ...baseAttestation,
        publicationStatus: "superseded",
        isCurrent: false,
        publishedAt: "2026-04-06T12:05:00.000Z",
        supersededAt: "2026-04-07T12:05:00.000Z",
        supersededByAttestationId: "attestation-3",
        supersededByShareId: "att_current",
      },
      shareOutputs: null,
    })

    expect(screen.getByRole("button", { name: /open current replacement/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /open public attestation/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /open badge svg/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /open signed json/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /revoke public attestation/i })).toBeTruthy()
  })
})
