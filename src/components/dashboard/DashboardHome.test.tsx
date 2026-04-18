// @vitest-environment jsdom

import { act, type ComponentProps } from "react"
import { screen } from "@testing-library/dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"

import DashboardHome from "@/components/dashboard/DashboardHome"
import type { PartnerAttestationSummary, PartnerProfile } from "@/types/partner-dashboard"

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const partner: PartnerProfile = {
  id: "partner-1",
  name: "Sample Partner",
  email: "partner@mlvscan.test",
  status: "active",
  maxKeys: 5,
  tierRestriction: "partner",
  requestedTier: null,
  authMethod: "discord",
  discordUsername: "samplepartner",
  defaultBadgeStyle: "split-pill",
  defaultBadgeDensity: "compact",
  defaultBadgeSlots: {
    runtime: true,
    leftDetail: "none",
    rightDetail: "none",
  },
}

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

function renderHome(props?: Partial<ComponentProps<typeof DashboardHome>>) {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  act(() => {
    root.render(
      <DashboardHome
        partner={partner}
        attestations={[
          baseAttestation,
          {
            ...baseAttestation,
            id: "attestation-2",
            publicationStatus: "superseded",
            isCurrent: false,
            supersededAt: "2026-04-07T12:05:00.000Z",
            supersededByAttestationId: "attestation-1",
            supersededByShareId: "att_test",
          },
        ]}
        publishedCount={1}
        draftCount={0}
        supersededCount={1}
        activeKeyCount={2}
        onSelectWorkspace={vi.fn()}
        onReviewAttestation={vi.fn()}
        {...props}
      />,
    )
  })
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

describe("DashboardHome", () => {
  it("shows current and superseded lineage counts on the home overview", () => {
    renderHome()

    expect(screen.getByText("Current")).toBeTruthy()
    expect(screen.getByText("Superseded")).toBeTruthy()
    expect(screen.getByText("sample-mod")).toBeTruthy()
  })
})
